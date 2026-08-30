export type VerificationStatus = 'PENDING' | 'CONCORDANT' | 'DISCORDANT'

export type VerifierIdentity = {
  firstName: string
  lastName: string
}

export type CaseVerification = {
  id: string
  caseId: string
  caseNumber: string
  verifierUserId: string
  verifier: VerifierIdentity | null
  status: VerificationStatus
  requestedAt: string
  completedAt: string | null
}

export type VerificationExploitability = 'EXPLOITABLE' | 'NOT_EXPLOITABLE'

export type DecisionOutcome = 'CONCORDANT' | 'DISCORDANT'

export type VerificationConclusion = {
  traceId: string
  exploitability: VerificationExploitability
  identifiedReferencePrintId: string | null
  outcome: DecisionOutcome | null
  statedAt: string
}

export type VerificationDetail = CaseVerification & {
  conclusions: VerificationConclusion[]
}

export function verifierNameOf(verification: CaseVerification): string | null {
  if (!verification.verifier) return null
  return `${verification.verifier.firstName} ${verification.verifier.lastName}`
}

export function isInProgress(verification: CaseVerification): boolean {
  return verification.status === 'PENDING'
}
