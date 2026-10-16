import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/api/axios'
import { API } from '@/shared/api/endpoints'
import { useAuthStore } from '@/features/auth/store/auth.store'
import type { CourseEnrollmentStatus, MyEnrollmentWithCourse } from '@/shared/types'

// Statuses that make a course unavailable for a new purchase/request.
const ACTIVE_STATUSES: CourseEnrollmentStatus[] = ['PENDING', 'PAID', 'UNDERPAID', 'APPROVED']

export function isActiveEnrollmentStatus(status?: CourseEnrollmentStatus | null) {
  return !!status && ACTIVE_STATUSES.includes(status)
}

export function useMyEnrollments() {
  const user = useAuthStore((s) => s.user)
  const query = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: () =>
      api.get<MyEnrollmentWithCourse[]>(API.enrollments.mine).then((r) => r.data),
    enabled: user?.role === 'SUBSCRIBER',
  })

  const getActiveEnrollment = (courseId: string) =>
    query.data?.find((e) => e.course.id === courseId && isActiveEnrollmentStatus(e.status))

  return { ...query, getActiveEnrollment }
}
