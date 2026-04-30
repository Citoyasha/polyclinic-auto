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

export type VisitsMode = 'active' | 'history'

export function useCars(mode: VisitsMode = 'active') {
  const [visits, setVisits] = useState<VisitWithId[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<FirestoreError | null>(null)

  useEffect(() => {
    setLoading(true)
    const q = query(
      collection(db, 'visits'),
      where('isClosed', '==', mode === 'history'),
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
  }, [mode])

  return { visits, loading, error }
}
