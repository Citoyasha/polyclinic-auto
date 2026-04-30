// Shared shell + primitives.
// Theme tokens come from window.__T set by the root (light/dark + accent).

const T = () => window.__T;

// ── Phone shell ────────────────────────────────────────────────
// Custom Android frame: renders status bar + content + bottom gesture pill.
// Bottom tab bar is rendered by the screen tree, not the frame.
function Phone({ children }) {
  const t = T();
  return (
    <div style={{
      width: 412, height: 892, borderRadius: 44, overflow: 'hidden',
      background: t.bg,
      border: `9px solid ${t.bezel}`,
      boxShadow: `0 40px 100px ${t.shadow}, 0 0 0 1px rgba(0,0,0,0.06)`,
      display: 'flex', flexDirection: 'column', position: 'relative',
      fontFamily: 'Inter, system-ui, sans-serif',
      color: t.fg,
    }}>
      <PhoneStatusBar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', minHeight: 0, overflow: 'hidden' }}>
        {children}
      </div>
      <PhoneNavPill />
    </div>
  );
}

function PhoneStatusBar() {
  const t = T();
  return (
    <div style={{
      height: 36, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 22px', position: 'relative', flexShrink: 0,
      fontSize: 14, fontWeight: 500, color: t.fg, letterSpacing: 0.1,
    }}>
      <div>9:41</div>
      <div style={{
        position: 'absolute', left: '50%', top: 8, transform: 'translateX(-50%)',
        width: 22, height: 22, borderRadius: 100, background: '#1a1a1a',
      }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill={t.fg}>
          <path d="M8 13.3L.67 5.97a10.37 10.37 0 0114.66 0L8 13.3z" />
        </svg>
        <svg width="14" height="14" viewBox="0 0 16 16" fill={t.fg}>
          <path d="M14.67 14.67V1.33L1.33 14.67h13.34z" />
        </svg>
        <svg width="20" height="14" viewBox="0 0 22 12" fill="none">
          <rect x="0.5" y="0.5" width="19" height="11" rx="2.5" stroke={t.fg} strokeOpacity="0.5" />
          <rect x="2" y="2" width="16" height="8" rx="1.5" fill={t.fg} />
          <rect x="20.5" y="4" width="1.5" height="4" rx="0.5" fill={t.fg} fillOpacity="0.5" />
        </svg>
      </div>
    </div>
  );
}

function PhoneNavPill() {
  const t = T();
  return (
    <div style={{ height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: t.bg }}>
      <div style={{ width: 130, height: 4, borderRadius: 2, background: t.fg, opacity: 0.55 }} />
    </div>
  );
}

// ── Bottom tab bar ─────────────────────────────────────────────
function BottomTabs({ tab, onTab }) {
  const t = T();
  const items = [
    { id: 'voitures', label: 'Voitures', Icon: IconCar },
    { id: 'clients', label: 'Clients', Icon: IconUsers },
    { id: 'stock', label: 'Stock', Icon: IconBox },
    { id: 'recherche', label: 'Recherche', Icon: IconSearch },
  ];
  return (
    <div style={{
      display: 'flex', borderTop: `1px solid ${t.border}`,
      background: t.surface, paddingBottom: 4, flexShrink: 0,
    }}>
      {items.map(({ id, label, Icon }) => {
        const active = id === tab;
        return (
          <button key={id} onClick={() => onTab(id)} style={{
            flex: 1, background: 'transparent', border: 0, padding: '10px 0 8px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            cursor: 'pointer', color: active ? t.accent : t.fgMuted,
            fontFamily: 'inherit',
          }}>
            <div style={{
              padding: '4px 16px', borderRadius: 14,
              background: active ? t.accentSoft : 'transparent',
              transition: 'background 0.15s',
            }}>
              <Icon size={22} strokeWidth={active ? 2 : 1.6} />
            </div>
            <span style={{ fontSize: 11, fontWeight: active ? 600 : 500, letterSpacing: 0.1 }}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── Plate pill ─────────────────────────────────────────────────
function Plate({ value, size = 'md' }) {
  const t = T();
  const sizes = {
    sm: { fs: 12, pad: '3px 8px', tracking: 0.4 },
    md: { fs: 15, pad: '4px 10px', tracking: 0.5 },
    lg: { fs: 22, pad: '6px 14px', tracking: 0.8 },
    xl: { fs: 28, pad: '8px 16px', tracking: 1 },
  }[size];
  return (
    <span style={{
      display: 'inline-block',
      fontFamily: '"JetBrains Mono", ui-monospace, monospace',
      fontWeight: 600, fontSize: sizes.fs, letterSpacing: sizes.tracking,
      padding: sizes.pad, background: t.plateBg, borderRadius: 6,
      color: t.fg, border: `1px solid ${t.plateBorder}`,
      whiteSpace: 'nowrap',
    }}>{value}</span>
  );
}

// ── Status chip — outlined, neutral text, color dot ─────────────
function StatusChip({ status, size = 'sm', onClick }) {
  const t = T();
  if (!status || !STATUS_META[status]) return null;
  const meta = STATUS_META[status];
  const sizes = {
    sm: { fs: 11.5, pad: '3px 8px 3px 7px', dot: 6, gap: 6 },
    md: { fs: 13, pad: '5px 12px 5px 10px', dot: 7, gap: 8 },
  }[size];
  return (
    <span onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: sizes.gap,
      fontSize: sizes.fs, fontWeight: 500, letterSpacing: 0.1,
      padding: sizes.pad, borderRadius: 999,
      border: `1px solid ${t.border}`, color: t.fg,
      background: t.surface, cursor: onClick ? 'pointer' : 'default',
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width: sizes.dot, height: sizes.dot, borderRadius: '50%', background: meta.dot, flexShrink: 0 }} />
      {meta.label}
    </span>
  );
}

// ── Car thumbnail (vivid 3/4 car silhouette on accent gradient) ──
function CarThumb({ size = 48, plate }) {
  const t = T();
  const r = size * 0.26;
  return (
    <div style={{
      width: size, height: size, borderRadius: r,
      background: `linear-gradient(135deg, ${t.accent} 0%, ${t.accentDeep} 100%)`,
      boxShadow: `0 4px 12px -4px ${t.accentShadow}, inset 0 1px 0 rgba(255,255,255,0.18)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, position: 'relative', overflow: 'hidden',
    }}>
      {/* subtle highlight stripe */}
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 0, height: '45%',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0))',
        pointerEvents: 'none',
      }} />
      <svg width={size * 0.78} height={size * 0.78} viewBox="0 0 64 64" fill="none" style={{ position: 'relative', zIndex: 1 }}>
        {/* ground shadow */}
        <ellipse cx="32" cy="50" rx="22" ry="2" fill="rgba(0,0,0,0.25)" />
        {/* car body - 3/4 view */}
        <path d="M8 42c0-1.5 1-3 2.6-3.4l3-.8 4.2-7.6c1.3-2.3 3.7-3.7 6.4-3.7h17c2.4 0 4.6 1.1 6 3l5.5 7.4 3.6 1.1c1.6.5 2.7 2 2.7 3.7v3.8c0 .9-.7 1.5-1.5 1.5H53"
              fill="#ffffff" stroke="rgba(0,0,0,0.08)" strokeWidth="0.5" />
        <path d="M15 47H10.5c-.8 0-1.5-.7-1.5-1.5V42" fill="#ffffff" />
        {/* windows */}
        <path d="M19.5 38l3-5.5c.7-1.3 2.1-2.1 3.6-2.1h11c1.4 0 2.7.7 3.4 1.9l3.7 5.7H19.5z"
              fill={t.accentDeep} opacity="0.85" />
        <path d="M31.5 30.4v7.6M27 38.5l1.5-7.5" stroke="rgba(255,255,255,0.4)" strokeWidth="0.6" />
        {/* gold accent strip */}
        <rect x="9" y="40.5" width="46" height="1.2" fill={t.gold} opacity="0.9" />
        {/* headlights */}
        <circle cx="51" cy="40" r="1.3" fill={t.gold} />
        {/* wheels */}
        <circle cx="19" cy="46" r="4.5" fill="#1a1a1a" />
        <circle cx="19" cy="46" r="2" fill="#3a3a3a" />
        <circle cx="45" cy="46" r="4.5" fill="#1a1a1a" />
        <circle cx="45" cy="46" r="2" fill="#3a3a3a" />
      </svg>
    </div>
  );
}

// ── Bottom sheet ───────────────────────────────────────────────
function BottomSheet({ open, onClose, children, height = '90%', title }) {
  const t = T();
  if (!open) return null;
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 100, display: 'flex',
      flexDirection: 'column', justifyContent: 'flex-end',
      animation: 'sheet-fade 0.2s ease',
    }}>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)',
      }} />
      <div style={{
        position: 'relative', background: t.surface,
        borderRadius: '20px 20px 0 0', maxHeight: height,
        display: 'flex', flexDirection: 'column',
        animation: 'sheet-up 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
        boxShadow: '0 -10px 40px rgba(0,0,0,0.2)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: t.border }} />
        </div>
        {title && (
          <div style={{
            padding: '4px 20px 14px', fontSize: 18, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderBottom: `1px solid ${t.border}`,
          }}>
            <span>{title}</span>
            <button onClick={onClose} style={{
              background: 'transparent', border: 0, color: t.fgMuted,
              padding: 4, cursor: 'pointer',
            }}>
              <IconX size={22} />
            </button>
          </div>
        )}
        <div style={{ overflow: 'auto', flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────
function Toast({ message, visible }) {
  const t = T();
  if (!message) return null;
  return (
    <div style={{
      position: 'absolute', bottom: 90, left: '50%',
      transform: `translateX(-50%) translateY(${visible ? 0 : 20}px)`,
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.2s, transform 0.2s',
      background: t.toastBg, color: t.toastFg,
      padding: '10px 18px', borderRadius: 999, fontSize: 13.5, fontWeight: 500,
      zIndex: 200, pointerEvents: 'none',
      boxShadow: '0 6px 20px rgba(0,0,0,0.18)',
    }}>{message}</div>
  );
}

// ── Search field ──────────────────────────────────────────────
function SearchField({ value, onChange, placeholder, onFocus }) {
  const t = T();
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 14px', background: t.surfaceAlt, borderRadius: 12,
      color: t.fgMuted,
    }}>
      <IconSearch size={18} strokeWidth={1.7} />
      <input value={value || ''} onChange={(e) => onChange?.(e.target.value)}
             onFocus={onFocus}
             placeholder={placeholder} style={{
        flex: 1, border: 0, background: 'transparent', outline: 'none',
        fontFamily: 'inherit', fontSize: 14.5, color: t.fg,
      }} />
    </div>
  );
}

Object.assign(window, {
  Phone, BottomTabs, Plate, StatusChip, CarThumb, BottomSheet, Toast, SearchField,
});
