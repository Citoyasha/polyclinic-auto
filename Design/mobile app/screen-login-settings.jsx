// Login screen + Settings screen

function LoginScreen({ onLogin }) {
  const t = window.__T;
  const [email, setEmail] = React.useState('owner@garage.tn');
  const [password, setPassword] = React.useState('demo1234');
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0,
      background: t.bg, padding: '0 28px', justifyContent: 'center',
    }}>
      <div style={{ marginBottom: 36, textAlign: 'center' }}>
        <div style={{
          width: 64, height: 64, margin: '0 auto 16px',
          borderRadius: 18, background: t.accent, color: t.onAccent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 6px 20px ${t.accentShadow}`,
        }}>
          <IconCar size={34} strokeWidth={1.8} />
        </div>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1.5, color: t.fgMuted, textTransform: 'uppercase' }}>
          Garage
        </div>
        <div style={{ fontSize: 26, fontWeight: 600, marginTop: 4, letterSpacing: -0.4 }}>
          Atelier El Manar
        </div>
        <div style={{ fontSize: 13.5, color: t.fgMuted, marginTop: 6 }}>
          Connectez-vous pour continuer
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: t.fgMuted, marginBottom: 6, letterSpacing: 0.3, textTransform: 'uppercase' }}>Email</div>
        <input value={email} onChange={(e) => setEmail(e.target.value)}
               style={{
                 width: '100%', padding: '13px 14px', boxSizing: 'border-box',
                 border: `1px solid ${t.border}`, borderRadius: 12,
                 background: t.surface, color: t.fg, fontFamily: 'inherit',
                 fontSize: 14.5, outline: 'none',
               }} />
      </div>

      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: t.fgMuted, marginBottom: 6, letterSpacing: 0.3, textTransform: 'uppercase' }}>Mot de passe</div>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
               style={{
                 width: '100%', padding: '13px 14px', boxSizing: 'border-box',
                 border: `1px solid ${t.border}`, borderRadius: 12,
                 background: t.surface, color: t.fg, fontFamily: 'inherit',
                 fontSize: 14.5, outline: 'none',
               }} />
      </div>

      <div style={{ textAlign: 'right', marginBottom: 24 }}>
        <a href="#" style={{ fontSize: 13, color: t.accent, textDecoration: 'none', fontWeight: 500 }}>
          Mot de passe oublié ?
        </a>
      </div>

      <button onClick={onLogin} style={{
        width: '100%', padding: '14px 16px', borderRadius: 12,
        background: t.accent, color: t.onAccent, border: 0,
        fontFamily: 'inherit', fontSize: 15, fontWeight: 600, cursor: 'pointer',
        boxShadow: `0 4px 14px ${t.accentShadow}`,
      }}>Se connecter</button>

      <div style={{ marginTop: 24, textAlign: 'center', fontSize: 12, color: t.fgMuted }}>
        3 comptes pré-enregistrés · pas d'inscription
      </div>
    </div>
  );
}

function SettingsScreen({ onBack, onLogout }) {
  const t = window.__T;
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, background: t.bg }}>
      <div style={{
        padding: '6px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: `1px solid ${t.borderSoft}`, flexShrink: 0,
      }}>
        <button onClick={onBack} style={{
          width: 44, height: 44, border: 0, background: 'transparent', color: t.fg,
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>
          <IconArrowLeft size={24} />
        </button>
        <div style={{ fontSize: 16, fontWeight: 600 }}>Compte</div>
        <div style={{ width: 44 }} />
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
        <div style={{
          background: t.surface, padding: '18px 18px', borderRadius: 14,
          border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', gap: 14,
          marginBottom: 20,
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%', background: t.accentSoft,
            color: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 17, fontWeight: 700,
          }}>OB</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 600 }}>Owner Boss</div>
            <div style={{ fontSize: 13, color: t.fgMuted }}>owner@garage.tn</div>
          </div>
        </div>

        <SettingRow label="Notifications" value="Activées" />
        <SettingRow label="Langue" value="Français" />
        <SettingRow label="Thème" value="Voir Tweaks" />
        <SettingRow label="Version de l'application" value="1.0.0" muted />

        <button onClick={onLogout} style={{
          width: '100%', marginTop: 24, padding: '13px 16px', borderRadius: 12,
          background: 'transparent', border: `1px solid ${t.border}`,
          color: '#dc2626', fontFamily: 'inherit', fontSize: 14.5, fontWeight: 600, cursor: 'pointer',
        }}>Déconnexion</button>
      </div>
    </div>
  );
}

function SettingRow({ label, value, muted }) {
  const t = window.__T;
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '14px 4px', borderBottom: `1px solid ${t.borderSoft}`,
    }}>
      <span style={{ fontSize: 14.5, color: t.fg }}>{label}</span>
      <span style={{ fontSize: 13.5, color: muted ? t.fgMuted : t.fg, fontFamily: muted ? '"JetBrains Mono", monospace' : 'inherit' }}>
        {value}
      </span>
    </div>
  );
}

Object.assign(window, { LoginScreen, SettingsScreen });
