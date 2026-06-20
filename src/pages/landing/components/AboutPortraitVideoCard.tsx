import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Play } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VideoData {
  id: string
  videoUrl: string
  previewUrl?: string
  label: string
}

interface Props {
  video?: VideoData
  index?: number
  onOpen?: () => void
}

export function AboutPortraitVideoCard({ video, index = 0, onOpen }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [hovering, setHovering] = useState(false)
  const rotationClass =
    index === 0 ? 'sm:-rotate-2' : index === 2 ? 'sm:rotate-2' : undefined

  function handleEnter() {
    if (!video?.videoUrl) return
    setHovering(true)
    const el = videoRef.current
    if (!el) return
    el.currentTime = 0
    void el.play().catch(() => undefined)
  }

  function handleLeave() {
    setHovering(false)
    const el = videoRef.current
    if (!el) return
    el.pause()
    el.currentTime = 0
  }

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
      onClick={video?.videoUrl ? onOpen : undefined}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={handleEnter}
      onBlur={handleLeave}
      disabled={!video?.videoUrl}
      className={cn(
        'group relative mx-auto w-full max-w-[220px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
        rotationClass,
        video?.videoUrl && 'cursor-pointer',
        !video?.videoUrl && 'cursor-default opacity-90',
      )}
    >
      <div
        className={cn(
          'relative aspect-[9/16] w-full overflow-hidden rounded-2xl border bg-muted shadow-lg transition-all duration-300',
          'before:absolute before:inset-y-3 before:left-0 before:w-1 before:rounded-r before:bg-primary/30 before:content-[""]',
          hovering && video?.videoUrl && 'scale-[1.02] shadow-xl ring-2 ring-primary/30',
        )}
      >
        {video?.previewUrl ? (
          <img
            src={video.previewUrl}
            alt={video.label}
            className={cn(
              'absolute inset-0 h-full w-full object-cover transition-opacity duration-300',
              hovering ? 'opacity-0' : 'opacity-100',
            )}
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-muted to-muted-foreground/10" />
        )}
        {video?.videoUrl && (
          <video
            ref={videoRef}
            src={video.videoUrl}
            muted
            loop
            playsInline
            preload="metadata"
            className={cn(
              'absolute inset-0 h-full w-full object-cover transition-opacity duration-300',
              hovering || !video.previewUrl ? 'opacity-100' : 'opacity-0',
            )}
          />
        )}
        {video?.videoUrl && (
          <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-transform group-hover:scale-110">
            <Play className="h-4 w-4 fill-current" />
          </span>
        )}
      </div>
    </motion.button>
  )
}
