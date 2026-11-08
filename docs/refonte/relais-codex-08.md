# v76 — revue ciblée et libellé des pièces

Base demandée : `c766405`, branche `v76-codex-2`. Aucun changement de 07, 09, 32 ou i18n.js.

## Libellé nutrition

39 affiche maintenant `Œuf moyen ≈ 50 g (estimation)` pour la référence mémorisée `moyen, estimé`, et `Medium egg ≈ 50 g (estimate)` en anglais. L'indication de saisie en grammes reste présente. Les mentions estimatives sont retirées de la référence affichée avant l'ajout de l'indication finale, sans modifier la référence stockée, les quantités ou les nutriments. Les références détaillées et les calibres personnalisés restent affichés.

Les deux versions sont construites avec T3(fr,en), donc aucune nouvelle clé à fusionner dans i18n.js. Vérification directe FR/EN sur la référence fautive, tests des unités nutrition et build : OK.

## Revue

- **742b6b1 / 09** : la date sélectionnée suit le nouveau jour uniquement si elle suivait le jour précédent ; un autre jour sélectionné reste conservé. Le retour au premier plan s'appuie aussi sur le gestionnaire existant de 46 qui appelle renderPlan/renderStats. Aucun défaut supplémentaire identifié dans cette correction ciblée.
- **a09b47c / 32** : historique borné sous le plafond serveur, sélection de note par id et compte, contrôle de compte à réception : corrections cohérentes. Les fenêtres d'attente avant envoi (consentement/jeton) et le temporisateur utilisant le contrôleur global restaient présents dans ce commit ; **57a397b les corrige**. Conserver ce correctif postérieur dans l'intégration. Rien n'a été réécrit dans 32.
- **c766405 / 07** : le démontage React avant innerHTML corrige la racine détachée. Le contre-test réel détaillé/simple/détaillé/simple/détaillé avait confirmé l'alternance correcte sans rechargement.

Les tests Agenda minuit et accueil sont relancés sur l'aperçu isolé du worktree (8876/8890), sans données réelles. Résultats : Agenda minuit React et secours OK ; accueil FR React, FR secours et EN React OK.
