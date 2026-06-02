import type * as NeutralinoTypes from '@neutralinojs/lib';
import type { WorldHeader } from './readWorldHeader';
import { readWorldHeader } from './readWorldHeader';

type NeutralinoAPI = typeof NeutralinoTypes;

function getNeutralino(): NeutralinoAPI {
  return (window as unknown as { Neutralino: NeutralinoAPI }).Neutralino;
}

export interface FileEntry {
  name: string;
  path: string;
  size: number;
  lastModified: number;
}

export interface WorldEntry extends FileEntry, WorldHeader { }

export interface PlayerMapEntry extends FileEntry {
  playerName: string;
}

let _initPromise: Promise<void> | null = null;

export function isNeutralino(): boolean {
  return typeof window !== 'undefined' && 'NL_VERSION' in window;
}

export async function initNeutralino(): Promise<void> {
  if (_initPromise) return _initPromise;
  if (!isNeutralino()) return;
  _initPromise = doInit();
  return _initPromise;
}

async function doInit(): Promise<void> {
  const Neutralino = getNeutralino();
  Neutralino.init();
  // Wait briefly for the WebSocket connection to establish
  await new Promise(resolve => setTimeout(resolve, 100));

  try {
    if (getOS() === 'darwin') {
      await (Neutralino as unknown as { window: { setMainMenu(menu: unknown[]): Promise<void> } }).window.setMainMenu([
        {
          id: 'app', text: 'TerraMap', menuItems: [
            { id: 'quit', text: 'Quit TerraMap', shortcut: 'q', action: 'terminate:' },
          ]
        },
        {
          id: 'edit', text: 'Edit', menuItems: [
            { id: 'cut', text: 'Cut', shortcut: 'x', action: 'cut:' },
            { id: 'copy', text: 'Copy', shortcut: 'c', action: 'copy:' },
            { id: 'paste', text: 'Paste', shortcut: 'v', action: 'paste:' },
            { id: 'selectAll', text: 'Select All', shortcut: 'a', action: 'selectAll:' },
          ]
        },
        {
          id: 'window', text: 'Window', menuItems: [
            { id: 'close', text: 'Close Window', shortcut: 'w', action: 'performClose:' },
          ]
        },
      ]);
    }
  } catch (e) {
    console.error(e);
  }
}

async function getHomedir(): Promise<string> {
  const { os } = getNeutralino();
  try {
    return await os.getEnv('HOME');
  } catch {
    return await os.getEnv('USERPROFILE');
  }
}

function getOS(): 'windows' | 'darwin' | 'linux' {
  const platform = (window as unknown as Record<string, unknown>).NL_OS as string | undefined;
  if (platform?.toLowerCase().includes('darwin') || platform?.toLowerCase().includes('mac')) return 'darwin';
  if (platform?.toLowerCase().includes('win')) return 'windows';
  return 'linux';
}

async function getTerrariaDirectories(): Promise<string[]> {
  const home = await getHomedir();
  const os = getOS();
  switch (os) {
    case 'windows':
      return [await joinPath(home, 'Documents', 'My Games', 'Terraria')];
    case 'darwin':
      return [await joinPath(home, 'Library', 'Application Support', 'Terraria')];
    default:
      return [await joinPath(home, '.local', 'share', 'Terraria')];
  }
}

async function getSteamUserdataBase(): Promise<string> {
  const home = await getHomedir();
  const os = getOS();
  switch (os) {
    case 'windows':
      return 'C:\\Program Files (x86)\\Steam\\userdata';
    case 'darwin':
      return await joinPath(home, 'Library', 'Application Support', 'Steam', 'userdata');
    default:
      return await joinPath(home, '.local', 'share', 'Steam', 'userdata');
  }
}

async function joinPath(...parts: string[]): Promise<string> {
  return await getNeutralino().filesystem.getJoinedPath(...parts);
}

interface DirEntry {
  entry: string;
  path: string;
  type: string;
}

async function listDir(path: string): Promise<DirEntry[]> {
  try {
    return await getNeutralino().filesystem.readDirectory(path);
  } catch {
    return [];
  }
}

