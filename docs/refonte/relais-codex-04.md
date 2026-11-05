# Relais n° 4 — Claude Code → Codex : fondations Élan + premier parcours (T13)

Date : 5 nov. 2026. **Sid a validé la charte v1 et autorise l'application** (« oui tu peux appliquer »).
Rien n'est poussé ni fusionné dans `main`, et rien n'est mis en ligne sans un nouvel accord de Sid.

## Résultat attendu

Dans ton worktree (`~/sidcompagnon-codex`, branche `refonte-tech`), l'app tourne en local avec :

**A. Fondations (pour toute l'app)**
1. **Polices** : Barlow 400/500/600/700 et Barlow Condensed 600/700/800 droites + 700/800 italiques, en woff2 dans `site/fonts/` (latin + latin-ext), déclarées dans `site/fonts.css` avec `font-display: swap`. Les 9 autres familles restent dans le dépôt tant que des écrans non migrés les utilisent.
2. **Jetons** de la charte § 4 et § 11 : thème clair/sombre, `--app --on-app --app-ink --app-soft` posés sur `[data-app]` (Journée / Forme / Coffre) **et sur chaque carte colorée**, états `--ok --warn --err`, échelle d'espacement, rayons, cibles, durées. Alias provisoires vers les anciens noms, comme tu l'as proposé.
3. **Peau Élan** dans `design.css`, sans empiler de `!important`. `ident.css` ne s'applique plus.
4. **Retrait du réglage « Style des fonctions : Unique / Sobre »** et des 9 identités par fonction (validé par Sid). La préférence enregistrée est ignorée sans erreur, et aucune donnée n'est effacée.
5. **Noms affichés** : Sid Journée, Sid Forme et Sid Coffre en FR, EN et NL (libellés de `GROUPS`, `INTRO_NAME`, `CONV_TITLE`, titres de page), d'après ton inventaire T11. **Rien de ce que T11 classe « à préserver » ne bouge** (mcp, clés, `sidnote-*`, HKDF, sauvegarde, `SIDFIT`).
6. **Icônes** : les fichiers prêts sont dans `docs/refonte/logos/export/`. Ils remplacent les homonymes de `site/` : `logo-*.png`, `icon-*.png`, `apple-touch-icon.png`, `maskable-512.png` et `favicon.svg`. Les tuiles d'app 128 px et les SVG remplacent `site/icons/*` sous les mêmes noms qu'aujourd'hui (agenda→journee, fit→forme, note→coffre, home→suite), ou bien tu mets les références à jour. `manifest.webmanifest` : nom « Sid'compagnon » et couleurs `#121212`. Pense à monter la version du cache dans `sw.js`.

**B. Premier parcours complet, conforme à la charte § 6 à § 10**
1. **Accueil** : salutation et date, puis 3 cartes compactes (bandeau de 56 px avec logo, nom en italique et phrase ; chiffre clé ; puces des 3 fonctions). Les 3 apps et leurs fonctions doivent se voir **sans défiler sur 390 × 844**. Le message « Bienvenue » ne doit plus recouvrir une carte.
2. **Sid Journée · Agenda** : bandeau (bouton Toutes les apps, logo, nom, rôle, **bouton Claude**, titre « Agenda », progression du jour), semaine, **un seul** bouton principal « Ajouter une activité », journée en liste, barre du bas à 3 onglets. Le bandeau passe en compact quand on fait défiler, quand le clavier est ouvert ou sous 700 px de haut.
3. **Bouton Claude** : il ouvre la conversation de l'app en cours, celle qu'ouvrait le champ jusqu'ici. Le champ « Ton activité… / Planifier » et le bloc « Conversation Claude » quittent le haut de l'Agenda. **Aucune fonction n'est perdue** : on peut toujours décrire une activité à Claude depuis la conversation.
4. **Ajouter une activité** : feuille du bas, champs avec libellé visible (titre, date, début et fin, rappel), bouton principal en bas. Elle doit marcher clavier ouvert à 390 et à 320 px.
5. **Confirmation** : message bref « Activité ajoutée » avec « Annuler » ; la ligne nouvelle apparaît sur `--app-soft` ; le chiffre du bandeau se met à jour (défilement 260 ms, sans rebond) et la barre se recale sans rebond. *(Corrigé après la question de Codex : ajouter n'est pas progresser, voir charte § 10.)*
6. **Retour à l'accueil** : le chiffre de la carte Sid Journée est à jour.
7. Le reste de l'app (Tâches, Focus, Sid Forme, Sid Coffre, Réglages) doit **rester utilisable**, avec les jetons, les polices et les noms. Leur mise en page fine viendra au lot suivant.

## Fichiers de référence

- `docs/refonte/charte.md` (la règle), `.claude/skills/sid-charte/SKILL.md` (résumé ; lien `.agents/skills/sid-charte`).
- Maquette : `docs/refonte/maquettes/charte.html` (écrans Accueil, Agenda, bandeau compact), https://claude.ai/artifact/Sii7bNVqMiRc7hNDKNer6P.
- Ton `audit-technique.md` (couches, T11) et les captures `avant/`.

Je recopie dans ton worktree : `.claude/skills/`, `.agents/skills/`, `docs/refonte/logos/` et ce relais.

## Contraintes

- `site/app.js` est généré : modifie `app/src/shell/*.js`, puis `npm run build`. React et version de secours (`window.__noIslands`) doivent marcher tous les deux.
- Pièges iPhone de `CLAUDE.md`. CSP inchangée. Aucune modification de Supabase, ni de la fonction `mcp`, ni des données.
- Pas de push, pas de fusion. Les fichiers de `docs/refonte/` dont je suis responsable (README, charte, audit-produit, directions) : propose tes changements par message.
- Si une règle de la charte est impossible ou coûteuse à tenir, signale-le-moi **avant** de t'en écarter. On tranche ensemble et je mets la charte à jour.

## Critères de réussite

- `npm test` vert. `tests/smoke.js` : pas d'échec nouveau par rapport au rouge connu de `main`, avec la liste avant/après.
- Captures « après » des mêmes états que `avant/` pour l'accueil, l'Agenda, la feuille d'ajout et la confirmation : iPhone 390 et ordinateur 1280, clair et sombre, plus 320 px pour la feuille, dans `docs/refonte/apres/`.
- Aucun débordement horizontal, aucune erreur JS, focus visible au clavier, mouvement réduit respecté.
- Contrastes de la charte vérifiés sur le rendu réel : bandeaux, rôle, bouton Claude, puces.
- Une section « Codex — T13 » dans `revues.md` : ce qui est fait, les écarts à la charte, les risques et le résultat des tests.

Quand c'est prêt, préviens-moi. Je fais la revue visuelle sur captures et dans l'app qui tourne. Ensuite seulement : l'extension aux autres écrans.
