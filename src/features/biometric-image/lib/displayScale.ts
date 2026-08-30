export const MAX_DISPLAY_SIZE = 400 // plafond d'affichage : seul endroit où cette valeur existe
// Le navigateur ne donne pas la densité physique de l'écran : hypothèse unique,
// un pour un n'est nominal que sur un écran à cette densité (annoncée à l'opérateur).
export const DISPLAY_REFERENCE_DPI = 96

export type DisplayScalePreset = '1:1' | '5:1' | 'free'

const MAGNIFICATION_BY_PRESET: Record<Exclude<DisplayScalePreset, 'free'>, number> = {
  '1:1': 1,
  '5:1': 5,
}

export function magnificationOfPreset(preset: Exclude<DisplayScalePreset, 'free'>): number {
  return MAGNIFICATION_BY_PRESET[preset]
}

/** Réduit une image à `MAX_DISPLAY_SIZE` : 1 si elle est déjà plus petite. */
export function fitAdjustmentFactor(sourceWidth: number, sourceHeight: number): number {
  const maxSide = Math.max(sourceWidth, sourceHeight)
  if (!Number.isFinite(maxSide) || maxSide <= 0) return 1
  return Math.min(1, MAX_DISPLAY_SIZE / maxSide)
}

/** Échelle de vue à appliquer pour obtenir le grossissement demandé, sur une image calibrée. */
export function viewScaleForMagnification(
  magnification: number,
  resolutionDpi: number,
  fitScale: number,
): number {
  return (magnification * DISPLAY_REFERENCE_DPI) / (resolutionDpi * fitScale)
}

/** Grossissement obtenu par rapport à l'objet réel pour une échelle de vue donnée. */
export function magnificationForViewScale(
  viewScale: number,
  resolutionDpi: number,
  fitScale: number,
): number {
  return (viewScale * fitScale * resolutionDpi) / DISPLAY_REFERENCE_DPI
}

export function toSourceLength(displayLength: number, fitScale: number): number {
  if (!Number.isFinite(fitScale) || fitScale <= 0) return displayLength
  return displayLength / fitScale
}

export function toScreenLength(sourceLength: number, fitScale: number): number {
  if (!Number.isFinite(fitScale) || fitScale <= 0) return sourceLength
  return sourceLength * fitScale
}
