import { useEffect, useState } from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { upsertUserProfile } from '@/lib/mutations'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
      if (u?.uid && u.email) {
        // Best-effort mirror to users/{uid} so the upcoming assignee picker
        // has a canonical, queryable list of team members. Idempotent
        // (merge: true) and never blocks the UI.
        upsertUserProfile({
          uid: u.uid,
          email: u.email,
          displayName: u.displayName ?? undefined,
        }).catch((err) => console.warn('upsertUserProfile failed', err))
      }
    })
    return unsub
  }, [])

  return { user, loading }
}
