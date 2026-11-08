# Charte Sid'Compagnon · Élan

Responsable : Claude Code (rédaction). Jetons et composants : Codex (§ 11, proposés dans `revues.md`, tour 2).
Version 1 du 5 nov. 2026 : direction **F · Élan** choisie par Sid. Elle intègre la revue T9 de Codex et les décisions du `README.md`.
C'est **la seule source** pour le skill du projet (`.claude/skills/sid-charte/`, `.agents/skills/sid-charte/`).

---

## 1. Principes

1. **Chaque écran dit à quoi sert l'app.** Le nom, le rôle et ce qu'on regarde sont toujours visibles en tête.
2. **Une app = une couleur pleine.** La couleur repère l'app. On ne s'en sert jamais pour décorer, et jamais seule : elle va toujours avec un pictogramme et un nom.
3. **La fonction se reconnaît à son icône et à son titre**, jamais à une couleur à elle.
4. **L'action principale vient en premier.** Sid'Bot est un bouton, toujours au même endroit.
5. **Rien de gratuit** : pas de dégradé, d'ombre portée décorative, de carte dans une carte, de texture ni d'animation sans rôle.
6. **L'élan, c'est la progression du jour** : un chiffre en grand et une barre. Pas des effets.

## 2. Architecture de marque

| Niveau | Nom | Rôle (en-tête) | Phrase (accueil) | Fonctions |
|---|---|---|---|---|
| Suite | **Sid'Compagnon** | — | « Bonjour Sid » + date | les 3 apps, Réglages |
| App | **Sid'Journée** | Agenda, tâches, focus | Organise tes journées | Agenda · Tâches · Focus |
| App | **Sid'Forme** | Sport et alimentation | Entraîne-toi, mange bien | Musculation · Nutrition · Graphiques |
| App | **Sid'Note** | Notes, documents, mots de passe | Écris, classe et protège | Notes · Documents · Mots de passe |
| Assistant | **Sid'Bot** | — | dans les 3 apps (bouton du bandeau) | conversation, propositions à valider |

