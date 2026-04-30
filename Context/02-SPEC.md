# Garage ERP — Technical Specification

This document is the implementation brief. It assumes the reader is starting from zero and accompanies `01-DESIGN.md`. Read both before writing code.

Fetch this design file: https://api.anthropic.com/v1/design/h/olYP9bwJyu6mQIw3r4gtCQ?open_file=Garage+ERP.html


## 1. Tech Stack (locked)

- **Frontend framework:** React 18 with Vite.
- **Language:** TypeScript (strict mode).
- **Styling:** Tailwind CSS.
- **Component library:** shadcn/ui (Radix-based, copy-paste components into the repo).
- **Icons:** lucide-react.
- **Routing:** react-router-dom v6.
- **State:** React Query (TanStack Query) for Firestore reads + local React state for UI. No Redux.
- **Forms:** react-hook-form with zod for validation.
- **Backend:** Firebase
  - Authentication (email/password)
  - Firestore (data)
  - Storage (photos and PDFs)
- **Search:** Fuse.js (client-side fuzzy search).
- **Phone parsing:** libphonenumber-js.
- **Date utils:** date-fns with French locale.
- **PDF generation:** pdfmake.
- **Image compression:** browser-image-compression.
- **Hosting:** Netlify (static SPA hosting, free tier).
- **PWA:** vite-plugin-pwa for service worker + manifest.

## 2. Project Structure

