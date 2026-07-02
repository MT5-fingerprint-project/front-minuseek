---
name: frontend-best-practices
description: "Principes de conception du frontend Minuseek(React 19 + TypeScript + Vite + TanStack Query 5, axios apiClient, architecture feature-slice sous src/features/). Déclencher pour écrire ou refactorer du code front React/TS, appliquer DRY/SOLID/KISS/YAGNI et le single-responsibility, séparer l'UI de la logique métier et du data-fetching, découper un god-component, extraire ou factoriser un hook (useXxx, query-key factory), distinguer composant présentationnel vs conteneur (Container), ou décider où placer du code dans features/<x>/ vs features/shared/."
---

# Frontend Best Practices — Minuseek

Skill de **principes de conception** pour le frontend Minuseek(React 19 + TypeScript + Vite + TanStack Query 5, axios `apiClient`, shadcn/ui, i18n FR-only).

> **Conventions du repo = `AGENTS.md`** (racine de `front-minuseek`, quand il est présent). Ce skill ne ré-énonce PAS la stack détaillée, le nommage de fichiers ni le workflow Git — il y **pointe**. Il ajoute uniquement ce qui manque : comment appliquer DRY / KISS / YAGNI / single-responsibility et **surtout la séparation UI ↔ logique métier ↔ data-fetching** dans cette codebase précise, avec des exemples tirés du code réel. Pour le *process* de review (sévérité, format de rapport, checklists d'audit), c'est le skill `front-review` ; ici on parle de *comment écrire* le code, pas de comment l'auditer.

## Quand utiliser

- Écrire une nouvelle feature ou un nouveau composant React/TS.
- Refactorer un fichier qui mélange fetch + état + gros JSX (« god component »).
- Hésiter sur l'endroit où mettre du code : `src/features/<x>/{pages,components,hooks,services,types}` vs `src/features/shared/`.
- Décider s'il faut extraire un hook, découper un composant, ou factoriser du code dupliqué.

## La règle centrale : 3 responsabilités, 3 endroits

Dans une slice (`src/features/<feature>/`), chaque type de code a son dossier. C'est l'application concrète du **single-responsibility** ici :

```
features/<feature>/
├── pages/        ← conteneur racine : branché au router, orchestre hooks + composants
├── components/   ← présentation (props in → JSX out) + sous-conteneurs ciblés
├── hooks/        ← logique : data-fetching (useXxx + query-key factory), forme, état UI complexe
├── services/     ← SEUL endroit qui parle à apiClient (axios) — fichier <Feature>API.services.ts
└── types/        ← modèles TS + schémas Zod
```

> Toutes les slices n'ont pas chaque dossier. `investigation-case/` possède un `pages/`, `biometric-image/` n'en a pas (il expose des composants montés ailleurs). On crée un dossier quand il sert, pas par symétrie (cf. YAGNI).

Flux mental : **service** (parle au réseau) → **hook** (`useXxx`, branche TanStack Query, gère cache/toasts) → **conteneur** (appelle le hook, passe data + callbacks en props) → **composant présentationnel** (rend le JSX, ne sait rien du réseau).

Le transversal réutilisable (UI shadcn dans `shared/ui/`, hooks génériques, `apiClient`, `i18n`, `queryClient`, helper `cn`) vit dans `src/features/shared/` — jamais dupliqué dans une feature, jamais importé d'une feature vers une autre.

---

## Séparation data-fetching ↔ UI (le point n°1)

**Ce que ça veut dire ici** : aucun composant ni page ne contient d'appel `apiClient`/axios, et un composant de présentation n'appelle ni `useQuery` ni `useMutation`. Le fetch vit dans un hook `useXxx` qui délègue au service ; un composant *conteneur* mince consomme le hook et alimente un composant *présentationnel* pur.

L'exemple canonique existe déjà dans le repo : `LayersPanelContainer` (fetch) + `LayersPanel` (pur), dans `components/layers/`.

Anti-pattern (le composant fait tout) :

```tsx
function LayersPanel({ fingerprintId }: { fingerprintId: string }) {
  const { data: layers = [] } = useLayers(fingerprintId)       // fetch
  const updateLayer = useUpdateLayer(fingerprintId)            // mutation
  return <div>{layers.map((l) => /* JSX + logique mélangés */)}</div>
}
```

Bon (conteneur mince + présentationnel pur, le pattern réel) :

```tsx
// LayersPanelContainer.tsx — connaît les hooks, pas le JSX de détail
function LayersPanelContainer({ fingerprintId, onClose }: Props) {
  const { data: layers = [] } = useLayers(fingerprintId)
  const updateLayer = useUpdateLayer(fingerprintId)
  const deleteLayer = useDeleteLayer(fingerprintId)
  return (
    <LayersPanel
      layers={layers}
      onToggleVisibility={(id) => /* … */ updateLayer.mutate(/* … */)}
      onDelete={(id) => deleteLayer.mutate(id)}
      onClose={onClose}
    />
  )
}

// LayersPanel.tsx — props in → JSX out, testable, réutilisable, zéro hook de data
function LayersPanel({ layers, onToggleVisibility, onDelete, onClose }: LayersPanelProps) { /* … */ }
```

**Où ça s'applique** : les **`pages/`** sont des conteneurs. `InvestigationCasesPage` appelle `useInvestigationCases` + `useCreateInvestigationCase`, gère l'ouverture du dialog en `useState`, puis distribue les props : `investigationCases` / `isLoading` / `onAddClick` à `InvestigationCasesList`, et `onSubmit` (la mutation) à `InvestigationCaseCreateForm`. Les composants reçus (`InvestigationCasesList`, `LayerItem`, `CaseStatusBadge`) restent présentationnels. Quand un composant a besoin de data mais n'est pas une page, crée un `XxxContainer` à côté du présentationnel (comme `LayersPanelContainer` / `LayersPanel`).

**Repère** : si tu vois `useQuery`/`useMutation`/`apiClient` dans un fichier de `components/` qui n'est pas pensé/nommé « Container », c'est le signal d'extraire.

---

## DRY — le data-fetching ne se duplique pas

**Ce que ça veut dire ici** : un appel réseau est défini une fois dans le **service**, exposé une fois via un **hook**, et la **query key** vient d'une **factory** par feature. Pas de `apiClient.get(...)` recopié dans deux composants, pas de `['layers']` littéral éparpillé.

Anti-pattern (clé en dur + fetch inline dupliqué) :

```tsx
const { data } = useQuery({ queryKey: ['layers', id], queryFn: () => apiClient.get(`/layers?…`) })
// …et le même bloc recollé ailleurs, avec une clé légèrement différente → cache incohérent
```

Bon (factory + hook + service, le pattern réel de `hooks/useLayers.ts`) :

```ts
export const layerKeys = {
  all: ['layers'] as const,
  list: (fingerprintId: string) => [...layerKeys.all, fingerprintId] as const,
}
export function useLayers(fingerprintId: string | undefined) {
  return useQuery({
    queryKey: layerKeys.list(fingerprintId ?? ''),
    queryFn: () => LayerAPI.getAll(fingerprintId!),
    enabled: !!fingerprintId,
  })
}
```

**Où ça s'applique** : chaque feature a sa factory (`investigationCaseKeys`, `biometricImageKeys`, `layerKeys`) dans son fichier de hooks, et les mutations invalident via cette même factory (`queryClient.invalidateQueries({ queryKey: layerKeys.list(fingerprintId) })`). Le `queryFn` ne contient jamais l'URL en dur : il appelle le service (`LayerAPI.getAll`, `InvestigationCaseAPI.getAll`).

**Attention au sur-DRY** : la triade `useMutation` → `invalidateQueries` (+ éventuel `toast`) se répète dans `useCreateLayer` / `useUpdateLayer` / `useDeleteLayer`. C'est une duplication **assumée et lisible** ; n'invente pas un `useGenericMutationFactory` pour l'effacer (voir YAGNI). DRY vise la logique métier qui doit rester cohérente (URL, query key, shape), pas trois lignes de plomberie quasi identiques mais qui peuvent diverger.

---

## KISS — petits composants, hooks ciblés

**Ce que ça veut dire ici** : un composant fait une chose et tient sur un écran. Quand un fichier mélange data + état local + gros JSX, on découpe — un sous-composant présentationnel et/ou un hook — plutôt que d'empiler les `useState` et le balisage.

Anti-pattern : un fichier d'environ 250 lignes qui charge la data, gère six `useState`, le drag, le zoom, les filtres ET tout le JSX.

Bon (découper par responsabilité, comme dans `biometric-image/`) : le JSX de chaque élément vit dans son composant (`LayerItem`, `FilterSlider`, `ZoomControls`, `CaseStatusBadge`), et l'état d'UI complexe est extrait dans un hook : `useComparisonWindow` (panneau / zoom / visibilité / sélection regroupés et exposés proprement), `useCanvasView` (zoom / pan), `useCreateInvestigationCaseForm` (form + erreur de soumission).

**Où ça s'applique** : dans `components/`, préfère plusieurs petits fichiers à un mastodonte. Dès qu'un composant accumule une grosse vingtaine de lignes de logique non-UI, demande-toi si elle ne devrait pas partir dans un hook. Un hook custom n'est pas réservé au réseau : `useComparisonWindow` et `useCreateInvestigationCaseForm` montrent qu'on extrait aussi l'état d'UI et la logique de formulaire.

---

## YAGNI — pas d'abstraction prématurée

**Ce que ça veut dire ici** : on code pour le besoin réel d'aujourd'hui, pas pour un futur supposé. Pas de couche d'indirection « au cas où », pas de hook ultra-générique paramétré pour des variantes inexistantes, pas de barrel `index.ts` exhaustif tant qu'il ne sert personne.

Anti-pattern :

```ts
// un "moteur" générique pour un seul type d'entité aujourd'hui
function createCrudHooks<T>(resource: string, opts: HugeOptionsObject) { /* 120 lignes config-driven */ }
```

Bon (un hook explicite par usage réel) : `useBiometricImages`, `useDeleteBiometricImage`, `useUploadBiometricImage`. C'est plus de fichiers, mais chacun est lisible, typé précisément, et facile à faire diverger (l'upload accepte des `options.onSuccess`, le delete non) sans casser les autres.

