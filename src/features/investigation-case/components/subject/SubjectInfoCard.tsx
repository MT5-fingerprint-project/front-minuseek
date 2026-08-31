import { useTranslation } from 'react-i18next'
import { Icon, type IconName } from '@/features/shared/icons'
import type { Subject } from '@/features/investigation-case/types/subject'

type SubjectInfoCardProps = {
  subject: Subject
}

function InfoRow({ icon, label, value }: { icon: IconName; label: string; value: string | null }) {
  const { t } = useTranslation()

  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon name={icon} size={20} color="var(--color-grey-medium-1)" />
      <span className="font-medium text-muted-foreground">{label}</span>
      <span>{value || t('subject.details.notProvided')}</span>
    </div>
  )
}

export default function SubjectInfoCard({ subject }: SubjectInfoCardProps) {
  const { t, i18n } = useTranslation()
  const birthDate = subject.birthDate ? new Date(subject.birthDate).toLocaleDateString(i18n.language) : null

  return (
    <section className="flex flex-col gap-5 rounded-sm bg-white px-4 py-3">
      <h2 className="text-lg font-semibold">{t('subject.details.informations')}</h2>
      <div className="grid gap-x-16 gap-y-3 sm:grid-cols-2">
        <div className="flex flex-col gap-3">
          <InfoRow icon="calendar" label={t('subject.details.birthDate')} value={birthDate} />
          <InfoRow icon="location" label={t('subject.details.birthPlace')} value={subject.birthPlace} />
          <InfoRow icon="person" label={t('subject.details.sex')} value={t(`subject.sex.${subject.sex}`)} />
          <InfoRow icon="information" label={t('subject.details.phone')} value={subject.phoneNumber} />
        </div>
        <div className="flex flex-col gap-3">
          <InfoRow icon="personProfile" label={t('subject.details.firstParent')} value={subject.firstParentName} />
          <InfoRow icon="personProfile" label={t('subject.details.secondParent')} value={subject.secondParentName} />
        </div>
      </div>
    </section>
  )
}
