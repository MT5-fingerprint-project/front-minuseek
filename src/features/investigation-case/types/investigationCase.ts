import { z } from 'zod'
import i18n from '@/features/shared/lib/i18n'

export const investigationCaseStatusSchema = z.enum(['OPEN', 'IN_PROGRESS', 'UNDER_REVIEW', 'CLOSED'])
export type InvestigationCaseStatus = z.infer<typeof investigationCaseStatusSchema>

export interface InvestigationCase {
  id: string
  description?: string | undefined
  caseNumber: string
  pvNumber: string
  location?: string
  status: InvestigationCaseStatus
  createdAt: Date
  updatedAt: Date
}

export interface ListInvestigationCasesResponse {
  data: InvestigationCase[]
}

export const investigationCaseSchema = z.object({
  id: z.string(),
  description: z.string(),
  caseNumber: z.string().min(1),
  pvNumber: z.string().min(1),
  status: investigationCaseStatusSchema,
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
})

export const listInvestigationCasesResponseSchema = z.object({
  data: z.array(investigationCaseSchema)
})

export const investigationCaseCreateSchema = z.object({
  caseNumber: z.string().trim().min(1, i18n.t('investigationCase.validation.caseNumberRequired')),
  pvNumber: z.string().trim().min(1, i18n.t('investigationCase.validation.pvNumberRequired')),
  description: z.string().trim().max(2000),
  //location: z.string().trim().optional(),
})

export type InvestigationCaseCreateInput = z.infer<typeof investigationCaseCreateSchema>
