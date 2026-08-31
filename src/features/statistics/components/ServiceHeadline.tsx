import { useTranslation } from 'react-i18next'
import { formatCount } from '@/features/statistics/lib/format'
import { operatorFullName } from '@/features/statistics/lib/openCases'
import type { ServiceStatistics } from '@/features/statistics/types/serviceStatistics'

type ServiceHeadlineProps = {
  cases: ServiceStatistics['cases']
  isServiceEmpty: boolean
}

export default function ServiceHeadline({ cases, isServiceEmpty }: ServiceHeadlineProps) {
  const { t } = useTranslation()

  if (isServiceEmpty) {
    return (
      <section className="rounded-sm bg-white px-5 py-4">
        <p className="text-sm text-muted-foreground">{t('statistics.page.empty')}</p>
      </section>
    )
  }

  const netChange = cases.openedInPeriod - cases.closedInPeriod
  const trend =
    netChange > 0
      ? t('statistics.headline.trendUp', { count: netChange })
      : netChange < 0
        ? t('statistics.headline.trendDown', { count: -netChange })
        : t('statistics.headline.trendFlat')

  const oldestOpenCase = cases.openCases[0]

  return (
    <section className="flex flex-wrap items-start gap-8 rounded-sm bg-white px-5 py-4 text-blue-dark-2">
      <div className="leading-none">
        <p className="text-[58px] font-semibold tracking-[-0.03em]">{formatCount(cases.open)}</p>
        <p className="mt-2 text-sm text-muted-foreground">{t('statistics.headline.openCases')}</p>
      </div>
      <div className="max-w-[480px] border-l border-grey-light-2 pl-8">
        <p className="text-sm leading-relaxed">
          <b className="font-semibold">{trend}</b>{' '}
          {t('statistics.headline.trendDetail', {
            opened: formatCount(cases.openedInPeriod),
            closed: formatCount(cases.closedInPeriod),
          })}
        </p>
        {oldestOpenCase && (
          <p className="mt-2.5 text-xs text-muted-foreground">
            {t('statistics.headline.oldestCase', {
              caseNumber: oldestOpenCase.caseNumber,
              days: formatCount(oldestOpenCase.ageInDays),
              operator: operatorFullName(oldestOpenCase.operator, t('statistics.byOperator.unassigned')),
            })}
          </p>
        )}
      </div>
    </section>
  )
}
