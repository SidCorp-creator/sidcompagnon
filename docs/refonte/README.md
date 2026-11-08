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
| T15 | Essai sur iPhone : branche `refonte-tech` poussée (commit 87897d9), aperçu https://sidcompagnon-git-refonte-tech-sidcorp1.vercel.app (connexion Vercel requise) | Claude Code (envoi), **Sid** (essai) | fait : Sid a essayé, « ça marche bien » |
| T16 | Extension à toute l'app, lots A à E (relais 05) | Codex (intégration), Claude Code (revue après chaque lot) | demandée |
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
| 5 nov. | Sid autorise l'envoi de `refonte-tech` sur GitHub pour un essai sur iPhone (aperçu Vercel, pas `main`) | l'aperçu utilise le vrai compte et les vraies données de Sid |
| 5 nov. | Nutrition : un seul bouton « Ajouter un repas » qui ouvre les 5 façons d'ajouter (aucune retirée) | validé par Sid |
| 5 nov. | Réglages des conversations Claude seulement dans l'app concernée (retirés de Réglages) | validé par Sid |
| 6 nov. | Musculation : pas de bouton « Valider la série » ni de bouton « Repos » ; une série complète est faite dès la saisie (comportement inchangé) | arbitrage de Claude Code sans changement de comportement ; le minuteur de repos a été retiré en v44 |
| 6 nov. | Le quota de Codex est épuisé : **Claude Code reprend les lots D et E** dans le worktree `refonte-tech` (Codex ne le modifie plus) | décision de Sid (« continue toi-même ») |
| 6 nov. | Conversation Claude : **ligne repliée en bas** d'Agenda, Musculation, Nutrition et Notes ; le bouton Claude ouvre toujours la conversation d'un toucher | choix de Sid (option recommandée) |
| 6 nov. | Version 75.1 (lots A à E, commit `9adb774`) envoyée sur `refonte-tech` et essayée par Sid sur iPhone : « ça marche bien » | — |
| 6 nov. | **75.1 en ligne pour tout le monde** à la demande de Sid (« mets en ligne pour tout le monde ») : `main` = `8c06ffe` (avance rapide depuis `3d783f9`), déployée par Vercel ; vérifié : `sw.js` = `sidnote-v75-1`, version 75.1, CSP, relais `/mcp` | — |
| 5 nov. | Tour 2 : règle commune « chaque écran dit à quoi sert l'app » (logo littéral, verbe + contenu + chiffre utile sur l'accueil, rôle dans l'en-tête) | répond directement au motif du refus |

## Points ouverts (questions pour Sid)

Tous les points du tour 1 sont réglés (voir Décisions). Restent à valider plus tard, au cas par cas : les simplifications de parcours de `audit-produit.md` § 6 qui changent un comportement.

## v76 (8 nov. 2026) — suivi commun Claude Code / Codex

Brief : `brief-76.md`. Branche d'intégration : `v76-claude` (worktree `~/sidcompagnon-claude`). Codex : `v76-codex` (`~/sidcompagnon-codex`), repris par cherry-pick. Intégration finale : Claude Code. **Rien n'est en ligne.**

| Lot | Responsable | État | Vérification |
|---|---|---|---|
| A Noms Sid'… + référence `MARQUES` + charte/skill/CLAUDE.md | Claude | fait | `tests/marques.test.js` (106 fichiers, toutes les traductions) |
| B Retrait du néerlandais (préférence `nl` → `fr`) | Claude | fait | build, `smoke.js` (option absente, retour au français) |
| C Nutrition par pièce (masse de référence estimée, grammes acceptés) | Codex | fait, revu par Claude | `nutrition-units.test.cjs`, `v76-forme.test.cjs` (24 parcours) |
| D Poids : courbe continue sur vraies dates, aucune mesure inventée | Codex | fait, revu par Claude | `weight-gap.test.cjs` (0/1/n, React/secours) |
| E1 Sid'Bot serveur (`supabase/functions/sidbot`, `sql/sidbot.sql`) + recherche fournisseurs | Codex | fait, revu par Claude ; **non déployé, aucune clé** | `sidbot-serveur.test.cjs` (simulé), `sidbot-sql.test.cjs` (PGlite) |
| E2 Sid'Bot dans l'app, retrait des liens/boutons Claude | Claude | fait, revu par Codex (6 remarques corrigées) | `sidbot.test.cjs` (faux serveur, FR/EN) |
| F Aujourd'hui simple par défaut + « Affichage détaillé » + Premiers pas | Claude | fait, revu par Codex (1 défaut corrigé) | `accueil.test.cjs` (React/secours, FR/EN, clavier) |
| G Bug capture 1 (Agenda resté sur la veille après minuit) | Claude | corrigé | `agenda-minuit.test.cjs` échoue avant (742b6b1^), passe après ; captures `avant/capture1-…`, `apres/v76-agenda-minuit-apres.png` |

