import { useEffect, useState } from 'react'
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  type FirestoreError,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Mechanic } from '@/types'

export type MechanicWithId = Mechanic & { id: string }

export function useMechanics() {
  const [mechanics, setMechanics] = useState<MechanicWithId[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<FirestoreError | null>(null)

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'mechanics'), orderBy('name', 'asc')),
      (snap) => {
        setMechanics(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Mechanic) })),
        )
        setLoading(false)
        setError(null)
      },
      (err) => {
        console.error('useMechanics', err)
        setError(err)
        setLoading(false)
      },
    )
    return unsub
  }, [])

  return { mechanics, loading, error }
}
