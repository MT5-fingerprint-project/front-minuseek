import Konva from 'konva'
import type { Filter } from 'konva/lib/Node'
import type { ParseKeys } from 'i18next'
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
  | { type: 'filter'; filter: Filter; prop: string; scale: number }
  | { type: 'transform'; prop: string; transform: (v: number) => number }

// ─── Defaults ─────────────────────────────────────────────────────────────────

export const DEFAULT_FILTERS: CanvasFilters = {}

export const FILTER_DEFAULTS = { min: -100, max: 100, unit: '%', origin: 'center' } as const

// ─── Custom filters ─────────────────────────────────────────────────────────────
const Brightness: Filter = function (imageData) {
  const data = imageData.data
  const factor = 1 + (Number(this.getAttr('brightnessAmount')) || 0)
  for (let i = 0; i < data.length; i += 4) {
    data[i] = data[i] * factor
    data[i + 1] = data[i + 1] * factor
    data[i + 2] = data[i + 2] * factor
  }
}

const Saturation: Filter = function (imageData) {
  const data = imageData.data
  const sat = 1 + (Number(this.getAttr('saturationAmount')) || 0)
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const gray = 0.299 * r + 0.587 * g + 0.114 * b
    data[i] = gray + (r - gray) * sat
    data[i + 1] = gray + (g - gray) * sat
    data[i + 2] = gray + (b - gray) * sat
  }
}

const Contrast: Filter = function (imageData) {
  const data = imageData.data
  const factor = 1 + (Number(this.getAttr('contrastAmount')) || 0)
  for (let i = 0; i < data.length; i += 4) {
    data[i] = (data[i] - 128) * factor + 128
    data[i + 1] = (data[i + 1] - 128) * factor + 128
    data[i + 2] = (data[i + 2] - 128) * factor + 128
  }
}

// ─── Per-filter metadata ───────────────────────────────────────────────────────
// Single source of truth: label key, icon, and Konva binding for each filterKey

export const FILTER_META: Record<string, { labelKey: string; icon: IconName; konva: KonvaFilterDef }> = {
  brightness: {
    labelKey: 'biometricImage.toolbar.tools.luminosity',
    icon: 'luminosity',
    konva: { type: 'filter', filter: Brightness, prop: 'brightnessAmount', scale: 1 / 100 },
  },
  contrast: {
    labelKey: 'biometricImage.toolbar.tools.contrast',
    icon: 'contrast',
    konva: { type: 'filter', filter: Contrast, prop: 'contrastAmount', scale: 1 / 100 },
  },
  saturation: {
    labelKey: 'biometricImage.toolbar.tools.saturation',
    icon: 'invertColors',
    konva: { type: 'filter', filter: Saturation, prop: 'saturationAmount', scale: 1 / 100 },
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

type ImageTool = { icon: IconName; label: ParseKeys; filter: FilterConfig }

export const IMAGE_TOOLS: ImageTool[] = [
  { icon: 'mirror'       as IconName, label: 'biometricImage.toolbar.tools.mirror',       filter: { filterKey: 'mirror',    inputType: 'toggle' } satisfies FilterConfig },
  { icon: 'rotate'       as IconName, label: 'biometricImage.toolbar.tools.rotation',     filter: { filterKey: 'rotation',  min: -180, max: 180, unit: '°', origin: 'center' } satisfies FilterConfig },
  { icon: 'compare'      as IconName, label: 'biometricImage.toolbar.tools.invertColors', filter: { filterKey: 'inversion', inputType: 'toggle' } satisfies FilterConfig },
  { icon: 'luminosity'   as IconName, label: 'biometricImage.toolbar.tools.luminosity',   filter: { filterKey: 'brightness' } satisfies FilterConfig },
  { icon: 'contrast'     as IconName, label: 'biometricImage.toolbar.tools.contrast',     filter: { filterKey: 'contrast'   } satisfies FilterConfig },
  { icon: 'invertColors' as IconName, label: 'biometricImage.toolbar.tools.saturation',   filter: { filterKey: 'saturation' } satisfies FilterConfig },
]

export type AnnotationToolType = 'circle' | 'circleArrow' | 'pencil'

type AnnotationTool = { icon: IconName; label: ParseKeys; tool?: AnnotationToolType }

export const ANNOTATION_TOOLS: AnnotationTool[] = [
  { icon: 'palette'    as IconName, label: 'biometricImage.toolbar.tools.palette' },
  { icon: 'circle'     as IconName, label: 'biometricImage.toolbar.tools.point',      tool: 'circle'      as AnnotationToolType },
  { icon: 'circleLine' as IconName, label: 'biometricImage.toolbar.tools.pointArrow', tool: 'circleArrow' as AnnotationToolType },
  { icon: 'penTrace'   as IconName, label: 'biometricImage.toolbar.tools.pencil',     tool: 'pencil'      as AnnotationToolType },
]

// color palette for annotation tools, always keep Green, Yellow, Red, Orange as the first 4 colors (GYRO standard)
export const ANNOTATION_COLORS = [
  '#00FF11', '#FFD400', '#FF0000', '#FF8800',
  '#3b82f6', '#a855f7', '#ffffff', '#000000',
]
