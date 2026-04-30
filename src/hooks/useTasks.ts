import { useEffect, useState } from 'react'
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  type FirestoreError,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Task } from '@/types'

export type TaskWithId = Task & { id: string }

export function useTasks(visitId: string | null) {
  const [tasks, setTasks] = useState<TaskWithId[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<FirestoreError | null>(null)

  useEffect(() => {
    if (!visitId) {
      setTasks([])
      setLoading(false)
      return
    }
    const unsub = onSnapshot(
      query(
        collection(db, 'visits', visitId, 'tasks'),
        orderBy('order', 'asc'),
      ),
      (snap) => {
        setTasks(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Task) })),
        )
        setLoading(false)
        setError(null)
      },
      (err) => {
        console.error('useTasks', err)
        setError(err)
        setLoading(false)
      },
    )
    return unsub
  }, [visitId])

  return { tasks, loading, error }
}
