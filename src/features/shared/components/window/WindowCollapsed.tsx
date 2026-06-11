import { useTranslation } from 'react-i18next'
import { Icon, type IconName } from '@/features/shared/icons'

type WindowCollapsedProps = {
  icon: IconName
  collapseDirection: 'left' | 'right'
  onToggleCollapse: () => void
  onActivate?: () => void
}

export default function WindowCollapsed({ icon, collapseDirection, onToggleCollapse, onActivate }: WindowCollapsedProps) {
  const { t } = useTranslation()
  const expandIcon: IconName = collapseDirection === 'left' ? 'chevronRight' : 'chevronLeft'

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-lg border bg-white" onMouseDown={onActivate}>
      <button
        type="button"
        onClick={onToggleCollapse}
        title={t('common.window.expand')}
        className="flex flex-1 flex-col items-center gap-3 bg-blue-medium-1 py-3 text-white hover:bg-blue-medium-2"
      >
        <Icon name={icon} size={24} color="currentColor" />
        <Icon name={expandIcon} size={24} color="currentColor" className="shrink-0" />
      </button>
    </div>
  )
}
