export interface Category {
  id: string
  name: string
  slug: string
  orderNumber: number
  isPublished: boolean
  coursesCount: number
  createdAt: string
  updatedAt: string
}

export interface CreateCategoryPayload {
  name: string
  slug?: string
  orderNumber?: number
  isPublished?: boolean
}

export type UpdateCategoryPayload = Partial<CreateCategoryPayload>
