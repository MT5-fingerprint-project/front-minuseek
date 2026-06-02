import { apiClient } from '@/features/shared/lib/apiClient'
import type {
  InvestigationCase,
  InvestigationCaseCreateInput,
} from '@/features/investigation-case/types/investigationCase'

export const InvestigationCaseAPI = {
  create: (caseData: InvestigationCaseCreateInput) =>
    apiClient.post<InvestigationCase>('/api/investigation-cases', caseData).then((res) => res.data),

  getAll: () => apiClient.get<InvestigationCase[]>('/api/investigation-cases').then((res) => res.data),
}
