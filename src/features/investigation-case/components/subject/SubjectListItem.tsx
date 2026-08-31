import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Icon } from '@/features/shared/icons'
import type { Subject } from '@/features/investigation-case/types/subject'

type SubjectListItemProps = {
  subject: Subject
}

export default function SubjectListItem({ subject }: SubjectListItemProps) {
  const { t, i18n } = useTranslation()
  const birthDate = subject.birthDate ? new Date(subject.birthDate).toLocaleDateString(i18n.language) : null

  return (
    <Link
      to={subject.id}
      className="flex items-center justify-between gap-4 rounded-sm px-4 py-3 transition-colors hover:bg-blue-light-2/50"
    >
      <div className="flex flex-col">
        <span className="font-semibold text-blue-dark-2">
          {subject.firstName} {subject.lastName}
        </span>
        {birthDate && (
          <span className="text-sm text-muted-foreground">{t('subject.list.bornOn', { date: birthDate })}</span>
        )}
      </div>
      <Icon name="arrowSmallRight" size={24} color="var(--color-blue-dark-2)" />
    </Link>
  )
}
