import { useRef, useState } from 'react'
import { Stage, Layer } from 'react-konva'
import type { BiometricImage, BiometricImageType } from '@/features/biometric-image/types/biometricImage'
import DraggableImage, { type ImageLayout, type SourceGeometry } from '@/features/biometric-image/components/canvas/DraggableImage'
import DestroyedImagePlaceholder from '@/features/biometric-image/components/DestroyedImagePlaceholder'
import AnnotationLayer from '@/features/biometric-image/components/canvas/AnnotationLayer'
import CalibrationLayer from '@/features/biometric-image/components/canvas/CalibrationLayer'
import CalibrationDialog from '@/features/biometric-image/components/canvas/CalibrationDialog'
import ScaleBarOverlay from '@/features/biometric-image/components/canvas/ScaleBarOverlay'
import CanvasGridOverlay from '@/features/biometric-image/components/canvas/CanvasGridOverlay'
import CanvasToolbar from '@/features/biometric-image/components/toolbar/CanvasToolbar'
import LayersPanelContainer from '@/features/biometric-image/components/layers/LayersPanelContainer'
import {
  useCanvasView,
  type CanvasZoomHandle,
  type ScaleChangeOrigin,
} from '@/features/biometric-image/components/canvas/useCanvasView'
import { useContainerSize } from '@/features/shared/hooks/useContainerSize'
import { useCanvasFilters } from '@/features/biometric-image/hooks/useCanvasFilters'
import { useLayers } from '@/features/biometric-image/hooks/useLayers'
import { useBiometricImages, useCalibrateBiometricImage } from '@/features/biometric-image/hooks/useBiometricImages'
import { ANNOTATION_COLORS, type AnnotationToolType } from '@/features/biometric-image/components/toolbar/canvasFilters'
import type { CalibrationPoint } from '@/features/biometric-image/lib/calibration'

export type { CanvasZoomHandle, ScaleChangeOrigin }

type BiometricImageCanvasProps = {
  image: BiometricImage | undefined
  type: BiometricImageType
  placeholder: string
  isToolbarVisible?: boolean
  isLayersVisible?: boolean
  isGridVisible?: boolean
  onCloseLayers?: () => void
  zoomHandleRef?: React.RefObject<CanvasZoomHandle | null>
  onScaleChange?: (scale: number, origin: ScaleChangeOrigin) => void
  onSourceGeometryChange?: (geometry: SourceGeometry | null) => void
}

