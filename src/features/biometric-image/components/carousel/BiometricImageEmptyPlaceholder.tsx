import { useRef, type ChangeEvent } from 'react'
import { ImageUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { UPLOADABLE_IMAGE_ACCEPT } from '@/features/biometric-image/lib/uploadableImage'
import type { ImportProgress } from '@/features/biometric-image/hooks/useImportBiometricImages'
import type { BiometricImageType } from '@/features/biometric-image/types/biometricImage'

type BiometricImageEmptyPlaceholderProps = {
  type: BiometricImageType
  isImporting: boolean
  progress: ImportProgress | null
  onFilesSelected: (files: File[]) => void
  isReadOnly?: boolean
}

export default function BiometricImageEmptyPlaceholder({
  type,
  isImporting,
  progress,
  onFilesSelected,
  isReadOnly = false,
}: BiometricImageEmptyPlaceholderProps) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const idleLabel = type === 'traces' ? t('biometricImage.import.traces') : t('biometricImage.import.referencePrints')

  const handleFileSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ''
    onFilesSelected(files)
  }

  const label = isImporting
    ? progress
      ? t('biometricImage.import.progress', progress)
      : t('biometricImage.import.uploading')
    : idleLabel

  return (
    <>
      <button
        type="button"
        disabled={isImporting || isReadOnly}
        onClick={() => inputRef.current?.click()}
        data-tour={`empty-${type}`}
        className="flex w-full items-center justify-center p-2 transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
      >
        <div className="flex min-h-[107px] items-center justify-center gap-2">
          <ImageUp className="size-6 text-blue-medium-1" />
          <span className="text-base text-blue-medium-1">{label}</span>
        </div>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={UPLOADABLE_IMAGE_ACCEPT}
        className="hidden"
        multiple
        onChange={handleFileSelected}
      />
    </>
  )
}
