import type { LessonMaterial } from '@/shared/types'

export type MaterialKind = 'pdf' | 'image' | 'text' | 'docx' | 'unsupported'

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

/** How the in-page viewer shows a material. */
export function materialKind(
  material: Pick<LessonMaterial, 'mimeType' | 'title' | 'htmlUrl'>,
): MaterialKind {
  const mime = material.mimeType.toLowerCase()
  const ext = material.title.toLowerCase().split('.').pop() ?? ''
  if (mime === 'application/pdf' || ext === 'pdf') return 'pdf'
  if (mime.startsWith('image/')) return 'image'
  if (mime.startsWith('text/') || ['txt', 'md', 'csv'].includes(ext)) return 'text'
  if (mime === DOCX_MIME || material.htmlUrl || ext === 'docx') return 'docx'
  return 'unsupported'
}
