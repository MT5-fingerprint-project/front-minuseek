import { useTranslation } from 'react-i18next'
import { cn } from '@/features/shared/lib/utils'
import { Icon } from '@/features/shared/icons'

type HitButtonProps = {
  isHit: boolean
  disabled: boolean
  onClick: () => void
}

export default function HitButton({ isHit, disabled, onClick }: HitButtonProps) {
  const { t } = useTranslation()

  const title = disabled
    ? t('investigationCase.comparison.hitButtonDisabled')
    : isHit
      ? t('investigationCase.comparison.hitButtonActive')
      : t('investigationCase.comparison.hitButton')

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-pressed={isHit}
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-3 py-1 font-medium text-white shadow-sm ring-[5px] ring-white transition-colors',
        !disabled && !isHit && 'bg-grey-medium-2 hover:bg-grey-dark',
        !disabled && isHit && 'bg-green-medium',
        disabled && 'cursor-not-allowed bg-grey-medium-1'
      )}
    >
      <span className={cn('text-base leading-none', disabled && 'opacity-70')}>
        {t('investigationCase.comparison.hitLabel')}
      </span>
      <Icon
        name={isHit ? 'fingerprintCheck' : 'fingerprintOff'}
        size={20}
        color="white"
        aria-hidden
        className={cn(disabled && 'opacity-70')}
      />
    </button>
  )
}
