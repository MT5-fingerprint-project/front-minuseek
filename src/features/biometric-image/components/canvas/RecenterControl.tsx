import { useTranslation } from 'react-i18next'
import { Icon } from '@/features/shared/icons'

type RecenterButton = {
  onClick: () => void
}

export default function RecenterButton({ onClick }: { onClick: () => void }) {
  const { t } = useTranslation()
  return (
    <button
      type="button"
      onClick={onClick}
      title={t('biometricImage.zoom.recenter')}
      className="rounded p-0.5 text-muted-foreground hover:text-foreground"
    >
      <Icon name="target" size={18} color="currentColor" />
    </button>
  )
}
