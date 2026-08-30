import { z } from 'zod'
import i18n from '@/features/shared/lib/i18n'

export const traceOriginSchema = z.enum(['DIGITAL', 'PALMAR'])
export type TraceOrigin = z.infer<typeof traceOriginSchema>

export const revelationTechniqueSchema = z.enum(['OPTICAL_PROCESS', 'FINGERPRINT_POWDER', 'DFO', 'NINHYDRIN'])
export type RevelationTechnique = z.infer<typeof revelationTechniqueSchema>

const MAX_LOCATION_LENGTH = 300

export const traceDescriptionSchema = z.object({
  origin: z.enum(traceOriginSchema.options, i18n.t('trace.validation.originRequired')),
  location: z
    .string()
    .trim()
    .min(1, i18n.t('trace.validation.locationRequired'))
    .max(MAX_LOCATION_LENGTH, i18n.t('trace.validation.locationTooLong', { max: MAX_LOCATION_LENGTH })),
  revelationTechnique: z.enum(
    revelationTechniqueSchema.options,
    i18n.t('trace.validation.revelationTechniqueRequired')
  ),
})

export type TraceDescriptionInput = z.infer<typeof traceDescriptionSchema>

export type TraceLocationPhoto = {
  id: string
  url: string
  sha256: string
  sealedAt: string
}
