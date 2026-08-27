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
import { useServiceUserProfileForm } from '@/features/users/hooks/useServiceUserProfileForm'
import type { ServiceUser, ServiceUserProfileInput } from '@/features/users/types/serviceUser'

type ServiceUserProfileFormProps = {
  user: ServiceUser | null
  onClose: () => void
  onSubmit: (values: ServiceUserProfileInput) => Promise<unknown> | unknown
}

export default function ServiceUserProfileForm({ user, onClose, onSubmit }: ServiceUserProfileFormProps) {
  return (
    <Dialog open={user !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl rounded-md">
        {user && <ProfileFields key={user.id} user={user} onClose={onClose} onSubmit={onSubmit} />}
      </DialogContent>
    </Dialog>
  )
}

type ProfileFieldsProps = {
  user: ServiceUser
  onClose: () => void
  onSubmit: (values: ServiceUserProfileInput) => Promise<unknown> | unknown
}

const FIELD_NAMES = ['lastName', 'firstName', 'grade', 'serviceNumber'] as const

function ProfileFields({ user, onClose, onSubmit }: ProfileFieldsProps) {
  const { t } = useTranslation()
  const { form, submitError } = useServiceUserProfileForm({ user, onSubmit, onSuccess: onClose })

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-2xl font-medium text-grey-medium-2">{t('users.form.title')}</DialogTitle>
        <DialogDescription>
          {t('users.form.description', {
            name: `${user.firstName} ${user.lastName}`,
            role: t(`users.roles.${user.role}`),
          })}
        </DialogDescription>
      </DialogHeader>

      <form
        id="edit-service-user-form"
        className="grid gap-4 sm:grid-cols-2"
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          form.handleSubmit()
        }}
      >
        {FIELD_NAMES.map((fieldName) => (
          <form.Field
            key={fieldName}
            name={fieldName}
            children={(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>{t(`users.form.fields.${fieldName}.label`)}</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder={t(`users.form.fields.${fieldName}.placeholder`)}
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          />
        ))}

        {submitError && <p className="text-sm text-destructive sm:col-span-2">{submitError}</p>}
      </form>

      <DialogFooter>
        <Button variant="outline" type="button" onClick={onClose}>
          {t('common.actions.cancel')}
        </Button>
        <form.Subscribe
          selector={(state) => state.isSubmitting}
          children={(isSubmitting) => (
            <Button variant="blue" type="submit" form="edit-service-user-form" disabled={isSubmitting}>
              {isSubmitting ? t('users.form.submitting') : t('users.form.submit')}
            </Button>
          )}
        />
      </DialogFooter>
    </>
  )
}
