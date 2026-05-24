import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { Field, FieldError, FieldLabel } from '@/features/shared/ui/field'
import { Input } from '@/features/shared/ui/input'
import { Textarea } from '@/features/shared/ui/textarea'
import {
  investigationCaseCreateSchema,
  type InvestigationCaseCreateInput,
} from '@/features/investigation-case/types/investigationCase'

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
  const { t } = useTranslation()
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
        message: error instanceof Error ? error.message : t('common.errors.generic'),
      })
    }
  }

  return (
    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('investigationCase.form.createTitle')}</DialogTitle>
          <DialogDescription>{t('investigationCase.form.createDescription')}</DialogDescription>
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
                <FieldLabel htmlFor={field.name}>{t('investigationCase.form.fields.caseNumber.label')}</FieldLabel>
                <Input
                  id={field.name}
                  placeholder={t('investigationCase.form.fields.caseNumber.placeholder')}
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
                <FieldLabel htmlFor={field.name}>{t('investigationCase.form.fields.pvNumber.label')}</FieldLabel>
                <Input
                  id={field.name}
                  placeholder={t('investigationCase.form.fields.pvNumber.placeholder')}
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
                <FieldLabel htmlFor={field.name}>{t('investigationCase.form.fields.description.label')}</FieldLabel>
                <Textarea
                  id={field.name}
                  rows={4}
                  placeholder={t('investigationCase.form.fields.description.placeholder')}
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
                <FieldLabel htmlFor={field.name}>{t('investigationCase.form.fields.location.label')}</FieldLabel>
                <Input
                  id={field.name}
                  placeholder={t('investigationCase.form.fields.location.placeholder')}
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
            {t('common.actions.cancel')}
          </Button>
          <Button type="submit" form="create-case-form" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? t('investigationCase.form.submitting') : t('investigationCase.form.submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
