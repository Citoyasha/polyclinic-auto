import { cn } from '@/lib/utils'

export function CarThumb({
  size = 48,
  className,
}: {
  size?: number
  className?: string
}) {
  const radius = Math.round(size * 0.26)
  return (
    <div
      className={cn('relative flex flex-shrink-0 items-center justify-center overflow-hidden', className)}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-deep) 100%)',
        boxShadow:
          'var(--shadow-card), inset 0 1px 0 rgba(255,255,255,0.18)',
      }}
    >
      {/* highlight stripe */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0"
        style={{
          height: '45%',
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0))',
        }}
      />
      <svg
        width={size * 0.78}
        height={size * 0.78}
        viewBox="0 0 64 64"
        fill="none"
        className="relative z-[1]"
      >
        <ellipse cx="32" cy="50" rx="22" ry="2" fill="rgba(0,0,0,0.25)" />
        <path
          d="M8 42c0-1.5 1-3 2.6-3.4l3-.8 4.2-7.6c1.3-2.3 3.7-3.7 6.4-3.7h17c2.4 0 4.6 1.1 6 3l5.5 7.4 3.6 1.1c1.6.5 2.7 2 2.7 3.7v3.8c0 .9-.7 1.5-1.5 1.5H53"
          fill="#ffffff"
          stroke="rgba(0,0,0,0.08)"
          strokeWidth="0.5"
        />
        <path
          d="M15 47H10.5c-.8 0-1.5-.7-1.5-1.5V42"
          fill="#ffffff"
        />
        <path
          d="M19.5 38l3-5.5c.7-1.3 2.1-2.1 3.6-2.1h11c1.4 0 2.7.7 3.4 1.9l3.7 5.7H19.5z"
          fill="var(--color-accent-deep)"
          opacity="0.85"
        />
        <path
          d="M31.5 30.4v7.6M27 38.5l1.5-7.5"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="0.6"
        />
        <rect
          x="9"
          y="40.5"
          width="46"
          height="1.2"
          fill="var(--color-gold)"
          opacity="0.9"
        />
        <circle cx="51" cy="40" r="1.3" fill="var(--color-gold)" />
        <circle cx="19" cy="46" r="4.5" fill="#1a1a1a" />
        <circle cx="19" cy="46" r="2" fill="#3a3a3a" />
        <circle cx="45" cy="46" r="4.5" fill="#1a1a1a" />
        <circle cx="45" cy="46" r="2" fill="#3a3a3a" />
      </svg>
    </div>
  )
}
