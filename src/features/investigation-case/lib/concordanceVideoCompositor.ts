import type { MinutiaPair } from '@/features/investigation-case/types/minutiaPair'
import { LINK_COLOR, LINK_STROKE_WIDTH, LINK_STROKE_WIDTH_ACTIVE } from '@/features/investigation-case/lib/concordanceLinkStyle'
import { VIDEO_HEADER_HEIGHT } from '@/features/investigation-case/lib/exportConcordanceVideo'

export type ScreenPosition = { x: number; y: number }
export type FrameCapture = { canvas: HTMLCanvasElement; rect: DOMRect }
export type CompositeRect = { x: number; y: number; width: number; height: number }

const HEADER_BACKGROUND = '#111827'
const HEADER_TEXT_COLOR = '#ffffff'
const HEADER_FONT_SIZE = 15
const HEADER_PADDING_X = 10

/** Rectangle englobant les deux fenêtres du comparateur, en coordonnées écran. */
export function boundingRectOf(a: DOMRect, b: DOMRect): CompositeRect {
  const x = Math.min(a.left, b.left)
  const y = Math.min(a.top, b.top)
  const right = Math.max(a.right, b.right)
  const bottom = Math.max(a.bottom, b.bottom)
  return { x, y, width: right - x, height: bottom - y }
}

/** Taille du canvas composite : le rectangle englobant à `pixelRatio`, plus le
 * bandeau d'en-tête (lui aussi mis à l'échelle, pour rester proportionné). */
export function compositeCanvasSize(bounds: CompositeRect, pixelRatio: number): { width: number; height: number } {
  return {
    width: Math.max(1, Math.round(bounds.width * pixelRatio)),
    height: Math.max(1, Math.round(bounds.height * pixelRatio) + Math.round(VIDEO_HEADER_HEIGHT * pixelRatio)),
  }
}

type FramePlacement = { x: number; y: number; width: number; height: number }
type Placements = { headerHeight: number; trace: FramePlacement; reference: FramePlacement }

/** Position finale (côte à côte) de chaque image dans le repère du composite. */
function finalPlacements(
  origin: { x: number; y: number },
  pixelRatio: number,
  traceFrame: FrameCapture,
  referenceFrame: FrameCapture
): Placements {
  const headerHeight = VIDEO_HEADER_HEIGHT * pixelRatio
  return {
    headerHeight,
    trace: {
      x: (traceFrame.rect.left - origin.x) * pixelRatio,
      y: (traceFrame.rect.top - origin.y) * pixelRatio + headerHeight,
      width: traceFrame.canvas.width,
      height: traceFrame.canvas.height,
    },
    reference: {
      x: (referenceFrame.rect.left - origin.x) * pixelRatio,
      y: (referenceFrame.rect.top - origin.y) * pixelRatio + headerHeight,
      width: referenceFrame.canvas.width,
      height: referenceFrame.canvas.height,
    },
  }
}

function drawHeader(
  ctx: CanvasRenderingContext2D,
  params: { pixelRatio: number; headerHeight: number; traceLabel: string; referenceLabel: string; counterLabel: string; traceX: number; referenceRight: number }
): void {
  const { pixelRatio, headerHeight, traceLabel, referenceLabel, counterLabel, traceX, referenceRight } = params
  ctx.fillStyle = HEADER_BACKGROUND
  ctx.fillRect(0, 0, ctx.canvas.width, headerHeight)

  ctx.font = `600 ${HEADER_FONT_SIZE * pixelRatio}px system-ui, sans-serif`
  ctx.textBaseline = 'middle'
  ctx.fillStyle = HEADER_TEXT_COLOR
  const headerMidY = headerHeight / 2
  const paddingX = HEADER_PADDING_X * pixelRatio

  ctx.textAlign = 'left'
  ctx.fillText(traceLabel, traceX + paddingX, headerMidY)
  ctx.textAlign = 'right'
  ctx.fillText(referenceLabel, referenceRight - paddingX, headerMidY)
  ctx.textAlign = 'center'
  ctx.fillText(counterLabel, ctx.canvas.width / 2, headerMidY)
}

type DrawCompositeFrameParams = {
  origin: { x: number; y: number }
  /** Même ratio que celui utilisé pour rastériser `traceFrame`/`referenceFrame`
   * (`stage.toCanvas({ pixelRatio })`) : les deux doivent avancer ensemble,
   * sinon les images nettes se retrouveraient réduites dans un cadre flou. */
  pixelRatio: number
  traceFrame: FrameCapture
  referenceFrame: FrameCapture
  /** Bandeau au-dessus de chaque image : quelle fenêtre est laquelle, et le
   * compteur de paires — sinon perdus dans la vidéo (elle ne capture que le
   * canvas Konva de chaque fenêtre, pas le titre ni les contrôles autour). */
  traceLabel: string
  referenceLabel: string
  counterLabel: string
  pairs: MinutiaPair[]
  activePairId: string | null
  getTracePosition: (minutiaId: string) => ScreenPosition | null
  getReferencePosition: (minutiaId: string) => ScreenPosition | null
}

/** Dessine, dans le repère local du canvas composite, le bandeau d'en-tête,
 * les deux stages aplatis, puis les traits de liaison — même style que
 * `ConcordanceLinkOverlay` (SVG à l'écran), pour que la vidéo enregistrée
 * reste fidèle à ce qui est affiché. */
export function drawCompositeFrame(ctx: CanvasRenderingContext2D, params: DrawCompositeFrameParams): void {
  const { origin, pixelRatio, traceFrame, referenceFrame, traceLabel, referenceLabel, counterLabel, pairs, activePairId, getTracePosition, getReferencePosition } = params
  const { headerHeight, trace, reference } = finalPlacements(origin, pixelRatio, traceFrame, referenceFrame)

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

  ctx.drawImage(traceFrame.canvas, trace.x, trace.y, trace.width, trace.height)
  ctx.drawImage(referenceFrame.canvas, reference.x, reference.y, reference.width, reference.height)

  drawHeader(ctx, {
    pixelRatio,
    headerHeight,
    traceLabel,
    referenceLabel,
    counterLabel,
    traceX: trace.x,
    referenceRight: reference.x + reference.width,
  })

  for (const pair of pairs) {
    const from = getTracePosition(pair.traceMinutiaLayerId)
    const to = getReferencePosition(pair.referenceMinutiaLayerId)
    if (!from || !to) continue
    ctx.beginPath()
    ctx.moveTo((from.x - origin.x) * pixelRatio, (from.y - origin.y) * pixelRatio + headerHeight)
    ctx.lineTo((to.x - origin.x) * pixelRatio, (to.y - origin.y) * pixelRatio + headerHeight)
    ctx.strokeStyle = LINK_COLOR
    ctx.lineWidth = (pair.id === activePairId ? LINK_STROKE_WIDTH_ACTIVE : LINK_STROKE_WIDTH) * pixelRatio
    ctx.lineCap = 'round'
    ctx.stroke()
  }
}
