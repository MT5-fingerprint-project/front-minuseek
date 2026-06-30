---
name: konva-patterns
description: "Patterns react-konva pour le COMPARATEUR d'empreintes de front-minuseek (feature biometric-image). Déclencher pour tout travail sur le comparateur (superposer/comparer une trace relevée vs une empreinte de référence), le canvas Konva, Stage/Layer/Image, le zoom/pan (molette, scale + position), les annotations/minuties (point, point+flèche, tracé crayon), l'overlay/opacité trace vs référence, les filtres canvas (luminosité/contraste/saturation/inversion/miroir/rotation), les transformations de coordonnées écran ↔ espace image, ou la performance du canvas (redraws, batchDraw, cache(), listening, fuites mémoire au changement d'image)."
---

# Konva — patterns du comparateur d'empreintes

Patterns **react-konva** pour le cœur forensique : le **comparateur** qui permet de comparer une **trace relevée** (gauche) et une **empreinte de référence** (droite). Ce skill rassemble les conventions Konva réellement employées dans la feature `src/features/biometric-image/` pour que tout nouveau code canvas reste cohérent avec l'existant.

> **Conventions générales du front = le skill `front-review` (`.agents/skills/front-review/SKILL.md`) + le `README.md` à la racine de `front-minuseek`.** Ce skill ne ré-énonce PAS la stack, l'architecture feature-slice, le server state React Query, l'i18n FR-only ni les règles TypeScript : il les suppose connues et ajoute uniquement le **savoir-faire Konva spécifique au comparateur**. Avant de coder, **lis le code réel** (chemins ci-dessous) — il prime sur ce document en cas de divergence.

## Cadrage : où vit le canvas (re-vérifier, ne pas figer)

- **Stack canvas** : `react-konva ^19` + `konva ^10` (voir `package.json`). **Pas de `use-image`** dans les deps : le projet a son **propre hook `useImage`** local dans `DraggableImage.tsx`. Ne pas ajouter `use-image` sans raison — réutiliser/étendre l'existant.
- **Composant canvas réutilisable** : `src/features/biometric-image/components/canvas/BiometricImageCanvas.tsx` — **un `Stage` par image**.
- **Le comparateur** : `src/features/investigation-case/pages/InvestigationCaseComparisonPage.tsx` + `components/comparison/ComparisonWindow.tsx`. Architecture actuelle = **deux fenêtres côte à côte** (panneaux redimensionnables `ResizablePanel`), chacune montant **son propre `BiometricImageCanvas`** indépendant : gauche = `type="traces"`, droite = `type="reference-prints"`. **Il n'y a pas (encore) de Stage unique superposant les deux images** — voir la section *Overlay/superposition* pour l'approche prospective.
- Fichiers canvas clés : `useCanvasView.ts` (zoom/pan), `DraggableImage.tsx` (image + filtres + layout), `AnnotationLayer.tsx` (minuties/tracés), `MinutiaeAnnotation.tsx` + `annotationUtils.ts` (point+flèche), `canvasFilters.ts` (filtres, dans `components/toolbar/`), `ZoomControls.tsx`/`RecenterControl.tsx`.

## 1. Structure Stage / Layer / Image

Un `Stage` par image, et **deux `Layer` séparés** : un pour l'image (+ filtres), un pour les annotations. Le zoom/pan s'applique au **Stage entier** (`scaleX/scaleY` + `x/y`), pas aux nodes individuels.

```tsx
<Stage
  width={size.width} height={size.height}
  scaleX={view.scale} scaleY={view.scale}
  x={view.x} y={view.y}
  onWheel={handleWheel}
>
  <Layer>
    <DraggableImage key={`${image.url}-${recenterSignal}`} url={image.url} stageSize={size} /* … */ />
  </Layer>
  <AnnotationLayer /* annotations, layerCount, activeTool, imageLayout… */ />
</Stage>
```

- La taille du `Stage` vient du conteneur via `useContainerSize(containerRef)` (`src/features/shared/hooks/useContainerSize.ts`), pas de dimensions en dur.
- Séparer **Layer image** et **Layer annotations** est délibéré : modifier une minutie ne force pas le re-cache/redraw de l'image (voir *Performance*).

## 2. Chargement d'image (`useImage` maison)

