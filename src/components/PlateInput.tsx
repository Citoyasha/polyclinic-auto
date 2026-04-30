import { useEffect, useRef } from 'react'

interface PlateInputProps {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  autoFocus?: boolean
  disabled?: boolean
}

const LEFT_LEN = 3
const RIGHT_LEN = 4
const TOTAL = LEFT_LEN + RIGHT_LEN

function parsePlate(value: string): { left: string; right: string } {
  const digits = (value ?? '').replace(/\D/g, '')
  return {
    left: digits.slice(0, LEFT_LEN),
    right: digits.slice(LEFT_LEN, TOTAL),
  }
}

function format(left: string, right: string): string {
  if (!left && !right) return ''
  return `${left} TUN ${right}`.trim()
}

export function isValidTunisianPlate(value: string): boolean {
  const { left, right } = parsePlate(value)
  return left.length === LEFT_LEN && right.length === RIGHT_LEN
}

export function PlateInput({
  value,
  onChange,
  onBlur,
  autoFocus,
  disabled,
}: PlateInputProps) {
  const { left, right } = parsePlate(value)
  const leftRef = useRef<HTMLInputElement>(null)
  const rightRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (autoFocus) {
      const t = setTimeout(() => leftRef.current?.focus(), 30)
      return () => clearTimeout(t)
    }
  }, [autoFocus])

  const setLeft = (next: string) => {
    const cleaned = next.replace(/\D/g, '')
    if (cleaned.length > LEFT_LEN) {
      // user pasted a full plate into the left field — split across both
      const l = cleaned.slice(0, LEFT_LEN)
      const r = cleaned.slice(LEFT_LEN, TOTAL)
      onChange(format(l, r))
      rightRef.current?.focus()
      return
    }
    onChange(format(cleaned, right))
    if (cleaned.length === LEFT_LEN && next.length > left.length) {
      rightRef.current?.focus()
    }
  }

  const setRight = (next: string) => {
    const cleaned = next.replace(/\D/g, '').slice(0, RIGHT_LEN)
    onChange(format(left, cleaned))
  }

  const onRightKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && right.length === 0 && left.length > 0) {
      e.preventDefault()
      const trimmed = left.slice(0, -1)
      onChange(format(trimmed, ''))
      const el = leftRef.current
      if (el) {
        el.focus()
        const len = trimmed.length
        // place cursor at the end after focus
        requestAnimationFrame(() => el.setSelectionRange(len, len))
      }
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-[10px] border border-border bg-surface px-4 py-2 focus-within:border-accent">
      <input
        ref={leftRef}
        value={left}
        onChange={(e) => setLeft(e.target.value)}
        onBlur={onBlur}
        inputMode="numeric"
        pattern="[0-9]*"
        placeholder="123"
        maxLength={LEFT_LEN}
        disabled={disabled}
        autoComplete="off"
        aria-label="Plaque, 3 chiffres avant"
        className="w-[78px] border-0 bg-transparent text-center font-mono text-[22px] font-semibold tracking-[2px] text-fg outline-none placeholder:text-fg-muted"
      />
      <TunBadge />
      <input
        ref={rightRef}
        value={right}
        onChange={(e) => setRight(e.target.value)}
        onKeyDown={onRightKeyDown}
        onBlur={onBlur}
        inputMode="numeric"
        pattern="[0-9]*"
        placeholder="4567"
        maxLength={RIGHT_LEN}
        disabled={disabled}
        autoComplete="off"
        aria-label="Plaque, 4 chiffres après"
        className="w-[100px] border-0 bg-transparent text-center font-mono text-[22px] font-semibold tracking-[2px] text-fg outline-none placeholder:text-fg-muted"
      />
    </div>
  )
}

function TunBadge() {
  return (
    <span
      role="img"
      aria-label="Tunisie"
      className="flex h-11 w-11 flex-none items-center justify-center"
    >
      <svg
        viewBox="0 0 64 64"
        width="44"
        height="44"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        {/* Red field */}
        <circle cx="32" cy="32" r="32" fill="#e70013" />
        {/* White disc */}
        <circle cx="32" cy="32" r="18" fill="#ffffff" />
        {/* Red moon (left half of crescent) */}
        <circle cx="29.5" cy="32" r="12" fill="#e70013" />
        {/* White cutter — same colour as the disc, carves the crescent */}
        <circle cx="33.5" cy="32" r="10.5" fill="#ffffff" />
        {/* Red 5-point star inside the crescent's opening */}
        <polygon
          points="38,27 39.18,30.38 42.76,30.45 39.90,32.62 40.94,36.05 38,34 35.06,36.05 36.10,32.62 33.24,30.45 36.82,30.38"
          fill="#e70013"
        />
      </svg>
    </span>
  )
}
