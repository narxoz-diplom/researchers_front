import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Check, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { PageHeader } from '@/shared/ui/PageHeader'
import { ErrorState } from '@/shared/ui/ErrorState'
import { api } from '@/shared/api/axios'
import { API } from '@/shared/api/endpoints'
import type { Course, CourseEnrollment, CourseEnrollmentStatus } from '@/shared/types'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

const STATUS_LABELS: Record<CourseEnrollmentStatus, string> = {
  PENDING: 'Заявка',
  PAID: 'Оплачено',
  APPROVED: 'Доступ выдан',
  REJECTED: 'Отклонено',
}

export function StudioEnrollmentsPage() {
  const { id: courseId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: course } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => api.get<Course>(API.courses.byId(courseId!)).then((r) => r.data),
    enabled: !!courseId,
  })

  const { data: enrollments, isLoading, isError, refetch } = useQuery({
    queryKey: ['enrollments', courseId],
    queryFn: () =>
      api.get<CourseEnrollment[]>(API.courses.enrollments(courseId!)).then((r) => r.data),
    enabled: !!courseId,
  })

  const { mutate: approve, isPending: approving } = useMutation({
    mutationFn: (enrollmentId: string) =>
      api.post(API.courses.enrollmentApprove(courseId!, enrollmentId)),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['enrollments', courseId] })
      toast.success('Доступ к курсу выдан')
    },
    onError: () => toast.error('Не удалось выдать доступ'),
  })

  const { mutate: reject } = useMutation({
    mutationFn: (enrollmentId: string) =>
      api.post(API.courses.enrollmentReject(courseId!, enrollmentId)),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['enrollments', courseId] })
      toast.success('Заявка отклонена')
    },
    onError: () => toast.error('Не удалось отклонить заявку'),
  })

  if (isError) return <ErrorState onRetry={() => void refetch()} />

  return (
    <div className="pb-12">
      <Button
        variant="ghost"
        size="sm"
        className="mt-4 mb-4 gap-1 text-muted-foreground"
        onClick={() => navigate(`/studio/courses/${courseId}`)}
      >
        <ArrowLeft className="h-4 w-4" />
        К редактированию курса
      </Button>

      <PageHeader
        title="Заявки на курс"
        subtitle={course?.title}
      />

      <p className="text-sm text-muted-foreground mb-6">
        Выдайте доступ только после оплаты — кнопка «Выдать доступ» активна для статуса «Оплачено».
      </p>

      {isLoading ? (
        <Skeleton className="h-48 w-full rounded-xl" />
      ) : !enrollments?.length ? (
        <p className="text-sm text-muted-foreground py-12 text-center">
          Заявок пока нет
        </p>
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Студент</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrollments.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <div className="font-medium">{row.user?.fullName}</div>
                    <div className="text-xs text-muted-foreground">{row.user?.email}</div>
                    {row.message && (
                      <p className="text-xs text-muted-foreground mt-1 max-w-xs">{row.message}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{STATUS_LABELS[row.status]}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(row.createdAt), 'd MMM yyyy', { locale: ru })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {row.status === 'PAID' && (
                        <Button
                          size="sm"
                          disabled={approving}
                          onClick={() => approve(row.id)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Выдать доступ
                        </Button>
                      )}
                      {(row.status === 'PENDING' || row.status === 'PAID') && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => reject(row.id)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Отклонить
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
