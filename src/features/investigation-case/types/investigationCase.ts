import { z } from 'zod'
import i18n from '@/features/shared/lib/i18n'

export interface InvestigationCase {
  id: string
  description: string
  caseNumber: string
  pvNumber: string
  location?: string
  status: InvestigationCaseStatus
  createdAt: Date
  updatedAt: Date
}

export type InvestigationCaseStatus = 'OPEN' | 'IN_PROGRESS' | 'UNDER_REVIEW' | 'CLOSED'

export const investigationCaseCreateSchema = z.object({
  caseNumber: z.string().trim().min(1, i18n.t('investigationCase.validation.caseNumberRequired')),
  pvNumber: z.string().trim().min(1, i18n.t('investigationCase.validation.pvNumberRequired')),
  description: z.string().trim().max(2000),
  location: z.string().trim().min(1, i18n.t('investigationCase.validation.locationRequired')),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'UNDER_REVIEW', 'CLOSED']),
})

export type InvestigationCaseCreateInput = z.infer<typeof investigationCaseCreateSchema>
