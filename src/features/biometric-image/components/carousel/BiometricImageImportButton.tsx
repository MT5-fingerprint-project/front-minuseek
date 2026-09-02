import { useRef } from 'react'
import { Icon } from '@/features/shared/icons'
import { useTranslation } from 'react-i18next'
import { Button } from '@/features/shared/ui/button'
import {
  uploadImagesOneByOne,
  useUploadBiometricImage,
} from '@/features/biometric-image/hooks/useBiometricImages'
import { UPLOADABLE_IMAGE_ACCEPT } from '@/features/biometric-image/lib/uploadableImage'
import { useCaseIsClosed } from '@/features/investigation-case/hooks/useCaseIsClosed'
import type { BiometricImage, BiometricImageType } from '@/features/biometric-image/types/biometricImage'

type BiometricImageImportButtonProps = {
  type: BiometricImageType
  caseId: string
  onUploadSuccess?: (image: BiometricImage) => void
  variant?: 'blue' | 'ghost'
}

export default function BiometricImageImportButton({
  type,
  caseId,
  onUploadSuccess,
  variant = 'ghost',
}: BiometricImageImportButtonProps) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const upload = useUploadBiometricImage(type, { onSuccess: onUploadSuccess })
  const isCaseClosed = useCaseIsClosed(caseId)

  const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ''
    await uploadImagesOneByOne(upload, caseId, files)
  }

  if (isCaseClosed) return null

  const label = upload.isPending ? t('biometricImage.import.uploading') : t('biometricImage.import.button')

  return (
    <>
      {variant === 'blue' ? (
        <Button
          variant="blue"
          type="button"
          disabled={upload.isPending}
          onClick={() => inputRef.current?.click()}
        >
          {label}
          <Icon name="importPlus" size={24} color="white" />
        </Button>
      ) : (
        <Button
          variant="ghost"
          type="button"
          disabled={upload.isPending}
          onClick={() => inputRef.current?.click()}
          className="shrink-0 gap-2 text-base text-blue-medium-1"
        >
          <Icon name="importPlus" size={20} color="currentColor" />
          {label}
        </Button>
      )}
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