export default function BiometricImageCanvas({
  image,
  type,
  placeholder,
  isToolbarVisible = true,
  isLayersVisible = false,
  isGridVisible = false,
  onCloseLayers,
  zoomHandleRef,
  onScaleChange,
  onSourceGeometryChange,
}: BiometricImageCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const size = useContainerSize(containerRef)
  const { view, handleWheel, recenterSignal } = useCanvasView({ size, zoomHandleRef, onScaleChange })
  const { sliderValues, effectiveFilters, handleFilterChange } = useCanvasFilters(image?.id)
  const [activeTool, setActiveTool] = useState<AnnotationToolType | null>(null)
  const [activeColor, setActiveColor] = useState<string>(ANNOTATION_COLORS[0])
  const [imageLayout, setImageLayout] = useState<ImageLayout | null>(null)
  const [sourceGeometry, setSourceGeometry] = useState<SourceGeometry | null>(null)
  const [hoveredLayerId, setHoveredLayerId] = useState<string | null>(null)
  const [isRulerActive, setIsRulerActive] = useState(false)
  // Marqué par l'id de l'image : un changement d'image invalide le segment sans effet dédié.
  const [rulerSegment, setRulerSegment] = useState<
    { imageId: string; from: CalibrationPoint; to: CalibrationPoint } | null
  >(null)
  const activeRulerSegment = rulerSegment?.imageId === image?.id ? rulerSegment : null
  // Incrémenté à la validation et à l'annulation : force le remontage du calque de
  // calibrage pour effacer son segment tracé, sur le modèle de `recenterSignal`.
  const [calibrationResetSignal, setCalibrationResetSignal] = useState(0)
  const { data: layers = [] } = useLayers(image?.id)
  const annotationLayers = layers.filter((l) => l.type === 'ANNOTATION')

  // Le carrousel alimente le même cache : relire l'image ici ne coûte aucun appel réseau
  // supplémentaire, et c'est ce qui fait apparaître la barre d'échelle sans resélection.
  const { data: images } = useBiometricImages(type, image?.caseId ?? '')
  const freshImage = images?.find((img) => img.id === image?.id) ?? image
  const calibrate = useCalibrateBiometricImage(type, image?.caseId ?? '')

  const handleActiveToolChange = (tool: AnnotationToolType | null) => {
    setActiveTool(tool)
    if (tool !== null) setIsRulerActive(false)
  }

  const handleToggleRuler = () => {
    setIsRulerActive((prev) => !prev)
    setActiveTool(null)
  }

  const handleValidateCalibration = (resolutionDpi: number) => {
    if (!image) return
    calibrate.mutate({ id: image.id, resolutionDpi })
    setRulerSegment(null)
    setCalibrationResetSignal((n) => n + 1)
  }

  const handleCancelCalibration = () => {
    setRulerSegment(null)
    setCalibrationResetSignal((n) => n + 1)
  }

  const handleSegmentComplete = (from: CalibrationPoint, to: CalibrationPoint) => {
    if (!image) return
    setRulerSegment({ imageId: image.id, from, to })
  }

  const handleSourceGeometryChange = (geometry: SourceGeometry) => {
    setSourceGeometry(geometry)
    onSourceGeometryChange?.(geometry)
  }

  if (image?.imageDestroyedAt) {
    return (
      <div ref={containerRef} className="relative h-full w-full overflow-hidden">
        <DestroyedImagePlaceholder
          destroyedAt={image.imageDestroyedAt}
          iconSize={48}
          className="h-full w-full bg-transparent"
        />
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden">
      {image?.url ? (
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
                isDraggable={activeTool === null && !isRulerActive}
                viewScale={view.scale}
                onLayoutChange={setImageLayout}
                onSourceGeometryChange={handleSourceGeometryChange}
              />
            </Layer>
            <AnnotationLayer
              annotations={annotationLayers}
              layerCount={layers.length}
              activeTool={activeTool}
              activeColor={activeColor}
              fingerprintId={image.id}
              imageLayout={imageLayout}
              hoveredLayerId={hoveredLayerId}
            />
            <CalibrationLayer
              key={`${image.id}-${calibrationResetSignal}`}
              isActive={isRulerActive}
              imageLayout={imageLayout}
              onSegmentComplete={handleSegmentComplete}
            />
          </Stage>
          {isGridVisible && <CanvasGridOverlay />}
          <ScaleBarOverlay
            resolutionDpi={freshImage?.resolutionDpi ?? null}
            fitScale={sourceGeometry?.fitScale ?? 1}
            viewScale={view.scale}
          />
          {activeRulerSegment && sourceGeometry && (
            <CalibrationDialog
              from={activeRulerSegment.from}
              to={activeRulerSegment.to}
              fitScale={sourceGeometry.fitScale}
              isSaving={calibrate.isPending}
              onValidate={handleValidateCalibration}
              onCancel={handleCancelCalibration}
            />
          )}
          {isToolbarVisible && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10">
              <CanvasToolbar
                filters={sliderValues}
                onFiltersChange={handleFilterChange}
                activeTool={activeTool}
                onActiveToolChange={handleActiveToolChange}
                activeColor={activeColor}
                onActiveColorChange={setActiveColor}
                isRulerActive={isRulerActive}
                onToggleRuler={handleToggleRuler}
              />
            </div>
          )}
          {isLayersVisible && onCloseLayers && (
            <div className="absolute inset-y-0 right-0">
              <LayersPanelContainer fingerprintId={image.id} onClose={onCloseLayers} onHoverLayer={setHoveredLayerId} />
            </div>
          )}
        </>
      ) : (
        <>
          {isGridVisible && <CanvasGridOverlay />}
          <div className="relative flex h-full items-center justify-center p-6">
            <span className="rounded bg-white px-3 py-1 text-center text-lg font-semibold text-grey-medium-1">
              {placeholder}
            </span>
          </div>
        </>
      )}
    </div>
  )
}
