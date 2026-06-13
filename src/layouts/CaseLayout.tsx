import { Outlet, useLocation, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { cn } from '@/features/shared/lib/utils'
import { useInvestigationCase } from '@/features/investigation-case/hooks/useInvestigationCases'
import { TooltipProvider } from '@/features/shared/ui/tooltip'
import Navbar from '@/features/shared/components/navbar/Navbar'

export default function CaseLayout() {
  const { id } = useParams<{ id: string }>()
  const { pathname } = useLocation()
  const { t } = useTranslation()
  const { data: investigationCase } = useInvestigationCase(id ?? '')

  const isComparison = pathname.endsWith('/comparaison')
  const background = isComparison && "bg-blue-dark-1"
  const padding = isComparison ? "p-3 pl-0" : "p-3"

  const navItems = [
    {
      link: `/affaires/${id}`,
      icon: 'information' as const,
      label: t('navigation.informations'),
      active: !isComparison,
    },
    {
      link: `/affaires/${id}/comparaison`,
      icon: 'fingerprint' as const,
      label: t('navigation.tracesAndFingerprints'),
      active: isComparison,
    },
  ]

  return (
    <TooltipProvider>
      <div className={cn("flex h-screen w-full overflow-hidden", background)}>
        <Navbar
          collapsed={isComparison}
          investigationCase={investigationCase}
          items={navItems}
        />
        <main className={cn("flex-1 overflow-auto", padding)}>
          <Outlet />
        </main>
      </div>
    </TooltipProvider>
  )
}
