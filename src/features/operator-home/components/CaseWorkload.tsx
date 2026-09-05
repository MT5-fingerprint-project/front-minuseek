import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { MyWorkAgeBrackets, MyWorkCase } from '@/features/operator-home/types/myWork'

type CaseWorkloadProps = {
  slug: string | undefined
  openCases: number
  ageBrackets: MyWorkAgeBrackets
  oldestCase: MyWorkCase | null
  peerReviewsToReturn: number
  oldestPeerReviewInDays: number | null
}

const BRACKET_ORDER = ['overSixMonths', 'threeToSixMonths', 'underThreeMonths'] as const

export default function CaseWorkload({
  slug,
  openCases,
  ageBrackets,
  oldestCase,
  peerReviewsToReturn,
  oldestPeerReviewInDays,
}: CaseWorkloadProps) {
  const { t } = useTranslation()

  return (
    <section className="mt-8 flex flex-wrap gap-x-18 gap-y-6">
      <div>
        <Link to={`/${slug}/affaires`} className="group flex items-baseline gap-2.5">
          <span className="text-3xl font-semibold leading-tight tracking-[-0.02em] text-blue-dark-1 tabular-nums">
            {openCases}
          </span>
          <span className="text-sm text-grey-dark group-hover:text-blue-dark-1">
            {oldestCase
              ? t('operatorHome.workload.openCasesWithOldest', {
                  count: openCases,
                  days: oldestCase.ageInDays,
                })
              : t('operatorHome.workload.openCases', { count: openCases })}
          </span>
        </Link>

        {openCases > 0 && (
          <div
            className="mt-3 flex flex-wrap items-start gap-8"
            role="img"
            aria-label={t('operatorHome.workload.bracketsLabel', {
              over: ageBrackets.overSixMonths,
              between: ageBrackets.threeToSixMonths,
              under: ageBrackets.underThreeMonths,
            })}
          >
            {BRACKET_ORDER.map((bracket) => (
              <div key={bracket}>
                <div className="flex max-w-[195px] flex-wrap gap-[5px]">
                  {[...Array(ageBrackets[bracket]).keys()].map((rank) => (
                    <span
                      key={rank}
                      className={`block size-5 ${
                        bracket === 'overSixMonths' ? 'bg-orange-medium' : 'bg-grey-medium-2'
                      }`}
                    />
                  ))}
                </div>
                <p className="mt-1.5 text-[11.5px] whitespace-nowrap text-grey-dark">
                  {t(`operatorHome.workload.bracket.${bracket}`)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <Link to={`/${slug}/dossier-pair`} className="group flex h-fit items-baseline gap-2.5">
        <span className="text-3xl font-semibold leading-tight tracking-[-0.02em] text-blue-dark-1 tabular-nums">
          {peerReviewsToReturn}
        </span>
        <span className="text-sm text-grey-dark group-hover:text-blue-dark-1">
          {oldestPeerReviewInDays === null
            ? t('operatorHome.workload.peerReviews', { count: peerReviewsToReturn })
            : t('operatorHome.workload.peerReviewsWithOldest', {
                count: peerReviewsToReturn,
                days: oldestPeerReviewInDays,
              })}
        </span>
      </Link>
    </section>
  )
}
