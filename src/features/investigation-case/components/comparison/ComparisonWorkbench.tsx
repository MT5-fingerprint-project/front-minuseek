import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Sparkle, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { cn } from '@/features/shared/lib/utils'
import { Button } from '@/features/shared/ui/button'
import { Icon } from '@/features/shared/icons'
import WorkbenchWindow from '@/features/shared/components/window/WorkbenchWindow'
import WindowActionButton from '@/features/shared/components/window/WindowActionButton'
import { BiometricImageCarousel, BiometricImageCanvas } from '@/features/biometric-image'
import TraceDeclarationButtons from '@/features/biometric-image/components/trace/TraceDeclarationButtons'
import type { BiometricImageDecoration } from '@/features/biometric-image/types/biometricImage'
import ZoomControls from '@/features/biometric-image/components/canvas/ZoomControls'
import RecenterButton from '@/features/biometric-image/components/canvas/RecenterControl'
import ImageSizeDialog from '@/features/biometric-image/components/canvas/ImageSizeDialog'
import { useBiometricImages, useCalibrateBiometricImage } from '@/features/biometric-image/hooks/useBiometricImages'
import { pxPerCmFromResolutionDpi } from '@/features/biometric-image/lib/imageSize'
import type { ComparisonWindowState } from '@/features/investigation-case/hooks/useComparisonWindow'
import { useInvestigationCase } from '@/features/investigation-case/hooks/useInvestigationCases'
import { downloadBlob, exportFileName } from '@/features/biometric-image/lib/exportImage'

