export type BiometricImageType = 'traces' | 'reference-prints'

export type BiometricImageStatus = 'RECEIVED' | 'PROCESSING' | 'PROCESSED' | 'FAILED'

export interface BiometricImageDecoration {
  label?: string
  borderColor?: string
}

export interface MatchingScore {
  traceId: string
  score: number
  match: boolean
}

export interface BiometricImage {
  id: string
  fileName: string
  url: string
  status: BiometricImageStatus
  score: number | null
  caseId: string
  /** Renseignés uniquement pour les empreintes de référence rattachées à un sujet. */
  subjectId: string | null
  position: string | null
  createdAt: string
  updatedAt: string
  matchings: MatchingScore[]
}

export interface BiometricImageDto {
  id: string
  path: string
  url: string
  status: BiometricImageStatus
  score: number | null
  caseId: string
  subjectId?: string | null
  position?: string | null
  createdAt: string
  updatedAt: string
  matchings: MatchingScore[]
}
