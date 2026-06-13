import { Icon } from '@/features/shared/icons'
import type { IconName } from '@/features/shared/icons'
import type { Layer } from '@/features/biometric-image/types/layer'
import { FILTER_META } from '@/features/biometric-image/components/toolbar/canvasFilters'

type LayerItemProps = {
  layer: Layer
  onToggleVisibility: (id: string) => void
  onDelete: (id: string) => void
}

export default function LayerItem({ layer, onToggleVisibility, onDelete }: LayerItemProps) {
  return (
    <div className="flex items-center justify-between gap-1 border-b px-3 py-2">
      <div className="flex items-center gap-1.5 min-w-0">
        <Icon
          name={(layer.type === 'ANNOTATION' ? 'pen' : (FILTER_META[layer.settings.filterKey as string]?.icon ?? 'layers')) as IconName}
          size={14}
          color="currentColor"
        />
        <span className="truncate text-sm font-medium">{layer.name}</span>
      </div>
      <div className="flex items-center gap-0.5 shrink-0">
        <button
          type="button"
          onClick={() => onToggleVisibility(layer.id)}
          className="rounded p-1 text-muted-foreground hover:text-foreground"
        >
          <Icon name={layer.isVisible ? 'show' : 'showOff'} size={16} color="currentColor" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(layer.id)}
          className="rounded p-1 text-muted-foreground hover:text-foreground"
        >
          <Icon name="close" size={16} color="currentColor" />
        </button>
      </div>
    </div>
  )
}
