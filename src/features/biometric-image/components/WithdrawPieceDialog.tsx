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
import { Input } from '@/features/shared/ui/input'
import { Label } from '@/features/shared/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/features/shared/ui/select'
import {
  MAX_WITHDRAWAL_MOTIVE_DETAIL_LENGTH,
  WITHDRAWAL_MOTIVES,
  type BiometricImageType,
  type WithdrawalMotive,
} from '@/features/biometric-image/types/biometricImage'

type WithdrawPieceDialogProps = {
  type: BiometricImageType
  trigger: ReactNode
  onConfirm: (motive: WithdrawalMotive, motiveDetail?: string) => void
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
  const [detail, setDetail] = useState('')

  const writtenDetail = detail.trim()
  // Le back refuse une précision sans OTHER et OTHER sans précision : l'interface
  // pose la même règle plutôt que de laisser partir un appel voué au 400.
  const isDetailRequired = motive === 'OTHER'
  const isConfirmable =
    motive !== null &&
    (!isDetailRequired ||
      (writtenDetail.length > 0 && writtenDetail.length <= MAX_WITHDRAWAL_MOTIVE_DETAIL_LENGTH))

  const reset = () => {
    setMotive(null)
    setDetail('')
  }

  return (
    <AlertDialog onOpenChange={(open) => !open && reset()}>
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
        {isDetailRequired && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="withdrawal-motive-detail">
              {t('biometricImage.withdraw.detailLabel')}
            </Label>
            <Input
              id="withdrawal-motive-detail"
              value={detail}
              maxLength={MAX_WITHDRAWAL_MOTIVE_DETAIL_LENGTH}
              placeholder={t('biometricImage.withdraw.detailPlaceholder')}
              onChange={(event) => setDetail(event.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {t('biometricImage.withdraw.detailHint')}
            </p>
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel>{t('common.actions.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={!isConfirmable}
            onClick={() =>
              motive && onConfirm(motive, isDetailRequired ? writtenDetail : undefined)
            }
          >
            {actionLabel ?? t('biometricImage.withdraw.confirmAction')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
