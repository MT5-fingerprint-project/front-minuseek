import { useImperativeHandle, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Stage, Layer } from 'react-konva'
import type Konva from 'konva'
import type { BiometricImage, BiometricImageType } from '@/features/biometric-image/types/biometricImage'
import DraggableImage, { type DrawnFrame, type ImageLayout, type SourceGeometry } from '@/features/biometric-image/components/canvas/DraggableImage'
import DestroyedImagePlaceholder from '@/features/biometric-image/components/DestroyedImagePlaceholder'
import AnnotationLayer from '@/features/biometric-image/components/canvas/AnnotationLayer'
import PairedMinutiaDeletionDialog from '@/features/biometric-image/components/canvas/PairedMinutiaDeletionDialog'
import CalibrationLayer from '@/features/biometric-image/components/canvas/CalibrationLayer'
import CalibrationDialog from '@/features/biometric-image/components/canvas/CalibrationDialog'
import ScaleBarOverlay from '@/features/biometric-image/components/canvas/ScaleBarOverlay'
import CanvasGridOverlay from '@/features/biometric-image/components/canvas/CanvasGridOverlay'
import CanvasToolbar, { type CanvasMode } from '@/features/biometric-image/components/toolbar/CanvasToolbar'
import LayersPanelContainer from '@/features/biometric-image/components/layers/LayersPanelContainer'
import { useCanvasView, type CanvasZoomHandle } from '@/features/biometric-image/components/canvas/useCanvasView'
import { useContainerSize } from '@/features/shared/hooks/useContainerSize'
import { useCanvasFilters } from '@/features/biometric-image/hooks/useCanvasFilters'
import { useLayers, useUpdateLayer } from '@/features/biometric-image/hooks/useLayers'
import { useMinutiaDeletionGuard } from '@/features/biometric-image/hooks/useMinutiaDeletionGuard'
import { useBiometricImages, useCalibrateBiometricImage } from '@/features/biometric-image/hooks/useBiometricImages'
import { useCaseExpertise } from '@/features/investigation-case/hooks/useCaseExpertise'
import { Badge } from '@/features/shared/ui/badge'
import { cn } from '@/features/shared/lib/utils'
import { ANNOTATION_COLORS, type AnnotationToolType } from '@/features/biometric-image/components/toolbar/canvasFilters'
import type { CalibrationPoint } from '@/features/biometric-image/lib/calibration'
import { stageToPngBlob } from '@/features/biometric-image/lib/exportImage'
import {
  DEFAULT_MINUTIA_TYPE,
  isMinutiaSettings,
  minutiaTypeOf,
  type MinutiaType,
} from '@/features/biometric-image/lib/minutiae'

// `konvajs-content` est le div que Konva place autour de ses canvas : le viser plutôt que
// le conteneur garde le curseur main sur l'image, et pas sur la barre d'outils.
const PAN_CURSOR_CLASS = '[&_.konvajs-content]:cursor-grab [&_.konvajs-content:active]:cursor-grabbing'

export type { CanvasZoomHandle }

export type ExportHandle = {
  exportToBlob: () => Promise<Blob>
}

/** Arme la règle depuis le pied de fenêtre, où la pastille annonce l'absence d'échelle. */
export type RulerHandle = {
  arm: () => void
}

