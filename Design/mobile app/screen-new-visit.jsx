// New visit bottom sheet — progressive disclosure form

function NewVisitSheet({ open, onClose, onCreate, onShowToast }) {
  const t = window.__T;
  const [plate, setPlate] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [name, setName] = React.useState('');
  const [make, setMake] = React.useState('');
  const [model, setModel] = React.useState('');
  const [color, setColor] = React.useState('');
  const [year, setYear] = React.useState('');
  const [summary, setSummary] = React.useState('');
  const [plateBlurred, setPlateBlurred] = React.useState(false);
  const [phoneBlurred, setPhoneBlurred] = React.useState(false);

  const reset = () => {
    setPlate(''); setPhone(''); setName(''); setMake(''); setModel('');
    setColor(''); setYear(''); setSummary('');
    setPlateBlurred(false); setPhoneBlurred(false);
  };

  React.useEffect(() => { if (!open) reset(); }, [open]);

  const knownCar = plateBlurred && plate && SEED_CARS.find(c =>
    c.plate.replace(/\s/g, '').toLowerCase() === plate.replace(/\s/g, '').toLowerCase()
  );
  const knownCustomer = phoneBlurred && phone && SEED_CARS.find(c =>
    c.customer.phone.replace(/\D/g, '').endsWith(phone.replace(/\D/g, '').slice(-8))
  );

  const showPhone = plateBlurred && plate && !knownCar;
  const showName = phoneBlurred && phone && !knownCustomer && !knownCar;
  const showVehicleFields = (knownCustomer || (phoneBlurred && phone && name)) && !knownCar;
  const showSummary = knownCar || showVehicleFields || (knownCustomer);

  const canSubmit = plate.trim() && summary.trim();

  const submit = () => {
    if (!canSubmit) return;
    const newCar = {
      id: 'c' + Date.now(),
      plate: plate.toUpperCase(),
      rawPlate: plate.toUpperCase(),
      make: knownCar ? knownCar.make : (make || '—'),
      model: knownCar ? knownCar.model : (model || ''),
      color: knownCar ? knownCar.color : (color || ''),
      year: knownCar ? knownCar.year : (Number(year) || ''),
      customer: knownCar ? knownCar.customer
                : knownCustomer ? knownCustomer.customer
                : { name, phone: '+216 ' + phone },
      summary,
      status: 'diagnostic',
      updatedAt: 'à l\'instant',
      photos: 0,
      tasks: [],
      lineItems: [],
    };
    onCreate(newCar);
    onShowToast('Visite créée');
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="Nouvelle visite" height="92%">
      <div style={{ padding: '20px 24px 24px' }}>
        <Field label="Plaque">
          <input value={plate}
                 onChange={(e) => { setPlate(e.target.value); setPlateBlurred(false); }}
                 onBlur={() => setPlateBlurred(true)}
                 placeholder="123 TUN 4567"
                 style={{
                   ...fieldInputStyle(t),
                   fontFamily: '"JetBrains Mono", monospace',
                   fontSize: 20, fontWeight: 600, letterSpacing: 1,
                   padding: '12px 14px',
                 }}
                 autoFocus />
          {knownCar && <KnownBanner type="car" data={knownCar} />}
        </Field>

        {showPhone && (
          <Field label="Téléphone client">
            <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${t.border}`, borderRadius: 10, background: t.surface }}>
              <span style={{ padding: '10px 0 10px 12px', color: t.fgMuted, fontSize: 14.5, fontFamily: '"JetBrains Mono", monospace' }}>+216</span>
              <input value={phone} type="tel"
                     onChange={(e) => { setPhone(e.target.value); setPhoneBlurred(false); }}
                     onBlur={() => setPhoneBlurred(true)}
                     placeholder="22 481 902"
                     style={{
                       flex: 1, padding: '10px 12px', border: 0, outline: 'none',
                       background: 'transparent', color: t.fg, fontFamily: 'inherit', fontSize: 14.5,
                     }} />
            </div>
            {knownCustomer && <KnownBanner type="customer" data={knownCustomer} />}
          </Field>
        )}

        {showName && (
          <Field label="Nom du client">
            <input value={name} onChange={(e) => setName(e.target.value)}
                   placeholder="Mohamed Ben Ali" dir="auto"
                   style={fieldInputStyle(t)} />
          </Field>
        )}

        {showVehicleFields && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            <Field label="Marque"><input value={make} onChange={(e) => setMake(e.target.value)} style={fieldInputStyle(t)} /></Field>
            <Field label="Modèle"><input value={model} onChange={(e) => setModel(e.target.value)} style={fieldInputStyle(t)} /></Field>
            <Field label="Couleur"><input value={color} onChange={(e) => setColor(e.target.value)} style={fieldInputStyle(t)} /></Field>
            <Field label="Année"><input value={year} type="number" onChange={(e) => setYear(e.target.value)} style={fieldInputStyle(t)} /></Field>
          </div>
        )}

        {showSummary && (
          <Field label="Résumé">
            <textarea value={summary} onChange={(e) => setSummary(e.target.value)}
                      placeholder="Que faut-il faire ?" dir="auto"
                      style={{ ...fieldInputStyle(t), minHeight: 90, resize: 'none', lineHeight: 1.5 }} />
          </Field>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '13px 16px', borderRadius: 12,
            background: t.surface, border: `1px solid ${t.border}`,
            color: t.fg, fontFamily: 'inherit', fontSize: 14.5, fontWeight: 600, cursor: 'pointer',
          }}>Annuler</button>
          <button onClick={submit} disabled={!canSubmit} style={{
            flex: 1, padding: '13px 16px', borderRadius: 12,
            background: canSubmit ? t.accent : t.border,
            color: canSubmit ? t.onAccent : t.fgMuted, border: 0,
            fontFamily: 'inherit', fontSize: 14.5, fontWeight: 600,
            cursor: canSubmit ? 'pointer' : 'not-allowed',
          }}>Créer la visite</button>
        </div>
      </div>
    </BottomSheet>
  );
}

function KnownBanner({ type, data }) {
  const t = window.__T;
  return (
    <div style={{
      marginTop: 8, padding: '10px 12px', borderRadius: 10,
      background: t.accentSoft, color: t.accent,
      fontSize: 13, lineHeight: 1.4, display: 'flex', alignItems: 'center', gap: 8,
    }}>
      <IconCheck size={16} strokeWidth={2.2} />
      <span style={{ color: t.fg }} dir="auto">
        {type === 'car'
          ? <><b>Voiture connue :</b> {data.make} {data.model} {data.color} · {data.customer.name}</>
          : <><b>Client connu :</b> {data.customer.name}</>}
      </span>
    </div>
  );
}

Object.assign(window, { NewVisitSheet });
