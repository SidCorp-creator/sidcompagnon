# Sid'note — mémoire du projet pour Claude Code

Sid'note est l'application perso de **Mohamed « Sid » Sidki** (éditeur : **SidCorp**). C'est une PWA installée sur iPhone (écran d'accueil) et partagée avec ses proches. Chacun a son compte et ses données.
Le projet a été construit dans Cowork (versions 1 à 18), puis transféré ici. **Version actuelle : 18.**

## Comment travailler avec Sid
- Réponds **en français**, simplement et brièvement. Sid n'est pas développeur : explique en mots simples, avec des étapes cliquables.
- Chaque mise en ligne Netlify coûte des crédits (voir « Déploiement »). **Regroupe les changements** en une seule version plutôt que de publier à chaque petite retouche.
- Avant de livrer, teste toujours avec `node tests/smoke.js` (iPhone simulé, clair et sombre, FR et EN). Regarde les captures dans `tests/out/`.
- Il aime les interfaces soignées, façon iOS. S'inspirer de ce qui existe déjà dans l'app (cartes, pastilles, anneaux du Pomodoro).

## Arborescence
```
site/                 ← exactement ce qui est mis en ligne sur Netlify
  index.html          ← TOUTE l'app (HTML + CSS + JS, ~2 300 lignes, pas de framework, pas de build)
  sw.js               ← service worker (réseau d'abord ; cache pdf.js à part)
  manifest.webmanifest, icônes
supabase/functions/   ← fonctions Edge (Deno) : horaire (relais iCal, ACTIVE), rappels (notifications, EN PAUSE)
supabase/sql/         ← SQL déjà exécuté : documents.sql (bucket Storage + règles)
secrets/              ← clés VAPID, secret cron, version complète de rappels : NE JAMAIS publier ni committer
tests/                ← serve.js (aperçu local + faux Supabase), smoke.js (test Playwright), mock-supabase.js
assets/               ← logo
```

## Supabase (backend)
- Projet : `https://eloeoaidgbkygazwjwiu.supabase.co`. La clé publique (publishable) est dans `index.html`, ce qui est normal. **Ne jamais mettre la clé secrète ou service_role dans le site.**
- Organisation Supabase : « SidCorp », offre gratuite. La confirmation par e-mail est désactivée.
- Pas de supabase-js : tout passe par `fetch` (fonction `api()`).
  - Auth GoTrue : `/auth/v1/signup`, `token?grant_type=password|refresh_token`, `/auth/v1/user`, `/auth/v1/logout`.
  - Données : table `user_data(user_id, data jsonb, updated_at)`, en upsert PostgREST (`Prefer: resolution=merge-duplicates`). Toutes les données d'un utilisateur tiennent dans un seul JSON.
  - Storage : bucket privé `documents`, chemin `<uid>/<docId>.pdf`, 50 Mo max. Règles par dossier dans `supabase/sql/documents.sql`.
  - Fonction `horaire` : relaie le lien iCal (UMons/HyperPlanning), car le navigateur ne peut pas le lire directement. Elle vérifie que l'utilisateur est connecté. Réglage Supabase : « Verify JWT with legacy secret » est sur OFF.
  - Fonction `rappels` (notifications la veille) : **en pause à la demande de Sid**. Elle n'est pas déployée et la section reste cachée (`#rappelsSec`).
- Comptes historiques : les anciens comptes « pseudo » utilisent `slug@sidnote.netlify.app`. Une migration vers l'e-mail est proposée dans Réglages.

## Architecture de index.html (repères)
- **Données locales d'abord** : cache `localStorage["sidnote-u-<uid>"] = {data, rev, base, dirty}`.
  - `save()` envoie au serveur (push différé de 1,2 s). `saveUI()` enregistre les préférences d'affichage propres à l'appareil (`data.ui`, jamais synchronisées).
  - `push()` relit la ligne serveur et fusionne avec `mergeData()` si un autre appareil a écrit entre-temps.
  - `mergeData` fait l'union par `id` pour todos, tasks, todoCats, docs et muscu.sessions, avec des pierres tombales (`data.del`, via `tomb(id)`, gardées 90 jours). Les types sont fusionnés par nom, les prefs par clé.
  - **Toute nouvelle liste d'objets doit être ajoutée dans `mergeData` et `applyRemote`, sinon elle sera écrasée entre appareils.**
  - `renderAllSafe()` diffère le rendu tant qu'un champ est en cours de saisie (sinon le clavier iPhone se ferme).
- Session : `localStorage["sidnote-session"]`.
  - Avec « Rester connecté » décoché, `session.eph = true` et un marqueur dans `sessionStorage` (`sidnote-alive`). Au relancement sans ce marqueur, l'app envoie les modifications puis déconnecte.
  - Compte test : `TEST_EMAILS = ["test@sidcorp.app"]`. Il est remis à zéro à chaque connexion, ne reste jamais connecté et affiche la présentation à chaque fois.
