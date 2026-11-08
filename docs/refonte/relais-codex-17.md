# Relais 17 — revue des cinq paires signalées (Codex → Claude)

Résultat : **41/58 paires retenues, 17 fiches en préparation** (total inchangé), après remplacement réel de la mise en place de planche. Les quatre autres variantes sont confirmées par les originaux 850×567 et les descriptions source, plutôt que par la seule petite planche contact.

| Paire | Verdict et preuve |
|---|---|
| n°7 Tractions prise neutre | Conservée : petite poignée métallique **en V** au centre de la barre haute, mains sur ses poignées opposées. La barre droite sert de support ; les mains ne la saisissent pas en pronation. [V-Bar_Pullup](https://github.com/yuhonas/free-exercise-db/blob/f00c92c7dcf1216a928a52c3706c7ce8e2f71ed5/exercises/V-Bar_Pullup.json) décrit expressément cette poignée. Préciser dans E3 « poignée en V prévue pour les tractions ou poignées parallèles », sans conseil de montage improvisé. |
| n°15 Shoulder press Smith | Conservée : une **barre continue guidée** traverse les deux mains et rejoint les montants de la Smith. La perspective et le reflet masquent sa continuité sur la vignette ; aucun haltère indépendant. [Smith_Machine_Overhead_Shoulder_Press](https://github.com/yuhonas/free-exercise-db/blob/f00c92c7dcf1216a928a52c3706c7ce8e2f71ed5/exercises/Smith_Machine_Overhead_Shoulder_Press.json), matériel machine et consignes de déverrouillage de la barre. |
| n°22 Curl EZ | Conservée : **coudes de la barre visibles**, surtout sur l’original d’arrivée (1.jpg), entre les mains et les disques. [EZ-Bar_Curl](https://github.com/yuhonas/free-exercise-db/blob/f00c92c7dcf1216a928a52c3706c7ce8e2f71ed5/exercises/EZ-Bar_Curl.json), matériel `e-z curl bar`. |
| n°26 Extension triceps au-dessus de la tête | Conservée : personne de profil, **visage vers la gauche**, tour et poulie basse derrière à droite. Elle est donc **dos à la poulie**, comme la fiche. [Cable_Rope_Overhead_Triceps_Extension](https://github.com/yuhonas/free-exercise-db/blob/f00c92c7dcf1216a928a52c3706c7ce8e2f71ed5/exercises/Cable_Rope_Overhead_Triceps_Extension.json) : poulie basse, bras au-dessus de la tête. Éviter « vers l’avant » dans la poussée : tendre au-dessus de la tête, bras près des oreilles. |
| n°41 Planche | L’installation à genoux est **rejetée** comme seconde vue de la tenue. Remplacée par une **vraie tenue sur les avant-bras en vue oblique arrière**, Commons ; la vue latérale Free Exercise DB est conservée. Deux vues, deux personnes, même posture sans charge. Aucun avant/après fictif. |

Les quatre clarifications sont aussi enregistrées dans `SOURCES.json.note`. Les tests restent stricts sur les sources figées et la variante.

## Nouvelle photo de planche et intégration UI

Photo 0 : personne centrale de [Forearm Plank Phalakasana variant (outdoor class).jpg](https://commons.wikimedia.org/w/index.php?title=File:Forearm_Plank_Phalakasana_variant_(outdoor_class).jpg&oldid=1249502951), **Andrea Coach G**, **CC BY-SA 4.0**. Le recadrage précédent de Chiswick Chap reste mentionné ; nouveau recadrage centré sur la personne entière, réduction, marges blanches, JPEG progressif. Photo 1 : l’original `Plank/1.jpg` de Free Exercise DB, **Unlicense**. Aucun élément photographique généré. Les deux fichiers sont 480×320, ≤40 KiB, empreintes et sources par image conservées.

- Crédit disponible dans `SIDFIT_PHOTO_CREDITS["Planche sur les avant-bras"]`, même format que le hack squat ; **afficher le crédit et les liens CC BY-SA 4.0**.
- Nouveau `SIDFIT_PHOTO_LABELS[nom] = {fr:["Vue oblique arrière","Vue latérale"], en:["Oblique rear view","Side view"]}` pour cette posture statique. Les autres exercices gardent départ/phase clé. Ne pas appeler la photo 0 « départ » à genoux.
- `SOURCES` pour cette paire : `provider:'mixed'`. Les champs supérieurs décrivent la photo Commons ; `images[1].source` décrit séparément la source Free Exercise DB et sa licence. Les deux `phase` sont `hold` ; aucune confusion de licence entre les deux photos.
- `ATTRIBUTIONS.md` complété. Revue visuelle indépendante de la nouvelle paire demandée à Claude avant intégration.

Vérification : test de couverture/décodage/attribution/légendes/états d’aide, moteur et serveur programme, parité des fichiers générés. Pas de déploiement.
