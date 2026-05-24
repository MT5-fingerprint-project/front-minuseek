import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { InvestigationCaseAPI } from '@/features/investigation-case/services/InvestigationCaseAPI.services'
import type { InvestigationCaseCreateInput } from '@/features/investigation-case/types/investigationCase'

export const investigationCaseKeys = {
  all: ['investigation-cases'] as const,
  lists: () => [...investigationCaseKeys.all, 'list'] as const,
}

export function useInvestigationCases() {
  return useQuery({
    queryKey: investigationCaseKeys.lists(),
    queryFn: () => InvestigationCaseAPI.getAll(),
  })
}

export function useCreateInvestigationCase() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: InvestigationCaseCreateInput) => InvestigationCaseAPI.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: investigationCaseKeys.lists() })
    },
  })
}
