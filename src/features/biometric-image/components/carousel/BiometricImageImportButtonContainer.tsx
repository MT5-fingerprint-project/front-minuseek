import { useImportBiometricImages } from '@/features/biometric-image/hooks/useImportBiometricImages'
import { useCaseIsClosed } from '@/features/investigation-case/hooks/useCaseIsClosed'
import type { BiometricImage, BiometricImageType } from '@/features/biometric-image/types/biometricImage'
import BiometricImageImportButton from '@/features/biometric-image/components/carousel/BiometricImageImportButton'

type BiometricImageImportButtonContainerProps = {
  type: BiometricImageType
  caseId: string
  onImported?: (image: BiometricImage) => void
  variant?: 'blue' | 'ghost'
}

export default function BiometricImageImportButtonContainer({
  type,
  caseId,
  onImported,
  variant,
}: BiometricImageImportButtonContainerProps) {
  const isCaseClosed = useCaseIsClosed(caseId)
  const importImages = useImportBiometricImages(type, caseId, { onImported })

  if (isCaseClosed) return null

  return (
    <BiometricImageImportButton
      isImporting={importImages.isImporting}
      progress={importImages.progress}
      onFilesSelected={importImages.start}
      variant={variant}
    />
  )
}
