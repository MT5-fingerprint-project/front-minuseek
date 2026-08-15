import { useTranslation } from 'react-i18next'
import { cn } from '@/features/shared/lib/utils'
import SubjectListItem from '@/features/investigation-case/components/subject/SubjectListItem'
import type { Subject } from '@/features/investigation-case/types/subject'

type SubjectTypeColumnProps = {
  title: string
  subjects: Subject[]
  className?: string
}

export default function SubjectTypeColumn({ title, subjects, className }: SubjectTypeColumnProps) {
  const { t } = useTranslation()

  return (
    <section className="flex flex-1 flex-col gap-4">
      <h2 className="text-xl font-semibold text-blue-dark-2">{title}</h2>
      {subjects.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('subject.list.empty')}</p>
      ) : (
        <div className={cn('flex flex-col rounded-md p-2', className)}>
          {subjects.map((subject) => (
            <SubjectListItem key={subject.id} subject={subject} />
          ))}
        </div>
      )}
    </section>
  )
}
