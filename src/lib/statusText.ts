import type { TFunction } from 'i18next';

// Status messages are produced in English (some inside the world-loading worker),
// so they are translated where they are displayed.
const statusPatterns: [RegExp, string][] = [
  [/^Please choose a Terraria \.wld file$/, 'status.choose_file'],
  [/^Loading\.\.\.$/, 'status.loading'],
  [/^Reading world file\.\.\.$/, 'status.reading_file'],
  [/^Loading world file\.\.\.$/, 'status.loading_file'],
  [/^Reading world version\.\.\.$/, 'status.reading_version'],
  [/^Reading world header\.\.\.$/, 'status.reading_header'],
  [/^Reading world tiles\.\.\.$/, 'status.reading_tiles'],
  [/^Reading tiles\.\.\. (?<value>.+)$/, 'status.reading_tiles_progress'],
  [/^Rendering world\.\.\. (?<value>.+)$/, 'status.rendering_progress'],
  [/^Highlighting\.\.\. (?<value>.+)$/, 'status.highlighting_progress'],
  [/^Loaded (?<value>.+) tiles$/, 'status.loaded_tiles'],
];

export function translateStatus(status: string, t: TFunction): string {
  for (const [pattern, key] of statusPatterns) {
    const match = pattern.exec(status);
    if (match) return t(key, { value: match.groups?.value });
  }
  return status;
}
