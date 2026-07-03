import type { InvestigationCase } from '@/features/investigation-case/types/investigationCase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/features/shared/ui/card'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CaseStatusBadge } from '@/features/investigation-case/components/CaseStatusBadge'
import { Icon } from '@/features/shared/icons'

export default function InvestigationCaseCard({ investigationCase }: { investigationCase: InvestigationCase }) {
  const { t, i18n } = useTranslation()
  const { slug } = useParams<{ slug: string }>()
  const formattedDate = new Date(investigationCase.createdAt).toLocaleDateString(i18n.language)

  return (
    <Link to={`/${slug}/affaires/${investigationCase.id}`} className="min-h-44">
      <Card key={investigationCase.id} className="h-full">
        <CardHeader className="justify-items-start">
          <CaseStatusBadge status={investigationCase.status} />
          <CardTitle className="text-lg font-semibold">
            {t('investigationCase.card.title', { caseNumber: investigationCase.caseNumber })}
          </CardTitle>
          <CardDescription>
            {t('investigationCase.card.pvNumber', { pvNumber: investigationCase.pvNumber })}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <Icon name="dateStart" size={20} color="var(--color-grey-medium-1)" />
            <span>{t('investigationCase.card.createdOn', { date: formattedDate })}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
