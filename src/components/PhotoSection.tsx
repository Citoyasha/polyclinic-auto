import { useRef, useState } from 'react'
import { Camera, ImagePlus, Loader2, ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { uploadPhotoForVisit } from '@/lib/photoUpload'
import { PhotoViewer } from '@/components/PhotoViewer'
import type { PhotoTag } from '@/types'
import type { PhotoWithId } from '@/hooks/usePhotos'

const TABS: { id: PhotoTag; label: string; short: string }[] = [
  { id: 'avant', label: 'Avant', short: 'AV' },
  { id: 'apres', label: 'Après', short: 'AP' },
  { id: 'recu', label: 'Reçus', short: 'RC' },
]

const SHORT_BY_TAG: Record<PhotoTag, string> = {
  avant: 'AV',
  apres: 'AP',
  recu: 'RC',
}

interface PendingUpload {
  id: string
  blobUrl: string
  tag: PhotoTag
}

const PLACEHOLDER_TILES = 3

export function PhotoSection({
  visitId,
  photos,
  disabled,
}: {
  visitId: string
  photos: PhotoWithId[]
  disabled?: boolean
}) {
  const [tab, setTab] = useState<PhotoTag>('avant')
  const [pending, setPending] = useState<PendingUpload[]>([])
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)
  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)

  const tabPhotos = photos.filter((p) => p.tag === tab)
  const tabPending = pending.filter((p) => p.tag === tab)

  const handleFiles = async (files: FileList | null) => {
    console.log('PhotoSection handleFiles', {
      count: files?.length ?? 0,
      disabled,
    })
    if (!files || files.length === 0) {
      toast.info('Aucun fichier sélectionné.')
      return
    }
    if (disabled) {
      toast.error('Visite verrouillée.')
      return
    }
    const list = Array.from(files)
    for (const file of list) {
      console.log('PhotoSection upload start', {
        name: file.name,
        type: file.type,
        size: file.size,
      })
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
      const blobUrl = URL.createObjectURL(file)
      setPending((prev) => [...prev, { id, blobUrl, tag: tab }])
      const promise = uploadPhotoForVisit(file, visitId, tab)
      toast.promise(promise, {
        loading: 'Téléversement…',
        success: 'Photo ajoutée',
        error: (err: unknown) => {
          console.error('photo upload', err)
          const msg = err instanceof Error ? err.message : String(err)
          return `Échec : ${msg}`
        },
      })
      try {
        await promise
      } catch {
        // toast.promise already surfaced the error
      } finally {
        setPending((prev) => prev.filter((p) => p.id !== id))
        URL.revokeObjectURL(blobUrl)
      }
    }
  }

  const padTo = Math.max(
    PLACEHOLDER_TILES,
    tabPhotos.length + tabPending.length,
  )
  const placeholders = padTo - tabPhotos.length - tabPending.length

  return (
    <div>
      <div className="flex gap-6 border-b border-border-soft">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              '-mb-px border-b-2 pb-2.5 text-[14px] font-semibold transition-colors',
              tab === id
                ? 'border-accent text-fg'
                : 'border-transparent text-fg-muted',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-3.5 grid grid-cols-3 gap-2">
        {tabPhotos.map((photo, i) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setViewerIndex(i)}
            className="relative aspect-square overflow-hidden rounded-[10px] bg-thumb-bg"
          >
            <img
              src={photo.url}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <span className="absolute right-1.5 top-1.5 rounded bg-black/55 px-1.5 py-[1px] text-[9px] font-semibold uppercase tracking-[0.5px] text-white">
              {SHORT_BY_TAG[photo.tag]}
            </span>
          </button>
        ))}
        {tabPending.map((p) => (
          <div
            key={p.id}
            className="relative aspect-square overflow-hidden rounded-[10px] bg-thumb-bg"
          >
            <img
              src={p.blobUrl}
              alt=""
              className="h-full w-full object-cover opacity-80"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-black/30 text-white">
              <Loader2 size={20} className="animate-spin" />
            </span>
          </div>
        ))}
        {Array.from({ length: placeholders }).map((_, i) => (
          <div
            key={`ph-${i}`}
            className="flex aspect-square items-center justify-center rounded-[10px] border border-dashed border-border bg-thumb-bg text-fg-muted"
          >
            <ImageIcon size={20} strokeWidth={1.5} />
          </div>
        ))}
      </div>

      <div className="mt-3.5 flex gap-2.5">
        <button
          type="button"
          onClick={() => cameraRef.current?.click()}
          disabled={disabled}
          className="flex flex-1 items-center justify-center gap-2 rounded-[10px] border border-border bg-surface px-3.5 py-[11px] text-[13.5px] font-medium text-fg disabled:opacity-50"
        >
          <Camera size={18} strokeWidth={1.7} />
          Prendre
        </button>
        <button
          type="button"
          onClick={() => galleryRef.current?.click()}
          disabled={disabled}
          className="flex flex-1 items-center justify-center gap-2 rounded-[10px] border border-border bg-surface px-3.5 py-[11px] text-[13.5px] font-medium text-fg disabled:opacity-50"
        >
          <ImagePlus size={18} strokeWidth={1.7} />
          Importer
        </button>
      </div>

      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files)
          e.target.value = ''
        }}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files)
          e.target.value = ''
        }}
      />

      {viewerIndex !== null && tabPhotos[viewerIndex] && (
        <PhotoViewer
          visitId={visitId}
          photos={tabPhotos}
          startIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
          disabled={disabled}
        />
      )}
    </div>
  )
}
