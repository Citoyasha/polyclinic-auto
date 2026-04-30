// App root — routing, theme, tweaks

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "dark": false,
  "accent": "blue"
}/*EDITMODE-END*/;

const ACCENTS = {
  blue:   { light: '#1d4ed8', dark: '#60a5fa', soft: '#dbeafe', softDark: 'rgba(96, 165, 250, 0.14)', shadow: 'rgba(29, 78, 216, 0.35)',
            deep: '#0b2a6b', deepDark: '#1e3a8a',
            gold: '#f4b400', goldDark: '#fbbf24' },
  teal:   { light: '#0f766e', dark: '#2dd4bf', soft: '#ccfbf1', softDark: 'rgba(45, 212, 191, 0.14)', shadow: 'rgba(15, 118, 110, 0.35)',
            deep: '#134e4a', deepDark: '#115e59', gold: '#f4b400', goldDark: '#fbbf24' },
  slate:  { light: '#1e293b', dark: '#cbd5e1', soft: '#e2e8f0', softDark: 'rgba(203, 213, 225, 0.14)', shadow: 'rgba(30, 41, 59, 0.35)',
            deep: '#0f172a', deepDark: '#1e293b', gold: '#f4b400', goldDark: '#fbbf24' },
  ocean:  { light: '#0369a1', dark: '#38bdf8', soft: '#e0f2fe', softDark: 'rgba(56, 189, 248, 0.14)', shadow: 'rgba(3, 105, 161, 0.35)',
            deep: '#0c4a6e', deepDark: '#075985', gold: '#f4b400', goldDark: '#fbbf24' },
};

function buildTheme(dark, accentKey) {
  const a = ACCENTS[accentKey] || ACCENTS.blue;
  if (dark) {
    return {
      bg: '#0e1210', surface: '#171a18', surfaceAlt: '#1f2422',
      fg: '#e9ecea', fgMuted: '#8a9290',
      border: 'rgba(255,255,255,0.10)', borderSoft: 'rgba(255,255,255,0.06)',
      accent: a.dark, accentSoft: a.softDark, accentShadow: a.shadow,
      accentDeep: a.deepDark, gold: a.goldDark,
      onAccent: '#0e1210',
      plateBg: '#1f2422', plateBorder: 'rgba(255,255,255,0.10)',
      thumbBg: '#1f2422', bezel: '#0a0c0b', shadow: 'rgba(0,0,0,0.5)',
      toastBg: '#e9ecea', toastFg: '#0e1210',
    };
  }
  return {
    bg: '#fafaf8', surface: '#ffffff', surfaceAlt: '#f1f1ee',
    fg: '#1a1d1c', fgMuted: '#6b716f',
    border: 'rgba(0,0,0,0.10)', borderSoft: 'rgba(0,0,0,0.06)',
    accent: a.light, accentSoft: a.soft, accentShadow: a.shadow,
    accentDeep: a.deep, gold: a.gold,
    onAccent: '#ffffff',
    plateBg: '#f1f1ee', plateBorder: 'rgba(0,0,0,0.08)',
    thumbBg: '#eeeeea', bezel: '#1a1a1a', shadow: 'rgba(0,0,0,0.18)',
    toastBg: '#1a1d1c', toastFg: '#fafaf8',
  };
}

