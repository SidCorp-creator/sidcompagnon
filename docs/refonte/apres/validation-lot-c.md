# T16 lot C — Sid Coffre

Notes, Documents et Mots de passe reprennent la peau Élan. Le bandeau conserve le nom et le rôle de Sid Coffre ; l’éditeur plein écran reprend aussi cette identité et le bouton Claude. Les lecteurs PDF restent des fenêtres avec leurs commandes de retour, outils et partage.

Les dossiers et listes utilisent les surfaces neutres, des titres sur deux lignes et des commandes distinctes. Les classeurs défilent horizontalement, leur nom complet reste disponible au survol. Le mode d’emploi du scanner vient après la liste. La barre de mise en forme défile horizontalement ; aucune commande n’est retirée. Les sélecteurs natifs de fichiers sont accessibles au clavier. Les codes gardent cinq chiffres ; les options de Face ID et de phrase secrète sont conservées.

## Retouches du lot B

- B17 : séparateurs de milliers et décimales selon la langue, espaces fines insécables entre valeur et unité, y compris dans le Profil, le bandeau et les résultats. Les quantités saisies et stockées ne changent pas.
- B18 : à 320 px, retrait de série en haut à droite, champs sur la ligne suivante.
- B19 : anneau sur `.set-field:focus-within`, unité comprise. Pas de focus automatique.

## Vérifications

Les parcours utilisent uniquement le serveur local et le faux backend. Le jeu de données contient plus de 30 notes, documents et mots de passe, des titres longs et de vrais coffres v2 créés avec les primitives de l’app. Le code est ensuite saisi dans les claviers de l’interface.

Les assertions vérifient le rendu sans écriture de données, la conservation des domaines hors Coffre, l’édition riche et l’enregistrement automatique, le déverrouillage et le reverrouillage des notes secrètes, l’absence de titre secret en clair dans les données, le PDF chiffré dans IndexedDB, son ouverture, les notes de lecture, la génération d’un mot de passe et sa relecture après verrouillage. Un contrôle séparé vérifie les cibles PDF de 44 px et l’enregistrement d’une annotation textuelle.

- Build final réussi : [journal](lot-c-build.log).
- Parcours complet T13 + A/B/C : **17/17 configurations**, réparties en trois groupes ; une reprise après attente explicite du média mouvement réduit : [journal et reprise](lot-c-test.log).
- Après les dernières retouches C (commandes fixes, cibles, traductions), nouveau passage C : **17/17**, aucun débordement de page ou d’éditeur, aucune erreur JS : [journal final](lot-c-test-final.log).
- **363 captures** : [galerie](lot-c.md), [manifest](lot-c-manifest.json). Les 17 parcours incluent l’état des commandes fixes sur une note de 60 lignes. En complément, trois formats vérifient les cibles PDF et l’annotation : [journal](lot-c-pdf.log). Les libellés de classeur contenant guillemets et chevrons restent du texte et gardent leur titre complet, React et secours : [journal](lot-c-escape.log).
- Parité Notes/Documents/Mots de passe FR/EN : [journal](lot-c-smoke-parite.log). Les différences de rendu relevées par le smoke étendu ont été corrigées et leurs sections reprises : [Graphiques](lot-c-smoke-graph-final.log), [Nutrition](lot-c-smoke-nutrition-final.log), [formulaires](lot-c-smoke-forms64-final.log), [photo](lot-c-smoke-wizard68-final.log), [Musculation](lot-c-smoke-mu73-final.log), [photo/galerie](lot-c-smoke-v745-final.log), [commandes fixes](lot-c-smoke-sticky-final.log), [envoi de photo](lot-c-smoke-photo43-final.log).
- Smoke historique décomposé : **mêmes 17 messages hors CSP, aucun nouveau**, [comparaison](lot-c-smoke-comparaison.json). Les rouges connus du coffre/Face ID et des PDF restent signalés ; CSP inchangée. Pour v65, comparaison directe du HEAD servi séparément avec le worktree : [avant](lot-c-smoke-pdf65-baseline-final.log), [après](lot-c-smoke-pdf65-final.log), journaux identiques. L’adaptateur fait défiler le papier avant les gestes : les commandes de 44 px changent la hauteur visible. `tests/smoke.js` reste intact.

Les fontes, la logique de minuterie/journal, les clés de données et les fonctions Supabase ne sont pas modifiées par ce lot. Les fichiers du clavier/code, de Face ID et du coffre renforcé sont inchangés ; les retouches des modules Notes/Documents concernent le rendu et l’accès clavier aux sélecteurs existants.

## Limites

Chromium mobile et viewport de 440 px pour simuler le clavier ; aucun nouvel essai Safari/iPhone physique. Face ID reste un parcours natif non validable par ces captures. Aucun changement des moteurs de chiffrement, du format des données, de la CSP ou des fonctions Supabase. Les captures PNG restent locales. Aucun commit ni push par Codex ; le lot D attend la revue de Claude Code.
