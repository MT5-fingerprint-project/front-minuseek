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
  newType: MinutiaType
  onConfirm: () => void
  onCancel: () => void
}

export default function PairRequalificationDialog({
  sideToQualify,
  newType,
  onConfirm,
  onCancel,
}: PairRequalificationDialogProps) {
  const { t } = useTranslation()
  const side = t(
    sideToQualify === 'TRACE'
      ? 'investigationCase.comparison.pairingSideTrace'
      : 'investigationCase.comparison.pairingSideReference'
  )

  return (
    <AlertDialog open onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('investigationCase.comparison.pairingRequalifyTitle')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('investigationCase.comparison.pairingRequalifyDescription', {
              side,
              type: t(`biometricImage.minutia.types.${newType}`),
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('common.actions.cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            {t('investigationCase.comparison.pairingRequalifyConfirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