type BiometricImageCanvasProps = {
  image: BiometricImage | undefined
  type: BiometricImageType
  placeholder: string
  isToolbarVisible?: boolean
  isLayersVisible?: boolean
  isGridVisible?: boolean
  onCloseLayers?: () => void
  zoomHandleRef?: React.RefObject<CanvasZoomHandle | null>
  onScaleChange?: (scale: number) => void
  onSourceGeometryChange?: (geometry: SourceGeometry | null) => void
  exportHandleRef?: React.RefObject<ExportHandle | null>
  rulerHandleRef?: React.RefObject<RulerHandle | null>
  /** Mode démonstration (L7-2b) : appariement des minuties entre trace et empreinte. */
  isPairingMode?: boolean
  armedMinutiaId?: string | null
  minutiaNumbers?: Map<string, number>
  onMinutiaClick?: (minutiaId: string) => void
  onPairMiss?: () => void
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
  exportHandleRef,
  rulerHandleRef,
  isPairingMode = false,
  armedMinutiaId = null,
  minutiaNumbers,
  onMinutiaClick,
  onPairMiss,
}: BiometricImageCanvasProps) {
  const { t } = useTranslation()
  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<Konva.Stage>(null)
  const size = useContainerSize(containerRef)

  const [measuredGeometry, setMeasuredGeometry] = useState<{ imageId: string; geometry: SourceGeometry } | null>(null)
  const imageId = image?.id ?? null
  // Les dimensions servies par l'API sont celles du fichier scellé : elles donnent le repère
  // des minuties sans attendre le décodage. La mesure sur l'image ne sert plus que de repli.
  const servedFrame: DrawnFrame | null =
    image?.sourceWidth != null && image?.sourceHeight != null
      ? { width: image.sourceWidth, height: image.sourceHeight }
      : null
  const measured = measuredGeometry?.imageId === imageId ? measuredGeometry.geometry : null
  const sourceGeometry = servedFrame
    ? { sourceWidth: servedFrame.width, sourceHeight: servedFrame.height }
    : measured
  const sourceWidth = sourceGeometry?.sourceWidth ?? 0
  const sourceHeight = sourceGeometry?.sourceHeight ?? 0
  const [drawnFrame, setDrawnFrame] = useState<{ imageId: string; frame: DrawnFrame } | null>(null)
  const content = drawnFrame?.imageId === imageId ? drawnFrame.frame : null
  const { view, handleWheel, panTo, recenterSignal } = useCanvasView({ size, content, zoomHandleRef, onScaleChange })
  const { sliderValues, effectiveFilters, handleFilterChange } = useCanvasFilters(image?.id)
  const [mode, setMode] = useState<CanvasMode>('image')
  const [activeTool, setActiveTool] = useState<AnnotationToolType | null>(null)
  const [activeColor, setActiveColor] = useState<string>(ANNOTATION_COLORS[0])
  const [activeMinutiaType, setActiveMinutiaType] = useState<MinutiaType>(DEFAULT_MINUTIA_TYPE)
  const [measuredLayout, setMeasuredLayout] = useState<{ imageId: string; layout: ImageLayout } | null>(null)
  const imageLayout = measuredLayout?.imageId === imageId ? measuredLayout.layout : null
  const [hoveredLayerId, setHoveredLayerId] = useState<string | null>(null)
  const [selected, setSelected] = useState<{ id: string; tool: AnnotationToolType | null } | null>(null)
  const selectedAnnotationId = selected?.tool === activeTool ? selected.id : null
  const updateSelectedType = useUpdateLayer()
  const minutiaDeletionGuard = useMinutiaDeletionGuard(minutiaNumbers)
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
  const expertise = useCaseExpertise(image?.caseId ?? '')
  const annotationLayers = layers.filter((l) => l.type === 'ANNOTATION')
  const selectedLayer = annotationLayers.find((l) => l.id === selectedAnnotationId)
  const selectedMinutiaType =
    selectedLayer && isMinutiaSettings(selectedLayer.settings)
      ? minutiaTypeOf(selectedLayer.settings)
      : undefined

  const { data: images } = useBiometricImages(type, image?.caseId ?? '')
  const freshImage = images?.find((img) => img.id === image?.id) ?? image
  const calibrate = useCalibrateBiometricImage(type, image?.caseId ?? '')

  const isPanMode = mode === 'hand' && !isPairingMode

  const handleModeChange = (next: CanvasMode) => {
    setMode(next)
  
    if (next === 'hand') setSelected(null)
  }


  const handleStagePan = (e: Konva.KonvaEventObject<DragEvent>) => {
    if (e.target !== stageRef.current) return
    panTo({ x: e.target.x(), y: e.target.y() })
  }

  const handleActiveToolChange = (tool: AnnotationToolType | null) => {
    setActiveTool(tool)
    if (tool !== null) setIsRulerActive(false)
  }

  const handleSelectAnnotation = (id: string | null) =>
    setSelected(id ? { id, tool: activeTool } : null)

  const handleActiveMinutiaTypeChange = (minutiaType: MinutiaType) => {
    setActiveMinutiaType(minutiaType)
    if (!selectedLayer || !isMinutiaSettings(selectedLayer.settings)) return

    if (minutiaNumbers?.has(selectedLayer.id)) {
      toast.info(t('biometricImage.pairing.typeLockedByPair'))
      return
    }
    updateSelectedType.mutate({
      id: selectedLayer.id,
      input: { settings: { ...selectedLayer.settings, minutiaType } },
    })
  }

  const handleToggleRuler = () => {
    setIsRulerActive((prev) => !prev)
    setActiveTool(null)
  }

  useImperativeHandle(rulerHandleRef, () => ({
    arm: () => {
      setIsRulerActive(true)
      setActiveTool(null)
    },
  }))

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
  useImperativeHandle(exportHandleRef, () => ({
    exportToBlob: () => {
      const stage = stageRef.current
      if (!stage) return Promise.reject(new Error('No stage to export'))
      return stageToPngBlob(stage)
    },
  }))

  const handleSourceGeometryChange = (geometry: SourceGeometry) => {
    if (!imageId) return
    setMeasuredGeometry({ imageId, geometry })
    onSourceGeometryChange?.(geometry)
  }

  const handleDrawnFrameChange = (frame: DrawnFrame) => {
    if (!imageId || frame.width <= 0 || frame.height <= 0) return
    setDrawnFrame({ imageId, frame })
  }

  const handleLayoutChange = (layout: ImageLayout) => {
    if (!imageId) return
    setMeasuredLayout({ imageId, layout })
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
    <div ref={containerRef} className={cn('relative h-full w-full overflow-hidden', isPanMode && PAN_CURSOR_CLASS)}>
      {image?.url ? (
        <>
          <Stage
            ref={stageRef}
            width={size.width}
            height={size.height}
            scaleX={view.scale}
            scaleY={view.scale}
            x={view.x}
            y={view.y}
            onWheel={handleWheel}
            draggable={isPanMode}
            onDragMove={handleStagePan}
            onDragEnd={handleStagePan}
          >
            <Layer>
              <DraggableImage
                key={`${image.url}-${recenterSignal}`}
                url={image.url}
                thumbUrl={image.thumbUrl}
                sourceSize={servedFrame}
                filters={effectiveFilters}
                isDraggable={!isPanMode && activeTool === null && !isRulerActive}
                viewScale={view.scale}
                onLayoutChange={handleLayoutChange}
                onSourceGeometryChange={handleSourceGeometryChange}
                onDrawnFrameChange={handleDrawnFrameChange}
              />
            </Layer>
            <AnnotationLayer
              annotations={annotationLayers}
              layerCount={layers.length}
              activeTool={activeTool}
              activeColor={activeColor}
              activeMinutiaType={activeMinutiaType}
              fingerprintId={image.id}
              imageLayout={imageLayout}
              viewScale={view.scale}
              sourceWidth={sourceWidth}
              sourceHeight={sourceHeight}
              selectedId={selectedAnnotationId}
              onSelect={handleSelectAnnotation}
              hoveredLayerId={hoveredLayerId}
              isInteractive={!isPanMode}
              isPairingMode={isPairingMode}
              armedMinutiaId={armedMinutiaId}
              minutiaNumbers={minutiaNumbers}
              onMinutiaClick={onMinutiaClick}
              onPairMiss={onPairMiss}
              onRequestMinutiaDeletion={minutiaDeletionGuard.requestDeletion}
            />
            <CalibrationLayer
              key={`${image.id}-${calibrationResetSignal}`}
              isActive={isRulerActive}
              imageLayout={imageLayout}
              viewScale={view.scale}
              onSegmentComplete={handleSegmentComplete}
            />
          </Stage>
          {isGridVisible && <CanvasGridOverlay />}
          {/* La réglette convertit l'échelle de la vue en millimètres : tant que la vignette
              tient la place, ce repère n'est pas celui des pixels source et la longueur serait fausse. */}
          {sourceGeometry && (
            <ScaleBarOverlay
              resolutionDpi={freshImage?.resolutionDpi ?? null}
              viewScale={view.scale}
            />
          )}
          {expertise && (
            <div className="pointer-events-none absolute top-3 left-1/2 z-10 -translate-x-1/2">
              <Badge variant="secondary">{t('biometricImage.toolbar.expertCaseBanner')}</Badge>
            </div>
          )}
          {activeRulerSegment && (
            <CalibrationDialog
              from={activeRulerSegment.from}
              to={activeRulerSegment.to}
              isSaving={calibrate.isPending}
              onValidate={handleValidateCalibration}
              onCancel={handleCancelCalibration}
            />
          )}
          {isToolbarVisible && !isPairingMode && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10">
              <CanvasToolbar
                type={type}
                mode={mode}
                onModeChange={handleModeChange}
                filters={sliderValues}
                isExpertCase={expertise !== null}
                onFiltersChange={handleFilterChange}
                activeTool={activeTool}
                onActiveToolChange={handleActiveToolChange}
                activeColor={activeColor}
                onActiveColorChange={setActiveColor}
                activeMinutiaType={activeMinutiaType}
                onActiveMinutiaTypeChange={handleActiveMinutiaTypeChange}
                selectedMinutiaType={selectedMinutiaType}
                isRulerActive={isRulerActive}
                onToggleRuler={handleToggleRuler}
              />
            </div>
          )}
          {isLayersVisible && onCloseLayers && (
            <div className="absolute inset-y-0 right-0">
              <LayersPanelContainer
                fingerprintId={image.id}
                onClose={onCloseLayers}
                onHoverLayer={setHoveredLayerId}
                onRequestMinutiaDeletion={minutiaDeletionGuard.requestDeletion}
              />
            </div>
          )}
          <PairedMinutiaDeletionDialog
            pairNumber={minutiaDeletionGuard.pendingPairNumber}
            onConfirm={minutiaDeletionGuard.confirmDeletion}
            onCancel={minutiaDeletionGuard.cancelDeletion}
          />
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
