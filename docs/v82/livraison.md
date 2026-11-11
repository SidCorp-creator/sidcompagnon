# Sid'Compagnon v82

Base de production : v81.1 (`2605993`). La branche v82 part de `d25b94d`, qui ajoute les deux retouches de texte encore non publiées : Vercel dans les Réglages et notes secrètes dans le message de mot de passe réinitialisé.

## Compteur du planning

Le bandeau de notifications disparaît. Une pastille rouge apparaît sur le logo de Sid'Journée dans le lanceur (simple ou détaillé) et dans l'en-tête de cette app. Elle compte les événements du planning du jour, y compris ceux déjà passés et les cours des calendriers reliés ; les tâches et événements annulés ne comptent pas. À zéro, la pastille est masquée. Elle se recalcule après les changements du planning, au retour dans l'app et au changement de jour. Elle n'apparaît pas dans les autres apps ni sur les logos de navigation. Son nombre est également disponible en français et en anglais pour les lecteurs d'écran.

## Notes et Focus

Projets est retiré de la navigation, des écrans et des actions. Les notes restent dans Notes et les séances dans Focus ; les anciennes données de projets et leurs rattachements sont conservés sans être affichés.

Les pages de l'éditeur s'empilent verticalement avec un défilement continu. Les boutons de navigation horizontale sont retirés. Une forme CSS réserve les espaces entre les feuilles : le navigateur y répartit les lignes, même dans un paragraphe long, sans ajouter de sauts ou d'éléments au contenu éditable. Le format enregistré, le texte brut, les liens, la mise en forme et l'export PDF sont conservés. Les pièces jointes gardent leur stockage et leur lecteur.

## Validation

Les résultats de l'intégration sont consignés dans [le journal](journal.md). Les tests ciblés contrôlent le compteur, sa disparition à zéro, son isolation, minuit, l'anglais, l'absence de Projets et la conservation des données, ainsi que les notes multipages, la sélection entre pages, le collage riche, l'annulation native, le curseur visible et le redimensionnement.

Le contrôle navigateur utilise Chromium, avec viewport mobile et clavier simulé. Safari réel n'est pas vérifié. Le test de fumée historique échoue sur le même sélecteur `data-gapp="undefined"` sur la base `d25b94d` et la branche v82 ; cet échec n'est pas corrigé dans ce lot.

La v82 n'est pas publiée par Codex. La publication revient à Claude après validation et accord de Sid. Aucune purge de données des autres comptes n'est effectuée dans ce lot.

Validation finale du code `68fb840` : quinze configurations Élan vérifiées (quatorze lors de la matrice, puis le cas 1 280 px sombre avec le rendu de secours relancé après fiabilisation des mesures Focus). La relance de `npm test` avec ce cas sort à zéro et exécute ensuite tous les tests ciblés du lanceur avec succès. L’accessibilité des tuiles et du nombre de la pastille est vérifiée sur le nom exposé au lecteur d’écran. Les rapports initial et de relance restent distincts pour conserver l’historique.
