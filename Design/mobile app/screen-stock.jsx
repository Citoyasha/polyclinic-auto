// Stock tab + Stock item detail

function StockScreen({ items, onOpenItem, onOpenNewItem }) {
  const t = window.__T;
  const [search, setSearch] = React.useState('');
  const [filter, setFilter] = React.useState('tous');

  const filtered = items.filter((it) => {
    if (filter === 'pieces' && it.type !== 'part') return false;
    if (filter === 'fluides' && it.type !== 'fluid') return false;
    if (search && !it.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, background: t.bg, position: 'relative' }}>
      <div style={{ padding: '8px 20px 4px' }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1.5, color: t.fgMuted, textTransform: 'uppercase' }}>
          Garage
        </div>
        <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: -0.4, marginTop: 2 }}>
          Stock
        </div>
      </div>

      <div style={{ padding: '12px 20px 0' }}>
        <SearchField value={search} onChange={setSearch}
                     placeholder="Rechercher un article…" />
      </div>

      <div style={{ display: 'flex', gap: 8, padding: '14px 20px 12px' }}>
        {[
          { id: 'tous', label: 'Tous' },
          { id: 'pieces', label: 'Pièces' },
          { id: 'fluides', label: 'Fluides' },
        ].map((c) => {
          const active = filter === c.id;
          return (
            <button key={c.id} onClick={() => setFilter(c.id)} style={{
              padding: '7px 14px', borderRadius: 999,
              fontFamily: 'inherit', fontSize: 13, fontWeight: active ? 600 : 500,
              border: `1px solid ${active ? t.accent : t.border}`,
              background: active ? t.accent : t.surface, color: active ? t.onAccent : t.fg,
              boxShadow: active ? `0 2px 8px -2px ${t.accentShadow}` : 'none',
              cursor: 'pointer', transition: 'all 0.15s',
            }}>{c.label}</button>
          );
        })}
      </div>

      <div style={{ flex: 1, overflow: 'auto', paddingBottom: 100 }}>
        {filtered.map((item) => (
          <StockRow key={item.id} item={item} onClick={() => onOpenItem(item.id)} />
        ))}
      </div>

      <button onClick={onOpenNewItem} style={{
        position: 'absolute', right: 20, bottom: 24,
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '14px 20px 14px 16px', borderRadius: 18,
        background: t.accent, color: t.onAccent, border: 0, cursor: 'pointer',
        fontFamily: 'inherit', fontSize: 15, fontWeight: 600,
        boxShadow: `0 6px 20px ${t.accentShadow}`,
      }}>
        <IconPlus size={20} strokeWidth={2.4} />
        Nouvel article
      </button>
    </div>
  );
}

function StockRow({ item, onClick }) {
  const t = window.__T;
  const isLow = item.stock <= item.threshold;
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
      borderBottom: `1px solid ${t.borderSoft}`, cursor: 'pointer',
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10, background: t.surfaceAlt,
        color: t.fgMuted, display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <IconBox size={20} strokeWidth={1.6} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 500, color: t.fg, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
          <span style={{ fontSize: 11.5, color: t.fgMuted, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 500 }}>
            {item.type === 'part' ? 'Pièce' : 'Fluide'}
          </span>
          {isLow && (
            <span style={{
              fontSize: 10.5, padding: '2px 7px', borderRadius: 999,
              background: 'rgba(217, 119, 6, 0.12)', color: '#b45309',
              fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase',
              display: 'inline-flex', alignItems: 'center', gap: 4,
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#d97706' }} />
              Stock bas
            </span>
          )}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 22, fontWeight: 600, fontFamily: '"JetBrains Mono", monospace', letterSpacing: -0.5, color: isLow ? '#b45309' : t.fg }}>
          {item.stock}
        </div>
        <div style={{ fontSize: 11, color: t.fgMuted, marginTop: -2 }}>{item.unit}</div>
      </div>
    </div>
  );
}

