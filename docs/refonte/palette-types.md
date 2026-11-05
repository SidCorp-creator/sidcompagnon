# Palette des types — version finale T13

Palette finale validée par Claude après la revue visuelle. Priorité aux cinq types par défaut, distincts entre eux et des trois apps : Événement sarcelle, Cours olive, Stage vert, Mémoire framboise, Perso gris. Le brun de x4 passe le seuil graphique de 3:1 sans ajustement. x1 cyan et x3 ocre sont conservés par décision explicite.

Seuls les jetons CSS changent. Tous les types qui référencent un jeton suivent sa teinte, y compris un choix explicite indiscernable de l’ancien défaut. **Aucune écriture ni migration dans `data.types`** ; noms, références et réglages restent présents.

Les points colorés sont visibles et accompagnés du nom dans le formulaire et l’Agenda. Le type sélectionné garde un fond neutre et un contour, pour préserver le contraste du point ; les rappels restent sur une sélection pleine app/on-app.

## Table finale appliquée

Les contrastes indiqués sont le minimum contre surface et surface-2 du thème correspondant (clair : blanc / #ECECEC ; sombre : #1E1E1E / #2A2A2A). Seuil : 3:1 pour ces points graphiques.

| Jeton | Teinte | Clair | Sombre | Min clair | Min sombre |
|---|---|---|---|---|---|
| `--c-event` | Sarcelle | `#0F8B8D` | `#0F8B8D` | 3.49 | 3.48 |
| `--c-cours` | Olive | `#66712E` | `#AAB76D` | 4.48 | 6.63 |
| `--c-stage` | Vert | `#2F7D5B` | `#6FBF98` | 4.23 | 6.55 |
| `--c-memoire` | Framboise | `#9B427A` | `#D286B5` | 5.15 | 5.34 |
| `--c-perso` | Gris | `#7A7F8C` | `#A3A7B2` | 3.39 | 5.97 |
| `--x1` | Cyan | `#2A7F95` | `#6FC3D6` | 3.89 | 7.14 |
| `--x2` | Rose | `#A84A72` | `#D98AAE` | 4.57 | 5.60 |
| `--x3` | Ocre | `#9A7A2C` | `#D9B862` | 3.42 | 7.51 |
| `--x4` | Brun désaturé | `#7C5A45` | `#C49A80` | 5.22 | 5.66 |
| `--x5` | Vert | `#4B8240` | `#8CC57E` | 3.89 | 7.11 |
| `--x6` | Rouge | `#A33D52` | `#E08A9A` | 5.31 | 5.65 |

Les propositions antérieures ardoise pour Cours et olive pour x4 n’ont pas été appliquées : elles étaient trop proches de Perso et x5. Aucun autre remplacement ne reste en attente dans cette palette.

Vérification : couleurs calculées des 11 jetons en clair/sombre dans le parcours automatisé, seuil 3:1, contenu de `data.types` identique avant/après. Résultats et captures dans [apres/validation.md](apres/validation.md).
