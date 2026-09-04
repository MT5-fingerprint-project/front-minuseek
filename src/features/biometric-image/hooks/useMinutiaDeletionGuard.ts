import { useCallback, useState } from 'react'

type PendingDeletion = { pairNumber: number; deleteMinutia: () => void }

/**
 * Intercale une confirmation quand la minutie supprimée forme une paire. Les deux
 * chemins de suppression (touche Suppr du canevas, croix du panneau de calques) passent
 * par `requestDeletion`, dont l'identité ne change qu'avec les paires : l'effet clavier
 * d'`AnnotationLayer` en dépend et se rebrancherait à chaque rendu sinon.
 */
export function useMinutiaDeletionGuard(pairNumberByMinutiaId: Map<string, number> | undefined) {
  const [pending, setPending] = useState<PendingDeletion | null>(null)

  const requestDeletion = useCallback(
    (minutiaLayerId: string, deleteMinutia: () => void) => {
      const pairNumber = pairNumberByMinutiaId?.get(minutiaLayerId)
      if (pairNumber === undefined) {
        deleteMinutia()
        return
      }
      setPending({ pairNumber, deleteMinutia })
    },
    [pairNumberByMinutiaId]
  )

  const confirmDeletion = () => {
    pending?.deleteMinutia()
    setPending(null)
  }

  return {
    requestDeletion,
    pendingPairNumber: pending?.pairNumber ?? null,
    confirmDeletion,
    cancelDeletion: () => setPending(null),
  }
}

export type RequestMinutiaDeletion = ReturnType<typeof useMinutiaDeletionGuard>['requestDeletion']
