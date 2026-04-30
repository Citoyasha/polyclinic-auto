import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eyebrow } from '@/components/Eyebrow'
import { BottomNav } from '@/components/BottomNav'
import { SearchBar } from '@/components/SearchBar'
import { CustomerRow } from '@/components/CustomerRow'
import { Fab } from '@/components/Fab'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { NewCustomerForm } from '@/components/NewCustomerForm'
import { useCustomers, type CustomerWithId } from '@/hooks/useCustomers'

function matchesQuery(c: CustomerWithId, q: string) {
  if (!q) return true
  const needle = q.toLowerCase()
  return (
    (c.name ?? '').toLowerCase().includes(needle) ||
    (c.phone ?? '').toLowerCase().includes(needle) ||
    (c.rawPhone ?? '').toLowerCase().includes(needle)
  )
}

function firstLetter(name: string): string {
  const trimmed = (name || '').trim()
  if (!trimmed) return '#'
  const ch = trimmed.charAt(0)
  return /\p{L}/u.test(ch) ? ch.toUpperCase() : '#'
}

export default function Customers() {
  const navigate = useNavigate()
  const { customers, loading, error } = useCustomers()
  const [query, setQuery] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)

  const filtered = useMemo(
    () => customers.filter((c) => matchesQuery(c, query)),
    [customers, query],
  )

  const groups = useMemo(() => {
    const map = new Map<string, CustomerWithId[]>()
    for (const c of filtered) {
      const key = firstLetter(c.name ?? '')
      const list = map.get(key) ?? []
      list.push(c)
      map.set(key, list)
    }
    for (const list of map.values()) {
      list.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? '', 'fr'))
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b, 'fr'))
  }, [filtered])

  const showEmpty = !loading && !error && customers.length === 0
  const showNoResult =
    !loading && !error && customers.length > 0 && filtered.length === 0

  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col bg-bg">
      <div className="flex-none px-5 pt-2 pb-1">
        <Eyebrow>Garage</Eyebrow>
        <div className="mt-0.5 text-[26px] font-semibold tracking-[-0.4px]">
          Clients
        </div>
      </div>

      <div className="flex-none px-5 pt-3 pb-3">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Rechercher nom, téléphone…"
        />
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
                className="h-14 animate-pulse rounded-xl bg-surface-alt"
              />
            ))}
          </div>
        )}

        {showEmpty && (
          <div className="mt-16 px-10 text-center text-fg-muted">
            <div className="mb-1.5 text-[15px] font-medium text-fg">
              Aucun client
            </div>
            <div className="max-w-[260px] text-[13.5px] leading-[1.5]">
              Touchez + pour ajouter un client, ou créez une visite — le client
              sera enregistré automatiquement.
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
            {groups.map(([letter, list]) => (
              <div key={letter}>
                <div className="bg-bg px-5 pb-1.5 pt-2 text-[11px] font-semibold uppercase tracking-[1px] text-fg-muted">
                  {letter}
                </div>
                {list.map((c) => (
                  <CustomerRow
                    key={c.id}
                    customer={c}
                    onClick={() =>
                      navigate(`/client/${encodeURIComponent(c.phone)}`)
                    }
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      <Fab onClick={() => setSheetOpen(true)} label="Nouveau client" />

      <BottomNav />

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent title="Nouveau client">
          <NewCustomerForm
            onCancel={() => setSheetOpen(false)}
            onCreated={(phone) => {
              setSheetOpen(false)
              navigate(`/client/${encodeURIComponent(phone)}`)
            }}
          />
        </SheetContent>
      </Sheet>
    </div>
  )
}
