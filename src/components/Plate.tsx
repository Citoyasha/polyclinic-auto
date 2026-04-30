import { cn } from '@/lib/utils'

const SIZE_MAP = {
  sm: 'text-[12px] px-2 py-[3px] tracking-[0.4px]',
  md: 'text-[15px] px-2.5 py-1 tracking-[0.5px]',
  lg: 'text-[22px] px-3.5 py-1.5 tracking-[0.8px]',
  xl: 'text-[28px] px-4 py-2 tracking-[1px]',
}

export function Plate({
  value,
  size = 'md',
  className,
}: {
  value: string
  size?: keyof typeof SIZE_MAP
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-block whitespace-nowrap rounded-md border border-plate-border bg-plate-bg font-mono font-semibold text-fg',
        SIZE_MAP[size],
        className,
      )}
    >
      {value}
    </span>
  )
}
