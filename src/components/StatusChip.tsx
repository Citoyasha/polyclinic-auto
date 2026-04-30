import { cn } from '@/lib/utils'
import { STATUS_LABELS, type VisitStatus } from '@/types'

const DOT_BG: Record<NonNullable<VisitStatus>, string> = {
  diagnostic: 'bg-status-diagnostic',
  en_cours: 'bg-status-en-cours',
  en_attente_pieces: 'bg-status-en-attente-pieces',
  pret: 'bg-status-pret',
}

const SIZE: Record<'sm' | 'md', string> = {
  sm: 'text-[11.5px] py-[3px] pl-[7px] pr-2 gap-1.5',
  md: 'text-[13px] py-[5px] pl-2.5 pr-3 gap-2',
}

const DOT: Record<'sm' | 'md', string> = {
  sm: 'h-1.5 w-1.5',
  md: 'h-[7px] w-[7px]',
}

export function StatusChip({
  status,
  size = 'sm',
  onClick,
  className,
}: {
  status: VisitStatus
  size?: 'sm' | 'md'
  onClick?: () => void
  className?: string
}) {
  if (!status) return null
  const cls = cn(
    'inline-flex items-center whitespace-nowrap rounded-full border border-border bg-surface font-medium text-fg',
    SIZE[size],
    onClick && 'cursor-pointer',
    className,
  )
  const dot = (
    <span className={cn('flex-shrink-0 rounded-full', DOT_BG[status], DOT[size])} />
  )
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cls}>
        {dot}
        {STATUS_LABELS[status]}
      </button>
    )
  }
  return (
    <span className={cls}>
      {dot}
      {STATUS_LABELS[status]}
    </span>
  )
}
