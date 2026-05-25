import { useEffect } from 'react';

interface ShortcutHandlers {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onOpenBlocks: () => void;
  onOpenWorld: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        handlers.onOpenBlocks();
        return;
      }

      if (e.ctrlKey && e.key === 'o') {
        e.preventDefault();
        handlers.onOpenWorld();
        return;
      }

      if (e.key === 'e' || e.key === 'E') {
        handlers.onZoomIn();
      }

      if (e.key === 'c' || e.key === 'C') {
        handlers.onZoomOut();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
}
