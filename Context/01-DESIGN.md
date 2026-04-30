# Garage ERP — Design Document

## 1. Project Context

A small mechanics garage in Tunisia currently runs entirely on pen and paper. They want to digitize two core activities:

- **Car follow-up** — tracking what work is being done on each car currently in the shop, and keeping a full history of every visit per car.
- **Receipts** — generating internal digital receipts for each completed visit (customers still get a hand-written paper receipt; the digital one is for internal records).

Constraints driving the design:

- Zero ongoing hosting cost. Use only free tiers.
- 3 active users: 1 owner + 2 mechanics. No user roles for now (everyone has full access). Architecture must allow adding a "viewer" role later without refactoring.
- ~80 cars per month throughput.
- Always online (wifi + 5G in the shop).
- Android phones primary device. App must work on small screens.
- French UI throughout. Users may type Arabic into name/notes fields.
- Some repairs take **months** — the design must not penalize slow-moving cars or treat them as "stuck."
- Users are non-technical and switching from pen-and-paper. **Rejection is the biggest risk.** UX must feel like apps they already use.

## 2. Design Principles

1. **Minimal and utilitarian.** No decoration. Generous whitespace. One accent color. Clear typography. Reference points: Linear, Things 3, Notion. Avoid: shadows-on-shadows, gradients, glassmorphism, skeuomorphism. The mechanic's hands are dirty; the UI shouldn't be.
2. **Familiar Android patterns.** Material Design 3 components. FAB bottom-right for primary action. Pull-to-refresh. Bottom sheets instead of new pages for quick edits. Swipe actions on list rows. Avoid heavy iOS aesthetics — they feel foreign on Android.
3. **Auto-save everywhere.** No "Enregistrer" buttons on text inputs. Type → tap away → saved. Like Google Keep. Save buttons are an opportunity to lose data.
4. **Optimistic UI.** Writes update the screen instantly, sync in background. Firestore's offline persistence handles intermittent connectivity transparently.
5. **Confirmation only for destructive or hard-to-reverse actions.** Deleting a car, deleting a customer, deleting an inventory item. *Closing a visit is **not** destructive* — it's a status change to `Terminé` and is reversed by picking any other status. So no confirmation prompt for it. Everything else is reversible enough to skip the prompt.
6. **Instant fuzzy search.** One search bar, matches across plates, phone numbers, customer names. No filter dropdowns. Use Fuse.js or similar.
7. **Slow repairs are first-class citizens.** A car sitting for 3 months should not be visually flagged as a problem, surfaced as an alert, or penalized in any sort. Treat it identically to a 2-day repair.

## 3. Visual Language

- **Framework:** Tailwind CSS with shadcn/ui components.
- **Look:** Material Design 3 sensibility filtered through shadcn/ui primitives. Clean, flat, modern.
- **Color system:**
  - Background: white / very light neutral.
  - Surface: white with a subtle border (no heavy shadow).
  - Text: high-contrast dark gray, not pure black.
  - Single accent color used sparingly (FAB, primary buttons, active state). Pick a calm blue or teal — not red, not yellow.
  - Status chips use muted colors (soft gray, soft amber, soft green, soft blue) — not saturated traffic-light colors.
- **Typography:** System font stack. Inter is fine if loaded. Sizes: large (titles), medium (body), small (metadata). Don't go below 14px on mobile.
- **Iconography:** Lucide icons (ships with shadcn/ui). Outline style, consistent stroke width.
- **Spacing:** Generous. Tap targets minimum 44×44px. List rows comfortable, not cramped.
- **No emoji** anywhere in the UI.

## 4. Information Architecture

Top-level navigation (bottom tab bar on mobile, sidebar on desktop):

1. **Voitures** — home screen, list of cars currently in the shop. Default view.
2. **Clients** — searchable list of all customers and their cars.
3. **Stock** — standalone inventory page. Decoupled from car repairs.
4. **Recherche** — global search across cars, customers, plates, phones.

A **Compte / Settings** screen is reachable from a profile icon in the top-right (logout, app version).

## 5. Screen-by-Screen Specification

### 5.1 Login Screen

