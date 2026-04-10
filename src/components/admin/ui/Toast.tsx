import { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type, onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div style={{ ...styles.toast, ...styles[type] }}>
      <span style={styles.icon}>{getIcon(type)}</span>
      <span style={styles.message}>{message}</span>
      <button onClick={onClose} style={styles.closeBtn}>
        ×
      </button>
    </div>
  );
}

function getIcon(type: ToastType) {
  switch (type) {
    case 'success':
      return '✓';
    case 'error':
      return '✕';
    case 'info':
      return 'ℹ';
  }
}

const styles: Record<string, React.CSSProperties> = {
  toast: {
    position: 'fixed',
    bottom: 24,
    right: 24,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 16px',
    borderRadius: 8,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    zIndex: 2000,
    animation: 'slideIn 0.3s ease-out',
    fontSize: 14,
    color: '#fff',
  },
  success: {
    backgroundColor: '#16a34a',
  },
  error: {
    backgroundColor: '#dc2626',
  },
  info: {
    backgroundColor: '#2563eb',
  },
  icon: {
    fontWeight: 'bold',
  },
  message: {
    flex: 1,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'inherit',
    fontSize: 18,
    cursor: 'pointer',
    padding: 0,
    lineHeight: 1,
    opacity: 0.8,
  },
};
