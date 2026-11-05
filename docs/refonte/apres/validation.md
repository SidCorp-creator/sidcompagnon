# Validation T13 — Élan

Intégration locale sur `refonte-tech`, version 75.0. Aucun push, aucune fusion, aucune mise en ligne. Serveur de revue : http://localhost:8766 (backend fictif de `tests/serve.js`).

## Livrable

Fondations partagées, accueil et parcours Agenda complet, en React et en secours. Polices locales (18 faces latin/latin-ext, 337 040 octets, licences OFL), jetons clair/sombre et par app, logos fournis, noms affichés, suppression de l’application d’ident.css et du réglage Unique/Sobre. Les anciennes préférences restent enregistrées. Le calendrier complet et la recherche restent dans le volet « Calendrier et toutes les dates ».

Le bouton Claude ouvre la conversation conservée de l’app ; les réglages de connexion restent accessibles. Ajout avec validation, horaires et rappel ; fermeture avec retour du focus ; confirmation et annulation ; compte d’accueil actualisé. La progression exprime faites/total et se recale à l’ajout sans simuler un effort accompli.

Les autres écrans reçoivent les fondations et restent accessibles ; leur mise en page détaillée est le lot suivant. Les clés, formats de sauvegarde/chiffrement, globals SIDFIT, CSP et fonctions Supabase restent inchangés.

## Vérifications

- `npm --prefix app run build` : réussi.
- `npm test` : cinq vérifications techniques (chiffrement, mémoire, fusion, rappels, génération shell) et quinze configurations du parcours. **Réussi : 15/15, aucune erreur.** [Sortie complète](npm-test.log).
- Captures et mesures : [index](index.md), [manifest détaillé](manifest.json). React et secours, clair/sombre, 390/1280 px ; 320 px pour le formulaire ; tablette 900 px ; EN/NL. Contenu long et liste dense, focus, mouvement réduit, absence de débordement et d’erreur JS ; couleurs calculées des bandeaux, rôles, bouton Claude et puces.
- Le clavier est simulé par une hauteur de viewport de 440 px. Le preset iPhone tourne sous Chromium : Safari et le clavier iOS réels restent à vérifier sur appareil.

## Smoke historique

`tests/smoke.js` reste intact. Ses attentes d’interface retirées par décision de Sid (identités par fonction, Unique/Sobre, champs Claude, anciens noms, navigation tablette avant 1024 px) ne décrivent plus Élan. `tests/smoke-elan.cjs` adapte explicitement ces attentes en mémoire et conserve les autres scénarios ainsi que leurs erreurs. Il ouvre aussi le volet du calendrier historique avant ses scénarios. Les contrats du nouveau parcours sont vérifiés séparément par `tests/elan.js`.

Les scénarios adaptés ont été exécutés en trois blocs contigus (`ELAN_SMOKE_SECTION=debut`, `v45`, `suite`), couvrant l’ensemble du smoke historique. **Aucun nouveau message d’échec fonctionnel après correction**. Le smoke reste rouge ; il ne faut pas le déclarer vert.

| Famille | Avant | Après |
|---|---|---|
| v38 coffre / Face ID | 3 messages fonctionnels | mêmes 3 |
| v44.7 import / annotations PDF mobile et PC | 8 messages fonctionnels | mêmes 8 |
| v45 affichage PDF mobile et PC | 2 messages fonctionnels | mêmes 2 |
| v65 PDF / zone sélectionnée mobile et PC | 4 messages fonctionnels | mêmes 4 |
| CSP `unsafe-eval` | présente | présente, nombre/profil variables |

Les 17 messages fonctionnels sont identiques avant/après. Les occurrences CSP se déplacent parfois entre profils ou se répètent selon la temporisation ; la directive et le type d’erreur restent les mêmes. Ni la CSP ni ces défauts historiques ne sont corrigés dans T13.

Preuves : [avant brut](smoke-avant.log), après [début à v44.7](smoke-apres-debut.log), [v45](smoke-apres-v45.log), [v46 à v74.5](smoke-apres-suite.log), [comparaison structurée](smoke-comparaison.json). Référence : [validation initiale](../validation-technique.md).

Régressions corrigées pendant la vérification : cibles déplacées par la réduction du bandeau sur desktop (flux stabilisé et taille conservée entre appui et clic), priorités des jetons clairs/app, parité DOM accueil/bandeau et trait de l’aperçu d’ajout. Le contrôle semaine/année de Nutrition et l’héritage des trois couleurs sont ajoutés au parcours automatisé.

## Clarifications de charte

Claude a intégré dans la source les précisions demandées : le compact conserve logo/nom/rôle/Claude ; ajouter n’est pas progresser ; poids réel des fichiers de police. Aucun écart supplémentaire autorisé ou revendiqué.


## Relecture visuelle — 14 corrections

Les points de la revue Claude sont résolus dans [la section Codex correspondante](../revues.md#codex--corrections-de-la-revue-visuelle-t13). Les 15 configurations du parcours passent après correction ; les quatre configurations desktop sont recapturées après le dernier réglage de largeur du nom de la suite. Les tests ciblés du smoke v58 (accueil), v61 (navigation) et v69 (messages) passent sans erreur. Le smoke complet n’est pas relancé pour ces retouches de rendu ; sa comparaison historique ci-dessus reste le bilan de T13 avant cette relecture.

Les captures FR emploient maintenant `fr-BE` à la fois dans le contexte Playwright et dans le processus Chromium (`--lang` et environnement), avec les contextes EN/NL en `en-GB`/`nl-BE`. Rendu natif vérifié visuellement à 320 px : date 05/11/2026, heures 16:00 et 17:00. Même réserve sur Safari et clavier iOS réels.

Les données `data.types[].c` et le réglage des couleurs sont préservés ; seul le point coloré des pastilles de type de la feuille est masqué. Les rappels et les boutons de bascule conservent leurs actions.


## Arbitrage suivant : palette de types

La solution provisoire de pastilles neutres au point #9 ci-dessus est remplacée, sur décision explicite de Claude : les couleurs restent visibles dans le formulaire et l’Agenda. `--c-event` vaut désormais `#0F8B8D` pour tous les types qui le référencent ; aucune donnée n’est modifiée. Contraste du point : 3,49 minimum sur surfaces claires et 3,48 sur surfaces sombres (3,47 sur app-soft clair de Journée). Les autres teintes n’ont pas changé ; [audit et propositions](../palette-types.md) attendent leur validation.

Build et `npm test` après ce changement de palette : réussis, 15/15 configurations et 94 captures régénérées. Les scénarios contrôlent aussi le maintien des données de types à l’identique.


## Palette finale validée

Les remplacements proposés sont désormais tranchés et appliqués : Cours olive, Mémoire framboise, x4 brun désaturé ; x1 et x3 conservés. [Table finale et mesures](../palette-types.md). Brun x4 : 5,22:1 / 5,66:1 minimum, sans ajustement. Les 11 jetons sont contrôlés sur leurs valeurs calculées et sur le seuil graphique de 3:1 dans chaque thème ; les données de types restent identiques. Cette table remplace les propositions provisoires mentionnées plus haut.

Palette finale : `npm test` réussi, 15/15 configurations, 11 valeurs de jetons contrôlées dans chacune, 94 captures actualisées. [Sortie complète](palette-finale-test.log).
