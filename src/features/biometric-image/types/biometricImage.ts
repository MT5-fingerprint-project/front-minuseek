import type { RevelationTechnique, TraceLocationPhoto, TraceOrigin } from '@/features/biometric-image/types/trace'

export type BiometricImageType = 'traces' | 'reference-prints'

export type BiometricImageStatus = 'RECEIVED' | 'EXPLOITABLE' | 'NOT_EXPLOITABLE'

export type WithdrawalMotive = 'DUPLICATE' | 'MISFILED' | 'WRONG_ATTRIBUTION' | 'OTHER'

export const WITHDRAWAL_MOTIVES: Record<BiometricImageType, WithdrawalMotive[]> = {
  traces: ['DUPLICATE', 'MISFILED', 'OTHER'],
  'reference-prints': ['DUPLICATE', 'MISFILED', 'WRONG_ATTRIBUTION', 'OTHER'],
}

/** La longueur de la colonne qui la reçoit, côté back. */
export const MAX_WITHDRAWAL_MOTIVE_DETAIL_LENGTH = 300

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
  label: string
  number: number | null
  url: string | null
  status: BiometricImageStatus | null
  identified: boolean | null
  score: number | null
  caseId: string
  subjectId: string | null
  position: string | null
  createdAt: string
  updatedAt: string
  matchings: MatchingScore[]
  withdrawnAt: string | null
  withdrawalMotive: WithdrawalMotive | null
  withdrawalMotiveDetail: string | null
  imageDestroyedAt: string | null
  resolutionDpi: number | null
  origin: TraceOrigin | null
  location: string | null
  revelationTechnique: RevelationTechnique | null
  hasLocationPhoto: boolean
  locationPhoto: TraceLocationPhoto | null
}

export interface BiometricImageDto {
  id: string
  path: string
  number?: number | null
  reference?: string | null
  url: string | null
  status: BiometricImageStatus | null
  identified?: boolean | null
  score: number | null
  caseId: string
  subjectId?: string | null
  position?: string | null
  createdAt: string
  updatedAt: string
  matchings: MatchingScore[]
  withdrawnAt?: string | null
  withdrawalMotive?: WithdrawalMotive | null
  withdrawalMotiveDetail?: string | null
  imageDestroyedAt?: string | null
  resolutionDpi?: number | null
  origin?: TraceOrigin | null
  location?: string | null
  revelationTechnique?: RevelationTechnique | null
  hasLocationPhoto?: boolean
  locationPhoto?: TraceLocationPhoto | null
}
