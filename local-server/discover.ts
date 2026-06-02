import { join } from "@std/path";
import type { WorldHeader } from "../src/lib/readWorldHeader.ts";
import { readWorldHeader } from "../src/lib/readWorldHeader.ts";

export interface FileEntry {
  name: string;
  path: string;
  size: number;
  lastModified: number;
}

export interface WorldEntry extends FileEntry, WorldHeader {
}

export interface PlayerMapEntry extends FileEntry {
  playerName: string;
}


function getHomedir(): string {
  const home =
    Deno.env.get("HOME") ??
    Deno.env.get("USERPROFILE") ??
    Deno.env.get("HOMEPATH");
  if (!home) throw new Error("Cannot determine home directory");
  return home;
}

function getTerrariaDirectories(): string[] {
  const home = getHomedir();
  const dirs: string[] = [];

  switch (Deno.build.os) {
    case "windows":
      dirs.push(join(home, "Documents", "My Games", "Terraria"));
      break;
    case "darwin":
      dirs.push(join(home, "Library", "Application Support", "Terraria"));
      break;
    default: // linux
      dirs.push(join(home, ".local", "share", "Terraria"));
      break;
  }

  return dirs;
}

function getSteamUserdataDirectories(): string[] {
  const home = getHomedir();
  const steamBase =
    Deno.build.os === "windows"
      ? "C:\\Program Files (x86)\\Steam\\userdata"
      : Deno.build.os === "darwin"
        ? join(home, "Library", "Application Support", "Steam", "userdata")
        : join(home, ".local", "share", "Steam", "userdata");
  return [steamBase];
}

async function listDir(path: string): Promise<Deno.DirEntry[]> {
  try {
    const entries: Deno.DirEntry[] = [];
    for await (const entry of Deno.readDir(path)) {
      entries.push(entry);
    }
    return entries;
  } catch {
    return [];
  }
}

async function scanDirectory(
  dir: string,
  extensions: string[],
): Promise<FileEntry[]> {
  const results: FileEntry[] = [];
  const entries = await listDir(dir);
  for (const entry of entries) {
    if (!entry.isFile) continue;
    if (!extensions.some((ext) => entry.name.endsWith(ext))) continue;
    const path = join(dir, entry.name);
    try {
      const stat = await Deno.stat(path);
      results.push({
        name: entry.name,
        path,
        size: stat.size,
        lastModified: stat.mtime?.getTime() ?? 0,
      });
    } catch {
      // skip files we can't stat
    }
  }
  return results;
}

async function scanSteamUserdata(
  extensions: string[],
  subfolder: string,
): Promise<FileEntry[]> {
  const results: FileEntry[] = [];
  for (const steamBase of getSteamUserdataDirectories()) {
    const userDirs = await listDir(steamBase);
    for (const userDir of userDirs) {
      if (!userDir.isDirectory) continue;
      const remotePath = join(
        steamBase,
        userDir.name,
        "105600",
        "remote",
        subfolder,
      );
      results.push(...(await scanDirectory(remotePath, extensions)));
    }
  }
  return results;
}

const WORLD_EXTENSIONS = [".wld"];
const MAP_EXTENSIONS = [".map"];

async function scanPlayerMaps(dir: string): Promise<PlayerMapEntry[]> {
  const results: PlayerMapEntry[] = [];
  const playerDirs = await listDir(dir);
  for (const playerDir of playerDirs) {
    if (!playerDir.isDirectory) continue;
    const playerPath = join(dir, playerDir.name);
    const maps = await scanDirectory(playerPath, MAP_EXTENSIONS);
    for (const map of maps) {
      results.push({ ...map, playerName: playerDir.name });
    }
  }
  return results;
}

async function scanSteamPlayerMaps(
  subfolder: string,
): Promise<PlayerMapEntry[]> {
  const results: PlayerMapEntry[] = [];
  for (const steamBase of getSteamUserdataDirectories()) {
    const userDirs = await listDir(steamBase);
    for (const userDir of userDirs) {
      if (!userDir.isDirectory) continue;
      const remotePath = join(
        steamBase,
        userDir.name,
        "105600",
        "remote",
        subfolder,
      );
      results.push(...(await scanPlayerMaps(remotePath)));
    }
  }
  return results;
}

async function readFileHeader(path: string): Promise<WorldHeader> {
  const file = await Deno.open(path, { read: true });
  try {
    const buf = new Uint8Array(64 * 1024);
    await file.read(buf);
    return readWorldHeader(buf.buffer as ArrayBuffer);
  } finally {
    file.close();
  }
}

async function enrichWorlds(files: FileEntry[]): Promise<WorldEntry[]> {
  const results: WorldEntry[] = [];
  for (const file of files) {
    try {
      const header = await readFileHeader(file.path);
      results.push({
        ...file,
        ...header,
      });
    } catch {
      // skip files we can't parse
    }
  }
  return results;
}

function dedup<T extends FileEntry>(entries: T[]): T[] {
  const seen = new Set<string>();
  return entries.filter((e) => {
    if (seen.has(e.path)) return false;
    seen.add(e.path);
    return true;
  });
}

async function scanAllWorlds(): Promise<FileEntry[]> {
  const files: FileEntry[] = [];
  for (const baseDir of getTerrariaDirectories()) {
    files.push(
      ...(await scanDirectory(join(baseDir, "Worlds"), WORLD_EXTENSIONS)),
    );
  }
  files.push(...(await scanSteamUserdata(WORLD_EXTENSIONS, "worlds")));
  return dedup(files);
}

async function scanAllPlayers(): Promise<PlayerMapEntry[]> {
  const players: PlayerMapEntry[] = [];
  for (const baseDir of getTerrariaDirectories()) {
    players.push(...(await scanPlayerMaps(join(baseDir, "Players"))));
  }
  players.push(...(await scanSteamPlayerMaps("players")));
  return dedup(players);
}

export async function discoverWorlds(): Promise<WorldEntry[]> {
  const files = await scanAllWorlds();
  return (await enrichWorlds(files)).sort(
    (a, b) => b.lastModified - a.lastModified,
  );
}

export async function discoverPlayers(): Promise<PlayerMapEntry[]> {
  return (await scanAllPlayers()).sort(
    (a, b) => b.lastModified - a.lastModified,
  );
}

export async function discoverFilePaths(): Promise<Set<string>> {
  const [worlds, players] = await Promise.all([
    scanAllWorlds(),
    scanAllPlayers(),
  ]);
  return new Set([
    ...worlds.map((w) => w.path),
    ...players.map((p) => p.path),
  ]);
}
