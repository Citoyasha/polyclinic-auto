import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { deletePhoto, updatePhotoTag } from '@/lib/mutations'
import type { PhotoTag } from '@/types'
import type { PhotoWithId } from '@/hooks/usePhotos'

const TAG_CYCLE: PhotoTag[] = ['avant', 'apres', 'recu']
const TAG_LABEL: Record<PhotoTag, string> = {
  avant: 'Avant',
  apres: 'Après',
  recu: 'Reçu',
}

export function PhotoViewer({
  visitId,
  photos,
  startIndex,
  onClose,
  disabled,
}: {
  visitId: string
  photos: PhotoWithId[]
  startIndex: number
  onClose: () => void
  disabled?: boolean
}) {
  const [index, setIndex] = useState(startIndex)
  const photo = photos[index]

  useEffect(() => {
    if (index >= photos.length && photos.length > 0) {
      setIndex(photos.length - 1)
    }
    if (photos.length === 0) {
      onClose()
    }
  }, [photos, index, onClose])

  if (!photo) return null

  const prev = () => setIndex((i) => Math.max(0, i - 1))
  const next = () => setIndex((i) => Math.min(photos.length - 1, i + 1))

  const onToggleTag = async () => {
    const currentIndex = TAG_CYCLE.indexOf(photo.tag)
    const nextTag =
      TAG_CYCLE[(currentIndex + 1) % TAG_CYCLE.length] ?? 'avant'
    try {
      await updatePhotoTag(visitId, photo.id, nextTag)
      toast.success(`Marqué ${TAG_LABEL[nextTag]}`)
    } catch (err) {
      console.error(err)
      toast.error('Erreur de synchronisation')
    }
  }

  const nextTagLabel =
    TAG_LABEL[
      TAG_CYCLE[(TAG_CYCLE.indexOf(photo.tag) + 1) % TAG_CYCLE.length] ??
        'avant'
    ]

  const onDelete = async () => {
    try {
      await deletePhoto(visitId, photo.id)
    } catch (err) {
      console.error(err)
      toast.error('Erreur de synchronisation')
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black">
      <button
        type="button"
        onClick={onClose}
        aria-label="Fermer"
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white"
      >
        <X size={22} />
      </button>

      <img
        src={photo.url}
        alt=""
        className="max-h-[80vh] max-w-[92vw] object-contain"
      />

      {index > 0 && (
        <button
          type="button"
          onClick={prev}
          aria-label="Précédent"
          className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white"
        >
          <ChevronLeft size={22} />
        </button>
      )}
      {index < photos.length - 1 && (
        <button
          type="button"
          onClick={next}
          aria-label="Suivant"
          className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white"
        >
          <ChevronRight size={22} />
        </button>
      )}

      <div className="absolute bottom-7 left-0 right-0 flex justify-center gap-2.5">
        <button
          type="button"
          onClick={onToggleTag}
          disabled={disabled}
          className="rounded-full bg-white/15 px-5 py-2.5 text-[13px] font-semibold text-white disabled:opacity-50"
        >
          Marquer {nextTagLabel}
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={disabled}
          aria-label="Supprimer"
          className="flex h-[42px] items-center justify-center rounded-full bg-white/15 px-4 text-white disabled:opacity-50"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  )
}
