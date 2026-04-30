const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined

export interface CloudinaryUploadResult {
  url: string
  publicId: string
  width: number
  height: number
  bytes: number
}

interface CloudinaryError {
  error?: { message?: string }
}

export async function uploadToCloudinary(
  file: Blob,
  folder = 'visits',
): Promise<CloudinaryUploadResult> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      'Cloudinary non configuré (VITE_CLOUDINARY_CLOUD_NAME ou VITE_CLOUDINARY_UPLOAD_PRESET manquant).',
    )
  }

  const form = new FormData()
  form.append('file', file)
  form.append('upload_preset', UPLOAD_PRESET)
  form.append('folder', folder)

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 90_000)

  let res: Response
  try {
    res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: 'POST', body: form, signal: controller.signal },
    )
  } catch (err) {
    const aborted = (err as { name?: string } | null)?.name === 'AbortError'
    if (aborted) {
      throw new Error('Téléversement Cloudinary expiré (90s).')
    }
    const msg = err instanceof Error ? err.message : String(err)
    throw new Error(`Réseau Cloudinary indisponible : ${msg}`)
  } finally {
    clearTimeout(timeoutId)
  }

  if (!res.ok) {
    let detail = ''
    try {
      const body = (await res.json()) as CloudinaryError
      detail = body?.error?.message ?? ''
    } catch {
      try {
        detail = await res.text()
      } catch {
        /* noop */
      }
    }
    throw new Error(
      `Cloudinary ${res.status}${detail ? ` — ${detail}` : ''}`.trim(),
    )
  }

  const json = (await res.json()) as {
    secure_url: string
    public_id: string
    width: number
    height: number
    bytes: number
  }
  return {
    url: json.secure_url,
    publicId: json.public_id,
    width: json.width,
    height: json.height,
    bytes: json.bytes,
  }
}
