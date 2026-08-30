# ADR-0005 — Visite guidée de l'atelier avec `driver.js`

- **Statut** : accepté
- **Date** : 2026-08-31
- **Décideurs** : équipe front Minuseek

## Contexte

L5-10 demande un tour guidé en huit étapes sur l'atelier (page `comparaison`), pour
un public qui n'a jamais utilisé de logiciel de retouche d'image : ouvrir une trace,
comprendre les deux modes de la barre d'outils, savoir qu'un outil doit être choisi
avant de cliquer dans l'image. Aucune bibliothèque de visite guidée n'était
installée. Le routeur (`src/main.tsx`) importe toutes les pages statiquement — il
n'y a pas de découpage par route aujourd'hui, donc pas de chargement paresseux à
mettre en avant dans le choix.

## Décision

Utiliser `driver.js` en version **1.8.0** pour piloter le tour :
- Aucune dépendance d'exécution propre (pas de React lié, ~5 kB gzip), pilotée en
  JavaScript pur via `driver(config).drive()` — s'intègre sans wrapper React dédié.
- Ciblage par élément DOM (`element: Element`, résolu par nos soins via
  `document.querySelector` avant de construire la liste des étapes) ou popover
  centrée sans cible (`element` omis).
- CSS livré à `driver.js/dist/driver.css`, classes stables et vérifiées dans le
  paquet installé : `.driver-overlay` (voile), `.driver-popover` (panneau),
  `.driver-popover-title`, `.driver-popover-description`, `.driver-popover-footer`,
  `.driver-popover-navigation-btns`.
- Callback `onDestroyed` (config `Config`, fichier `dist/driver.js.d.ts`) : appelé
  quel que soit le motif de fermeture (bouton « Terminé », croix, touche Échap, clic
  sur le voile) — utilisé pour enregistrer le passage sans distinguer abandon et fin
  normale, comme demandé par le ticket.
- Un seul point d'import dans le repo : `src/features/investigation-case/hooks/useAtelierTour.ts`
  (et son CSS). Pas de découpage par route à faire puisqu'aucun n'existe ailleurs
  dans `src/main.tsx`.

## Conséquences

- ✅ Pas de dépendance React à maintenir, API impérative simple à encapsuler dans un
  seul hook.
- ✅ Classes CSS et callbacks de la version installée vérifiés avant d'écrire le code
  (évite une intégration basée sur une doc obsolète).
- ⚠️ `driver.js` n'ayant pas de binding React officiel, la synchronisation avec le
  cycle de vie React (montage/démontage, StrictMode) reste à la charge du hook
  (garde par référence, destruction au nettoyage).
- ⚠️ Les gestionnaires de clic extérieur existants (`useClickOutside`, panneau des
  calques et barre d'outils) ignorent par défaut tout ce qui n'est pas dans leur
  propre arbre DOM ; le voile et le panneau `driver.js` étant portés hors de cet
  arbre, leurs sélecteurs `ignoreSelector` doivent explicitement inclure
  `.driver-overlay, .driver-popover` pour ne pas se refermer pendant le tour.

## Alternatives écartées

- **`react-joyride`** — dépendance React dédiée, plus lourde, et son modèle de step
  basé sur des refs React aurait forcé à réintroduire une couche de composants
  autour d'éléments déjà entièrement gérés hors React (canvas Konva, boutons sans
  spread de props).
- **`shepherd.js`** — API comparable à `driver.js` mais bundle plus lourd et pas de
  gain fonctionnel pour huit étapes fixes sans branches conditionnelles complexes.
- **Solution maison (tooltip + overlay CSS)** — aurait fallu réimplémenter le
  positionnement dynamique par rapport à la cible, le focus trap et le clavier
  (Échap, flèches) déjà fournis par `driver.js`, pour un gain de poids négligeable.
