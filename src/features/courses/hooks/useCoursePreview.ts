import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/api/axios'
import { API } from '@/shared/api/endpoints'
import type { CoursePreview } from '../types/course-preview'

export function useCoursePreview(courseId: string | null) {
  return useQuery({
    queryKey: ['courses', 'preview', courseId],
    queryFn: () =>
      api
        .get<CoursePreview>(API.courses.preview(courseId!))
        .then((r) => ({
          ...r.data,
          lessons: r.data.lessons.map((lesson) => ({
            ...lesson,
            videos: lesson.videos ?? [],
          })),
        })),
    enabled: !!courseId,
    staleTime: 60_000,
  })
}
