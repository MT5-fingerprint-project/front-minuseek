import { useTranslation } from 'react-i18next'

export default function BlindVerificationBanner() {
  const { t } = useTranslation()

  return (
    <p className="rounded-sm bg-blue-dark-1 px-4 py-2 text-sm text-white">
      {t('verification.blindBanner')}
    </p>
  )
}
