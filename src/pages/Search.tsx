import { Eyebrow } from '@/components/Eyebrow'
import { BottomNav } from '@/components/BottomNav'

export default function Search() {
  return (
    <div className="flex h-full flex-col bg-bg">
      <div className="px-5 pt-2 pb-1">
        <Eyebrow>Garage</Eyebrow>
        <div className="mt-0.5 text-[26px] font-semibold tracking-[-0.4px]">
          Recherche
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center text-[14px] text-fg-muted">
        À venir.
      </div>
      <BottomNav />
    </div>
  )
}
