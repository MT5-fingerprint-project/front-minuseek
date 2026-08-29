export const MIN_RESOLUTION_DPI = 50
export const MAX_RESOLUTION_DPI = 10_000
const MILLIMETERS_PER_INCH = 25.4

export type CalibrationPoint = { x: number; y: number }

export type CalibrationOutcome =
  | { status: 'incomplete' }
  | { status: 'out-of-range'; resolutionDpi: number }
  | { status: 'valid'; resolutionDpi: number }

/**
 * Déduit la résolution (points par pouce de l'image source) d'un segment
 * mesuré dans le repère local de l'image affichée, connaissant la distance
 * réelle qu'il représente.
 */
export function resolutionFromSegment(
  from: CalibrationPoint,
  to: CalibrationPoint,
  realDistanceMm: number,
  fitScale: number,
): CalibrationOutcome {
  if (!Number.isFinite(realDistanceMm) || realDistanceMm <= 0) return { status: 'incomplete' }
  if (!Number.isFinite(fitScale) || fitScale <= 0) return { status: 'incomplete' }

  const dx = to.x - from.x
  const dy = to.y - from.y
  const localDistance = Math.sqrt(dx * dx + dy * dy)
  if (localDistance === 0) return { status: 'incomplete' }

  const sourcePixels = localDistance / fitScale
  const resolutionDpi = Math.round((sourcePixels * MILLIMETERS_PER_INCH) / realDistanceMm)

  if (resolutionDpi < MIN_RESOLUTION_DPI || resolutionDpi > MAX_RESOLUTION_DPI) {
    return { status: 'out-of-range', resolutionDpi }
  }
  return { status: 'valid', resolutionDpi }
}

/** Longueur à l'écran (pixels de scène) d'une distance réelle, pour la barre d'échelle. */
export function screenLengthOfMillimeters(
  millimeters: number,
  resolutionDpi: number,
  fitScale: number,
  viewScale: number,
): number {
  return (resolutionDpi / MILLIMETERS_PER_INCH) * millimeters * fitScale * viewScale
}