Décisions v76 : un seul fournisseur pour Sid'Bot (recommandé : Groq Free, à activer par Sid — `sidbot-fournisseurs.md`) ; Gemini API écarté (offre payante exigée pour l'EEE) ; aucune bascule payante ; Sid'Bot propose, la personne valide ; historique Sid'Bot sur l'appareil seulement ; Sid'Bot ne réécrit plus le programme de musculation (l'app le crée, Sid'Bot conseille) ; anciennes adresses du connecteur Claude visibles et révocables seulement ; fonction `mcp` non supprimée (décision à prendre par Sid). Relais : piège du Tab chez Codex occupé (message resté dans la saisie).

Vérification finale v76 (8 nov.) : 14 tests ciblés verts (dont SQL PGlite) ; parcours Élan complet 15/15 (320/390/900/1280, clair/sombre, FR/EN, React/secours) ; `smoke.js` s'arrête au même clic sur 75.1 (02b2806) et sur v76 : test obsolète depuis Élan, pas une régression v76.

| 8 nov. | **76 en ligne pour tout le monde** à la demande de Sid (« mets en ligne pour tout le monde ») : `main` = `e96c6ed` (avance rapide depuis `8c06ffe`), déployée par Vercel ; vérifié : `sw.js` = `sidnote-v76`, « version 76 », manifeste, CSP, relais `/mcp`. Sid'Bot serveur pas encore déployé (affiche « indisponible » jusqu'à la configuration) | — |

## v77 (8 nov. 2026) — Musculation : cadrages, « Créer mon programme », parcours

Brief : `relais-codex-09.md`. Répartition décidée ensemble (accord de Codex, avec ses amendements de contrat) :

| Lot | Resp. | État | Revue |
|---|---|---|---|
| M1 Moteur local `muBuild`/`muAlternatives` (`23b`) | Codex | en cours | Claude |
| M2 Sid'Bot `task:"programme"` (sortie structurée validée serveur) | Codex | en cours | Claude |
| M3 Parcours, récapitulatif, aperçu, activation avec archivage, carte « Mon programme », retrait de « Mon objectif » (`23a`, 23, 24, index.html, app.css, i18n) | Claude | fait, en attente de M1 pour la génération | Codex |
| M4 Cadrages (focus partagé des champs, ligne repliable, import) | Claude | fait | Codex |
| M5 Skill `sid-relais` | Claude | fait | Codex (compatibilité) |
| Intégration, version 77, tests navigateur | Claude | — | — |

Causes : **génération disparue** = `cf4774c` (74.1) avait mis `hidden` sur `#coachBox` (moteur et formulaire encore là, plus rien ne les affichait) ; **cadrages** = la règle Élan `:focus-visible` (décalage 2 px) battait la règle « champs : décalage 0 », d'où bordure + anneau sur **tous** les champs ; le contenu « Mes statistiques » était une `.card` sans marge intérieure (0 px) et à rayon 16 dans un cadre à 6 ; la zone d'import faisait 68 px (2 lignes par défaut).

Skills retenus : `sid-charte` (M3, M4 : charte), `sid-relais` (tous : relais compacts, créé faute de skill externe audité), `smux` (canal), `supabase` côté Codex (M2), `skill-creator` lu par Codex pour la revue de M5. Écartés : pas de skill design/sport/accessibilité externe vérifié et pertinent ; vérification par tests Playwright locaux.

