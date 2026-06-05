import { useState } from 'react'
import { useBiometricImages } from '@/features/biometric-image/hooks/useBiometricImages'
import type { BiometricImageType } from '@/features/biometric-image/types/biometricImage'
import BiometricImageCarouselView from '@/features/biometric-image/components/BiometricImageCarouselView'

type BiometricImageCarouselProps = {
  type: BiometricImageType
}

export default function BiometricImageCarousel({ type }: BiometricImageCarouselProps) {
  const { data: images = [], isPending } = useBiometricImages(type)
  const [selectedId, setSelectedId] = useState<string>()

  return (
    <BiometricImageCarouselView
      images={images}
      isLoading={isPending}
      type={type}
      selectedId={selectedId}
      onSelect={setSelectedId}
    />
  )
}
