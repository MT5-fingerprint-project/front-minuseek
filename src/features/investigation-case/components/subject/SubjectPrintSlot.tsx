import { useId } from 'react'
import { Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Icon } from '@/features/shared/icons'
import { Spinner } from '@/features/shared/ui/spinner'
import DestroyedImagePlaceholder from '@/features/biometric-image/components/DestroyedImagePlaceholder'
import WithdrawPieceDialog from '@/features/biometric-image/components/WithdrawPieceDialog'
import type {
  BiometricImage,
  WithdrawalMotive,
} from '@/features/biometric-image/types/biometricImage'

type SubjectPrintSlotProps = {
  label: string
  print?: BiometricImage
  isUploading: boolean
  onUpload: (file: File) => void
  onWithdraw: (printId: string, motive: WithdrawalMotive) => void
  isReadOnly: boolean
}

export default function SubjectPrintSlot({
  label,
  print,
  isUploading,
  onUpload,
  onWithdraw,
  isReadOnly,
}: SubjectPrintSlotProps) {
  const { t } = useTranslation()
  const inputId = useId()

  return (
    <div className="flex flex-col gap-2 rounded-sm bg-white p-2">
      {print?.imageDestroyedAt ? (
        <DestroyedImagePlaceholder
          destroyedAt={print.imageDestroyedAt}
          className="aspect-square rounded-xs"
        />
      ) : print ? (
        <div className="group relative aspect-square overflow-hidden rounded-xs">
          <img
            src={print.url ?? undefined}
            alt={label}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
          {!isReadOnly && (
          <WithdrawPieceDialog
            type="reference-prints"
            onConfirm={(motive) => onWithdraw(print.id, motive)}
            trigger={
              <button
                type="button"
                aria-label={t('subject.prints.withdraw', { position: label })}
                className="absolute inset-0 flex items-center justify-center bg-blue-dark-1/50 opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
              >
                <Trash2 className="size-7 text-white" />
              </button>
            }
          />
          )}
        </div>
      ) : isReadOnly ? (
        <div className="flex aspect-square items-center justify-center rounded-xs border border-dashed border-grey-light-2" />
      ) : (
        <label
          htmlFor={inputId}
          aria-label={t('subject.prints.import', { position: label })}
          className="flex aspect-square cursor-pointer items-center justify-center rounded-xs border border-dashed border-grey-light-2 transition-colors hover:border-blue-medium-1"
        >
          {isUploading ? (
            <Spinner className="size-6" />
          ) : (
            <Icon name="import" size={28} color="var(--color-grey-medium-1)" />
          )}
          <input
            id={inputId}
            type="file"
            accept="image/png,image/jpeg,image/tiff"
            className="hidden"
            disabled={isUploading}
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) onUpload(file)
              event.target.value = ''
            }}
          />
        </label>
      )}
      <span className="px-1 text-sm text-blue-dark-2">{label}</span>
    </div>
  )
}
