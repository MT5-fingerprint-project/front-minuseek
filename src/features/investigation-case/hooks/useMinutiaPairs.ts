import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useCreateLayer, useDeleteLayer, useLayers } from '@/features/biometric-image/hooks/useLayers'
import { derivePairs, pairNumberByMinutiaId, pairSettings } from '@/features/biometric-image/lib/pairs'

/**
 * Les paires vivent en calques ANNOTATION sur la trace (L7-2a) : un seul jeu de
 * données pour les deux canevas, alimenté ici et redescendu aux deux fenêtres du
 * comparateur (`InvestigationCaseComparisonPage`, seul ancêtre commun).
 */
export function useMinutiaPairs(traceId: string | undefined, referencePrintId: string | undefined) {
  const { t } = useTranslation()
  const { data: traceLayers = [] } = useLayers(traceId)
  const createLayer = useCreateLayer(traceId ?? '')
  const deleteLayer = useDeleteLayer(traceId ?? '')

  const pairs = derivePairs(traceLayers, referencePrintId)
  const numberByMinutiaId = pairNumberByMinutiaId(pairs)

  const createPair = (traceMinutiaId: string, referenceMinutiaId: string) => {
    if (!traceId || !referencePrintId) return
    createLayer.mutate(
      {
        id: crypto.randomUUID(),
        fingerprintId: traceId,
        name: t('biometricImage.pairing.layerName'),
        type: 'ANNOTATION',
        zIndex: traceLayers.length,
        settings: pairSettings(referencePrintId, traceMinutiaId, referenceMinutiaId),
      },
      { onSuccess: () => toast.success(t('investigationCase.comparison.pairingCreated', { number: pairs.length + 1 })) },
    )
  }

  const deletePairByMinutiaId = (minutiaId: string) => {
    const pair = pairs.find((p) => p.traceMinutiaId === minutiaId || p.referenceMinutiaId === minutiaId)
    if (!pair) return
    deleteLayer.mutate(pair.layerId, {
      onSuccess: () => toast.success(t('investigationCase.comparison.pairingRemoved')),
    })
  }

  return {
    pairs,
    numberByMinutiaId,
    createPair,
    deletePairByMinutiaId,
    isPending: createLayer.isPending || deleteLayer.isPending,
  }
}
