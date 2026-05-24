const UPLOAD_SEGMENT = '/upload/'

/** Forces browser download for Cloudinary-hosted files (cross-origin `download` attr is ignored). */
export function getMaterialDownloadUrl(url: string, filename: string): string {
  if (!url.includes('res.cloudinary.com') || url.includes('fl_attachment')) {
    return url
  }

  const idx = url.indexOf(UPLOAD_SEGMENT)
  if (idx === -1) return url

  const safeName = filename.replace(/[/\\?%*:|"<>]/g, '_') || 'download'
  const prefix = url.slice(0, idx + UPLOAD_SEGMENT.length)
  const suffix = url.slice(idx + UPLOAD_SEGMENT.length)

  return `${prefix}fl_attachment:${encodeURIComponent(safeName)}/${suffix}`
}

export function downloadMaterialFile(url: string, filename: string): void {
  const link = document.createElement('a')
  link.href = getMaterialDownloadUrl(url, filename)
  link.download = filename
  link.rel = 'noopener noreferrer'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