Le hook crée une `window.Image`, force `crossOrigin = 'anonymous'` (indispensable pour pouvoir `cache()` + appliquer des filtres sans *tainted canvas*), et **nettoie au changement d'URL** pour éviter les fuites :

```ts
function useImage(url: string) {
  const [image, setImage] = useState<HTMLImageElement>()
  useEffect(() => {
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.src = url
    img.onload = () => setImage(img)
    return () => {
      img.onload = null
      setImage(undefined)
    } // cleanup obligatoire
  }, [url])
  return image
}
```

Tant que l'image n'est pas chargée, le composant **retourne `null`** (`if (!image) return null`) plutôt qu'un node vide. Réutiliser ce hook ; ne pas dupliquer une variante sans cleanup.

## 3. Zoom & pan (`useCanvasView`)

Tout l'état de vue (`{ scale, x, y }`) vit dans `useCanvasView.ts`. Points à respecter :

- **Zoom molette = vers le curseur** ; **zoom boutons = vers le centre** du Stage. La fonction `zoomToward(point, direction)` garde le point fixe en convertissant écran→contenu puis en recalculant `x/y`.
- **Clamp du scale** : `MIN_SCALE = 0.2`, `MAX_SCALE = 15`, facteur `ZOOM_FACTOR = 1.1`. Garder ces bornes (ou les étendre ici) plutôt que d'introduire des constantes parallèles.
- **`viewRef` miroir de `view`** : les zooms rapides successifs (double-clic, molette rafale) liraient une closure périmée sans ce ref. Toute nouvelle action de vue doit passer par `applyView()`, qui met à jour `viewRef.current` ET le state.
- **`onScaleChange`** remonte le scale au parent (affiché en %, ex. `ZoomControls`).
- **Recenter** = `applyView(DEFAULT_VIEW)` + incrément d'un `recenterSignal` ; ce signal sert de `key` à `DraggableImage` pour **remonter l'image et réinitialiser sa position de drag** (voir Pièges).

```ts
const pointTo = {
  x: (point.x - current.x) / current.scale,
  y: (point.y - current.y) / current.scale,
}
const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, current.scale * ZOOM_FACTOR ** direction))
applyView({ scale: newScale, x: point.x - pointTo.x * newScale, y: point.y - pointTo.y * newScale })
```

Le handle de zoom est exposé au parent via `useImperativeHandle(zoomHandleRef, …)` (`zoomIn`/`zoomOut`/`recenter`) — c'est ainsi que `ComparisonWindow` câble `ZoomControls`/`RecenterControl` à chaque fenêtre (`w.zoomRef.current?.zoomIn()`, etc.).

## 4. Transformations de coordonnées (écran ↔ espace image)

C'est le point le plus subtil et le plus important pour le forensique : **une minutie doit rester collée au même pixel de l'empreinte** quels que soient le zoom, le pan, le miroir ou la rotation appliqués à l'image.

La solution en place : les annotations vivent dans le **repère local de l'image**, via un `<Group {...imageLayout}>` qui **rejoue la transform de l'image** (position, `offsetX/offsetY`, `scaleX` du miroir, `rotation`). `DraggableImage` publie ce `ImageLayout` au parent (`onLayoutChange`) ; `AnnotationLayer` l'applique au Group.

- Pour obtenir la position du pointeur **dans le repère image**, ne pas faire le calcul à la main : utiliser **`groupRef.current.getRelativePointerPosition()`** — il gère zoom + pan + offset + miroir + rotation d'un coup.

```ts
const getPos = () => groupRef.current?.getRelativePointerPosition() ?? null
// pos.x / pos.y sont en coordonnées locales image → directement stockables dans settings
```

Stocker les annotations dans ce repère local garantit qu'elles **suivent** l'image. Ne jamais persister des coordonnées en pixels écran.

## 5. Dessin d'annotations / minuties

Trois formes d'annotation, toutes persistées comme des **calques** (`type: 'ANNOTATION'`) via React Query (`useCreateLayer/useUpdateLayer/useDeleteLayer`), discriminées par `settings.type`. L'outil actif (`AnnotationToolType` = `'circle' | 'circleArrow' | 'pencil'`) détermine le `settings.type` créé :

