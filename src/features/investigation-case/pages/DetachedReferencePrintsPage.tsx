import { useParams } from 'react-router-dom'
import { useComparisonWindow } from '@/features/investigation-case/hooks/useComparisonWindow'
import { useReferencePrintDecorations } from '@/features/investigation-case/hooks/useReferencePrintDecorations'
import { useDetachedTraceId } from '@/features/investigation-case/hooks/useDetachedTraceId'
import { useMinutiaPairs } from '@/features/investigation-case/hooks/useMinutiaPairs'
import ComparisonWorkbench from '@/features/investigation-case/components/comparison/ComparisonWorkbench'
import ClosedCaseBanner from '@/features/investigation-case/components/ClosedCaseBanner'
import BlindVerificationBanner from '@/features/investigation-case/components/comparison/BlindVerificationBanner'
import { useMissionOnCase } from '@/features/investigation-case/hooks/useMissionOnCase'
import { isInProgress } from '@/features/shared/types/verification'

/**
 * Comparateur "Empreintes" détaché, rendu en pleine fenêtre dans une popup
 * navigateur (route `comparaison/empreintes`). Comparateur autonome : il gère son
 * propre état, indépendant de la fenêtre de base. Le bouton double-fenêtre ferme
 * la popup ; la fenêtre de base restaure alors son panneau Empreintes.
 *
 * La trace comparée vient de l'atelier : sans elle, la popup ignorerait les
 * appariements et laisserait supprimer une minutie appariée sans prévenir.
 */
export default function DetachedReferencePrintsPage() {
  const { id } = useParams<{ id: string }>()
  const traceId = useDetachedTraceId()
  const reference = useComparisonWindow()
  const referenceDecorations = useReferencePrintDecorations(id ?? '')
  const minutiaPairs = useMinutiaPairs(traceId, reference.selectedTrace?.id)
  const mission = useMissionOnCase(id ?? '')

  if (!id) return null

  return (
    <div className="flex h-full min-h-[500px] flex-col gap-2">
      <ClosedCaseBanner caseId={id} />
      {mission !== undefined && isInProgress(mission) && <BlindVerificationBanner />}
      <ComparisonWorkbench
        side="right"
        type="reference-prints"
        caseId={id}
        isActive
        onActivate={() => {}}
        window={reference}
        selectedTraceId={traceId}
        isDetached
        onToggleDetach={() => window.close()}
        imageDecorations={referenceDecorations}
        minutiaNumbers={minutiaPairs.numberByMinutiaId}
      />
    </div>
  )
}
