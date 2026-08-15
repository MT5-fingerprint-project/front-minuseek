import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Icon } from '@/features/shared/icons'
import { Button } from '@/features/shared/ui/button'
import { Spinner } from '@/features/shared/ui/spinner'
import { H1 } from '@/features/shared/ui/typography'
import { useInvestigationCase } from '@/features/investigation-case/hooks/useInvestigationCases'
import { useCreateSubject, useSubjects } from '@/features/investigation-case/hooks/useSubjects'
import SubjectCreateForm from '@/features/investigation-case/components/subject/SubjectCreateForm'
import SubjectTypeColumn from '@/features/investigation-case/components/subject/SubjectTypeColumn'

export default function InvestigationCaseSubjectsPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const { data: investigationCase } = useInvestigationCase(id ?? '')
  const { data: subjects = [], isPending } = useSubjects(id ?? '')
  const createSubject = useCreateSubject(id ?? '')

  if (isPending) return <Spinner className="size-6" />

  const closeAssociates = subjects.filter((subject) => subject.type === 'CLOSE_ASSOCIATE')
  const personsOfInterest = subjects.filter((subject) => subject.type === 'PERSON_OF_INTEREST')

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <H1 className="text-2xl font-bold">
            {t('subject.list.title', { caseNumber: investigationCase?.caseNumber ?? '' })}
          </H1>
          <p className="text-sm text-muted-foreground">
            {t('subject.list.summary', {
              closeAssociates: t('subject.list.closeAssociateCount', { count: closeAssociates.length }),
              personsOfInterest: t('subject.list.personOfInterestCount', { count: personsOfInterest.length }),
            })}
          </p>
        </div>
        <Button type="button" variant="blue" onClick={() => setIsCreateDialogOpen(true)}>
          {t('subject.list.add')}
          <Icon name="plus" size={24} color="white" />
        </Button>
      </div>

      <div className="flex flex-col gap-10 lg:flex-row">
        <SubjectTypeColumn
          title={t('subject.list.closeAssociates')}
          subjects={closeAssociates}
          className="bg-white"
        />
        <SubjectTypeColumn
          title={t('subject.list.personsOfInterest')}
          subjects={personsOfInterest}
          className="bg-blue-light-1"
        />
      </div>

      <SubjectCreateForm
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={createSubject.mutateAsync}
      />
    </div>
  )
}
