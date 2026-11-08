// v79 : paires exactes ; sources et licences par image : exercices/SOURCES.json.
window.SIDFIT_IMG = {
  "Développé couché haltères": "dumbbell-bench-press",
  "Chest press machine": "leverage-chest-press",
  "Développé incliné à la Smith": "smith-machine-incline-bench-press",
  "Pec deck": "butterfly",
  "Pompes au sol": "pushups",
  "Tractions pronation lestées": "weighted-pull-ups",
  "Tractions prise neutre": "v-bar-pullup",
  "Tractions prise large": "pullups",
  "Pull-over à la poulie": "straight-arm-pulldown",
  "Rowing avec appui": "dumbbell-incline-row",
  "Tirage poulie basse assis": "seated-cable-rows",
  "Rowing machine convergente": "leverage-iso-row",
  "T-bar avec appui poitrine": "lying-t-bar-row",
  "Rowing haltères buste penché": "bent-over-two-dumbbell-row",
  "Shoulder press à la Smith": "smith-machine-overhead-shoulder-press",
  "Élévations latérales haltères": "side-lateral-raise",
  "Face pull": "face-pull",
  "Reverse pec deck": "reverse-machine-flyes",
  "Oiseau à la poulie": "cable-rear-delt-fly",
  "Écartés élastique devant soi": "band-pull-apart",
  "Développé épaules haltères debout": "standing-dumbbell-press",
  "Curl barre EZ": "ez-bar-curl",
  "Curl incliné haltères": "incline-dumbbell-curl",
  "Curl marteau": "hammer-curls",
  "Curl poulie": "standing-biceps-cable-curl",
  "Extension au-dessus de la tête à la poulie": "cable-rope-overhead-triceps-extension",
  "Extension poulie haute à la corde": "triceps-pushdown-rope-attachment",
  "Leg extension charge modérée": "leg-extensions",
  "Squat au poids du corps": "bodyweight-squat",
  "Abduction hanche machine": "thigh-abductor",
  "Pont fessier au sol": "butt-lift-bridge",
  "Leg curl assis": "seated-leg-curl",
  "Leg curl allongé": "lying-leg-curls",
  "Adduction machine": "thigh-adductor",
  "Mollets assis": "seated-calf-raise",
  "Mollets debout machine": "standing-calf-raises",
  "Mollets à la presse": "calf-press-on-the-leg-press-machine",
  "Crunch à la poulie": "cable-crunch",
  "Dead bug": "dead-bug",
  "Hack squat amplitude limitée": "hack-squat-limited-range",
  "Planche sur les avant-bras": "plank",
  "Pompes au mur": "illustration-pompes-au-mur",
  "Curl élastique debout": "illustration-curl-elastique-debout",
  "Pompes sur les genoux": "illustration-pompes-sur-les-genoux",
  "Rowing élastique assis": "illustration-rowing-elastique-assis",
  "Extension triceps élastique debout": "illustration-extension-triceps-elastique-debout",
  "Élévations en W au sol": "illustration-elevations-en-w-au-sol",
  "Élévations latérales poulie": "illustration-elevations-laterales-poulie",
  "Élévations latérales machine": "illustration-elevations-laterales-machine",
  "Hip thrust machine": "illustration-hip-thrust-machine",
  "Presse à cuisses amplitude limitée": "illustration-presse-a-cuisses-amplitude-limitee",
  "Dips lestés": "illustration-dips-lestes",
  "Soulevé de terre roumain haltères": "illustration-souleve-de-terre-roumain-halteres",
  "Goblet squat": "illustration-goblet-squat",
  "Charnière de hanches sans charge": "illustration-charniere-de-hanches-sans-charge",
  "Abduction de hanche sur le côté": "illustration-abduction-de-hanche-sur-le-cote",
  "Mollets debout au poids du corps": "illustration-mollets-debout-au-poids-du-corps",
  "Shrugs haltères ou machine": "illustration-shrugs-halteres-ou-machine"
};
window.SIDFIT_PHOTO_CREDITS = {
  "Hack squat amplitude limitée": {
    "author": "GeorgeStepanek (attributed by Wikimedia Commons)",
    "title": "File:HackSquatMachineExercise.JPG",
    "url": "https://commons.wikimedia.org/w/index.php?title=File:HackSquatMachineExercise.JPG&oldid=1290596445",
    "licence": "CC BY-SA 3.0",
    "licenceUrl": "https://creativecommons.org/licenses/by-sa/3.0/",
    "changes": {
      "fr": "Deux photos originales juxtaposées séparées, ordre départ puis flexion, réduction et marges blanches ; JPEG progressif.",
      "en": "Two juxtaposed original photographs separated, ordered start then flexion, resized and white-padded; progressive JPEG."
    }
  },
  "Planche sur les avant-bras": {
    "author": "Andrea Coach G",
    "title": "File:Forearm Plank Phalakasana variant (outdoor class).jpg",
    "url": "https://commons.wikimedia.org/w/index.php?title=File:Forearm_Plank_Phalakasana_variant_(outdoor_class).jpg&oldid=1249502951",
    "licence": "CC BY-SA 4.0",
    "licenceUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
    "changes": {
      "fr": "Photo 0 : recadrage sur la personne centrale, réduction et marges blanches ; recadrage antérieur par Chiswick Chap conservé. Photo 1 : vue latérale Free Exercise DB (Unlicense). Deux personnes, même posture sur les avant-bras ; pas un avant/après.",
      "en": "Photo 0: cropped to the central person, resized and white-padded; earlier crop by Chiswick Chap retained. Photo 1: side view from Free Exercise DB (Unlicense). Two people holding the same forearm posture, not before/after."
    }
  }
};
// Les exercices statiques montrent des vues complémentaires, sans départ/arrivée fictifs.
window.SIDFIT_PHOTO_LABELS = {
  "Planche sur les avant-bras": {
    "fr": [
      "Vue oblique arrière",
      "Vue latérale"
    ],
    "en": [
      "Oblique rear view",
      "Side view"
    ]
  },
  "Élévations en W au sol": {
    "fr": [
      "Vue de dessus : bras posés",
      "Vue de côté : bras décollés"
    ],
    "en": [
      "Top view: arms down",
      "Side view: arms lifted"
    ]
  }
};

