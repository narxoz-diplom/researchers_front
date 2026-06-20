export interface CoursePreviewVideo {
  id: string
  title: string
  url: string
  durationSeconds: number
  lessonId: string
  lessonTitle: string
}

export interface CoursePreviewLessonVideo {
  id: string
  title: string
  durationSeconds: number
  orderNumber: number
  locked: boolean
}

export interface CoursePreviewLesson {
  id: string
  title: string
  orderNumber: number
  locked: boolean
  priceCents?: number
  videos: CoursePreviewLessonVideo[]
}

export interface CoursePreview {
  id: string
  title: string
  description: string
  category: string
  categoryId?: string
  priceCents: number
  coverUrl?: string
  author: { id: string; fullName: string }
  previewVideo?: CoursePreviewVideo
  lessons: CoursePreviewLesson[]
}

export type CheckoutItemType = 'course' | 'lesson'

export interface CheckoutItem {
  type: CheckoutItemType
  id: string
}

export interface CheckoutResultItem {
  type: CheckoutItemType
  id: string
  success: boolean
  message?: string
}

export interface CheckoutResponse {
  results: CheckoutResultItem[]
}
