import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { BrandIcon } from '@/shared/components/BrandIcon'
import { useCartStore } from '@/features/cart/store/cart.store'
import { formatPriceCents } from '@/lib/format-price'
import { cn } from '@/lib/utils'
import { getCategoryLabel } from '@/features/courses/course-categories'
import type { Course } from '@/shared/types'

interface Props {
  course: Course
  index?: number
  compact?: boolean
}

export function MarketplaceCourseCard({ course, index = 0, compact = false }: Props) {
  const { t, i18n } = useTranslation()
  const addItem = useCartStore((s) => s.addItem)
  const inCart = useCartStore((s) => s.hasItem(course.id))
  const rating = course.ratingAvg ?? 0
  const ratingCount = course.ratingCount ?? 0

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (inCart) return

    const added = addItem({
      id: course.id,
      title: course.title,
      coverUrl: course.coverUrl,
      priceCents: course.priceCents,
      category: getCategoryLabel(course.category, t),
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
      <Link to={`/courses/${course.id}`} className="relative aspect-video overflow-hidden bg-muted">
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
        <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium backdrop-blur-sm">
          {getCategoryLabel(course.category, t)}
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <Link to={`/courses/${course.id}`} className="hover:text-primary transition-colors">
          <h3 className={cn('line-clamp-2 font-semibold leading-snug', compact ? 'text-sm' : 'text-base')}>
            {course.title}
          </h3>
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

        <div className="mt-auto flex items-center justify-between gap-3 pt-1">
          <span className="text-lg font-bold text-primary">
            {formatPriceCents(course.priceCents, i18n.language)}
          </span>
          <Button
            size="sm"
            variant={inCart ? 'secondary' : 'default'}
            disabled={inCart}
            onClick={handleAddToCart}
            className={cn('shrink-0', !inCart && 'shadow-sm')}
          >
            {inCart ? t('landing.marketplace.inCart') : t('landing.marketplace.addToCart')}
          </Button>
        </div>
      </div>
    </motion.article>
  )
}
