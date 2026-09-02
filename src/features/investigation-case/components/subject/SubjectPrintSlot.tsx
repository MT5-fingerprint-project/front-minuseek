import { useId } from 'react'
import { Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { cn } from '@/features/shared/lib/utils'
import { Icon } from '@/features/shared/icons'
import { Spinner } from '@/features/shared/ui/spinner'
import { useFileDropZone } from '@/features/shared/hooks/useFileDropZone'
import DestroyedImagePlaceholder from '@/features/biometric-image/components/DestroyedImagePlaceholder'
import WithdrawPieceDialog from '@/features/biometric-image/components/WithdrawPieceDialog'
import {
  UPLOADABLE_IMAGE_ACCEPT,
  UPLOADABLE_IMAGE_MIME_TYPES,
} from '@/features/biometric-image/lib/uploadableImage'
import type {
  BiometricImage,
  WithdrawalMotive,
} from '@/features/biometric-image/types/biometricImage'

type SubjectPrintSlotProps = {
  label: string
  print?: BiometricImage
  isUploading: boolean
  onUpload: (file: File) => void
  onWithdraw: (printId: string, motive: WithdrawalMotive, motiveDetail?: string) => void
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

  const { isDraggingOver, dropZoneProps } = useFileDropZone({
    acceptedMimeTypes: UPLOADABLE_IMAGE_MIME_TYPES,
    enabled: !isReadOnly && !print && !isUploading,
    onFilesAccepted: (files) => onUpload(files[0]),
    onFilesRejected: () => toast.error(t('biometricImage.drop.rejected')),
  })

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
            onConfirm={(motive, motiveDetail) => onWithdraw(print.id, motive, motiveDetail)}
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
          {...dropZoneProps}
          className={cn(
            'flex aspect-square cursor-pointer items-center justify-center rounded-xs border border-dashed transition-colors',
            isDraggingOver
              ? 'border-blue-medium-1 bg-blue-light-1'
              : 'border-grey-light-2 hover:border-blue-medium-1',
          )}
        >
          {isUploading ? (
            <Spinner className="size-6" />
          ) : (
            <Icon name="import" size={28} color="var(--color-grey-medium-1)" />
          )}
          <input
            id={inputId}
            type="file"
            accept={UPLOADABLE_IMAGE_ACCEPT}
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
