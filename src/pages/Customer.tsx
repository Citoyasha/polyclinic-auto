import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Edit2, Phone } from 'lucide-react'
import type { Timestamp } from 'firebase/firestore'
import { useCustomer, type CarWithId } from '@/hooks/useCustomer'
import type { VisitWithId } from '@/hooks/useCars'
import { SectionLabel } from '@/components/Eyebrow'
import { Plate } from '@/components/Plate'
import { CarThumb } from '@/components/CarThumb'
import { StatusChip } from '@/components/StatusChip'
import { EditCustomerSheet } from '@/components/EditCustomerSheet'
import { formatDate, formatTND } from '@/lib/format'

export default function Customer() {
  const navigate = useNavigate()
  const { phone: rawParam } = useParams<{ phone: string }>()
  const phone = useMemo(
    () => (rawParam ? decodeURIComponent(rawParam) : ''),
    [rawParam],
  )
  const { customer, cars, visits, loading, error } = useCustomer(phone || null)
  const [editOpen, setEditOpen] = useState(false)

  const carsByPlate = useMemo(() => {
    const m = new Map<string, CarWithId>()
    for (const c of cars) m.set(c.plate, c)
    return m
  }, [cars])

  const closedVisits = useMemo(
    () => visits.filter((v) => v.isClosed || v.status === 'termine'),
    [visits],
  )

  const goCar = (plate: string) =>
    navigate(`/voiture/${encodeURIComponent(plate)}`)

  const goReceipt = (visitId: string) => navigate(`/visite/${visitId}/recu`)

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-bg">
      {/* Top bar */}
      <div className="flex flex-none items-center justify-between border-b border-border-soft bg-bg px-2 py-1.5">
        <button
          type="button"
          onClick={() => navigate('/clients')}
          className="flex h-11 w-11 items-center justify-center text-fg"
          aria-label="Retour"
        >
          <ArrowLeft size={24} />
        </button>
        <button
          type="button"
          onClick={() => setEditOpen(true)}
          disabled={!customer}
          className="flex h-11 w-11 items-center justify-center text-fg disabled:opacity-50"
          aria-label="Modifier le client"
        >
          <Edit2 size={20} strokeWidth={1.8} />
        </button>
      </div>

      <div className="flex-1 overflow-auto pb-8">
        {error && (
          <p className="mx-5 mt-3 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
            Erreur de synchronisation : {error.message}
          </p>
        )}

        {loading && (
          <div className="space-y-3 px-5 pt-5">
            <div className="h-8 w-48 animate-pulse rounded-md bg-surface-alt" />
            <div className="h-5 w-32 animate-pulse rounded-md bg-surface-alt" />
            <div className="h-24 animate-pulse rounded-md bg-surface-alt" />
          </div>
        )}

        {!loading && !customer && !error && (
          <div className="mx-5 mt-6 rounded-md border border-border bg-surface p-4 text-[14px] text-fg-muted">
            Client introuvable.
          </div>
        )}

        {customer && (
          <>
            {/* Header */}
            <div className="border-b border-border-soft px-6 pb-5 pt-2">
              <div className="text-[26px] font-semibold tracking-[-0.4px]" dir="auto">
                {customer.name || (
                  <span className="italic text-fg-muted">Sans nom</span>
                )}
              </div>
              <a
                href={`tel:${phone}`}
                className="mt-3 inline-flex items-center gap-2.5"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-soft text-accent">
                  <Phone size={14} strokeWidth={2} />
                </span>
                <span className="font-mono text-[14px] text-fg">
                  {customer.rawPhone || phone}
                </span>
              </a>
              {customer.notes && (
                <div
                  className="mt-3 rounded-md bg-surface-alt p-3 text-[13.5px] leading-[1.5] text-fg"
                  dir="auto"
                >
                  {customer.notes}
                </div>
              )}
            </div>

            {/* Cars */}
            <div className="px-5 pb-1.5 pt-3.5">
              <SectionLabel>Voitures ({cars.length})</SectionLabel>
              {cars.length === 0 ? (
                <div className="rounded-xl border border-border bg-surface px-4 py-3 text-[13.5px] text-fg-muted">
                  Aucune voiture enregistrée pour ce client.
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-border bg-surface">
                  {cars.map((car, i) => (
                    <CustomerCarRow
                      key={car.id}
                      car={car}
                      visits={visits}
                      onClick={() => goCar(car.plate)}
                      isLast={i === cars.length - 1}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* History */}
            <div className="px-5 pb-1.5 pt-3.5">
              <SectionLabel>Historique des visites</SectionLabel>
              {closedVisits.length === 0 ? (
                <div className="rounded-xl border border-border bg-surface px-4 py-3 text-[13.5px] text-fg-muted">
                  Aucune visite terminée pour ce client.
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-border bg-surface">
                  {closedVisits.map((v, i) => {
                    const plate = carsByPlate.get(v.carId)?.rawPlate || v.carSnapshot.rawPlate
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => goReceipt(v.id)}
                        className={
                          i < closedVisits.length - 1
                            ? 'block w-full border-b border-border-soft px-3.5 py-3 text-left'
                            : 'block w-full px-3.5 py-3 text-left'
                        }
                      >
                        <div className="mb-1 flex items-center justify-between gap-3">
                          <Plate value={plate} size="sm" />
                          <span className="text-[12px] text-fg-muted">
                            {formatVisitDate(v)}
                          </span>
                        </div>
                        <div className="flex items-baseline justify-between gap-3">
                          <span
                            className="line-clamp-1 flex-1 text-[13.5px] leading-[1.4] text-fg"
                            dir="auto"
                          >
                            {v.summary || (
                              <span className="italic text-fg-muted">
                                Sans description
                              </span>
                            )}
                          </span>
                          <span className="whitespace-nowrap font-mono text-[13.5px] text-fg">
                            {formatTND(v.total ?? 0)}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <EditCustomerSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        customer={customer}
        phone={phone}
      />
    </div>
  )
}

function CustomerCarRow({
  car,
  visits,
  onClick,
  isLast,
}: {
  car: CarWithId
  visits: VisitWithId[]
  onClick: () => void
  isLast?: boolean
}) {
  const activeVisit = visits.find(
    (v) => v.carId === car.plate && !v.isClosed && v.status !== 'termine',
  )
  const status = activeVisit?.status ?? null
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
          <div className="mt-1 text-[12.5px] text-fg-muted" dir="auto">
            {subtitle}
          </div>
        )}
      </div>
      {status && <StatusChip status={status} />}
    </button>
  )
}

function formatVisitDate(visit: VisitWithId): string {
  const ts = (visit.closedAt ?? visit.updatedAt) as Timestamp | null | undefined
  const date = ts?.toDate?.()
  return date ? formatDate(date) : ''
}
