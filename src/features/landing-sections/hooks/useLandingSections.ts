import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/api/axios'
import { API } from '@/shared/api/endpoints'
import type { CourseSectionCategory } from '@/features/courses/course-categories'

export interface LandingSectionContent {
  slug: CourseSectionCategory
  /** Russian text. */
  description: string
  points: string[]
  /** Kazakh text. */
  descriptionKk: string
  pointsKk: string[]
  updatedAt: string
}

/** Section text in the site language; empty when that language is not filled in. */
export function localizedSection(
  section: LandingSectionContent | undefined,
  language: string,
): { description: string; points: string[] } {
  if (!section) return { description: '', points: [] }
  return language.startsWith('ru')
    ? { description: section.description, points: section.points }
    : { description: section.descriptionKk, points: section.pointsKk }
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
