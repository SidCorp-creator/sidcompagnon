# Audit technique — référence avant refonte

Mesuré le 5 novembre 2026 sur `refonte-tech`, commit `3d783f9` (v74.5). Aucun changement de production. Les mesures portent sur le code présent, pas sur la production distante. Les captures et leurs limites sont dans [avant/index.md](avant/index.md).

## Méthode et limites

Analyse AST PostCSS : nombre de règles (y compris celles des media queries), déclarations, `!important`, valeurs exactes et références de lignes. Une occurrence = une déclaration source ; **ce ne sont pas des fréquences de styles calculés ni une preuve d’utilisation**. Les alias, variantes de thème et règles surchargées sont comptés. Inventaire complet, toutes valeurs et localisations : [inventaire-technique.json](inventaire-technique.json), reproductible avec `NODE_PATH=<dépendances PostCSS> node tests/inventaire-refonte.cjs`.

Le code inline HTML/JS/TSX n’entre pas dans ces totaux CSS : la dette réelle est donc supérieure. Les composants sont inventoriés par famille, sans prétendre identifier tout le CSS mort. Aucune suppression n’est justifiée par la seule recherche textuelle.

## Couches et cascade mesurées

| Couche | Octets | Règles | Déclarations | !important |
|---|---:|---:|---:|---:|
| site/app.css:1 | 103892 | 1216 | 4280 | 53 |
| site/design.css:1 | 82321 | 975 | 2563 | 68 |
| site/ident.css:1 | 14171 | 108 | 260 | 4 |
| site/fonts.css:1 | 17096 | 0 | 256 | 0 |

Les fonts utilisent des at-rules `@font-face`, d’où zéro règle ordinaire. L’ordre du document charge les polices puis app.css, design.css et ident.css (`site/index.html:30–33`). Les anciennes variables sont redéfinies par le design éditorial puis certaines fonctions changent encore la typographie et la géométrie.

Exemples démontrés de surcharges : `.btn` passe des règles de base aux coins 6 px (`site/design.css:35`), à l’encre avec `!important` (:300), puis à la couleur d’app avec `!important` (:451), puis à 48 px minimum (:1023). `.sheet` passe par 6 px (:60, :127) puis 8 px (:320). La carte commune perd fond/bordure et rayon (:294), tandis que Nutrition impose des angles droits (`site/ident.css:75`, :79). Notes change à nouveau de police (:98). Ces différences sont prouvées dans le code ; leur pertinence graphique relève du choix de Sid.

Dette partiellement inactive : `PALETTES` est toujours construite et ses choix enregistrés (`app/src/shell/36-apparence-couleur-et-theme.js:3`, :24), mais `applyLook()` retire `data-palette` (:9) et ne les applique plus. Le commentaire :7 l’explicite. **Sobre n’est pas mort** : le contrôle `site/index.html:599`, le gestionnaire :28 et le `toggleAttribute` :17 activent/désactivent réellement ident.css. Le supprimer demanderait une décision produit.

## Jetons et valeurs

Variables présentes : `--bg`, `--surface`, `--ink`, `--muted`, `--line`, `--field`, couleurs de statut/catégorie, `--font`, `--mono`, `--digits`, `--r-card`, `--r-ctl` (`site/app.css:5–14`) ; `--display`, `--app`, `--on-app`, `--rule`, `--ease` dans design.css. L’inventaire JSON donne **toutes** leurs redéfinitions et références. Il n’existe pas une échelle unique imposée : beaucoup de rayons, espacements et tailles restent littéraux.

Les tableaux suivants donnent les 18 valeurs exactes les plus fréquentes par propriété (toutes les autres dans le JSON). `var(...)` indique une référence à un jeton ; les valeurs numériques, couleurs et fonctions littérales sont en dur. Les composites peuvent mélanger les deux.

### `color`

| Valeur source | Occurrences | Première référence |
|---|---:|---|
| `var(--muted)` | 159 | site/app.css:48 |
| `var(--ink)` | 103 | site/app.css:39 |
| `var(--app)` | 45 | site/design.css:329 |
| `var(--accent)` | 32 | site/app.css:60 |
| `var(--gold)` | 22 | site/app.css:183 |
| `var(--bg)` | 16 | site/app.css:738 |
| `#fff` | 15 | site/app.css:151 |
| `var(--late)` | 13 | site/app.css:97 |
| `var(--on-accent)` | 11 | site/app.css:59 |
| `inherit` | 8 | site/app.css:56 |
| `var(--on-gold)` | 8 | site/app.css:186 |
| `var(--on-app)` | 5 | site/design.css:451 |
| `var(--warn)` | 4 | site/app.css:163 |
| `var(--g-ink)` | 4 | site/app.css:792 |
| `var(--ok)` | 3 | site/app.css:98 |
| `var(--on-app,#fff)` | 3 | site/design.css:568 |
| `#1C1A17` | 3 | site/design.css:804 |
| `var(--good,#2e7d32)` | 2 | site/app.css:1191 |

### `background`

| Valeur source | Occurrences | Première référence |
|---|---:|---|
| `none` | 56 | site/app.css:94 |
| `var(--surface)` | 50 | site/app.css:50 |
| `var(--bg)` | 48 | site/app.css:43 |
| `transparent` | 27 | site/app.css:85 |
| `var(--field)` | 27 | site/app.css:784 |
| `var(--accent-soft)` | 20 | site/app.css:60 |
| `var(--app)` | 17 | site/design.css:451 |
| `var(--gold)` | 16 | site/app.css:186 |
| `var(--ink)` | 13 | site/app.css:738 |
| `var(--surface-2)` | 12 | site/design.css:309 |
| `var(--accent)` | 11 | site/app.css:59 |
| `var(--c)` | 10 | site/app.css:134 |
| `var(--line)` | 9 | site/app.css:80 |
| `var(--late)` | 9 | site/app.css:151 |
| `var(--ok)` | 8 | site/app.css:81 |
| `var(--app-soft)` | 6 | site/design.css:483 |
| `#fff` | 5 | site/app.css:332 |
| `var(--g-bg)` | 5 | site/app.css:786 |

### `border-radius`

| Valeur source | Occurrences | Première référence |
|---|---:|---|
| `6px` | 161 | site/app.css:74 |
| `50%` | 42 | site/app.css:76 |
| `10px` | 34 | site/app.css:59 |
| `12px` | 32 | site/app.css:218 |
| `99px` | 24 | site/app.css:80 |
| `0` | 18 | site/app.css:507 |
| `14px` | 17 | site/app.css:50 |
| `8px` | 17 | site/app.css:122 |
| `4px` | 17 | site/app.css:163 |
| `3px` | 17 | site/app.css:403 |
| `var(--r-ctl)` | 8 | site/app.css:781 |
| `2px` | 6 | site/app.css:408 |
| `5px` | 5 | site/app.css:203 |
| `9px` | 5 | site/app.css:258 |
| `999px` | 5 | site/app.css:1127 |
| `16px` | 4 | site/app.css:639 |
| `0 6px 6px 0` | 4 | site/design.css:45 |
| `var(--r-card)` | 3 | site/app.css:775 |

### `box-shadow`

| Valeur source | Occurrences | Première référence |
|---|---:|---|
| `none` | 13 | site/app.css:522 |
| `0 0 0 1px var(--line)` | 4 | site/app.css:802 |
| `inset 0 0 0 2px rgba(0,0,0,.08)` | 2 | site/app.css:114 |
| `inset 0 0 0 1px var(--line)` | 2 | site/app.css:782 |
| `inset 0 -2px 0 var(--gold),0 1px 4px rgba(0,0,0,.12)` | 1 | site/app.css:184 |
| `0 6px 20px rgba(31,95,191,.25)` | 1 | site/app.css:244 |
| `0 1px 3px rgba(0,0,0,.08)` | 1 | site/app.css:259 |
| `0 1px 3px rgba(0,0,0,.25)` | 1 | site/app.css:332 |
| `0 8px 24px rgba(0,0,0,.18)` | 1 | site/app.css:386 |
| `0 2px 10px rgba(0,0,0,.15)` | 1 | site/app.css:408 |
| `0 1px 4px rgba(0,0,0,.2)` | 1 | site/app.css:412 |
| `0 1px 2px rgba(0,0,0,.06)` | 1 | site/app.css:518 |
| `0 10px 28px rgba(0,0,0,.25)` | 1 | site/app.css:529 |
| `0 2px 10px color-mix(in srgb,var(--accent) 14%,transparent)` | 1 | site/app.css:550 |
| `0 10px 30px rgba(0,0,0,.18)` | 1 | site/app.css:715 |
| `0 6px 18px rgba(0,0,0,.25)` | 1 | site/app.css:738 |
| `inset 3px 0 0 var(--c)` | 1 | site/app.css:819 |
| `0 0 0 3px var(--gold)` | 1 | site/app.css:947 |

### `font-size`

| Valeur source | Occurrences | Première référence |
|---|---:|---|
| `13px` | 47 | site/app.css:48 |
| `14px` | 45 | site/app.css:98 |
| `16px` | 33 | site/app.css:306 |
| `15px` | 30 | site/app.css:40 |
| `12px` | 24 | site/app.css:118 |
| `11px` | 24 | site/app.css:125 |
| `17px` | 13 | site/app.css:96 |
| `22px` | 13 | site/app.css:100 |
| `19px` | 6 | site/app.css:459 |
| `18px` | 6 | site/app.css:466 |
| `20px` | 5 | site/app.css:228 |
| `10px` | 5 | site/app.css:455 |
| `40px` | 5 | site/app.css:526 |
| `30px` | 4 | site/app.css:436 |
| `26px` | 3 | site/app.css:92 |
| `34px` | 3 | site/app.css:828 |
| `32px` | 2 | site/app.css:47 |
| `28px` | 2 | site/app.css:642 |

### `padding`

| Valeur source | Occurrences | Première référence |
|---|---:|---|
| `0` | 29 | site/app.css:85 |
| `10px 12px` | 17 | site/app.css:65 |
| `12px 14px` | 11 | site/app.css:51 |
| `6px 10px` | 9 | site/app.css:122 |
| `14px` | 9 | site/app.css:195 |
| `6px 0` | 8 | site/app.css:90 |
| `4px 0` | 8 | site/app.css:125 |
| `8px 12px` | 8 | site/app.css:531 |
| `12px` | 7 | site/app.css:110 |
| `6px 12px` | 5 | site/app.css:98 |
| `0 4px` | 5 | site/app.css:103 |
| `8px 4px` | 5 | site/app.css:218 |
| `10px 14px` | 5 | site/app.css:273 |
| `10px` | 5 | site/app.css:349 |
| `6px 4px` | 5 | site/app.css:365 |
| `3px` | 4 | site/app.css:257 |
| `6px` | 4 | site/app.css:279 |
| `0 6px` | 4 | site/app.css:477 |

### `margin`

| Valeur source | Occurrences | Première référence |
|---|---:|---|
| `0` | 45 | site/app.css:41 |
| `0 0 10px` | 10 | site/app.css:493 |
| `0 auto` | 9 | site/app.css:45 |
| `0 0 12px` | 5 | site/app.css:75 |
| `0 0 14px` | 4 | site/app.css:49 |
| `4px 0 0` | 4 | site/app.css:923 |
| `4px 0` | 3 | site/app.css:92 |
| `6px 0 4px` | 3 | site/app.css:464 |
| `14px 0 6px` | 3 | site/app.css:1143 |
| `0 0 8px` | 3 | site/app.css:1155 |
| `2px 0 0` | 2 | site/app.css:73 |
| `4px 0 12px` | 2 | site/app.css:91 |
| `22px 0 8px` | 2 | site/app.css:103 |
| `8px 0` | 2 | site/app.css:469 |
| `6px 0 0` | 2 | site/app.css:479 |
| `0 2px 6px` | 2 | site/app.css:724 |
| `12px 0 4px` | 2 | site/app.css:1143 |
| `2px 0` | 2 | site/app.css:1144 |

