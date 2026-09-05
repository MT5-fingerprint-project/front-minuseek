import { useEffect, useMemo, useState } from 'react'
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
import PairRequalificationDialog from '@/features/investigation-case/components/comparison/PairRequalificationDialog'
import ClosedCaseBanner from '@/features/investigation-case/components/ClosedCaseBanner'
import BlindVerificationBanner from '@/features/investigation-case/components/comparison/BlindVerificationBanner'
import VerificationPanel from '@/features/investigation-case/components/comparison/VerificationPanel'
import { useMissionOnCase } from '@/features/investigation-case/hooks/useMissionOnCase'
import { useMinutiaPairs } from '@/features/investigation-case/hooks/useMinutiaPairs'
import { useConcordancePlayback } from '@/features/investigation-case/hooks/useConcordancePlayback'
import { minutiaPairKeys } from '@/features/investigation-case/hooks/minutiaPairKeys'
import ConcordancePlaybackControls from '@/features/investigation-case/components/comparison/ConcordancePlaybackControls'
import ConcordanceLinkOverlay from '@/features/investigation-case/components/comparison/ConcordanceLinkOverlay'
import { DETACHED_REFERENCE_TRACE_CHANGED } from '@/features/investigation-case/types/detachedReference'
import { isInProgress } from '@/features/shared/types/verification'
import { useCaseIsClosed } from '@/features/investigation-case/hooks/useCaseIsClosed'
import { biometricImageKeys, useBiometricImages } from '@/features/biometric-image/hooks/useBiometricImages'
import { useCompare } from '@/features/biometric-image/hooks/useCompare'
import { layerKeys, useLayers } from '@/features/biometric-image/hooks/useLayers'
import { useHits, useToggleHit } from '@/features/biometric-image/hooks/useHits'
import { countMinutiae, REQUIRED_MINUTIAE, type MinutiaType } from '@/features/biometric-image/lib/minutiae'
import { minutiaTypeInLayers, resolvePairType } from '@/features/biometric-image/lib/minutiaPairing'
import { useAtelierTour } from '@/features/investigation-case/hooks/useAtelierTour'
import { useComparisonTour } from '@/features/investigation-case/context/comparison-tour-context'

type ArmedMinutia = { side: 'trace' | 'reference'; minutiaId: string }

