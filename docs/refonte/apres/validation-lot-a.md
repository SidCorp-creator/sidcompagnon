# T16 — lot A : Tâches et Focus

Intégration locale après l’aperçu 87897d9. Aucun commit ni push par Codex ; aucun passage au lot B avant la revue visuelle de Claude.

## Ce qui change

- Tâches : polices et jetons Élan, contrôles de 44 px et poignées de 16 px de large, lignes de 56 px minimum, titres longs sur plusieurs lignes, catégories et sections en suspens/réalisées. Calendrier à sept colonnes, jours sélectionnés signalés par un fond plein et une graisse forte. Les IDs, traitements de catégorie, recherche, planification et glisser-déposer restent présents.
- Progression Tâches : tâches réalisées aujourd’hui, rapportées aux tâches disponibles aujourd’hui (sans date ou prévues/reportées aujourd’hui) et à celles réalisées aujourd’hui ; suspens et jours futurs exclus. L’ancienne barre intermédiaire est conservée dans le DOM mais masquée, pour éviter un doublon avec le bandeau.
- Focus : réglages de durée/rythme, programme, chrono, commandes, musique et statistiques avec la même charte. Une action principale par état : Démarrer puis Pause/Reprendre ; Passer, arrêter et Spotify sont secondaires. Le démarrage ramène le chrono en haut du contenu.
- La barre Focus exprime la **position dans le programme**, pauses prévues comprises, avec une mention de la session. Elle reste linéaire pendant le déroulement et sur Passer ; le rebond est réservé à la transition naturelle. La position finale d’une session terminée reste affichée tant qu’une autre n’est pas démarrée/configurée ; ce souvenir d’affichage est seulement en mémoire, jamais dans les données.
- Le bandeau suit la partie visible du viewport mobile après le clavier et le défilement, pour conserver logo/nom/rôle/Claude. Les réglages des conversations et Nutrition restent pour les lots D/B.

## Arbitrages de charte intégrés par Claude

- § 10 Focus : position dans la session, libellée comme telle ; la logique existante de Passer et du journal reste inchangée. Le test couvre aussi le saut du dernier cycle, sans rebond.
- § 6 calendrier : sous 360 px, cellules de 44 px de haut et au moins 36 px de large, sans espace mort. À 320 px, la grille utilise environ 40 px par jour. Aux tailles supérieures contrôlées, au moins 44 px sur les deux dimensions.

## Vérification

**Build et `npm test` réussis : 17/17 configurations, aucune erreur JS ni débordement horizontal.** 136 captures propres au lot A dans [lot-a.md](lot-a.md), en plus des captures du parcours T13. [Journal des tests](lot-a-test.log), [build](lot-a-build.log), smoke ciblé [Tâches](lot-a-smoke-todo.log) et [Focus](lot-a-smoke-focus.log) : aucun échec.

Le scénario compare le payload complet hors `ui` avant et après des rendus Tâches/Focus sans action ; il doit être identique. Après les interactions, tous les domaines hors tâches/catégories, état/journal Focus et préférence de vue des tâches doivent rester identiques. Chiffrement, mémoire, fusion, rappels et correspondance du shell généré sont aussi contrôlés par `npm test`.

Les scénarios Tâches couvrent catégorie, coche, ordre par poignée, suspens/reprise, calendrier/liste des réalisées, recherche, ajout et nouvelle catégorie. Ceux de Focus couvrent démarrage, pause/reprise, position 5 min sur 1 h, Passer, transition naturelle, arrêt confirmé, fin naturelle et saut du dernier cycle. Spotify garde son consentement au chargement et la possibilité de le retirer ; son contenu externe est simulé dans les tests.

Sur Chromium mobile 1.48, le contrôle de cible de Playwright peut refuser un clic lorsque `visualViewport.offsetTop` est non nul après un défilement. Le test utilise alors le clic physique sur le rectangle mesuré et vérifie le résultat réel de l’action, au lieu de forcer l’événement DOM. Le même ajustement est explicite dans le lanceur du smoke adapté ; `tests/smoke.js` reste inchangé.

Les captures utilisent un rectangle de viewport explicite et attendent la fin des transitions. Le scénario vérifie que le nom et le rôle de l’app restent à l’intérieur de la zone visible après défilement. Le changement de préférence de mouvement réduit attend également le rafraîchissement du navigateur avant de mesurer le style calculé.

Le smoke complet reste prévu à la fin du lot E ; les scénarios ciblés de parité v54 (Tâches) et v55 (Focus) ont été exécutés sur ce lot. Le rouge historique de T13 n’est pas corrigé ici. Les captures restent locales, hors versionnement, avec données fictives. Le clavier est simulé ; ce lot n’a pas encore été essayé sur iPhone réel.

## Reprise après la revue A1–A12

Les corrections sont détaillées dans la section Codex du [compte rendu](../revues.md). Les captures de cette galerie sont régénérées après correction. Les assertions supplémentaires contrôlent le repli global, les filtres limités à 200 px, la taille des en-têtes, le bandeau initial traduit et vide, la visibilité de Démarrer au-dessus de la navigation, les heures HH:MM, le remplissage partiel et les intervalles de 4 px du programme, ainsi que le cadran atténué en pause.

Nouvelle exécution complète du 6 novembre 2026 après corrections : **17/17**, 136 captures régénérées, aucun échec des smoke ciblés Tâches/Focus. Le lot B reste en attente de la revue visuelle de Claude.
