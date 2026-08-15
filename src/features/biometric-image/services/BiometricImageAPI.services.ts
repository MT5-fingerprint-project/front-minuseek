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

export type UploadInput = {
  caseId: string
  file: File
  subjectId?: string
  position?: string
}

function mapDtoToBiometricImage(dto: BiometricImageDto): BiometricImage {
  return {
    id: dto.id,
    fileName: dto.path.split('/').pop() ?? dto.path,
    url: dto.url,
    status: dto.status,
    score: dto.score,
    caseId: dto.caseId,
    subjectId: dto.subjectId ?? null,
    position: dto.position ?? null,
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

  upload: (type: BiometricImageType, { caseId, file, subjectId, position }: UploadInput) => {
    const formData = new FormData()
    formData.append('caseId', caseId)
    formData.append('file', file)
    if (subjectId) formData.append('subjectId', subjectId)
    if (position) formData.append('position', position)

    return apiClient
      .post<BiometricImageDto | { data: BiometricImageDto }>(endpointByType[type], formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => {
        const dto = 'data' in res.data ? res.data.data : res.data
        return mapDtoToBiometricImage(dto)
      })
  },

  compare: (
    traceId: string,
    input: { caseId: string; referencePrintIds: string[] },
  ) =>
    apiClient
      .post<{ matchings: { referencePrintId: string; score: number; match: boolean }[] }>(
        `/traces/${traceId}/compare`,
        input,
      )
      .then((res) => res.data.matchings),
}
