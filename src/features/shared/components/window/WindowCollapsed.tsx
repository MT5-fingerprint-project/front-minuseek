import { useTranslation } from 'react-i18next'
import { Icon } from '@/features/shared/icons'

type WindowCollapsedProps = {
  onToggleCollapse: () => void
  onActivate?: () => void
}

export default function WindowCollapsed({ onToggleCollapse, onActivate }: WindowCollapsedProps) {
  const { t } = useTranslation()

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-lg border bg-white" onMouseDown={onActivate}>
      <div className="flex items-center justify-center bg-blue-medium-1 px-2 py-2 text-white">
        <button
          type="button"
          onClick={onToggleCollapse}
          title={t('common.window.expand')}
          className="rounded p-1 hover:bg-white/15"
        >
          <Icon name="sidebarFill" size={24} color="currentColor" />
        </button>
      </div>
      <div className="flex-1" />
    </div>
  )
}
