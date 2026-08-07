import { ResizablePanel } from '@/features/shared/ui/resizable'
import ComparisonWorkbench, {
  type ComparisonWorkbenchProps,
} from '@/features/investigation-case/components/comparison/ComparisonWorkbench'

const COLLAPSED_SIZE = '3rem'
const MIN_PANEL_SIZE = '17.5rem'

type ComparisonWindowProps = Omit<ComparisonWorkbenchProps, 'onToggleCollapse' | 'isCollapsed'>

export default function ComparisonWindow(props: ComparisonWindowProps) {
  const { window: w } = props

  return (
    <ResizablePanel
      panelRef={w.panelRef}
      collapsible
      collapsedSize={COLLAPSED_SIZE}
      minSize={MIN_PANEL_SIZE}
      defaultSize={50}
      onResize={w.syncCollapsed}
    >
      <ComparisonWorkbench {...props} isCollapsed={w.isCollapsed} onToggleCollapse={w.toggle} />
    </ResizablePanel>
  )
}
