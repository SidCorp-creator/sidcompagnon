# T16 — lot B : contre-revue B1–B16

État : prêt pour la contre-revue de Claude. Aucun push, lot C non commencé.

Les corrections sont détaillées dans la section Codex de [revues.md](../revues.md). Tâches/Focus conservent la validation du lot A ; la réserve A15/B15 de Focus est corrigée : marge à la fin de la page et segments du programme sur `--field-line`.

Musculation garde la saisie et le journal automatiques. Les séries sont présentées comme complètes, suivante ou à venir, sans bouton de validation ni de Repos et sans focus automatique. Les valeurs de saisie restent brutes ; les unités sont permanentes. Les quatre objectifs courants occupent la grille 2 × 2 ; une ancienne valeur d’objectif reste reconnue si elle est déjà enregistrée.

Nutrition garde les cinq entrées derrière Ajouter un repas, les photos, les commandes de copie/modification/suppression, menus et profil. Le journal affiche l’heure réelle à la place d’un monogramme (aucun moment de repas n’est enregistré dans ce format de données). Les menus utilisent l’icône de leur moment connu. Les titres longs sont limités à deux lignes avec le nom complet disponible dans leur attribut de titre. Les chiffres sont formatés à l’affichage, sans écriture de valeurs localisées dans les données ou les champs.

Les tracés et calculs des graphiques restent identiques, avec [les jetons mesurés](../palette-graphiques.md). Les axes affichent les milliers complets au format de la langue ; la légende calories conserve ses carrés et textes sans glyphes.

## Vérifications

- Build réussi : [journal](lot-b-build.log).
- `npm test` complet : **17/17**, comprenant le parcours T13, Tâches/Focus et le lot B : [journal](lot-b-test.log).
- Après la dernière harmonisation des libellés du calendrier, `ELAN_LOT_B_ONLY=1 npm test` : **17/17** : [journal final](lot-b-test-final.log).
- Smoke ciblé : [calendrier v50](lot-b-smoke-calendrier.log), [graphiques v51](lot-b-smoke-graphiques.log), [Musculation/Focus v55](lot-b-smoke-muscu-focus.log), [Nutrition v56](lot-b-smoke-nutrition.log), [menus v58](lot-b-smoke-menus.log), [profil/copie v59](lot-b-smoke-profil-copie.log) : aucune erreur. `tests/smoke.js` reste intact ; le lanceur adapté rend accessibles les commandes déplacées dans la feuille.
- **306 captures** : [galerie](lot-b.md), [manifest](lot-b-manifest.json). React/secours, 320/390/1280 px, tablette 900 px, clair/sombre et FR/EN/NL. Aucune erreur JS ni débordement horizontal.

Les assertions vérifient la conservation du payload complet hors UI pendant les rendus seuls, puis celle des domaines non concernés après les interactions. Elles couvrent les séries et leur journal, l’absence de focus automatique, les dimensions 64/72/44 px, les objectifs non coupés, les cinq entrées de repas, les formats de milliers/décimales/axes, les collations, l’ouverture de copie sans écriture, le sport ajouté/retiré du formulaire et le calendrier.

Le backend et les réponses Nutrition sont fictifs ; les captures restent locales et le clavier est simulé par un viewport de 440 px. Aucun nouvel essai sur iPhone réel. Le smoke complet, comparé au rouge historique, reste prévu à la fin du lot E.
