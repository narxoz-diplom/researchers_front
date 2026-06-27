import { api } from '@/shared/api/axios'
import { API } from '@/shared/api/endpoints'

const UPLOAD_SEGMENT = '/upload/'

function safeFilename(filename: string): string {
  return filename.replace(/[/\\?%*:|"<>]/g, '_') || 'download'
}

/** Forces browser download for Cloudinary-hosted files (cross-origin `download` attr is ignored). */
export function getMaterialDownloadUrl(url: string, filename: string): string {
  if (!url.includes('res.cloudinary.com') || url.includes('fl_attachment')) {
    return url
  }

  const idx = url.indexOf(UPLOAD_SEGMENT)
  if (idx === -1) return url

  const safeName = safeFilename(filename)
  const prefix = url.slice(0, idx + UPLOAD_SEGMENT.length)
  const suffix = url.slice(idx + UPLOAD_SEGMENT.length)

  return `${prefix}fl_attachment:${encodeURIComponent(safeName)}/${suffix}`
}

/** Prefer API proxy — works with restricted Cloudinary PDF delivery and auth. */
export async function downloadMaterialById(
  materialId: string,
  filename: string,
): Promise<void> {
  const response = await api.get<Blob>(API.materials.download(materialId), {
    responseType: 'blob',
  })

  const objectUrl = URL.createObjectURL(response.data)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = safeFilename(filename)
  link.rel = 'noopener noreferrer'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(objectUrl)
}

/** @deprecated Use downloadMaterialById when material id is available. */
export function downloadMaterialFile(url: string, filename: string): void {
  const link = document.createElement('a')
  link.href = getMaterialDownloadUrl(url, filename)
  link.download = filename
  link.rel = 'noopener noreferrer'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
