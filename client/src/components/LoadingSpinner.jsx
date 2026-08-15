/**
 * Loading spinner component for data fetching states
 */

export function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
      gap: '16px'
    }}>
      <div style={{
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #2196f3',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        animation: 'spin 1s linear infinite'
      }} />
      <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>{text}</p>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

/**
 * Skeleton loader for content placeholder
 */
export function SkeletonLoader({ count = 5, height = 60 }) {
  return (
    <div style={{ gap: '8px', display: 'flex', flexDirection: 'column' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            height: `${height}px`,
            backgroundColor: '#e0e0e0',
            borderRadius: '4px',
            animation: 'pulse 2s infinite'
          }}
        />
      ))}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

export default LoadingSpinner;
