import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Icon } from '@/features/shared/icons'
import { H1 } from '@/features/shared/ui/typography'
import { Spinner } from '@/features/shared/ui/spinner'
import AppHeader from '@/features/shared/components/AppHeader'
import { useMyVerifications } from '@/features/shared/hooks/useMyVerifications'
import { isInProgress } from '@/features/shared/types/verification'

export default function CasesToVerifyPage() {
  const { t, i18n } = useTranslation()
  const { slug } = useParams<{ slug: string }>()
  const { data: missions = [], isPending } = useMyVerifications()
  const verifications = missions.filter(isInProgress)

  return (
    <div className="flex flex-col">
      <AppHeader />
      <div className="flex flex-col gap-10 px-32 py-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <Icon name="folder" size={40} color="var(--color-blue-medium-1)" />
            <H1 className="text-blue-dark-2">{t('verification.toVerify.title')}</H1>
          </div>
          <p className="text-muted-foreground">{t('verification.toVerify.subtitle')}</p>
        </div>

        {isPending ? (
          <Spinner className="size-6" />
        ) : verifications.length === 0 ? (
          <p className="text-muted-foreground">{t('verification.toVerify.empty')}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {verifications.map((verification) => (
              <li key={verification.id}>
                <Link
                  to={`/${slug}/affaires/${verification.caseId}/comparaison`}
                  className="flex items-center justify-between gap-4 rounded-sm bg-white px-4 py-3 transition-colors hover:bg-grey-light-1"
                >
                  <span className="font-medium">
                    {t('verification.toVerify.caseNumber', { caseNumber: verification.caseNumber })}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {t('verification.section.requestedOn', {
                      date: new Date(verification.requestedAt).toLocaleDateString(i18n.language),
                    })}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
