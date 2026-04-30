// Receipt screen — internal invoice

function ReceiptScreen({ car, onBack }) {
  const t = window.__T;
  const taskTotal = car.tasks.reduce((s, t) => s + (t.price || 0), 0);
  const lineTotal = car.lineItems.reduce((s, l) => s + l.qty * l.unit, 0);
  const grandTotal = taskTotal + lineTotal;
  const billableTasks = car.tasks.filter(t => t.price != null);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, background: t.bg, position: 'relative' }}>
      {/* Header */}
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
        <div style={{ fontSize: 16, fontWeight: 600 }}>Reçu</div>
        <div style={{ width: 44 }} />
      </div>

      {/* Receipt body */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 20px 180px' }}>
        <div style={{
          background: t.surface, borderRadius: 14, padding: 24,
          border: `1px solid ${t.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}>
          {/* Garage header */}
          <div style={{ textAlign: 'center', paddingBottom: 18, borderBottom: `1px solid ${t.borderSoft}` }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1.5, color: t.fgMuted, textTransform: 'uppercase' }}>
              Garage
            </div>
            <div style={{ fontSize: 22, fontWeight: 600, marginTop: 4, letterSpacing: -0.3 }}>
              Atelier El Manar
            </div>
            <div style={{ fontSize: 12, color: t.fgMuted, marginTop: 4 }}>
              Av. de la République, Tunis · +216 71 555 100
            </div>
          </div>

          {/* Meta row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderBottom: `1px solid ${t.borderSoft}` }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, color: t.fgMuted, textTransform: 'uppercase' }}>Date</div>
              <div style={{ fontSize: 13.5, marginTop: 3, fontFamily: '"JetBrains Mono", monospace' }}>14 mars 2026</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, color: t.fgMuted, textTransform: 'uppercase' }}>Visite</div>
              <div style={{ fontSize: 13.5, marginTop: 3, fontFamily: '"JetBrains Mono", monospace' }}>#V-{car.id.slice(-4).toUpperCase()}-26</div>
            </div>
          </div>

          {/* Customer + car */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: '14px 0', borderBottom: `1px solid ${t.borderSoft}` }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, color: t.fgMuted, textTransform: 'uppercase', marginBottom: 6 }}>Client</div>
              <div style={{ fontSize: 14, fontWeight: 500 }} dir="auto">{car.customer.name}</div>
              <div style={{ fontSize: 12.5, color: t.fgMuted, marginTop: 2, fontFamily: '"JetBrains Mono", monospace' }}>{car.customer.phone}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, color: t.fgMuted, textTransform: 'uppercase', marginBottom: 6 }}>Voiture</div>
              <Plate value={car.plate} size="sm" />
              <div style={{ fontSize: 12.5, color: t.fgMuted, marginTop: 6 }}>
                {car.make} {car.model} · {car.color} · {car.year}
              </div>
            </div>
          </div>

          {/* Tasks table */}
          {billableTasks.length > 0 && (
            <div style={{ padding: '16px 0 14px', borderBottom: `1px solid ${t.borderSoft}` }}>
              <div style={{
                fontSize: 11, fontWeight: 600, letterSpacing: 1, color: t.fgMuted,
                textTransform: 'uppercase', marginBottom: 10,
              }}>Tâches</div>
              {billableTasks.map((task) => (
                <div key={task.id} style={{
                  display: 'flex', justifyContent: 'space-between', gap: 16,
                  padding: '6px 0', fontSize: 13.5,
                }}>
                  <span style={{ flex: 1 }} dir="auto">{task.text}</span>
                  <span style={{ fontFamily: '"JetBrains Mono", monospace', whiteSpace: 'nowrap' }}>
                    {task.price} TND
                  </span>
                </div>
              ))}
              <div style={{
                display: 'flex', justifyContent: 'space-between', marginTop: 10, paddingTop: 8,
                borderTop: `1px dashed ${t.borderSoft}`, fontSize: 12.5, color: t.fgMuted,
              }}>
                <span>Sous-total tâches</span>
                <span style={{ fontFamily: '"JetBrains Mono", monospace' }}>{taskTotal} TND</span>
              </div>
            </div>
          )}

          {/* Line items */}
          {car.lineItems.length > 0 && (
            <div style={{ padding: '16px 0 14px', borderBottom: `1px solid ${t.borderSoft}` }}>
              <div style={{
                fontSize: 11, fontWeight: 600, letterSpacing: 1, color: t.fgMuted,
                textTransform: 'uppercase', marginBottom: 10,
              }}>Pièces & fournitures</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 36px 60px 70px', gap: 8, fontSize: 11, color: t.fgMuted, paddingBottom: 6, borderBottom: `1px dashed ${t.borderSoft}` }}>
                <span>Description</span>
                <span style={{ textAlign: 'right' }}>Qté</span>
                <span style={{ textAlign: 'right' }}>PU</span>
                <span style={{ textAlign: 'right' }}>Total</span>
              </div>
              {car.lineItems.map((line) => (
                <div key={line.id} style={{
                  display: 'grid', gridTemplateColumns: '1fr 36px 60px 70px', gap: 8,
                  padding: '7px 0', fontSize: 13, alignItems: 'baseline',
                }}>
                  <span dir="auto" style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{line.desc}</span>
                  <span style={{ textAlign: 'right', fontFamily: '"JetBrains Mono", monospace', color: t.fgMuted }}>{line.qty}</span>
                  <span style={{ textAlign: 'right', fontFamily: '"JetBrains Mono", monospace', color: t.fgMuted }}>{line.unit}</span>
                  <span style={{ textAlign: 'right', fontFamily: '"JetBrains Mono", monospace' }}>{line.qty * line.unit}</span>
                </div>
              ))}
              <div style={{
                display: 'flex', justifyContent: 'space-between', marginTop: 6, paddingTop: 8,
                borderTop: `1px dashed ${t.borderSoft}`, fontSize: 12.5, color: t.fgMuted,
              }}>
                <span>Sous-total pièces</span>
                <span style={{ fontFamily: '"JetBrains Mono", monospace' }}>{lineTotal} TND</span>
              </div>
            </div>
          )}

          {/* Total */}
          <div style={{
            padding: '18px 0 4px', display: 'flex', justifyContent: 'space-between',
            alignItems: 'baseline',
          }}>
            <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: 0.2, textTransform: 'uppercase' }}>Total</span>
            <span style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.5 }}>
              <span style={{ fontFamily: '"JetBrains Mono", monospace' }}>{grandTotal}</span>
              <span style={{ fontSize: 14, color: t.fgMuted, marginLeft: 6, fontWeight: 500 }}>TND</span>
            </span>
          </div>

          {/* Notes */}
          {car.summary && (
            <div style={{ marginTop: 16, padding: 12, background: t.surfaceAlt, borderRadius: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, color: t.fgMuted, textTransform: 'uppercase', marginBottom: 4 }}>Notes</div>
              <div style={{ fontSize: 13, lineHeight: 1.5, color: t.fg }} dir="auto">{car.summary}</div>
            </div>
          )}
        </div>
      </div>

      {/* Sticky actions */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        background: t.bg, borderTop: `1px solid ${t.border}`,
        padding: '14px 20px 16px',
      }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={{
            flex: 1, padding: '13px 16px', borderRadius: 12,
            background: t.surface, border: `1px solid ${t.border}`,
            color: t.fg, fontFamily: 'inherit', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <IconShare size={17} strokeWidth={1.7} /> Partager
          </button>
          <button style={{
            flex: 1.4, padding: '13px 16px', borderRadius: 12,
            background: t.accent, color: t.onAccent, border: 0,
            fontFamily: 'inherit', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <IconDownload size={17} strokeWidth={2} /> Enregistrer en PDF
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ReceiptScreen });
