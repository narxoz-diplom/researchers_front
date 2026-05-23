import type { SectionId } from './types'

function unsplash(id: string, width: number) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`
}

export const LANDING_IMAGES = {
  hero: unsplash('photo-1507842217343-583bb7270b66', 1600),
  finalCta: unsplash('photo-1524178232363-1fb2b075b655', 1600),
  sections: {
    about: unsplash('photo-1523240795612-9a054b0db644', 900),
    publication: unsplash('photo-1456513080510-7bf3a84b82f8', 900),
    methods: unsplash('photo-1532094349884-543bc11b234d', 900),
    tools: unsplash('photo-1551288049-bebda4e38f71', 900),
    wellness: unsplash('photo-1544367567-0f2fcb009e0b', 900),
  } satisfies Record<SectionId, string>,
} as const
