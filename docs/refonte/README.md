# Refonte de l'identité — référence commune

Démarrée le 5 nov. 2026 à la demande de Sid. Ce dossier est la **seule source de vérité** de la refonte.
Claude Code et Codex le lisent avant toute intervention.

## Documents et responsables

Un document a un seul responsable : lui seul l'écrit. L'autre agent propose ses changements par message (tmux-bridge) ou dans son propre fichier.

| Fichier | Contenu | Responsable |
|---|---|---|
| `README.md` (ce fichier) | organisation, tâches, décisions, points ouverts | Claude Code |
| `audit-produit.md` | utilisateurs, écrans, parcours, problèmes d'usage observés | Claude Code |
| `audit-technique.md` | styles, composants, couches CSS, dette, contraintes, tests | Codex |
| `directions.md` | les 3 directions visuelles, comparaison, recommandation | Claude Code |
| `revues.md` | revues croisées, désaccords et leur résolution | chacun écrit **sa** section |
| `charte.md` + `logos/` | règles graphiques définitives | Claude Code (rédaction), Codex (jetons et composants) |

## Espaces de travail

| Agent | Dossier | Branche |
|---|---|---|
| Claude Code | `~/sidcompagnon` | `refonte-identite` |
| Codex | `~/sidcompagnon-codex` (worktree) | `refonte-tech` |

Rien n'est fusionné dans `main` ni mis en ligne sans l'accord de Sid. `main` = production (Vercel).

## Communication

- Canal réel : tmux, session `projet-sidcompagnon`, panneaux `claude` (%0) et `codex` (%1), messages `tmux-bridge message`.
- Un message compte comme un échange seulement s'il a reçu une réponse. Les échanges importants sont résumés dans `revues.md`.
- Chaque passage de relais précise : résultat attendu, fichiers, contraintes, décisions prises, critères de réussite.

## Étapes

1. Audit produit et technique, inventaire des outils (en cours)
2. Trois directions visuelles, avec maquettes comparables → **attendre le choix de Sid**
3. Charte, logos SVG, skill du projet
4. Fondations et composants partagés → un parcours complet → revue croisée → extension aux 3 apps
5. Vérification en fonctionnement, captures avant/après, livraison

## Tâches

