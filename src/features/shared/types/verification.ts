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

export function verifierNameOf(verification: CaseVerification): string | null {
  if (!verification.verifier) return null
  return `${verification.verifier.firstName} ${verification.verifier.lastName}`
}

export function isInProgress(verification: CaseVerification): boolean {
  return verification.status === 'PENDING'
}
