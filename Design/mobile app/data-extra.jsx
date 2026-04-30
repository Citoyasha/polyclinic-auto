// Extra demo data — customers (derived from cars but with extra alphabet coverage),
// stock, recent searches.

const SEED_CUSTOMERS = [
  { id: 'cu1', name: 'Mohamed Ben Ali', phone: '+216 22 481 902', carIds: ['c1'] },
  { id: 'cu2', name: 'سامية الخالد', phone: '+216 98 776 210', carIds: ['c2'] },
  { id: 'cu3', name: 'Karim Bouzid', phone: '+216 55 102 348', carIds: ['c3'] },
  { id: 'cu4', name: 'Amira Trabelsi', phone: '+216 27 654 091', carIds: ['c4'] },
  { id: 'cu5', name: 'يوسف الفرشيشي', phone: '+216 50 884 712', carIds: ['c5', 'c7'] },
  { id: 'cu6', name: 'Sami Gharbi', phone: '+216 24 119 567', carIds: ['c6'] },
  { id: 'cu7', name: 'Nadia Lahmar', phone: '+216 21 308 442', carIds: ['c8'] },
  { id: 'cu8', name: 'Fares Mejri', phone: '+216 99 712 086', carIds: ['c9'] },
  { id: 'cu9', name: 'Olfa Hammouda', phone: '+216 26 475 113', carIds: ['c10'] },
  { id: 'cu10', name: 'حاتم بن صالح', phone: '+216 23 902 558', carIds: ['c11', 'c12'] },
];

const SEED_HISTORY = [
  { id: 'h1', customerId: 'cu1', date: '4 fév 2026', plate: '4521 TUN 198', summary: 'Vidange + freins', total: 145, closed: true },
  { id: 'h2', customerId: 'cu1', date: '12 nov 2025', plate: '4521 TUN 198', summary: 'Diagnostic moteur', total: 60, closed: true },
  { id: 'h3', customerId: 'cu5', date: '2 mars 2026', plate: '8801 TUN 442', summary: 'Démarreur remplacé', total: 320, closed: true },
  { id: 'h4', customerId: 'cu5', date: '17 jan 2026', plate: '3344 TUN 211', summary: 'Vidange complète', total: 110, closed: true },
];

const SEED_STOCK = [
  { id: 's1', name: 'Huile moteur 5W-30', type: 'fluid', stock: 12, threshold: 5, unit: 'L' },
  { id: 's2', name: 'Filtre à huile universel', type: 'part', stock: 3, threshold: 5, unit: 'pcs' },
  { id: 's3', name: 'Plaquettes Brembo avant', type: 'part', stock: 8, threshold: 4, unit: 'jeux' },
  { id: 's4', name: 'Liquide de frein DOT4', type: 'fluid', stock: 6, threshold: 3, unit: 'L' },
  { id: 's5', name: 'Bougies NGK Iridium', type: 'part', stock: 24, threshold: 8, unit: 'pcs' },
  { id: 's6', name: 'Liquide refroidissement', type: 'fluid', stock: 2, threshold: 4, unit: 'L' },
  { id: 's7', name: 'Filtre à air Mann', type: 'part', stock: 14, threshold: 6, unit: 'pcs' },
  { id: 's8', name: 'Courroie distribution', type: 'part', stock: 5, threshold: 3, unit: 'pcs' },
  { id: 's9', name: 'Huile boîte 75W-80', type: 'fluid', stock: 4, threshold: 2, unit: 'L' },
];

const SEED_MOVEMENTS = {
  s1: [
    { id: 'm1', date: '12 mars 2026', delta: -2, note: 'Visite Renault Clio' },
    { id: 'm2', date: '8 mars 2026', delta: +20, note: 'Réception fournisseur' },
    { id: 'm3', date: '3 mars 2026', delta: -1, note: 'Vidange Peugeot 208' },
    { id: 'm4', date: '28 fév 2026', delta: -5, note: 'Inventaire physique' },
  ],
  s2: [
    { id: 'm5', date: '12 mars 2026', delta: -1, note: '' },
    { id: 'm6', date: '5 mars 2026', delta: -1, note: '' },
    { id: 'm7', date: '14 fév 2026', delta: +10, note: 'Réception fournisseur' },
  ],
  s6: [
    { id: 'm8', date: '10 mars 2026', delta: -2, note: 'Hyundai i10' },
  ],
};

const SEED_RECENT_SEARCHES = ['Mohamed', '4521', '+216 27', 'Renault'];

Object.assign(window, { SEED_CUSTOMERS, SEED_HISTORY, SEED_STOCK, SEED_MOVEMENTS, SEED_RECENT_SEARCHES });
