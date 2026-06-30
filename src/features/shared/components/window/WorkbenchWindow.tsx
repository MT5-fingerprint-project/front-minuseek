import type { ReactNode } from 'react'
import { type IconName } from '@/features/shared/icons'
import { cn } from '@/features/shared/lib/utils'
import WindowTitleBar from './WindowTitleBar'
import WindowFooter from './WindowFooter'
import WindowCollapsed from "./WindowCollapsed"

type WorkbenchWindowProps = {
  title: string
  icon?: IconName
  /** Action buttons in the title bar; defaults to placeholder icons for now */
  actions?: ReactNode
  isCollapsed: boolean
  onToggleCollapse: () => void
  /** Which side the window collapses toward, controls the chevron direction */
  collapseDirection?: 'left' | 'right'
  isActive?: boolean
  onActivate?: () => void
  /** When provided, shows an import/importOff toggle as the first title-bar action */
  isFilesVisible?: boolean
  onToggleFiles?: () => void
  /** When provided, shows a layers toggle as the last title-bar action */
  isLayersVisible?: boolean
  onToggleLayers?: () => void
  /** Extra footer content, rendered opposite the collapse button */
  footer?: ReactNode
  children: ReactNode
}

export default function WorkbenchWindow({
  title,
  icon = 'trace',
  actions,
  isCollapsed,
  onToggleCollapse,
  collapseDirection = 'left',
  isActive = false,
  onActivate,
  isFilesVisible,
  onToggleFiles,
  isLayersVisible,
  onToggleLayers,
  footer,
  children,
}: WorkbenchWindowProps) {
  if (isCollapsed) {
    return (
      <WindowCollapsed
        icon={icon}
        collapseDirection={collapseDirection}
        onToggleCollapse={onToggleCollapse}
        onActivate={onActivate}
      />
    )
  }

  return (
    <div
      onMouseDown={onActivate}
      className={cn(
        'flex h-full w-full min-w-0 flex-col overflow-hidden rounded-lg border bg-white',
        isActive && 'border-blue-medium-1 ring-[3px] ring-inset ring-blue-medium-1',
      )}
    >
      <WindowTitleBar
        title={title}
        icon={icon}
        actions={actions}
        isFilesVisible={isFilesVisible}
        onToggleFiles={onToggleFiles}
        isLayersVisible={isLayersVisible}
        onToggleLayers={onToggleLayers}
      />
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      <WindowFooter
        collapseDirection={collapseDirection}
        onToggleCollapse={onToggleCollapse}
        footer={footer}
      />
    </div>
  )
}

