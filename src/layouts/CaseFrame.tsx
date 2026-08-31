import { useEffect, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { isAxiosError } from 'axios'
import { toast } from 'sonner'
import { useInvestigationCase } from '@/features/investigation-case/hooks/useInvestigationCases'
import Navbar from '@/features/shared/components/navbar/Navbar'

type CaseFrameProps = {
  /** Navbar réduite (mode comparateur) */
  navbarCollapsed?: boolean
  /** Entrée de navigation active */
  activeNav: 'info' | 'subjects' | 'traces' | 'comparison' | 'history' | 'reports'
  children: ReactNode
}

/** Cadre partagé des pages d'une affaire : navbar + zone de contenu scrollable. */
export default function CaseFrame({ navbarCollapsed = false, activeNav, children }: CaseFrameProps) {
  const { slug, id } = useParams<{ slug: string; id: string }>()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: investigationCase, error } = useInvestigationCase(id ?? '')

  const isOutOfReach = isAxiosError(error) && error.response?.status === 404

  useEffect(() => {
    if (!isOutOfReach) return
    toast.error(t('investigationCase.errors.noLongerAccessible'))
    navigate(`/${slug}/affaires`, { replace: true })
  }, [isOutOfReach, navigate, slug, t])

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
      link: `/${slug}/affaires/${id}/traces`,
      icon: 'trace' as const,
      label: t('navigation.traces'),
      isActive: activeNav === 'traces',
    },
    {
      link: `/${slug}/affaires/${id}/comparaison`,
      icon: 'fingerprint' as const,
      label: t('navigation.tracesAndFingerprints'),
      isActive: activeNav === 'comparison',
    },
    {
      link: `/${slug}/affaires/${id}/historique`,
      icon: 'calendar' as const,
      label: t('navigation.history'),
      isActive: activeNav === 'history',
    },
    {
      link: `/${slug}/affaires/${id}/rapports`,
      icon: 'fileExport' as const,
      label: t('navigation.reports'),
      isActive: activeNav === 'reports',
    },
  ]

  return (
    <div className="flex h-screen w-full overflow-hidden bg-blue-dark-1">
      <Navbar isCollapsed={navbarCollapsed} investigationCase={investigationCase} items={navItems} />
      <main className="flex w-full overflow-auto p-3 pl-0">{children}</main>
    </div>
  )
}
