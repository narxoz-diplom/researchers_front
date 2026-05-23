import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/shared/components/AppLayout'
import { AuthLayout } from '@/shared/components/AuthLayout'
import { ProtectedRoute } from '@/shared/components/ProtectedRoute'
import { LoadingState } from '@/shared/ui/LoadingState'

const LoginPage = lazy(() => import('@/pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })))
const CatalogPage = lazy(() => import('@/pages/catalog/CatalogPage').then((m) => ({ default: m.CatalogPage })))
const CourseDetailPage = lazy(() => import('@/pages/courses/CourseDetailPage').then((m) => ({ default: m.CourseDetailPage })))
const LessonPlayerPage = lazy(() => import('@/pages/courses/LessonPlayerPage').then((m) => ({ default: m.LessonPlayerPage })))
const StudioCoursesPage = lazy(() => import('@/pages/studio/StudioCoursesPage').then((m) => ({ default: m.StudioCoursesPage })))
const StudioCourseEditPage = lazy(() => import('@/pages/studio/StudioCourseEditPage').then((m) => ({ default: m.StudioCourseEditPage })))
const StudioLessonEditPage = lazy(() => import('@/pages/studio/StudioLessonEditPage').then((m) => ({ default: m.StudioLessonEditPage })))
const StudioEnrollmentsPage = lazy(() => import('@/pages/studio/StudioEnrollmentsPage').then((m) => ({ default: m.StudioEnrollmentsPage })))
const AdminUsersPage = lazy(() => import('@/pages/admin/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage })))
const AdminSubscriptionsPage = lazy(() => import('@/pages/admin/AdminSubscriptionsPage').then((m) => ({ default: m.AdminSubscriptionsPage })))
const ProfilePage = lazy(() => import('@/pages/profile/ProfilePage').then((m) => ({ default: m.ProfilePage })))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })))
const ForbiddenPage = lazy(() => import('@/pages/ForbiddenPage').then((m) => ({ default: m.ForbiddenPage })))

function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<LoadingState />}>{children}</Suspense>
}

export const router = createBrowserRouter([
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { index: true, element: <Navigate to="/auth/login" replace /> },
      { path: 'login', element: <Lazy><LoginPage /></Lazy> },
      { path: 'register', element: <Lazy><RegisterPage /></Lazy> },
    ],
  },
  {
    path: '/',
    element: (
      <ProtectedRoute />
    ),
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/catalog" replace /> },
          { path: 'catalog', element: <Lazy><CatalogPage /></Lazy> },
          { path: 'courses/:id', element: <Lazy><CourseDetailPage /></Lazy> },
          { path: 'courses/:cid/lessons/:lessonId', element: <Lazy><LessonPlayerPage /></Lazy> },
          { path: 'profile', element: <Lazy><ProfilePage /></Lazy> },

          {
            element: <ProtectedRoute allowedRoles={['AUTHOR', 'ADMIN']} />,
            children: [
              { path: 'studio', element: <Lazy><StudioCoursesPage /></Lazy> },
              { path: 'studio/courses/:id', element: <Lazy><StudioCourseEditPage /></Lazy> },
              { path: 'studio/courses/:id/enrollments', element: <Lazy><StudioEnrollmentsPage /></Lazy> },
              { path: 'studio/courses/:id/lessons/:lessonId', element: <Lazy><StudioLessonEditPage /></Lazy> },
            ],
          },

          {
            element: <ProtectedRoute allowedRoles={['ADMIN']} />,
            children: [
              { path: 'admin/users', element: <Lazy><AdminUsersPage /></Lazy> },
              { path: 'admin/subscriptions', element: <Lazy><AdminSubscriptionsPage /></Lazy> },
            ],
          },
        ],
      },
    ],
  },
  { path: '/403', element: <Lazy><ForbiddenPage /></Lazy> },
  { path: '*', element: <Lazy><NotFoundPage /></Lazy> },
])
