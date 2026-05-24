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
import { useCreateInvestigationCaseForm } from '@/features/investigation-case/hooks/useCreateInvestigationCaseForm'
import type { InvestigationCaseCreateInput } from '@/features/investigation-case/types/investigationCase'

type InvestigationCaseCreateFormProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (values: InvestigationCaseCreateInput) => Promise<unknown> | unknown
}

export default function InvestigationCaseCreateForm({ isOpen, onClose, onSubmit }: InvestigationCaseCreateFormProps) {
  const { t } = useTranslation()
  const { form, submitError } = useCreateInvestigationCaseForm({
    onSubmit,
    onSuccess: onClose,
  })

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('investigationCase.form.createTitle')}</DialogTitle>
          <DialogDescription>{t('investigationCase.form.createDescription')}</DialogDescription>
        </DialogHeader>

        <form
          id="create-case-form"
          className="grid gap-4"
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
        >
          <form.Field
            name="caseNumber"
            children={(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>{t('investigationCase.form.fields.caseNumber.label')}</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder={t('investigationCase.form.fields.caseNumber.placeholder')}
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          />

          <form.Field
            name="pvNumber"
            children={(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>{t('investigationCase.form.fields.pvNumber.label')}</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder={t('investigationCase.form.fields.pvNumber.placeholder')}
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          />

          <form.Field
            name="description"
            children={(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>{t('investigationCase.form.fields.description.label')}</FieldLabel>
                  <Textarea
                    id={field.name}
                    name={field.name}
                    rows={4}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder={t('investigationCase.form.fields.description.placeholder')}
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          />

          {/*           <form.Field
            name="location"
            children={(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>{t('investigationCase.form.fields.location.label')}</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder={t('investigationCase.form.fields.location.placeholder')}
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          /> */}

          {submitError && <p className="text-sm text-destructive">{submitError}</p>}
        </form>

        <DialogFooter>
          <Button variant="outline" type="button" onClick={onClose}>
            {t('common.actions.cancel')}
          </Button>
          <form.Subscribe
            selector={(state) => state.isSubmitting}
            children={(isSubmitting) => (
              <Button type="submit" form="create-case-form" disabled={isSubmitting}>
                {isSubmitting ? t('investigationCase.form.submitting') : t('investigationCase.form.submit')}
              </Button>
            )}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
