import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { api } from '@/shared/api/axios'
import { API } from '@/shared/api/endpoints'
import type { Course, Meta } from '@/shared/types'

export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs)
    return () => window.clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}

export function useCourseSearch(query: string, limit = 8) {
  const debounced = useDebouncedValue(query.trim(), 300)
  const enabled = debounced.length >= 2

  return useQuery({
    queryKey: ['courses', 'search', debounced, limit],
    queryFn: () =>
      api
        .get<{ data: Course[]; meta: Meta }>(API.courses.list, {
          params: { search: debounced, pageSize: limit },
        })
        .then((r) => r.data),
    enabled,
    staleTime: 30_000,
  })
}
