import { apiClient } from '@/features/shared/lib/apiClient'
import type { CaseRecipientInput, ReportRecipient } from '@/features/investigation-case/types/reportRecipient'

export const ReportRecipientAPI = {
  list: () => apiClient.get<{ data: ReportRecipient[] }>('/report-recipients').then((res) => res.data.data),

  create: (input: CaseRecipientInput) =>
    apiClient
      .post<{ id: string }>('/report-recipients', {
        ...input,
        attentionQuality: input.attentionQuality || undefined,
        attentionName: input.attentionName || undefined,
      })
      .then((res) => res.data),

  remove: (id: string) => apiClient.delete<void>(`/report-recipients/${id}`).then(() => undefined),
}
