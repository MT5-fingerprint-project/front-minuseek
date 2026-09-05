import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Layer as KonvaLayer, Line, Group } from 'react-konva'
import type Konva from 'konva'
import { useCreateLayer, useUpdateLayer, useDeleteLayer } from '@/features/biometric-image/hooks/useLayers'
import type { RequestMinutiaDeletion } from '@/features/biometric-image/hooks/useMinutiaDeletionGuard'
import type { Layer } from '@/features/biometric-image/types/layer'
import type { ImageLayout } from '@/features/biometric-image/components/canvas/DraggableImage'
import type { AnnotationToolType } from '@/features/biometric-image/components/toolbar/canvasFilters'
import type { MinutiaType } from '@/features/biometric-image/lib/minutiae'
import MinutiaeAnnotation from './MinutiaeAnnotation'


const MARKER_RADIUS_RATIO = 0.015
const MARKER_RADIUS_MIN = 6
const STROKE_RATIO = 0.00375
const STROKE_MIN = 1.5

const SELECTED_EMPHASIS = 1
const HOVERED_EMPHASIS = 1.5

const ANNOTATION_FRAME = 'source-pixels'
const ANNOTATION_SCHEMA_VERSION = 1

type Draft = { type: 'pencil'; points: number[] }

type AnnotationLayerProps = {
  annotations: Layer[]
  /** Nombre total de calques (tous types) : base de zIndex pour éviter les collisions. */
  layerCount: number
  activeTool: AnnotationToolType | null
  activeColor: string
  activeMinutiaType: MinutiaType
  fingerprintId: string
  imageLayout: ImageLayout | null
  viewScale: number
  sourceWidth: number
  sourceHeight: number
  selectedId: string | null
  onSelect: (id: string | null) => void
  hoveredLayerId?: string | null
  isInteractive?: boolean
  /** Mode démonstration (L7-2b) : appariement des minuties entre trace et empreinte. */
  isPairingMode?: boolean
  armedMinutiaId?: string | null
  minutiaNumbers?: Map<string, number>
  onMinutiaClick?: (minutiaId: string) => void
  /** Clic dans le vide en mode démonstration (aucune minutie sous le pointeur). */
  onPairMiss?: () => void
  /** Passe la suppression par la confirmation du canevas quand la minutie est appariée. */
  onRequestMinutiaDeletion?: RequestMinutiaDeletion
  /** Mode lecture des concordances (L7-3) : ne montre que les minuties appariées. */
  isConcordanceMode?: boolean
  revealedMinutiaIds?: Set<string>
  activeMinutiaId?: string | null
  registerMinutiaNode?: (id: string, node: Konva.Group | null) => void
}

/** Walk up the Konva tree to find whether the clicked node belongs to an existing annotation. */
function isAnnotationTarget(node: Konva.Node | null): boolean {
  let current: Konva.Node | null = node
  while (current) {
    if (current.name() === 'annotation') return true
    current = current.getParent()
  }
  return false
}

