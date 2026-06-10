import type { InvestigationCase } from '@/features/investigation-case/types/investigationCase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/features/shared/ui/card'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CaseStatusBadge } from '@/features/investigation-case/components/CaseStatusBadge'
import { DateStart } from '@/features/shared/icons'

export default function InvestigationCaseCard({ investigationCase }: { investigationCase: InvestigationCase }) {
  const { t, i18n } = useTranslation()
  const formattedDate = new Date(investigationCase.createdAt).toLocaleDateString(i18n.language)

  return (
    <Link to={`/affaires/${investigationCase.id}`} className="min-h-44">
      <Card key={investigationCase.id} className="h-full">
        <CardHeader>
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
            <DateStart className="size-5 text-[grey]" />
            <span>{t('investigationCase.card.createdOn', { date: formattedDate })}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
