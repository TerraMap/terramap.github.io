// Reloading a world has to read the file's *current* contents from disk, but a
// File object doesn't always allow that:
//  - Chromium browsers (Chrome, Edge, Brave...) record a file's modification
//    time when it is picked, and reading it after it changes on disk (e.g.
//    Terraria saving the world) fails with a NotReadableError.
//  - WebKit (Safari, and the native app's webview) does the same, failing with
//    a NotFoundError ("The object can not be found here.").
//  - Files the native app reads by path are read into memory, so they never change.
// Wherever a file comes from a source that can be read again (a native path or
// a File System Access handle), we remember how, so reload can get a fresh copy.

type Reread = () => Promise<File>;

const rereaders = new WeakMap<File, Reread>();

/** Remembers how to read `file` again from its source, and returns it. */
export function rememberSource(file: File, reread: Reread): File {
  rereaders.set(file, reread);
  return file;
}

/**
 * Returns the current contents of `file` from its source, or `file` itself when
 * there is no source to read again (e.g. a file from an <input type="file">).
 */
export async function rereadFile(file: File): Promise<File> {
  const reread = rereaders.get(file);
  if (!reread) return file;
  return rememberSource(await reread(), reread);
}

/** Whether reading the file failed because it changed on disk after it was picked. */
export function isFileChangedError(error: unknown): boolean {
  if (!error || typeof error !== 'object' || !('name' in error)) return false;
  return error.name === 'NotReadableError' || error.name === 'NotFoundError';
}

// The File System Access API (Chromium only, and off by default in Brave)
// gives us a handle that can be read again. It isn't in TypeScript's DOM lib.
interface OpenFilePickerOptions {
  types?: { description?: string; accept: Record<string, string[]> }[];
  excludeAcceptAllOption?: boolean;
}
type ShowOpenFilePicker = (options?: OpenFilePickerOptions) => Promise<FileSystemFileHandle[]>;

function fromHandle(handle: FileSystemFileHandle): Promise<File> {
  const reread = () => handle.getFile();
  return reread().then((file) => rememberSource(file, reread));
}

/** Whether `openWorldFileWithPicker` can be used; otherwise fall back to an <input type="file">. */
export function canUseOpenFilePicker(): boolean {
  return typeof (window as { showOpenFilePicker?: ShowOpenFilePicker }).showOpenFilePicker === 'function';
}

/**
 * Shows the File System Access open-file picker for a world file. Resolves to
 * null if the user cancels.
 */
export async function openWorldFileWithPicker(): Promise<File | null> {
  const showOpenFilePicker = (window as unknown as { showOpenFilePicker: ShowOpenFilePicker }).showOpenFilePicker;
  try {
    const [handle] = await showOpenFilePicker({
      types: [{ description: 'Terraria world', accept: { 'application/octet-stream': ['.wld'] } }],
    });
    return handle ? await fromHandle(handle) : null;
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') return null;
    throw e;
  }
}

/**
 * The file from a drop, remembering its File System Access handle where the
 * browser provides one. Must be called synchronously in the drop handler: the
 * DataTransfer is emptied once the event returns.
 */
export function fileFromDrop(dataTransfer: DataTransfer): { file: File; withSource: Promise<File> } | undefined {
  const file = dataTransfer.files[0] as File | undefined;
  if (!file) return undefined;
  const item = dataTransfer.items?.[0] as (DataTransferItem & { getAsFileSystemHandle?: () => Promise<FileSystemHandle | null> }) | undefined;
  if (item?.kind !== 'file' || typeof item.getAsFileSystemHandle !== 'function') {
    return { file, withSource: Promise.resolve(file) };
  }
  const withSource = item.getAsFileSystemHandle()
    .then((handle) => handle?.kind === 'file' ? fromHandle(handle as FileSystemFileHandle) : file)
    .catch(() => file);
  return { file, withSource };
}
