import type { ReactNode } from 'react'
import { type IconName } from '@/features/shared/icons'
import WindowTitleBar from './WindowTitleBar'
import WindowFooter from './WindowFooter'
import WindowCollapsed from "./WindowCollapsed"

type WorkbenchWindowProps = {
  title: string
  icon?: IconName
  /** Action buttons in the title bar, insérées avant le placeholder double-fenêtre */
  actions?: ReactNode
  isCollapsed: boolean
  onToggleCollapse: () => void
  isActive?: boolean
  onActivate?: () => void
  /** When provided, shows an import/importOff toggle in the title bar */
  isFilesVisible?: boolean
  onToggleFiles?: () => void
  /** Footer content (rendu sur toute la largeur du pied de fenêtre) */
  footer?: ReactNode
  children: ReactNode
}

export default function WorkbenchWindow({
  title,
  icon = 'trace',
  actions,
  isCollapsed,
  onToggleCollapse,
  onActivate,
  isFilesVisible,
  onToggleFiles,
  footer,
  children,
}: WorkbenchWindowProps) {
  if (isCollapsed) {
    return <WindowCollapsed onToggleCollapse={onToggleCollapse} onActivate={onActivate} />
  }

  return (
    <div
      onMouseDown={onActivate}
      className="flex h-full w-full min-w-0 flex-col overflow-hidden rounded-md bg-white"
    >
      <WindowTitleBar
        title={title}
        icon={icon}
        actions={actions}
        onToggleCollapse={onToggleCollapse}
        isFilesVisible={isFilesVisible}
        onToggleFiles={onToggleFiles}
      />
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      <WindowFooter footer={footer} />
    </div>
  )
}
