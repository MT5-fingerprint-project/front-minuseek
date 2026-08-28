import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { BiometricImageAPI, type UploadInput } from '@/features/biometric-image/services/BiometricImageAPI.services'
import type {
  BiometricImageType,
  WithdrawalMotive,
} from '@/features/biometric-image/types/biometricImage'

export const biometricImageKeys = {
  all: ['biometric-images'] as const,
  list: (type: BiometricImageType, caseId: string) =>
    [...biometricImageKeys.all, type, caseId] as const,
  withdrawn: (type: BiometricImageType, caseId: string) =>
    [...biometricImageKeys.all, type, caseId, 'withdrawn'] as const,
}

export function useBiometricImages(type: BiometricImageType, caseId: string) {
  return useQuery({
    queryKey: biometricImageKeys.list(type, caseId),
    queryFn: () => BiometricImageAPI.getAll(type, caseId),
    enabled: !!caseId,
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  })
}

export function useWithdrawnBiometricImages(type: BiometricImageType, caseId: string) {
  return useQuery({
    queryKey: biometricImageKeys.withdrawn(type, caseId),
    queryFn: () => BiometricImageAPI.getAll(type, caseId, { withdrawn: true }),
    enabled: !!caseId,
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  })
}

/** Une pièce passe d'une liste à l'autre : les deux se rafraîchissent, sinon
 * elle n'apparaît dans les pièces retirées qu'après un rechargement. */
function invalidateBothLists(
  queryClient: ReturnType<typeof useQueryClient>,
  type: BiometricImageType,
  caseId: string,
) {
  queryClient.invalidateQueries({ queryKey: biometricImageKeys.list(type, caseId) })
  queryClient.invalidateQueries({ queryKey: biometricImageKeys.withdrawn(type, caseId) })
}

export function useWithdrawBiometricImage(type: BiometricImageType, caseId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ id, motive }: { id: string; motive: WithdrawalMotive }) =>
      BiometricImageAPI.withdraw(type, id, motive),
    onSuccess: () => {
      invalidateBothLists(queryClient, type, caseId)
      toast.success(t('biometricImage.withdraw.success'))
    },
    onError: () => {
      toast.error(t('biometricImage.withdraw.error'))
    },
  })
}

export function useRestoreBiometricImage(type: BiometricImageType, caseId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => BiometricImageAPI.restore(type, id),
    onSuccess: () => {
      invalidateBothLists(queryClient, type, caseId)
      toast.success(t('biometricImage.restore.success'))
    },
    onError: () => {
      toast.error(t('biometricImage.restore.error'))
    },
  })
}

type UseUploadBiometricImageOptions = {
  onSuccess?: (image: import('@/features/biometric-image/types/biometricImage').BiometricImage) => void
}

export function useUploadBiometricImage(type: BiometricImageType, options?: UseUploadBiometricImageOptions) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (input: UploadInput) => BiometricImageAPI.upload(type, input),
    onSuccess: (image, variables) => {
      queryClient.invalidateQueries({ queryKey: biometricImageKeys.list(type, variables.caseId) })
      toast.success(t('biometricImage.upload.success'))
      options?.onSuccess?.(image)
    },
    onError: () => {
      toast.error(t('biometricImage.upload.error'))
    },
  })
}
