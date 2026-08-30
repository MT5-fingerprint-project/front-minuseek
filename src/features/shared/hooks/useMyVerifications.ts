import { useQuery } from '@tanstack/react-query'
import { MyVerificationsAPI } from '@/features/shared/services/VerificationAPI.services'

export const verificationKeys = {
  all: ['verifications'] as const,
  mine: () => [...verificationKeys.all, 'mine'] as const,
  forCase: (caseId: string) => [...verificationKeys.all, 'case', caseId] as const,
}

export function useMyVerifications() {
  return useQuery({
    queryKey: verificationKeys.mine(),
    queryFn: () => MyVerificationsAPI.listMine(),
  })
}
