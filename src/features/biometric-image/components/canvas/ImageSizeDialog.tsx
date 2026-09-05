import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '@/features/shared/icons'
import { Button } from '@/features/shared/ui/button'
import { FieldError, FieldLabel } from '@/features/shared/ui/field'
import { Input } from '@/features/shared/ui/input'
import { cn } from '@/features/shared/lib/utils'
import { MIN_RESOLUTION_DPI, MAX_RESOLUTION_DPI } from '@/features/biometric-image/lib/calibration'
import {
  physicalSizeCm,
  pxPerCmFromPhysicalSizeCm,
  pxPerCmFromResolutionDpi,
  resolutionDpiFromPxPerCm,
} from '@/features/biometric-image/lib/imageSize'

type SizeUnit = 'px' | 'cm'

type ImageSizeDialogProps = {
  sourceWidth: number
  sourceHeight: number
  /** Résolution actuellement persistée, en points par pouce ; nulle si l'image n'est pas calibrée. */
  resolutionDpi: number | null
  isSaving: boolean
  onValidate: (resolutionDpi: number) => void
  onClose: () => void
}

const formatCm = (value: number | null) => (value === null ? '' : value.toFixed(1))

export default function ImageSizeDialog({
  sourceWidth,
  sourceHeight,
  resolutionDpi,
  isSaving,
  onValidate,
  onClose,
}: ImageSizeDialogProps) {
  const { t } = useTranslation()
  // Une image non calibrée ouvre ce dialogue à vide : proposer une valeur par défaut
  // reviendrait à faire signer une résolution inventée, que le moteur de comparaison
  // et la planche à l'échelle 1 du rapport prendraient ensuite pour une mesure.
  const initialPxPerCm = resolutionDpi === null ? null : pxPerCmFromResolutionDpi(resolutionDpi)
  const [unit, setUnit] = useState<SizeUnit>('cm')

  const [resolutionText, setResolutionText] = useState(() => initialPxPerCm?.toFixed(1) ?? '')
  const [widthText, setWidthText] = useState(() =>
    formatCm(initialPxPerCm === null ? null : physicalSizeCm(sourceWidth, initialPxPerCm)),
  )
  const [heightText, setHeightText] = useState(() =>
    formatCm(initialPxPerCm === null ? null : physicalSizeCm(sourceHeight, initialPxPerCm)),
  )

  const pxPerCm = Number(resolutionText)
  const hasResolution = resolutionText.trim() !== '' && Number.isFinite(pxPerCm) && pxPerCm > 0
  const deducedDpi = hasResolution ? resolutionDpiFromPxPerCm(pxPerCm) : null
  const isOutOfRange = deducedDpi !== null && (deducedDpi < MIN_RESOLUTION_DPI || deducedDpi > MAX_RESOLUTION_DPI)
  const isInvalid = !hasResolution || isOutOfRange

  const applyResolution = (next: number) => {
    setResolutionText(next.toFixed(1))
    setWidthText(formatCm(physicalSizeCm(sourceWidth, next)))
    setHeightText(formatCm(physicalSizeCm(sourceHeight, next)))
  }

  const handleResolutionChange = (raw: string) => {
    setResolutionText(raw)
    const next = Number(raw)
    if (Number.isFinite(next) && next > 0) {
      setWidthText(formatCm(physicalSizeCm(sourceWidth, next)))
      setHeightText(formatCm(physicalSizeCm(sourceHeight, next)))
    }
  }

  const handleWidthChange = (raw: string) => {
    setWidthText(raw)
    const next = pxPerCmFromPhysicalSizeCm(sourceWidth, Number(raw))
    if (next !== null) {
      setResolutionText(next.toFixed(1))
      setHeightText(formatCm(physicalSizeCm(sourceHeight, next)))
    }
  }

  const handleHeightChange = (raw: string) => {
    setHeightText(raw)
    const next = pxPerCmFromPhysicalSizeCm(sourceHeight, Number(raw))
    if (next !== null) {
      setResolutionText(next.toFixed(1))
      setWidthText(formatCm(physicalSizeCm(sourceWidth, next)))
    }
  }

  const handleReset = () => {
    if (initialPxPerCm === null) {
      setResolutionText('')
      setWidthText('')
      setHeightText('')
      return
    }
    applyResolution(initialPxPerCm)
  }

  return (
    <div className="absolute bottom-3 left-1/2 z-20 w-80 -translate-x-1/2 rounded-md bg-white p-4 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-medium text-grey-medium-2">{t('biometricImage.imageSize.title')}</h3>
        <button type="button" onClick={onClose} className="text-grey-medium-1 hover:text-grey-dark">
          <Icon name="close" size={20} color="currentColor" />
        </button>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <div className="relative flex flex-1 flex-col gap-2">
          <div className="flex items-center gap-2">
            <FieldLabel htmlFor="image-size-width" className="w-24 shrink-0 text-sm whitespace-nowrap text-grey-medium-2">
              {t('biometricImage.imageSize.width')}
            </FieldLabel>
            <Input
              id="image-size-width"
              type="number"
              min={0}
              step="any"
              disabled={unit === 'px'}
              value={unit === 'px' ? Math.round(sourceWidth) : widthText}
              onChange={(e) => handleWidthChange(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <FieldLabel htmlFor="image-size-height" className="w-24 shrink-0 text-sm whitespace-nowrap text-grey-medium-2">
              {t('biometricImage.imageSize.height')}
            </FieldLabel>
            <Input
              id="image-size-height"
              type="number"
              min={0}
              step="any"
              disabled={unit === 'px'}
              value={unit === 'px' ? Math.round(sourceHeight) : heightText}
              onChange={(e) => handleHeightChange(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="pointer-events-none absolute top-1/2 right-2 flex h-5 w-5 -translate-y-1/2 items-center justify-center bg-white">
            <Icon name="link" size={14} color="currentColor" className="text-grey-medium-1" />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1 rounded-full border border-grey-light-2 p-0.5">
          {(['px', 'cm'] as const).map((candidate) => (
            <button
              key={candidate}
              type="button"
              onClick={() => setUnit(candidate)}
              className={cn(
                'rounded-full px-2 py-0.5 text-xs font-medium',
                unit === candidate ? 'bg-blue-light-1 text-blue-dark-2' : 'text-grey-medium-2',
              )}
            >
              {candidate}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-2 flex items-center gap-2">
        <div className="relative flex flex-1 flex-col gap-2">
          <div className="flex items-center gap-2">
            <FieldLabel
              htmlFor="image-size-resolution-x"
              className="w-24 shrink-0 text-sm whitespace-nowrap text-grey-medium-2"
            >
              {t('biometricImage.imageSize.resolutionX')}
            </FieldLabel>
            <Input
              id="image-size-resolution-x"
              type="number"
              min={0}
              step="any"
              aria-invalid={isOutOfRange}
              value={resolutionText}
              onChange={(e) => handleResolutionChange(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <FieldLabel
              htmlFor="image-size-resolution-y"
              className="w-24 shrink-0 text-sm whitespace-nowrap text-grey-medium-2"
            >
              {t('biometricImage.imageSize.resolutionY')}
            </FieldLabel>
            <Input
              id="image-size-resolution-y"
              type="number"
              min={0}
              step="any"
              aria-invalid={isOutOfRange}
              value={resolutionText}
              onChange={(e) => handleResolutionChange(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="pointer-events-none absolute top-1/2 right-2 flex h-5 w-5 -translate-y-1/2 items-center justify-center bg-white">
            <Icon name="link" size={14} color="currentColor" className="text-grey-medium-1" />
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-blue-light-1 px-2 py-0.5 text-xs font-medium text-blue-dark-2">
          {t('biometricImage.imageSize.pxPerCm')}
        </span>
      </div>

      {deducedDpi !== null && isOutOfRange && (
        <FieldError className="mb-2">
          {t('biometricImage.imageSize.outOfRange', { value: Math.round(deducedDpi) })}
        </FieldError>
      )}

      <div className="mt-4 flex justify-between gap-2">
        <Button type="button" variant="outline" size="small" onClick={handleReset}>
          {t('biometricImage.imageSize.reset')}
        </Button>
        <Button
          type="button"
          variant="blue"
          size="small"
          disabled={isInvalid || isSaving}
          onClick={() => deducedDpi !== null && onValidate(Math.round(deducedDpi * 100) / 100)}
        >
          <Icon name="check" size={16} color="currentColor" />
          {t('biometricImage.imageSize.validate')}
        </Button>
      </div>
    </div>
  )
}
