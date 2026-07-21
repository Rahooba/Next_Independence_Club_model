'use client'

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '16px',
      padding: '24px',
      textAlign: 'center',
      fontFamily: "'Tajawal', sans-serif",
      background: 'var(--bg)',
      direction: 'rtl',
    }}>
      <div style={{ fontSize: '3rem' }}>⚠️</div>
      <h1 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', margin: 0 }}>حدث خطأ غير متوقع</h1>
      <p style={{ color: 'var(--text-muted)', margin: 0, maxWidth: '400px' }}>
        عذراً، حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.
      </p>
      <button
        onClick={reset}
        style={{
          padding: '12px 32px',
          borderRadius: '12px',
          border: 'none',
          background: 'var(--button-primary-bg)',
          color: 'white',
          fontSize: '1rem',
          fontWeight: '600',
          cursor: 'pointer',
          fontFamily: 'inherit',
          marginTop: '8px',
        }}
      >
        إعادة المحاولة
      </button>
    </div>
  )
}
