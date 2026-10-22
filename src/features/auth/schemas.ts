import { z } from 'zod'
import type { TFunction } from 'i18next'
import {
  createAuthorApplicationSchema,
  type AuthorApplicationSchema,
} from '@/features/authors/schemas'

export function createLoginSchema(t: TFunction) {
  return z.object({
    email: z.string().email(t('validation.invalidEmail')),
    password: z.string().min(1, t('validation.passwordRequired')),
  })
}

export function createRegisterSchema(t: TFunction) {
  const offerSchema = createAuthorApplicationSchema(t)
  return z
    .object({
      fullName: z.string().min(2, t('validation.nameMin')),
      role: z.enum(['SUBSCRIBER', 'AUTHOR']),
      email: z.string().email(t('validation.invalidEmail')),
      password: z
        .string()
        .min(8, t('validation.passwordMin'))
        .regex(/(?=.*[a-zA-Z])(?=.*\d)/, t('validation.passwordPattern')),
      confirmPassword: z.string(),
      // Validated only for authors (see superRefine); students skip the offer.
      authorApplication: z.custom<AuthorApplicationSchema>(),
    })
    .refine((d) => d.password === d.confirmPassword, {
      message: t('validation.passwordMismatch'),
      path: ['confirmPassword'],
    })
    .superRefine((d, ctx) => {
      if (d.role !== 'AUTHOR') return
      const offer = offerSchema.safeParse(d.authorApplication)
      if (offer.success) return
      for (const issue of offer.error.issues) {
        ctx.addIssue({
          code: 'custom',
          message: issue.message,
          path: ['authorApplication', ...issue.path],
        })
      }
    })
}

export type LoginSchema = z.infer<ReturnType<typeof createLoginSchema>>
export type RegisterSchema = z.infer<ReturnType<typeof createRegisterSchema>>
