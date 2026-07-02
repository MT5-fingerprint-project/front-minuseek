---
name: front-review
description: "Review du frontend Minuseek(React 19 + Vite + TypeScript + TanStack Query/Form + Zod + shadcn/ui + react-konva, i18n FR-only). À lancer avant chaque PR. Déclencher aussi pour toute demande de review de code, review de PR/diff front, audit d'architecture feature-slice, vérification i18n (clés manquantes dans src/locales/fr/translation.json), contrôle du server state React Query (query-key factories & invalidation ciblée), des formulaires TanStack Form + Zod, de l'accessibilité, ou de la sécurité front (XSS via dangerouslySetInnerHTML, URL d'API en dur, secrets VITE_, token accessToken en localStorage). Applique un process sur le diff, un modèle de sévérité (Critical/Warning/Info) et un format de rapport ; couvre les pièges réels du repo : invalidation par clé exacte (mêmes arguments), logique métier dans le JSX, perf react-konva (Layer/batchDraw/redraw), settings as any, dates string vs Date."
---

# Minuseek Frontend Review

Skill de **process de review** pour le frontend Minuseek(React 19 + Vite + TanStack Query/Form + Zod + shadcn/ui + react-konva).

> **Source de vérité des conventions = `AGENTS.md`** . Ce skill ne ré-énonce PAS les conventions (stack, architecture feature-slice, nommage, alias `@/`, workflow). Il y **pointe** et n'ajoute que ce qui manque : le **process de review**, le **modèle de sévérité**, le **format de rapport** et les **pièges réels du front** vérifiés dans le code. **Lis `AGENTS.md` d'abord.**
>

## Quand utiliser

- Demande de review de code, review de PR / diff, audit du front.
- Avant un merge sur `main` (trunk-based).
- Quand une nouvelle feature (slice sous `src/features/`) est ajoutée, ou après un refactoring (cohérence des slices).
- Audit i18n / accessibilité / sécurité front.

## Runbook — à lancer avant chaque PR

Ce skill est le **gate de review maison** du front (il prime sur toute review générique téléchargée). À exécuter sur le **diff de la PR** (`rtk git diff origin/main...HEAD`) avant d'ouvrir la PR.

1. **Portes CI locales** (bloquantes) :
   - `rtk lint` (ESLint, zéro warning) — `make lint` / `pnpm lint`
   - `pnpm build` (typecheck `tsc -b` + `vite build`) — ou `rtk tsc`
   - _Tests : aucun framework installé à ce jour (cf. `AGENTS.md`) — ne pas inventer de commande de test._
   Si une porte échoue → corriger d'abord.
2. **Passes de review** sur le diff (sections ci-dessous).
3. **Checklist auteur** (ci-dessous) : tout coché ?
4. **Verdict** : conclure par **✅ READY** ou **🔴 NOT READY** + la liste des bloquants.

