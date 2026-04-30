import { useNavigate } from 'react-router-dom'
import { CarThumb } from '@/components/CarThumb'
import { Plate } from '@/components/Plate'
import { StatusChip } from '@/components/StatusChip'
import { formatRelative } from '@/lib/format'
import type { VisitWithId } from '@/hooks/useCars'

function buildSubtitle(visit: VisitWithId): string {
  const car = visit.carSnapshot
  const carParts = [car.make, car.model, car.color].filter(Boolean).join(' ')
  const customer = visit.customerSnapshot.name
  return [carParts, customer].filter(Boolean).join(' · ')
}

export function CarRow({ visit }: { visit: VisitWithId }) {
  const navigate = useNavigate()
  const updated = visit.updatedAt?.toDate?.()
  const subtitle = buildSubtitle(visit)
  const plate = visit.carSnapshot.rawPlate || visit.carSnapshot.plate

  return (
    <button
      type="button"
      onClick={() => navigate(`/voiture/${encodeURIComponent(visit.carId)}`)}
      className="flex w-full items-start gap-3.5 border-b border-border-soft px-5 py-3.5 text-left transition-colors hover:bg-surface-alt/50"
    >
      <CarThumb size={52} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <Plate value={plate} size="md" />
          {updated && (
            <span className="whitespace-nowrap text-[12px] text-fg-muted">
              {formatRelative(updated)}
            </span>
          )}
        </div>
        {subtitle && (
          <div
            className="mt-1.5 text-[13.5px] leading-[1.4] text-fg-muted"
            dir="auto"
          >
            {subtitle}
          </div>
        )}
        <div className="mt-1.5 flex items-end justify-between gap-2.5">
          <p
            className="line-clamp-2 flex-1 text-[14px] leading-[1.4] text-fg"
            dir="auto"
          >
            {visit.summary || (
              <span className="italic text-fg-muted">Aucun résumé</span>
            )}
          </p>
          {visit.status && (
            <StatusChip status={visit.status} className="flex-shrink-0" />
          )}
        </div>
      </div>
    </button>
  )
}