function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const theme = React.useMemo(() => buildTheme(tweaks.dark, tweaks.accent), [tweaks.dark, tweaks.accent]);
  window.__T = theme;

  const [cars, setCars] = React.useState(SEED_CARS);
  const [customers, setCustomers] = React.useState(SEED_CUSTOMERS);
  const [stock, setStock] = React.useState(SEED_STOCK);
  const [movements, setMovements] = React.useState(SEED_MOVEMENTS);
  const [authed, setAuthed] = React.useState(true);
  const [route, setRoute] = React.useState({ name: 'home' });
  const [tab, setTab] = React.useState('voitures');
  const [filter, setFilter] = React.useState('tous');
  const [search, setSearch] = React.useState('');
  const [newVisitOpen, setNewVisitOpen] = React.useState(false);
  const [newCustomerOpen, setNewCustomerOpen] = React.useState(false);
  const [newItemOpen, setNewItemOpen] = React.useState(false);
  const [toast, setToast] = React.useState({ message: '', visible: false });

  const showToast = React.useCallback((message) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 1800);
    setTimeout(() => setToast({ message: '', visible: false }), 2100);
  }, []);

  const updateCar = (updated) => setCars(cs => cs.map(c => c.id === updated.id ? updated : c));

  const adjustStock = (id, delta, note) => {
    setStock(s => s.map(it => it.id === id ? { ...it, stock: Math.max(0, it.stock + delta) } : it));
    setMovements(m => ({
      ...m,
      [id]: [
        { id: 'm' + Date.now(), date: 'aujourd\'hui', delta, note },
        ...(m[id] || []),
      ],
    }));
    showToast(delta > 0 ? `+${delta} ajouté` : `${delta} retiré`);
  };

  // Tab → route mapping
  const goToTab = (newTab) => {
    setTab(newTab);
    if (newTab === 'voitures') setRoute({ name: 'home' });
    else if (newTab === 'clients') setRoute({ name: 'clients' });
    else if (newTab === 'stock') setRoute({ name: 'stock' });
    else if (newTab === 'recherche') setRoute({ name: 'search' });
  };

  const currentCar = (route.name === 'car' || route.name === 'receipt')
    ? cars.find(c => c.id === route.id) : null;
  const currentCustomer = route.name === 'customer'
    ? customers.find(c => c.id === route.id) : null;
  const currentItem = route.name === 'stockItem'
    ? stock.find(s => s.id === route.id) : null;

  const showBottomNav = ['home', 'clients', 'stock'].includes(route.name);

  if (!authed) {
    return (
      <>
        <GlobalStyles />
        <Phone>
          <LoginScreen onLogin={() => setAuthed(true)} />
        </Phone>
        <ThemeTweaks tweaks={tweaks} setTweak={setTweak} />
      </>
    );
  }

  return (
    <>
      <GlobalStyles />
      <Phone>
        {route.name === 'home' && (
          <HomeScreen cars={cars}
            onOpenCar={(id) => setRoute({ name: 'car', id })}
            onOpenNewVisit={() => setNewVisitOpen(true)}
            onOpenSettings={() => setRoute({ name: 'settings' })}
            filter={filter} setFilter={setFilter}
            search={search} setSearch={setSearch} />
        )}

        {route.name === 'car' && currentCar && (
          <CarDetailScreen car={currentCar}
            onBack={() => setRoute({ name: 'home' })}
            onUpdateCar={updateCar}
            onCloseVisit={() => {
              setCars(cs => cs.filter(c => c.id !== currentCar.id));
              setRoute({ name: 'home' });
              showToast('Visite terminée');
            }}
            onOpenReceipt={() => setRoute({ name: 'receipt', id: currentCar.id })}
            onShowToast={showToast} />
        )}

        {route.name === 'receipt' && currentCar && (
          <ReceiptScreen car={currentCar}
            onBack={() => setRoute({ name: 'car', id: currentCar.id })} />
        )}

        {route.name === 'clients' && (
          <ClientsScreen customers={customers} cars={cars}
            onOpenCustomer={(id) => setRoute({ name: 'customer', id })}
            onOpenNewCustomer={() => setNewCustomerOpen(true)} />
        )}

        {route.name === 'customer' && currentCustomer && (
          <CustomerDetailScreen customer={currentCustomer} cars={cars}
            history={SEED_HISTORY}
            onBack={() => setRoute({ name: 'clients' })}
            onOpenCar={(id) => setRoute({ name: 'car', id })} />
        )}

        {route.name === 'stock' && (
          <StockScreen items={stock}
            onOpenItem={(id) => setRoute({ name: 'stockItem', id })}
            onOpenNewItem={() => setNewItemOpen(true)} />
        )}

        {route.name === 'stockItem' && currentItem && (
          <StockDetailScreen item={currentItem}
            movements={movements[currentItem.id] || []}
            onBack={() => setRoute({ name: 'stock' })}
            onAdjust={adjustStock} />
        )}

        {route.name === 'search' && (
          <SearchScreen cars={cars} customers={customers}
            onClose={() => { setTab('voitures'); setRoute({ name: 'home' }); }}
            onOpenCar={(id) => setRoute({ name: 'car', id })}
            onOpenCustomer={(id) => setRoute({ name: 'customer', id })} />
        )}

        {route.name === 'settings' && (
          <SettingsScreen onBack={() => setRoute({ name: 'home' })}
            onLogout={() => { setAuthed(false); setRoute({ name: 'home' }); }} />
        )}

        {showBottomNav && <BottomTabs tab={tab} onTab={goToTab} />}

        <NewVisitSheet open={newVisitOpen} onClose={() => setNewVisitOpen(false)}
          onCreate={(c) => setCars(cs => [c, ...cs])} onShowToast={showToast} />
        <NewCustomerSheet open={newCustomerOpen} onClose={() => setNewCustomerOpen(false)}
          onCreate={(c) => { setCustomers(cs => [...cs, c]); showToast('Client ajouté'); }} />
        <NewItemSheet open={newItemOpen} onClose={() => setNewItemOpen(false)}
          onCreate={(it) => { setStock(s => [...s, it]); showToast('Article ajouté'); }} />

        <Toast message={toast.message} visible={toast.visible} />
      </Phone>

      <ThemeTweaks tweaks={tweaks} setTweak={setTweak} />
    </>
  );
}

function GlobalStyles() {
  return (
    <style>{`
      @keyframes sheet-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
      @keyframes sheet-fade { from { opacity: 0; } to { opacity: 1; } }
      body { margin: 0; background: #2a2a2a; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; box-sizing: border-box; font-family: 'Inter', system-ui, sans-serif; }
      * { -webkit-tap-highlight-color: transparent; }
      button:focus { outline: none; }
      ::-webkit-scrollbar { display: none; }
    `}</style>
  );
}

function ThemeTweaks({ tweaks, setTweak }) {
  return (
    <TweaksPanel>
      <TweakSection label="Thème" />
      <TweakToggle label="Mode sombre" value={tweaks.dark}
                   onChange={(v) => setTweak('dark', v)} />
      <TweakSelect label="Accent" value={tweaks.accent}
                   options={[
                     { value: 'blue', label: 'Bleu' },
                     { value: 'teal', label: 'Teal' },
                     { value: 'slate', label: 'Ardoise' },
                     { value: 'ocean', label: 'Océan' },
                   ]}
                   onChange={(v) => setTweak('accent', v)} />
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
