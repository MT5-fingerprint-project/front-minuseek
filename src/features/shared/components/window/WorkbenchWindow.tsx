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
  collapsed: boolean
  onToggleCollapse: () => void
  /** Which side the window collapses toward, controls the chevron direction */
  collapseDirection?: 'left' | 'right'
  active?: boolean
  onActivate?: () => void
  /** When provided, shows an import/importOff toggle as the first title-bar action */
  filesVisible?: boolean
  onToggleFiles?: () => void
  /** When provided, shows a layers toggle as the last title-bar action */
  layersVisible?: boolean
  onToggleLayers?: () => void
  /** Extra footer content, rendered opposite the collapse button */
  footer?: ReactNode
  children: ReactNode
}

export default function WorkbenchWindow({
  title,
  icon = 'trace',
  actions,
  collapsed,
  onToggleCollapse,
  collapseDirection = 'left',
  active = false,
  onActivate,
  filesVisible,
  onToggleFiles,
  layersVisible,
  onToggleLayers,
  footer,
  children,
}: WorkbenchWindowProps) {
  if (collapsed) {
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
        active && 'border-blue-medium-1 ring-[3px] ring-inset ring-blue-medium-1',
      )}
    >
      <WindowTitleBar
        title={title}
        icon={icon}
        actions={actions}
        filesVisible={filesVisible}
        onToggleFiles={onToggleFiles}
        layersVisible={layersVisible}
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

