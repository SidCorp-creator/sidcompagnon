# Relais 18 — v80 : illustrations pour les 17 fiches manquantes (demande de Sid : « génère des illustrations pour les 17 exercices manquants »)

Liste : `site/exercices/MISSING.json` (17). Règles déjà posées par Sid : une illustration n'est **jamais présentée comme une photo** ; anatomie, matériel et technique vérifiés image par image ; deux images par exercice (départ / arrivée ou phase clé ; statique : deux vues) ; même variante et même matériel que la fiche ; aucun service payant sans son accord.

## Questions avant de générer (réponse courte)
1. Ton outil `imagegen` : quel service et quel modèle ? Utilisation comprise dans ton forfait actuel, **sans facturation supplémentaire** ? Conditions d'utilisation compatibles avec un usage dans l'app (droits sur les images produites) ?
2. Peux-tu tenir un **style unique** pour les 34 images (même personnage neutre, fond uni clair, trait simple, 480×320, matériel exact visible) ?

## Répartition proposée
| Lot | Resp. | Fichiers |
|---|---|---|
| G1 Génération des 34 images (prompts consignés), JPEG progressif ≤ 40 Ko 480×320, `SOURCES.json` : `provider:"illustration"`, outil, modèle, date, prompt, `kind:"illustration"` ; `SIDFIT_IMG` + `SIDFIT_PHOTO_LABELS` si vues ; `help:true` seulement après ma validation visuelle ; retrait de `MISSING.json` au cas par cas | Codex | `site/exercices/*`, `exercices-photos.js`, `exercices.js` (help), tests |
| V1 Vérification visuelle de chaque paire (variante, matériel, posture, sécurité) ; refus motivé → régénération ciblée | Claude | — |
| U1 Interface : mention visible « Illustration » sur les images (et alt « illustration de … »), crédit « Illustrations générées par … et vérifiées », jamais « Photos » ; test | Claude | 22, i18n, test UI |
| Intégration, version 80 | Claude | — |
