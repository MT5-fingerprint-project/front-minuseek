import { useRef, type ChangeEvent } from 'react'
import { ImageUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useUploadBiometricImage } from '@/features/biometric-image/hooks/useBiometricImages'
import type { BiometricImage, BiometricImageType } from '@/features/biometric-image/types/biometricImage'

type BiometricImageEmptyPlaceholderProps = {
  type: BiometricImageType
  caseId: string
  onUploadSuccess?: (image: BiometricImage) => void
}

export default function BiometricImageEmptyPlaceholder({
  type,
  caseId,
  onUploadSuccess,
}: BiometricImageEmptyPlaceholderProps) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const upload = useUploadBiometricImage(type, { onSuccess: onUploadSuccess })
  const label = type === 'traces' ? t('biometricImage.import.traces') : t('biometricImage.import.referencePrints')

  const handleFileSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    upload.mutate({ caseId, file })
  }

  return (
    <>
      <button
        type="button"
        disabled={upload.isPending}
        onClick={() => inputRef.current?.click()}
        className="flex w-full items-center justify-center p-2 transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
      >
        <div className="flex min-h-[107px] items-center justify-center gap-2">
          <ImageUp className="size-6 text-blue-medium-1" />
          <span className="text-base text-blue-medium-1">
            {upload.isPending ? t('biometricImage.import.uploading') : label}
          </span>
        </div>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelected}
      />
    </>
  )
}