type PendingRequalification = {
  traceMinutiaId: string
  referenceMinutiaId: string
  sideToQualify: 'TRACE' | 'REFERENCE'
  newType: MinutiaType
}

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
    // Supprimer une minutie dans la popup casse la paire côté base : les badges du canevas de trace mentent sinon.
    queryClient.invalidateQueries({ queryKey: minutiaPairKeys.all })
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
  const [pendingRequalification, setPendingRequalification] = useState<PendingRequalification | null>(null)
  const minutiaPairs = useMinutiaPairs(traceId, referenceId)
  const canPair = !!traceId && !!referenceId

  // Mode démonstration des concordances (L7-3) : lecture pair par pair, état UI
  // éphémère, rien n'est enregistré.
  const sortedPairs = useMemo(
    () => [...minutiaPairs.pairs].sort((a, b) => a.number - b.number),
    [minutiaPairs.pairs]
  )
  const playback = useConcordancePlayback(sortedPairs.length)
  const isConcordanceMode = playback.status !== 'idle'
  const activePair = playback.activeIndex != null ? (sortedPairs[playback.activeIndex] ?? null) : null
  // `activePair` fait toujours partie de `revealedPairs` (revealedCount = activeIndex + 1).
  const revealedPairs = useMemo(() => sortedPairs.slice(0, playback.revealedCount), [sortedPairs, playback.revealedCount])
  const revealedTraceIds = useMemo(
    () => new Set(revealedPairs.map((pair) => pair.traceMinutiaLayerId)),
    [revealedPairs]
  )
  const revealedReferenceIds = useMemo(
    () => new Set(revealedPairs.map((pair) => pair.referenceMinutiaLayerId)),
    [revealedPairs]
  )

  // Changer de trace ou d'empreinte périme la sélection en cours d'appariement.
  // Ajustée pendant le rendu (pas dans un effet) : évite un rendu supplémentaire.
  const [armedFor, setArmedFor] = useState<string>()
  const pairingKey = `${traceId ?? ''}:${referenceId ?? ''}`
  if (armedFor !== pairingKey) {
    setArmedFor(pairingKey)
    if (armed) setArmed(null)
    if (pendingRequalification) setPendingRequalification(null)
  }

  const togglePairingMode = () => {
    if (!canPair || isConcordanceMode) return
    setPairingMode((active) => !active)
    setArmed(null)
    setPendingRequalification(null)
  }

  const startConcordance = () => {
    if (isPairingMode || sortedPairs.length === 0) return
    setPairingMode(false)
    setArmed(null)
    playback.play()
  }

  // Seule la page a les deux listes de calques : la règle de type se joue donc ici, avant l'appel.
  const requestPair = (traceMinutiaId: string, referenceMinutiaId: string) => {
    const traceType = minutiaTypeInLayers(traceLayers, traceMinutiaId)
    const referenceType = minutiaTypeInLayers(referenceLayers, referenceMinutiaId)
    if (!traceType || !referenceType) {
      minutiaPairs.createPair(traceMinutiaId, referenceMinutiaId)
      return
    }
    const decision = resolvePairType(traceType, referenceType)
    if (decision.outcome === 'REFUSED') {
      toast.error(
        t('investigationCase.comparison.pairingTypeMismatch', {
          traceType: t(`biometricImage.minutia.types.${decision.traceType}`),
          referenceType: t(`biometricImage.minutia.types.${decision.referenceType}`),
        })
      )
      return
    }
    if (decision.outcome === 'QUALIFIES') {
      setPendingRequalification({
        traceMinutiaId,
        referenceMinutiaId,
        sideToQualify: decision.sideToQualify,
        newType: decision.type,
      })
      return
    }
    minutiaPairs.createPair(traceMinutiaId, referenceMinutiaId)
  }

  const confirmRequalification = () => {
    if (!pendingRequalification) return
    minutiaPairs.createPair(pendingRequalification.traceMinutiaId, pendingRequalification.referenceMinutiaId)
    setPendingRequalification(null)
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
    requestPair(traceMinutiaId, referenceMinutiaId)
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

  // Le trait de liaison ne peut pas traverser deux fenêtres du système
  // d'exploitation : détacher l'empreinte de référence coupe la démonstration.
  const stopPlayback = playback.stop
  useEffect(() => {
    if (isReferenceDetached && isConcordanceMode) stopPlayback()
  }, [isReferenceDetached, isConcordanceMode, stopPlayback])

  // La popup est une instance d'app à part : la trace choisie ici ne lui parvient
  // que par l'adresse d'ouverture, puis par message. Sans elle, elle ignore les
  // appariements et laisserait supprimer une minutie appariée sans un mot.
  const detachedReferenceUrl =
    slug && id
      ? `${window.location.origin}/${slug}/affaires/${id}/comparaison/empreintes${traceId ? `?trace=${traceId}` : ''
      }`
      : null

  const toggleDetachReference = () => {
    if (isReferenceDetached) {
      referenceWindow.close()
      return
    }
    if (!detachedReferenceUrl) return
    referenceWindow.open(detachedReferenceUrl)
  }

  // Changer de trace pendant le détachement : la popup est prévenue par message,
  // sinon elle garderait les paires de la trace précédente.
  const postToDetachedReference = referenceWindow.post
  useEffect(() => {
    postToDetachedReference({ type: DETACHED_REFERENCE_TRACE_CHANGED, traceId: traceId ?? null })
  }, [traceId, postToDetachedReference])

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
          isConcordanceMode={isConcordanceMode}
          revealedMinutiaIds={revealedTraceIds}
          activeMinutiaId={isConcordanceMode ? (activePair?.traceMinutiaLayerId ?? null) : null}
        />
        <ResizableHandle withHandle className="w-2 bg-transparent">
          {/* Ancré sur le séparateur → suit le drag ; posé vers le bas. */}
          <div
            className="pointer-events-auto absolute bottom-2 left-1/2 z-20 flex flex-col -translate-x-1/2 -translate-y-full items-center gap-3"
            onMouseDown={(e) => e.stopPropagation()}
            data-tour="hit-match"
          >
            {mission === undefined &&
              (isConcordanceMode ? (
                <ConcordancePlaybackControls
                  status={playback.status}
                  speed={playback.speed}
                  revealedCount={playback.revealedCount}
                  pairCount={sortedPairs.length}
                  onPlay={startConcordance}
                  onToggle={playback.toggle}
                  onSpeedChange={playback.setSpeed}
                  onStop={playback.stop}
                />
              ) : (
                <>
                  {!isCaseClosed && (
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
                  <ConcordancePlaybackControls
                    status="idle"
                    speed={playback.speed}
                    revealedCount={0}
                    pairCount={sortedPairs.length}
                    disabledReason={
                      sortedPairs.length === 0 ? 'noPairs' : isPairingMode ? 'pairingActive' : null
                    }
                    onPlay={startConcordance}
                    onToggle={playback.toggle}
                    onSpeedChange={playback.setSpeed}
                    onStop={playback.stop}
                  />
                </>
              ))}
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
          isConcordanceMode={isConcordanceMode}
          revealedMinutiaIds={revealedReferenceIds}
          activeMinutiaId={isConcordanceMode ? (activePair?.referenceMinutiaLayerId ?? null) : null}
        />
      </ResizablePanelGroup>
      <ConcordanceLinkOverlay
        isActive={isConcordanceMode}
        pairs={revealedPairs}
        activePairId={activePair?.id ?? null}
        getTracePosition={(minutiaId) => trace.concordanceRef.current?.getMinutiaScreenPosition(minutiaId) ?? null}
        getReferencePosition={(minutiaId) =>
          reference.concordanceRef.current?.getMinutiaScreenPosition(minutiaId) ?? null
        }
      />
      {pendingRequalification && (
        <PairRequalificationDialog
          sideToQualify={pendingRequalification.sideToQualify}
          newType={pendingRequalification.newType}
          onConfirm={confirmRequalification}
          onCancel={() => setPendingRequalification(null)}
        />
      )}
      {mission && <VerificationPanel verificationId={mission.id} caseId={id} />}
    </div>
  )
}
