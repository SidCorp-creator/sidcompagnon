# Sid'note — mémoire du projet pour Claude Code

Sid'note est l'application perso de **Mohamed « Sid » Sidki** (éditeur : **SidCorp**). C'est une PWA installée sur iPhone (écran d'accueil) et partagée avec ses proches. Chacun a son compte et ses données.
Le projet a été construit dans Cowork (versions 1 à 18), puis transféré ici. **Version actuelle : 31.**

> Important : les versions 23 à 27 ont été faites hors de ce dépôt (Netlify montrait la v27). Le 14 oct. 2026, la v27 a été récupérée depuis Netlify (Deploys → Download) et importée ici. **Avant chaque nouvelle version, vérifier que le dépôt contient bien la version en ligne** (numéro dans Réglages / `CACHE` de `sw.js`). Les fonctions Supabase ont pu changer aussi (ex. `rappels` lit `data.icalSoon`, `t.leads`) : ne pas renvoyer à Sid un ancien code de fonction sans vérifier.

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
supabase/functions/   ← fonctions Edge (Deno) : horaire (relais iCal, ACTIVE), nutrition (relais Claude, v20), rappels (notifications du planning, v22, à déployer)
supabase/sql/         ← SQL : documents.sql (déjà exécuté), nutrition.sql (v20, compteur d'appels Claude, exécuté), food_memory.sql (v21, mémoire des aliments), notifications.sql (v22, cron 5 min + anti-doublon)
secrets/              ← clés VAPID, secret cron, version complète de rappels : NE JAMAIS publier ni committer
tests/                ← serve.js (aperçu local + faux Supabase), smoke.js (test Playwright), mock-supabase.js, memory.test.js (mémoire des aliments, `node tests/memory.test.js`), rappels.test.js (calcul des rappels)
assets/               ← logo
```

## Supabase (backend)
- Projet : `https://eloeoaidgbkygazwjwiu.supabase.co`. La clé publique (publishable) est dans `index.html`, ce qui est normal. **Ne jamais mettre la clé secrète ou service_role dans le site.**
- Organisation Supabase : « SidCorp », offre gratuite. Région de la base : **eu-central-1 (Francfort)**. Un connecteur Supabase peut être relié à Claude (SQL, fonctions, journaux) ; il ne gère pas les réglages Auth (Site URL, SMTP, mots de passe compromis) : ceux-là se font dans le tableau de bord. La confirmation par e-mail est désactivée.
- Pas de supabase-js : tout passe par `fetch` (fonction `api()`).
  - Auth GoTrue : `/auth/v1/signup`, `token?grant_type=password|refresh_token`, `/auth/v1/user`, `/auth/v1/logout`.
  - Données : table `user_data(user_id, data jsonb, updated_at)`, en upsert PostgREST (`Prefer: resolution=merge-duplicates`). Toutes les données d'un utilisateur tiennent dans un seul JSON.
  - Storage : bucket privé `documents`, chemin `<uid>/<docId>.pdf`, 50 Mo max. Règles par dossier dans `supabase/sql/documents.sql`.
  - Fonction `horaire` : relaie le lien iCal (UMons/HyperPlanning), car le navigateur ne peut pas le lire directement. Elle vérifie que l'utilisateur est connecté. Réglage Supabase : « Verify JWT with legacy secret » est sur OFF.
  - Fonction `nutrition` (v20) : relais vers l'API Claude (`claude-opus-5-5`, sorties JSON structurées, `fallbacks: "default"`). Trois demandes : `profil` (métabolisme, besoins, macros), `aliment` (calories de ce qu'on mange), `menu`. Secret Supabase `ANTHROPIC_API_KEY` obligatoire (jamais dans le site). Limite : 60 appels par personne et par jour (`NUTRITION_DAILY_LIMIT`), compteur `nutrition_hit()` de `nutrition.sql`.
  - Fonction `rappels` (v22) : appelée toutes les 5 min par pg_cron (`notifications.sql`). Pour chaque personne abonnée (`push_subscriptions`), lit `data.prefs.notif.leads` (minutes avant, défaut 1440 = la veille) et `data.tasks` (heure de Bruxelles ; sans heure = 8 h ; ni faites, ni annulées, ni cours iCal). Anti-doublon : table `push_sent`. Secrets Supabase `VAPID_PUBLIC` / `VAPID_PRIVATE` (valeurs de `secrets/vapid.json`) ; le secret du cron est généré par le SQL dans Vault (`sidnote_cron`, lu par `sidnote_cron_secret()`), rien à recopier. Verify JWT : OFF.
