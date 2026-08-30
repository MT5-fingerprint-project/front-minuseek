import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { verificationKeys } from '@/features/shared/hooks/useMyVerifications'
import {
  VerificationAPI,
  VerificationRefusedError,
} from '@/features/investigation-case/services/VerificationAPI.services'

export function useCaseVerifications(caseId: string) {
  return useQuery({
    queryKey: verificationKeys.forCase(caseId),
    queryFn: () => VerificationAPI.listForCase(caseId),
    enabled: !!caseId,
  })
}

export function useEntrustVerification(caseId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (verifierUserId: string) => VerificationAPI.entrust(caseId, verifierUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: verificationKeys.forCase(caseId) })
      toast.success(t('verification.entrust.success'))
    },
    onError: (error: unknown) => {
      const refusal = error instanceof VerificationRefusedError ? error.refusal : 'unexpected'
      toast.error(t(`verification.entrust.refusals.${refusal}`))
    },
  })
}
