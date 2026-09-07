import { useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  buildCurveLut,
  isIdentityCurve,
  sortedCurvePoints,
  CURVE_LEVELS,
  CURVE_MAX_LEVEL,
  DEFAULT_CURVE_POINTS,
  type CurvePoint,
} from '@/features/biometric-image/lib/toneCurve'

const GRAB_RADIUS = 14
const MIN_POINTS = 2
/** Même plafond que le réglage accepté par l'API : au-delà, le calque serait refusé. */
const MAX_POINTS = 16
const GRID_DIVISIONS = 4
/** Marge du repère : sans elle, les poignées des extrémités sont coupées par le bord. */
const VIEW_PADDING = 12
const VIEW_SIDE = CURVE_MAX_LEVEL + 2 * VIEW_PADDING

type CurveEditorProps = {
  points: CurvePoint[]
  histogram: number[] | null
  onChange: (points: CurvePoint[]) => void
}

function clampLevel(value: number): number {
  return Math.round(Math.min(CURVE_MAX_LEVEL, Math.max(0, value)))
}

/** Racine carrée des effectifs : sans elle, un pic de fond écrase tout le reste. */
function histogramPath(histogram: number[]): string {
  const tallest = Math.sqrt(Math.max(...histogram))
  if (tallest === 0) return ''
  const heights = histogram.map((count) => (Math.sqrt(count) / tallest) * CURVE_MAX_LEVEL)
  const steps = heights.map((height, level) => `L${level} ${CURVE_MAX_LEVEL - height}`).join('')
  return `M0 ${CURVE_MAX_LEVEL}${steps}L${CURVE_MAX_LEVEL} ${CURVE_MAX_LEVEL}Z`
}

