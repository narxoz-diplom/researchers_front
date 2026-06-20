import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/api/axios'
import { API } from '@/shared/api/endpoints'
import type { Course, Meta } from '@/shared/types'
import { useDebouncedValue } from './useCourseSearch'

export function useMarketplaceCourses(limit = 8, search = '', categoryId?: string | null) {
  const debouncedSearch = useDebouncedValue(search.trim(), 350)

  return useQuery({
    queryKey: ['courses', 'marketplace', limit, debouncedSearch || undefined, categoryId || undefined],
    queryFn: () =>
      api
        .get<{ data: Course[]; meta: Meta }>(API.courses.list, {
          params: {
            pageSize: limit,
            ...(debouncedSearch ? { search: debouncedSearch } : {}),
            ...(categoryId ? { categoryId } : {}),
          },
        })
        .then((r) => r.data.data),
    staleTime: 60_000,
  })
}
