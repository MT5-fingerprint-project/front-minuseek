import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useClickOutside } from '@/features/shared/hooks/useClickOutside'
import ModeButton from './ModeButton'
import ItemToolbar from './ItemToolbar'
import FilterPanel from './FilterPanel'
import FilterControl from './FilterControl'
import ColorPalette from './ColorPalette'
import MinutiaTypePalette from './MinutiaTypePalette'
import type { MinutiaType } from '@/features/biometric-image/lib/minutiae'
import {
  IMAGE_TOOLS,
  ANNOTATION_TOOLS,
  type CanvasFilters,
  type FilterConfig,
  type AnnotationToolType,
} from './canvasFilters'

type AnnotationPanel = 'color' | 'minutiaType'

type CanvasToolbarProps = {
  filters: CanvasFilters
  isExpertCase?: boolean
  onFiltersChange: (filters: CanvasFilters) => void
  activeTool: AnnotationToolType | null
  onActiveToolChange: (tool: AnnotationToolType | null) => void
  activeColor: string
  onActiveColorChange: (color: string) => void
  activeMinutiaType: MinutiaType
  onActiveMinutiaTypeChange: (type: MinutiaType) => void
  /** Type de la minutie sélectionnée, ou `undefined` si aucune sélection : le sélecteur affiche l'un ou l'autre. */
  selectedMinutiaType: MinutiaType | undefined
  isRulerActive: boolean
  onToggleRuler: () => void
}

export default function CanvasToolbar({
  filters,
  isExpertCase = false,
  onFiltersChange,
  activeTool,
  onActiveToolChange,
  activeColor,
  onActiveColorChange,
  activeMinutiaType,
  onActiveMinutiaTypeChange,
  selectedMinutiaType,
  isRulerActive,
  onToggleRuler,
}: CanvasToolbarProps) {
  const { t } = useTranslation()
  const [mode, setMode] = useState<'image' | 'annotation'>('image')
  const [openFilter, setOpenFilter] = useState<string | null>(null)
  const [openPanel, setOpenPanel] = useState<AnnotationPanel | null>(null)

  const rootRef = useRef<HTMLDivElement>(null)
  const closePanels = useCallback(() => {
    setOpenFilter(null)
    setOpenPanel(null)
  }, [])
  useClickOutside(rootRef, closePanels, { enabled: openFilter !== null || openPanel !== null })

  const switchMode = (next: 'image' | 'annotation') => {
    setMode(next)
    setOpenFilter(null)
    setOpenPanel(null)
    onActiveToolChange(null)
    // La règle vit dans l'onglet Annotations : quitter cet onglet la referme aussi.
    if (next === 'image' && isRulerActive) onToggleRuler()
  }

  const handleAnnotationClick = (
    tool: AnnotationToolType | undefined,
    panel: AnnotationPanel | undefined,
    isRuler?: boolean,
  ) => {
    if (isRuler) {
      onToggleRuler()
      return
    }
    if (panel) {
      setOpenPanel((open) => (open === panel ? null : panel))
      return
    }
    if (!tool) return
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

  const isAnnotationActive = (
    tool: AnnotationToolType | undefined,
    panel: AnnotationPanel | undefined,
    isRuler?: boolean,
  ) => (isRuler ? isRulerActive : tool ? activeTool === tool : openPanel === panel)

  // Une minutie sélectionnée prime sur le type « à poser » : le sélecteur montre alors
  // ce qu'on est en train de changer, pas ce qui sera appliqué au prochain clic.
  const displayedMinutiaType = selectedMinutiaType ?? activeMinutiaType

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
      {mode === 'annotation' && openPanel === 'color' && (
        <ColorPalette activeColor={activeColor} onSelect={onActiveColorChange} />
      )}
      {mode === 'annotation' && openPanel === 'minutiaType' && (
        <MinutiaTypePalette activeType={displayedMinutiaType} onSelect={onActiveMinutiaTypeChange} />
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
          ? IMAGE_TOOLS.map(({ icon, label, filters: filterConfigs, isExpertOnly }) => {
              const isLocked = isExpertOnly === true && !isExpertCase
              return (
                <ItemToolbar
                  key={label}
                  icon={icon}
                  label={
                    isLocked
                      ? t('biometricImage.toolbar.expertLocked', { tool: t(label) })
                      : t(label)
                  }
                  active={isToolActive(label, filterConfigs)}
                  disabled={isLocked}
                  onClick={() => handleToolClick(label, filterConfigs)}
                />
              )
            })
          : ANNOTATION_TOOLS.map(({ icon, label, tool, isRuler, panel }) => (
              <div key={label} className="relative">
                <ItemToolbar
                  icon={icon}
                  label={t(label)}
                  active={isAnnotationActive(tool, panel, isRuler)}
                  onClick={() => handleAnnotationClick(tool, panel, isRuler)}
                />
                {panel === 'color' && (
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
