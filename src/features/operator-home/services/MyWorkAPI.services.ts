import { apiClient } from '@/features/shared/lib/apiClient'
import type { MyWork } from '@/features/operator-home/types/myWork'

export const MyWorkAPI = {
  getMine: () => apiClient.get<MyWork>('/my-work').then((res) => res.data),
}
