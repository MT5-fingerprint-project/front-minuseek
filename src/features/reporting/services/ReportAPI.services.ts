import { apiClient } from '@/features/shared/lib/apiClient'
import type {
  CaseReport,
  GenerateReportInput,
  GeneratedReport,
  ReportDownload,
} from '@/features/reporting/types/report'

export const ReportAPI = {
  getByCase: (caseId: string) =>
    apiClient.get<CaseReport[]>(`/investigation-cases/${caseId}/reports`).then((res) => res.data),

  generate: (caseId: string, input: GenerateReportInput) =>
    apiClient.post<GeneratedReport>(`/investigation-cases/${caseId}/reports`, input).then((res) => res.data),

  getDownload: (reportId: string) =>
    apiClient.get<ReportDownload>(`/reports/${reportId}/download`).then((res) => res.data),
}
