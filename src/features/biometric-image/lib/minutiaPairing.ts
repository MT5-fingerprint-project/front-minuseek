import type { Layer } from '@/features/biometric-image/types/layer'
import { isMinutiaSettings, minutiaTypeOf, type MinutiaType } from '@/features/biometric-image/lib/minutiae'

export type PairTypeDecision =
  | { outcome: 'PAIRED'; type: MinutiaType }
  | { outcome: 'QUALIFIES'; type: MinutiaType; sideToQualify: 'TRACE' | 'REFERENCE' }
  | { outcome: 'REFUSED'; traceType: MinutiaType; referenceType: MinutiaType }

/** Même arbitrage que le back (`shared/domain/forensics/minutia-pairing.ts`) : il fait foi en cas d'écart. */
export function resolvePairType(traceType: MinutiaType, referenceType: MinutiaType): PairTypeDecision {
  if (traceType === referenceType) return { outcome: 'PAIRED', type: traceType }
  if (traceType === 'UNDETERMINED') return { outcome: 'QUALIFIES', type: referenceType, sideToQualify: 'TRACE' }
  if (referenceType === 'UNDETERMINED') return { outcome: 'QUALIFIES', type: traceType, sideToQualify: 'REFERENCE' }
  return { outcome: 'REFUSED', traceType, referenceType }
}

export function minutiaTypeInLayers(layers: Layer[] | undefined, minutiaLayerId: string): MinutiaType | null {
  const minutiaLayer = layers?.find((layer) => layer.id === minutiaLayerId)
  if (!minutiaLayer || !isMinutiaSettings(minutiaLayer.settings)) return null
  return minutiaTypeOf(minutiaLayer.settings)
}
