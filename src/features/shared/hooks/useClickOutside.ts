import { useEffect } from 'react'

type UseClickOutsideOptions = {
  /** Sélecteur CSS d'éléments à ignorer (ex. le bouton qui ouvre le panneau). */
  ignoreSelector?: string
  /** Désactive l'écoute quand false (ex. panneau fermé). */
  enabled?: boolean
}

/** Appelle `handler` lors d'un clic en dehors de `ref` (et hors des éléments `ignoreSelector`). */
export function useClickOutside(
  ref: React.RefObject<HTMLElement | null>,
  handler: () => void,
  { ignoreSelector, enabled = true }: UseClickOutsideOptions = {},
) {
  useEffect(() => {
    if (!enabled) return

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null
      if (!target) return
      if (ref.current?.contains(target)) return
      if (ignoreSelector && target instanceof Element && target.closest(ignoreSelector)) return
      handler()
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('touchstart', onPointerDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('touchstart', onPointerDown)
    }
  }, [ref, handler, ignoreSelector, enabled])
}
