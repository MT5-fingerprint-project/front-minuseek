import { Sparkle, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/features/shared/lib/utils'
import { ResizablePanel } from '@/features/shared/ui/resizable'
import { Button } from '@/features/shared/ui/button'
import WorkbenchWindow from '@/features/shared/components/window/WorkbenchWindow'
import WindowActionButton from '@/features/shared/components/window/WindowActionButton'
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

  const footer = (
    <>
      {/* Groupe gauche : zoom + recentrage + grille */}
      <div className="flex items-center gap-1">
        <ZoomControls
          scale={w.scale}
          onZoomIn={() => w.zoomRef.current?.zoomIn()}
          onZoomOut={() => w.zoomRef.current?.zoomOut()}
        />
        <RecenterButton onClick={() => w.zoomRef.current?.recenter()} />
        <WindowActionButton
          tone="footer"
          icon={w.isGridVisible ? 'gridOff' : 'grid'}
          label={t(w.isGridVisible ? 'common.window.hideGrid' : 'common.window.showGrid')}
          onClick={w.toggleGrid}
        />
      </div>
      {/* Groupe droite : analyse IA (fenêtre traces) + annuler/rétablir + calques */}
      <div className="flex items-center gap-1">
        {side === 'left' && w.selectedTrace && (
          <Button
            type="button"
            variant="outline"
            size="xs"
            disabled={isComparing}
            onClick={onAnalyze}
            className={cn(
              'relative mr-1 overflow-hidden rounded-full border-blue-medium-1/40 text-blue-medium-1 hover:border-blue-medium-1 hover:bg-blue-medium-1 hover:text-white',
            )}
          >
            {isComparing ? <Loader2 size={13} className="animate-spin" /> : <Sparkle size={13} />}
            {t('investigationCase.comparison.analyzeButton')}
          </Button>
        )}
        <WindowActionButton tone="footer" icon="redo" label={t('common.window.redo')} />
        <WindowActionButton tone="footer" icon="undo" label={t('common.window.undo')} />
        <span data-layers-toggle>
          <WindowActionButton
            tone="footer"
            icon={w.isLayersVisible ? 'layersOff' : 'layers'}
            label={t(w.isLayersVisible ? 'common.window.hideLayers' : 'common.window.showLayers')}
            onClick={w.toggleLayers}
          />
        </span>
      </div>
    </>
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
        isActive={isActive}
        onActivate={onActivate}
        isFilesVisible={w.isFilesVisible}
        onToggleFiles={w.toggleFiles}
        footer={footer}
      >
        {w.isFilesVisible && (
          <BiometricImageCarousel
            type={type}
            caseId={caseId}
            selectedId={w.selectedTrace?.id}
            onSelect={w.setSelectedTrace}
            selectedTraceId={selectedTraceId}
          />
        )}
        <div className="min-h-0 flex-1 p-2">
          <div className="h-full overflow-hidden rounded-sm border border-grey-light-2">
            <BiometricImageCanvas
              image={w.selectedTrace}
              placeholder={t(`investigationCase.comparison.select${type === 'traces' ? 'Trace' : 'ReferencePrint'}`)}
              isToolbarVisible={isActive}
              isLayersVisible={w.isLayersVisible}
              isGridVisible={w.isGridVisible}
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
