import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { cn } from '@/features/shared/lib/utils'
import { useFileDropZone } from '@/features/shared/hooks/useFileDropZone'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/features/shared/ui/carousel'
import { getMatching } from '@/features/biometric-image/lib/matchingScore'
import { UPLOADABLE_IMAGE_MIME_TYPES } from '@/features/biometric-image/lib/uploadableImage'
import { useImportBiometricImages } from '@/features/biometric-image/hooks/useImportBiometricImages'
import { useCaseIsClosed } from '@/features/investigation-case/hooks/useCaseIsClosed'
import type {
  BiometricImage,
  BiometricImageDecoration,
  BiometricImageType,
} from '@/features/biometric-image/types/biometricImage'
import BiometricImageThumbnail from '@/features/biometric-image/components/carousel/BiometricImageThumbnail'
import BiometricImageImportButton from '@/features/biometric-image/components/carousel/BiometricImageImportButton'
import BiometricImageEmptyPlaceholder from '@/features/biometric-image/components/carousel/BiometricImageEmptyPlaceholder'
import BiometricImageCarouselSkeleton from '@/features/biometric-image/components/carousel/BiometricImageCarouselSkeleton'

const HIGHLIGHT_CLASS = 'rounded-sm outline-2 -outline-offset-2 outline-dashed outline-blue-medium-1'

type BiometricImageCarouselViewProps = {
  images: BiometricImage[]
  isLoading: boolean
  type: BiometricImageType
  caseId: string
  selectedId: string | undefined
  onSelect: (image: BiometricImage) => void
  onImported?: (image: BiometricImage) => void
  selectedTraceId?: string
  decorations?: Record<string, BiometricImageDecoration>
}

function DropHint({ isVisible }: { isVisible: boolean }) {
  const { t } = useTranslation()
  if (!isVisible) return null

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-sm bg-blue-light-1 text-base font-medium text-blue-medium-1">
      {t('biometricImage.drop.hovered')}
    </div>
  )
}

export default function BiometricImageCarouselView({
  images,
  isLoading,
  type,
  caseId,
  selectedId,
  onSelect,
  onImported,
  selectedTraceId,
  decorations,
}: BiometricImageCarouselViewProps) {
  const { t } = useTranslation()
  const isCaseClosed = useCaseIsClosed(caseId)
  const importImages = useImportBiometricImages(type, caseId, { onImported })

  const { isDraggingOver, dropZoneProps } = useFileDropZone({
    acceptedMimeTypes: UPLOADABLE_IMAGE_MIME_TYPES,
    enabled: !isCaseClosed,
    onFilesAccepted: importImages.start,
    onFilesRejected: () => toast.error(t('biometricImage.drop.rejected')),
  })

  if (!isLoading && images.length === 0) {
    return (
      <div {...dropZoneProps} className={cn('relative', isDraggingOver && HIGHLIGHT_CLASS)}>
        <BiometricImageEmptyPlaceholder
          type={type}
          isImporting={importImages.isImporting}
          progress={importImages.progress}
          onFilesSelected={importImages.start}
          isReadOnly={isCaseClosed}
        />
        <DropHint isVisible={isDraggingOver} />
      </div>
    )
  }

  return (
    <div
      {...dropZoneProps}
      className={cn('relative flex w-full items-center gap-2 p-2', isDraggingOver && HIGHLIGHT_CLASS)}
      data-tour={`carousel-${type}`}
    >
      {!isCaseClosed && (
        <span data-tour={`import-${type}`}>
          <BiometricImageImportButton
            isImporting={importImages.isImporting}
            progress={importImages.progress}
            onFilesSelected={importImages.start}
          />
        </span>
      )}

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

      <DropHint isVisible={isDraggingOver} />
    </div>
  )
}
