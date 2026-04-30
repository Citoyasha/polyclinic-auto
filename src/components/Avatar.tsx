import { cn } from '@/lib/utils'

export function Avatar({
  initials,
  size = 38,
  variant = 'subtle',
  className,
  onClick,
}: {
  initials: string
  size?: number
  variant?: 'subtle' | 'accent'
  className?: string
  onClick?: () => void
}) {
  const isButton = !!onClick
  const cls = cn(
    'flex items-center justify-center rounded-full font-semibold text-fg',
    variant === 'accent'
      ? 'bg-accent-soft text-accent'
      : 'bg-surface-alt text-fg',
    isButton && 'cursor-pointer',
    className,
  )
  const style = {
    width: size,
    height: size,
    fontSize: Math.round(size * 0.36),
  }
  if (isButton) {
    return (
      <button type="button" onClick={onClick} className={cls} style={style} aria-label="Compte">
        {initials}
      </button>
    )
  }
  return (
    <span className={cls} style={style}>
      {initials}
    </span>
  )
}

export function deriveInitials(name?: string | null, email?: string | null): string {
  const src = (name || email || '').trim()
  if (!src) return '?'
  const parts = src.split(/[\s.@_-]+/).filter(Boolean)
  if (parts.length === 0) return src.slice(0, 2).toUpperCase()
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}
