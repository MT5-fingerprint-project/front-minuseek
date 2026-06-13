import { apiClient } from '@/features/shared/lib/apiClient'
import type { Layer, CreateLayerInput, UpdateLayerInput } from '@/features/biometric-image/types/layer'

export const LayerAPI = {
  getAll: (fingerprintId: string) =>
    apiClient.get<Layer[]>(`/layers/${fingerprintId}`).then((res) => res.data),

  create: (input: CreateLayerInput) =>
    apiClient.post<void>('/layers', input).then((res) => res.data),

  update: (id: string, input: UpdateLayerInput) =>
    apiClient.put<void>(`/layers/${id}`, input).then((res) => res.data),

  remove: (id: string) =>
    apiClient.delete(`/layers/${id}`).then((res) => res.data),
}