- `circle` — outil `circle` : un **point** (`Circle`).
- `minutiae` — outil `circleArrow` : un **point + flèche orientée** (`MinutiaeAnnotation` : `Group` = `Circle` + `Line`, avec poignée de rotation quand sélectionné). L'angle ↔ géométrie passe par `edgeAndTip(angleDeg, radius)` / `angleFromOffset(dx, dy)` dans `annotationUtils.ts`.
- `pencil` — outil `pencil` : un **tracé libre** (`Line` avec `tension`, `lineCap/lineJoin="round"`) construit par accumulation de points pendant le drag (`draft` + `draftRef`).

Conventions de dessin à reproduire :

- **Écoute des events au niveau du Stage** (`stage.on('mousedown.annot touchstart.annot', …)`) avec un **namespace** (`.annot`) pour pouvoir tout détacher proprement (`stage.off('.annot')`) au cleanup. Gérer souris ET tactile.
- **Sélection / hit-testing** : remonter l'arbre Konva via `name() === 'annotation'` (`isAnnotationTarget`) pour distinguer "cliquer une forme existante" de "dessiner une nouvelle". Donner `name="annotation"` à chaque forme.
- **`e.cancelBubble = true`** sur le `onClick` d'une forme pour empêcher le clic de propager (sinon il déclenche la désélection / un nouveau dessin).
- **Hit area** : `hitStrokeWidth={12}` sur les traits fins (cercle/minutie) pour qu'ils restent cliquables même peu épais.
- Suppression au clavier : `Delete`/`Backspace` sur l'annotation sélectionnée (listener `window` monté/démonté selon `selectedId`).
- `zIndex` d'une nouvelle annotation = `layerCount` (nombre total de calques) pour éviter les collisions d'ordre.
- Pendant un drag de poignée (rotation de minutie), suivre l'angle en **state local "live"** (`liveAngleDeg`) pour un rendu fluide, puis **persister une seule fois sur `onDragEnd`** — pas à chaque `onDragMove`.

## 6. Filtres canvas (luminosité/contraste/saturation/inversion/miroir/rotation)

Source unique : `FILTER_META` dans `components/toolbar/canvasFilters.ts`. Chaque filtre y déclare son binding Konva, de deux natures :

- `type: 'filter'` → un `Konva.Filters.*` (Brighten, Contrast, HSL, Invert) appliqué via la prop `filters={[…]}` + la prop de valeur (`brightness`, `contrast`, `saturation`).
- `type: 'transform'` → une prop directe du node (`scaleX` pour le miroir, `rotation`).

Les filtres sont eux aussi **persistés comme calques** (`type: 'FILTER'`), avec debounce (`useCanvasFilters.ts`, ~500 ms ; valeur revenue à 0 = calque supprimé). Pour ajouter un filtre : l'enregistrer dans `FILTER_META` (+ entrée dans `IMAGE_TOOLS`), ne pas câbler un `Konva.Filters.*` en dur dans `DraggableImage`.

> **Règle Konva des filtres** : un node ne rend ses `filters` que s'il est **mis en cache**. D'où, à chaque changement de filtres :
> ```ts
> useEffect(() => {
>   imageRef.current?.cache()
>   imageRef.current?.getLayer()?.batchDraw()
> }, [filters])
> ```
> Oublier le `cache()` = filtres invisibles ; oublier le `batchDraw()` = rendu non rafraîchi.

## 7. Overlay / superposition trace vs référence (approche prospective)

