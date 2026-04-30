// Clients tab + Customer detail

function ClientsScreen({ customers, cars, onOpenCustomer, onOpenNewCustomer }) {
  const t = window.__T;
  const [search, setSearch] = React.useState('');
  const filtered = customers.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.phone.includes(q);
  });
  // Group alphabetically by first letter (Latin or Arabic)
  const groups = {};
  filtered.forEach((c) => {
    const letter = c.name.charAt(0).toUpperCase();
    (groups[letter] ||= []).push(c);
  });
  const sortedKeys = Object.keys(groups).sort();

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, background: t.bg, position: 'relative' }}>
      <div style={{ padding: '8px 20px 4px' }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1.5, color: t.fgMuted, textTransform: 'uppercase' }}>
          Garage
        </div>
        <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: -0.4, marginTop: 2 }}>
          Clients
        </div>
      </div>

      <div style={{ padding: '12px 20px 14px' }}>
        <SearchField value={search} onChange={setSearch}
                     placeholder="Rechercher nom, téléphone…" />
      </div>

      <div style={{ flex: 1, overflow: 'auto', paddingBottom: 100 }}>
        {sortedKeys.map((letter) => (
          <div key={letter}>
            <div style={{
              padding: '8px 20px 6px', fontSize: 11, fontWeight: 600,
              color: t.fgMuted, letterSpacing: 1, textTransform: 'uppercase',
              background: t.bg,
            }}>{letter}</div>
            {groups[letter].map((cu) => (
              <ClientRow key={cu.id} customer={cu}
                         carCount={cu.carIds.length}
                         onClick={() => onOpenCustomer(cu.id)} />
            ))}
          </div>
        ))}
      </div>

      <button onClick={onOpenNewCustomer} style={{
        position: 'absolute', right: 20, bottom: 24,
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '14px 20px 14px 16px', borderRadius: 18,
        background: t.accent, color: t.onAccent, border: 0, cursor: 'pointer',
        fontFamily: 'inherit', fontSize: 15, fontWeight: 600,
        boxShadow: `0 6px 20px ${t.accentShadow}`,
      }}>
        <IconPlus size={20} strokeWidth={2.4} />
        Nouveau client
      </button>
    </div>
  );
}

function ClientRow({ customer, carCount, onClick }) {
  const t = window.__T;
  const initials = customer.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px',
      borderBottom: `1px solid ${t.borderSoft}`, cursor: 'pointer',
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%', background: t.surfaceAlt,
        color: t.fg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, fontWeight: 600, flexShrink: 0,
      }}>{initials}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 500, color: t.fg }} dir="auto">{customer.name}</div>
        <div style={{ fontSize: 13, color: t.fgMuted, marginTop: 2, fontFamily: '"JetBrains Mono", monospace' }}>
          {customer.phone}
        </div>
      </div>
      <div style={{ fontSize: 12, color: t.fgMuted, marginRight: 4 }}>
        {carCount} {carCount > 1 ? 'voitures' : 'voiture'}
      </div>
      <IconChevronRight size={16} strokeWidth={1.7} style={{ color: t.fgMuted }} />
    </div>
  );
}

function CustomerDetailScreen({ customer, cars, history, onBack, onOpenCar }) {
  const t = window.__T;
  const customerCars = cars.filter(c => customer.carIds.includes(c.id));
  const customerHistory = history.filter(h => h.customerId === customer.id);

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

      <div style={{ flex: 1, overflow: 'auto', paddingBottom: 24 }}>
        <div style={{ padding: '8px 24px 20px', borderBottom: `1px solid ${t.borderSoft}` }}>
          <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: -0.4 }} dir="auto">{customer.name}</div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, cursor: 'pointer',
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', background: t.accentSoft, color: t.accent,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <IconPhone size={14} strokeWidth={2} />
            </div>
            <span style={{ fontSize: 14, fontFamily: '"JetBrains Mono", monospace' }}>{customer.phone}</span>
          </div>
        </div>

        <div style={{ padding: '14px 20px 6px' }}>
          <div style={{
            fontSize: 11, fontWeight: 600, letterSpacing: 1.2, color: t.fgMuted,
            textTransform: 'uppercase', marginBottom: 10,
          }}>Voitures ({customerCars.length})</div>
          <div style={{ background: t.surface, borderRadius: 12, border: `1px solid ${t.border}`, overflow: 'hidden' }}>
            {customerCars.map((car, i) => (
              <div key={car.id} onClick={() => onOpenCar(car.id)} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                borderBottom: i < customerCars.length - 1 ? `1px solid ${t.borderSoft}` : 0,
                cursor: 'pointer',
              }}>
                <CarThumb size={36} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Plate value={car.plate} size="sm" />
                  <div style={{ fontSize: 12.5, color: t.fgMuted, marginTop: 4 }}>
                    {car.make} {car.model} · {car.color}
                  </div>
                </div>
                {car.status && <StatusChip status={car.status} />}
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '14px 20px 6px' }}>
          <div style={{
            fontSize: 11, fontWeight: 600, letterSpacing: 1.2, color: t.fgMuted,
            textTransform: 'uppercase', marginBottom: 10,
          }}>Historique des visites</div>
          {customerHistory.length === 0 ? (
            <div style={{ fontSize: 13.5, color: t.fgMuted, padding: '12px 4px' }}>
              Aucune visite terminée pour ce client.
            </div>
          ) : (
            <div style={{ background: t.surface, borderRadius: 12, border: `1px solid ${t.border}`, overflow: 'hidden' }}>
              {customerHistory.map((h, i) => (
                <div key={h.id} style={{
                  padding: '12px 14px',
                  borderBottom: i < customerHistory.length - 1 ? `1px solid ${t.borderSoft}` : 0,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <Plate value={h.plate} size="sm" />
                    <span style={{ fontSize: 12, color: t.fgMuted }}>{h.date}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 4 }}>
                    <span style={{ fontSize: 13.5, color: t.fg, lineHeight: 1.4, flex: 1 }} dir="auto">{h.summary}</span>
                    <span style={{ fontSize: 13.5, fontFamily: '"JetBrains Mono", monospace', whiteSpace: 'nowrap' }}>{h.total} TND</span>
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

Object.assign(window, { ClientsScreen, CustomerDetailScreen });
