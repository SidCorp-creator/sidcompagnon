# Audit produit — Sid'compagnon 74.5

Responsable : Claude Code. Rédigé le 5 nov. 2026 à partir du code, de `CLAUDE.md` et de l'historique des versions.
Confronté le 5 nov. aux captures « avant » de Codex (`~/sidcompagnon-codex/docs/refonte/avant/`, 84 PNG). Les constats vus sur capture sont marqués **[capture]**.
Aucun test utilisateur n'a été mené : les « problèmes d'usage » ci-dessous sont des constats sur l'interface ou des hypothèses, jamais des résultats mesurés auprès d'utilisateurs.

## 1. Utilisateurs et usage

- **Sid** (étudiant à l'UMons, utilisateur principal, non développeur) et **ses proches** (comptes séparés). PWA installée sur iPhone ; usage ordinateur prévu (marges de 48 px, barre latérale `renderSide`).
- Langues : FR (principal), EN, NL. Thème sombre par défaut depuis la v45.
- Claude est un **deuxième point d'entrée** : un connecteur (nommé « Sid'note » chez Claude, nom à ne pas changer) lit et écrit l'agenda, les tâches, les notes, la nutrition et la musculation. Une partie des saisies se fait donc hors de l'app.

## 2. Périmètre des écrans (11 vues + fenêtres)

| Niveau | Écran (`id`) | Tâches principales |
|---|---|---|
| Suite | Connexion / inscription, mode essai | créer un compte, se connecter, mot de passe oublié |
| Suite | Présentation (`#onb`) | choisir ses fonctions |
| Suite | Accueil `v-home` | voir le jour, ouvrir une des 3 apps, ajout rapide (`#homeAdd`) |
| Suite | Réglages `v-more`, Installer `v-app` | compte, apparence, langue, notifications, sauvegarde, Claude, vie privée, coffre |
| **Sid'agenda** | Agenda `v-plan` | voir jour / mois / année / liste, ajouter une activité (texte libre « Compris : … »), calendriers iCal reliés, rappels |
| | Tâches `v-todo` | ajouter, cocher, classer par catégorie, mettre en suspens, glisser pour ordonner, vue calendrier |
| | Focus `v-pomo` | lancer un Pomodoro (durée totale, rythme), musique Spotify, statistiques du jour |
| **Sid'fit** | Musculation `v-muscu` | séances A/B/C, séries (poids × répétitions), conseils par objectif, chrono, statistiques, import de programme, programme sur mesure |
| | Nutrition `v-nutri` | profil et besoins, noter un repas (texte, photo, galerie, manuel, via Claude), journée et macros, menus générés, calendrier, objectif de poids |
| | Graphiques `v-graph` | poids, macros, calories, bilans hebdomadaires |
| **Sid'note** | Notes `v-notes` | dossiers et sous-dossiers, éditeur riche, notes secrètes chiffrées, PDF dans les notes |
| | Documents `v-docs` | classeurs, import, scanner, lecteur PDF annoté, partager |
| | Mots de passe `v-pwd` | coffre chiffré (code, Face ID), recherche, ajout |
| Fenêtres | ajout rapide, actions, copier un repas, séance, exercice, code, sauvegarde, assistant Claude… | |

Vues présentes mais retirées de la navigation : `v-lists` (Listes partagées, `OFF_TABS`), `v-spaces`.

## 3. Architecture actuelle

- **Suite → 3 apps → 3 fonctions chacune** (`GROUPS`, `app/src/shell/07-…js:5`). Accueil sans barre du bas ; dans une app : en-tête (logo, nom, retour) + barre du bas avec ses 3 fonctions.
- Les 3 apps sont **des regroupements de fonctions** dans une seule PWA, pas trois applications séparées. C'est une bonne base : la refonte peut garder ce modèle.

## 4. Constats (observés dans le code)

### 4.1 Identité : trois couches superposées
- `app.css` (104 Ko) → `design.css` (82 Ko, v42 « Éditorial de précision ») → `ident.css` (14 Ko, v74 : une identité par fonction).
- **9 ambiances de couleur** (v49) + **9 identités de fonction** (v74) + réglage « Style des fonctions : Unique / Sobre » + réglage « Couleurs » + thème.
- **11 familles de polices** (compte corrigé par Codex), 1,2 Mo dans `site/fonts/` (Fraunces, Inter Tight, IBM Plex Mono, Instrument Serif/Sans, Manrope, Newsreader, Barlow Condensed, Archivo, JetBrains Mono, Public Sans).
- Conséquence : chaque fonction a sa propre marque. **C'est exactement ce que la nouvelle consigne demande d'éviter**, et c'est coûteux à maintenir (deux apparences à tester partout : Unique et Sobre).

### 4.2 Logos
- 4 icônes (`site/icons/*.svg`) : carré arrondi coloré (terre cuite, sauge, or, gris clair) + pictogramme noir (calendrier, haltère, maison, feuille) + **pastille « S » en bas à droite**.
- Les pictogrammes sont génériques (on les trouverait dans n'importe quel pack d'icônes) ; la pastille « S » est le seul lien de famille et devient illisible en petite taille *(à vérifier à 16–32 px)*.
- Graphie hésitante : « Sid'compagnon », « sid'agenda » (minuscule dans `GROUPS`), « Sid'agenda » (doc), « SidAgenda » (demande de Sid).

