import type { Layer } from '@/features/biometric-image/types/layer'

export const REQUIRED_MINUTIAE = 12

const MINUTIA_SETTINGS_TYPES = ['circle', 'circleArrow', 'minutiae']

export function countMinutiae(layers: Layer[] | undefined): number {
  if (!layers) return 0
  return layers.filter(
    (layer) =>
      layer.type === 'ANNOTATION' &&
      typeof layer.settings.type === 'string' &&
      MINUTIA_SETTINGS_TYPES.includes(layer.settings.type)
  ).length
}
