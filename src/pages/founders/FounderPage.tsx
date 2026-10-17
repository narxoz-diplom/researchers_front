import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { ErrorState } from '@/shared/ui/ErrorState'
import { TextWithLinks } from '@/shared/ui/TextWithLinks'
import { useFounder } from '@/features/founders/hooks/useFounders'
import { cn } from '@/lib/utils'

function FounderSkeleton() {
  return (
    <div className="grid gap-8 pt-6 md:grid-cols-[280px_1fr]">
      <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
      <div className="flex flex-col gap-4">
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  )
}

/** Personal page of a founder: bio, photos and a link to an external profile. */
export function FounderPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const { data: founder, isLoading, isError, refetch } = useFounder(id)
  const [openedPhoto, setOpenedPhoto] = useState<string | null>(null)

  if (isLoading) return <FounderSkeleton />
  if (isError) return <ErrorState onRetry={() => void refetch()} />
  if (!founder) return null

  const portrait = founder.previewUrl ?? founder.gallery[0]
  const photos = founder.gallery.filter((url) => url !== portrait)
  const paragraphs = (founder.bio ?? founder.description)
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)

  return (
    <div className="pb-16">
      <Link
        to="/#about"
        className={cn(
          buttonVariants({ variant: 'ghost', size: 'sm' }),
          'mt-4 mb-6 gap-1 text-muted-foreground',
        )}
      >
        <ArrowLeft className="h-4 w-4" />
        {t('founderPage.back')}
      </Link>

      <div className="grid gap-8 md:grid-cols-[280px_1fr] lg:gap-12">
        <div className="mx-auto w-full max-w-[280px]">
          <div className="aspect-[3/4] overflow-hidden rounded-2xl border bg-muted shadow-lg">
            {portrait && (
              <img src={portrait} alt={founder.fullName} className="h-full w-full object-cover" />
            )}
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{founder.fullName}</h1>
            <p className="mt-2 font-medium text-primary">{founder.position}</p>
          </div>

          <div className="flex flex-col gap-3 text-[15px] leading-relaxed text-foreground/90">
            {paragraphs.map((paragraph, index) => (
              <TextWithLinks key={index} as="p" text={paragraph} className="whitespace-pre-line" />
            ))}
          </div>

          {founder.profileUrl && (
            <a
              href={founder.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: 'outline' }), 'w-fit gap-2')}
            >
              {t('founderPage.profileLink')}
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>

      {photos.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-semibold">{t('founderPage.gallery')}</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {photos.map((url) => (
              <button
                key={url}
                type="button"
                onClick={() => setOpenedPhoto(url)}
                className="group aspect-[4/3] overflow-hidden rounded-xl border bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                <img
                  src={url}
                  alt={founder.fullName}
                  loading="lazy"
                  className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                />
              </button>
            ))}
          </div>
        </section>
      )}

      <Dialog open={!!openedPhoto} onOpenChange={(open) => !open && setOpenedPhoto(null)}>
        <DialogContent className="max-w-3xl overflow-hidden p-0 sm:max-w-3xl">
          <DialogTitle className="sr-only">{founder.fullName}</DialogTitle>
          {openedPhoto && (
            <img src={openedPhoto} alt={founder.fullName} className="max-h-[85vh] w-full object-contain" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
