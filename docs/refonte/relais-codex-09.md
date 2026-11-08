# Relais 09 — v77 Musculation (Claude → Codex) : brief + proposition à discuter

## Brief de Sid (résumé fidèle, 8 nov. 14 h 30)
1. Discuter avant de répartir (responsable, fichiers, dépendances, résultat, revue) ; un intégrateur ; travail parallèle réel ; pas Gemini.
2. Inventorier les skills des deux côtés, choisir par contenu ; trace courte (skill, lot, bénéfice).
3. Skill d'économie de tokens : en chercher un fiable, sinon **créer un skill de projet court** commun Claude/Codex ; l'appliquer ; aucun pourcentage sans mesure.
4. Cadrage : **capture 1 « Mes statistiques »** (contour blanc qui déborde, contenu collé au bord, double contour, focus) ; **capture 2 import** (zone de 2 lignes, contours superposés, boutons, clavier mobile ; aide « écrit par Claude » → Sid'Bot). Chercher la cause dans les styles partagés et le secours. Captures : `docs/refonte/avant/v77-capture{1-statistiques,2-import}.png`.
5. Retrouver la génération de programmes sur mesure (« Créer mon programme »), dans l'app, sans Claude, programmes et historiques préservés. **Cause trouvée** : `cf4774c` (74.1) a mis `hidden` sur `#coachBox` dans `site/index.html` ; `coachBuild` (local) et `coachSheet` existent encore.
6. Retirer le bloc permanent « Mon objectif » (`#muGoal`) ; objectif consultable/modifiable par une action secondaire ; données gardées et réutilisées pour préremplir.
7. Parcours questions-réponses (étapes courtes, choix rapides, préremplis, conditionnels) : objectif, expérience, séances/semaine, durée, lieu + matériel, préférences/exclusions, contraintes physiques (facultatif, explication), autres activités. Retour arrière, modifier, quitter/reprendre, récapitulatif, correction sans tout refaire. Réponses par compte.
8. Programme vraiment personnalisé : fréquence, durée, niveau, matériel, exclusions, répartition/récupération ; par séance : exercices, séries × reps ou durée, repos, intensité compréhensible, progression ; pas de charges inventées (méthode pour choisir) ; remplacement d'un exercice par une alternative compatible ; courte explication ; pas de promesse ni de prescription médicale ; douleur → avis professionnel, pas d'adaptation pseudo-médicale.
9. Aperçu avant activation (séances, durée estimée, ajuster, demande ciblée, enregistrer puis activer) ; jamais de remplacement silencieux ; séances réalisées et historique préservés ; même structure que les programmes actuels.
10. Sid'Bot : contexte minimal, sortie structurée validée côté serveur, cohérence avec les réponses, délais/invalides/quota, anti-doublon ; si indisponible : réessayer ou génération locale par règles **réellement vérifiée** ; jamais de simulation présentée comme IA ; rien de payant.
11. Tests : 3 profils contrastés (débutant 2 courtes à domicile ; expérimenté 4 en salle ; matériel limité + exclusions), FR/EN, comptes séparés, historiques conservés, erreurs.

## Proposition de répartition
| Lot | Resp. | Fichiers | Résultat | Revue |
|---|---|---|---|---|
| M1 Moteur de programme (règles locales) + remplacements + explication | **Codex** | nouveau `app/src/shell/23b-programme-moteur.js` (y déplacer `coachBuild` et ses tables), `site/exercices.js` si besoin de métadonnées (matériel, zones), tests `tests/muscu-programme.test.cjs` | `muBuild(answers)` → plan au format actuel + `{why, warnings}` ; 3 profils donnent des programmes réellement différents | Claude |
| M2 Sid'Bot « programme » (sortie structurée validée serveur, mêmes contraintes que M1, repli M1 honnête) | **Codex** | `supabase/functions/sidbot/core.ts` (task `programme`), `tests/sidbot-serveur.test.cjs` | `POST sidbot {app:"forme",task:"programme",answers}` → `{plan,why}` validé ou erreur claire | Claude |
| M3 Parcours questions-réponses + aperçu + activation + écran principal (sans `#muGoal`, accès « Créer mon programme », action « Objectif et préférences ») | **Claude** | `23-…js` (UI : `coachOpen`, `cfRender`, submit), `24-…js` (`renderMuGoal`, clics `coachBox`), `site/index.html` (coachSheet), `Coach.tsx`, `Muscu.tsx`, `app.css`, `i18n.js` | parcours reprenable, récapitulatif, aperçu, activation sans perte | Codex |
| M4 Cadrage capture 1 + 2 (cause dans styles partagés et secours) | **Claude** | `site/app.css`, `index.html` (import) | captures après 320/390/1280, zoom, clavier | Codex |
| M5 Skill de projet « relais compacts » commun | **Claude** (rédaction) | `.claude/skills/sid-relais/SKILL.md` + lien `.agents/skills/sid-relais` | court, vérifié | Codex (compatibilité Codex) |
| Intégration, build, version 77, tests navigateur, mise en ligne si Sid le demande | **Claude** | — | — | — |

**Fichiers à toi seul** : `23b-…js`, `core.ts`, `exercices.js`, tests M1/M2. **À moi seul** : `23-…js`, `24-…js`, `index.html`, `app.css`, `i18n.js`, `*.tsx`, ORDER.txt (j'ajoute `23b` après `23`). Tes chaînes EN : bloc séparé dans ton relais, je les intègre.

## Interface proposée (à amender)
```
answers = {v:1, goal:"muscle"|"force"|"gras"|"forme"|"endu", level:"deb"|"inter"|"conf",
  days:1..6, dur:20..120 (min), place:"home"|"gym"|"outdoor",
  equip:["none","bands","dumbbells","kettlebell","bench","pullup","barbell","machines","cables"],
  avoidZones:["shoulder","back","knee",…], avoidEx:[nom exact], prefer:[nom exact],
  pain:"none"|"some"|"yes" (facultatif), other:[{sport, perWeek}], notes:"" }
muBuild(answers) -> {plan:{name, profile:answers, sessions:[{name, exercises:[{name, sets, reps|time, rest, rpe|int, tempo?, note?}]}]}, why:[phrases], warnings:[phrases], est:[min par séance]}
muAlternatives(exName, answers) -> [noms compatibles]
```
Activation : je passe par `planApply` existant après aperçu et confirmation ; à toi de vérifier que `planApply` ne perd ni séances réalisées (logs) ni ancien programme (actuellement il `tomb()` les séances de l'ancien plan : à remplacer par un archivage ? propose).

## Branches
Base `db4df3b` (= main, 76.1). Moi : `v77-muscu` (~/sidcompagnon-claude). Toi : `v77-codex` depuis `db4df3b` dans ~/sidcompagnon-codex.

## Questions (réponse courte)
1. Accord / contre-proposition ? 2. Tes skills utiles par lot (contenu vérifié) ? 3. Connais-tu un skill externe fiable de gestion du contexte ? Sinon OK pour le skill de projet `sid-relais`.
