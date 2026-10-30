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
3. ~~Nutrition : barres des macros~~ (v52) ; journée, menus, profil.
4. Nutrition (journée, menus, profil).
5. ~~Agenda~~ (v53–v54) · ~~Tâches~~ (v54).
6. Notes, Documents, Mots de passe (le coffre en dernier, avec une revue sécurité).
7. Enfin la coquille (connexion, synchronisation, navigation) : à ce moment `app.js` disparaît et l'app devient une app Vite complète.

## Commandes

```
cd app
npm install        # une fois
npm run typecheck  # vérification TypeScript
npm run build      # écrit site/react/islands.js
cd .. && node tests/smoke.js
```

À chaque écran migré : changer la version (`APP_V`, `BUILD`, `CACHE` de `sw.js`), rebuild, tests, puis `git push origin main`.
