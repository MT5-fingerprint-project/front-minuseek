# Architecture Decision Records (ADR)

On consigne ici les **décisions structurantes** du repo : choix techno, trade-offs d'archi, contrats d'API, sécurité, modèle de données. Une décision « qui le mérite » = difficile à inverser, qui engage l'équipe, ou qu'un nouvel arrivant devrait pouvoir comprendre sans archéologie git.

## Règles
- Un fichier par décision : `NNNN-titre-en-kebab.md` (numéro incrémental, ex. `0001-...`).
- Partir de [`0000-template.md`](0000-template.md).
- Ne pas réécrire une décision passée : si elle change, créer un nouvel ADR et passer l'ancien en `Statut : remplacé par ADR-XXXX`.
- Les agents IA créent un ADR quand ils prennent ou proposent une telle décision (cf. « Directives agents » dans `AGENTS.md`).

## Index
- [ADR-0001 — Comparateur « Empreintes » détachable dans une fenêtre navigateur](0001-comparateur-detache-nouvelle-fenetre.md)
- [ADR-0002 — Le profil de l'appelant et l'en-tête de niveau service vivent dans `shared/`](0002-profil-courant-et-chrome-de-niveau-service-dans-shared.md)
- [ADR-0003 — Le choix d'un compte du service se fait par une liste cherchée côté serveur](0003-choix-d-un-compte-par-liste-cherchee-cote-serveur.md)
- [ADR-0004 — Les missions de vérification de l'appelant se lisent depuis `shared/`](0004-missions-de-verification-de-l-appelant-dans-shared.md)
- [ADR-0005 — Visite guidée de l'atelier avec `driver.js`](0005-visite-guidee-driver-js.md)
