import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { verificationKeys } from '@/features/shared/hooks/useMyVerifications'
import type { VerificationExploitability } from '@/features/shared/types/verification'
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

export function useVerificationDetail(verificationId: string | undefined) {
  return useQuery({
    queryKey: verificationKeys.detail(verificationId ?? ''),
    queryFn: () => VerificationAPI.getDetail(verificationId ?? ''),
    enabled: !!verificationId,
  })
}

export function useRecordConclusion(verificationId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (conclusion: {
      traceId: string
      exploitability: VerificationExploitability
      identifiedReferencePrintId: string | null
    }) =>
      VerificationAPI.conclude(verificationId, conclusion.traceId, {
        exploitability: conclusion.exploitability,
        identifiedReferencePrintId: conclusion.identifiedReferencePrintId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: verificationKeys.detail(verificationId) })
    },
    onError: () => {
      toast.error(t('verification.conclusions.saveFailed'))
    },
  })
}

export function useCompleteVerification(verificationId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: () => VerificationAPI.complete(verificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: verificationKeys.detail(verificationId) })
      queryClient.invalidateQueries({ queryKey: verificationKeys.mine() })
      toast.success(t('verification.conclusions.completed'))
    },
    onError: () => {
      toast.error(t('verification.conclusions.completeFailed'))
    },
  })
}
