import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/features/shared/ui/button'
import { Field, FieldError, FieldLabel } from '@/features/shared/ui/field'
import { Input } from '@/features/shared/ui/input'
import { resolutionFromSegment, type CalibrationPoint } from '@/features/biometric-image/lib/calibration'

type CalibrationDialogProps = {
  from: CalibrationPoint
  to: CalibrationPoint
  isSaving: boolean
  onValidate: (resolutionDpi: number) => void
  onCancel: () => void
}

export default function CalibrationDialog({ from, to, isSaving, onValidate, onCancel }: CalibrationDialogProps) {
  const { t } = useTranslation()
  const [rawDistance, setRawDistance] = useState('')

  const realDistanceMm = Number(rawDistance)
  const outcome = resolutionFromSegment(from, to, realDistanceMm)
  const isInvalid = rawDistance !== '' && outcome.status !== 'valid'

  return (
    <div className="absolute top-4 left-4 z-20 flex w-72 flex-col gap-3 rounded-md bg-white p-4 shadow-lg">
      <div>
        <h3 className="text-sm font-semibold text-grey-medium-2">{t('biometricImage.calibration.title')}</h3>
        <p className="text-xs text-grey-medium-1">{t('biometricImage.calibration.description')}</p>
      </div>

      <Field data-invalid={isInvalid}>
        <FieldLabel htmlFor="calibration-distance">{t('biometricImage.calibration.distanceLabel')}</FieldLabel>
        <Input
          id="calibration-distance"
          type="number"
          inputMode="decimal"
          min={0}
          step="any"
          autoFocus
          placeholder={t('biometricImage.calibration.distancePlaceholder')}
          value={rawDistance}
          onChange={(e) => setRawDistance(e.target.value)}
          aria-invalid={isInvalid}
        />
        {outcome.status === 'valid' && (
          <p className="text-xs text-grey-medium-1">
            {t('biometricImage.calibration.resolutionDeduced', { value: outcome.resolutionDpi })}
          </p>
        )}
        {outcome.status === 'out-of-range' && (
          <FieldError>{t('biometricImage.calibration.outOfRange', { value: outcome.resolutionDpi })}</FieldError>
        )}
      </Field>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="small" onClick={onCancel}>
          {t('common.actions.cancel')}
        </Button>
        <Button
          type="button"
          variant="blue"
          size="small"
          disabled={outcome.status !== 'valid' || isSaving}
          onClick={() => outcome.status === 'valid' && onValidate(outcome.resolutionDpi)}
        >
          {t('biometricImage.calibration.validate')}
        </Button>
      </div>
    </div>
  )
}
