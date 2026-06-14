import { useTranslation } from 'react-i18next'
import FilterPanel from './FilterPanel'
import { ANNOTATION_COLORS } from './canvasFilters'

type ColorPaletteProps = {
  activeColor: string
  onSelect: (color: string) => void
}

export default function ColorPalette({ activeColor, onSelect }: ColorPaletteProps) {
  const { t } = useTranslation()

  return (
    <FilterPanel filterLabel={t('biometricImage.toolbar.tools.palette')}>
      <div className="grid grid-cols-4 gap-2">
        {ANNOTATION_COLORS.map((color) => {
          const isActive = color.toLowerCase() === activeColor.toLowerCase()
          return (
            <button
              key={color}
              type="button"
              onClick={() => onSelect(color)}
              aria-label={color}
              className={`h-7 w-7 rounded-full border border-white/20 transition ${
                isActive ? 'ring-2 ring-white ring-offset-2 ring-offset-blue-dark-1' : 'hover:scale-110'
              }`}
              style={{ backgroundColor: color }}
            />
          )
        })}
      </div>
    </FilterPanel>
  )
}
