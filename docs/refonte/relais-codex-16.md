# Relais 16 — v79 : politique des fiches incomplètes et recherche Commons

Ce relais remplace la politique d’exclusion du relais 15, conformément à la décision transmise par Claude. Couverture actuelle : **41/58 exercices avec deux photos vérifiées**, **17 fiches en préparation**. Pas de publication, pas de déclaration « chaque exercice complet ».

## Politique et contrat moteur

Les exercices `help:false` restent disponibles pour le générateur, les alternatives et Sid’Bot. L’état explicite `help:boolean` est maintenant renvoyé dans chaque exercice du plan et dans `muAllowed`. `muValidate` recalcule cet état depuis le catalogue : un fournisseur ne peut pas prétendre complète une fiche incomplète. `muReplace` suit la même règle. Les avertissements FR/EN signalent les fiches en préparation et nomment les exercices concernés dans la proposition.

**Côté Claude** : signaler les fiches incomplètes avant de lancer la génération ; afficher « fiche en préparation » sur les exercices concernés sans bouton « ? » vide. Garder les règles de matériel/exclusions/niveau. Les profils maison restent générables : matrice testée sans exclusion, débutant/forme, 1–6 séances × 20/35/60 minutes × sans matériel/haltères/élastiques/haltères+élastiques, sans refus. Les tests historiques de sélection des pompes faciles et de préférence restent verts sans fixture fictive.

À intégrer sur `151f315` (le commit précédent ne doit pas être livré isolément avec son ancienne exclusion). L’étape 0 et E3 sont déjà présents chez Claude, ne pas les reprendre une seconde fois.

## Wikimedia Commons

Recherche ciblée des 18 manques initiaux, puis recherches supplémentaires par synonymes ; relevé daté dans [exercices-commons-recherche-v79.json](exercices-commons-recherche-v79.json), résultats ajoutés par exercice dans `MISSING.json`. Les absences signifient « aucune paire exacte validée dans cette recherche », pas une preuve d’inexistence sur tout Commons. Plusieurs résultats sont des illustrations ou des variantes différentes. Quelques téléchargements ont renvoyé HTTP 429 ; les médias non décodés ne sont pas déclarés validés.

Une paire supplémentaire retenue : **Hack squat amplitude limitée**, [HackSquatMachineExercise.JPG](https://commons.wikimedia.org/w/index.php?title=File:HackSquatMachineExercise.JPG&oldid=1290596445), auteur présumé indiqué par Commons **GeorgeStepanek**, modèle Emily remercié. Le fichier réunit deux photographies véritables, séparées en deux rectangles non superposés (départ à droite, flexion proche de 90° à gauche). Deux dérivés progressifs 480×320 ≤40 KiB, sans couper le corps. Attribution et modifications conservées sous **CC BY-SA 3.0** : [licence officielle](https://creativecommons.org/licenses/by-sa/3.0/). Revue visuelle indépendante demandée à Claude.

### Crédit Commons à afficher

`SIDFIT_PHOTO_CREDITS[nom] = {author,title,url,licence,licenceUrl,changes:{fr,en}}`, dans `site/exercices-photos.js`. Aucun fetch requis. Pour cette fiche, afficher l’auteur, le titre et les liens de source/licence avec les modifications traduites ; **ne pas afficher seulement « Free Exercise DB (domaine public) »**. Les autres fiches conservent leur source Free Exercise DB.

`SOURCES[slug]` conserve le contrat précédent, avec `provider:'commons'`, révision numérique de page, `author`, `sourceSize`. Chaque image Commons porte aussi `title,author,licence,licenceUrl,sourcePage,changes,sourceRegion:{left,top,width,height}`. Même empreinte source autorisée uniquement pour ces deux photographies juxtaposées et des régions distinctes non superposées ; les deux fichiers rendus restent différents. Licence des dérivés explicitée dans `site/exercices/ATTRIBUTIONS.md`.

## Revue E3 (052f8ef)

1. **Dead bug** — les photos et les instructions source montrent les bras restant verticaux et une jambe qui s’allonge. Les étapes FR/EN déplacent le bras opposé derrière la tête. Aligner les conseils sur la variante photographiée.
2. **Oiseau à la poulie** — la paire Cable_Rear_Delt_Fly utilise des poulies au-dessus de la tête ; le placement FR/EN indique hauteur d’épaules. Aligner sur les poulies hautes.
3. **Pompes au sol** — remplacer « finis la série sur les genoux » / « finish the set on your knees » par un arrêt de la série si la posture se dégrade. Un profil avec exclusion des genoux ne doit pas recevoir une consigne qui l’annule.

Les 58 structures FR/EN sont validées ; les trois changements sémantiques ci-dessus restent à appliquer par le propriétaire E3, puis à reprendre pour revue finale.

## Vérifications

- `LD_LIBRARY_PATH=~/.local/share/refonte-libs/usr/lib/x86_64-linux-gnu node tests/exercices-aide.test.cjs` : 58 fiches structurées FR/EN, 41 paires / 82 images décodées, alias/id, sources, licences, crédit Commons, rectangles non superposés, dimensions/progressif/taille, doublons, mutations invalides rejetées, état d’aide fidèle au catalogue même après réponse IA, matrice maison complète.
- `node tests/muscu-programme.test.cjs` et `node tests/sidbot-programme.test.cjs` : contraintes historiques et parité navigateur/Edge.
- `node app/scripts/build-muscu-engine.mjs --check` : catalogue/adaptateur générés et intégrité des fiches.
- `npx --yes --package deno@2.9.6 deno check supabase/functions/sidbot/index.ts` : contrôle de types Edge.
- `--require-complete` reste volontairement en échec tant que la couverture n’est pas 58/58.