- Comptes historiques : les anciens comptes « pseudo » utilisent `slug@sidnote.netlify.app`. Une migration vers l'e-mail est proposée dans Réglages.

## Architecture de index.html (repères)
- **Données locales d'abord** : cache `localStorage["sidnote-u-<uid>"] = {data, rev, base, dirty}`.
  - `save()` envoie au serveur (push différé de 1,2 s). `saveUI()` enregistre les préférences d'affichage propres à l'appareil (`data.ui`, jamais synchronisées).
  - `push()` relit la ligne serveur et fusionne avec `mergeData()` si un autre appareil a écrit entre-temps.
  - `mergeData` fait l'union par `id` pour todos, tasks, todoCats, docs, notes, pwds et muscu.sessions (pour notes et pwds, en cas de conflit, l'élément avec le plus grand `upd` gagne), avec des pierres tombales (`data.del`, via `tomb(id)`, gardées 90 jours). Les types sont fusionnés par nom, les prefs par clé.
  - **Toute nouvelle liste d'objets doit être ajoutée dans `mergeData` et `applyRemote`, sinon elle sera écrasée entre appareils.**
  - `renderAllSafe()` diffère le rendu tant qu'un champ est en cours de saisie (sinon le clavier iPhone se ferme).
- Session : `localStorage["sidnote-session"]`.
  - Avec « Rester connecté » décoché, `session.eph = true` et un marqueur dans `sessionStorage` (`sidnote-alive`). Au relancement sans ce marqueur, l'app envoie les modifications puis déconnecte.
  - Compte test : `TEST_EMAILS = ["test@sidcorp.app"]`. Il est remis à zéro à chaque connexion, ne reste jamais connecté et affiche la présentation à chaque fois.
- Onglets : constante `TABS` (plan, todo, notes, pomo, muscu, nutri, docs, pwd, app) ; Réglages est toujours affiché.
  - v20 : rangés en catégories (`GROUPS`) : Organisation (plan, todo, pomo), Sport (muscu, nutri, graph), Classeur (notes, docs, pwd), Réglages (more, app). Pastilles par fonction dans `#subnav` (`setBadge(k,v)`), pas de résumé en bas (sauf si la catégorie n'a qu'une fonction affichée). La barre du bas montre les catégories ; `#subnav` en haut choisit la fonction. Dernière fonction ouverte par catégorie : `data.ui.glast`. Icônes dans `#fnIcons` (`ICON(k)`).
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
- Notes (v19) : `data.notes = [{id,title,body,createdAt,upd}]`, enregistrement automatique pendant la saisie ; une note vide est supprimée en revenant à la liste.
- Notes secrètes (v20) : cadenas dans l'éditeur → la note est chiffrée avec un code à 5 chiffres propre aux notes (`data.noteVault`, même méthode que le coffre). Note secrète = `{id, secret:true, vid, iv, ct, upd}` (plus de titre ni de texte en clair) ; texte clair seulement en mémoire (`nsPlain`). Reverrouillage en quittant Notes ou l'app. Fenêtre de code réutilisable : `askPin({mode:"new"|"unlock", verify, forgot})`.
- Pas de zoom au double appui : `touch-action:manipulation` sur les boutons (demande de Sid, clavier du code).
- Mots de passe (v19) : coffre chiffré dans le navigateur.
  - Code à 5 chiffres → clé PBKDF2-SHA256 (600 000 itérations, sel aléatoire) → AES-GCM. Le code et la clé ne quittent jamais l'appareil, la clé reste en mémoire seulement.
  - `data.vault = {id, salt, iter, chk}` (`chk` = petit texte chiffré pour vérifier le code), `data.pwds = [{id, vid, iv, ct, upd}]` : uniquement du chiffré sur le serveur.
  - Reverrouillage dès qu'on quitte l'onglet ou l'app. 5 erreurs → 30 s d'attente. « Code oublié ? » efface tout le coffre (`data.vault = null`, pas `delete`, pour que la remise à zéro gagne à la fusion).
  - Limite à connaître : 5 chiffres = 100 000 codes possibles. Quelqu'un qui volerait le JSON chiffré pourrait les essayer tous (lent mais faisable). La vraie protection reste le compte Supabase (règles RLS).
