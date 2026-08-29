const CM_PER_INCH = 2.54

/** Points par pouce (unité persistée) → points par centimètre (unité affichée dans ce dialogue). */
export function pxPerCmFromResolutionDpi(resolutionDpi: number): number {
  return resolutionDpi / CM_PER_INCH
}

export function resolutionDpiFromPxPerCm(pxPerCm: number): number {
  return pxPerCm * CM_PER_INCH
}

/** Taille physique (cm) d'une dimension en pixels de l'image source, à la résolution donnée. */
export function physicalSizeCm(sourcePx: number, pxPerCm: number): number | null {
  if (!Number.isFinite(pxPerCm) || pxPerCm <= 0) return null
  return sourcePx / pxPerCm
}

/** Résolution (px/cm) nécessaire pour qu'une dimension source occupe la taille physique donnée. */
export function pxPerCmFromPhysicalSizeCm(sourcePx: number, sizeCm: number): number | null {
  if (!Number.isFinite(sizeCm) || sizeCm <= 0) return null
  return sourcePx / sizeCm
}
