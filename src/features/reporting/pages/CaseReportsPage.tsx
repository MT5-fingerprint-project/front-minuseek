import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/features/shared/ui/button'
import { Label } from '@/features/shared/ui/label'
import { Switch } from '@/features/shared/ui/switch'
import { Spinner } from '@/features/shared/ui/spinner'
import { H1 } from '@/features/shared/ui/typography'
import { useCurrentUser } from '@/features/shared/hooks/useCurrentUser'
import CaseReportList from '@/features/reporting/components/CaseReportList'
import { useCaseReports, useDownloadReport, useGenerateReport } from '@/features/reporting/hooks/useCaseReports'

const JOURNAL_DETAIL_FIELD_ID = 'report-journal-detail'

export default function CaseReportsPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const caseId = id ?? ''
  const { data: reports, isPending } = useCaseReports(caseId)
  const { data: currentUser } = useCurrentUser()
  const generate = useGenerateReport(caseId)
  const download = useDownloadReport()
  const [detailedJournal, setDetailedJournal] = useState(false)
  const journalDetail = detailedJournal ? 'FULL' : 'SUMMARY'

  if (isPending) return <Spinner className="size-6" />

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <H1 className="text-2xl font-bold">{t('reporting.title')}</H1>
        <p className="text-sm text-muted-foreground">{t('reporting.subtitle')}</p>
      </div>

      <section className="flex flex-col gap-4 rounded-sm bg-white px-4 py-3">
        {currentUser && (
          <p className="text-sm">
            {t('reporting.signer.notice', {
              signer: `${currentUser.grade} ${currentUser.lastName.toLocaleUpperCase('fr')} ${currentUser.firstName}`,
            })}
          </p>
        )}

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Switch
              id={JOURNAL_DETAIL_FIELD_ID}
              checked={detailedJournal}
              onCheckedChange={(checked) => setDetailedJournal(checked)}
            />
            <Label htmlFor={JOURNAL_DETAIL_FIELD_ID}>{t('reporting.journalDetail.label')}</Label>
          </div>
          <p className="text-xs text-muted-foreground">{t('reporting.journalDetail.hint')}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="dark"
            size="small"
            disabled={generate.isPending}
            onClick={() => generate.mutate({ type: 'TECHNICAL', journalDetail })}
          >
            {t('reporting.generate.EXPLOITATION')}
          </Button>
          <Button
            variant="grey"
            size="small"
            disabled={generate.isPending}
            onClick={() => generate.mutate({ type: 'TRACEABILITY', journalDetail: 'SUMMARY' })}
          >
            {t('reporting.generate.TRACEABILITY')}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">{t('reporting.regenerateNotice')}</p>
        <p className="text-xs text-muted-foreground">{t('reporting.sealNotice')}</p>
      </section>

      <section className="flex flex-col gap-5 rounded-sm bg-white px-4 py-3">
        <h2 className="text-lg font-semibold">{t('reporting.listTitle')}</h2>
        <CaseReportList
          reports={reports ?? []}
          onDownload={(reportId) => download.mutate(reportId)}
          downloadingReportId={download.isPending ? download.variables : undefined}
        />
      </section>
    </div>
  )
}
