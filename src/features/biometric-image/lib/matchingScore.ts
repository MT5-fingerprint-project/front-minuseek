import type { BiometricImage, MatchingScore } from '@/features/biometric-image/types/biometricImage'

export function getMatching(image: BiometricImage, traceId: string | undefined): MatchingScore | undefined {
  if (!traceId) return undefined
  return image.matchings.find((m) => m.traceId === traceId)
}

export function sortByMatchingScore(images: BiometricImage[], traceId: string): BiometricImage[] {
  // Les images sans score pour cette trace passent en fin de liste
  return [...images].sort((a, b) => (getMatching(b, traceId)?.score ?? -1) - (getMatching(a, traceId)?.score ?? -1))
}
