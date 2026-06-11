import { useRef } from 'react'
import { Stage, Layer } from 'react-konva'
import type { BiometricImage } from '@/features/biometric-image/types/biometricImage'
import DraggableImage from '@/features/biometric-image/components/canvas/DraggableImage'
import CanvasToolbar from '@/features/biometric-image/components/toolbar/CanvasToolbar'
import DemoLayersPanel from '@/features/biometric-image/components/layers/DemoLayersPanel'
import { useCanvasView, type CanvasZoomHandle } from '@/features/biometric-image/components/canvas/useCanvasView'
import { useContainerSize } from '@/features/shared/hooks/useContainerSize'

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
              <DraggableImage key={`${image.url}-${recenterSignal}`} url={image.url} stageSize={size} />
            </Layer>
          </Stage>
          {toolbarVisible && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
              <CanvasToolbar />
            </div>
          )}
          {layersVisible && onCloseLayers && (
            <div className="absolute inset-y-0 right-0">
              <DemoLayersPanel key={image.url} imageUrl={image.url} onClose={onCloseLayers} />
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
