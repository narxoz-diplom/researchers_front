import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Props {
  title: string
  subtitle?: string
  description?: string
  videoUrl?: string
  profileUrl?: string
  profileLabel?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AboutVideoModal({
  title,
  subtitle,
  description,
  videoUrl,
  profileUrl,
  profileLabel,
  open,
  onOpenChange,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm gap-0 overflow-hidden p-0 sm:max-w-md">
        {videoUrl && (
          <div className="aspect-[9/16] w-full bg-black">
            <video
              key={videoUrl}
              src={videoUrl}
              controls
              autoPlay
              playsInline
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <div className="space-y-2 p-6">
          <DialogHeader className="text-left">
            <DialogTitle className="text-xl">{title}</DialogTitle>
            {subtitle && (
              <DialogDescription className="text-sm text-primary">{subtitle}</DialogDescription>
            )}
          </DialogHeader>
          {description && (
            <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
          )}
          {profileUrl && (
            <a
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-sm font-medium text-primary hover:underline"
            >
              {profileLabel}
            </a>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
