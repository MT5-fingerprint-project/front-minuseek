export type BiometricImageType = 'traces' | 'reference-prints'

export type BiometricImageStatus = 'RECEIVED' | 'PROCESSING' | 'PROCESSED' | 'FAILED'

export type WithdrawalMotive = 'DUPLICATE' | 'MISFILED' | 'WRONG_ATTRIBUTION'

/** `WRONG_ATTRIBUTION` n'a de sens que pour une empreinte rattachée à une personne. */
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
  withdrawnAt: string | null
  withdrawalMotive: WithdrawalMotive | null
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
  withdrawnAt?: string | null
  withdrawalMotive?: WithdrawalMotive | null
}
