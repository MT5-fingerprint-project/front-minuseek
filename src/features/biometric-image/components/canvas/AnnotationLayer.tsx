import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Layer as KonvaLayer, Circle, Arrow, Line, Group } from 'react-konva'
import type Konva from 'konva'
import { useCreateLayer, useUpdateLayer } from '@/features/biometric-image/hooks/useLayers'
import type { Layer } from '@/features/biometric-image/types/layer'
import type { ImageLayout } from '@/features/biometric-image/components/canvas/DraggableImage'
import type { AnnotationToolType } from '@/features/biometric-image/components/toolbar/canvasFilters'

const RADIUS = 6
const STROKE_WIDTH = 2

type Draft =
  | { type: 'circleArrow'; x: number; y: number; arrowEndX: number; arrowEndY: number }
  | { type: 'pencil'; points: number[] }
  | null

type AnnotationLayerProps = {
  annotations: Layer[]
  activeTool: AnnotationToolType | null
  activeColor: string
  fingerprintId: string
  imageLayout: ImageLayout | null
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

export default function AnnotationLayer({ annotations, activeTool, activeColor, fingerprintId, imageLayout }: AnnotationLayerProps) {
  const { t } = useTranslation()
  const layerRef = useRef<Konva.Layer>(null)
  // Group whose transform mirrors the image: annotation coords live in the image's local frame.
  const groupRef = useRef<Konva.Group>(null)
  const createLayer = useCreateLayer(fingerprintId)
  const updateLayer = useUpdateLayer(fingerprintId)

  const [draft, setDraft] = useState<Draft>(null)
  const draftRef = useRef<Draft>(null)
  const drawingRef = useRef(false)

  const setDraftBoth = (d: Draft) => {
    draftRef.current = d
    setDraft(d)
  }

  useEffect(() => {
    const stage = layerRef.current?.getStage()
    if (!stage || !activeTool) return

    // Pointer position in the image's local coordinate frame (handles zoom/pan/offset/mirror/rotation).
    const getPos = () => groupRef.current?.getRelativePointerPosition() ?? null

    const onDown = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      if (isAnnotationTarget(e.target)) return // let an existing shape be dragged instead
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
          zIndex: annotations.length,
          settings: { type: 'circle', x: pos.x, y: pos.y, radius: RADIUS, color: activeColor },
        })
      } else if (activeTool === 'circleArrow') {
        setDraftBoth({ type: 'circleArrow', x: pos.x, y: pos.y, arrowEndX: pos.x, arrowEndY: pos.y })
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
      if (d.type === 'circleArrow') {
        setDraftBoth({ ...d, arrowEndX: pos.x, arrowEndY: pos.y })
      } else if (d.type === 'pencil') {
        const n = d.points.length
        if (n >= 2 && d.points[n - 2] === pos.x && d.points[n - 1] === pos.y) return // drop duplicates
        setDraftBoth({ ...d, points: [...d.points, pos.x, pos.y] })
      }
    }

    const onUp = () => {
      if (!drawingRef.current) return
      drawingRef.current = false
      const d = draftRef.current
      if (d?.type === 'circleArrow') {
        createLayer.mutate({
          id: crypto.randomUUID(),
          fingerprintId,
          name: t('biometricImage.toolbar.tools.pointArrow'),
          type: 'ANNOTATION',
          zIndex: annotations.length,
          settings: { type: 'circleArrow', x: d.x, y: d.y, radius: RADIUS, color: activeColor, arrowEndX: d.arrowEndX, arrowEndY: d.arrowEndY },
        })
      } else if (d?.type === 'pencil' && d.points.length >= 4) {
        createLayer.mutate({
          id: crypto.randomUUID(),
          fingerprintId,
          name: t('biometricImage.toolbar.tools.pencil'),
          type: 'ANNOTATION',
          zIndex: annotations.length,
          settings: { type: 'pencil', points: d.points, color: activeColor, strokeWidth: STROKE_WIDTH },
        })
      }
      setDraftBoth(null)
    }

    stage.on('mousedown.annot touchstart.annot', onDown)
    stage.on('mousemove.annot touchmove.annot', onMove)
    stage.on('mouseup.annot touchend.annot', onUp)
    return () => {
      stage.off('.annot')
    }
  // createLayer/updateLayer mutate refs are stable; re-bind when tool/color/zIndex base change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTool, activeColor, fingerprintId, annotations.length])

  const renderShape = (layer: Layer) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = layer.settings as any
    const persistPosition = (settings: Record<string, unknown>) =>
      updateLayer.mutate({ id: layer.id, input: { settings } })

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
            strokeWidth={1.5}
            hitStrokeWidth={12}
            draggable
            onDragEnd={(e) => persistPosition({ ...s, x: e.target.x(), y: e.target.y() })}
          />
        )
      case 'circleArrow':
        return (
          <Group
            key={layer.id}
            name="annotation"
            draggable
            onDragEnd={(e) => {
              const g = e.target
              const dx = g.x()
              const dy = g.y()
              g.position({ x: 0, y: 0 })
              persistPosition({
                ...s,
                x: s.x + dx,
                y: s.y + dy,
                arrowEndX: s.arrowEndX + dx,
                arrowEndY: s.arrowEndY + dy,
              })
            }}
          >
            <Arrow
              points={[s.x, s.y, s.arrowEndX, s.arrowEndY]}
              stroke={s.color}
              fill={s.color}
              strokeWidth={STROKE_WIDTH}
              pointerLength={8}
              pointerWidth={8}
            />
            <Circle x={s.x} y={s.y} radius={s.radius ?? RADIUS} stroke={s.color} strokeWidth={1.5} hitStrokeWidth={12} />
          </Group>
        )
      case 'pencil':
        return (
          <Line
            key={layer.id}
            name="annotation"
            points={s.points}
            stroke={s.color}
            strokeWidth={s.strokeWidth ?? STROKE_WIDTH}
            tension={0.5}
            lineCap="round"
            lineJoin="round"
          />
        )
      default:
        return null
    }
  }

  return (
    <KonvaLayer ref={layerRef}>
      {imageLayout && (
        <Group ref={groupRef} {...imageLayout}>
          {annotations.filter((a) => a.isVisible).map(renderShape)}

          {draft?.type === 'circleArrow' && (
            <Group>
              <Arrow
                points={[draft.x, draft.y, draft.arrowEndX, draft.arrowEndY]}
                stroke={activeColor}
                fill={activeColor}
                strokeWidth={STROKE_WIDTH}
                pointerLength={8}
                pointerWidth={8}
              />
              <Circle x={draft.x} y={draft.y} radius={RADIUS} stroke={activeColor} strokeWidth={1.5} />
            </Group>
          )}

          {draft?.type === 'pencil' && (
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
