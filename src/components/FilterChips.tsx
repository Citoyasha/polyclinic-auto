import { cn } from '@/lib/utils'
import type { VisitStatus } from '@/types'

export type FilterValue = 'all' | NonNullable<VisitStatus>

const ITEMS: { id: FilterValue; label: string }[] = [
  { id: 'all', label: 'Tous' },
  { id: 'diagnostic', label: 'Diagnostic' },
  { id: 'en_cours', label: 'En cours' },
  { id: 'en_attente_pieces', label: 'Pièces' },
  { id: 'pret', label: 'Prêt' },
]

export function FilterChips({
  value,
  onChange,
  className,
}: {
  value: FilterValue
  onChange: (v: FilterValue) => void
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        className,
      )}
    >
      {ITEMS.map(({ id, label }) => {
        const active = id === value
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={cn(
              'flex-shrink-0 whitespace-nowrap rounded-full border px-3.5 py-[7px] text-[13px] transition-all',
              active
                ? 'border-accent bg-accent font-semibold text-on-accent'
                : 'border-border bg-surface font-medium text-fg',
            )}
            style={active ? { boxShadow: 'var(--shadow-accent-soft)' } : undefined}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
