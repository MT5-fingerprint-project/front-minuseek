import { useRef } from 'react'
import { Icon } from '@/features/shared/icons'
import { useTranslation } from 'react-i18next'
import { Button } from '@/features/shared/ui/button'
import { UPLOADABLE_IMAGE_ACCEPT } from '@/features/biometric-image/lib/uploadableImage'
import type { ImportProgress } from '@/features/biometric-image/hooks/useImportBiometricImages'

type BiometricImageImportButtonProps = {
  isImporting: boolean
  progress: ImportProgress | null
  onFilesSelected: (files: File[]) => void
  variant?: 'blue' | 'ghost'
}

export default function BiometricImageImportButton({
  isImporting,
  progress,
  onFilesSelected,
  variant = 'ghost',
}: BiometricImageImportButtonProps) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ''
    onFilesSelected(files)
  }

  const label = isImporting
    ? progress
      ? t('biometricImage.import.progress', progress)
      : t('biometricImage.import.uploading')
    : t('biometricImage.import.button')

  return (
    <>
      {variant === 'blue' ? (
        <Button variant="blue" type="button" disabled={isImporting} onClick={() => inputRef.current?.click()}>
          {label}
          <Icon name="importPlus" size={24} color="white" />
        </Button>
      ) : (
        <Button
          variant="ghost"
          type="button"
          disabled={isImporting}
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
