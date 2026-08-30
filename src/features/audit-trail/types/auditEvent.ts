export const AUDIT_EVENT_TYPES = [
  'TENANT_PROVISIONED',
  'CASE_OPENED',
  'CASE_STATUS_CHANGED',
  'CASE_OPERATOR_CHANGED',
  'CASE_UPDATED',
  'CASE_EXPERTISE_DECLARED',
  'CASE_SAISINE_UPDATED',
  'TRACE_UPLOADED',
  'TRACE_QUALIFIED',
  'TRACE_DELETED',
  'REFERENCE_PRINT_UPLOADED',
  'REFERENCE_PRINT_DELETED',
  'TRACE_RESTORED',
  'REFERENCE_PRINT_RESTORED',
  'REFERENCE_PRINT_IMAGE_DESTROYED',
  'LAYER_CREATED',
  'LAYER_UPDATED',
  'LAYER_DELETED',
  'COMPARISON_EXECUTED',
  'HIT_RECORDED',
  'HIT_REMOVED',
  'REPORT_GENERATED',
  'CHAIN_ANCHORED',
  'SERVICE_HEADER_SAVED',
  'TRACE_CALIBRATED',
  'REFERENCE_PRINT_CALIBRATED',
  'CASE_VERIFICATION_REQUESTED',
  'VERIFICATION_CONCLUSION_STATED',
  'CASE_VERIFICATION_COMPLETED',
  'TRACE_DESCRIBED',
  'TRACE_LOCATION_STATED',
  'LOCATION_PHOTO_UPLOADED',
  'LOCATION_PHOTO_DELETED',
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
