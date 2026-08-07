import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { HitAPI } from '@/features/biometric-image/services/HitAPI.services'

export const hitKeys = {
  all: ['hits'] as const,
  list: (traceId: string) => [...hitKeys.all, traceId] as const,
}

export function useHits(traceId: string | undefined) {
  return useQuery({
    queryKey: hitKeys.list(traceId ?? ''),
    queryFn: () => HitAPI.getByTrace(traceId!),
    enabled: !!traceId,
    staleTime: 5 * 60 * 1000,
  })
}

type ToggleHitInput = { caseId: string; referencePrintId: string; isHit: boolean }

export function useToggleHit(traceId: string | undefined) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ caseId, referencePrintId, isHit }: ToggleHitInput) =>
      isHit
        ? HitAPI.remove(traceId!, referencePrintId, caseId)
        : HitAPI.declare(traceId!, { caseId, referencePrintId }),
    onSuccess: () => {
      if (traceId) {
        queryClient.invalidateQueries({ queryKey: hitKeys.list(traceId) })
      }
    },
    onError: (error) => {
      const isInsufficient = axios.isAxiosError(error) && error.response?.status === 422
      toast.error(
        t(
          isInsufficient
            ? 'investigationCase.comparison.hitInsufficientMinutiae'
            : 'investigationCase.comparison.hitError'
        )
      )
    },
  })
}
