import { z } from 'zod'
import type { TFunction } from 'i18next'

const compact = (v: string) => v.replace(/\s+/g, '').toUpperCase()

/** Same rules as the API (AuthorApplicationDto). */
export function createAuthorApplicationSchema(t: TFunction) {
  return z.object({
    legalName: z.string().trim().min(3, t('offer.validation.legalName')).max(200),
    iin: z
      .string()
      .transform(compact)
      .refine((v) => /^\d{12}$/.test(v), t('offer.validation.iin')),
    phone: z
      .string()
      .trim()
      .refine((v) => /^\+?[\d\s()-]{10,20}$/.test(v), t('offer.validation.phone')),
    city: z.string().trim().min(2, t('offer.validation.city')).max(120),
    acceptOffer: z.boolean().refine((v) => v, t('offer.validation.accept')),
  })
}

export type AuthorApplicationSchema = z.infer<ReturnType<typeof createAuthorApplicationSchema>>

export const EMPTY_AUTHOR_APPLICATION: AuthorApplicationSchema = {
  legalName: '',
  iin: '',
  phone: '',
  city: '',
  acceptOffer: false,
}
