import { apiClient } from '@/features/shared/lib/apiClient'
import type {
  InvestigationCase,
  InvestigationCaseCreateInput,
} from '@/features/investigation-case/types/investigationCase'

export const InvestigationCaseAPI = {
  create: (caseData: InvestigationCaseCreateInput) =>
    apiClient.post<InvestigationCase>('/investigation-cases', caseData).then((res) => res.data),

  getAll: () => apiClient.get<{ data: InvestigationCase[] }>('/investigation-cases').then((res) => res.data),

  getById: (id: string) => apiClient.get<InvestigationCase>(`/investigation-cases/${id}`).then((res) => res.data),
}
