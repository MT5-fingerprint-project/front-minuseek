import { useTranslation } from 'react-i18next'
import { screenLengthOfMillimeters } from '@/features/biometric-image/lib/calibration'

const ONE_CENTIMETER_MM = 10

type ScaleBarOverlayProps = {
  resolutionDpi: number | null
  fitScale: number
  viewScale: number
}

/** Barre d'échelle "1 cm", ou mention d'absence — habillage HTML au-dessus de la scène. */
export default function ScaleBarOverlay({ resolutionDpi, fitScale, viewScale }: ScaleBarOverlayProps) {
  const { t } = useTranslation()

  if (resolutionDpi === null) {
    return (
      <div className="pointer-events-none absolute top-3 left-3 rounded bg-white/90 px-2 py-1 text-xs text-grey-medium-2 shadow">
        {t('biometricImage.scaleBar.uncalibrated')}
      </div>
    )
  }

  const widthPx = screenLengthOfMillimeters(ONE_CENTIMETER_MM, resolutionDpi, fitScale, viewScale)

  return (
    <div className="pointer-events-none absolute top-3 left-3 flex flex-col items-start gap-1">
      <div className="h-1 bg-grey-medium-2" style={{ width: widthPx }} />
      <span className="rounded bg-white/90 px-1 text-xs text-grey-medium-2 shadow">
        {t('biometricImage.scaleBar.label')}
      </span>
    </div>
  )
}
