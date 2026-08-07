const GOOGLE_G_ICON = (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
    <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
    <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.85.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" />
    <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.33z" />
    <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
  </svg>
);

export default function LoginGate({ onSignIn, error }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div
        style={{
          maxWidth: 420,
          width: '100%',
          background: 'linear-gradient(160deg, rgba(255,255,255,0.07), rgba(255,255,255,0.015))',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 24,
          padding: 40,
          textAlign: 'center',
          boxShadow: '0 30px 60px -26px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.07)'
        }}
      >
        <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 26, fontWeight: 800, marginBottom: 8 }}>
          HOP Penalty &amp; Incentive Console
        </div>
        <div style={{ color: '#8a97ac', fontSize: 14, marginBottom: 32 }}>Sign in with your Google account to continue.</div>

        <button
          onClick={onSignIn}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            border: '1px solid rgba(255,255,255,0.15)',
            background: '#1a1f2b',
            color: '#f4f6fa',
            padding: '12px 22px',
            borderRadius: 999,
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer'
          }}
        >
          {GOOGLE_G_ICON}
          Sign in with Google
        </button>

        {error && (
          <div
            style={{
              marginTop: 20,
              textAlign: 'left',
              background: 'rgba(248,113,113,0.1)',
              border: '1px solid rgba(248,113,113,0.3)',
              color: '#f87171',
              borderRadius: 12,
              padding: '12px 16px',
              fontSize: 13,
              lineHeight: 1.5
            }}
          >
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