### 4.3 Hiérarchie et densité
- **Le champ Claude passe avant l'action principale** : en haut d'Agenda, Musculation, Nutrition, Notes (« Planifier », « Envoyer », « Analyser »), puis un onglet « Conversation Claude » (74.2), puis seulement « + Activité » / la liste. Hypothèse : l'action la plus fréquente (voir et ajouter) est repoussée sous un bloc secondaire.
- **Nutrition** est l'écran le plus chargé (≈ 12 000 caractères de gabarit) : profil complet, 5 façons d'ajouter un repas (texte, Photo, Galerie, « Ou dis-le à Claude », manuel), onglets Ma journée / Menus / Profil, préférences du menu.
- **Réglages** : ≈ 16 500 caractères, 9 sections ; les conversations Claude y sont réglables **et** dans chaque app (deux endroits pour la même donnée `aiConv`).
- Les règles d'espacement de la v49 (56 px par ligne, 48 px par champ) sont saines mais s'appliquent sans hiérarchie : tout a la même importance *(à vérifier)*.

### 4.4 Vocabulaire et actions
- Pour « ajouter », on trouve : « Créer », « Ajouter », « + Ajouter », « + Activité », « + Note », « + Dossier », « + PDF », « ⇪ Importer », « Planifier », « Analyser », « Envoyer ».
- Icônes faites de caractères Unicode (☰ ▦ ⇪ ◎ ↻ ↗ ‹ ⋯ ⏱) mêlées aux icônes SVG au trait (`01-icones-au-trait.js`) : épaisseur, alignement et rendu varient selon le système *(à vérifier)*.
- Tutoiement cohérent, phrases simples : à garder.

### 4.5 Mouvement
- Animation d'ouverture, `appOutro` (le logo rejoint sa tuile), confirmations en deux appuis, chargements. Le mouvement réduit suit la **préférence du système** (`prefers-reduced-motion`, correction de Codex, T2) ; `appOutro` la respecte. Pas d'inventaire complet : voir T2.

### 4.6 Vu sur les captures (iPhone, sombre)
- **[capture]** Agenda (`iphone-dark-agenda-jour.png`) : avant la journée viennent l'éphéméride, le champ « Ton activité… » + « Planifier », « Conversation Claude » puis « + Activité ». La journée affiche 7 h → 22 h même avec 2 activités (beaucoup de vide), puis « + Ajouter une activité ce jour » : **trois façons d'ajouter sur le même écran**.
- **[capture]** Nutrition (`iphone-dark-nutrition-jour.png`) : autre police (large) et autre accent (olive) que le reste de Sid'fit ; bloc « Branche Claude » en tête ; **valeurs des macros coupées à droite** (« 72 / 140 g ») et « Petit-déjeu… » tronqué : défauts réels à corriger quelle que soit la direction.
- **[capture]** Accueil (`iphone-dark-accueil.png`) : cartes avec filet de couleur en haut, noms en minuscules à empattements (« sid'agenda »), étiquettes en capitales espacées ; le message « Bienvenue sur Sid'compagnon » recouvre la carte Sid'note.
- Correction de Codex (T2) : le style « Sobre » est **fonctionnel** ; seules les anciennes `PALETTES` ne sont plus appliquées.

## 5. À préserver absolument

- Toutes les fonctions listées au § 2, les données (`mergeData`), le chiffrement, le connecteur `mcp` et son nom.
- Les pièges iPhone de `CLAUDE.md` (`[hidden]`, champs ≥ 16 px, `minmax(0,1fr)`, `appearance:none`).
- Le tutoiement, le FR/EN/NL, le thème sombre par défaut, les tailles tactiles de la v49.
- Le modèle Suite → 3 apps → fonctions.

## 6. Pistes de simplification (à valider, rien n'est supprimé sans accord)

| Problème | Piste | Bénéfice attendu |
|---|---|---|
| 9 identités de fonction + 2 styles | 1 identité de suite + 3 personnalités d'app ; la fonction ne varie que par son icône et son titre | une seule apparence à tester ; repérage par app plus net |
| Champ Claude en tête | action principale en tête ; Claude dans un bouton secondaire constant (même place dans toutes les apps) | 1 coup d'œil pour ajouter ; Claude toujours au même endroit |
| 5 façons d'ajouter un repas visibles | un seul champ « Ajouter un repas » ; photo / galerie / manuel dans le même bloc, en options | moins de choix affichés, aucun retiré |
| Conversations Claude à 2 endroits | un seul réglage, dans l'app concernée | une donnée, un endroit |
| 11 verbes pour « ajouter » | « Ajouter » partout ; verbes spécifiques seulement pour une action différente (« Analyser ») | vocabulaire prévisible |
| Glyphes Unicode | une seule famille d'icônes SVG au trait | rendu identique sur tous les appareils |
| 11 polices, 1,2 Mo | 2 familles (+ chiffres tabulaires) | chargement plus léger, identité plus nette |
