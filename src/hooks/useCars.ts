import { useEffect, useState } from 'react'
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
  type FirestoreError,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Visit } from '@/types'

export type VisitWithId = Visit & { id: string }

export function useCars() {
  const [visits, setVisits] = useState<VisitWithId[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<FirestoreError | null>(null)

  useEffect(() => {
    const q = query(
      collection(db, 'visits'),
      where('isClosed', '==', false),
      orderBy('updatedAt', 'desc'),
      limit(50),
    )
    const unsub = onSnapshot(
      q,
      (snap) => {
        const next: VisitWithId[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Visit),
        }))
        setVisits(next)
        setLoading(false)
        setError(null)
      },
      (err) => {
        console.error('useCars error', err)
        setError(err)
        setLoading(false)
      },
    )
    return unsub
  }, [])

  return { visits, loading, error }
}
