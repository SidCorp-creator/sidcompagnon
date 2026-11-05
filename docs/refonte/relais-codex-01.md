# Relais n° 1 — Claude Code → Codex (5 nov. 2026)

Contexte : Sid lance une refonte de l'identité visuelle et de l'ergonomie de Sid'compagnon (Sid'agenda, Sid'fit, Sid'note).
Lis `~/sidcompagnon/docs/refonte/README.md` (organisation, responsables) et `CLAUDE.md` (mémoire du projet).
Le vrai dépôt est `~/sidcompagnon` (le dossier `~/projets/sidcompagnon` où nos panneaux ont démarré est vide).

Rôles de départ : Claude Code pilote l'exploration graphique (directions, logos, maquettes). Codex pilote l'analyse technique,
le système de composants, l'intégration et les vérifications. Chacun relit l'autre.

## Ton espace
- Worktree `~/sidcompagnon-codex`, branche `refonte-tech` (créée depuis `main` 3d783f9). N'écris pas dans `~/sidcompagnon`.
- Tu es responsable de `docs/refonte/audit-technique.md` (écris-le dans ton worktree ; je le récupérerai par `git` ou tu me le signales).
- Pas de `git push`, pas de mise en ligne, pas de changement Supabase.

## T2 — Audit technique (résultat attendu : `docs/refonte/audit-technique.md`)
1. **Couches de style** : `site/app.css`, `design.css` (v42 « Éditorial »), `ident.css` (v74, 9 identités par fonction), `fonts.css`.
   Taille de chaque couche, nombre de règles, `!important`, sélecteurs qui se surchargent, styles morts (ex. `PALETTES` cachées, `data-fx` « Sobre »).
2. **Jetons réels** : liste des couleurs, rayons, ombres, tailles de police, espacements effectivement utilisés (avec nombre d'occurrences).
   Lesquels sont des variables CSS, lesquels sont en dur.
3. **Polices** : fichiers de `site/fonts/`, poids, où chacune est utilisée, coût en Ko.
4. **Composants** : boutons, champs, pastilles, fenêtres (sheets), listes, cartes, barre du bas, en-tête d'app. Pour chacun : variantes existantes,
   où il est défini (CSS + `app/src/*.tsx` + `app/src/shell/*.js`), incohérences visibles.
5. **Icônes et logos** : `site/icons/`, `ICS`, emojis utilisés comme icônes, PNG générés.
6. **Animations** : liste (intro, `appOutro`, transitions, chargements), durées, gestion de `prefers-reduced-motion` et du réglage « réduire les animations ».
7. **Contraintes à préserver** : pièges iPhone (CLAUDE.md), `[hidden]`, CSP de `site/vercel.json`, `app.js` généré, îlots React, parité FR/EN/NL, `sw.js`/`CACHE`.
8. **Ta recommandation** : comment remplacer les 3 couches par une base unique sans casser l'app (ordre, risques, tests à ajouter).

Sépare toujours ce qui est **mesuré** de ce qui est **supposé**.

## T3 — Captures « avant » (résultat attendu : `docs/refonte/avant/*.png` + `avant/index.md`)
- Remets en marche Playwright (méthode dans `docs/passation.md` : bibliothèques Chromium extraites sans sudo ; un Chromium existe déjà dans `~/.cache/ms-playwright/chromium-1140`).
- Écrans : arrivée/connexion, présentation, accueil Sid'compagnon, Réglages ; Agenda (jour, mois, liste), Tâches, Focus ;
  Musculation (avec programme et séance remplie), Nutrition (journée remplie, profil, menu), Graphiques ; Notes (liste, dossier, éditeur),
  Documents, Mots de passe (verrouillé / ouvert).
- Formats : iPhone 13 (390 px) et ordinateur (1440 px), sombre (défaut) et clair. Des données réalistes (pas vides) sur au moins un écran dense par app.
- Tu peux réutiliser les étapes de `tests/smoke.js` dans un script à part (ex. `tests/captures-refonte.js`) ; ne modifie pas `smoke.js`.

## Critères de réussite
- Chaque affirmation de l'audit pointe un fichier (`chemin:ligne`) ou une mesure.
- Les captures couvrent la liste ci-dessus ; les écrans manquants sont signalés, avec la raison.
- Quand tu as fini (ou si tu bloques), envoie-moi un message par `tmux-bridge message claude '…'`.
- Si tu n'es pas d'accord avec l'organisation, dis-le : elle peut changer.
