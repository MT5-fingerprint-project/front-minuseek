import { apiClient } from '@/features/shared/lib/apiClient'
import type {
  BiometricImage,
  BiometricImageDto,
  BiometricImageType,
} from '@/features/biometric-image/types/biometricImage'

const endpointByType: Record<BiometricImageType, string> = {
  traces: '/traces',
  'reference-prints': '/reference-prints',
}

type UploadInput = {
  caseId: string
  file: File
}

function mapDtoToBiometricImage(dto: BiometricImageDto): BiometricImage {
  return {
    id: dto.id,
    fileName: dto.path.split('/').pop() ?? dto.path,
    url: dto.url,
    status: dto.status,
    score: dto.score,
    caseId: dto.caseId,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    matchings: dto.matchings ?? [],
  }
}

export const BiometricImageAPI = {
  getAll: (type: BiometricImageType, caseId: string) =>
    apiClient
      .get<{ data: BiometricImageDto[] }>(endpointByType[type], { params: { caseId } })
      .then((res) => res.data.data.map(mapDtoToBiometricImage)),

  remove: (type: BiometricImageType, id: string) =>
    apiClient.delete(`${endpointByType[type]}/${id}`).then((res) => res.data),

  upload: (type: BiometricImageType, { caseId, file }: UploadInput) => {
    const formData = new FormData()
    formData.append('caseId', caseId)
    formData.append('file', file)

    return apiClient
      .post<BiometricImageDto | { data: BiometricImageDto }>(endpointByType[type], formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => {
        const dto = 'data' in res.data ? res.data.data : res.data
        return mapDtoToBiometricImage(dto)
      })
  },

  saveMatchings: (
    traceId: string,
    matchings: { referencePrintId: string; score: number; match: boolean }[],
  ) =>
    apiClient
      .post(`/traces/${traceId}/matchings`, { matchings })
      .then((res) => res.data),
}
