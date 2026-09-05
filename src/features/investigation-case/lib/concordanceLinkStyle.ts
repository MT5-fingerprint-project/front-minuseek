/** Style du trait de liaison entre deux minuties appariées (L7-3), partagé
 * entre l'overlay SVG à l'écran (`ConcordanceLinkOverlay`) et le compositeur
 * vidéo (`concordanceVideoCompositor`, L7-4) pour rester visuellement identiques.
 * Une seule épaisseur : un seul trait est tracé à la fois, celui de la paire
 * commentée. */
export const LINK_COLOR = '#D85703'
export const LINK_STROKE_WIDTH = 4

/** Type de la minutie appariée, écrit au milieu du trait. Le halo blanc le garde
 * lisible aussi bien sur une crête sombre que sur un fond de poudre clair, sans
 * poser un cartouche opaque qui masquerait le dessin. */
export const LINK_LABEL_FONT_SIZE = 17
export const LINK_LABEL_HALO_COLOR = '#ffffff'
export const LINK_LABEL_HALO_WIDTH = 5
/** Décalage au-dessus du trait, pour que l'étiquette ne le chevauche pas. Il suit
 * la taille du texte, sinon une police plus grande viendrait mordre le trait. */
export const LINK_LABEL_OFFSET_Y = 13