- **Graphie (v76, décision de Sid du 8 nov.)** : toujours « Sid » + apostrophe droite `'` (U+0027) + nom avec majuscule, sans espace : **Sid'Compagnon, Sid'Journée, Sid'Forme, Sid'Note, Sid'Bot**. Jamais « Sid Journée », « SidNote », « Sid’Note » (apostrophe typographique) ni « Sid'note ». Tout futur nom de la famille suit la même règle. Les noms sont identiques en FR et EN (noms propres) ; le rôle et la phrase sont traduits. Référence unique dans le code : `MARQUES` (`site/i18n.js`) ; `tests/marques.test.js` refuse les anciennes graphies. Les noms de personnes, les contenus des utilisateurs et **SidCorp** (l'éditeur) ne sont pas concernés.
- **Ne change pas** : les identifiants techniques (clés de données `plan`, `muscu`, `notes`…, `sidnote-*`, `agenda/fit/note`, sauvegarde `app:sidnote`, fonction Supabase `mcp` de l'ancien connecteur). Seuls les libellés affichés changent.
- L'accueil n'a pas de couleur d'app : il est neutre, et les trois couleurs n'y apparaissent que sur leur carte.

## 3. Logos

Fichiers éditables : `docs/refonte/logos/*.svg`, sur une grille de 64 × 64.

| Logo | Construction |
|---|---|
| Sid'Compagnon | tuile `#1A1A1A`, rayon 18 ; 3 barres montantes penchées de 12°, une par app (Journée, Forme, Coffre), de gauche à droite |
| Sid'Journée | tuile bleue ; calendrier au trait avec une coche |
| Sid'Forme | tuile orange ; haltère au trait, en `#121212` |
| Sid'Note | tuile violette ; document à coin plié et **petit** cadenas (le contenu n'est pas tout verrouillé) |

- **Trait** : 5 sur 64, bouts et angles arrondis ; le pictogramme est penché de 9° (`skewX(-9)`), c'est la signature d'Élan.
- **Sur fond sombre**, la tuile de Sid'Compagnon passe à `#2A2A2A` (`suite-sombre.svg`) pour rester visible.
- **Taille minimale** : 16 px. Sous 24 px, on utilise la version `-mini` : sans coche ni cadenas, trait de 6.
- **Une couleur** : version `-mono`, avec la tuile en `currentColor` et le pictogramme évidé. Elle sert pour les icônes « masque » de l'iPhone et l'impression.
- **Zone de protection** : 1/8 de la taille autour de la tuile.
- **Interdits** : déformer, changer la couleur d'une tuile, ajouter une ombre, un dégradé ou un contour, mettre le pictogramme sans sa tuile à côté d'un nom d'app, ou poser une tuile sur la couleur d'une autre app.
- **Icône d'écran d'accueil** (validée par Sid) : logo Sid'Compagnon, sans rayon (iOS arrondit lui-même), 180 et 512 px ; la version `maskable` a 20 % de marge.

## 4. Couleurs

Trois familles séparées, qu'on ne mélange jamais : **apps**, **interface** (neutres), **états**.

### 4.1 Apps

| Jeton | Sid'Journée | Sid'Forme | Sid'Note | Usage |
|---|---|---|---|---|
| `--app` | `#2563EB` | `#F25C19` | `#7C3AED` | bandeau, bouton principal, onglet actif, barre de progression, tuile de logo |
| `--on-app` | `#FFFFFF` (5,17) | `#121212` (5,64) | `#FFFFFF` (5,70) | tout texte et toute icône posés sur `--app`, **toujours opaque** |
| `--app-ink` clair | `#1D4FC4` (6,61 sur `#F7F7F7`) | `#B8420C` (5,49 sur blanc, 4,65 sur `#ECECEC`) | `#6527CF` (7,14) | texte et icône de couleur d'app sur fond neutre |
| `--app-ink` sombre | `#8FB0F7` (7,72 sur `#1E1E1E`) | `#FF9A6B` (6,89 sur `#2A2A2A`) | `#B99AF7` (7,17) | idem en sombre |
| `--app-soft` clair / sombre | `#E4ECFD` / `#141D33` | `#FFECE2` / `#341708` | `#F0E8FE` / `#22163A` | sélection, jour courant, ligne nouvelle |

- Le bandeau garde la même couleur en clair et en sombre : c'est le repère de l'app.
- **Sid'Forme ne prend jamais de texte blanc** (3,1:1) : texte et icônes en `#121212`.
- Le couple `--app`/`--on-app` se pose **sur chaque surface colorée** (bandeau, carte d'accueil, bouton). Il ne s'hérite jamais d'un conteneur (défaut relevé par Codex sur l'accueil).
- **Palette des types d'activité** (`--c-event`, `--c-cours`…, choisis par la personne dans Réglages) : aucun jeton n'est égal ou proche d'une couleur d'app. Le 5 nov. : `--c-event` passe de l'orange au sarcelle `#0F8B8D` ; `--c-cours` du bleu à l'olive `#66712E` / `#AAB76D` ; `--c-memoire` du violet au framboise `#9B427A` / `#D286B5` ; `--x4` de l'indigo à un brun désaturé (vers `#7C5A45` / `#C49A80`). Les types qui renvoient à ces jetons suivent, et aucune donnée n'est écrite. Les 5 types par défaut sont nettement distincts entre eux. Pastilles : 3:1 minimum, toujours avec le nom du type. Détail : `palette-types.md` (Codex).
- L'orange n'est pas celui d'une marque existante : `#FC4C02` est remplacé par `#F25C19`.

### 4.2 Interface

| Jeton | Clair | Sombre (par défaut) |
|---|---|---|
| `--bg` | `#F7F7F7` | `#121212` |
| `--surface` | `#FFFFFF` | `#1E1E1E` |
| `--surface-2` (puce, champ inactif) | `#ECECEC` | `#2A2A2A` |
| `--ink` | `#1A1A1A` | `#F2F2F2` |
| `--muted` | `#5E5E5E` (6,05) | `#A6A6A6` (6,85 sur surface) |
| `--line` (séparateur, décoratif) | `#E1E1E1` | `#2E2E2E` |
| `--field-line` (bord de champ, 3:1) | `#8A8A8A` (3,45) | `#6E6E6E` (3,27) |
| `--scrim` | `rgba(26,26,26,.45)` | `rgba(0,0,0,.6)` |

### 4.3 États (indépendants des apps)

| Jeton | Clair | Sombre | Toujours avec |
|---|---|---|---|
| `--ok` | `#157A3E` (5,05) | `#4CC27A` (7,39) | icône coche + texte |
| `--warn` | `#9A5B00` (5,06) | `#F2B04A` (9,89) | icône triangle + texte |
| `--err` | `#C81E1E` (5,36) | `#FF6B6B` (6,01) | icône + message qui dit quoi faire |

Un état ne s'exprime jamais par la couleur seule. Le vert n'est pas la couleur d'une app, il reste libre pour « réussi ».

## 5. Typographie

Deux familles auto-hébergées (`site/fonts/`, `font-display: swap`, latin et latin étendu), soit 18 faces et 337 Ko sur le disque en latin et latin étendu, contre 1,2 Mo aujourd'hui. En pratique, le navigateur ne télécharge que les faces et les plages utilisées : environ 178 Kio mesurés par Codex sur les maquettes :
- **Barlow** 400, 500, 600 et 700, pour le texte et les contrôles.
- **Barlow Condensed** 600, 700 et 800 droites, plus 700 et 800 italiques, pour les titres et les chiffres.

Les 9 autres familles sortent de l'app quand plus rien ne les utilise. Le monospace des mots de passe passe par la police système (`ui-monospace`).

| Rôle | Police | Taille / interligne | Graisse |
|---|---|---|---|
| Titre de bandeau | Condensed **italique** | 44 / 44 (compact : 32 / 34) | 800 |
| Grand chiffre (accueil, progression) | Condensed droit, chiffres tabulaires | 48 / 48 | 800 |
| Titre de section | Condensed droit | 22 / 26 | 700 |
| Nom d'app (en-tête) | Barlow | 17 / 22 | 700 |
| Texte | Barlow | 16 / 24 | 400 |
| Libellé, bouton | Barlow | 16 / 20 | 600 |
| Secondaire, méta | Barlow | 14 / 20 | 500, `--muted` |
| Onglet du bas | Barlow | 12 / 16 | 600 |

- **L'italique est réservé aux titres de bandeau et au nom d'app sur sa carte.** Les chiffres de séries, de macros et d'heures restent droits et tabulaires (`font-variant-numeric: tabular-nums`).
- Les champs restent à 16 px au minimum (zoom sur iPhone), en minuscules : pas de capitales espacées.
- Tutoiement, phrases courtes ; « Ajouter » partout, et un verbe précis seulement pour une action différente (« Analyser », « Démarrer »).

## 6. Espacement, densité, mise en page

- **Échelle** : 4, 8, 12, 16, 20, 24, 32, 48. Marge d'écran de 20 px sur téléphone, 48 px sur ordinateur.
- **Cibles** : 44 px au minimum, 48 px pour les boutons principaux et les lignes de liste. Les lignes denses (agenda, séries) font 56 px.
- **Exception calendrier (écrans < 360 px)** : une grille à 7 colonnes ne peut pas tenir 7 × 44 px. Les cellules gardent 44 px de haut et descendent jusqu'à 36 px de large, sans espace mort entre elles. La grille peut empiéter sur la marge d'écran, jusqu'à 12 px. Le jour choisi est toujours signalé par plus que la couleur (fond plein + chiffre en gras). Au-delà de 360 px, la règle des 44 px s'applique.
- **Rayons** : contrôle 10 ; bloc 16 ; carte d'accueil 18 ; fenêtre 22 ; pilule (puce, bouton Sid'Bot) 999.
- **Un seul niveau de bloc** : les listes sont posées sur `--surface` avec des séparateurs `--line`. Jamais de carte dans une carte.
- **Téléphone (390 px)** : bandeau, puis contenu, puis barre du bas à 3 onglets (+ zone de sécurité). Grilles en `minmax(0,1fr)`.
- **Accueil** : salutation, puis les 3 cartes compactes (bandeau de 56 px avec logo, nom et rôle ; chiffre clé ; fonctions en puces). Les **trois apps et leurs fonctions doivent se voir sans défiler** sur 390 × 844.
- **Ordinateur (≥ 1024 px)** : barre latérale (logo de la suite, puis les 3 apps et leurs fonctions), bandeau en haut de la zone de contenu, contenu sur 720 px au maximum, ou en 2 colonnes pour la semaine ou le tableau de bord.

