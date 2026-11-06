# Revues croisées

Chaque agent écrit uniquement sa section. Les désaccords et leur résolution sont résumés en fin de fichier.

## Claude Code — auto-critique des maquettes (5 nov. 2026)
- Corrigé après le premier rendu Playwright : boutons écrasés dans la colonne défilante (`flex-shrink`), logos B et C invisibles en sombre, titres d'activités coupés au milieu d'un mot sur ordinateur, titre et bouton sur deux lignes (A).
- Limites connues : les lettres des logos B sont du texte (à vectoriser) ; les maquettes sont à 300 px de large (≈ 77 % d'un iPhone 13) ; Nutrition, Documents, Mots de passe, Focus, Réglages et connexion ne sont pas maquettés (choix : 6 états comparables plutôt que 21 superficiels).
- Contrastes non mesurés de mon côté : demandés à Codex.

## Codex — revue T6, 5 novembre 2026

**Avis : A · Signal, après corrections ci-dessous.** Mesures Chromium/Playwright sur `maquettes/directions.html`, rendus 1280/400 px sans erreur JS ni débordement global. Revue partielle ; seuil du texte courant : **4,5:1** ([WCAG 2.2, 1.4.3](https://www.w3.org/TR/WCAG22/#contrast-minimum)).

| Direction | Faisabilité et coût relatif estimé (pas un chiffrage) |
|---|---|
| **A Signal** | Schibsted seule, jetons et SVG simples ; migration moyenne. Risques : orange proche des alertes, états sélectionnés peu contrastés. |
| **B Encre** | Faisable, coût moyen/élevé : **4 familles CSS** Plex (Sans, Condensed, Mono, Serif), davantage de fichiers et rôles. « 250 Ko » non vérifiés ; lettres des logos à vectoriser. Boutons fortement contrastés. |
| **C Horizon** | Figtree seule ; coût supérieur pour surfaces imbriquées, fonds et barre flottante. Largeur utile des séries : 220 px contre 248 pour A/B ; risque pour noms longs et macros. |

**Commun :** héberger les WOFF2 utiles, mesurer leur poids ; le lien Google Fonts (:3) est incompatible avec la CSP actuelle (`font-src/style-src self`, `site/vercel.json`). Extraire le JS inline en fichier local pour l’app ; aucune détente de CSP nécessaire. Coût commun dominant : composants React **et secours**, suppression progressive des surcharges.

**Contrastes mesurés — texte / fond, clair puis sombre :**

| Usage | Clair | Sombre |
|---|---|---|
| A bouton Agenda | `#FFFFFF / #2F56D9` **6,08** | `#0F1114 / #6283F2` **5,45** |
| A bouton Fit | `#FFFFFF / #E5532D` **3,75 : échec** | `#0F1114 / #F06C47` **6,25** |
| A bouton Note jaune | `#0F1114 / #EBB129` **9,77** | `#0F1114 / #F0BE45` **10,95** |
| B bouton commun | `#F6F6F4 / #18181B` **16,37** | `#141416 / #EDEDEA` **15,68** |
| C bouton Agenda | `#FFFFFF / #3F7FD9` **4,00 : échec** | `#10121A / #72A2EC` **7,21** |
| C bouton Fit | `#FFFFFF / #E07038` **3,21 : échec** | `#10121A / #F08C58` **7,65** |
| C bouton Note | `#FFFFFF / #7A5CC6` **5,03** | `#10121A / #A38DE1` **6,64** |

L’orange textuel A sombre `#F79A80 / #0F1114` atteint **8,90** ; l’alerte claire `#9A5B00 / #F4F5F7` **4,97**. **Défaut supplémentaire :** `--on` est local à `.pri` (:242–243), mais utilisé ailleurs (:119, :218, :248–253, :338). A sombre hérite donc de `#F1F2F4` sur la pastille Fit `#F06C47` : **2,70**, et sur la date sélectionnée `#6283F2` : **3,10**. Définir le jeton sur le conteneur d’app, vérifier coches et dates ; pour Fit clair, le fond `#B23A18` avec blanc donnerait **5,98**. Pour C clair, blanc sur `#2B61B3` donne **6,06**, sur `#AD4F1D` **5,37**.

**Geste et mouvement :** tailles rendues : boutons 46 px, navigation ≈48 px ; retour 36×36, Claude 36 px, pastilles/séries 34 px, lignes de correction 40 px. Les 300 px de maquette sont **sans réduction CSS proportionnelle** : ne pas multiplier les tailles par 1,3. Viser 44–48 px pour les commandes/champs réels ; coche 22 px possible si toute la ligne est cliquable. Le minimum AA est 24 px avec exceptions d’espacement ([2.5.8](https://www.w3.org/TR/WCAG22/#target-size-minimum)). Mouvement réduit système vérifié : transitions à 1 ms, délai nul ; état quasi instantané, transforms conservées.

**Réserves et désaccords :** ajouter avant choix une journée Nutrition dense (macros déjà tronquées dans l’avant) et une fenêtre longue avec clavier/date/heure, à 390 px, puis un coffre/PDF verrouillé. « Valider la série » et saisie « compris » changent le comportement : accord distinct, préserver saisie manuelle/import. Je partage le choix A, **pas l’affirmation qu’elle est déjà “très lisible” sans réserve**. B n’est pas techniquement « une police » ; C consomme plus d’espace. Audit produit : 11 familles listées, pas 10 ; mouvement réduit = préférence système (T2). Décision finale à Sid.

## Codex — tour 2 (T9, F · Élan choisie par Sid)

**F est réalisable ; le choix est acquis.** Revue locale de `maquettes/directions-2.html`, sans modification. Les verbes, fonctions et rôles rendent Agenda/Fit explicites ; compréhension à confirmer sur compte vide et sans accès Nutrition. Sid’note reste ambigu : « papiers » exclut écriture/mots de passe, document+cadenas suggère tout verrouillé. Proposer « Écris, classe et protège » + « Notes, documents, mots de passe » ; distinguer contenus ordinaires et protégés. Sur l’accueil à 390 px, ses fonctions sont sous le défilement : compacter les cartes pour exposer les trois périmètres.

**Contrastes mesurés** (texte/fond ; seuil courant 4,5 selon [WCAG 2.2](https://www.w3.org/TR/WCAG22/#contrast-minimum)) :

| Usage | Clair | Sombre |
|---|---|---|
| Bandeau/bouton Agenda | `#FFF / #2563EB` **5,17** | identique |
| Bandeau/bouton Fit, texte sombre | `#121212 / #FC4C02` **5,51** | identique |
| Bandeau/bouton Note | `#FFF / #7C3AED` **5,70** | identique |
| Texte des puces de fonction sur accueil | `#1A1A1A / #ECECEC` **14,73** | `#F2F2F2 / #2A2A2A` **12,82** |
| Icône Fit de ces puces | `#B83A06 / #ECECEC` **4,88** | `#FF9A6B / #2A2A2A` **6,89** |

**Corrections nécessaires :** rôle Agenda à 85 % : `#DEE8FC / #2563EB` **4,20** ; Claude Fit sur orange assombri : `#121212 / #D94102` **4,20**. Accueil Fit : le conteneur `data-app=home` conserve le blanc, `#FFF / #FC4C02` **3,40**, sous-titre à 88 % `#FFEAE1 / #FC4C02` **2,93**. Définir le couple accent/texte **sur chaque carte**, garder les rôles opaques, supprimer l’assombrissement problématique. « Tes 3 apps » clair : `#FEFEFE / #F7F7F7` **1,06** ; utiliser le texte secondaire du thème. Ces défauts d’héritage doivent être corrigés avant de figer les jetons.

**Polices/poids :** Barlow déclaré 400/500/600/700 normal ; Condensed 600/700/800 normal et 700/800 italique (:3). Fournir ces vraies faces locales avec `font-display:swap`, couverture FR/EN/NL ; normaliser les demandes Barlow 800 (avatar, marque ordinateur) à 700 ou fournir 800. Mesure des fichiers effectivement téléchargés pour les contenus présents : Barlow **67 756 octets, 3 fichiers** ; Condensed **114 792, 5** ; total **182 548 octets (178,3 Kio)**. Budget final latin/latin étendu à mesurer, pas une garantie de téléchargement universel. Le dépôt possède déjà Condensed normal 600/700/800 (`site/fonts.css:190–238`), pas les italiques. Aucun Google Fonts en production ; JS externe, CSP conservée.

**Découpage proposé des jetons F :**

| Niveau | Rôle |
|---|---|
| Thème | `--bg`, `--surface`, `--surface-2`, `--field`, `--ink`, `--muted`, `--line`, `--bar` clair/sombre ; statuts succès/alerte/erreur séparés des marques. |
| App/carte | `--app`, `--on-app`, `--app-ink`, `--app-soft` ; alias provisoires vers les noms existants (`--accent`, `--on-accent`, etc.). Aucun changement de couleur par fonction. |
| Composants | `--font` Barlow, `--display` Condensed italique, `--digits` Condensed droit/tabulaire ; échelle d’espacement, rayons contrôle/carte/fenêtre, cibles 44–50 px, durées et mouvement réduit. |

**Migration :** `app.css` garde structure, composants, `[hidden]`, safe-area et correctifs iPhone. `design.css` devient temporairement la peau F avec ces jetons, en isolant les anciennes règles éditoriales très spécifiques, sans empiler des `!important`. `ident.css` ne s’applique plus au mode F ; conserver les préférences pendant la transition. Migrer un parcours complet React+secours, retirer chaque surcharge remplacée, puis réunir les règles dans `app.css` et supprimer les deux liens historiques. Coût moyen/élevé : composants et cascade dominent, pas les polices.

**Risques à vérifier :** bandeau Agenda ≈202 px, statut compris ; prévoir une variante compacte sur petits écrans/clavier. Italique réservé aux titres, chiffres de séries/macros droits. Rendus 1280/400 px sans erreur JS ni débordement global ; mouvement réduit à 1 ms/délai nul. Garder le code à **cinq chiffres** (maquette : six), sans changement implicite du coffre. Formulaire long avec clavier/date/heure à vérifier lors de la charte.

## Désaccords et résolution
| Sujet | Codex | Claude Code | Résolution |
|---|---|---|---|
| Contrastes A Fit, C Agenda, C Fit (clair) ; `--on` local à `.pri` | échec mesuré | d'accord | corrigé (A Fit #C8441F 4,88 ; C #2B61B3 6,06 / #AD4F1D 5,37 ; `--on` par app et thème) |
| Cibles 34–40 px, maquettes à 300 px | à revoir | d'accord | 44 px minimum, lignes 48 px, maquettes à 390 px |
| Nutrition dense + coffre verrouillé avant le choix | demandé | d'accord | ajoutés |
| Long formulaire clavier/date/heure avant le choix | demandé | pas discriminant entre directions (mêmes composants) | reporté à la charte (états), vérifié à 390 px ; Codex informé |
| « Très lisible » pour A | contesté | d'accord | retiré |
| « Valider la série », liste « Compris » | changements de comportement | d'accord | question séparée posée à Sid |
| Polices Google interdites par la CSP | à héberger | d'accord | retenu pour la réalisation |
| Recommandation | A après corrections | A | convergence ; décision à Sid |

### Tour 2 (F · Élan) — suite donnée par Claude Code

| Point de Codex | Résolution |
|---|---|
| Sid'note ambigu (« papiers », tout verrouillé) | Sid a renommé l'app **Sid Coffre** après la revue. Je garde le nom (choix de Sid) et j'applique la correction de Codex au texte : rôle « Notes, documents, mots de passe », phrase « Écris, classe et protège ». Le logo garde un document ouvert avec un **petit** cadenas, pas un coffre fermé |
| Rôle à 85 % (4,20), sous-titres d'accueil hérités en blanc sur orange (3,40 / 2,93), bouton Claude assombri (4,20), « Tes 3 apps » (1,06) | accepté : le texte sur couleur d'app est toujours opaque ; chaque surface colorée porte son couple `--app`/`--on-app` ; bouton Claude = fond `--on-app`, texte `--app`, plus d'assombrissement ; titres de section en `--ink`/`--muted` du thème |
| Accueil 390 px : fonctions de Sid Coffre sous le défilement | accepté : cartes d'accueil compactes (bandeau 56 px + chiffre + fonctions), les 3 périmètres visibles sans défiler sur 390 × 844 |
| Faces de police, 178 Kio | accepté : Barlow 400/500/600/700 + Barlow Condensed 600/700/800 droites et 700/800 italiques, auto-hébergées ; Barlow 800 ramené à 700 |
| Bandeau ≈ 202 px | accepté : bandeau compact (titre 32 px, sans barre) dès qu'on fait défiler, au clavier et sous 700 px de haut |
| Italique réservé aux titres, chiffres droits | accepté |
| Code du coffre à 5 chiffres | accepté, aucun changement du coffre |
| Découpage des jetons et migration | accepté tel quel ; repris dans `charte.md` § Jetons |
| (ajout de Claude Code) Orange identique à celui d'une marque connue (`#FC4C02`) | remplacé par un orange propre, `#F25C19` : texte `#121212` à 5,64:1 |


## Codex — T13

Fondations Élan et premier parcours intégrés sur `refonte-tech`, version 75.0, sans push ni mise en ligne. Chargement du skill sid-charte et application de la charte validée.

- Polices auto-hébergées (18 faces, 337 040 octets), jetons de thème et d’app avec alias provisoires, nouvelle peau, logos exportés et cache monté. ident.css ne s’applique plus ; Unique/Sobre et les neuf identités sont retirés sans supprimer la préférence enregistrée. Noms affichés et traductions FR/EN/NL adaptés, identifiants préservés.
- Accueil compact avec les trois apps et leurs fonctions visibles à 390 × 844. Agenda : bandeau complet/compact, Claude à position constante, semaine, ajout et liste du jour. Calendrier complet et recherche conservés dans le volet des options. Conversation Claude et réglages conservés.
- Feuille d’ajout : champs et erreurs visibles, horaires/rappel, bouton collé en bas, animations ouverture/fermeture, retour du focus. Confirmation avec Annuler, nouvelle ligne sur app-soft et compte d’accueil à jour. Progression honnête faites/total : l’ajout recale la barre sans rebond. React et secours.

**Vérification** : build et `npm test` réussis (cinq vérifications techniques et 15 configurations du parcours). 94 captures dans [apres/index.md](apres/index.md), mesures dans [apres/manifest.json](apres/manifest.json) : aucun débordement ni erreur JS, contraste minimal contrôlé 5,17:1, focus et mouvement réduit. [Bilan détaillé](apres/validation.md). Smoke historique adapté exécuté en trois blocs contigus : mêmes 17 messages fonctionnels connus (v38/v44.7/v45/v65) et même famille CSP unsafe-eval, aucune nouvelle famille d’échec. Détail et sorties brutes dans le bilan. Les déplacements de cibles au compact et les écarts de parité relevés ont été corrigés.

**Écarts et limites** : les clarifications compact/progression/poids des polices ont été validées puis intégrées à la charte par Claude. Aucun autre écart revendiqué. Le clavier est simulé par un viewport de 440 px de haut ; Safari et clavier iOS réels restent à vérifier. Les écrans hors du parcours ont reçu les fondations, leur mise en page fine reste au lot suivant. CSP, Supabase/mcp, clés, chiffrement et formats de sauvegarde inchangés.


## Claude Code — revue visuelle T13 (captures `apres/`, 5 nov.)

Vu : 390 sombre (accueil, agenda, ajout, confirmation), 320 clair (accueil), 1280 clair (agenda). Le parcours tient, et le principe 1 est respecté : le nom, le rôle, le titre et la progression sont toujours visibles, le bouton Claude est bien placé, les 3 apps tiennent sans défiler, les contrastes sont bons et la ligne nouvelle est sur `--app-soft`. Écarts à corriger avant extension :

| # | Écran | Écart | Règle de la charte | Correction attendue |
|---|---|---|---|---|
| 1 | Agenda (toutes tailles) | Les heures « 10:00- / 11:00 » se coupent au tiret | § 8 Liste | Début en Condensed 18 et fin en dessous, en Barlow 13 `--muted`, sans tiret |
| 2 | Agenda | Une activité **non faite** a une case **cochée** : on la croirait faite | § 9, principe « ne pas tromper » | Non faite : cercle vide au trait `--muted`. Faite : cercle plein `--app` avec la coche en `--on-app`. Libellé accessible « Marquer comme faite » / « Faite » |
| 3 | Barre du bas | Trait au-dessus **et** point sous l'icône : deux signes pour un même état | § 8 Barre du bas | Garder le trait, retirer le point |
| 4 | Accueil | « 1 notes » | Rédaction | Accorder : « 1 note », « 12 notes » (FR/EN/NL) |
| 5 | Accueil | « jeudi 5 Novembre » : majuscule au mois | Rédaction FR | « jeudi 5 novembre » (comme dans l'Agenda) |
| 6 | Accueil 320 clair | Ombre portée sur le bouton « + » | Principe 5 | Pas d'ombre ; fond `--surface-2` comme l'avatar |
| 7 | Feuille d'ajout | Bloc « Me prévenir » décalé à droite par rapport aux autres champs | § 6 (grille) | Même marge que les champs, libellé au-dessus comme les autres |
| 8 | Feuille d'ajout | Rappel choisi = contour bleu foncé ; « + Autre » en pointillés | § 8 Puce | Choisi : fond `--app` et texte `--on-app`. « Autre » : puce normale, sans pointillés |
| 9 | Feuille d'ajout | Pastilles de type en couleur : l'orange d'« Événement » se confond avec Sid Forme | § 4 (couleurs d'app réservées) | Pas de couleur d'app pour les types. Pastilles neutres, ou une icône par type. **À me confirmer** si ces couleurs viennent de données de l'utilisateur (couleurs choisies) |
| 10 | Message bref | Pas de coche ; « Annuler » en bouton gris à contour | § 8 Message bref, § 9 Réussite | Coche `--ok` à gauche ; « Annuler » en texte gras souligné, zone tactile 44 |
| 11 | Ordinateur | Bouton vide encadré à côté de « Sid'compagnon » (en haut de la barre latérale) | — | Bouton sans icône : corriger l'icône ou le retirer |
| 12 | Ordinateur | Deux boutons principaux sur le même écran (« Ajouter » dans la barre latérale et « Ajouter une activité ») | § 8 « un seul par écran » | « Ajouter » de la barre latérale en style secondaire (`--surface-2`) |
| 13 | Ordinateur | Fond de l'élément actif « Agenda » plus étroit que la barre | § 8 | Toute la largeur de la barre |
| 14 | Captures | Heures en « 04:00 PM » et date au format américain | — | Lancer les captures avec `locale: 'fr-BE'` (et `en-GB` / `nl-BE`), sinon on ne voit pas le vrai rendu |

Points sans changement : la taille du chiffre à 320 px (le texte passe à la ligne proprement) et le logo seul sur son bandeau (c'est voulu, la tuile se confond avec la couleur de l'app).

## Codex — corrections de la revue visuelle T13

Revue source lue dans le worktree de Claude : section « Claude Code — revue visuelle T13 ». Sa copie n’est pas écrasée.

| Points | Résolution |
|---|---|
| 1 | Heure de début en Condensed 18 ; fin sur une seconde ligne en Barlow 13, sans tiret. « Toute la journée » reste sur plusieurs lignes si nécessaire. |
| 2 | Non faite : cercle vide neutre, sans coche ; faite : cercle bleu avec coche blanche. État accessible et action de bascule testés, en React et secours. |
| 3 | Point décoratif retiré ; seul le trait marque l’onglet actif. |
| 4–5 | Singular/pluriel des notes FR/EN/NL ; date locale avec mois en minuscule en français. |
| 6 | Ombre du bouton Ajouter déjà retirée dans la dernière passe T13 ; absence de shadow contrôlée. |
| 7–8 | Rappel aligné sur les champs, libellé au-dessus ; sélection pleine app/on-app opaque, puce Autre sans pointillés. |
| 9 | Événement est orange par défaut ; les couleurs sont modifiables dans Réglages et stockées dans `data.types[].c`. Aucune donnée ni possibilité de réglage supprimée. Pastilles du formulaire rendues neutres, sans leur point coloré. |
| 10 | Coche de réussite en `--ok` ; Annuler gras souligné, sans fond ni contour, cible 44 px. |
| 11–13 | Icône du repli visible dans une cible 44 ; Ajouter latéral secondaire, cible 44 ; lignes et fond actif sur toute la largeur utile. |
| 14 | Les contextes avaient déjà fr-BE/en-GB/nl-BE. Chromium utilisait encore une locale native américaine pour date/heure : langue et environnement du processus corrigés. Captures FR vérifiées : 05/11/2026, 16:00, 17:00. |

Validation finale et captures : [apres/validation.md](apres/validation.md). Pas d’extension aux autres parcours, pas de push ni mise en ligne.


## Codex — palette des types après arbitrage #9

Claude accepte explicitement que tous les types référant `--c-event` suivent le sarcelle `#0F8B8D`, même si un ancien choix explicite du même jeton ne peut pas être distingué du défaut. Seul le jeton CSS change ; aucune écriture dans `data.types`.

Les points colorés sont rétablis dans le formulaire et ajoutés à la méta de la liste Agenda, avec le nom du type. La sélection des types reste neutre avec un contour pour garantir le contraste du point ; les rappels gardent leur sélection pleine. Le test vérifie la couleur calculée, sa visibilité, et l’identité de `data.types` avant/après le parcours.

[Audit complet et propositions non appliquées](palette-types.md) : `--c-cours`, `--c-memoire` et `--x4` sont trop proches des apps. Propositions envoyées à Claude, en attente de sa réponse ; `--x1` et `--x3` sont signalés comme cas limites. Aucun de ces cinq autres jetons n’est modifié.


## Codex — palette des types finale validée

Arbitrage final de Claude appliqué : Cours olive `#66712E` / `#AAB76D`, Mémoire framboise `#9B427A` / `#D286B5`, x4 brun désaturé `#7C5A45` / `#C49A80`. Le brun atteint au minimum 5,22:1 en clair et 5,66:1 en sombre sur surface/surface-2 ; aucun ajustement nécessaire. x1 cyan et x3 ocre conservés. Les propositions antérieures ardoise pour Cours et olive pour x4 restent abandonnées.

[Table finale des 11 jetons](palette-types.md). Les tests comparent leurs valeurs calculées à la table validée et vérifient 3:1 sur les surfaces de chaque thème, ainsi que `data.types` identique avant/après. Aucun changement de noms, de références ni de données. Aucun arbitrage de couleur ne reste en attente.


## Codex — T16 lot A

Tâches et Focus intégrés à Élan en React et en secours. Les fonctions de catégorie, planification, recherche, suspens, déplacement par poignée, calendrier et liste des réalisées sont conservées. Tâches affiche une progression du jour issue des objets réels ; Focus affiche la position dans le programme et la session, sans présenter le temps sauté comme du travail réellement effectué.

Les clarifications Focus (§ 10) et cibles du calendrier à 320 px (§ 6) ont été intégrées à la charte par Claude. Pas d’autre exception revendiquée. Le moteur du chrono, les signaux audio, les réveils et le journal sont conservés ; seul leur rendu et la position du contenu au démarrage sont adaptés. Spotify garde ses actions et son consentement. Les nouvelles décisions Nutrition et conversations restent respectivement aux lots B et D.

Parcours ajoutés depuis `tests/elan.js`, dans `tests/elan-lot-a.cjs`. Assertions de conservation du payload complet hors UI pendant les rendus seuls, puis des domaines non concernés après les interactions ; fin naturelle et saut du dernier cycle vérifiés séparément. [Bilan détaillé](apres/validation-lot-a.md). Build et `npm test` verts : 17/17 configurations, 136 captures dans [apres/lot-a.md](apres/lot-a.md), sans erreur JS ni débordement horizontal. Smoke ciblé v54/v55 vert. Les lots suivants attendent la revue visuelle de Claude.

### Corrections après revue A1–A12

- A1–A4 : filtres défilants sur une rangée avec recherche et repli global en icônes ; noms limités à une ligne dans les filtres (200 px maximum), deux lignes dans les en-têtes. Nom complet conservé dans les attributs accessibles, y compris lorsqu’il correspond à un mot du dictionnaire de traduction. En-têtes Condensed 700, 20 px, `--ink`. Cercle visuel de 28 px dans une cible de 44 px ; poignée de 16 px, menu sans marge supplémentaire.
- A5 : compteurs et point Focus superposés aux icônes ; espace de bordure réservé aux trois onglets pour aligner leurs libellés.
- A6–A8 : Démarrer fixé au-dessus de la navigation mobile, fond opaque et espacement de 16 px ; durée totale et raccourcis réunis dans une carte ; bandeau initial « 1 h · 2 sessions », barre vide (NL « 1 u · 2 sessies »).
- A9–A12 : « session » dans le bandeau ; heures au format HH:MM ; segments faits en `--app`, futurs en `--surface-2`, pauses représentées par un espace de 4 px. En pause, cadran atténué et libellé placé sous le temps ; Reprendre reste l’action principale.

La rangée de filtres n’utilise plus la classe historique `chips`, dont une règle `overflow-x:visible!important` empêchait le défilement. Aucun ajout de `!important`. Après ces corrections, build et `npm test` réussis (17/17), 136 captures régénérées, smoke ciblé Tâches et Focus sans erreur. Les traitements des tâches, du chrono, de Passer, du journal et les données ne changent pas.

## Claude Code — revue visuelle T16 lot A

Revue des 136 captures (`apres/lot-a.md`), 390 / 320 / 900 / 1280 px, clair et sombre, React et secours, FR / EN / NL. Bonne base : bandeau, bouton Claude, cercles vides/pleins, calendrier à 320 px et chrono sont conformes. React et secours sont identiques. Douze écarts, à corriger avant le lot B. **Aucune fonction n'est retirée** ; ce sont des déplacements, des tailles et des libellés.

| # | Écran | Écart | Correction demandée |
|---|---|---|---|
| A1 | Tâches | Avant la première tâche, on traverse 6 rangées : champ, loupe seule à droite, filtres, catégorie longue, « + Catégorie », « Tout replier » seul à droite. La hiérarchie se perd. | Rangée 1 : champ + micro + « Ajouter ». Rangée 2 : une seule ligne de filtres défilant horizontalement (Toutes, catégories, « + Catégorie » en dernier), avec la loupe en bouton icône au bout. « Tout replier » devient un bouton icône (chevrons) à droite de cette rangée. Plus aucun bouton seul sur sa ligne. |
| A2 | Tâches | Nom de catégorie long : le filtre passe sur 3 lignes à 320 px, l'en-tête de section sur 6 lignes. | Filtre : une ligne, coupé avec « … », largeur max. 200 px, nom complet en `title`/`aria-label`. En-tête : 2 lignes max. avec « … ». |
| A3 | Tâches | En-tête de catégorie en `--muted`, en grand : il paraît désactivé et écrase les tâches. | Barlow Condensed 700, 20 px, `--ink`, droit. Compteur et mini-barre inchangés. |
| A4 | Tâches | À 320 px, poignée + cercle 40 px + « … » ne laissent que 2 mots par ligne. | Cercle visuel 28 px (cible 44 px conservée), poignée 16 px de large, menu « … » cible 44 px sans marge supplémentaire. |
| A5 | Barre du bas | Le compteur est placé sous le libellé : « Tâches » remonte et n'est plus aligné avec « Agenda » et « Focus ». | Les 3 libellés sont sur la même ligne de base. Le compteur devient une pastille en haut à droite de l'icône (`--app`/`--on-app`, 11 px, min. 16 px). Même chose pour le point « Focus en cours ». |
| A6 | Focus · réglage | « Démarrer », le bouton principal, est à moitié caché sous la barre du bas à 390 × 844 (clair, sombre, EN, NL). | « Démarrer » doit être visible sans défiler : bouton collé au-dessus de la barre du bas (fond `--bg`, marge 16 px) tant que le réglage est affiché. |
| A7 | Focus · réglage | « Durée totale » apparaît deux fois, en puces (1 h, 1 h 30…) et en ligne +/−. | Un seul bloc « Durée totale » : la ligne +/−, avec les puces juste dessous dans la même carte, comme raccourcis. « Rythme » ne garde que Travail et Pause. Comportement identique. |
| A8 | Focus · bandeau | Avant le démarrage : « 0 min sur 1 h · cycle 0 sur 2 ». | « 1 h · 2 sessions » (EN « 1 h · 2 sessions », NL « 1 u · 2 sessies »). Barre vide. |
| A9 | Focus | Deux mots pour la même chose : « cycle » dans le bandeau, « session » dans le cadran et le programme. | « session » partout (EN session, NL sessie) : « 5 min sur 1 h · session 1 sur 2 ». Charte § 10 mise à jour. |
| A10 | Focus | « 10h41 fin prévue » : format différent de l'Agenda (16:00). | « 10:41 », en chiffres tabulaires, en FR, EN et NL. Même chose dans « fin à 10h41 » du programme. |
| A11 | Focus · en cours | Sous le cadran, la barre segmentée montre la partie faite en bleu pâle et la partie à venir en bleu plein : c'est l'inverse du bandeau et de la charte. | Fait = `--app`, à venir = piste (`--surface-2`), pause = segment séparé par un vide de 4 px (pas seulement une autre couleur). Même rendu dans le réglage « Programme », où tout est « à venir ». |
| A12 | Focus · en pause | L'état « En pause » ne se distingue que par le libellé, en petit. | Cadran en `--muted` (piste et arc), libellé « En pause » sous le temps, à la place de « Session 1 sur 2 ». Le bouton « Reprendre » reste le principal. |

Non bloquant, à garder pour le lot E : sur ordinateur, la colonne de contenu fait environ 720 px et colle à la barre latérale, avec un grand vide à droite. On harmonisera la largeur de toutes les pages en même temps.

Contrôles à refaire après correction : 320 et 390 px avec catégorie de 80 caractères et 30 tâches ; Focus réglage à 390 × 844 avec « Démarrer » visible ; EN/NL du bandeau Focus.

### Claude Code — contre-revue lot A (après A1–A12)

A1 à A12 sont corrigés et conformes sur les captures (390 / 320 / 1280, clair et sombre, React et secours, EN / NL). **Lot A validé.** Trois retouches mineures, à faire au début du lot B, sans nouvelle revue complète :

| # | Écart | Correction |
|---|---|---|
| A13 | La rangée de filtres coupe net le filtre suivant (« Pr ») contre la loupe : on dirait un bug. | Fondu de 24 px vers `--bg` au bord droit de la zone qui défile, avant la loupe. |
| A14 | Durées écrites de deux façons : « 1h » dans la ligne +/−, « 1 h » dans les puces (NL « 1u » / « 1 u »). | « 1 h » partout, avec une espace insécable fine, en FR, EN et NL. |
| A15 | Réglage Focus à 390 × 844 : le bouton « Démarrer » collé masque la carte « Programme » et son texte. | Marge basse du contenu égale à la hauteur du bouton plus 16 px, pour qu'on puisse faire défiler jusqu'au texte du programme. Vérifier par une capture défilée. |

## Codex — T16 lot B

Musculation, Nutrition et Graphiques intégrés ; les corrections B1–B16 sont prêtes pour contre-revue. Aucun bouton Valider la série ou Repos, aucun déplacement automatique de focus. La saisie, `msRunTouch`, `msTT`, `msDone`, `msAutoLog`, les données de santé, le chiffrement et le connecteur restent inchangés.

### Corrections B1–B16 après revue

- B1–B3 : champs de série sur `--surface` / `--ink`, unités permanentes, coche de 16 px alignée avec le libellé ; séparateur retiré. Libellé ≥ 64 px, champs ≥ 72 px ; à 320 px, la commande de retrait passe sous le libellé. Le contour de la série suivante reste purement visuel.
- B4–B7 : objectifs en grille 2 × 2 sans troncature ; titres en `--ink` ; titre de séance sur deux lignes, métadonnées dessous et corbeille alignée en haut. Boutons secondaires pleins, sans pointillés ni « + » tapé.
- B8–B9 : heure réelle à la place des initiales pour les repas du journal (le moment du repas n’y est pas enregistré), icône du moment pour les menus. Titre limité à deux lignes en pleine largeur, puis kcal et commandes. Les vraies vignettes photo restent présentes. Format numérique partagé React/secours : regroupement fin insécable et virgule décimale en FR/NL, virgule de milliers et point décimal en EN. Les valeurs de saisie et les données restent inchangées.
- B10–B14 : sélections pleines, coche SVG pour les repas multiples, chevrons et +/− en SVG, retrait d’un sport à 44 px et libellés alignés. Légende calories sans glyphes et axes sans abréviation K.
- B15–B16 : marge Focus déplacée après tout le contenu, seulement pendant le réglage ; segments à venir sur `--field-line` (contraste de la charte). Texte indicatif du poids réduit à « kg », libellé conservé au-dessus.

Les parcours ajoutent un repas au titre long, la vue de sa ligne entière, le dialogue de copie, les contrôles de collations et le formulaire avec un sport ajouté/retiré. Ils vérifient aussi les dimensions des séries et du retrait d’un sport, les valeurs localisées et les axes.

Build et `npm test` complets **17/17**, incluant Tâches et Focus, puis contrôle du lot B **17/17** après harmonisation du calendrier. Parité ciblée v50, v51, v55, v56, v58 et v59 : aucune erreur. **306 captures** actualisées dans [apres/lot-b.md](apres/lot-b.md) ; [bilan](apres/validation-lot-b.md). Aucun push et aucun travail sur C avant la contre-revue.

## Claude Code — revue visuelle T16 lot B

Revue des 272 captures (`apres/lot-b.md`) à 390, 320 et 1280 px, en clair et en sombre, React et secours, FR, EN et NL.

Ce qui est conforme :
- texte foncé sur orange partout et bouton Claude ;
- macros lisibles et feuille « Ajouter un repas » avec les 5 façons d'ajouter ;
- états des séries (complète, suivante, à venir) et barre de séance ;
- couleurs des graphiques ;
- React et secours identiques ;
- A13 et A14 corrigés.

Le bouton « Repos 1:30 » est en cours de retrait (décision déjà transmise). Seize écarts restent, à corriger avant le lot C. Aucune fonction n'est retirée.

| # | Écran | Écart | Correction demandée |
|---|---|---|---|
| B1 | Musculation · séries | Série faite : les champs gardent une bordure orange foncé sur fond orange, et l'unité disparaît (« 60 », « 8 »). La coche fait 10 px au-dessus de « Série 1 ». | Les champs d'une série faite ont le fond `--surface` et le texte `--ink`, sans bordure orange. L'unité est toujours visible (« 60 kg », « 8 reps »). La coche fait 16 px, sur la même ligne que « Série 1 ». |
| B2 | Musculation · séries | Le séparateur entre kg et reps est un tiret « – » serré. À 320 px, « Série 3 » est coupé par le champ. | Plus de séparateur : les unités suffisent. La colonne de libellé fait 64 px minimum. À 320 px, les champs passent à 72 px. |
| B3 | Musculation · séries | Série suivante : contour orange plus contour blanc épais sur le champ kg, ce qui fait deux contours. Confirme qu'il ne s'agit **pas** d'un focus réel : sur iPhone, il ouvrirait le clavier. | Un seul contour de 2 px `--app-ink` sur la carte de la série. Les champs gardent leur bordure normale (`--field-line`). |
| B4 | Musculation · objectif | « Prise de ma… » est coupé. | Grille 2 × 2 de largeurs égales (Force, Prise de masse, Sèche, Endurance), libellés jamais coupés. Sélection pleine `--app` / `--on-app`. |
| B5 | Musculation | « Mes séances » est en `--muted`, comme A3 au lot A. Même chose pour « Bilan » (Graphiques) et le titre de la feuille « Ajouter un repas ». | Titres de section et de feuille en `--ink`, partout dans l'app. |
| B6 | Musculation · séance | Carte de séance : l'étiquette « Poussée » flotte, la corbeille chevauche le titre, le chevron est en bas à gauche. | Ligne 1 : chevron, titre sur 2 lignes maximum avec « … », menu ou corbeille alignés en haut à droite. Ligne 2 : étiquette et méta en `--muted`. |
| B7 | Boutons pointillés | « Ajouter un exercice », « Modifier mon profil » et « + Ajouter un sport » sont en pointillés (retirés au T13). Le « + » de « Ajouter un sport » est un caractère. | Bouton secondaire plein (`--surface-2`) avec l'icône SVG « plus ». |
| B8 | Nutrition · journée | Ligne de repas sur mobile : un monogramme « RP » ou « BC » sans sens, et le titre sur 4 lignes, écrasé par les kcal et 2 boutons. | Pas de monogramme : l'icône du moment du repas (petit-déj, déjeuner, collation, dîner), ou l'heure s'il n'y en a pas. Titre sur 2 lignes maximum, en pleine largeur. Dessous : « 650 kcal » à gauche, boutons copier et modifier à droite (cibles de 44 px). Même ordre que sur ordinateur. |
| B9 | Nutrition | Nombres sans séparateur de milliers (« 650 / 2400 kcal », « reste 1750 »), alors que Menus écrit « 2 400 ». Décimales avec un point dans l'analyse (« 3.7 g », « 21.3 g »). | Format de la langue partout : « 2 400 », « 3,7 g » en FR et NL, « 2,400 » et « 3.7 g » en EN, avec espace fine insécable. Bandeau, anneau, analyse, Profil et axes des graphiques compris. |
| B10 | Sélections | Sont sélectionnés par un simple contour : « Mois » (Semaine/Mois/Année), « 7 jours » (Graphiques), « Journée » (Menus), les cases « Petit-déjeuner »… et « Homme » (Profil, fond brun). | Même règle qu'aux T13 et A : sélection pleine `--app` / `--on-app`, avec en plus une coche pour les choix multiples. Segments : fond `--surface-2`, segment choisi plein. |
| B11 | Nutrition · calendrier | Les flèches du mois sont des caractères « ‹ › » plus petits que les autres. | Icônes chevron SVG, cible de 44 px, comme les flèches du jour juste au-dessus. |
| B12 | Menus | Les « − 0 + » de Collations sont des caractères, pas des boutons. | Boutons +/− identiques à ceux de Focus (44 px, icônes SVG). |
| B13 | Profil | Croix de retrait d'un sport : environ 20 px, caractère « × ». « Fois par semaine » et « Durée d'une séance » ne sont pas alignés. | Bouton icône de 44 px. Libellés au-dessus des champs, alignés en haut, sur 1 ligne (ou 2 lignes avec une hauteur réservée). |
| B14 | Graphiques · calories | Légende avec les caractères ✓ ↓ ↑. Axe en « 3K 2K 1K ». | Légende : carrés de couleur plus libellés, sans glyphe. Axe : « 3 000 / 2 000 / 1 000 » au format de la langue. |
| B15 | Focus · réglage (A15) | La marge basse est ajoutée entre Programme et Musique, ce qui laisse un grand vide au milieu. Les segments « à venir » du programme sont presque invisibles en sombre. | La marge va en fin de page uniquement. Segments du programme en `--field-line` (au moins 3:1), le vide de 4 px reste entre les segments. |
| B16 | Graphiques · Poids | À 320 px, le texte indicatif est coupé (« Poids du jou »). | Texte indicatif « kg », ou libellé seul au-dessus du champ, déjà présent (« Poids du jour »). |

Contrôles à refaire : 320 et 390 px pour Musculation (séries), Nutrition (journée avec un repas au titre de 80 caractères, analyse), Menus, Profil (formulaire) et Graphiques calories ; FR et EN pour les nombres.

### Claude Code — contre-revue lot B (après B1–B16)

B1 à B16 sont conformes sur les 306 captures. **Le lot B est validé.** Trois retouches mineures restent, à faire au début du lot C sans nouvelle revue complète :

| # | Écart | Correction |
|---|---|---|
| B17 | Avec B9, l'espace entre un nombre et son unité a disparu : « 2 400kcal », « 140g », « 3,7g » (EN « 2,400kcal », « 3.7g »). Profil reste en « 1750 », « 2400 ». | Espace fine insécable entre le nombre et l'unité partout (« 2 400 kcal », « 140 g », « 3,7 g »). Séparateur de milliers aussi dans Profil. |
| B18 | À 320 px, la croix de retrait d'une série passe sous « Série 1 ». | La croix reste en haut à droite de la carte, sur la ligne du libellé, avec les champs pleine largeur en dessous. |
| B19 | Champ reps actif : l'anneau de focus n'entoure que le chiffre et coupe l'unité (« 10\|reps »). | L'anneau de focus (charte § 9) entoure tout le champ, unité comprise (`:focus-within` sur le conteneur). |


## Codex — T16 lot C

Notes, Documents et Mots de passe sont prêts pour revue. [Galerie : 363 captures](apres/lot-c.md) · [validation et journaux](apres/validation-lot-c.md).

- B17–B19 : unités séparées par une espace fine insécable et milliers dans Profil ; croix de série en haut à droite à 320 px ; anneau sur le champ entier, unité comprise. Aucun focus automatique.
- Notes : dossiers neutres et noms longs sur deux lignes, titres/prévisualisations lisibles, recherche et actions distinctes. L’éditeur garde l’identité Sid Coffre et Claude ; le bandeau et toutes les commandes restent fixes pendant le défilement. Les deux rangées d’outils peuvent défiler horizontalement. Les listes, photos, mise en forme, déplacements, notes secrètes et imports sont conservés.
- Documents : classeurs avec compteur non coupé, sélection pleine, lignes avec titre sur deux lignes et actions de 44 px ; mode d’emploi du scanner après la liste. Import, scan, classement, recherche, partage et lecteur conservés. Les titres de classeur avec guillemets/chevrons sont échappés correctement dans React comme dans le secours.
- Coffre : code à cinq chiffres, listes, champs et commandes reprennent Élan. Mot de passe système monospace. Déverrouillage, phrase secrète, Face ID et chiffrement inchangés. PDF : outils sélectionnés en plein, absence d’ombres décoratives, cibles de 44 px ; les poignées gardent un repère visuel de 24 px.

Build réussi. Parcours complet **17/17**, puis nouveau passage C **17/17** après les dernières retouches ; parité FR/EN verte. Les essais utilisent de vrais coffres v2 sur le backend fictif et vérifient le PDF chiffré, l’édition d’une note secrète sans titre en clair et la relecture du mot de passe après verrouillage. Payload inchangé au rendu et hors des actions exercées.

Smoke étendu : les différences de balisage révélées dans Graphiques, Nutrition, classeurs et photos sont corrigées et les sections concernées repassent. Comparaison finale : **mêmes 17 messages historiques hors CSP, aucun nouveau** ; v65 comparé directement au HEAD servi séparément, mêmes résultats. Les gestes de son test font défiler le papier pour rester dans la surface visible sous les commandes de 44 px. Le test d’origine et la CSP restent inchangés.

Captures locales ; clavier simulé et aucun nouvel essai sur iPhone réel. Aucun commit ni push par Codex. Pas de lot D avant la revue.

## Claude Code — revue visuelle T16 lot C

Revue des 363 captures (`apres/lot-c.md`) à 390, 320 et 1280 px, en clair et en sombre, React et secours, FR, EN et NL.

Ce qui est conforme :
- violet avec texte blanc, bouton Claude, barre du bas ;
- clavier du code à 5 chiffres, lisible et de grande taille ;
- mot de passe affiché dans une police à chasse fixe (on distingue bien l, 1, 0 et O) ;
- lecteur PDF plein écran ;
- note secrète bien signalée.

Treize écarts restent, à corriger avant le lot D. **Aucun changement de comportement ni de chiffrement** : uniquement la disposition, les libellés et les icônes.

| # | Écran | Écart | Correction demandée |
|---|---|---|---|
| C1 | Bandeau | Documents et Mots de passe affichent « 33 notes · 31 documents », le chiffre de Notes. Les chiffres varient aussi d'un écran à l'autre (33 puis 34). | Un chiffre propre à chaque écran : Notes « 33 notes », Documents « 31 documents · 363 Ko », Mots de passe « 12 mots de passe », ou « Verrouillé » tant que le code n'est pas saisi (sans révéler de nombre si celui-ci n'est pas lisible sans le code). |
| C2 | Champs de recherche (Notes, Documents, Mots de passe) | Le texte indicatif est décalé de 38 px vers la droite, la place d'une icône absente. Le libellé et le texte indicatif sont identiques. | Icône loupe SVG dans cet espace, en `--muted`. Le texte indicatif devient « Titre, contenu… » (Notes), « Nom du document » et « Site ou identifiant ». |
| C3 | Notes · liste à 390 px | « Ajouter une note » passe sur 2 lignes dans un bouton étroit, à côté de « Dossier » et « PDF ». | Comme à 320 px : « Ajouter une note » en pleine largeur, puis « Dossier » et « Importer un PDF » côte à côte en secondaire. Icônes alignées sur la ligne de base du texte (aussi pour Importer et Scanner dans Documents). |
| C4 | Notes · dossiers | Le chiffre « 1 » ou « 0 » est seul sur sa ligne sous le titre. | Une seule ligne de méta en `--muted` : « 1 note », « 6 notes » ou « Vide ». |
| C5 | Notes · éditeur | Le titre est coupé (« pour la proct »). Sur ordinateur aussi. | Le champ titre passe sur plusieurs lignes et grandit avec le texte, jusqu'à 3 lignes. |
| C6 | Notes · éditeur, contenu long et clavier | Deux traits verticaux blancs de 1 px encadrent la zone de texte sur toute sa hauteur. | Retirer cette bordure : la zone de texte n'a pas de bord, la carte suffit. |
| C7 | Rangées qui défilent | Les outils PDF (« Mes notes » coupé), la barre de mise en forme (« ⋮ » coupé) et les filtres de Documents (« + Class ») sont coupés net. | Même fondu que A13, partout où une rangée défile. |
| C8 | PDF · Mes notes | Le panneau « Mes notes sur ce PDF » dépasse à droite à 390 px : sa bordure est coupée. | Largeur 100 % avec `box-sizing: border-box` et la même marge que le reste. Vérifier aussi à 320 px. |
| C9 | Fermetures | Les fenêtres « Notes secrètes » et la note posée sur un PDF se ferment par un caractère « × » d'environ 16 px. | Icône SVG de fermeture avec une cible de 44 px, comme les autres feuilles. Sur le PDF, l'icône peut rester petite (20 px) mais la cible fait 44 px. |
| C10 | Scanner | « ◎ Prendre une photo » utilise un caractère. « Document / Couleur » n'est sélectionné que par un contour. | Icône appareil photo SVG. Sélection pleine (règle B10). |
| C11 | Documents · liste | Chaque document occupe environ 160 px : poignée, titre sur 2 lignes, classeur sur 2 lignes, puis une ligne à part pour Partager et Modifier. Il n'en tient que 3 par écran. | Titre sur 2 lignes maximum. Méta sur 1 ligne : « 1 page · 12 Ko · Administratif… ». Les boutons Partager et Modifier (44 px) vont à droite, dans la colonne du titre, alignés en haut. Objectif : environ 88 px par document. |
| C12 | Mots de passe · liste | Les points du mot de passe et les 3 boutons sont sur 2 lignes séparées. | Une seule ligne : les points à gauche, les boutons Afficher, Copier et Modifier à droite. |
| C13 | Mots de passe · formulaire | « Cacher » et « Générer » sont collés l'un à l'autre et au champ. « Enregistrer » est aligné à gauche, pas en pleine largeur. | « Cacher » devient le bouton icône œil, à l'intérieur du champ. « Générer » passe en secondaire, avec 8 px d'écart. « Enregistrer » en pleine largeur, en bas, comme dans les autres feuilles. Même style de segments pour « Récents / A → Z » dans Documents et dans Mots de passe. |

Contrôles à refaire : 390 et 320 px pour Notes (liste, éditeur avec un titre de 80 caractères), Documents (liste de 31, scanner), Mots de passe (liste, formulaire) et PDF (Mes notes) ; un écran en EN.

## Claude Code — T16 lots D et E (reprise après l'épuisement du quota de Codex)

Décision de Sid du 6 nov. (« continue toi-même ») : Claude Code reprend les lots D et E dans le worktree `refonte-tech`, et Codex ne le modifie plus. Avant la reprise, un point de sauvegarde local a été fait (commit `2acd82c`, lots A à C, sans push).

**Fin du lot C.** C6 : l'anneau de focus qui encadrait toute la hauteur de la note (les deux traits blancs) est retiré ; le curseur suffit. Le test `elan-lot-c` est mis à jour. Les autres points de C1 à C13 sont vérifiés sur les captures de Codex.

**Retouches du lot B (B17).** L'espace fine U+202F fait 2 px en Barlow, presque invisible (« 2400kcal », « 140g »). Elle est remplacée par l'espace insécable U+00A0, entre le nombre et l'unité comme pour les milliers. Cela touche `fmtFull` et `fmtN` (shell et `format.ts`) et 12 fichiers. Les assertions des lots A et B sont ajustées.

**Lot D (suite)**

- **Conversation Claude.** Choix de Sid : une ligne repliée en bas d'Agenda, Musculation, Nutrition et Notes.
  - Les 4 champs de Réglages › Claude › Avancé sont retirés.
  - `convSettings(t)` mène désormais à la ligne de l'app concernée.
  - L'état « reliée » est affiché sans glyphe.
  - La donnée `aiConv`, le refus des liens `/share/`, les projets et « Retirer » sont inchangés.
  - Les attentes du smoke historique (v44, v46.1, v74.2) sont adaptées dans `smoke-elan.cjs`.
- **Réglages.**
  - Une carte par sujet, sans carte dans la carte, avec des lignes de 56 px.
  - Bouton secondaire plein partout ; les suppressions gardent leur contour rouge.
  - « Reverrouiller le coffre » s'affiche en puces qui passent à la ligne, et les liens légaux passent à la ligne.
  - « Avancé » a un chevron dessiné.
  - Le bandeau de la suite passe en `--surface-2` : il ne fait plus de bloc clair sur fond sombre.
- **Sélections pleines.** Elles s'appliquent partout : segments, puces, onglets de connexion, langue et thème de la présentation (règle B10, ajoutée à la charte § 8).
- **Connexion.** Les icônes des atouts ont la couleur de leur app.
- **Présentation.** Les flèches sont dessinées (« Suivant » et « Précédent » sont traduits en EN et NL) ; « C'est parti » est en bouton principal.
- **Fenêtres.** La croix de fermeture est dessinée, avec une cible de 44 px, dans les 16 feuilles.

**Lot E (nettoyage)**

- **Glyphes.** Les glyphes ✓ ↻ ‹ › × ＋ utilisés comme icônes (shell, îlots React, `index.html`) sont remplacés par la famille au trait. On utilise `GI(nom)` ou `<span class="gi gi-…">` : un masque CSS avec les tracés de `ICS`, au format data: (autorisé par la CSP `img-src`). Seuls restent des signes de texte : « 4 × 8 », « Paramètres → Connecteurs », « ⋮ » qui désigne le menu de Chrome dans l'aide à l'installation, et le « + » d'un texte indicatif.
- **Polices.** Les 10 familles retirées (Archivo, Fraunces, IBM Plex Mono, Instrument Sans, Instrument Serif, Inter Tight, JetBrains Mono, Manrope, Newsreader, Public Sans) perdent leurs règles et leurs 34 fichiers, ainsi que les anciens fichiers Barlow Condensed qui n'étaient plus référencés. Le dossier `site/fonts` passe de 1,6 Mo à 380 Ko. Les pages légales utilisent Barlow et les couleurs de la charte. Un relevé des polices calculées sur les 12 vues, la connexion, la présentation et les 3 pages légales ne trouve que Barlow et Barlow Condensed.
- **CSS.** `design.css` est regroupé dans `app.css`, dans le même ordre de cascade, et son lien est retiré. 534 règles mortes (`[data-ds="edito"]`, `[data-fx]`) sont retirées. `ident.css` est supprimé.
- **Version.** Version 75.1 (`APP_V`, pied de Réglages). Le cache `sw.js` passe à `sidnote-v75-1`, et `design.css` et `ident.css` sortent de la liste du cache.

**Inchangé.** Données, chiffrement, coffre, code à 5 chiffres, Face ID, sauvegarde, `mcp` et connecteur « Sid'note », clés `sidnote-*`, CSP, Supabase.

**Vérifications** : voir « Résultats » ci-dessous.

**Résultats (6 nov.)**

- **Tests de l'app.** `npm test` est vert : chiffrement, mémoire, fusion, rappels, `app.js` conforme aux sources, version de l'app identique au cache (nouveau contrôle), puis **17/17 configurations**. Les configurations couvrent React et la version de secours, 320, 390, 900 et 1280 px, le clair et le sombre, en FR, EN et NL, avec les parcours des lots A, B et C.
- **Comparaison avec le point de sauvegarde `2acd82c`.** Le smoke historique est décomposé en 23 sections et tourne sur les deux versions avec le même faux backend. Il relève **les mêmes 17 messages hors CSP, aucun nouveau** (`apres/lot-de-smoke-comparaison.json`). Le message CSP `unsafe-eval` du lecteur PDF apparaît de façon variable sur les deux versions.
- **Régression trouvée et corrigée.** `BUILD` (dans `46-demarrage.js`) n'avait pas suivi le cache de `sw.js`. L'app se serait donc rechargée une fois au démarrage. `tests/shell.test.js` vérifie désormais l'égalité des deux.
- **Écarts de parité corrigés.** Les écarts entre React et la version de secours (`↻ Autre idée`, `↻ Recalculer`, `＋ Ajouter à ma journée`, la coche du total du menu) sont corrigés : les îlots produisent désormais le même DOM, soit l'icône suivie d'un seul nœud de texte.
- **Instabilités connues, sans lien avec la refonte.** Deux tests sont instables : la saisie du deuxième mot de passe dans le smoke (la feuille n'est pas fermée au bout de 300 ms), qui bloque aussi le point de sauvegarde, et l'anneau B19 à 320 px en clair, qui passe à la relance.
- **Limites.** Il n'y a pas encore eu d'essai sur un vrai iPhone avec cette version. Le clavier n'est que simulé.
