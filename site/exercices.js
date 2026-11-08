// sid'fit : liste des exercices proposés (seule source : générateur de programmes, suggestions, « Changer » en séance,
// message envoyé à Claude et connecteur Sid'note, qui relit ce fichier en ligne).
// Pour modifier la liste : changer ce fichier seulement. Le contenu entre les accolades doit rester du JSON valide
// (guillemets doubles, pas de virgule en trop, pas de commentaire à l'intérieur).
// Tout autre exercice reste possible, mais seulement tapé à la main : il n'est jamais suggéré ni mis dans un programme.
//
// Champs d'un exercice :
//   nom      nom affiché
//   p        true = prioritaire (P) : proposé en premier dans son groupe musculaire
//   schema   schéma de mouvement (deux exercices du même schéma pour le même muscle ne vont pas dans la même séance)
//   type     H polyarticulaire très lourd, C polyarticulaire chargé, I isolation (sert au repos et au nombre de séries)
//   materiel g salle, d haltères (maison), b poids du corps
//   zones    s épaules, b bas du dos, k genoux (évité si la personne veut ménager cette zone)
//   note     consigne affichée avec l'exercice (facultatif)
// v77 : needs = alternatives de matériel (OU entre listes, ET dans une liste). Une liste vide = sans matériel.
// v79 : id stable ; aliases explicites ; help=false = fiche en préparation, exercice toujours disponible.
// v79 : id stable ; aliases explicites ; help=false = fiche en préparation, exercice toujours disponible.
window.SIDFIT_EXERCICES = {
  "version": 3,
  "groupes": [
    {
      "muscle": "chest",
      "nom": "Pectoraux",
      "exercices": [
        {
          "nom": "Développé couché haltères",
          "schema": "hpress",
          "type": "C",
          "materiel": "gd",
          "zones": "sw",
          "needs": [
            [
              "dumbbells",
              "bench"
            ]
          ],
          "loadable": true,
          "id": "developpe-couche-halteres",
          "aliases": [
            "Dumbbell bench press"
          ],
          "help": true,
          "en": "Dumbbell bench press"
        },
        {
          "nom": "Chest press machine",
          "schema": "hpress",
          "type": "C",
          "materiel": "g",
          "zones": "w",
          "needs": [
            [
              "machines"
            ]
          ],
          "loadable": true,
          "id": "chest-press-machine",
          "aliases": [
            "Machine chest press"
          ],
          "help": true,
          "en": "Machine chest press"
        },
        {
          "nom": "Développé incliné à la Smith",
          "schema": "ipress",
          "type": "C",
          "materiel": "g",
          "zones": "sw",
          "needs": [
            [
              "machines",
              "bench"
            ]
          ],
          "loadable": true,
          "id": "developpe-incline-a-la-smith",
          "aliases": [
            "Smith machine incline bench press"
          ],
          "help": true,
          "en": "Smith machine incline bench press"
        },
        {
          "nom": "Pec deck",
          "schema": "fly",
          "type": "I",
          "materiel": "g",
          "zones": "w",
          "needs": [
            [
              "machines"
            ]
          ],
          "loadable": true,
          "id": "pec-deck",
          "aliases": [
            "Pec deck fly"
          ],
          "help": true,
          "en": "Pec deck fly"
        },
        {
          "nom": "Dips lestés",
          "schema": "low",
          "type": "C",
          "materiel": "gb",
          "zones": "s",
          "needs": [
            [
              "dipstation"
            ]
          ],
          "loadable": true,
          "id": "dips-lestes",
          "aliases": [
            "Weighted chest dips"
          ],
          "help": true,
          "en": "Weighted chest dips"
        },
        {
          "nom": "Pompes au mur",
          "en": "Wall push-ups",
          "schema": "hpress",
          "type": "L",
          "materiel": "b",
          "zones": "sw",
          "needs": [
            []
          ],
          "loadable": false,
          "difficulty": "easy",
          "id": "pompes-au-mur",
          "aliases": [
            "Wall push-ups"
          ],
          "help": true
        },
        {
          "nom": "Pompes sur les genoux",
          "en": "Knee push-ups",
          "schema": "hpress",
          "type": "L",
          "materiel": "b",
          "zones": "swk",
          "needs": [
            []
          ],
          "loadable": false,
          "difficulty": "easy",
          "id": "pompes-sur-les-genoux",
          "aliases": [
            "Knee push-ups"
          ],
          "help": true
        },
        {
          "nom": "Pompes au sol",
          "en": "Push-ups",
          "schema": "hpress",
          "type": "L",
          "materiel": "b",
          "zones": "sw",
          "needs": [
            []
          ],
          "loadable": false,
          "difficulty": "standard",
          "id": "pompes-au-sol",
          "aliases": [
            "Push-ups"
          ],
          "help": true
        }
      ]
    },
    {
      "muscle": "back",
      "nom": "Dos (tirage vertical)",
      "exercices": [
        {
          "nom": "Tractions pronation lestées",
          "schema": "vpull",
          "type": "C",
          "materiel": "gb",
          "zones": "sw",
          "needs": [
            [
              "pullup"
            ]
          ],
          "loadable": true,
          "id": "tractions-pronation-lestees",
          "aliases": [
            "Weighted overhand pull-ups"
          ],
          "help": true,
          "en": "Weighted overhand pull-ups"
        },
        {
          "nom": "Tractions prise neutre",
          "schema": "vpull",
          "type": "C",
          "materiel": "gb",
          "zones": "w",
          "needs": [
            [
              "pullup"
            ]
          ],
          "loadable": true,
          "id": "tractions-prise-neutre",
          "aliases": [
            "Neutral-grip pull-ups"
          ],
          "help": true,
          "en": "Neutral-grip pull-ups"
        },
        {
          "nom": "Tractions prise large",
          "schema": "vpull",
          "type": "C",
          "materiel": "gb",
          "zones": "sw",
          "needs": [
            [
              "pullup"
            ]
          ],
          "loadable": true,
          "id": "tractions-prise-large",
          "aliases": [
            "Wide-grip pull-ups"
          ],
          "help": true,
          "en": "Wide-grip pull-ups"
        }
      ]
    },
    {
      "muscle": "back",
      "nom": "Dos (autres)",
      "exercices": [
        {
          "nom": "Pull-over à la poulie",
          "schema": "pullover",
          "type": "I",
          "materiel": "g",
          "zones": "sw",
          "needs": [
            [
              "cables"
            ]
          ],
          "loadable": true,
          "id": "pull-over-a-la-poulie",
          "aliases": [
            "Straight-arm cable pulldown"
          ],
          "help": true,
          "en": "Straight-arm cable pulldown"
        },
        {
          "nom": "Rowing avec appui",
          "schema": "hrow",
          "type": "C",
          "materiel": "gd",
          "zones": "w",
          "needs": [
            [
              "dumbbells",
              "bench"
            ]
          ],
          "loadable": true,
          "id": "rowing-avec-appui",
          "aliases": [
            "Chest-supported dumbbell row"
          ],
          "help": true,
          "en": "Chest-supported dumbbell row"
        },
        {
          "nom": "Tirage poulie basse assis",
          "schema": "hrow",
          "type": "C",
          "materiel": "g",
          "zones": "w",
          "needs": [
            [
              "cables"
            ]
          ],
          "loadable": true,
          "id": "tirage-poulie-basse-assis",
          "aliases": [
            "Seated cable row"
          ],
          "help": true,
          "en": "Seated cable row"
        },
        {
          "nom": "Rowing machine convergente",
          "schema": "hrow",
          "type": "C",
          "materiel": "g",
          "zones": "w",
          "needs": [
            [
              "machines"
            ]
          ],
          "loadable": true,
          "id": "rowing-machine-convergente",
          "aliases": [
            "Converging machine row"
          ],
          "help": true,
          "en": "Converging machine row"
        },
        {
          "nom": "T-bar avec appui poitrine",
          "schema": "hrow",
          "type": "C",
          "materiel": "g",
          "zones": "w",
          "needs": [
            [
              "machines"
            ]
          ],
          "loadable": true,
          "id": "t-bar-avec-appui-poitrine",
          "aliases": [
            "Chest-supported T-bar row"
          ],
          "help": true,
          "en": "Chest-supported T-bar row"
        },
        {
          "nom": "Élévations en W au sol",
          "en": "Prone W raises",
          "schema": "hrow",
          "type": "L",
          "materiel": "b",
          "zones": "bs",
          "needs": [
            []
          ],
          "loadable": false,
          "id": "elevations-en-w-au-sol",
          "aliases": [
            "Prone W raises"
          ],
          "help": true
        },
        {
          "nom": "Rowing haltères buste penché",
          "en": "Bent-over dumbbell row",
          "schema": "hrow",
          "type": "C",
          "materiel": "gd",
          "zones": "bswh",
          "needs": [
            [
              "dumbbells"
            ]
          ],
          "loadable": true,
          "id": "rowing-halteres-buste-penche",
          "aliases": [
            "Bent-over dumbbell row"
          ],
          "help": true
        },
        {
          "nom": "Rowing élastique assis",
          "en": "Seated resistance-band row",
          "schema": "hrow",
          "type": "L",
          "materiel": "gd",
          "zones": "bw",
          "needs": [
            [
              "bands"
            ]
          ],
          "loadable": true,
          "id": "rowing-elastique-assis",
          "aliases": [
            "Seated resistance-band row"
          ],
          "help": true
        }
      ]
    },
    {
      "muscle": "traps",
      "nom": "Trapèzes",
      "exercices": [
        {
          "nom": "Shrugs haltères ou machine",
          "schema": "shrug",
          "type": "I",
          "materiel": "gd",
          "zones": "w",
          "needs": [
            [
              "dumbbells"
            ],
            [
              "machines"
            ]
          ],
          "loadable": true,
          "id": "shrugs-halteres-ou-machine",
          "aliases": [
            "Dumbbell or machine shrugs"
          ],
          "help": true,
          "en": "Dumbbell or machine shrugs"
        }
      ]
    },
    {
      "muscle": "shoulders",
      "nom": "Épaules",
      "exercices": [
        {
          "nom": "Shoulder press à la Smith",
          "schema": "ohp",
          "type": "C",
          "materiel": "g",
          "zones": "sw",
          "needs": [
            [
              "machines",
              "bench"
            ]
          ],
          "loadable": true,
          "id": "shoulder-press-a-la-smith",
          "aliases": [
            "Smith machine shoulder press"
          ],
          "help": true,
          "en": "Smith machine shoulder press"
        },
        {
          "nom": "Élévations latérales poulie",
          "p": true,
          "schema": "lat",
          "type": "I",
          "materiel": "g",
          "zones": "w",
          "needs": [
            [
              "cables"
            ]
          ],
          "loadable": true,
          "id": "elevations-laterales-poulie",
          "aliases": [
            "Cable lateral raise"
          ],
          "help": true,
          "en": "Cable lateral raise"
        },
        {
          "nom": "Élévations latérales haltères",
          "p": true,
          "schema": "lat",
          "type": "I",
          "materiel": "gd",
          "zones": "w",
          "needs": [
            [
              "dumbbells"
            ]
          ],
          "loadable": true,
          "id": "elevations-laterales-halteres",
          "aliases": [
            "Dumbbell lateral raise"
          ],
          "help": true,
          "en": "Dumbbell lateral raise"
        },
        {
          "nom": "Élévations latérales machine",
          "schema": "lat",
          "type": "I",
          "materiel": "g",
          "zones": "w",
          "needs": [
            [
              "machines"
            ]
          ],
          "loadable": true,
          "id": "elevations-laterales-machine",
          "aliases": [
            "Machine lateral raise"
          ],
          "help": true,
          "en": "Machine lateral raise"
        },
        {
          "nom": "Face pull",
          "p": true,
          "schema": "rear",
          "type": "I",
          "materiel": "g",
          "zones": "w",
          "needs": [
            [
              "cables"
            ]
          ],
          "loadable": true,
          "id": "face-pull",
          "aliases": [
            "Cable face pull"
          ],
          "help": true,
          "en": "Cable face pull"
        },
        {
          "nom": "Reverse pec deck",
          "schema": "rear",
          "type": "I",
          "materiel": "g",
          "zones": "w",
          "needs": [
            [
              "machines"
            ]
          ],
          "loadable": true,
          "id": "reverse-pec-deck",
          "aliases": [
            "Reverse pec deck fly"
          ],
          "help": true,
          "en": "Reverse pec deck fly"
        },
        {
          "nom": "Oiseau à la poulie",
          "schema": "rear",
          "type": "I",
          "materiel": "g",
          "zones": "w",
          "needs": [
            [
              "cables"
            ]
          ],
          "loadable": true,
          "id": "oiseau-a-la-poulie",
          "aliases": [
            "Cable rear delt fly"
          ],
          "help": true,
          "en": "Cable rear delt fly"
        },
        {
          "nom": "Écartés élastique devant soi",
          "en": "Band pull-aparts",
          "schema": "rear",
          "type": "L",
          "materiel": "gd",
          "zones": "sw",
          "needs": [
            [
              "bands"
            ]
          ],
          "loadable": true,
          "id": "ecartes-elastique-devant-soi",
          "aliases": [
            "Band pull-aparts"
          ],
          "help": true
        },
        {
          "nom": "Développé épaules haltères debout",
          "en": "Standing dumbbell shoulder press",
          "schema": "ohp",
          "type": "C",
          "materiel": "gd",
          "zones": "bsw",
          "needs": [
            [
              "dumbbells"
            ]
          ],
          "loadable": true,
          "id": "developpe-epaules-halteres-debout",
          "aliases": [
            "Standing dumbbell shoulder press"
          ],
          "help": true
        }
      ]
    },
    {
      "muscle": "biceps",
      "nom": "Biceps",
      "exercices": [
        {
          "nom": "Curl barre EZ",
          "p": true,
          "schema": "curl",
          "type": "I",
          "materiel": "g",
          "zones": "w",
          "needs": [
            [
              "barbell"
            ]
          ],
          "loadable": true,
          "id": "curl-barre-ez",
          "aliases": [
            "EZ-bar curl"
          ],
          "help": true,
          "en": "EZ-bar curl"
        },
        {
          "nom": "Curl incliné haltères",
          "p": true,
          "schema": "stretch",
          "type": "I",
          "materiel": "gd",
          "zones": "sw",
          "needs": [
            [
              "dumbbells",
              "bench"
            ]
          ],
          "loadable": true,
          "id": "curl-incline-halteres",
          "aliases": [
            "Incline dumbbell curl"
          ],
          "help": true,
          "en": "Incline dumbbell curl"
        },
        {
          "nom": "Curl marteau",
          "schema": "hammer",
          "type": "I",
          "materiel": "gd",
          "zones": "w",
          "needs": [
            [
              "dumbbells"
            ]
          ],
          "loadable": true,
          "id": "curl-marteau",
          "aliases": [
            "Dumbbell hammer curl"
          ],
          "help": true,
          "en": "Dumbbell hammer curl"
        },
        {
          "nom": "Curl poulie",
          "schema": "curl",
          "type": "I",
          "materiel": "g",
          "zones": "w",
          "needs": [
            [
              "cables"
            ]
          ],
          "loadable": true,
          "id": "curl-poulie",
          "aliases": [
            "Cable biceps curl"
          ],
          "help": true,
          "en": "Cable biceps curl"
        },
        {
          "nom": "Curl élastique debout",
          "en": "Standing band curl",
          "schema": "curl",
          "type": "I",
          "materiel": "gd",
          "zones": "w",
          "needs": [
            [
              "bands"
            ]
          ],
          "loadable": true,
          "id": "curl-elastique-debout",
          "aliases": [
            "Standing band curl"
          ],
          "help": true
        }
      ]
    },
    {
      "muscle": "triceps",
      "nom": "Triceps",
      "exercices": [
        {
          "nom": "Extension au-dessus de la tête à la poulie",
          "p": true,
          "schema": "oh",
          "type": "I",
          "materiel": "g",
          "zones": "sw",
          "needs": [
            [
              "cables"
            ]
          ],
          "loadable": true,
          "id": "extension-au-dessus-de-la-tete-a-la-poulie",
          "aliases": [
            "Cable overhead triceps extension"
          ],
          "help": true,
          "en": "Cable overhead triceps extension"
        },
        {
          "nom": "Extension poulie haute à la corde",
          "p": true,
          "schema": "push",
          "type": "I",
          "materiel": "g",
          "zones": "w",
          "needs": [
            [
              "cables"
            ]
          ],
          "loadable": true,
          "id": "extension-poulie-haute-a-la-corde",
          "aliases": [
            "Rope triceps pushdown"
          ],
          "help": true,
          "en": "Rope triceps pushdown"
        },
        {
          "nom": "Extension triceps élastique debout",
          "en": "Standing band triceps extension",
          "schema": "push",
          "type": "I",
          "materiel": "gd",
          "zones": "sw",
          "needs": [
            [
              "bands"
            ]
          ],
          "loadable": true,
          "id": "extension-triceps-elastique-debout",
          "aliases": [
            "Standing band triceps extension"
          ],
          "help": true
        }
      ]
    },
    {
      "muscle": "quads",
      "nom": "Quadriceps",
      "exercices": [
        {
          "nom": "Presse à cuisses amplitude limitée",
          "p": true,
          "schema": "squat",
          "type": "C",
          "materiel": "g",
          "zones": "kh",
          "needs": [
            [
              "machines"
            ]
          ],
          "loadable": true,
          "id": "presse-a-cuisses-amplitude-limitee",
          "aliases": [
            "Limited-range leg press"
          ],
          "help": true,
          "en": "Limited-range leg press"
        },
        {
          "nom": "Leg extension charge modérée",
          "p": true,
          "schema": "iso",
          "type": "I",
          "materiel": "g",
          "zones": "kh",
          "needs": [
            [
              "machines"
            ]
          ],
          "loadable": true,
          "id": "leg-extension-charge-moderee",
          "aliases": [
            "Moderate-load leg extension"
          ],
          "help": true,
          "en": "Moderate-load leg extension"
        },
        {
          "nom": "Hack squat amplitude limitée",
          "schema": "squat",
          "type": "C",
          "materiel": "g",
          "zones": "kh",
          "note": "Seulement si sans douleur",
          "needs": [
            [
              "machines"
            ]
          ],
          "loadable": true,
          "id": "hack-squat-amplitude-limitee",
          "aliases": [
            "Limited-range hack squat"
          ],
          "help": true,
          "en": "Limited-range hack squat"
        },
        {
          "nom": "Squat au poids du corps",
          "en": "Bodyweight squat",
          "schema": "squat",
          "type": "L",
          "materiel": "b",
          "zones": "kh",
          "needs": [
            []
          ],
          "loadable": false,
          "id": "squat-au-poids-du-corps",
          "aliases": [
            "Bodyweight squat"
          ],
          "help": true
        },
        {
          "nom": "Goblet squat",
          "en": "Goblet squat",
          "schema": "squat",
          "type": "C",
          "materiel": "gd",
          "zones": "bkh",
          "needs": [
            [
              "dumbbells"
            ],
            [
              "kettlebell"
            ]
          ],
          "loadable": true,
          "id": "goblet-squat",
          "aliases": [],
          "help": true
        }
      ]
    },
    {
      "muscle": "glutes",
      "nom": "Fessiers",
      "exercices": [
        {
          "nom": "Hip thrust machine",
          "schema": "thrust",
          "type": "C",
          "materiel": "g",
          "zones": "h",
          "needs": [
            [
              "machines"
            ]
          ],
          "loadable": true,
          "id": "hip-thrust-machine",
          "aliases": [
            "Machine hip thrust"
          ],
          "help": true,
          "en": "Machine hip thrust"
        },
        {
          "nom": "Abduction hanche machine",
          "schema": "abd",
          "type": "I",
          "materiel": "g",
          "zones": "h",
          "needs": [
            [
              "machines"
            ]
          ],
          "loadable": true,
          "id": "abduction-hanche-machine",
          "aliases": [
            "Machine hip abduction"
          ],
          "help": true,
          "en": "Machine hip abduction"
        },
        {
          "nom": "Pont fessier au sol",
          "en": "Glute bridge",
          "schema": "thrust",
          "type": "L",
          "materiel": "b",
          "zones": "kh",
          "needs": [
            []
          ],
          "loadable": false,
          "id": "pont-fessier-au-sol",
          "aliases": [
            "Glute bridge"
          ],
          "help": true
        },
        {
          "nom": "Abduction de hanche sur le côté",
          "en": "Side-lying hip abduction",
          "schema": "abd",
          "type": "I",
          "materiel": "b",
          "zones": "h",
          "needs": [
            []
          ],
          "loadable": false,
          "id": "abduction-de-hanche-sur-le-cote",
          "aliases": [
            "Side-lying hip abduction"
          ],
          "help": true
        }
      ]
    },
    {
      "muscle": "hams",
      "nom": "Ischios",
      "exercices": [
        {
          "nom": "Leg curl assis",
          "p": true,
          "schema": "curl",
          "type": "I",
          "materiel": "g",
          "zones": "h",
          "needs": [
            [
              "machines"
            ]
          ],
          "loadable": true,
          "id": "leg-curl-assis",
          "aliases": [
            "Seated leg curl"
          ],
          "help": true,
          "en": "Seated leg curl"
        },
        {
          "nom": "Leg curl allongé",
          "schema": "curl",
          "type": "I",
          "materiel": "g",
          "zones": "h",
          "needs": [
            [
              "machines"
            ]
          ],
          "loadable": true,
          "id": "leg-curl-allonge",
          "aliases": [
            "Lying leg curl"
          ],
          "help": true,
          "en": "Lying leg curl"
        },
        {
          "nom": "Charnière de hanches sans charge",
          "en": "Unloaded hip hinge",
          "schema": "hinge",
          "type": "L",
          "materiel": "b",
          "zones": "bh",
          "needs": [
            []
          ],
          "loadable": false,
          "id": "charniere-de-hanches-sans-charge",
          "aliases": [
            "Unloaded hip hinge"
          ],
          "help": true
        },
        {
          "nom": "Soulevé de terre roumain haltères",
          "en": "Dumbbell Romanian deadlift",
          "schema": "hinge",
          "type": "C",
          "materiel": "gd",
          "zones": "bh",
          "needs": [
            [
              "dumbbells"
            ],
            [
              "kettlebell"
            ]
          ],
          "loadable": true,
          "id": "souleve-de-terre-roumain-halteres",
          "aliases": [
            "Dumbbell Romanian deadlift"
          ],
          "help": true
        }
      ]
    },
    {
      "muscle": "adductors",
      "nom": "Adducteurs",
      "exercices": [
        {
          "nom": "Adduction machine",
          "schema": "add",
          "type": "I",
          "materiel": "g",
          "zones": "h",
          "needs": [
            [
              "machines"
            ]
          ],
          "loadable": true,
          "id": "adduction-machine",
          "aliases": [
            "Machine hip adduction"
          ],
          "help": true,
          "en": "Machine hip adduction"
        }
      ]
    },
    {
      "muscle": "calves",
      "nom": "Mollets",
      "exercices": [
        {
          "nom": "Mollets assis",
          "p": true,
          "schema": "seated",
          "type": "I",
          "materiel": "g",
          "zones": "",
          "needs": [
            [
              "machines"
            ]
          ],
          "loadable": true,
          "id": "mollets-assis",
          "aliases": [
            "Seated machine calf raise"
          ],
          "help": true,
          "en": "Seated machine calf raise"
        },
        {
          "nom": "Mollets debout machine",
          "schema": "calf",
          "type": "I",
          "materiel": "g",
          "zones": "",
          "needs": [
            [
              "machines"
            ]
          ],
          "loadable": true,
          "id": "mollets-debout-machine",
          "aliases": [
            "Standing machine calf raise"
          ],
          "help": true,
          "en": "Standing machine calf raise"
        },
        {
          "nom": "Mollets à la presse",
          "schema": "calf",
          "type": "I",
          "materiel": "g",
          "zones": "",
          "needs": [
            [
              "machines"
            ]
          ],
          "loadable": true,
          "id": "mollets-a-la-presse",
          "aliases": [
            "Leg press calf raise"
          ],
          "help": true,
          "en": "Leg press calf raise"
        },
        {
          "nom": "Mollets debout au poids du corps",
          "en": "Standing bodyweight calf raise",
          "schema": "calf",
          "type": "I",
          "materiel": "b",
          "zones": "",
          "needs": [
            []
          ],
          "loadable": false,
          "id": "mollets-debout-au-poids-du-corps",
          "aliases": [
            "Standing bodyweight calf raise"
          ],
          "help": true
        }
      ]
    },
    {
      "muscle": "abs",
      "nom": "Abdos",
      "exercices": [
        {
          "nom": "Crunch à la poulie",
          "p": true,
          "schema": "flex",
          "type": "I",
          "materiel": "g",
          "zones": "",
          "needs": [
            [
              "cables"
            ]
          ],
          "loadable": true,
          "id": "crunch-a-la-poulie",
          "aliases": [
            "Cable crunch"
          ],
          "help": true,
          "en": "Cable crunch"
        },
        {
          "nom": "Dead bug",
          "en": "Dead bug",
          "schema": "brace",
          "type": "L",
          "materiel": "b",
          "zones": "",
          "needs": [
            []
          ],
          "loadable": false,
          "id": "dead-bug",
          "aliases": [],
          "help": true
        },
        {
          "nom": "Planche sur les avant-bras",
          "en": "Forearm plank",
          "schema": "brace",
          "type": "L",
          "materiel": "b",
          "zones": "s",
          "needs": [
            []
          ],
          "loadable": false,
          "id": "planche-sur-les-avant-bras",
          "aliases": [
            "Forearm plank"
          ],
          "help": true
        }
      ]
    }
  ]
};
