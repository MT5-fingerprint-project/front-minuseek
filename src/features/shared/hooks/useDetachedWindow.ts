import { useCallback, useEffect, useRef, useState } from 'react'

const DEFAULT_WIDTH = 1100
const DEFAULT_HEIGHT = 900

/**
 * Construit une chaîne de `features` qui force le navigateur à ouvrir une vraie
 * fenêtre détachée (et non un onglet) : la présence de `popup` + dimensions
 * explicites est ce qui déclenche ce comportement dans Chrome/Firefox. La popup
 * est centrée par rapport à la fenêtre parente.
 */
function popupFeatures(width: number, height: number) {
  const left = Math.max(0, window.screenX + (window.outerWidth - width) / 2)
  const top = Math.max(0, window.screenY + (window.outerHeight - height) / 2)
  // `popup` + suppression des barres + géométrie : recette qui force une vraie
  // fenêtre détachée (et non un onglet) sur Chrome, Firefox, Safari et Edge.
  return [
    'popup=yes',
    'menubar=no',
    'toolbar=no',
    'location=no',
    'status=no',
    'resizable=yes',
    'scrollbars=yes',
    `width=${width}`,
    `height=${height}`,
    `left=${Math.round(left)}`,
    `top=${Math.round(top)}`,
  ].join(',')
}

/**
 * Ouvre une vue de l'app dans une nouvelle fenêtre navigateur (même origine, donc
 * `localStorage.accessToken` partagé). Suit l'état ouvert/fermé et détecte la
 * fermeture de la popup (croix de l'OS ou `window.close()` depuis la popup) par
 * polling de `window.closed`. La popup est refermée si le composant hôte est démonté.
 *
 * `onClose` est appelé à chaque fermeture effective (explicite via `close()` ou
 * détectée par polling) — la popup est une instance d'app séparée (cache React
 * Query indépendant), c'est le point d'accroche pour resynchroniser l'hôte.
 */
export function useDetachedWindow(name: string, onClose?: () => void) {
  const ref = useRef<Window | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  const open = useCallback(
    (url: string, features: string = popupFeatures(DEFAULT_WIDTH, DEFAULT_HEIGHT)) => {
      if (ref.current && !ref.current.closed) {
        ref.current.focus()
        return
      }
      const win = window.open(url, name, features)
      if (!win) return // bloqué par le navigateur
      win.focus()
      ref.current = win
      setIsOpen(true)
    },
    [name]
  )

  const close = useCallback(() => {
    if (!ref.current) return
    ref.current.close()
    ref.current = null
    setIsOpen(false)
    onCloseRef.current?.()
  }, [])

  // Détecte la fermeture de la popup (croix OS ou window.close côté popup)
  useEffect(() => {
    if (!isOpen) return
    const timer = window.setInterval(() => {
      if (ref.current?.closed) {
        ref.current = null
        setIsOpen(false)
        onCloseRef.current?.()
      }
    }, 500)
    return () => window.clearInterval(timer)
  }, [isOpen])

  // Referme la popup si l'hôte disparaît (navigation, fermeture de l'onglet de base)
  useEffect(() => {
    return () => ref.current?.close()
  }, [])

  return { isOpen, open, close }
}
