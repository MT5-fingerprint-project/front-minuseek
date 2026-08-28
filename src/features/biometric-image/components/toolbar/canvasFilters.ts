import Konva from 'konva'
import type { Filter } from 'konva/lib/Node'
import type { ParseKeys } from 'i18next'
import type { IconName } from '@/features/shared/icons'

// ─── Types ────────────────────────────────────────────────────────────────────

export type CanvasFilters = Record<string, number>

export type FilterConfig = {
  filterKey: string
  labelKey?: ParseKeys
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

const ChannelIsolation: Filter = function (imageData) {
  const data = imageData.data
  const isRedHidden = Number(this.getAttr('redChannelHidden')) === 1
  const isGreenHidden = Number(this.getAttr('greenChannelHidden')) === 1
  const isBlueHidden = Number(this.getAttr('blueChannelHidden')) === 1
  for (let i = 0; i < data.length; i += 4) {
    if (isRedHidden) data[i] = 0
    if (isGreenHidden) data[i + 1] = 0
    if (isBlueHidden) data[i + 2] = 0
  }
}

const Levels: Filter = function (imageData) {
  const data = imageData.data
  const blackPoint = (Number(this.getAttr('levelsBlackPoint')) || 0) * 255
  const whitePoint = 255 - (Number(this.getAttr('levelsWhitePoint')) || 0) * 255
  const span = whitePoint - blackPoint
  if (span <= 0) return

  const gamma = 2 ** -(Number(this.getAttr('levelsGammaAmount')) || 0)
  const remapped = new Uint8ClampedArray(256)
  for (let level = 0; level < 256; level += 1) {
    const normalized = Math.min(1, Math.max(0, (level - blackPoint) / span))
    remapped[level] = 255 * normalized ** gamma
  }

  for (let i = 0; i < data.length; i += 4) {
    data[i] = remapped[data[i]]
    data[i + 1] = remapped[data[i + 1]]
    data[i + 2] = remapped[data[i + 2]]
  }
}

const LocalSharpening: Filter = function (imageData) {
  const { data, width, height } = imageData
  const amount = Number(this.getAttr('sharpeningAmount')) || 0
  if (amount <= 0) return

  const source = new Uint8ClampedArray(data)
  const sampleAt = (x: number, y: number, channel: number) => {
    const clampedX = Math.min(width - 1, Math.max(0, x))
    const clampedY = Math.min(height - 1, Math.max(0, y))
    return source[(clampedY * width + clampedX) * 4 + channel]
  }

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const pixel = (y * width + x) * 4
      for (let channel = 0; channel < 3; channel += 1) {
        let neighbourhood = 0
        for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
          for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
            neighbourhood += sampleAt(x + offsetX, y + offsetY, channel)
          }
        }
        const value = source[pixel + channel]
        data[pixel + channel] = value + amount * (value - neighbourhood / 9)
      }
    }
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
  channelRed: {
    labelKey: 'biometricImage.toolbar.tools.channelRed',
    icon: 'palette',
    konva: { type: 'filter', filter: ChannelIsolation, prop: 'redChannelHidden', scale: 1 },
  },
  channelGreen: {
    labelKey: 'biometricImage.toolbar.tools.channelGreen',
    icon: 'palette',
    konva: { type: 'filter', filter: ChannelIsolation, prop: 'greenChannelHidden', scale: 1 },
  },
  channelBlue: {
    labelKey: 'biometricImage.toolbar.tools.channelBlue',
    icon: 'palette',
    konva: { type: 'filter', filter: ChannelIsolation, prop: 'blueChannelHidden', scale: 1 },
  },
  levelsBlack: {
    labelKey: 'biometricImage.toolbar.tools.levelsBlack',
    icon: 'target',
    konva: { type: 'filter', filter: Levels, prop: 'levelsBlackPoint', scale: 1 / 100 },
  },
  levelsGamma: {
    labelKey: 'biometricImage.toolbar.tools.levelsGamma',
    icon: 'target',
    konva: { type: 'filter', filter: Levels, prop: 'levelsGammaAmount', scale: 1 / 100 },
  },
  levelsWhite: {
    labelKey: 'biometricImage.toolbar.tools.levelsWhite',
    icon: 'target',
    konva: { type: 'filter', filter: Levels, prop: 'levelsWhitePoint', scale: 1 / 100 },
  },
  sharpening: {
    labelKey: 'biometricImage.toolbar.tools.sharpening',
    icon: 'trace',
    konva: { type: 'filter', filter: LocalSharpening, prop: 'sharpeningAmount', scale: 1 / 100 },
  },
}