export default function AnnotationLayer({
  annotations,
  layerCount,
  activeTool,
  activeColor,
  activeMinutiaType,
  fingerprintId,
  imageLayout,
  viewScale,
  sourceWidth,
  sourceHeight,
  selectedId,
  onSelect,
  hoveredLayerId,
  isInteractive = true,
  isPairingMode = false,
  armedMinutiaId = null,
  minutiaNumbers,
  onMinutiaClick,
  onPairMiss,
  onRequestMinutiaDeletion,
  isConcordanceMode = false,
  revealedMinutiaIds,
  activeMinutiaId = null,
  registerMinutiaNode,
}: AnnotationLayerProps) {
  const { t } = useTranslation()
  const layerRef = useRef<Konva.Layer>(null)
  // Group whose transform mirrors the image: annotation coords live in the image's source frame.
  const groupRef = useRef<Konva.Group>(null)
  const createLayer = useCreateLayer()
  const updateLayer = useUpdateLayer()
  const deleteLayer = useDeleteLayer()

  const [draft, setDraft] = useState<Draft | null>(null)
  const draftRef = useRef<Draft | null>(null)
  const drawingRef = useRef(false)

  const select = onSelect
  const longestSide = Math.max(sourceWidth, sourceHeight)
  const sourceRadius = Math.max(MARKER_RADIUS_MIN, Math.round(longestSide * MARKER_RADIUS_RATIO))
  const sourceStrokeWidth = Math.max(STROKE_MIN, longestSide * STROKE_RATIO)
  // Ce qui appartient à l'outil garde une taille constante à l'écran, donc se divise par le zoom.
  const onScreen = (screenPixels: number) => screenPixels / viewScale

  const setDraftBoth = (d: Draft | null) => {
    draftRef.current = d
    setDraft(d)
  }

  // Konva vide le canvas de hit-test du calque quand il devient sourd, et ne le redessine
  // pas quand il redevient à l'écoute : sans ce redessin, plus rien n'y est cliquable après
  // un passage en mode déplacement.
  useEffect(() => {
    if (isInteractive) layerRef.current?.drawHit()
  }, [isInteractive])

  useEffect(() => {
    if (!selectedId) return
    const removeAnnotation = () => {
      deleteLayer.mutate(selectedId)
      select(null)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Delete' && e.key !== 'Backspace') return
      if (onRequestMinutiaDeletion) onRequestMinutiaDeletion(selectedId, removeAnnotation)
      else removeAnnotation()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, onRequestMinutiaDeletion])

  // Mode démonstration : signale un clic qui ne touche aucune minutie, sinon un
  // clic à côté ne fait rigoureusement rien et donne l'impression que ça ne marche pas.
  useEffect(() => {
    const stage = layerRef.current?.getStage()
    if (!stage || !isPairingMode) return

    const onMiss = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      if (isAnnotationTarget(e.target)) return
      onPairMiss?.()
    }
    stage.on('mousedown.pairmiss touchstart.pairmiss', onMiss)
    return () => { stage.off('.pairmiss') }
  }, [isPairingMode, onPairMiss])

  useEffect(() => {
    const stage = layerRef.current?.getStage()
    if (!stage || !activeTool || isPairingMode) return

    // Pointer position in source pixels (handles zoom/pan/offset/mirror/rotation).
    const getPos = () => groupRef.current?.getRelativePointerPosition() ?? null
    const getSourcePos = () => {
      const pos = getPos()
      if (!pos) return null
      return { x: Math.round(pos.x), y: Math.round(pos.y) }
    }

    const onDown = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      if (isAnnotationTarget(e.target)) return // let an existing shape be dragged instead
      select(null)
      const pos = getPos()
      const sourcePos = getSourcePos()
      if (!pos || !sourcePos) return
      drawingRef.current = true

      if (activeTool === 'circle') {
        drawingRef.current = false
        createLayer.mutate({
          id: crypto.randomUUID(),
          fingerprintId,
          name: t('biometricImage.toolbar.tools.point'),
          type: 'ANNOTATION',
          zIndex: layerCount,
          settings: {
            type: 'circle',
            x: sourcePos.x,
            y: sourcePos.y,
            radius: sourceRadius,
            color: activeColor,
            minutiaType: activeMinutiaType,
            frame: ANNOTATION_FRAME,
            schemaVersion: ANNOTATION_SCHEMA_VERSION,
          },
        })
      } else if (activeTool === 'circleArrow') {
        drawingRef.current = false
        createLayer.mutate({
          id: crypto.randomUUID(),
          fingerprintId,
          name: t('biometricImage.toolbar.tools.pointArrow'),
          type: 'ANNOTATION',
          zIndex: layerCount,
          settings: {
            type: 'minutia',
            x: sourcePos.x,
            y: sourcePos.y,
            angle: 0,
            radius: sourceRadius,
            color: activeColor,
            minutiaType: activeMinutiaType,
            frame: ANNOTATION_FRAME,
            schemaVersion: ANNOTATION_SCHEMA_VERSION,
          },
        })
      } else if (activeTool === 'pencil') {
        setDraftBoth({ type: 'pencil', points: [pos.x, pos.y] })
      }
    }

    const onMove = () => {
      if (!drawingRef.current) return
      const pos = getPos()
      if (!pos) return
      const d = draftRef.current
      if (!d) return
      const n = d.points.length
      if (n >= 2 && d.points[n - 2] === pos.x && d.points[n - 1] === pos.y) return
      setDraftBoth({ ...d, points: [...d.points, pos.x, pos.y] })
    }

    const onUp = () => {
      if (!drawingRef.current) return
      drawingRef.current = false
      const d = draftRef.current
      if (d?.type === 'pencil' && d.points.length >= 4) {
        createLayer.mutate({
          id: crypto.randomUUID(),
          fingerprintId,
          name: t('biometricImage.toolbar.tools.pencil'),
          type: 'ANNOTATION',
          zIndex: layerCount,
          settings: {
            type: 'pencil',
            points: d.points.map((v) => Math.round(v)),
            color: activeColor,
            strokeWidth: sourceStrokeWidth,
            frame: ANNOTATION_FRAME,
            schemaVersion: ANNOTATION_SCHEMA_VERSION,
          },
        })
      }
      setDraftBoth(null)
    }

    stage.on('mousedown.annot touchstart.annot', onDown)
    stage.on('mousemove.annot touchmove.annot', onMove)
    stage.on('mouseup.annot touchend.annot', onUp)
    return () => { stage.off('.annot') }
  // createLayer/updateLayer mutate refs are stable; re-bind when tool/color/zIndex base change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTool, activeColor, activeMinutiaType, fingerprintId, layerCount, sourceRadius, sourceStrokeWidth, isPairingMode])

  const renderShape = (layer: Layer) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = layer.settings as any
    const persistPosition = (settings: Record<string, unknown>) =>
      updateLayer.mutate({ id: layer.id, input: { settings } })
    const isSelected = layer.id === selectedId
    const isHighlighted = layer.id === hoveredLayerId
    const emphasis = onScreen((isSelected ? SELECTED_EMPHASIS : 0) + (isHighlighted ? HOVERED_EMPHASIS : 0))

    switch (s.type) {
      case 'circle':
      case 'minutia':
        return (
          <MinutiaeAnnotation
            key={layer.id}
            layer={layer}
            isSelected={isSelected}
            strokeWidth={sourceStrokeWidth + emphasis}
            viewScale={viewScale}
            mirrorScaleX={imageLayout?.scaleX ?? 1}
            rotationDeg={imageLayout?.rotation ?? 0}
            onSelect={() => select(isSelected ? null : layer.id)}
            onPersist={persistPosition}
            isPairingMode={isPairingMode}
            pairNumber={minutiaNumbers?.get(layer.id) ?? null}
            isArmed={layer.id === armedMinutiaId}
            onPairClick={() => onMinutiaClick?.(layer.id)}
            isConcordanceMode={isConcordanceMode}
            isRevealed={revealedMinutiaIds?.has(layer.id) ?? false}
            isEntering={layer.id === activeMinutiaId}
            onNodeRef={(node) => registerMinutiaNode?.(layer.id, node)}
          />
        )

      case 'pencil':
        return (
          <Line
            key={layer.id}
            name="annotation"
            points={s.points as number[]}
            stroke={s.color}
            strokeWidth={(s.strokeWidth ?? sourceStrokeWidth) + emphasis}
            tension={0.5}
            lineCap="round"
            lineJoin="round"
            onClick={(e) => { e.cancelBubble = true; select(isSelected ? null : layer.id) }}
          />
        )
      default:
        return null
    }
  }

  return (
    <KonvaLayer ref={layerRef} listening={isInteractive}>
      {imageLayout && (
        <Group ref={groupRef} {...imageLayout} onClick={() => select(null)}>
          {annotations
            .filter((a) => a.isVisible && (!isConcordanceMode || minutiaNumbers?.has(a.id)))
            .map(renderShape)}

          {draft && (
            <Line
              points={draft.points}
              stroke={activeColor}
              strokeWidth={sourceStrokeWidth}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
            />
          )}
        </Group>
      )}
    </KonvaLayer>
  )
}
