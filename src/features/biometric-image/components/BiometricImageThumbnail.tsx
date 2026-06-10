import { cn } from '@/features/shared/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/features/shared/ui/tooltip'
import type { BiometricImage } from '@/features/biometric-image/types/biometricImage'

type BiometricImageThumbnailProps = {
  image: BiometricImage
  isSelected: boolean
  onSelect: () => void
}

export default function BiometricImageThumbnail({ image, isSelected, onSelect }: BiometricImageThumbnailProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        type="button"
        onClick={onSelect}
        aria-pressed={isSelected}
        className={cn(
          'relative h-[107px] w-[73px] shrink-0 overflow-hidden rounded outline-offset-[-1px]',
          isSelected && 'shadow-[0_0_4px_rgba(9,16,41,0.25)] outline-2 outline-[var(--ms-orange)]'
        )}
      >
        <img
          src={image.url}
          alt={image.fileName}
          loading="lazy"
          decoding="async"
          className="block h-full w-full object-cover"
        />
        <span className="absolute inset-x-0 bottom-0 truncate bg-[rgba(9,16,41,0.7)] px-0.5 py-0.5 text-center text-xs font-light text-white">
          {image.fileName}
        </span>
      </TooltipTrigger>
      <TooltipContent className="break-all">{image.fileName}</TooltipContent>
    </Tooltip>
  )
}
