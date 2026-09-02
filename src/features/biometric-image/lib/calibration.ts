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
 * mesuré en pixels source, connaissant la distance réelle qu'il représente.
 */
export function resolutionFromSegment(
  from: CalibrationPoint,
  to: CalibrationPoint,
  realDistanceMm: number,
): CalibrationOutcome {
  if (!Number.isFinite(realDistanceMm) || realDistanceMm <= 0) return { status: 'incomplete' }

  const dx = to.x - from.x
  const dy = to.y - from.y
  const sourcePixels = Math.sqrt(dx * dx + dy * dy)
  if (sourcePixels === 0) return { status: 'incomplete' }

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
  viewScale: number,
): number {
  return (resolutionDpi / MILLIMETERS_PER_INCH) * millimeters * viewScale
}
