# AGENTS.md

Guide pour les agents IA **et** les humains qui travaillent sur `front-minuseek`.
Front du projet Minuseek— **React 19 + Vite 8 + TypeScript**, en **architecture feature-slice** alignée sur les bounded contexts du back.

> Le code applicatif vit dans `src/`. Docker (`Dockerfile`, `compose.yaml`), `Makefile` et la config Vite (`vite.config.ts`) sont à la racine.

## Directives agents (DO / DON'T)

> **Avant de coder, explore le code avec codegraph** (`codegraph_explore`). Préfère les wrappers **`rtk`** aux commandes brutes pour économiser le contexte : `rtk git`, `rtk grep`, `rtk read`, `rtk pnpm`, `rtk vitest`, `rtk tsc`, `rtk lint`.

✅ **À faire**
- Séparer nettement **UI (composants présentationnels) ↔ logique & état serveur (hooks + React Query) ↔ accès API (`services/` → `apiClient`)**.
- État serveur via `useQuery`/`useMutation` + query-key factories ; invalider par clé après mutation.
- Tout texte visible via `t('clé')` (i18n FR dans `src/locales/fr/translation.json`).
- Aucune URL d'API en dur : passer par `services/` et `VITE_API_URL`.
- Lancer le skill **`front-review` avant chaque PR**.
- **Écrire un ADR** (`docs/adr/`, cf. `docs/adr/README.md`) pour toute décision structurante (lib, pattern d'état, contrat d'API, archi d'une feature).

❌ **À ne pas faire**
- Mettre de la logique métier ou un appel `axios` dans un composant/JSX.
- Faire dépendre `shared/` d'une feature métier (sens de dépendance interdit).
- Stocker des données distantes dans `useState` au lieu de React Query.
- Laisser du texte en dur, un `console.log`, ou un secret côté client.

## Stack

- **Build** : Vite 8 — **Package manager** : pnpm (installé dans l'image Docker via `npm install -g pnpm`)
- **UI** : React 19 (TypeScript) + **Tailwind CSS 4** (`@tailwindcss/vite`). Composants shadcn/ui (style `radix-luma`, voir `components.json`) dans `src/features/shared/ui/`, bâtis sur les primitives **Radix** (`radix-ui`) — le `Button` utilise `@base-ui/react`. Icônes : `lucide-react`.
- **État serveur** : TanStack Query 5 (`@tanstack/react-query`) — **Formulaires** : TanStack Form (`@tanstack/react-form`) validés par **Zod 4**
- **HTTP** : axios (`src/features/shared/lib/apiClient.ts`)
- **i18n** : react-i18next / i18next (FR uniquement aujourd'hui)
- **Canvas** : react-konva / konva (annotation des empreintes, sous `biometric-image/components/canvas/`)
- **Carousel** : embla-carousel-react (composant `src/features/shared/ui/carousel.tsx`)
- **Routing** : react-router-dom 7 (`createBrowserRouter`, configuré dans `src/main.tsx`)
- **Toasts** : sonner (branché au `QueryClient`)
- **Lint** : ESLint (flat config : `@eslint/js` + typescript-eslint + react-hooks + react-refresh)
- **Format** : Prettier (`singleQuote`, `semi: false`, `printWidth: 120`, `trailingComma: 'es5'`, `arrowParens: 'always'`)
- **Conteneurs** : Docker Compose (`compose.yaml`) avec hot-reload Vite

## Démarrage

```bash
cp .env.example .env          # variables d'env (gitignoré)
make dev                      # crée le réseau Docker partagé + build + up (hot-reload Vite)
```

Le front écoute sur `http://localhost:5173`. **Plus aucun proxy Vite** : les
appels API partent directement vers l'URL **absolue** `VITE_API_URL` (en dev
`http://localhost:3000/api`, CORS réel comme en prod), et les images arrivent
en **URLs signées GCS absolues** fournies par l'API (`dto.url`, back ADR-0003).

> **Aucune URL n'est codée en dur** : tout passe par le `.env` (`VITE_API_URL`). `apiClient` lit `VITE_API_URL` via `src/features/shared/constants/global.constants.ts` (`API_URL = import.meta.env.VITE_API_URL`). En prod, `VITE_API_URL` pointe vers l'URL absolue de l'API.

## Commandes (Makefile, à la racine)

| Commande | Rôle |
|---|---|
| `make dev` | Crée le réseau puis lance le stack en dev (`docker compose up --build -V`, rebuild d'image + hot-reload Vite) |
| `make down` | Stoppe le stack |
| `make logs` | Suit les logs du front |
| `make lint` | Lance ESLint dans le conteneur (`docker compose run --rm dev pnpm lint`) |
| `make build-pnpm` | Build de production dans le conteneur (`pnpm build` → `tsc -b && vite build`) |
| `make network` | Crée le réseau Docker partagé `minuseek` (idempotent) |

Scripts pnpm (`package.json`) : `pnpm dev` (Vite), `pnpm lint` (`eslint .`), `pnpm build` (`tsc -b && vite build`), `pnpm preview` (sert le build). Le `Makefile` n'expose pas de cible `dev-build` ni `preview` : `make dev` rebuild déjà l'image à chaque lancement.

## Architecture — où va le code

Le code est organisé en **feature-slices** sous `src/features/`, chaque slice correspondant à un *bounded context* du back :

```
src/
├── features/
│   ├── investigation-case/         # contexte "investigation" du back
│   │   ├── components/             # UI présentationnelle (+ comparison/)
│   │   ├── pages/                  # écrans routés
│   │   ├── hooks/                  # state serveur (React Query) + formulaires (React Form)
│   │   ├── services/               # accès API (*API.services.ts → apiClient)
│   │   └── types/                  # types + schémas Zod du contexte
│   ├── biometric-image/            # contexte "biometrics" du back (traces, calques, minuties)
│   │   ├── components/             # canvas/, layers/, toolbar/, carousel/ (react-konva)
│   │   ├── hooks/ services/ types/ fixtures/
│   └── shared/                     # transverse, ne dépend d'aucune feature métier
│       ├── ui/                     # composants shadcn/ui de base (button, dialog, input…)
│       ├── components/             # navbar/, window/
│       ├── lib/                    # apiClient, queryClient, i18n, utils
│       ├── hooks/ constants/ icons/ types/
├── layouts/                        # layouts de route (CaseLayout.tsx)
├── locales/fr/translation.json     # clés i18n (FR)
├── assets/css/index.css            # styles globaux (Tailwind), importé dans main.tsx
├── types/                          # déclarations globales (i18next.d.ts, svg.d.ts)
└── main.tsx                        # composition root : router + providers
```

Alias d'import `@` → `src/` (`vite.config.ts`). Préférer `@/features/...` aux chemins relatifs profonds.

### Séparation des couches (dans chaque slice)

```
components / pages  →  hooks  →  services  →  apiClient
   (présentationnel)   (état)     (accès API)
```

- **`components/` & `pages/`** : présentationnel — affichent des données et émettent des intentions, pas d'appel API direct ni d'`axios`.
- **`hooks/`** : la logique et l'**état serveur** (TanStack Query : `useQuery`/`useMutation`, clés de cache) ; les formulaires (TanStack Form + Zod).
- **`services/` (`*API.services.ts`)** : seul endroit qui touche `apiClient` et connaît les routes de l'API (ex. `InvestigationCaseAPI.services.ts`, `BiometricImageAPI.services.ts`, `LayerAPI.services.ts`).
- **`shared/`** est transverse : il ne doit **jamais** importer d'une feature métier (`investigation-case`, `biometric-image`). La dépendance va des features vers `shared`, pas l'inverse.

## Conventions

- **Nommage** : dossiers de features en kebab-case ; composants/pages/layouts en PascalCase (`InvestigationCaseCard.tsx`, `CaseLayout.tsx`) ; services suffixés `*API.services.ts` ; hooks préfixés `use*`. Suivre la casse déjà en place dans chaque dossier.
- **État serveur via React Query, pas `useState`** : toute donnée distante passe par `useQuery`/`useMutation`. `useState` reste pour l'état local d'UI uniquement.
- **Clés de query centralisées** : factory `*Keys` par feature (ex. `investigationCaseKeys` dans `useInvestigationCases.ts`, avec `.all` / `.lists()` / `.detail(id)`) ; invalider via ces clés après mutation. `QueryClient` global dans `shared/lib/queryClient.ts` (toast d'erreur `sonner` global via `i18n.t('common.errors.loadFailed')`, `staleTime` 30 s, `retry: 1`, `refetchOnWindowFocus: false`).
- **Formulaires** : `useForm` de TanStack Form, validation par schéma Zod passé en `validators.onSubmit` (voir `useCreateInvestigationCaseForm.ts`). Pas de validation manuelle ad hoc.
- **i18n** : aucun texte UI en dur. Toutes les chaînes visibles passent par `t('...')` (`useTranslation`) avec une clé dans `src/locales/fr/translation.json`. Les messages de validation Zod et les toasts utilisent aussi des clés i18n.
- **API** : le client axios (`apiClient`) injecte le `Bearer` token (`localStorage.accessToken`) en intercepteur de requête et purge le token sur `401`. Ne pas instancier d'autre client axios ni coder d'URL absolue — passer par les `services/`.
- **Typage** : types et schémas Zod par feature dans `types/` (ex. `investigationCase.ts` : `interface` + `z.object` + `z.infer`). Réutiliser ces types côté hooks/services.

## Tests

- **Aucun framework de test n'est installé aujourd'hui** : pas de Vitest, pas de `@testing-library`, aucun script `test` dans `package.json`, aucune cible `make test`, aucun `*.test.tsx`/`*.spec.tsx` dans `src/`. Ne pas prétendre qu'une suite existe ni inventer une commande `make test` / `pnpm test`.
- **Si l'on en ajoute** : recommandation **Vitest + @testing-library/react** (cohérent avec Vite), tests à côté du code (`*.test.tsx`). À ce moment-là, ajouter le script `test` au `package.json`, une cible Makefile, et mettre cette section à jour.

## Points d'attention

- **Pas d'URL en dur** : tout via `VITE_API_URL` (`.env`). Une URL absolue glissée dans un service est une erreur.
- **Ne pas committer `.env`** (gitignoré) ; partir de `.env.example`.
- **`pnpm-lock.yaml`** doit être commité pour des installs reproductibles (Docker + CI).
- **Le back doit tourner** (`http://localhost:3000`) pour que les appels API répondent — plus de proxy, le navigateur appelle l'API en direct (CORS : le back autorise `http://localhost:5173` via `ORIGIN`).
- **`shared/` ne dépend d'aucune feature** : garder cette direction de dépendance pour éviter les cycles.
- **i18n FR uniquement** : `lng: 'fr'`, `fallbackLng: 'fr'` ; toute nouvelle chaîne va dans `translation.json`.

## Agents IA & skills (multi-outils)

L'équipe travaille avec plusieurs agents (Claude Code, OpenAI Codex, Google Antigravity, Cursor…). Le setup est **partagé, committé**, avec une **source de vérité unique** : le dossier `.agents/`.

- **`AGENTS.md`** (ce fichier) — standard ouvert, lu nativement par Codex, Cursor, GitHub Copilot, Windsurf, Aider, Zed… (désormais sous l'égide de la Linux Foundation).
- **`CLAUDE.md`** — une seule ligne `@AGENTS.md` : Claude Code ne lit pas `AGENTS.md` nativement (feature request `anthropics/claude-code#34235`), on l'importe donc.
- **`.agents/skills/`** — **source de vérité des skills** (format `SKILL.md`). Lue nativement par **Codex** (`$REPO_ROOT/.agents/skills`, en remontant du dossier courant à la racine — et Codex **suit les symlinks**). On édite un skill à un seul endroit.
- **`.claude/skills` → `../.agents/skills`** — **symlink committé** : Claude Code ne lit que `.claude/skills`, or `.claude/` est gitignoré. Le lien lui donne les mêmes skills, sans copie ni dérive.
- **`.agents/rules/conventions.md` → `../../AGENTS.md`** — **symlink committé** pour **Google Antigravity**, qui lit `.agents/rules/` (règles toujours actives). Il voit ainsi tout ce fichier.

```bash
# Liens déjà versionnés ; à ne recréer qu'en cas de besoin :
ln -s ../.agents/skills .claude/skills
ln -s ../../AGENTS.md .agents/rules/conventions.md
```

Le `.gitignore` ne partage que ces liens (`.claude/*` ignoré, `!.claude/skills` ré-inclus) ; `settings.local.json` reste privé à chaque dev.

> **Windows** : si les liens apparaissent comme de simples fichiers texte, lancer une fois `git config core.symlinks true` puis re-checkout. ⚠️ `npx skills` (gestionnaire de skills, lockfile `skills-lock.json`) produit un `computedHash` qui diffère entre Windows et Linux (fins de ligne) — c'est attendu, ne pas s'en alarmer.

@RTK.md
