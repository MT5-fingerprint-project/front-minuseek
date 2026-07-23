import type { InvestigationCase } from '@/features/investigation-case/types/investigationCase'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CaseStatusBadge } from '@/features/investigation-case/components/CaseStatusBadge'
import NotchedCardFrame from '@/features/investigation-case/components/NotchedCardFrame'
import { Icon } from '@/features/shared/icons'

export default function InvestigationCaseCard({ investigationCase }: { investigationCase: InvestigationCase }) {
  const { t, i18n } = useTranslation()
  const { slug } = useParams<{ slug: string }>()
  const formattedDate = new Date(investigationCase.createdAt).toLocaleDateString(i18n.language)

  return (
    <Link to={`/${slug}/affaires/${investigationCase.id}`} className="group relative block size-[200px]">
      <NotchedCardFrame />
      <div className="relative flex h-full flex-col justify-between px-3 pt-3 pb-4">
        <div className="flex flex-col gap-1">
          <CaseStatusBadge status={investigationCase.status} />
          <p className="mt-2 text-base font-semibold text-blue-dark-2">
            {t('investigationCase.card.title', { caseNumber: investigationCase.caseNumber })}
          </p>
          <p className="text-sm text-grey-medium-2">
            {t('investigationCase.card.pvNumber', { pvNumber: investigationCase.pvNumber })}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-grey-medium-2">
          <Icon name="dateStart" size={18} color="var(--color-grey-medium-1)" />
          <span>{t('investigationCase.card.createdOn', { date: formattedDate })}</span>
        </div>
      </div>
    </Link>
  )
}
