import { useTranslation } from 'react-i18next'
import AppHeader from '@/features/shared/components/AppHeader'
import { useAuth } from '@/features/shared/auth/auth-context'
import { useMyVerifications } from '@/features/shared/hooks/useMyVerifications'
import { isInProgress } from '@/features/shared/types/verification'
import CaseWorkload from '@/features/operator-home/components/CaseWorkload'
import OperatorHomeSkeleton from '@/features/operator-home/components/OperatorHomeSkeleton'
import ProductionHero from '@/features/operator-home/components/ProductionHero'
import WorkQueue from '@/features/operator-home/components/WorkQueue'
import { useMyWork } from '@/features/operator-home/hooks/useMyWork'

function daysSince(instant: string): number {
  return Math.floor((Date.now() - new Date(instant).getTime()) / 86_400_000)
}

export default function OperatorHomePage() {
  const { t, i18n } = useTranslation()
  const { slug } = useAuth()
  const workQuery = useMyWork()
  const { data: missions = [] } = useMyVerifications()

  const work = workQuery.data
  // Les missions rendues sont triées de la plus récente à la plus ancienne : la
  // file, elle, met en tête celle qui attend depuis le plus longtemps.
  const peerReviews = missions
    .filter(isInProgress)
    .sort((left, right) => left.requestedAt.localeCompare(right.requestedAt))

  return (
    <div className="flex flex-col">
      <AppHeader />
      <div className="flex flex-col px-32 py-6">
        <p className="mb-4 text-[13px] text-grey-dark">
          {new Date().toLocaleDateString(i18n.language, {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>

        {workQuery.isError ? (
          <p className="rounded-sm bg-white px-4 py-3 text-sm text-destructive">
            {t('common.errors.loadFailed')}
          </p>
        ) : !work ? (
          <OperatorHomeSkeleton />
        ) : (
          <>
            <ProductionHero production={work.production} />
            <CaseWorkload
              slug={slug}
              openCases={work.cases.open}
              ageBrackets={work.cases.ageBrackets}
              oldestCase={work.cases.oldest[0] ?? null}
              peerReviewsToReturn={peerReviews.length}
              oldestPeerReviewInDays={
                peerReviews[0] ? daysSince(peerReviews[0].requestedAt) : null
              }
            />
            <WorkQueue slug={slug} work={work} peerReviews={peerReviews} />
          </>
        )}
      </div>
    </div>
  )
}
