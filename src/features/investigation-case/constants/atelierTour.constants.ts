import type { ParseKeys } from 'i18next'

export type TourStep = {
  titleKey: ParseKeys
  textKey: ParseKeys
  /** Absent = popover centrée, sans cible (étape d'accueil). */
  selector?: string
}

/** Suffixée par une version : incrémenter invalide les passages déjà enregistrés. */
export const TOUR_STORAGE_PREFIX = 'minuseek:atelier-tour:v1'

/**
 * Éléments injectés par driver.js hors de l'arbre DOM de l'atelier (voile + panneau).
 * Classes vérifiées dans `driver.js@1.8.0` (`node_modules/driver.js/dist/driver.css`) :
 * à utiliser comme `ignoreSelector` partout où `useClickOutside` écoute un clic
 * document-wide, pour qu'un clic sur le tour ne referme pas un panneau ouvert.
 */
export const TOUR_UI_SELECTOR = '.driver-overlay, .driver-popover'

export const ATELIER_TOUR_STEPS: TourStep[] = [
  {
    titleKey: 'investigationCase.comparison.tour.steps.welcome.title',
    textKey: 'investigationCase.comparison.tour.steps.welcome.text',
  },
  {
    titleKey: 'investigationCase.comparison.tour.steps.carousel.title',
    textKey: 'investigationCase.comparison.tour.steps.carousel.text',
    selector: '[data-tour="carousel-traces"], [data-tour="empty-traces"]',
  },
  {
    titleKey: 'investigationCase.comparison.tour.steps.import.title',
    textKey: 'investigationCase.comparison.tour.steps.import.text',
    selector: '[data-tour="import-traces"]',
  },
  {
    titleKey: 'investigationCase.comparison.tour.steps.imageSettings.title',
    textKey: 'investigationCase.comparison.tour.steps.imageSettings.text',
    selector: '[data-tour="mode-image-traces"]',
  },
  {
    titleKey: 'investigationCase.comparison.tour.steps.annotationMode.title',
    textKey: 'investigationCase.comparison.tour.steps.annotationMode.text',
    selector: '[data-tour="mode-annotation-traces"]',
  },
  {
    titleKey: 'investigationCase.comparison.tour.steps.layers.title',
    textKey: 'investigationCase.comparison.tour.steps.layers.text',
    selector: '[data-tour="layers-toggle"]',
  },
  {
    titleKey: 'investigationCase.comparison.tour.steps.analyze.title',
    textKey: 'investigationCase.comparison.tour.steps.analyze.text',
    selector: '[data-tour="analyze-button"]',
  },
  {
    titleKey: 'investigationCase.comparison.tour.steps.match.title',
    textKey: 'investigationCase.comparison.tour.steps.match.text',
    selector: '[data-tour="hit-match"] button',
  },
]
