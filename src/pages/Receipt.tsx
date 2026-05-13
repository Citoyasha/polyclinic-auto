import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Download, Loader2, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { useCar } from '@/hooks/useCar'
import { useVisit } from '@/hooks/useVisit'
import { useTasks } from '@/hooks/useTasks'
import { useLineItems } from '@/hooks/useLineItems'
import { normalizePlate } from '@/lib/normalize'
import { formatDate } from '@/lib/format'
import { STR } from '@/lib/strings'
import { Plate } from '@/components/Plate'

export default function Receipt() {
  const navigate = useNavigate()
  const params = useParams<{ plate?: string; visitId?: string }>()

  const plateCanonical = useMemo(
    () => (params.plate ? normalizePlate(decodeURIComponent(params.plate)) : ''),
    [params.plate],
  )

  // For /voiture/:plate/recu — resolve the visit through useCar.
  const { visit: carVisit, car: carFromPlate, visitLoading: carVisitLoading } =
    useCar(plateCanonical)

  // For /visite/:visitId/recu — load directly.
  const visitId = params.visitId ?? carVisit?.id ?? null
  const { visit: visitFromId, car: carFromId, customer, loading: visitLoading } =
    useVisit(params.visitId ? params.visitId : null)

  const visit = params.visitId ? visitFromId : carVisit ?? null
  const car = params.visitId ? carFromId : carFromPlate
  const customerName =
    customer?.name || visit?.customerSnapshot?.name || ''
  const customerPhone =
    customer?.rawPhone ||
    customer?.phone ||
    visit?.customerSnapshot?.phone ||
    ''

  const { tasks } = useTasks(visitId)
  const { lineItems } = useLineItems(visitId)

  const billableTasks = useMemo(
    () => tasks.filter((t) => (t.price ?? 0) > 0),
    [tasks],
  )
  const tasksTotal = billableTasks.reduce((s, t) => s + (t.price || 0), 0)
  const linesTotal = lineItems.reduce(
    (s, l) => s + (l.total ?? l.quantity * l.unitPrice),
    0,
  )
  const grandTotal = tasksTotal + linesTotal
  const cashAdvance = visit?.cashAdvance ?? 0
  const remaining = Math.max(0, grandTotal - cashAdvance)

  const [pdfBusy, setPdfBusy] = useState(false)
  const [shareBusy, setShareBusy] = useState(false)

  const onDownload = async () => {
    if (!visit || !visitId || pdfBusy) return
    setPdfBusy(true)
    try {
      const { downloadReceiptPdf } = await import('@/lib/pdf')
      await downloadReceiptPdf({
        visitId,
        visit,
        car: car ?? null,
        customer: customer ?? null,
        tasks,
        lineItems,
      })
    } catch (err) {
      console.error('downloadReceiptPdf', err)
      toast.error('Erreur lors de la génération du PDF.')
    } finally {
      setPdfBusy(false)
    }
  }

  const canShare =
    typeof navigator !== 'undefined' &&
    typeof navigator.share === 'function' &&
    typeof (navigator as Navigator & { canShare?: (data: ShareData) => boolean }).canShare ===
      'function'

  const onShare = async () => {
    if (!visit || !visitId || shareBusy) return
    setShareBusy(true)
    try {
      const { getReceiptPdfBlob, getReceiptFilename } = await import('@/lib/pdf')
      const data = {
        visitId,
        visit,
        car: car ?? null,
        customer: customer ?? null,
        tasks,
        lineItems,
      }
      const blob = await getReceiptPdfBlob(data)
      const file = new File([blob], getReceiptFilename(data), {
        type: 'application/pdf',
      })
      const nav = navigator as Navigator & {
        canShare?: (d: ShareData) => boolean
      }
      if (nav.canShare?.({ files: [file] })) {
        await nav.share({ files: [file], title: 'Reçu' })
      } else {
        toast.error('Le partage n’est pas disponible sur cet appareil.')
      }
    } catch (err) {
      const e = err as { name?: string }
      if (e?.name !== 'AbortError') {
        console.error('share receipt', err)
        toast.error('Erreur lors du partage.')
      }
    } finally {
      setShareBusy(false)
    }
  }

  const showLoading = !visit && (visitLoading || carVisitLoading)
  const plateValue = car?.rawPlate || visit?.carSnapshot?.rawPlate || visit?.carId || ''

  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col bg-bg">
      {/* Top bar */}
      <div className="flex flex-none items-center justify-between border-b border-border-soft bg-bg px-2 py-1.5">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-11 w-11 items-center justify-center text-fg"
          aria-label="Retour"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="text-[16px] font-semibold">Reçu</div>
        <div className="h-11 w-11" />
      </div>

      <div className="flex-1 overflow-auto px-5 pb-44 pt-5">
        {showLoading && (
          <div className="space-y-3">
            <div className="h-32 animate-pulse rounded-2xl bg-surface-alt" />
            <div className="h-44 animate-pulse rounded-2xl bg-surface-alt" />
          </div>
        )}

        {!showLoading && !visit && (
          <div className="rounded-md border border-border bg-surface p-4 text-[14px] text-fg-muted">
            Visite introuvable.
          </div>
        )}

        {visit && (
          <div
            className="rounded-2xl border border-border bg-surface px-6 py-6"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}
          >
            {/* Garage header */}
            <div className="border-b border-border-soft pb-4 text-center">
              <div className="text-[11px] font-semibold uppercase tracking-[1.5px] text-fg-muted">
                Garage
              </div>
              <div className="mt-1 text-[22px] font-semibold tracking-[-0.3px]">
                {STR.app.garageName}
              </div>
              <div className="mt-1 text-[12px] text-fg-muted">
                {STR.app.garageAddress} · {STR.app.garagePhone}
              </div>
            </div>

            {/* Meta row */}
            <div className="flex items-start justify-between border-b border-border-soft py-3.5">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[1px] text-fg-muted">
                  Date
                </div>
                <div className="mt-1 font-mono text-[13.5px]">
                  {visitDateLabel(visit)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-semibold uppercase tracking-[1px] text-fg-muted">
                  Visite
                </div>
                <div className="mt-1 font-mono text-[13.5px]">
                  {shortVisitId(visitId)}
                </div>
              </div>
            </div>

            {/* Customer + car */}
            <div className="grid grid-cols-2 gap-4 border-b border-border-soft py-3.5">
              <div>
                <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[1px] text-fg-muted">
                  Client
                </div>
                <div className="text-[14px] font-medium" dir="auto">
                  {customerName || '—'}
                </div>
                {customerPhone && (
                  <div className="mt-0.5 font-mono text-[12.5px] text-fg-muted">
                    {customerPhone}
                  </div>
                )}
              </div>
              <div>
                <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[1px] text-fg-muted">
                  Voiture
                </div>
                {plateValue && <Plate value={plateValue} size="sm" />}
                {(car?.make || car?.model || car?.color || car?.year) && (
                  <div className="mt-1.5 text-[12.5px] text-fg-muted">
                    {[car?.make, car?.model, car?.color, car?.year]
                      .filter(Boolean)
                      .join(' · ')}
                  </div>
                )}
                {visit.assigneeName && (
                  <div className="mt-1.5 text-[12.5px] text-fg-muted">
                    Mécanicien : <span dir="auto">{visit.assigneeName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Tasks */}
            {billableTasks.length > 0 && (
              <div className="border-b border-border-soft py-3.5">
                <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[1px] text-fg-muted">
                  Tâches
                </div>
                {billableTasks.map((t) => (
                  <div
                    key={t.id}
                    className="flex justify-between gap-4 py-1.5 text-[13.5px]"
                  >
                    <span className="flex-1" dir="auto">
                      {t.description || '—'}
                    </span>
                    <span className="whitespace-nowrap font-mono">
                      {t.price} TND
                    </span>
                  </div>
                ))}
                <div className="mt-2.5 flex justify-between border-t border-dashed border-border-soft pt-2 text-[12.5px] text-fg-muted">
                  <span>Sous-total tâches</span>
                  <span className="font-mono">{tasksTotal} TND</span>
                </div>
              </div>
            )}

            {/* Line items */}
            {lineItems.length > 0 && (
              <div className="border-b border-border-soft py-3.5">
                <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[1px] text-fg-muted">
                  Pièces & fournitures
                </div>
                <div className="grid grid-cols-[1fr_36px_60px_70px] gap-2 border-b border-dashed border-border-soft pb-1.5 text-[11px] text-fg-muted">
                  <span>Description</span>
                  <span className="text-right">Qté</span>
                  <span className="text-right">PU</span>
                  <span className="text-right">Total</span>
                </div>
                {lineItems.map((l) => {
                  const lt = l.total ?? l.quantity * l.unitPrice
                  return (
                    <div
                      key={l.id}
                      className="grid grid-cols-[1fr_36px_60px_70px] items-baseline gap-2 py-1.5 text-[13px]"
                    >
                      <span className="min-w-0 truncate" dir="auto">
                        {l.description || '—'}
                      </span>
                      <span className="text-right font-mono text-fg-muted">
                        {l.quantity}
                      </span>
                      <span className="text-right font-mono text-fg-muted">
                        {l.unitPrice}
                      </span>
                      <span className="text-right font-mono">{lt} TND</span>
                    </div>
                  )
                })}
                <div className="mt-1.5 flex justify-between border-t border-dashed border-border-soft pt-2 text-[12.5px] text-fg-muted">
                  <span>Sous-total pièces</span>
                  <span className="font-mono">{linesTotal} TND</span>
                </div>
              </div>
            )}

            {/* Total */}
            <div className="flex items-baseline justify-between pb-1 pt-4">
              <span className="text-[14px] font-semibold uppercase tracking-[0.2px]">
                Total
              </span>
              <span className="text-[28px] font-bold tracking-[-0.5px]">
                <span className="font-mono">{grandTotal}</span>
                <span className="ml-1.5 text-[14px] font-medium text-fg-muted">
                  TND
                </span>
              </span>
            </div>

            {/* Payment */}
            {cashAdvance > 0 && (
              <div className="mt-2 border-t border-dashed border-border-soft pt-2 text-[13px]">
                <div className="flex justify-between py-0.5 text-fg-muted">
                  <span>Avance reçue</span>
                  <span className="font-mono">{cashAdvance} TND</span>
                </div>
                <div
                  className="flex justify-between py-0.5 font-semibold"
                  style={{ color: remaining > 0 ? '#b45309' : '#15803d' }}
                >
                  <span>Reste à payer</span>
                  <span className="font-mono">{remaining} TND</span>
                </div>
              </div>
            )}

            {/* Notes */}
            {visit.summary?.trim() && (
              <div className="mt-4 rounded-[10px] bg-surface-alt p-3">
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-[1px] text-fg-muted">
                  Notes
                </div>
                <div className="text-[13px] leading-[1.5] text-fg" dir="auto">
                  {visit.summary}
                </div>
              </div>
            )}

            <div className="mt-4 text-center text-[10.5px] text-fg-muted">
              {STR.app.receiptFooter}
            </div>
          </div>
        )}
      </div>

      {/* Sticky actions */}
      {visit && (
        <div
          className="absolute inset-x-0 bottom-0 border-t border-border bg-bg px-5 pb-4 pt-3.5"
          style={{ boxShadow: '0 -10px 30px rgba(0,0,0,0.06)' }}
        >
          <div className="flex gap-2.5">
            {canShare && (
              <button
                type="button"
                onClick={onShare}
                disabled={shareBusy}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-[14px] font-semibold text-fg disabled:opacity-50"
              >
                {shareBusy ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <>
                    <Share2 size={17} strokeWidth={1.7} /> Partager
                  </>
                )}
              </button>
            )}
            <button
              type="button"
              onClick={onDownload}
              disabled={pdfBusy}
              className="flex flex-[1.4] items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-[14px] font-semibold text-on-accent disabled:opacity-50"
            >
              {pdfBusy ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <>
                  <Download size={17} strokeWidth={2} /> Enregistrer en PDF
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function visitDateLabel(visit: { closedAt?: unknown; arrivedAt?: unknown; isClosed?: boolean }): string {
  const ts = (visit.closedAt as { toDate?: () => Date } | null)?.toDate
    ? (visit.closedAt as { toDate: () => Date }).toDate()
    : null
  if (visit.isClosed && ts) return formatDate(ts)
  const arrived = (visit.arrivedAt as { toDate?: () => Date } | null)?.toDate
    ? (visit.arrivedAt as { toDate: () => Date }).toDate()
    : null
  if (arrived) return `${formatDate(arrived)} — en cours`
  return '—'
}

function shortVisitId(id: string | null): string {
  if (!id) return '—'
  return `#V-${id.slice(-6).toUpperCase()}`
}
