import { BookOpen, Clock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Course } from '@/shared/types'

interface Props {
  course: Course
  onClick?: () => void
}

export function CourseCard({ course, onClick }: Props) {
  const { t } = useTranslation()

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      className={cn(
        'group flex flex-col rounded-2xl border bg-card shadow-sm overflow-hidden',
        'cursor-pointer transition-all duration-200 ease-out',
        'hover:shadow-md hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
      )}
    >
      <div className="relative aspect-video overflow-hidden bg-muted">
        {course.coverUrl ? (
          <img
            src={course.coverUrl}
            alt={course.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <BookOpen className="h-10 w-10 text-muted-foreground/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-card-foreground">
          {course.title}
        </h3>

        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              {course.author.fullName[0]}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground truncate">{course.author.fullName}</span>
        </div>

        <div className="mt-auto flex items-center gap-3">
          <Badge variant="secondary" className="text-xs gap-1">
            <BookOpen className="h-3 w-3" />
            {t('common.lessonsCount', { count: course.lessonsCount })}
          </Badge>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{t('course.cardLabel')}</span>
          </div>
        </div>
      </div>
    </article>
  )
}