> **État actuel** : le comparateur affiche les deux images dans **deux Stages séparés** côte à côte. La **superposition transparente** (trace au-dessus de la référence, avec curseur d'opacité) n'est **pas encore implémentée**. La section ci-dessous est l'**approche retenue par l'équipe** pour quand cette fonctionnalité sera développée — la marquer comme telle, ne pas la présenter comme existante.

Approche cible pour un mode "overlay" dans un **Stage unique** :

- Deux `KonvaImage` dans le **même Stage** (idéalement deux `Layer`, référence en dessous, trace au-dessus), partageant le **même `view` (scale/x/y)** pour rester alignées sous le zoom/pan.
- Opacité de l'image du dessus pilotée par une prop `opacity` (0→1) exposée via un slider — réutiliser le pattern slider de la toolbar (`FilterSlider`).
- Réutiliser **`getRelativePointerPosition()`** par image pour aligner manuellement (translation/rotation fine) la trace sur la référence ; persister la transform d'alignement comme un calque dédié.
- Pour des modes de fusion (différence, multiply…), `globalCompositeOperation` sur le node du dessus est la voie Konva — à valider perf avec `cache()`.
- Garder l'état de vue partagé dans **un seul `useCanvasView`** réutilisé pour les deux images (ne pas dupliquer deux états de zoom désynchronisés).

## 8. Performance canvas

Le forensique implique des images détaillées et beaucoup d'annotations : limiter les redraws est essentiel.

- **Layers séparés statique vs dynamique** : image (rare changement) dans un `Layer`, annotations (interactions fréquentes) dans un autre. Déjà en place — le conserver.
- **`cache()` sur l'image** : nécessaire pour les filtres, et accélère le rendu d'un node coûteux. Re-`cache()` quand la géométrie/les filtres changent.
- **`batchDraw()`** (via `node.getLayer()?.batchDraw()`) plutôt que des redraws synchrones répétés ; regrouper les mises à jour.
- **`listening={false}`** : à poser sur tout `Layer`/node purement décoratif ou non-interactif (ex. une image de référence en overlay non cliquable) pour sortir du hit-graph et accélérer les events. *(Non encore utilisé dans le code — l'introduire dès qu'un node devient non-interactif.)*
- **Hit-test ciblé** : `hitStrokeWidth` élargit la zone cliquable des traits fins ; à l'inverse, ne pas rendre cliquables des éléments qui n'ont pas à l'être.
- **Persister sur `onDragEnd`, pas `onDragMove`** : muter le server state (React Query) à chaque frame de drag est à proscrire ; suivre en state local pendant le geste, persister à la fin (cf. minuties).
- Éviter de remettre l'image en cache pour rien : le `cache()` est déclenché **par `useEffect([filters])`**, pas à chaque render.

## 9. Pièges spécifiques (déjà rencontrés / à surveiller)

- **Recréer des nodes à chaque render** : ne pas instancier d'objets Konva à la main dans le JSX. Les `key` doivent être **stables** (ex. `key={layer.id}`). Le `key={`${image.url}-${recenterSignal}`}` sur `DraggableImage` est **volontaire** : il force le remount pour réinitialiser la position de drag au recenter — c'est le seul remount intentionnel, ne pas en ajouter d'autres par accident (un `key` instable détruirait/recréerait l'image à chaque render → perf + perte d'état).
- **Fuite mémoire au changement d'image** : toujours nettoyer `img.onload` et remettre l'état à `undefined` dans le cleanup du `useEffect` de chargement (cf. `useImage`). Une image non déchargée + node Konva caché accumulent de la mémoire au fil des sélections.
- **Closure périmée sur le zoom** : passer par `viewRef` (cf. `useCanvasView`) pour toute lecture de la vue dans un handler appelé en rafale.
- **Filtres invisibles** : symptôme classique = `filters={…}` posé sans `cache()`. Vérifier le `useEffect([filters])`.
- **`crossOrigin`** : sans `crossOrigin = 'anonymous'` sur l'image, `cache()` + filtres lèvent une *tainted canvas error*. Le back doit servir les médias avec les en-têtes CORS adéquats.
- **Coordonnées d'annotation en espace écran** : bug latent garanti — les annotations dériveraient au zoom/pan. Toujours stocker en repère local image (Group `{...imageLayout}` + `getRelativePointerPosition()`).
- **`layer.settings as any`** : `Layer.settings` est typé `Record<string, unknown>` (`types/layer.ts`) et le code de rendu le caste en `any` (`AnnotationLayer`/`MinutiaeAnnotation`). C'est une dette connue (à resserrer en union discriminée sur `settings.type`) — ne pas la propager ; préférer un typage par forme quand tu touches ces objets. *(Recoupé par le skill `front-review` : champ JSON polymorphe à valider/typer par forme.)*

## Avant de livrer du code canvas

- `pnpm build` (typecheck `tsc -b` + `vite build`) et `pnpm lint` (`eslint .`) passent. (Aucun framework de test n'est en place ; pas de `pnpm test`.)
- Format Prettier : `semi: false`, `singleQuote: true`, `printWidth: 120`, `trailingComma: 'es5'`.
- Aucune coordonnée d'annotation persistée en pixels écran.
- `cache()` + `batchDraw()` présents partout où des filtres sont appliqués.
- Cleanup de `useImage` et des listeners Stage (`.off('.annot')`) en place.
- Filtres ajoutés via `FILTER_META`, pas en dur.
- Textes UI via i18n (`t('biometricImage.…')`), conformément aux conventions front.
