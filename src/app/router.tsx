import { Suspense } from 'react'
import { createBrowserRouter, Navigate, type RouteObject } from 'react-router-dom'
import { AppLayout } from '@/shared/components/AppLayout'
import { RootLayout } from '@/shared/components/RootLayout'
import { AuthLayout } from '@/shared/components/AuthLayout'
import { AdaptiveBrowseLayout } from '@/shared/components/AdaptiveBrowseLayout'
import { ProtectedRoute } from '@/shared/components/ProtectedRoute'
import { AuthorApprovalGate } from '@/features/authors/components/AuthorApprovalGate'
import { LoadingState } from '@/shared/ui/LoadingState'
import {
  AdminSubscriptionsPage,
  AdminUsersPage,
  AdminFoundersPage,
  AdminPlatformAiPage,
  AdminPaymentsPage,
  AdminAuthorsPage,
  OfferPage,
  CheckoutPage,
  MyRequestsPage,
  CatalogPage,
  CheckEmailPage,
  CourseDetailPage,
  ForbiddenPage,
  FounderPage,
  LandingPage,
  LessonPlayerPage,
  LoginPage,
  NotFoundPage,
  ProfilePage,
  RegisterPage,
  StudioCourseEditPage,
  StudioCoursesPage,
  StudioEnrollmentsPage,
  StudioLandingSectionsPage,
  StudioLandingSectionEditPage,
  StudioLessonEditPage,
  StudioImportCoursePage,
  VerifyEmailPage,
  DesignSystemPage,
} from './lazy-pages'

function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<LoadingState />}>{children}</Suspense>
}

const routes: RouteObject[] = [
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
    element: <AdaptiveBrowseLayout />,
    children: [
      { path: 'catalog', element: <Lazy><CatalogPage /></Lazy> },
      { path: 'checkout', element: <Lazy><CheckoutPage /></Lazy> },
      { path: 'courses/:id', element: <Lazy><CourseDetailPage /></Lazy> },
      { path: 'courses/:cid/lessons/:lessonId', element: <Lazy><LessonPlayerPage /></Lazy> },
      { path: 'founders/:id', element: <Lazy><FounderPage /></Lazy> },
      { path: 'offer', element: <Lazy><OfferPage /></Lazy> },
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
          { path: 'profile', element: <Lazy><ProfilePage /></Lazy> },
          { path: 'requests', element: <Lazy><MyRequestsPage /></Lazy> },

          {
            element: <ProtectedRoute allowedRoles={['AUTHOR', 'ADMIN']} />,
            children: [
              {
                // Authors see the studio only after an admin approved their offer.
                element: <AuthorApprovalGate />,
                children: [
                  { path: 'studio', element: <Lazy><StudioCoursesPage /></Lazy> },
                  { path: 'studio/import', element: <Lazy><StudioImportCoursePage /></Lazy> },
                  { path: 'studio/courses/:id', element: <Lazy><StudioCourseEditPage /></Lazy> },
                  { path: 'studio/courses/:id/enrollments', element: <Lazy><StudioEnrollmentsPage /></Lazy> },
                  { path: 'studio/courses/:id/lessons/:lessonId', element: <Lazy><StudioLessonEditPage /></Lazy> },
                ],
              },
            ],
          },

          {
            element: <ProtectedRoute allowedRoles={['ADMIN']} />,
            children: [
              // Landing section texts are site copy, edited by admins only.
              { path: 'studio/sections', element: <Lazy><StudioLandingSectionsPage /></Lazy> },
              { path: 'studio/sections/:slug', element: <Lazy><StudioLandingSectionEditPage /></Lazy> },
              { path: 'admin/users', element: <Lazy><AdminUsersPage /></Lazy> },
              { path: 'admin/subscriptions', element: <Lazy><AdminSubscriptionsPage /></Lazy> },
              { path: 'admin/founders', element: <Lazy><AdminFoundersPage /></Lazy> },
              { path: 'admin/payments', element: <Lazy><AdminPaymentsPage /></Lazy> },
              { path: 'admin/authors', element: <Lazy><AdminAuthorsPage /></Lazy> },
              { path: 'admin/ai', element: <Lazy><AdminPlatformAiPage /></Lazy> },
            ],
          },
        ],
      },
    ],
  },
  { path: '/403', element: <Lazy><ForbiddenPage /></Lazy> },
  ...(import.meta.env.DEV
    ? [{ path: '/_/design', element: <Lazy><DesignSystemPage /></Lazy> }]
    : []),
  { path: '*', element: <Lazy><NotFoundPage /></Lazy> },
]

export const router = createBrowserRouter([{ element: <RootLayout />, children: routes }])
