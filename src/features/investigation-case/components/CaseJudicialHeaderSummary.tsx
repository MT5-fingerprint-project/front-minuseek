import { useTranslation } from 'react-i18next'
import { Icon } from '@/features/shared/icons'
import type { IconName } from '@/features/shared/icons'
import type { InvestigationCase } from '@/features/investigation-case/types/investigationCase'

type SummaryLine = { icon: IconName; label: string; value: string }

export default function CaseJudicialHeaderSummary({
  investigationCase,
}: {
  investigationCase: InvestigationCase
}) {
  const { t, i18n } = useTranslation()

  const notProvided = t('investigationCase.judicialHeader.notProvided')
  const day = (value: string | null | undefined) =>
    value ? new Date(value).toLocaleDateString(i18n.language) : null
  const stated = (value: string | null | undefined) => value || notProvided

  const from = day(investigationCase.offenseDateFrom)
  const to = day(investigationCase.offenseDateTo)
  const offenceDates =
    from === null
      ? notProvided
      : to === null
        ? t('investigationCase.judicialHeader.offenseOn', { date: from })
        : t('investigationCase.judicialHeader.offenseBetween', { from, to })

  const lines: SummaryLine[] = [
    {
      icon: 'calendar',
      label: t('investigationCase.judicialHeader.fields.requestDate.label'),
      value: day(investigationCase.requestDate) ?? notProvided,
    },
    {
      icon: 'person',
      label: t('investigationCase.judicialHeader.fields.requesterQuality.label'),
      value: stated(investigationCase.requesterQuality),
    },
    {
      icon: 'person',
      label: t('investigationCase.judicialHeader.fields.requesterName.label'),
      value: stated(investigationCase.requesterName),
    },
    {
      icon: 'personGroup',
      label: t('investigationCase.judicialHeader.fields.requesterService.label'),
      value: stated(investigationCase.requesterService),
    },
    {
      icon: 'folder',
      label: t('investigationCase.judicialHeader.fields.offenseNature.label'),
      value: stated(investigationCase.offenseNature),
    },
    {
      icon: 'location',
      label: t('investigationCase.judicialHeader.fields.offenseLocation.label'),
      value: stated(investigationCase.offenseLocation),
    },
    {
      icon: 'dateStart',
      label: t('investigationCase.judicialHeader.fields.offenseDateFrom.label'),
      value: offenceDates,
    },
    {
      icon: 'calendar',
      label: t('investigationCase.judicialHeader.fields.interventionDate.label'),
      value: day(investigationCase.interventionDate) ?? notProvided,
    },
    {
      icon: 'person',
      label: t('investigationCase.judicialHeader.fields.caseAgainst.label'),
      value: stated(investigationCase.caseAgainst),
    },
  ]

  return (
    <section className="flex flex-col gap-5 px-4 py-3 rounded-sm bg-white">
      <h2 className="text-lg font-semibold">{t('investigationCase.judicialHeader.title')}</h2>
      <dl className="flex flex-wrap gap-x-16 gap-y-3">
        {lines.map((line) => (
          <div key={line.label} className="flex items-center gap-2 text-sm">
            <Icon name={line.icon} size={20} color="var( --color-grey-medium-1)" />
            <dt className="text-muted-foreground font-medium">{line.label}</dt>
            <dd>{line.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
