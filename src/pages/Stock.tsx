import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eyebrow } from '@/components/Eyebrow'
import { BottomNav } from '@/components/BottomNav'
import { SearchBar } from '@/components/SearchBar'
import { StockRow } from '@/components/StockRow'
import { Fab } from '@/components/Fab'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { NewItemForm } from '@/components/NewItemForm'
import { useInventory, type InventoryItemWithId } from '@/hooks/useInventory'
import { cn } from '@/lib/utils'

type Filter = 'tous' | 'piece' | 'fluide'

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'tous', label: 'Tous' },
  { id: 'piece', label: 'Pièces' },
  { id: 'fluide', label: 'Fluides' },
]

function matchesFilter(it: InventoryItemWithId, f: Filter) {
  if (f === 'tous') return true
  return it.type === f
}

function matchesQuery(it: InventoryItemWithId, q: string) {
  if (!q) return true
  return (it.name ?? '').toLowerCase().includes(q.toLowerCase())
}

export default function Stock() {
  const navigate = useNavigate()
  const { items, loading, error } = useInventory()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('tous')
  const [sheetOpen, setSheetOpen] = useState(false)

  const filtered = useMemo(
    () =>
      items.filter((i) => matchesFilter(i, filter) && matchesQuery(i, query)),
    [items, filter, query],
  )

  const showEmpty = !loading && !error && items.length === 0
  const showNoResult =
    !loading && !error && items.length > 0 && filtered.length === 0

  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col bg-bg">
      <div className="flex-none px-5 pt-2 pb-1">
        <Eyebrow>Garage</Eyebrow>
        <div className="mt-0.5 text-[26px] font-semibold tracking-[-0.4px]">
          Stock
        </div>
      </div>

      <div className="flex-none px-5 pt-3 pb-2">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Rechercher un article…"
        />
      </div>

      <div className="flex flex-none gap-2 overflow-x-auto px-5 pb-3 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {FILTERS.map(({ id, label }) => {
          const active = filter === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={cn(
                'flex-shrink-0 whitespace-nowrap rounded-full border px-3.5 py-[7px] text-[13px] transition-all',
                active
                  ? 'border-accent bg-accent font-semibold text-on-accent'
                  : 'border-border bg-surface font-medium text-fg',
              )}
              style={
                active ? { boxShadow: 'var(--shadow-accent-soft)' } : undefined
              }
            >
              {label}
            </button>
          )
        })}
      </div>

      <div className="flex-1 overflow-auto pb-28">
        {error && (
          <p className="mx-5 mt-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
            Erreur de synchronisation : {error.message}
          </p>
        )}

        {loading && (
          <div className="flex flex-col gap-2 px-5 pt-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-xl bg-surface-alt"
              />
            ))}
          </div>
        )}

        {showEmpty && (
          <div className="mt-16 px-10 text-center text-fg-muted">
            <div className="mb-1.5 text-[15px] font-medium text-fg">
              Aucun article en stock
            </div>
            <div className="max-w-[260px] text-[13.5px] leading-[1.5]">
              Touchez + pour ajouter un article.
            </div>
          </div>
        )}

        {showNoResult && (
          <p className="mt-12 text-center text-[14px] text-fg-muted">
            Aucun résultat.
          </p>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div>
            {filtered.map((it) => (
              <StockRow
                key={it.id}
                item={it}
                onClick={() => navigate(`/stock/${it.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      <Fab onClick={() => setSheetOpen(true)} label="Nouvel article" />

      <BottomNav />

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent title="Nouvel article">
          <NewItemForm
            onCancel={() => setSheetOpen(false)}
            onCreated={(id) => {
              setSheetOpen(false)
              navigate(`/stock/${id}`)
            }}
          />
        </SheetContent>
      </Sheet>
    </div>
  )
}
