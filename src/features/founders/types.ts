export interface Founder {
  id: string
  fullName: string
  position: string
  description: string
  videoUrl?: string
  previewUrl?: string
  profileUrl?: string
  bio?: string
  gallery: string[]
  orderNumber: number
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateFounderPayload {
  fullName: string
  position: string
  description: string
  videoUrl?: string | null
  previewUrl?: string | null
  profileUrl?: string | null
  bio?: string | null
  gallery?: string[]
  orderNumber?: number
  isPublished?: boolean
}

export type UpdateFounderPayload = Partial<CreateFounderPayload>
