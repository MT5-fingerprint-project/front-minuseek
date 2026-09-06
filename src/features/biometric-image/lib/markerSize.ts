const MARKER_RADIUS_MIN = 4
const DEFAULT_MARKER_RADIUS_MIN = 6
const DEFAULT_MARKER_SIZE_RATIO = 0.015
const MILLIMETERS_PER_INCH = 25.4

export type MarkerSizeLabel = 'xSmall' | 'small' | 'medium' | 'large' | 'xLarge'

/**
 * Un cran est une fraction du plus grand côté de l'image, et non une longueur de peau :
 * `resolutionDpi` est nul sur la quasi-totalité des pièces, le millimètre ne peut donc
 * pas servir d'unité de réglage.
 */
export const MARKER_SIZE_STEPS: { ratio: number; label: MarkerSizeLabel }[] = [
  { ratio: 0.004, label: 'xSmall' },
  { ratio: 0.007, label: 'small' },
  { ratio: 0.01, label: 'medium' },
  { ratio: 0.015, label: 'large' },
  { ratio: 0.022, label: 'xLarge' },
]

export function markRadiusOf(ratio: number, longestSide: number): number {
  return Math.max(MARKER_RADIUS_MIN, Math.round(ratio * longestSide))
}

/** Le rayon d'avant le réglage, qu'une pièce jamais réglée continue de recevoir. */
export function defaultMarkRadiusOf(longestSide: number): number {
  return Math.max(DEFAULT_MARKER_RADIUS_MIN, Math.round(DEFAULT_MARKER_SIZE_RATIO * longestSide))
}

/** Épaisseur du trait du repère, distincte de celle du crayon qui vit dans les settings du tracé. */
export function markerStrokeWidthOf(markRadius: number): number {
  return Math.max(1, markRadius / 4)
}

/** Diamètre du repère sur la peau — n'a de sens que sur une pièce calibrée. */
export function markerDiameterMm(markRadius: number, resolutionDpi: number): number {
  return (2 * markRadius * MILLIMETERS_PER_INCH) / resolutionDpi
}
