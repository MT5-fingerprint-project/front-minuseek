import { useQuery } from '@tanstack/react-query'
import { AuditTrailAPI } from '@/features/audit-trail/services/AuditTrailAPI.services'
import type { CaseAuditEventFilters } from '@/features/audit-trail/types/auditEvent'

export const auditTrailKeys = {
  all: ['audit-trail'] as const,
  case: (caseId: string, filters: CaseAuditEventFilters = {}) =>
    [...auditTrailKeys.all, 'case', caseId, filters] as const,
}

export function useCaseAuditEvents(caseId: string, filters: CaseAuditEventFilters = {}) {
  return useQuery({
    queryKey: auditTrailKeys.case(caseId, filters),
    queryFn: () => AuditTrailAPI.getCaseEvents(caseId, filters),
    enabled: !!caseId,
  })
}
