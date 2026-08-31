import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/features/shared/ui/tooltip'
import { cn } from '@/features/shared/lib/utils'
import FiguresDisclosure from '@/features/statistics/components/FiguresDisclosure'
import StatisticsPanel from '@/features/statistics/components/StatisticsPanel'
import { formatCount } from '@/features/statistics/lib/format'
import { percentOf } from '@/features/statistics/lib/scale'
import type { ServiceStatistics } from '@/features/statistics/types/serviceStatistics'

type TraceFunnelPanelProps = {
  traces: ServiceStatistics['traces']
}

export default function TraceFunnelPanel({ traces }: TraceFunnelPanelProps) {
  const { t } = useTranslation()

  const isExploitableUnknown = traces.exploitable === 0 && traces.collected > 0

  const steps = [
    { key: 'collected', label: t('statistics.funnel.collected'), value: traces.collected, barClassName: 'bg-blue-light-3' },
    {
      key: 'exploitable',
      label: t('statistics.funnel.exploitable'),
      value: isExploitableUnknown ? null : traces.exploitable,
      barClassName: 'bg-blue-medium-1',
    },
    { key: 'compared', label: t('statistics.funnel.compared'), value: traces.compared, barClassName: 'bg-blue-medium-2' },
    { key: 'identified', label: t('statistics.funnel.identified'), value: traces.identified, barClassName: 'bg-blue-dark-1' },
  ]

  return (
    <StatisticsPanel title={t('statistics.funnel.title')} subtitle={t('statistics.funnel.subtitle')}>
      {traces.collected === 0 ? (
        <p className="text-sm text-muted-foreground">{t('statistics.page.empty')}</p>
      ) : (
        <>
          {steps.map((step, stepIndex) => {
            const previousValue = stepIndex > 0 ? steps[stepIndex - 1].value : null
            const passingShare =
              previousValue !== null && previousValue > 0 && step.value !== null
                ? Math.round((step.value / previousValue) * 100)
                : null

            return (
              <Fragment key={step.key}>
                {passingShare !== null && (
                  <p className="mb-1.5 ml-[108px] text-[11px] text-grey-medium-1">
                    {t('statistics.funnel.passingShare', { percent: passingShare })}
                  </p>
                )}
                <div className="mb-2.5 grid grid-cols-[96px_1fr_92px] items-center gap-3">
                  <span className="text-xs text-muted-foreground">{step.label}</span>
                  <div className="h-[22px]">
                    {step.value !== null && (
                      <Tooltip>
                        <TooltipTrigger
                          aria-label={t('statistics.funnel.stepTooltip', { step: step.label, count: step.value })}
                          className={cn('block h-full rounded-r-[4px]', step.barClassName)}
                          style={{ width: `${percentOf(step.value, traces.collected)}%` }}
                        />
                        <TooltipContent>
                          {t('statistics.funnel.stepTooltip', { step: step.label, count: step.value })}
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-right tabular-nums',
                      step.value === null ? 'text-[11px] text-grey-medium-1' : 'text-sm font-semibold'
                    )}
                  >
                    {step.value === null ? t('statistics.funnel.notRecorded') : formatCount(step.value)}
                  </span>
                </div>
              </Fragment>
            )
          })}

          <FiguresDisclosure
            headers={[t('statistics.funnel.step'), t('statistics.funnel.traces')]}
            rows={steps.map((step) => [
              step.label,
              step.value === null ? t('statistics.funnel.notRecorded') : formatCount(step.value),
            ])}
            numericColumns={[1]}
          />
        </>
      )}
    </StatisticsPanel>
  )
}
