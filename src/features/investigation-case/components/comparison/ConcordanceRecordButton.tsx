import { Circle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/features/shared/lib/utils'

type RecordDisabledReason = 'noPairs' | 'pairingActive' | 'unsupported' | null

type ConcordanceRecordButtonProps = {
  disabledReason?: RecordDisabledReason
  /** Format effectivement produit par ce navigateur (MP4 s'il sait, WebM sinon) — annoncé avant même de cliquer. */
  formatLabel: string
  onClick: () => void
}

/** Bouton "Enregistrer la démonstration" (L7-4) : capture la lecture en vidéo. */
export default function ConcordanceRecordButton({ disabledReason = null, formatLabel, onClick }: ConcordanceRecordButtonProps) {
  const { t } = useTranslation()
  const disabled = disabledReason !== null

  const title =
    disabledReason === 'noPairs'
      ? t('investigationCase.comparison.recordButtonDisabledNoPairs')
      : disabledReason === 'pairingActive'
        ? t('investigationCase.comparison.recordButtonDisabledPairingActive')
        : disabledReason === 'unsupported'
          ? t('investigationCase.comparison.recordButtonDisabledUnsupported')
          : t('investigationCase.comparison.recordButtonTitle', { format: formatLabel })

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-1 font-medium text-white shadow-sm ring-[3px] ring-white transition-colors',
        !disabled && 'bg-grey-medium-2 hover:bg-grey-dark',
        disabled && 'cursor-not-allowed bg-grey-medium-1'
      )}
    >
      <span className={cn('text-sm leading-none', disabled && 'opacity-70')}>
        {t('investigationCase.comparison.recordButtonLabel')}
      </span>
      <Circle size={16} fill="currentColor" className={cn(disabled && 'opacity-70')} aria-hidden />
    </button>
  )
}
