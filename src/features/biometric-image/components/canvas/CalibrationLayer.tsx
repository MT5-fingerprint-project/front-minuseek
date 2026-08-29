import { useEffect, useRef, useState } from 'react'
import { Layer as KonvaLayer, Circle, Line, Group } from 'react-konva'
import type Konva from 'konva'
import type { ImageLayout } from '@/features/biometric-image/components/canvas/DraggableImage'
import type { CalibrationPoint } from '@/features/biometric-image/lib/calibration'

const POINT_RADIUS = 4
const GUIDE_REACH = 100_000 // grandes lignes de guidage : couvrent tout le viewport visible
const RULER_COLOR = '#EF4444'

type Segment = { from: CalibrationPoint; to: CalibrationPoint | null }

type CalibrationLayerProps = {
  isActive: boolean
  imageLayout: ImageLayout | null
  onSegmentComplete: (from: CalibrationPoint, to: CalibrationPoint) => void
}

function CrosshairGuides({ point }: { point: CalibrationPoint }) {
  return (
    <>
      <Line
        points={[point.x, point.y - GUIDE_REACH, point.x, point.y + GUIDE_REACH]}
        stroke={RULER_COLOR}
        strokeWidth={1}
        listening={false}
      />
      <Line
        points={[point.x - GUIDE_REACH, point.y, point.x + GUIDE_REACH, point.y]}
        stroke={RULER_COLOR}
        strokeWidth={1}
        listening={false}
      />
    </>
  )
}

export default function CalibrationLayer({ isActive, imageLayout, onSegmentComplete }: CalibrationLayerProps) {
  const layerRef = useRef<Konva.Layer>(null)
  // Group whose transform mirrors the image: the segment lives in the image's local frame,
  // exactly like AnnotationLayer, so it stays put across zoom/pan/mirror/rotation.
  const groupRef = useRef<Konva.Group>(null)
  const [segment, setSegment] = useState<Segment | null>(null)

  useEffect(() => {
    const stage = layerRef.current?.getStage()
    if (!stage || !isActive) return

    const getPos = () => groupRef.current?.getRelativePointerPosition() ?? null

    const onDown = () => {
      const pos = getPos()
      if (!pos) return
      setSegment((current) => {
        if (!current || current.to !== null) {
          // Pas de segment, ou un segment déjà complet : on repart d'un nouveau point de départ.
          return { from: pos, to: null }
        }
        onSegmentComplete(current.from, pos)
        return { from: current.from, to: pos }
      })
    }

    stage.on('mousedown.calib touchstart.calib', onDown)
    return () => { stage.off('.calib') }
  // onSegmentComplete identity is stable from the parent (useCallback-free but re-bound below is harmless)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive])

  return (
    <KonvaLayer ref={layerRef} listening={isActive}>
      {imageLayout && (
        <Group ref={groupRef} {...imageLayout}>
          {isActive && segment && (
            <>
              <CrosshairGuides point={segment.from} />
              {segment.to && <CrosshairGuides point={segment.to} />}
              {segment.to && (
                <Line
                  points={[segment.from.x, segment.from.y, segment.to.x, segment.to.y]}
                  stroke={RULER_COLOR}
                  strokeWidth={2}
                  listening={false}
                />
              )}
              <Circle x={segment.from.x} y={segment.from.y} radius={POINT_RADIUS} fill={RULER_COLOR} listening={false} />
              {segment.to && (
                <Circle x={segment.to.x} y={segment.to.y} radius={POINT_RADIUS} fill={RULER_COLOR} listening={false} />
              )}
            </>
          )}
        </Group>
      )}
    </KonvaLayer>
  )
}
