import { useTranslation } from 'react-i18next'
import type { AnyFieldApi } from '@tanstack/react-form'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/features/shared/ui/field'
import { Input } from '@/features/shared/ui/input'
import type { useEditInvestigationCaseForm } from '@/features/investigation-case/hooks/useEditInvestigationCaseForm'

type EditForm = ReturnType<typeof useEditInvestigationCaseForm>['form']

function JudicialField({
  field,
  label,
  placeholder,
  hint,
  type = 'text',
}: {
  field: AnyFieldApi
  label: string
  placeholder?: string
  hint?: string
  type?: string
}) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

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
      {hint && <FieldDescription>{hint}</FieldDescription>}
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}

export default function CaseJudicialHeaderFields({ form }: { form: EditForm }) {
  const { t } = useTranslation()

  return (
    <section className="grid gap-4">
      <h3 className="text-lg font-medium text-blue-dark-2">{t('investigationCase.judicialHeader.title')}</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <form.Field
          name="requestDate"
          children={(field) => (
            <JudicialField
              field={field}
              type="date"
              label={t('investigationCase.judicialHeader.fields.requestDate.label')}
            />
          )}
        />
        <form.Field
          name="interventionDate"
          children={(field) => (
            <JudicialField
              field={field}
              type="date"
              label={t('investigationCase.judicialHeader.fields.interventionDate.label')}
            />
          )}
        />
        <form.Field
          name="requesterQuality"
          children={(field) => (
            <JudicialField
              field={field}
              label={t('investigationCase.judicialHeader.fields.requesterQuality.label')}
              placeholder={t('investigationCase.judicialHeader.fields.requesterQuality.placeholder')}
            />
          )}
        />
        <form.Field
          name="requesterName"
          children={(field) => (
            <JudicialField
              field={field}
              label={t('investigationCase.judicialHeader.fields.requesterName.label')}
              placeholder={t('investigationCase.judicialHeader.fields.requesterName.placeholder')}
            />
          )}
        />
        <div className="sm:col-span-2">
          <form.Field
            name="requesterService"
            children={(field) => (
              <JudicialField
                field={field}
                label={t('investigationCase.judicialHeader.fields.requesterService.label')}
                placeholder={t('investigationCase.judicialHeader.fields.requesterService.placeholder')}
              />
            )}
          />
        </div>
        <form.Field
          name="offenseNature"
          children={(field) => (
            <JudicialField
              field={field}
              label={t('investigationCase.judicialHeader.fields.offenseNature.label')}
              placeholder={t('investigationCase.judicialHeader.fields.offenseNature.placeholder')}
            />
          )}
        />
        <form.Field
          name="offenseLocation"
          children={(field) => (
            <JudicialField
              field={field}
              label={t('investigationCase.judicialHeader.fields.offenseLocation.label')}
              placeholder={t('investigationCase.judicialHeader.fields.offenseLocation.placeholder')}
            />
          )}
        />
        <form.Field
          name="offenseDateFrom"
          children={(field) => (
            <JudicialField
              field={field}
              type="date"
              label={t('investigationCase.judicialHeader.fields.offenseDateFrom.label')}
            />
          )}
        />
        <form.Field
          name="offenseDateTo"
          children={(field) => (
            <JudicialField
              field={field}
              type="date"
              label={t('investigationCase.judicialHeader.fields.offenseDateTo.label')}
            />
          )}
        />
        <form.Field
          name="caseAgainst"
          children={(field) => (
            <JudicialField
              field={field}
              label={t('investigationCase.judicialHeader.fields.caseAgainst.label')}
              placeholder={t('investigationCase.judicialHeader.fields.caseAgainst.placeholder')}
              hint={t('investigationCase.judicialHeader.fields.caseAgainst.hint')}
            />
          )}
        />
      </div>
    </section>
  )
}
