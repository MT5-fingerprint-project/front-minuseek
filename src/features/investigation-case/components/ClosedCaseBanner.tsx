import { useTranslation } from 'react-i18next'
import { Icon } from '@/features/shared/icons'
import { useCaseIsClosed } from '@/features/investigation-case/hooks/useCaseIsClosed'

export default function ClosedCaseBanner({ caseId }: { caseId: string }) {
  const { t } = useTranslation()
  const isClosed = useCaseIsClosed(caseId)

  if (!isClosed) return null

  return (
    <div className="flex items-center gap-2 rounded-sm bg-blue-light-1 px-3 py-2 text-sm">
      <Icon name="information" size={20} color="var(--color-blue-medium-1)" />
      <span>{t('investigationCase.closure.banner')}</span>
    </div>
  )
}
