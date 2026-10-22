import type { AuthorStatus } from '@/shared/types'

/** Details an author fills in when accepting the public offer (/offer). */
export interface AuthorApplicationPayload {
  legalName: string
  iin: string
  phone: string
  city: string
  acceptOffer: boolean
}

export interface AuthorApplication extends Omit<AuthorApplicationPayload, 'acceptOffer'> {
  offerVersion: string
  acceptedAt: string
  reviewNote?: string
  reviewedAt?: string
}

export interface MyAuthorApplication {
  status: AuthorStatus
  application?: AuthorApplication
}

export interface AdminAuthor {
  id: string
  email: string
  fullName: string
  status: AuthorStatus
  emailVerified: boolean
  coursesCount: number
  createdAt: string
  application?: AuthorApplication
}
