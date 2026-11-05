# Validation T2 / T3

5 novembre 2026 ; worktree `~/sidcompagnon-codex`, branche `refonte-tech`, référence `3d783f9`.

- Inventaire AST PostCSS reproduit ; 2 299 règles ordinaires, 125 déclarations importantes dans app/design/ident.css. Le JSON contient les références des mesures.
- Captures : 84 / 84, 21 états × iPhone 13 / ordinateur × clair / sombre. Aucun état manquant, aucune erreur `pageerror`. Manifest dans `avant/manifest.json`.
- Échantillons examinés visuellement : musculation remplie (iPhone sombre), dossier Notes (iPhone clair), menu Nutrition (ordinateur sombre), liste Agenda dépliée (iPhone sombre). Date de fin incorrecte dans une fixture corrigée avant la dernière génération.
- `node --check` : deux scripts ajoutés valides.
- `shell.test.js` : correspondance des 47 sources avec app.js OK.
- `merge.test.js` : fusion, 5 000 cas identiques, OK.
- `crypto.test.js` : interchangeabilité ancien/nouveau chiffrement OK.
- `memory.test.js` : 6 tests OK.
- `rappels.test.js` : 7 tests OK.
- `smoke.js` : **échec (code 1)** après environ 15 minutes ; exécution directe, fichier inchangé, serveur et faux backend propres. Échecs dans les scénarios coffre/Face ID v38 et PDF v44.7/v45/v65 ; plusieurs messages CSP interdisant `unsafe-eval`. Résultat mesuré sur la référence sans modification des sources de l’app ; origine exacte (app, fixture ou environnement Chromium) non isolée. Ne pas considérer cette référence comme entièrement verte. Aucun affaiblissement de la CSP effectué.

Environnement navigateur : `NODE_PATH=/tmp/refonte-tools/node_modules:/home/sidki/sidcompagnon/app/node_modules`, `LD_LIBRARY_PATH=/tmp/refonte-libs/usr/lib/x86_64-linux-gnu`. Playwright 1.48.2 et Chromium 1140 ; bibliothèques manquantes extraites sans sudo. Ces chemins temporaires sont propres à cette session.

Aucune modification de l’app, aucun build requis pour ce lot documentaire, aucun push ni déploiement. Aucun accès au backend réel. Les changements et captures sont laissés non indexés : commit tenté puis abandonné, faute d’identité d’auteur Git configurée ; aucune configuration Git modifiée.

## Sortie complète du test de fumée

```text
Aperçu : http://localhost:8766  (faux Supabase sur :8790, Ctrl+C pour arrêter)
ERREURS :
v38 : coffre pas créé
v38 : Refused to evaluate a string as JavaScript because 'unsafe-eval' is not an allowed source of script in the following Content Security Policy directive: "script-src 'self'".

v38 : Face ID ne s'ouvre pas tout seul
v38 : bouton Face ID absent sur le clavier du code
v44.7 PDF mobile : le PDF ne s'affiche pas
v44.7 PDF mobile : note PDF mal créée (dossier, pages)
v44.7 PDF mobile : annotations pas retrouvées à la réouverture
v44.7 PDF mobile : Refused to evaluate a string as JavaScript because 'unsafe-eval' is not an allowed source of script in the following Content Security Policy directive: "script-src 'self'".

v44.7 PDF mobile : PDF ou annotations perdus après rechargement
v44.7 PDF pc : Refused to evaluate a string as JavaScript because 'unsafe-eval' is not an allowed source of script in the following Content Security Policy directive: "script-src 'self'".

v44.7 PDF pc : le PDF ne s'affiche pas
v44.7 PDF pc : note PDF mal créée (dossier, pages)
v44.7 PDF pc : annotations pas retrouvées à la réouverture
v44.7 PDF pc : Refused to evaluate a string as JavaScript because 'unsafe-eval' is not an allowed source of script in the following Content Security Policy directive: "script-src 'self'".

v44.7 PDF pc : PDF ou annotations perdus après rechargement
v45 mobile : PDF pas affiché
v45 pc : Refused to evaluate a string as JavaScript because 'unsafe-eval' is not an allowed source of script in the following Content Security Policy directive: "script-src 'self'".

v45 pc : PDF pas affiché
v65 mobile : PDF pas affiché
v65 mobile : zone sélectionnée pas marquée
v65 pc : PDF pas affiché
v65 pc : zone sélectionnée pas marquée
```
