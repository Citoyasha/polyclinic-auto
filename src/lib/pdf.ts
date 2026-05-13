import type { TDocumentDefinitions, Content, TableCell } from 'pdfmake/interfaces'
import { STR } from '@/lib/strings'
import { formatDate } from '@/lib/format'
import type { Car, Customer, Visit } from '@/types'
import type { TaskWithId } from '@/hooks/useTasks'
import type { LineItemWithId } from '@/hooks/useLineItems'

export interface ReceiptData {
  visitId: string
  visit: Visit
  car: Car | null
  customer: Customer | null
  tasks: TaskWithId[]
  lineItems: LineItemWithId[]
}

const ACCENT = '#1d4ed8'
const FG_MUTED = '#6b716f'
const BORDER = '#e5e5e2'
const SURFACE_ALT = '#f1f1ee'

function visitDate(visit: Visit): string {
  const ts = visit.closedAt ?? visit.arrivedAt ?? visit.updatedAt
  const date = ts?.toDate?.()
  return date ? formatDate(date) : '—'
}

function shortVisitId(visitId: string): string {
  return `V-${visitId.slice(-6).toUpperCase()}`
}

export function buildReceiptDoc(data: ReceiptData): TDocumentDefinitions {
  const { visit, car, customer, tasks, lineItems } = data
  const billableTasks = tasks.filter((t) => (t.price ?? 0) > 0)
  const tasksTotal = billableTasks.reduce((s, t) => s + (t.price || 0), 0)
  const linesTotal = lineItems.reduce(
    (s, l) => s + (l.total ?? l.quantity * l.unitPrice),
    0,
  )
  const grandTotal = tasksTotal + linesTotal

  const carLine = [car?.make, car?.model, car?.color, car?.year]
    .filter(Boolean)
    .join(' · ')
  const plate = car?.rawPlate || visit.carSnapshot?.rawPlate || visit.carId

  const content: Content[] = [
    // Garage header
    {
      stack: [
        { text: 'GARAGE', style: 'eyebrow', alignment: 'center' },
        { text: STR.app.garageName, style: 'h1', alignment: 'center' },
        {
          text: `${STR.app.garageAddress} · ${STR.app.garagePhone}`,
          style: 'meta',
          alignment: 'center',
          margin: [0, 2, 0, 0],
        },
      ],
      margin: [0, 0, 0, 14],
    },
    { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineColor: BORDER, lineWidth: 0.6 }] },

    // Meta row
    {
      columns: [
        {
          width: '*',
          stack: [
            { text: 'DATE', style: 'eyebrow' },
            { text: visitDate(visit), style: 'metaValue', margin: [0, 3, 0, 0] },
          ],
        },
        {
          width: '*',
          alignment: 'right',
          stack: [
            { text: 'VISITE', style: 'eyebrow' },
            { text: shortVisitId(data.visitId), style: 'metaValue', margin: [0, 3, 0, 0] },
          ],
        },
      ],
      margin: [0, 12, 0, 12],
    },
    { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineColor: BORDER, lineWidth: 0.6 }] },

    // Customer + car block
    {
      columns: [
        {
          width: '*',
          stack: [
            { text: 'CLIENT', style: 'eyebrow' },
            {
              text: customer?.name || visit.customerSnapshot?.name || '—',
              style: 'fieldValue',
              margin: [0, 5, 0, 0],
            },
            {
              text: customer?.rawPhone || customer?.phone || visit.customerSnapshot?.phone || '',
              style: 'metaValue',
              margin: [0, 2, 0, 0],
            },
          ],
        },
        {
          width: '*',
          stack: [
            { text: 'VOITURE', style: 'eyebrow' },
            { text: plate, style: 'plate', margin: [0, 5, 0, 0] },
            ...(carLine
              ? [{ text: carLine, style: 'metaValue', margin: [0, 4, 0, 0] as [number, number, number, number] }]
              : []),
            ...(visit.assigneeName
              ? [
                  {
                    text: `Mécanicien : ${visit.assigneeName}`,
                    style: 'metaValue',
                    margin: [0, 4, 0, 0] as [number, number, number, number],
                  },
                ]
              : []),
          ],
        },
      ],
      margin: [0, 12, 0, 12],
    },
    { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineColor: BORDER, lineWidth: 0.6 }] },
  ]

  // Tasks table
  if (billableTasks.length > 0) {
    content.push({
      text: 'TÂCHES',
      style: 'eyebrow',
      margin: [0, 14, 0, 8],
    })
    content.push({
      table: {
        widths: ['*', 70],
        body: billableTasks.map<TableCell[]>((t) => [
          { text: t.description || '—', style: 'cell' },
          { text: `${t.price} TND`, style: 'cellMono', alignment: 'right' },
        ]),
      },
      layout: rowLayout(),
    })
    content.push({
      columns: [
        { text: 'Sous-total tâches', style: 'subtotalLabel' },
        { text: `${tasksTotal} TND`, style: 'subtotalValue', alignment: 'right' },
      ],
      margin: [0, 6, 0, 12],
    })
    content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineColor: BORDER, lineWidth: 0.6 }] })
  }

  // Line items table
  if (lineItems.length > 0) {
    content.push({
      text: 'PIÈCES & FOURNITURES',
      style: 'eyebrow',
      margin: [0, 14, 0, 8],
    })
    const headerRow: TableCell[] = [
      { text: 'Description', style: 'colHead' },
      { text: 'Qté', style: 'colHead', alignment: 'right' },
      { text: 'PU', style: 'colHead', alignment: 'right' },
      { text: 'Total', style: 'colHead', alignment: 'right' },
    ]
    const lineRows: TableCell[][] = lineItems.map((l) => {
      const lt = l.total ?? l.quantity * l.unitPrice
      return [
        { text: l.description || '—', style: 'cell' },
        { text: String(l.quantity), style: 'cellMono', alignment: 'right' },
        { text: String(l.unitPrice), style: 'cellMono', alignment: 'right' },
        { text: `${lt} TND`, style: 'cellMono', alignment: 'right' },
      ]
    })
    content.push({
      table: {
        widths: ['*', 40, 60, 70],
        body: [headerRow, ...lineRows],
      },
      layout: rowLayout(),
    })
    content.push({
      columns: [
        { text: 'Sous-total pièces', style: 'subtotalLabel' },
        { text: `${linesTotal} TND`, style: 'subtotalValue', alignment: 'right' },
      ],
      margin: [0, 6, 0, 12],
    })
    content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineColor: BORDER, lineWidth: 0.6 }] })
  }

  // Grand total
  content.push({
    columns: [
      { text: 'TOTAL', style: 'totalLabel' },
      { text: `${grandTotal} TND`, style: 'totalValue', alignment: 'right' },
    ],
    margin: [0, 18, 0, 0],
  })

  // Payment (advance + remaining)
  const cashAdvance = visit.cashAdvance ?? 0
  if (cashAdvance > 0) {
    const remaining = Math.max(0, grandTotal - cashAdvance)
    content.push({
      stack: [
        {
          columns: [
            { text: 'Avance reçue', style: 'subtotalLabel' },
            { text: `${cashAdvance} TND`, style: 'subtotalValue', alignment: 'right' },
          ],
          margin: [0, 0, 0, 4],
        },
        {
          columns: [
            { text: 'Reste à payer', style: 'subtotalLabel', bold: true },
            {
              text: `${remaining} TND`,
              style: 'subtotalValue',
              alignment: 'right',
              bold: true,
              color: remaining > 0 ? '#b45309' : '#15803d',
            },
          ],
        },
      ],
      margin: [0, 10, 0, 0],
    })
  }

  // Notes / résumé
  if (visit.summary?.trim()) {
    content.push({
      table: {
        widths: ['*'],
        body: [
          [
            {
              stack: [
                { text: 'NOTES', style: 'eyebrow' },
                { text: visit.summary, style: 'cell', margin: [0, 4, 0, 0] },
              ],
              fillColor: SURFACE_ALT,
              border: [false, false, false, false],
              margin: [10, 8, 10, 10],
            },
          ],
        ],
      },
      layout: 'noBorders',
      margin: [0, 18, 0, 0],
    })
  }

  return {
    pageSize: 'A4',
    pageMargins: [40, 40, 40, 50],
    defaultStyle: { font: 'Roboto', fontSize: 10, color: '#1a1d1c', lineHeight: 1.3 },
    styles: {
      eyebrow: { fontSize: 8, color: FG_MUTED, characterSpacing: 1, bold: true },
      h1: { fontSize: 18, bold: true, characterSpacing: -0.3 },
      meta: { fontSize: 9, color: FG_MUTED },
      metaValue: { fontSize: 10.5, color: FG_MUTED },
      fieldValue: { fontSize: 11, bold: true },
      plate: { fontSize: 12, bold: true, characterSpacing: 0.6 },
      colHead: { fontSize: 8, color: FG_MUTED, bold: true, characterSpacing: 0.5 },
      cell: { fontSize: 10.5 },
      cellMono: { fontSize: 10.5 },
      subtotalLabel: { fontSize: 10, color: FG_MUTED },
      subtotalValue: { fontSize: 10, color: FG_MUTED },
      totalLabel: { fontSize: 13, bold: true, characterSpacing: 0.3 },
      totalValue: { fontSize: 22, bold: true, color: ACCENT, characterSpacing: -0.5 },
    },
    footer: () => ({
      text: STR.app.receiptFooter,
      alignment: 'center',
      style: 'meta',
      margin: [0, 14, 0, 0],
    }),
    content,
  }
}

