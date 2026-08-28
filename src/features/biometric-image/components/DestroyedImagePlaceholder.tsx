import { useTranslation } from 'react-i18next'
import { Icon } from '@/features/shared/icons'
import { cn } from '@/features/shared/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/features/shared/ui/tooltip'

type DestroyedImagePlaceholderProps = {
  destroyedAt: string
  className?: string
  iconSize?: number
}

/** Une empreinte de familier détruite : la fiche reste, l'image a disparu. */
export default function DestroyedImagePlaceholder({
  destroyedAt,
  className,
  iconSize = 28,
}: DestroyedImagePlaceholderProps) {
  const { t, i18n } = useTranslation()
  const label = t('biometricImage.destroyed.label', {
    date: new Date(destroyedAt).toLocaleDateString(i18n.language),
  })

  return (
    <Tooltip>
      <TooltipTrigger
        type="button"
        className={cn(
          'flex flex-col items-center justify-center gap-1 bg-grey-light-1 p-2 text-center text-grey-medium-1',
          className,
        )}
      >
        <Icon name="fingerprintOff" size={iconSize} color="var(--color-grey-medium-1)" />
        <span className="text-xs leading-tight">{label}</span>
      </TooltipTrigger>
      <TooltipContent>{t('biometricImage.destroyed.explanation')}</TooltipContent>
    </Tooltip>
  )
}
