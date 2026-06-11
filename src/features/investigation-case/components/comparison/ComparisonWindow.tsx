import { useTranslation } from 'react-i18next'
import { ResizablePanel } from '@/features/shared/ui/resizable'
import WorkbenchWindow from '@/features/shared/components/window/WorkbenchWindow'
import { BiometricImageCarousel, BiometricImageCanvas } from '@/features/biometric-image'
import ZoomControls from '@/features/biometric-image/components/canvas/ZoomControls'
import RecenterButton from '@/features/biometric-image/components/canvas/RecenterControl'
import type { ComparisonWindowState } from '@/features/investigation-case/hooks/useComparisonWindow'

const COLLAPSED_SIZE = '48px'
const MIN_PANEL_SIZE = '280px'

type ComparisonWindowProps = {
  side: 'left' | 'right'
  type: 'traces' | 'reference-prints'
  caseId: string
  active: boolean
  onActivate: () => void
  window: ComparisonWindowState
}

const TITLES = {
  traces: {
    base: 'investigationCase.comparison.tracesWindow',
    withFile: 'investigationCase.comparison.tracesWindowWithFile',
  },
  'reference-prints': {
    base: 'investigationCase.comparison.referencePrintsWindow',
    withFile: 'investigationCase.comparison.referencePrintsWindowWithFile',
  },
} as const

const ICON = {
  traces: 'trace',
  'reference-prints': 'fingerprint',
} as const

export default function ComparisonWindow({
  side,
  type,
  caseId,
  active,
  onActivate,
  window: w,
}: ComparisonWindowProps) {
  const { t } = useTranslation()
  const keys = TITLES[type]

  const title = w.selected
    ? t(keys.withFile, { fileName: w.selected.fileName })
    : t(keys.base)

  const footer = w.selected && (
    <div className="flex items-center gap-2">
      {side === 'left' && <RecenterButton onClick={() => w.zoomRef.current?.recenter()} />}
      <ZoomControls
        scale={w.scale}
        onZoomIn={() => w.zoomRef.current?.zoomIn()}
        onZoomOut={() => w.zoomRef.current?.zoomOut()}
      />
      {side === 'right' && <RecenterButton onClick={() => w.zoomRef.current?.recenter()} />}
    </div>
  )

  return (
    <ResizablePanel
      panelRef={w.panelRef}
      collapsible
      collapsedSize={COLLAPSED_SIZE}
      minSize={MIN_PANEL_SIZE}
      defaultSize={50}
      onResize={w.syncCollapsed}
    >
      <WorkbenchWindow
        title={title}
        icon={ICON[type]}
        collapsed={w.collapsed}
        onToggleCollapse={w.toggle}
        collapseDirection={side === 'left' ? 'left' : 'right'}
        active={active}
        onActivate={onActivate}
        filesVisible={w.filesVisible}
        onToggleFiles={w.toggleFiles}
        layersVisible={w.layersVisible}
        onToggleLayers={w.toggleLayers}
        footer={footer}
      >
        {w.filesVisible && (
          <div className="border-b p-2">
            <BiometricImageCarousel
              type={type}
              caseId={caseId}
              selectedId={w.selected?.id}
              onSelect={w.setSelected}
            />
          </div>
        )}
        <div className="min-h-0 flex-1 p-4">
          <div className="h-full overflow-hidden rounded-sm border border-grey-light-2">
            <BiometricImageCanvas
              image={w.selected}
              placeholder={t(`investigationCase.comparison.select${type === 'traces' ? 'Trace' : 'ReferencePrint'}`)}
              toolbarVisible={active}
              layersVisible={w.layersVisible}
              onCloseLayers={w.closeLayersPanel}
              zoomHandleRef={w.zoomRef}
              onScaleChange={w.setScale}
            />
          </div>
        </div>
      </WorkbenchWindow>
    </ResizablePanel>
  )
}
