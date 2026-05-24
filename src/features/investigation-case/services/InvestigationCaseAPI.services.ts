import { apiClient } from '@/features/shared/lib/apiClient'
import type {
  InvestigationCase,
  InvestigationCaseCreateInput,
} from '@/features/investigation-case/types/investigationCase'

export const InvestigationCaseAPI = {
  create: (caseData: InvestigationCaseCreateInput) =>
    apiClient.post<InvestigationCase>('/cases', caseData).then((res) => res.data),

  getAll: () => apiClient.get<InvestigationCase[]>('/cases').then((res) => res.data),
}