## 7. Icônes

- Une seule famille SVG au trait (`01-icones-au-trait.js`) : grille de 24, trait de 2, bouts arrondis, `currentColor`. **Aucun glyphe Unicode** (☰ ▦ ⇪ ◎ ↻ ↗ ‹ ⋯ ⏱) dans l'interface.
- Les icônes de l'interface sont droites. Seuls les pictogrammes des logos sont penchés.
- Une icône seule, sans texte, a toujours un `aria-label`. Dans la barre du bas, l'icône est toujours accompagnée de son libellé.

## 8. Composants

| Composant | Règle |
|---|---|
| **Bandeau d'app** | fond `--app`, texte `--on-app`. Ligne 1 : bouton « Toutes les apps », logo de 32, nom + rôle, bouton Sid'Bot. Ligne 2 : titre de la fonction (italique de 44). Ligne 3 : progression du jour (chiffre de 20 + barre de 6 px, en `--on-app` sur 18 % de noir). Il passe en **compact** (la ligne logo, nom, rôle et Claude reste ; le titre passe à 32 ; la progression disparaît) dès qu'on défile, quand le clavier est ouvert ou sous 700 px de haut |
| **Bouton Sid'Bot** | pilule, fond `--on-app`, texte et icône `--app`, libellé « Sid'Bot » (nom accessible « Ouvrir Sid'Bot, l'assistant »). Toujours en haut à droite du bandeau, dans les 3 apps ; il ouvre le panneau Sid'Bot de l'app en cours (v76) |
| **Bouton principal** | un seul par écran, fond `--app`, texte `--on-app`, 48 px, rayon 10, verbe à l'infinitif |
| **Bouton secondaire** | fond `--surface-2`, texte `--ink` |
| **Barre du bas** | 3 onglets ; l'onglet actif a l'icône en `--app-ink` et le libellé en `--ink` 700, avec un trait de 3 px en `--app` au-dessus ; les inactifs sont en `--muted` |
| **Carte d'accueil** | bandeau de 56 px (`--app` / `--on-app`, logo, nom en italique de 26, rôle) ; dessous, sur `--surface` : chiffre clé et 3 puces de fonctions (`--surface-2`, icône `--app-ink`) |
| **Champ** | fond `--surface`, bord de 1,5 px `--field-line`, rayon 10, 48 px, libellé au-dessus (jamais seulement un texte indicatif) ; date et heure avec `appearance:none` |
| **Liste** | lignes de 56 px, heure ou chiffre à gauche (Condensed droit), titre en 600 et méta en `--muted` ; la ligne en cours a un trait de 3 px en `--app` à gauche ; une ligne passée est en `--muted` |
| **Puce / filtre** | pilule de 36 px de haut (zone tactile de 44), fond `--surface-2` ; une puce active est en `--app` / `--on-app` |
| **Fenêtre (feuille)** | depuis le bas, rayon 22 en haut, poignée, titre en Condensed de 22, bouton principal en bas collé à la zone de sécurité |
| **Message bref** | en bas au-dessus de la barre, fond `--ink` et texte `--bg`, avec une action « Annuler » quand c'est possible ; 4 s |
| **État vide** | pictogramme de l'app en `--muted`, une phrase, le bouton principal |
| **Lien entre apps** | puce avec le pictogramme et le nom de l'autre app (« Sid'Forme ») dans une ligne d'agenda |
| **Bandeau de la suite** (Réglages, Installer) | fond `--surface-2`, texte `--ink`, pas de bouton Sid'Bot ni de progression ; jamais un bloc clair sur fond sombre |
| **Sélection** | un choix sélectionné (puce, segment, case de choix multiple) est **plein** : `--app` / `--on-app` dans une app, `--ink` / `--bg` dans la suite ; une simple bordure ne suffit jamais. Les choix multiples ajoutent une coche |
| **Ligne repliée** | 56 px, chevron dessiné (jamais « › » ou « ▶ » en caractère), titre `--ink` 600, état à droite en `--muted` (en `--app-ink` quand il est actif) |
| **Panneau Sid'Bot** (v76) | fenêtre neutre (pas de couleur d'app) : titre « Sid'Bot », choix de l'app (segment plein `--ink` / `--bg`), puces « Partagé avec Sid'Bot » retirables, bulles (moi : `--ink` / `--bg` ; Sid'Bot : `--surface-2`), propositions avec un bouton chacune, erreur avec icône + phrase qui dit quoi faire (`--err`), champ + « Envoyer ». Remplace la « Conversation Claude » (retirée en v76) |
| **Accueil, vue simple** (v76, défaut) | 3 tuiles égales : logo de 72, nom, rôle ; « Affichage détaillé » en lien sous les tuiles et dans Réglages ; carte « Premiers pas » (3 actions réelles, « 1 sur 3 », masquable, relançable) |
| **Fermer** | bouton icône de 44 px, fond `--surface-2`, croix dessinée ; jamais le caractère « × » |
| **Nombres** | format de la langue (« 2 400 », « 3,7 g » ; EN « 2,400 », « 3.7 g »), espace insécable normale (U+00A0) entre nombre et unité et pour les milliers : l'espace fine U+202F est quasi invisible en Barlow (2 px) |

