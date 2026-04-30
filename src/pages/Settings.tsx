import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useAuth } from '@/hooks/useAuth'
import { Avatar, deriveInitials } from '@/components/Avatar'

export default function Settings() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const initials = deriveInitials(user?.displayName ?? null, user?.email ?? null)

  return (
    <div className="flex h-full flex-col bg-bg">
      <div className="flex flex-none items-center justify-between border-b border-border-soft px-2 py-1">
        <button
          type="button"
          onClick={() => navigate('/')}
          aria-label="Retour"
          className="flex h-11 w-11 items-center justify-center text-fg"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="text-[16px] font-semibold">Compte</div>
        <div className="w-11" />
      </div>
      <div className="flex-1 overflow-auto p-5">
        <div className="mb-5 flex items-center gap-3.5 rounded-[14px] border border-border bg-surface p-[18px]">
          <Avatar initials={initials} size={48} variant="accent" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[15px] font-semibold">
              {user?.displayName || user?.email?.split('@')[0] || 'Compte'}
            </div>
            <div className="truncate text-[13px] text-fg-muted">
              {user?.email ?? '—'}
            </div>
          </div>
        </div>

        <SettingRow label="Version de l'application" value="1.0.0" muted />

        <button
          type="button"
          onClick={() => signOut(auth)}
          className="mt-6 w-full rounded-xl border border-border bg-transparent px-4 py-3 text-[14.5px] font-semibold text-danger"
        >
          Déconnexion
        </button>
      </div>
    </div>
  )
}

function SettingRow({
  label,
  value,
  muted,
}: {
  label: string
  value: string
  muted?: boolean
}) {
  return (
    <div className="flex items-center justify-between border-b border-border-soft px-1 py-3.5">
      <span className="text-[14.5px] text-fg">{label}</span>
      <span
        className={
          muted
            ? 'font-mono text-[13.5px] text-fg-muted'
            : 'text-[13.5px] text-fg'
        }
      >
        {value}
      </span>
    </div>
  )
}
