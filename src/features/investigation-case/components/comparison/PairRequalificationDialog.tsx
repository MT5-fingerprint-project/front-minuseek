import { useTranslation } from 'react-i18next'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/features/shared/ui/alert-dialog'
import type { MinutiaType } from '@/features/biometric-image/lib/minutiae'

type PairRequalificationDialogProps = {
  sideToQualify: 'TRACE' | 'REFERENCE'
  currentType: MinutiaType
  newType: MinutiaType
  onConfirm: () => void
  onCancel: () => void
}

export default function PairRequalificationDialog({
  sideToQualify,
  currentType,
  newType,
  onConfirm,
  onCancel,
}: PairRequalificationDialogProps) {
  const { t } = useTranslation()
  const traceLabel = t('investigationCase.comparison.pairingSideTrace')
  const referenceLabel = t('investigationCase.comparison.pairingSideReference')
  const side = sideToQualify === 'TRACE' ? traceLabel : referenceLabel
  const otherSide = sideToQualify === 'TRACE' ? referenceLabel : traceLabel
  const isUndetermined = currentType === 'UNDETERMINED'

  return (
    <AlertDialog open onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isUndetermined
              ? t('investigationCase.comparison.pairingRequalifyTitle')
              : t('investigationCase.comparison.pairingRequalifyTitleTyped')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isUndetermined ? (
              t('investigationCase.comparison.pairingRequalifyDescription', {
                side,
                type: t(`biometricImage.minutia.types.${newType}`),
              })
            ) : (
              t('investigationCase.comparison.pairingRequalifyDescriptionTyped', {
                side,
                otherSide,
                currentType: t(`biometricImage.minutia.types.${currentType}`),
                newType: t(`biometricImage.minutia.types.${newType}`),
              })
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('common.actions.cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            {isUndetermined
              ? t('investigationCase.comparison.pairingRequalifyConfirm')
              : t('investigationCase.comparison.pairingRequalifyConfirmTyped')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
