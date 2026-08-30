import { useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { driver, type Driver, type DriveStep } from 'driver.js'
import 'driver.js/dist/driver.css'
import { useAuth } from '@/features/shared/auth/auth-context'
import { useCurrentUser } from '@/features/shared/hooks/useCurrentUser'
import { ATELIER_TOUR_STEPS, TOUR_STORAGE_PREFIX } from '@/features/investigation-case/constants/atelierTour.constants'

/**
 * Tour guidé de l'atelier (driver.js). Un passage — vu jusqu'au bout ou abandonné,
 * les deux comptent pareil (`onDestroyed` couvre tous les cas) — se retient par
 * opérateur et par labo dans `localStorage`, jamais par dossier.
 */
export function useAtelierTour(isTracesLoaded: boolean, prepareScreen: () => void) {
  const { t } = useTranslation()
  const { slug } = useAuth()
  const { data: currentUser } = useCurrentUser()
  const driverRef = useRef<Driver | null>(null)
  const hasStartedRef = useRef(false)
  const prepareScreenRef = useRef(prepareScreen)
  useEffect(() => {
    prepareScreenRef.current = prepareScreen
  })

  const storageKey = currentUser ? `${TOUR_STORAGE_PREFIX}:${slug}:${currentUser.id}` : undefined

  const startTour = useCallback(() => {
    const steps = ATELIER_TOUR_STEPS.reduce<DriveStep[]>((acc, step) => {
      const element = step.selector ? (document.querySelector(step.selector) ?? undefined) : undefined
      if (step.selector && !element) return acc
      acc.push({ element, popover: { title: t(step.titleKey), description: t(step.textKey) } })
      return acc
    }, [])

    driverRef.current?.destroy()
    driverRef.current = driver({
      steps,
      showProgress: false,
      nextBtnText: t('investigationCase.comparison.tour.next'),
      prevBtnText: t('investigationCase.comparison.tour.previous'),
      doneBtnText: t('investigationCase.comparison.tour.done'),
      onDestroyed: () => {
        if (storageKey) localStorage.setItem(storageKey, '1')
      },
    })
    driverRef.current.drive()
  }, [t, storageKey])

  useEffect(() => {
    if (!isTracesLoaded || !storageKey || hasStartedRef.current) return
    if (localStorage.getItem(storageKey)) return
    hasStartedRef.current = true
    prepareScreenRef.current()
    requestAnimationFrame(startTour)
  }, [isTracesLoaded, storageKey, startTour])

  useEffect(() => {
    return () => {
      driverRef.current?.destroy()
    }
  }, [])

  const restartTour = useCallback(() => {
    prepareScreenRef.current()
    requestAnimationFrame(startTour)
  }, [startTour])

  return { restartTour }
}
