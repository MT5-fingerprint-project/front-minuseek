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

/** Taille du canvas composite : le rectangle englobant à `pixelRatio`, plus les
 * deux bandeaux (eux aussi mis à l'échelle, pour rester proportionnés). */
export function compositeCanvasSize(bounds: CompositeRect, pixelRatio: number): { width: number; height: number } {
  const bands = Math.round(VIDEO_HEADER_HEIGHT * pixelRatio) + Math.round(VIDEO_FOOTER_HEIGHT * pixelRatio)
  return {
    width: Math.max(1, Math.round(bounds.width * pixelRatio)),
    height: Math.max(1, Math.round(bounds.height * pixelRatio) + bands),
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

/** Coupe une désignation trop longue pour la largeur de sa fenêtre : mieux vaut
 * une fin tronquée qu'un texte qui déborde sur celle d'à côté. */
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

/** Chaque désignation est centrée sur SA fenêtre, pas sur le composite : les
 * deux panneaux sont redimensionnables et n'ont presque jamais la même largeur. */
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
  /** Même ratio que celui utilisé pour rastériser `traceFrame`/`referenceFrame`
   * (`stage.toCanvas({ pixelRatio })`) : les deux doivent avancer ensemble,
   * sinon les images nettes se retrouveraient réduites dans un cadre flou. */
  pixelRatio: number
  traceFrame: FrameCapture
  referenceFrame: FrameCapture
  /** Désignation de chaque pièce, écrite sous la sienne et figée pour toute la
   * durée de l'enregistrement. */
  traceCaption: string
  referenceCaption: string
  counterLabel: string
  /** Type de la minutie de la paire montrée, écrit au milieu du trait. */
  activeTypeLabel: string
  pairs: MinutiaPair[]
  activePairId: string | null
  getTracePosition: (minutiaId: string) => ScreenPosition | null
  getReferencePosition: (minutiaId: string) => ScreenPosition | null
}

/** Dessine, dans le repère local du canvas composite, les deux bandeaux, les
 * deux stages aplatis, puis le trait de la seule paire montrée — même style que
 * `ConcordanceLinkOverlay` (SVG à l'écran), pour que la vidéo enregistrée reste
 * fidèle à ce qui est affiché. */
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

  // Un seul trait à l'écran : celui de la paire commentée. Les repères posés
  // restent, eux, cumulatifs — c'est ce qui construit la démonstration.
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

  // Même halo que l'overlay SVG à l'écran (`paint-order: stroke`) : le contour
  // blanc est tracé avant le remplissage, sinon il rongerait les lettres.
  if (activeTypeLabel.length === 0) return
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
