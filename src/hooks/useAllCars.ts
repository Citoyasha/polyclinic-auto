import { useEffect, useState } from 'react'
import {
  collection,
  onSnapshot,
  query,
  type FirestoreError,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Car } from '@/types'

export type CarWithId = Car & { id: string }

export function useAllCars() {
  const [cars, setCars] = useState<CarWithId[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<FirestoreError | null>(null)

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'cars')),
      (snap) => {
        setCars(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Car) })),
        )
        setLoading(false)
        setError(null)
      },
      (err) => {
        console.error('useAllCars', err)
        setError(err)
        setLoading(false)
      },
    )
    return unsub
  }, [])

  return { cars, loading, error }
}
