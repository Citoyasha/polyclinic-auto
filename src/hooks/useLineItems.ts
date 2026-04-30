import { useEffect, useState } from 'react'
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  type FirestoreError,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { LineItem } from '@/types'

export type LineItemWithId = LineItem & { id: string }

export function useLineItems(visitId: string | null) {
  const [lineItems, setLineItems] = useState<LineItemWithId[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<FirestoreError | null>(null)

  useEffect(() => {
    if (!visitId) {
      setLineItems([])
      setLoading(false)
      return
    }
    const unsub = onSnapshot(
      query(
        collection(db, 'visits', visitId, 'lineItems'),
        orderBy('order', 'asc'),
      ),
      (snap) => {
        setLineItems(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as LineItem) })),
        )
        setLoading(false)
        setError(null)
      },
      (err) => {
        console.error('useLineItems', err)
        setError(err)
        setLoading(false)
      },
    )
    return unsub
  }, [visitId])

  return { lineItems, loading, error }
}
