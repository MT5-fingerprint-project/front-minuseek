import { useInvestigationCase } from '@/features/investigation-case/hooks/useInvestigationCases'
import type { CaseExpertise } from '@/features/investigation-case/types/investigationCase'

export function useCaseExpertise(caseId: string): CaseExpertise | null {
  const { data: investigationCase } = useInvestigationCase(caseId)
  return investigationCase?.expertise ?? null
}
