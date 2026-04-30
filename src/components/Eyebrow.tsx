import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Eyebrow({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'text-[11px] font-semibold uppercase tracking-[1.5px] text-fg-muted',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function SectionLabel({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'mb-2.5 text-[11px] font-semibold uppercase tracking-[1.2px] text-fg-muted',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function FieldLabel({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'mb-1.5 text-[11px] font-semibold uppercase tracking-[0.3px] text-fg-muted',
        className,
      )}
    >
      {children}
    </div>
  )
}