### Correctif Sid'Note avant publication (8 nov., relais 11) — **pas publié, attend l'accord de Sid**
- Cause : l'éditeur de notes construit son propre bandeau (`29-notes-libres.js`) ; sa copie du bouton était restée « Claude » en v76 (sans nom accessible). Le clic passait déjà par `elanHeadClick` → Sid'Bot ; aucun lien ni appel Claude dans le `app.js` en ligne (seulement un commentaire).
- Correction (Claude) : bouton unique `ahBotBtn()` (07) utilisé par les deux bandeaux. Test `sidbot.test.cjs` : échoue avant (« Claude » trouvé), passe après ; bandeaux de toutes les fonctions sans « Claude », mobile et ordinateur, FR/EN.
- Revue (Codex) : 8 cas 390/1280 × FR/EN × React/secours, 48 requêtes simulées ; note jointe seulement si choisie, note secrète jamais (même déverrouillée), serveur limité à title/body.
- Appel réel Groq (code de la fonction, connexion/compteur simulés) : note FR résumée + proposition `add_note`, EN sans note jointe : OK.
- Tests réunis après intégration : 13 tests ciblés + Élan 15/15 (avant ce correctif d'une ligne de bandeau), parcours musculation FR/EN.
- À la publication : pousser `v77-muscu` sur `main` **et** redéployer la fonction `sidbot` (elle n'a pas encore la tâche `programme` ni le catalogue partagé).

- **77 en ligne pour tout le monde** (8 nov., accord de Sid « mets en ligne pour tout le monde ») : fonction `sidbot` redéployée (moteur et catalogue partagés), puis `main` = `375485f` ; vérifié : `sw.js` = `sidnote-v77`, « version 77 », nouveau code servi, chat Sid'Bot (401 sans compte), tâche programme (400 sur demande incomplète), relais `/mcp` inchangé.

## v78 (8 nov.) — Sid'Note : Sid'Bot modifie la note, « Exporter en PDF » — **prête, non publiée**
- Diagnostic : Sid'Bot ne savait ni modifier une note ni l'exporter ; le dernier PDF téléchargé (15 h 53) a été produit par ReportLab, donc hors de l'app, très probablement par Claude via l'ancien connecteur `mcp` (toujours actif côté serveur). La v77 avait déjà corrigé le bouton « Claude » de l'éditeur.
- Répartition : Codex P1 (générateur PDF pur `29b`) + S1 (actions serveur `edit_note`, `share_note_pdf`, garde « note jointe et complète ») ; Claude C1 (client, aperçu avant/après, garde id+version+compte, annulation, export éditeur/menu/Sid'Bot, messages au-dessus des fenêtres) + intégration ; revues croisées (Codex : 2 remarques corrigées ; Claude : nom dans le PDF).
- Vérifié : tests ciblés (PDF relu par pdf.js, actions serveur, client FR mobile / EN ordinateur, clavier et focus), Élan 15/15 ; vrais appels Groq (code serveur, connexion/compteur simulés) : correction d'orthographe proposée, export PDF proposé, sans note jointe aucune action.
- À la publication : pousser sur `main` **et** redéployer `sidbot` (actions note).
- 8 nov. : connecteur Claude (`mcp`) **gardé** pendant que Sid teste Sid'Bot (semaine du 9 nov.) ; suppression prévue si Sid'Bot convient, sur demande explicite de Sid.

## v79 (8 nov.) — fiche « ? » des exercices — **prête, non publiée**
- Inventaire : 58 exercices ; **41 fiches complètes** (2 photos exactes vérifiées + conseils FR/EN), **17 incomplètes** documentées (`site/exercices/MISSING.json`) : marquées `help:false`, gardées dans la génération avec « Fiche en préparation » et un avertissement avant génération ; jamais de « ? » vide ni de photo approchante.
- Répartition : Codex E1 (photos Free Exercise DB + Wikimedia Commons, `SOURCES.json`, crédits) + E2 (identifiants, alias, `help`, moteur/Edge, test de couverture) ; Claude E3 (conseils des 58 : placement, exécution, respiration, points d'attention, erreurs) + E4 (interface : « ? » en séance, aperçu, remplacement ; association explicite des exercices non reconnus ; crédits ; états d'erreur) + intégration.
- Revues : Codex a corrigé 3 conseils pour coller aux photos ; Claude a fait la revue visuelle des 41 paires (planches `apres/v79-planches/`) : 5 doutes, 4 levés par Codex sur les originaux, 1 remplacé (planche).
- Vérifié : 18 suites de tests + Élan 15/15 ; `exercices-aide.test.cjs --require-complete` échoue volontairement (17 manques).
