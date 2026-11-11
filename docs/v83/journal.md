# v83 — journal

## Reprise C+D
- Base d258538, branche v83-codex ; Claude prend PDF, Codex nutrition et intégration.
- Menu prévu distinct du journal consommé : aperçu, validation commune, confirmation explicite.
- Pesée cru/cuit/non précisé conservée par ingrédient ; fiche cuite Ciqual prioritaire.
- Fonctions Edge préparées seulement ; déploiement et publication soumis à Sid.

## C+D — lot à relire
- Contrat commun client / Sid'Bot / MCP : menu prévu, budgets et pesée figés, confirmation séparée du journal.
- Cru/cuit conservé ; Ciqual cuit utilisé pour riz et poulet pesés ; deux rendements de secours sourcés et bornés.
- Build et types OK ; tests contrat, handler MCP, unités, serveur Sid'Bot et actions notes OK.
- Navigateur : 390 React et 1280 secours OK (983 kcal, deux repas/restant, reprise, riz + poulet).
- Modèle simulé, aucun déploiement ; détails et limites dans nutrition.md.

## Vérification C+D — 950590d
- `ELAN_CASE=390-dark-react-fr npm test` : terminé, code 0 (suite complète, une configuration Élan).
- Parcours nutrition supplémentaire 390 React EN : vert ; FR 390 React / 1280 secours relancés verts.
- Aperçu contrôlé visuellement à 390 px, sans débordement horizontal.
- Relecture A+B : signalé à Claude le faux message « scan » si le texte commence après les quatre premières pages.
- En attente de relecture croisée et du correctif PDF final avant intégration/version 83 ; rien déployé.

## Relecture C+D — quatre points traités
- Relance automatique bornée à deux appels fournisseur au total ; un quota réservé ; erreur explicite si encore invalide.
- Tests serveur et programme : verts, aucune relance ajoutée aux programmes.
- FR/EN et secours : chemin mémoire vide → Sid'Bot testé, état cuit/180 g gardé dans le journal.
- Aperçu = enregistrement (1 et 2 repas) ; huile : 10 g/90 kcal puis 20 g/180 kcal, cuillères seulement à l'affichage.
- PDF 9c9875d relu : toutes les pages vérifiées, formulation neutre ; intégration à suivre.
