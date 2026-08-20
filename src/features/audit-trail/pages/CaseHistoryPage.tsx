import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Icon } from '@/features/shared/icons'
import { Button } from '@/features/shared/ui/button'
import { Spinner } from '@/features/shared/ui/spinner'
import { H1 } from '@/features/shared/ui/typography'
import CaseHistoryTimeline from '@/features/audit-trail/components/CaseHistoryTimeline'
import { useCaseAuditEvents } from '@/features/audit-trail/hooks/useCaseAuditEvents'

export default function CaseHistoryPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const { data, isPending } = useCaseAuditEvents(id ?? '', { page })

  if (isPending) return <Spinner className="size-6" />

  if (!data) return null

  const { data: events, meta } = data

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <H1 className="text-2xl font-bold">{t('auditTrail.title')}</H1>
        <p className="text-sm text-muted-foreground">{t('auditTrail.subtitle')}</p>
      </div>
      <section className="flex flex-col gap-5 rounded-sm bg-white px-4 py-3">
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('auditTrail.empty')}</p>
        ) : (
          <CaseHistoryTimeline events={events} />
        )}
        {meta.pageCount > 1 && (
          <div className="flex items-center justify-between">
            <Button
              variant="grey"
              size="small"
              disabled={!meta.hasPreviousPage}
              onClick={() => setPage(meta.page - 1)}
            >
              <Icon name="chevronLeft" size={12} data-icon="inline-start" />
              {t('auditTrail.pagination.previous')}
            </Button>
            <span className="text-xs text-muted-foreground">
              {t('auditTrail.pagination.position', { page: meta.page, pageCount: meta.pageCount })}
            </span>
            <Button variant="grey" size="small" disabled={!meta.hasNextPage} onClick={() => setPage(meta.page + 1)}>
              {t('auditTrail.pagination.next')}
              <Icon name="chevronRight" size={12} data-icon="inline-end" />
            </Button>
          </div>
        )}
      </section>
    </div>
  )
}