| # | Tâche | Responsable | État |
|---|---|---|---|
| T1 | Audit produit (écrans, parcours, problèmes) | Claude Code | fait, confronté aux captures |
| T2 | Audit technique (couches CSS, jetons, composants, polices, tests) | Codex | fait (`audit-technique.md`, `inventaire-technique.json`, worktree Codex) |
| T3 | Captures « avant » de tous les écrans (mobile + ordinateur, clair + sombre) | Codex | fait : 84 PNG, 21 états × 4 (`avant/`, worktree Codex). `smoke.js` sur `main` inchangé : **rouge** (coffre/Face ID v38, PDF v44.7/v45/v65, refus CSP `unsafe-eval`), cause non isolée |
| T4 | Inventaire des skills et outils | Claude Code | fait (voir plus bas) |
| T5 | Trois directions visuelles + maquettes | Claude Code | fait : `maquettes/directions.html`, publiée en privé https://claude.ai/artifact/1f6mCyUKjyzXiGjfsNjad5 |
| T6 | Revue croisée des directions | Codex | fait ; corrections intégrées par Claude Code (voir `revues.md`) |
| T7 | Choix de la direction | **Sid** | tour 1 refusé (« aucune des 3 ») ; tour 2 : **F · Élan** choisie le 5 nov. |
| T8 | Tour 2 : trois nouvelles directions (`maquettes/directions-2.html`, https://claude.ai/artifact/ReGR1M4XdxZC4Ypu6ioqzZ) | Claude Code | fait |
| T9 | Revue croisée du tour 2, recentrée sur F après le choix de Sid | Codex | demandée (relais 03 + message du 5 nov.) |
| T10 | Charte F · Élan (`charte.md`, `logos/`, page https://claude.ai/artifact/Sii7bNVqMiRc7hNDKNer6P) | Claude Code (rédaction), Codex (jetons) | **validée par Sid le 5 nov.** (« oui tu peux appliquer ») |
| T11 | Inventaire des noms d'apps (1 475 occurrences, 121 fichiers ; mcp gelé) | Codex | fait (`audit-technique.md` § T11) |
| T12 | Skill du projet `.claude/skills/sid-charte/` (+ lien `.agents/skills/sid-charte`), source `charte.md` | Claude Code | fait |
| T14 | Export des logos aux formats de l'app (`logos/export/`) | Claude Code | fait |
| T13 | Fondations Élan + premier parcours : accueil → Sid Journée → ajouter une activité → retour (relais 04) | Codex (intégration), Claude Code (revue visuelle) | fait : v75.0 sur `refonte-tech`, 94 captures `apres/`, 14 écarts de la revue visuelle corrigés, palette des types révisée (`palette-types.md`), tests 15/15. Comparaison pour Sid : https://claude.ai/artifact/KXgkzSTGLPiQBSoSReF3vS |

## Outils et skills

| Outil / skill | Où | Rôle retenu |
|---|---|---|
| `frontend-design` (Anthropic, v1.1.1) | plugin Claude Code, installé mais pas activé | guide d'exploration graphique pour les maquettes. Ses préférences esthétiques passent après les objectifs de Sid (simplicité, lisibilité) |
| `webapp-testing` | absent des deux environnements | **non retenu** : `tests/smoke.js` (Playwright) couvre déjà ce besoin |
| Playwright + `tests/serve.js` (faux Supabase) | dépôt | vérification en fonctionnement et captures |
| `smux` / tmux-bridge | les deux | communication |
| Artifacts claude.ai | Claude Code | présenter les maquettes à Sid (privées) |
| Agents `.claude/agents/` (design-system, ux-mobile, qa-tests…) | Claude Code | consignes de domaine existantes, à mettre à jour après le choix |
| Skill du projet (à créer après le choix) | `.claude/skills/` + `.agents/skills/` | même source : `docs/refonte/charte.md` |

## Décisions

| Date | Décision | Raison |
|---|---|---|
| 5 nov. | Refonte sur branches séparées, aucune mise en ligne avant validation | `main` est déployé automatiquement chez Sid et ses proches |
| 5 nov. | Les 3 directions partagent la même structure simplifiée ; seule l'identité varie | comparer des identités, pas des ergonomies différentes |
| 5 nov. | Recommandation de Claude Code : A · Signal (à confirmer après revue de Codex, décision à Sid) | forme = identité, lisible en 16 px et en une couleur, 1 police |
| 5 nov. | **Sid refuse les 3 directions du tour 1.** Motif : « il y a un manque de compréhension sur qui sert à quoi ». Il veut **changer franchement** ; références : **Revolut / Strava** | les signes abstraits (forme, lettre, soleil) ne disent pas la fonction de chaque app |
| 5 nov. | **Sid choisit F · Élan** : « l'identité que je préfère et qui me parle le plus » | bandeau plein par app, titre penché, progression du jour |
| 5 nov. | Noms : **Sid Journée** (agenda, tâches, focus), **Sid Forme** (musculation, nutrition, graphiques), **Sid Coffre** (notes, documents, mots de passe). La suite reste **Sid'compagnon** | Sid : nommer d'après le rôle. Le connecteur Claude garde le nom « Sid'note » (ne pas renommer) |
| 5 nov. | Retrait des 9 identités par fonction et du réglage « Unique / Sobre » | validé par Sid ; une seule apparence par app |
| 5 nov. | Claude : bouton fixe, même place dans les 3 apps, à la place du champ en tête des écrans | validé par Sid ; l'action principale passe en tête, aucune fonction retirée |
| 5 nov. | Nouvelle icône d'écran d'accueil (réinstallation possible) | validé par Sid |
| 5 nov. | **Charte v1 validée par Sid**, application autorisée (branches séparées, pas de mise en ligne) | — |
| 5 nov. | `site/` n'est modifié que par Codex (branche `refonte-tech`) pendant l'intégration ; Claude Code fournit les fichiers (logos, skill) et fait la revue | éviter deux branches qui modifient les mêmes fichiers |
| 5 nov. | Tour 2 : règle commune « chaque écran dit à quoi sert l'app » (logo littéral, verbe + contenu + chiffre utile sur l'accueil, rôle dans l'en-tête) | répond directement au motif du refus |

## Points ouverts (questions pour Sid)

Tous les points du tour 1 sont réglés (voir Décisions). Restent à valider plus tard, au cas par cas : les simplifications de parcours de `audit-produit.md` § 6 qui changent un comportement.
