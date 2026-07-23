import { useTranslation } from 'react-i18next'
import { Icon } from '@/features/shared/icons'

type ZoomControlsProps = {
  /** Current zoom scale, 1 = 100% */
  scale: number
  onZoomIn: () => void
  onZoomOut: () => void
}

export default function ZoomControls({ scale, onZoomIn, onZoomOut }: ZoomControlsProps) {
  const { t } = useTranslation()

  return (
    <div className="flex items-center gap-1 rounded-full bg-grey-light-1 px-2 py-1">
      <button
        type="button"
        onClick={onZoomOut}
        title={t('biometricImage.zoom.out')}
        className="rounded p-0.5 text-grey-medium-2 hover:text-grey-dark"
      >
        <Icon name="zoomOut" size={20} color="currentColor" />
      </button>
      <span className="min-w-10 text-center text-xs font-medium tabular-nums text-grey-dark">
        {Math.round(scale * 100)}%
      </span>
      <button
        type="button"
        onClick={onZoomIn}
        title={t('biometricImage.zoom.in')}
        className="rounded p-0.5 text-grey-medium-2 hover:text-grey-dark"
      >
        <Icon name="zoomIn" size={20} color="currentColor" />
      </button>
    </div>
  )
}