```
garage-erp/
├── public/
│   ├── icons/               # PWA icons (192, 512)
│   └── favicon.ico
├── src/
│   ├── main.tsx             # Entry point
│   ├── App.tsx              # Router + auth gate
│   ├── index.css            # Tailwind directives + global styles
│   ├── lib/
│   │   ├── firebase.ts      # Firebase init (reads from env)
│   │   ├── normalize.ts     # Phone & plate normalization
│   │   ├── format.ts        # Currency, date formatting (French)
│   │   ├── pdf.ts           # pdfmake config + receipt template
│   │   └── search.ts        # Fuse.js setup
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useCars.ts       # Active visits list
│   │   ├── useCar.ts        # Single car + visits
│   │   ├── useCustomer.ts
│   │   ├── useInventory.ts
│   │   └── usePhotoUpload.ts
│   ├── components/
│   │   ├── ui/              # shadcn/ui generated components
│   │   ├── CarRow.tsx
│   │   ├── TaskList.tsx
│   │   ├── LineItemList.tsx
│   │   ├── PhotoGrid.tsx
│   │   ├── StatusChip.tsx
│   │   ├── BottomSheet.tsx
│   │   └── ...
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Home.tsx
│   │   ├── CarDetail.tsx
│   │   ├── NewVisit.tsx
│   │   ├── Customer.tsx
│   │   ├── Customers.tsx
│   │   ├── Stock.tsx
│   │   ├── StockItem.tsx
│   │   ├── Receipt.tsx
│   │   ├── Search.tsx
│   │   └── Settings.tsx
│   └── types/
│       └── index.ts         # Shared TypeScript types
├── firestore.rules          # Security rules
├── firebase.json            # Firebase project config
├── .env.local               # Firebase credentials (gitignored)
├── .env.example             # Template
├── netlify.toml             # Netlify build config
├── tailwind.config.js
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## 3. Environment Variables

`.env.example`:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

In Netlify, set these in Site Settings → Environment Variables. They are safe to expose client-side (Firebase API keys are not secrets — security is enforced by Firestore rules).

## 4. Data Model (Firestore)

All collections at the root. No multi-tenancy.

### 4.1 `customers/{phoneE164}`

Document ID is the canonical phone number (e.g., `+21698123456`).

```typescript
{
  phone: string;           // canonical, same as doc ID
  rawPhone: string;        // as the user typed it
  name: string;            // free-form, may contain Arabic
  notes?: string;
  carIds: string[];        // denormalized list of plate IDs (canonical)
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 4.2 `cars/{normalizedPlate}`

Document ID is the canonical plate (e.g., `123TUN4567`).

```typescript
{
  plate: string;           // canonical, same as doc ID
  rawPlate: string;        // as the user typed it
  make?: string;
  model?: string;
  color?: string;
  year?: number;
  customerId: string;      // phone (canonical)
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 4.3 `visits/{visitId}` (auto ID)

```typescript
{
  carId: string;           // plate (canonical)
  customerId: string;      // phone (canonical)
  status?: 'diagnostic' | 'en_cours' | 'en_attente_pieces' | 'pret' | null;
  summary: string;         // manual free-text
  isClosed: boolean;
  arrivedAt: Timestamp;
  closedAt?: Timestamp | null;
  updatedAt: Timestamp;    // for sorting on home
  // Denormalized for the home list (avoid extra reads):
  carSnapshot: {
    plate: string;
    rawPlate: string;
    make?: string;
    model?: string;
    color?: string;
  };
  customerSnapshot: {
    name: string;
    phone: string;
  };
  // Computed totals (updated by client on every line/task change):
  total: number;
}
```

### 4.4 `visits/{visitId}/tasks/{taskId}` (subcollection)

```typescript
{
  description: string;
  notes?: string;
  isDone: boolean;
  price: number;           // 0 if not priced
  createdAt: Timestamp;
  order: number;           // for stable list ordering
}
```

### 4.5 `visits/{visitId}/lineItems/{lineItemId}` (subcollection)

```typescript
{
  description: string;     // free text
  quantity: number;
  unitPrice: number;
  total: number;           // quantity * unitPrice, computed client-side
  createdAt: Timestamp;
  order: number;
}
```

### 4.6 `visits/{visitId}/photos/{photoId}` (subcollection)

```typescript
{
  storagePath: string;     // e.g. visits/abc123/photo_xyz.jpg
  tag: 'avant' | 'apres';
  uploadedAt: Timestamp;
  width: number;
  height: number;
  sizeBytes: number;
}
```

The actual image file is in Firebase Storage at `storagePath`.

### 4.7 `inventory/{itemId}` (auto ID)

```typescript
{
  name: string;
  type: 'piece' | 'fluide';
  currentStock: number;
  lowStockThreshold: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 4.8 `inventoryMovements/{movementId}` (auto ID)

Audit log. Never mutate `currentStock` directly without writing a movement.

```typescript
{
  itemId: string;
  delta: number;           // +20 for restock, -1 for usage
  note?: string;
  createdAt: Timestamp;
  userEmail: string;       // who made the change
}
```

When updating stock: use a Firestore batched write that creates the movement AND updates `inventory.currentStock` atomically.

## 5. Firestore Security Rules

For now: any authenticated user has full read/write access. Structured to make adding roles trivial later.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuth() {
      return request.auth != null;
    }

    match /customers/{customerId} {
      allow read, write: if isAuth();
    }

    match /cars/{carId} {
      allow read, write: if isAuth();
    }

    match /visits/{visitId} {
      allow read, write: if isAuth();

      match /tasks/{taskId} {
        allow read, write: if isAuth();
      }
      match /lineItems/{itemId} {
        allow read, write: if isAuth();
      }
      match /photos/{photoId} {
        allow read, write: if isAuth();
      }
    }

    match /inventory/{itemId} {
      allow read, write: if isAuth();
    }

    match /inventoryMovements/{movementId} {
      allow read, write: if isAuth();
    }
  }
}
```

Future role gating example (do not implement now, but design accommodates it):

```
function isOwner() {
  return request.auth.token.role == 'owner';
}
// then guard sensitive ops with isOwner()
```

## 6. Firebase Storage Rules

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /visits/{visitId}/{photoId} {
      allow read, write: if request.auth != null;
    }
    match /receipts/{visitId}/{fileName} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 7. Authentication

- Firebase Auth, email + password only.
- No self-signup. Owner provisions accounts manually via Firebase console.
- App routes are guarded by `useAuth` hook; unauthenticated users are redirected to `/login`.
- Implement `Mot de passe oublié ?` using `sendPasswordResetEmail`.
- Persist auth state across sessions (default Firebase behavior).

## 8. Routing

```
/login                → Login
/                     → Home (cars in shop)
/voiture/:plate       → Car detail
/voiture/:plate/recu  → Receipt for current visit
/visite/:visitId/recu → Receipt for a specific (historical) visit
/nouvelle-visite      → New Visit (also openable as bottom sheet from Home; route is for deep-links)
/clients              → Customers list
/client/:phone        → Customer detail
/stock                → Inventory list
/stock/:itemId        → Inventory item detail
/recherche            → Global search
/parametres           → Settings
```

Use protected route wrapper: if not authenticated, redirect to `/login`.

## 9. Critical Implementation Details

### 9.1 Plate normalization (`src/lib/normalize.ts`)

```typescript
export function normalizePlate(input: string): string {
  return input
    .trim()
    .toUpperCase()
    .replace(/تونس/g, 'TUN')
    .replace(/\s+/g, '');     // collapse spaces
}
```

Always normalize before using as a doc ID or for equality checks. Always preserve the raw input for display.

### 9.2 Phone normalization

Use `libphonenumber-js`:

```typescript
import { parsePhoneNumberFromString } from 'libphonenumber-js';

