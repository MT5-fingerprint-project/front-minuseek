# ADR-0002 — Le profil de l'appelant et l'en-tête des service de police vivent dans `shared/`

- **Statut** : accepté
- **Date** : 2026-08-27

## Contexte

La page « Utilisateurs » est le deuxième écran de **niveau Service** du front, après
la liste des affaires. Deux besoins transverses apparaissent avec elle.

Le premier est le **profil de l'appelant**. `useAuth()` ne rend que le `preferred_username` du jeton
Keycloak et la fonction de déconnexion : le rôle, lui, ne s'y trouve pas. C'est `GET /api/me` qui le donne, et il faut le connaître à deux endroits — la page, pour ne pas afficher un écran de gestion à un opérateur, et l'en-tête, pour ne pas lui proposer la navigation qui y mène.

Le second est **l'en-tête**. `CasesHeader` portait le logo et le menu de compte, mais vivait dans `features/investigation-case/components/`. La page « Utilisateurs » en a besoin à l'identique, et `features/users/` ne peut pas l'importer : `AGENTS.md` interdit qu'une feature dépende d'une autre.
Les prochaines pages de niveau service poseront la même question.

## Décision

Le profil de l'appelant est un service partagé. `GET /api/me` s'appelle depuis
`shared/services/CurrentUserAPI.services.ts`, s'expose par `shared/hooks/useCurrentUser.ts` avec sa fabrique de clés, et son modèle de lecture `UserProfile` est déclaré dans `shared/types/user.ts` — c'est le même que rend chaque ligne de `GET /api/users`, que `features/users/` étend d'un état.

`CasesHeader` devient `shared/components/AppHeader.tsx`. Il garde son logo, qui devient le retour à
l'accueil du service, et son menu de compte, qui se limite à la déconnexion. Entre les deux il gagne
une barre de navigation de niveau service, affichée au seul responsable puisque lui seul a plus d'une
destination. Une nouvelle page de niveau service s'y accroche sans faire dépendre deux features l'une
de l'autre.

Le masquage d'une entrée de menu et le message qui remplace la liste pour un compte non responsable
sont du **confort de navigation, pas de la sécurité** : celle-ci est côté serveur, dans les routes de
L1-6.

## Conséquences

- ✅ `features/users/` n'importe rien d'une autre feature ; la dépendance va bien des features vers `shared/`.
- ✅ Le rôle de l'appelant se lit d'un seul endroit, avec une seule requête mise en cache par React Query.
- ⚠️ `AppHeader` consomme un hook de données alors qu'il vit dans `components/`. C'est assumé : c'est
  du chrome connecté, qui lisait déjà le contexte d'authentification ; en extraire un conteneur pour
  un seul booléen coûterait plus qu'il ne rapporte.
- ⚠️ `shared/` gagne un dossier `services/`. Il n'en avait pas, faute d'appel réseau transverse ; la
  règle « seul `services/` parle à `apiClient` » vaut aussi pour la slice partagée.

## Alternatives écartées

- **Laisser `useCurrentUser` dans `features/users/`** — le menu de compte, qui vit ailleurs, aurait dû
  l'importer : c'est exactement l'import inter-features que les conventions interdisent.
- **Laisser `CasesHeader` dans `investigation-case/` et lui faire porter les entrées des autres pages** —
  la feature « affaire » serait devenue le point de passage obligé de toute navigation de service.
- **Lire le rôle dans le jeton Keycloak** — le rôle métier est une colonne de notre base, pas une
  revendication du jeton ; le lire côté client donnerait une valeur que le back n'utilise pas.
