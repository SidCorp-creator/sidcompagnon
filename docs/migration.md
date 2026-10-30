# Migration vers TypeScript + React + Vite (ticket #3)

Décision de Sid (29 oct. 2026) : passer progressivement à TypeScript + React + Vite, **écran par écran**, sans réécriture d'un bloc, sans casser les données ni le connecteur Claude.

## Principe : des « îlots »

- L'app actuelle (`site/index.html`, `site/app.js`) reste la coquille : connexion, synchronisation, données, navigation, traductions.
- Chaque écran migré est un composant React en TypeScript dans `app/src/`. Il est monté par l'app actuelle à la place de l'ancien rendu : `window.SCIslands.<écran>(élément, props)`.
- Le build (`cd app && npm run build`) produit un seul module minifié, `site/react/islands.js`, qui est **commité** : Vercel sert `site/` tel quel, sans étape de build.
- **Secours** : si le module ne se charge pas (ancien cache, erreur), l'ancien rendu de `app.js` est utilisé. Une erreur du composant est envoyée dans `client_errors` (`island …`) et l'ancien rendu prend le relais.
- Un écran migré garde **le même rendu** que l'ancien (mêmes classes CSS, mêmes `data-*`). Le test `tests/smoke.js` (bloc « v50 ») compare les deux rendus élément par élément.
- Les textes passent par `i18n.L()` de l'app (traductions EN/NL inchangées). L'élément racine porte la classe `notr` pour que la traduction automatique ne touche pas le DOM géré par React.

## Fait

