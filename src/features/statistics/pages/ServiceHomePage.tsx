import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '@/features/shared/icons'
import { H1 } from '@/features/shared/ui/typography'
import { Skeleton } from '@/features/shared/ui/skeleton'
import AppHeader from '@/features/shared/components/AppHeader'
import { useCurrentUser } from '@/features/shared/hooks/useCurrentUser'
import { useServiceUsers } from '@/features/users/hooks/useServiceUsers'
import { NO_SERVICE_USERS_FILTER } from '@/features/users/types/serviceUser'
import DecisionSignalsPanel from '@/features/statistics/components/DecisionSignalsPanel'
import ExportMenu from '@/features/statistics/components/ExportMenu'
import MonthlyFlowPanel from '@/features/statistics/components/MonthlyFlowPanel'
import OperatorFilter from '@/features/statistics/components/OperatorFilter'
import OperatorPanel from '@/features/statistics/components/OperatorPanel'
import ServiceHeadline from '@/features/statistics/components/ServiceHeadline'
import ServiceHomeSkeleton from '@/features/statistics/components/ServiceHomeSkeleton'
import ServiceKeyFigures from '@/features/statistics/components/ServiceKeyFigures'
import TraceFunnelPanel from '@/features/statistics/components/TraceFunnelPanel'
import { useServiceStatistics } from '@/features/statistics/hooks/useServiceStatistics'
import { yearOf } from '@/features/statistics/lib/format'

const OPERATOR_CHOICES_LIMIT = 200

export default function ServiceHomePage() {
  const { t } = useTranslation()
  const [selectedOperatorId, setSelectedOperatorId] = useState<string | null>(null)

  const { data: currentUser } = useCurrentUser()
  const isServiceManager = currentUser?.role === 'ADMIN'

  const statisticsQuery = useServiceStatistics(selectedOperatorId, isServiceManager)
  const operatorsQuery = useServiceUsers(
    { ...NO_SERVICE_USERS_FILTER, page: 1, limit: OPERATOR_CHOICES_LIMIT },
    isServiceManager
  )

  const operators = operatorsQuery.data?.data ?? []
  const statistics = statisticsQuery.data
  const selectedOperator = operators.find((operator) => operator.id === selectedOperatorId) ?? null
  const exportScope = {
    operatorId: selectedOperatorId,
    label: selectedOperator
      ? `${selectedOperator.firstName} ${selectedOperator.lastName}`
      : t('statistics.page.wholeService'),
  }
  const isServiceEmpty = statistics
    ? statistics.cases.open === 0 && statistics.cases.openedInPeriod === 0 && statistics.cases.closedInPeriod === 0
    : false

  return (
    <div className="flex flex-col">
      <AppHeader />
      <div className="flex flex-col gap-4 px-32 py-6">
        <div className="flex items-center gap-3">
          <Icon name="home" size={40} color="var(--color-blue-medium-1)" />
          <H1 className="text-blue-dark-2">{t('statistics.page.title')}</H1>
        </div>

        <div className="flex flex-wrap items-end gap-4 border-b border-grey-light-2 pb-4">
          <OperatorFilter
            operators={operators}
            selectedOperatorId={selectedOperatorId}
            onSelectOperator={setSelectedOperatorId}
          />
          {statistics ? (
            <p className="pb-2 text-sm text-muted-foreground">
              {t('statistics.page.period', { year: yearOf(statistics.period.from) })}
            </p>
          ) : (
            <Skeleton className="mb-2 h-4 w-56 rounded-sm" />
          )}
          {statistics && (
            <div className="ml-auto">
              <ExportMenu statistics={statistics} scope={exportScope} />
            </div>
          )}
        </div>

        {statisticsQuery.isError ? (
          <p className="rounded-sm bg-white px-4 py-3 text-sm text-destructive">{t('common.errors.loadFailed')}</p>
        ) : !statistics ? (
          <ServiceHomeSkeleton />
        ) : (
          <>
            <ServiceHeadline cases={statistics.cases} isServiceEmpty={isServiceEmpty} />
            <ServiceKeyFigures cases={statistics.cases} isServiceEmpty={isServiceEmpty} />
            <DecisionSignalsPanel signals={statistics.signals} />
            <div className="grid gap-4 lg:grid-cols-2">
              <MonthlyFlowPanel monthlyFlow={statistics.cases.monthlyFlow} />
              <TraceFunnelPanel traces={statistics.traces} />
            </div>
            <OperatorPanel
              byOperator={statistics.byOperator}
              serviceMedianClosureDays={statistics.cases.medianClosureDays}
            />
          </>
        )}
      </div>
    </div>
  )
}
