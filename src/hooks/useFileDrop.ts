import { useCallback, useEffect, useRef, useState, type DragEvent } from 'react';
import { isNative, readFile } from '../lib/native';

const WORLD_FILE_PATTERN = /\.wld(\.bak\d*)?$/;

export function useFileDrop(onFileAccepted: (file: File) => void) {
  const [isDragging, setIsDragging] = useState(false);
  const [invalidDrop, setInvalidDrop] = useState(false);
  const dragCounter = useRef(0);
  const invalidDropTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const callbackRef = useRef(onFileAccepted);
  callbackRef.current = onFileAccepted;

  const flashInvalidDrop = useCallback(() => {
    setInvalidDrop(true);
    if (invalidDropTimer.current) clearTimeout(invalidDropTimer.current);
    invalidDropTimer.current = setTimeout(() => setInvalidDrop(false), 3000);
  }, []);

  // Tauri intercepts OS file drops before the DOM ever sees them, so on native
  // builds the HTML5 drag/drop events below never fire with files. Tauri's own
  // drag-drop event delivers the real filesystem path instead.
  useEffect(() => {
    if (!isNative()) return;

    let unlisten: (() => void) | undefined;
    void (async () => {
      const { getCurrentWebview } = await import('@tauri-apps/api/webview');
      unlisten = await getCurrentWebview().onDragDropEvent((event) => {
        const payload = event.payload;
        switch (payload.type) {
          case 'enter':
          case 'over':
            setIsDragging(true);
            break;
          case 'leave':
            setIsDragging(false);
            break;
          case 'drop': {
            setIsDragging(false);
            const path = payload.paths[0];
            if (path && WORLD_FILE_PATTERN.test(path)) {
              void readFile(path).then((file) => callbackRef.current(file));
            } else if (path) {
              flashInvalidDrop();
            }
            break;
          }
        }
      });
    })();

    return () => unlisten?.();
  }, [flashInvalidDrop]);

  const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragCounter.current++;
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && WORLD_FILE_PATTERN.test(file.name)) {
      onFileAccepted(file);
    } else if (file) {
      flashInvalidDrop();
    }
  }, [onFileAccepted, flashInvalidDrop]);

  const dragProps = {
    onDragEnter: handleDragEnter,
    onDragLeave: handleDragLeave,
    onDragOver: handleDragOver,
    onDrop: handleDrop,
  };

  return { isDragging, invalidDrop, dragProps };
}
