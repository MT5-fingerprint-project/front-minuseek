import { API_URL } from '@/constants/global.constants'
import type { InvestigationCase } from '@/types/investigationCase/investigationCase'
import axios from 'axios'

export const InvestigationCaseAPI = {
  create: (caseData: Partial<InvestigationCase>) => axios.post(`${API_URL}/investigation-cases`, caseData),
}
