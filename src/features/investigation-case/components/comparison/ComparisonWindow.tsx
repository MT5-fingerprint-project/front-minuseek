import { Sparkle, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/features/shared/lib/utils'
import { ResizablePanel } from '@/features/shared/ui/resizable'
import { Button } from '@/features/shared/ui/button'
import WorkbenchWindow from '@/features/shared/components/window/WorkbenchWindow'
import { BiometricImageCarousel, BiometricImageCanvas } from '@/features/biometric-image'
import ZoomControls from '@/features/biometric-image/components/canvas/ZoomControls'
import RecenterButton from '@/features/biometric-image/components/canvas/RecenterControl'
import type { ComparisonWindowState } from '@/features/investigation-case/hooks/useComparisonWindow'

const COLLAPSED_SIZE = '3rem'
const MIN_PANEL_SIZE = '17.5rem'

type ComparisonWindowProps = {
  side: 'left' | 'right'
  type: 'traces' | 'reference-prints'
  caseId: string
  isActive: boolean
  onActivate: () => void
  window: ComparisonWindowState
  isComparing?: boolean
  onAnalyze?: () => void
  selectedTraceId?: string
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
  isActive,
  onActivate,
  window: w,
  isComparing,
  onAnalyze,
  selectedTraceId,
}: ComparisonWindowProps) {
  const { t } = useTranslation()
  const keys = TITLES[type]

  const title = w.selectedTrace
    ? t(keys.withFile, { fileName: w.selectedTrace.fileName })
    : t(keys.base)

  const footer = w.selectedTrace && (
    <div className="flex items-center gap-2">
      {side === 'left' && (
        <>
          <RecenterButton onClick={() => w.zoomRef.current?.recenter()} />
          <Button
            type="button"
            variant="outline"
            size="xs"
            disabled={isComparing}
            onClick={onAnalyze}
            className={cn(
              'relative overflow-hidden rounded-full border-blue-medium-1/40 text-blue-medium-1 hover:border-blue-medium-1 hover:bg-blue-medium-1 hover:text-white',
            )}
          >
            {isComparing
              ? <Loader2 size={13} className="animate-spin" />
              : <Sparkle size={13} />}
            Analyse IA
          </Button>
        </>
      )}
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
        isCollapsed={w.isCollapsed}
        onToggleCollapse={w.toggle}
        collapseDirection={side === 'left' ? 'left' : 'right'}
        isActive={isActive}
        onActivate={onActivate}
        isFilesVisible={w.isFilesVisible}
        onToggleFiles={w.toggleFiles}
        isLayersVisible={w.isLayersVisible}
        onToggleLayers={w.toggleLayers}
        footer={footer}
      >
        {w.isFilesVisible && (
          <div className="border-b p-2">
            <BiometricImageCarousel
              type={type}
              caseId={caseId}
              selectedId={w.selectedTrace?.id}
              onSelect={w.setSelectedTrace}
              selectedTraceId={selectedTraceId}
            />
          </div>
        )}
        <div className="min-h-0 flex-1 p-4">
          <div className="h-full overflow-hidden rounded-sm border border-grey-light-2">
            <BiometricImageCanvas
              image={w.selectedTrace}
              placeholder={t(`investigationCase.comparison.select${type === 'traces' ? 'Trace' : 'ReferencePrint'}`)}
              isToolbarVisible={isActive}
              isLayersVisible={w.isLayersVisible}
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
