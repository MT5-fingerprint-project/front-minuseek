import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ResizableHandle, ResizablePanelGroup } from '@/features/shared/ui/resizable'
import { useComparisonWindow } from '@/features/investigation-case/hooks/useComparisonWindow'
import { useReferencePrintDecorations } from '@/features/investigation-case/hooks/useReferencePrintDecorations'
import { useDetachedWindow } from '@/features/shared/hooks/useDetachedWindow'
import ComparisonWindow from '@/features/investigation-case/components/comparison/ComparisonWindow'
import ComparisonWorkbench from '@/features/investigation-case/components/comparison/ComparisonWorkbench'
import HitButton from '@/features/investigation-case/components/comparison/HitButton'
import PairingControls from '@/features/investigation-case/components/comparison/PairingControls'
import ClosedCaseBanner from '@/features/investigation-case/components/ClosedCaseBanner'
import BlindVerificationBanner from '@/features/investigation-case/components/comparison/BlindVerificationBanner'
import VerificationPanel from '@/features/investigation-case/components/comparison/VerificationPanel'
import { useMissionOnCase } from '@/features/investigation-case/hooks/useMissionOnCase'
import { useMinutiaPairs } from '@/features/investigation-case/hooks/useMinutiaPairs'
import { isInProgress } from '@/features/shared/types/verification'
import { useCaseIsClosed } from '@/features/investigation-case/hooks/useCaseIsClosed'
import { biometricImageKeys, useBiometricImages } from '@/features/biometric-image/hooks/useBiometricImages'
import { useCompare } from '@/features/biometric-image/hooks/useCompare'
import { layerKeys, useLayers } from '@/features/biometric-image/hooks/useLayers'
import { useHits, useToggleHit } from '@/features/biometric-image/hooks/useHits'
import { countMinutiae, REQUIRED_MINUTIAE } from '@/features/biometric-image/lib/minutiae'
import { useAtelierTour } from '@/features/investigation-case/hooks/useAtelierTour'
import { useComparisonTour } from '@/features/investigation-case/context/comparison-tour-context'

type ArmedMinutia = { side: 'trace' | 'reference'; minutiaId: string }

