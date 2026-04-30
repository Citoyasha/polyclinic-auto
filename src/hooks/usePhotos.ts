import { useEffect, useState } from 'react'
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  type FirestoreError,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Photo } from '@/types'

export type PhotoWithId = Photo & { id: string }

export function usePhotos(visitId: string | null) {
  const [photos, setPhotos] = useState<PhotoWithId[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<FirestoreError | null>(null)

  useEffect(() => {
    if (!visitId) {
      setPhotos([])
      setLoading(false)
      return
    }
    const unsub = onSnapshot(
      query(
        collection(db, 'visits', visitId, 'photos'),
        orderBy('uploadedAt', 'desc'),
      ),
      (snap) => {
        setPhotos(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Photo) })),
        )
        setLoading(false)
        setError(null)
      },
      (err) => {
        console.error('usePhotos', err)
        setError(err)
        setLoading(false)
      },
    )
    return unsub
  }, [visitId])

  return { photos, loading, error }
}
