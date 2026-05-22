import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { H1 } from '../components/ui/typography'
import type { InvestigationCase } from '@/types/investigationCase/investigationCase'

export default function InvestigationCaseDetailsPage() {
  const { id } = useParams()

  const [investigationCaseDatas, setInvestigationCaseDatas] = useState<InvestigationCase[]>([])

  return (
    <div className="flex flex-col gap-4">
      <H1>Affaire {id}</H1>
    </div>
  )
}
