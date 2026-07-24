export interface VersionInfo {
  /** package.json version of the deployed web build */
  version: string;
  /** short git hash of the deployed web build */
  commit: string;
  /** version of the latest available native (Tauri) release */
  nativeVersion: string;
}

/**
 * Compares two dotted version strings (e.g. "0.1.6").
 * Returns a positive number if `a` is newer than `b`, negative if older, 0 if equal.
 * Non-numeric or missing segments are treated as 0.
 */
export function compareVersions(a: string, b: string): number {
  const pa = a.split('.');
  const pb = b.split('.');
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const na = parseInt(pa[i] ?? '0', 10) || 0;
    const nb = parseInt(pb[i] ?? '0', 10) || 0;
    if (na !== nb) return na - nb;
  }
  return 0;
}
