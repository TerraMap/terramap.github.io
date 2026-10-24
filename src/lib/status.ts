import type en from '../i18n/en.json';

// Status messages are passed around as keys (some come from the world-loading
// worker) and translated where they are displayed, in StatusBar.
export interface Status {
  key: keyof typeof en.status;
  /** The percentage for *_progress messages, or the tile count for loaded_tiles. */
  value?: number;
}
