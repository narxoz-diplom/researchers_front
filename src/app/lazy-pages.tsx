import { lazy } from 'react'

export const LandingPage = lazy(() =>
  import('@/pages/landing/LandingPage').then((m) => ({ default: m.LandingPage })),
)
export const LoginPage = lazy(() =>
  import('@/pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })),
)
export const RegisterPage = lazy(() =>
  import('@/pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })),
)
export const CheckEmailPage = lazy(() =>
  import('@/pages/auth/EmailVerificationPages').then((m) => ({ default: m.CheckEmailPage })),
)
export const VerifyEmailPage = lazy(() =>
  import('@/pages/auth/EmailVerificationPages').then((m) => ({ default: m.VerifyEmailPage })),
)
export const CatalogPage = lazy(() =>
  import('@/pages/catalog/CatalogPage').then((m) => ({ default: m.CatalogPage })),
)
export const CourseDetailPage = lazy(() =>
  import('@/pages/courses/CourseDetailPage').then((m) => ({ default: m.CourseDetailPage })),
)
export const LessonPlayerPage = lazy(() =>
  import('@/pages/courses/LessonPlayerPage').then((m) => ({ default: m.LessonPlayerPage })),
)
export const StudioCoursesPage = lazy(() =>
  import('@/pages/studio/StudioCoursesPage').then((m) => ({ default: m.StudioCoursesPage })),
)
export const StudioCourseEditPage = lazy(() =>
  import('@/pages/studio/StudioCourseEditPage').then((m) => ({ default: m.StudioCourseEditPage })),
)
export const StudioLessonEditPage = lazy(() =>
  import('@/pages/studio/StudioLessonEditPage').then((m) => ({ default: m.StudioLessonEditPage })),
)
export const StudioEnrollmentsPage = lazy(() =>
  import('@/pages/studio/StudioEnrollmentsPage').then((m) => ({ default: m.StudioEnrollmentsPage })),
)
export const AdminUsersPage = lazy(() =>
  import('@/pages/admin/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage })),
)
export const AdminSubscriptionsPage = lazy(() =>
  import('@/pages/admin/AdminSubscriptionsPage').then((m) => ({ default: m.AdminSubscriptionsPage })),
)
export const ProfilePage = lazy(() =>
  import('@/pages/profile/ProfilePage').then((m) => ({ default: m.ProfilePage })),
)
export const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
)
export const ForbiddenPage = lazy(() =>
  import('@/pages/ForbiddenPage').then((m) => ({ default: m.ForbiddenPage })),
)
