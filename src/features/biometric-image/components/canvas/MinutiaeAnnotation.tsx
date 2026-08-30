import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Circle, Line, Group, Text } from 'react-konva'
import type { Layer } from '@/features/biometric-image/types/layer'
import { toScreenLength, toSourceLength } from '@/features/biometric-image/lib/displayScale'
import { DEFAULT_MINUTIA_TYPE, type MinutiaType } from '@/features/biometric-image/lib/minutiae'
import { edgeAndTip, angleFromOffset } from './annotationUtils'

const HANDLE_RADIUS = 4
const STROKE_WIDTH = 1.5

type MinutiaeAnnotationProps = {
  layer: Layer
  isSelected: boolean
  strokeWidth: number
  fitScale: number
  mirrorScaleX: number
  rotationDeg: number
  onSelect: () => void
  onPersist: (settings: Record<string, unknown>) => void
}

export default function MinutiaeAnnotation({
  layer,
  isSelected,
  strokeWidth,
  fitScale,
  mirrorScaleX,
  rotationDeg,
  onSelect,
  onPersist,
}: MinutiaeAnnotationProps) {
  const { t } = useTranslation()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const s = layer.settings as any
  const [liveAngleDeg, setLiveAngleDeg] = useState<number | null>(null)
  // Track handle drag with state so it's safe to read during render
  const [draggingHandle, setDraggingHandle] = useState(false)
  const isDraggingHandle = useRef(false)

  const angleDeg = liveAngleDeg ?? (s.angle ?? 0)
  const radius = toScreenLength(s.radius as number, fitScale)
  const { edge, tip } = edgeAndTip(angleDeg, radius)

  const minutiaType = (s.minutiaType as MinutiaType) ?? DEFAULT_MINUTIA_TYPE
  const typeLabel = t(
    isSelected
      ? `biometricImage.minutia.types.${minutiaType}`
      : `biometricImage.minutia.shortTypes.${minutiaType}`,
  )
  const labelFontSize = Math.max(8, radius * 1.3)

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

      <Group scaleX={mirrorScaleX} rotation={-rotationDeg} listening={false}>
        <Text
          text={typeLabel}
          x={radius + 4}
          y={0}
          offsetY={labelFontSize / 2}
          fontSize={labelFontSize}
          fill={s.color}
          listening={false}
        />
      </Group>

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
            onPersist({ ...s, angle: Math.round(newAngle) % 360 })
          }}
        />
      )}
    </Group>
  )
}