### Checklist auteur de PR
- [ ] Lint + build verts en local
- [ ] Séparation UI ↔ logique/état serveur ↔ accès API respectée (pas d'`axios` ni de logique métier dans le JSX)
- [ ] `shared/` ne dépend d'aucune feature ; état serveur via React Query (clés + invalidation ciblée)
- [ ] Aucun texte en dur → `t('clé')` (i18n FR) ; aucune URL d'API en dur
- [ ] Commits `type(scope): description` ; pas de `console.log`/debug ; pas de secret côté client
- [ ] Diff < 400 lignes ; description claire + lien ticket ; branche rebasée sur `main`
- [ ] **ADR écrit** si une décision structurante a été prise (`docs/adr/`)

## Cadrage du codebase (à re-vérifier — ne pas figer)

Le code applicatif vit dans `src/`. Les invariants stables ci-dessous sont plus fiables que tout comptage :

- **Découpage par slice** : chaque feature sous `src/features/<feature>/` se répartit en `pages/` (container), `components/` (présentation), `hooks/` (logique : React Query, form), `services/` (`<Feature>API.services.ts`, seul à parler à `apiClient`), `types/` (modèles TS + schémas Zod). Le transversal va dans `src/features/shared/`.
- **`apiClient` unique** : `src/features/shared/lib/apiClient.ts` (axios). Toute requête passe par un service de slice, jamais par axios depuis un composant/page.
- **`queryClient` partagé** : `src/features/shared/lib/queryClient.ts` — porte un `QueryCache.onError` global qui **toaste déjà** `common.errors.loadFailed` sur erreur de query (et fixe `staleTime: 30_000`, `retry: 1`, `refetchOnWindowFocus: false`).
- **i18n FR-only** : init dans `src/features/shared/lib/i18n.ts` (`lng: 'fr'`, `fallbackLng: 'fr'`), clés dans `src/locales/fr/translation.json`, augmentation de types dans `src/types/i18next.d.ts`.
- **Canvas** : `react-konva` (Stage/Layer) dans `src/features/biometric-image/components/canvas/`. Les calques (`Layer`) sont des entités métier (server state via `useLayers`) ET des nœuds Konva (`<Layer>`/`<Group>`) — ne pas confondre les deux sens du mot « layer ».

> Si de nouvelles slices apparaissent, applique le même cadre : `pages/components/hooks/services/types`, partagé via `shared/`, accès API via service. **Ne code jamais en dur la liste des features** — énumère-les depuis `src/features/`.

## Process de review

Travaille **sur le diff** (`git diff main...HEAD`, fichiers de la PR), pas sur des fichiers isolés — pour attraper les effets transverses (ex. un champ ajouté au type mais pas au schéma Zod, une clé `t()` référencée sans entrée JSON, une mutation qui n'invalide pas la bonne clé). Si aucun diff n'est fourni, demande le scope (slice / PR / commit).

### Étape 1 — Cadrer
Identifier le scope et lister les fichiers changés. Repérer s'ils touchent : `pages/`, `components/`, `hooks/`, `services/`, `types/`, `shared/`, `locales/`, le canvas konva, la config (`vite.config.ts`, `.env*`).

### Étape 2 — Passes ordonnées
Scanner dans cet ordre de priorité (les vrais bloquants d'abord) :
1. **Correctness / logique** — crash runtime, `undefined` non géré qui casse un `.map`, états `isPending`/`isError` non rendus, edge cases, dépendances de hooks (`exhaustive-deps`) mal gérées.
2. **Sécurité** — XSS (`dangerouslySetInnerHTML`), secrets, URL d'API en dur, exposition de données sensibles (biométrie, PII d'enquête), token.
3. **Architecture / conventions** — découpage de slice, séparation UI/logique, server state, formulaires, i18n. Vérifier **contre `AGENTS.md`** (ou `README.md` / `.prettierrc` / `eslint.config.js` / code tant qu'il manque).
4. **Performance** — re-renders inutiles, redraw konva, `staleTime`/invalidation, listes non bornées.

À chaque passe, consulter la section **Pièges spécifiques front** ci-dessous.

### Étape 3 — Classer par sévérité

| Sévérité | Critère | Action |
|---|---|---|
| 🔴 **Critical** | Bloque le merge : crash runtime, faille de sécurité (XSS, fuite de données/secret), `pnpm build` (typecheck) cassé | Corriger avant merge |
| ⚠️ **Warning** | Anti-pattern, dette, écart aux conventions, a11y manquante, invalidation incomplète | Corriger ou justifier |
| 💡 **Info** | Suggestion, inconsistance mineure, nit | À discuter |

Down-rank les nits stylistiques à faible confiance : un reviewer bruyant est ignoré. Précise en tête ce qui est bloquant vs optionnel.

### Étape 4 — Boucle de validation
Avant de finaliser, relire chaque finding : est-il vérifiable dans le code/diff ? est-il bien classé ? la convention citée existe-t-elle vraiment (pas inventée) ? la clé i18n / le nom de hook / le service cité existe-t-il (grep avant d'affirmer) ? Supprimer les affirmations non étayées. Si possible, lancer `pnpm build` (= `tsc -b && vite build`, qui fait le typecheck) et `pnpm lint` (`eslint .`) — ce sont, avec `pnpm dev` et `pnpm preview`, les seuls scripts définis (`package.json` ; **pas de tests** dans le projet, ne pas exiger `pnpm test`).

### Étape 5 — Rapport
Produire le rapport au format défini plus bas. Chaque finding a la forme fixe : **`Fichier:ligne` · sévérité · WHAT (1 phrase) · WHY/impact (1 phrase) · FIX concret**.

## Pièges spécifiques front (vérifiés dans le code)

Checks à appliquer en priorité. Greps fournis ; **re-vérifie l'état** (ils peuvent être déjà conformes ou avoir bougé).

- **Clé de cache React Query & invalidation ciblée.** Les query-keys sont des **factories** par slice (`investigationCaseKeys`, `biometricImageKeys`, `layerKeys`). Une mutation doit invalider **exactement la clé** qu'elle impacte, avec les **mêmes arguments** : `layerKeys.list(fingerprintId)` est paramétrée — invalider `layerKeys.all` ou un mauvais `fingerprintId` rate la cible et laisse une liste périmée ; `biometricImageKeys.list(type, caseId)` prend deux args (attention à `variables.caseId` dans `onSuccess`). 🔴 si la donnée affichée reste fausse après mutation, sinon ⚠️. Refuser tout `queryKey: ['...']` littéral en dur hors factory.
  ```bash
  grep -rn "useQuery\|useMutation" src/features --include=*.ts --include=*.tsx
  grep -rn "queryKey:" src/features --include=*.ts --include=*.tsx | grep "\['"   # littéraux hors factory
  grep -rn "invalidateQueries" src/features --include=*.ts                         # args alignés sur la factory ?
  ```
- **Pas de logique métier dans le JSX (séparation UI/logique).** `services/` = seul à appeler `apiClient` ; `hooks/` = React Query + logique de form (pas de JSX) ; `components/` = présentation pure (pas de `useQuery`/`useMutation` sauf composant explicitement « connecté ») ; `pages/` = container (pas d'axios, pas de gros calcul métier). Un composant qui mélange fetch + état + gros JSX est un signal de refactor.
  ```bash
  grep -rn "apiClient\|from 'axios'" src/features --include=*.tsx                  # axios dans du JSX → ZÉRO
  grep -rn "apiClient" src/features --include=*.ts | grep -v "/services/"          # axios hors services → suspect
  grep -rln "useQuery\|useMutation" src/features/*/components                      # query/mutation en présentation → inspecter
  ```
- **Complétude i18n (clés manquantes dans `locales/fr`).** Aucun texte UI en dur dans le JSX : tout via `t('clef')`, et la clé DOIT exister dans `src/locales/fr/translation.json` (sinon la clé brute s'affiche). Pas de concaténation de chaînes traduites (utiliser l'interpolation `t('...', { var })`). FR-only : un seul fichier de locale à tenir à jour. Attention au `t()` appelé au niveau module (ex. messages d'un schéma Zod) — i18n doit être initialisé avant.
  ```bash
  grep -rhoE "t\('([^']+)'" src --include=*.ts --include=*.tsx | sort -u          # clés référencées → comparer au JSON
  grep -rnE ">[A-Za-zÀ-ÿ]{3,}" src/features --include=*.tsx | grep -v "t(" | grep -v "className"  # texte en dur suspect
  ```
- **Pas d'URL d'API en dur.** Tout passe par `API_URL = import.meta.env.VITE_API_URL` (`src/features/shared/constants/global.constants.ts`) → `apiClient`. En dev `VITE_API_URL=/api` passe par le **proxy Vite** (`vite.config.ts → server.proxy`, qui route `/api` et `/media` vers `API_PROXY_TARGET`). Aucun `http://localhost:...` ni domaine codé en dur dans une slice. Cohérence à vérifier entre `.env.example`, `vite.config.ts` et l'usage.
  ```bash
  grep -rn "http://\|https://\|localhost:" src/features --include=*.ts --include=*.tsx
  ```
- **Performance react-konva (layers / redraw).** Le canvas vit dans `biometric-image/components/canvas/`. Surveiller : un `<Stage>` ne doit pas re-rendre tout l'arbre à chaque mouvement (séparer ce qui bouge dans son propre `<Layer>`), le `getLayer()?.batchDraw()` manuel (`DraggableImage.tsx`) doit rester ciblé, et les handlers konva attachés via `stage.on('mousedown.annot …', …)` (`AnnotationLayer.tsx`) doivent être détachés au cleanup (`stage.off('.annot')`). Une mutation à chaque `mousemove` (au lieu de `mouseup`/draft) ou un re-render de Stage par frame = jank. ⚠️→🔴 selon l'impact. Le `layer.settings as any` (`AnnotationLayer.tsx`, `MinutiaeAnnotation.tsx`) est un trou de typage : signaler (voir piège typage).
- **Accessibilité.** Champs de formulaire : `label` lié (`htmlFor`/`id`), `aria-invalid` + message d'erreur associé. Élément cliquable = `button`/`a` natif, ou `role`+`tabIndex`+gestion clavier si `div`. Actions icône-only (`lucide-react`, SVG via `src/features/shared/icons/`) → label accessible ; icônes décoratives non annoncées. États de chargement/vide rendus visuellement.
- **XSS via `dangerouslySetInnerHTML`.** Interdit sur du contenu non sanitizé. Au moment d'écrire : 0 occurrence — **garder ce check préventif** sur tout diff.
  ```bash
  grep -rn "dangerouslySetInnerHTML" src
  ```
- **Sécurité / secrets / token.** Tout `VITE_*` est **public** (exposé au client) : jamais de secret serveur dedans. `.env` gitignoré, `.env.example` sans valeur sensible. Le token (`accessToken` en `localStorage`) ne doit pas être loggé ni mis dans une URL ; l'intercepteur `401` purge le token (`apiClient.ts`). Pas de `console.log` ni de PII/biométrie en clair (0 `console.log` au moment d'écrire — check préventif).
  ```bash
  grep -rn "process.env\|import.meta.env" src | grep -v "VITE_"
  grep -rn "console.log" src
  ```
- **Server state via React Query, pas `useState`+`useEffect` pour fetcher.** Pas de re-toast d'une erreur de query : le `queryClient` toaste déjà globalement (`common.errors.loadFailed`). Les **mutations**, elles, toastent leur propre erreur (`toast.error(t('biometricImage.layers.createError'))` etc. dans `useLayers`) — c'est le pattern attendu, ne pas le confondre avec un doublon. Côté consommateur, valeur par défaut sûre (`const { data = [] } = useXxx()`) pour éviter un `.map` sur `undefined`.
  ```bash
  grep -rn "useEffect" src/features | grep -iE "fetch|apiClient|axios"             # fetch via effect → anti-pattern
  ```
- **Typage : `any`, `@ts-ignore`, dates string vs Date.** Pas de `any`/`@ts-ignore` non justifié (les `settings as any` du canvas — `AnnotationLayer.tsx`, `MinutiaeAnnotation.tsx` — sont à resserrer vers une union typée selon `LayerType`). Le schéma Zod et le type d'input doivent dériver l'un de l'autre (`z.infer`), et un champ optionnel doit être `.optional()`. **Dates** : l'API renvoie `createdAt`/`updatedAt` en **string JSON** ; appeler `.toLocaleDateString()` directement dessus crashe — toujours `new Date(value)` d'abord (déjà appliqué dans `InvestigationCaseCard.tsx` et `InvestigationCaseDetailsPage.tsx`, mais re-vérifier tout nouveau formatage de date).
  ```bash
  grep -rn ": any\|as any\|@ts-ignore\|@ts-expect-error" src
  grep -rn "toLocaleDateString\|toLocaleTimeString\|getFullYear\|getTime" src/features  # sur un new Date(...) ?
  ```

## Format du rapport

```markdown
# Review Frontend — {scope}

**Date** : YYYY-MM-DD · **Commit/PR** : {ref} · **Reviewer** : Agent

## Résumé
| Passe | Résultat |
|---|---|
| Correctness | ✅ / ⚠️ / ❌ |
| Sécurité (XSS / secrets / URL en dur) | ✅ / ⚠️ / ❌ |
| Architecture / slices / séparation UI-logique | ✅ / ⚠️ / ❌ |
| Server state (React Query) | ✅ / ⚠️ / ❌ |
| Formulaires (TanStack Form + Zod) | ✅ / ⚠️ / ❌ |
| i18n (FR) | ✅ / ⚠️ / ❌ |
| Accessibilité | ✅ / ⚠️ / ❌ |
| Performance (react-konva) | ✅ / ⚠️ / ❌ / N/A |

**Build (`pnpm build`)** : ✅ / ❌ — **Lint (`pnpm lint`)** : ✅ / ❌

## Findings

### 🔴 Critical
| # | Fichier:ligne | Finding (what) | Impact (why) | Fix proposé |
|---|---|---|---|---|

### ⚠️ Warning
| # | Fichier:ligne | Finding (what) | Impact (why) | Fix proposé |
|---|---|---|---|---|

### 💡 Info
| # | Fichier:ligne | Finding (what) | Impact (why) | Fix proposé |
|---|---|---|---|---|

## Points positifs
- ...

## Prochaines étapes
- ...
```
