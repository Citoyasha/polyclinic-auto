import { useEffect, useState } from 'react'
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  type FirestoreError,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { InventoryItem, InventoryMovement } from '@/types'

export type InventoryMovementWithId = InventoryMovement & { id: string }

export interface UseInventoryItemResult {
  item: (InventoryItem & { id: string }) | null
  movements: InventoryMovementWithId[]
  loading: boolean
  error: FirestoreError | null
}

export function useInventoryItem(itemId: string | null): UseInventoryItemResult {
  const [item, setItem] = useState<(InventoryItem & { id: string }) | null>(null)
  const [movements, setMovements] = useState<InventoryMovementWithId[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<FirestoreError | null>(null)

  useEffect(() => {
    if (!itemId) {
      setItem(null)
      setMovements([])
      setLoading(false)
      return
    }

    let pending = 2
    const settle = () => {
      pending -= 1
      if (pending <= 0) setLoading(false)
    }

    const unsubItem = onSnapshot(
      doc(db, 'inventory', itemId),
      (snap) => {
        setItem(
          snap.exists()
            ? { id: snap.id, ...(snap.data() as InventoryItem) }
            : null,
        )
        settle()
      },
      (err) => {
        console.error('useInventoryItem item', err)
        setError(err)
        settle()
      },
    )

    const unsubMovs = onSnapshot(
      query(
        collection(db, 'inventoryMovements'),
        where('itemId', '==', itemId),
      ),
      (snap) => {
        const list: InventoryMovementWithId[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as InventoryMovement),
        }))
        list.sort((a, b) => {
          const at = a.createdAt?.toMillis?.() ?? 0
          const bt = b.createdAt?.toMillis?.() ?? 0
          return bt - at
        })
        setMovements(list.slice(0, 50))
        settle()
      },
      (err) => {
        console.error('useInventoryItem movements', err)
        setError(err)
        settle()
      },
    )

    return () => {
      unsubItem()
      unsubMovs()
    }
  }, [itemId])

  return { item, movements, loading, error }
}
