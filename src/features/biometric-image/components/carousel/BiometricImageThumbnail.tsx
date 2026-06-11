import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/features/shared/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/features/shared/ui/tooltip'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/features/shared/ui/alert-dialog'
import { useDeleteBiometricImage } from '@/features/biometric-image/hooks/useBiometricImages'
import type { BiometricImage, BiometricImageType } from '@/features/biometric-image/types/biometricImage'

type BiometricImageThumbnailProps = {
  image: BiometricImage
  type: BiometricImageType
  caseId: string
  isSelected: boolean
  onSelect: () => void
}

export default function BiometricImageThumbnail({
  image,
  type,
  caseId,
  isSelected,
  onSelect,
}: BiometricImageThumbnailProps) {
  const { t } = useTranslation()
  const deleteImage = useDeleteBiometricImage(type, caseId)

  return (
    <div className="relative">
      <Tooltip>
        <TooltipTrigger
          type="button"
          onClick={onSelect}
          aria-pressed={isSelected}
          className={cn(
            'relative h-[107px] w-[73px] shrink-0 overflow-hidden rounded outline-offset-[-1px]',
            isSelected && 'shadow-[0_0_4px_rgba(9,16,41,0.25)] outline-2 outline-orange-medium'
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

      <AlertDialog>
        <AlertDialogTrigger
          type="button"
          disabled={deleteImage.isPending}
          aria-label={t('biometricImage.delete.aria', { fileName: image.fileName })}
          onClick={(event) => event.stopPropagation()}
          className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/85 disabled:opacity-50"
        >
          <X className="size-3" />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('biometricImage.delete.confirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('biometricImage.delete.confirmDescription')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => deleteImage.mutate(image.id)}>
              {t('biometricImage.delete.confirmAction')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
