import { getApiBaseUrl } from '@/shared/api/base-url'
import type { LessonVideo } from '@/shared/types'

/** Playable address for an uploaded video: the per-viewer API stream, or the origin URL for authors. */
export function resolveStreamUrl(video: Pick<LessonVideo, 'streamUrl' | 'url'>): string | null {
  if (video.streamUrl) return `${getApiBaseUrl()}${video.streamUrl}`
  return video.url ?? null
}