const TITLES = {
  traces: {
    base: 'investigationCase.comparison.tracesWindow',
    selected: 'investigationCase.comparison.tracesWindowSelected',
  },
  'reference-prints': {
    base: 'investigationCase.comparison.referencePrintsWindow',
    selected: 'investigationCase.comparison.referencePrintsWindowSelected',
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
  /** Mode démonstration (L7-2b) : appariement des minuties entre trace et empreinte. */
  isPairingMode?: boolean
  armedMinutiaId?: string | null
  minutiaNumbers?: Map<string, number>
  onMinutiaClick?: (minutiaId: string) => void
  onPairMiss?: () => void
  /** Mode lecture des concordances (L7-3). */
  isConcordanceMode?: boolean
  revealedMinutiaIds?: Set<string>
  activeMinutiaId?: string | null
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
  isPairingMode = false,
  armedMinutiaId = null,
  minutiaNumbers,
  onMinutiaClick,
  onPairMiss,
  isConcordanceMode = false,
  revealedMinutiaIds,
  activeMinutiaId = null,
}: ComparisonWorkbenchProps) {
  const { t } = useTranslation()
  const keys = TITLES[type]
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { data: investigationCase } = useInvestigationCase(caseId)

  // Le carrousel alimente le même cache : aucune requête supplémentaire n'est déclenchée ici.
  const { data: images } = useBiometricImages(type, caseId)
  const freshImage = images?.find((img) => img.id === w.selectedTrace?.id) ?? w.selectedTrace
  const resolutionDpi = freshImage?.resolutionDpi ?? null
  const calibrate = useCalibrateBiometricImage(type, freshImage?.caseId ?? '')
  const [isImageSizeDialogOpen, setIsImageSizeDialogOpen] = useState(false)

  const title = w.selectedTrace ? t(keys.selected, { label: w.selectedTrace.label }) : t(keys.base)

  const actions =
    type === 'traces' && w.selectedTrace ? (
      <>
        <WindowActionButton
          icon="information"
          label={t('trace.panel.open')}
          onClick={() => navigate(`/${slug}/affaires/${caseId}/traces?trace=${w.selectedTrace?.id}`)}
        />
        {side === 'left' && (
          <Button
            type="button"
            variant="outline"
            size="small"
            disabled={isComparing}
            onClick={onAnalyze}
            data-tour="analyze-button"
            className={cn(
              'relative mr-1 overflow-hidden rounded-full border-white/30 bg-white/10 text-white hover:bg-white hover:text-blue-medium-1',
            )}
          >
            {isComparing ? <Loader2 size={13} className="animate-spin" /> : <Sparkle size={13} />}
            {t('investigationCase.comparison.analyzeButton')}
          </Button>
        )}
      </>
    ) : undefined

  const handleExport = async () => {
    try {
      const blob = await w.exportRef.current?.exportToBlob()
      if (!blob) return
      const kind = type === 'traces' ? 'trace' : 'reference'
      const fileName = exportFileName(investigationCase?.caseNumber ?? '', kind, new Date())
      downloadBlob(blob, fileName)
    } catch {
      toast.error(t('biometricImage.export.failed'))
    }
  }

  const footer = (
    <>
      {/* Groupe gauche : zoom + recentrage + grille */}
      <div className="flex items-center gap-1">
        <ZoomControls
          scale={w.scale}
          onZoomIn={() => w.zoomRef.current?.zoomIn()}
          onZoomOut={() => w.zoomRef.current?.zoomOut()}
        />
        <WindowActionButton
          tone="footer"
          icon={w.isGridVisible ? 'gridOff' : 'grid'}
          label={t(w.isGridVisible ? 'common.window.hideGrid' : 'common.window.showGrid')}
          onClick={w.toggleGrid}
        />
        <RecenterButton onClick={() => w.zoomRef.current?.recenter()} />
        {w.selectedTrace && (
          <button
            type="button"
            // Une pièce sans échelle se mesure sur sa règle photographiée : la saisie
            // au clavier ne s'ouvre qu'une fois une résolution établie, pour la corriger.
            onClick={() =>
              resolutionDpi === null
                ? w.rulerRef.current?.arm()
                : setIsImageSizeDialogOpen((open) => !open)
            }
            title={t(
              resolutionDpi === null
                ? 'biometricImage.imageSize.calibrateWithRuler'
                : 'biometricImage.imageSize.title',
            )}
            className={cn(
              'flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium hover:text-grey-dark',
              resolutionDpi === null
                ? 'bg-orange-light text-orange-medium hover:text-orange-medium'
                : 'bg-grey-light-1 text-grey-medium-2',
            )}
          >
            {resolutionDpi !== null
              ? t('biometricImage.imageSize.chip', { value: Math.round(pxPerCmFromResolutionDpi(resolutionDpi)) })
              : t('biometricImage.imageSize.chipUncalibrated')}
            <Icon name={resolutionDpi === null ? 'ruler' : 'pen'} size={14} color="currentColor" />
          </button>
        )}
      </div>
      {/* Groupe droite : exploitabilité (fenêtre traces) + annuler/rétablir + calques */}
      <div className="flex items-center gap-1">
        {type === 'traces' && freshImage && (
          <TraceDeclarationButtons trace={freshImage} caseId={caseId} variant="compact" />
        )}
        <WindowActionButton tone="footer" icon="redo" label={t('common.window.redo')} />
        <WindowActionButton tone="footer" icon="undo" label={t('common.window.undo')} />
        {w.selectedTrace && (
          <WindowActionButton tone="footer" icon="fileExport" label={t('common.window.export')} onClick={handleExport} />
        )}
        <span data-layers-toggle {...(side === 'left' ? { 'data-tour': 'layers-toggle' } : {})}>
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
      actions={actions}
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
        <div className="relative h-full overflow-hidden rounded-sm border border-grey-light-2">
          <BiometricImageCanvas
            image={freshImage}
            type={type}
            placeholder={t(`investigationCase.comparison.select${type === 'traces' ? 'Trace' : 'ReferencePrint'}`)}
            isToolbarVisible={isActive}
            isLayersVisible={w.isLayersVisible}
            isGridVisible={w.isGridVisible}
            onCloseLayers={w.closeLayersPanel}
            zoomHandleRef={w.zoomRef}
            onScaleChange={w.handleScaleChange}
            onSourceGeometryChange={w.setSourceGeometry}
            exportHandleRef={w.exportRef}
            rulerHandleRef={w.rulerRef}
            isPairingMode={isPairingMode}
            armedMinutiaId={armedMinutiaId}
            minutiaNumbers={minutiaNumbers}
            onMinutiaClick={onMinutiaClick}
            onPairMiss={onPairMiss}
            concordanceHandleRef={w.concordanceRef}
            isConcordanceMode={isConcordanceMode}
            revealedMinutiaIds={revealedMinutiaIds}
            activeMinutiaId={activeMinutiaId}
          />
          {isImageSizeDialogOpen && w.sourceGeometry && (
            <ImageSizeDialog
              sourceWidth={w.sourceGeometry.sourceWidth}
              sourceHeight={w.sourceGeometry.sourceHeight}
              resolutionDpi={resolutionDpi}
              isSaving={calibrate.isPending}
              onValidate={(dpi) => {
                if (!freshImage) return
                calibrate.mutate({ id: freshImage.id, resolutionDpi: dpi })
                setIsImageSizeDialogOpen(false)
              }}
              onClose={() => setIsImageSizeDialogOpen(false)}
            />
          )}
        </div>
      </div>
    </WorkbenchWindow>
  )
}
