import { useTranslation } from 'react-i18next'
import FilterPanel from './FilterPanel'
import { MINUTIA_TYPES, type MinutiaType } from '@/features/biometric-image/lib/minutiae'

type MinutiaTypePaletteProps = {
  activeType: MinutiaType
  onSelect: (type: MinutiaType) => void
}

export default function MinutiaTypePalette({ activeType, onSelect }: MinutiaTypePaletteProps) {
  const { t } = useTranslation()

  return (
    <FilterPanel filterLabel={t('biometricImage.toolbar.tools.minutiaType')}>
      <div className="flex flex-col gap-1">
        {MINUTIA_TYPES.map((type) => {
          const isActive = type === activeType
          return (
            <button
              key={type}
              type="button"
              onClick={() => onSelect(type)}
              className={`rounded px-2 py-1 text-left text-sm text-white transition ${
                isActive ? 'bg-white/20 ring-1 ring-white' : 'hover:bg-white/10'
              }`}
            >
              {t(`biometricImage.minutia.types.${type}`)}
            </button>
          )
        })}
      </div>
    </FilterPanel>
  )
}
