import { useCallback, useState } from 'react';

const STORAGE_KEY = 'maskOpacity';

/** How dark the mask over everything but highlighted blocks and wires was before it was adjustable. */
export const DEFAULT_MASK_OPACITY = 0.75;

function load(): number {
  const stored = typeof localStorage === 'undefined' ? null : localStorage.getItem(STORAGE_KEY);
  const value = stored === null ? NaN : Number(stored);
  return value >= 0 && value <= 1 ? value : DEFAULT_MASK_OPACITY;
}

/** The highlight/wire mask's opacity (0-1), remembered between visits. */
export function useMaskOpacity() {
  const [maskOpacity, setMaskOpacityState] = useState(load);
  const setMaskOpacity = useCallback((value: number) => {
    setMaskOpacityState(value);
    localStorage.setItem(STORAGE_KEY, String(value));
  }, []);
  return { maskOpacity, setMaskOpacity };
}