- À faire : en vue « Toutes », chaque catégorie se replie (`data.ui.todoFold`, propre à l'appareil) + bouton « Tout replier ».
- Documents : tri « Récents » / « A → Z » (`data.prefs.docSort`). Le scanner interne est passé en meilleure définition (2600 px, JPEG 0,85). Le vrai scanner d'iPhone (VisionKit) n'est pas accessible depuis une app web : l'app explique comment scanner avec l'app Fichiers puis importer le PDF.
- Apparence (v20) : couleur d'accent (`data.prefs.accent`, palette `ACCENTS`) et thème Auto/Clair/Sombre (`data.prefs.theme`, attribut `data-theme` sur `<html>`), appliqués par `applyLook()`. Copie dans `localStorage["sidnote-look"]` pour l'écran de connexion. Réglages en sections repliables (`.setsec`, état dans `data.ui.setOpen`).
- Dictée (v20) : `dictate(btn, champ)` via `webkitSpeechRecognition` (Notes et Nutrition). Si le navigateur ne la gère pas, message : utiliser le micro du clavier iPhone.
- Nutrition (v20) : `data.nutri = {profile, plan, menuPrefs, menu, upd, log:[{id, day, at, name, qty, kcal, p, c, f, upd}]}`. Objectif de poids optionnel (`profile.target`, `dur`, `durU`) : Claude dit si le délai est réaliste et propose un rythme (`plan.wg = {ok, wk, weeks, advice}`, carte `#nuGoalCard`). Textes sans le mot « Claude » sur les boutons et sans exemple de marque (demande de Sid). Journée = date locale (00:00 → 23:59), navigation ‹ › et sélecteur de date pour compléter les jours passés. Fusion : profil/plan/menu = le plus récent (`upd`), `log` = union par id. Saisie à la main possible sans Claude.
- v21 :
  - Récupération des codes oubliés (mots de passe, notes secrètes, documents) : le code est aussi chiffré avec le mot de passe du compte (`vault.rec`, PBKDF2). « Code oublié ? » → mot de passe du compte → le code est retrouvé, rien n'est effacé. Proposé à la création du code et au premier déverrouillage (`recEnable`, `recOffer`, `recRecover`). Si le mot de passe du compte change, la récupération est à réactiver.
  - Claviers de code : `padTap()` gère `touchend` + `preventDefault` (plus de zoom au double appui sur iPhone).
  - Documents : classeurs (`data.docFolders`, `doc.folder`), recherche globale en haut, recherche propre au classeur ouvert, classeur protégé par le code des documents (`data.docVault`, `dvOpen`). Le code masque les documents dans l'app ; les fichiers restent privés dans le compte (pas chiffrés).
  - Apparence : styles Discret / Coloré / Intense (`data.prefs.look`, attribut `data-look`), Coloré par défaut.
  - Dictée : bouton 🎤 à côté des principaux champs (`micFor`).
  - Planning : les types existants sont proposés en pastilles sous chaque champ « Type » (`typeChipsFor`).
  - Nutrition : accès réservé à `NUTRI_ALLOW` (mohamed29082002@gmail.com, test@sidcorp.app) ; les autres voient l'onglet flouté « Bientôt disponible » (`applySoon`). La fonction serveur vérifie aussi (`NUTRITION_EMAILS`). Rythme Drastique / Réaliste / À mon aise, délai facultatif. Photo du plat (envoyée à Claude, vignette gardée sur l'appareil en IndexedDB `thumb:<grp>`). Plats en cartes visuelles (emoji, barre et cases de macros), entrées groupées par `grp`, suppression d'un aliment ou d'un plat. Animations de chargement (`nuLoading`).
  - Mémoire des aliments (partagée entre tous les comptes) : la fonction `nutrition` cherche d'abord dans `food_answers` (même phrase normalisée) puis dans `foods` (aliment pour 100 g + poids d'une unité, ex. « 200 g de riz cuit », « 3 oeufs ») ; si trouvé → réponse sans Claude (`source:"memory"`, badge « ⚡ Mémoire Sid'note », hors limite du jour). Sinon Claude répond et la mémoire apprend (`remember`, `learnRows`). Photos : toujours Claude, mais les aliments sont retenus. Fonctions pures testées par `tests/memory.test.js`. La première réponse retenue fait référence pour tout le monde (corriger directement dans la table `foods` si besoin).
  - Graphiques (Sport → Graphiques) : macros par jour, poids (`data.nutri.weights`), calories vs objectif (couleurs d'état + icônes). Palette validée par le script dataviz (P bleu, G orange, L vert d'eau). Commentaire du jour / de la semaine via Claude (`kind:"bilan"`), suivi des semaines dans `data.nutri.weeks`.
- v22 :
  - Documents chiffrés (demande de Sid : personne d'autre que la personne, pas même l'administrateur) : avant l'envoi dans Storage, le PDF est chiffré en AES-GCM avec la clé du code des documents (`dvKey`, en mémoire seulement quand l'onglet est déverrouillé). Format en ligne : « SNE1 » + iv (12 o) + chiffré ; `doc.enc` = id du coffre. `docBlob` déchiffre au téléchargement ; la copie IndexedDB de l'appareil reste en clair. Sans clé, l'envoi attend le déverrouillage. Les anciens documents en clair sont rechiffrés au déverrouillage (`docsSecure`). Code oublié sans récupération (`dvReset`) : seuls les documents présents sur l'appareil sont renvoyés avec le nouveau code, les autres deviennent illisibles.
  - Documents : tout l'onglet est verrouillé par le code (`#docLocked`, `dvUnlock`, `dvLock` en quittant), comme Mots de passe ; plus de classeur verrouillé à part. Glisser-déposer d'un document (poignée `data-dgrip`) sur une pastille de classeur ; « Tous » le sort du classeur.
  - À faire : une catégorie dont tout est réalisé quitte la rangée → pastille « ✓ n terminées » (`data.ui.showDoneCats`).
  - Nutrition : ordre Menus sur mesure → Ajouter ce que tu manges → Ma journée. Menu : journée ou un seul repas (`SLOT`, `menuPrefs.type`), calories par repas (`menuPrefs.kcals`, `one`), menu modifiable (grammes, retirer, ajouter, « ↻ Autre idée », « ✓ Je l'ai mangé »). Quantité modifiée → calories recalculées (`qtyNum`, `nuEBase`). Sport par semaine (`n.wsports[semaine][sport]`, `plan.kps` = kcal par séance, `dayTarget(d)` ajuste l'objectif du jour).
  - Planning : vue année (`calMode="year"`, `renderYear`), en touchant le titre du mois ou en pinçant.
  - Présentation en diapositives (`#onbTrack`, `ONB_GROUP`, `onbStep`, `onbFinish`).
  - Notifications : Réglages → Notifications, délais au choix (`LEADS`, `data.prefs.notif.leads`).
  - Vie privée (RGPD) : Réglages → « Tes données et ta vie privée » (explications, export JSON complet, « Supprimer mes données » : fichiers Storage, abonnements, ligne `user_data` remise à zéro avec `data.wipe` — l'effacement gagne dans `mergeData`). La suppression du compte lui-même se fait par Sid dans Supabase → Authentication.
  - Correction mobile : `.form` en `minmax(0,1fr)` (les cartes ne débordent plus).
- v27 (faite ailleurs, importée) : page « Aujourd'hui », page Espaces, un seul code pour documents et mots de passe, rappels par activité, cours iCal notifiés la veille (`data.icalSoon`), photos dans les notes, recettes…
- v28 :
  - Navigation : barre du bas = Aujourd'hui · Organisation · Santé · Coffre · Compte (`DOCK`, `openGroup`). Un espace rouvre sa dernière fonction (`data.ui.glast`) ; pastilles des fonctions de l'espace dans `#vhead` (`.vseg`). Plus de « + » dans la barre : bouton `#homeAdd` sur Aujourd'hui (ajout rapide `openQuickAdd`). La page Espaces existe encore mais n'est plus dans la barre.
  - Tâches : état de la vue synchronisé avec le compte (`data.prefs.todoView` = {fold, doneOpen, pausedOpen, cat, showFin, doneCal}, via `TV()` / `tvSave()`). Catégorie tapée mais non validée → créée à l'ajout de la tâche (`catMake`). Glisser une tâche (poignée) sur une pastille de catégorie. Réalisées : « Liste » ou « Calendrier » (`doneCal`, intensité selon le nombre de tâches, toucher un jour = sa liste).
  - Mots de passe : tri « Récents » / « A → Z » (`data.prefs.pwSort`).
  - iCal : renommé « Calendrier relié » (`ICAL_CAT`), option « + Relier un calendrier » ; l'interrupteur de rappel des événements reliés n'apparaît que si un calendrier est relié (`.nf-ical`).
  - Connexion : œil sur les mots de passe (`[data-pweyefor]`), blocage après 5 erreurs (30 s puis double, `sidnote-auth-lock` dans localStorage), « Mot de passe oublié ? » (`/auth/v1/recover`, retour par `#access_token…&type=recovery` → `recoveryFromHash` → `#npSheet`), « Changer mon mot de passe » dans Compte (`#chPwBtn`, rechiffre la récupération des codes : `recRewrap`). **Il faut un SMTP personnalisé dans Supabase** pour que les e-mails partent vers d'autres adresses que l'équipe, et Site URL = https://sidnote.netlify.app.
  - Fonctions `nutrition` (v23, recette, OMAD) et `rappels` (v23, `t.leads`, `t.remind`, `data.icalSoon`) recopiées depuis Supabase le 14 oct. 2026 : le dépôt correspond à ce qui est en ligne.
  - Test : `tests/smoke.js` réécrit pour la v28 (l'ancien est dans `tests/smoke-v22.js`).
- v29 :
  - Agenda : chaque mois de « Toutes les dates » se replie (`data.prefs.planFold`, synchronisé) + « Tout replier ».
  - Fenêtres : quand une `.sheet-bg` est ouverte, la page derrière est figée (`syncScrollLock`, classe `html.modal-open`, corps en `position:fixed`).
  - Musculation : le chrono/minuteur (`.rest`) n'est plus collé en haut (plus rien ne glisse au-dessus).
  - Documents : le code se tape dans la page avec le grand clavier (`#docPinHost`, `askPin` déplace `.pin` de `#pinSheet` quand la vue est docs ; `psEnd` le remet).
  - Ambiances de couleurs (`PALETTES`, `data.prefs.palette`, attribut `data-palette`) : Noir & or (défaut), Saphir, Émeraude, Bordeaux, Platine ; chacune en clair et en sombre.
  - Téléphone plus épuré : `@media (max-width:600px)` réduit titres, marges, boutons (champs toujours à 16 px).
- v30 : l'affichage épuré s'applique aussi sur ordinateur (barre latérale 236 px, contenu 760 px max, titres plus petits ; `#homeAdd` caché car « + Ajouter » est dans la barre latérale). Le test fait aussi des captures en écran large (`*-pc-*.png`).
- v31 :
  - Néerlandais : `DICT_NL` + `PATS_NL` (traduits du français), choisis quand `LANG==="nl"` (le contenu de `DICT`/`PATS` est remplacé au démarrage). `L()` traduit dès que la langue n'est pas le français. Mois/jours en néerlandais dans `startTranslate`. Choix de langue : Réglages, présentation, écran de connexion (3 boutons). Fonctions `nutrition` et `rappels` gèrent aussi `nl` (déployées le 20 oct. 2026). Le texte de version passe par un motif (`PATS`), plus besoin de le retraduire à chaque version. **Tout nouveau texte doit aussi être ajouté à `DICT_NL`** (sinon il reste en français en néerlandais).
  - Synchro : `push()` écrit « à condition » (PATCH filtré sur `updated_at`) ; si un autre appareil a écrit entre-temps, on relit, on refusionne et on réessaie (fini les suppressions qui reviennent).
  - Ambiances travaillées : chaque palette a ses fonds/cartes/champs/lignes (clair et sombre) + reflet en haut ; boutons à la couleur de l'ambiance.
  - Mots de passe : description visible avant le déverrouillage. Tâches : pastilles de catégories sur plusieurs lignes sur ordinateur ; « Réalisées » s'ouvre toujours sur le calendrier.
  - Agenda : une activité passée n'est plus « En retard » mais « Passé » (grisée).
  - Musculation : chrono de nouveau collé en haut, compact une fois collé (`.rest.stuck`, sentinelle `#restSentinel`), rien de visible au-dessus.
  - Nutrition : « à inclure / à éviter » propres à chaque type de repas (`menuPrefs.pp[type]`, `mpPref`/`mpSet`), champs qui s'agrandissent (`textarea.autogrow`), délai conseillé pré-rempli en modifiant le profil, menus toujours en poids crus (consigne client + serveur).
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
- v19 préparée : phrase d'accueil, onglets Notes et Mots de passe, tri des documents, catégories repliables, scanner plus net.
- v20 mise en ligne le 9 oct. 2026 (Nutrition branchée sur Supabase avec la clé Claude).
- v21 préparée (pas encore mise en ligne) : voir « v21 » ci-dessus. **Recoller le nouveau code de la fonction `nutrition` dans Supabase** (photo, emojis, rythme, bilans, accès réservé, mémoire) et **exécuter `supabase/sql/food_memory.sql`**.
- Ancien plan v20 : catégories d'onglets, couleurs et thème, réglages repliables, dictée, Nutrition avec Claude.
  - Pour que Nutrition marche, Sid doit : créer une clé API Claude (console.anthropic.com, payant à l'usage), l'ajouter en secret Supabase `ANTHROPIC_API_KEY`, exécuter `supabase/sql/nutrition.sql`, déployer la fonction `nutrition` (Verify JWT : OFF, comme `horaire`).
- À vérifier sur l'iPhone de Sid :
  - l'ouverture d'un PDF dans le lecteur (pdf.js n'a pas pu être testé dans Cowork) ;
  - la synchronisation d'un document entre deux appareils.
- v22 préparée (pas encore mise en ligne) : voir « v22 ». Côté Supabase : recoller `nutrition` (sports_kcal, repas), créer les secrets `VAPID_PUBLIC`/`VAPID_PRIVATE`, déployer `rappels` (Verify JWT OFF), exécuter `supabase/sql/notifications.sql`.
- Historique rapide :
  - v1–v10 : planning, à faire, pomodoro, comptes Supabase, réglages ;
  - v11–v14 : e-mail, heures, Spotify, recherche, vue jour ;
  - v15–v17 : musculation, chrono et minuteur, horaire iCal UMons ;
  - v22 : code pour tout Documents, glisser vers les classeurs, menus par repas et modifiables, sport par semaine, vue année, présentation interactive, notifications, vie privée ;
  - v21 : récupération des codes, classeurs de documents, graphiques et bilans, photo des plats, styles de couleur, pastilles par fonction ;
  - v20 : catégories d'onglets, couleurs, réglages repliables, dictée, nutrition avec Claude ;
  - v19 : notes, mots de passe chiffrés, tri des documents, catégories repliables, nouvelle phrase d'accueil ;
  - v18 : documents et scanner, catégories et ordre des tâches, fractionné, tours, langue EN, page d'accueil, présentation, rester connecté, compte test, SidCorp.

## Sécurité
- `secrets/` ne doit jamais aller sur Netlify, GitHub ou dans un message (il est dans `.gitignore`).
- Le lien iCal de Sid est personnel : ne pas le mettre dans le code.