// Illustrations originales : affichage distinct des photographies, provenance dans SOURCES.json.
window.SIDFIT_ILLUS = {
  "Pompes au mur": {
    "tool": "OpenAI image_gen",
    "model": "gpt-image-2 (selon la documentation Codex)",
    "date": "2026-11-08"
  },
  "Curl élastique debout": {
    "tool": "OpenAI image_gen",
    "model": "gpt-image-2 (selon la documentation Codex)",
    "date": "2026-11-08"
  },
  "Pompes sur les genoux": {
    "tool": "OpenAI image_gen",
    "model": "gpt-image-2 (selon la documentation Codex)",
    "date": "2026-11-08"
  },
  "Rowing élastique assis": {
    "tool": "OpenAI image_gen",
    "model": "gpt-image-2 (selon la documentation Codex)",
    "date": "2026-11-08"
  },
  "Extension triceps élastique debout": {
    "tool": "OpenAI image_gen",
    "model": "gpt-image-2 (selon la documentation Codex)",
    "date": "2026-11-08"
  },
  "Élévations en W au sol": {
    "tool": "OpenAI image_gen",
    "model": "gpt-image-2 (selon la documentation Codex)",
    "date": "2026-11-08"
  },
  "Élévations latérales poulie": {
    "tool": "OpenAI image_gen",
    "model": "gpt-image-2 (selon la documentation Codex)",
    "date": "2026-11-08"
  },
  "Élévations latérales machine": {
    "tool": "OpenAI image_gen",
    "model": "gpt-image-2 (selon la documentation Codex)",
    "date": "2026-11-08"
  },
  "Hip thrust machine": {
    "tool": "OpenAI image_gen",
    "model": "gpt-image-2 (selon la documentation Codex)",
    "date": "2026-11-08"
  },
  "Presse à cuisses amplitude limitée": {
    "tool": "OpenAI image_gen",
    "model": "gpt-image-2 (selon la documentation Codex)",
    "date": "2026-11-08"
  },
  "Dips lestés": {
    "tool": "OpenAI image_gen",
    "model": "gpt-image-2 (selon la documentation Codex)",
    "date": "2026-11-08"
  },
  "Soulevé de terre roumain haltères": {
    "tool": "OpenAI image_gen",
    "model": "gpt-image-2 (selon la documentation Codex)",
    "date": "2026-11-08"
  },
  "Goblet squat": {
    "tool": "OpenAI image_gen",
    "model": "gpt-image-2 (selon la documentation Codex)",
    "date": "2026-11-08"
  },
  "Charnière de hanches sans charge": {
    "tool": "OpenAI image_gen",
    "model": "gpt-image-2 (selon la documentation Codex)",
    "date": "2026-11-08"
  },
  "Abduction de hanche sur le côté": {
    "tool": "OpenAI image_gen",
    "model": "gpt-image-2 (selon la documentation Codex)",
    "date": "2026-11-08"
  },
  "Mollets debout au poids du corps": {
    "tool": "OpenAI image_gen",
    "model": "gpt-image-2 (selon la documentation Codex)",
    "date": "2026-11-08"
  },
  "Shrugs haltères ou machine": {
    "tool": "OpenAI image_gen",
    "model": "gpt-image-2 (selon la documentation Codex)",
    "date": "2026-11-08"
  }
};
