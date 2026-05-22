import { z } from 'zod'

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
  caseNumber: z.string().trim().min(1, "Le numéro d'affaire est requis"),
  pvNumber: z.string().trim().min(1, 'Le numéro de PV est requis'),
  description: z.string().trim().max(2000),
  location: z.string().trim().min(1, 'La localisation est requise'),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'UNDER_REVIEW', 'CLOSED']),
})

export type InvestigationCaseCreateInput = z.infer<typeof investigationCaseCreateSchema>
