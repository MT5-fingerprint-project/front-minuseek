export const MAX_DISPLAY_SIZE = 400 // plafond d'affichage : seul endroit où cette valeur existe

/** Réduit une image à `MAX_DISPLAY_SIZE` : 1 si elle est déjà plus petite. */
export function fitAdjustmentFactor(sourceWidth: number, sourceHeight: number): number {
  const maxSide = Math.max(sourceWidth, sourceHeight)
  if (!Number.isFinite(maxSide) || maxSide <= 0) return 1
  return Math.min(1, MAX_DISPLAY_SIZE / maxSide)
}

export function toSourceLength(displayLength: number, fitScale: number): number {
  if (!Number.isFinite(fitScale) || fitScale <= 0) return displayLength
  return displayLength / fitScale
}

export function toScreenLength(sourceLength: number, fitScale: number): number {
  if (!Number.isFinite(fitScale) || fitScale <= 0) return sourceLength
  return sourceLength * fitScale
}
