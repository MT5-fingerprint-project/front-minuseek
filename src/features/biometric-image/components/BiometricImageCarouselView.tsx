import { useTranslation } from 'react-i18next'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/features/shared/ui/carousel'
import type { BiometricImage, BiometricImageType } from '@/features/biometric-image/types/biometricImage'
import BiometricImageThumbnail from '@/features/biometric-image/components/BiometricImageThumbnail'
import BiometricImageImportButton from '@/features/biometric-image/components/BiometricImageImportButton'
import BiometricImageEmptyPlaceholder from '@/features/biometric-image/components/BiometricImageEmptyPlaceholder'
import BiometricImageCarouselSkeleton from '@/features/biometric-image/components/BiometricImageCarouselSkeleton'

type BiometricImageCarouselViewProps = {
  images: BiometricImage[]
  isLoading: boolean
  type: BiometricImageType
  selectedId: string | undefined
  onSelect: (id: string) => void
}

export default function BiometricImageCarouselView({
  images,
  isLoading,
  type,
  selectedId,
  onSelect,
}: BiometricImageCarouselViewProps) {
  const { t } = useTranslation()

  if (!isLoading && images.length === 0) {
    return <BiometricImageEmptyPlaceholder type={type} />
  }

  return (
    <div className="outline-muted flex w-full items-center gap-2 rounded-lg bg-white p-2">
      <BiometricImageImportButton />

      {isLoading ? (
        <BiometricImageCarouselSkeleton />
      ) : (
        <Carousel
          opts={{ dragFree: true, containScroll: 'trimSnaps', slidesToScroll: 'auto' }}
          className="flex min-w-0 flex-1 items-center gap-1"
        >
          <CarouselPrevious
            variant="ghost"
            className="static shrink-0 translate-y-0 text-[var(--ms-blue-medium)]"
            aria-label={t('biometricImage.nav.previous')}
          />

          <div className="min-w-0 flex-1">
            <CarouselContent className="ml-0 gap-2">
              {images.map((image) => (
                <CarouselItem key={image.id} className="basis-auto pl-0">
                  <BiometricImageThumbnail
                    image={image}
                    isSelected={image.id === selectedId}
                    onSelect={() => onSelect(image.id)}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </div>

          <CarouselNext
            variant="ghost"
            className="static shrink-0 translate-y-0 text-[var(--ms-blue-medium)]"
            aria-label={t('biometricImage.nav.next')}
          />
        </Carousel>
      )}
    </div>
  )
}
