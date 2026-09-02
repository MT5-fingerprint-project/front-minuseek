import { useTranslation } from 'react-i18next'
import { cn } from '@/features/shared/lib/utils'
import { Icon } from '@/features/shared/icons'
import { REQUIRED_MINUTIAE } from '@/features/biometric-image/lib/minutiae'

type PairingControlsProps = {
  isActive: boolean
  disabled: boolean
  pairCount: number
  onToggle: () => void
}

/** Mode démonstration (L7-2b) : apparier les minuties de la trace et de l'empreinte. */
export default function PairingControls({ isActive, disabled, pairCount, onToggle }: PairingControlsProps) {
  const { t } = useTranslation()

  const title = disabled
    ? t('investigationCase.comparison.pairingButtonDisabled')
    : isActive
      ? t('investigationCase.comparison.pairingButtonActive')
      : t('investigationCase.comparison.pairingButton')

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        title={title}
        aria-pressed={isActive}
        className={cn(
          'inline-flex items-center gap-1 rounded-full px-3 py-1 font-medium text-white shadow-sm ring-[5px] ring-white transition-colors',
          !disabled && !isActive && 'bg-grey-medium-2 hover:bg-grey-dark',
          !disabled && isActive && 'bg-blue-medium-1',
          disabled && 'cursor-not-allowed bg-grey-medium-1'
        )}
      >
        <span className={cn('text-base leading-none', disabled && 'opacity-70')}>
          {t('investigationCase.comparison.pairingLabel')}
        </span>
        <Icon name="link" size={20} color="white" aria-hidden className={cn(disabled && 'opacity-70')} />
      </button>
      {isActive && (
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-xs font-medium shadow-sm ring-2 ring-white',
            pairCount >= REQUIRED_MINUTIAE ? 'bg-green-medium text-white' : 'bg-white text-grey-dark'
          )}
        >
          {t('investigationCase.comparison.pairingCount', { count: pairCount })}
        </span>
      )}
    </div>
  )
}
