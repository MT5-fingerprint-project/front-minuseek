import { useMemo } from 'react'
import { useBiometricImages } from '@/features/biometric-image/hooks/useBiometricImages'
import type { BiometricImage, BiometricImageType } from '@/features/biometric-image/types/biometricImage'
import BiometricImageCarouselView from '@/features/biometric-image/components/carousel/BiometricImageCarouselView'

type BiometricImageCarouselProps = {
  type: BiometricImageType
  caseId: string
  selectedId: string | undefined
  onSelect: (image: BiometricImage) => void
  selectedTraceId?: string
}

export default function BiometricImageCarousel({
  type,
  caseId,
  selectedId,
  onSelect,
  selectedTraceId,
}: BiometricImageCarouselProps) {
  const { data: images = [], isPending } = useBiometricImages(type, caseId)

  const sortedImages = useMemo(() => {
    if (!selectedTraceId || type !== 'reference-prints') return images
    return [...images].sort((a, b) => {
      const scoreA = a.matchings.find((m) => m.traceId === selectedTraceId)?.score ?? -1
      const scoreB = b.matchings.find((m) => m.traceId === selectedTraceId)?.score ?? -1
      return scoreB - scoreA
    })
  }, [images, selectedTraceId, type])

  return (
    <BiometricImageCarouselView
      images={sortedImages}
      isLoading={isPending}
      type={type}
      caseId={caseId}
      selectedId={selectedId}
      onSelect={onSelect}
      onUploadSuccess={onSelect}
      selectedTraceId={selectedTraceId}
    />
  )
}
