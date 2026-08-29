import { useTranslation } from 'react-i18next'
import { Button } from '@/features/shared/ui/button'
import type { DisplayScalePreset } from '@/features/biometric-image/lib/displayScale'

export type PresetDisabledReason = 'uncalibrated' | 'out-of-range' | null

type DisplayScaleControlsProps = {
  preset: DisplayScalePreset
  /** Grossissement courant par rapport à l'objet réel ; nul quand l'image n'est pas calibrée. */
  magnification: number | null
  disabledReason1to1: PresetDisabledReason
  disabledReason5to1: PresetDisabledReason
  onSelect: (preset: DisplayScalePreset) => void
}

export default function DisplayScaleControls({
  preset,
  magnification,
  disabledReason1to1,
  disabledReason5to1,
  onSelect,
}: DisplayScaleControlsProps) {
  const { t } = useTranslation()

  const explanation = (reason: PresetDisabledReason) =>
    reason === 'uncalibrated'
      ? t('biometricImage.displayScale.uncalibrated')
      : reason === 'out-of-range'
        ? t('biometricImage.displayScale.outOfBounds')
        : undefined

  return (
    <div className="flex items-center gap-1 rounded-full bg-grey-light-1 px-1 py-1">
      <span title={explanation(disabledReason1to1) ?? t('biometricImage.displayScale.oneToOneTooltip')}>
        <Button
          type="button"
          size="small"
          variant={preset === '1:1' ? 'blue' : 'ghost'}
          aria-pressed={preset === '1:1'}
          disabled={!!disabledReason1to1}
          onClick={() => onSelect('1:1')}
        >
          {t('biometricImage.displayScale.oneToOne')}
        </Button>
      </span>
      <span title={explanation(disabledReason5to1) ?? t('biometricImage.displayScale.fiveToOneTooltip')}>
        <Button
          type="button"
          size="small"
          variant={preset === '5:1' ? 'blue' : 'ghost'}
          aria-pressed={preset === '5:1'}
          disabled={!!disabledReason5to1}
          onClick={() => onSelect('5:1')}
        >
          {t('biometricImage.displayScale.fiveToOne')}
        </Button>
      </span>
      <Button
        type="button"
        size="small"
        variant={preset === 'free' ? 'blue' : 'ghost'}
        aria-pressed={preset === 'free'}
        onClick={() => onSelect('free')}
      >
        {t('biometricImage.displayScale.free')}
      </Button>
      {magnification !== null && (
        <span
          className="ml-1 text-xs font-medium tabular-nums text-grey-medium-2"
          title={t('biometricImage.displayScale.densityAssumption')}
        >
          {t('biometricImage.displayScale.magnification', {
            value: magnification.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
          })}
        </span>
      )}
    </div>
  )
}
