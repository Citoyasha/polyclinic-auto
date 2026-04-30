import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TaskWithId } from '@/hooks/useTasks'

export function TaskRow({
  task,
  onToggle,
  onTap,
  isLast,
}: {
  task: TaskWithId
  onToggle: () => void
  onTap: () => void
  isLast?: boolean
}) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 px-3.5 py-3',
        !isLast && 'border-b border-border-soft',
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-label={task.isDone ? 'Marquer non fait' : 'Marquer fait'}
        className={cn(
          'mt-0.5 flex h-[22px] w-[22px] flex-none items-center justify-center rounded-md border-[1.5px] transition-colors',
          task.isDone
            ? 'border-accent bg-accent text-on-accent'
            : 'border-border bg-transparent',
        )}
      >
        {task.isDone && <Check size={14} strokeWidth={2.5} />}
      </button>
      <button
        type="button"
        onClick={onTap}
        className="flex min-w-0 flex-1 flex-col items-start text-left"
      >
        <span
          className={cn(
            'text-[14.5px] leading-[1.4]',
            task.isDone ? 'text-fg-muted line-through' : 'text-fg',
          )}
          dir="auto"
        >
          {task.description || (
            <span className="italic text-fg-muted">Sans description</span>
          )}
        </span>
        {task.notes && (
          <span
            className="mt-[3px] text-[12.5px] leading-[1.4] text-fg-muted"
            dir="auto"
          >
            {task.notes}
          </span>
        )}
      </button>
      <span
        className={cn(
          'mt-0.5 flex-none whitespace-nowrap font-mono text-[13.5px]',
          task.isDone ? 'text-fg-muted' : 'text-fg',
        )}
      >
        {task.price > 0 ? `${task.price} TND` : '—'}
      </span>
    </div>
  )
}
