import { z } from 'zod'
import type { TFunction } from 'i18next'

export function createLoginSchema(t: TFunction) {
  return z.object({
    email: z.string().email(t('validation.invalidEmail')),
    password: z.string().min(1, t('validation.passwordRequired')),
  })
}

export function createRegisterSchema(t: TFunction) {
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
    })
    .refine((d) => d.password === d.confirmPassword, {
      message: t('validation.passwordMismatch'),
      path: ['confirmPassword'],
    })
}

export type LoginSchema = z.infer<ReturnType<typeof createLoginSchema>>
export type RegisterSchema = z.infer<ReturnType<typeof createRegisterSchema>>
