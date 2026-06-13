import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import ModeButton from './ModeButton'
import ItemToolbar from './ItemToolbar'
import FilterPanel from './FilterPanel'
import FilterSlider from './FilterSlider'
import {
  IMAGE_TOOLS,
  ANNOTATION_TOOLS,
  FILTER_DEFAULTS,
  type CanvasFilters,
  type FilterConfig,
} from './canvasFilters'

type CanvasToolbarProps = {
  filters: CanvasFilters
  onFiltersChange: (filters: CanvasFilters) => void
}

export default function CanvasToolbar({ filters, onFiltersChange }: CanvasToolbarProps) {
  const { t } = useTranslation()
  const [mode, setMode] = useState<'image' | 'annotation'>('image')
  const [activeTool, setActiveTool] = useState<string | null>(null)
  const tools = mode === 'image' ? IMAGE_TOOLS : ANNOTATION_TOOLS

  const handleToolClick = (label: string, filterConfig: FilterConfig | undefined) => {
    if (!filterConfig) return

    const { filterKey, inputType = 'slider', cycleValues } = filterConfig

    if (inputType === 'toggle') {
      const next = filters[filterKey] === 1 ? 0 : 1
      onFiltersChange({ ...filters, [filterKey]: next })
      return
    }

    if (inputType === 'cycle') {
      const values = cycleValues ?? [0, 90, 180, 270]
      const current = filters[filterKey] ?? 0
      const idx = values.indexOf(current)
      const next = values[(idx + 1) % values.length]
      onFiltersChange({ ...filters, [filterKey]: next })
      return
    }

    // slider — toggle panel open/closed
    setActiveTool((prev) => (prev === label ? null : label))
  }

  const activeToolConfig = IMAGE_TOOLS.find(
    (tool) => tool.label === activeTool && 'filter' in tool,
  ) as (typeof IMAGE_TOOLS[number] & { filter: FilterConfig }) | undefined

  const isToolActive = (label: string, filterConfig: FilterConfig | undefined) => {
    if (!filterConfig) return activeTool === label
    const { filterKey, inputType = 'slider' } = filterConfig
    if (inputType === 'toggle') return (filters[filterKey] ?? 0) === 1
    if (inputType === 'cycle') return (filters[filterKey] ?? 0) !== 0
    return activeTool === label
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {activeToolConfig && (
        <FilterPanel filterLabel={t(activeToolConfig.label)}>
          <FilterSlider
            value={filters[activeToolConfig.filter.filterKey] ?? 0}
            min={activeToolConfig.filter.min ?? FILTER_DEFAULTS.min}
            max={activeToolConfig.filter.max ?? FILTER_DEFAULTS.max}
            unit={activeToolConfig.filter.unit ?? FILTER_DEFAULTS.unit}
            origin={activeToolConfig.filter.origin ?? FILTER_DEFAULTS.origin}
            onChange={(v) =>
              onFiltersChange({ ...filters, [activeToolConfig.filter.filterKey]: v })
            }
          />
        </FilterPanel>
      )}
      <div className="flex items-center gap-3 rounded-md bg-blue-dark-1 px-3 py-2 text-white shadow-lg">
        <div className="flex items-center gap-1 rounded-sm bg-white/25 p-1">
          <ModeButton
            icon="image"
            label={t('biometricImage.toolbar.modes.image')}
            active={mode === 'image'}
            onClick={() => setMode('image')}
          />
          <ModeButton
            icon="pen"
            label={t('biometricImage.toolbar.modes.annotation')}
            active={mode === 'annotation'}
            onClick={() => setMode('annotation')}
          />
        </div>
        {tools.map(({ icon, label, ...rest }) => {
          const filterConfig = 'filter' in rest ? (rest.filter as FilterConfig) : undefined
          return (
            <ItemToolbar
              key={label}
              icon={icon}
              label={t(label)}
              active={isToolActive(label, filterConfig)}
              onClick={() => handleToolClick(label, filterConfig)}
            />
          )
        })}
      </div>
    </div>
  )
}
