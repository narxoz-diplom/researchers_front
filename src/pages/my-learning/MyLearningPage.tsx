import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BookOpen, PlayCircle } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/shared/ui/PageHeader'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { BrandIcon } from '@/shared/components/BrandIcon'
import { useMyLibrary } from '@/features/library/hooks/useMyLibrary'
import type { LibraryCourse, LibraryLesson } from '@/features/library/types'

function LibrarySkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-32 rounded-2xl" />
      ))}
    </div>
  )
}

export function MyLearningPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data, isLoading, isError, refetch } = useMyLibrary()

  const isEmpty = !isLoading && !isError && data && data.courses.length === 0 && data.lessons.length === 0

  return (
    <div className="py-6">
      <PageHeader
        title={t('myLearning.title')}
        subtitle={t('myLearning.subtitle')}
      />

      {isError && <ErrorState onRetry={() => void refetch()} />}

      {isLoading && <LibrarySkeleton />}

      {isEmpty && (
        <EmptyState
          title={t('myLearning.emptyTitle')}
          description={t('myLearning.emptyDescription')}
        />
      )}

      {!isLoading && !isError && data && !isEmpty && (
        <div className="space-y-10">
          {data.courses.length > 0 && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <BookOpen className="h-5 w-5 text-primary" />
                {t('myLearning.courses')}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data.courses.map((course: LibraryCourse) => (
                  <button
                    key={course.id}
                    type="button"
                    onClick={() => navigate(`/courses/${course.id}`)}
                    className="flex overflow-hidden rounded-2xl border bg-card text-left shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="aspect-video w-32 shrink-0 bg-muted sm:w-36">
                      {course.coverUrl ? (
                        <img
                          src={course.coverUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <BrandIcon className="h-8 w-8 opacity-40" />
                        </div>
                      )}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 p-4">
                      <p className="line-clamp-2 font-semibold">{course.title}</p>
                      {course.category && (
                        <p className="text-xs text-muted-foreground">{course.category}</p>
                      )}
                      <p className="text-xs font-medium text-primary">{t('myLearning.openCourse')}</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {data.lessons.length > 0 && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <PlayCircle className="h-5 w-5 text-primary" />
                {t('myLearning.lessons')}
              </h2>
              <div className="grid gap-3">
                {data.lessons.map((lesson: LibraryLesson) => (
                  <button
                    key={lesson.id}
                    type="button"
                    onClick={() => navigate(`/courses/${lesson.courseId}/lessons/${lesson.id}`)}
                    className="flex items-center gap-4 rounded-2xl border bg-card p-4 text-left transition-shadow hover:shadow-md"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <PlayCircle className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{lesson.title}</p>
                      <p className="truncate text-sm text-muted-foreground">{lesson.courseTitle}</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