async function scanDirectory(dir: string, extensions: string[]): Promise<FileEntry[]> {
  const results: FileEntry[] = [];
  const entries = await listDir(dir);
  for (const entry of entries) {
    if (entry.type !== 'FILE') continue;
    if (!extensions.some(ext => entry.entry.endsWith(ext))) continue;
    const path = entry.path;
    try {
      const stat = await getNeutralino().filesystem.getStats(path);
      results.push({
        name: entry.entry,
        path,
        size: stat.size,
        lastModified: stat.modifiedAt,
      });
    } catch {
      // skip files we can't stat
    }
  }
  return results;
}

async function scanSteamUserdata(extensions: string[], subfolder: string): Promise<FileEntry[]> {
  const results: FileEntry[] = [];
  const steamBase = await getSteamUserdataBase();
  const userDirs = await listDir(steamBase);
  for (const userDir of userDirs) {
    if (userDir.type !== 'DIRECTORY') continue;
    const remotePath = await joinPath(steamBase, userDir.entry, '105600', 'remote', subfolder);
    results.push(...await scanDirectory(remotePath, extensions));
  }
  return results;
}

async function scanPlayerMaps(dir: string): Promise<PlayerMapEntry[]> {
  const results: PlayerMapEntry[] = [];
  const playerDirs = await listDir(dir);
  for (const playerDir of playerDirs) {
    if (playerDir.type !== 'DIRECTORY') continue;
    const playerPath = await joinPath(dir, playerDir.entry);
    const maps = await scanDirectory(playerPath, ['.map']);
    for (const map of maps) {
      results.push({ ...map, playerName: playerDir.entry });
    }
  }
  return results;
}

async function scanSteamPlayerMaps(subfolder: string): Promise<PlayerMapEntry[]> {
  const results: PlayerMapEntry[] = [];
  const steamBase = await getSteamUserdataBase();
  const userDirs = await listDir(steamBase);
  for (const userDir of userDirs) {
    if (userDir.type !== 'DIRECTORY') continue;
    const remotePath = await joinPath(steamBase, userDir.entry, '105600', 'remote', subfolder);
    results.push(...await scanPlayerMaps(remotePath));
  }
  return results;
}

function dedup<T extends FileEntry>(entries: T[]): T[] {
  const seen = new Set<string>();
  return entries.filter(e => {
    if (seen.has(e.path)) return false;
    seen.add(e.path);
    return true;
  });
}

async function readFileHeader(path: string): Promise<WorldHeader> {
  const buf = await getNeutralino().filesystem.readBinaryFile(path, { pos: 0, size: 64 * 1024 });
  return readWorldHeader(buf);
}

async function enrichWorlds(files: FileEntry[]): Promise<WorldEntry[]> {
  const results: WorldEntry[] = [];
  for (const file of files) {
    try {
      const header = await readFileHeader(file.path);
      results.push({ ...file, ...header });
    } catch {
      // skip files we can't parse
    }
  }
  return results;
}

async function scanAllWorlds(): Promise<FileEntry[]> {
  const files: FileEntry[] = [];
  for (const baseDir of await getTerrariaDirectories()) {
    files.push(...await scanDirectory(await joinPath(baseDir, 'Worlds'), ['.wld']));
  }
  files.push(...await scanSteamUserdata(['.wld'], 'worlds'));
  return dedup(files);
}

async function scanAllPlayers(): Promise<PlayerMapEntry[]> {
  const players: PlayerMapEntry[] = [];
  for (const baseDir of await getTerrariaDirectories()) {
    players.push(...await scanPlayerMaps(await joinPath(baseDir, 'Players')));
  }
  players.push(...await scanSteamPlayerMaps('players'));
  return dedup(players);
}

export async function discoverWorlds(): Promise<WorldEntry[]> {
  const files = await scanAllWorlds();
  return (await enrichWorlds(files)).sort((a, b) => b.lastModified - a.lastModified);
}

export async function discoverPlayers(world: { id: number; uniqueId: string }): Promise<PlayerMapEntry[]> {
  const all = (await scanAllPlayers()).sort((a, b) => b.lastModified - a.lastModified);
  const matchNames = new Set([`${world.id}.map`, `${world.uniqueId}.map`]);
  return all.filter(p => matchNames.has(p.name));
}

export async function readFile(path: string): Promise<File> {
  const buf = await getNeutralino().filesystem.readBinaryFile(path);
  const name = path.split(/[\\/]/).pop() ?? path;
  return new File([buf], name);
}
