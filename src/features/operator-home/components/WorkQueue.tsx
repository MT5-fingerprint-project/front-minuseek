import { useTranslation } from 'react-i18next'
import type { CaseVerification } from '@/features/shared/types/verification'
import type { MyWork } from '@/features/operator-home/types/myWork'
import WorkQueueRow, {
  type WorkQueueDestination,
} from '@/features/operator-home/components/WorkQueueRow'

type WorkQueueProps = {
  slug: string | undefined
  work: MyWork
  peerReviews: CaseVerification[]
}

function daysSince(instant: string): number {
  return Math.floor((Date.now() - new Date(instant).getTime()) / 86_400_000)
}

export default function WorkQueue({ slug, work, peerReviews }: WorkQueueProps) {
  const { t, i18n } = useTranslation()

  const neverCompared = work.pendingTraces.filter((row) => row.exploitableNeverCompared > 0)
  const notQualified = work.pendingTraces.filter((row) => row.receivedNotQualified > 0)

  function scopeOf(rows: { caseNumber: string }[]): string {
    const others = rows.length - 1
    if (others === 0) return t('operatorHome.queue.inCase', { caseNumber: rows[0].caseNumber })
    return t('operatorHome.queue.inCases', { caseNumber: rows[0].caseNumber, count: others })
  }

  const pendingTracesDestinations: WorkQueueDestination[] = []
  if (neverCompared.length > 0) {
    pendingTracesDestinations.push({
      context: `${t('operatorHome.queue.pendingTraces.neverCompared', {
        count: neverCompared.reduce((total, row) => total + row.exploitableNeverCompared, 0),
      })} ${scopeOf(neverCompared)}`,
      verb: t('operatorHome.queue.pendingTraces.compare'),
      to: `/${slug}/affaires/${neverCompared[0].caseId}/comparaison`,
    })
  }
  if (notQualified.length > 0) {
    pendingTracesDestinations.push({
      context: `${t('operatorHome.queue.pendingTraces.notQualified', {
        count: notQualified.reduce((total, row) => total + row.receivedNotQualified, 0),
      })} ${scopeOf(notQualified)}`,
      verb: t('operatorHome.queue.pendingTraces.qualify'),
      to: `/${slug}/affaires/${notQualified[0].caseId}/traces`,
    })
  }

  const oldestPeerReview = peerReviews[0]
  const oldestDiscordance = work.discordances[0]
  const oldestCase = work.cases.oldest[0]

  const rows = [
    peerReviews.length > 0 && oldestPeerReview
      ? {
          key: 'peerReviews',
          title: t('operatorHome.queue.peerReviews.title'),
          count: peerReviews.length,
          destinations: [
            {
              context: t('operatorHome.queue.peerReviews.context', {
                caseNumber: oldestPeerReview.caseNumber,
                date: new Date(oldestPeerReview.requestedAt).toLocaleDateString(i18n.language),
                days: daysSince(oldestPeerReview.requestedAt),
              }),
              verb: t('operatorHome.queue.peerReviews.review'),
              to: `/${slug}/affaires/${oldestPeerReview.caseId}/comparaison`,
            },
          ],
        }
      : null,
    oldestDiscordance
      ? {
          key: 'discordances',
          title: t('operatorHome.queue.discordances.title'),
          count: work.discordances.length,
          destinations: [
            {
              context: t('operatorHome.queue.discordances.context', {
                caseNumber: oldestDiscordance.caseNumber,
              }),
              verb: t('operatorHome.queue.discordances.resume'),
              to: `/${slug}/affaires/${oldestDiscordance.caseId}/comparaison`,
              isAlerting: true,
            },
          ],
        }
      : null,
    pendingTracesDestinations.length > 0
      ? {
          key: 'pendingTraces',
          title: t('operatorHome.queue.pendingTraces.title'),
          count: work.pendingTraces.length,
          destinations: pendingTracesDestinations,
        }
      : null,
    oldestCase
      ? {
          key: 'oldestCases',
          title: t('operatorHome.queue.oldestCases.title'),
          count: work.cases.open,
          destinations: [
            {
              context: t('operatorHome.queue.oldestCases.context', {
                caseNumber: oldestCase.caseNumber,
                days: oldestCase.ageInDays,
              }),
              verb: t('operatorHome.queue.oldestCases.open'),
              to: `/${slug}/affaires/${oldestCase.id}`,
            },
          ],
        }
      : null,
  ].filter((row) => row !== null)

  return (
    <section className="mt-8">
      <h2 className="mb-2.5 text-sm font-semibold tracking-[-0.005em] text-blue-dark-1">
        {t('operatorHome.queue.title')}
      </h2>
      <div className="overflow-hidden rounded-sm bg-white">
        {rows.length === 0 ? (
          <p className="px-6 py-5 text-[13px] text-grey-medium-2">
            {t('operatorHome.queue.allClear')}
          </p>
        ) : (
          rows.map((row) => (
            <WorkQueueRow
              key={row.key}
              title={row.title}
              count={row.count}
              destinations={row.destinations}
            />
          ))
        )}
      </div>
    </section>
  )
}
