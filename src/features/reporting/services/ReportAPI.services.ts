import { apiClient } from '@/features/shared/lib/apiClient'
import type { CaseReport, GeneratedReport, ReportDownload, ReportType } from '@/features/reporting/types/report'

export const ReportAPI = {
  getByCase: (caseId: string) =>
    apiClient.get<CaseReport[]>(`/investigation-cases/${caseId}/reports`).then((res) => res.data),

  generate: (caseId: string, type: ReportType) =>
    apiClient.post<GeneratedReport>(`/investigation-cases/${caseId}/reports`, { type }).then((res) => res.data),

  getDownload: (reportId: string) =>
    apiClient.get<ReportDownload>(`/reports/${reportId}/download`).then((res) => res.data),
}
