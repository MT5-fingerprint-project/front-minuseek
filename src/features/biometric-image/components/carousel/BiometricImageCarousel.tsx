import { useMemo } from 'react'
import { useBiometricImages } from '@/features/biometric-image/hooks/useBiometricImages'
import { sortByMatchingScore } from '@/features/biometric-image/lib/matchingScore'
import type {
  BiometricImage,
  BiometricImageDecoration,
  BiometricImageType,
} from '@/features/biometric-image/types/biometricImage'
import BiometricImageCarouselView from '@/features/biometric-image/components/carousel/BiometricImageCarouselView'

type BiometricImageCarouselProps = {
  type: BiometricImageType
  caseId: string
  selectedId: string | undefined
  onSelect: (image: BiometricImage) => void
  selectedTraceId?: string
  decorations?: Record<string, BiometricImageDecoration>
}

export default function BiometricImageCarousel({
  type,
  caseId,
  selectedId,
  onSelect,
  selectedTraceId,
  decorations,
}: BiometricImageCarouselProps) {
  const { data: images = [], isPending } = useBiometricImages(type, caseId)

  const sortedImages = useMemo(() => {
    if (!selectedTraceId || type !== 'reference-prints') return images
    return sortByMatchingScore(images, selectedTraceId)
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
      decorations={decorations}
    />
  )
}
