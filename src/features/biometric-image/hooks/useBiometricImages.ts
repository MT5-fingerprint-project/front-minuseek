import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { BiometricImageAPI } from '@/features/biometric-image/services/BiometricImageAPI.services'
import type { BiometricImageType } from '@/features/biometric-image/types/biometricImage'

export const biometricImageKeys = {
  all: ['biometric-images'] as const,
  list: (type: BiometricImageType, caseId: string) =>
    [...biometricImageKeys.all, type, caseId] as const,
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

export function useDeleteBiometricImage(type: BiometricImageType, caseId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => BiometricImageAPI.remove(type, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: biometricImageKeys.list(type, caseId) })
      toast.success(t('biometricImage.delete.success'))
    },
    onError: () => {
      toast.error(t('biometricImage.delete.error'))
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
    mutationFn: (input: { caseId: string; file: File }) => BiometricImageAPI.upload(type, input),
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
