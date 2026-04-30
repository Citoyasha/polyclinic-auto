import { useEffect, useState } from 'react'
import {
  collection,
  doc,
  limit,
  onSnapshot,
  query,
  where,
  type FirestoreError,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Car, Visit } from '@/types'
import type { VisitWithId } from '@/hooks/useCars'

export interface UseCarResult {
  car: Car | null
  visit: VisitWithId | null
  carLoading: boolean
  visitLoading: boolean
  error: FirestoreError | null
}

export function useCar(plateCanonical: string): UseCarResult {
  const [car, setCar] = useState<Car | null>(null)
  const [visit, setVisit] = useState<VisitWithId | null>(null)
  const [carLoading, setCarLoading] = useState(true)
  const [visitLoading, setVisitLoading] = useState(true)
  const [error, setError] = useState<FirestoreError | null>(null)

  useEffect(() => {
    if (!plateCanonical) {
      setCar(null)
      setVisit(null)
      setCarLoading(false)
      setVisitLoading(false)
      return
    }

    const unsubCar = onSnapshot(
      doc(db, 'cars', plateCanonical),
      (snap) => {
        setCar(snap.exists() ? (snap.data() as Car) : null)
        setCarLoading(false)
      },
      (err) => {
        console.error('useCar car', err)
        setError(err)
        setCarLoading(false)
      },
    )

    const unsubVisit = onSnapshot(
      query(
        collection(db, 'visits'),
        where('carId', '==', plateCanonical),
        where('isClosed', '==', false),
        limit(1),
      ),
      (snap) => {
        const first = snap.docs[0]
        setVisit(first ? ({ id: first.id, ...(first.data() as Visit) }) : null)
        setVisitLoading(false)
      },
      (err) => {
        console.error('useCar visit', err)
        setError(err)
        setVisitLoading(false)
      },
    )

    return () => {
      unsubCar()
      unsubVisit()
    }
  }, [plateCanonical])

  return { car, visit, carLoading, visitLoading, error }
}
