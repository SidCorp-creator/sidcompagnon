# Relais 15 — v79 E1/E2 (Codex → Claude)

État : lots E1/E2 prêts à revoir ; couverture **40/58**, **18 fiches incomplètes**. La demande « chaque exercice » reste donc partiellement non satisfaite ; aucune publication. Base b762949, étape 0 f4b88f8 et E3 052f8ef repris ; cherry-pick uniquement le nouveau commit Codex, pas ces deux commits déjà présents chez Claude.

## Contrat

- Catalogue version 3 : `id` ASCII stable (ne pas le recalculer après renommage), `en`, `aliases` explicites et `help` booléen pour les 58. Les alias anglais désignent la variante exacte ; aucun rapprochement flou. `exHelpKey` côté client résout id/nom/alias explicite, puis retrouve le nom canonique pour AIDE/IMG.
- `SIDFIT_IMG` expose seulement 40 paires exactes. Les 12 fichiers JPEG des 6 anciennes paires incorrectes devenues sans usage sont supprimés (la paire haltères reste utilisée seulement pour les élévations haltères).
- `SOURCES.json[slug]` conserve `src,url,licence,licenceUrl,retrieved,revision,note,exercises,exact,images[2]`. Chaque image : `file,url,sourceSha256,sha256,phase,alt:{fr,en}`. Les URLs sont figées à une révision ; départ/phase clé remis dans l'ordre si nécessaire. Planche : installation à genoux puis tenue, documenté explicitement. Goblet : paire kettlebell seule insuffisante pour un catalogue qui autorise aussi un haltère ; déclaré incomplet comme le shrug multi-matériel.
- `MISSING.json[id]` donne la variante manquante et la raison exacte. Pas de photo approchante et pas de fiche vide exposée.
- Moteur partagé/Edge : `compatible` exige `help===true` ; préférences et retour IA ne peuvent pas contourner cela. Avertissement FR/EN explicite sur les exercices exclus. Si aucune séance compatible n'est possible, erreur existante `no_compatible_exercises` ; aucun mouvement incomplet de secours. Certains profils sans matériel à 5/6 jours ne peuvent plus fournir de séance tirage.
- À intégrer côté Claude : EXDB/exListTxt (23), muqExNames (23a), interface E4, préchargement/service worker, reconstruction. Le connecteur MCP lit aussi le catalogue et doit respecter help (signalé séparément ; non touché ici).

## Sources et traitement