export function normalizePhone(input: string): string | null {
  const parsed = parsePhoneNumberFromString(input, 'TN');
  if (!parsed || !parsed.isValid()) return null;
  return parsed.number; // E.164 format, e.g., +21698123456
}
```

Reject input that doesn't normalize to a valid Tunisian (or international) number with a clear error.

### 9.3 Firestore offline persistence

Enable in `src/lib/firebase.ts`:

```typescript
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});
```

This makes writes optimistic and reads cached automatically.

### 9.4 Visits home query

```typescript
query(
  collection(db, 'visits'),
  where('isClosed', '==', false),
  orderBy('updatedAt', 'desc'),
  limit(50)
);
```

Update `updatedAt` whenever a visit, its tasks, line items, or photos change. The simplest path: every mutation that affects a visit also bumps `visits/{id}.updatedAt`. Use `serverTimestamp()`.

Required Firestore index: composite on `(isClosed, updatedAt desc)`. Set it up in `firestore.indexes.json` so it deploys with the rules.

### 9.5 Total computation

`visit.total` is recomputed on the client whenever a task or line item changes:

```
total = sum(tasks.price) + sum(lineItems.total)
```

Write the new total to the visit doc in the same batch as the task/line item mutation. This avoids a Cloud Function and keeps everything in the free tier.

### 9.6 Photo upload pipeline

```typescript
async function uploadPhoto(file: File, visitId: string, tag: 'avant' | 'apres') {
  // 1. Compress
  const compressed = await imageCompression(file, {
    maxWidthOrHeight: 1280,
    initialQuality: 0.75,
    useWebWorker: true,
  });
  // 2. Upload
  const photoId = crypto.randomUUID();
  const storagePath = `visits/${visitId}/${photoId}.jpg`;
  const storageRef = ref(storage, storagePath);
  await uploadBytes(storageRef, compressed);
  // 3. Write photo doc
  await addDoc(collection(db, 'visits', visitId, 'photos'), {
    storagePath,
    tag,
    uploadedAt: serverTimestamp(),
    width: ..., // read from compressed via createImageBitmap
    height: ...,
    sizeBytes: compressed.size,
  });
  // 4. Bump visit updatedAt
  await updateDoc(doc(db, 'visits', visitId), { updatedAt: serverTimestamp() });
}
```

Show optimistic thumbnail using `URL.createObjectURL(compressed)` while upload is in flight.

### 9.7 PDF receipt template (pdfmake)

`src/lib/pdf.ts` exports a function `generateReceiptPDF(visit, tasks, lineItems, customer, car)` that returns a pdfmake document definition. Layout mirrors the receipt screen:

- Header with garage name (hardcoded constant for now, configurable later).
- Date, customer block, car block.
- Tasks table (description, prix).
- Line items table (description, qté, PU, total).
- Grand total bold at the bottom.
- Footer with "Document interne — non fiscal".

Use a Unicode-safe font (Roboto is bundled with pdfmake by default and handles French accented characters; if Arabic characters appear in customer names, embed Noto Sans Arabic via pdfmake's vfs).

The `Enregistrer en PDF` button calls `pdfMake.createPdf(definition).download(filename)`.

### 9.8 Search index

On app load (after auth), prefetch all customers and cars into memory and build two Fuse.js indexes:

- Cars index: keys `['plate', 'rawPlate', 'make', 'model']`.
- Customers index: keys `['name', 'phone']`.

For 80 cars/month, 5 years = ~5000 cars. Each car doc is ~200 bytes. Total in-memory ~1MB. Acceptable.

Refresh the indexes when the underlying collections change (use a Firestore snapshot listener).

### 9.9 Status chip values

Stored as enum strings: `'diagnostic' | 'en_cours' | 'en_attente_pieces' | 'pret' | null`. Map to display labels in a constant:

```typescript
export const STATUS_LABELS: Record<NonNullable<VisitStatus>, string> = {
  diagnostic: 'Diagnostic',
  en_cours: 'En cours',
  en_attente_pieces: 'En attente pièces',
  pret: 'Prêt',
};
```

### 9.10 Internationalization

No i18n framework. All UI strings are hardcoded French. Centralize them in `src/lib/strings.ts` so a future i18n migration is mechanical.

## 10. Build & Deploy

### 10.1 Local development

```bash
npm install
cp .env.example .env.local   # fill in Firebase credentials
npm run dev
```

### 10.2 Firebase setup checklist

1. Create Firebase project in console.
2. Enable Authentication → Email/Password provider.
3. Enable Firestore (production mode).
4. Enable Storage.
5. Deploy rules:
   ```bash
   firebase deploy --only firestore:rules,firestore:indexes,storage
   ```
6. Manually create the 3 user accounts (owner + 2 mechanics) in Authentication → Users.

### 10.3 Netlify

`netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

