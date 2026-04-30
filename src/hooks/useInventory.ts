import { useEffect, useState } from 'react'
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  type FirestoreError,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { InventoryItem } from '@/types'

export type InventoryItemWithId = InventoryItem & { id: string }

export function useInventory() {
  const [items, setItems] = useState<InventoryItemWithId[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<FirestoreError | null>(null)

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'inventory'), orderBy('name', 'asc')),
      (snap) => {
        setItems(
          snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as InventoryItem),
          })),
        )
        setLoading(false)
        setError(null)
      },
      (err) => {
        console.error('useInventory', err)
        setError(err)
        setLoading(false)
      },
    )
    return unsub
  }, [])

  return { items, loading, error }
}
