import { useTranslation } from 'react-i18next'
import { Switch } from '@/features/shared/ui/switch'
import FilterSlider from './FilterSlider'
import { FILTER_DEFAULTS, type FilterConfig } from './canvasFilters'

type FilterControlProps = {
  config: FilterConfig
  value: number
  onChange: (value: number) => void
}

export default function FilterControl({ config, value, onChange }: FilterControlProps) {
  const { t } = useTranslation()

  if (config.inputType === 'toggle') {
    return (
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-white">{config.labelKey ? t(config.labelKey) : config.filterKey}</span>
        <Switch
          size="sm"
          checked={value === 1}
          onCheckedChange={(checked) => onChange(checked ? 1 : 0)}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      {config.labelKey && <span className="text-xs text-white/60">{t(config.labelKey)}</span>}
      <FilterSlider
        value={value}
        min={config.min ?? FILTER_DEFAULTS.min}
        max={config.max ?? FILTER_DEFAULTS.max}
        unit={config.unit ?? FILTER_DEFAULTS.unit}
        origin={config.origin ?? FILTER_DEFAULTS.origin}
        onChange={onChange}
      />
    </div>
  )
}
