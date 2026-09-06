import type { MinutiaPair } from '@/features/investigation-case/types/minutiaPair'
import {
  LINK_COLOR,
  LINK_LABEL_FONT_SIZE,
  LINK_LABEL_HALO_COLOR,
  LINK_LABEL_HALO_WIDTH,
  LINK_LABEL_OFFSET_Y,
  LINK_STROKE_WIDTH,
} from '@/features/investigation-case/lib/concordanceLinkStyle'
import { VIDEO_FOOTER_HEIGHT, VIDEO_HEADER_HEIGHT } from '@/features/investigation-case/lib/exportConcordanceVideo'

export type ScreenPosition = { x: number; y: number }
export type FrameCapture = { canvas: HTMLCanvasElement; rect: DOMRect }
export type CompositeRect = { x: number; y: number; width: number; height: number }

const BAND_BACKGROUND = '#111827'
const BAND_TEXT_COLOR = '#ffffff'
const HEADER_FONT_SIZE = 15
const CAPTION_FONT_SIZE = 14
const CAPTION_PADDING_X = 10

/** Rectangle englobant les deux fenêtres du comparateur, en coordonnées écran. */
export function boundingRectOf(a: DOMRect, b: DOMRect): CompositeRect {
  const x = Math.min(a.left, b.left)
  const y = Math.min(a.top, b.top)
  const right = Math.max(a.right, b.right)
  const bottom = Math.max(a.bottom, b.bottom)
  return { x, y, width: right - x, height: bottom - y }
}


function even(value: number): number {
  const rounded = Math.max(2, Math.round(value))
  return rounded - (rounded % 2)
}


export function compositeCanvasSize(bounds: CompositeRect, pixelRatio: number): { width: number; height: number } {
  const bands = Math.round(VIDEO_HEADER_HEIGHT * pixelRatio) + Math.round(VIDEO_FOOTER_HEIGHT * pixelRatio)
  return {
    width: even(bounds.width * pixelRatio),
    height: even(bounds.height * pixelRatio + bands),
  }
}

type FramePlacement = { x: number; y: number; width: number; height: number }
type Placements = { headerHeight: number; footerHeight: number; trace: FramePlacement; reference: FramePlacement }

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
    footerHeight: VIDEO_FOOTER_HEIGHT * pixelRatio,
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

function fitted(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (maxWidth <= 0 || ctx.measureText(text).width <= maxWidth) return text
  let kept = text
  while (kept.length > 1 && ctx.measureText(`${kept}…`).width > maxWidth) {
    kept = kept.slice(0, -1)
  }
  return `${kept}…`
}

function drawHeader(
  ctx: CanvasRenderingContext2D,
  params: { pixelRatio: number; headerHeight: number; counterLabel: string }
): void {
  const { pixelRatio, headerHeight, counterLabel } = params
  ctx.fillStyle = BAND_BACKGROUND
  ctx.fillRect(0, 0, ctx.canvas.width, headerHeight)

  ctx.font = `600 ${HEADER_FONT_SIZE * pixelRatio}px system-ui, sans-serif`
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'
  ctx.fillStyle = BAND_TEXT_COLOR
  ctx.fillText(counterLabel, ctx.canvas.width / 2, headerHeight / 2)
}

function drawFooter(
  ctx: CanvasRenderingContext2D,
  params: {
    pixelRatio: number
    footerHeight: number
    trace: FramePlacement
    reference: FramePlacement
    traceCaption: string
    referenceCaption: string
  }
): void {
  const { pixelRatio, footerHeight, trace, reference, traceCaption, referenceCaption } = params
  const top = ctx.canvas.height - footerHeight
  ctx.fillStyle = BAND_BACKGROUND
  ctx.fillRect(0, top, ctx.canvas.width, footerHeight)

  ctx.font = `600 ${CAPTION_FONT_SIZE * pixelRatio}px system-ui, sans-serif`
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'
  ctx.fillStyle = BAND_TEXT_COLOR
  const midY = top + footerHeight / 2
  const padding = CAPTION_PADDING_X * pixelRatio

  for (const [placement, caption] of [
    [trace, traceCaption],
    [reference, referenceCaption],
  ] as const) {
    if (caption.length === 0) continue
    ctx.fillText(fitted(ctx, caption, placement.width - padding * 2), placement.x + placement.width / 2, midY)
  }
}

type DrawCompositeFrameParams = {
  origin: { x: number; y: number }
  pixelRatio: number
  traceFrame: FrameCapture
  referenceFrame: FrameCapture
  traceCaption: string
  referenceCaption: string
  counterLabel: string
  activeTypeLabel: string
  pairs: MinutiaPair[]
  activePairId: string | null
  getTracePosition: (minutiaId: string) => ScreenPosition | null
  getReferencePosition: (minutiaId: string) => ScreenPosition | null
}

export function drawCompositeFrame(ctx: CanvasRenderingContext2D, params: DrawCompositeFrameParams): void {
  const {
    origin,
    pixelRatio,
    traceFrame,
    referenceFrame,
    traceCaption,
    referenceCaption,
    counterLabel,
    activeTypeLabel,
    pairs,
    activePairId,
    getTracePosition,
    getReferencePosition,
  } = params
  const { headerHeight, footerHeight, trace, reference } = finalPlacements(
    origin,
    pixelRatio,
    traceFrame,
    referenceFrame
  )

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

  ctx.drawImage(traceFrame.canvas, trace.x, trace.y, trace.width, trace.height)
  ctx.drawImage(referenceFrame.canvas, reference.x, reference.y, reference.width, reference.height)

  drawHeader(ctx, { pixelRatio, headerHeight, counterLabel })
  drawFooter(ctx, { pixelRatio, footerHeight, trace, reference, traceCaption, referenceCaption })
  const shown = pairs.find((pair) => pair.id === activePairId)
  if (!shown) return
  const from = getTracePosition(shown.traceMinutiaLayerId)
  const to = getReferencePosition(shown.referenceMinutiaLayerId)
  if (!from || !to) return
  const fromX = (from.x - origin.x) * pixelRatio
  const fromY = (from.y - origin.y) * pixelRatio + headerHeight
  const toX = (to.x - origin.x) * pixelRatio
  const toY = (to.y - origin.y) * pixelRatio + headerHeight
  ctx.beginPath()
  ctx.moveTo(fromX, fromY)
  ctx.lineTo(toX, toY)
  ctx.strokeStyle = LINK_COLOR
  ctx.lineWidth = LINK_STROKE_WIDTH * pixelRatio
  ctx.lineCap = 'round'
  ctx.stroke()

  if (!activeTypeLabel) return
  ctx.font = `600 ${LINK_LABEL_FONT_SIZE * pixelRatio}px system-ui, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.lineJoin = 'round'
  const labelX = (fromX + toX) / 2
  const labelY = (fromY + toY) / 2 - LINK_LABEL_OFFSET_Y * pixelRatio
  ctx.strokeStyle = LINK_LABEL_HALO_COLOR
  ctx.lineWidth = LINK_LABEL_HALO_WIDTH * pixelRatio
  ctx.strokeText(activeTypeLabel, labelX, labelY)
  ctx.fillStyle = LINK_COLOR
  ctx.fillText(activeTypeLabel, labelX, labelY)
}
