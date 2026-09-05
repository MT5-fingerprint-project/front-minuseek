import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Circle, Line, Group, Text } from 'react-konva'
import Konva from 'konva'
import type { Layer } from '@/features/biometric-image/types/layer'
import { minutiaTypeOf, type MinutiaSettings } from '@/features/biometric-image/lib/minutiae'
import { edgeAndTip, angleFromOffset } from './annotationUtils'

/** Pulse d'échelle joué par Konva.Tween — tourne hors du cycle de rendu React. */
const ENTER_TWEEN_DURATION_S = 0.35
const ENTER_TWEEN_PEAK_SCALE = 1.4

const HANDLE_RADIUS = 4
const HANDLE_STROKE_WIDTH = 1.5
const HIT_STROKE_WIDTH = 12
const LABEL_MIN_FONT_SIZE = 8
const LABEL_GAP = 4
const BADGE_RADIUS_MIN = 7

type MinutiaeAnnotationProps = {
  layer: Layer
  isSelected: boolean
  strokeWidth: number
  viewScale: number
  mirrorScaleX: number
  rotationDeg: number
  onSelect: () => void
  onPersist: (settings: Record<string, unknown>) => void
  /** Mode démonstration (L7-2b) : appariement des minuties, le clic n'édite plus. */
  isPairingMode?: boolean
  pairNumber?: number | null
  isArmed?: boolean
  onPairClick?: () => void
  /** Mode lecture des concordances (L7-3) : plus d'édition, minuties non révélées estompées. */
  isConcordanceMode?: boolean
  isRevealed?: boolean
  isEntering?: boolean
  /** Remonte le nœud Konva de la minutie pour le calcul de sa position écran. */
  onNodeRef?: (node: Konva.Group | null) => void
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
  isPairingMode = false,
  pairNumber = null,
  isArmed = false,
  onPairClick,
  isConcordanceMode = false,
  isRevealed = false,
  isEntering = false,
  onNodeRef,
}: MinutiaeAnnotationProps) {
  const { t } = useTranslation()
  const settings = layer.settings as MinutiaSettings
  const [liveAngleDeg, setLiveAngleDeg] = useState<number | null>(null)
  // Track handle drag with state so it's safe to read during render
  const [draggingHandle, setDraggingHandle] = useState(false)
  const isDraggingHandle = useRef(false)
  const groupRef = useRef<Konva.Group>(null)

  // Pulse d'échelle à l'apparition d'une paire : Konva.Tween tourne dans la
  // boucle interne de Konva, sans passer par un re-render React par frame.
  useEffect(() => {
    if (!isEntering) return
    const node = groupRef.current
    if (!node) return
    node.scale({ x: 1, y: 1 })
    const tween = new Konva.Tween({
      node,
      duration: ENTER_TWEEN_DURATION_S,
      scaleX: ENTER_TWEEN_PEAK_SCALE,
      scaleY: ENTER_TWEEN_PEAK_SCALE,
      easing: Konva.Easings.EaseOut,
      onFinish: () => {
        tween.reverse()
      },
    })
    tween.play()
    return () => {
      tween.destroy()
      node.scale({ x: 1, y: 1 })
    }
  }, [isEntering])

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
  const badgeRadius = Math.max(onScreen(BADGE_RADIUS_MIN), radius * 0.8)

  const isDimmed = isConcordanceMode && !isRevealed && !isEntering

  return (
    <Group
      ref={(node) => {
        groupRef.current = node
        onNodeRef?.(node)
      }}
      name="annotation"
      x={settings.x}
      y={settings.y}
      opacity={isDimmed ? 0.15 : 1}
      draggable={!draggingHandle && !isPairingMode && !isConcordanceMode}
      onClick={(e) => {
        e.cancelBubble = true
        if (isConcordanceMode) return
        if (isPairingMode) onPairClick?.()
        else onSelect()
      }}
      onDragEnd={(e) => {
        if (isDraggingHandle.current) return
        onPersist({
          ...settings,
          x: Math.round(e.target.x()),
          y: Math.round(e.target.y()),
        })
      }}
    >
      {isArmed && (
        <Circle radius={radius + 6} stroke="#D85703" strokeWidth={3} dash={[5, 3]} listening={false} />
      )}
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

      {!isPairingMode && !isConcordanceMode && (
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
      )}

      {pairNumber !== null && (
        <Group scaleX={mirrorScaleX} rotation={-rotationDeg} listening={false}>
          <Circle x={radius + onScreen(LABEL_GAP) + badgeRadius} y={0} radius={badgeRadius} fill={settings.color} />
          <Text
            text={String(pairNumber)}
            x={radius + onScreen(LABEL_GAP)}
            y={-badgeRadius}
            width={badgeRadius * 2}
            height={badgeRadius * 2}
            align="center"
            verticalAlign="middle"
            fontSize={badgeRadius * 1.1}
            fontStyle="bold"
            fill="white"
          />
        </Group>
      )}

      {/* Rotation handle — visible when selected */}
      {hasDirection && isSelected && !isPairingMode && !isConcordanceMode && (
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
