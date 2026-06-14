import { useRef, useState } from 'react'
import { Stage, Layer } from 'react-konva'
import type { BiometricImage } from '@/features/biometric-image/types/biometricImage'
import DraggableImage, { type ImageLayout } from '@/features/biometric-image/components/canvas/DraggableImage'
import AnnotationLayer from '@/features/biometric-image/components/canvas/AnnotationLayer'
import CanvasToolbar from '@/features/biometric-image/components/toolbar/CanvasToolbar'
import LayersPanelContainer from '@/features/biometric-image/components/layers/LayersPanelContainer'
import { useCanvasView, type CanvasZoomHandle } from '@/features/biometric-image/components/canvas/useCanvasView'
import { useContainerSize } from '@/features/shared/hooks/useContainerSize'
import { useCanvasFilters } from '@/features/biometric-image/hooks/useCanvasFilters'
import { useLayers } from '@/features/biometric-image/hooks/useLayers'
import { ANNOTATION_COLORS, type AnnotationToolType } from '@/features/biometric-image/components/toolbar/canvasFilters'

export type { CanvasZoomHandle }

type BiometricImageCanvasProps = {
  image: BiometricImage | undefined
  placeholder: string
  toolbarVisible?: boolean
  layersVisible?: boolean
  onCloseLayers?: () => void
  zoomHandleRef?: React.RefObject<CanvasZoomHandle | null>
  onScaleChange?: (scale: number) => void
}

export default function BiometricImageCanvas({
  image,
  placeholder,
  toolbarVisible = true,
  layersVisible = false,
  onCloseLayers,
  zoomHandleRef,
  onScaleChange,
}: BiometricImageCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const size = useContainerSize(containerRef)
  const { view, handleWheel, recenterSignal } = useCanvasView({ size, zoomHandleRef, onScaleChange })
  const { sliderValues, effectiveFilters, handleFilterChange } = useCanvasFilters(image?.id)
  const [activeTool, setActiveTool] = useState<AnnotationToolType | null>(null)
  const [activeColor, setActiveColor] = useState<string>(ANNOTATION_COLORS[0])
  const [imageLayout, setImageLayout] = useState<ImageLayout | null>(null)
  const { data: layers = [] } = useLayers(image?.id)
  const annotationLayers = layers.filter((l) => l.type === 'ANNOTATION')

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden">
      {image ? (
        <>
          <Stage
            width={size.width}
            height={size.height}
            scaleX={view.scale}
            scaleY={view.scale}
            x={view.x}
            y={view.y}
            onWheel={handleWheel}
          >
            <Layer>
              <DraggableImage
                key={`${image.url}-${recenterSignal}`}
                url={image.url}
                stageSize={size}
                filters={effectiveFilters}
                draggable={activeTool === null}
                onLayoutChange={setImageLayout}
              />
            </Layer>
            <AnnotationLayer
              annotations={annotationLayers}
              activeTool={activeTool}
              activeColor={activeColor}
              fingerprintId={image.id}
              imageLayout={imageLayout}
            />
          </Stage>
          {toolbarVisible && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10">
              <CanvasToolbar
                filters={sliderValues}
                onFiltersChange={handleFilterChange}
                activeTool={activeTool}
                onActiveToolChange={setActiveTool}
                activeColor={activeColor}
                onActiveColorChange={setActiveColor}
              />
            </div>
          )}
          {layersVisible && onCloseLayers && (
            <div className="absolute inset-y-0 right-0">
              <LayersPanelContainer fingerprintId={image.id} onClose={onCloseLayers} />
            </div>
          )}
        </>
      ) : (
        <div className="flex h-full items-center justify-center p-6 text-sm text-muted-foreground">
          {placeholder}
        </div>
      )}
    </div>
  )
}
