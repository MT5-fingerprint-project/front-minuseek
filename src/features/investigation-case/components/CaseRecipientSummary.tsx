import { useTranslation } from 'react-i18next'
import { Icon } from '@/features/shared/icons'
import { Button } from '@/features/shared/ui/button'
import type { InvestigationCase } from '@/features/investigation-case/types/investigationCase'

export default function CaseRecipientSummary({
  investigationCase,
  onEdit,
}: {
  investigationCase: InvestigationCase
  onEdit: () => void
}) {
  const { t } = useTranslation()

  const authority = investigationCase.recipientAuthority
  const quality = investigationCase.recipientAttentionQuality
  const name = investigationCase.recipientAttentionName
  const attention =
    quality || name
      ? t('investigationCase.recipient.attentionLine', {
          quality: quality ?? '',
          name: name ?? '',
        }).trim()
      : null

  return (
    <section className="flex flex-col gap-5 px-4 py-3 rounded-sm bg-white">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">{t('investigationCase.recipient.title')}</h2>
        <Button variant="outline" size="small" onClick={onEdit}>
          {t('investigationCase.recipient.choose')}
          <Icon name="pen" size={12} data-icon="inline-end" color="currentColor" />
        </Button>
      </div>
      <div className="flex flex-col gap-1 text-sm">
        <p>{authority || t('investigationCase.recipient.notProvided')}</p>
        {attention && <p className="text-muted-foreground">{attention}</p>}
      </div>
    </section>
  )
}
