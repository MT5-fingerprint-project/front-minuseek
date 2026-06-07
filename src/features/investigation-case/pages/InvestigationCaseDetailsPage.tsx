import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FolderIcon, DateStartIcon } from "@/features/shared/icons"
import { useInvestigationCases } from '@/features/investigation-case/hooks/useInvestigationCases'
import { CaseStatusBadge } from '@/features/investigation-case/components/CaseStatusBadge'
import { Spinner } from '@/features/shared/ui/spinner'
import { H1 } from '@/features/shared/ui/typography'

export default function InvestigationCaseDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const { t, i18n } = useTranslation()
  const { data: investigationCase, isPending } = useInvestigationCases(id ?? '')

  if (isPending) return <Spinner className="size-6" />

  if (!investigationCase) return null

  const updatedDate = new Date(investigationCase.updatedAt).toLocaleDateString(i18n.language)
  const updatedTime = new Date(investigationCase.updatedAt).toLocaleTimeString(i18n.language, {
    hour: '2-digit',
    minute: '2-digit',
  })
  const openedDate = new Date(investigationCase.createdAt).toLocaleDateString(i18n.language)

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <H1 className="text-2xl font-bold">
            {t('investigationCase.details.title', { caseNumber: investigationCase.caseNumber })}
          </H1>
          <CaseStatusBadge status={investigationCase.status} />
        </div>
        <p className="text-sm text-muted-foreground">
          {t('investigationCase.details.updatedAt', { date: updatedDate, time: updatedTime })}
        </p>
      </div>
      <section className="flex flex-col gap-5 px-4 py-3  rounded-sm bg-white">
        <h2 className="text-lg font-semibold">{t('investigationCase.details.informations')}</h2>
        <div className="flex flex-wrap gap-x-16 gap-y-3">
          <div className="flex items-center gap-2 text-sm">
            <FolderIcon size={20} color="grey" />
            <span className="text-muted-foreground font-medium">{t('investigationCase.details.pvNumber')}</span>
            <span>{investigationCase.pvNumber}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <DateStartIcon size={20} color="grey" />
            <span className="text-muted-foreground font-medium">{t('investigationCase.details.openedAt')}</span>
            <span>{openedDate}</span>
          </div>
        </div>
      </section>
      {investigationCase.description && (
        <section className="flex flex-col gap-5 px-4 py-3 rounded-sm bg-blue-light-1">
          <h2 className="text-lg font-semibold">{t('investigationCase.details.context')}</h2>
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground font-medium">
              {t('investigationCase.details.summary')}
            </p>
            <p className="text-sm leading-relaxed">{investigationCase.description}</p>
          </div>
        </section>
      )}
    </div>
  )
}
