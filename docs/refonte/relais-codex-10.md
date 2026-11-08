# v77 — M1 / M2, contrat et revue

M1 initial : `4e6a953`, déjà repris par Claude (`e3506eb`). Complément M2 et contraintes ci-dessous sur `v77-codex`, base `db4df3b`.

## Points d'intégration

- Conserver EX, EXDB, EXN, MUS dans 23. Retirer l'ancien bloc depuis `const PRIO=` jusqu'à la fermeture de `coachBuild` (base : lignes 17–65). Wrapper historique : `coachBuild(p) { return muBuild(p, LANG).plan }`.
- `23b-programme-moteur.js` est généré depuis `supabase/functions/_shared/muscu-programme.js`. Ne pas modifier les deux copies à la main. `node app/scripts/build-muscu-engine.mjs` produit aussi le catalogue JSON Edge depuis `site/exercices.js` ; `--check` vérifie leur correspondance. Ajouter la génération avant build-shell, 23b à ORDER et au contrôle TS (Claude).
- `muBuild(answers,locale)` → `{plan,why,warnings,est}` ; format historique plan.days/ex, profil versionné nettoyé, identifiants nouveaux, aucune écriture. `schedule` indique des positions relatives dans une semaine (lundi=0), aucun rendez-vous créé. Deux/trois séances : corps complet ; quatre : haut/bas ; cinq/six : répartition distincte.
- `muAlternatives(name,answers)` → noms compatibles. **Nouveau `muReplace(plan,dayIndex,exerciseIndex,name,answers,locale)`** → `{plan,why,warnings,est}` : copie immuable, prescription adaptée au nouveau mouvement, schéma correct, pas de doublon, durée recalculée. Échec lisible si l'alternative ne rentre pas. Utiliser ce traitement dans l'aperçu, pas seulement `ex.name=...`.
- Zones supportées : shoulder, back, knee, wrist, hip. Catalogue marqué explicitement ; le filtre ne constitue pas une adaptation médicale à une blessure. Matériel : none, bands, dumbbells, kettlebell, bench, pullup, barbell, machines, cables ; il doit être choisi même en salle, pas de relâchement silencieux.
- `other=[{sport,perWeek}]`, fréquence entière 0..14. Le client doit demander/afficher la fréquence. Une fréquence inconnue n'est pas inventée par le moteur. À partir de quatre autres activités/semaine : deux séries par exercice, et aucun accroissement du nombre total de séries par séance comparé au même profil sans ces activités. Seuil et dosage = heuristiques du produit, pas une prescription clinique.
- Douleur facultative : none/some/yes ; chaîne vide tolérée comme absence de réponse. some/yes ajoutent un avertissement professionnel ; aucune interprétation médicale des notes ni promesse de sécurité. Les notes libres ne sont pas interprétées par les règles locales.

## Sid'Bot programme

POST authentifié : `{app:"forme",task:"programme",locale:"fr"|"en",answers,requestId?,change?,currentPlan?}`. Aucun `messages` requis pour cette tâche. v=1 obligatoire côté serveur. requestId : 1..80 caractères alphanumériques, tiret ou underscore. `change` <=600 caractères. Si une modification cible l'aperçu actuel, transmettre aussi `currentPlan`; il est validé avant tout usage. Sans lui, le serveur ne connaît que la base locale reconstruite à partir des réponses.

Retour : `{plan,why,warnings,est,requestId?,usage}` ; plan.src="ia" uniquement après une réponse fournisseur réellement reçue et validée. Aucun appel d'écriture ni activation. Ne pas utiliser ce drapeau pour une simulation de test.

Validation partagée client/serveur : noms du catalogue, matériel et exclusions, nombre de séances, schémas uniques, couverture des groupes de la base locale, durée (préparation + transitions + séries + repos), séries/répétitions/RIR dans les bornes, pas de charge chiffrée en kg/lb. Profil, ids, dates et estimation sont reconstruits côté serveur, pas acceptés du modèle. Les indications libres restent du texte d'IA, à relire ; la validation n'est pas une expertise médicale.

Contexte minimal : réponses explicitement soumises, demande de modification, base/aperçu validé et catalogue autorisé. Aucun autre contexte d'app n'est transmis pour programme. Même auth, compteur et choix fournisseur que le chat. Réponse plafonnée à 3 800 tokens, délai fournisseur 25 s. Pas de nouvel essai automatique pour programme. En cas de sortie invalide : HTTP 502 `invalid_programme` avec message FR/EN proposant de réessayer ou de choisir les règles locales. Le repli est un choix visible du client, jamais un résultat IA fabriqué par le serveur. Afficher `j.message` pour cette erreur dédiée. Aucun changement de facturation, aucun fournisseur de secours payant.

`requestId` est renvoyé pour le verrou client et la vérification des réponses ; pas de table supplémentaire. La limitation courte existante protège les demandes rapprochées. Le client doit toujours bloquer double génération/activation et invalider demande/aperçu lors d'un changement de compte, avant et après chaque attente (consentement, jeton, réseau).

## Vérifications exécutées

