import { api } from '@/shared/api/axios'
import { API } from '@/shared/api/endpoints'
import { uploadMedia } from '@/features/media/upload'
import type { Course, Lesson } from '@/shared/types'
import type { ParsedCoursePackage } from './course-package'

export interface ImportProgress {
  step: string
  done: number
  total: number
}

export interface ImportOptions {
  /** Admins only: the author the course is created for. */
  authorId?: string
  onProgress: (p: ImportProgress) => void
}

/**
 * Creates the course through the same endpoints the studio uses, step by step:
 * course → cover → lessons → videos → materials → publish.
 */
export async function runCourseImport(
  pkg: ParsedCoursePackage,
  options: ImportOptions,
): Promise<{ courseId: string }> {
  const total =
    1 +
    (pkg.cover ? 1 : 0) +
    pkg.lessons.reduce((n, l) => n + 1 + l.videos.length + l.materials.length, 0) +
    (pkg.manifest.publish ? 1 : 0)
  let done = 0
  const report = (step: string) => options.onProgress({ step, done, total })

  report(`Курс: ${pkg.manifest.title}`)
  const course = await api
    .post<Course>(API.courses.create, {
      title: pkg.manifest.title,
      description: pkg.manifest.description ?? '',
      ...(pkg.manifest.category ? { category: pkg.manifest.category } : {}),
      ...(pkg.manifest.priceCents != null ? { priceCents: pkg.manifest.priceCents } : {}),
      ...(options.authorId ? { authorId: options.authorId } : {}),
    })
    .then((r) => r.data)
  done += 1

  if (pkg.cover) {
    report('Обложка')
    const uploaded = await uploadMedia(pkg.cover, {
      resourceType: 'image',
      folder: `courses/${course.id}/cover`,
    })
    await api.patch(API.courses.update(course.id), { coverUrl: uploaded.secure_url })
    done += 1
  }

  for (const [index, lesson] of pkg.lessons.entries()) {
    report(`Урок ${index + 1}: ${lesson.title}`)
    const created = await api
      .post<Lesson>(API.lessons.create(course.id), {
        title: lesson.title,
        content: lesson.content,
        orderNumber: index + 1,
        isPublished: lesson.isPublished,
      })
      .then((r) => r.data)
    done += 1

    for (const video of lesson.videos) {
      report(`Урок ${index + 1}: видео ${video.title}`)
      await api.post(API.videos.attachYoutube(created.id), {
        title: video.title,
        youtubeUrl: video.youtubeUrl,
      })
      done += 1
    }

    for (const material of lesson.materials) {
      report(`Урок ${index + 1}: файл ${material.title}`)
      const uploaded = await uploadMedia(material.file, {
        resourceType: 'raw',
        folder: `courses/${course.id}/lessons/${created.id}/materials`,
      })
      await api.post(API.materials.attach(created.id), {
        title: material.title,
        cloudinaryPublicId: uploaded.public_id,
        url: uploaded.secure_url,
        mimeType: material.file.type || 'application/octet-stream',
        sizeBytes: uploaded.bytes,
      })
      done += 1
    }
  }

  if (pkg.manifest.publish) {
    report('Публикация курса')
    await api.post(API.courses.publish(course.id))
    done += 1
  }
  report('Готово')
  return { courseId: course.id }
}