function rowLayout() {
  return {
    hLineWidth: (i: number, node: { table: { body: unknown[] } }) => {
      if (i === 0 || i === node.table.body.length) return 0
      return 0.5
    },
    vLineWidth: () => 0,
    hLineColor: () => BORDER,
    paddingTop: () => 6,
    paddingBottom: () => 6,
    paddingLeft: () => 0,
    paddingRight: () => 0,
  }
}

function sanitizeForFilename(s: string): string {
  return s.replace(/[^a-zA-Z0-9-]+/g, '').slice(0, 24) || 'recu'
}

function todayCompact(): string {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}${mm}${dd}`
}

interface PdfMakeLike {
  vfs?: Record<string, string>
  addVirtualFileSystem?: (fonts: Record<string, string>) => void
  createPdf: (def: TDocumentDefinitions) => {
    download: (filename?: string) => void
    getBlob: (cb: (blob: Blob) => void) => void
  }
}

let pdfMakePromise: Promise<PdfMakeLike> | null = null

async function loadPdfMake(): Promise<PdfMakeLike> {
  if (!pdfMakePromise) {
    pdfMakePromise = (async () => {
      const [pdfMakeMod, vfsMod] = await Promise.all([
        import('pdfmake/build/pdfmake'),
        import('pdfmake/build/vfs_fonts'),
      ])
      const pdfMake = (pdfMakeMod as { default?: PdfMakeLike }).default ??
        (pdfMakeMod as unknown as PdfMakeLike)
      const fonts =
        ((vfsMod as { default?: Record<string, string> }).default as
          | Record<string, string>
          | undefined) ?? (vfsMod as unknown as Record<string, string>)
      if (typeof pdfMake.addVirtualFileSystem === 'function') {
        pdfMake.addVirtualFileSystem(fonts)
      } else {
        pdfMake.vfs = fonts
      }
      return pdfMake
    })()
  }
  return pdfMakePromise
}

function receiptFilename(data: ReceiptData): string {
  const plate = sanitizeForFilename(
    data.car?.plate || data.visit.carSnapshot?.plate || data.visit.carId,
  )
  return `recu-${plate}-${todayCompact()}.pdf`
}

export async function downloadReceiptPdf(data: ReceiptData): Promise<void> {
  const pdfMake = await loadPdfMake()
  pdfMake.createPdf(buildReceiptDoc(data)).download(receiptFilename(data))
}

export async function getReceiptPdfBlob(data: ReceiptData): Promise<Blob> {
  const pdfMake = await loadPdfMake()
  return new Promise((resolve) => {
    pdfMake.createPdf(buildReceiptDoc(data)).getBlob((blob) => resolve(blob))
  })
}

export function getReceiptFilename(data: ReceiptData): string {
  return receiptFilename(data)
}
