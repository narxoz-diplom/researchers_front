import { z } from 'zod'
import type { TFunction } from 'i18next'

/** http(s) URL or a site-relative path such as /founders/photo.jpg */
const IMAGE_URL_PATTERN = /^(https?:\/\/|\/(?!\/))\S+$/

export function createFounderSchema(t: TFunction) {
  const imageUrl = z.string().trim().regex(IMAGE_URL_PATTERN, t('admin.founders.validation.invalidUrl'))

  return z.object({
    fullName: z.string().trim().min(1, t('admin.founders.validation.fullNameRequired')),
    position: z.string().trim().min(1, t('admin.founders.validation.positionRequired')),
    description: z.string().trim().min(1, t('admin.founders.validation.descriptionRequired')),
    videoUrl: z.union([
      z.literal(''),
      z.string().trim().url(t('admin.founders.validation.invalidUrl')),
    ]),
    previewUrl: z.union([z.literal(''), imageUrl]),
    profileUrl: z.union([
      z.literal(''),
      z.string().trim().url(t('admin.founders.validation.invalidUrl')),
    ]),
    bio: z.string(),
    /** One photo URL per line */
    gallery: z.string().refine(
      (value) =>
        value
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)
          .every((line) => IMAGE_URL_PATTERN.test(line)),
      t('admin.founders.validation.invalidUrl'),
    ),
    orderNumber: z.number().min(0, t('admin.founders.validation.orderMin')),
    isPublished: z.boolean(),
  })
}

export type FounderSchema = z.infer<ReturnType<typeof createFounderSchema>>
