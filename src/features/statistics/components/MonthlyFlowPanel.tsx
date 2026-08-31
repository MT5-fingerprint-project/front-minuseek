import { useTranslation } from 'react-i18next'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/features/shared/ui/tooltip'
import { cn } from '@/features/shared/lib/utils'
import FiguresDisclosure from '@/features/statistics/components/FiguresDisclosure'
import StatisticsPanel from '@/features/statistics/components/StatisticsPanel'
import { formatCount, formatMonthLabel } from '@/features/statistics/lib/format'
import { gridTicks, percentOf } from '@/features/statistics/lib/scale'
import type { ServiceStatisticsMonthlyFlow } from '@/features/statistics/types/serviceStatistics'

type FlowBarProps = {
  value: number
  highestCount: number
  colorClassName: string
  description: string
}

function FlowBar({ value, highestCount, colorClassName, description }: FlowBarProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        aria-label={description}
        className={cn('w-[15px] rounded-t-[4px]', colorClassName)}
        style={{ height: `${percentOf(value, highestCount)}%` }}
      />
      <TooltipContent>{description}</TooltipContent>
    </Tooltip>
  )
}

type MonthlyFlowPanelProps = {
  monthlyFlow: ServiceStatisticsMonthlyFlow[]
}

export default function MonthlyFlowPanel({ monthlyFlow }: MonthlyFlowPanelProps) {
  const { t } = useTranslation()

  const highestCount = Math.max(0, ...monthlyFlow.flatMap((month) => [month.opened, month.closed]))
  const ticks = gridTicks(highestCount)

  return (
    <StatisticsPanel title={t('statistics.monthlyFlow.title')} subtitle={t('statistics.monthlyFlow.subtitle')}>
      {highestCount === 0 ? (
        <p className="text-sm text-muted-foreground">{t('statistics.page.empty')}</p>
      ) : (
        <>
          <ul className="mb-3.5 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <li>
              <span aria-hidden className="mr-1.5 inline-block size-2.5 rounded-[3px] bg-blue-medium-1 align-[-1px]" />
              {t('statistics.monthlyFlow.opened')}
            </li>
            <li>
              <span aria-hidden className="mr-1.5 inline-block size-2.5 rounded-[3px] bg-orange-medium align-[-1px]" />
              {t('statistics.monthlyFlow.closed')}
            </li>
          </ul>

          <div className="grid grid-cols-[30px_1fr] gap-2">
            <div className="relative h-42">
              {ticks.map((tick) => (
                <span
                  key={tick}
                  className="absolute right-0 translate-y-1/2 text-[11px] tabular-nums text-grey-medium-1"
                  style={{ bottom: `${percentOf(tick, highestCount)}%` }}
                >
                  {formatCount(tick)}
                </span>
              ))}
            </div>

            <div className="relative flex h-42 items-end gap-[2px]">
              {ticks.map((tick) => (
                <span
                  key={tick}
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 h-px bg-blue-light-1"
                  style={{ bottom: `${percentOf(tick, highestCount)}%` }}
                />
              ))}
              {monthlyFlow.map((month) => (
                <div key={month.month} className="flex h-full flex-1 items-end justify-center gap-[2px]">
                  <FlowBar
                    value={month.opened}
                    highestCount={highestCount}
                    colorClassName="bg-blue-medium-1"
                    description={t('statistics.monthlyFlow.openedTooltip', {
                      month: formatMonthLabel(month.month),
                      count: month.opened,
                    })}
                  />
                  <FlowBar
                    value={month.closed}
                    highestCount={highestCount}
                    colorClassName="bg-orange-medium"
                    description={t('statistics.monthlyFlow.closedTooltip', {
                      month: formatMonthLabel(month.month),
                      count: month.closed,
                    })}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-2 ml-[38px] flex gap-[2px]">
            {monthlyFlow.map((month) => (
              <span
                key={month.month}
                className="flex-1 text-center text-[11px] tabular-nums text-muted-foreground"
              >
                {formatMonthLabel(month.month)}
              </span>
            ))}
          </div>

          <FiguresDisclosure
            headers={[
              t('statistics.monthlyFlow.month'),
              t('statistics.monthlyFlow.opened'),
              t('statistics.monthlyFlow.closed'),
              t('statistics.monthlyFlow.balance'),
            ]}
            rows={monthlyFlow.map((month) => [
              formatMonthLabel(month.month),
              formatCount(month.opened),
              formatCount(month.closed),
              month.opened - month.closed > 0
                ? `+${formatCount(month.opened - month.closed)}`
                : formatCount(month.opened - month.closed),
            ])}
            numericColumns={[1, 2, 3]}
          />
        </>
      )}
    </StatisticsPanel>
  )
}
