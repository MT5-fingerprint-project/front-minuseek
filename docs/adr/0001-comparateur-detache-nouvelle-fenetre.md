# ADR-0001 — Comparateur « Empreintes » détachable dans une fenêtre navigateur

- **Statut** : accepté
- **Date** : 2026-07-24
- **Décideurs** : équipe front-minuseek

## Contexte

Le comparateur (`/:slug/affaires/:id/comparaison`) affiche deux panneaux côte à côte
dans un `ResizablePanelGroup` : **Traces** (gauche) et **Empreintes** (droite),
chacun rendant un `BiometricImageCanvas` (react-konva). La barre de titre de chaque
fenêtre portait un bouton « double fenêtre » (`windowOn`) en **placeholder sans action**.

Besoin produit : pouvoir sortir le panneau **Empreintes** dans une **fenêtre
navigateur séparée** pour l'exploiter sur un second écran, pendant que la fenêtre de
base garde les **Traces** en pleine largeur. À la fermeture de la popup, le panneau
Empreintes doit réapparaître dans la fenêtre de base.

Contraintes :
- Aucun store global (Zustand/Redux/Context) dans le repo ; l'état de layout vit dans
  des hooks locaux (`useComparisonWindow`).
- L'auth passe par `localStorage.accessToken` + intercepteur `apiClient`.
- Le back n'expose pas de mécanisme temps réel ; la comparaison IA part de la trace
  sélectionnée dans le panneau Traces.

## Décision

1. **Ouvrir la popup via `window.open` sur une route dédiée** de la même origine :
   `/:slug/affaires/:id/comparaison/empreintes`, montée sous `CaseComparisonLayout`
   (donc derrière `TenantAuthBoundary`). Même origine ⇒ `localStorage.accessToken`
   partagé, l'auth fonctionne sans plomberie supplémentaire.
2. **Deux comparateurs indépendants, sans synchronisation live.** La popup est un
   **document séparé** : elle rebootstrape `main.tsx` avec son propre
   `QueryClientProvider` et son propre `useComparisonWindow`. Aucun `BroadcastChannel`,
   `postMessage` ni cache partagé entre les fenêtres.
3. **La fenêtre de base pilote l'ouverture/fermeture** via un hook réutilisable
   `useDetachedWindow` (`shared/hooks/`) : il conserve la référence `Window`, expose
   `isOpen`, et **détecte la fermeture** (croix de l'OS **ou** `window.close()` côté
   popup) par polling de `window.closed`. Quand `isOpen` est vrai, la base masque le
   panneau Empreintes et Traces occupe toute la largeur ; à la fermeture, le panneau
   est restauré. La popup est refermée si l'hôte est démonté.
4. **Un seul panneau détachable : Empreintes.** Le bouton n'est rendu que si
   `onToggleDetach` est fourni (icônes `windowOn`/`windowOff`, i18n
   `common.window.detachWindow`/`attachWindow`). Le placeholder est supprimé.
5. **Réutilisation via `ComparisonWorkbench`** : le contenu présentationnel (titre +
   carousel + canvas + footer) est extrait de `ComparisonWindow` et partagé entre le
   panneau redimensionnable et la vue détachée plein écran.

## Conséquences

- ✅ Zéro dépendance nouvelle ; auth partagée gratuitement (même origine).
- ✅ `shared/hooks/useDetachedWindow` générique, réutilisable pour d'autres détachements.
- ✅ Pas de duplication : `ComparisonWorkbench` sert les deux rendus.
- ✅ Restauration robuste (bouton **et** fermeture OS).
- ⚠️ **Pas de synchronisation d'état** entre les deux fenêtres (sélection, calques,
  zoom, comparaison) : c'est volontaire (« comparateurs indépendants »). Si un besoin de
  sync apparaît, il faudra un `BroadcastChannel` et un nouvel ADR.
- ⚠️ **Comportement navigateur non contrôlable** : `window.open` (avec `popup` +
  géométrie) ouvre une vraie fenêtre sur Chrome/Safari/Firefox/Edge, mais **Arc**
  (et un réglage Safari « toujours en onglet ») force un onglet. Rien à corriger côté code.
- ⚠️ `window.close()` de la popup ne fonctionne que si la fenêtre a été ouverte par
  script ; un accès direct à l'URL rend le bouton « fermer » inopérant (cas hors flux).

## Alternatives écartées

- **`BroadcastChannel` / `postMessage` + état sérialisé partagé** — écarté : sync live
  non demandée (« comparateurs indépendants »), complexité et bugs de désynchro évités.
- **Store global (Zustand) lifté hors des hooks** — écarté : aucun store dans le repo,
  et ne résout pas le partage cross-fenêtre (chaque document a son propre JS).
- **Nouvel onglet plutôt que fenêtre** — écarté : le besoin est une fenêtre déplaçable
  sur un second écran ; on force le mode fenêtre via les `features` de `window.open`.
