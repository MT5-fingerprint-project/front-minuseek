import { useTranslation } from 'react-i18next'
import type { AnyFieldApi } from '@tanstack/react-form'
import { Icon } from '@/features/shared/icons'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/features/shared/ui/select'
import { useCreateSubjectForm } from '@/features/investigation-case/hooks/useCreateSubjectForm'
import {
  subjectSexSchema,
  subjectTypeSchema,
  type SubjectCreateInput,
} from '@/features/investigation-case/types/subject'

type SubjectCreateFormProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (values: SubjectCreateInput) => Promise<unknown> | unknown
}

function isFieldInvalid(field: AnyFieldApi) {
  return field.state.meta.isTouched && !field.state.meta.isValid
}

function SubjectTextField({
  field,
  label,
  placeholder,
  type = 'text',
}: {
  field: AnyFieldApi
  label: string
  placeholder?: string
  type?: string
}) {
  const isInvalid = isFieldInvalid(field)

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <Input
        id={field.name}
        name={field.name}
        type={type}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(event) => field.handleChange(event.target.value)}
        placeholder={placeholder}
        aria-invalid={isInvalid}
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}

function SubjectSelectField({
  field,
  label,
  placeholder,
  options,
}: {
  field: AnyFieldApi
  label: string
  placeholder: string
  options: { value: string; label: string }[]
}) {
  const isInvalid = isFieldInvalid(field)

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <Select value={field.state.value} onValueChange={field.handleChange}>
        <SelectTrigger
          id={field.name}
          aria-invalid={isInvalid}
          onBlur={field.handleBlur}
          className="h-11 w-full rounded-xs border-grey-light-2 bg-white"
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}

export default function SubjectCreateForm({ isOpen, onClose, onSubmit }: SubjectCreateFormProps) {
  const { t } = useTranslation()
  const { form, submitError } = useCreateSubjectForm({
    onSubmit,
    onSuccess: onClose,
  })

  const sexOptions = subjectSexSchema.options.map((value) => ({ value, label: t(`subject.sex.${value}`) }))
  const typeOptions = subjectTypeSchema.options.map((value) => ({ value, label: t(`subject.type.${value}`) }))

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto rounded-md sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-medium text-grey-medium-2">
            {t('subject.form.createTitle')}
          </DialogTitle>
          <DialogDescription className="sr-only">{t('subject.form.createDescription')}</DialogDescription>
        </DialogHeader>

        <form
          id="create-subject-form"
          className="grid gap-6"
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
        >
          <section className="grid gap-4">
            <h3 className="text-lg font-medium text-blue-dark-2">{t('subject.form.sections.general')}</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <form.Field
                name="lastName"
                children={(field) => (
                  <SubjectTextField
                    field={field}
                    label={t('subject.form.fields.lastName.label')}
                    placeholder={t('subject.form.fields.lastName.placeholder')}
                  />
                )}
              />
              <form.Field
                name="firstName"
                children={(field) => (
                  <SubjectTextField
                    field={field}
                    label={t('subject.form.fields.firstName.label')}
                    placeholder={t('subject.form.fields.firstName.placeholder')}
                  />
                )}
              />
              <form.Field
                name="birthDate"
                children={(field) => (
                  <SubjectTextField field={field} type="date" label={t('subject.form.fields.birthDate.label')} />
                )}
              />
              <form.Field
                name="birthPlace"
                children={(field) => (
                  <SubjectTextField
                    field={field}
                    label={t('subject.form.fields.birthPlace.label')}
                    placeholder={t('subject.form.fields.birthPlace.placeholder')}
                  />
                )}
              />
              <form.Field
                name="sex"
                children={(field) => (
                  <SubjectSelectField
                    field={field}
                    label={t('subject.form.fields.sex.label')}
                    placeholder={t('subject.form.fields.sex.placeholder')}
                    options={sexOptions}
                  />
                )}
              />
              <form.Field
                name="phoneNumber"
                children={(field) => (
                  <SubjectTextField
                    field={field}
                    type="tel"
                    label={t('subject.form.fields.phoneNumber.label')}
                    placeholder={t('subject.form.fields.phoneNumber.placeholder')}
                  />
                )}
              />
              <form.Field
                name="type"
                children={(field) => (
                  <SubjectSelectField
                    field={field}
                    label={t('subject.form.fields.type.label')}
                    placeholder={t('subject.form.fields.type.placeholder')}
                    options={typeOptions}
                  />
                )}
              />
            </div>
          </section>

          <section className="grid gap-4">
            <h3 className="text-lg font-medium text-blue-dark-2">{t('subject.form.sections.parents')}</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <form.Field
                name="firstParentName"
                children={(field) => (
                  <SubjectTextField
                    field={field}
                    label={t('subject.form.fields.firstParentName.label')}
                    placeholder={t('subject.form.fields.firstParentName.placeholder')}
                  />
                )}
              />
              <form.Field
                name="secondParentName"
                children={(field) => (
                  <SubjectTextField
                    field={field}
                    label={t('subject.form.fields.secondParentName.label')}
                    placeholder={t('subject.form.fields.secondParentName.placeholder')}
                  />
                )}
              />
            </div>
          </section>

          {submitError && <p className="text-sm text-destructive">{submitError}</p>}
        </form>

        <DialogFooter>
          <Button variant="outline" type="button" onClick={onClose}>
            {t('common.actions.cancel')}
          </Button>
          <form.Subscribe
            selector={(state) => state.isSubmitting}
            children={(isSubmitting) => (
              <Button variant="blue" type="submit" form="create-subject-form" disabled={isSubmitting}>
                {isSubmitting ? t('subject.form.submitting') : t('subject.form.submit')}
                <Icon name="plus" size={24} color="white" />
              </Button>
            )}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
