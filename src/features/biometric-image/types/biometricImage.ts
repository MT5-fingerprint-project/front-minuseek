export type BiometricImageType = 'traces' | 'reference-prints'

export type BiometricImageStatus = 'RECEIVED' | 'PROCESSING' | 'PROCESSED' | 'FAILED'

export interface BiometricImage {
  id: string
  fileName: string
  url: string
  status: BiometricImageStatus
  score: number | null
  caseId: string
  createdAt: string
  updatedAt: string
}

export interface BiometricImageDto {
  id: string
  path: string
  status: BiometricImageStatus
  score: number | null
  caseId: string
  createdAt: string
  updatedAt: string
}
