import type { PanzoomObject } from '@panzoom/panzoom';
import Panzoom from '@panzoom/panzoom';
import { useCallback, useEffect, useRef } from 'react';

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

  const onPanZoomEnd = options;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const pz = Panzoom(el, {
      maxScale: 80,
      minScale: 1,
      step: 0.3,
      cursor: 'default',
    });

    const handleWheel = (e: WheelEvent) => {
      const isTrackpad = e.deltaMode === 0 && Math.abs(e.deltaY) < 50;
      pz.zoomWithWheel(e, { step: isTrackpad ? 0.08 : 0.3 });
    };
    el.parentElement!.addEventListener('wheel', handleWheel, { passive: false });

    if (onPanZoomEnd) {
      el.addEventListener('panzoomend', onPanZoomEnd as EventListener);
    }

    instanceRef.current = pz;

    return () => {
      el.parentElement!.removeEventListener('wheel', handleWheel);
      if (onPanZoomEnd) {
        el.removeEventListener('panzoomend', onPanZoomEnd as EventListener);
      }
      pz.destroy();
      instanceRef.current = null;
    };
  }, [containerRef, onPanZoomEnd]);

  const zoomIn = useCallback(() => instanceRef.current?.zoomIn(), []);
  const zoomOut = useCallback(() => instanceRef.current?.zoomOut(), []);
  const reset = useCallback(() => instanceRef.current?.reset(), []);
  const getScale = useCallback(() => instanceRef.current?.getScale() ?? 1, []);

  const panToPoint = useCallback((elX: number, elY: number) => {
    const pz = instanceRef.current;
    const el = containerRef.current;
    if (!pz || !el) return;
    const scale = pz.getScale();
    const parent = el.parentElement!;
    const cx = el.offsetWidth / 2;
    const cy = el.offsetHeight / 2;
    const panX = (parent.clientWidth / 2 - cx) / scale - elX + cx;
    const panY = (parent.clientHeight / 2 - cy) / scale - elY + cy;
    pz.pan(panX, panY, { force: true });
  }, [containerRef]);

  return { zoomIn, zoomOut, reset, getScale, panToPoint, instanceRef };
}
