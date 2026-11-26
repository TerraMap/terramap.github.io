import { rememberSource } from './fileSource';
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
  // Remember the path, so reloading reads the file from disk again rather than
  // re-parsing these bytes.
  return rememberSource(new File([new Uint8Array(bytes)], name), () => readFile(path));
}

/**
 * Shows the system's open-file dialog for a world file and reads the file.
 * Resolves to null if the user cancels. Unlike an <input type="file">, this
 * gives us the file's path, so reload can read it again after Terraria saves it.
 */
export async function openWorldFileDialog(): Promise<File | null> {
  const { open } = await import('@tauri-apps/plugin-dialog');
  const path = await open({ filters: [{ name: 'Terraria world', extensions: ['wld'] }] });
  return path ? readFile(path) : null;
}

/** The version of the running native (Tauri) app, from tauri.conf.json. */
export async function getNativeVersion(): Promise<string> {
  const { getVersion } = await import('@tauri-apps/api/app');
  return getVersion();
}

/** The live website. */
const SITE_URL = 'https://terramap.github.io/';

/**
 * URL for one of the site's own pages, e.g. "about.html". Natively the bundled
 * frontend has a local origin (tauri://localhost) that the system browser can't
 * open, so native builds link to the live site instead.
 */
export function sitePageUrl(page: string): string {
  return isNative() ? new URL(page, SITE_URL).href : page;
}

/** URL of the native app download page. */
export const NATIVE_DOWNLOAD_URL = `${SITE_URL}native.html`;

/**
 * Opens the native app download page. Tries to open in the system browser (via
 * window.open); if the webview blocks that, falls back to navigating the window.
 */
export function openNativeDownload(): void {
  const opened = window.open(NATIVE_DOWNLOAD_URL, '_blank', 'noopener');
  if (!opened) window.location.href = NATIVE_DOWNLOAD_URL;
}

/**
 * Opens a URL in the system browser via the opener plugin. Native builds from before the plugin
 * was added don't have it, so those fall back to window.open; unlike openNativeDownload, this
 * never navigates the window, which would lose the loaded world.
 */
export async function openExternalUrl(url: string): Promise<void> {
  try {
    const { openUrl } = await import('@tauri-apps/plugin-opener');
    await openUrl(url);
  } catch {
    window.open(url, '_blank', 'noopener');
  }
}
