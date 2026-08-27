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

type CaseHandoverDialogProps = {
  isOpen: boolean
  newOperatorName: string
  losesAccess: boolean
  onClose: () => void
  onConfirm: () => void
}

export default function CaseHandoverDialog({
  isOpen,
  newOperatorName,
  losesAccess,
  onClose,
  onConfirm,
}: CaseHandoverDialogProps) {
  const { t } = useTranslation()

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('investigationCase.handoverDialog.title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {losesAccess
              ? t('investigationCase.handoverDialog.descriptionLosingAccess', { name: newOperatorName })
              : t('investigationCase.handoverDialog.description', { name: newOperatorName })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('common.actions.cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>{t('investigationCase.handoverDialog.confirm')}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
