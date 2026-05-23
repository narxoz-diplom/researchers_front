import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { PageHeader } from '@/shared/ui/PageHeader'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { StatusBadge } from '@/shared/ui/StatusBadge'
import { api } from '@/shared/api/axios'
import { API } from '@/shared/api/endpoints'
import type { Course } from '@/shared/types'

export function StudioCoursesPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: courses, isLoading, isError, refetch } = useQuery({
    queryKey: ['courses', 'mine'],
    queryFn: () => api.get<Course[]>(API.courses.mine).then((r) => r.data),
  })

  const { mutate: createCourse, isPending: creating } = useMutation({
    mutationFn: () =>
      api.post<Course>(API.courses.create, { title: 'Новый курс', description: '' }).then((r) => r.data),
    onSuccess: (course) => {
      void qc.invalidateQueries({ queryKey: ['courses', 'mine'] })
      navigate(`/studio/courses/${course.id}`)
    },
    onError: () => toast.error('Не удалось создать курс'),
  })

  const { mutate: deleteCourse } = useMutation({
    mutationFn: (id: string) => api.delete(API.courses.delete(id)),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['courses', 'mine'] })
      toast.success('Курс удалён')
    },
  })

  if (isError) return <ErrorState onRetry={() => void refetch()} />

  return (
    <div>
      <PageHeader
        title="Studio"
        subtitle="Ваши курсы"
        actions={
          <Button onClick={() => createCourse()} disabled={creating}>
            <Plus className="mr-2 h-4 w-4" />
            Новый курс
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : !courses?.length ? (
        <EmptyState
          title="Нет курсов"
          description="Создайте первый курс и начните делиться знаниями"
          action={{ label: 'Создать курс', onClick: () => createCourse() }}
        />
      ) : (
        <div className="flex flex-col gap-2 pb-12">
          {courses.map((course) => (
            <div
              key={course.id}
              className="flex items-center gap-4 rounded-xl border bg-card p-4"
            >
              {/* Cover thumb */}
              <div className="h-12 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                {course.coverUrl && (
                  <img src={course.coverUrl} alt="" className="h-full w-full object-cover" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{course.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <StatusBadge status={course.status} />
                  <span className="text-xs text-muted-foreground">{course.lessonsCount} уроков</span>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate(`/studio/courses/${course.id}`)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Редактировать
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => deleteCourse(course.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Удалить
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
