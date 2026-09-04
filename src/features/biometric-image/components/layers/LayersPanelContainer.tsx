import { useLayers, useUpdateLayer, useDeleteLayer } from '@/features/biometric-image/hooks/useLayers'
import type { RequestMinutiaDeletion } from '@/features/biometric-image/hooks/useMinutiaDeletionGuard'
import LayersPanel from '@/features/biometric-image/components/layers/LayersPanel'

type LayersPanelContainerProps = {
  fingerprintId: string
  onClose: () => void
  onHoverLayer?: (id: string | null) => void
  /** Passe la suppression par la confirmation du canevas quand la minutie est appariée. */
  onRequestMinutiaDeletion?: RequestMinutiaDeletion
}

export default function LayersPanelContainer({
  fingerprintId,
  onClose,
  onHoverLayer,
  onRequestMinutiaDeletion,
}: LayersPanelContainerProps) {
  const { data: layers = [] } = useLayers(fingerprintId)
  const updateLayer = useUpdateLayer()
  const deleteLayer = useDeleteLayer()

  const handleToggleVisibility = (id: string) => {
    const layer = layers.find((l) => l.id === id)
    if (!layer) return
    updateLayer.mutate({ id, input: { isVisible: !layer.isVisible } })
  }

  const handleDelete = (id: string) => {
    const removeLayer = () => deleteLayer.mutate(id)
    if (onRequestMinutiaDeletion) onRequestMinutiaDeletion(id, removeLayer)
    else removeLayer()
  }

  return (
    <LayersPanel
      layers={layers}
      onToggleVisibility={handleToggleVisibility}
      onDelete={handleDelete}
      onClose={onClose}
      onHoverLayer={onHoverLayer}
    />
  )
}
