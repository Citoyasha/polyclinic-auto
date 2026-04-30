import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ChevronDown, MoreVertical, Phone } from 'lucide-react'
import { toast } from 'sonner'
import { useCar } from '@/hooks/useCar'
import { useTasks, type TaskWithId } from '@/hooks/useTasks'
import { normalizePlate } from '@/lib/normalize'
import {
  addTask,
  deleteTask,
  setVisitStatus,
  setVisitSummary,
  updateTask,
} from '@/lib/mutations'
import { type VisitStatus } from '@/types'
import { Plate } from '@/components/Plate'
import { StatusChip } from '@/components/StatusChip'
import { SectionLabel } from '@/components/Eyebrow'
import { StatusEditSheet } from '@/components/StatusEditSheet'
import { SummaryField } from '@/components/SummaryField'
import { TaskList } from '@/components/TaskList'
import { TaskEditSheet, type TaskEditDraft } from '@/components/TaskEditSheet'

export default function CarDetail() {
  const navigate = useNavigate()
  const { plate: rawParam } = useParams<{ plate: string }>()
  const plate = useMemo(
    () => (rawParam ? normalizePlate(decodeURIComponent(rawParam)) : ''),
    [rawParam],
  )

  const { car, visit, carLoading, visitLoading } = useCar(plate)
  const { tasks } = useTasks(visit?.id ?? null)

  const [statusOpen, setStatusOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<TaskWithId | null>(null)

  const tasksTotal = useMemo(
    () => tasks.reduce((sum, t) => sum + (t.price || 0), 0),
    [tasks],
  )

  const onSelectStatus = async (next: VisitStatus) => {
    if (!visit) return
    try {
      await setVisitStatus(visit.id, next)
    } catch (err) {
      console.error(err)
      toast.error('Erreur de synchronisation')
    }
  }

  const onSaveSummary = async (next: string) => {
    if (!visit) return
    try {
      await setVisitSummary(visit.id, next)
    } catch (err) {
      console.error(err)
      toast.error('Erreur de synchronisation')
    }
  }

  const onAddTask = async (description: string) => {
    if (!visit) return
    const order =
      tasks.length > 0 ? Math.max(...tasks.map((t) => t.order ?? 0)) + 1 : 0
    try {
      await addTask({ visitId: visit.id, description, order, nextTotal: tasksTotal })
      toast.success('Tâche ajoutée')
    } catch (err) {
      console.error(err)
      toast.error('Erreur de synchronisation')
    }
  }

  const onToggleTask = async (task: TaskWithId) => {
    if (!visit) return
    try {
      await updateTask(visit.id, task.id, { isDone: !task.isDone }, tasksTotal)
    } catch (err) {
      console.error(err)
      toast.error('Erreur de synchronisation')
    }
  }

  const onSaveEditingTask = async (draft: TaskEditDraft) => {
    if (!visit || !editingTask) return
    const nextTotal = tasksTotal - (editingTask.price || 0) + (draft.price || 0)
    await updateTask(
      visit.id,
      editingTask.id,
      {
        description: draft.description,
        notes: draft.notes,
        price: draft.price,
      },
      nextTotal,
    )
  }

  const onDeleteEditingTask = async () => {
    if (!visit || !editingTask) return
    const nextTotal = tasksTotal - (editingTask.price || 0)
    await deleteTask(visit.id, editingTask.id, nextTotal)
  }

  const subtitle = [car?.make, car?.model, car?.color, car?.year]
    .filter(Boolean)
    .join(' · ')
  const customerName = visit?.customerSnapshot.name ?? ''
  const customerPhone = visit?.customerSnapshot.phone ?? ''
  const status = visit?.status ?? null
  const summary = visit?.summary ?? ''
  const grandTotal = visit?.total ?? tasksTotal
  const plateValue = car?.rawPlate || (plate ? plate : '')

  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col bg-bg">
      {/* Sticky header */}
      <div className="flex flex-none flex-col border-b border-border-soft bg-bg pb-3.5 pt-2">
        <div className="flex items-center justify-between px-2">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex h-11 w-11 items-center justify-center text-fg"
            aria-label="Retour"
          >
            <ArrowLeft size={24} />
          </button>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center text-fg"
            aria-label="Plus"
          >
            <MoreVertical size={22} />
          </button>
        </div>
        <div className="px-6">
          {plateValue && <Plate value={plateValue} size="xl" />}
          {subtitle && (
            <div className="mt-3 text-[14px] text-fg-muted" dir="auto">
              {subtitle}
            </div>
          )}
          {customerName && (
            <a
              href={customerPhone ? `tel:${customerPhone}` : undefined}
              className="mt-2.5 flex items-center gap-2.5"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-soft text-accent">
                <Phone size={14} strokeWidth={2} />
              </span>
              <span className="text-[14.5px] font-medium text-fg" dir="auto">
                {customerName}
              </span>
              {customerPhone && (
                <span className="text-[13px] text-fg-muted">· {customerPhone}</span>
              )}
            </a>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto pb-52">
        {(carLoading || visitLoading) && (
          <div className="space-y-3 px-5 pt-4">
            <div className="h-10 animate-pulse rounded-md bg-surface-alt" />
            <div className="h-24 animate-pulse rounded-md bg-surface-alt" />
          </div>
        )}

        {!visitLoading && !visit && (
          <div className="mx-5 mt-6 rounded-md border border-border bg-surface p-4 text-[14px] text-fg-muted">
            Aucune visite active pour cette voiture.
          </div>
        )}

        {visit && (
          <>
            {visit.isClosed && (
              <div className="mx-5 mt-3 rounded-md border border-border bg-surface-alt px-3 py-2 text-[13px] text-fg">
                Visite terminée
              </div>
            )}

            {/* Status row */}
            <div className="flex items-center gap-2.5 px-6 pb-3.5 pt-4">
              <span className="text-[13px] font-medium text-fg-muted">
                Statut
              </span>
              <button
                type="button"
                onClick={() => setStatusOpen(true)}
                className="inline-flex items-center gap-1.5"
              >
                {status ? (
                  <StatusChip status={status} size="md" />
                ) : (
                  <span className="rounded-full border border-dashed border-border px-3 py-[5px] text-[13px] text-fg-muted">
                    Aucun
                  </span>
                )}
                <ChevronDown size={16} strokeWidth={1.8} className="text-fg-muted" />
              </button>
            </div>

            {/* Résumé */}
            <div className="px-5 pb-1.5 pt-3.5">
              <SectionLabel>Résumé</SectionLabel>
              <SummaryField
                value={summary}
                onSave={onSaveSummary}
                disabled={visit.isClosed}
              />
            </div>

            {/* Tâches */}
            <div className="px-5 pb-1.5 pt-3.5">
              <SectionLabel>
                Tâches ({tasks.filter((t) => t.isDone).length}/{tasks.length})
              </SectionLabel>
              <TaskList
                tasks={tasks}
                onToggle={onToggleTask}
                onTap={(t) => setEditingTask(t)}
                onAdd={onAddTask}
                disabled={visit.isClosed}
              />
            </div>

            <div className="h-6" />
          </>
        )}
      </div>

      {/* Sticky bottom: total + actions */}
      {visit && (
        <div
          className="absolute inset-x-0 bottom-0 border-t border-border bg-bg px-5 pb-4 pt-3.5"
          style={{ boxShadow: '0 -10px 30px rgba(0,0,0,0.06)' }}
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[13px] font-medium text-fg-muted">Total</span>
            <span className="text-[22px] font-semibold tracking-[-0.3px]">
              <span className="font-mono">{grandTotal}</span>
              <span className="ml-1 text-[13px] font-medium text-fg-muted">
                TND
              </span>
            </span>
          </div>
          <div className="flex gap-2.5">
            <button
              type="button"
              className="flex-1 rounded-xl border border-border bg-surface px-4 py-3 text-[14.5px] font-semibold text-fg disabled:opacity-50"
              disabled
              title="Reçu — étape 10"
            >
              Voir le reçu
            </button>
            <button
              type="button"
              className="flex-1 rounded-xl bg-accent px-4 py-3 text-[14.5px] font-semibold text-on-accent disabled:opacity-50"
              disabled
              title="Terminer — étape 9"
            >
              Terminer
            </button>
          </div>
        </div>
      )}

      <StatusEditSheet
        open={statusOpen}
        onOpenChange={setStatusOpen}
        value={status}
        onSelect={onSelectStatus}
      />

      <TaskEditSheet
        open={editingTask !== null}
        onOpenChange={(o) => !o && setEditingTask(null)}
        task={editingTask}
        onSave={onSaveEditingTask}
        onDelete={onDeleteEditingTask}
      />
    </div>
  )
}
