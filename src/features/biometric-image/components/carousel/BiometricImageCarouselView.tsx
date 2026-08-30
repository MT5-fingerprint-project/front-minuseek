import { useTranslation } from 'react-i18next'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/features/shared/ui/carousel'
import { getMatching } from '@/features/biometric-image/lib/matchingScore'
import type {
  BiometricImage,
  BiometricImageDecoration,
  BiometricImageType,
} from '@/features/biometric-image/types/biometricImage'
import BiometricImageThumbnail from '@/features/biometric-image/components/carousel/BiometricImageThumbnail'
import BiometricImageImportButton from '@/features/biometric-image/components/carousel/BiometricImageImportButton'
import BiometricImageEmptyPlaceholder from '@/features/biometric-image/components/carousel/BiometricImageEmptyPlaceholder'
import BiometricImageCarouselSkeleton from '@/features/biometric-image/components/carousel/BiometricImageCarouselSkeleton'

type BiometricImageCarouselViewProps = {
  images: BiometricImage[]
  isLoading: boolean
  type: BiometricImageType
  caseId: string
  selectedId: string | undefined
  onSelect: (image: BiometricImage) => void
  onUploadSuccess?: (image: BiometricImage) => void
  selectedTraceId?: string
  decorations?: Record<string, BiometricImageDecoration>
}

export default function BiometricImageCarouselView({
  images,
  isLoading,
  type,
  caseId,
  selectedId,
  onSelect,
  onUploadSuccess,
  selectedTraceId,
  decorations,
}: BiometricImageCarouselViewProps) {
  const { t } = useTranslation()

  if (!isLoading && images.length === 0) {
    return <BiometricImageEmptyPlaceholder type={type} caseId={caseId} onUploadSuccess={onUploadSuccess} />
  }

  return (
    <div className="flex w-full items-center gap-2 p-2" data-tour={`carousel-${type}`}>
      <span data-tour={`import-${type}`}>
        <BiometricImageImportButton type={type} caseId={caseId} onUploadSuccess={onUploadSuccess} />
      </span>

      {isLoading ? (
        <BiometricImageCarouselSkeleton />
      ) : (
        <Carousel
          opts={{ dragFree: true, containScroll: 'trimSnaps', slidesToScroll: 'auto' }}
          className="flex min-w-0 flex-1 items-center gap-1"
        >
          <CarouselPrevious
            variant="ghost"
            className="static shrink-0 translate-y-0 text-blue-medium-1"
            aria-label={t('biometricImage.nav.previous')}
          />

          <div className="min-w-0 flex-1">
            <CarouselContent className="ml-0 gap-2">
              {images.map((image) => (
                <CarouselItem key={image.id} className="basis-auto pl-0">
                  <BiometricImageThumbnail
                    image={image}
                    type={type}
                    caseId={caseId}
                    isSelected={image.id === selectedId}
                    onSelect={() => onSelect(image)}
                    matching={getMatching(image, selectedTraceId)}
                    decoration={decorations?.[image.id]}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </div>

          <CarouselNext
            variant="ghost"
            className="static shrink-0 translate-y-0 text-blue-medium-1"
            aria-label={t('biometricImage.nav.next')}
          />
        </Carousel>
      )}
    </div>
  )
}
