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
        'flex h-10 w-10 items-center justify-center rounded-lg border shadow-sm transition-colors',
        disabled && 'cursor-not-allowed border-blue-light-1 bg-transparent opacity-50',
        !disabled && !isHit && 'border-blue-medium-2 bg-white hover:bg-blue-light-2',
        !disabled && isHit && 'border-blue-medium-2 bg-blue-medium-2'
      )}
    >
      {isHit && <Icon name="fingerprintCheck" size={20} color="white" />}
      {disabled && <Icon name="fingerprint" size={20} />}
    </button>
  )
}