export default function InvestigationCaseComparisonPage() {
  const { t } = useTranslation()
  const { slug, id } = useParams<{ slug: string; id: string }>()
  const [activeWindow, setActiveWindow] = useState<'trace' | 'reference'>()
  const trace = useComparisonWindow()
  const reference = useComparisonWindow()
  const queryClient = useQueryClient()
  // La popup est une instance d'app à part (cache React Query indépendant) : au
  // rattachement, on invalide ce qu'elle a pu modifier pour refléter ses édits.
  const referenceWindow = useDetachedWindow('minuseek-reference-prints', () => {
    queryClient.invalidateQueries({ queryKey: layerKeys.all })
    queryClient.invalidateQueries({ queryKey: biometricImageKeys.list('reference-prints', id ?? '') })
  })

  const { data: referencePrints = [] } = useBiometricImages('reference-prints', id ?? '')
  // Même clé de cache que le carrousel/ComparisonWorkbench : aucune requête supplémentaire.
  const { data: traces, isLoading: isTracesLoading } = useBiometricImages('traces', id ?? '')
  const referenceDecorations = useReferencePrintDecorations(id ?? '')
  const compare = useCompare()

  const prepareTourScreen = () => {
    setActiveWindow('trace')
    if (!trace.selectedTrace && traces?.[0]) trace.setSelectedTrace(traces[0])
  }
  const { restartTour } = useAtelierTour(!isTracesLoading, prepareTourScreen)
  const { registerRestartTour } = useComparisonTour()
  useEffect(() => {
    registerRestartTour(restartTour)
    return () => registerRestartTour(null)
  }, [registerRestartTour, restartTour])

  const traceId = trace.selectedTrace?.id
  const referenceId = reference.selectedTrace?.id

  const { data: traceLayers } = useLayers(traceId)
  const { data: referenceLayers } = useLayers(referenceId)
  const { data: hitReferenceIds } = useHits(traceId)
  const toggleHit = useToggleHit(traceId)
  const isCaseClosed = useCaseIsClosed(id ?? '')
  const mission = useMissionOnCase(id ?? '')
  const isBlind = mission !== undefined && isInProgress(mission)

  const [isPairingMode, setPairingMode] = useState(false)
  const [armed, setArmed] = useState<ArmedMinutia | null>(null)
  const minutiaPairs = useMinutiaPairs(traceId, referenceId)
  const canPair = !!traceId && !!referenceId

  // Changer de trace ou d'empreinte périme la sélection en cours d'appariement.
  // Ajustée pendant le rendu (pas dans un effet) : évite un rendu supplémentaire.
  const [armedFor, setArmedFor] = useState<string>()
  const pairingKey = `${traceId ?? ''}:${referenceId ?? ''}`
  if (armedFor !== pairingKey) {
    setArmedFor(pairingKey)
    if (armed) setArmed(null)
  }

  const togglePairingMode = () => {
    if (!canPair) return
    setPairingMode((active) => !active)
    setArmed(null)
  }

  const handleMinutiaClick = (side: 'trace' | 'reference', minutiaId: string) => {
    if (minutiaPairs.numberByMinutiaId.has(minutiaId)) {
      minutiaPairs.deletePairByMinutiaId(minutiaId)
      setArmed(null)
      return
    }
    if (!armed) {
      setArmed({ side, minutiaId })
      toast.info(t('investigationCase.comparison.pairingArmedHint'))
      return
    }
    if (armed.side === side) {
      if (armed.minutiaId === minutiaId) {
        setArmed(null)
        toast.info(t('investigationCase.comparison.pairingCancelled'))
        return
      }
      toast.info(t('investigationCase.comparison.pairingSameSideError'))
      setArmed({ side, minutiaId })
      return
    }
    const traceMinutiaId = side === 'trace' ? minutiaId : armed.minutiaId
    const referenceMinutiaId = side === 'reference' ? minutiaId : armed.minutiaId
    minutiaPairs.createPair(traceMinutiaId, referenceMinutiaId)
    setArmed(null)
  }

  const handlePairMiss = () => {
    toast.info(t('investigationCase.comparison.pairingMissHint'))
  }

  const isHit = !!referenceId && (hitReferenceIds?.includes(referenceId) ?? false)
  const hasEnoughMinutiae =
    countMinutiae(traceLayers) >= REQUIRED_MINUTIAE &&
    countMinutiae(referenceLayers) >= REQUIRED_MINUTIAE
  const isHitDisabled = !traceId || !referenceId || !hasEnoughMinutiae || toggleHit.isPending

  const runCompare = () => {
    // Une empreinte détruite n'a plus de fichier : l'envoyer au moteur ferait
    // remonter une erreur technique incompréhensible.
    const comparable = referencePrints.filter((print) => print.imageDestroyedAt === null)
    if (!trace.selectedTrace || comparable.length === 0 || !id) return
    compare.mutate({ caseId: id, trace: trace.selectedTrace, referencePrints: comparable })
  }

  const onToggleHit = () => {
    if (!id || !referenceId) return
    toggleHit.mutate({ caseId: id, referencePrintId: referenceId, isHit })
  }

  const isReferenceDetached = referenceWindow.isOpen

  const toggleDetachReference = () => {
    if (isReferenceDetached) {
      referenceWindow.close()
      return
    }
    if (!slug || !id) return
    referenceWindow.open(`${window.location.origin}/${slug}/affaires/${id}/comparaison/empreintes`)
  }

  if (!id) return null

  // Empreintes détachées dans leur propre fenêtre : les traces prennent toute la
  // largeur ; la fermeture de la popup (détectée par useDetachedWindow) restaure le split.
  if (isReferenceDetached) {
    return (
      <div className="flex h-full min-h-[500px] flex-col gap-2">
        <ClosedCaseBanner caseId={id} />
        {isBlind && <BlindVerificationBanner />}
        <ComparisonWorkbench
          side="left"
          type="traces"
          caseId={id}
          isActive
          onActivate={() => setActiveWindow('trace')}
          window={trace}
          isComparing={compare.isPending}
          onAnalyze={runCompare}
        />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-2">
      <ClosedCaseBanner caseId={id} />
      {isBlind && <BlindVerificationBanner />}
      <ResizablePanelGroup orientation="horizontal" className="h-full min-h-[500px]">
        <ComparisonWindow
          side="left"
          type="traces"
          caseId={id}
          isActive={activeWindow === 'trace'}
          onActivate={() => setActiveWindow('trace')}
          window={trace}
          isComparing={compare.isPending}
          onAnalyze={runCompare}
          isPairingMode={isPairingMode}
          armedMinutiaId={armed?.side === 'trace' ? armed.minutiaId : null}
          minutiaNumbers={minutiaPairs.numberByMinutiaId}
          onMinutiaClick={(minutiaId) => handleMinutiaClick('trace', minutiaId)}
          onPairMiss={handlePairMiss}
        />
        <ResizableHandle withHandle className="w-2 bg-transparent">
          {/* Ancré sur le séparateur → suit le drag ; posé vers le bas. */}
          <div
            className="pointer-events-auto absolute bottom-2 left-1/2 z-20 flex flex-col -translate-x-1/2 -translate-y-full items-center gap-4"
            onMouseDown={(e) => e.stopPropagation()}
            data-tour="hit-match"
          >
            {!isCaseClosed && mission === undefined && (
              <>
                <HitButton isHit={isHit} disabled={isHitDisabled} onClick={onToggleHit} />
                <PairingControls
                  isActive={isPairingMode}
                  disabled={!canPair}
                  pairCount={minutiaPairs.pairs.length}
                  onToggle={togglePairingMode}
                />
              </>
            )}
          </div>
        </ResizableHandle>
        <ComparisonWindow
          side="right"
          type="reference-prints"
          caseId={id}
          isActive={activeWindow === 'reference'}
          onActivate={() => setActiveWindow('reference')}
          window={reference}
          selectedTraceId={trace.selectedTrace?.id}
          onToggleDetach={toggleDetachReference}
          imageDecorations={referenceDecorations}
          isPairingMode={isPairingMode}
          armedMinutiaId={armed?.side === 'reference' ? armed.minutiaId : null}
          minutiaNumbers={minutiaPairs.numberByMinutiaId}
          onMinutiaClick={(minutiaId) => handleMinutiaClick('reference', minutiaId)}
          onPairMiss={handlePairMiss}
        />
      </ResizablePanelGroup>
      {mission && <VerificationPanel verificationId={mission.id} caseId={id} />}
    </div>
  )
}
