export type Role = 'SUBSCRIBER' | 'AUTHOR' | 'ADMIN'

export type UserStatus = 'ACTIVE' | 'BLOCKED'

export type CourseStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

export type SubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'REVOKED'

export type CourseEnrollmentStatus =
  | 'PENDING'
  | 'PAID'
  | 'UNDERPAID'
  | 'APPROVED'
  | 'REJECTED'
  /** Withdrawn by the student before access was granted. */
  | 'CANCELLED'

export type VideoSource = 'CLOUDINARY' | 'YOUTUBE'

export interface MyEnrollment {
  id: string
  status: CourseEnrollmentStatus
  message?: string
  paidAt?: string
  paidAmountCents?: number
  expectedAmountCents?: number
  adminPaymentNote?: string
  approvedAt?: string
  createdAt?: string
}

export interface MyEnrollmentWithCourse extends MyEnrollment {
  course: { id: string; title: string; coverUrl?: string; priceCents: number }
}

export interface CourseEnrollment {
  id: string
  courseId: string
  userId: string
  status: CourseEnrollmentStatus
  message?: string
  paidAt?: string
  paidAmountCents?: number
  expectedAmountCents?: number
  adminPaymentNote?: string
  approvedAt?: string
  createdAt: string
  user?: Pick<User, 'id' | 'email' | 'fullName'>
}

export interface PaymentEnrollment extends CourseEnrollment {
  course: { id: string; title: string; priceCents: number }
}

export type EnrollmentEventType =
  | 'REQUESTED'
  | 'PAYMENT_SUBMITTED'
  | 'MORE_PAYMENT_REQUESTED'
  | 'AMOUNT_ADJUSTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'

/** One line of the enrollment journal. */
export interface EnrollmentEvent {
  id: string
  type: EnrollmentEventType
  actor?: { id: string; fullName: string; role: Role }
  amountCents?: number
  totalPaidCents?: number
  note?: string
  createdAt: string
}

export interface AdminEnrollment extends PaymentEnrollment {
  updatedAt: string
  events: EnrollmentEvent[]
}

export interface AdminEnrollmentStats {
  counts: Record<CourseEnrollmentStatus, number>
  soldRevenueCents: number
  awaitingReviewCents: number
}

export interface Meta {
  total: number
  page: number
  pageSize: number
}

export interface ApiError {
  statusCode: number
  error: string
  message: string
  path: string
  timestamp: string
}

/** Admin review of an author's public offer. Only APPROVED authors manage courses. */
export type AuthorStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface User {
  id: string
  email: string
  fullName: string
  role: Role
  authorStatus?: AuthorStatus
  /** False until the confirmation link was used or an admin verified the account. */
  emailVerified?: boolean
  avatarUrl?: string
  createdAt: string
}

/** True when the user may create and edit courses. */
export function canManageCourses(user: Pick<User, 'role' | 'authorStatus'> | null | undefined): boolean {
  if (!user) return false
  return user.role === 'ADMIN' || (user.role === 'AUTHOR' && user.authorStatus === 'APPROVED')
}

export interface Course {
  id: string
  title: string
  description: string
  coverUrl?: string
  priceCents: number
  category?: string
  ratingAvg?: number
  ratingCount?: number
  status: CourseStatus
  author: { id: string; fullName: string; avatarUrl?: string }
  lessonsCount: number
  createdAt: string
  updatedAt: string
}

export type LessonVectorIndexStatus = 'PENDING' | 'INDEXING' | 'READY' | 'FAILED'

export interface Lesson {
  id: string
  title: string
  orderNumber: number
  isPublished: boolean
  content?: string
  courseId: string
  videos: LessonVideo[]
  materials: LessonMaterial[]
  vectorIndexStatus?: LessonVectorIndexStatus
  vectorIndexJobId?: string | null
  vectorIndexedAt?: string | null
  vectorIndexErrorId?: string | null
  vectorIndexErrorCode?: string | null
}

export interface LessonSummary {
  id: string
  title: string
  orderNumber: number
  isPublished: boolean
}

export interface LessonVideo {
  id: string
  title: string
  source: VideoSource
  cloudinaryPublicId?: string
  youtubeVideoId?: string
  /** Origin URL; the API sends it only to the course author and admins. */
  url?: string
  /** API path that streams the file to the current viewer (uploaded videos only). */
  streamUrl?: string
  durationSeconds: number
  orderNumber: number
  sizeBytes?: string
}

export interface LessonMaterial {
  id: string
  title: string
  /** Origin URL; the API sends it only to the course author and admins. */
  url?: string
  /** API path that serves the file inline to a viewer with access. */
  viewUrl?: string
  /** API path returning the document as HTML (DOCX). */
  htmlUrl?: string
  mimeType: string
  sizeBytes: string
}

export interface Subscription {
  id: string
  userId: string
  user?: Pick<User, 'id' | 'fullName' | 'email'>
  status: SubscriptionStatus
  startsAt: string
  expiresAt: string
  grantedBy?: string
}

export interface Progress {
  courseId: string
  course: Pick<Course, 'id' | 'title' | 'coverUrl' | 'lessonsCount'>
  completedCount: number
  percentage: number
}
