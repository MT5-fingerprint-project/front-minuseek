import { useParams } from 'react-router-dom'
import { useComparisonWindow } from '@/features/investigation-case/hooks/useComparisonWindow'
import ComparisonWorkbench from '@/features/investigation-case/components/comparison/ComparisonWorkbench'

/**
 * Comparateur "Empreintes" détaché, rendu en pleine fenêtre dans une popup
 * navigateur (route `comparaison/empreintes`). Comparateur autonome : il gère son
 * propre état, indépendant de la fenêtre de base. Le bouton double-fenêtre ferme
 * la popup ; la fenêtre de base restaure alors son panneau Empreintes.
 */
export default function DetachedReferencePrintsPage() {
  const { id } = useParams<{ id: string }>()
  const reference = useComparisonWindow()

  if (!id) return null

  return (
    <div className="h-full min-h-[500px]">
      <ComparisonWorkbench
        side="right"
        type="reference-prints"
        caseId={id}
        isActive
        onActivate={() => {}}
        window={reference}
        isDetached
        onToggleDetach={() => window.close()}
      />
    </div>
  )
}