## 9. États

| État | Rendu |
|---|---|
| Survol (ordinateur) | fond de 6 % de `--ink` |
| Appui | fond de 10 % de `--ink`, ou `--app` assombri de 8 % pour un bouton coloré |
| **Focus clavier** | anneau de 2 px en `--ink` avec un décalage de 2 px ; sur `--app`, l'anneau est en `--on-app`. Il n'est jamais retiré |
| Désactivé | opacité de 45 %, avec une raison affichée à côté quand elle n'est pas évidente |
| Chargement | le libellé du bouton reste, un indicateur au trait de 16 px apparaît, le bouton n'accepte qu'un appui |
| Erreur | message en `--err` sous le champ, icône, phrase qui dit quoi faire |
| Réussite | coche + message bref ; la barre de progression avance |
| Confirmation à risque | deux appuis (comportement actuel conservé), le second bouton en `--err` |

## 10. Mouvement

| Mouvement | Rôle | Durée / courbe |
|---|---|---|
| La barre de progression avance | récompenser l'effort | 380 ms, `cubic-bezier(.3,1.35,.5,1)`, léger rebond |
| « +1 » / le chiffre défile | confirmer le compte | 260 ms, même courbe |
| Le bandeau passe en compact | garder le contenu visible | 180 ms, `ease-out` |
| Fenêtre qui s'ouvre / se ferme | situer | 240 / 180 ms, `cubic-bezier(.2,.8,.2,1)` |
| Changement d'onglet | aucun déplacement | fondu de 120 ms |
| Ouvrir une app depuis l'accueil | relier la carte au bandeau | la couleur s'étend en 260 ms |

