import { useTranslation } from 'react-i18next'
import { Icon } from '@/features/shared/icons'
import { Badge } from '@/features/shared/ui/badge'
import { caseUserNameOf, type CaseExpertise } from '@/features/investigation-case/types/investigationCase'

export default function ExpertiseBanner({ expertise }: { expertise: CaseExpertise }) {
  const { t, i18n } = useTranslation()
  const swornDate = new Date(expertise.swornAt).toLocaleDateString(i18n.language)

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-sm bg-blue-light-1 px-3 py-2 text-sm">
      <Icon name="verified" size={20} color="var(--color-blue-medium-1)" />
      <Badge variant="secondary">{t('investigationCase.expertise.bannerTitle')}</Badge>
      <span>
        {t('investigationCase.expertise.bannerDetail', {
          expert: expertise.expert ? caseUserNameOf(expertise.expert) : t('investigationCase.expertise.unknownExpert'),
          date: swornDate,
          court: expertise.courtReference,
        })}
      </span>
    </div>
  )
}