- Centered card with garage name/logo placeholder, email field, password field, "Se connecter" button.
- Firebase Auth with email/password.
- Three accounts pre-provisioned manually (owner + 2 mechanics). No self-signup.
- "Mot de passe oublié ?" link triggers Firebase password reset email.
- After login, route to home.

### 5.2 Home — Voitures (cars currently in the shop)

**Purpose:** Show all cars whose visit is still open (not yet "Terminé"). This is the screen the team will look at most.

**Layout:**

- Top bar: app title "Garage" left, profile icon right.
- Search bar below (sticky): "Rechercher plaque, client, téléphone…"
- Filter chips row below search bar (horizontal scroll if needed): `Tous` (default selected), `Diagnostic`, `En cours`, `En attente pièces`, `Prêt`, `Historique`. Tapping a chip filters the list. Status chips are optional metadata; cars without a status set still appear under `Tous` and can be filtered out by selecting any specific chip. `Tous` and the four mid-flow status chips show only **active** visits (status ≠ `Terminé`); `Historique` shows only **terminated** visits, sorted most-recently-closed first.
- List of car rows, sorted by most recently updated (descending). Like WhatsApp's chat list.
- FAB bottom-right: large "+" icon, label "Nouvelle visite" (icon-only on small screens).

**Car row anatomy:**

```
[thumbnail]  PLATE 123 TUN 4567                       il y a 2 jours
             Renault Clio rouge · Mohamed Ben Ali
             Embrayage qui patine, à diagnostiquer    [En cours]
```

- Thumbnail: latest photo for the visit, or a neutral placeholder car icon if none.
- Plate: bold, larger font, primary identifier.
- Make/model/color and customer name: secondary text.
- Manual summary (free-text written by mechanic): one or two lines, ellipsis truncation.
- Time-since-last-update: small muted text top-right ("il y a 2 jours", "aujourd'hui", "il y a 1 mois"). Use `date-fns` with French locale.
- Status chip: bottom-right, only shown if the user has set one. Soft pill background.
- **No alerts, no red borders, no "stuck" indicators** regardless of how long a car has been there.

**Interactions:**

- Tap row → Car detail page.
- Swipe left on row → reveal quick action: "Marquer Terminé" (sets status to `Terminé`, no confirmation — the same as picking it from the status sheet on the detail page; the visit moves to `Historique`).
- Pull down → refresh.
- Tap FAB → New Visit flow.
- Tap search bar → expands to full-screen search overlay (see 5.10).

**Empty state:** If no cars in shop, show a friendly illustration-free message: "Aucune voiture au garage. Touchez + pour démarrer une nouvelle visite."

### 5.3 New Visit Flow

Triggered by FAB on home. Renders as a **bottom sheet** that slides up to ~90% of screen height (not a full new page — feels lighter and dismissable).

**Single screen, vertical scroll, fields appear progressively:**

1. **Plaque** (text input, autofocus, large font). Normalize on blur (uppercase, strip extra spaces). After typing:
   - If plate matches an existing car → show a small banner "Voiture connue: Renault Clio rouge · Mohamed Ben Ali". Skip ahead to the summary field.
   - If plate is new → reveal the customer phone field below.
2. **Téléphone client** (phone input, `tel` keyboard). On blur:
   - If phone matches existing customer → show "Client connu: Mohamed Ben Ali". Reveal the make/model/color/year fields.
   - If phone is new → reveal the customer name field.
3. **Nom du client** (text input, supports Arabic via `dir="auto"`).
4. **Marque, Modèle, Couleur, Année** — four optional small fields side-by-side or stacked. Skippable. The mechanic can fill these in later from the car detail page.
5. **Résumé / Description** (multiline textarea). What's wrong with the car. Free-form. This is the manual summary that will appear on the home list.
6. Buttons at bottom: `Annuler` (secondary) and `Créer la visite` (primary, accent color, disabled until plate + summary are non-empty).

On submit:
- Create or upsert customer (keyed by normalized phone).
- Create or upsert car (keyed by normalized plate).
- Create new visit document linked to both.
- Close the sheet, return to home, the new car is at the top of the list.

### 5.4 Car Detail Page

**The most important page in the app.** It is both the workspace for the active visit and the gateway to history.

**Layout (top to bottom, scrollable):**

