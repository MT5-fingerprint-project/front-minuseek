import { z } from 'zod'
import i18n from '@/features/shared/lib/i18n'

export type ServiceSettings = {
  administration: string
  serviceName: string
  postalAddress: string
  phoneNumber: string
  email: string
  signatureCity: string
}

export const serviceSettingsSchema = z.object({
  administration: z.string().trim(),
  serviceName: z.string().trim(),
  postalAddress: z.string().trim(),
  phoneNumber: z.string().trim(),
  email: z
    .string()
    .trim()
    .refine(
      (email) => email === '' || z.email().safeParse(email).success,
      i18n.t('settings.validation.emailInvalid')
    ),
  signatureCity: z.string().trim(),
})

export type ServiceSettingsInput = z.infer<typeof serviceSettingsSchema>
