import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Fuse from 'fuse.js'
import { ChevronRight } from 'lucide-react'
import { Eyebrow, SectionLabel } from '@/components/Eyebrow'
import { BottomNav } from '@/components/BottomNav'
import { SearchBar } from '@/components/SearchBar'
import { CustomerRow } from '@/components/CustomerRow'
import { CarThumb } from '@/components/CarThumb'
import { Plate } from '@/components/Plate'
import { useAllCars, type CarWithId } from '@/hooks/useAllCars'
import { useCustomers } from '@/hooks/useCustomers'

const MAX_PER_GROUP = 10

export default function Search() {
  const navigate = useNavigate()
  const { cars, loading: carsLoading } = useAllCars()
  const { customers, loading: customersLoading } = useCustomers()
  const [query, setQuery] = useState('')

  const carFuse = useMemo(
    () =>
      new Fuse(cars, {
        keys: ['plate', 'rawPlate', 'make', 'model'],
        threshold: 0.35,
        ignoreLocation: true,
      }),
    [cars],
  )
  const customerFuse = useMemo(
    () =>
      new Fuse(customers, {
        keys: ['name', 'phone', 'rawPhone'],
        threshold: 0.3,
        ignoreLocation: true,
      }),
    [customers],
  )

  const trimmedQuery = query.trim()
  const carResults = useMemo(
    () =>
      trimmedQuery
        ? carFuse.search(trimmedQuery, { limit: MAX_PER_GROUP }).map((r) => r.item)
        : [],
    [carFuse, trimmedQuery],
  )
  const customerResults = useMemo(
    () =>
      trimmedQuery
        ? customerFuse
            .search(trimmedQuery, { limit: MAX_PER_GROUP })
            .map((r) => r.item)
        : [],
    [customerFuse, trimmedQuery],
  )

  const noResults =
    trimmedQuery.length > 0 &&
    carResults.length === 0 &&
    customerResults.length === 0

  const showHint = !trimmedQuery && !carsLoading && !customersLoading

  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col bg-bg">
      <div className="flex-none px-5 pt-2 pb-1">
        <Eyebrow>Garage</Eyebrow>
        <div className="mt-0.5 text-[26px] font-semibold tracking-[-0.4px]">
          Recherche
        </div>
      </div>

      <div className="flex-none px-5 pt-3 pb-3">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Rechercher plaque, client, téléphone…"
        />
      </div>

      <div className="flex-1 overflow-auto pb-28">
        {showHint && (
          <p className="mt-12 px-10 text-center text-[13.5px] leading-[1.5] text-fg-muted">
            Tapez une plaque, un nom de client ou un numéro de téléphone.
          </p>
        )}

        {noResults && (
          <p className="mt-12 px-10 text-center text-[14px] text-fg-muted">
            Aucun résultat pour « {trimmedQuery} ».
          </p>
        )}

        {carResults.length > 0 && (
          <div className="px-5 pt-3.5">
            <SectionLabel>Voitures ({carResults.length})</SectionLabel>
            <div className="overflow-hidden rounded-xl border border-border bg-surface">
              {carResults.map((c, i) => (
                <CarSearchRow
                  key={c.id}
                  car={c}
                  isLast={i === carResults.length - 1}
                  onClick={() =>
                    navigate(`/voiture/${encodeURIComponent(c.plate)}`)
                  }
                />
              ))}
            </div>
          </div>
        )}

        {customerResults.length > 0 && (
          <div className="px-5 pt-3.5">
            <SectionLabel>Clients ({customerResults.length})</SectionLabel>
            <div className="overflow-hidden rounded-xl border border-border bg-surface">
              {customerResults.map((c) => (
                <CustomerRow
                  key={c.id}
                  customer={c}
                  onClick={() =>
                    navigate(`/client/${encodeURIComponent(c.phone)}`)
                  }
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}

function CarSearchRow({
  car,
  isLast,
  onClick,
}: {
  car: CarWithId
  isLast: boolean
  onClick: () => void
}) {
  const subtitle = [car.make, car.model, car.color].filter(Boolean).join(' ')
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        isLast
          ? 'flex w-full items-center gap-3 px-3.5 py-3 text-left'
          : 'flex w-full items-center gap-3 border-b border-border-soft px-3.5 py-3 text-left'
      }
    >
      <CarThumb size={36} />
      <div className="min-w-0 flex-1">
        <Plate value={car.rawPlate || car.plate} size="sm" />
        {subtitle && (
          <div className="mt-1 truncate text-[12.5px] text-fg-muted" dir="auto">
            {subtitle}
          </div>
        )}
      </div>
      <ChevronRight size={16} strokeWidth={1.7} className="flex-none text-fg-muted" />
    </button>
  )
}
