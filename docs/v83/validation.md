# v83 — validation finale

Code produit : `2612e6f`. Correction du test CSP, sans changement de l’application : `1d3a05a`.

## Résultat exact

- Build et vérification des types : verts ; APP_V 83 et BUILD/CACHE sidnote-v83 cohérents.
- La commande `npm test` sans filtre a passé les 15 configurations Élan, les tests PDF, le contrat menus, le handler MCP et les unités nutrition, puis a terminé en code 1 sur une attente Playwright bloquée par la CSP du serveur de test.
- L’attente a été remplacée dans le test uniquement : appels fonctionnels `evaluate` depuis une attente côté Node, avec diagnostic de l’état réel sur timeout. La CSP n’a pas été modifiée.
- Test nutrition corrigé relancé sur les serveurs 8766 et 8953 : les trois parcours (390 React FR, 1280 secours FR, 390 React EN) passent sur chacun, code 0.
- Tous les parcours restants ont ensuite été exécutés, dans le même ordre que le runner, code 0 : Sid’Bot, accueil, agenda-minuit, chrono-persistant, muscu-chrono, nutrition-catalog, notes-v81, sidnote-claude, notif-planning.
- Contrôles serveur supplémentaires : sidbot-serveur, sidbot-note-actions et sidbot-programme verts. Aucune modification du produit depuis la matrice complète.

Il s’agit donc d’une couverture complète validée en plusieurs exécutions après correction du test, et non d’une première commande `npm test` annoncée à tort comme réussie.

## Matrice Élan

| Configuration | Résultat |
| --- | --- |
| 390-dark-react-fr | OK |
| 390-dark-secours-fr | OK |
| 390-light-react-fr | OK |
| 390-light-secours-fr | OK |
| 1280-dark-react-fr | OK |
| 1280-dark-secours-fr | OK |
| 1280-light-react-fr | OK |
| 1280-light-secours-fr | OK |
| 900-dark-react-fr | OK |
| 320-dark-react-fr | OK |
| 320-dark-secours-fr | OK |
| 320-light-react-fr | OK |
| 320-light-secours-fr | OK |
| 390-dark-react-en | OK |
| 390-light-react-en | OK |

## Cas v83

- PDF : sélection souris, copie/collage et retours à la ligne, 1280 et 390 px ; annulation des ajouts, gomme/restauration et déplacement, persistance après réouverture ; PDF original inchangé.
- PDF sans texte : vérification de toutes les pages ; couverture 1–4 sans texte puis texte page 5 reconnue correctement.
- Nutrition : riz basmati cuit (180 g, 266 kcal), poulet filet grillé (180 g, 254 kcal), source Ciqual et état cuit conservés.
- Local absent : mémoire vide → Sid’Bot → confirmation → journal, mention cuit et 180 g conservés.
- Menu dîner 983 kcal, wrap/viande hachée/frites au four après cuisson : aperçu par ingrédient, aucune écriture avant confirmation, reprise après rechargement, aperçu égal au menu enregistré.
- Deux repas : budget restant de 1400 kcal réparti, totaux enregistrés égaux à l’aperçu.
- Huile : calcul sur 10 g/90 kcal puis 20 g/180 kcal, indépendamment des cuillères affichées.
- Proposition hors budget : une réparation automatique, deux appels fournisseur maximum, une réservation de quota ; erreur explicite si encore invalide.

Le fournisseur IA est simulé. La qualité d’un menu réel de Groq reste à contrôler après déploiement autorisé des fonctions ; les validations et les écritures après confirmation ont été testées sans compte réel.