// ─── Toolbar tool lists ────────────────────────────────────────────────────────

export type ImageTool = { icon: IconName; label: ParseKeys; filters: FilterConfig[] }

export const IMAGE_TOOLS: ImageTool[] = [
  { icon: 'mirror'       as IconName, label: 'biometricImage.toolbar.tools.mirror',       filters: [{ filterKey: 'mirror',    inputType: 'toggle' }] },
  { icon: 'rotate'       as IconName, label: 'biometricImage.toolbar.tools.rotation',     filters: [{ filterKey: 'rotation',  min: -180, max: 180, unit: '°', origin: 'center' }] },
  { icon: 'compare'      as IconName, label: 'biometricImage.toolbar.tools.invertColors', filters: [{ filterKey: 'inversion', inputType: 'toggle' }] },
  { icon: 'luminosity'   as IconName, label: 'biometricImage.toolbar.tools.luminosity',   filters: [{ filterKey: 'brightness' }] },
  { icon: 'contrast'     as IconName, label: 'biometricImage.toolbar.tools.contrast',     filters: [{ filterKey: 'contrast'   }] },
  { icon: 'invertColors' as IconName, label: 'biometricImage.toolbar.tools.saturation',   filters: [{ filterKey: 'saturation' }] },
  {
    icon: 'palette' as IconName,
    label: 'biometricImage.toolbar.tools.channels',
    filters: [
      { filterKey: 'channelRed',   labelKey: 'biometricImage.toolbar.tools.channelRed',   inputType: 'toggle' },
      { filterKey: 'channelGreen', labelKey: 'biometricImage.toolbar.tools.channelGreen', inputType: 'toggle' },
      { filterKey: 'channelBlue',  labelKey: 'biometricImage.toolbar.tools.channelBlue',  inputType: 'toggle' },
    ],
  },
  {
    icon: 'target' as IconName,
    label: 'biometricImage.toolbar.tools.levels',
    filters: [
      { filterKey: 'levelsBlack', labelKey: 'biometricImage.toolbar.tools.levelsBlack', min: 0,    max: 100, origin: 'left' },
      { filterKey: 'levelsGamma', labelKey: 'biometricImage.toolbar.tools.levelsGamma', min: -100, max: 100, origin: 'center' },
      { filterKey: 'levelsWhite', labelKey: 'biometricImage.toolbar.tools.levelsWhite', min: 0,    max: 100, origin: 'left' },
    ],
  },
  {
    icon: 'trace' as IconName,
    label: 'biometricImage.toolbar.tools.sharpening',
    filters: [{ filterKey: 'sharpening', min: 0, max: 200, origin: 'left' }],
  },
]

export type AnnotationToolType = 'circle' | 'circleArrow' | 'pencil'

type AnnotationTool = { icon: IconName; label: ParseKeys; tool?: AnnotationToolType; isRuler?: boolean }

export const ANNOTATION_TOOLS: AnnotationTool[] = [
  { icon: 'palette'    as IconName, label: 'biometricImage.toolbar.tools.palette' },
  { icon: 'circle'     as IconName, label: 'biometricImage.toolbar.tools.point',      tool: 'circle'      as AnnotationToolType },
  { icon: 'circleLine' as IconName, label: 'biometricImage.toolbar.tools.pointArrow', tool: 'circleArrow' as AnnotationToolType },
  { icon: 'penTrace'   as IconName, label: 'biometricImage.toolbar.tools.pencil',     tool: 'pencil'      as AnnotationToolType },
  { icon: 'ruler'      as IconName, label: 'biometricImage.toolbar.tools.ruler',      isRuler: true },
]

// color palette for annotation tools, always keep Green, Yellow, Red, Orange as the first 4 colors (GYRO standard)
export const ANNOTATION_COLORS = [
  '#00FF11', '#FFD400', '#FF0000', '#FF8800',
  '#3b82f6', '#a855f7', '#ffffff', '#000000',
]
