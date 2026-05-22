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
