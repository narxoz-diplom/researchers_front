import { z } from 'zod'
import type { TFunction } from 'i18next'

export function createFounderSchema(t: TFunction) {
  return z.object({
    fullName: z.string().trim().min(1, t('admin.founders.validation.fullNameRequired')),
    position: z.string().trim().min(1, t('admin.founders.validation.positionRequired')),
    description: z.string().trim().min(1, t('admin.founders.validation.descriptionRequired')),
    videoUrl: z
      .string()
      .trim()
      .min(1, t('admin.founders.validation.videoRequired'))
      .url(t('admin.founders.validation.invalidUrl')),
    previewUrl: z.union([
      z.literal(''),
      z.string().trim().url(t('admin.founders.validation.invalidUrl')),
    ]),
    orderNumber: z.coerce.number().min(0, t('admin.founders.validation.orderMin')),
    isPublished: z.boolean(),
  })
}

export type FounderSchema = z.infer<ReturnType<typeof createFounderSchema>>
