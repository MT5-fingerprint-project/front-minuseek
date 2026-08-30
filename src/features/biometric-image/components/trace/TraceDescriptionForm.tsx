import { useTranslation } from 'react-i18next'
import type { AnyFieldApi } from '@tanstack/react-form'
import { Button } from '@/features/shared/ui/button'
import { Field, FieldError, FieldLabel } from '@/features/shared/ui/field'
import { Input } from '@/features/shared/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/features/shared/ui/select'
import { useTraceDescriptionForm } from '@/features/biometric-image/hooks/useTraceDescriptionForm'
import {
  revelationTechniqueSchema,
  traceOriginSchema,
  type TraceDescriptionInput,
} from '@/features/biometric-image/types/trace'

type TraceDescriptionFormProps = {
  defaultValues: TraceDescriptionInput
  onSubmit: (values: TraceDescriptionInput) => Promise<unknown> | unknown
  onCancel: () => void
  onSuccess: () => void
}

function isFieldInvalid(field: AnyFieldApi) {
  return field.state.meta.isTouched && !field.state.meta.isValid
}

function TraceTextField({
  field,
  label,
  placeholder,
}: {
  field: AnyFieldApi
  label: string
  placeholder?: string
}) {
  const isInvalid = isFieldInvalid(field)

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <Input
        id={field.name}
        name={field.name}
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

function TraceSelectField({
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

export default function TraceDescriptionForm({
  defaultValues,
  onSubmit,
  onCancel,
  onSuccess,
}: TraceDescriptionFormProps) {
  const { t } = useTranslation()
  const { form, submitError } = useTraceDescriptionForm({ defaultValues, onSubmit, onSuccess })

  const originOptions = traceOriginSchema.options.map((value) => ({
    value,
    label: t(`trace.origin.${value}`),
  }))
  const techniqueOptions = revelationTechniqueSchema.options.map((value) => ({
    value,
    label: t(`trace.technique.${value}`),
  }))

  return (
    <form
      className="flex flex-col gap-4"
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
    >
      <form.Field
        name="origin"
        children={(field) => (
          <TraceSelectField
            field={field}
            label={t('trace.description.fields.origin.label')}
            placeholder={t('trace.description.fields.origin.placeholder')}
            options={originOptions}
          />
        )}
      />
      <form.Field
        name="location"
        children={(field) => (
          <TraceTextField
            field={field}
            label={t('trace.description.fields.location.label')}
            placeholder={t('trace.description.fields.location.placeholder')}
          />
        )}
      />
      <form.Field
        name="revelationTechnique"
        children={(field) => (
          <TraceSelectField
            field={field}
            label={t('trace.description.fields.revelationTechnique.label')}
            placeholder={t('trace.description.fields.revelationTechnique.placeholder')}
            options={techniqueOptions}
          />
        )}
      />

      {submitError && <p className="text-sm text-destructive">{submitError}</p>}

      <div className="flex justify-end gap-2">
        <Button variant="outline" size="small" type="button" onClick={onCancel}>
          {t('common.actions.cancel')}
        </Button>
        <form.Subscribe
          selector={(state) => state.isSubmitting}
          children={(isSubmitting) => (
            <Button variant="blue" size="small" type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('trace.description.submitting') : t('trace.description.submit')}
            </Button>
          )}
        />
      </div>
    </form>
  )
}
