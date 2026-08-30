import { apiClient } from '@/features/shared/lib/apiClient'
import type {
  BiometricImage,
  BiometricImageDto,
  BiometricImageType,
  WithdrawalMotive,
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
    label: dto.reference ?? dto.path.split('/').pop() ?? dto.path,
    url: dto.url,
    status: dto.status ?? null,
    identified: dto.identified ?? null,
    score: dto.score,
    caseId: dto.caseId,
    subjectId: dto.subjectId ?? null,
    position: dto.position ?? null,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    matchings: dto.matchings ?? [],
    withdrawnAt: dto.withdrawnAt ?? null,
    withdrawalMotive: dto.withdrawalMotive ?? null,
    imageDestroyedAt: dto.imageDestroyedAt ?? null,
    resolutionDpi: dto.resolutionDpi ?? null,
  }
}

export const BiometricImageAPI = {
  getAll: (type: BiometricImageType, caseId: string, options?: { withdrawn?: boolean }) =>
    apiClient
      .get<{ data: BiometricImageDto[] }>(endpointByType[type], {
        params: { caseId, ...(options?.withdrawn ? { withdrawn: 'true' } : {}) },
      })
      .then((res) => res.data.data.map(mapDtoToBiometricImage)),

  getTrace: (id: string) =>
    apiClient.get<BiometricImageDto>(`/traces/${id}`).then((res) => mapDtoToBiometricImage(res.data)),

  withdraw: (type: BiometricImageType, id: string, motive: WithdrawalMotive) =>
    apiClient
      .post(`${endpointByType[type]}/${id}/withdraw`, { motive })
      .then((res) => res.data),

  restore: (type: BiometricImageType, id: string) =>
    apiClient.post(`${endpointByType[type]}/${id}/restore`).then((res) => res.data),

  calibrate: (type: BiometricImageType, id: string, resolutionDpi: number) =>
    apiClient.patch(`${endpointByType[type]}/${id}/calibration`, { resolutionDpi }).then(() => undefined),

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
