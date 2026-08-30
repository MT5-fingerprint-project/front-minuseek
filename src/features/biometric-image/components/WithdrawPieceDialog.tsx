import { useState, type ReactNode } from 'react'
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
  AlertDialogTrigger,
} from '@/features/shared/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/features/shared/ui/select'
import {
  WITHDRAWAL_MOTIVES,
  type BiometricImageType,
  type WithdrawalMotive,
} from '@/features/biometric-image/types/biometricImage'

type WithdrawPieceDialogProps = {
  type: BiometricImageType
  trigger: ReactNode
  onConfirm: (motive: WithdrawalMotive) => void
  title?: string
  description?: string
  actionLabel?: string
}

export default function WithdrawPieceDialog({
  type,
  trigger,
  onConfirm,
  title,
  description,
  actionLabel,
}: WithdrawPieceDialogProps) {
  const { t } = useTranslation()
  const [motive, setMotive] = useState<WithdrawalMotive | null>(null)

  return (
    <AlertDialog onOpenChange={(open) => !open && setMotive(null)}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title ?? t('biometricImage.withdraw.confirmTitle')}</AlertDialogTitle>
          <AlertDialogDescription>
            {description ?? t('biometricImage.withdraw.confirmDescription')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Select value={motive ?? undefined} onValueChange={(value) => setMotive(value as WithdrawalMotive)}>
          <SelectTrigger aria-label={t('biometricImage.withdraw.motiveLabel')}>
            <SelectValue placeholder={t('biometricImage.withdraw.motiveLabel')} />
          </SelectTrigger>
          <SelectContent>
            {WITHDRAWAL_MOTIVES[type].map((candidate) => (
              <SelectItem key={candidate} value={candidate}>
                {t(`withdrawalMotive.${candidate}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('common.actions.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={motive === null}
            onClick={() => motive && onConfirm(motive)}
          >
            {actionLabel ?? t('biometricImage.withdraw.confirmAction')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
