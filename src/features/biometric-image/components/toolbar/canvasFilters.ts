import Konva from 'konva'
import type { FilterFunction } from 'konva/lib/Node'
import type { IconName } from '@/features/shared/icons'

// ─── Types ────────────────────────────────────────────────────────────────────

export type CanvasFilters = Record<string, number>

export type FilterConfig = {
  filterKey: string
  inputType?: 'slider' | 'toggle' | 'cycle'
  min?: number
  max?: number
  unit?: string
  origin?: 'left' | 'center'
  cycleValues?: number[]
}

export type KonvaFilterDef =
  | { type: 'filter'; filter: FilterFunction; prop: string; scale: number }
  | { type: 'transform'; prop: string; transform: (v: number) => number }

// ─── Defaults ─────────────────────────────────────────────────────────────────

export const DEFAULT_FILTERS: CanvasFilters = {}

export const FILTER_DEFAULTS = { min: -100, max: 100, unit: '%', origin: 'center' } as const

// ─── Per-filter metadata ───────────────────────────────────────────────────────
// Single source of truth: label key, icon, and Konva binding for each filterKey

export const FILTER_META: Record<string, { labelKey: string; icon: IconName; konva: KonvaFilterDef }> = {
  brightness: {
    labelKey: 'biometricImage.toolbar.tools.luminosity',
    icon: 'luminosity',
    konva: { type: 'filter', filter: Konva.Filters.Brighten, prop: 'brightness', scale: 1 / 100 },
  },
  contrast: {
    labelKey: 'biometricImage.toolbar.tools.contrast',
    icon: 'contrast',
    konva: { type: 'filter', filter: Konva.Filters.Contrast, prop: 'contrast', scale: 1 },
  },
  saturation: {
    labelKey: 'biometricImage.toolbar.tools.saturation',
    icon: 'invertColors',
    konva: { type: 'filter', filter: Konva.Filters.HSL, prop: 'saturation', scale: 1 / 100 },
  },
  inversion: {
    labelKey: 'biometricImage.toolbar.tools.invertColors',
    icon: 'compare',
    konva: { type: 'filter', filter: Konva.Filters.Invert, prop: '', scale: 0 },
  },
  mirror: {
    labelKey: 'biometricImage.toolbar.tools.mirror',
    icon: 'mirror',
    konva: { type: 'transform', prop: 'scaleX', transform: (v) => (v === 1 ? -1 : 1) },
  },
  rotation: {
    labelKey: 'biometricImage.toolbar.tools.rotation',
    icon: 'rotate',
    konva: { type: 'transform', prop: 'rotation', transform: (v) => v },
  },
}

// ─── Toolbar tool lists ────────────────────────────────────────────────────────

export const IMAGE_TOOLS = [
  { icon: 'mirror'       as IconName, label: 'biometricImage.toolbar.tools.mirror',       filter: { filterKey: 'mirror',    inputType: 'toggle' } satisfies FilterConfig },
  { icon: 'rotate'       as IconName, label: 'biometricImage.toolbar.tools.rotation',     filter: { filterKey: 'rotation',  min: -180, max: 180, unit: '°', origin: 'center' } satisfies FilterConfig },
  { icon: 'compare'      as IconName, label: 'biometricImage.toolbar.tools.invertColors', filter: { filterKey: 'inversion', inputType: 'toggle' } satisfies FilterConfig },
  { icon: 'luminosity'   as IconName, label: 'biometricImage.toolbar.tools.luminosity',   filter: { filterKey: 'brightness' } satisfies FilterConfig },
  { icon: 'contrast'     as IconName, label: 'biometricImage.toolbar.tools.contrast',     filter: { filterKey: 'contrast'   } satisfies FilterConfig },
  { icon: 'invertColors' as IconName, label: 'biometricImage.toolbar.tools.saturation',   filter: { filterKey: 'saturation' } satisfies FilterConfig },
]

export const ANNOTATION_TOOLS = [
  { icon: 'palette'    as IconName, label: 'biometricImage.toolbar.tools.palette' },
  { icon: 'circle'     as IconName, label: 'biometricImage.toolbar.tools.point' },
  { icon: 'circleLine' as IconName, label: 'biometricImage.toolbar.tools.pointArrow' },
  { icon: 'penTrace'   as IconName, label: 'biometricImage.toolbar.tools.pencil' },
]
