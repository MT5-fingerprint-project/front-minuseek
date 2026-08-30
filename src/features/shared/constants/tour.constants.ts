/**
 * Éléments injectés par driver.js hors de l'arbre DOM de l'atelier (voile + panneau).
 * Classes vérifiées dans `driver.js@1.8.0` (`node_modules/driver.js/dist/driver.css`) :
 * à utiliser comme `ignoreSelector` partout où `useClickOutside` écoute un clic
 * document-wide, pour qu'un clic sur le tour ne referme pas un panneau ouvert.
 *
 * Vit dans `shared/` (et non dans `investigation-case`, seule feature à utiliser
 * driver.js) car `biometric-image` en a lui aussi besoin (toolbar, calques) : le
 * sens de dépendance des features va vers `shared`, jamais entre features.
 */
export const TOUR_UI_SELECTOR = '.driver-overlay, .driver-popover'
