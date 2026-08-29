import { Sparkle, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/features/shared/lib/utils'
import { Button } from '@/features/shared/ui/button'
import WorkbenchWindow from '@/features/shared/components/window/WorkbenchWindow'
import WindowActionButton from '@/features/shared/components/window/WindowActionButton'
import { BiometricImageCarousel, BiometricImageCanvas } from '@/features/biometric-image'
import type { BiometricImageDecoration } from '@/features/biometric-image/types/biometricImage'
import ZoomControls from '@/features/biometric-image/components/canvas/ZoomControls'
import RecenterButton from '@/features/biometric-image/components/canvas/RecenterControl'
import type { ComparisonWindowState } from '@/features/investigation-case/hooks/useComparisonWindow'

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

export type ComparisonWorkbenchProps = {
  side: 'left' | 'right'
  type: 'traces' | 'reference-prints'
  caseId: string
  isActive: boolean
  onActivate: () => void
  window: ComparisonWindowState
  isComparing?: boolean
  onAnalyze?: () => void
  selectedTraceId?: string
  /** Rendu du bouton réduire (sidebar) : uniquement en mode panneau redimensionnable */
  onToggleCollapse?: () => void
  isCollapsed?: boolean
  /** Rendu du bouton détacher/rattacher (double fenêtre) */
  isDetached?: boolean
  onToggleDetach?: () => void
  /** Habillage des vignettes du carrousel par id d'image (libellé, bordure) */
  imageDecorations?: Record<string, BiometricImageDecoration>
}

/**
 * Contenu présentationnel d'un comparateur (titre + canvas + footer), réutilisé
 * dans un panneau redimensionnable (`ComparisonWindow`) et en pleine fenêtre
 * détachée (`DetachedReferencePrintsPage`).
 */
export default function ComparisonWorkbench({
  side,
  type,
  caseId,
  isActive,
  onActivate,
  window: w,
  isComparing,
  onAnalyze,
  selectedTraceId,
  onToggleCollapse,
  isCollapsed,
  isDetached,
  onToggleDetach,
  imageDecorations,
}: ComparisonWorkbenchProps) {
  const { t } = useTranslation()
  const keys = TITLES[type]

  const title = w.selectedTrace ? t(keys.withFile, { fileName: w.selectedTrace.fileName }) : t(keys.base)

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
            size="small"
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
    <WorkbenchWindow
      title={title}
      icon={ICON[type]}
      isCollapsed={isCollapsed}
      onToggleCollapse={onToggleCollapse}
      isActive={isActive}
      onActivate={onActivate}
      isFilesVisible={w.isFilesVisible}
      onToggleFiles={w.toggleFiles}
      isDetached={isDetached}
      onToggleDetach={onToggleDetach}
      footer={footer}
    >
      {w.isFilesVisible && (
        <BiometricImageCarousel
          type={type}
          caseId={caseId}
          selectedId={w.selectedTrace?.id}
          onSelect={w.setSelectedTrace}
          selectedTraceId={selectedTraceId}
          decorations={imageDecorations}
        />
      )}
      <div className="min-h-0 flex-1 p-2">
        <div className="h-full overflow-hidden rounded-sm border border-grey-light-2">
          <BiometricImageCanvas
            image={w.selectedTrace}
            type={type}
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
  )
}
