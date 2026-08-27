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
import type { ServiceUser } from '@/features/users/types/serviceUser'

type DeactivateServiceUserDialogProps = {
  user: ServiceUser | null
  onClose: () => void
  onConfirm: (user: ServiceUser) => void
}

export default function DeactivateServiceUserDialog({
  user,
  onClose,
  onConfirm,
}: DeactivateServiceUserDialogProps) {
  const { t } = useTranslation()

  if (!user) {
    return null
  }

  return (
    <AlertDialog open onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('users.deactivateDialog.title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('users.deactivateDialog.description', { name: `${user.firstName} ${user.lastName}` })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('common.actions.cancel')}</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={() => onConfirm(user)}>
            {t('users.deactivateDialog.confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
