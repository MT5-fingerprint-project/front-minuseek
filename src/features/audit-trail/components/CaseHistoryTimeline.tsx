import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '@/features/shared/icons'
import type { IconName } from '@/features/shared/icons'
import { Badge } from '@/features/shared/ui/badge'
import { Button } from '@/features/shared/ui/button'
import type { AuditEventType, CaseAuditEvent } from '@/features/audit-trail/types/auditEvent'

const EVENT_ICONS: Record<AuditEventType, IconName> = {
  TENANT_PROVISIONED: 'personGroup',
  CASE_OPENED: 'folder',
  CASE_STATUS_CHANGED: 'information',
  CASE_OPERATOR_CHANGED: 'personGroup',
  CASE_UPDATED: 'pen',
  CASE_EXPERTISE_DECLARED: 'verified',
  CASE_SAISINE_UPDATED: 'pen',
  SUBJECT_REGISTERED: 'personGroup',
  TRACE_UPLOADED: 'import',
  TRACE_QUALIFIED: 'check',
  TRACE_DELETED: 'close',
  REFERENCE_PRINT_UPLOADED: 'importPlus',
  REFERENCE_PRINT_DELETED: 'fingerprintOff',
  TRACE_RESTORED: 'undo',
  REFERENCE_PRINT_RESTORED: 'undo',
  REFERENCE_PRINT_IMAGE_DESTROYED: 'fingerprintOff',
  LAYER_CREATED: 'layers',
  LAYER_UPDATED: 'pen',
  LAYER_DELETED: 'layersOff',
  COMPARISON_EXECUTED: 'compare',
  HIT_RECORDED: 'fingerprintCheck',
  HIT_REMOVED: 'fingerprint',
  REPORT_GENERATED: 'fileExport',
  CHAIN_ANCHORED: 'verified',
  SERVICE_HEADER_SAVED: 'settings',
  TRACE_CALIBRATED: 'ruler',
  REFERENCE_PRINT_CALIBRATED: 'ruler',
  CASE_VERIFICATION_REQUESTED: 'personCheck',
  VERIFICATION_CONCLUSION_STATED: 'check',
  CASE_VERIFICATION_COMPLETED: 'verified',
  TRACE_DESCRIBED: 'penTrace',
  TRACE_LOCATION_STATED: 'location',
  LOCATION_PHOTO_UPLOADED: 'location',
  LOCATION_PHOTO_DELETED: 'close',
  CONCORDANCE_VIDEO_DEPOSITED: 'fileExport',
}

const FALLBACK_EVENT_ICON: IconName = 'information'

function CaseHistoryEntry({ event }: { event: CaseAuditEvent }) {
  const { t, i18n } = useTranslation()
  const [isPayloadVisible, setIsPayloadVisible] = useState(false)

  const occurredAt = new Date(event.occurredAt)
  const byline = t('auditTrail.entry.byline', {
    actor: event.actor.displayName,
    date: occurredAt.toLocaleDateString(i18n.language),
    time: occurredAt.toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' }),
  })
  const hasPayload = Object.keys(event.payload).length > 0

  return (
    <li className="group flex gap-4">
      <div className="flex flex-col items-center">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-light-1">
          <Icon name={EVENT_ICONS[event.eventType] ?? FALLBACK_EVENT_ICON} size={16} />
        </span>
        <span className="w-px flex-1 bg-blue-light-2 group-last:hidden" />
      </div>
      <div className="flex flex-1 flex-col gap-1 pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">{t(`auditTrail.eventType.${event.eventType}`)}</span>
          <Badge variant={event.evidenceClass === 'OBSERVED' ? 'secondary' : 'outline'}>
            {t(`auditTrail.evidenceClass.${event.evidenceClass}`)}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">{byline}</p>
        {hasPayload && (
          <div className="flex flex-col items-start gap-1">
            <Button
              type="button"
              variant="link"
              size="small"
              className="p-0 text-xs text-blue-medium-1 underline-offset-2"
              aria-expanded={isPayloadVisible}
              onClick={() => setIsPayloadVisible(!isPayloadVisible)}
            >
              {isPayloadVisible ? t('auditTrail.entry.hideDetail') : t('auditTrail.entry.showDetail')}
            </Button>
            {isPayloadVisible && (
              <pre className="w-full overflow-x-auto rounded-sm bg-grey-light-1 p-3 text-xs">
                {JSON.stringify(event.payload, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </li>
  )
}

export default function CaseHistoryTimeline({ events }: { events: CaseAuditEvent[] }) {
  return (
    <ol className="flex flex-col">
      {events.map((event) => (
        <CaseHistoryEntry key={event.seq} event={event} />
      ))}
    </ol>
  )
}
