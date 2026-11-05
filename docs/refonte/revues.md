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
