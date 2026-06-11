import { Icon } from '@/features/shared/icons'
import type { Layer } from '@/features/biometric-image/types/layer'

type LayerItemProps = {
  layer: Layer
  onToggleVisibility: (id: string) => void
}

export default function LayerItem({ layer, onToggleVisibility }: LayerItemProps) {
  return (
    <div className="flex flex-col gap-1 border-b px-3 py-2">
      <div className="flex items-center gap-1.5 text-sm font-medium">
        <Icon name={layer.kind === 'annotation' ? 'pen' : 'luminosity'} size={14} color="currentColor" />
        {layer.name}
      </div>
      <div className="flex items-center justify-between">
        <img
          src={layer.thumbnailUrl}
          alt={layer.name}
          className="h-9 w-7 rounded-sm border object-cover"
        />
        <button
          type="button"
          onClick={() => onToggleVisibility(layer.id)}
          className="rounded p-1 text-muted-foreground hover:text-foreground"
        >
          <Icon name={layer.visible ? 'show' : 'showOff'} size={18} color="currentColor" />
        </button>
      </div>
    </div>
  )
}
