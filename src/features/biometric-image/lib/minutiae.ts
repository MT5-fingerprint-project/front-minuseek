import type { Layer } from '@/features/biometric-image/types/layer'

export const REQUIRED_MINUTIAE = 12

const MINUTIA_SETTINGS_TYPES = ['circle', 'minutia']

export function countMinutiae(layers: Layer[] | undefined): number {
  if (!layers) return 0
  return layers.filter(
    (layer) => layer.type === 'ANNOTATION' && isMinutiaSettings(layer.settings)
  ).length
}

export const MINUTIA_TYPES = [
  'RIDGE_ENDING',
  'BIFURCATION',
  'TRIFURCATION',
  'ISLAND',
  'ENCLOSURE',
  'UNDETERMINED',
] as const

export type MinutiaType = (typeof MINUTIA_TYPES)[number]

export const DEFAULT_MINUTIA_TYPE: MinutiaType = 'UNDETERMINED'

export type MinutiaSettings = {
  type: 'circle' | 'minutia'
  x: number
  y: number
  radius: number
  color: string
  angle?: number
  minutiaType?: MinutiaType
  frame: 'source-pixels'
  schemaVersion: 1
}

export function isMinutiaSettings(
  settings: Record<string, unknown>
): settings is MinutiaSettings {
  return typeof settings.type === 'string' && MINUTIA_SETTINGS_TYPES.includes(settings.type)
}


export function minutiaTypeOf(settings: MinutiaSettings): MinutiaType {
  return settings.minutiaType ?? DEFAULT_MINUTIA_TYPE
}
