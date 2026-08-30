import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '@/features/shared/icons'
import { useClickOutside } from '@/features/shared/hooks/useClickOutside'
import { TOUR_UI_SELECTOR } from '@/features/investigation-case/constants/atelierTour.constants'
import type { Layer } from '@/features/biometric-image/types/layer'
import LayerItem from '@/features/biometric-image/components/layers/LayerItem'

type LayersPanelProps = {
  layers: Layer[]
  onToggleVisibility: (id: string) => void
  onDelete: (id: string) => void
  onClose: () => void
  onHoverLayer?: (id: string | null) => void
}

export default function LayersPanel({ layers, onToggleVisibility, onDelete, onClose, onHoverLayer }: LayersPanelProps) {
  const { t } = useTranslation()
  const panelRef = useRef<HTMLDivElement>(null)
  useClickOutside(panelRef, onClose, { ignoreSelector: `[data-layers-toggle], ${TOUR_UI_SELECTOR}` })

  return (
    <div ref={panelRef} className="flex h-full w-44 flex-col border-l bg-white shadow-lg">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <span className="text-sm font-semibold">{t('biometricImage.layers.title')}</span>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-0.5 text-muted-foreground hover:text-foreground"
          title={t('biometricImage.layers.close')}
        >
          <Icon name="close" size={18} color="currentColor" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {!layers.length && (
          <p className="p-3 text-xs text-muted-foreground">{t('biometricImage.layers.empty')}</p>
        )}
        {layers.map((layer) => (
          <LayerItem key={layer.id} layer={layer} onToggleVisibility={onToggleVisibility} onDelete={onDelete} onMouseEnter={(id) => onHoverLayer?.(id)} onMouseLeave={() => onHoverLayer?.(null)} />
        ))}
      </div>
    </div>
  )
}
