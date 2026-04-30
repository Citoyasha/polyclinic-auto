import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { SearchBar } from '@/components/SearchBar'
import { FilterChips, type FilterValue } from '@/components/FilterChips'
import { CarRow } from '@/components/CarRow'
import { Fab } from '@/components/Fab'
import { NewVisitForm } from '@/components/NewVisitForm'
import { Avatar, deriveInitials } from '@/components/Avatar'
import { CarThumb } from '@/components/CarThumb'
import { Eyebrow } from '@/components/Eyebrow'
import { BottomNav } from '@/components/BottomNav'
import { useCars, type VisitWithId } from '@/hooks/useCars'

function matchesQuery(visit: VisitWithId, q: string): boolean {
  if (!q) return true
  const needle = q.toLowerCase()
  const haystacks = [
    visit.carSnapshot.plate,
    visit.carSnapshot.rawPlate,
    visit.customerSnapshot.name,
    visit.customerSnapshot.phone,
    visit.carSnapshot.make,
    visit.carSnapshot.model,
  ]
  return haystacks.some((h) => (h ?? '').toLowerCase().includes(needle))
}

function matchesFilter(visit: VisitWithId, f: FilterValue): boolean {
  if (f === 'all' || f === 'historique') return true
  return visit.status === f
}

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<FilterValue>('all')
  const { visits, loading, error } = useCars(
    filter === 'historique' ? 'history' : 'active',
  )
  const [sheetOpen, setSheetOpen] = useState(false)

  const filtered = useMemo(
    () => visits.filter((v) => matchesQuery(v, query) && matchesFilter(v, filter)),
    [visits, query, filter],
  )

  const initials = deriveInitials(
    user?.displayName ?? null,
    user?.email ?? null,
  )

  const showEmptyDb = !loading && !error && visits.length === 0
  const showNoResult =
    !loading && !error && visits.length > 0 && filtered.length === 0

  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col bg-bg">
      {/* App bar */}
      <div className="flex flex-none items-center justify-between px-5 pt-2 pb-1">
        <div>
          <Eyebrow>Garage</Eyebrow>
          <div className="mt-0.5 text-[26px] font-semibold tracking-[-0.4px]">
            Voitures
          </div>
        </div>
        <Avatar initials={initials} onClick={() => navigate('/parametres')} />
      </div>

      {/* Search */}
      <div className="px-5 pt-3">
        <SearchBar value={query} onChange={setQuery} />
      </div>

      {/* Filter chips */}
      <div className="px-5 pt-3.5 pb-3">
        <FilterChips value={filter} onChange={setFilter} />
      </div>

      {/* List */}
      <div className="flex-1 overflow-auto pb-28">
        {error && <ErrorBanner code={error.code} message={error.message} />}

        {loading && (
          <div className="flex flex-col gap-2 px-5 pt-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-xl bg-surface-alt"
              />
            ))}
          </div>
        )}

        {showEmptyDb && <EmptyState historique={filter === 'historique'} />}

        {showNoResult && (
          <p className="mt-12 text-center text-[14px] text-fg-muted">
            Aucun résultat.
          </p>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div>
            {filtered.map((v) => (
              <CarRow key={v.id} visit={v} />
            ))}
          </div>
        )}
      </div>

      <Fab onClick={() => setSheetOpen(true)} label="Nouvelle visite" />

      <BottomNav />

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent title="Nouvelle visite">
          <NewVisitForm
            onCancel={() => setSheetOpen(false)}
            onCreated={() => setSheetOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  )
}

function EmptyState({ historique }: { historique: boolean }) {
  return (
    <div className="mt-16 flex flex-col items-center justify-center px-10 text-center text-fg-muted">
      <div className="mb-4">
        <CarThumb size={72} />
      </div>
      <div className="mb-1.5 text-[15px] font-medium text-fg">
        {historique ? 'Aucune visite terminée' : 'Aucune voiture'}
      </div>
      <div className="max-w-[240px] text-[13.5px] leading-[1.5]">
        {historique
          ? "Les visites marquées « Terminé » apparaîtront ici."
          : 'Touchez + pour démarrer une nouvelle visite.'}
      </div>
    </div>
  )
}

function ErrorBanner({ code, message }: { code: string; message: string }) {
  const isMissingIndex = code === 'failed-precondition'
  return (
    <div className="mx-5 mt-2 mb-3 flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
      <AlertTriangle size={18} className="mt-0.5 flex-none" />
      <div className="min-w-0">
        <p className="font-medium">
          {isMissingIndex
            ? 'Index Firestore manquant'
            : 'Erreur de synchronisation'}
        </p>
        <p className="text-xs opacity-80">
          {isMissingIndex
            ? 'Déployer firestore.indexes.json (firebase deploy --only firestore:indexes).'
            : message}
        </p>
      </div>
    </div>
  )
}
