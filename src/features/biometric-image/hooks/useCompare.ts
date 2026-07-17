import { useMutation, useQueryClient } from '@tanstack/react-query'
import { BiometricImageAPI } from '@/features/biometric-image/services/BiometricImageAPI.services'
import type { BiometricImage } from '@/features/biometric-image/types/biometricImage'

type MatchingResult = { referencePrintId: string; score: number; match: boolean }

type UseCompareOptions = {
  onSuccess?: (results: MatchingResult[]) => void
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
      BiometricImageAPI.compare(trace.id, {
        caseId,
        referencePrintIds: referencePrints.map((r) => r.id),
      }),

    onSuccess: async (results, { caseId }) => {
      // Invalidate reference-prints so the carousel re-fetches with scores
      await queryClient.invalidateQueries({
        queryKey: ['biometric-images', 'reference-prints', caseId],
      })

      options?.onSuccess?.(results)
    },
    onError: options?.onError,
  })
}
