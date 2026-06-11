import { useTranslation } from 'react-i18next'
import { Icon } from '@/features/shared/icons'
import type { Layer } from '@/features/biometric-image/types/layer'
import LayerItem from '@/features/biometric-image/components/layers/LayerItem'

type LayersPanelProps = {
  layers: Layer[]
  onToggleVisibility: (id: string) => void
  onClose: () => void
}

export default function LayersPanel({ layers, onToggleVisibility, onClose }: LayersPanelProps) {
  const { t } = useTranslation()

  return (
    <div className="flex h-full w-44 flex-col border-l bg-white shadow-lg">
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
        {layers.map((layer) => (
          <LayerItem key={layer.id} layer={layer} onToggleVisibility={onToggleVisibility} />
        ))}
      </div>
    </div>
  )
}
