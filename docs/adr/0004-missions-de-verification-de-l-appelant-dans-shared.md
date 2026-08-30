# ADR-0004 — Les missions de vérification de l'appelant se lisent depuis `shared/`

- **Statut** : accepté
- **Date** : 2026-08-29

## Contexte

Un opérateur reçoit la vérification d'un dossier qu'il n'a pas ouvert : il ne le trouverait pas dans
la liste générale, il n'en connaît ni le numéro ni l'existence. Il lui faut une entrée de navigation
« Dossiers à vérifier », et cette entrée ne doit apparaître que s'il a effectivement une mission en
cours — sinon elle promet un écran vide à tout le service.

L'entrée vit dans `AppHeader`, c'est-à-dire dans `shared/`. Or les missions de vérification sont une
notion de la feature « affaire », et `AGENTS.md` interdit à `shared/` de dépendre d'une feature.
C'est exactement la situation qu'ADR-0002 a tranchée pour le profil de l'appelant.

## Décision

**Ce que l'appelant s'est vu confier se lit depuis `shared/`, comme ce qu'il est.**
`GET /api/verifications?mine=true` s'appelle depuis `shared/services/VerificationAPI.services.ts`,
s'expose par `shared/hooks/useMyVerifications.ts`, et le modèle de lecture `CaseVerification` est
déclaré dans `shared/types/verification.ts`. La fabrique de clés `verificationKeys` y vit aussi :
c'est elle qui relie la lecture partagée et les lectures de la feature, qui invalide l'une après une
mutation de l'autre.

**Ce qui est propre à une affaire reste dans la feature.** Lister les vérifications d'un dossier et
en confier une — avec ses refus traduits — restent dans
`features/investigation-case/services/VerificationAPI.services.ts` : ce sont des gestes de la fiche
d'affaire, pas du chrome.

**L'entrée de navigation est un confort, pas une sécurité.** Un compte sans mission qui saisit
l'adresse à la main obtient une liste vide, pas une erreur : le serveur ne lui rend que ses propres
missions, et c'est lui seul qui en décide.

## Conséquences

- ✅ `AppHeader` n'importe rien d'une feature ; la dépendance va bien des features vers `shared/`.
- ✅ Une seule requête en cache alimente l'entrée de navigation, la page « Dossiers à vérifier » et,
  plus tard, le bandeau du comparateur.
- ⚠️ Le contrat de lecture d'une vérification est désormais partagé : le faire évoluer touche les deux
  côtés. C'est le prix de l'entrée de navigation, et il est le même que pour `UserProfile`.
- ⚠️ La navigation de niveau service, jusqu'ici réservée au responsable, s'affiche maintenant aussi à
  un opérateur — avec cette seule entrée.

## Alternatives écartées

- **Faire importer `AppHeader` depuis `features/investigation-case/`** — l'import interdit, et le
  premier pas vers un cycle entre le chrome et une feature.
- **Passer les entrées de navigation en propriété depuis chaque page** — chaque page de niveau service
  aurait dû connaître et interroger les missions de l'appelant.
- **Afficher l'entrée à tout le monde** — elle mènerait, pour la plupart des comptes, à un écran vide.
