import { useMutation, useQueryClient } from '@tanstack/react-query'
import { DataAPI } from '@/features/biometric-image/services/DataAPI.services'
import { BiometricImageAPI } from '@/features/biometric-image/services/BiometricImageAPI.services'
import type { BiometricImage } from '@/features/biometric-image/types/biometricImage'
import type { DataCompareResult } from '@/features/biometric-image/types/data'

type UseCompareOptions = {
  onSuccess?: (results: DataCompareResult[]) => void
  onError?: () => void
}

export function useCompare(options?: UseCompareOptions) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      caseId,
      trace,
      referencePrints,
    }: {
      caseId: string
      trace: BiometricImage
      referencePrints: BiometricImage[]
    }) =>
      DataAPI.compare({
        case_id: caseId,
        trace_id: trace.id,
        reference_print_ids: referencePrints.map((r) => r.id),
      }),

    onSuccess: async (data, { trace, caseId }) => {
      await BiometricImageAPI.saveMatchings(
        trace.id,
        data.results.map((r) => ({
          referencePrintId: r.reference_print,
          score: r.score,
          match: r.match,
        })),
      )

      // Invalidate reference-prints so the carousel re-fetches with scores
      await queryClient.invalidateQueries({
        queryKey: ['biometric-images', 'reference-prints', caseId],
      })

      options?.onSuccess?.(data.results)
    },
    onError: options?.onError,
  })
}