function StockDetailScreen({ item, movements, onBack, onAdjust }) {
  const t = window.__T;
  const [note, setNote] = React.useState('');
  const isLow = item.stock <= item.threshold;

  const adjust = (delta) => {
    onAdjust(item.id, delta, note);
    setNote('');
  };

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
        <button style={{
          width: 44, height: 44, border: 0, background: 'transparent', color: t.fg,
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>
          <IconMore size={22} />
        </button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '8px 0 24px' }}>
        <div style={{ padding: '0 24px 22px', borderBottom: `1px solid ${t.borderSoft}` }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1.2, color: t.fgMuted, textTransform: 'uppercase' }}>
            {item.type === 'part' ? 'Pièce' : 'Fluide'}
          </div>
          <div style={{ fontSize: 22, fontWeight: 600, marginTop: 4, letterSpacing: -0.3 }} dir="auto">{item.name}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 18 }}>
            <span style={{ fontSize: 56, fontWeight: 700, fontFamily: '"JetBrains Mono", monospace', letterSpacing: -2, color: isLow ? '#b45309' : t.fg, lineHeight: 1 }}>
              {item.stock}
            </span>
            <span style={{ fontSize: 16, color: t.fgMuted }}>{item.unit}</span>
            {isLow && (
              <span style={{
                marginLeft: 8, fontSize: 11, padding: '3px 8px', borderRadius: 999,
                background: 'rgba(217, 119, 6, 0.12)', color: '#b45309',
                fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase',
              }}>Stock bas</span>
            )}
          </div>
          <div style={{ fontSize: 12.5, color: t.fgMuted, marginTop: 6 }}>
            Seuil bas : {item.threshold} {item.unit}
          </div>
        </div>

        <div style={{ padding: '18px 20px 0' }}>
          <div style={{
            fontSize: 11, fontWeight: 600, letterSpacing: 1.2, color: t.fgMuted,
            textTransform: 'uppercase', marginBottom: 10,
          }}>Ajuster le stock</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 12 }}>
            {[-1, +1, +5, +10].map((d) => (
              <button key={d} onClick={() => adjust(d)} style={{
                padding: '14px 0', borderRadius: 10,
                background: t.surface, border: `1px solid ${t.border}`,
                color: t.fg, fontFamily: '"JetBrains Mono", monospace',
                fontSize: 16, fontWeight: 600, cursor: 'pointer',
              }}>
                {d > 0 ? `+${d}` : d}
              </button>
            ))}
          </div>
          <input value={note} onChange={(e) => setNote(e.target.value)}
                 placeholder="Note optionnelle (réception, inventaire…)" dir="auto"
                 style={{
                   width: '100%', padding: '11px 14px', boxSizing: 'border-box',
                   border: `1px solid ${t.border}`, borderRadius: 10,
                   background: t.surface, color: t.fg, fontFamily: 'inherit',
                   fontSize: 13.5, outline: 'none',
                 }} />
        </div>

        <div style={{ padding: '24px 20px 0' }}>
          <div style={{
            fontSize: 11, fontWeight: 600, letterSpacing: 1.2, color: t.fgMuted,
            textTransform: 'uppercase', marginBottom: 10,
          }}>Mouvements récents</div>
          {!movements || movements.length === 0 ? (
            <div style={{ fontSize: 13.5, color: t.fgMuted, padding: '8px 4px' }}>
              Aucun mouvement enregistré.
            </div>
          ) : (
            <div style={{ background: t.surface, borderRadius: 12, border: `1px solid ${t.border}`, overflow: 'hidden' }}>
              {movements.map((m, i) => (
                <div key={m.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px',
                  borderBottom: i < movements.length - 1 ? `1px solid ${t.borderSoft}` : 0,
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: m.delta > 0 ? 'rgba(22, 163, 74, 0.12)' : 'rgba(220, 38, 38, 0.10)',
                    color: m.delta > 0 ? '#16a34a' : '#dc2626',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: '"JetBrains Mono", monospace', fontSize: 13, fontWeight: 700, flexShrink: 0,
                  }}>{m.delta > 0 ? `+${m.delta}` : m.delta}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, color: t.fg }} dir="auto">{m.note || 'Ajustement manuel'}</div>
                    <div style={{ fontSize: 12, color: t.fgMuted, marginTop: 2 }}>{m.date}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { StockScreen, StockDetailScreen });
