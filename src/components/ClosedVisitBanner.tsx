import type { Timestamp } from 'firebase/firestore'
import { formatDate } from '@/lib/format'

export function ClosedVisitBanner({
  closedAt,
}: {
  closedAt?: Timestamp | null
}) {
  const date = closedAt?.toDate ? closedAt.toDate() : null
  const label = date ? `Visite terminée le ${formatDate(date)}` : 'Visite terminée'

  return (
    <div className="mx-5 mt-3 flex items-center gap-3 rounded-md border-l-4 border-accent bg-surface-alt px-3.5 py-2.5">
      <span className="text-[13.5px] font-medium text-fg">{label}</span>
    </div>
  )
}
