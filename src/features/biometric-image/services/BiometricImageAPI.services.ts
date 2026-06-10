import { apiClient } from '@/features/shared/lib/apiClient'
import type { PaginatedResponse } from '@/features/shared/types/api'
import type { BiometricImage, BiometricImageType } from '@/features/biometric-image/types/biometricImage'

const endpointByType: Record<BiometricImageType, string> = {
  traces: '/traces',
  'reference-prints': '/reference-prints',
}

export const BiometricImageAPI = {
  getAll: (type: BiometricImageType) =>
    apiClient.get<PaginatedResponse<BiometricImage>>(endpointByType[type]).then((res) => res.data.data),
}