### `gap`

| Valeur source | Occurrences | Première référence |
|---|---:|---|
| `8px` | 83 | site/app.css:73 |
| `6px` | 58 | site/app.css:38 |
| `10px` | 57 | site/app.css:79 |
| `12px` | 33 | site/app.css:51 |
| `4px` | 25 | site/app.css:118 |
| `2px` | 22 | site/app.css:124 |
| `14px` | 15 | site/app.css:208 |
| `3px` | 11 | site/app.css:126 |
| `16px` | 6 | site/app.css:513 |
| `0` | 5 | site/design.css:423 |
| `1px` | 4 | site/app.css:148 |
| `18px` | 4 | site/app.css:893 |
| `5px` | 3 | site/app.css:652 |
| `7px` | 2 | site/app.css:429 |
| `22px` | 2 | site/design.css:417 |
| `12px 8px` | 1 | site/app.css:143 |
| `10px 26px` | 1 | site/app.css:517 |
| `12px 28px` | 1 | site/app.css:1020 |

## Polices : fichiers, poids et coût

Tous les fichiers servis localement dans site/fonts ; coût en Kio = octets / 1024, non additionné par déclaration (plusieurs faces réutilisent le même fichier). Le coût téléchargé dépend des caractères, des écrans ouverts et du cache.

| Famille | Poids déclarés | Fichiers uniques | Kio | Usage source |
|---|---|---:|---:|---|
| 'Archivo' | 400 900 | 2 | 66.0 | ident.css:72 |
| 'Barlow Condensed' | 600, 700, 800 | 6 | 70.6 | ident.css:55 |
| 'Fraunces' | 300, 400 | 4 | 273.1 | design.css:361 ; design.css:551 ; design.css:596 ; design.css:709 ; design.css:784 |
| 'IBM Plex Mono' | 400, 500 | 4 | 55.1 |  |
| 'Instrument Sans' | 400 700 | 2 | 40.0 | ident.css:26 |
| 'Instrument Serif' | 400 | 4 | 45.9 | ident.css:26 |
| 'Inter Tight' | 300, 400, 500 | 2 | 131.5 | design.css:16 |
| 'JetBrains Mono' | 400 700 | 2 | 41.9 |  |
| 'Manrope' | 200 600 | 2 | 38.7 | ident.css:40 ; app.css:10 |
| 'Newsreader' | 400, 400 600 | 4 | 312.8 |  |
| 'Public Sans' | 400 700 | 2 | 44.0 | ident.css:113 |

Total disque : 1119.6 Kio, 34 fichiers (détail individuel en JSON).

## Composants et variantes

Les sources TSX et les rendus de secours shell doivent garder le même contrat de classes/data-attributs (`app/src/islands.tsx:1`). Changer seulement React ferait varier le résultat selon le chargement.

| Famille | Variantes / définitions CSS | Sources de rendu | Écart constaté dans le code |
|---|---|---|---|
| Boutons | `.btn`, ghost, mini, danger, icône ; app.css, design.css:300, :451, :1023 | app/src/Forms.tsx:1, Small.tsx:1 ; shell/05-utilitaires.js:1 et rendus de chaque fonction | Coins 6 px, rond Focus (ident.css:49), carré Nutrition (:85) |
| Champs | input/select/textarea, search, set-in ; design.css:307, :914 | Forms.tsx:1, Muscu.tsx:1 ; shell/22-musculation.js:1 | Champ muscu et libellé superposés pour nom complet ; préserver les deux rendus (design.css, fin du fichier) |
| Pastilles | pill, seg, badges, catégories ; design.css:48, :109 | Todos.tsx:1, Shell.tsx:1 ; shell/08-a-faire.js:1 | Rayon 6 px commun contre 3 px Tâches (ident.css:33) |
| Fenêtres | sheet, sheet-bg, pin, act-list ; design.css:320, :912 | Sheets.tsx:1, Vault.tsx:1 ; shell/05-utilitaires.js:1 | Plusieurs couches de rayons ; grilles iPhone corrigées tardivement |
| Listes | row, note-row, pw-row, prow | Todos.tsx:1, Notes.tsx:1, Vault.tsx:1, Agenda.tsx:1 ; shell/08,09,29 | Structures et actions propres à chaque domaine, ne pas uniformiser les comportements sans revue |
| Cartes | card, dish, gr-card, ms, home-card ; design.css:294, ident.css:58,75,91 | Home.tsx:1, Nutrition.tsx:1, Charts.tsx:1, Muscu.tsx:1 | Filets éditoriaux, cartes sport et géométries par fonction coexistent |
| Barre du bas | nav, navIn ; site/index.html et design.css | Shell.tsx:1 ; shell/07-onglets-ranges-par-categories.js:1 | Pas de barre sur accueil, 3 fonctions propres à l’app ; conserver les cibles de navigation |
| En-tête | vhead ; design.css:334, :466 | Shell.tsx:1 ; shell/07-onglets-ranges-par-categories.js:1 | Masqué dans éditeur Notes (shell/29-notes-libres.js:54) |

Ces écarts sont des différences structurelles mesurées ; ils ne prouvent pas à eux seuls un défaut visuel. Les captures servent de référence pour la revue graphique.

## Icônes et logos

`app/src/shell/01-icones-au-trait.js:2` définit ICS (SVG inline), distinct des logos. `LOGO()` produit un `<img>` local depuis `site/icons/{home,agenda,fit,note}.svg` (`shell/05-utilitaires.js:48–49`). Chaque logo a aussi un PNG 128 px. Les PNG de racine (`logo-192.png`, maskable, etc.) servent notamment à la PWA et aux marques HTML ; ne pas changer seulement les quatre SVG.

Les emojis sont également des symboles d’interface et de contenu (ex. Nutrition, chargements, aides) : rendu dépendant de l’OS, contrairement aux SVG. Recherche reproductible : caractères Unicode pictographiques dans `site/index.html`, `app/src` et `site/exercices*.js` ; aucune équivalence automatique SVG/emoji recommandée. L’inventaire complémentaire ci-dessous liste les fichiers PNG et les occurrences emoji, sans confondre occurrence et icône réellement affichée.

## Animations et mouvement réduit

Ouverture : 2 000 ms puis disparition 180 ms (`shell/06-animation-d-ouverture-de.js:30–31`) ; variantes aléatoires agenda/fit/note (:6). Sortie : overlay 1 500 ms, titre 600 ms, logo 1 000 ms + délai 300 ms, accueil 700 ms + délai 800 ms (:44–50). Splash : nettoyage 400 ms en mouvement réduit contre 2 100 ms (`shell/05-utilitaires.js:54`).

Les deux animations d’app consultent `prefers-reduced-motion` (:25, :36) ; le splash garde un fondu bref (`design.css:371`). CSS traite fresh/progression (app.css:106), flash/anneau (:237), zoom (:329), présentation (:445), micro (:575), chargement/shimmer (:676), anneau nutrition (:1273), présentation éditoriale (design.css:509), overlays (:597). **Cela n’est pas une preuve de couverture exhaustive** : toutes les déclarations animation/transition, leurs durées et lignes sont dans `inventaire-technique.json.animations`. Pas de préférence applicative indépendante identifiée dans applyLook ou Réglages : le commentaire « réduire les animations » vise la préférence système. À valider avec Sid si un réglage interne est souhaité.

## Contraintes à préserver

- `[hidden]{display:none!important}` : contrat de visibilité à garder, documenté dans CLAUDE.md « Pièges iPhone » et défini dans app.css:33. Les sélecteurs ciblant `:not([hidden])` ne suffisent pas à remplacer cette règle.
- iPhone : champs >=16 px, date/heure avec appearance et hauteur maîtrisées, grilles minmax(0,1fr), safe-area, défilement des fenêtres ; audio déverrouillé par toucher (`shell/05-utilitaires.js`, CLAUDE.md).
- CSP : `site/vercel.json:1` ; les tests locaux reprennent les en-têtes (`tests/serve.js:6`). Garder polices/images/scripts locaux compatibles ; ne pas introduire d’inline JS arbitraire ou de CDN pour la charte.
- `site/app.js` est généré : modifier `app/src/shell`, ordre `ORDER.txt`, reconstruire dans app ; `tests/shell.test.js:1` vérifie la fidélité. Aucun patch manuel du généré.
- Îlots React progressifs et secours shell : app/src/islands.tsx:1, types.ts:1 et chaque rendu de domaine. Préserver identifiants, événements délégués et attributs data.
- FR/EN/NL : `site/i18n.js:1`, shell/04 et shell/43 ; textes visibles à traduire et contenu utilisateur à protéger. La planche avant reste FR, les tests futurs doivent couvrir les trois langues.
- PWA : `site/sw.js:1`, BUILD dans shell/04, APP_V et affichage Réglages. Au changement livré, versionner ensemble et tester mise à jour/cache ; rien à incrémenter pour cet audit sans changement d’app.

## Recommandation (proposition, non décision graphique)

1. Faire choisir la direction à Sid sur les mêmes contenus denses, mobile et ordinateur, clair et sombre. Choisir aussi le devenir de Unique/Sobre et le nombre de familles typographiques.
2. Créer une seule base : jetons sémantiques de thème/app/état + reset et accessibilité + composants + adaptations de domaine. Définir explicitement l’ordre, puis migrer une famille de composants à la fois ; ne pas simplement concaténer trois fichiers.
3. Premier parcours complet : accueil → Agenda → création/modification d’activité → retour. Conserver contrats DOM, données et navigation. Comparer aux captures ; ne retirer les règles historiques migrées qu’après validation.
4. Étendre Tâches/Focus, puis Sport, puis Notes/Documents/Coffre. Vérifier simultanément React et secours (`window.__noIslands`), formulaires et clavier iPhone, fenêtres ouvertes, noms longs et contenu dense.
5. Avant livraison : construction TypeScript/Vite, tests rapides (shell, fusion, crypto, mémoire, rappels), smoke existant ; ajouter seulement les vérifications manquantes qui protègent des risques réels : calcul de visibilité hidden, absence de débordement 390/1440, tailles minimales de champs, focus clavier, mouvement réduit, FR/EN/NL et mise à jour PWA. Conserver les captures avant, générer après avec les mêmes fixtures.

Risques principaux : cascade/specificité, divergence React/secours, styles inline, régression clavier iPhone et cache PWA. La suppression de polices et d’anciennes options se fera après validation du choix graphique et de leur absence d’usage.

## Annexes mesurées

### Fichiers de police individuels