| Version | Écran | Fichier |
|---|---|---|
| v50 | Nutrition : calendrier Semaine / Mois / Année | `app/src/NutritionCalendar.tsx` |
| v51 | Graphiques : courbes macros et poids, colonnes des calories (avec l'infobulle), légendes, tableau des chiffres | `app/src/Charts.tsx` |
| v51 | Focus : temps de travail concentré (jour, 7 jours) | `app/src/PomoStats.tsx` |
| v52 | Graphiques : commentaires du jour et de la semaine, historique des semaines | `app/src/Reviews.tsx` |
| v52 | Musculation : barre « Mon objectif » · Nutrition : barres des macros | `app/src/Small.tsx` |
| v63 | Présentation : diapositives des apps (état `onbSel`, redessinées à chaque choix puis `onbStep` remet la diapositive active), points, couleurs · claviers de code | `app/src/Onboarding.tsx` |
| v62 | Réglages : statistiques, onglets affichés, types d'activités, adresses du connecteur · fenêtres : ajout rapide, fiche d'un exercice | `app/src/Settings.tsx` |
| v61 | Coquille, étape 3 : appels au serveur, session, écriture synchronisée (`core/sync.ts`) ; barres de navigation : bas, en-tête d'app, barre latérale (`Shell.tsx`) | `app/src/core/sync.ts`, `app/src/Shell.tsx` |
| v60 | Coquille, étapes 1 et 2 : fusion des données entre appareils et briques de chiffrement en TypeScript (script `site/react/core.js`, chargé avant app.js) | `app/src/core/merge.ts`, `app/src/core/crypto.ts` |
| v59 | Nutrition : copie d'un repas (fenêtre), résumé du profil, objectif de poids | `app/src/NuExtra.tsx` |
| v58 | Nutrition : menu (repas, quantités, recette, « Autre idée ») · Accueil Sid'compagnon : 3 cartes | `app/src/NuMenu.tsx`, `app/src/Home.tsx` |
| v57 | Notes : chemin du dossier, dossiers, notes · Documents : classeurs, liste · Mots de passe : liste | `app/src/Notes.tsx`, `app/src/Vault.tsx` |
| v56 | Nutrition : plats de la journée (vignettes, quantités modifiables), résultat d'une analyse, sport de la semaine | `app/src/Nutrition.tsx` |
| v55 | Musculation : programmes, séances, exercices, une ligne par série · Focus : durées, frise travail / pause | `app/src/Muscu.tsx`, `app/src/Small.tsx` |
| v54 | Tâches : catégories, barre de la catégorie, à faire (groupes repliables), en suspens, réalisées (liste et calendrier) · Agenda : vue d'un jour | `app/src/Todos.tsx`, `app/src/DayView.tsx` |
| v53 | Agenda : grille du mois, vue année, « Prochaines échéances », filtres, liste « Toutes les dates » | `app/src/Agenda.tsx` |

Socle : `app/src/types.ts` (types des données, à compléter), `app/src/dates.ts` (dates locales), `app/src/format.ts` (nombres, durées, jours), `app/src/islands.tsx` (montage synchrone avec `flushSync`, classe `notr` posée au montage).

Traductions : depuis la v53, les îlots reçoivent aussi `tr()` (= `trStr` de l'app : dictionnaire **et** motifs avec chiffres, comme la traduction automatique du DOM). Le test « v53 » compare aussi en anglais (l'ancien rendu passe par la traduction automatique).

Agenda et Tâches : restent dans l'ancien code le titre du mois, les fenêtres (activité, calendriers reliés), le champ « Nouvelle tâche », la barre de progression et le glisser-déposer (qui nettoie maintenant ses classes à la fin, React gardant les mêmes lignes). Un champ gardé par React n'est plus recréé : il faut le vider soi-même après un ajout (`data-dtadd`).

Graphiques : tout l'affichage est en React depuis la v52 ; restent dans l'ancien code la saisie du poids et l'animation de chargement des commentaires (`nuLoading`, posée dans `#revLoad-…` que React laisse vide).

## Ordre proposé pour la suite

Du plus isolé au plus central, un écran par version, chacun avec son test « même rendu » :

1. ~~Graphiques~~ (v51–v52) · ~~Focus~~ (v51, v55 ; l'horloge et l'anneau restent des éléments fixes mis à jour par app.js).
2. ~~Musculation~~ (v52, v55). Champs non contrôlés (`defaultValue`) : app.js enregistre à chaque frappe et redessine (`msRedraw`) ; après chaque rendu, les champs qui ne sont pas en cours de saisie reprennent la valeur enregistrée (sinon un « Annuler » ne se verrait pas dans un champ déjà touché).
3. ~~Nutrition : barres des macros~~ (v52) · ~~journée, analyse, sport de la semaine~~ (v56) ; ~~menu~~ (v58 : `nuMenuFree` rend #nuMenu à l'ancien code pendant la génération ; « ↻ Autre idée » passe par `meRegen`) ; reste : formulaire du profil et réglages du menu (champs fixes de index.html).
5. ~~Agenda~~ (v53–v54) · ~~Tâches~~ (v54).
6. ~~Notes, Documents, Mots de passe : listes~~ (v57). Revue sécurité faite : affichage seulement, aucune clé ni texte chiffré dans React ; le mot de passe et la note d'une entrée ne sont transmis que si la personne a touché « Afficher » ; au verrouillage, la liste est vidée (avant : elle restait dans la page, cachée). Restent dans app.js : l'éditeur de notes (contenteditable), le lecteur PDF, les claviers de code, le chiffrement.
7. Enfin la coquille (connexion, synchronisation, navigation) : à ce moment `app.js` disparaît et l'app devient une app Vite complète.

## Où on en est (30 oct. 2026, après la v59)

Tout ce qui s'affiche dans les écrans principaux est dessiné par React : Agenda (mois, année, jour, listes), Tâches, Focus (résumé, durées, frise), Musculation, Nutrition (journée, analyse, sport, menu, profil, copie, calendrier, macros), Graphiques, Notes (liste), Documents (liste), Mots de passe (liste), accueil.

Reste dans `app.js` (la « coquille ») — mis à jour après la v62 :
- ~~présentation~~, ~~claviers de code~~ (v63) ; barre des notes secrètes, barre du classeur ouvert (champ de recherche) ;
- formulaire du profil Nutrition et réglages du menu (champs fixes de index.html) ;
- connexion, inscription, session, mode essai ;
- synchronisation et fusion à 3 voies (`push`, `pull`, `mergeData`, `merge3`) ;
- chiffrement et coffre (codes, phrase / mot de passe, Face ID, documents chiffrés) ;
- éditeur de notes (contenteditable), lecteur-annoteur PDF, scanner ;
- navigation, fenêtres, Réglages, présentation, traductions, notifications ;
- tous les gestionnaires de clics des écrans migrés.

### Dernière étape : accord de Sid le 30 oct. 2026

Sauvegardes faites avant : branche git `sauvegarde-v59`, table Supabase `sauvegarde.user_data_v59` (12 comptes, copie vérifiée identique).

- Étape 1 (v60) : `mergeData` / `merge3` → `app/src/core/merge.ts`. `app.js` appelle `window.SCCore.mergeData` ; l'ancien code (`mergeDataOld`) sert si core.js manque ou lève une erreur. `tests/merge.test.js` passe les mêmes scénarios aux deux versions puis compare 5 000 cas tirés au hasard (graine fixe) : identiques ; une erreur volontaire est détectée des centaines de fois.
- Étape 2 (v60) : briques de chiffrement → `app/src/core/crypto.ts` (b64, `pinKey`, `encJ`/`decJ`, `rawKey`, `phDerive`, documents « SNE1 », `bioKey`). Mêmes algorithmes et formats ; `tests/crypto.test.js` : chiffré par l'un, ouvert par l'autre, dans les deux sens ; mêmes clés maîtres. Bloc « v60 » du smoke : la même vérification dans l'app, avec les vraies 600 000 itérations. La logique du coffre (codes, appareils, récupération) reste dans app.js et utilise ces briques.
- Étape 3 (v61) : `api()`, `storeSession()` et la boucle d'écriture à condition de `push()` → `app/src/core/sync.ts` (`createApi`, `sessionFrom`, `pushLoop`, avec les fonctions de l'app passées en paramètres) ; barres de navigation → `app/src/Shell.tsx` (`SCIslands.nav`, `appHead`, `side` ; `setBadge` redessine la barre). Bloc « v61 » du smoke : deux appareils sur le même compte, l'un avec le nouveau code et l'autre avec l'ancien (`__noCore`), ajouts / suppression / modification croisés → les deux ont le même résultat ; jeton expiré renouvelé ; même message d'erreur du serveur ; parité des barres FR/EN, pastilles, clics.
- `core.js` est un script classique (IIFE, `vite.core.config.ts`), pas un module : il doit être prêt avant le démarrage de l'app (la synchro commence tout de suite).

### Pourquoi la dernière étape n'avait pas été faite seule

Passer la coquille en React/Vite revient à réécrire la synchronisation, la fusion des données et le chiffrement. Une erreur à cet endroit peut effacer ou rendre illisibles les données des comptes (règle de Sid : « Ne casse jamais les données des utilisateurs existants »), et c'est un changement que Sid a demandé de valider avant (« migration de base », « changement de chiffrement »). Proposition, à valider par Sid :
1. Extraire d'abord, sans rien changer au comportement, la fusion (`mergeData`, `merge3`) et le chiffrement dans des modules TypeScript testés seuls (les tests `merge.test.js` existent déjà), utilisés par app.js.
2. Puis la navigation et les fenêtres (React Router ou équivalent léger), écran par écran.
3. En dernier, la connexion et la synchronisation, avec une période de double fonctionnement et une sauvegarde complète avant (copie de `user_data`).

## Commandes

```
cd app
npm install        # une fois
npm run typecheck  # vérification TypeScript
npm run build      # écrit site/react/islands.js
cd .. && node tests/smoke.js
```

À chaque écran migré : changer la version (`APP_V`, `BUILD`, `CACHE` de `sw.js`), rebuild, tests, puis `git push origin main`.
