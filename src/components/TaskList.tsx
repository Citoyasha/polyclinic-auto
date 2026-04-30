import { useState } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { TaskRow } from '@/components/TaskRow'
import type { TaskWithId } from '@/hooks/useTasks'

export function TaskList({
  tasks,
  onToggle,
  onTap,
  onAdd,
  disabled,
}: {
  tasks: TaskWithId[]
  loading?: boolean
  onToggle: (task: TaskWithId) => void
  onTap: (task: TaskWithId) => void
  onAdd: (description: string) => Promise<void>
  disabled?: boolean
}) {
  const [draft, setDraft] = useState('')
  const [adding, setAdding] = useState(false)
  const [open, setOpen] = useState(false)

  const submit = async () => {
    const desc = draft.trim()
    if (!desc || disabled) {
      setOpen(false)
      setDraft('')
      return
    }
    setAdding(true)
    try {
      await onAdd(desc)
      setDraft('')
      setOpen(false)
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      {tasks.map((t, i) => (
        <TaskRow
          key={t.id}
          task={t}
          onToggle={() => onToggle(t)}
          onTap={() => onTap(t)}
          isLast={i === tasks.length - 1 && !open}
        />
      ))}

      {open ? (
        <div
          className={
            tasks.length > 0
              ? 'flex items-center gap-2 border-t border-border-soft px-3.5 py-3'
              : 'flex items-center gap-2 px-3.5 py-3'
          }
        >
          {adding && (
            <Loader2 size={16} className="flex-none animate-spin text-fg-muted" />
          )}
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={submit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submit()
              if (e.key === 'Escape') {
                setOpen(false)
                setDraft('')
              }
            }}
            placeholder="Nouvelle tâche…"
            disabled={disabled || adding}
            dir="auto"
            className="flex-1 border-0 bg-transparent text-[14.5px] text-fg outline-none placeholder:text-fg-muted"
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          disabled={disabled}
          className={
            tasks.length > 0
              ? 'flex w-full items-center gap-2 border-t border-border-soft px-3.5 py-3 text-left text-[14px] font-medium text-accent disabled:opacity-50'
              : 'flex w-full items-center gap-2 px-3.5 py-3 text-left text-[14px] font-medium text-accent disabled:opacity-50'
          }
        >
          <Plus size={16} strokeWidth={2} />
          Ajouter une tâche
        </button>
      )}
    </div>
  )
}
