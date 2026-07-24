import type { WorldHeader } from './readWorldHeader';

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

export function isNative(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

async function invoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  const { invoke: tauriInvoke } = await import('@tauri-apps/api/core');
  return tauriInvoke<T>(cmd, args);
}

export async function discoverWorlds(): Promise<WorldEntry[]> {
  return invoke<WorldEntry[]>('discover_worlds');
}

export async function discoverPlayers(world: { id: number; uniqueId: string }): Promise<PlayerMapEntry[]> {
  return invoke<PlayerMapEntry[]>('discover_players', {
    worldId: world.id,
    uniqueId: world.uniqueId,
  });
}

export async function readFile(path: string): Promise<File> {
  const bytes = await invoke<number[]>('read_file', { path });
  const name = path.split(/[\\/]/).pop() ?? path;
  return new File([new Uint8Array(bytes)], name);
}

/** The version of the running native (Tauri) app, from tauri.conf.json. */
export async function getNativeVersion(): Promise<string> {
  const { getVersion } = await import('@tauri-apps/api/app');
  return getVersion();
}

/** URL of the native app download page. */
export const NATIVE_DOWNLOAD_URL = 'https://terramap.github.io/native.html';

/**
 * Opens the native app download page. Tries to open in the system browser (via
 * window.open); if the webview blocks that, falls back to navigating the window.
 */
export function openNativeDownload(): void {
  const opened = window.open(NATIVE_DOWNLOAD_URL, '_blank', 'noopener');
  if (!opened) window.location.href = NATIVE_DOWNLOAD_URL;
}
