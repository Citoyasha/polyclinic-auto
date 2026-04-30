import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { NewVisitForm } from '@/components/NewVisitForm'

export default function NewVisit() {
  const navigate = useNavigate()
  return (
    <div className="flex h-full flex-col bg-bg">
      <div className="flex flex-none items-center gap-1 border-b border-border-soft px-2 py-2">
        <button
          type="button"
          onClick={() => navigate('/')}
          aria-label="Retour"
          className="flex h-11 w-11 items-center justify-center text-fg"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-[18px] font-semibold">Nouvelle visite</h1>
      </div>
      <div className="flex-1 overflow-auto">
        <NewVisitForm
          onCancel={() => navigate('/')}
          onCreated={() => undefined}
        />
      </div>
    </div>
  )
}