| Fichier | Octets |
|---|---:|
| site/fonts/Archivo-latin-2a392e.woff2 | 34940 |
| site/fonts/Archivo-latin-ext-20bddc.woff2 | 32672 |
| site/fonts/BarlowCondensed-latin-054cc2.woff2 | 14764 |
| site/fonts/BarlowCondensed-latin-07c3c7.woff2 | 14844 |
| site/fonts/BarlowCondensed-latin-eb4f37.woff2 | 14888 |
| site/fonts/BarlowCondensed-latin-ext-60204d.woff2 | 9228 |
| site/fonts/BarlowCondensed-latin-ext-ced6a5.woff2 | 9236 |
| site/fonts/BarlowCondensed-latin-ext-e05ece.woff2 | 9328 |
| site/fonts/Fraunces-latin-1.woff2 | 81520 |
| site/fonts/Fraunces-latin-3.woff2 | 67304 |
| site/fonts/Fraunces-latin-ext-0.woff2 | 71460 |
| site/fonts/Fraunces-latin-ext-2.woff2 | 59388 |
| site/fonts/IBMPlexMono-latin-5.woff2 | 14708 |
| site/fonts/IBMPlexMono-latin-7.woff2 | 14888 |
| site/fonts/IBMPlexMono-latin-ext-4.woff2 | 13348 |
| site/fonts/IBMPlexMono-latin-ext-6.woff2 | 13432 |
| site/fonts/InstrumentSans-latin-e190a6.woff2 | 29904 |
| site/fonts/InstrumentSans-latin-ext-416253.woff2 | 11092 |
| site/fonts/InstrumentSerif-latin-99cc6e.woff2 | 15684 |
| site/fonts/InstrumentSerif-latin-a20ac7.woff2 | 15040 |
| site/fonts/InstrumentSerif-latin-ext-4bed00.woff2 | 8444 |
| site/fonts/InstrumentSerif-latin-ext-fa1a1a.woff2 | 7828 |
| site/fonts/InterTight-latin-9.woff2 | 44872 |
| site/fonts/InterTight-latin-ext-8.woff2 | 89800 |
| site/fonts/JetBrainsMono-latin-1cd702.woff2 | 31340 |
| site/fonts/JetBrainsMono-latin-ext-76306e.woff2 | 11596 |
| site/fonts/Manrope-latin-ext-2ee76f.woff2 | 15212 |
| site/fonts/Manrope-latin-f00ccc.woff2 | 24436 |
| site/fonts/Newsreader-latin-7ab0b8.woff2 | 63212 |
| site/fonts/Newsreader-latin-ext-7a09be.woff2 | 86628 |
| site/fonts/Newsreader-latin-ext-7abfa5.woff2 | 38612 |
| site/fonts/Newsreader-latin-f0c28d.woff2 | 131848 |
| site/fonts/PublicSans-latin-ext-da9f89.woff2 | 18372 |
| site/fonts/PublicSans-latin-f63147.woff2 | 26636 |

### Couleurs littérales

Comptage lexical dans les quatre CSS, commentaires retirés ; graphies conservées, couleurs hex/rgb/hsl uniquement (noms et color-mix restent dans le JSON des déclarations).

| Couleur | Occurrences |
|---|---:|
| `#fff` | 25 |
| `#111214` | 14 |
| `#0E0F11` | 14 |
| `#1C1A17` | 12 |
| `#FFFFFF` | 10 |
| `#ffffff` | 7 |
| `#F4F0E8` | 7 |
| `#ECEDEE` | 6 |
| `#86AE95` | 6 |
| `#15110F` | 6 |
| `#14120D` | 6 |
| `#0F1015` | 6 |
| `#0E1311` | 6 |
| `#12130C` | 6 |
| `#0D1215` | 6 |
| `#121212` | 6 |
| `#0F1115` | 6 |
| `#12100B` | 6 |
| `#2e7d32` | 5 |
| `#2F4A3A` | 5 |
| `#6FBF98` | 4 |
| `#D9AE62` | 4 |
| `#C9B48A` | 4 |
| `#171511` | 4 |
| `#111A2C` | 4 |
| `#0E1914` | 4 |
| `#1C0F14` | 4 |
| `#17181A` | 4 |
| `rgba(0,0,0,.25)` | 4 |
| `rgba(0,0,0,.18)` | 4 |
| `#000` | 4 |
| `#8FB3EA` | 4 |
| `#86C6A4` | 4 |
| `#E0A3B4` | 4 |
| `#C9CCD3` | 4 |
| `#1A1B1E` | 4 |
| `#8B8E94` | 4 |
| `#D2775F` | 4 |
| `#C2703D` | 4 |
| `#3F78AE` | 4 |
| `#1E1815` | 4 |
| `#1D1A13` | 4 |
| `#171822` | 4 |
| `#151C18` | 4 |
| `#1A1C12` | 4 |
| `#141B1F` | 4 |
| `#1B1B1A` | 4 |
| `#171A20` | 4 |
| `#1B1810` | 4 |
| `#2F7D5B` | 3 |
| `#ECEDEF` | 3 |
| `rgba(0,0,0,.08)` | 3 |
| `rgba(0,0,0,.12)` | 3 |
| `#9C3B26` | 3 |
| `#C0392B` | 3 |
| `#3F6FB5` | 2 |
| `#16171A` | 2 |
| `#878A93` | 2 |
| `#25272C` | 2 |
| `#1D1F23` | 2 |
| `#D9925F` | 2 |
| `#7EA6E0` | 2 |
| `#A99BE0` | 2 |
| `#A3A7B2` | 2 |
| `#6FC3D6` | 2 |
| `#D98AAE` | 2 |
| `#D9B862` | 2 |
| `#9AA2E8` | 2 |
| `#8CC57E` | 2 |
| `#E08A9A` | 2 |
| `#E37A72` | 2 |
| `rgba(22,23,26,.92)` | 2 |
| `#24211B` | 2 |
| `#D9C79E` | 2 |
| `#0E0D0B` | 2 |
| `#1F1C17` | 2 |
| `#2A261F` | 2 |
| `#0A0F1C` | 2 |
| `#172238` | 2 |
| `#22304B` | 2 |
| `#07100C` | 2 |
| `#14231C` | 2 |
| `#1E3329` | 2 |
| `#12090C` | 2 |
| `#25141B` | 2 |
| `#372029` | 2 |
| `#0E0F10` | 2 |
| `#1E1F22` | 2 |
| `#2A2B2F` | 2 |
| `rgba(0,0,0,.6)` | 2 |
| `#3987e5` | 2 |
| `#d95926` | 2 |
| `#199e70` | 2 |
| `#8FB0E0` | 2 |
| `#D9A066` | 2 |
| `#7FC2A0` | 2 |
| `#1A2130` | 2 |
| `#A9C3EE` | 2 |
| `#18241F` | 2 |
| `#A3D6BA` | 2 |
| `#2A1A1F` | 2 |
| `#EBBBC8` | 2 |
| `#202226` | 2 |
| `#D9DBE0` | 2 |
| `#c2410c` | 2 |
| `#dc2626` | 2 |
| `#ea580c` | 2 |
| `#16a34a` | 2 |
| `#2563eb` | 2 |
| `#7c3aed` | 2 |
| `#f87171` | 2 |
| `#60a5fa` | 2 |
| `#a78bfa` | 2 |
| `#EBE6DC` | 2 |
| `#26282C` | 2 |
| `rgba(47,74,58,.45)` | 2 |
| `rgba(255,255,240,.92)` | 2 |
| `#D77A5E` | 2 |
| `#CDA55E` | 2 |
| `#9A97E0` | 2 |
| `#BFC36E` | 2 |
| `#74AEC2` | 2 |
| `#E8DFCC` | 2 |
| `#93A8C6` | 2 |
| `#CFAE5B` | 2 |
| `#F4F4F2` | 1 |
| `#6B6E76` | 1 |
| `#E4E4E1` | 1 |
| `#EEEEEB` | 1 |
| `#B5652F` | 1 |
| `#6B5BB0` | 1 |
| `#7A7F8C` | 1 |
| `#2A7F95` | 1 |
| `#A84A72` | 1 |
| `#9A7A2C` | 1 |
| `#5560B0` | 1 |
| `#4B8240` | 1 |
| `#A33D52` | 1 |
| `#A86A1C` | 1 |
| `#B9443D` | 1 |
| `rgba(255,255,255,.92)` | 1 |
| `#EFEADF` | 1 |
| `#6E5A2E` | 1 |
| `#80632F` | 1 |
| `#F5F3EE` | 1 |
| `#EEEAE1` | 1 |
| `#E5DFD3` | 1 |
| `#F1F4F9` | 1 |
| `#E7ECF4` | 1 |
| `#D9E1EC` | 1 |
| `#F0F5F2` | 1 |
| `#E4EEE8` | 1 |
| `#D5E3DA` | 1 |
| `#F8F2F3` | 1 |
| `#F0E5E8` | 1 |
| `#E7D6DB` | 1 |
| `#F4F4F5` | 1 |
| `#EBEBED` | 1 |
| `#DEDEE1` | 1 |
| `rgba(31,95,191,.25)` | 1 |
| `rgba(0,0,0,.45)` | 1 |
| `rgba(0,0,0,.15)` | 1 |
| `rgba(0,0,0,.2)` | 1 |
| `rgba(0,0,0,.06)` | 1 |
| `#2a78d6` | 1 |
| `#eb6834` | 1 |
| `#1baf7a` | 1 |
| `#0ca30c` | 1 |
| `#fab219` | 1 |
| `#d03b3b` | 1 |
| `rgba(8,8,10,.55)` | 1 |
| `#B5732F` | 1 |
| `rgba(0,0,0,.4)` | 1 |
| `#2F5DA8` | 1 |
| `#E6ECF6` | 1 |
| `#2B4C85` | 1 |
| `#2F7A5B` | 1 |
| `#E3EFE8` | 1 |
| `#245F47` | 1 |
| `#9B3550` | 1 |
| `#F3E4E8` | 1 |
| `#7C2A41` | 1 |
| `#55585F` | 1 |
| `#E9E9E7` | 1 |
| `#3E4046` | 1 |
| `rgba(0,0,0,.5)` | 1 |
| `rgba(5,5,7,.92)` | 1 |
| `#3A3D44` | 1 |
| `#e8c547` | 1 |
| `#d64545` | 1 |
| `rgba(0,0,0,.22)` | 1 |
| `#fde68a` | 1 |
| `#bbf7d0` | 1 |
| `#bfdbfe` | 1 |
| `#fbcfe8` | 1 |
| `#111` | 1 |
| `#8A8378` | 1 |
| `#665F55` | 1 |
| `#D6CFC2` | 1 |
| `#8A5A12` | 1 |
| `#F4D35E` | 1 |
| `#E0B93A` | 1 |
| `#999` | 1 |
| `rgba(255,214,0,.42)` | 1 |
| `rgba(255,214,0,.5)` | 1 |
| `#4F8A5C` | 1 |
| `#8B62AA` | 1 |
| `#3E8A86` | 1 |
| `#A0844A` | 1 |
| `#7A5A1C` | 1 |
| `#4A469E` | 1 |
| `#545A1C` | 1 |
| `#1F5F75` | 1 |
| `#34507A` | 1 |
| `#6E5416` | 1 |
| `#C2410C` | 1 |
| `#C46A5E` | 1 |

### Sélecteurs répétés entre couches

Répétition textuelle exacte, sans calcul de spécificité ni preuve que la propriété est la même.

9 sélecteurs présents dans plusieurs fichiers ; liste et références complètes dans le JSON.

### PNG et emojis

- `site/apple-touch-icon.png` : 7246 octets
- `site/icon-192.png` : 7764 octets
- `site/icon-512.png` : 21614 octets
- `site/logo-180.png` : 7246 octets
- `site/logo-192.png` : 12070 octets
- `site/logo-32.png` : 1659 octets
- `site/logo-512.png` : 34705 octets
- `site/maskable-512.png` : 21614 octets

Occurrences de caractères pictographiques (plages U+1F300–U+1FAFF, U+2600–U+27BF ; approximation, séquences non fusionnées) :

