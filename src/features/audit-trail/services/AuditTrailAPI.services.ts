import { apiClient } from '@/features/shared/lib/apiClient'
import type { PaginatedResponse } from '@/features/shared/types/api'
import type { CaseAuditEvent, CaseAuditEventFilters } from '@/features/audit-trail/types/auditEvent'

export const AuditTrailAPI = {
  getCaseEvents: (caseId: string, filters: CaseAuditEventFilters = {}) =>
    apiClient
      .get<PaginatedResponse<CaseAuditEvent>>(`/investigation-cases/${caseId}/audit-events`, { params: filters })
      .then((res) => res.data),
}
