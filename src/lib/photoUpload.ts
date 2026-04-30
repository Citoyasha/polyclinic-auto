import imageCompression from 'browser-image-compression'
import { uploadToCloudinary } from '@/lib/cloudinary'
import { addPhoto } from '@/lib/mutations'

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(
      () => reject(new Error(`${label} a expiré après ${Math.round(ms / 1000)}s`)),
      ms,
    )
    promise.then(
      (v) => {
        clearTimeout(t)
        resolve(v)
      },
      (e) => {
        clearTimeout(t)
        reject(e)
      },
    )
  })
}

async function readDimensions(blob: Blob): Promise<{ width: number; height: number }> {
  if (typeof createImageBitmap !== 'function') return { width: 0, height: 0 }
  try {
    const bitmap = await withTimeout(createImageBitmap(blob), 5000, 'Lecture image')
    const { width, height } = bitmap
    bitmap.close?.()
    return { width, height }
  } catch {
    return { width: 0, height: 0 }
  }
}

const COMPRESS_SKIP_BYTES = 400_000 // ~400 KB — already small enough

async function compressIfHelpful(file: File): Promise<Blob> {
  if (file.size <= COMPRESS_SKIP_BYTES) return file
  try {
    return await withTimeout(
      imageCompression(file, {
        maxWidthOrHeight: 1280,
        initialQuality: 0.75,
        // useWebWorker disabled: workers are unreliable on some Android Chrome
        // builds and Samsung Internet. Compression on the main thread for a
        // single ~4 MB photo is a non-issue on modern phones.
        useWebWorker: false,
      }),
      30_000,
      'Compression',
    )
  } catch (err) {
    console.warn('[photoUpload] compression failed, uploading original', err)
    return file
  }
}

export async function uploadPhotoForVisit(
  file: File,
  visitId: string,
  tag: 'avant' | 'apres',
): Promise<string> {
  console.log('[photoUpload] start', {
    name: file.name,
    type: file.type,
    size: file.size,
  })
  const blob = await compressIfHelpful(file)
  console.log('[photoUpload] compressed', {
    size: blob.size,
    skipped: blob === file,
  })
  const { width, height } = await readDimensions(blob)
  console.log('[photoUpload] dimensions', { width, height })
  const uploaded = await uploadToCloudinary(blob, `visits/${visitId}`)
  console.log('[photoUpload] cloudinary done', { publicId: uploaded.publicId })
  const id = await addPhoto({
    visitId,
    url: uploaded.url,
    publicId: uploaded.publicId,
    tag,
    width: width || uploaded.width,
    height: height || uploaded.height,
    sizeBytes: uploaded.bytes,
  })
  console.log('[photoUpload] firestore done', { id })
  return id
}
