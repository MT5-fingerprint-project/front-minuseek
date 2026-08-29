export const SEAL_KINDS = ['TRACE', 'REFERENCE_PRINT', 'REPORT'] as const

export type SealKind = (typeof SEAL_KINDS)[number]

export type SealLookup =
  | {
      known: true
      kind: SealKind
      laboratory: string
      sealedAt: string
      anchoredAt: string | null
      precededByEarlierReport: boolean
      supersededByNewerReport: boolean
    }
  | { known: false }

export type SealVerification = {
  sha256: string
  lookup: SealLookup
}
