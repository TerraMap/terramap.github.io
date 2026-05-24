import { useEffect, useRef, useCallback } from 'react';
import Panzoom, { PanzoomObject } from '@panzoom/panzoom';

export interface PanZoomControls {
  zoomIn: () => void;
  zoomOut: () => void;
  reset: () => void;
  getScale: () => number;
}

export function usePanZoom(
  containerRef: React.RefObject<HTMLDivElement | null>,
  options?: { onPanZoomEnd?: (e: PointerEvent) => void },
) {
  const instanceRef = useRef<PanzoomObject | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const pz = Panzoom(el, {
      maxScale: 20,
      minScale: 0.3,
      cursor: 'default',
      contain: 'outside',
    });

    el.parentElement!.addEventListener('wheel', pz.zoomWithWheel, { passive: false });

    if (options?.onPanZoomEnd) {
      el.addEventListener('panzoomend', options.onPanZoomEnd as EventListener);
    }

    instanceRef.current = pz;

    return () => {
      el.parentElement!.removeEventListener('wheel', pz.zoomWithWheel);
      if (options?.onPanZoomEnd) {
        el.removeEventListener('panzoomend', options.onPanZoomEnd as EventListener);
      }
      pz.destroy();
      instanceRef.current = null;
    };
  }, []);

  const zoomIn = useCallback(() => instanceRef.current?.zoomIn(), []);
  const zoomOut = useCallback(() => instanceRef.current?.zoomOut(), []);
  const reset = useCallback(() => instanceRef.current?.reset(), []);
  const getScale = useCallback(() => instanceRef.current?.getScale() ?? 1, []);

  return { zoomIn, zoomOut, reset, getScale, instanceRef };
}
