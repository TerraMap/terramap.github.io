interface DropOverlayProps {
  isDragging: boolean;
  invalidDrop: boolean;
}

export function DropOverlay({ isDragging, invalidDrop }: DropOverlayProps) {
  if (!isDragging && !invalidDrop) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1003,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      pointerEvents: 'none',
    }}>
      <div style={{
        padding: '32px 48px',
        borderRadius: 12,
        border: `3px dashed ${invalidDrop ? 'rgba(255, 100, 100, 0.7)' : 'rgba(255, 255, 255, 0.7)'}`,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        color: invalidDrop ? '#ff6464' : '#fff',
        fontSize: 24,
        fontWeight: 500,
      }}>
        {invalidDrop ? 'Only Terraria world files are supported' : 'Drop Terraria world file to open:'}
        <ul style={{ fontSize: 16 }}>
          <li>.wld</li>
          <li>.wld.bak</li>
          <li>.wld.bak2</li>
        </ul>
      </div>
    </div>
  );
}
