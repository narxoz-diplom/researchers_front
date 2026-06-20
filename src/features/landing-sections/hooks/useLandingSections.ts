import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/api/axios'
import { API } from '@/shared/api/endpoints'
import type { CourseSectionCategory } from '@/features/courses/course-categories'

export interface LandingSectionContent {
  slug: CourseSectionCategory
  description: string
  points: string[]
  updatedAt: string
}

export function useLandingSections() {
  return useQuery({
    queryKey: ['landing-sections'],
    queryFn: () =>
      api.get<LandingSectionContent[]>(API.landingSections.list).then((r) => r.data),
    staleTime: 60_000,
  })
}

export function useLandingSectionMap(sections: LandingSectionContent[] | undefined) {
  return new Map((sections ?? []).map((s) => [s.slug, s]))
}
