import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon, type IconName } from '@/features/shared/icons'
import WindowActionButton from '@/features/shared/components/window/WindowActionButton'

type WindowTitleBarProps = {
  title: string
  icon: IconName
  /** Custom action buttons; insérés avant le placeholder double-fenêtre */
  actions?: ReactNode
  /** Réduit la fenêtre sur le côté (icône sidebar) */
  onToggleCollapse?: () => void
  /** When provided, shows an import/importOff toggle */
  isFilesVisible?: boolean
  onToggleFiles?: () => void
  /** When provided, shows a detach/attach toggle (ouvre le panneau dans une nouvelle fenêtre) */
  isDetached?: boolean
  onToggleDetach?: () => void
}

export default function WindowTitleBar({
  title,
  icon,
  actions,
  onToggleCollapse,
  isFilesVisible,
  onToggleFiles,
  isDetached,
  onToggleDetach,
}: WindowTitleBarProps) {
  const { t } = useTranslation()

  return (
    <div className="flex items-center justify-between gap-8 bg-blue-medium-2 px-3 py-2 text-white">
      <div className="flex items-center gap-1">
        <Icon name={icon} size={24} color="currentColor" />
        <span className="truncate text-sm font-medium">{title}</span>
      </div>
      <div className="flex items-center">
        {onToggleCollapse && (
          <WindowActionButton icon="sidebarFill" label={t('common.window.reduce')} onClick={onToggleCollapse} />
        )}
        {onToggleFiles && (
          <WindowActionButton
            icon={isFilesVisible ? 'importOff' : 'import'}
            label={t(isFilesVisible ? 'common.window.hideFiles' : 'common.window.showFiles')}
            onClick={onToggleFiles}
          />
        )}
        {actions}
        {onToggleDetach && (
          <WindowActionButton
            icon={isDetached ? 'windowOff' : 'windowOn'}
            label={t(isDetached ? 'common.window.attachWindow' : 'common.window.detachWindow')}
            onClick={onToggleDetach}
          />
        )}
      </div>
    </div>
  )
}
