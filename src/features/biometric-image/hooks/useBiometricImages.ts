import { useQuery } from '@tanstack/react-query'
import { BiometricImageAPI } from '@/features/biometric-image/services/BiometricImageAPI.services'
import type { BiometricImageType } from '@/features/biometric-image/types/biometricImage'

export const biometricImageKeys = {
  all: ['biometric-images'] as const,
  list: (type: BiometricImageType) => [...biometricImageKeys.all, type] as const,
}

export function useBiometricImages(type: BiometricImageType) {
  return useQuery({
    queryKey: biometricImageKeys.list(type),
    queryFn: () => BiometricImageAPI.getAll(type),
  })
}
