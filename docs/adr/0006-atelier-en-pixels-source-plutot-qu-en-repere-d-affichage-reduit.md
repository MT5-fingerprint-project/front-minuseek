# ADR-0006 — L'atelier travaille en pixels de l'image source, pas dans un repère d'affichage réduit

- **Statut** : accepté
- **Date** : 2026-09-02
- **Décideurs** : équipe front Minuseek

## Contexte

L'atelier de comparaison rendait chaque image dans un nœud Konva plafonné à 400 pixels de
côté (`MAX_DISPLAY_SIZE`, `fitAdjustmentFactor`). Toutes les coordonnées manipulées à
l'écran vivaient donc dans un repère réduit — au dixième pour un scan de 4000 pixels — et
ce facteur `fitScale` traversait la moitié de la feature : écriture et lecture des
annotations, calibrage à la règle, barre d'échelle, résolution du cache de filtres.

Trois conséquences le rendaient intenable. L'image s'ouvrait toujours dans un carré de
400 pixels quelle que soit la taille du panneau, donc l'opérateur zoomait à chaque
ouverture. Deux images de résolutions différentes s'affichaient à la même taille mais pas
à la même échelle physique, ce qui est précisément la garantie qu'on attend d'un
comparateur. Et au zoom d'ouverture, un pixel écran valait dix pixels source, donc
l'arrondi entier exigé par le contrat serveur quantifiait la position d'une minutie à dix
pixels source près — pour une donnée qui finit dans un rapport opposable.

Le contrat de persistance, lui, n'était pas en cause : depuis L5-6/L5-7 les annotations
sont écrites en pixels entiers de l'image source (`frame: 'source-pixels'`,
`schemaVersion: 1`) et le serveur refuse tout autre repère.

## Décision

Rendre le nœud image à sa **taille naturelle** (`width={image.width}`), de sorte qu'une
unité de la scène Konva soit un pixel de l'image source.

- `lib/displayScale.ts` disparaît avec `fitScale`, `toSourceLength` et `toScreenLength` :
  il n'y a plus de conversion à écrire, ni de prop `fitScale` à faire descendre dans
  `AnnotationLayer`, `MinutiaeAnnotation`, `CalibrationLayer`, `CalibrationDialog` et
  `ScaleBarOverlay`.
- L'ajustement au conteneur devient la valeur initiale de `view.scale`, calculée dans
  `useCanvasView` à partir des dimensions du contenu, avec le `x/y` qui centre l'image.
  Il rejoue **au chargement d'une image et au recentrage seulement** — pas à un
  redimensionnement de panneau, qui écraserait le zoom que l'opérateur vient de régler.
  Le garde est l'identité de l'objet `content`, dérivée de l'identifiant de l'image et de
  ses dimensions : une URL GCS re-signée remonte le même dossier sans faire perdre son
  zoom.
- Le plancher de zoom est dérivé de cet ajustement (`min(MIN_SCALE, ajustement)`) : au-delà
  de vingt mille pixels de côté, l'ajustement passe sous le plancher fixe et l'image ne
  tiendrait plus entière.
- Une seule règle remplace les conversions : **ce qui appartient à l'image reste en pixels
  source** et grandit avec elle (position et rayon d'un marqueur, points et épaisseur d'un
  tracé, flèche de direction) ; **ce qui appartient à l'outil se divise par `viewScale`**
  pour garder une taille constante à l'écran (poignée de rotation, plancher de police du
  libellé, zone cliquable, renfort de sélection, points et traits de la règle).
- La taille des marqueurs écrits en base se dérive du plus grand côté de la source
  (`MARKER_RADIUS_RATIO`, `STROKE_RATIO`, avec un plancher pour les petites images), et
  non plus d'une constante d'affichage divisée par `fitScale`.

## Conséquences

- ✅ Une image s'ouvre ajustée à son panneau, petite comme grande, sans zoom manuel.
- ✅ La pose d'une minutie n'est plus quantifiée : `getRelativePointerPosition()` rend des
  pixels source en sous-pixel à n'importe quel grossissement.
- ✅ Toute une classe de bugs de conversion disparaît avec les deux helpers, et le
  pourcentage affiché par `ZoomControls` prend enfin un sens vérifiable — 100 % vaut un
  pixel source par pixel CSS, au lieu de « l'image ramenée à 400 pixels ».
- ✅ Verrouiller les deux fenêtres du comparateur sur le même grossissement physique
  devient possible, ce qui était hors d'atteinte avec deux repères réduits distincts.
- ⚠️ Le repère de la scène vaut désormais l'image entière : tout ce qui dimensionne un
  canvas à partir du contenu doit être borné explicitement. Le cache de filtre est plafonné
  à `MAX_CACHE_SIDE` de côté — canvas de scène **et** canvas de hit-test, ce dernier
  ignorant `pixelRatio` — et l'export PNG cadre explicitement le viewport du Stage au lieu
  de suivre la boîte du contenu.
- ⚠️ L'ajustement est calculé sur les dimensions non pivotées : une rotation proche de 90°
  déborde du panneau, et le recentrage ne le rattrape pas. L'opérateur s'en sort à la
  molette ; un ajustement sur la boîte englobante pivotée reste à faire.
- ⚠️ Le pourcentage de zoom change de signification pour les opérateurs habitués à
  l'ancien affichage : une grande image s'ouvre à 20 % là où elle affichait 100 %.
- ⚠️ Aucun test automatisé n'existe dans ce dépôt : la vérification du repère se fait à
  l'écran, sur un dossier portant des annotations antérieures au changement.

## Alternatives écartées

- **Choisir une meilleure valeur pour `MAX_DISPLAY_SIZE`** — déplace le problème sans le
  résoudre : aucune constante ne convient à la fois à un recadrage de 280 pixels et à un
  scan de 8000, et la quantification de la pose subsiste.
- **Faire dépendre `fitAdjustmentFactor` du conteneur en gardant le repère réduit** —
  apporte l'ajustement visible tout de suite, mais rend `fitScale` dynamique : les
  dépendances d'effet qui le contiennent se rebranchent à chaque redimensionnement, et la
  quantification comme la traversée du facteur dans la feature restent entières.
- **Convertir en pixels source uniquement à la frontière de persistance** — c'est déjà ce
  que faisait le code, et c'est la source du problème : le repère réduit continuait de
  vivre partout ailleurs, y compris dans les valeurs écrites en base.
