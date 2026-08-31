import { useQuery } from '@tanstack/react-query'
import { StatisticsAPI } from '@/features/statistics/services/StatisticsAPI.services'

export const serviceStatisticsKeys = {
  all: ['service-statistics'] as const,
  service: (operatorUserId: string | null) => [...serviceStatisticsKeys.all, 'service', operatorUserId] as const,
}

export function useServiceStatistics(operatorUserId: string | null, enabled = true) {
  return useQuery({
    queryKey: serviceStatisticsKeys.service(operatorUserId),
    queryFn: () => StatisticsAPI.getServiceStatistics(operatorUserId),
    enabled,
  })
}