| Fichier | Nombre | Symboles uniques |
|---|---:|---|
| site/index.html:1 | 1 | ☰ |
| app/src/shell/08-a-faire.js:1 | 3 | ✓ |
| app/src/shell/24-objectif-visible-series-conseillees.js:1 | 3 | ⚠✓ |
| app/src/shell/39-nutrition.js:1 | 4 | ✎✓🍽 |
| app/src/shell/22-musculation.js:1 | 1 | ✓ |
| app/src/shell/38-dictee-vocale.js:1 | 1 | 🎤 |
| app/src/shell/32-brancher-claude-en-quelques.js:1 | 2 | ✓ |
| app/src/shell/40-vues-semaine-mois-annee.js:1 | 6 | ✍✓🍽 |
| app/src/shell/41-graphiques-bilans.js:1 | 3 | ✓ |
| app/src/NuMenu.tsx:1 | 1 | ✓ |
| app/src/AiWizard.tsx:1 | 1 | ✓ |
| app/src/Nutrition.tsx:1 | 1 | ✎ |
| app/src/Muscu.tsx:1 | 1 | ✓ |
| app/src/Charts.tsx:1 | 1 | ✓ |
| app/src/NuExtra.tsx:1 | 1 | ✓ |
| app/src/Forms.tsx:1 | 2 | ✓ |
| app/src/Misc.tsx:1 | 1 | ✓ |
| app/src/Todos.tsx:1 | 2 | ✓ |
| app/src/Reviews.tsx:1 | 1 | ✓ |

### Limites des captures

La navigation fixe apparaît à sa position du viewport initial sur les images pleine page et peut recouvrir une ligne au milieu de la planche : ce n’est pas une preuve de chevauchement pendant le défilement réel. Les pages Documents montrent le verrouillage initial, les mots de passe montrent la création du code et le coffre ouvert avec un identifiant fictif. Aucun PDF réel ni compte personnel utilisé.

### Symboles SVG

32 entrées de dictionnaire candidates dans ICS (comptage lexical des clés de ligne de `app/src/shell/01-icones-au-trait.js`, à distinguer du nombre de symboles rendus). Logos locaux :

- `site/icons/agenda-128.png` : 6991 octets
- `site/icons/agenda.svg` : 4718 octets
- `site/icons/fit-128.png` : 7896 octets
- `site/icons/fit.svg` : 4690 octets
- `site/icons/home-128.png` : 7947 octets
- `site/icons/home.svg` : 4622 octets
- `site/icons/note-128.png` : 6692 octets
- `site/icons/note.svg` : 4684 octets

## Résultat de vérification sur la référence

Les cinq suites rapides passent, mais le smoke général est rouge sur des scénarios historiques coffre/Face ID et PDF (dont refus CSP `unsafe-eval`). Détail et sortie exacte dans [validation-technique.md](validation-technique.md). Cela renforce le besoin d’isoler les régressions de rendu des défauts déjà observables sur cette référence ; aucun changement de sécurité recommandé sans diagnostic séparé. Les 84 captures demandées sont complètes et ne déclenchent pas de `pageerror`.

## T11 — inventaire du renommage (5 novembre 2026)

**Décision de Sid :** Sid Journée = Agenda/Tâches/Focus ; Sid Forme = Musculation/Nutrition/Graphiques ; Sid Coffre = Notes/Documents/Mots de passe. Suite : **Sid'compagnon**. Connecteur : **Sid'note**, fonction `mcp` intouchée. Inventaire local uniquement, aucune source, donnée ni fonction serveur modifiée.

### Mesure et périmètre

Instantané avant cet ajout : **1475 occurrences dans 121 fichiers**, sur **180 fichiers texte** lus. Recherche insensible à la casse de Sid + agenda/fit/note/home/compagnon/journée/journee/forme/coffre, avec apostrophe droite/courbe, apostrophe JS échappée, espace/tiret et entité HTML. Les préfixes techniques SIDFIT/SIDNOTE sont inclus ; ce nombre n’est donc **pas un nombre de libellés à remplacer**. L’index ci-dessous donne chaque occurrence sous la forme ligne:colonne (caractères Unicode, base 1), même sur une ligne minifiée.

Sont inclus : sources, générés, tests, dictionnaires, configuration, `.claude/agents`, documentation et maquettes existantes. Sont exclus : `secrets/`, `.git`, `node_modules`, sorties `tests/out`, captures `avant` et `shots` (pas de reconnaissance de texte dans les PNG), fichiers binaires/polices. L’ancien contenu de cet audit fait partie de l’instantané ; cette nouvelle section n’est pas rescannée récursivement. Les archives/maquettes conservent leur contexte historique. Aucun examen de service distant ni de réglages Supabase.

### Matrice de décision

| Zone et références | Peut changer lors de la réalisation | À préserver |
|---|---|---|
| `app/src/shell/07-onglets-ranges-par-categories.js:6–9` GROUPS | `label` des trois apps → noms décidés ; en-tête, accueil, barre latérale suivent ces libellés | `k=orga/sport/perso/more`, `app=agenda/fit/note/home`, `tabs=plan/todo/pomo/muscu/nutri/graph/notes/docs/pwd/more/app` |
| `app/src/shell/06-animation-d-ouverture-de.js:23` INTRO_NAME | textes d’intro/sortie | clés agenda/fit/note et OUT_K, contrats DOM/attributs |
| `app/src/shell/32-brancher-claude-en-quelques.js:70–71`, `site/index.html:635–641` | CONV_NAME/CONV_TITLE et libellés de conversation d’app | clés `agenda`, `nutri`, `muscu`, `note`, `data-conv`, `data.prefs.aiConv`, liens de conversations existants |
| `site/index.html:7,15,26,37,905` ; `site/manifest.webmanifest:4` | descriptions SEO/OG/JSON-LD/noscript et présentation des trois apps | titre/name/short_name/apple-title de la suite Sid'compagnon ; domaine, start_url/scope et identité de la PWA |
| `app/src/Shell.tsx:20–40`, `Home.tsx`, `Onboarding.tsx` et secours shell/07,43 | noms fournis par données, rôles et présentations dans **les deux rendus** | props, noms de composants/fichiers, classes et identifiants DOM ; pas besoin de renommer `Notes`, `Muscu`, etc. |
| `site/i18n.js:3–416` ; shell/04,32 | clés FR et valeurs EN/NL des messages d’app ; marques décidées identiques dans les trois langues, rôles traduits | expressions qui désignent le connecteur Sid'note ; dictionnaires et motifs des données utilisateur ; aucune traduction des clés techniques |
| `app/src/Misc.tsx:39`, shell/42:5, shell/12:19, Nutrition.tsx:65, shell/39 | vieux messages où Sid'note signifie toute la suite → Sid'compagnon ; badge mémoire Nutrition → libellé de Sid Forme ou « Mémoire des aliments » | marqueur JSON de sauvegarde `app:"sidnote"`, schéma v2 et compatibilité restauration ; ne pas confondre nom du fichier exporté et format |
| `site/sw.js:41` | titre de notification par défaut « sid'note » → Sid'compagnon | préfixes `CACHE=sidnote-v…`, `LIB=sidnote-lib-2` ; incrément de version seulement au lot livré, avec BUILD/APP_V |
| `tests/smoke.js`, `tests/captures-refonte.js` | attentes de textes et commentaires de l’interface ; nouveaux tests de distinction suite/apps/connecteur | attentes des clés, données, URL et contrats inchangés ; anciennes captures/fixtures de compatibilité restent historiques |
| `CLAUDE.md:1–4`, rubrique architecture/état, `.claude/agents/*.md`, `README.md` | mémoire opérationnelle et descriptions de domaine à actualiser | historique daté, versions, adresses et consignes « connecteur Sid'note » ; ne pas réécrire les anciens faits |
| `supabase/functions/mcp/index.ts` **entier** | **rien dans ce lot**, y compris ses textes d’outils devenus historiquement ambigus | serverInfo name `sidnote`, title `Sid'note` (:911), instructions (:912), outils/schémas, endpoint, icônes et URL |
| autres fonctions/SQL Supabase | titres purement visibles repérés, à aligner seulement dans un lot serveur explicitement autorisé | noms de fonctions, RPC, cron, secrets Vault, VAPID/UA/URL ; commentaires SQL historiques ne justifient aucun déploiement |

**Cas à ne surtout pas remplacer globalement :** le nom affiché « Sid'note » peut désigner soit l’ancienne app de notes, soit la suite historique, soit le connecteur actuel. Le contexte décide respectivement **Sid Coffre**, **Sid'compagnon**, ou **Sid'note inchangé**. Même la documentation contient les trois sens.

### Connecteur et données : périmètre figé

- `shell/32:6,9,12–13,29,42–43,57` et `app/src/AiWizard.tsx:12,23–24` : conserver `connectorName=Sid'note`, instructions « Nom : Sid'note », consentement/attente, messages à envoyer au connecteur. Le CTA peut expliciter « Brancher le connecteur Sid'note » tout en gardant la suite Sid'compagnon ; ne pas remplacer l’identité proposée à Claude. `site/index.html:654` et leurs traductions suivent la même exception.
- Conserver tous les espaces de noms `sidnote-*` : localStorage/sessionStorage (session, alive, u-UID, lang, look, ical, documents, coffres…), IndexedDB `sidnote-docs`, caches, identifiants de sauvegarde et import/export. Le HKDF `info="sidnote-bio"` (`app/src/core/crypto.ts:53`, `shell/33:14`) est **une entrée cryptographique**, pas un libellé.
- Conserver les structures `data.notes/docs/pwds/nutri/muscu`, `data.ui.glast/view`, groupes/onglets, clés de préférences, noms de stockage serveur et outils MCP. Préserver les domaines `sidcompagnon.com` et historiques `sidnote.netlify.app`, les identifiants de compte pseudo et les routes `/mcp/*`.
- Conserver `window.SIDFIT_EXERCICES`, `SIDFIT_AIDE`, `SIDFIT_IMG` et leurs lecteurs (`site/exercices.js:15`, exercices-aide.js:4,1140 ; shell/22:146–150,23:13–15). Ce sont des API de données.
- `supabase/functions/rappels/index.ts:151` contient un titre de test visible « Sid'note » (futur alignement suite), :15 l’URL VAPID historique, :131 la RPC `sidnote_cron_secret` (contrats conservés). `horaire/index.ts:37` contient un User-Agent technique, conservé. SQL : `sidnote_daily_backup`, `sidnote_cron`, `sidnote_cron_secret`, jobs `sidnote-backup/notifications/rappels` ne changent pas. **Aucun accès ni changement Supabase pour T11.**

### Icônes, manifest et chemins publics

Les nouvelles illustrations peuvent remplacer les **contenus** des quatre SVG et des quatre PNG 128 px de `site/icons/`, en gardant `home/agenda/fit/note` dans les chemins : le connecteur les lit (`mcp/index.ts:459–461`). Même principe pour favicon/PNG PWA listés ci-dessous ; conserver leurs URL évite de modifier mcp. Ni le nom de fichier `note.svg` ni `app=note` n’impliquent la marque publique Sid'note.

Références : `shell/05-utilitaires.js:48–49` LOGO, `app/src/Small.tsx` Logo, `site/index.html:17,21–25`, manifest:10–16, `site/sw.js` ; les SVG actuels sont des chemins sans nom de marque textuel détecté. Les PNG ne sont pas inspectés par cette recherche.

- `site/icons/home.svg`
- `site/icons/agenda.svg`
- `site/icons/fit.svg`
- `site/icons/note.svg`
- `site/icons/home-128.png`
- `site/icons/agenda-128.png`
- `site/icons/fit-128.png`
- `site/icons/note-128.png`
- `site/apple-touch-icon.png`
- `site/favicon.ico`
- `site/favicon.svg`
- `site/icon-192.png`
- `site/icon-512.png`
- `site/logo-180.png`
- `site/logo-192.png`
- `site/logo-32.png`
- `site/logo-512.png`
- `site/maskable-512.png`
- `assets/logo-sidnote.png`

`assets/logo-sidnote.png` est une ressource historique : son nom peut rester ; vérifier ses consommateurs avant de la supprimer. `site/manifest.webmanifest:2–3` reste Sid'compagnon, seule la description énumérant les apps change ; couleurs et iconographie F seront traitées au lot graphique.

### FR / EN / NL : messages à trier par sens

