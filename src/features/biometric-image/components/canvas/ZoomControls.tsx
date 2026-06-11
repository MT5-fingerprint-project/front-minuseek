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
    <div className="flex items-center gap-1 rounded-full border bg-white px-1.5 py-0.5 shadow-sm">
      <button
        type="button"
        onClick={onZoomOut}
        title={t('biometricImage.zoom.out')}
        className="rounded p-0.5 text-muted-foreground hover:text-foreground"
      >
        <Icon name="zoomOut" size={18} color="currentColor" />
      </button>
      <span className="min-w-10 text-center text-xs tabular-nums">
        {Math.round(scale * 100)}%
      </span>
      <button
        type="button"
        onClick={onZoomIn}
        title={t('biometricImage.zoom.in')}
        className="rounded p-0.5 text-muted-foreground hover:text-foreground"
      >
        <Icon name="zoomIn" size={18} color="currentColor" />
      </button>
    </div>
  )
}
