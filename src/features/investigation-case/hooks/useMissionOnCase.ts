import { useMyVerifications } from '@/features/shared/hooks/useMyVerifications'
import type { CaseVerification } from '@/features/shared/types/verification'

export function useMissionOnCase(caseId: string): CaseVerification | undefined {
  const { data: verifications = [] } = useMyVerifications()
  return verifications.find((verification) => verification.caseId === caseId)
}
