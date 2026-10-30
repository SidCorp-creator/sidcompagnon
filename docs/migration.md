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

Socle : `app/src/types.ts` (types des données, à compléter), `app/src/dates.ts` (dates locales), `app/src/format.ts` (nombres, durées, jours), `app/src/islands.tsx` (montage synchrone avec `flushSync`, classe `notr` posée au montage).

Encore dans l'ancien code pour Graphiques : les commentaires du jour / de la semaine et l'historique des semaines (leur animation de chargement `nuLoading` écrit dans le DOM), la saisie du poids.

## Ordre proposé pour la suite

Du plus isolé au plus central, un écran par version, chacun avec son test « même rendu » :

1. ~~Graphiques~~ (v51, sauf commentaires) · ~~Focus, résumé~~ (v51) ; reste du Focus (minuteur).
2. Commentaires de Graphiques (avec une animation de chargement en React).
3. Musculation (séances, objectif).
4. Nutrition (journée, menus, profil).
5. Tâches, puis Agenda.
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
