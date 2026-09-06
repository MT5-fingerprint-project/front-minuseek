import { useTranslation } from 'react-i18next'
import FilterPanel from './FilterPanel'
import {
  MARKER_SIZE_STEPS,
  markRadiusOf,
  markerDiameterMm,
} from '@/features/biometric-image/lib/markerSize'

const FRENCH_LOCALE = 'fr-FR'

const formatMillimeters = (millimeters: number) =>
  millimeters.toLocaleString(FRENCH_LOCALE, { minimumFractionDigits: 1, maximumFractionDigits: 1 })

type MarkerSizePaletteProps = {
  markRadius: number
  longestSide: number
  resolutionDpi: number | null
  onSelect: (markRadius: number) => void
}

export default function MarkerSizePalette({
  markRadius,
  longestSide,
  resolutionDpi,
  onSelect,
}: MarkerSizePaletteProps) {
  const { t } = useTranslation()

  return (
    <FilterPanel filterLabel={t('biometricImage.toolbar.tools.markerSize')}>
      <div className="flex flex-col gap-1">
        {MARKER_SIZE_STEPS.map(({ ratio, label }) => {
          const stepRadius = markRadiusOf(ratio, longestSide)
          const isActive = stepRadius === markRadius
          return (
            <button
              key={label}
              type="button"
              onClick={() => onSelect(stepRadius)}
              className={`rounded px-2 py-1 text-left text-sm text-white transition ${
                isActive ? 'bg-white/20 ring-1 ring-white' : 'hover:bg-white/10'
              }`}
            >
              <span className="block">{t(`biometricImage.markerSize.steps.${label}`)}</span>
              {resolutionDpi !== null && (
                <span className="block text-xs text-white/60">
                  {t('biometricImage.markerSize.diameter', {
                    value: formatMillimeters(markerDiameterMm(stepRadius, resolutionDpi)),
                  })}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </FilterPanel>
  )
}
