import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Fab({
  onClick,
  label,
  className,
}: {
  onClick: () => void
  label: string
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        'absolute bottom-[84px] right-5 z-10 flex items-center gap-2 rounded-[18px] bg-accent py-3.5 pl-4 pr-5 text-[15px] font-semibold text-on-accent transition-transform hover:scale-[1.02] active:scale-95',
        className,
      )}
      style={{ boxShadow: 'var(--shadow-accent-fab)' }}
    >
      <Plus size={20} strokeWidth={2.4} />
      {label}
    </button>
  )
}
