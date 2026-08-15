import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Icon } from '@/features/shared/icons'
import { Spinner } from '@/features/shared/ui/spinner'
import { H1 } from '@/features/shared/ui/typography'
import { useSubject } from '@/features/investigation-case/hooks/useSubjects'
import SubjectInfoCard from '@/features/investigation-case/components/subject/SubjectInfoCard'
import SubjectPrintsSection from '@/features/investigation-case/components/subject/SubjectPrintsSection'

export default function SubjectDetailsPage() {
  const { id, subjectId } = useParams<{ id: string; subjectId: string }>()
  const { t, i18n } = useTranslation()
  const { data: subject, isPending } = useSubject(subjectId ?? '')

  if (isPending) return <Spinner className="size-6" />

  if (!subject || !id) return null

  const createdDate = new Date(subject.createdAt).toLocaleDateString(i18n.language)

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      <div className="flex flex-col gap-3">
        <Link
          to=".."
          className="flex w-fit items-center gap-2 text-muted-foreground transition-colors hover:text-blue-dark-2"
        >
          <Icon name="arrowSmallLeft" size={24} color="currentColor" />
          {t('subject.details.back')}
        </Link>
        <div className="flex flex-col gap-1">
          <H1 className="text-2xl font-bold">
            {subject.firstName} {subject.lastName}{' '}
            <span className="font-medium text-grey-medium-1">– {t(`subject.type.${subject.type}`)}</span>
          </H1>
          <p className="text-sm text-muted-foreground">{t('subject.details.createdAt', { date: createdDate })}</p>
        </div>
      </div>

      <SubjectInfoCard subject={subject} />

      <SubjectPrintsSection caseId={id} subjectId={subject.id} />
    </div>
  )
}
