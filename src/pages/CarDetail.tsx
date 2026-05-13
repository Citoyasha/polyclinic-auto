import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ChevronDown, MoreVertical, Phone } from 'lucide-react'
import { toast } from 'sonner'
import { useCar } from '@/hooks/useCar'
import { useTasks, type TaskWithId } from '@/hooks/useTasks'
import { useLineItems, type LineItemWithId } from '@/hooks/useLineItems'
import { usePhotos } from '@/hooks/usePhotos'
import { normalizePlate } from '@/lib/normalize'
import {
  addLineItem,
  addTask,
  deleteLineItem,
  deleteTask,
  setVisitAssignee,
  setVisitCashAdvance,
  setVisitNotes,
  setVisitStatus,
  setVisitSummary,
  updateLineItem,
  updateTask,
} from '@/lib/mutations'
import { type VisitStatus } from '@/types'
import { Plate } from '@/components/Plate'
import { StatusChip } from '@/components/StatusChip'
import { SectionLabel } from '@/components/Eyebrow'
import { StatusEditSheet } from '@/components/StatusEditSheet'
import { SummaryField } from '@/components/SummaryField'
import { NotesField } from '@/components/NotesField'
import { CashAdvanceField } from '@/components/CashAdvanceField'
import { AssigneePickerSheet } from '@/components/AssigneePickerSheet'
import { TaskList } from '@/components/TaskList'
import { TaskEditSheet, type TaskEditDraft } from '@/components/TaskEditSheet'
import {
  LineItemList,
  type NewLineDraft,
} from '@/components/LineItemList'
import {
  LineItemEditSheet,
  type LineItemEditDraft,
} from '@/components/LineItemEditSheet'
import { PhotoSection } from '@/components/PhotoSection'
import { ClosedVisitBanner } from '@/components/ClosedVisitBanner'
import { CarMenuSheet, type CarMenuAction } from '@/components/CarMenuSheet'
import { EditCarSheet } from '@/components/EditCarSheet'
import { EditCustomerSheet } from '@/components/EditCustomerSheet'
import { DeleteCarSheet } from '@/components/DeleteCarSheet'