**Header section (sticky on scroll):**
- Back arrow (top-left).
- Plate (large, bold).
- Make · Model · Color · Year on one line below (small).
- Customer name with phone icon next to it (tappable → opens phone dialer with `tel:` link).
- Overflow menu (top-right): "Modifier la voiture", "Voir le client", "Voir l'historique", "Supprimer la voiture" (with confirmation).

**Status chip row:**
- Inline editable chip showing current status. Tap → bottom sheet with options: Aucun, Diagnostic, En cours, En attente pièces, Prêt, Terminé. Selecting one updates immediately. Picking `Terminé` flips the visit to closed (it disappears from `Tous` and shows up under `Historique`); picking any other status restores it.

**Résumé section:**
- Editable multiline text. Auto-saves on blur. Placeholder: "Décrivez ce qu'il faut faire ou ce qui a été fait…"

**Tâches section:**
- Heading: "Tâches" with task count "(3/5)" showing done/total.
- Vertical list of tasks. Each task row: checkbox on left, description text, optional small "notes" subtext below, optional price on the right (e.g., "45 TND").
- Tapping the checkbox toggles done state with a strikethrough visual.
- Tapping the row body opens a bottom sheet: edit description, notes, price, delete task.
- Long-press on a row also opens edit sheet.
- "+ Ajouter une tâche" row at the bottom of the list. Tap → inline input appears, enter creates the task. Like Apple Reminders or Google Keep.

**Photos section:**
- Two tabs: "Avant" and "Après". Default tab: Avant.
- Grid of thumbnails (3 columns on mobile). Each thumbnail has a small toggle icon top-right to switch its tag between Avant and Après.
- Tap thumbnail → full-screen photo viewer with swipe between photos, delete button, and tag toggle.
- Bottom of section: "Prendre une photo" button (camera icon) and "Importer" button (gallery icon). Camera opens device camera via `<input type="file" accept="image/*" capture="environment">`. New photos default to the currently active tab (Avant or Après).

**Lignes de reçu section (Line items):**
- Heading: "Reçu — pièces et fournitures".
- Vertical list of line items. Each row: description (free text), quantity, unit price, line total, delete icon.
- "+ Ajouter une ligne" row at the bottom. Tap → inline form appears with fields for description, quantity (default 1), unit price, then auto-saves on blur.
- These line items are NOT linked to the inventory page. They are free-text entries on the visit/receipt.

**Total bar (sticky at bottom):**
- Sum of task prices + sum of line item totals. Updates live.
- Format: "Total: 380 TND".

**Action button (bottom of page, above the sticky total):**
- `Voir le reçu` (full-width secondary) — opens the receipt screen for the current visit. Works at any status, including `Terminé`. **There is no "Terminer la visite" button.** A visit is closed by setting its status to `Terminé` from the status sheet at the top of the page.

**Behavior for terminated visits (status = `Terminé`):**
- A banner at the top reads "Visite terminée le 12 mars 2026" (date from `closedAt`).
- All sections remain **editable** so the user can fix mistakes after closing without ceremony — closing is reversible by re-picking any non-`Terminé` status from the sheet, which immediately restores the visit to the active list.
- The visit no longer appears in `Tous` or any specific-status filter; it appears under `Historique` until reopened.

### 5.5 Customer Page

Reachable from car detail header (tap customer name → "Voir le client") or from the Clients tab.

**Layout:**
- Header: customer name (large), phone (with call icon), edit icon (top-right).
- Section "Voitures": list of all cars belonging to this customer. Tap → car detail page.
- Section "Historique des visites": chronological list of all visits across all of this customer's cars. Each row shows date, plate, summary, total.

### 5.6 Clients Tab

- Search bar at top.
- Alphabetical list of all customers. Each row: name, phone, count of cars ("2 voitures").
- Tap → Customer page.
- FAB "+" → New Customer bottom sheet (name + phone). Useful for entering a customer without immediately creating a visit.

### 5.7 Stock Tab (Inventory — standalone)

**Decoupled from car repairs entirely.** Pure stock-tracker.

**Layout:**
- Search bar at top.
- Filter chips: `Tous`, `Pièces`, `Fluides`.
- List of inventory items. Each row: name, type icon (part / fluid), current stock count (large, bold), low-stock badge if below threshold.
- FAB "+" → New Item bottom sheet (name, type, initial stock, low-stock threshold).

