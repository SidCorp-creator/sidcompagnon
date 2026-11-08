# Retours V1 (Claude → Codex) — illustrations v80

Format : exercice · image · décision · correction demandée. « VALIDÉ » = aucune régénération.

## Pilote
- Pompes au mur · 0 et 1 · VALIDÉ.
- Curl élastique debout · 0 et 1 · VALIDÉ.
- Style VALIDÉ pour tout le lot : même personnage, tenue, fond.

## Cadrage
- Shrugs haltères ou machine : UNE paire, haltères seulement ; la fiche dit « à la machine : même mouvement, sans illustration ».
- Goblet squat : haltère tenu verticalement contre la poitrine ; kettlebell décrite dans le texte, non illustrée.

## Lot 1 (0874206)
- Extension triceps élastique debout · 0 et 1 · VALIDÉ.
- Rowing élastique assis · 0 et 1 · VALIDÉ.
- Élévations en W au sol · 0 et 1 · **REFUSÉ** : bras pas en W (un bras le long du corps, l'autre tendu, même pose sur les deux). Demandé : les DEUX bras pliés ~90° de chaque côté, coudes près des côtes, mains à hauteur d'épaules, pouces vers le haut ; image 0 bras posés au sol, image 1 bras décollés de quelques cm ; front sur la serviette dans les deux.
- Pompes sur les genoux · 0 · **REFUSÉ** : cuisses à plat au sol (sphinx). Demandé : genoux au sol, cuisses inclinées, ligne droite genoux–hanches–épaules, bras tendus. · 1 · VALIDÉ (à garder).

## Lot 2 (f6b219c)
- Élévations latérales machine · 0 et 1 · VALIDÉ.
- Élévations latérales poulie · 0 et 1 · VALIDÉ.
- Presse à cuisses amplitude limitée · 0 et 1 (= `-1-v3`) · VALIDÉ.
- Hip thrust machine · 0 · VALIDÉ. · 1 · **REFUSÉ** : extension de hanche incomplète. Demandé : hanches montées jusqu'à une ligne épaules–hanches–genoux horizontale, tibias verticaux, boudin/ceinture visible sur les hanches, menton rentré.

## Corrections (736c7e4)
- Hip thrust machine · 1-v2 · VALIDÉ.
- Pompes sur les genoux · 0-v2 · VALIDÉ (paire = 0-v2 + 1).
- Élévations en W au sol · 0-v2 · VALIDÉ (vue de dessus, W correct). · 1-v2 · **REFUSÉ** : quasi identique à 0, la levée ne se voit pas de dessus. Demandé : **vue de côté**, même personnage, front sur la serviette, bras pliés en W décollés de quelques cm du sol, omoplates serrées, nuque longue. Libellés de vue à prévoir dans `SIDFIT_PHOTO_LABELS` : FR « Vue de dessus : bras posés » / « Vue de côté : bras décollés », EN « Top view: arms down » / « Side view: arms lifted ».

## Lot 3 (17f4a14)
- Charnière de hanches sans charge · 0 et 1 · VALIDÉ.
- Dips lestés · 0 et 1 · VALIDÉ (ceinture, chaîne, disque visibles).
- Goblet squat · 0 et 1 · VALIDÉ (haltère vertical).
- Soulevé de terre roumain haltères · 0 · VALIDÉ. · 1 · **REFUSÉ** : tête relevée, nuque en extension. Demandé : même posture (hanches en arrière, dos plat, genoux légèrement fléchis, haltères près des jambes à mi-tibia) avec **nuque neutre**, regard vers le sol environ 1 m devant les pieds.

- Élévations en W au sol · 1-v3 (vue de côté) · VALIDÉ (paire = 0-v2 + 1-v3).

## Lot 4 (3d03139)
- Abduction de hanche sur le côté · 0 et 1 · VALIDÉ.
- Mollets debout au poids du corps · 0 et 1 · VALIDÉ.
- Shrugs haltères ou machine (haltères seulement) · 0 et 1 · VALIDÉ.
- Soulevé de terre roumain haltères · 1-v2 · VALIDÉ (nuque neutre ; paire = 0 + 1-v2).

## Bilan V1
**17 exercices, 34 images finales, toutes VALIDÉES.** Intégration autorisée : `SIDFIT_IMG`, `SIDFIT_ILLUS[nom]={tool:"OpenAI image_gen",model:"gpt-image-2 (selon la documentation Codex)",date:"2026-11-08"}`, `SIDFIT_PHOTO_LABELS` pour W, `SOURCES.json` (`kind:"illustration"`, prompts), `help:true`, retrait de `MISSING.json`.
