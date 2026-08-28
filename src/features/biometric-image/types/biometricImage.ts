export type BiometricImageType = 'traces' | 'reference-prints'

export type BiometricImageStatus = 'RECEIVED' | 'PROCESSING' | 'PROCESSED' | 'FAILED'

export type WithdrawalMotive = 'DUPLICATE' | 'MISFILED' | 'WRONG_ATTRIBUTION'

export const WITHDRAWAL_MOTIVES: Record<BiometricImageType, WithdrawalMotive[]> = {
  traces: ['DUPLICATE', 'MISFILED'],
  'reference-prints': ['DUPLICATE', 'MISFILED', 'WRONG_ATTRIBUTION'],
}

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
  /** Nulle quand l'image a été détruite : il n'y a plus rien à signer. */
  url: string | null
  status: BiometricImageStatus
  score: number | null
  caseId: string
  subjectId: string | null
  position: string | null
  createdAt: string
  updatedAt: string
  matchings: MatchingScore[]
  withdrawnAt: string | null
  withdrawalMotive: WithdrawalMotive | null
  imageDestroyedAt: string | null
}

export interface BiometricImageDto {
  id: string
  path: string
  url: string | null
  status: BiometricImageStatus
  score: number | null
  caseId: string
  subjectId?: string | null
  position?: string | null
  createdAt: string
  updatedAt: string
  matchings: MatchingScore[]
  withdrawnAt?: string | null
  withdrawalMotive?: WithdrawalMotive | null
  imageDestroyedAt?: string | null
}
