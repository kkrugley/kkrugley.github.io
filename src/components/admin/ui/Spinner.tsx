interface SpinnerProps {
  size?: number;
  message?: string;
}

export function Spinner({ size = 24, message }: SpinnerProps) {
  return (
    <div style={styles.container}>
      <div style={{ ...styles.spinner, width: size, height: size }} />
      {message && <p style={styles.message}>{message}</p>}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  spinner: {
    border: '3px solid #e5e7eb',
    borderTopColor: '#2563eb',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  message: {
    margin: 0,
    fontSize: 14,
    color: '#6b7280',
  },
};
