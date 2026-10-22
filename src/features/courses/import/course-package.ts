import JSZip from 'jszip'

/**
 * Course package: a ZIP with `course.json` at the root, optional `lessons/*.md`
 * (referenced by `contentFile`), `materials/*` files and a cover image.
 */
export interface PackageVideo {
  title: string
  youtubeUrl: string
}

export interface PackageMaterial {
  /** Path inside the zip, e.g. materials/slides.pdf */
  file: string
  title?: string
}

export interface PackageLesson {
  title: string
  content?: string
  contentFile?: string
  isPublished?: boolean
  videos?: PackageVideo[]
  materials?: PackageMaterial[]
}

export interface CoursePackageManifest {
  version?: number
  title: string
  description: string
  category?: 'publication' | 'methods' | 'tools' | 'wellness'
  priceCents?: number
  cover?: string
  publish?: boolean
  lessons: PackageLesson[]
}

export interface ParsedLesson {
  title: string
  content: string
  isPublished: boolean
  videos: PackageVideo[]
  materials: { title: string; file: File }[]
}

export interface ParsedCoursePackage {
  manifest: CoursePackageManifest
  cover: File | null
  lessons: ParsedLesson[]
  fileCount: number
}

const MIME_BY_EXT: Record<string, string> = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  doc: 'application/msword',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  csv: 'text/csv',
  txt: 'text/plain',
  md: 'text/markdown',
  ipynb: 'application/x-ipynb+json',
  json: 'application/json',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
}

export function mimeForName(name: string): string {
  const ext = name.toLowerCase().split('.').pop() ?? ''
  return MIME_BY_EXT[ext] ?? 'application/octet-stream'
}

async function fileFromZip(zip: JSZip, path: string): Promise<File> {
  const entry = zip.file(path)
  if (!entry) throw new Error(`Файл не найден в архиве: ${path}`)
  const blob = await entry.async('blob')
  const name = path.split('/').pop() ?? path
  return new File([blob], name, { type: mimeForName(name) })
}

export async function parseCoursePackage(zipFile: File): Promise<ParsedCoursePackage> {
  const zip = await JSZip.loadAsync(zipFile)
  const manifestEntry = zip.file('course.json')
  if (!manifestEntry) throw new Error('В архиве нет course.json')
  const manifest = JSON.parse(await manifestEntry.async('string')) as CoursePackageManifest
  if (!manifest.title?.trim()) throw new Error('В course.json не указано название курса')
  if (!Array.isArray(manifest.lessons) || manifest.lessons.length === 0) {
    throw new Error('В course.json нет уроков')
  }

  let fileCount = 0
  const lessons: ParsedLesson[] = []
  for (const [index, lesson] of manifest.lessons.entries()) {
    if (!lesson.title?.trim()) throw new Error(`У урока ${index + 1} нет названия`)
    let content = lesson.content ?? ''
    if (lesson.contentFile) {
      const entry = zip.file(lesson.contentFile)
      if (!entry) throw new Error(`Файл урока не найден: ${lesson.contentFile}`)
      content = await entry.async('string')
    }
    const materials: ParsedLesson['materials'] = []
    for (const m of lesson.materials ?? []) {
      const file = await fileFromZip(zip, m.file)
      materials.push({ title: m.title?.trim() || file.name, file })
      fileCount += 1
    }
    lessons.push({
      title: lesson.title.trim(),
      content,
      isPublished: lesson.isPublished ?? true,
      videos: (lesson.videos ?? []).filter((v) => v.youtubeUrl?.trim()),
      materials,
    })
  }

  const cover = manifest.cover ? await fileFromZip(zip, manifest.cover) : null
  if (cover) fileCount += 1
  return { manifest, cover, lessons, fileCount }
}
