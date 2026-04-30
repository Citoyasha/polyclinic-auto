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
import type { Car, Customer, Visit } from '@/types'
import type { VisitWithId } from '@/hooks/useCars'

export interface UseCarResult {
  car: Car | null
  visit: VisitWithId | null
  customer: Customer | null
  carLoading: boolean
  visitLoading: boolean
  error: FirestoreError | null
}

export function useCar(plateCanonical: string): UseCarResult {
  const [car, setCar] = useState<Car | null>(null)
  const [visit, setVisit] = useState<VisitWithId | null>(null)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [carLoading, setCarLoading] = useState(true)
  const [visitLoading, setVisitLoading] = useState(true)
  const [error, setError] = useState<FirestoreError | null>(null)

  useEffect(() => {
    if (!plateCanonical) {
      setCar(null)
      setVisit(null)
      setCustomer(null)
      setCarLoading(false)
      setVisitLoading(false)
      return
    }

    let unsubCustomer: (() => void) | null = null
    let lastCustomerId: string | null = null

    const unsubCar = onSnapshot(
      doc(db, 'cars', plateCanonical),
      (snap) => {
        const carData = snap.exists() ? (snap.data() as Car) : null
        setCar(carData)
        setCarLoading(false)
        const nextCustomerId = carData?.customerId ?? null
        if (nextCustomerId !== lastCustomerId) {
          lastCustomerId = nextCustomerId
          unsubCustomer?.()
          unsubCustomer = null
          if (nextCustomerId) {
            unsubCustomer = onSnapshot(
              doc(db, 'customers', nextCustomerId),
              (s) => setCustomer(s.exists() ? (s.data() as Customer) : null),
              (err) => {
                console.error('useCar customer', err)
                setError(err)
              },
            )
          } else {
            setCustomer(null)
          }
        }
      },
      (err) => {
        console.error('useCar car', err)
        setError(err)
        setCarLoading(false)
      },
    )

    const unsubVisit = onSnapshot(
      query(collection(db, 'visits'), where('carId', '==', plateCanonical)),
      (snap) => {
        if (snap.empty) {
          setVisit(null)
          setVisitLoading(false)
          return
        }
        const docs: VisitWithId[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Visit),
        }))
        const active = docs.find((d) => !d.isClosed)
        const chosen =
          active ??
          docs.reduce((a, b) => {
            const aT = a.updatedAt?.toMillis?.() ?? 0
            const bT = b.updatedAt?.toMillis?.() ?? 0
            return bT > aT ? b : a
          })
        setVisit(chosen)
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
      unsubCustomer?.()
    }
  }, [plateCanonical])

  return { car, visit, customer, carLoading, visitLoading, error }
}
