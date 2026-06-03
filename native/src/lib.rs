use serde::Serialize;
use std::fs;
use std::io::Read;
use std::path::PathBuf;
use tauri::command;
use tauri::generate_handler;

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
struct FileEntry {
    name: String,
    path: String,
    size: u64,
    last_modified: u64,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
struct WorldEntry {
    #[serde(flatten)]
    file: FileEntry,
    height: i32,
    id: i32,
    name: String,
    seed: String,
    unique_id: String,
    version: i32,
    width: i32,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
struct PlayerMapEntry {
    #[serde(flatten)]
    file: FileEntry,
    player_name: String,
}

fn home_dir() -> Option<PathBuf> {
    dirs::home_dir()
}

fn terraria_directories() -> Vec<PathBuf> {
    let mut dirs = Vec::new();
    if let Some(home) = home_dir() {
        #[cfg(target_os = "windows")]
        dirs.push(home.join("Documents").join("My Games").join("Terraria"));
        #[cfg(target_os = "macos")]
        dirs.push(
            home.join("Library")
                .join("Application Support")
                .join("Terraria"),
        );
        #[cfg(target_os = "linux")]
        dirs.push(home.join(".local").join("share").join("Terraria"));
    }
    dirs
}

fn steam_userdata_base() -> Option<PathBuf> {
    let home = home_dir()?;
    #[cfg(target_os = "windows")]
    {
        let path = PathBuf::from(r"C:\Program Files (x86)\Steam\userdata");
        if path.exists() {
            return Some(path);
        }
        return None;
    }
    #[cfg(target_os = "macos")]
    {
        let path = home
            .join("Library")
            .join("Application Support")
            .join("Steam")
            .join("userdata");
        if path.exists() {
            return Some(path);
        }
        return None;
    }
    #[cfg(target_os = "linux")]
    {
        let path = home
            .join(".local")
            .join("share")
            .join("Steam")
            .join("userdata");
        if path.exists() {
            return Some(path);
        }
        return None;
    }
}

fn file_modified_ms(meta: &fs::Metadata) -> u64 {
    meta.modified()
        .ok()
        .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
        .map(|d| d.as_millis() as u64)
        .unwrap_or(0)
}

fn scan_directory(dir: &PathBuf, extensions: &[&str]) -> Vec<FileEntry> {
    let mut results = Vec::new();
    let entries = match fs::read_dir(dir) {
        Ok(e) => e,
        Err(_) => return results,
    };
    for entry in entries.flatten() {
        let path = entry.path();
        if !path.is_file() {
            continue;
        }
        let name = path.file_name().unwrap_or_default().to_string_lossy().to_string();
        if !extensions.iter().any(|ext| name.ends_with(ext)) {
            continue;
        }
        if let Ok(meta) = fs::metadata(&path) {
            results.push(FileEntry {
                name,
                path: path.to_string_lossy().to_string(),
                size: meta.len(),
                last_modified: file_modified_ms(&meta),
            });
        }
    }
    results
}

fn scan_steam_userdata(extensions: &[&str], subfolder: &str) -> Vec<FileEntry> {
    let mut results = Vec::new();
    let base = match steam_userdata_base() {
        Some(b) => b,
        None => return results,
    };
    let user_dirs = match fs::read_dir(&base) {
        Ok(e) => e,
        Err(_) => return results,
    };
    for user_dir in user_dirs.flatten() {
        if !user_dir.path().is_dir() {
            continue;
        }
        let remote_path = user_dir
            .path()
            .join("105600")
            .join("remote")
            .join(subfolder);
        results.extend(scan_directory(&remote_path, extensions));
    }
    results
}

fn read_world_header(path: &str) -> Option<(i32, i32, String, String, String, i32, i32)> {
    let mut file = fs::File::open(path).ok()?;
    let mut buf = vec![0u8; 64 * 1024];
    let n = file.read(&mut buf).ok()?;
    let buf = &buf[..n];
    let mut pos: usize = 0;

    let read_i16 = |pos: &mut usize| -> Option<i16> {
        if *pos + 2 > buf.len() {
            return None;
        }
        let v = i16::from_le_bytes([buf[*pos], buf[*pos + 1]]);
        *pos += 2;
        Some(v)
    };
    let read_i32 = |pos: &mut usize| -> Option<i32> {
        if *pos + 4 > buf.len() {
            return None;
        }
        let v = i32::from_le_bytes([buf[*pos], buf[*pos + 1], buf[*pos + 2], buf[*pos + 3]]);
        *pos += 4;
        Some(v)
    };
    let read_u32 = |pos: &mut usize| -> Option<u32> {
        if *pos + 4 > buf.len() {
            return None;
        }
        let v = u32::from_le_bytes([buf[*pos], buf[*pos + 1], buf[*pos + 2], buf[*pos + 3]]);
        *pos += 4;
        Some(v)
    };
    let read_u8 = |pos: &mut usize| -> Option<u8> {
        if *pos >= buf.len() {
            return None;
        }
        let v = buf[*pos];
        *pos += 1;
        Some(v)
    };

    let version = read_i32(&mut pos)?;

    // file metadata (uint64)
    read_u32(&mut pos)?;
    read_u32(&mut pos)?;
    // revision
    read_u32(&mut pos)?;
    // isFavorite (uint64)
    read_u32(&mut pos)?;
    read_u32(&mut pos)?;

    // positions array
    let positions_length = read_i16(&mut pos)?;
    for _ in 0..positions_length {
        read_i32(&mut pos)?;
    }

    // importance bit array
    let importance_length = read_i16(&mut pos)?;
    let mut b2: u8 = 128;
    for _ in 0..importance_length {
        if b2 == 128 {
            read_u8(&mut pos)?;
            b2 = 1;
        } else {
            b2 <<= 1;
        }
    }

    // world name (7-bit encoded length + UTF-8)
    let name_len = {
        let mut result: u32 = 0;
        let mut shift = 0;
        loop {
            let byte = read_u8(&mut pos)?;
            result |= ((byte & 0x7f) as u32) << shift;
            shift += 7;
            if byte & 0x80 == 0 {
                break;
            }
        }
        result as usize
    };
    if pos + name_len > buf.len() {
        return None;
    }
    let name = String::from_utf8_lossy(&buf[pos..pos + name_len]).to_string();
    pos += name_len;

    // seed (7-bit encoded length + UTF-8)
    let seed_len = {
        let mut result: u32 = 0;
        let mut shift = 0;
        loop {
            let byte = read_u8(&mut pos)?;
            result |= ((byte & 0x7f) as u32) << shift;
            shift += 7;
            if byte & 0x80 == 0 {
                break;
            }
        }
        result as usize
    };
    if pos + seed_len > buf.len() {
        return None;
    }
    let seed = String::from_utf8_lossy(&buf[pos..pos + seed_len]).to_string();
    pos += seed_len;

    // worldGeneratorVersion (uint64)
    read_u32(&mut pos)?;
    read_u32(&mut pos)?;

    // uniqueId (16 bytes, .NET Guid)
    if pos + 16 > buf.len() {
        return None;
    }
    let uuid_bytes = &buf[pos..pos + 16];
    pos += 16;
    let unique_id = format!(
        "{:02x}{:02x}{:02x}{:02x}-{:02x}{:02x}-{:02x}{:02x}-{:02x}{:02x}-{:02x}{:02x}{:02x}{:02x}{:02x}{:02x}",
        uuid_bytes[3], uuid_bytes[2], uuid_bytes[1], uuid_bytes[0],
        uuid_bytes[5], uuid_bytes[4],
        uuid_bytes[7], uuid_bytes[6],
        uuid_bytes[8], uuid_bytes[9],
        uuid_bytes[10], uuid_bytes[11], uuid_bytes[12], uuid_bytes[13], uuid_bytes[14], uuid_bytes[15],
    );

    let id = read_i32(&mut pos)?;

    // left, right, top, bottom
    read_i32(&mut pos)?;
    read_i32(&mut pos)?;
    read_i32(&mut pos)?;
    read_i32(&mut pos)?;

    let height = read_i32(&mut pos)?;
    let width = read_i32(&mut pos)?;

    Some((version, id, name, seed, unique_id, height, width))
}

fn dedup_by_path(entries: &mut Vec<FileEntry>) {
    let mut seen = std::collections::HashSet::new();
    entries.retain(|e| seen.insert(e.path.clone()));
}

#[command]
fn discover_worlds() -> Vec<WorldEntry> {
    let mut files = Vec::new();

    for base_dir in terraria_directories() {
        files.extend(scan_directory(&base_dir.join("Worlds"), &[".wld"]));
    }
    files.extend(scan_steam_userdata(&[".wld"], "worlds"));

    dedup_by_path(&mut files);

    let mut worlds: Vec<WorldEntry> = files
        .into_iter()
        .filter_map(|file| {
            let header = read_world_header(&file.path)?;
            Some(WorldEntry {
                file,
                version: header.0,
                id: header.1,
                name: header.2,
                seed: header.3,
                unique_id: header.4,
                height: header.5,
                width: header.6,
            })
        })
        .collect();

    worlds.sort_by(|a, b| b.file.last_modified.cmp(&a.file.last_modified));
    worlds
}

fn scan_player_maps(dir: &PathBuf) -> Vec<PlayerMapEntry> {
    let mut results = Vec::new();
    let player_dirs = match fs::read_dir(dir) {
        Ok(e) => e,
        Err(_) => return results,
    };
    for player_dir in player_dirs.flatten() {
        if !player_dir.path().is_dir() {
            continue;
        }
        let player_name = player_dir
            .file_name()
            .to_string_lossy()
            .to_string();
        let maps = scan_directory(&player_dir.path(), &[".map"]);
        for map in maps {
            results.push(PlayerMapEntry {
                file: map,
                player_name: player_name.clone(),
            });
        }
    }
    results
}

fn scan_steam_player_maps(subfolder: &str) -> Vec<PlayerMapEntry> {
    let mut results = Vec::new();
    let base = match steam_userdata_base() {
        Some(b) => b,
        None => return results,
    };
    let user_dirs = match fs::read_dir(&base) {
        Ok(e) => e,
        Err(_) => return results,
    };
    for user_dir in user_dirs.flatten() {
        if !user_dir.path().is_dir() {
            continue;
        }
        let remote_path = user_dir
            .path()
            .join("105600")
            .join("remote")
            .join(subfolder);
        results.extend(scan_player_maps(&remote_path));
    }
    results
}

#[command]
fn discover_players(world_id: i32, unique_id: String) -> Vec<PlayerMapEntry> {
    let mut all = Vec::new();

    for base_dir in terraria_directories() {
        all.extend(scan_player_maps(&base_dir.join("Players")));
    }
    all.extend(scan_steam_player_maps("players"));

    // Dedup by path
    {
        let mut seen = std::collections::HashSet::new();
        all.retain(|e| seen.insert(e.file.path.clone()));
    }

    all.sort_by(|a, b| b.file.last_modified.cmp(&a.file.last_modified));

    let match_names: std::collections::HashSet<String> = [
        format!("{}.map", world_id),
        format!("{}.map", unique_id),
    ]
    .into_iter()
    .collect();

    all.into_iter()
        .filter(|p| match_names.contains(&p.file.name))
        .collect()
}

#[command]
fn read_file(path: String) -> Result<Vec<u8>, String> {
    fs::read(&path).map_err(|e| format!("Failed to read file {}: {}", path, e))
}

pub fn run() {
    tauri::Builder::default()
        .invoke_handler(generate_handler![discover_worlds, discover_players, read_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
