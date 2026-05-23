export type Role = 'SUBSCRIBER' | 'AUTHOR' | 'ADMIN'

export type UserStatus = 'ACTIVE' | 'BLOCKED'

export type CourseStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

export type SubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'REVOKED'

export type CourseEnrollmentStatus = 'PENDING' | 'PAID' | 'APPROVED' | 'REJECTED'

export interface MyEnrollment {
  id: string
  status: CourseEnrollmentStatus
  message?: string
  paidAt?: string
  approvedAt?: string
}

export interface CourseEnrollment {
  id: string
  courseId: string
  userId: string
  status: CourseEnrollmentStatus
  message?: string
  paidAt?: string
  approvedAt?: string
  createdAt: string
  user?: Pick<User, 'id' | 'email' | 'fullName'>
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

export interface User {
  id: string
  email: string
  fullName: string
  role: Role
  avatarUrl?: string
  createdAt: string
}

export interface Course {
  id: string
  title: string
  description: string
  coverUrl?: string
  priceCents: number
  status: CourseStatus
  author: { id: string; fullName: string; avatarUrl?: string }
  lessonsCount: number
  createdAt: string
  updatedAt: string
}

export interface Lesson {
  id: string
  title: string
  orderNumber: number
  content?: string
  courseId: string
  videos: LessonVideo[]
  materials: LessonMaterial[]
}

export interface LessonSummary {
  id: string
  title: string
  orderNumber: number
}

export interface LessonVideo {
  id: string
  title: string
  cloudinaryPublicId?: string
  url: string
  durationSeconds: number
  orderNumber: number
  sizeBytes: string
}

export interface LessonMaterial {
  id: string
  title: string
  url: string
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
