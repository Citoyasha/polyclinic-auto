import { useEffect, useState } from 'react'
import {
  collection,
  onSnapshot,
  query,
  type FirestoreError,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Customer } from '@/types'

export type CustomerWithId = Customer & { id: string }

export function useCustomers() {
  const [customers, setCustomers] = useState<CustomerWithId[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<FirestoreError | null>(null)

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'customers')),
      (snap) => {
        setCustomers(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Customer) })),
        )
        setLoading(false)
        setError(null)
      },
      (err) => {
        console.error('useCustomers', err)
        setError(err)
        setLoading(false)
      },
    )
    return unsub
  }, [])

  return { customers, loading, error }
}
