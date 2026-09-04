import { apiClient } from '@/features/shared/lib/apiClient'
import type { CreateMinutiaPairInput, MinutiaPair } from '@/features/investigation-case/types/minutiaPair'

export const MinutiaPairAPI = {
  getAll: (traceId: string, referencePrintId: string) =>
    apiClient
      .get<MinutiaPair[]>(`/traces/${traceId}/minutia-pairs`, { params: { referencePrintId } })
      .then((res) => res.data),

  create: (traceId: string, input: CreateMinutiaPairInput) =>
    apiClient.post<MinutiaPair>(`/traces/${traceId}/minutia-pairs`, input).then((res) => res.data),

  remove: (traceId: string, pairId: string) =>
    apiClient.delete(`/traces/${traceId}/minutia-pairs/${pairId}`).then((res) => res.data),
}
