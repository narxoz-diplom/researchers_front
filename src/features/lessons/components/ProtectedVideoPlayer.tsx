import type { SyntheticEvent } from 'react'
import { Lock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { resolveStreamUrl } from '@/features/lessons/lib/stream-url'
import type { LessonVideo } from '@/shared/types'

const prevent = (e: SyntheticEvent) => e.preventDefault()

interface Props {
  video: LessonVideo
  className?: string
}

/**
 * Plays lesson videos without handing out a link: uploaded files stream from
 * the API with a short-lived token, YouTube runs in a sandboxed embed that
 * cannot open youtube.com (no "Watch on YouTube", no share, no logo link).
 */
export function ProtectedVideoPlayer({ video, className }: Props) {
  const { t } = useTranslation()

  if (video.source === 'YOUTUBE') {
    if (!video.youtubeVideoId) return <Unavailable className={className} label={t('lesson.videoUnavailable')} />
    const params = new URLSearchParams({
      rel: '0',
      modestbranding: '1',
      playsinline: '1',
      iv_load_policy: '3',
      controls: '1',
      fs: '1',
    })
    const src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(video.youtubeVideoId)}?${params.toString()}`
    return (
      <div
        className={cn('relative aspect-video overflow-hidden rounded-2xl bg-black', className)}
        onContextMenu={prevent}
      >
        <iframe
          title={video.title}
          src={src}
          className="h-full w-full"
          // No allow-popups / allow-top-navigation: links inside the player cannot leave this page.
          sandbox="allow-scripts allow-same-origin allow-presentation"
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
        {/* Covers the title bar (video title, channel, share) the embed shows on pause. */}
        <div className="absolute inset-x-0 top-0 h-14" aria-hidden onContextMenu={prevent} />
      </div>
    )
  }

  const src = resolveStreamUrl(video)
  if (!src) return <Unavailable className={className} label={t('lesson.videoUnavailable')} />

  return (
    <div
      className={cn('relative aspect-video overflow-hidden rounded-2xl bg-black', className)}
      onContextMenu={prevent}
    >
      <video
        key={src}
        src={src}
        className="h-full w-full"
        controls
        controlsList="nodownload noremoteplayback"
        disablePictureInPicture
        disableRemotePlayback
        playsInline
        preload="metadata"
        onContextMenu={prevent}
      />
    </div>
  )
}

function Unavailable({ className, label }: { className?: string; label: string }) {
  return (
    <div
      className={cn(
        'flex aspect-video flex-col items-center justify-center gap-2 rounded-2xl bg-muted text-sm text-muted-foreground',
        className,
      )}
    >
      <Lock className="h-8 w-8 text-muted-foreground/40" />
      {label}
    </div>
  )
}
