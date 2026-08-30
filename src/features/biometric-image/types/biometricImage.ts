export type BiometricImageType = 'traces' | 'reference-prints'

export type BiometricImageStatus = 'RECEIVED' | 'EXPLOITABLE' | 'NOT_EXPLOITABLE'

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
  label: string
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
  imageDestroyedAt: string | null
  resolutionDpi: number | null
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
  imageDestroyedAt?: string | null
  resolutionDpi?: number | null
}
