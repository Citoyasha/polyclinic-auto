// Search overlay

function SearchScreen({ cars, customers, onClose, onOpenCar, onOpenCustomer }) {
  const t = window.__T;
  const [query, setQuery] = React.useState('');
  const inputRef = React.useRef(null);
  React.useEffect(() => { inputRef.current?.focus(); }, []);

  const q = query.toLowerCase();
  const carResults = !query ? [] : cars.filter(c =>
    c.plate.toLowerCase().includes(q) ||
    c.customer.name.toLowerCase().includes(q) ||
    c.customer.phone.includes(q) ||
    `${c.make} ${c.model}`.toLowerCase().includes(q)
  ).slice(0, 10);
  const customerResults = !query ? [] : customers.filter(c =>
    c.name.toLowerCase().includes(q) || c.phone.includes(q)
  ).slice(0, 10);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, background: t.bg }}>
      <div style={{ padding: '8px 12px 8px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: `1px solid ${t.borderSoft}` }}>
        <button onClick={onClose} style={{
          width: 40, height: 40, border: 0, background: 'transparent', color: t.fg,
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>
          <IconArrowLeft size={22} />
        </button>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', background: t.surfaceAlt, borderRadius: 12 }}>
          <IconSearch size={18} strokeWidth={1.7} style={{ color: t.fgMuted }} />
          <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)}
                 placeholder="Plaque, client, téléphone…"
                 style={{
                   flex: 1, border: 0, background: 'transparent', outline: 'none',
                   fontFamily: 'inherit', fontSize: 14.5, color: t.fg,
                 }} />
          {query && (
            <button onClick={() => setQuery('')} style={{
              background: 'transparent', border: 0, color: t.fgMuted, cursor: 'pointer', padding: 2,
            }}>
              <IconX size={16} />
            </button>
          )}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        {!query && (
          <div style={{ padding: '14px 20px' }}>
            <div style={{
              fontSize: 11, fontWeight: 600, letterSpacing: 1.2, color: t.fgMuted,
              textTransform: 'uppercase', marginBottom: 10,
            }}>Recherches récentes</div>
            {SEED_RECENT_SEARCHES.map((s, i) => (
              <div key={i} onClick={() => setQuery(s)} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0',
                borderBottom: i < SEED_RECENT_SEARCHES.length - 1 ? `1px solid ${t.borderSoft}` : 0,
                cursor: 'pointer',
              }}>
                <IconSearch size={16} strokeWidth={1.6} style={{ color: t.fgMuted }} />
                <span style={{ fontSize: 14.5, color: t.fg, flex: 1 }} dir="auto">{s}</span>
                <IconChevronRight size={14} style={{ color: t.fgMuted }} />
              </div>
            ))}
          </div>
        )}

        {query && carResults.length === 0 && customerResults.length === 0 && (
          <div style={{ padding: '60px 30px', textAlign: 'center', color: t.fgMuted, fontSize: 14 }}>
            Aucun résultat pour « {query} »
          </div>
        )}

        {carResults.length > 0 && (
          <ResultGroup label="Voitures">
            {carResults.map((c) => (
              <div key={c.id} onClick={() => onOpenCar(c.id)} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px',
                borderBottom: `1px solid ${t.borderSoft}`, cursor: 'pointer',
              }}>
                <CarThumb size={36} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Plate value={c.plate} size="sm" />
                  <div style={{ fontSize: 12.5, color: t.fgMuted, marginTop: 4 }} dir="auto">
                    {c.make} {c.model} · {c.customer.name}
                  </div>
                </div>
              </div>
            ))}
          </ResultGroup>
        )}

        {customerResults.length > 0 && (
          <ResultGroup label="Clients">
            {customerResults.map((cu) => (
              <div key={cu.id} onClick={() => onOpenCustomer(cu.id)} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px',
                borderBottom: `1px solid ${t.borderSoft}`, cursor: 'pointer',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', background: t.surfaceAlt,
                  color: t.fg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 600, flexShrink: 0,
                }}>{cu.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, color: t.fg, fontWeight: 500 }} dir="auto">{cu.name}</div>
                  <div style={{ fontSize: 12.5, color: t.fgMuted, marginTop: 2, fontFamily: '"JetBrains Mono", monospace' }}>
                    {cu.phone}
                  </div>
                </div>
              </div>
            ))}
          </ResultGroup>
        )}
      </div>
    </div>
  );
}

function ResultGroup({ label, children }) {
  const t = window.__T;
  return (
    <>
      <div style={{
        padding: '14px 20px 6px', fontSize: 11, fontWeight: 600,
        color: t.fgMuted, letterSpacing: 1.2, textTransform: 'uppercase',
      }}>{label}</div>
      {children}
    </>
  );
}

Object.assign(window, { SearchScreen });
