// Demo data — realistic Tunisian plates, French + Arabic mixed names.
// Plates use the format "123 TUN 4567"; some preserve the Arabic "تونس" form.

const SEED_CARS = [
  {
    id: 'c1',
    plate: '4521 TUN 198',
    rawPlate: '4521 TUN 198',
    make: 'Renault', model: 'Clio', color: 'rouge', year: 2015,
    customer: { name: 'Mohamed Ben Ali', phone: '+216 22 481 902' },
    summary: 'Embrayage qui patine, à remplacer. Le client veut aussi qu\'on vérifie les freins arrière.',
    status: 'en_cours',
    updatedAt: 'il y a 2 jours',
    photos: 3,
    tasks: [
      { id: 't1', text: 'Diagnostic embrayage', done: true, price: 20 },
      { id: 't2', text: 'Remplacement embrayage complet', done: false, price: 220, notes: 'Pièce commandée le 12/03' },
      { id: 't3', text: 'Vérification freins arrière', done: false, price: null },
    ],
    lineItems: [
      { id: 'l1', desc: 'Kit embrayage Valeo', qty: 1, unit: 180 },
      { id: 'l2', desc: 'Huile boîte 75W-80', qty: 2, unit: 25 },
    ],
  },
  {
    id: 'c2',
    plate: '7834 TUN 045',
    rawPlate: '7834 تونس 045',
    make: 'Peugeot', model: '208', color: 'noir', year: 2019,
    customer: { name: 'سامية الخالد', phone: '+216 98 776 210' },
    summary: 'Vidange + filtre à huile + filtre à air. Plaquettes avant à changer.',
    status: 'pret',
    updatedAt: 'hier',
    photos: 2,
    tasks: [
      { id: 't1', text: 'Vidange moteur', done: true, price: 35 },
      { id: 't2', text: 'Filtre à huile', done: true, price: 18 },
      { id: 't3', text: 'Plaquettes avant', done: true, price: 80 },
    ],
    lineItems: [
      { id: 'l1', desc: 'Huile 5W-30 5L', qty: 1, unit: 95 },
      { id: 'l2', desc: 'Plaquettes Brembo', qty: 1, unit: 65 },
    ],
  },
  {
    id: 'c3',
    plate: '1207 TUN 663',
    rawPlate: '1207 TUN 663',
    make: 'Volkswagen', model: 'Golf', color: 'gris', year: 2012,
    customer: { name: 'Karim Bouzid', phone: '+216 55 102 348' },
    summary: 'Bruit suspect au démarrage à froid. À diagnostiquer.',
    status: 'diagnostic',
    updatedAt: 'aujourd\'hui',
    photos: 1,
    tasks: [
      { id: 't1', text: 'Écoute moteur démarrage froid', done: false, price: null },
    ],
    lineItems: [],
  },
  {
    id: 'c4',
    plate: '9012 TUN 887',
    rawPlate: '9012 TUN 887',
    make: 'Hyundai', model: 'i10', color: 'blanc', year: 2021,
    customer: { name: 'Amira Trabelsi', phone: '+216 27 654 091' },
    summary: 'Climatisation ne refroidit plus. Recharge gaz à prévoir.',
    status: 'attente_pieces',
    updatedAt: 'il y a 5 jours',
    photos: 0,
    tasks: [
      { id: 't1', text: 'Diagnostic clim', done: true, price: 30 },
      { id: 't2', text: 'Recharge gaz R134a', done: false, price: 90 },
    ],
    lineItems: [],
  },
  {
    id: 'c5',
    plate: '3344 TUN 211',
    rawPlate: '3344 تونس 211',
    make: 'Citroën', model: 'C3', color: 'bleu', year: 2017,
    customer: { name: 'يوسف الفرشيشي', phone: '+216 50 884 712' },
    summary: 'Boîte de vitesses bruyante en 3ème. Démontage prévu après réception pièces.',
    status: 'attente_pieces',
    updatedAt: 'il y a 1 mois',
    photos: 4,
    tasks: [
      { id: 't1', text: 'Diagnostic boîte', done: true, price: 40 },
      { id: 't2', text: 'Remplacement synchros 3ème', done: false, price: 380 },
    ],
    lineItems: [
      { id: 'l1', desc: 'Synchros boîte', qty: 1, unit: 240 },
    ],
  },
  {
    id: 'c6',
    plate: '6789 TUN 432',
    rawPlate: '6789 TUN 432',
    make: 'Fiat', model: 'Tipo', color: 'beige', year: 2018,
    customer: { name: 'Sami Gharbi', phone: '+216 24 119 567' },
    summary: 'Révision 60 000 km complète.',
    status: null,
    updatedAt: 'il y a 3 jours',
    photos: 0,
    tasks: [
      { id: 't1', text: 'Révision 60k km', done: false, price: 180 },
    ],
    lineItems: [],
  },
];

const STATUS_META = {
  diagnostic:     { label: 'Diagnostic',       dot: '#d97706' },
  en_cours:       { label: 'En cours',         dot: '#0f766e' },
  attente_pieces: { label: 'En attente pièces', dot: '#737373' },
  pret:           { label: 'Prêt',             dot: '#16a34a' },
};

const STATUS_OPTIONS = [
  { value: null, label: 'Aucun' },
  { value: 'diagnostic', label: 'Diagnostic' },
  { value: 'en_cours', label: 'En cours' },
  { value: 'attente_pieces', label: 'En attente pièces' },
  { value: 'pret', label: 'Prêt' },
];

Object.assign(window, { SEED_CARS, STATUS_META, STATUS_OPTIONS });
