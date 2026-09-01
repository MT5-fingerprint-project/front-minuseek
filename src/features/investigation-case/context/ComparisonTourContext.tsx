import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { ComparisonTourContext } from './comparison-tour-context'

/**
 * Fait passer `restartTour` de la page du comparateur (qui porte le hook
 * `useAtelierTour`) à la sidebar (`Navbar`/`NavFooter`, montée en frère par
 * `CaseFrame`) sans faire dépendre `shared/` de cette feature.
 */
export function ComparisonTourProvider({ children }: { children: ReactNode }) {
  const [restartTour, setRestartTour] = useState<(() => void) | null>(null)
  const registerRestartTour = useCallback((fn: (() => void) | null) => setRestartTour(() => fn), [])
  const value = useMemo(() => ({ restartTour, registerRestartTour }), [restartTour, registerRestartTour])

  return <ComparisonTourContext.Provider value={value}>{children}</ComparisonTourContext.Provider>
}
