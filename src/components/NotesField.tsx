import { useEffect, useState } from 'react'

export function NotesField({
  value,
  onSave,
  disabled,
}: {
  value: string
  onSave: (next: string) => Promise<void> | void
  disabled?: boolean
}) {
  const [draft, setDraft] = useState(value)

  useEffect(() => {
    setDraft(value)
  }, [value])

  const onBlur = async () => {
    if (draft === value) return
    await onSave(draft)
  }

  return (
    <textarea
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={onBlur}
      disabled={disabled}
      rows={3}
      placeholder="Notes internes : remarques, conseils client, suivi…"
      dir="auto"
      className="block min-h-[80px] w-full resize-none rounded-xl border border-border bg-surface px-3.5 py-3 text-[14.5px] leading-[1.5] text-fg outline-none placeholder:text-fg-muted disabled:opacity-60"
    />
  )
}