**Où ça s'applique** :
- `services/` : `InvestigationCaseAPI` n'expose que `create` / `getAll` / `getById` — exactement ce qui est consommé.
- `hooks/` : un hook par opération concrète.
- Les barrels : `biometric-image/index.ts` n'exporte que le strict nécessaire et `investigation-case/index.ts` est vide — on ne crée pas un barrel exhaustif tant que personne n'importe la slice.

Le bon moment pour factoriser, c'est à la **3ᵉ** répétition d'un vrai besoin, pas à la 1ʳᵉ.

---

## SOLID, version front (l'essentiel applicable)

- **Single-responsibility** : déjà couvert — 1 fichier = 1 raison de changer (présentation ≠ fetch ≠ orchestration). C'est le principe SOLID le plus structurant ici.
- **Open/closed & substitution** : un composant présentationnel est ouvert à l'extension par ses **props** (callbacks `onDelete`, `onToggleVisibility`) sans qu'on le modifie ; deux conteneurs peuvent réutiliser le même `LayersPanel`.
- **Dependency inversion** : les composants dépendent d'**abstractions** (le service `LayerAPI`, le hook `useLayers`), pas de `apiClient` directement. Si l'implémentation du transport change, seul le service bouge.
- *(L'interface segregation a peu de prise en TSX ; ne force pas une analogie artificielle.)*

---

## Checklist d'auto-revue (avant de pousser)

- [ ] Aucun `apiClient`/axios hors de `services/`.
- [ ] Aucun `useQuery`/`useMutation` dans un composant de `components/` non pensé comme conteneur.
- [ ] La query key vient d'une factory de feature, pas d'un tableau littéral en dur.
- [ ] Le composant présentationnel ne reçoit que `data` + callbacks ; il est utilisable sans réseau.
- [ ] Le code transversal est dans `shared/`, pas copié dans la feature ; aucun import cross-feature (le partagé passe par `shared/`).
- [ ] Pas d'abstraction « au cas où » : chaque hook/composant créé sert un usage réel existant.
- [ ] Un god-component (fetch + état + gros JSX) a été découpé en hook(s) + sous-composant(s).

> Pour le nommage exact des fichiers, le détail de la stack, l'i18n FR-only, les formulaires Zod et le workflow Git : voir **`AGENTS.md`** (racine du repo). Ce skill ne les redéfinit pas.
