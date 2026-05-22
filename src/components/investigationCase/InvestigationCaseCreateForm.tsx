import { FormEvent, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { InvestigationCase } from '@/types/investigationCase/investigationCase'

type InvestigationCaseCreateFormProps = {
  isCreateDialogOpen: boolean
  setIsCreateDialogOpen: (open: boolean) => void
  onSubmit?: (values: Partial<InvestigationCase>) => void
}

const INITIAL_VALUES: Partial<InvestigationCase> = {
  caseNumber: '',
  pvNumber: '',
  description: '',
  location: '',
  status: 'OPEN',
}

export default function InvestigationCaseCreateForm({
  isCreateDialogOpen,
  setIsCreateDialogOpen,
  onSubmit,
}: InvestigationCaseCreateFormProps) {
  const [formValues, setFormValues] = useState<Partial<InvestigationCase>>(INITIAL_VALUES)

  const handleCreateCaseSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit?.(formValues)
    setFormValues(INITIAL_VALUES)
    setIsCreateDialogOpen(false)
  }

  return (
    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Creer une affaire</DialogTitle>
          <DialogDescription>Renseignez les informations de la nouvelle affaire.</DialogDescription>
        </DialogHeader>

        <form id="create-case-form" className="grid gap-4" onSubmit={handleCreateCaseSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="caseNumber">Numero d'affaire</Label>
            <Input
              id="caseNumber"
              value={formValues.caseNumber}
              onChange={(event) => setFormValues((previous) => ({ ...previous, caseNumber: event.target.value }))}
              placeholder="2024-004"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="pvNumber">Numero du PV</Label>
            <Input
              id="pvNumber"
              value={formValues.pvNumber}
              onChange={(event) => setFormValues((previous) => ({ ...previous, pvNumber: event.target.value }))}
              placeholder="PV-2024-004"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="caseDescription">Description</Label>
            <Textarea
              id="caseDescription"
              value={formValues.description}
              onChange={(event) => setFormValues((previous) => ({ ...previous, description: event.target.value }))}
              placeholder="Decrivez l'affaire..."
              rows={4}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="caseLocation">Localisation</Label>
            <Input
              id="caseLocation"
              value={formValues.location}
              onChange={(event) => setFormValues((previous) => ({ ...previous, location: event.target.value }))}
              placeholder="ex: 59 rue nationale, 75013 Paris"
              required
            />
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" type="button" onClick={() => setIsCreateDialogOpen(false)}>
            Annuler
          </Button>
          <Button type="submit" form="create-case-form">
            Creer l'affaire
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
