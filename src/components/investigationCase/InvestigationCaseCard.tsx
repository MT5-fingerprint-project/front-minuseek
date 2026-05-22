import type { InvestigationCase } from '@/types/investigationCase/investigationCase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { INVESTIGATION_CASE_STATUS_LABELS } from '@/constants/investigationCase/investigationCase.constants'
import { Badge } from '../ui/badge'
import { Link } from 'react-router-dom'

export default function InvestigationCaseCard({ investigationCase }: { investigationCase: InvestigationCase }) {
  return (
    <Link to={`/affaires/${investigationCase.id}`} className="min-h-44">
      <Card key={investigationCase.id} className="h-full">
        <CardHeader>
          <Badge variant="secondary">{INVESTIGATION_CASE_STATUS_LABELS[investigationCase.status]}</Badge>
          <CardTitle className="text-base">Affaire N°{investigationCase.caseNumber}</CardTitle>
          <CardDescription>PV N°{investigationCase.pvNumber}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <div className="text-xs text-muted-foreground">
            Crée le {investigationCase.createdAt.toLocaleDateString('fr-FR')}
          </div>
          <div className="text-sm text-muted-foreground line-clamp-2">{investigationCase.description}</div>
          <div className="text-sm text-muted-foreground line-clamp-2">{investigationCase.location}</div>
        </CardContent>
      </Card>
    </Link>
  )
}
