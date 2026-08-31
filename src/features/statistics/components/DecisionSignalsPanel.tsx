import { useTranslation } from 'react-i18next'
import StatisticsPanel from '@/features/statistics/components/StatisticsPanel'
import { formatCount } from '@/features/statistics/lib/format'
import type { ServiceStatistics } from '@/features/statistics/types/serviceStatistics'

type DecisionSignalsPanelProps = {
  signals: ServiceStatistics['signals']
}

export default function DecisionSignalsPanel({ signals }: DecisionSignalsPanelProps) {
  const { t } = useTranslation()

  const displayedSignals = [
    {
      key: 'dormant',
      value: signals.dormantOver30Days,
      description: t('statistics.signals.dormant'),
      severity: t('statistics.signals.critical'),
      dotClassName: 'bg-red-medium',
      severityClassName: 'text-red-medium',
    },
    {
      key: 'expertiseDeadlines',
      value: signals.expertiseDeadlinesUnder15Days,
      description: t('statistics.signals.expertiseDeadlines'),
      severity: t('statistics.signals.critical'),
      dotClassName: 'bg-red-medium',
      severityClassName: 'text-red-medium',
    },
    {
      key: 'exploitableNeverCompared',
      value: signals.exploitableNeverCompared,
      description: t('statistics.signals.exploitableNeverCompared'),
      severity: t('statistics.signals.toHandle'),
      dotClassName: 'bg-orange-medium',
      severityClassName: 'text-orange-medium',
    },
    {
      key: 'withoutOperator',
      value: signals.openWithoutOperator,
      description: t('statistics.signals.withoutOperator'),
      severity: t('statistics.signals.toHandle'),
      dotClassName: 'bg-orange-medium',
      severityClassName: 'text-orange-medium',
    },
  ]

  return (
    <StatisticsPanel title={t('statistics.signals.title')} subtitle={t('statistics.signals.subtitle')}>
      <ul className="grid gap-4 lg:grid-cols-4">
        {displayedSignals.map((signal) => (
          <li key={signal.key} className="flex items-start gap-3">
            <span aria-hidden className={`mt-1.5 size-2.5 shrink-0 rounded-full ${signal.dotClassName}`} />
            <div>
              <p className={`text-[11px] font-semibold uppercase tracking-wide ${signal.severityClassName}`}>
                {signal.severity}
              </p>
              <p className="text-[22px] font-semibold leading-tight">{formatCount(signal.value)}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{signal.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </StatisticsPanel>
  )
}
