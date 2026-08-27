import { useTranslation } from 'react-i18next'
import { Button } from '@/features/shared/ui/button'
import { Field, FieldError, FieldLabel } from '@/features/shared/ui/field'
import { Input } from '@/features/shared/ui/input'
import { cn } from '@/features/shared/lib/utils'
import ReportHeaderPreview from '@/features/settings/components/ReportHeaderPreview'
import { useServiceSettingsForm } from '@/features/settings/hooks/useServiceSettingsForm'
import type { ServiceSettings, ServiceSettingsInput } from '@/features/settings/types/serviceSettings'

type ServiceSettingsFormProps = {
  settings: ServiceSettings
  onSubmit: (values: ServiceSettingsInput) => Promise<unknown> | unknown
}

const FIELDS = [
  { name: 'administration', type: 'text', isFullWidth: true },
  { name: 'serviceName', type: 'text', isFullWidth: true },
  { name: 'postalAddress', type: 'text', isFullWidth: true },
  { name: 'phoneNumber', type: 'tel', isFullWidth: false },
  { name: 'email', type: 'email', isFullWidth: false },
  { name: 'signatureCity', type: 'text', isFullWidth: false },
] as const

export default function ServiceSettingsForm({ settings, onSubmit }: ServiceSettingsFormProps) {
  const { t } = useTranslation()
  const { form, submitError } = useServiceSettingsForm({ settings, onSubmit })

  return (
    <>
      <section className="flex flex-col gap-6 rounded-sm bg-white px-6 py-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-medium text-blue-dark-2">{t('settings.header.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('settings.header.description')}</p>
        </div>

        <form
          id="service-settings-form"
          className="grid gap-4 sm:grid-cols-2"
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            form.handleSubmit()
          }}
        >
          {FIELDS.map((settingsField) => (
            <form.Field
              key={settingsField.name}
              name={settingsField.name}
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid} className={cn(settingsField.isFullWidth && 'sm:col-span-2')}>
                    <FieldLabel htmlFor={field.name}>
                      {t(`settings.header.fields.${settingsField.name}.label`)}
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type={settingsField.type}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      placeholder={t(`settings.header.fields.${settingsField.name}.placeholder`)}
                      aria-invalid={isInvalid}
                      aria-describedby={isInvalid ? `${field.name}-error` : undefined}
                    />
                    {isInvalid && <FieldError id={`${field.name}-error`} errors={field.state.meta.errors} />}
                  </Field>
                )
              }}
            />
          ))}

          {submitError && (
            <p role="alert" className="text-sm text-destructive sm:col-span-2">
              {submitError}
            </p>
          )}
        </form>

        <div className="flex justify-end">
          <form.Subscribe
            selector={(state) => state.isSubmitting}
            children={(isSubmitting) => (
              <Button variant="blue" type="submit" form="service-settings-form" disabled={isSubmitting}>
                {isSubmitting ? t('settings.header.submitting') : t('settings.header.submit')}
              </Button>
            )}
          />
        </div>
      </section>

      <form.Subscribe
        selector={(state) => state.values}
        children={(values) => <ReportHeaderPreview settings={values} />}
      />
    </>
  )
}
