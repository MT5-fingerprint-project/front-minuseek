import { useInvestigationCase } from '@/features/investigation-case/hooks/useInvestigationCases'

/** Une affaire close reste consultable ; elle n'accepte plus aucune écriture. */
export function useCaseIsClosed(caseId: string): boolean {
  const { data: investigationCase } = useInvestigationCase(caseId)
  return investigationCase?.status === 'CLOSED'
}
