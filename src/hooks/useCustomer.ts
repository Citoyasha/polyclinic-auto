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

export type CarWithId = Car & { id: string }

export interface UseCustomerResult {
  customer: Customer | null
  cars: CarWithId[]
  visits: VisitWithId[]
  loading: boolean
  error: FirestoreError | null
}

export function useCustomer(phone: string | null): UseCustomerResult {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [cars, setCars] = useState<CarWithId[]>([])
  const [visits, setVisits] = useState<VisitWithId[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<FirestoreError | null>(null)

  useEffect(() => {
    if (!phone) {
      setCustomer(null)
      setCars([])
      setVisits([])
      setLoading(false)
      return
    }

    let pending = 3
    const settle = () => {
      pending -= 1
      if (pending <= 0) setLoading(false)
    }

    const unsubCustomer = onSnapshot(
      doc(db, 'customers', phone),
      (snap) => {
        setCustomer(snap.exists() ? (snap.data() as Customer) : null)
        settle()
      },
      (err) => {
        console.error('useCustomer customer', err)
        setError(err)
        settle()
      },
    )

    const unsubCars = onSnapshot(
      query(collection(db, 'cars'), where('customerId', '==', phone)),
      (snap) => {
        setCars(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Car) })),
        )
        settle()
      },
      (err) => {
        console.error('useCustomer cars', err)
        setError(err)
        settle()
      },
    )

    const unsubVisits = onSnapshot(
      query(collection(db, 'visits'), where('customerId', '==', phone)),
      (snap) => {
        const list: VisitWithId[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Visit),
        }))
        list.sort((a, b) => {
          const at = a.updatedAt?.toMillis?.() ?? 0
          const bt = b.updatedAt?.toMillis?.() ?? 0
          return bt - at
        })
        setVisits(list)
        settle()
      },
      (err) => {
        console.error('useCustomer visits', err)
        setError(err)
        settle()
      },
    )

    return () => {
      unsubCustomer()
      unsubCars()
      unsubVisits()
    }
  }, [phone])

  return { customer, cars, visits, loading, error }
}
