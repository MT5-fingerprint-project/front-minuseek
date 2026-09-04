/**
 * Contrat de message entre l'atelier et sa fenêtre « Empreintes » détachée. Les
 * deux sont des instances d'app distinctes : l'adresse porte la trace au premier
 * chargement, ce message la met à jour ensuite sans recharger la popup.
 */
export const DETACHED_REFERENCE_TRACE_CHANGED = 'minuseek:detached-reference:trace-changed'

export type DetachedReferenceTraceChanged = {
  type: typeof DETACHED_REFERENCE_TRACE_CHANGED
  traceId: string | null
}

export function isDetachedReferenceTraceChanged(data: unknown): data is DetachedReferenceTraceChanged {
  if (typeof data !== 'object' || data === null) return false
  const message = data as Partial<DetachedReferenceTraceChanged>
  return (
    message.type === DETACHED_REFERENCE_TRACE_CHANGED &&
    (typeof message.traceId === 'string' || message.traceId === null)
  )
}
