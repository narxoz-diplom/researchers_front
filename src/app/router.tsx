import { Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/shared/components/AppLayout'
import { AuthLayout } from '@/shared/components/AuthLayout'
import { ProtectedRoute } from '@/shared/components/ProtectedRoute'
import { LoadingState } from '@/shared/ui/LoadingState'
import {
  AdminSubscriptionsPage,
  AdminUsersPage,
  CatalogPage,
  CheckEmailPage,
  CourseDetailPage,
  ForbiddenPage,
  LandingPage,
  LessonPlayerPage,
  LoginPage,
  NotFoundPage,
  ProfilePage,
  RegisterPage,
  StudioCourseEditPage,
  StudioCoursesPage,
  StudioEnrollmentsPage,
  StudioLessonEditPage,
  VerifyEmailPage,
} from './lazy-pages'

function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<LoadingState />}>{children}</Suspense>
}

export const router = createBrowserRouter([
  { path: '/', element: <Lazy><LandingPage /></Lazy> },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { index: true, element: <Navigate to="/auth/login" replace /> },
      { path: 'login', element: <Lazy><LoginPage /></Lazy> },
      { path: 'register', element: <Lazy><RegisterPage /></Lazy> },
      { path: 'check-email', element: <Lazy><CheckEmailPage /></Lazy> },
      { path: 'verify-email', element: <Lazy><VerifyEmailPage /></Lazy> },
    ],
  },
  {
    element: (
      <ProtectedRoute />
    ),
    children: [
      {
        element: <AppLayout />,
        children: [
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
