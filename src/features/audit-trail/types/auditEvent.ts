export const AUDIT_EVENT_TYPES = [
  'TENANT_PROVISIONED',
  'CASE_OPENED',
  'CASE_STATUS_CHANGED',
  'TRACE_UPLOADED',
  'TRACE_QUALIFIED',
  'TRACE_DELETED',
  'REFERENCE_PRINT_UPLOADED',
  'REFERENCE_PRINT_DELETED',
  'LAYER_CREATED',
  'LAYER_UPDATED',
  'LAYER_DELETED',
  'COMPARISON_EXECUTED',
  'HIT_RECORDED',
  'HIT_REMOVED',
  'REPORT_GENERATED',
  'CHAIN_ANCHORED',
] as const

export type AuditEventType = (typeof AUDIT_EVENT_TYPES)[number]

export type EvidenceClass = 'OBSERVED' | 'DECLARED'

export type AuditEventActor = {
  displayName: string
  username: string
}

export type CaseAuditEvent = {
  seq: number
  eventType: AuditEventType
  evidenceClass: EvidenceClass
  actor: AuditEventActor
  occurredAt: string
  payload: Record<string, unknown>
}

export type CaseAuditEventFilters = {
  eventType?: AuditEventType
  page?: number
  limit?: number
}