- Le rebond n'existe que pour la progression. Le reste est sobre.
- **La barre de progression dit toujours la vérité** (faites / total du jour) : elle n'avance que quand quelque chose est **fait** (activité passée ou cochée, tâche cochée, série saisie complète (kg et répétitions), repas noté contre l'objectif). **Ajouter** n'est pas progresser : à l'ajout, le chiffre se met à jour (défilement de 260 ms, sans rebond), la barre se recale sans rebond, et la nouvelle ligne apparaît sur `--app-soft` avec le message « Activité ajoutée ». Pas de fausse barre de confirmation.
- **Focus** : la barre montre la position dans le programme (temps écoulé / durée totale, pauses prévues comprises), libellée « 35 min sur 1 h 30 · session 2 sur 4 », jamais « travaillé ». Un seul mot pour les blocs de travail, « session », partout (bandeau, cadran, programme). Avant le démarrage, le bandeau affiche la durée prévue, par exemple « 1 h 30 · 4 sessions », jamais « session 0 ». Heures au format 10:41. « Passer » avance la barre sans rebond ; le rebond n'a lieu qu'à la fin naturelle d'une session. Logique du chrono et journal inchangés.
- **Mouvement réduit** (préférence du système) : les durées passent à 1 ms et le rebond disparaît ; les fondus de moins de 150 ms restent. L'état final est le même.
- Aucune animation en boucle, sauf l'indicateur de chargement, qui reste fixe en mouvement réduit.

