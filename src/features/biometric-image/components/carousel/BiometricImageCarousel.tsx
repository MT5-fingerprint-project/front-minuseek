import { useBiometricImages } from '@/features/biometric-image/hooks/useBiometricImages'
import type { BiometricImage, BiometricImageType } from '@/features/biometric-image/types/biometricImage'
import BiometricImageCarouselView from '@/features/biometric-image/components/carousel/BiometricImageCarouselView'

type BiometricImageCarouselProps = {
  type: BiometricImageType
  caseId: string
  selectedId: string | undefined
  onSelect: (image: BiometricImage) => void
}

export default function BiometricImageCarousel({
  type,
  caseId,
  selectedId,
  onSelect,
}: BiometricImageCarouselProps) {
  const { data: images = [], isPending } = useBiometricImages(type, caseId)

  return (
    <BiometricImageCarouselView
      images={images}
      isLoading={isPending}
      type={type}
      caseId={caseId}
      selectedId={selectedId}
      onSelect={onSelect}
      onUploadSuccess={onSelect}
    />
  )
}