export default function CarDetail() {
  const navigate = useNavigate()
  const { plate: rawParam } = useParams<{ plate: string }>()
  const plate = useMemo(
    () => (rawParam ? normalizePlate(decodeURIComponent(rawParam)) : ''),
    [rawParam],
  )

  const { car, visit, customer, carLoading, visitLoading } = useCar(plate)
  const { tasks } = useTasks(visit?.id ?? null)
  const { lineItems } = useLineItems(visit?.id ?? null)
  const { photos } = usePhotos(visit?.id ?? null)

  const [statusOpen, setStatusOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<TaskWithId | null>(null)
  const [editingLine, setEditingLine] = useState<LineItemWithId | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [editCarOpen, setEditCarOpen] = useState(false)
  const [editCustomerOpen, setEditCustomerOpen] = useState(false)
  const [deleteCarOpen, setDeleteCarOpen] = useState(false)
  const [assigneeOpen, setAssigneeOpen] = useState(false)

  const onMenuAction = (action: CarMenuAction) => {
    setMenuOpen(false)
    if (action === 'edit-car') setEditCarOpen(true)
    else if (action === 'edit-customer') setEditCustomerOpen(true)
    else if (action === 'view-customer') {
      const phone = visit?.customerSnapshot?.phone ?? car?.customerId
      if (phone) navigate(`/client/${encodeURIComponent(phone)}`)
    } else if (action === 'delete-car') setDeleteCarOpen(true)
  }

  const tasksTotal = useMemo(
    () => tasks.reduce((sum, t) => sum + (t.price || 0), 0),
    [tasks],
  )
  const lineItemsTotal = useMemo(
    () =>
      lineItems.reduce(
        (sum, l) => sum + (l.total ?? l.quantity * l.unitPrice),
        0,
      ),
    [lineItems],
  )
  const grandTotal = tasksTotal + lineItemsTotal

  const isTerminated =
    visit?.status === 'termine' || visit?.isClosed === true

  const onSelectStatus = async (next: VisitStatus) => {
    if (!visit) return
    try {
      await setVisitStatus(visit.id, next)
      if (next === 'termine') {
        toast.success('Visite déplacée dans l’historique')
      }
    } catch (err) {
      console.error(err)
      toast.error('Erreur de synchronisation')
    }
  }

  const onSaveNotes = async (next: string) => {
    if (!visit) return
    try {
      await setVisitNotes(visit.id, next)
    } catch (err) {
      console.error(err)
      toast.error('Erreur de synchronisation')
    }
  }

  const onSaveCashAdvance = async (next: number) => {
    if (!visit) return
    try {
      await setVisitCashAdvance(visit.id, next)
    } catch (err) {
      console.error(err)
      toast.error('Erreur de synchronisation')
    }
  }

  const onSelectAssignee = async (
    mechanic: { id: string; name: string } | null,
  ) => {
    if (!visit) return
    try {
      await setVisitAssignee(
        visit.id,
        mechanic?.id ?? null,
        mechanic?.name ?? null,
      )
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

  // ---- Tasks ----
  const onAddTask = async (description: string) => {
    if (!visit) return
    const order =
      tasks.length > 0 ? Math.max(...tasks.map((t) => t.order ?? 0)) + 1 : 0
    try {
      await addTask({
        visitId: visit.id,
        description,
        order,
        nextTotal: grandTotal,
      })
      toast.success('Tâche ajoutée')
    } catch (err) {
      console.error(err)
      toast.error('Erreur de synchronisation')
    }
  }

  const onToggleTask = async (task: TaskWithId) => {
    if (!visit) return
    try {
      await updateTask(visit.id, task.id, { isDone: !task.isDone }, grandTotal)
    } catch (err) {
      console.error(err)
      toast.error('Erreur de synchronisation')
    }
  }

  const onSaveEditingTask = async (draft: TaskEditDraft) => {
    if (!visit || !editingTask) return
    const nextTasksTotal =
      tasksTotal - (editingTask.price || 0) + (draft.price || 0)
    await updateTask(
      visit.id,
      editingTask.id,
      {
        description: draft.description,
        notes: draft.notes,
        price: draft.price,
      },
      nextTasksTotal + lineItemsTotal,
    )
  }

  const onDeleteEditingTask = async () => {
    if (!visit || !editingTask) return
    const nextTasksTotal = tasksTotal - (editingTask.price || 0)
    await deleteTask(visit.id, editingTask.id, nextTasksTotal + lineItemsTotal)
  }

  // ---- Line items ----
  const onAddLineItem = async (draft: NewLineDraft) => {
    if (!visit) return
    const order =
      lineItems.length > 0
        ? Math.max(...lineItems.map((l) => l.order ?? 0)) + 1
        : 0
    const lineTotal = draft.quantity * draft.unitPrice
    try {
      await addLineItem({
        visitId: visit.id,
        description: draft.description,
        quantity: draft.quantity,
        unitPrice: draft.unitPrice,
        order,
        nextTotal: grandTotal + lineTotal,
      })
      toast.success('Ligne ajoutée')
    } catch (err) {
      console.error(err)
      toast.error('Erreur de synchronisation')
    }
  }

  const onSaveEditingLine = async (draft: LineItemEditDraft) => {
    if (!visit || !editingLine) return
    const oldLineTotal =
      editingLine.total ?? editingLine.quantity * editingLine.unitPrice
    const newLineTotal = draft.quantity * draft.unitPrice
    const nextLineItemsTotal = lineItemsTotal - oldLineTotal + newLineTotal
    await updateLineItem(
      visit.id,
      editingLine.id,
      {
        description: draft.description,
        quantity: draft.quantity,
        unitPrice: draft.unitPrice,
        total: newLineTotal,
      },
      tasksTotal + nextLineItemsTotal,
    )
  }

  const onDeleteEditingLine = async () => {
    if (!visit || !editingLine) return
    const oldLineTotal =
      editingLine.total ?? editingLine.quantity * editingLine.unitPrice
    await deleteLineItem(
      visit.id,
      editingLine.id,
      tasksTotal + (lineItemsTotal - oldLineTotal),
    )
  }

  const onDeleteLineRow = async (item: LineItemWithId) => {
    if (!visit) return
    const oldLineTotal = item.total ?? item.quantity * item.unitPrice
    try {
      await deleteLineItem(
        visit.id,
        item.id,
        tasksTotal + (lineItemsTotal - oldLineTotal),
      )
    } catch (err) {
      console.error(err)
      toast.error('Erreur de synchronisation')
    }
  }

  const subtitle = [car?.make, car?.model, car?.color, car?.year]
    .filter(Boolean)
    .join(' · ')
  const customerName = visit?.customerSnapshot.name ?? ''
  const customerPhone = visit?.customerSnapshot.phone ?? ''
  const status = visit?.status ?? null
  const summary = visit?.summary ?? ''
  const notes = visit?.notes ?? ''
  const cashAdvance = visit?.cashAdvance ?? 0
  const assigneeName = visit?.assigneeName ?? null
  const assigneeMechanicId = visit?.assigneeMechanicId ?? null
  const remaining = Math.max(0, grandTotal - cashAdvance)
  const showPaymentChip = status === 'pret' && grandTotal > 0
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
            onClick={() => setMenuOpen(true)}
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
            <div className="mt-2.5 flex items-center gap-2.5">
              {customerPhone && (
                <a
                  href={`tel:${customerPhone}`}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-soft text-accent"
                  aria-label="Appeler le client"
                >
                  <Phone size={14} strokeWidth={2} />
                </a>
              )}
              <button
                type="button"
                onClick={() =>
                  customerPhone &&
                  navigate(`/client/${encodeURIComponent(customerPhone)}`)
                }
                className="flex items-center gap-2 text-left"
                aria-label="Voir la fiche client"
              >
                <span className="text-[14.5px] font-medium text-fg" dir="auto">
                  {customerName}
                </span>
                {customerPhone && (
                  <span className="text-[13px] text-fg-muted">· {customerPhone}</span>
                )}
              </button>
            </div>
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
            {isTerminated && <ClosedVisitBanner closedAt={visit.closedAt} />}

            {/* Status row */}
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2 px-6 pb-1.5 pt-4">
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
              {showPaymentChip && (
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-[5px] text-[12.5px] font-semibold"
                  style={
                    remaining > 0
                      ? {
                          background: 'rgba(217, 119, 6, 0.12)',
                          color: '#b45309',
                        }
                      : {
                          background: 'rgba(22, 163, 74, 0.12)',
                          color: '#15803d',
                        }
                  }
                >
                  {remaining > 0
                    ? `Reste à payer ${remaining} TND`
                    : 'Payé'}
                </span>
              )}
            </div>

            {/* Assignee row */}
            <div className="flex items-center gap-2.5 px-6 pb-3.5 pt-2">
              <span className="text-[13px] font-medium text-fg-muted">
                Mécanicien
              </span>
              <button
                type="button"
                onClick={() => setAssigneeOpen(true)}
                className="inline-flex items-center gap-1.5"
              >
                {assigneeName ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-[5px] text-[13px] font-medium text-accent">
                    {assigneeName}
                  </span>
                ) : (
                  <span className="rounded-full border border-dashed border-border px-3 py-[5px] text-[13px] text-fg-muted">
                    Personne
                  </span>
                )}
                <ChevronDown size={16} strokeWidth={1.8} className="text-fg-muted" />
              </button>
            </div>

            {/* Résumé */}
            <div className="px-5 pb-1.5 pt-3.5">
              <SectionLabel>Résumé</SectionLabel>
              <SummaryField value={summary} onSave={onSaveSummary} />
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
              />
            </div>

            {/* Photos */}
            <div className="px-5 pb-1.5 pt-3.5">
              <SectionLabel>Photos</SectionLabel>
              <PhotoSection visitId={visit.id} photos={photos} />
            </div>

            {/* Lignes de reçu */}
            <div className="px-5 pb-1.5 pt-3.5">
              <SectionLabel>Reçu — pièces et fournitures</SectionLabel>
              <LineItemList
                items={lineItems}
                onAdd={onAddLineItem}
                onTap={(it) => setEditingLine(it)}
                onDelete={onDeleteLineRow}
              />
            </div>

            {/* Paiement */}
            <div className="px-5 pb-1.5 pt-3.5">
              <SectionLabel>Paiement</SectionLabel>
              <div className="overflow-hidden rounded-xl border border-border bg-surface">
                <div className="flex items-center justify-between gap-3 border-b border-border-soft px-3.5 py-2.5">
                  <span className="text-[13.5px] text-fg-muted">Avance reçue</span>
                  <div className="w-[160px]">
                    <CashAdvanceField
                      value={cashAdvance}
                      onSave={onSaveCashAdvance}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between px-3.5 py-3">
                  <span className="text-[13.5px] text-fg-muted">
                    Reste à payer
                  </span>
                  <span
                    className="font-mono text-[16px] font-semibold"
                    style={{ color: remaining > 0 ? '#b45309' : 'var(--color-fg)' }}
                  >
                    {remaining} <span className="text-[12px] font-medium text-fg-muted">TND</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="px-5 pb-1.5 pt-3.5">
              <SectionLabel>Notes</SectionLabel>
              <NotesField value={notes} onSave={onSaveNotes} />
            </div>

            <div className="h-6" />
          </>
        )}
      </div>

      {/* Sticky bottom: total + receipt action */}
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
          <button
            type="button"
            onClick={() =>
              navigate(`/voiture/${encodeURIComponent(plate)}/recu`)
            }
            className="w-full rounded-xl bg-accent px-4 py-3 text-[14.5px] font-semibold text-on-accent"
          >
            Voir le reçu
          </button>
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

      <LineItemEditSheet
        open={editingLine !== null}
        onOpenChange={(o) => !o && setEditingLine(null)}
        item={editingLine}
        onSave={onSaveEditingLine}
        onDelete={onDeleteEditingLine}
      />

      <CarMenuSheet
        open={menuOpen}
        onOpenChange={setMenuOpen}
        onSelect={onMenuAction}
      />

      <EditCarSheet
        open={editCarOpen}
        onOpenChange={setEditCarOpen}
        car={car}
        onMigrated={(newPlate) =>
          navigate(`/voiture/${encodeURIComponent(newPlate)}`, { replace: true })
        }
      />

      <EditCustomerSheet
        open={editCustomerOpen}
        onOpenChange={setEditCustomerOpen}
        customer={customer}
        phone={car?.customerId ?? visit?.customerSnapshot?.phone ?? ''}
      />

      <DeleteCarSheet
        open={deleteCarOpen}
        onOpenChange={setDeleteCarOpen}
        plate={car?.plate ?? plate}
        onDeleted={() => navigate('/', { replace: true })}
      />

      <AssigneePickerSheet
        open={assigneeOpen}
        onOpenChange={setAssigneeOpen}
        currentMechanicId={assigneeMechanicId}
        onSelect={(m) =>
          onSelectAssignee(m ? { id: m.id, name: m.name } : null)
        }
      />
    </div>
  )
}
