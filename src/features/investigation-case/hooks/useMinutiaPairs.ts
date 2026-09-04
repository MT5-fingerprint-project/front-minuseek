import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { layerKeys } from '@/features/biometric-image/hooks/useLayers'
import { minutiaPairKeys } from '@/features/investigation-case/hooks/minutiaPairKeys'
import { MinutiaPairAPI } from '@/features/investigation-case/services/MinutiaPairAPI.services'
import type { CreateMinutiaPairInput, MinutiaPair } from '@/features/investigation-case/types/minutiaPair'

/** Identité stable : la carte des numéros en dérive et redescend jusqu'aux deux canevas. */
const NO_PAIRS: MinutiaPair[] = []

export function useMinutiaPairs(traceId: string | undefined, referencePrintId: string | undefined) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const { data: pairs = NO_PAIRS } = useQuery({
    queryKey: minutiaPairKeys.list(traceId ?? '', referencePrintId ?? ''),
    queryFn: () => MinutiaPairAPI.getAll(traceId!, referencePrintId!),
    enabled: !!traceId && !!referencePrintId,
    staleTime: 5 * 60 * 1000,
  })

  const invalidatePairsAndLayers = () => {
    queryClient.invalidateQueries({ queryKey: minutiaPairKeys.all })
    // Apparier peut requalifier la minutie indéterminée : le calque des deux côtés a bougé.
    queryClient.invalidateQueries({ queryKey: layerKeys.all })
  }

  const createMutation = useMutation({
    mutationFn: (input: CreateMinutiaPairInput) => MinutiaPairAPI.create(traceId!, input),
    onSuccess: (pair) => {
      invalidatePairsAndLayers()
      toast.success(t('investigationCase.comparison.pairingCreated', { number: pair.number }))
    },
    onError: (error) => {
      const isConflict = axios.isAxiosError(error) && error.response?.status === 409
      toast.error(
        t(
          isConflict
            ? 'investigationCase.comparison.pairingConflict'
            : 'investigationCase.comparison.pairingCreateError'
        )
      )
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (pairId: string) => MinutiaPairAPI.remove(traceId!, pairId),
    onSuccess: () => {
      invalidatePairsAndLayers()
      toast.success(t('investigationCase.comparison.pairingRemoved'))
    },
    onError: () => toast.error(t('investigationCase.comparison.pairingRemoveError')),
  })

  /** Numéro de paire par id de calque de minutie, des deux côtés à la fois. */
  const numberByMinutiaId = useMemo(() => {
    const numbers = new Map<string, number>()
    for (const pair of pairs) {
      numbers.set(pair.traceMinutiaLayerId, pair.number)
      numbers.set(pair.referenceMinutiaLayerId, pair.number)
    }
    return numbers
  }, [pairs])

  const createPair = (traceMinutiaLayerId: string, referenceMinutiaLayerId: string) => {
    if (!traceId || !referencePrintId) return
    createMutation.mutate({ referencePrintId, traceMinutiaLayerId, referenceMinutiaLayerId })
  }

  const deletePairByMinutiaId = (minutiaLayerId: string) => {
    if (!traceId) return
    const pair = pairs.find(
      (candidate) =>
        candidate.traceMinutiaLayerId === minutiaLayerId || candidate.referenceMinutiaLayerId === minutiaLayerId
    )
    if (!pair) return
    deleteMutation.mutate(pair.id)
  }

  return {
    pairs,
    numberByMinutiaId,
    createPair,
    deletePairByMinutiaId,
    isPending: createMutation.isPending || deleteMutation.isPending,
  }
}
