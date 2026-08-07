import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { ResizableHandle, ResizablePanelGroup } from '@/features/shared/ui/resizable'
import { useComparisonWindow } from '@/features/investigation-case/hooks/useComparisonWindow'
import { useDetachedWindow } from '@/features/shared/hooks/useDetachedWindow'
import ComparisonWindow from '@/features/investigation-case/components/comparison/ComparisonWindow'
import HitButton from '@/features/investigation-case/components/comparison/HitButton'
import { useBiometricImages } from '@/features/biometric-image/hooks/useBiometricImages'
import { useCompare } from '@/features/biometric-image/hooks/useCompare'
import { useLayers } from '@/features/biometric-image/hooks/useLayers'
import { useHits, useToggleHit } from '@/features/biometric-image/hooks/useHits'
import { countMinutiae, REQUIRED_MINUTIAE } from '@/features/biometric-image/lib/minutiae'

export default function InvestigationCaseComparisonPage() {
  const { slug, id } = useParams<{ slug: string; id: string }>()
  const [activeWindow, setActiveWindow] = useState<'trace' | 'reference'>()
  const trace = useComparisonWindow()
  const reference = useComparisonWindow()
  const referenceWindow = useDetachedWindow('minuseek-reference-prints')

  const { data: referencePrints = [] } = useBiometricImages('reference-prints', id ?? '')
  const compare = useCompare()

  const traceId = trace.selectedTrace?.id
  const referenceId = reference.selectedTrace?.id

  const { data: traceLayers } = useLayers(traceId)
  const { data: referenceLayers } = useLayers(referenceId)
  const { data: hitReferenceIds } = useHits(traceId)
  const toggleHit = useToggleHit(traceId)

  const isHit = !!referenceId && (hitReferenceIds?.includes(referenceId) ?? false)
  const hasEnoughMinutiae =
    countMinutiae(traceLayers) >= REQUIRED_MINUTIAE &&
    countMinutiae(referenceLayers) >= REQUIRED_MINUTIAE
  const isHitDisabled = !traceId || !referenceId || !hasEnoughMinutiae || toggleHit.isPending

  const runCompare = () => {
    if (!trace.selectedTrace || referencePrints.length === 0 || !id) return
    compare.mutate({ caseId: id, trace: trace.selectedTrace, referencePrints })
  }

  const detachReference = () => {
    if (!slug || !id) return
    referenceWindow.open(`${window.location.origin}/${slug}/affaires/${id}/comparaison/empreintes`)
  const onToggleHit = () => {
    if (!id || !referenceId) return
    toggleHit.mutate({ caseId: id, referencePrintId: referenceId, isHit })
  }

  if (!id) return null

  return (
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
      />
      <ResizableHandle withHandle className="w-2 bg-transparent">
        {/* Ancré sur le séparateur → suit le drag ; posé vers le bas. */}
        <div
          className="pointer-events-auto absolute bottom-8 left-1/2 z-20 -translate-x-1/2 -translate-y-full"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <HitButton isHit={isHit} disabled={isHitDisabled} onClick={onToggleHit} />
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
      />
    </ResizablePanelGroup>
  )
}
