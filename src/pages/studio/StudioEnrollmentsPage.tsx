import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Check, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
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
import { getDateLocale } from '@/lib/date-locale'

export function StudioEnrollmentsPage() {
  const { t, i18n } = useTranslation()
  const { id: courseId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const dateLocale = getDateLocale(i18n.language)

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
      toast.success(t('studio.accessGranted'))
    },
    onError: () => toast.error(t('studio.accessGrantFailed')),
  })

  const { mutate: reject } = useMutation({
    mutationFn: (enrollmentId: string) =>
      api.post(API.courses.enrollmentReject(courseId!, enrollmentId)),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['enrollments', courseId] })
      toast.success(t('studio.enrollmentRejected'))
    },
    onError: () => toast.error(t('studio.enrollmentRejectFailed')),
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
        {t('common.backToCourseEdit')}
      </Button>

      <PageHeader
        title={t('common.courseEnrollments')}
        subtitle={course?.title}
      />

      <p className="text-sm text-muted-foreground mb-6">
        {t('common.enrollmentHint')}
      </p>

      {isLoading ? (
        <Skeleton className="h-48 w-full rounded-xl" />
      ) : !enrollments?.length ? (
        <p className="text-sm text-muted-foreground py-12 text-center">
          {t('common.noEnrollments')}
        </p>
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('common.student')}</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead>{t('common.date')}</TableHead>
                <TableHead className="text-right">{t('common.actions')}</TableHead>
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
                    <Badge variant="secondary">
                      {t(`enrollmentStatuses.${row.status as CourseEnrollmentStatus}`)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(row.createdAt), 'd MMM yyyy', { locale: dateLocale })}
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
                          {t('common.grantAccess')}
                        </Button>
                      )}
                      {(row.status === 'PENDING' || row.status === 'PAID') && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => reject(row.id)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          {t('common.reject')}
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
