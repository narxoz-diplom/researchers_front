export interface Founder {
  id: string
  fullName: string
  position: string
  description: string
  videoUrl?: string
  previewUrl?: string
  profileUrl?: string
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
  orderNumber?: number
  isPublished?: boolean
}

export type UpdateFounderPayload = Partial<CreateFounderPayload>
