import { useEffect, useState } from 'react'

export function CashAdvanceField({
  value,
  onSave,
  disabled,
}: {
  value: number
  onSave: (next: number) => Promise<void> | void
  disabled?: boolean
}) {
  const [draft, setDraft] = useState<string>(value > 0 ? String(value) : '')

  useEffect(() => {
    setDraft(value > 0 ? String(value) : '')
  }, [value])

  const commit = async () => {
    const parsed = parseFloat(draft.replace(',', '.'))
    const next = Number.isFinite(parsed) && parsed > 0 ? parsed : 0
    if (next === value) return
    await onSave(next)
  }

  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3.5 py-2.5 focus-within:border-accent">
      <input
        type="number"
        inputMode="decimal"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        disabled={disabled}
        placeholder="0"
        className="min-w-0 flex-1 border-0 bg-transparent font-mono text-[16px] font-semibold text-fg outline-none placeholder:text-fg-muted disabled:opacity-60"
      />
      <span className="text-[13px] font-medium text-fg-muted">TND</span>
    </div>
  )
}
