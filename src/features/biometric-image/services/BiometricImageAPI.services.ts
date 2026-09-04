import { apiClient } from '@/features/shared/lib/apiClient'
import type {
  BiometricImage,
  BiometricImageDto,
  BiometricImageType,
  WithdrawalMotive,
} from '@/features/biometric-image/types/biometricImage'
import type {
  TraceDescriptionInput,
  TraceLocationPhoto,
  TraceLocationPhotoDto,
} from '@/features/biometric-image/types/trace'

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

function mapDtoToTraceLocationPhoto(dto: TraceLocationPhotoDto): TraceLocationPhoto {
  return {
    id: dto.id,
    url: dto.url,
    thumbUrl: dto.thumbUrl ?? null,
    sha256: dto.sha256,
    sealedAt: dto.sealedAt,
  }
}

function mapDtoToBiometricImage(dto: BiometricImageDto): BiometricImage {
  return {
    id: dto.id,
    label: dto.reference ?? dto.path.split('/').pop() ?? dto.path,
    number: dto.number ?? null,
    url: dto.url,
    thumbUrl: dto.thumbUrl ?? null,
    status: dto.status ?? null,
    identified: dto.identified ?? null,
    notIdentified: dto.notIdentified ?? null,
    cote: dto.cote ?? null,
    caseId: dto.caseId,
    subjectId: dto.subjectId ?? null,
    position: dto.position ?? null,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    matchings: dto.matchings ?? [],
    withdrawnAt: dto.withdrawnAt ?? null,
    withdrawalMotive: dto.withdrawalMotive ?? null,
    withdrawalMotiveDetail: dto.withdrawalMotiveDetail ?? null,
    imageDestroyedAt: dto.imageDestroyedAt ?? null,
    resolutionDpi: dto.resolutionDpi ?? null,
    sourceWidth: dto.sourceWidth ?? null,
    sourceHeight: dto.sourceHeight ?? null,
    origin: dto.origin ?? null,
    location: dto.location ?? null,
    revelationTechnique: dto.revelationTechnique ?? null,
    hasLocationPhoto: dto.hasLocationPhoto ?? false,
    locationPhoto: dto.locationPhoto ? mapDtoToTraceLocationPhoto(dto.locationPhoto) : null,
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

  describeTrace: (id: string, input: TraceDescriptionInput) =>
    apiClient
      .put<BiometricImageDto>(`/traces/${id}/description`, input)
      .then((res) => mapDtoToBiometricImage(res.data)),

  declareExploitability: (id: string, exploitable: boolean) =>
    apiClient
      .put<BiometricImageDto>(`/traces/${id}/exploitability`, { exploitable })
      .then((res) => mapDtoToBiometricImage(res.data)),

  declareNotIdentified: (id: string) =>
    apiClient
      .put<BiometricImageDto>(`/traces/${id}/not-identified`)
      .then((res) => mapDtoToBiometricImage(res.data)),

  withdrawNotIdentified: (id: string) =>
    apiClient
      .delete<BiometricImageDto>(`/traces/${id}/not-identified`)
      .then((res) => mapDtoToBiometricImage(res.data)),

  attachLocationPhoto: (traceId: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    return apiClient
      .post(`/traces/${traceId}/location-photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(() => undefined)
  },

  removeLocationPhoto: (traceId: string, motive: WithdrawalMotive, motiveDetail?: string) =>
    apiClient
      .delete(`/traces/${traceId}/location-photo`, {
        params: { motive, ...(motiveDetail ? { motiveDetail } : {}) },
      })
      .then(() => undefined),

  withdraw: (
    type: BiometricImageType,
    id: string,
    motive: WithdrawalMotive,
    motiveDetail?: string,
  ) =>
    apiClient
      .post(`${endpointByType[type]}/${id}/withdraw`, { motive, ...(motiveDetail ? { motiveDetail } : {}) })
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