**Tap an item → Item detail page:**
- Name, type, current stock (large).
- "Ajuster le stock" buttons: `−1`, `+1`, `+5`, `+10`, custom amount field. Each adjustment writes an `inventoryMovements` document and recomputes `currentStock`.
- Optional note field on each adjustment ("Réception fournisseur", "Inventaire physique", etc.).
- History of recent movements below: date, delta, note. Last 50 entries.
- Edit name / threshold / delete item from overflow menu.

**Low-stock indicator:** on the main stock list, items where `currentStock <= lowStockThreshold` get a small red dot or amber chip. No notifications, no popups.

### 5.8 Receipt Screen

Reachable from car detail (`Voir le reçu` button) or from a closed visit in history.

**Layout — designed to look like an internal invoice:**
- Garage name/header (placeholder, hardcoded for now).
- Date of visit (arrived → closed, or "en cours" if open).
- Customer block: name, phone.
- Car block: plate, make, model, year, color.
- Tasks table: description | prix.
- Line items table: description | qté | PU | total.
- Grand total (large, bold) at the bottom.
- Optional notes / résumé.

**Actions:**
- `Enregistrer en PDF` button → generates PDF using `pdfmake`, downloads via browser. PDF can also be saved to Firebase Storage on first generation, but downloading is the main path.
- `Partager` button (optional, uses Web Share API where available) → share PDF via WhatsApp / email.
- `Fermer` returns to previous screen.

The receipt screen is reopenable anytime from the car detail page. There is no "the receipt is generated and locked" — it's always a live render of the current visit data. The PDF is the snapshot.

### 5.9 Search (global)

