import { useTranslation } from 'react-i18next'

/**
 * Pendant la lecture, l'atelier ne se touche plus : un clic, une molette ou un
 * glissé déplaceraient l'image sous les repères déjà révélés, et la
 * démonstration ne démontrerait plus rien — a fortiori pendant un
 * enregistrement, où le geste part dans le fichier. Les contrôles de lecture,
 * ancrés plus haut dans la pile, restent seuls accessibles.
 */
export default function ConcordanceScreenShield() {
  const { t } = useTranslation()

  return (
    <div
      className="absolute inset-0 z-10 cursor-not-allowed"
      title={t('investigationCase.comparison.concordanceScreenLocked')}
      onContextMenu={(event) => event.preventDefault()}
    />
  )
}
