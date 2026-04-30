import { useEffect, useState } from 'react'
import {
  doc,
  onSnapshot,
  type FirestoreError,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Car, Customer, Visit } from '@/types'

export type VisitWithIdValue = Visit & { id: string }

export interface UseVisitResult {
  visit: VisitWithIdValue | null
  car: Car | null
  customer: Customer | null
  loading: boolean
  error: FirestoreError | null
}

export function useVisit(visitId: string | null): UseVisitResult {
  const [visit, setVisit] = useState<VisitWithIdValue | null>(null)
  const [car, setCar] = useState<Car | null>(null)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<FirestoreError | null>(null)

  useEffect(() => {
    if (!visitId) {
      setVisit(null)
      setCar(null)
      setCustomer(null)
      setLoading(false)
      return
    }

    setLoading(true)
    let unsubCar: (() => void) | null = null
    let unsubCustomer: (() => void) | null = null
    let lastCarId: string | null = null
    let lastCustomerId: string | null = null

    const unsubVisit = onSnapshot(
      doc(db, 'visits', visitId),
      (snap) => {
        if (!snap.exists()) {
          setVisit(null)
          setLoading(false)
          return
        }
        const v = { id: snap.id, ...(snap.data() as Visit) }
        setVisit(v)

        if (v.carId !== lastCarId) {
          lastCarId = v.carId
          unsubCar?.()
          unsubCar = onSnapshot(
            doc(db, 'cars', v.carId),
            (s) => setCar(s.exists() ? (s.data() as Car) : null),
            (err) => {
              console.error('useVisit car', err)
              setError(err)
            },
          )
        }

        if (v.customerId !== lastCustomerId) {
          lastCustomerId = v.customerId
          unsubCustomer?.()
          unsubCustomer = onSnapshot(
            doc(db, 'customers', v.customerId),
            (s) => setCustomer(s.exists() ? (s.data() as Customer) : null),
            (err) => {
              console.error('useVisit customer', err)
              setError(err)
            },
          )
        }

        setLoading(false)
      },
      (err) => {
        console.error('useVisit visit', err)
        setError(err)
        setLoading(false)
      },
    )

    return () => {
      unsubVisit()
      unsubCar?.()
      unsubCustomer?.()
    }
  }, [visitId])

  return { visit, car, customer, loading, error }
}