Triggered by the search bar on home, the Recherche tab, or the search bar inside Clients/Stock (each tab's search is scoped).

**Global search scope:** plates, customer names, phone numbers.

**Behavior:**
- As-you-type, fuzzy matching using Fuse.js loaded with all customers and cars (acceptable in-memory for the data sizes here — even 5 years of operation is ~5,000 cars max).
- Results grouped: "Voitures" then "Clients", max 10 per group.
- Tap result → navigate to detail page.
- Recent searches shown when search bar is empty and focused.

### 5.10 Settings / Account

Minimal screen reached from profile icon:
- Logged-in user email.
- App version.
- "Déconnexion" button.
- (Future) language toggle, theme toggle — stub for now.

## 6. Critical Interaction Patterns

### 6.1 Auto-save

Every text field on the car detail page (résumé, task description, line item fields) saves on blur OR after a 600ms debounce while typing. No save buttons. Use a tiny "Enregistré" toast for the first save in a session, then go silent — don't spam the user.

### 6.2 Optimistic writes

Every mutation updates local state immediately, then writes to Firestore. If Firestore rejects, show a toast ("Erreur de synchronisation") and revert. With Firestore offline persistence enabled, this rarely surfaces.

### 6.3 Photo workflow

1. Tap "Prendre une photo" on car detail.
2. Native camera opens.
3. Capture, return to app.
4. **Compress client-side** with `browser-image-compression`: max 1280px wide, ~75% quality JPEG. This typically takes a 4MB photo down to ~200KB.
5. Upload to Firebase Storage at path `visits/{visitId}/{photoId}.jpg`.
6. Write a `photos` subcollection or array entry on the visit with the storage path, tag (avant/après — defaults to currently active tab), uploadedAt.
7. Show optimistic thumbnail immediately (using a local blob URL) while uploading; replace with Storage URL once done.
8. Failure: show retry option.

### 6.4 Phone normalization

All phone numbers stored canonical: `+216XXXXXXXX`. On input, strip spaces/dashes/parentheses, prepend `+216` if local format. Use `libphonenumber-js` (small bundle) for robustness.

### 6.5 Plate normalization

Tunisian plates: `123 TUN 4567` or `123 تونس 4567`. Normalize for storage as document ID: uppercase, strip whitespace, convert Arabic "تونس" to "TUN" for the canonical form. Always preserve the raw user input in a `rawPlate` field for display. Search must match on both.

### 6.6 RTL inside LTR

The overall UI is LTR (French). Individual input fields that may contain Arabic (customer names, notes, summaries) use `dir="auto"` so each field decides its direction based on its content. Don't flip the whole layout.

## 7. Empty, Loading, and Error States

- **Loading lists:** skeleton placeholders (3-5 ghost rows), not spinners.
- **Loading detail page:** show what we have from the route param (plate at minimum), skeleton for the rest.
- **Empty home:** "Aucune voiture au garage. Touchez + pour démarrer une nouvelle visite."
- **Empty stock:** "Aucun article en stock. Touchez + pour ajouter."
- **Empty search:** "Aucun résultat pour « {query} »."
- **Network error:** small dismissible banner at top of screen "Connexion perdue. Les modifications seront synchronisées." Firestore offline persistence keeps the app working.
- **Generic error:** toast "Une erreur est survenue. Réessayez." Log to console (no error tracking service for now).

## 8. Accessibility & Robustness

- All interactive elements have accessible names (`aria-label` where icons are unlabeled).
- Color is never the only indicator of state (status chips have distinct text, low stock has both color and a label).
- Tap targets ≥ 44px.
- Forms work with on-screen keyboard without obscuring active field (use `scrollIntoView` on focus).
- App functions on Chrome Android (primary target), Chrome desktop, Safari iOS as a bonus.
- PWA manifest + service worker so the app is installable on Android home screen and starts in standalone mode (no browser chrome).

## 9. Out of Scope (explicit non-goals)

- No customer-facing functionality. Customers don't log in.
- No SMS / WhatsApp automation.
- No parts inventory linked to repairs (decoupled by design).
- No reminders / scheduled maintenance alerts.
- No reports / analytics dashboards.
- No multi-language. French only. Arabic is supported only for input data.
- No multi-garage / multi-tenant. Single garage.
- No supplier / cost tracking. Stock items only have name and quantity.
- No user roles in v1. All authenticated users have full access.
- No offline-first design beyond what Firestore provides natively. Always-online assumed.

## 10. Reference Mockup Sketches (text)

### Home

```
┌─────────────────────────────────────┐
│  Garage                          👤 │
├─────────────────────────────────────┤
│  🔍 Rechercher plaque, client…      │
├─────────────────────────────────────┤
│  [Tous] Diagnostic En cours …       │
├─────────────────────────────────────┤
│  [📷] 123 TUN 4567       il y a 2j  │
│       Renault Clio rouge · M. Ali   │
│       Embrayage qui patine [En cours]│
├─────────────────────────────────────┤
│  [📷] 456 TUN 7890       hier       │
│       Peugeot 208 noir · S. Khaled  │
│       Vidange + filtres   [Prêt]    │
├─────────────────────────────────────┤
│  …                                  │
│                              [  +  ]│
└─────────────────────────────────────┘
```

### Car detail

```
┌─────────────────────────────────────┐
│  ←  123 TUN 4567               ⋮    │
│     Renault Clio rouge · 2015       │
│     📞 Mohamed Ben Ali              │
├─────────────────────────────────────┤
│  Statut: [En cours ▾]               │
├─────────────────────────────────────┤
│  Résumé                             │
│  ┌─────────────────────────────────┐│
│  │ Embrayage qui patine, à         ││
│  │ remplacer. Client veut aussi    ││
│  │ vérifier les freins.            ││
│  └─────────────────────────────────┘│
├─────────────────────────────────────┤
│  Tâches (1/3)                       │
│  ☑ Diagnostic embrayage    20 TND   │
│  ☐ Remplacement embrayage  220 TND  │
│  ☐ Vérification freins      —       │
│  + Ajouter une tâche                │
├─────────────────────────────────────┤
│  Photos                             │
│  [ Avant ]  Après                   │
│  [📷][📷][📷]                       │
│  📷 Prendre  📁 Importer            │
├─────────────────────────────────────┤
│  Reçu — pièces et fournitures       │
│  Kit embrayage   1 × 180 = 180 TND  │
│  Huile boîte     2 × 25  = 50 TND   │
│  + Ajouter une ligne                │
├─────────────────────────────────────┤
│  Total: 470 TND                     │
│  [ Voir le reçu ] [ Terminer ]      │
└─────────────────────────────────────┘
```
