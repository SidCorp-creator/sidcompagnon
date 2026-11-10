# Sid’Nutrition v81 — relevé Codex

Je propose Open Food Facts pour les produits emballés et Ciqual 2025 pour les aliments génériques. L’analyse IA actuelle reste disponible pour les recettes et les saisies qui demandent une estimation. Les résultats devraient afficher leur source et demander une quantité dans l’unité effectivement fournie.

## Requêtes effectuées

Open Food Facts v3.6, par code-barres, champs `nutrition.aggregated_set.nutrients`. Ce schéma donne la valeur, l’unité, la base de mesure et la provenance du nutriment. L’ancien champ `nutriments` appartient à v2. Les quatre réponses contenaient l’énergie et les trois macros.

| Code | Résultat | kcal et base | Portion |
|---|---|---|---|
| 3017620422003 | Nutella | 539 / 100 g | Champ absent. 150 g donnent 808,5 kcal. |
| 5449000000996 | Coca-Cola Original | 42,4 / 100 ml | 330 ml déclarés, soit 139,92 kcal à partir de la valeur renvoyée. |
| 5410126116953 | Biscoff Smooth, pâte à tartiner | 584 / 100 g | 20 g déclarés. Le code correspond à la pâte à tartiner. |
| 5411188080213 | Alpro, alternative au yaourt au soja nature | 51 / 100 g | Champ absent. |

La recherche catégorielle sur Boni Selection, pains, Belgique a retourné 19 résultats en v2. Les cinq premiers incluaient les toasts complets `5400141388275` avec 7,5 g déclarés et les petits pains complets `5400141323344` avec 75 g déclarés. La requête équivalente Delhaize a renvoyé HTTP 503. Une tranche demande son poids quand la source ne fournit pas de portion équivalente. La recherche libre v3.6 a aussi renvoyé HTTP 503. Le service Search-a-licious a trouvé Pain breughel gris Delhaize, code 2082680002497. Sa fiche indique 278 kcal/100 g sans poids par tranche. Le service de recherche ne renvoie pas l’en-tête CORS pour le navigateur de Sid’Compagnon. [Documentation Open Food Facts](https://openfoodfacts.github.io/documentation/docs/Product-Opener/api/)

Le XLSX officiel Ciqual est accessible via l’API publique du dépôt de données. Lecture directe du classeur. Riz basmati cuit sans sel, code 9125, 148 kcal/100 g, soit 222 kcal pour 150 g. Filet de poulet grillé ou poêlé, code 36018, 141 kcal/100 g. Frites de pommes de terre cuites en friteuse, code 4032, 258 kcal/100 g. La dénomination de cette dernière entrée correspond à des frites surgelées. La recherche sur « carbonnade » et « carbonade » n’a trouvé aucun intitulé dans le classeur. Pomme, chair et peau, crue, code 13039, 54 kcal/100 g. L’index local conserve 3 006 entrées qui renseignent l’énergie et les trois macros. [Classeur officiel Ciqual](https://entrepot.recherche.data.gouv.fr/api/access/datafile/666260)

## Conditions d’intégration

- Open Food Facts fournit des données collaboratives, avec fabricant, emballage ou estimation selon les nutriments. Lecture sans clé, User-Agent identifié, 15 lectures produit/minute/IP et 10 recherches/minute/IP. Prévoir une recherche sur validation et un message d’indisponibilité pour 429/503. Respecter l’attribution et l’ODbL pour les réutilisations de la base. Un relais serveur permet de définir le User-Agent et partagerait le quota par IP de sortie. [API officielle](https://openfoodfacts.github.io/documentation/docs/Product-Opener/api/)
- Ciqual fournit 3 484 aliments et 74 constituants, avec moyenne pour 100 g. Licence Ouverte avec mention de l’Anses et de la version. Un index statique dérivé du XLSX permet la recherche par nom sans compte ni quota. Garder les valeurs manquantes et les limites de quantification distinctes de zéro. [Table Ciqual 2025](https://ciqual.anses.fr/cms/en/2025-anses-ciqual-table) · [Licence](https://ciqual.anses.fr/cms/fr/mentions-legales)
- FatSecret propose un plan gratuit américain à 5 000 appels/jour et un plan Premier gratuit sous conditions qui reste américain. Les marchés France et Belgique et la localisation demandent le Premier commercial sur devis. Les fonctions et droits de mise en cache dépendent de l’édition. Vérification documentaire, sans accès au jeu commercial. [Tarifs](https://platform.fatsecret.com/api-editions) · [Localisation](https://platform.fatsecret.com/docs/guides/localization)
- USDA FoodData Central fournit une API à clé, 1 000 requêtes/heure par défaut et des données CC0. Le test DEMO_KEY a donné zéro résultat pour l’EAN Nutella et une fiche anglophone de riz cuit avec ajout de matière grasse pour « riz basmati cuit ». [Guide de l’API](https://fdc.nal.usda.gov/api-guide/)
- Edamam propose recherche par nom et code-barres, mesures et macros via identifiants applicatifs. Le plan Basic affichait 14 USD/mois, 100 000 appels mensuels et 50 requêtes nutrition par minute. Les droits de conservation des macros dépendent du plan. Couverture FR/BE non mesurée. [Tarifs](https://developer.edamam.com/food-database-api) · [API](https://developer.edamam.com/food-database-api-docs)
- Nutritionix utilise une paire App ID / App Key et fournit des essais sur demande. Prix, quotas, droits de réutilisation et couverture FR/BE à confirmer avec leur équipe. [Accès développeur](https://developer.nutritionix.com/) · [Authentification](https://developer.nutritionix.com/docs/v2/authentication)
