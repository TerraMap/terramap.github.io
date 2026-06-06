import { useEffect } from 'react';
import { keyboardShortcuts, type ShortcutHandlers } from '../lib/keyboardShortcuts';

export type { ShortcutHandlers };

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.ctrlKey || e.altKey || e.metaKey) return;

      const code = e.code.replace(/^Key/, '').toLowerCase();
      const match = keyboardShortcuts.find(
        s => s.key.toLowerCase() === code && !!s.shift === e.shiftKey
      );
      if (match) {
        e.preventDefault();
        handlers[match.handler]();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
}
