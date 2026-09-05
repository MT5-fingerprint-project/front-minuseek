import { useTranslation } from 'react-i18next'
import { spellFeminine } from '@/features/operator-home/lib/frenchNumber'
import type { MyWorkProduction } from '@/features/operator-home/types/myWork'

type ProductionHeroProps = {
  production: MyWorkProduction
}

function quantityOf(count: number): string {
  const spelled = spellFeminine(count)
  if (!spelled) return count.toLocaleString('fr-FR')
  return `${spelled.toUpperCase()} (${count})`
}

export default function ProductionHero({ production }: ProductionHeroProps) {
  const { t } = useTranslation()
  const { collected, exploitable, compared, identified } = production
  const identifiedShare = collected === 0 ? 0 : (identified / collected) * 100

  return (
    <section className="flex flex-col">
      <h1 className="max-w-[1120px] font-normal">
        <span className="block text-[15px] text-grey-dark">{t('operatorHome.hero.since')}</span>
        <span className="sr-only">
          {t('operatorHome.hero.summary', { collected, identified })}
        </span>
        <span
          aria-hidden="true"
          className="mt-2 block text-[clamp(28px,3.2vw,46px)] leading-[1.18] tracking-[-0.02em] text-grey-dark tabular-nums"
        >
          <span className="block">
            <b className="font-bold text-blue-dark-1">{quantityOf(collected)}</b>{' '}
            {t('operatorHome.hero.collected', { count: collected })}
          </span>
          <span className="block">
            <b className="font-bold text-blue-dark-1">{quantityOf(identified)}</b>{' '}
            {t('operatorHome.hero.identified', { count: identified })}
          </span>
        </span>
      </h1>

      <figure
        className="mt-6 max-w-[1120px]"
        role="img"
        aria-label={t('operatorHome.hero.figureLabel', { collected, identified })}
      >
        <div className="relative flex h-20 w-full items-center bg-grey-medium-2">
          <div
            className="absolute inset-y-0 left-0 bg-blue-dark-1"
            style={{ width: `${identifiedShare}%` }}
          />
          <span className="relative z-10 pl-5 text-[19px] font-semibold text-white">
            {t('operatorHome.hero.identifiedInside', { count: identified })}
          </span>
          <span className="relative z-10 ml-auto pr-5 text-[19px] font-medium text-white">
            {t('operatorHome.hero.collectedInside', { count: collected })}
          </span>
        </div>

        <figcaption className="mt-2 flex justify-end">
          <details className="relative">
            <summary className="cursor-pointer text-xs text-blue-medium-1">
              {t('operatorHome.hero.figures')}
            </summary>
            <table className="absolute right-0 top-6 z-30 w-64 rounded-sm border border-grey-light-2 bg-white px-3 text-xs">
              <tbody>
                {(
                  [
                    ['collected', collected],
                    ['exploitable', exploitable],
                    ['compared', compared],
                    ['identified', identified],
                  ] as const
                ).map(([step, value]) => (
                  <tr key={step} className="border-t border-grey-light-2 first:border-t-0">
                    <td className="py-1.5 text-grey-dark">{t(`operatorHome.hero.step.${step}`)}</td>
                    <td className="py-1.5 text-right font-semibold tabular-nums">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </figcaption>
      </figure>
    </section>
  )
}
