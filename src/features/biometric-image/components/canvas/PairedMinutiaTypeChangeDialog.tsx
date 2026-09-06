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

type PairedMinutiaTypeChangeDialogProps = {
  pairNumber: number | null
  minutiaType: MinutiaType | null
  onConfirm: () => void
  onCancel: () => void
}

export default function PairedMinutiaTypeChangeDialog({
  pairNumber,
  minutiaType,
  onConfirm,
  onCancel,
}: PairedMinutiaTypeChangeDialogProps) {
  const { t } = useTranslation()

  if (pairNumber === null || minutiaType === null) return null

  return (
    <AlertDialog open onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('biometricImage.pairing.typeChangeTitle')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('biometricImage.pairing.typeChangeDescription', {
              number: pairNumber,
              type: t(`biometricImage.minutia.types.${minutiaType}`),
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('common.actions.cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            {t('biometricImage.pairing.typeChangeConfirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