- `node tests/muscu-programme.test.cjs` : 3 profils contrastés, 1..6 séances × 20/45/120 min, contraintes matérielles et exclusions, poignets/hanches, préférences, alternatives et remplacement immuable, avertissement douleur, non-augmentation du volume avec les autres activités, rejet des réponses IA incompatibles, parité navigateur/Edge et génération à jour.
- `node tests/sidbot-programme.test.cjs` : tâche sans messages, 3 profils, requestId, contexte minimal, auth, quota, délai, réseau, matériel/charges/jours/JSON invalides, pas de repli silencieux ni de retry.
- `node tests/sidbot-serveur.test.cjs` : tests existants du chat et nutrition toujours verts ; chargeur local adapté aux imports JS/JSON partagés.
- `tsc --noEmit --allowJs --checkJs --target es2022 --lib es2022,dom,dom.iterable --skipLibCheck app/src/shell/globals.d.ts app/src/shell/23b-programme-moteur.js` : OK.
- Cœur Edge contrôlé par TypeScript avec import JSON et résolution bundler : OK. `npx --yes --package deno@2.9.6 deno check supabase/functions/sidbot/index.ts` : OK (vérification réelle du graphe ESM/JSON Deno). Les tests du transport fournisseur sont simulés ; aucun essai fournisseur réel ni déploiement dans ce lot.
- Intégration complète avec parcours M3, captures M4 et build final : Claude, après reprise du complément.

## Fondements et limites des règles

Sources officielles consultées le 8 novembre 2026 : [ACSM, mise à jour du 17 mars 2026](https://acsm.org/resistance-training-guidelines-update-2026/) et [NHS, revue du 21 juillet 2026](https://www.nhs.uk/live-well/exercise/how-to-improve-strength-flexibility/). Elles soutiennent un renforcement régulier, progressif et adapté, réalisable aussi au poids du corps et avec bandes ; les règles précises de répartition/temps/RIR du logiciel sont des conventions prudentes, pas un programme médical individuellement validé. Le choix de charges reste à la personne, guidé par la technique et les répétitions en réserve.

Durées = estimations transparentes : cinq minutes de préparation, transition de trente secondes par exercice, trois secondes par répétition (ou durée de tenue), repos entre séries. Une séance réelle peut durer davantage. Pas de promesse que chaque groupe pourra être couvert quand le temps, le matériel ou les exclusions l'empêchent : un avertissement indique les limites, ou une erreur si une séance n'est pas réalisable.

## Revue M3 / M5 transmise à Claude

1. Matériel en salle : ne pas masquer la question et transmettre equip=[].
2. Autres sports : fréquence perWeek manquante dans les objets du premier UI ; ne pas annoncer une adaptation « avant une course » sans connaître les jours.
3. Remplacement : utiliser muReplace pour schéma, prescription et durée ; une alternative d'un autre schéma du même muscle n'autorise pas un doublon dans la séance.
4. Session : vérifier l'identité avant/après consentement, jeton et réseau, puis à l'activation ; requestId seul ne sépare pas les comptes.
5. Skill sid-relais : contenu court et lien Codex correct. §4 : la relecture après soumission, même unique, contredit smux ; conserver read → message → read → Enter, sans relecture de la réponse. Pas de sous-agent déclenché par ce skill ; le contexte autorise ici uniquement Claude/Codex.

Skills appliqués : smux (coordination), sid-charte (texte produit), Supabase (frontière Edge et auth) ; skill-creator pour la revue du skill commun. Pas de nouveau schéma SQL. Pas de compteur de tokens fiable exposé : aucune économie chiffrée revendiquée. Une seule source du moteur/catalogue pour éviter les divergences et les revues en double.

## Chaînes EN à fusionner dans DICT

Les explications du moteur utilisent déjà locale, sans entrée DICT. Pour les nouveaux noms du catalogue, afficher `L(ex.name)` et fusionner le bloc suivant ; les identifiants/noms stockés restent canoniques.

```js
Object.assign(DICT, {
  "Pompes au mur": "Wall push-ups",
  "Pompes sur les genoux": "Knee push-ups",
  "Pompes au sol": "Push-ups",
  "Élévations en W au sol": "Prone W raises",
  "Rowing haltères buste penché": "Bent-over dumbbell row",
  "Rowing élastique assis": "Seated resistance-band row",
  "Écartés élastique devant soi": "Band pull-aparts",
  "Développé épaules haltères debout": "Standing dumbbell shoulder press",
  "Curl élastique debout": "Standing band curl",
  "Extension triceps élastique debout": "Standing band triceps extension",
  "Squat au poids du corps": "Bodyweight squat",
  "Goblet squat": "Goblet squat",
  "Pont fessier au sol": "Glute bridge",
  "Abduction de hanche sur le côté": "Side-lying hip abduction",
  "Charnière de hanches sans charge": "Unloaded hip hinge",
  "Soulevé de terre roumain haltères": "Dumbbell Romanian deadlift",
  "Mollets debout au poids du corps": "Standing bodyweight calf raise",
  "Dead bug": "Dead bug",
  "Planche sur les avant-bras": "Forearm plank"
});
```
