import { useMemo } from 'react';

export type OS = 'windows' | 'macos' | 'linux' | 'android';

function detectOS(): OS {
  const p = navigator.platform.toLowerCase();
  const ua = navigator.userAgent.toLowerCase();
  if (p.startsWith('win') || ua.includes('windows')) return 'windows';
  if (p.startsWith('mac') || ua.includes('macintosh')) return 'macos';
  // Android user agents also say "Linux", so check for it first.
  if (ua.includes('android')) return 'android';
  return 'linux';
}

export function useDetectOS(): OS {
  return useMemo(detectOS, []);
}

export interface PathEntry {
  os: OS;
  label: string;
  path: string;
  copyPath?: string;
}
