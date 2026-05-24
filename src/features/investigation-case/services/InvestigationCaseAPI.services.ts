import { API_URL } from '@/features/shared/constants/global.constants'
import type {
  InvestigationCase,
  InvestigationCaseCreateInput,
} from '@/features/investigation-case/types/investigationCase'
import axios from 'axios'

export const InvestigationCaseAPI = {
  create: (caseData: InvestigationCaseCreateInput) =>
    axios.post<InvestigationCase>(`${API_URL}/investigation-cases`, caseData).then((res) => res.data),

  getAll: () => axios.get<InvestigationCase[]>(`${API_URL}/investigation-cases`).then((res) => res.data),
}
