import type { ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useInvestigationCase } from '@/features/investigation-case/hooks/useInvestigationCases'
import { TooltipProvider } from '@/features/shared/ui/tooltip'
import Navbar from '@/features/shared/components/navbar/Navbar'

type CaseFrameProps = {
  /** Navbar réduite (mode comparateur) */
  navbarCollapsed?: boolean
  /** Entrée de navigation active */
  activeNav: 'info' | 'subjects' | 'comparison'
  children: ReactNode
}

/** Cadre partagé des pages d'une affaire : navbar + zone de contenu scrollable. */
export default function CaseFrame({ navbarCollapsed = false, activeNav, children }: CaseFrameProps) {
  const { slug, id } = useParams<{ slug: string; id: string }>()
  const { t } = useTranslation()
  const { data: investigationCase } = useInvestigationCase(id ?? '')

  const navItems = [
    {
      link: `/${slug}/affaires/${id}`,
      icon: 'information' as const,
      label: t('navigation.informations'),
      isActive: activeNav === 'info',
    },
    {
      link: `/${slug}/affaires/${id}/sujets`,
      icon: 'personGroup' as const,
      label: t('navigation.subjects'),
      isActive: activeNav === 'subjects',
    },
    {
      link: `/${slug}/affaires/${id}/comparaison`,
      icon: 'fingerprint' as const,
      label: t('navigation.tracesAndFingerprints'),
      isActive: activeNav === 'comparison',
    },
  ]

  return (
    <TooltipProvider>
      <div className="flex h-screen w-full overflow-hidden bg-blue-dark-1">
        <Navbar isCollapsed={navbarCollapsed} investigationCase={investigationCase} items={navItems} />
        <main className="flex w-full overflow-auto p-3 pl-0">{children}</main>
      </div>
    </TooltipProvider>
  )
}
