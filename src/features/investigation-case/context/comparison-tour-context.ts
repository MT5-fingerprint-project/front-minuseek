import { createContext, useContext } from 'react'

export type ComparisonTourContextValue = {
  /** `null` tant que la page du comparateur n'a pas encore enregistré son tour. */
  restartTour: (() => void) | null
  registerRestartTour: (fn: (() => void) | null) => void
}

export const ComparisonTourContext = createContext<ComparisonTourContextValue | null>(null)

export function useComparisonTour(): ComparisonTourContextValue {
  const context = useContext(ComparisonTourContext)
  if (!context) throw new Error('useComparisonTour must be used within a ComparisonTourProvider')
  return context
}
