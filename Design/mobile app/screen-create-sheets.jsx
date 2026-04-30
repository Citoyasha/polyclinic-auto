// Small create sheets — new customer, new item

function NewCustomerSheet({ open, onClose, onCreate }) {
  const t = window.__T;
  const [name, setName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  React.useEffect(() => { if (!open) { setName(''); setPhone(''); } }, [open]);

  const submit = () => {
    if (!name.trim() || !phone.trim()) return;
    onCreate({
      id: 'cu' + Date.now(),
      name: name.trim(),
      phone: '+216 ' + phone.trim(),
      carIds: [],
    });
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="Nouveau client" height="auto">
      <div style={{ padding: '12px 24px 24px' }}>
        <Field label="Nom">
          <input value={name} onChange={(e) => setName(e.target.value)}
                 placeholder="Mohamed Ben Ali" dir="auto" autoFocus
                 style={fieldInputStyle(t)} />
        </Field>
        <Field label="Téléphone">
          <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${t.border}`, borderRadius: 10, background: t.surface }}>
            <span style={{ padding: '10px 0 10px 12px', color: t.fgMuted, fontSize: 14.5, fontFamily: '"JetBrains Mono", monospace' }}>+216</span>
            <input value={phone} type="tel" onChange={(e) => setPhone(e.target.value)}
                   placeholder="22 481 902"
                   style={{
                     flex: 1, padding: '10px 12px', border: 0, outline: 'none',
                     background: 'transparent', color: t.fg, fontFamily: 'inherit', fontSize: 14.5,
                   }} />
          </div>
        </Field>
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button onClick={onClose} style={secondaryBtn(t)}>Annuler</button>
          <button onClick={submit} disabled={!name.trim() || !phone.trim()} style={primaryBtn(t, name.trim() && phone.trim())}>Créer</button>
        </div>
      </div>
    </BottomSheet>
  );
}

function NewItemSheet({ open, onClose, onCreate }) {
  const t = window.__T;
  const [name, setName] = React.useState('');
  const [type, setType] = React.useState('part');
  const [stock, setStock] = React.useState('');
  const [threshold, setThreshold] = React.useState('');
  React.useEffect(() => {
    if (!open) { setName(''); setType('part'); setStock(''); setThreshold(''); }
  }, [open]);

  const submit = () => {
    if (!name.trim()) return;
    onCreate({
      id: 's' + Date.now(),
      name: name.trim(), type,
      stock: Number(stock) || 0, threshold: Number(threshold) || 0,
      unit: type === 'fluid' ? 'L' : 'pcs',
    });
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="Nouvel article" height="auto">
      <div style={{ padding: '12px 24px 24px' }}>
        <Field label="Nom">
          <input value={name} onChange={(e) => setName(e.target.value)}
                 placeholder="Filtre à huile" dir="auto" autoFocus
                 style={fieldInputStyle(t)} />
        </Field>
        <Field label="Type">
          <div style={{ display: 'flex', gap: 8 }}>
            {[{ k: 'part', l: 'Pièce' }, { k: 'fluid', l: 'Fluide' }].map(o => (
              <button key={o.k} onClick={() => setType(o.k)} style={{
                flex: 1, padding: '10px 14px', borderRadius: 10,
                border: `1px solid ${type === o.k ? t.fg : t.border}`,
                background: type === o.k ? t.fg : t.surface,
                color: type === o.k ? t.bg : t.fg,
                fontFamily: 'inherit', fontSize: 14, fontWeight: 500, cursor: 'pointer',
              }}>{o.l}</button>
            ))}
          </div>
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="Stock initial">
            <input value={stock} type="number" onChange={(e) => setStock(e.target.value)}
                   placeholder="0" style={fieldInputStyle(t)} />
          </Field>
          <Field label="Seuil bas">
            <input value={threshold} type="number" onChange={(e) => setThreshold(e.target.value)}
                   placeholder="0" style={fieldInputStyle(t)} />
          </Field>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button onClick={onClose} style={secondaryBtn(t)}>Annuler</button>
          <button onClick={submit} disabled={!name.trim()} style={primaryBtn(t, !!name.trim())}>Créer</button>
        </div>
      </div>
    </BottomSheet>
  );
}

function primaryBtn(t, enabled) {
  return {
    flex: 1, padding: '13px 16px', borderRadius: 12,
    background: enabled ? t.accent : t.border,
    color: enabled ? t.onAccent : t.fgMuted, border: 0,
    fontFamily: 'inherit', fontSize: 14.5, fontWeight: 600,
    cursor: enabled ? 'pointer' : 'not-allowed',
  };
}
function secondaryBtn(t) {
  return {
    flex: 1, padding: '13px 16px', borderRadius: 12,
    background: t.surface, border: `1px solid ${t.border}`,
    color: t.fg, fontFamily: 'inherit', fontSize: 14.5, fontWeight: 600, cursor: 'pointer',
  };
}

Object.assign(window, { NewCustomerSheet, NewItemSheet });
