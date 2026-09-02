import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Circle, Line, Group, Text } from 'react-konva'
import type { Layer } from '@/features/biometric-image/types/layer'
import { minutiaTypeOf, type MinutiaSettings } from '@/features/biometric-image/lib/minutiae'
import { edgeAndTip, angleFromOffset } from './annotationUtils'

const HANDLE_RADIUS = 4
const HANDLE_STROKE_WIDTH = 1.5
const HIT_STROKE_WIDTH = 12
const LABEL_MIN_FONT_SIZE = 8
const LABEL_GAP = 4

type MinutiaeAnnotationProps = {
  layer: Layer
  isSelected: boolean
  strokeWidth: number
  viewScale: number
  mirrorScaleX: number
  rotationDeg: number
  onSelect: () => void
  onPersist: (settings: Record<string, unknown>) => void
}

export default function MinutiaeAnnotation({
  layer,
  isSelected,
  strokeWidth,
  viewScale,
  mirrorScaleX,
  rotationDeg,
  onSelect,
  onPersist,
}: MinutiaeAnnotationProps) {
  const { t } = useTranslation()
  const settings = layer.settings as MinutiaSettings
  const [liveAngleDeg, setLiveAngleDeg] = useState<number | null>(null)
  // Track handle drag with state so it's safe to read during render
  const [draggingHandle, setDraggingHandle] = useState(false)
  const isDraggingHandle = useRef(false)

  const hasDirection = settings.type === 'minutia'
  const angleDeg = liveAngleDeg ?? settings.angle ?? 0
  const radius = settings.radius
  const { edge, tip } = edgeAndTip(angleDeg, radius)
  const onScreen = (screenPixels: number) => screenPixels / viewScale

  const minutiaType = minutiaTypeOf(settings)
  const typeLabel = t(
    isSelected
      ? `biometricImage.minutia.types.${minutiaType}`
      : `biometricImage.minutia.shortTypes.${minutiaType}`,
  )
  const labelFontSize = Math.max(onScreen(LABEL_MIN_FONT_SIZE), radius * 1.3)

  return (
    <Group
      name="annotation"
      x={settings.x}
      y={settings.y}
      draggable={!draggingHandle}
      onClick={(e) => { e.cancelBubble = true; onSelect() }}
      onDragEnd={(e) => {
        if (isDraggingHandle.current) return
        onPersist({
          ...settings,
          x: Math.round(e.target.x()),
          y: Math.round(e.target.y()),
        })
      }}
    >
      <Circle
        radius={radius}
        stroke={settings.color}
        strokeWidth={strokeWidth}
        hitStrokeWidth={onScreen(HIT_STROKE_WIDTH)}
      />
      {hasDirection && (
        <Line
          points={[edge.x, edge.y, tip.x, tip.y]}
          stroke={settings.color}
          strokeWidth={strokeWidth}
          lineCap="round"
        />
      )}

      <Group scaleX={mirrorScaleX} rotation={-rotationDeg} listening={false}>
        <Text
          text={typeLabel}
          x={radius + onScreen(LABEL_GAP)}
          y={0}
          offsetY={labelFontSize / 2}
          fontSize={labelFontSize}
          fill={settings.color}
          listening={false}
        />
      </Group>

      {/* Rotation handle — visible when selected */}
      {hasDirection && isSelected && (
        <Circle
          x={tip.x}
          y={tip.y}
          radius={onScreen(HANDLE_RADIUS)}
          fill={settings.color}
          stroke="white"
          strokeWidth={onScreen(HANDLE_STROKE_WIDTH)}
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
            onPersist({ ...settings, angle: Math.round(newAngle) % 360 })
          }}
        />
      )}
    </Group>
  )
}
