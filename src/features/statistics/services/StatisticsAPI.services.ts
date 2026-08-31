import { apiClient } from '@/features/shared/lib/apiClient'
import type { ServiceStatistics } from '@/features/statistics/types/serviceStatistics'

export const StatisticsAPI = {
  getServiceStatistics: (operatorUserId: string | null) =>
    apiClient
      .get<ServiceStatistics>('/service-activity', {
        params: operatorUserId ? { operatorUserId } : undefined,
      })
      .then((res) => res.data),
}
