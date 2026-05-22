import type { InvestigationCaseStatus } from '@/types/investigationCase/investigationCase'

export const INVESTIGATION_CASE_STATUS_LABELS = {
  OPEN: 'Ouverte',
  IN_PROGRESS: 'En cours',
  UNDER_REVIEW: 'En verification',
  CLOSED: 'Fermée',
} as const satisfies Record<InvestigationCaseStatus, string>
