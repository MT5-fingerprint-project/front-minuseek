import { z } from 'zod'
import i18n from '@/features/shared/lib/i18n'

export const investigationCaseStatusSchema = z.enum(['OPEN', 'IN_PROGRESS', 'UNDER_REVIEW', 'CLOSED'])
export type InvestigationCaseStatus = z.infer<typeof investigationCaseStatusSchema>

export type CaseOperator = {
  id: string
  firstName: string
  lastName: string
}

export interface InvestigationCase {
  id: string
  description?: string | undefined
  caseNumber: string
  pvNumber: string
  status: InvestigationCaseStatus
  operator: CaseOperator | null
  createdAt: Date
  updatedAt: Date
}

export const caseOperatorSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
})

export const investigationCaseSchema = z.object({
  id: z.string(),
  description: z.string().optional(),
  caseNumber: z.string().min(1),
  pvNumber: z.string().min(1),
  status: investigationCaseStatusSchema,
  operator: caseOperatorSchema.nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const listInvestigationCasesResponseSchema = z.object({
  data: z.array(investigationCaseSchema),
})

export const investigationCaseCreateSchema = z.object({
  caseNumber: z.string().trim().min(1, i18n.t('investigationCase.validation.caseNumberRequired')),
  pvNumber: z.string().trim().min(1, i18n.t('investigationCase.validation.pvNumberRequired')),
  description: z.string().trim().max(2000),
})

export type InvestigationCaseCreateInput = z.infer<typeof investigationCaseCreateSchema>

export const investigationCaseEditSchema = z.object({
  pvNumber: z.string().trim().min(1, i18n.t('investigationCase.validation.pvNumberRequired')),
  description: z.string().trim().max(2000),
  operatorUserId: z.string(),
})

export type InvestigationCaseEditValues = z.infer<typeof investigationCaseEditSchema>

export type InvestigationCaseCorrections = {
  pvNumber?: string
  description?: string | null
  operatorUserId?: string
}

export function correctedFieldsOf(
  investigationCase: InvestigationCase,
  values: InvestigationCaseEditValues
): InvestigationCaseCorrections {
  const corrections: InvestigationCaseCorrections = {}

  const pvNumber = values.pvNumber.trim()
  if (pvNumber !== investigationCase.pvNumber) {
    corrections.pvNumber = pvNumber
  }

  const description = values.description.trim()
  if (description !== (investigationCase.description ?? '')) {
    corrections.description = description === '' ? null : description
  }

  if (values.operatorUserId !== (investigationCase.operator?.id ?? '')) {
    corrections.operatorUserId = values.operatorUserId
  }

  return corrections
}

export function hasCorrections(corrections: InvestigationCaseCorrections): boolean {
  return Object.keys(corrections).length > 0
}

export function operatorNameOf({ firstName, lastName }: CaseOperator): string {
  return `${firstName} ${lastName}`
}
