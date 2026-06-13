import { useLayers, useUpdateLayer, useDeleteLayer } from '@/features/biometric-image/hooks/useLayers'
import LayersPanel from '@/features/biometric-image/components/layers/LayersPanel'

type LayersPanelContainerProps = {
  fingerprintId: string
  onClose: () => void
}

export default function LayersPanelContainer({ fingerprintId, onClose }: LayersPanelContainerProps) {
  const { data: layers = [] } = useLayers(fingerprintId)
  const updateLayer = useUpdateLayer(fingerprintId)
  const deleteLayer = useDeleteLayer(fingerprintId)

  const handleToggleVisibility = (id: string) => {
    const layer = layers.find((l) => l.id === id)
    if (!layer) return
    updateLayer.mutate({ id, input: { isVisible: !layer.isVisible } })
  }

  return (
    <LayersPanel
      layers={layers}
      onToggleVisibility={handleToggleVisibility}
      onDelete={(id) => deleteLayer.mutate(id)}
      onClose={onClose}
    />
  )
}
