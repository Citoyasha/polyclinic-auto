import type { Timestamp } from 'firebase/firestore'

export type VisitStatus =
  | 'diagnostic'
  | 'en_cours'
  | 'en_attente_pieces'
  | 'pret'
  | 'termine'
  | null

export const STATUS_LABELS: Record<NonNullable<VisitStatus>, string> = {
  diagnostic: 'Diagnostic',
  en_cours: 'En cours',
  en_attente_pieces: 'En attente pièces',
  pret: 'Prêt',
  termine: 'Terminé',
}

export interface Customer {
  phone: string
  rawPhone: string
  name: string
  notes?: string
  carIds: string[]
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface Car {
  plate: string
  rawPlate: string
  make?: string
  model?: string
  color?: string
  year?: number
  customerId: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface CarSnapshot {
  plate: string
  rawPlate: string
  make?: string
  model?: string
  color?: string
}

export interface CustomerSnapshot {
  name: string
  phone: string
}

export interface Visit {
  carId: string
  customerId: string
  status?: VisitStatus
  summary: string
  isClosed: boolean
  arrivedAt: Timestamp
  closedAt?: Timestamp | null
  updatedAt: Timestamp
  carSnapshot: CarSnapshot
  customerSnapshot: CustomerSnapshot
  total: number
}

export interface Task {
  description: string
  notes?: string
  isDone: boolean
  price: number
  createdAt: Timestamp
  order: number
}

export interface LineItem {
  description: string
  quantity: number
  unitPrice: number
  total: number
  createdAt: Timestamp
  order: number
}

export interface Photo {
  url: string
  publicId: string
  tag: 'avant' | 'apres'
  uploadedAt: Timestamp
  width: number
  height: number
  sizeBytes: number
}

export interface InventoryItem {
  name: string
  type: 'piece' | 'fluide'
  unit?: string
  currentStock: number
  lowStockThreshold: number
  createdAt: Timestamp
  updatedAt: Timestamp
}

export function defaultUnitFor(type: 'piece' | 'fluide'): string {
  return type === 'fluide' ? 'L' : 'u.'
}

export interface InventoryMovement {
  itemId: string
  delta: number
  note?: string
  createdAt: Timestamp
  userEmail: string
}

export interface UserProfile {
  uid: string
  email: string
  displayName?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}
