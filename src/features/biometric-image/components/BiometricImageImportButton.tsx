import { ImageUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'

/**
 * Zone d'import (bouton "Importer") de la maquette. L'upload n'étant pas encore
 * implémenté, le bouton est rendu désactivé.
 */
export default function BiometricImageImportButton() {
  const { t } = useTranslation()

  return (
    <button
      type="button"
      disabled
      className="flex shrink-0 items-center gap-2 text-[var(--ms-blue-medium)] disabled:cursor-not-allowed disabled:opacity-60"
    >
      <ImageUp className="size-5" />
      <span className="text-base">{t('biometricImage.import.button')}</span>
    </button>
  )
}
