import type { BiometricImage } from '@/features/biometric-image/types/biometricImage'

export type TraceStateBadge = {
  labelKey:
    | 'trace.state.identified'
    | 'trace.state.notExploitable'
    | 'trace.state.exploitable'
    | 'trace.state.toQualify'
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
}

export function traceStateBadge(trace: Pick<BiometricImage, 'status' | 'identified'>): TraceStateBadge | null {
  if (trace.status === null || trace.identified === null) return null
  if (trace.identified) return { labelKey: 'trace.state.identified', variant: 'default' }
  if (trace.status === 'NOT_EXPLOITABLE') return { labelKey: 'trace.state.notExploitable', variant: 'destructive' }
  if (trace.status === 'EXPLOITABLE') return { labelKey: 'trace.state.exploitable', variant: 'secondary' }
  return { labelKey: 'trace.state.toQualify', variant: 'outline' }
}
