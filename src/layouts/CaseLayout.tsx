import { Link, Outlet, useLocation, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useInvestigationCase } from '@/features/investigation-case/hooks/useInvestigationCases'
import { Icon } from '@/features/shared/icons'
import { CaseStatusBadge } from '@/features/investigation-case/components/CaseStatusBadge'
import { cn } from '@/features/shared/lib/utils'
import { TooltipProvider } from '@/features/shared/ui/tooltip'

export default function CaseLayout() {
  const { id } = useParams<{ id: string }>()
  const { pathname } = useLocation()
  const { t } = useTranslation()
  const { data: investigationCase } = useInvestigationCase(id ?? '')

  const isComparison = pathname.endsWith('/comparaison')
  const detailsPath = `/affaires/${id}`
  const comparisonPath = `/affaires/${id}/comparaison`

  return (
    <TooltipProvider>
      <div className="flex h-screen w-full overflow-hidden">
        {isComparison ? (
          <aside className="flex flex-col items-center gap-4 bg-blue-dark-1 text-white w-14 py-4 shrink-0">
            <Link to="/affaires" className="flex items-center justify-center w-9 h-9 hover:bg-white/10 rounded-md transition-colors">
              <Icon name="home" size={20} color="white" />
            </Link>
            <div className="w-6 border-t border-white/20" />
            <Link
              to={detailsPath}
              className="flex items-center justify-center w-9 h-9 hover:bg-white/10 rounded-md transition-colors"
              title={t('navigation.informations')}
            >
              <Icon name="information" size={20} color="white" />
            </Link>
            <Link
              to={comparisonPath}
              className="flex items-center justify-center w-9 h-9 bg-blue-medium-2 rounded-md transition-colors"
              title={t('navigation.tracesAndFingerprints')}
            >
              <Icon name="investigation" size={20} color="white" />
            </Link>
          </aside>
        ) : (
          <aside className="flex flex-col bg-blue-dark-1 text-white w-64 shrink-0 py-4">
            <div className="px-4 pb-4">
              <span className="text-xl font-bold tracking-wide">MINUSEEK</span>
            </div>
            <div className="px-4 flex flex-col gap-3 pb-4">
              <Link
                to="/affaires"
                className="flex items-center gap-2 text-sm text-white/80 hover:text-white underline transition-colors"
              >
                <Icon name="home" size={16} color="white" />
                {t('navigation.backToCases')}
              </Link>
              {investigationCase && (
                <>
                  <CaseStatusBadge status={investigationCase.status} />
                  <div>
                    <p className="font-bold text-lg leading-tight color-white">
                      Affaire n°{investigationCase.caseNumber}
                    </p>
                    <p className="text-sm text-white/60">PV n°{investigationCase.pvNumber}</p>
                  </div>
                </>
              )}
            </div>
            <div className="border-t border-white/20 mx-4 mb-4" />
            <nav className="flex flex-col px-2 gap-1">
              <Link
                to={detailsPath}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  !isComparison
                    ? 'bg-blue-medium-2 text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                )}
              >
                <Icon name="information" size={18} color="white" />
                {t('navigation.informations')}
              </Link>
              <Link
                to={comparisonPath}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isComparison
                    ? 'bg-blue-medium-2 text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                )}
              >
                <Icon name="investigation" size={18} color="white" />
                {t('navigation.tracesAndFingerprints')}
              </Link>
            </nav>
          </aside>
        )}

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </TooltipProvider>
  )
}
