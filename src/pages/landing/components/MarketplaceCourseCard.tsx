import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Play, Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { BrandIcon } from '@/shared/components/BrandIcon'
import { useCartStore } from '@/features/cart/store/cart.store'
import { formatPriceCents } from '@/lib/format-price'
import { cn } from '@/lib/utils'
import type { Course } from '@/shared/types'

interface Props {
  course: Course
  index?: number
}

export function MarketplaceCourseCard({ course, index = 0 }: Props) {
  const { t, i18n } = useTranslation()
  const addItem = useCartStore((s) => s.addItem)
  const inCart = useCartStore((s) => s.hasItem('course', course.id))
  const previewHref = `/courses/${course.id}/preview`
  const rating = course.ratingAvg ?? 0
  const ratingCount = course.ratingCount ?? 0

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (inCart) return

    const added = addItem({
      type: 'course',
      id: course.id,
      courseId: course.id,
      title: course.title,
      coverUrl: course.coverUrl,
      priceCents: course.priceCents,
      category: course.category ?? t('landing.marketplace.defaultCategory'),
    })

    if (added) {
      toast.success(t('landing.marketplace.addedToCart', { title: course.title }))
    }
  }

  return (
    <motion.article
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.45, delay: index * 0.06, ease: 'easeOut' }}
        className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-md"
      >
        <Link
          to={previewHref}
          className="relative aspect-video overflow-hidden bg-muted text-left"
          aria-label={t('landing.marketplace.openPreview', { title: course.title })}
        >
          {course.coverUrl ? (
            <img
              src={course.coverUrl}
              alt={course.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <BrandIcon className="h-14 w-14 opacity-50" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-80 transition-opacity group-hover:opacity-100" />
          <span className="absolute left-3 top-3 max-w-[calc(100%-1.5rem)] truncate rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium backdrop-blur-sm">
            {course.category ?? t('landing.marketplace.defaultCategory')}
          </span>
          <span className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-transform group-hover:scale-110">
            <Play className="h-4 w-4 fill-current" />
          </span>
        </Link>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <Link to={previewHref} className="text-left transition-colors hover:text-primary">
            <h3 className="line-clamp-2 text-base font-semibold leading-snug">{course.title}</h3>
          </Link>

          <div className="flex items-center gap-1.5 text-sm">
            <div className="flex items-center gap-0.5 text-amber-500">
              <Star className="h-4 w-4 fill-current" />
              <span className="font-medium text-foreground">{rating.toFixed(1)}</span>
            </div>
            {ratingCount > 0 && (
              <span className="text-muted-foreground">
                ({t('landing.marketplace.reviews', { count: ratingCount })})
              </span>
            )}
          </div>

          <div className="mt-auto flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-lg font-bold text-primary">
              {formatPriceCents(course.priceCents, i18n.language)}
            </span>
            <Button
              size="sm"
              variant={inCart ? 'secondary' : 'default'}
              disabled={inCart}
              onClick={handleAddToCart}
              className={cn('w-full sm:w-auto sm:shrink-0', !inCart && 'shadow-sm')}
            >
              {inCart ? t('landing.marketplace.inCart') : t('landing.marketplace.addToCart')}
            </Button>
          </div>
        </div>
    </motion.article>
  )
}
