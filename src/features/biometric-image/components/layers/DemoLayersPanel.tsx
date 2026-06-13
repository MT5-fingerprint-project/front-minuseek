import { useState } from 'react'
import type { Layer } from '@/features/biometric-image/types/layer'
import LayersPanel from '@/features/biometric-image/components/layers/LayersPanel'

type DemoLayersPanelProps = {
  imageUrl: string
  onClose: () => void
}

// Placeholder layer stack until the real non-destructive layer system exists
export default function DemoLayersPanel({ imageUrl, onClose }: DemoLayersPanelProps) {
  const [layers, setLayers] = useState<Layer[]>(() => [
    { id: 'annotations', kind: 'annotation', name: 'Annotations', thumbnailUrl: imageUrl, visible: true },
    { id: 'luminosity', kind: 'adjustment', name: 'Luminosité', thumbnailUrl: imageUrl, visible: false },
  ])

  const toggleVisibility = (id: string) =>
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l)))

  return <LayersPanel layers={layers} onToggleVisibility={toggleVisibility} onClose={onClose} />
}
