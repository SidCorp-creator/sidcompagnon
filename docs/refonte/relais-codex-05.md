# Relais n° 5 — Claude Code → Codex : extension d'Élan à toute l'app (T16)

Date : 5 nov. 2026. **Sid a essayé le premier parcours sur son iPhone** (aperçu `refonte-tech`, commit 87897d9) : « ça marche bien ». On étend maintenant la charte à toute l'app.
Même cadre qu'avant : ton worktree, branche `refonte-tech`, toi seul modifies `site/` et `app/`. Pas de push (je m'en charge à la demande de Sid). Rien sur `main`.

## Décisions de Sid (5 nov.), à appliquer

1. **Nutrition** : un seul bouton principal « Ajouter un repas ». Il ouvre une feuille avec les 5 façons d'ajouter : texte, Photo, Galerie, « Dis-le à Claude » et saisie manuelle. **Aucune façon n'est retirée.** La journée et les macros passent en tête de l'écran. Les valeurs de macros ne doivent plus être coupées (défaut relevé dans l'audit, § 4.6).
2. **Conversations Claude** : leurs réglages ne sont plus que dans l'app concernée, derrière le bouton Claude. On les retire de Réglages. La donnée `aiConv` est inchangée, et chaque réglage reste accessible.
3. Rappel (déjà validé) : le bouton Claude remplace le champ Claude en tête de Musculation, Nutrition et Notes, comme dans l'Agenda.

Toute autre suppression ou tout autre changement de comportement : **demande-moi d'abord**. Je le soumets à Sid.

## Lots, dans l'ordre, avec une revue visuelle de ma part après chaque lot

| Lot | Écrans | Points d'attention |
|---|---|---|
| A | Sid Journée : Tâches, Focus | Tâches : catégories, en suspens, glisser pour ordonner, vue calendrier. Focus : progression = temps fait / durée totale (rebond seulement à la fin d'un cycle), Spotify inchangé |
| B | Sid Forme : Musculation, Nutrition, Graphiques | Musculation : séries comme dans la maquette (faite = `--app`/`--on-app`, suivante = contour), bouton « Valider la série », chrono ; texte foncé sur orange partout. Nutrition : décision 1. Graphiques : couleurs de série issues des jetons, jamais une couleur d'app d'une autre app |
| C | Sid Coffre : Notes, Documents, Mots de passe | Éditeur riche, notes secrètes, lecteur PDF, coffre (code à 5 chiffres, Face ID) : **aucun changement de comportement ni de chiffrement**. Uniquement l'apparence et la hiérarchie |
| D | Suite : connexion, présentation, Réglages, Installer, fenêtres (ajout rapide, actions, sauvegarde, code…) | Réglages : décision 2 ; une section par sujet, lignes de 56 px |
| E | Nettoyage | Glyphes Unicode → icônes SVG au trait ; « Ajouter » partout (charte § 5) ; retrait des 9 polices et de leurs fichiers quand plus rien ne les utilise ; regroupement dans `app.css` et retrait des liens `design.css`/`ident.css` (ta proposition de migration) ; montée de version et cache `sw.js` |

Pour chaque lot : React et version de secours ; 390, 320 et 1280 px ; clair et sombre ; FR, plus EN et NL sur au moins un écran par lot ; contenu long (titre de 80 caractères, 30 éléments) ; captures dans `docs/refonte/apres/` (mêmes états que `avant/` pour ces écrans) ; ajout des parcours dans `tests/elan.js`.

## Critères de réussite (à la fin du lot E)

- `npm test` vert. `tests/smoke.js` complet : aucun échec nouveau par rapport au rouge connu de `main`, avec la comparaison avant/après.
- Captures « après » pour les 21 états de `avant/`, plus les nouveaux états (feuille repas, réglages Claude dans l'app).
- Plus aucune trace des 9 identités, d'`ident.css`, des 9 polices retirées ni de glyphes Unicode servant d'icônes (relevé par recherche dans le code).
- Données, chiffrement, sauvegarde, `mcp` et clés : identiques. Ajoute une assertion avant/après sur un jeu de données complet, comme tu l'as fait pour `data.types`.
- Une section « Codex — T16 lot X » dans `revues.md` à chaque lot.

Préviens-moi à la fin de chaque lot : je fais la revue visuelle avant que tu passes au suivant.
