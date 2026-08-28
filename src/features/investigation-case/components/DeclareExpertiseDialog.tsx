import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/features/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/features/shared/ui/dialog'
import { Input } from '@/features/shared/ui/input'
import { Label } from '@/features/shared/ui/label'
import { Switch } from '@/features/shared/ui/switch'
import { useCurrentUser } from '@/features/shared/hooks/useCurrentUser'
import { useServiceSettings } from '@/features/settings/hooks/useServiceSettings'
import { useDeclareCaseExpertise } from '@/features/investigation-case/hooks/useInvestigationCases'

export default function DeclareExpertiseDialog({
  caseId,
  open,
  onOpenChange,
}: {
  caseId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useTranslation()
  const { data: currentUser } = useCurrentUser()
  const { data: serviceSettings } = useServiceSettings()
  const declareExpertise = useDeclareCaseExpertise(caseId)
  const [courtReference, setCourtReference] = useState('')
  const [isEngaged, setIsEngaged] = useState(false)

  const oathStatement = t('investigationCase.expertise.oathFormula', {
    expert: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : '',
    grade: currentUser?.grade ?? '',
    service: serviceSettings?.serviceName ?? '',
    court: courtReference.trim(),
  })

  const isDeclarable = isEngaged && courtReference.trim().length > 0 && !declareExpertise.isPending

  function reset(nextOpen: boolean) {
    onOpenChange(nextOpen)
    if (!nextOpen) {
      setCourtReference('')
      setIsEngaged(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={reset}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('investigationCase.expertise.dialogTitle')}</DialogTitle>
          <DialogDescription>{t('investigationCase.expertise.dialogDescription')}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <Label htmlFor="court-reference">{t('investigationCase.expertise.courtLabel')}</Label>
          <Input
            id="court-reference"
            value={courtReference}
            placeholder={t('investigationCase.expertise.courtPlaceholder')}
            onChange={(event) => setCourtReference(event.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">{t('investigationCase.expertise.oathHeading')}</p>
          <p className="rounded-sm bg-blue-light-1 px-4 py-3 text-sm leading-relaxed whitespace-pre-line">
            {oathStatement}
          </p>
        </div>

        <div className="flex items-start gap-3">
          <Switch
            id="expertise-engagement"
            checked={isEngaged}
            onCheckedChange={(checked) => setIsEngaged(checked)}
          />
          <Label htmlFor="expertise-engagement" className="text-sm leading-relaxed">
            {t('investigationCase.expertise.engagementLabel')}
          </Label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => reset(false)}>
            {t('common.actions.cancel')}
          </Button>
          <Button
            variant="blue"
            disabled={!isDeclarable}
            onClick={() =>
              declareExpertise.mutate(
                { oathStatement, courtReference: courtReference.trim() },
                { onSuccess: () => reset(false) }
              )
            }
          >
            {t('investigationCase.expertise.confirmAction')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
