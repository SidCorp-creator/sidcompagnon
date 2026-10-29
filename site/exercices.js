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
window.SIDFIT_EXERCICES = {
  "version": 1,
  "groupes": [
    { "muscle": "chest", "nom": "Pectoraux", "exercices": [
      { "nom": "Développé couché haltères", "schema": "hpress", "type": "C", "materiel": "gd", "zones": "s" },
      { "nom": "Chest press machine", "schema": "hpress", "type": "C", "materiel": "g", "zones": "" },
      { "nom": "Développé incliné à la Smith", "schema": "ipress", "type": "C", "materiel": "g", "zones": "s" },
      { "nom": "Pec deck", "schema": "fly", "type": "I", "materiel": "g", "zones": "" },
      { "nom": "Dips lestés", "schema": "low", "type": "C", "materiel": "gb", "zones": "s" }
    ]},
    { "muscle": "back", "nom": "Dos (tirage vertical)", "exercices": [
      { "nom": "Tractions pronation lestées", "schema": "vpull", "type": "C", "materiel": "gb", "zones": "s" },
      { "nom": "Tractions prise neutre", "schema": "vpull", "type": "C", "materiel": "gb", "zones": "" },
      { "nom": "Tractions prise large", "schema": "vpull", "type": "C", "materiel": "gb", "zones": "s" }
    ]},
    { "muscle": "back", "nom": "Dos (autres)", "exercices": [
      { "nom": "Pull-over à la poulie", "schema": "pullover", "type": "I", "materiel": "g", "zones": "s" },
      { "nom": "Rowing avec appui", "schema": "hrow", "type": "C", "materiel": "gd", "zones": "" },
      { "nom": "Tirage poulie basse assis", "schema": "hrow", "type": "C", "materiel": "g", "zones": "" },
      { "nom": "Rowing machine convergente", "schema": "hrow", "type": "C", "materiel": "g", "zones": "" },
      { "nom": "T-bar avec appui poitrine", "schema": "hrow", "type": "C", "materiel": "g", "zones": "" }
    ]},
    { "muscle": "traps", "nom": "Trapèzes", "exercices": [
      { "nom": "Shrugs haltères ou machine", "schema": "shrug", "type": "I", "materiel": "gd", "zones": "" }
    ]},
    { "muscle": "shoulders", "nom": "Épaules", "exercices": [
      { "nom": "Shoulder press à la Smith", "schema": "ohp", "type": "C", "materiel": "g", "zones": "s" },
      { "nom": "Élévations latérales poulie", "p": true, "schema": "lat", "type": "I", "materiel": "g", "zones": "" },
      { "nom": "Élévations latérales haltères", "p": true, "schema": "lat", "type": "I", "materiel": "gd", "zones": "" },
      { "nom": "Élévations latérales machine", "schema": "lat", "type": "I", "materiel": "g", "zones": "" },
      { "nom": "Face pull", "p": true, "schema": "rear", "type": "I", "materiel": "g", "zones": "" },
      { "nom": "Reverse pec deck", "schema": "rear", "type": "I", "materiel": "g", "zones": "" },
      { "nom": "Oiseau à la poulie", "schema": "rear", "type": "I", "materiel": "g", "zones": "" }
    ]},
    { "muscle": "biceps", "nom": "Biceps", "exercices": [
      { "nom": "Curl barre EZ", "p": true, "schema": "curl", "type": "I", "materiel": "g", "zones": "" },
      { "nom": "Curl incliné haltères", "p": true, "schema": "stretch", "type": "I", "materiel": "gd", "zones": "s" },
      { "nom": "Curl marteau", "schema": "hammer", "type": "I", "materiel": "gd", "zones": "" },
      { "nom": "Curl poulie", "schema": "curl", "type": "I", "materiel": "g", "zones": "" }
    ]},
    { "muscle": "triceps", "nom": "Triceps", "exercices": [
      { "nom": "Extension au-dessus de la tête à la poulie", "p": true, "schema": "oh", "type": "I", "materiel": "g", "zones": "s" },
      { "nom": "Extension poulie haute à la corde", "p": true, "schema": "push", "type": "I", "materiel": "g", "zones": "" }
    ]},
    { "muscle": "quads", "nom": "Quadriceps", "exercices": [
      { "nom": "Presse à cuisses amplitude limitée", "p": true, "schema": "squat", "type": "C", "materiel": "g", "zones": "k" },
      { "nom": "Leg extension charge modérée", "p": true, "schema": "iso", "type": "I", "materiel": "g", "zones": "k" },
      { "nom": "Hack squat amplitude limitée", "schema": "squat", "type": "C", "materiel": "g", "zones": "k", "note": "Seulement si sans douleur" }
    ]},
    { "muscle": "glutes", "nom": "Fessiers", "exercices": [
      { "nom": "Hip thrust machine", "schema": "thrust", "type": "C", "materiel": "g", "zones": "" },
      { "nom": "Abduction hanche machine", "schema": "abd", "type": "I", "materiel": "g", "zones": "" }
    ]},
    { "muscle": "hams", "nom": "Ischios", "exercices": [
      { "nom": "Leg curl assis", "p": true, "schema": "curl", "type": "I", "materiel": "g", "zones": "" },
      { "nom": "Leg curl allongé", "schema": "curl", "type": "I", "materiel": "g", "zones": "" }
    ]},
    { "muscle": "adductors", "nom": "Adducteurs", "exercices": [
      { "nom": "Adduction machine", "schema": "add", "type": "I", "materiel": "g", "zones": "" }
    ]},
    { "muscle": "calves", "nom": "Mollets", "exercices": [
      { "nom": "Mollets assis", "p": true, "schema": "seated", "type": "I", "materiel": "g", "zones": "" },
      { "nom": "Mollets debout machine", "schema": "calf", "type": "I", "materiel": "g", "zones": "" },
      { "nom": "Mollets à la presse", "schema": "calf", "type": "I", "materiel": "g", "zones": "" }
    ]},
    { "muscle": "abs", "nom": "Abdos", "exercices": [
      { "nom": "Crunch à la poulie", "p": true, "schema": "flex", "type": "I", "materiel": "g", "zones": "" }
    ]}
  ]
};
