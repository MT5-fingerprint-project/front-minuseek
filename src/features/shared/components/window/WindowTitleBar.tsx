import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon, type IconName } from '@/features/shared/icons'
import WindowActionButton from '@/features/shared/components/window/WindowActionButton'

type WindowTitleBarProps = {
  title: string
  icon: IconName
  /** Custom action buttons; defaults to placeholder icons for now */
  actions?: ReactNode
  /** When provided, shows an import/importOff toggle as the first action */
  filesVisible?: boolean
  onToggleFiles?: () => void
  /** When provided, shows a layers toggle as the last action */
  layersVisible?: boolean
  onToggleLayers?: () => void
}

export default function WindowTitleBar({
  title,
  icon,
  actions,
  filesVisible,
  onToggleFiles,
  layersVisible,
  onToggleLayers,
}: WindowTitleBarProps) {
  const { t } = useTranslation()

  return (
    <div className="flex items-center gap-2 bg-blue-medium-1 px-3 py-2 text-white">
      <Icon name={icon} size={24} color="currentColor" />
      <span className="truncate text-sm font-medium">{title}</span>
      <div className="ml-auto flex items-center gap-1">
        {onToggleFiles && (
          <WindowActionButton
            icon={filesVisible ? 'importOff' : 'import'}
            label={t(filesVisible ? 'common.window.hideFiles' : 'common.window.showFiles')}
            onClick={onToggleFiles}
          />
        )}
        {actions ?? <PlaceholderActions />}
        {onToggleLayers && (
          <WindowActionButton
            icon={layersVisible ? 'layersOff' : 'layers'}
            label={t(layersVisible ? 'common.window.hideLayers' : 'common.window.showLayers')}
            onClick={onToggleLayers}
          />
        )}
      </div>
    </div>
  )
}

const PLACEHOLDER_ACTIONS: IconName[] = ['redo', 'undo']

function PlaceholderActions() {
  return (
    <>
      {PLACEHOLDER_ACTIONS.map((name) => (
        <WindowActionButton key={name} icon={name} label="À venir" />
      ))}
    </>
  )
}
