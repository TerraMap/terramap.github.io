import { useEffect } from 'react';

interface ShortcutHandlers {
  onClearHighlight: () => void;
  onFindNext: () => void;
  onFindPrevious: () => void;
  onHighlight: () => void;
  onOpenBlocks: () => void;
  onOpenWorld: () => void;
  onReloadWorld: () => void;
  onResetZoom: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        handlers.onOpenBlocks();
        return;
      }

      if (e.key.toLowerCase() === 'o') {
        e.preventDefault();
        handlers.onOpenWorld();
        return;
      }

      if (e.shiftKey && e.key === 'G') {
        e.preventDefault();
        handlers.onFindPrevious();
        return;
      }

      if (e.key === 'g') {
        e.preventDefault();
        handlers.onFindNext();
        return;
      }

      if (e.key.toLowerCase() === 'h') {
        e.preventDefault();
        handlers.onHighlight();
        return;
      }

      if (e.key.toLowerCase() === 'x') {
        e.preventDefault();
        handlers.onClearHighlight();
        return;
      }

      if (e.key.toLowerCase() === 'e') {
        handlers.onZoomIn();
      }

      if (e.key.toLowerCase() === 'c') {
        handlers.onZoomOut();
      }

      if (e.key.toLowerCase() === 'z') {
        handlers.onResetZoom();
      }

      if (e.key.toLowerCase() === 'r') {
        handlers.onReloadWorld();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
}
