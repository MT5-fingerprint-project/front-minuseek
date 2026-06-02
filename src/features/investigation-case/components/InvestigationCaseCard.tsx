import type { InvestigationCase } from '@/features/investigation-case/types/investigationCase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/features/shared/ui/card'
import { Badge } from '../../shared/ui/badge'
import { Link } from 'react-router-dom'
import { Calendar, MapPin } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function InvestigationCaseCard({ investigationCase }: { investigationCase: InvestigationCase }) {
  const { t, i18n } = useTranslation()
  const formattedDate = new Date(investigationCase.createdAt).toLocaleDateString(i18n.language)

  return (
    <Link to={`/affaires/${investigationCase.id}`} className="min-h-44">
      <Card key={investigationCase.id} className="h-full">
        <CardHeader>
          <Badge variant="secondary">{t(`investigationCase.status.${investigationCase.status}`)}</Badge>
          <CardTitle className="text-lg font-semibold">
            {t('investigationCase.card.title', { caseNumber: investigationCase.caseNumber })}
          </CardTitle>
          <CardDescription>
            {t('investigationCase.card.pvNumber', { pvNumber: investigationCase.pvNumber })}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{t('investigationCase.card.createdOn', { date: formattedDate })}</span>
          </div>
          <div className="text-sm text-muted-foreground line-clamp-2 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{investigationCase.location}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
