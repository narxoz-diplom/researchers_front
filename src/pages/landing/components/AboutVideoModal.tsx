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
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AboutVideoModal({
  title,
  subtitle,
  description,
  videoUrl,
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
        </div>
      </DialogContent>
    </Dialog>
  )
}
