import { apiClient } from '@/features/shared/lib/apiClient'

type DeclareHitInput = { caseId: string; referencePrintId: string }

export const HitAPI = {
  getByTrace: (traceId: string) =>
    apiClient
      .get<{ referencePrintIds: string[] }>(`/traces/${traceId}/hits`)
      .then((res) => res.data.referencePrintIds),

  declare: (traceId: string, input: DeclareHitInput) =>
    apiClient.post<void>(`/traces/${traceId}/hit`, input).then((res) => res.data),

  remove: (traceId: string, referencePrintId: string, caseId: string) =>
    apiClient
      .delete(`/traces/${traceId}/hit/${referencePrintId}`, { params: { caseId } })
      .then((res) => res.data),
}
