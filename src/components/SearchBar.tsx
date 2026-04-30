import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

export function SearchBar({
  value,
  onChange,
  placeholder = 'Rechercher plaque, client, téléphone…',
  className,
  onFocus,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
  onFocus?: () => void
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-2.5 rounded-xl bg-surface-alt px-3.5 py-2.5 text-fg-muted',
        className,
      )}
    >
      <Search size={18} strokeWidth={1.7} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        placeholder={placeholder}
        inputMode="search"
        autoComplete="off"
        className="flex-1 border-0 bg-transparent text-[14.5px] text-fg outline-none placeholder:text-fg-muted"
      />
    </div>
  )
}
