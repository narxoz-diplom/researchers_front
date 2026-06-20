import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/api/axios'
import { API } from '@/shared/api/endpoints'
import type { Course, Meta } from '@/shared/types'
import { useDebouncedValue } from './useCourseSearch'

import type { CourseSectionCategory } from '@/features/courses/course-categories'

export function useMarketplaceCourses(
  limit = 8,
  search = '',
  category?: CourseSectionCategory,
) {
  const debouncedSearch = useDebouncedValue(search.trim(), 350)

  return useQuery({
    queryKey: ['courses', 'marketplace', limit, debouncedSearch || undefined, category],
    queryFn: () =>
      api
        .get<{ data: Course[]; meta: Meta }>(API.courses.list, {
          params: {
            pageSize: limit,
            ...(debouncedSearch ? { search: debouncedSearch } : {}),
            ...(category ? { category } : {}),
          },
        })
        .then((r) => r.data.data),
    staleTime: 60_000,
  })
}