- Onglets : constante `TABS` (plan, todo, pomo, muscu, docs, app) ; Réglages est toujours affiché.
  - Visibilité dans `data.prefs.tabs`, page d'accueil dans `data.prefs.home` (`"last"` = dernière page ouverte), présentation déjà vue dans `data.prefs.onboarded`.
- **Langue** : le français est la source.
  - L'anglais passe par le dictionnaire `DICT` (FR → EN), les motifs `PATS` (textes avec chiffres) et un MutationObserver qui traduit le DOM. Le contenu utilisateur est protégé par la liste `NOTR` (`.ttl`, `.ms-name`…).
  - Changer de langue recharge l'app.
  - **Chaque nouveau texte visible ajouté en français doit avoir son entrée dans `DICT`** (ou un motif dans `PATS` s'il contient des variables). Pour un bout de texte assemblé en JS, utiliser `L("…")`.
- Planning :
  - Les événements iCal sont analysés côté navigateur (`parseICS`), mis en cache dans `sidnote-ical-<uid>` et affichés en catégorie « Cours UMons ».
  - L'option iCal se trouve sous le calendrier (« + Plus d'options »). Le bouton s'appelle « ↻ Actualiser ».
- À faire : catégories `data.todoCats` (todo.cat = id), ordre manuel par la poignée (`todo.ord`), sections « En suspens » et « Réalisées » (groupées par année, mois, semaine, jour).
- Musculation : séances / exercices / séries (kg puis reps), copie et import de séance (texte français, à garder tel quel car c'est le format d'échange). En haut, un carrousel chrono (avec tours) / minuteur (Simple + ✎ Perso, ou Fractionné effort/repos/séries).
- Documents :
  - Les PDF sont gardés en local dans IndexedDB (`sidnote-docs`) et envoyés dans Storage. Les métadonnées sont dans `data.docs`.
  - Le scanner : photo → filtre « Document » → PDF fabriqué maison (`makePDF`).
  - La lecture passe par pdf.js 3.11.174 depuis cdnjs (secours : iframe ou Partager).
  - La recherche est tolérante (`fuzzyScore` : sans accents, un mot suffit, fautes acceptées).
- Pomodoro : enchaînement travail / pause sur une durée totale, son (WebAudio débloqué au clic), maintien de l'écran allumé, lecteur Spotify intégré (playlist dans prefs).

## Pièges iPhone déjà rencontrés
- `[hidden]{display:none!important}` est obligatoire, sinon certaines règles d'affichage le contournent.
- Les champs date et heure ont besoin de `appearance:none` et d'une hauteur fixe. Les grilles à deux colonnes utilisent `minmax(0,1fr)`.
- Taille de police des champs ≥ 16px, sinon iOS zoome.
- Le volume Spotify ne peut pas être contrôlé depuis le web (Sid l'a déjà demandé : c'est impossible).
- Le son ne marche qu'après un geste de l'utilisateur. Garder `unlockAudio()`.

## Déploiement (Netlify)
- Site Netlify : `sidnote.netlify.app` (équipe à renommer « SidCorp » dans Team settings → General → Team details ; **ne pas changer l'adresse du site**, l'app installée chez les proches casserait).
- Jusqu'ici, Sid déposait un zip du dossier `site/` par glisser-déposer (Netlify Drop) : 15 crédits par dépôt, 300 crédits par mois (renouvelés vers le 5 du mois).
- **À chaque version** :
  1. Changer le numéro dans le texte « Sid'note · version N » (Réglages, en bas de index.html) et la constante `CACHE` dans `sw.js` (`sidnote-vN`). Sans ce second changement, les iPhone gardent l'ancienne version.
  2. Lancer `node tests/smoke.js`.
  3. Mettre en ligne le dossier `site/`, et rien d'autre.
- Piste d'amélioration (à proposer à Sid) : passer par Git, un dépôt GitHub privé et Netlify CLI ou un déploiement automatique, plus un site de prévisualisation (`sidnote-test`) pour tester avant les proches. Vérifier le coût en crédits avant.

## État et prochaines étapes
- La v18 a été livrée le 9 oct. 2026 et le SQL Storage a été exécuté avec succès.
- À vérifier sur l'iPhone de Sid :
  - l'ouverture d'un PDF dans le lecteur (pdf.js n'a pas pu être testé dans Cowork) ;
  - la synchronisation d'un document entre deux appareils.
- Toujours en pause : les notifications (rappels).
- Historique rapide :
  - v1–v10 : planning, à faire, pomodoro, comptes Supabase, réglages ;
  - v11–v14 : e-mail, heures, Spotify, recherche, vue jour ;
  - v15–v17 : musculation, chrono et minuteur, horaire iCal UMons ;
  - v18 : documents et scanner, catégories et ordre des tâches, fractionné, tours, langue EN, page d'accueil, présentation, rester connecté, compte test, SidCorp.

## Sécurité
- `secrets/` ne doit jamais aller sur Netlify, GitHub ou dans un message (il est dans `.gitignore`).
- Le lien iCal de Sid est personnel : ne pas le mettre dans le code.
