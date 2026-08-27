# ADR-0003 — Le choix d'un compte du service se fait par une liste cherchée côté serveur

- **Statut** : proposé
- **Date** : 2026-08-27

## Contexte

Désigner l'opérateur d'une affaire (L1-9) demande de choisir un compte parmi ceux du service. La
première version posait un `Select` rempli d'une seule page de comptes. Deux choses la condamnent :
le back plafonne `limit` à 100 — au-delà la requête part et revient en 400 — et une liste de
plusieurs dizaines de noms se parcourt au lieu de se lire. La même question revient bientôt deux
fois, pour désigner un vérificateur (L8-3) et un destinataire (L2-2).

Le serveur, lui, sait déjà chercher : `GET /api/users` accepte `search`, qui filtre sur le nom, le
prénom et le matricule, et rend une enveloppe paginée dont `meta.hasNextPage` dit que la page ne
montre pas tout. Rien à ajouter côté API.

Le système de composants n'a pas de liste cherchable. `radix-ui`, sur lequel repose l'essentiel de
`shared/ui/`, n'en fournit pas : son `Select` ne sait pas héberger de champ de saisie, seulement une
frappe rapide qui saute à l'entrée correspondante. `@base-ui/react`, déjà une dépendance du dépôt —
le `Button` en vient — expose un `Combobox`.

## Décision

Ajouter une primitive `shared/ui/combobox.tsx` par-dessus le `Combobox` de `@base-ui/react`, habillée
des mêmes classes que le `select` pour que rien ne jure, et l'utiliser dans un composant de feature,
`OperatorPicker`, qui porte la recherche.

La recherche est celle du serveur : `filter={null}` désarme le filtrage interne de la primitive, la
saisie part en différé (`useDebouncedValue`) dans le `search` de `useServiceUsers`, vingt comptes par
page, et la requête ne se déclenche qu'une fois le panneau ouvert. Quand `meta.hasNextPage` dit que
le serveur en a trouvé davantage, une ligne invite à préciser la recherche plutôt que d'offrir une
pagination dans un panneau déroulant.

Le compte déjà désigné ne figure pas parmi les propositions — c'est celui qu'on remplace — mais son
nom reste affiché sur le champ fermé, porté par les enfants de `Combobox.Value` et par
`itemToStringLabel`, qui n'exige pas que la valeur existe dans la liste.

Deux contraintes de cohabitation avec les boîtes de dialogue Radix se décident ici, et se tiennent
partout où cette primitive servira :

Le panneau se pose **dans** le contenu de la boîte de dialogue (`Combobox.Portal container={…}`).
Posé sur `body`, il se retrouverait `aria-hidden` et privé d'événements de pointeur : une boîte de
dialogue Radix modale masque tout ce qui n'est pas son contenu et coupe `pointer-events` sur le
corps du document.

La touche Échap est retenue sur le contenu de la boîte de dialogue tant que le panneau est ouvert.
Radix écoute Échap en phase de capture, avant la primitive : sans cela, la première pression
refermerait le formulaire et les corrections en cours au lieu de la liste. Le panneau restant monté
après sa fermeture, la présence seule ne suffit pas — c'est `[data-open]` qui distingue.

## Conséquences

- ✅ Un service de n'importe quelle taille se choisit à la frappe, sans que le front ait à charger
  tout l'annuaire, et sans toucher au back.
- ✅ Les deux prochaines désignations — vérificateur, destinataire — reprennent la primitive.
- ⚠️ Les panneaux du front reposent désormais sur deux bibliothèques : Radix pour le `select` et les
  boîtes de dialogue, `@base-ui/react` pour cette liste. Leurs attributs d'état diffèrent
  (`data-highlighted` et `--anchor-width` ici, `data-state` et `--radix-*` là), ce que le wrapper
  absorbe mais qu'il faut savoir en le modifiant.
- ⚠️ La liste ne pagine pas : passé vingt correspondances, elle demande de préciser. C'est un choix
  d'usage, pas une limite technique — `meta` porte de quoi paginer si le besoin se confirme.

## Alternatives écartées

- **Garder un `Select` rempli d'une page de comptes** — le back plafonne à 100, et une liste longue
  ne se cherche pas.
- **`cmdk`, ou une liste cherchable écrite à la main** — une troisième bibliothèque de plus, ou
  l'accessibilité d'un composant de saisie à réécrire.
- **`Autocomplete` de `@base-ui/react`** — il ne retient pas de valeur choisie ; c'est un champ libre
  avec suggestions, pas un choix parmi des comptes.
