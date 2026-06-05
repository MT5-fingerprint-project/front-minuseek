export type BiometricImageType = 'traces' | 'reference-prints'

export interface BiometricImage {
  id: string
  fileName: string
  url: string
}
