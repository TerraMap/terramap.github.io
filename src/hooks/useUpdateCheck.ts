import { useEffect, useState } from 'react';
import { getNativeVersion, isNative } from '../lib/native';
import { compareVersions, type VersionInfo } from '../lib/version';

/** How often to poll for a newer version, in milliseconds. */
const CHECK_INTERVAL_MS = 30 * 60 * 1000;

export type UpdateType = 'web' | 'native';

async function fetchVersionInfo(): Promise<VersionInfo | null> {
  try {
    const url = `${__BASE_URL__}version.json?ts=${Date.now()}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()) as VersionInfo;
  } catch {
    return null;
  }
}

/**
 * Polls the deployed version.json and reports when an update is available.
 *
 * - Web: compares the deployed commit hash against the one baked into this
 *   build. A mismatch means a newer build has been deployed → reload to update.
 * - Native: the app loads its frontend live from the site, so only the native
 *   shell can be out of date. Compares the latest released native version
 *   against the installed one → download the new app.
 *
 * Returns the update type once detected, otherwise null.
 */
export function useUpdateCheck(): UpdateType | null {
  const [updateType, setUpdateType] = useState<UpdateType | null>(null);

  useEffect(() => {
    let cancelled = false;
    const native = isNative();

    const check = async () => {
      const info = await fetchVersionInfo();
      if (!info || cancelled) return;

      if (native) {
        try {
          const current = await getNativeVersion();
          if (!cancelled && info.nativeVersion && compareVersions(info.nativeVersion, current) > 0) {
            setUpdateType('native');
          }
        } catch {
          // Ignore — can't determine the installed native version.
        }
      } else if (info.commit && info.commit !== __GIT_HASH__) {
        setUpdateType('web');
      }
    };

    void check();
    const interval = setInterval(() => void check(), CHECK_INTERVAL_MS);
    const onVisible = () => {
      if (document.visibilityState === 'visible') void check();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);

    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, []);

  return updateType;
}