Extraction des objets DICT et DICT_NL : **86 entrées avec marque dans chacun**, dont des alias historiques ; ceci ne prouve pas que toutes sont encore rendues. Les références exactes des occurrences sont dans l’index complet. Les messages `T3` du shell/32 portent aussi trois langues hors DICT. Liste des clés FR présentes dans les deux dictionnaires (86) ; chacune implique la clé FR et ses deux traductions, à conserver/renommer selon le contexte ci-dessus :

- Entre le mot de passe de ton compte Sid'compagnon : il protège tes coffres. Sur un nouvel appareil, il suffira pour les rouvrir.
- Entre le mot de passe de ton compte Sid'compagnon pour ouvrir tes coffres sur cet appareil.
- sid'agenda — discussion avec Claude
- sid'note — discussion avec Claude
- sid'fit — Nutrition
- sid'fit — Musculation
- sid'agenda
- sid'note
- Notifications bloquées. Autorise-les dans les réglages de ton smartphone (Notifications > Sid'compagnon).
- sur Sid'compagnon avec le code
- Comment installer Sid'compagnon sur ton smartphone ?
- Installe Sid'compagnon sur ton smartphone pour l'ouvrir comme une vraie app, en plein écran.
- Tu peux en choisir plusieurs. Une activité sans heure compte pour 8 h. Sur smartphone, ouvre Sid'compagnon depuis l'écran d'accueil (iOS 16.4 ou plus).
- Quelques questions (niveau, objectif, jours, matériel) et Sid'compagnon crée tes séances.
- Conversations sid'fit
- Texte non reconnu. Colle une séance ou un programme partagé depuis Sid'compagnon.
- Colle ici une séance ou un programme partagé depuis Sid'compagnon, ou écrit par Claude.
- Sid'fit : conversations Claude
- Pour garder ton historique Claude propre, toutes les demandes Nutrition passent par une seule conversation, et toutes les demandes Musculation par une autre. Sid'compagnon copie le message puis ouvre la conversation : tu n'as plus qu'à coller.
- Créé par Sid'compagnon
- Ton poids, tes repas, ton profil (âge, taille, sport), tes séances et les zones à ménager sont des données de santé. Sid'compagnon ne les utilise qu'avec ton accord explicite, que tu peux retirer à tout moment dans Réglages. Sid'compagnon ne les envoie à aucune IA de lui-même : si tu branches Claude, c'est ton propre compte Claude (Anthropic) qui les lit par le connecteur, quand tu le lui demandes, selon les conditions d'Anthropic. La photo d'assiette que tu envoies à Claude est déposée dans ton dossier privé, lue une seule fois par ton Claude, puis effacée (au plus tard après 24 h). Les aliments sont retenus dans une mémoire commune anonyme (jamais ton nom).
- Sid'compagnon a besoin de JavaScript pour fonctionner. Sid'compagnon réunit sid'agenda (agenda, tâches), sid'fit (musculation, nutrition) et sid'note (notes, documents, mots de passe).
- Pour la nutrition, les graphiques et ton programme de musculation, Sid'compagnon utilise ton âge, ton poids, ta taille, ton sport, ce que tu manges, tes séances et les zones à ménager. Ce sont des données de santé.
- Sid'compagnon est édité par SidCorp, qui est responsable du traitement de tes données. Les coordonnées complètes figurent dans la version complète de cette politique. Pas de publicité : aucune donnée n'est vendue ni utilisée à des fins commerciales.
- Ton poids, tes repas, ton profil (âge, taille, sport), tes séances et les zones à ménager sont des données de santé. Sid'compagnon ne les utilise qu'avec ton accord explicite, que tu peux retirer à tout moment dans Réglages. Sid'compagnon ne les envoie à aucune IA de lui-même : si tu branches Claude, c'est ton propre compte Claude (Anthropic) qui les lit par le connecteur, quand tu le lui demandes, selon les conditions d'Anthropic. Les aliments sont retenus dans une mémoire commune anonyme (jamais ton nom).
- Sid'compagnon est gratuit, sans achat ni abonnement, et fourni tel quel. Il peut évoluer, être interrompu ou s'arrêter ; tu seras prévenu à l'avance si possible.
- Sid'compagnon ne dépose aucun cookie : ni publicité, ni mesure d'audience, ni pisteur.
- Comme rien de non nécessaire n'est chargé sans ton action, Sid'compagnon n'affiche pas de bandeau de cookies.
- 5 questions, puis tes précisions si tu veux. Claude compose ton programme et le dépose ici ; sans Claude, Sid'compagnon le crée tout de suite.
- Aucun dossier pour l'instant. Crée-en un dans sid'note pour ranger tes notes.
- Retour à Sid'compagnon
- Bienvenue sur Sid'compagnon
- Sid'compagnon
- Trois applications, un seul compte : sid'agenda pour tes journées, sid'fit pour ton corps, sid'note pour tes notes et tes documents.
- Claude calcule tes repas, crée tes menus et note tes tâches directement dans Sid'compagnon.
- En attente de Claude… (accepte l'accès à Sid'note s'il te le demande)
- Claude est branché sur Sid'note
- Relie Sid'compagnon à Claude : il calcule tes repas, crée tes menus et tes programmes, lit ton agenda et ajoute tâches et notes, puis tout arrive ici. Il ne voit jamais tes mots de passe, tes documents ni tes notes secrètes.
- Quelques questions (niveau, objectif, jours, matériel) et Sid'compagnon crée tes séances, avec les charges qui progressent d'une fois à l'autre.
- Touche le bouton : Claude s'ouvre avec Sid'note déjà rempli. Là-bas, touche simplement « Ajouter », puis reviens ici.
- Ajouter Sid'compagnon à
- Claude ou ChatGPT calcule tes repas, crée tes menus et note tes tâches directement dans Sid'compagnon.
- En attente de ton IA… (accepte l'accès à Sid'note si elle te le demande)
- Pour que tes repas arrivent tout seuls dans Sid'note, envoie-lui une fois ce message :
- Relie Sid'note à ton IA (Claude, ChatGPT ou Le Chat) : elle calcule tes repas, crée tes menus, lit ton agenda et ajoute tâches, notes ou courses, puis tout arrive ici. Elle ne voit jamais tes mots de passe, tes documents ni tes notes secrètes.
- Sid'note n'utilise plus d'IA payante : c'est ton IA qui calcule, puis elle écrit le résultat directement ici.
- Ton IA calcule tes repas, crée tes menus et lit ton agenda, puis écrit tout dans Sid'note. Quelle IA utilises-tu ?
- Ton IA est branchée sur Sid'note
- Ton adresse Sid'note
- Relie Sid'compagnon à Claude : tu pourras lui demander ton agenda et tes cours, ajouter des tâches, des notes ou des courses en lui parlant. Claude ne voit jamais tes mots de passe, tes documents ni tes notes secrètes.
- Nom : Sid'note. URL : colle l'adresse. Authentification : « Aucune connexion ».
- sur Sid'note avec le code
- Ton compte a été supprimé. Merci d'avoir utilisé Sid'compagnon.
- Sid'compagnon est une application éditée par SidCorp et partagée avec des proches. SidCorp est responsable de tes données. Pas de publicité, aucune donnée n'est vendue ni partagée à des fins commerciales.
- Pour toute question, contacte SidCorp (Sid), la personne qui t'a invité sur Sid'note.
- Sid'compagnon est gratuit et fourni tel quel, sans garantie. Il peut évoluer, être interrompu ou s'arrêter ; tu seras prévenu à l'avance si possible.
- Sauvegarde Sid'note
- Mes données Sid'compagnon
- Entre le mot de passe de ton compte Sid'compagnon pour retrouver ta phrase secrète.
- Entre le mot de passe de ton compte Sid'compagnon : si tu oublies ta phrase secrète un jour, ce mot de passe suffira pour la retrouver.
- Bienvenue sur Sid'note
- Bienvenue sur Sid'note !
- Ce fichier n'est pas une sauvegarde Sid'note
- La page d'accueil est celle qui s'ouvre quand tu lances Sid'note.
- Les étapes pour installer Sid'compagnon sur ton écran d'accueil.
- Notifications bloquées. Autorise-les dans Réglages > Notifications > Sid'note.
- Pour activer les notifications, ouvre Sid'compagnon depuis l'icône de ton écran d'accueil.
- Sid'compagnon · une app
- Sid'note · version 31 · une app
- Texte non reconnu. Colle une séance copiée depuis Sid'note.
- Tu utilises déjà Sid'note comme application.
- Voici ce que Sid'note sait faire. Garde seulement ce qui te sert : tu pourras tout réafficher plus tard dans Réglages.
- Tout ce que tu as mis dans Sid'compagnon sera effacé, sur tous tes appareils. C'est définitif. Continuer ?
- Planning, tâches, notes, séances, nutrition et réglages sont enregistrés dans ton compte, sur les serveurs de Supabase, en Europe (Francfort, Allemagne). Les autres utilisateurs ne peuvent pas les voir. L'administrateur de Sid'compagnon (SidCorp) peut techniquement y accéder pour l'entretien, mais ne les consulte pas.
- Envoyées une seule fois pour être analysées : elles passent par le serveur Sid'compagnon puis par le service d'IA d'Anthropic, qui calcule les calories. Elles ne sont pas enregistrées dans ton compte, ne servent pas à entraîner l'IA et ne sont gardées que peu de temps par Anthropic (sécurité) avant d'être effacées. Seule une petite vignette reste sur ton téléphone.
- Mémoire Sid'note
- Mot de passe de ton compte Sid'compagnon
- Entre le mot de passe de ton compte Sid'compagnon : si tu oublies ce code un jour, il te suffira de ce mot de passe pour le retrouver.
- Entre le mot de passe de ton compte Sid'compagnon pour retrouver ton code.
- Couleur de Sid'note
- Chacun sa vie, chacun sa personnalité : à chacun son Sid'note.
- Chaque partie de Sid'note a sa couleur : tu sais toujours où tu es, d'un coup d'œil.
- Active les notifications : Sid'compagnon te prévient avant tes rendez-vous, tes cours et tes échéances. Tu choisis quand, dans Agenda ou Réglages.
- Pour recevoir des rappels avant tes rendez-vous et tes cours, installe d'abord Sid'compagnon sur ton écran d'accueil, puis ouvre-le depuis son icône.
- Ton code Sid'compagnon
- Tout Sid'note

Ne pas faire un simple remplacement dans la clé FR : aligner l’appel source, la clé DICT, sa valeur EN et son entrée NL ; conserver les anciens alias encore utilisés. Les noms de marque décidés restent « Sid Journée », « Sid Forme », « Sid Coffre » jusqu’à une décision explicite de marques localisées.

### Index complet des occurrences de l’instantané

Une ligne ci-dessous = un fichier ; chaque couple ligne:colonne = une occurrence. Les termes et leurs fréquences distinguent marques et préfixes sans recopier de ligne contenant des données de configuration. `G` = généré, reconstruire ; `M` = mcp figé ; `S` = serveur/SQL à préserver dans ce lot ; `H` = document/maquette/historique ; `T` = tests ; `I` = i18n mixte ; `A` = application/configuration mixte, suivre la matrice. **Aucune catégorie n’autorise un remplacement en masse.**

| Fichier | Zone | Termes × occurrences | Positions ligne:colonne |
|---|---|---|---|
| `.claude/agents/agenda.md` | H | `sid'agenda` ×1 ; `sid'fit` ×1 ; `Sid'compagnon` ×1 | 3:22, 11:18, 13:18 |
| `.claude/agents/architecte.md` | H | `Sid'compagnon` ×1 | 13:18 |
| `.claude/agents/connecteur-claude.md` | H | `Sid'compagnon` ×1 | 13:18 |
| `.claude/agents/deploiement.md` | H | `Sid'compagnon` ×1 | 13:18 |
| `.claude/agents/design-system.md` | H | `Sid'compagnon` ×1 | 13:18 |
| `.claude/agents/frontend.md` | H | `Sid'compagnon` ×1 | 13:18 |
| `.claude/agents/migration.md` | H | `Sid'compagnon` ×1 | 13:18 |
| `.claude/agents/musculation.md` | H | `sid'fit` ×1 ; `Sid'compagnon` ×1 | 3:37, 13:18 |
| `.claude/agents/notes-documents.md` | H | `sid'note` ×1 ; `Sid'compagnon` ×1 | 3:22, 13:18 |
| `.claude/agents/nutrition.md` | H | `sid'fit` ×1 ; `Sid'compagnon` ×1 | 3:35, 13:18 |
| `.claude/agents/qa-tests.md` | H | `Sid'compagnon` ×1 | 13:18 |
| `.claude/agents/redaction.md` | H | `Sid'compagnon` ×1 | 13:18 |
| `.claude/agents/revue-code.md` | H | `Sid'compagnon` ×1 | 13:18 |
| `.claude/agents/securite.md` | H | `Sid'compagnon` ×1 | 13:18 |
| `.claude/agents/seo.md` | H | `Sid'compagnon` ×2 | 8:33, 13:18 |
| `.claude/agents/supabase.md` | H | `Sid'compagnon` ×1 | 13:18 |
| `.claude/agents/tickets.md` | H | `Sid'compagnon` ×1 | 13:18 |
| `.claude/agents/traductions.md` | H | `Sid'compagnon` ×1 | 13:18 |
| `.claude/agents/ux-mobile.md` | H | `Sid'compagnon` ×1 | 13:18 |
| `CLAUDE.md` | H | `Sid'note` ×14 ; `Sid'compagnon` ×8 ; `Sid'home` ×19 ; `sidcompagnon` ×17 ; `sidnote` ×43 ; `sid'fit` ×6 ; `sid'agenda` ×6 ; `sid'note` ×4 ; `SIDFIT` ×3 ; `Sid'fit` ×3 ; `sidhome` ×1 ; `Sid'agenda` ×1 | 1:3, 3:1, 4:125, 4:164, 4:203, 4:238, 20:46, 24:64, 49:485, 49:508, 50:72, 53:54, 59:28, 60:99, 70:88, 75:51, 89:219, 100:318, 118:108, 118:513, 142:297, 148:60, 154:108, 155:141, 155:361, 173:65, 173:97, 177:258, 177:322, 183:160, 187:61, 187:180, 210:8, 212:35, 212:76, 212:117, 212:155, 212:228, 212:402, 220:21, 220:63, 220:118, 228:17, 228:85, 228:110, 229:8, 231:57, 232:691, 233:62, 237:54, 238:78, 238:99, 238:120, 239:256, 242:10, 244:10, 248:439, 249:124, 257:18, 258:25, 259:50, 260:83, 263:375, 265:50, 265:146, 265:227, 265:331, 265:387, 265:476, 265:562, 265:686, 265:835, 265:879, 266:83, 267:23, 267:38, 267:204, 267:221, 267:270, 269:272, 269:808, 270:325, 270:389, 270:427, 271:76, 274:73, 274:383, 275:14, 276:189, 281:51, 281:190, 283:224, 283:265, 283:304, 284:349, 286:53, 299:102, 306:202, 306:284, 356:22, 357:44, 359:259, 370:103, 370:237, 370:264, 370:535, 371:342, 371:392, 373:176, 374:27, 379:19, 381:174, 381:243, 381:629, 383:40, 383:214, 383:348, 386:164, 388:4, 389:24, 389:53, 390:5, 390:54, 390:113, 391:30 |
| `README.md` | H | `Sid'compagnon` ×1 | 1:3 |
| `app/package-lock.json` | A | `sidcompagnon` ×2 | 2:12, 8:16 |
| `app/package.json` | A | `sidcompagnon` ×1 ; `Sid'compagnon` ×1 | 2:12, 6:44 |
| `app/src/Agenda.tsx` | A | `sid'agenda` ×1 | 1:4 |
| `app/src/AiWizard.tsx` | A | `Sid'note` ×3 ; `Sid'compagnon` ×1 | 12:136, 13:157, 23:188, 24:171 |
| `app/src/Charts.tsx` | A | `sid'fit` ×1 | 1:18 |
| `app/src/Coach.tsx` | A | `Sid'compagnon` ×1 | 10:209 |
| `app/src/DayView.tsx` | A | `sid'agenda` ×1 | 1:4 |
| `app/src/Home.tsx` | A | `Sid'compagnon` ×1 | 1:4 |
| `app/src/Misc.tsx` | A | `Sid'note` ×1 | 39:78 |
| `app/src/Muscu.tsx` | A | `sid'fit` ×1 | 1:4 |
| `app/src/Notes.tsx` | A | `sid'note` ×1 | 1:4 |
| `app/src/Notif.tsx` | A | `Sid'compagnon` ×1 | 38:164 |
| `app/src/NuExtra.tsx` | A | `sid'fit` ×1 | 1:4 |
| `app/src/NuMenu.tsx` | A | `sid'fit` ×1 | 1:4 |
| `app/src/Nutrition.tsx` | A | `sid'fit` ×1 ; `Sid'note` ×1 | 1:4, 65:115 |
| `app/src/PdfView.tsx` | A | `sid'note` ×1 | 1:29 |
| `app/src/Shell.tsx` | A | `Sid'compagnon` ×3 | 26:99, 26:170, 34:91 |
| `app/src/Todos.tsx` | A | `sid'agenda` ×1 | 1:4 |
| `app/src/Vault.tsx` | A | `sid'note` ×1 | 1:4 |
| `app/src/core/crypto.ts` | A | `sidnote` ×2 | 50:93, 53:105 |
| `app/src/shell/03-compte-synchronisation.js` | A | `sidnote` ×4 | 5:20, 5:47, 5:80, 6:22 |
| `app/src/shell/04-traductions-tables-dict-pats.js` | A | `sidnote` ×11 | 12:51, 13:32, 25:45, 25:85, 72:143, 76:35, 90:110, 95:19, 265:102, 265:142, 267:38 |
| `app/src/shell/05-utilitaires.js` | A | `Sid'compagnon` ×1 | 51:48 |
| `app/src/shell/06-animation-d-ouverture-de.js` | A | `sid'agenda` ×2 ; `sid'fit` ×2 ; `sid'note` ×2 ; `Sid'compagnon` ×1 | 1:46, 1:58, 1:69, 23:27, 23:44, 23:59, 33:42 |
| `app/src/shell/07-onglets-ranges-par-categories.js` | A | `Sid'compagnon` ×9 ; `sid'agenda` ×3 ; `sid'fit` ×2 ; `sid'note` ×2 | 4:53, 4:127, 6:20, 7:21, 8:21, 9:20, 29:65, 29:109, 47:81, 47:102, 47:123, 96:66, 101:194, 101:227, 132:87, 164:14 |
| `app/src/shell/09-planning.js` | A | `Sid'compagnon` ×3 ; `sid'agenda` ×1 | 141:37, 142:16, 143:24, 146:115 |
| `app/src/shell/10-calendriers-relies.js` | A | `sidnote` ×3 | 4:30, 8:20, 9:24 |
| `app/src/shell/12-reglages.js` | A | `sidnote` ×9 ; `Sid'note` ×3 ; `Sid'compagnon` ×2 | 13:10, 18:27, 19:63, 19:142, 21:134, 21:215, 25:45, 33:35, 33:61, 33:111, 33:135, 43:67, 43:75, 59:53 |
| `app/src/shell/13-confidentialite-conditions-d-utilisation.js` | A | `Sid'compagnon` ×7 ; `sidnote` ×4 | 4:27, 6:141, 6:249, 12:18, 19:21, 22:81, 57:29, 57:47, 57:81, 57:97, 58:68 |
| `app/src/shell/14-listes-partagees-entre-proches.js` | A | `sidnote` ×3 ; `Sid'compagnon` ×2 | 14:56, 14:106, 63:64, 64:59, 72:110 |
| `app/src/shell/15-pomodoro.js` | A | `Sid'compagnon` ×2 | 121:30, 126:56 |
| `app/src/shell/16-ecran-de-connexion.js` | A | `sidnote` ×7 | 23:18, 53:19, 61:79, 61:116, 62:70, 62:101, 70:101 |
| `app/src/shell/17-mot-de-passe-oublie.js` | A | `sidnote` ×1 | 44:33 |
| `app/src/shell/18-compte-dans-reglages.js` | A | `sidnote` ×2 | 6:13, 6:44 |
| `app/src/shell/20-rappels.js` | A | `Sid'compagnon` ×3 | 11:99, 12:160, 30:151 |
| `app/src/shell/22-musculation.js` | A | `Sid'compagnon` ×9 ; `SIDFIT` ×2 | 2:68, 16:27, 38:58, 38:143, 39:33, 43:43, 60:67, 146:38, 150:20, 210:62, 218:84 |
| `app/src/shell/23-programme-de-musculation-sur.js` | A | `SIDFIT` ×4 ; `Sid'compagnon` ×1 ; `Sid'note` ×9 | 13:21, 13:46, 15:30, 15:55, 79:200, 133:39, 133:256, 133:439, 134:38, 135:11, 136:10, 137:19, 138:11, 139:10 |
| `app/src/shell/24-objectif-visible-series-conseillees.js` | A | `Sid'note` ×6 | 165:68, 166:9, 167:8, 168:38, 169:9, 170:8 |
| `app/src/shell/26-documents.js` | A | `sidnote` ×9 ; `Sid'note` ×1 ; `Sid'compagnon` ×1 | 8:83, 90:71, 177:65, 179:62, 186:71, 188:30, 188:75, 194:83, 198:54, 200:29, 208:76 |
| `app/src/shell/27-recuperation-d-un-code.js` | A | `Sid'note` ×1 ; `Sid'compagnon` ×2 | 3:14, 17:95, 27:73 |
| `app/src/shell/29-notes-libres.js` | A | `sid'note` ×1 ; `sidnote` ×1 | 226:34, 408:30 |
| `app/src/shell/31-connecteur-claude.js` | A | `sidcompagnon` ×2 | 2:45, 4:25 |
| `app/src/shell/32-brancher-claude-en-quelques.js` | A | `Sid'note` ×14 ; `Sid'compagnon` ×1 ; `sid'fit` ×3 ; `sid'agenda` ×2 ; `sid'note` ×2 | 6:115, 9:17, 9:122, 9:205, 12:68, 12:113, 12:157, 13:173, 13:324, 13:484, 29:136, 30:160, 42:164, 43:163, 57:99, 68:104, 70:64, 70:82, 71:27, 71:71, 71:99, 71:128 |
| `app/src/shell/33-face-id-touch-id.js` | A | `Sid'note` ×4 ; `sidnote` ×5 | 2:39, 3:49, 5:21, 14:116, 40:20, 41:157, 50:127, 51:77, 51:100 |
| `app/src/shell/35-coffre-renforce.js` | A | `sidnote` ×10 ; `Sid'compagnon` ×4 | 6:91, 17:20, 64:72, 75:88, 81:96, 100:107, 103:49, 106:111, 151:44, 154:52, 161:30, 211:61, 221:34, 222:78 |
| `app/src/shell/36-apparence-couleur-et-theme.js` | A | `sidnote` ×2 | 6:50, 15:11 |
| `app/src/shell/39-nutrition.js` | A | `Sid'note` ×41 ; `Sid'compagnon` ×1 | 50:67, 58:136, 58:230, 58:333, 59:44, 59:92, 59:135, 61:21, 61:292, 62:13, 62:253, 63:12, 63:266, 65:21, 65:173, 65:190, 65:318, 65:339, 65:488, 66:54, 66:237, 66:285, 66:435, 66:478, 66:646, 67:15, 67:150, 67:198, 67:313, 67:356, 67:486, 68:19, 68:65, 68:108, 320:104, 330:114, 330:151, 330:184, 349:22, 350:11, 351:10, 396:358 |
| `app/src/shell/42-onglet-appli.js` | A | `Sid\'note` ×1 | 5:84 |
| `app/src/shell/43-langue-presentation-page-d.js` | A | `sidnote` ×1 ; `Sid'compagnon` ×3 | 10:36, 29:54, 74:34, 132:37 |
| `app/src/shell/44-proposition-des-notifications-une.js` | A | `Sid'compagnon` ×2 | 6:61, 7:86 |
| `app/src/shell/46-demarrage.js` | A | `sidnote` ×8 | 15:38, 17:63, 19:39, 19:133, 34:14, 49:14, 53:36, 54:27 |
| `app/src/types.ts` | A | `Sid'compagnon` ×1 | 1:25 |
| `docs/conformite-v43.md` | H | `Sid'home` ×3 | 1:3, 29:39, 29:178 |
| `docs/migration.md` | H | `Sid'compagnon` ×1 | 36:80 |
| `docs/passation.md` | H | `Sid'compagnon` ×1 ; `sidcompagnon` ×1 ; `Sid'note` ×1 | 1:15, 6:17, 18:95 |
| `docs/refonte/README.md` | H | `sidcompagnon` ×3 ; `Sid Journée` ×1 ; `Sid Forme` ×1 ; `Sid Coffre` ×1 ; `Sid'compagnon` ×1 ; `Sid'note` ×1 | 23:20, 24:14, 30:38, 78:21, 78:62, 78:114, 78:179, 78:263 |
| `docs/refonte/audit-produit.md` | H | `Sid'compagnon` ×3 ; `sidcompagnon` ×1 ; `Sid'note` ×3 ; `Sid'agenda` ×2 ; `Sid'fit` ×2 ; `sid'agenda` ×2 ; `SidAgenda` ×1 | 1:19, 4:57, 11:70, 21:5, 24:5, 27:5, 50:25, 50:44, 50:86, 50:108, 68:125, 69:130, 69:207, 69:241 |
| `docs/refonte/maquettes/directions-2.html` | H | `Sid'compagnon` ×6 ; `Sid'agenda` ×3 ; `Sid'fit` ×10 ; `Sid'note` ×2 ; `Sid Journée` ×1 ; `Sid Forme` ×1 ; `Sid Coffre` ×1 | 1:8, 408:34, 416:15, 417:15, 418:15, 442:59, 443:139, 454:142, 454:188, 456:272, 473:193, 473:210, 473:225, 503:17, 504:14, 505:15, 525:27, 559:195, 566:201, 620:224, 630:249, 632:191, 684:50, 695:222 |
| `docs/refonte/maquettes/directions.html` | H | `Sid'compagnon` ×11 ; `Sid'agenda` ×5 ; `Sid'fit` ×6 ; `Sid'note` ×3 ; `sidcompagnon` ×1 ; `SidAgenda` ×1 ; `SidFit` ×1 ; `SidNote` ×1 ; `sid'fit` ×1 | 1:8, 412:34, 413:31, 424:91, 424:103, 424:114, 437:59, 438:203, 452:96, 490:118, 499:49, 499:60, 499:68, 499:108, 499:124, 499:164, 533:17, 534:14, 535:15, 550:90, 560:104, 569:102, 572:25, 600:87, 603:52, 604:49, 605:50, 711:329, 788:50, 799:222 |
| `docs/refonte/relais-codex-01.md` | H | `Sid'compagnon` ×2 ; `Sid'agenda` ×1 ; `Sid'fit` ×1 ; `Sid'note` ×1 ; `sidcompagnon` ×5 | 3:78, 3:93, 3:105, 3:114, 4:8, 5:22, 5:59, 11:15, 11:110, 32:53 |
| `docs/refonte/relais-codex-02.md` | H | `sidcompagnon` ×2 | 6:92, 9:6 |
| `docs/refonte/relais-codex-03.md` | H | `Sid'note` ×1 | 12:195 |
| `docs/refonte/revues.md` | H | `Sid’note` ×1 ; `Sid'note` ×1 ; `Sid Coffre` ×2 | 42:241, 86:3, 86:74, 88:33 |
| `docs/refonte/validation-technique.md` | H | `sidcompagnon` ×2 | 3:31, 16:83 |
| `site/app.js` | G | `sidnote` ×80 ; `Sid'compagnon` ×54 ; `sid'agenda` ×8 ; `sid'fit` ×7 ; `sid'note` ×7 ; `Sid'note` ×79 ; `SIDFIT` ×6 ; `sidcompagnon` ×2 ; `Sid\'note` ×1 | 57:20, 57:47, 57:80, 58:22, 73:51, 74:32, 86:45, 86:85, 133:143, 137:35, 151:110, 156:19, 326:102, 326:142, 328:38, 399:48, 404:46, 404:58, 404:69, 426:27, 426:44, 426:59, 436:42, 456:53, 456:127, 458:20, 459:21, 460:21, 461:20, 481:65, 481:109, 499:81, 499:102, 499:123, 548:66, 553:194, 553:227, 584:87, 616:14, 1072:37, 1073:16, 1074:24, 1077:115, 1201:30, 1205:20, 1206:24, 1383:10, 1388:27, 1389:63, 1389:142, 1391:134, 1391:215, 1395:45, 1403:35, 1403:61, 1403:111, 1403:135, 1413:67, 1413:75, 1429:53, 1459:27, 1461:141, 1461:249, 1467:18, 1474:21, 1477:81, 1512:29, 1512:47, 1512:81, 1512:97, 1513:68, 1529:56, 1529:106, 1578:64, 1579:59, 1587:110, 1711:30, 1716:56, 1755:18, 1785:19, 1793:79, 1793:116, 1794:70, 1794:101, 1802:101, 1886:33, 1901:13, 1901:44, 1963:99, 1964:160, 1982:151, 2104:68, 2118:27, 2140:58, 2140:143, 2141:33, 2145:43, 2162:67, 2248:38, 2252:20, 2312:62, 2320:84, 2336:21, 2336:46, 2338:30, 2338:55, 2402:200, 2456:39, 2456:256, 2456:439, 2457:38, 2458:11, 2459:10, 2460:19, 2461:11, 2462:10, 2631:68, 2632:9, 2633:8, 2634:38, 2635:9, 2636:8, 2694:83, 2776:71, 2863:65, 2865:62, 2872:71, 2874:30, 2874:75, 2880:83, 2884:54, 2886:29, 2894:76, 3096:14, 3110:95, 3120:73, 3357:34, 3539:30, 3609:45, 3611:25, 3643:115, 3646:17, 3646:122, 3646:205, 3649:68, 3649:113, 3649:157, 3650:173, 3650:324, 3650:484, 3666:136, 3667:160, 3679:164, 3680:163, 3694:99, 3705:104, 3707:64, 3707:82, 3708:27, 3708:71, 3708:99, 3708:128, 3793:39, 3794:49, 3796:21, 3805:116, 3831:20, 3832:157, 3841:127, 3842:77, 3842:100, 3893:91, 3904:20, 3951:72, 3962:88, 3968:96, 3987:107, 3990:49, 3993:111, 4038:44, 4041:52, 4048:30, 4098:61, 4108:34, 4109:78, 4217:50, 4226:11, 4412:67, 4420:136, 4420:230, 4420:333, 4421:44, 4421:92, 4421:135, 4423:21, 4423:292, 4424:13, 4424:253, 4425:12, 4425:266, 4427:21, 4427:173, 4427:190, 4427:318, 4427:339, 4427:488, 4428:54, 4428:237, 4428:285, 4428:435, 4428:478, 4428:646, 4429:15, 4429:150, 4429:198, 4429:313, 4429:356, 4429:486, 4430:19, 4430:65, 4430:108, 4682:104, 4692:114, 4692:151, 4692:184, 4711:22, 4712:11, 4713:10, 4758:358, 5229:84, 5244:36, 5263:54, 5308:34, 5366:37, 5376:61, 5377:86, 5431:38, 5433:63, 5435:39, 5435:133, 5450:14, 5465:14, 5469:36, 5470:27 |
| `site/conditions.html` | A | `Sid'compagnon` ×3 ; `Sid&#x27;compagnon` ×3 | 6:35, 7:68, 15:35, 18:50, 22:32, 25:12 |
| `site/confidentialite.html` | A | `Sid'compagnon` ×4 ; `Sid&#x27;compagnon` ×6 | 6:39, 7:43, 15:35, 18:25, 21:383, 21:3605, 22:41, 22:1017, 22:1135, 25:12 |
| `site/cookies.html` | A | `Sid'compagnon` ×3 ; `Sid&#x27;compagnon` ×4 | 6:32, 7:35, 15:35, 18:17, 20:35, 20:1040, 23:12 |
| `site/design.css` | A | `Sid'compagnon` ×6 ; `sid'agenda` ×3 ; `sid'fit` ×6 ; `sid'note` ×4 | 1:4, 2:27, 2:39, 2:50, 333:56, 347:15, 391:9, 416:9, 554:4, 570:4, 580:4, 590:39, 698:44, 705:17, 727:17, 736:17, 775:17, 795:39, 903:12 |
| `site/exercices-aide.js` | A | `sid'fit` ×1 ; `SIDFIT` ×2 | 1:4, 4:8, 1140:8 |
| `site/exercices.js` | A | `sid'fit` ×1 ; `Sid'note` ×1 ; `SIDFIT` ×1 | 1:4, 2:42, 15:8 |
| `site/fonts.css` | A | `Sid'compagnon` ×1 | 1:26 |
| `site/i18n.js` | I | `Sid'note` ×113 ; `Sid'compagnon` ×210 ; `sid'agenda` ×16 ; `sid'note` ×20 ; `sid'fit` ×20 ; `Sid'fit` ×4 | 1:4, 3:7670, 3:7776, 3:7966, 3:8035, 3:11805, 3:11843, 3:11875, 3:11911, 3:11941, 3:11963, 3:11985, 3:12009, 3:13455, 3:13468, 3:13481, 3:13492, 3:13593, 3:13690, 3:13712, 3:13744, 3:13792, 3:13844, 3:13889, 3:13983, 3:16100, 3:16248, 3:23267, 3:23352, 3:26001, 3:26011, 3:26262, 3:26339, 3:27635, 3:27712, 3:27751, 3:27784, 3:27974, 3:28191, 3:29199, 3:29226, 3:29706, 3:29814, 3:30359, 3:30464, 3:32436, 3:32491, 3:32512, 3:32541, 3:32577, 3:32623, 3:32663, 3:32693, 3:32723, 3:32757, 3:33100, 3:33298, 3:34006, 3:34258, 3:35575, 3:35683, 3:36073, 3:36178, 3:38506, 3:38670, 3:40364, 3:40453, 3:41965, 3:42073, 3:42974, 3:43119, 3:44283, 3:44347, 3:44729, 3:44753, 3:44783, 3:44810, 3:44826, 3:44842, 3:44935, 3:44965, 3:44989, 3:45058, 3:45084, 3:45107, 3:45564, 3:45662, 3:46366, 3:46434, 3:47074, 3:47108, 3:47276, 3:47505, 3:50529, 3:50669, 3:55729, 3:55844, 3:55926, 3:55948, 3:57473, 3:57583, 3:58451, 3:58523, 3:59742, 3:59814, 3:60092, 3:60340, 3:60719, 3:60831, 3:61235, 3:61373, 3:61430, 3:61465, 3:61647, 3:61663, 3:62543, 3:62766, 3:63399, 3:63481, 3:67765, 3:67792, 3:71153, 3:71221, 3:71489, 3:71696, 3:75166, 3:75249, 3:75288, 3:75440, 3:80047, 3:80058, 3:80088, 3:80107, 3:82974, 3:83035, 3:83237, 3:83350, 11:38, 11:60, 11:85, 11:109, 15:38, 15:67, 45:58, 45:122, 49:28, 49:90, 57:71, 57:147, 67:40, 67:122, 79:112, 79:138, 80:2, 80:36, 88:68, 88:129, 99:19, 99:70, 104:15, 104:135, 125:29, 125:133, 137:132, 137:218, 139:225, 139:491, 145:77, 145:418, 166:10, 166:21, 196:29, 196:50, 197:38, 197:150, 199:38, 199:90, 214:13, 214:24, 244:60, 244:142, 347:448, 347:531, 357:93, 357:238, 357:436, 357:574, 357:719, 357:740, 357:2327, 357:2345, 372:5, 372:51, 415:8112, 415:8234, 415:8433, 415:8518, 415:12469, 415:12507, 415:12541, 415:12577, 415:12609, 415:12631, 415:12651, 415:12675, 415:14149, 415:14162, 415:14175, 415:14186, 415:14287, 415:14389, 415:14411, 415:14443, 415:14489, 415:14544, 415:14587, 415:14684, 415:16932, 415:17071, 415:24475, 415:24561, 415:27309, 415:27319, 415:27568, 415:27648, 415:28953, 415:29039, 415:29083, 415:29116, 415:29303, 415:29515, 415:30567, 415:30596, 415:31084, 415:31192, 415:31754, 415:31868, 415:33913, 415:33968, 415:33989, 415:34018, 415:34054, 415:34100, 415:34138, 415:34160, 415:34188, 415:34219, 415:34606, 415:34811, 415:35516, 415:35768, 415:37155, 415:37263, 415:37670, 415:37784, 415:40245, 415:40409, 415:42168, 415:42257, 415:43799, 415:43914, 415:44851, 415:44997, 415:46155, 415:46221, 415:46619, 415:46646, 415:46676, 415:46703, 415:46719, 415:46735, 415:46828, 415:46858, 415:46882, 415:46950, 415:46976, 415:47001, 415:47459, 415:47555, 415:48267, 415:48334, 415:48986, 415:49021, 415:49193, 415:49422, 415:52576, 415:52717, 415:57983, 415:58097, 415:58183, 415:58201, 415:59792, 415:59899, 415:60779, 415:60848, 415:62102, 415:62205, 415:62490, 415:62737, 415:63134, 415:63246, 415:63657, 415:63780, 415:63837, 415:63871, 415:64046, 415:64060, 415:64990, 415:65212, 415:65877, 415:65959, 415:70514, 415:70541, 415:74148, 415:74202, 415:74495, 415:74702, 415:78332, 415:78421, 415:78476, 415:78628, 415:84404, 415:84415, 415:84446, 415:84467, 415:87431, 415:87507, 415:87700, 415:87828, 415:93205, 415:93227, 415:93252, 415:93276, 415:93756, 415:93787, 415:98360, 415:98421, 415:99003, 415:99058, 415:100436, 415:100513, 415:102060, 415:102120, 415:103862, 415:103888, 415:103918, 415:103952, 415:105185, 415:105243, 415:107228, 415:107270, 415:108125, 415:108241, 415:111592, 415:111690, 415:114066, 415:114372, 415:115447, 415:115794, 415:119690, 415:119701, 415:125112, 415:125146, 415:125300, 415:125428, 415:125718, 415:125786, 415:128538, 415:128559, 415:133031, 415:133106, 415:142256, 415:142344, 415:144371, 415:144512, 415:144707, 415:144844, 415:144982, 415:145001, 415:146615, 415:146631, 417:5, 417:51 |
| `site/ident.css` | A | `Sid'compagnon` ×1 | 1:4 |
| `site/index.html` | A | `Sid'compagnon` ×39 ; `sid'agenda` ×5 ; `sid'fit` ×6 ; `sid'note` ×6 ; `sidcompagnon` ×6 ; `Sidcompagnon` ×1 ; `Sid compagnon` ×1 ; `Sid'note` ×1 | 6:8, 7:35, 7:110, 7:166, 7:214, 8:40, 11:37, 13:40, 14:36, 15:97, 15:109, 15:120, 16:42, 17:44, 21:50, 26:124, 26:157, 26:172, 26:203, 26:320, 26:355, 37:58, 37:113, 37:134, 37:163, 37:199, 38:112, 42:9, 63:74, 68:30, 72:185, 90:14, 95:55, 125:55, 133:55, 209:55, 264:55, 287:84, 288:68, 295:55, 426:55, 456:55, 489:55, 531:55, 554:55, 556:29, 563:30, 570:55, 635:89, 637:87, 639:87, 641:85, 654:23, 669:377, 672:231, 698:52, 769:145, 824:106, 883:39, 904:41, 905:65, 905:95, 905:119, 931:36, 978:84 |
| `site/legal.css` | A | `Sid'compagnon` ×1 | 1:21 |
| `site/llms.txt` | A | `Sid'compagnon` ×1 ; `sid'agenda` ×1 ; `sid'fit` ×1 ; `sid'note` ×1 ; `sidcompagnon` ×3 | 1:3, 3:127, 3:191, 3:252, 8:42, 9:38, 10:35 |
| `site/manifest.webmanifest` | A | `Sid'compagnon` ×2 ; `sid'agenda` ×1 ; `sid'fit` ×1 ; `sid'note` ×1 | 2:12, 3:18, 4:37, 4:49, 4:60 |
| `site/react/core.js` | G | `sidnote` ×1 | 1:5762 |
| `site/react/islands.js` | G | `Sid'note` ×5 ; `Sid'compagnon` ×6 | 40:107099, 40:127387, 40:127447, 40:127701, 40:147179, 40:152607, 40:154433, 40:154672, 40:156371, 40:156619, 40:162102 |
| `site/robots.txt` | A | `Sid'compagnon` ×1 ; `sidcompagnon` ×1 | 1:3, 12:18 |
| `site/sitemap.xml` | A | `sidcompagnon` ×4 | 3:21, 4:21, 5:21, 6:21 |
| `site/sw.js` | A | `sidnote` ×2 ; `sid'note` ×1 | 1:16, 2:14, 41:62 |
| `supabase/functions/delete-account/index.ts` | S | `Sid'note` ×1 | 1:4 |
| `supabase/functions/horaire/index.ts` | S | `Sid'note` ×3 ; `Sid'compagnon` ×1 ; `Sidnote` ×1 | 1:4, 4:39, 5:8, 24:44, 37:60 |
| `supabase/functions/mcp/index.ts` | M | `Sid'note` ×32 ; `Sid'home` ×4 ; `Sid'compagnon` ×6 ; `Sidnote` ×1 ; `sid'agenda` ×1 ; `sid'fit` ×1 ; `sid'note` ×1 ; `sidcompagnon` ×4 ; `sidnote` ×1 | 1:4, 1:51, 4:9, 5:9, 6:9, 77:9, 96:65, 163:153, 244:51, 250:50, 279:49, 285:49, 300:51, 312:47, 328:247, 329:204, 334:93, 334:288, 335:133, 339:29, 364:35, 398:35, 418:120, 439:144, 457:49, 457:61, 457:70, 457:112, 460:19, 461:19, 476:9, 485:36, 498:9, 544:76, 554:164, 604:219, 745:31, 776:17, 781:36, 817:107, 826:81, 830:16, 836:17, 870:41, 892:99, 894:91, 911:30, 911:48, 911:119, 912:24, 912:491 |
| `supabase/functions/nutrition/index.ts` | S | `Sid'note` ×1 | 1:4 |
| `supabase/functions/rappels/index.ts` | S | `Sid'note` ×2 ; `sidnote` ×2 | 1:4, 15:69, 131:43, 151:48 |
| `supabase/sql/documents.sql` | S | `Sid'note` ×1 | 1:4 |
| `supabase/sql/features.sql` | S | `Sid'note` ×1 | 1:4 |
| `supabase/sql/food_memory.sql` | S | `Sid'note` ×1 | 1:4 |
| `supabase/sql/mcp.sql` | S | `Sid'note` ×1 | 1:4 |
| `supabase/sql/notifications.sql` | S | `Sid'note` ×1 ; `sidnote` ×10 | 1:4, 32:60, 33:104, 36:35, 38:70, 40:31, 41:34, 47:69, 47:88, 50:4, 55:104 |
| `supabase/sql/nutrition.sql` | S | `Sid'note` ×1 | 1:4 |
| `supabase/sql/securite-v32.sql` | S | `Sid'note` ×1 | 1:4 |
| `supabase/sql/v37.sql` | S | `Sid'note` ×1 ; `sidnote` ×6 | 1:4, 25:35, 33:31, 37:67, 39:23, 39:71, 42:15 |
| `supabase/sql/v43.sql` | S | `Sid'home` ×1 ; `sidnote` ×2 | 1:4, 7:35, 17:31 |
| `tests/captures-refonte.js` | T | `sidnote` ×1 | 4:330 |
| `tests/serve.js` | T | `Sid'note` ×1 | 1:20 |
| `tests/smoke.js` | T | `Sid'note` ×9 ; `Sid'compagnon` ×15 ; `sidnote` ×21 ; `sid'note` ×10 ; `sid'agenda` ×13 ; `sidcompagnon` ×3 ; `sid'fit` ×6 ; `Sid'home` ×2 ; `SIDFIT` ×2 | 12:108, 21:14, 21:107, 42:53, 55:18, 55:114, 56:65, 58:69, 62:46, 62:67, 63:67, 65:45, 68:81, 69:132, 175:53, 243:36, 243:76, 243:132, 256:194, 272:53, 300:74, 301:32, 329:40, 412:153, 489:57, 491:117, 550:63, 580:89, 581:132, 619:61, 621:105, 726:100, 738:81, 740:59, 742:106, 750:126, 755:150, 755:170, 802:74, 806:8, 807:149, 846:76, 919:20, 919:41, 920:99, 933:27, 937:101, 985:36, 1051:16, 1055:38, 1056:39, 1056:57, 1062:40, 1139:49, 1140:64, 1140:98, 1159:100, 1159:113, 1164:47, 1164:131, 1171:161, 1172:155, 1173:45, 1173:59, 1662:63, 1856:58, 1856:92, 1893:29, 1918:73, 1972:73, 2048:73, 2075:89, 2092:73, 2134:73, 2162:86, 2184:73, 2220:73, 2244:73, 2307:73, 2459:27, 2464:27 |

### Vérification avant le futur lot de renommage

Cet inventaire ne modifie que l’audit. Lors de la réalisation : vérifier le diff des sources autorisées et l’absence de diff mcp/SQL ; construire les générés depuis app/src (jamais éditer site/app.js/react à la main) ; vérifier FR/EN/NL, accueil/en-têtes/présentation, les noms dans le manifest et les icônes ; conserver une restauration de sauvegarde `app:sidnote`, session existante, déverrouillage coffre et clés locales. Les tests d’interface peuvent attendre les nouveaux textes ; les tests de contrats doivent toujours attendre les anciennes clés. Les erreurs de smoke déjà observées restent un sujet séparé.

Contrôle T11 : les 244 occurrences des sources shell correspondent au nombre du généré `site/app.js` ; sur les fichiers texte hachés avant/après le relevé, seul cet audit a changé. Les noms de package `sidcompagnon-app`, du dépôt et l’éditeur SidCorp sont techniques ou inchangés ; aucun renommage nécessaire.
