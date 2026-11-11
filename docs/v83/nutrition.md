# v83 — nutrition : pesée et menus

## Comportement

- Choix cru / cuit / non précisé pour le repas saisi et par type de menu. Le choix et la demande de menu restent enregistrés jusqu'à confirmation, y compris après rechargement. Un bouton permet de reprendre une demande.
- Une phrase simple pesée (ex. « j'ai pesé 180 g de riz basmati cuit ») cherche d'abord une fiche Ciqual dans le même état de cuisson. Le résultat donne le nom exact de la fiche et sa source, puis attend confirmation. Pas de conversion cru/cuit implicite.
- `save_menu` prépare un menu prévu, sans ajouter de repas au journal. L'aperçu détaille chaque ingrédient, masse, état de pesée et kcal, puis le total du repas. L'ajout au journal reste une action ultérieure distincte.
- Chaque demande fige son identifiant, la date, les créneaux, budgets, préférences et exclusions. Le contrat partagé valide client, Sid'Bot et MCP : nombre et ordre des repas, créneaux, masses positives, valeurs finies, état compatible et budget par repas (tolérance 5 %, minimum 30 kcal pour l'arrondi).
- Journée complète et reste de journée sont distincts. Plusieurs repas partagent le budget choisi ; le budget d'un seul dîner ne devient pas un objectif quotidien. Les consignes demandent g + kcal par ingrédient, huiles/sauces comprises, et conservent les aliments et modes de cuisson demandés.
- Les champs `weight_state`, `cooking_method`, `source`, `estimated`, `yield_factor`, `yield_source` sont gardés dans le menu et le journal, aussi via MCP. Les anciennes données ne sont pas converties en masse cuite.

## Références et rendements

Priorité à [Ciqual 2025, Anses](https://doi.org/10.57745/RDMHWY) : riz basmati cuit 9125 (148 kcal/100 g), poulet filet sans peau grillé/poêlé 36018 (141 kcal/100 g). Le poulet grillé n'est pas donné pour une référence « viande hachée au four ». Le prompt précise de n'employer une fiche que si l'aliment et la cuisson correspondent.

À défaut de fiche cuite, seuls deux rendements sont admis, avec méthode bouillie, source exacte et `estimated:true` :

| Aliment précis | Masse cuite / masse crue | Référence |
| --- | --- | --- |
| Riz blanc long poli, bouilli (pas complet, étuvé ou riz rond) | 2,98 | [Bognár 2002, tableau 29, page PDF 38](https://www.fao.org/uploads/media/bognar_bfe-r-02-03.pdf#page=38) |
| Pâtes de blé dur sans œufs, bouillies | 2,10 | [Bognár 2002, tableau 30, page PDF 39](https://www.fao.org/uploads/media/bognar_bfe-r-02-03.pdf#page=39) |

Il s'agit de rendements de masse, pas d'une garantie de rétention nutritionnelle. L'app ne reconvertit pas automatiquement les calories avec ces facteurs. Une composition estimée proposée avec rendement reste marquée « estimation ». Aucune règle universelle riz ×3 ou viande ×0,75 : pertes d'eau et de graisse dépendent de la préparation, comme l'explique aussi [USDA, Cooking Yields for Meat and Poultry](https://www.ars.usda.gov/ARSUserFiles/80400525/data/retn/usda_cookingyields_meatpoultry.pdf). Hors des deux cas documentés, demander une précision ou utiliser une composition cuite correspondante.

## Vérification et déploiement

Tests hors ligne : contrat partagé, véritable handler MCP sur données simulées, parcours navigateur React 390 px et secours 1280 px. Cas : riz + poulet cuits, dîner wrap/viande hachée/frites au four à 983 kcal, deux repas partageant 1400 kcal restantes, aucune écriture avant confirmation, reprise après rechargement.

Le transport du modèle est simulé : ces tests ne démontrent pas la qualité d'une réponse réelle de Groq. Les contraintes sémantiques d'aliments et de cuisson sont explicites dans le prompt et l'aperçu ; la validation structurelle ne prouve pas qu'une recette respecte toutes les exclusions en langage libre.

Fonctions Edge `sidbot` et `mcp` préparées sans déploiement. La nouvelle action `save_menu` exige le nouveau serveur avant mise en ligne du client. Publication et déploiement attendent l'accord de Sid après relecture croisée.
