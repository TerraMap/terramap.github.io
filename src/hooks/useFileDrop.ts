import { useCallback, useRef, useState, type DragEvent } from 'react';

export function useFileDrop(onFileAccepted: (file: File) => void) {
  const [isDragging, setIsDragging] = useState(false);
  const [invalidDrop, setInvalidDrop] = useState(false);
  const dragCounter = useRef(0);
  const invalidDropTimer = useRef<ReturnType<typeof setTimeout>>(null);

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
    if (file && /\.wld(\.bak\d*)?$/.test(file.name)) {
      onFileAccepted(file);
    } else if (file) {
      setInvalidDrop(true);
      if (invalidDropTimer.current) clearTimeout(invalidDropTimer.current);
      invalidDropTimer.current = setTimeout(() => setInvalidDrop(false), 3000);
    }
  }, [onFileAccepted]);

  const dragProps = {
    onDragEnter: handleDragEnter,
    onDragLeave: handleDragLeave,
    onDragOver: handleDragOver,
    onDrop: handleDrop,
  };

  return { isDragging, invalidDrop, dragProps };
}
