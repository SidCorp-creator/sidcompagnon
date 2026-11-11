# v83 — bilan préparatoire

Base : main d258538 (v82.1 en production). Branche d'intégration : v83-codex.

- PDF : texte sélectionnable et copiable en lecture ; indication neutre si aucune page ne contient de texte sélectionnable. Pas d'OCR ajouté.
- PDF : Annuler défait un geste, dans l'ordre inverse : ajout, gomme/suppression, déplacement/redimensionnement. Historique de session vidé à l'ouverture ; suppression synchronisée pour éviter le retour des annotations annulées.
- Nutrition : état cru/cuit/non précisé conservé, fiches Ciqual cuites prioritaires, rendements de secours bornés et sourcés. Voir [nutrition.md](nutrition.md).
- Menus : budget par repas ou reste de journée, demande figée, aperçu complet, confirmation distincte du journal consommé. Validation client + Edge + MCP ; un seul essai de réparation automatique d'une proposition invalide.

APP_V 83 ; BUILD et CACHE sidnote-v83 ; build effectué.

Vérifications : voir [journal.md](journal.md). Suite finale intégrée en cours de préparation ; la publication attend son résultat et la relecture croisée.

Les tests simulent le fournisseur IA. Une réponse réelle de Groq reste à vérifier sur les deux demandes de Sid après autorisation du déploiement des fonctions.

Aucun déploiement ni publication effectué. À faire valider par Sid : déployer `sidbot` et `mcp` (avec le module partagé), puis publier le client v83. Le nouveau serveur doit précéder le client pour accepter `save_menu`. Aucun changement de schéma SQL.
