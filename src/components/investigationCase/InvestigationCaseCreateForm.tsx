import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  investigationCaseCreateSchema,
  type InvestigationCaseCreateInput,
} from '@/types/investigationCase/investigationCase'

type InvestigationCaseCreateFormProps = {
  isCreateDialogOpen: boolean
  setIsCreateDialogOpen: (open: boolean) => void
  onSubmit: (values: InvestigationCaseCreateInput) => Promise<void> | void
}

const DEFAULT_VALUES: InvestigationCaseCreateInput = {
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
  const form = useForm<InvestigationCaseCreateInput>({
    resolver: zodResolver(investigationCaseCreateSchema),
    defaultValues: DEFAULT_VALUES,
  })

  const handleCreateCaseSubmit = async (values: InvestigationCaseCreateInput) => {
    try {
      await onSubmit(values)
      form.reset(DEFAULT_VALUES)
      setIsCreateDialogOpen(false)
    } catch (error) {
      form.setError('root', {
        message: error instanceof Error ? error.message : 'Une erreur est survenue',
      })
    }
  }

  return (
    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer une affaire</DialogTitle>
          <DialogDescription>Renseignez les informations de la nouvelle affaire.</DialogDescription>
        </DialogHeader>

        <form
          id="create-case-form"
          className="grid gap-4"
          onSubmit={form.handleSubmit(handleCreateCaseSubmit)}
          noValidate
        >
          <Controller
            control={form.control}
            name="caseNumber"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Numéro d'affaire</FieldLabel>
                <Input
                  id={field.name}
                  placeholder="2024-004"
                  aria-invalid={fieldState.invalid}
                  {...field}
                />
                <FieldError errors={fieldState.error ? [fieldState.error] : undefined} />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="pvNumber"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Numéro du PV</FieldLabel>
                <Input
                  id={field.name}
                  placeholder="PV-2024-004"
                  aria-invalid={fieldState.invalid}
                  {...field}
                />
                <FieldError errors={fieldState.error ? [fieldState.error] : undefined} />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="description"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                <Textarea
                  id={field.name}
                  rows={4}
                  placeholder="Décrivez l'affaire..."
                  aria-invalid={fieldState.invalid}
                  {...field}
                />
                <FieldError errors={fieldState.error ? [fieldState.error] : undefined} />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="location"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Localisation</FieldLabel>
                <Input
                  id={field.name}
                  placeholder="ex: 59 rue nationale, 75013 Paris"
                  aria-invalid={fieldState.invalid}
                  {...field}
                />
                <FieldError errors={fieldState.error ? [fieldState.error] : undefined} />
              </Field>
            )}
          />

          {form.formState.errors.root && (
            <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
          )}
        </form>

        <DialogFooter>
          <Button variant="outline" type="button" onClick={() => setIsCreateDialogOpen(false)}>
            Annuler
          </Button>
          <Button type="submit" form="create-case-form" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Création…' : "Créer l'affaire"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
