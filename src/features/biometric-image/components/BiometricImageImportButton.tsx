import { useRef } from 'react'
import { ImageUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/features/shared/ui/button'
import { useUploadBiometricImage } from '@/features/biometric-image/hooks/useBiometricImages'
import type { BiometricImage, BiometricImageType } from '@/features/biometric-image/types/biometricImage'

type BiometricImageImportButtonProps = {
  type: BiometricImageType
  caseId: string
  onUploadSuccess?: (image: BiometricImage) => void
}

export default function BiometricImageImportButton({
  type,
  caseId,
  onUploadSuccess,
}: BiometricImageImportButtonProps) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const upload = useUploadBiometricImage(type, { onSuccess: onUploadSuccess })

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    upload.mutate({ caseId, file })
  }

  return (
    <>
      <Button
        variant="ghost"
        type="button"
        disabled={upload.isPending}
        onClick={() => inputRef.current?.click()}
        className="shrink-0 gap-2 text-base text-[var(--ms-blue-medium)]"
      >
        <ImageUp className="size-5" />
        {upload.isPending ? t('biometricImage.import.uploading') : t('biometricImage.import.button')}
      </Button>
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
