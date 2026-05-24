
interface StatusBarProps {
  status: string;
}

export function StatusBar({ status }: StatusBarProps) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '4px 16px',
        background: '#001529',
        color: '#fff',
        fontSize: 13,
        zIndex: 1000,
      }}
    >
      {status}
    </div>
  );
}
