import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/features/shared/ui/tooltip'
import { cn } from '@/features/shared/lib/utils'
import FiguresDisclosure from '@/features/statistics/components/FiguresDisclosure'
import StatisticsPanel from '@/features/statistics/components/StatisticsPanel'
import { formatCount, formatDayCount, formatDecimal } from '@/features/statistics/lib/format'
import { operatorFullName } from '@/features/statistics/lib/openCases'
import { percentOf } from '@/features/statistics/lib/scale'
import type { ServiceStatistics, ServiceStatisticsOperatorRow } from '@/features/statistics/types/serviceStatistics'

type MeasureCellProps = {
  value: number | null
  highestValue: number
  serviceReference: number | null
  barClassName: string
  formattedValue: string
  description: string
  caption?: string
}

function MeasureCell({
  value,
  highestValue,
  serviceReference,
  barClassName,
  formattedValue,
  description,
  caption,
}: MeasureCellProps) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-2.5 py-1.5">
      <div className="relative h-[18px]">
        {value !== null && (
          <Tooltip>
            <TooltipTrigger
              aria-label={description}
              className={cn('block h-full rounded-r-[4px]', barClassName)}
              style={{ width: `${percentOf(value, highestValue)}%` }}
            />
            <TooltipContent>{description}</TooltipContent>
          </Tooltip>
        )}
        {serviceReference !== null && (
          <span
            aria-hidden
            className="absolute -top-1 -bottom-1 w-px bg-grey-dark"
            style={{ left: `${percentOf(serviceReference, highestValue)}%` }}
          />
        )}
      </div>
      <p className="min-w-[52px] text-right text-sm font-semibold tabular-nums">
        {formattedValue}
        {caption && <span className="block text-[10.5px] font-normal text-grey-medium-1">{caption}</span>}
      </p>
    </div>
  )
}

type OperatorPanelProps = {
  byOperator: ServiceStatisticsOperatorRow[]
  serviceMedianClosureDays: ServiceStatistics['cases']['medianClosureDays']
}

export default function OperatorPanel({ byOperator, serviceMedianClosureDays }: OperatorPanelProps) {
  const { t } = useTranslation()

  const namedOperators = byOperator.filter((row) => row.operator !== null)
  const highestOpenCases = Math.max(0, ...byOperator.map((row) => row.openCases))
  const highestMedian = Math.max(0, ...byOperator.map((row) => row.medianClosureDays ?? 0))
  const averageOpenCases =
    namedOperators.length > 0
      ? namedOperators.reduce((total, row) => total + row.openCases, 0) / namedOperators.length
      : null
  const hasFigures = byOperator.some((row) => row.openCases > 0 || row.closedInPeriod > 0)

  const rowName = (row: ServiceStatisticsOperatorRow) =>
    operatorFullName(row.operator, t('statistics.byOperator.unassigned'))

  return (
    <StatisticsPanel title={t('statistics.byOperator.title')} subtitle={t('statistics.byOperator.subtitle')}>
      {!hasFigures ? (
        <p className="text-sm text-muted-foreground">{t('statistics.page.empty')}</p>
      ) : (
        <>
          <div className="grid grid-cols-[152px_1fr_1fr] items-center gap-x-[22px]">
            <span className="mb-2.5 self-stretch border-b border-grey-light-2 pb-2" />
            <span className="mb-2.5 self-stretch border-b border-grey-light-2 pb-2 text-[11px] text-muted-foreground">
              {t('statistics.byOperator.openCases')}
            </span>
            <span className="mb-2.5 self-stretch border-b border-grey-light-2 pb-2 text-[11px] text-muted-foreground">
              {t('statistics.byOperator.medianClosure')}
            </span>

            {byOperator.map((row) => {
              const isUnassigned = row.operator === null
              const name = rowName(row)

              return (
                <Fragment key={row.operator?.id ?? 'unassigned'}>
                  <span className={cn('py-1.5 text-sm', isUnassigned && 'text-muted-foreground italic')}>{name}</span>

                  <MeasureCell
                    value={row.openCases}
                    highestValue={highestOpenCases}
                    serviceReference={averageOpenCases}
                    barClassName={isUnassigned ? 'bg-grey-medium-1' : 'bg-blue-medium-1'}
                    formattedValue={formatCount(row.openCases)}
                    description={t('statistics.byOperator.openCasesTooltip', {
                      operator: name,
                      count: row.openCases,
                    })}
                  />

                  {isUnassigned ? (
                    <div className="grid grid-cols-[1fr_auto] items-center gap-2.5 py-1.5">
                      <p className="text-xs text-grey-medium-1">{t('statistics.byOperator.notApplicable')}</p>
                      <p className="min-w-[52px]" />
                    </div>
                  ) : row.medianClosureDays === null ? (
                    <div className="grid grid-cols-[1fr_auto] items-center gap-2.5 py-1.5">
                      <p className="text-xs text-grey-medium-1">{t('statistics.byOperator.tooFewClosures')}</p>
                      <p className="min-w-[52px] text-right text-sm font-semibold">
                        —
                        <span className="block text-[10.5px] font-normal text-grey-medium-1">
                          {t('statistics.byOperator.closedCount', { count: row.closedInPeriod })}
                        </span>
                      </p>
                    </div>
                  ) : (
                    <MeasureCell
                      value={row.medianClosureDays}
                      highestValue={highestMedian}
                      serviceReference={serviceMedianClosureDays}
                      barClassName="bg-blue-medium-1"
                      formattedValue={t('statistics.byOperator.days', {
                        days: formatDayCount(row.medianClosureDays),
                      })}
                      caption={t('statistics.byOperator.closedCount', { count: row.closedInPeriod })}
                      description={t('statistics.byOperator.medianTooltip', {
                        operator: name,
                        days: formatDayCount(row.medianClosureDays),
                        count: row.closedInPeriod,
                      })}
                    />
                  )}
                </Fragment>
              )
            })}
          </div>

          {averageOpenCases !== null && serviceMedianClosureDays !== null && (
            <p className="mt-3 text-xs text-muted-foreground">
              <span aria-hidden className="mr-1.5 inline-block h-2.5 w-px bg-grey-dark align-[-1px]" />
              {t('statistics.byOperator.serviceLine', {
                avg: formatDecimal(averageOpenCases),
                days: formatDayCount(serviceMedianClosureDays),
              })}
            </p>
          )}
          <p className="mt-2 text-xs text-grey-medium-1">{t('statistics.byOperator.medianCaveat')}</p>

          <FiguresDisclosure
            headers={[
              t('statistics.byOperator.operator'),
              t('statistics.byOperator.openCases'),
              t('statistics.byOperator.closedCases'),
              t('statistics.byOperator.medianClosureColumn'),
            ]}
            rows={byOperator.map((row) => [
              rowName(row),
              formatCount(row.openCases),
              formatCount(row.closedInPeriod),
              row.medianClosureDays === null ? '—' : formatDayCount(row.medianClosureDays),
            ])}
            numericColumns={[1, 2, 3]}
          />
        </>
      )}
    </StatisticsPanel>
  )
}
