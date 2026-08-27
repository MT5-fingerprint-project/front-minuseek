import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/features/shared/ui/button'
import { Textarea } from '@/features/shared/ui/textarea'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/features/shared/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/features/shared/ui/dialog'
import {
  useCloseInvestigationCase,
  useReopenInvestigationCase,
} from '@/features/investigation-case/hooks/useInvestigationCases'
import type { InvestigationCase } from '@/features/investigation-case/types/investigationCase'

export default function CaseClosureActions({
  investigationCase,
}: {
  investigationCase: InvestigationCase
}) {
  const { t } = useTranslation()
  const closeCase = useCloseInvestigationCase(investigationCase.id)
  const reopenCase = useReopenInvestigationCase(investigationCase.id)
  const [isReopening, setIsReopening] = useState(false)
  const [reason, setReason] = useState('')

  if (investigationCase.status === 'CLOSED') {
    return (
      <>
        <Button variant="outline" size="small" onClick={() => setIsReopening(true)}>
          {t('investigationCase.closure.reopen')}
        </Button>
        <Dialog
          open={isReopening}
          onOpenChange={(open) => {
            setIsReopening(open)
            if (!open) setReason('')
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('investigationCase.closure.reopen')}</DialogTitle>
              <DialogDescription>
                {t('investigationCase.closure.destroyedPrintsWarning')}
              </DialogDescription>
            </DialogHeader>
            <Textarea
              value={reason}
              aria-label={t('investigationCase.closure.reasonLabel')}
              placeholder={t('investigationCase.closure.reasonPlaceholder')}
              onChange={(event) => setReason(event.target.value)}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsReopening(false)}>
                {t('common.actions.cancel')}
              </Button>
              <Button
                variant="blue"
                disabled={reason.trim().length === 0 || reopenCase.isPending}
                onClick={() =>
                  reopenCase.mutate(reason.trim(), { onSuccess: () => setIsReopening(false) })
                }
              >
                {t('investigationCase.closure.reopen')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="small">
          {t('investigationCase.closure.close')}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t('investigationCase.closure.confirmTitle', {
              caseNumber: investigationCase.caseNumber,
            })}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t('investigationCase.closure.confirmDescription')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('common.actions.cancel')}</AlertDialogCancel>
          <AlertDialogAction disabled={closeCase.isPending} onClick={() => closeCase.mutate()}>
            {t('investigationCase.closure.confirmAction')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