## 11. Jetons (proposés par Codex, validés)

| Niveau | Jetons |
|---|---|
| Thème | `--bg --surface --surface-2 --field --ink --muted --line --field-line --bar --scrim`, `--ok --warn --err` |
| App (posés sur `[data-app]` et sur chaque carte) | `--app --on-app --app-ink --app-soft` ; alias provisoires vers les anciens noms (`--accent`, `--on-accent`…) |
| Composants | `--font` (Barlow), `--display` (Condensed italique), `--digits` (Condensed droit tabulaire) ; `--s-1…--s-8` ; `--r-ctl --r-blk --r-card --r-sheet --r-pill` ; `--hit` 44, `--hit-main` 48 ; `--t-fast --t-base --t-prog --ease --ease-prog` |

Migration (Codex) : `app.css` garde la structure et les correctifs iPhone. `design.css` devient la peau Élan, sans empiler de `!important`. `ident.css` ne s'applique plus. On migre un parcours complet (React et version de secours), puis on regroupe tout dans `app.css` et on retire les deux feuilles historiques.

## 12. Ce qui est retiré (validé par Sid le 5 nov.)

- Les 9 identités par fonction et le réglage « Style des fonctions : Unique / Sobre ».
- Le champ Claude en tête d'Agenda, Musculation, Nutrition et Notes, remplacé par le bouton Claude (la conversation reste accessible).
- Les anciennes icônes d'écran d'accueil.

Toute autre simplification de parcours (`audit-produit.md` § 6) est d'abord présentée à Sid : problème, bénéfice, étapes avant et après.

## 13. Vérifications avant de dire « fait »

Téléphone à 390 et à 320 px, ordinateur à 1280 px, en clair et en sombre ; contenu long (titre de 80 caractères, 30 activités) ; clavier ouvert ; navigation au clavier et focus visible ; contrastes de ce document ; mouvement réduit ; aucun débordement horizontal ni erreur JS ; `npm test` et `tests/smoke.js` (rouge connu sur `main`, comparer avant et après) ; captures avant et après dans `docs/refonte/apres/`.
