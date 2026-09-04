import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { isDetachedReferenceTraceChanged } from '@/features/investigation-case/types/detachedReference'

/**
 * Trace comparée par la fenêtre « Empreintes » détachée : l'adresse la porte au
 * chargement, l'atelier la met à jour ensuite par message. Sans ça, changer de
 * trace côté atelier laisserait la popup travailler sur les paires de la
 * précédente.
 */
export function useDetachedTraceId(): string | undefined {
  const [searchParams] = useSearchParams()
  const [traceId, setTraceId] = useState<string | undefined>(() => searchParams.get('trace') ?? undefined)

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      // Une popup accepte des messages de n'importe qui : on n'écoute que
      // l'atelier qui l'a ouverte, sur la même origine.
      if (event.origin !== window.location.origin) return
      if (event.source !== window.opener) return
      if (!isDetachedReferenceTraceChanged(event.data)) return
      setTraceId(event.data.traceId ?? undefined)
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  return traceId
}
