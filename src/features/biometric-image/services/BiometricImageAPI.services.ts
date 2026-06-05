import { apiClient } from '@/features/shared/lib/apiClient'
import type { BiometricImage, BiometricImageType } from '@/features/biometric-image/types/biometricImage'

const endpointByType: Record<BiometricImageType, string> = {
  traces: '/traces',
  'reference-prints': '/reference-prints',
}

export const BiometricImageAPI = {
  getAll: (type: BiometricImageType) =>
    apiClient.get<BiometricImage[]>(endpointByType[type]).then((res) => res.data),
}
