import { useRef, useState } from 'react'
import { Circle, Line, Group } from 'react-konva'
import type { Layer } from '@/features/biometric-image/types/layer'
import { toScreenLength, toSourceLength } from '@/features/biometric-image/lib/displayScale'
import { edgeAndTip, angleFromOffset } from './annotationUtils'

const HANDLE_RADIUS = 4
const STROKE_WIDTH = 1.5

type MinutiaeAnnotationProps = {
  layer: Layer
  isSelected: boolean
  strokeWidth: number
  /** Facteur de réduction affichage : la position/le rayon sont stockés en pixels source. */
  fitScale: number
  onSelect: () => void
  onPersist: (settings: Record<string, unknown>) => void
}

export default function MinutiaeAnnotation({
  layer,
  isSelected,
  strokeWidth,
  fitScale,
  onSelect,
  onPersist,
}: MinutiaeAnnotationProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const s = layer.settings as any
  const [liveAngleDeg, setLiveAngleDeg] = useState<number | null>(null)
  // Track handle drag with state so it's safe to read during render
  const [draggingHandle, setDraggingHandle] = useState(false)
  const isDraggingHandle = useRef(false)

  const angleDeg = liveAngleDeg ?? (s.angle ?? 0)
  const radius = toScreenLength(s.radius as number, fitScale)
  const { edge, tip } = edgeAndTip(angleDeg, radius)

  return (
    <Group
      name="annotation"
      x={toScreenLength(s.x, fitScale)}
      y={toScreenLength(s.y, fitScale)}
      draggable={!draggingHandle}
      onClick={(e) => { e.cancelBubble = true; onSelect() }}
      onDragEnd={(e) => {
        if (isDraggingHandle.current) return
        onPersist({
          ...s,
          x: Math.round(toSourceLength(e.target.x(), fitScale)),
          y: Math.round(toSourceLength(e.target.y(), fitScale)),
        })
      }}
    >
      <Circle
        radius={radius}
        stroke={s.color}
        strokeWidth={strokeWidth}
        hitStrokeWidth={12}
      />
      <Line
        points={[edge.x, edge.y, tip.x, tip.y]}
        stroke={s.color}
        strokeWidth={strokeWidth}
        lineCap="round"
      />

      {/* Rotation handle — visible when selected */}
      {isSelected && (
        <Circle
          x={tip.x}
          y={tip.y}
          radius={HANDLE_RADIUS}
          fill={s.color}
          stroke="white"
          strokeWidth={STROKE_WIDTH}
          draggable
          onDragStart={() => {
            isDraggingHandle.current = true
            setDraggingHandle(true)
          }}
          onDragMove={(e) => {
            setLiveAngleDeg(angleFromOffset(e.target.x(), e.target.y()))
          }}
          onDragEnd={(e) => {
            e.cancelBubble = true
            const newAngle = angleFromOffset(e.target.x(), e.target.y())
            e.target.position(edgeAndTip(newAngle, radius).tip)
            isDraggingHandle.current = false
            setDraggingHandle(false)
            setLiveAngleDeg(null)
            // Arrondir peut produire 360 (ex. 359.6) : le contrat borne l'angle à 0–359.
            onPersist({ ...s, angle: Math.round(newAngle) % 360 })
          }}
        />
      )}
    </Group>
  )
}
