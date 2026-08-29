import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '@/features/shared/icons'
import { Button } from '@/features/shared/ui/button'
import { Field, FieldError, FieldLabel } from '@/features/shared/ui/field'
import { Input } from '@/features/shared/ui/input'
import { cn } from '@/features/shared/lib/utils'
import { MIN_RESOLUTION_DPI, MAX_RESOLUTION_DPI } from '@/features/biometric-image/lib/calibration'
import {
  physicalSizeCm,
  pxPerCmFromPhysicalSizeCm,
  pxPerCmFromResolutionDpi,
  resolutionDpiFromPxPerCm,
} from '@/features/biometric-image/lib/imageSize'

const DEFAULT_PX_PER_CM = pxPerCmFromResolutionDpi(300) // repli Photoshop-esque quand l'image n'est pas calibrée

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

export default function ImageSizeDialog({
  sourceWidth,
  sourceHeight,
  resolutionDpi,
  isSaving,
  onValidate,
  onClose,
}: ImageSizeDialogProps) {
  const { t } = useTranslation()
  const initialPxPerCm = resolutionDpi !== null ? pxPerCmFromResolutionDpi(resolutionDpi) : DEFAULT_PX_PER_CM
  const [pxPerCm, setPxPerCm] = useState(initialPxPerCm)
  const [unit, setUnit] = useState<SizeUnit>('cm')

  const deducedDpi = resolutionDpiFromPxPerCm(pxPerCm)
  const isOutOfRange = deducedDpi < MIN_RESOLUTION_DPI || deducedDpi > MAX_RESOLUTION_DPI
  const isInvalid = !Number.isFinite(pxPerCm) || pxPerCm <= 0 || isOutOfRange

  const widthCm = physicalSizeCm(sourceWidth, pxPerCm)
  const heightCm = physicalSizeCm(sourceHeight, pxPerCm)

  const handleWidthChange = (raw: string) => {
    const next = pxPerCmFromPhysicalSizeCm(sourceWidth, Number(raw))
    if (next !== null) setPxPerCm(next)
  }

  const handleHeightChange = (raw: string) => {
    const next = pxPerCmFromPhysicalSizeCm(sourceHeight, Number(raw))
    if (next !== null) setPxPerCm(next)
  }

  const formatCm = (value: number | null) => (value === null ? '' : value.toFixed(1))

  return (
    <div className="absolute top-4 left-4 z-20 w-80 rounded-md bg-white p-4 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-medium text-grey-medium-2">{t('biometricImage.imageSize.title')}</h3>
        <button type="button" onClick={onClose} className="text-grey-medium-1 hover:text-grey-dark">
          <Icon name="close" size={20} color="currentColor" />
        </button>
      </div>

      <div className="mb-4 flex items-end gap-2">
        <div className="relative flex-1 space-y-2">
          <Field>
            <FieldLabel htmlFor="image-size-width">{t('biometricImage.imageSize.width')}</FieldLabel>
            <Input
              id="image-size-width"
              type="number"
              min={0}
              step="any"
              disabled={unit === 'px'}
              value={unit === 'px' ? Math.round(sourceWidth) : formatCm(widthCm)}
              onChange={(e) => handleWidthChange(e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="image-size-height">{t('biometricImage.imageSize.height')}</FieldLabel>
            <Input
              id="image-size-height"
              type="number"
              min={0}
              step="any"
              disabled={unit === 'px'}
              value={unit === 'px' ? Math.round(sourceHeight) : formatCm(heightCm)}
              onChange={(e) => handleHeightChange(e.target.value)}
            />
          </Field>
          {/* Purement décoratif : la largeur et la hauteur sont toujours liées (même
              ratio que l'image source), il n'y a rien à activer ni désactiver ici. */}
          <Icon
            name="link"
            size={16}
            color="currentColor"
            className="pointer-events-none absolute top-1/2 right-1 -translate-y-1/2 text-grey-medium-1"
          />
        </div>
        <div className="flex shrink-0 items-center gap-1 rounded-full border border-grey-light-2 p-0.5 mb-1">
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

      <div className="mb-2 flex items-end gap-2">
        <div className="relative flex-1 space-y-2">
          <Field data-invalid={isInvalid}>
            <FieldLabel htmlFor="image-size-resolution-x">{t('biometricImage.imageSize.resolutionX')}</FieldLabel>
            <Input
              id="image-size-resolution-x"
              type="number"
              min={0}
              step="any"
              aria-invalid={isInvalid}
              value={pxPerCm.toFixed(1)}
              onChange={(e) => setPxPerCm(Number(e.target.value))}
            />
          </Field>
          <Field data-invalid={isInvalid}>
            <FieldLabel htmlFor="image-size-resolution-y">{t('biometricImage.imageSize.resolutionY')}</FieldLabel>
            <Input
              id="image-size-resolution-y"
              type="number"
              min={0}
              step="any"
              aria-invalid={isInvalid}
              value={pxPerCm.toFixed(1)}
              onChange={(e) => setPxPerCm(Number(e.target.value))}
            />
          </Field>
          {/* Purement décoratif : une seule résolution est calibrée, X et Y sont
              toujours la même valeur, il n'y a rien à activer ni désactiver ici. */}
          <Icon
            name="link"
            size={16}
            color="currentColor"
            className="pointer-events-none absolute top-1/2 right-1 -translate-y-1/2 text-grey-medium-1"
          />
        </div>
        <span className="mb-1 shrink-0 rounded-full bg-blue-light-1 px-2 py-0.5 text-xs font-medium text-blue-dark-2">
          {t('biometricImage.imageSize.pxPerCm')}
        </span>
      </div>

      {isOutOfRange && (
        <FieldError>
          {t('biometricImage.imageSize.outOfRange', { value: Math.round(deducedDpi) })}
        </FieldError>
      )}

      <div className="mt-4 flex justify-between gap-2">
        <Button type="button" variant="outline" size="small" onClick={() => setPxPerCm(initialPxPerCm)}>
          {t('biometricImage.imageSize.reset')}
        </Button>
        <Button
          type="button"
          variant="blue"
          size="small"
          disabled={isInvalid || isSaving}
          onClick={() => onValidate(Math.round(deducedDpi * 100) / 100)}
        >
          <Icon name="check" size={16} color="currentColor" />
          {t('biometricImage.imageSize.validate')}
        </Button>
      </div>
    </div>
  )
}
