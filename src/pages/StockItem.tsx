import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Edit2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Timestamp } from 'firebase/firestore'
import { useAuth } from '@/hooks/useAuth'
import {
  useInventoryItem,
  type InventoryMovementWithId,
} from '@/hooks/useInventoryItem'
import { adjustStock } from '@/lib/mutations'
import { formatRelative } from '@/lib/format'
import { cn } from '@/lib/utils'
import { defaultUnitFor } from '@/types'
import { SectionLabel } from '@/components/Eyebrow'
import { EditItemSheet } from '@/components/EditItemSheet'

const QUICK_DELTAS = [-1, +1, +5, +10] as const

export default function StockItem() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { itemId } = useParams<{ itemId: string }>()
  const { item, movements, loading, error } = useInventoryItem(itemId ?? null)

  const [note, setNote] = useState('')
  const [adjusting, setAdjusting] = useState<number | null>(null)
  const [editOpen, setEditOpen] = useState(false)

  const isLow = !!item && item.currentStock <= item.lowStockThreshold
  const unit = item ? item.unit?.trim() || defaultUnitFor(item.type) : ''

  const onAdjust = async (delta: number) => {
    if (!item || !itemId || adjusting !== null) return
    setAdjusting(delta)
    try {
      await adjustStock({
        itemId,
        delta,
        currentStock: item.currentStock,
        note,
        userEmail: user?.email ?? '',
      })
      setNote('')
    } catch (err) {
      console.error('adjustStock', err)
      toast.error('Erreur de synchronisation')
    } finally {
      setAdjusting(null)
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-bg">
      <div className="flex flex-none items-center justify-between border-b border-border-soft bg-bg px-2 py-1.5">
        <button
          type="button"
          onClick={() => navigate('/stock')}
          className="flex h-11 w-11 items-center justify-center text-fg"
          aria-label="Retour"
        >
          <ArrowLeft size={24} />
        </button>
        <button
          type="button"
          onClick={() => setEditOpen(true)}
          disabled={!item}
          className="flex h-11 w-11 items-center justify-center text-fg disabled:opacity-50"
          aria-label="Modifier l’article"
        >
          <Edit2 size={20} strokeWidth={1.8} />
        </button>
      </div>

      <div className="flex-1 overflow-auto pb-8">
        {error && (
          <p className="mx-5 mt-3 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
            Erreur de synchronisation : {error.message}
          </p>
        )}

        {loading && (
          <div className="space-y-3 px-5 pt-5">
            <div className="h-7 w-32 animate-pulse rounded-md bg-surface-alt" />
            <div className="h-16 w-40 animate-pulse rounded-md bg-surface-alt" />
            <div className="h-24 w-full animate-pulse rounded-md bg-surface-alt" />
          </div>
        )}

        {!loading && !item && !error && (
          <div className="mx-5 mt-6 rounded-md border border-border bg-surface p-4 text-[14px] text-fg-muted">
            Article introuvable.
          </div>
        )}

        {item && itemId && (
          <>
            {/* Item header */}
            <div className="border-b border-border-soft px-6 pb-5 pt-2">
              <div className="text-[11px] font-semibold uppercase tracking-[1.2px] text-fg-muted">
                {item.type === 'piece' ? 'Pièce' : 'Fluide'}
              </div>
              <div
                className="mt-1 text-[22px] font-semibold tracking-[-0.3px]"
                dir="auto"
              >
                {item.name}
              </div>
              <div className="mt-4 flex items-baseline gap-2.5">
                <span
                  className={cn(
                    'font-mono text-[56px] font-bold leading-none tracking-[-2px]',
                    isLow ? 'text-status-diagnostic' : 'text-fg',
                  )}
                >
                  {item.currentStock}
                </span>
                <span className="text-[16px] text-fg-muted">{unit}</span>
                {isLow && (
                  <span
                    className="ml-1 rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.4px] text-status-diagnostic"
                    style={{ background: 'rgba(217, 119, 6, 0.12)' }}
                  >
                    Stock bas
                  </span>
                )}
              </div>
              <div className="mt-2 text-[12.5px] text-fg-muted">
                Seuil bas : {item.lowStockThreshold} {unit}
              </div>
            </div>

            {/* Adjust */}
            <div className="px-5 pb-3 pt-4">
              <SectionLabel>Ajuster le stock</SectionLabel>
              <div className="mb-3 grid grid-cols-4 gap-2">
                {QUICK_DELTAS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => onAdjust(d)}
                    disabled={adjusting !== null}
                    className="flex items-center justify-center rounded-[10px] border border-border bg-surface py-3.5 font-mono text-[16px] font-semibold text-fg disabled:opacity-50"
                  >
                    {adjusting === d ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : d > 0 ? (
                      `+${d}`
                    ) : (
                      String(d)
                    )}
                  </button>
                ))}
              </div>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Note optionnelle (réception, inventaire…)"
                dir="auto"
                className="w-full rounded-[10px] border border-border bg-surface px-3.5 py-2.5 text-[13.5px] text-fg outline-none focus:border-accent"
              />
            </div>

            {/* Movements */}
            <div className="px-5 pb-1.5 pt-4">
              <SectionLabel>Mouvements récents</SectionLabel>
              {movements.length === 0 ? (
                <div className="rounded-xl border border-border bg-surface px-4 py-3 text-[13.5px] text-fg-muted">
                  Aucun mouvement enregistré.
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-border bg-surface">
                  {movements.map((m, i) => (
                    <MovementRow
                      key={m.id}
                      movement={m}
                      isLast={i === movements.length - 1}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {item && itemId && (
        <EditItemSheet
          open={editOpen}
          onOpenChange={setEditOpen}
          item={item}
          itemId={itemId}
          onDeleted={() => navigate('/stock')}
        />
      )}
    </div>
  )
}

function MovementRow({
  movement,
  isLast,
}: {
  movement: InventoryMovementWithId
  isLast: boolean
}) {
  const positive = movement.delta > 0
  const ts = movement.createdAt as Timestamp | undefined | null
  const date = ts?.toDate ? ts.toDate() : null
  return (
    <div
      className={cn(
        'flex items-center gap-3 px-3.5 py-3',
        !isLast && 'border-b border-border-soft',
      )}
    >
      <span
        className="flex h-8 w-8 flex-none items-center justify-center rounded-lg font-mono text-[13px] font-bold"
        style={{
          background: positive ? 'rgba(22, 163, 74, 0.12)' : 'rgba(220, 38, 38, 0.10)',
          color: positive ? '#16a34a' : '#dc2626',
        }}
      >
        {positive ? `+${movement.delta}` : movement.delta}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[13.5px] text-fg" dir="auto">
          {movement.note || 'Ajustement manuel'}
        </div>
        <div className="mt-0.5 text-[12px] text-fg-muted">
          {date ? formatRelative(date) : '…'}
          {movement.userEmail ? ` · ${movement.userEmail}` : ''}
        </div>
      </div>
    </div>
  )
}
