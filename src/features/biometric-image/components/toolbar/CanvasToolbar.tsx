import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useClickOutside } from '@/features/shared/hooks/useClickOutside'
import ModeButton from './ModeButton'
import ItemToolbar from './ItemToolbar'
import FilterPanel from './FilterPanel'
import FilterControl from './FilterControl'
import ColorPalette from './ColorPalette'
import {
  IMAGE_TOOLS,
  ANNOTATION_TOOLS,
  type CanvasFilters,
  type FilterConfig,
  type AnnotationToolType,
} from './canvasFilters'

type CanvasToolbarProps = {
  filters: CanvasFilters
  onFiltersChange: (filters: CanvasFilters) => void
  activeTool: AnnotationToolType | null
  onActiveToolChange: (tool: AnnotationToolType | null) => void
  activeColor: string
  onActiveColorChange: (color: string) => void
  isRulerActive: boolean
  onToggleRuler: () => void
}

export default function CanvasToolbar({
  filters,
  onFiltersChange,
  activeTool,
  onActiveToolChange,
  activeColor,
  onActiveColorChange,
  isRulerActive,
  onToggleRuler,
}: CanvasToolbarProps) {
  const { t } = useTranslation()
  const [mode, setMode] = useState<'image' | 'annotation'>('image')
  const [openFilter, setOpenFilter] = useState<string | null>(null)
  const [paletteOpen, setPaletteOpen] = useState(false)

  const rootRef = useRef<HTMLDivElement>(null)
  const closePanels = useCallback(() => {
    setOpenFilter(null)
    setPaletteOpen(false)
  }, [])
  useClickOutside(rootRef, closePanels, { enabled: openFilter !== null || paletteOpen })

  const switchMode = (next: 'image' | 'annotation') => {
    setMode(next)
    setOpenFilter(null)
    setPaletteOpen(false)
    onActiveToolChange(null)
    // La règle vit dans l'onglet Annotations : quitter cet onglet la referme aussi.
    if (next === 'image' && isRulerActive) onToggleRuler()
  }

  const handleAnnotationClick = (tool: AnnotationToolType | undefined, isRuler?: boolean) => {
    if (isRuler) {
      onToggleRuler()
      return
    }
    if (!tool) {
      // palette : ouvre/ferme le panneau de couleurs (pas un outil de dessin)
      setPaletteOpen((open) => !open)
      return
    }
    onActiveToolChange(activeTool === tool ? null : tool)
  }

  const handleToolClick = (label: string, filterConfigs: FilterConfig[]) => {
    if (filterConfigs.length > 1) {
      setOpenFilter((prev) => (prev === label ? null : label))
      return
    }

    const { filterKey, inputType = 'slider', cycleValues } = filterConfigs[0]

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
    setOpenFilter((prev) => (prev === label ? null : label))
  }

  const openTool = IMAGE_TOOLS.find((tool) => tool.label === openFilter)

  const isToolActive = (label: string, filterConfigs: FilterConfig[]) => {
    if (filterConfigs.length > 1) {
      return (
        openFilter === label ||
        filterConfigs.some((config) => (filters[config.filterKey] ?? 0) !== 0)
      )
    }
    const { filterKey, inputType = 'slider' } = filterConfigs[0]
    if (inputType === 'toggle') return (filters[filterKey] ?? 0) === 1
    if (inputType === 'cycle') return (filters[filterKey] ?? 0) !== 0
    return openFilter === label
  }

  const isAnnotationActive = (tool: AnnotationToolType | undefined, isRuler?: boolean) =>
    isRuler ? isRulerActive : tool ? activeTool === tool : paletteOpen

  return (
    <div ref={rootRef} className="flex flex-col items-center gap-2">
      {openTool && (
        <FilterPanel filterLabel={t(openTool.label)}>
          {openTool.filters.map((config) => (
            <FilterControl
              key={config.filterKey}
              config={config}
              value={filters[config.filterKey] ?? 0}
              onChange={(value) => onFiltersChange({ ...filters, [config.filterKey]: value })}
            />
          ))}
        </FilterPanel>
      )}
      {mode === 'annotation' && paletteOpen && (
        <ColorPalette activeColor={activeColor} onSelect={onActiveColorChange} />
      )}
      <div className="flex items-center gap-3 rounded-md bg-blue-dark-1 px-3 py-2 text-white shadow-lg">
        <div className="flex items-center gap-1 rounded-sm bg-white/25 p-1">
          <ModeButton
            icon="image"
            label={t('biometricImage.toolbar.modes.image')}
            isActive={mode === 'image'}
            onClick={() => switchMode('image')}
          />
          <ModeButton
            icon="pen"
            label={t('biometricImage.toolbar.modes.annotation')}
            isActive={mode === 'annotation'}
            onClick={() => switchMode('annotation')}
          />
        </div>
        {mode === 'image'
          ? IMAGE_TOOLS.map(({ icon, label, filters: filterConfigs }) => (
              <ItemToolbar
                key={label}
                icon={icon}
                label={t(label)}
                active={isToolActive(label, filterConfigs)}
                onClick={() => handleToolClick(label, filterConfigs)}
              />
            ))
          : ANNOTATION_TOOLS.map(({ icon, label, tool, isRuler }) => (
              <div key={label} className="relative">
                <ItemToolbar
                  icon={icon}
                  label={t(label)}
                  active={isAnnotationActive(tool, isRuler)}
                  onClick={() => handleAnnotationClick(tool, isRuler)}
                />
                {!tool && !isRuler && (
                  <span
                    className="pointer-events-none absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full border border-blue-dark-1"
                    style={{ backgroundColor: activeColor }}
                  />
                )}
              </div>
            ))}
      </div>
    </div>
  )
}
