import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { H1 } from '../../shared/ui/typography'

export default function InvestigationCaseDetailsPage() {
  const { id } = useParams()
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-4">
      <H1>{t('investigationCase.details.title', { id })}</H1>
    </div>
  )
}
