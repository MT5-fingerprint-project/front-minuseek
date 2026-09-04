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

type PairedMinutiaDeletionDialogProps = {
  pairNumber: number | null
  onConfirm: () => void
  onCancel: () => void
}

export default function PairedMinutiaDeletionDialog({
  pairNumber,
  onConfirm,
  onCancel,
}: PairedMinutiaDeletionDialogProps) {
  const { t } = useTranslation()

  if (pairNumber === null) return null

  return (
    <AlertDialog open onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('biometricImage.pairing.deleteTitle')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('biometricImage.pairing.deleteDescription', { number: pairNumber })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('common.actions.cancel')}</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            {t('biometricImage.pairing.deleteConfirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