The redirect is critical for SPA routing — without it, `/voiture/123TUN4567` returns a 404 on direct navigation.

Connect the GitHub repo to Netlify. Set environment variables in Netlify UI. Auto-deploy on push to `main`.

### 10.4 Backup Cloud Function (post-MVP, optional)

A weekly scheduled Cloud Function that exports Firestore data to a JSON in a known location. Defer until v1 is shipping; mention here so it's not forgotten.

## 11. Testing Posture

- **No test suite in v1.** Three users, single garage, fast iteration. Manual testing on real Android devices is the priority.
- **Manual smoke test checklist** to run before any deploy:
  1. Login works.
  2. Create a new visit with a brand new customer + car.
  3. Add 2 tasks, mark one done.
  4. Take/upload a photo, switch its tag.
  5. Add 2 line items.
  6. View receipt, save as PDF, open the PDF.
  7. Close the visit, confirm it disappears from home.
  8. Reopen from history, confirm it returns.
  9. Adjust stock on an inventory item, confirm the movement log updates.
  10. Search by partial plate, by customer name, by phone.
  11. Test on Chrome Android with real touch interactions.
- TypeScript strict mode is the safety net. Treat any `any` as a code smell.

## 12. Performance Budgets

- Initial JS bundle: ≤ 300KB gzipped. Lazy-load the receipt PDF route — pdfmake is heavy.
- Time to interactive on mid-range Android: ≤ 3s on 4G.
- Photo upload (after compression): ≤ 5s on 4G.
- Firestore reads per home page load: ≤ 2 (one for visits query, one for active subscriptions). Avoid N+1 by using snapshot data.

## 13. Implementation Order (suggested)

Build in this order to get the team using the app as fast as possible:

1. Project skeleton: Vite + React + TS + Tailwind + shadcn/ui + Firebase init + auth gate + login screen.
2. Data model + types + normalization helpers + Firestore rules deployed.
3. Home screen reading from Firestore (empty list OK).
4. New Visit bottom sheet — full create flow including upserting customer and car.
5. Car detail page — header + summary + tasks (CRUD).
6. Car detail page — line items (CRUD) + total calculation.
7. Status chip + filters on home.
8. Photos upload + Avant/Après tabs.
9. Close/reopen visit + history view of closed visits per car.
10. Receipt screen + PDF export.
11. Customers tab + customer page.
12. Stock tab + inventory + movements.
13. Global search (Fuse.js).
14. PWA manifest + service worker + install prompt.
15. Manual QA pass on real Android phone, then deploy to Netlify.

Each step ends in a demoable state. After step 6 the team can already start using the app for car follow-up; receipts come at step 10. Stock at step 12. This sequencing matches the user's stated priority order: car follow-up first, receipts second, stock last (and decoupled).

## 14. Known Risks & Mitigations

- **Firestore index missing on first deploy** → home query returns an error. Mitigation: ship `firestore.indexes.json` from day one and deploy it alongside rules.
- **PDF font missing for Arabic customer names** → Arabic renders as boxes. Mitigation: bundle Noto Sans Arabic in pdfmake vfs. Defer until first real Arabic name appears in testing.
- **Photo upload during weak signal** → user thinks it failed. Mitigation: upload progress indicator + automatic retry on failure + clear error toast.
- **Plate collision** (two cars with the same normalized plate, e.g., one with Arabic original, one with Latin original) → second creation overwrites. Mitigation: when creating a car, check for existing doc first; if found and `rawPlate` differs, prompt the user "Cette plaque existe déjà comme '123 TUN 4567'. Continuer ?"
- **User accidentally taps Terminer la visite** → mitigated by confirmation sheet and Réouvrir option.
- **Free tier exhaustion** → very unlikely at this scale. Firebase free tier (Spark plan) gives 50K Firestore reads/day, 20K writes/day, 1GB storage, 5GB Storage egress/month. At 80 cars/month with 10 photos each at 200KB, that's 160MB/month — comfortably under all limits.