export default function CurveEditor({ points, histogram, onChange }: CurveEditorProps) {
  const { t } = useTranslation()
  const svgRef = useRef<SVGSVGElement>(null)
  const [draft, setDraft] = useState<CurvePoint[] | null>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const displayed = draft ?? sortedCurvePoints(points.length >= MIN_POINTS ? points : DEFAULT_CURVE_POINTS)

  const curvePath = useMemo(() => {
    const lut = buildCurveLut(displayed)
    let path = `M0 ${CURVE_MAX_LEVEL - lut[0]}`
    for (let level = 1; level < CURVE_LEVELS; level += 1) {
      path += `L${level} ${CURVE_MAX_LEVEL - lut[level]}`
    }
    return path
  }, [displayed])

  const background = useMemo(() => (histogram ? histogramPath(histogram) : ''), [histogram])

  const levelsAt = (event: { clientX: number; clientY: number }): CurvePoint | null => {
    const box = svgRef.current?.getBoundingClientRect()
    if (!box || box.width === 0 || box.height === 0) return null
    return {
      x: clampLevel(((event.clientX - box.left) / box.width) * VIEW_SIDE - VIEW_PADDING),
      y: clampLevel(
        CURVE_MAX_LEVEL - (((event.clientY - box.top) / box.height) * VIEW_SIDE - VIEW_PADDING),
      ),
    }
  }

  const nearestTo = (target: CurvePoint) =>
    displayed.reduce<{ index: number; distance: number }>(
      (closest, point, index) => {
        const distance = Math.hypot(point.x - target.x, point.y - target.y)
        return distance < closest.distance ? { index, distance } : closest
      },
      { index: -1, distance: Number.POSITIVE_INFINITY },
    )

  const handlePointerDown = (event: React.PointerEvent<SVGSVGElement>) => {
    const target = levelsAt(event)
    if (!target) return

    const nearest = nearestTo(target)
    let next = displayed
    let index = nearest.index
    if (nearest.distance > GRAB_RADIUS) {
      if (displayed.length >= MAX_POINTS) return
      next = sortedCurvePoints([...displayed, target])
      index = next.findIndex((point) => point.x === target.x)
    }

    event.currentTarget.setPointerCapture(event.pointerId)
    setDraft(next)
    setDraggedIndex(index)
  }

  const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    if (draggedIndex === null) return
    const target = levelsAt(event)
    if (!target) return

    // L'abscisse reste enfermée entre ses voisines : deux points sur le même
    // niveau d'entrée ne définissent plus une fonction.
    const lowerBound = draggedIndex === 0 ? 0 : displayed[draggedIndex - 1].x + 1
    const upperBound =
      draggedIndex === displayed.length - 1 ? CURVE_MAX_LEVEL : displayed[draggedIndex + 1].x - 1

    const moved = displayed.map((point, index) =>
      index === draggedIndex
        ? { x: Math.min(upperBound, Math.max(lowerBound, target.x)), y: target.y }
        : point,
    )
    setDraft(moved)
  }

  const handlePointerUp = () => {
    setDraggedIndex(null)
    if (!draft) return
    onChange(draft)
    setDraft(null)
  }

  // La capture du pointeur pose le double-clic sur le repère entier, jamais sur
  // la poignée : c'est ici qu'on retrouve le point visé.
  const handleDoubleClick = (event: React.MouseEvent<SVGSVGElement>) => {
    const target = levelsAt(event)
    if (!target || displayed.length <= MIN_POINTS) return
    const nearest = nearestTo(target)
    if (nearest.index < 0 || nearest.distance > GRAB_RADIUS) return
    setDraft(null)
    setDraggedIndex(null)
    onChange(displayed.filter((_, position) => position !== nearest.index))
  }

  const draggedPoint = draggedIndex === null ? null : displayed[draggedIndex]

  return (
    <div className="flex flex-col gap-2">
      <svg
        ref={svgRef}
        viewBox={`${-VIEW_PADDING} ${-VIEW_PADDING} ${VIEW_SIDE} ${VIEW_SIDE}`}
        className="aspect-square w-full touch-none rounded-sm bg-blue-dark-2"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onDoubleClick={handleDoubleClick}
      >
        {background && <path d={background} className="fill-white/15" />}
        {Array.from({ length: GRID_DIVISIONS - 1 }, (_, division) => {
          const offset = ((division + 1) * CURVE_MAX_LEVEL) / GRID_DIVISIONS
          return (
            <g key={offset} className="stroke-white/15" strokeWidth={1}>
              <line x1={offset} y1={0} x2={offset} y2={CURVE_MAX_LEVEL} />
              <line x1={0} y1={offset} x2={CURVE_MAX_LEVEL} y2={offset} />
            </g>
          )
        })}
        <line
          x1={0}
          y1={CURVE_MAX_LEVEL}
          x2={CURVE_MAX_LEVEL}
          y2={0}
          className="stroke-white/25"
          strokeWidth={1}
          strokeDasharray="6 6"
        />
        <path d={curvePath} fill="none" className="stroke-blue-light-3" strokeWidth={3} />
        {displayed.map((point, index) => (
          <circle
            key={`${point.x}-${index}`}
            cx={point.x}
            cy={CURVE_MAX_LEVEL - point.y}
            r={7}
            className={index === draggedIndex ? 'fill-white' : 'fill-blue-light-2'}
          />
        ))}
      </svg>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs tabular-nums text-white/60">
          {draggedPoint
            ? t('biometricImage.toolbar.curve.readout', {
                input: draggedPoint.x,
                output: draggedPoint.y,
              })
            : t('biometricImage.toolbar.curve.hint')}
        </span>
        <button
          type="button"
          className="shrink-0 text-xs text-white/60 underline underline-offset-2 hover:text-white disabled:opacity-40 disabled:no-underline"
          disabled={isIdentityCurve(points)}
          onClick={() => onChange(DEFAULT_CURVE_POINTS)}
        >
          {t('biometricImage.toolbar.curve.reset')}
        </button>
      </div>
    </div>
  )
}
