import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/features/shared/ui/button'
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/features/shared/ui/carousel'
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
  const [api, setApi] = useState<CarouselApi>()
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  // Les flèches font défiler la bande (voir plus loin), sans jamais sélectionner.
  // L'état désactivé suit la vraie position de scroll d'embla → pas de décalage.
  useEffect(() => {
    if (!api) return
    const update = () => {
      setCanScrollPrev(api.canScrollPrev())
      setCanScrollNext(api.canScrollNext())
    }
    update()
    api.on('select', update)
    api.on('reInit', update)
    return () => {
      api.off('select', update)
      api.off('reInit', update)
    }
  }, [api])

  if (!isLoading && images.length === 0) {
    return <BiometricImageEmptyPlaceholder type={type} />
  }

  return (
    <div className="flex w-full items-center gap-2 rounded-lg bg-white p-2 outline outline-[0.5px] -outline-offset-1 outline-[var(--ms-grey-light)]">
      <BiometricImageImportButton />

      {isLoading ? (
        <BiometricImageCarouselSkeleton />
      ) : (
        <div className="flex min-w-0 flex-1 items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            className="shrink-0 text-[var(--ms-blue-medium)]"
            onClick={() => api?.scrollPrev()}
            disabled={!canScrollPrev}
            aria-label={t('biometricImage.nav.previous')}
          >
            <ChevronLeft className="size-5" />
          </Button>

          <Carousel
            setApi={setApi}
            opts={{ dragFree: true, containScroll: 'trimSnaps', slidesToScroll: 'auto' }}
            className="min-w-0 flex-1"
          >
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
          </Carousel>

          <Button
            variant="ghost"
            size="icon-sm"
            className="shrink-0 text-[var(--ms-blue-medium)]"
            onClick={() => api?.scrollNext()}
            disabled={!canScrollNext}
            aria-label={t('biometricImage.nav.next')}
          >
            <ChevronRight className="size-5" />
          </Button>
        </div>
      )}
    </div>
  )
}
