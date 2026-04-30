const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

export interface CloudinaryUploadResult {
  url: string
  publicId: string
  width: number
  height: number
  bytes: number
}

export async function uploadToCloudinary(
  file: Blob,
  folder = 'visits',
): Promise<CloudinaryUploadResult> {
  const form = new FormData()
  form.append('file', file)
  form.append('upload_preset', UPLOAD_PRESET)
  form.append('folder', folder)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: form },
  )
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Cloudinary upload failed: ${res.status} ${text}`)
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
