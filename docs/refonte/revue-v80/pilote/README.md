# v80 — pilote d’illustrations, revue V1 en attente

Quatre illustrations originales générées le 2026-11-08 avec l’outil intégré **OpenAI image_gen**, modèle **gpt-image-2 (selon doc Codex)**. Quatre appels, aucune erreur de quota signalée ; aucune API distincte ni achat de crédits utilisé par Codex.

| Exercice | Départ | Phase clé |
|---|---|---|
| Pompes au mur | [pompes-au-mur-0.jpg](pompes-au-mur-0.jpg) | [pompes-au-mur-1.jpg](pompes-au-mur-1.jpg) |
| Curl élastique debout | [curl-elastique-debout-0.jpg](curl-elastique-debout-0.jpg) | [curl-elastique-debout-1.jpg](curl-elastique-debout-1.jpg) |

JPEG progressifs 480×320, chacun inférieur à 40 Ko. [PROMPTS.json](PROMPTS.json) conserve les quatre prompts exacts, la description commune, les références réutilisées, les empreintes et chemins des originaux. Les PNG originaux restent conservés dans le dossier de génération Codex.

Style proposé : même personnage adulte original, haut vert sourd, short anthracite, chaussures grises, fond clair, contours simples ; aucun texte, logo ni élément photographique. Départ et phase clé sont visuellement distincts. Contrôle initial effectué sur les sorties et les quatre JPEG réduits ; la validation indépendante de Claude est encore nécessaire.

Points à vérifier en V1 : alignement du corps et contact des deux mains au mur ; flexion des coudes ; curl sans mouvement du buste ni avancée des coudes ; position des poignets ; continuité de la bande violette et ancrage sous les deux chaussures. L’élastique est dessiné avec des portions doublées au niveau des mains : vérifier que cette représentation reste claire à 480×320 et compatible avec la fiche.

Ces fichiers sont uniquement des éléments de revue : aucune entrée dans `SIDFIT_IMG`, `SIDFIT_ILLUS`, `SOURCES.json` ; aucun changement de `help` ni de `MISSING.json`. Pas de déploiement. La suite par lots de quatre exercices attend la validation de ce pilote.