[Free Exercise DB](https://github.com/yuhonas/free-exercise-db), révision `f00c92c7dcf1216a928a52c3706c7ce8e2f71ed5`, récupéré le **2026-11-08**. [Licence Unlicense du dépôt](https://github.com/yuhonas/free-exercise-db/blob/f00c92c7dcf1216a928a52c3706c7ce8e2f71ed5/LICENSE.md), copie conservée dans `site/exercices/LICENSE.free-exercise-db.txt`. La licence et les URLs de chaque photo sont conservées ; la provenance repose sur la déclaration publique du dépôt.

80 JPEG progressifs, 480×320, chacun ≤ 40 KiB ; image entière conservée, sans tronquer le corps. Encodage par Sharp temporaire (pas de dépendance runtime ou ajout au package du projet), contrôle du décodage et du contenu via Chromium/canvas dans le test. Les montages source examinés sont `/tmp/v79-contact-{0..4}.png` (contiennent aussi les variantes rejetées, ne pas les prendre pour la sélection finale). Revue visuelle indépendante des paires par Claude toujours requise.

## Vérifications

- `LD_LIBRARY_PATH=~/.local/share/refonte-libs/usr/lib/x86_64-linux-gnu node tests/exercices-aide.test.cjs` : 58 identifiants/alias, conseils structurés FR/EN (E3), 40 paires, 80 JPEG décodés, dimensions/progressif/taille, doublons, empreintes, provenance, alt, variantes de référence, manques explicites, interdiction des exercices incomplets côté moteur.
- `node app/scripts/build-muscu-engine.mjs --check` : valide les fiches et fichiers avant de générer le catalogue serveur et l'adaptateur navigateur ; parité vérifiée.
- `node tests/muscu-programme.test.cjs` et `node tests/sidbot-programme.test.cjs` : profils et exclusions, refus IA des exercices incomplets, parité navigateur/Edge. Les tests du choix de niveau conservent une fixture isolée pour les pompes faciles dont les photos manquent en production.
- `node tests/exercices-aide.test.cjs --require-complete` est la barrière « 58/58 » : **doit échouer actuellement**, et cite MISSING.json. Le test normal est vert parce que chaque absence est explicite et exclue ; il ne signifie pas une couverture complète.

## Manques (18)

| Exercice | Raison |
|---|---|
| Dips lestés | La paire Dips_-_Chest_Version ne montre aucun lest ; Weighted_Bench_Dip utilise un banc et une autre variante. |
| Pompes au mur | Aucune paire de pompes au mur ; Incline_Push-Up utilise un banc, pas un mur. |
| Pompes sur les genoux | Aucune paire de pompes avec appui sur les genoux ; Pushups est sur les pieds. |
| Élévations en W au sol | Aucune paire du mouvement en W couché au sol ; Superman et Lying_Rear_Delt_Raise sont différents. |
| Rowing élastique assis | Aucune paire de rowing assis avec élastique ; Seated_Cable_Rows est à la poulie. |
| Shrugs haltères ou machine | La paire Dumbbell_Shrug ne couvre pas la variante machine annoncée ; aucune paire propre à cette machine. |
| Élévations latérales poulie | Cable_Seated_Lateral_Raise montre un oiseau assis buste penché, pas une élévation latérale du deltoïde moyen. |
| Élévations latérales machine | Ancienne correspondance Side_Lateral_Raise avec haltères ; aucune paire de la machine exacte. |
| Curl élastique debout | Aucune paire de curl debout à élastique ; Standing_Biceps_Cable_Curl est à la poulie. |
| Extension triceps élastique debout | Speed_Band_Overhead_Triceps est en position de fente autour dun banc et exécuté en vitesse ; ne documente pas la variante debout contrôlée sans banc. |
| Presse à cuisses amplitude limitée | Leg_Press montre une flexion profonde ; aucune paire documentant la variante à amplitude limitée annoncée. |
| Hack squat amplitude limitée | Hack_Squat montre une flexion profonde ; aucune paire documentant la variante à amplitude limitée annoncée. |
| Hip thrust machine | Ancienne correspondance Barbell_Hip_Thrust avec barre, pas une machine de hip thrust. |
| Abduction de hanche sur le côté | Side_Leg_Raises montre des balancements debout avec chaise, pas une abduction couché sur le côté. |
| Charnière de hanches sans charge | Aucune paire de charnière de hanches sans charge ; Good_Morning et Band_Good_Morning sont chargés. |
| Soulevé de terre roumain haltères | Romanian_Deadlift utilise une barre ; Stiff-Legged_Dumbbell_Deadlift est une variante jambes tendues distincte. |
| Mollets debout au poids du corps | Standing_Calf_Raises utilise une machine ; aucune paire au poids du corps seul. |
| Goblet squat | Paire kettlebell seule ; manque une paire haltère pour couvrir les deux matériels autorisés. |

## Paires retenues (40)

| Exercice (id) | Entrée source |
|---|---|
| developpe-couche-halteres | Dumbbell_Bench_Press |
| chest-press-machine | Leverage_Chest_Press |
| developpe-incline-a-la-smith | Smith_Machine_Incline_Bench_Press |
| pec-deck | Butterfly |
| pompes-au-sol | Pushups |
| tractions-pronation-lestees | Weighted_Pull_Ups |
| tractions-prise-neutre | V-Bar_Pullup |
| tractions-prise-large | Pullups |
| pull-over-a-la-poulie | Straight-Arm_Pulldown |
| rowing-avec-appui | Dumbbell_Incline_Row |
| tirage-poulie-basse-assis | Seated_Cable_Rows |
| rowing-machine-convergente | Leverage_Iso_Row |
| t-bar-avec-appui-poitrine | Lying_T-Bar_Row |
| rowing-halteres-buste-penche | Bent_Over_Two-Dumbbell_Row |
| shoulder-press-a-la-smith | Smith_Machine_Overhead_Shoulder_Press |
| elevations-laterales-halteres | Side_Lateral_Raise |
| face-pull | Face_Pull |
| reverse-pec-deck | Reverse_Machine_Flyes |
| oiseau-a-la-poulie | Cable_Rear_Delt_Fly |
| ecartes-elastique-devant-soi | Band_Pull_Apart |
| developpe-epaules-halteres-debout | Standing_Dumbbell_Press |
| curl-barre-ez | EZ-Bar_Curl |
| curl-incline-halteres | Incline_Dumbbell_Curl |
| curl-marteau | Hammer_Curls |
| curl-poulie | Standing_Biceps_Cable_Curl |
| extension-au-dessus-de-la-tete-a-la-poulie | Cable_Rope_Overhead_Triceps_Extension |
| extension-poulie-haute-a-la-corde | Triceps_Pushdown_-_Rope_Attachment |
| leg-extension-charge-moderee | Leg_Extensions |
| squat-au-poids-du-corps | Bodyweight_Squat |
| abduction-hanche-machine | Thigh_Abductor |
| pont-fessier-au-sol | Butt_Lift_Bridge |
| leg-curl-assis | Seated_Leg_Curl |
| leg-curl-allonge | Lying_Leg_Curls |
| adduction-machine | Thigh_Adductor |
| mollets-assis | Seated_Calf_Raise |
| mollets-debout-machine | Standing_Calf_Raises |
| mollets-a-la-presse | Calf_Press_On_The_Leg_Press_Machine |
| crunch-a-la-poulie | Cable_Crunch |
| dead-bug | Dead_Bug |
| planche-sur-les-avant-bras | Plank |

Revue E3 transmise : aligner Dead bug sur les photos (bras restant verticaux, jambes alternées), Oiseau sur poulies hautes, et remplacer la fin de série sur les genoux des pompes au sol par un arrêt si la posture se dégrade (respect des exclusions). À intégrer par Claude avant validation finale des fiches.
