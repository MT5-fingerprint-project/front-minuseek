import { ImageUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/features/shared/ui/button'

/**
 * Zone d'import (bouton "Importer") de la maquette. L'upload n'étant pas encore
 * implémenté, le bouton est rendu désactivé.
 */
export default function BiometricImageImportButton() {
  const { t } = useTranslation()

  return (
    <Button variant="ghost" disabled className="shrink-0 gap-2 text-base text-[var(--ms-blue-medium)]">
      <ImageUp className="size-5" />
      {t('biometricImage.import.button')}
    </Button>
  )
}
