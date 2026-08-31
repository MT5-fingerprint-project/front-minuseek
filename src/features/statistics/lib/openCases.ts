import type { ServiceStatisticsOpenCase, ServiceStatisticsOperator } from '@/features/statistics/types/serviceStatistics'

const OPEN_FOR_MORE_THAN_A_MONTH_DAYS = 30

export function countOpenForMoreThanAMonth(openCases: ServiceStatisticsOpenCase[]): number {
  return openCases.filter((openCase) => openCase.ageInDays > OPEN_FOR_MORE_THAN_A_MONTH_DAYS).length
}

export function operatorFullName(operator: ServiceStatisticsOperator | null, unassignedLabel: string): string {
  return operator ? `${operator.firstName} ${operator.lastName}` : unassignedLabel
}
