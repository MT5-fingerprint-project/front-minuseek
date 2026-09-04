import type { MinutiaType } from '@/features/biometric-image/lib/minutiae'

export interface MinutiaPair {
  id: string
  /** Rang parmi les paires de cette trace et de cette empreinte : calculé par l'API, jamais stocké. */
  number: number
  traceMinutiaLayerId: string
  referenceMinutiaLayerId: string
  minutiaType: MinutiaType
}

export type CreateMinutiaPairInput = {
  referencePrintId: string
  traceMinutiaLayerId: string
  referenceMinutiaLayerId: string
}
