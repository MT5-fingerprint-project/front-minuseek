import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/features/shared/lib/utils'
import { Badge } from '@/features/shared/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/features/shared/ui/tooltip'
import WithdrawPieceDialog from '@/features/biometric-image/components/WithdrawPieceDialog'
import { useWithdrawBiometricImage } from '@/features/biometric-image/hooks/useBiometricImages'
import type {
  BiometricImage,
  BiometricImageDecoration,
  BiometricImageType,
  MatchingScore,
} from '@/features/biometric-image/types/biometricImage'

type BiometricImageThumbnailProps = {
  image: BiometricImage
  type: BiometricImageType
  caseId: string
  isSelected: boolean
  onSelect: () => void
  matching?: MatchingScore
  decoration?: BiometricImageDecoration
}

export default function BiometricImageThumbnail({
  image,
  type,
  caseId,
  isSelected,
  onSelect,
  matching,
  decoration,
}: BiometricImageThumbnailProps) {
  const { t } = useTranslation()
  const withdrawImage = useWithdrawBiometricImage(type, caseId)
  const label = decoration?.label ?? image.fileName

  return (
    <div className="relative">
      <Tooltip>
        <TooltipTrigger
          type="button"
          onClick={onSelect}
          aria-pressed={isSelected}
          className={cn(
            'relative h-[107px] w-[73px] shrink-0 overflow-hidden rounded outline-offset-[-1px]',
            decoration?.borderColor && 'border-2',
            isSelected && 'shadow-[0_0_4px_rgba(9,16,41,0.25)] outline-2 outline-orange-medium'
          )}
          style={decoration?.borderColor ? { borderColor: decoration.borderColor } : undefined}
        >
          <img
            src={image.url}
            alt={label}
            loading="lazy"
            decoding="async"
            className="block h-full w-full object-cover"
          />
          {matching !== undefined && (
            <Badge
              className={cn(
                'absolute top-1 left-1 tabular-nums',
                matching.match
                  ? 'bg-green-medium/90 text-white hover:bg-green-medium/90'
                  : 'bg-black/55 text-white/90 hover:bg-black/55',
              )}
            >
              {Math.round(matching.score)}
            </Badge>
          )}
          <span className="absolute inset-x-0 bottom-0 truncate bg-[rgba(9,16,41,0.7)] px-0.5 py-0.5 text-center text-xs font-light text-white">
            {label}
          </span>
        </TooltipTrigger>
        <TooltipContent className="break-all">{label}</TooltipContent>
      </Tooltip>

      <WithdrawPieceDialog
        type={type}
        onConfirm={(motive) => withdrawImage.mutate({ id: image.id, motive })}
        trigger={
          <button
            type="button"
            disabled={withdrawImage.isPending}
            aria-label={t('biometricImage.withdraw.aria', { fileName: label })}
            onClick={(event) => event.stopPropagation()}
            className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/85 disabled:opacity-50"
          >
            <X className="size-3" />
          </button>
        }
      />
    </div>
  )
}
