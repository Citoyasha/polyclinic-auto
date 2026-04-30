// Home screen — Voitures (cars currently in shop)

function HomeScreen({ cars, onOpenCar, onOpenNewVisit, onOpenSettings, filter, setFilter, search, setSearch }) {
  const t = window.__T;
  const filterChips = [
    { id: 'tous', label: 'Tous' },
    { id: 'diagnostic', label: 'Diagnostic' },
    { id: 'en_cours', label: 'En cours' },
    { id: 'attente_pieces', label: 'Pièces' },
    { id: 'pret', label: 'Prêt' },
  ];

  const filtered = cars.filter((c) => {
    if (filter !== 'tous' && c.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        c.plate.toLowerCase().includes(q) ||
        c.customer.name.toLowerCase().includes(q) ||
        c.customer.phone.includes(q) ||
        `${c.make} ${c.model}`.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0,
      background: t.bg, position: 'relative',
    }}>
      {/* App bar */}
      <div style={{
        padding: '8px 20px 4px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1.5, color: t.fgMuted, textTransform: 'uppercase' }}>
            Garage
          </div>
          <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: -0.4, marginTop: 2 }}>
            Voitures
          </div>
        </div>
        <div onClick={onOpenSettings} style={{
          width: 38, height: 38, borderRadius: '50%',
          background: t.surfaceAlt, color: t.fg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 600, cursor: 'pointer',
        }}>OB</div>
      </div>

      {/* Search */}
      <div style={{ padding: '12px 20px 0' }}>
        <SearchField value={search} onChange={setSearch}
                     placeholder="Rechercher plaque, client, téléphone…" />
      </div>

      {/* Filter chips */}
      <div style={{
        display: 'flex', gap: 8, padding: '14px 20px 12px',
        overflowX: 'auto', scrollbarWidth: 'none',
      }}>
        {filterChips.map((c) => {
          const active = filter === c.id;
          return (
            <button key={c.id} onClick={() => setFilter(c.id)} style={{
              flexShrink: 0, padding: '7px 14px', borderRadius: 999,
              fontFamily: 'inherit', fontSize: 13, fontWeight: active ? 600 : 500,
              border: `1px solid ${active ? t.accent : t.border}`,
              background: active ? t.accent : t.surface,
              color: active ? t.onAccent : t.fg,
              boxShadow: active ? `0 2px 8px -2px ${t.accentShadow}` : 'none',
              cursor: 'pointer', transition: 'all 0.15s',
            }}>{c.label}</button>
          );
        })}
      </div>

      {/* Car list */}
      <div style={{ flex: 1, overflow: 'auto', paddingBottom: 100 }}>
        {filtered.length === 0 ? (
          <EmptyState />
        ) : filtered.map((car) => (
          <CarRow key={car.id} car={car} onClick={() => onOpenCar(car.id)} />
        ))}
      </div>

      {/* Extended FAB */}
      <button onClick={onOpenNewVisit} style={{
        position: 'absolute', right: 20, bottom: 24,
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '14px 20px 14px 16px', borderRadius: 18,
        background: t.accent, color: t.onAccent,
        border: 0, cursor: 'pointer',
        fontFamily: 'inherit', fontSize: 15, fontWeight: 600,
        boxShadow: `0 6px 20px ${t.accentShadow}`,
        zIndex: 10,
      }}>
        <IconPlus size={20} strokeWidth={2.4} />
        Nouvelle visite
      </button>
    </div>
  );
}

function CarRow({ car, onClick }) {
  const t = window.__T;
  return (
    <div onClick={onClick} style={{
      display: 'flex', gap: 14, padding: '14px 20px',
      borderBottom: `1px solid ${t.borderSoft}`,
      cursor: 'pointer', alignItems: 'flex-start',
    }}>
      <CarThumb size={52} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <Plate value={car.plate} size="md" />
          <span style={{ fontSize: 12, color: t.fgMuted, whiteSpace: 'nowrap' }}>
            {car.updatedAt}
          </span>
        </div>
        <div style={{ fontSize: 13.5, color: t.fgMuted, marginTop: 6, lineHeight: 1.4 }} dir="auto">
          {car.make} {car.model} {car.color} · {car.customer.name}
        </div>
        <div style={{
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          gap: 10, marginTop: 6,
        }}>
          <div style={{
            fontSize: 14, color: t.fg, lineHeight: 1.4,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            overflow: 'hidden', textOverflow: 'ellipsis', flex: 1,
          }} dir="auto">
            {car.summary}
          </div>
          {car.status && <StatusChip status={car.status} />}
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  const t = window.__T;
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: 40, textAlign: 'center',
      marginTop: 60, color: t.fgMuted,
    }}>
      <div style={{ marginBottom: 16 }}>
        <CarThumb size={72} />
      </div>
      <div style={{ fontSize: 15, color: t.fg, fontWeight: 500, marginBottom: 6 }}>
        Aucune voiture
      </div>
      <div style={{ fontSize: 13.5, lineHeight: 1.5, maxWidth: 240 }}>
        Touchez + pour démarrer une nouvelle visite.
      </div>
    </div>
  );
}

Object.assign(window, { HomeScreen });
