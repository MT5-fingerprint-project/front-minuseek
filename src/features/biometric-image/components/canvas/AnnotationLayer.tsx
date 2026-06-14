import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Layer as KonvaLayer, Circle, Line, Group } from 'react-konva'
import type Konva from 'konva'
import { useCreateLayer, useUpdateLayer, useDeleteLayer } from '@/features/biometric-image/hooks/useLayers'
import type { Layer } from '@/features/biometric-image/types/layer'
import type { ImageLayout } from '@/features/biometric-image/components/canvas/DraggableImage'
import type { AnnotationToolType } from '@/features/biometric-image/components/toolbar/canvasFilters'
import MinutiaeAnnotation from './MinutiaeAnnotation'

const RADIUS = 6
const STROKE_WIDTH = 1.5

type Draft = { type: 'pencil'; points: number[] }

type AnnotationLayerProps = {
  annotations: Layer[]
  /** Nombre total de calques (tous types) : base de zIndex pour éviter les collisions. */
  layerCount: number
  activeTool: AnnotationToolType | null
  activeColor: string
  fingerprintId: string
  imageLayout: ImageLayout | null
  hoveredLayerId?: string | null
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
  fingerprintId,
  imageLayout,
  hoveredLayerId,
}: AnnotationLayerProps) {
  const { t } = useTranslation()
  const layerRef = useRef<Konva.Layer>(null)
  // Group whose transform mirrors the image: annotation coords live in the image's local frame.
  const groupRef = useRef<Konva.Group>(null)
  const createLayer = useCreateLayer(fingerprintId)
  const updateLayer = useUpdateLayer(fingerprintId)
  const deleteLayer = useDeleteLayer(fingerprintId)

  const [draft, setDraft] = useState<Draft | null>(null)
  const draftRef = useRef<Draft | null>(null)
  const drawingRef = useRef(false)

  // Store which tool was active when a shape was selected — if the tool changes,
  // the selection is stale and we treat it as null without needing an effect.
  const [selected, setSelected] = useState<{ id: string; tool: AnnotationToolType | null } | null>(null)
  const selectedId = selected?.tool === activeTool ? selected.id : null

  const select = (id: string | null) =>
    setSelected(id ? { id, tool: activeTool } : null)

  const setDraftBoth = (d: Draft | null) => {
    draftRef.current = d
    setDraft(d)
  }

  useEffect(() => {
    if (!selectedId) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteLayer.mutate(selectedId)
        select(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId])

  useEffect(() => {
    const stage = layerRef.current?.getStage()
    if (!stage || !activeTool) return

    // Pointer position in the image's local coordinate frame (handles zoom/pan/offset/mirror/rotation).
    const getPos = () => groupRef.current?.getRelativePointerPosition() ?? null

    const onDown = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      if (isAnnotationTarget(e.target)) return // let an existing shape be dragged instead
      select(null)
      const pos = getPos()
      if (!pos) return
      drawingRef.current = true

      if (activeTool === 'circle') {
        drawingRef.current = false
        createLayer.mutate({
          id: crypto.randomUUID(),
          fingerprintId,
          name: t('biometricImage.toolbar.tools.point'),
          type: 'ANNOTATION',
          zIndex: layerCount,
          settings: { type: 'circle', x: pos.x, y: pos.y, radius: RADIUS, color: activeColor },
        })
      } else if (activeTool === 'circleArrow') {
        drawingRef.current = false
        createLayer.mutate({
          id: crypto.randomUUID(),
          fingerprintId,
          name: t('biometricImage.toolbar.tools.pointArrow'),
          type: 'ANNOTATION',
          zIndex: layerCount,
          settings: { type: 'minutiae', x: pos.x, y: pos.y, angleDeg: 0, radius: RADIUS, color: activeColor },
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
          settings: { type: 'pencil', points: d.points, color: activeColor, strokeWidth: STROKE_WIDTH },
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
  }, [activeTool, activeColor, fingerprintId, layerCount])

  const renderShape = (layer: Layer) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = layer.settings as any
    const persistPosition = (settings: Record<string, unknown>) =>
      updateLayer.mutate({ id: layer.id, input: { settings } })
    const isSelected = layer.id === selectedId
    const isHighlighted = layer.id === hoveredLayerId
    const sw = (base: number) => base + (isSelected ? 1 : 0) + (isHighlighted ? 1.5 : 0)

    switch (s.type) {
      case 'circle':
        return (
          <Circle
            key={layer.id}
            name="annotation"
            x={s.x}
            y={s.y}
            radius={s.radius ?? RADIUS}
            stroke={s.color}
            strokeWidth={sw(STROKE_WIDTH)}
            hitStrokeWidth={12}
            draggable
            onClick={(e) => { e.cancelBubble = true; select(isSelected ? null : layer.id) }}
            onDragEnd={(e) => persistPosition({ ...s, x: e.target.x(), y: e.target.y() })}
          />
        )

      case 'minutiae':
        return (
          <MinutiaeAnnotation
            key={layer.id}
            layer={layer}
            isSelected={isSelected}
            strokeWidth={sw(STROKE_WIDTH)}
            onSelect={() => select(isSelected ? null : layer.id)}
            onPersist={persistPosition}
          />
        )

      case 'pencil':
        return (
          <Line
            key={layer.id}
            name="annotation"
            points={s.points}
            stroke={s.color}
            strokeWidth={sw(s.strokeWidth ?? STROKE_WIDTH)}
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
    <KonvaLayer ref={layerRef}>
      {imageLayout && (
        <Group ref={groupRef} {...imageLayout} onClick={() => select(null)}>
          {annotations.filter((a) => a.isVisible).map(renderShape)}

          {draft && (
            <Line
              points={draft.points}
              stroke={activeColor}
              strokeWidth={STROKE_WIDTH}
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
