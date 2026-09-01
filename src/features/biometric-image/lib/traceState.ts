import type { BiometricImage } from '@/features/biometric-image/types/biometricImage'

export type TraceStateBadge = {
  labelKey:
    | 'trace.state.identified'
    | 'trace.state.notIdentified'
    | 'trace.state.notExploitable'
    | 'trace.state.cote'
    | 'trace.state.toQualify'
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
  params?: { cote: string }
}

function qualificationBadge(
  status: NonNullable<BiometricImage['status']>,
  cote: BiometricImage['cote'],
): TraceStateBadge {
  if (status === 'NOT_EXPLOITABLE') return { labelKey: 'trace.state.notExploitable', variant: 'destructive' }
  if (status === 'EXPLOITABLE') return { labelKey: 'trace.state.cote', variant: 'secondary', params: { cote: cote ?? '' } }
  return { labelKey: 'trace.state.toQualify', variant: 'outline' }
}

/** Badge de la colonne « État » du tableau : la déclaration prime sur la qualification. */
export function traceStateBadge(
  trace: Pick<BiometricImage, 'status' | 'identified' | 'notIdentified' | 'cote'>,
): TraceStateBadge | null {
  if (trace.status === null || trace.identified === null) return null
  if (trace.identified) return { labelKey: 'trace.state.identified', variant: 'default' }
  if (trace.notIdentified) return { labelKey: 'trace.state.notIdentified', variant: 'outline' }
  return qualificationBadge(trace.status, trace.cote)
}

/** Badge sous le titre du panneau : la seule qualification, sans l'identification. */
export function exploitabilityBadge(trace: Pick<BiometricImage, 'status' | 'cote'>): TraceStateBadge | null {
  if (trace.status === null) return null
  return qualificationBadge(trace.status, trace.cote)
}
