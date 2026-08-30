import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '@/features/shared/icons'
import { Button } from '@/features/shared/ui/button'
import WithdrawPieceDialog from '@/features/biometric-image/components/WithdrawPieceDialog'
import {
  useAttachTraceLocationPhoto,
  useRemoveTraceLocationPhoto,
} from '@/features/biometric-image/hooks/useBiometricImages'
import { useCaseIsClosed } from '@/features/investigation-case/hooks/useCaseIsClosed'
import type { WithdrawalMotive } from '@/features/biometric-image/types/biometricImage'
import type { TraceLocationPhoto } from '@/features/biometric-image/types/trace'

const ACCEPTED_FORMATS = 'image/png,image/jpeg,image/tiff'

type PendingWithdrawal = { motive: WithdrawalMotive; motiveDetail?: string }

type TraceLocationPhotoCardProps = {
  traceId: string
  caseId: string
  photo: TraceLocationPhoto | null
}

export default function TraceLocationPhotoCard({ traceId, caseId, photo }: TraceLocationPhotoCardProps) {
  const { t, i18n } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const [replacedWithdrawal, setReplacedWithdrawal] = useState<PendingWithdrawal | null>(null)
  const attachPhoto = useAttachTraceLocationPhoto(caseId)
  const removePhoto = useRemoveTraceLocationPhoto(caseId)
  const isCaseClosed = useCaseIsClosed(caseId)
  const isBusy = attachPhoto.isPending || removePhoto.isPending


  const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const [file] = Array.from(event.target.files ?? [])
    event.target.value = ''
    if (!file) return

    const withdrawal = replacedWithdrawal
    setReplacedWithdrawal(null)
    try {
      if (withdrawal !== null) {
        await removePhoto.mutateAsync({ traceId, ...withdrawal })
      }
      await attachPhoto.mutateAsync({ traceId, file })
    } catch {
      // Les deux mutations toastent déjà leur échec.
    }
  }

  const startReplacement = (motive: WithdrawalMotive, motiveDetail?: string) => {
    setReplacedWithdrawal({ motive, motiveDetail })
    inputRef.current?.click()
  }

  const sealedAt = photo ? new Date(photo.sealedAt) : null

  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold">{t('trace.locationPhoto.title')}</h3>

      {photo && sealedAt ? (
        <>
          <img
            src={photo.url}
            alt={t('trace.locationPhoto.alt')}
            className="max-h-80 w-full rounded-sm object-contain"
          />
          <p className="text-sm text-muted-foreground">
            {t('trace.locationPhoto.sealedAt', {
              date: sealedAt.toLocaleDateString(i18n.language),
              time: sealedAt.toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' }),
            })}
          </p>
          {!isCaseClosed && (
            <div className="flex items-center gap-2">
              <WithdrawPieceDialog
                type="traces"
                title={t('trace.locationPhoto.replaceTitle')}
                description={t('trace.locationPhoto.replaceDescription')}
                actionLabel={t('trace.locationPhoto.replace')}
                onConfirm={startReplacement}
                trigger={
                  <Button type="button" variant="outline" size="small" disabled={isBusy}>
                    {t('trace.locationPhoto.replace')}
                  </Button>
                }
              />
              <WithdrawPieceDialog
                type="traces"
                title={t('trace.locationPhoto.removeTitle')}
                description={t('trace.locationPhoto.removeDescription')}
                actionLabel={t('trace.locationPhoto.remove')}
                onConfirm={(motive, motiveDetail) =>
                  removePhoto.mutate({ traceId, motive, motiveDetail })
                }
                trigger={
                  <Button type="button" variant="destructive" size="small" disabled={isBusy}>
                    {t('trace.locationPhoto.remove')}
                  </Button>
                }
              />
            </div>
          )}
        </>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">{t('trace.locationPhoto.empty')}</p>
          {!isCaseClosed && (
            <div className="flex flex-col items-start gap-1">
              <Button
                type="button"
                variant="outline"
                size="small"
                disabled={isBusy}
                onClick={() => {
                  setReplacedWithdrawal(null)
                  inputRef.current?.click()
                }}
              >
                <Icon name="importPlus" size={20} color="currentColor" />
                {t('trace.locationPhoto.add')}
              </Button>
              <p className="text-xs text-muted-foreground">{t('trace.locationPhoto.acceptedFormats')}</p>
            </div>
          )}
        </>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_FORMATS}
        className="hidden"
        onChange={handleFileSelected}
      />
    </section>
  )
}
