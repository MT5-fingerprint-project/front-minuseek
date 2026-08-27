import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { InvestigationCaseAPI } from '@/features/investigation-case/services/InvestigationCaseAPI.services'
import type {
  InvestigationCaseCorrections,
  InvestigationCaseCreateInput,
} from '@/features/investigation-case/types/investigationCase'

export const investigationCaseKeys = {
  all: ['investigation-cases'] as const,
  lists: () => [...investigationCaseKeys.all, 'list'] as const,
  detail: (id: string) => [...investigationCaseKeys.all, 'detail', id] as const,
}

export function useInvestigationCases() {
  return useQuery({
    queryKey: investigationCaseKeys.lists(),
    queryFn: () => InvestigationCaseAPI.getAll(),
    select: ({data}) => data
  })
}

export function useInvestigationCase(id: string) {
  return useQuery({
    queryKey: investigationCaseKeys.detail(id),
    queryFn: () => InvestigationCaseAPI.getById(id),
    enabled: !!id,
  })
}

export function useCreateInvestigationCase() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (input: InvestigationCaseCreateInput) => InvestigationCaseAPI.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: investigationCaseKeys.lists() })
      toast.success(t('investigationCase.success.created'))
    },
  })
}

export function useCorrectInvestigationCase(id: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (corrections: InvestigationCaseCorrections) => InvestigationCaseAPI.correct(id, corrections),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: investigationCaseKeys.lists() })
      queryClient.invalidateQueries({ queryKey: investigationCaseKeys.detail(id) })
      toast.success(t('investigationCase.success.corrected'))
    },
  })
}
