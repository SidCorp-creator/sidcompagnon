// v79 : fiche « ? » de chaque exercice du catalogue (exercices.js) : muscles, placement, exécution, respiration, points d'attention, erreurs (FR/EN).
// Clé = nom exact de l'exercice. Photos : exercices-photos.js (+ site/exercices/SOURCES.json). Références générales : ACSM 2026, NHS ; ce n'est pas un avis médical.
// Format : "Nom": {"fr": {"mus","setup","steps":[…],"breath","focus":[…],"errors":[…]}, "en": {…}} ; tests/exercices-aide.test.cjs vérifie la couverture.
window.SIDFIT_AIDE = {
 "Développé couché haltères": {
  "fr": {
   "mus": "Pectoraux, avant des épaules, triceps",
   "setup": "Allongé sur le banc, pieds au sol, omoplates serrées et basses.",
   "steps": [
    "Descends les haltères sur les côtés de la poitrine, coudes à environ 45° du corps.",
    "Pousse vers le haut en rapprochant légèrement les haltères, sans les cogner."
   ],
   "breath": "Inspire en descendant les haltères, expire en poussant.",
   "focus": [
    "Garde les poignets droits, au-dessus des coudes."
   ],
   "errors": [
    "Coudes trop écartés (à 90°) : ça fatigue les épaules."
   ]
  },
  "en": {
   "mus": "Chest, front shoulders, triceps",
   "setup": "Lie on the bench, feet on the floor, shoulder blades pulled back and down.",
   "steps": [
    "Lower the dumbbells beside your chest, elbows about 45° from your body.",
    "Press up, bringing the dumbbells slightly together without clashing them."
   ],
   "breath": "Breathe in as you lower the dumbbells, out as you press.",
   "focus": [
    "Keep your wrists straight, stacked over your elbows."
   ],
   "errors": [
    "Elbows flared out to 90°: it strains the shoulders."
   ]
  }
 },
 "Chest press machine": {
  "fr": {
   "mus": "Pectoraux, avant des épaules, triceps",
   "setup": "Règle le siège pour que les poignées soient à hauteur du milieu de la poitrine.",
   "steps": [
    "Dos et omoplates collés au dossier, pousse en expirant sans verrouiller les coudes.",
    "Reviens lentement jusqu'à sentir l'étirement des pectoraux."
   ],
   "breath": "Inspire en revenant, expire en poussant les poignées.",
   "focus": [
    "Garde les épaules basses et loin des oreilles."
   ],
   "errors": [
    "Décoller le dos du dossier pour pousser plus lourd."
   ]
  },
  "en": {
   "mus": "Chest, front shoulders, triceps",
   "setup": "Set the seat so the handles are level with the middle of your chest.",
   "steps": [
    "Back and shoulder blades against the pad, press while breathing out without locking your elbows.",
    "Return slowly until you feel a stretch in your chest."
   ],
   "breath": "Breathe in on the way back, out as you push the handles.",
   "focus": [
    "Keep your shoulders down, away from your ears."
   ],
   "errors": [
    "Lifting your back off the pad to push more weight."
   ]
  }
 },
 "Développé incliné à la Smith": {
  "fr": {
   "mus": "Haut des pectoraux, avant des épaules, triceps",
   "setup": "Banc incliné à 30°, la barre descend sur le haut de la poitrine.",
   "steps": [
    "Omoplates serrées, mains un peu plus larges que les épaules.",
    "Descends en contrôlant, pousse droit vers le haut sans décoller les fesses."
   ],
   "breath": "Inspire en descendant la barre, expire en poussant.",
   "focus": [
    "Règle les crochets de sécurité juste sous le point le plus bas."
   ],
   "errors": [
    "Banc trop incliné (plus de 45°) : ce sont surtout les épaules qui travaillent."
   ]
  },
  "en": {
   "mus": "Upper chest, front shoulders, triceps",
   "setup": "Bench at 30°, the bar comes down to your upper chest.",
   "steps": [
    "Shoulder blades squeezed, hands slightly wider than your shoulders.",
    "Lower with control, press straight up without lifting your hips."
   ],
   "breath": "Breathe in as you lower the bar, out as you press.",
   "focus": [
    "Set the safety stops just below your lowest point."
   ],
   "errors": [
    "Bench too steep (over 45°): mostly your shoulders do the work."
   ]
  }
 },
 "Pec deck": {
  "fr": {
   "mus": "Pectoraux",
   "setup": "Règle le siège pour que les poignées soient à hauteur des épaules, coudes légèrement fléchis.",
   "steps": [
    "Rapproche les bras devant toi en serrant les pectoraux, marque une courte pause.",
    "Reviens lentement, sans laisser les bras partir trop loin derrière."
   ],
   "breath": "Inspire en ouvrant les bras, expire en les rapprochant.",
   "focus": [
    "Garde le même léger pli des coudes du début à la fin."
   ],
   "errors": [
    "Pousser avec les mains et les épaules au lieu de serrer la poitrine."
   ]
  },
  "en": {
   "mus": "Chest",
   "setup": "Set the seat so the handles are at shoulder height, elbows slightly bent.",
   "steps": [
    "Bring your arms together in front of you by squeezing your chest, pause briefly.",
    "Return slowly without letting your arms go too far back."
   ],
   "breath": "Breathe in as your arms open, out as you bring them together.",
   "focus": [
    "Keep the same slight elbow bend from start to finish."
   ],
   "errors": [
    "Pushing with your hands and shoulders instead of squeezing your chest."
   ]
  }
 },
 "Dips lestés": {
  "fr": {
   "mus": "Bas des pectoraux, triceps, avant des épaules",
   "setup": "Bras tendus sur les barres, buste légèrement penché en avant.",
   "steps": [
    "Descends jusqu'à ce que les bras soient à peu près parallèles au sol.",
    "Remonte en poussant fort, sans verrouiller brutalement les coudes."
   ],
   "breath": "Inspire en descendant, expire en remontant.",
   "focus": [
    "Ajoute du lest seulement si 10 dips propres sont faciles au poids du corps."
   ],
   "errors": [
    "Descendre trop bas : ça force sur l'avant des épaules."
   ]
  },
  "en": {
   "mus": "Lower chest, triceps, front shoulders",
   "setup": "Arms straight on the bars, torso leaning slightly forward.",
   "steps": [
    "Lower until your upper arms are about parallel to the floor.",
    "Push back up hard, without slamming your elbows into lockout."
   ],
   "breath": "Breathe in on the way down, out on the way up.",
   "focus": [
    "Only add weight once 10 clean bodyweight dips feel easy."
   ],
   "errors": [
    "Going too deep: it strains the front of the shoulders."
   ]
  }
 },
 "Pompes au mur": {
  "fr": {
   "mus": "Pectoraux, avant des épaules, triceps",
   "setup": "Debout face à un mur, mains posées à hauteur d'épaules, un peu plus larges que les épaules ; recule les pieds pour pencher le corps en planche.",
   "steps": [
    "Plie les coudes pour approcher la poitrine du mur, coudes à environ 45° du corps.",
    "Repousse le mur jusqu'aux bras tendus, le corps restant droit."
   ],
   "breath": "Inspire en approchant du mur, expire en repoussant.",
   "focus": [
    "Plus tes pieds sont loin du mur, plus c'est difficile : règle la distance."
   ],
   "errors": [
    "Casser le corps au niveau des hanches au lieu de rester gainé."
   ]
  },
  "en": {
   "mus": "Chest, front shoulders, triceps",
   "setup": "Stand facing a wall, hands at shoulder height, slightly wider than your shoulders; step your feet back so your body leans like a plank.",
   "steps": [
    "Bend your elbows to bring your chest towards the wall, elbows about 45° from your body.",
    "Push the wall away until your arms are straight, body staying in one line."
   ],
   "breath": "Breathe in as you lean in, out as you push away.",
   "focus": [
    "The further your feet are from the wall, the harder it gets: adjust the distance."
   ],
   "errors": [
    "Bending at the hips instead of keeping your body braced."
   ]
  }
 },
 "Pompes sur les genoux": {
  "fr": {
   "mus": "Pectoraux, avant des épaules, triceps",
   "setup": "À genoux, mains au sol un peu plus larges que les épaules, une ligne droite des genoux aux épaules.",
   "steps": [
    "Descends la poitrine vers le sol en pliant les coudes à environ 45°.",
    "Repousse le sol jusqu'aux bras tendus, sans lever les fesses."
   ],
   "breath": "Inspire en descendant, expire en poussant.",
   "focus": [
    "Pose un coussin sous les genoux si le sol est dur."
   ],
   "errors": [
    "Laisser les fesses en l'air : genoux, hanches et épaules restent alignés."
   ]
  },
  "en": {
   "mus": "Chest, front shoulders, triceps",
   "setup": "On your knees, hands on the floor slightly wider than your shoulders, a straight line from knees to shoulders.",
   "steps": [
    "Lower your chest towards the floor, elbows bending at about 45°.",
    "Push the floor away until your arms are straight, without lifting your hips."
   ],
   "breath": "Breathe in as you lower, out as you push.",
   "focus": [
    "Put a cushion under your knees on a hard floor."
   ],
   "errors": [
    "Sticking your hips up: knees, hips and shoulders stay in line."
   ]
  }
 },
 "Pompes au sol": {
  "fr": {
   "mus": "Pectoraux, avant des épaules, triceps, gainage",
   "setup": "En planche bras tendus, mains un peu plus larges que les épaules, pieds joints ou légèrement écartés, corps droit de la tête aux talons.",
   "steps": [
    "Descends la poitrine près du sol, coudes à environ 45° du corps.",
    "Repousse le sol jusqu'aux bras tendus, en gardant le ventre serré."
   ],
   "breath": "Inspire en descendant, expire en poussant.",
   "focus": [
    "Arrête la série dès que la posture se dégrade."
   ],
   "errors": [
    "Laisser le bassin tomber vers le sol.",
    "Écarter les coudes à 90° du corps."
   ]
  },
  "en": {
   "mus": "Chest, front shoulders, triceps, core",
   "setup": "In a high plank, hands slightly wider than your shoulders, feet together or slightly apart, body straight from head to heels.",
   "steps": [
    "Lower your chest close to the floor, elbows about 45° from your body.",
    "Push the floor away until your arms are straight, keeping your abs tight."
   ],
   "breath": "Breathe in as you lower, out as you push.",
   "focus": [
    "Stop the set as soon as your form breaks down."
   ],
   "errors": [
    "Letting your hips sag towards the floor.",
    "Flaring your elbows out to 90°."
   ]
  }
 },
 "Tractions pronation lestées": {
  "fr": {
   "mus": "Grand dorsal, biceps, haut du dos",
   "setup": "Mains en pronation (paumes vers l'avant), un peu plus larges que les épaules, bras tendus.",
   "steps": [
    "Tire en amenant la poitrine vers la barre et les coudes vers les hanches.",
    "Redescends lentement jusqu'aux bras presque tendus."
   ],
   "breath": "Expire en tirant vers la barre, inspire en redescendant.",
   "focus": [
    "Ajoute du lest seulement quand 8 tractions strictes sont maîtrisées."
   ],
   "errors": [
    "Se balancer pour monter : garde le corps gainé et immobile."
   ]
  },
  "en": {
   "mus": "Lats, biceps, upper back",
   "setup": "Overhand grip (palms forward), slightly wider than shoulders, arms straight.",
   "steps": [
    "Pull your chest towards the bar and your elbows towards your hips.",
    "Lower slowly until your arms are almost straight."
   ],
   "breath": "Breathe out as you pull up, in as you lower.",
   "focus": [
    "Only add weight once 8 strict pull-ups are solid."
   ],
   "errors": [
    "Swinging to get up: keep your body tight and still."
   ]
  }
 },
 "Tractions prise neutre": {
  "fr": {
   "mus": "Grand dorsal, biceps, avant-bras",
   "setup": "Paumes face à face sur les poignées parallèles, bras tendus.",
   "steps": [
    "Tire en gardant les coudes près du corps, poitrine vers les poignées.",
    "Redescends en contrôlant, épaules basses."
   ],
   "breath": "Expire en tirant, inspire en redescendant.",
   "focus": [
    "Commence chaque répétition en abaissant les épaules."
   ],
   "errors": [
    "Monter en tendant le menton vers l'avant au lieu de tirer avec le dos."
   ]
  },
  "en": {
   "mus": "Lats, biceps, forearms",
   "setup": "Palms facing each other on the parallel handles, arms straight.",
   "steps": [
    "Pull with your elbows close to your body, chest towards the handles.",
    "Lower with control, shoulders down."
   ],
   "breath": "Breathe out as you pull, in as you lower.",
   "focus": [
    "Start each rep by pulling your shoulders down."
   ],
   "errors": [
    "Reaching up with your chin instead of pulling with your back."
   ]
  }
 },
 "Tractions prise large": {
  "fr": {
   "mus": "Grand dorsal (largeur du dos), haut du dos",
   "setup": "Mains en pronation, nettement plus larges que les épaules.",
   "steps": [
    "Tire les coudes vers le bas et sur les côtés, poitrine vers la barre.",
    "Redescends lentement, sans relâcher complètement les épaules."
   ],
   "breath": "Expire en tirant, inspire en redescendant.",
   "focus": [
    "Ne monte pas les épaules vers les oreilles en bas du mouvement."
   ],
   "errors": [
    "Amplitude trop courte : descends jusqu'aux bras presque tendus."
   ]
  },
  "en": {
   "mus": "Lats (back width), upper back",
   "setup": "Overhand grip, clearly wider than your shoulders.",
   "steps": [
    "Pull your elbows down and out, chest towards the bar.",
    "Lower slowly without fully relaxing your shoulders."
   ],
   "breath": "Breathe out as you pull, in as you lower.",
   "focus": [
    "Don't let your shoulders shrug up at the bottom."
   ],
   "errors": [
    "Range of motion too short: go down until your arms are almost straight."
   ]
  }
 },
 "Pull-over à la poulie": {
  "fr": {
   "mus": "Grand dorsal",
   "setup": "Debout face à la poulie haute, barre ou corde en main, bras presque tendus devant toi, buste droit.",
   "steps": [
    "Ramène les mains vers les cuisses en arc de cercle, sans plier les coudes.",
    "Remonte lentement jusqu'à sentir l'étirement sous les bras."
   ],
   "breath": "Expire en ramenant les mains, inspire en remontant.",
   "focus": [
    "Garde le buste immobile : seuls les bras bougent."
   ],
   "errors": [
    "Plier les coudes : l'exercice devient un mouvement de triceps."
   ]
  },
  "en": {
   "mus": "Lats",
   "setup": "Stand facing the high pulley, bar or rope in hand, arms almost straight in front of you, torso upright.",
   "steps": [
    "Bring your hands down to your thighs in an arc, without bending your elbows.",
    "Return slowly until you feel the stretch under your arms."
   ],
   "breath": "Breathe out as you bring your hands down, in as they rise.",
   "focus": [
    "Keep your torso still: only your arms move."
   ],
   "errors": [
    "Bending your elbows: it turns into a triceps exercise."
   ]
  }
 },
 "Rowing avec appui": {
  "fr": {
   "mus": "Milieu du dos, grand dorsal, arrière des épaules",
   "setup": "Poitrine appuyée sur le banc incliné, un haltère dans chaque main.",
   "steps": [
    "Tire les coudes vers l'arrière en serrant les omoplates.",
    "Redescends lentement, bras tendus, sans lâcher la tension."
   ],
   "breath": "Expire en tirant, inspire en redescendant.",
   "focus": [
    "Garde la poitrine collée au banc pendant toute la série."
   ],
   "errors": [
    "Tirer avec les biceps : pense à amener les coudes, pas les mains."
   ]
  },
  "en": {
   "mus": "Mid back, lats, rear shoulders",
   "setup": "Chest supported on the incline bench, a dumbbell in each hand.",
   "steps": [
    "Pull your elbows back while squeezing your shoulder blades.",
    "Lower slowly to straight arms without losing tension."
   ],
   "breath": "Breathe out as you row, in as you lower.",
   "focus": [
    "Keep your chest on the bench for the whole set."
   ],
   "errors": [
    "Pulling with your biceps: think of driving your elbows, not your hands."
   ]
  }
 },
 "Tirage poulie basse assis": {
  "fr": {
   "mus": "Milieu du dos, grand dorsal, biceps",
   "setup": "Assis, pieds calés, dos droit, poignée en main, bras tendus.",
   "steps": [
    "Tire la poignée vers le nombril en serrant les omoplates, buste immobile.",
    "Reviens lentement en laissant les épaules s'avancer un peu."
   ],
   "breath": "Expire en tirant, inspire en revenant.",
   "focus": [
    "Garde le dos droit, sans t'arrondir quand les bras s'allongent."
   ],
   "errors": [
    "Se balancer d'avant en arrière avec le buste pour tirer."
   ]
  },
  "en": {
   "mus": "Mid back, lats, biceps",
   "setup": "Seated, feet braced, back straight, handle in hand, arms straight.",
   "steps": [
    "Pull the handle towards your belly button, squeezing your shoulder blades, torso still.",
    "Return slowly, letting your shoulders come forward a little."
   ],
   "breath": "Breathe out as you pull, in as you return.",
   "focus": [
    "Keep your back straight, without rounding as your arms extend."
   ],
   "errors": [
    "Rocking your torso back and forth to pull."
   ]
  }
 },
 "Rowing machine convergente": {
  "fr": {
   "mus": "Milieu du dos, grand dorsal",
   "setup": "Poitrine contre l'appui, règle le siège pour attraper les poignées bras tendus.",
   "steps": [
    "Tire en ramenant les coudes près du corps, serre les omoplates une seconde.",
    "Reviens lentement jusqu'à l'étirement complet."
   ],
   "breath": "Expire en tirant, inspire en revenant.",
   "focus": [
    "Pense à ramener les coudes, pas les mains."
   ],
   "errors": [
    "Décoller la poitrine de l'appui pour tirer plus lourd."
   ]
  },
  "en": {
   "mus": "Mid back, lats",
   "setup": "Chest against the pad, set the seat so you reach the handles with straight arms.",
   "steps": [
    "Pull with your elbows close to your body, squeeze your shoulder blades for a second.",
    "Return slowly to a full stretch."
   ],
   "breath": "Breathe out as you pull, in as you return.",
   "focus": [
    "Think about driving your elbows back, not your hands."
   ],
   "errors": [
    "Lifting your chest off the pad to pull more weight."
   ]
  }
 },
 "T-bar avec appui poitrine": {
  "fr": {
   "mus": "Milieu et haut du dos, grand dorsal",
   "setup": "Poitrine sur l'appui, prends les poignées, bras tendus.",
   "steps": [
    "Tire vers le haut du ventre en gardant le cou dans l'alignement du dos.",
    "Redescends en contrôlant, sans laisser tomber la charge."
   ],
   "breath": "Expire en tirant, inspire en redescendant.",
   "focus": [
    "Regarde vers le bas, nuque dans l'alignement du dos."
   ],
   "errors": [
    "Arrondir le dos ou relever la tête vers l'arrière."
   ]
  },
  "en": {
   "mus": "Mid and upper back, lats",
   "setup": "Chest on the pad, grab the handles, arms straight.",
   "steps": [
    "Pull towards your upper belly, keeping your neck in line with your back.",
    "Lower with control, without dropping the weight."
   ],
   "breath": "Breathe out as you pull, in as you lower.",
   "focus": [
    "Look down, neck in line with your back."
   ],
   "errors": [
    "Rounding your back or throwing your head back."
   ]
  }
 },
 "Élévations en W au sol": {
  "fr": {
   "mus": "Haut du dos, arrière des épaules",
   "setup": "Allongé sur le ventre, front posé sur une serviette, bras pliés en W de chaque côté, pouces vers le haut.",
   "steps": [
    "Décolle les bras du sol en serrant les omoplates vers le bas et l'arrière.",
    "Tiens une à deux secondes, puis repose les bras lentement."
   ],
   "breath": "Expire en décollant les bras, inspire en les reposant.",
   "focus": [
    "Le mouvement est petit : la nuque reste longue et le regard vers le sol."
   ],
   "errors": [
    "Relever la tête ou cambrer le bas du dos pour monter plus haut."
   ]
  },
  "en": {
   "mus": "Upper back, rear shoulders",
   "setup": "Lie face down, forehead on a towel, arms bent in a W shape at your sides, thumbs up.",
   "steps": [
    "Lift your arms off the floor by squeezing your shoulder blades down and back.",
    "Hold for one to two seconds, then lower your arms slowly."
   ],
   "breath": "Breathe out as you lift, in as you lower.",
   "focus": [
    "It's a small movement: keep your neck long and eyes on the floor."
   ],
   "errors": [
    "Lifting your head or arching your lower back to go higher."
   ]
  }
 },
 "Rowing haltères buste penché": {
  "fr": {
   "mus": "Milieu du dos, grand dorsal, arrière des épaules",
   "setup": "Debout, un haltère dans chaque main, genoux légèrement fléchis ; penche le buste en avant à environ 45° en gardant le dos plat, bras tendus sous les épaules.",
   "steps": [
    "Tire les haltères vers le bas des côtes, coudes près du corps, omoplates serrées.",
    "Redescends lentement jusqu'aux bras tendus sans bouger le buste."
   ],
   "breath": "Expire en tirant, inspire en redescendant.",
   "focus": [
    "Le dos reste plat pendant toute la série ; si tu fatigues, repose les haltères."
   ],
   "errors": [
    "Arrondir le dos.",
    "Se redresser à chaque répétition pour donner de l'élan."
   ]
  },
  "en": {
   "mus": "Mid back, lats, rear shoulders",
   "setup": "Stand with a dumbbell in each hand, knees slightly bent; hinge forward to about 45° with a flat back, arms hanging under your shoulders.",
   "steps": [
    "Row the dumbbells to your lower ribs, elbows close to your body, shoulder blades squeezed.",
    "Lower slowly until your arms are straight, without moving your torso."
   ],
   "breath": "Breathe out as you row, in as you lower.",
   "focus": [
    "Your back stays flat for the whole set; if you tire, put the weights down."
   ],
   "errors": [
    "Rounding your back.",
    "Standing up each rep to swing the weights."
   ]
  }
 },
 "Rowing élastique assis": {
  "fr": {
   "mus": "Milieu du dos, grand dorsal, biceps",
   "setup": "Assis au sol jambes tendues, élastique passé sous la plante des pieds, une extrémité dans chaque main, dos droit.",
   "steps": [
    "Tire les mains vers le nombril en serrant les omoplates, coudes près du corps.",
    "Reviens lentement jusqu'aux bras tendus en gardant la tension de l'élastique."
   ],
   "breath": "Expire en tirant, inspire en revenant.",
   "focus": [
    "Vérifie que l'élastique est bien calé sous les pieds et sans entaille avant chaque série."
   ],
   "errors": [
    "Se pencher en arrière pour tirer au lieu d'utiliser le dos."
   ]
  },
  "en": {
   "mus": "Mid back, lats, biceps",
   "setup": "Sit on the floor with legs straight, band looped under your feet, one end in each hand, back upright.",
   "steps": [
    "Pull your hands towards your belly button, squeezing your shoulder blades, elbows close.",
    "Return slowly until your arms are straight, keeping tension on the band."
   ],
   "breath": "Breathe out as you pull, in as you return.",
   "focus": [
    "Check the band is secure under your feet and undamaged before each set."
   ],
   "errors": [
    "Leaning back to pull instead of using your back muscles."
   ]
  }
 },
 "Shrugs haltères ou machine": {
  "fr": {
   "mus": "Trapèzes",
   "setup": "Debout, un haltère dans chaque main le long du corps, bras tendus (illustré). À la machine : même mouvement des épaules, épaules sous les appuis.",
   "steps": [
    "Monte les épaules droit vers les oreilles et tiens une seconde.",
    "Redescends lentement, sans rouler les épaules."
   ],
   "breath": "Expire en montant les épaules, inspire en redescendant.",
   "focus": [
    "Garde les bras tendus et relâchés : ce sont les épaules qui montent."
   ],
   "errors": [
    "Plier les coudes ou faire des rotations d'épaules."
   ]
  },
  "en": {
   "mus": "Traps",
   "setup": "Stand with a dumbbell in each hand at your sides, arms straight (shown). On the machine: same shoulder movement, shoulders under the pads.",
   "steps": [
    "Raise your shoulders straight up towards your ears and hold for a second.",
    "Lower slowly, without rolling your shoulders."
   ],
   "breath": "Breathe out as you shrug up, in as you lower.",
   "focus": [
    "Keep your arms straight and relaxed: only the shoulders rise."
   ],
   "errors": [
    "Bending your elbows or rolling your shoulders."
   ]
  }
 },
 "Shoulder press à la Smith": {
  "fr": {
   "mus": "Épaules (avant et milieu), triceps",
   "setup": "Assis sur un banc à dossier presque droit, la barre passe devant le visage.",
   "steps": [
    "Mains un peu plus larges que les épaules, pousse au-dessus de la tête.",
    "Redescends jusqu'au menton en contrôlant."
   ],
   "breath": "Inspire en descendant, expire en poussant.",
   "focus": [
    "Serre légèrement le ventre pour garder le dos contre le dossier."
   ],
   "errors": [
    "Cambrer fort le bas du dos : garde les fesses et le dos contre le dossier."
   ]
  },
  "en": {
   "mus": "Shoulders (front and side), triceps",
   "setup": "Seated on a nearly upright bench, the bar passes in front of your face.",
   "steps": [
    "Hands slightly wider than your shoulders, press overhead.",
    "Lower to chin level with control."
   ],
   "breath": "Breathe in as you lower, out as you press.",
   "focus": [
    "Brace your abs lightly to keep your back on the bench."
   ],
   "errors": [
    "Arching your lower back hard: keep your hips and back on the pad."
   ]
  }
 },
 "Élévations latérales poulie": {
  "fr": {
   "mus": "Milieu des épaules (deltoïde latéral)",
   "setup": "Poulie basse sur le côté, poignée dans la main opposée.",
   "steps": [
    "Monte le bras sur le côté jusqu'à hauteur d'épaule, coude légèrement fléchi.",
    "Redescends lentement, sans laisser la charge retomber."
   ],
   "breath": "Expire en montant le bras, inspire en redescendant.",
   "focus": [
    "Mène le mouvement avec le coude, pas avec la main."
   ],
   "errors": [
    "Monter avec un élan du corps ou hausser les épaules : prends plus léger."
   ]
  },
  "en": {
   "mus": "Side shoulders (lateral delts)",
   "setup": "Low pulley to your side, handle in the opposite hand.",
   "steps": [
    "Raise your arm out to the side up to shoulder height, elbow slightly bent.",
    "Lower slowly without letting the weight drop."
   ],
   "breath": "Breathe out as you raise your arm, in as you lower.",
   "focus": [
    "Lead with your elbow, not your hand."
   ],
   "errors": [
    "Using body momentum or shrugging: go lighter."
   ]
  }
 },
 "Élévations latérales haltères": {
  "fr": {
   "mus": "Milieu des épaules (deltoïde latéral)",
   "setup": "Debout, un haltère dans chaque main le long du corps.",
   "steps": [
    "Monte le bras sur le côté jusqu'à hauteur d'épaule, coude légèrement fléchi.",
    "Redescends lentement, sans laisser la charge retomber."
   ],
   "breath": "Expire en montant, inspire en redescendant.",
   "focus": [
    "Garde les épaules basses ; un poids léger suffit."
   ],
   "errors": [
    "Monter avec un élan du corps ou hausser les épaules : prends plus léger."
   ]
  },
  "en": {
   "mus": "Side shoulders (lateral delts)",
   "setup": "Standing, a dumbbell in each hand by your sides.",
   "steps": [
    "Raise your arm out to the side up to shoulder height, elbow slightly bent.",
    "Lower slowly without letting the weight drop."
   ],
   "breath": "Breathe out as you raise, in as you lower.",
   "focus": [
    "Keep your shoulders down; a light weight is enough."
   ],
   "errors": [
    "Using body momentum or shrugging: go lighter."
   ]
  }
 },
 "Élévations latérales machine": {
  "fr": {
   "mus": "Milieu des épaules (deltoïde latéral)",
   "setup": "Assis, bras contre les appuis, règle le siège pour aligner les épaules avec l'axe de la machine.",
   "steps": [
    "Monte le bras sur le côté jusqu'à hauteur d'épaule, coude légèrement fléchi.",
    "Redescends lentement, sans laisser la charge retomber."
   ],
   "breath": "Expire en montant, inspire en redescendant.",
   "focus": [
    "Pousse avec les coudes contre les appuis, mains relâchées."
   ],
   "errors": [
    "Monter avec un élan du corps ou hausser les épaules : prends plus léger."
   ]
  },
  "en": {
   "mus": "Side shoulders (lateral delts)",
   "setup": "Seated, arms against the pads, set the seat so your shoulders line up with the machine's pivot.",
   "steps": [
    "Raise your arm out to the side up to shoulder height, elbow slightly bent.",
    "Lower slowly without letting the weight drop."
   ],
   "breath": "Breathe out as you raise, in as you lower.",
   "focus": [
    "Push with your elbows against the pads, hands relaxed."
   ],
   "errors": [
    "Using body momentum or shrugging: go lighter."
   ]
  }
 },
 "Face pull": {
  "fr": {
   "mus": "Arrière des épaules, haut du dos, rotateurs",
   "setup": "Poulie à hauteur du visage, corde en main, bras tendus.",
   "steps": [
    "Tire la corde vers le front en écartant les mains, coudes hauts.",
    "Tiens une seconde, puis reviens lentement."
   ],
   "breath": "Expire en tirant, inspire en revenant.",
   "focus": [
    "Termine mains au niveau des oreilles, coudes plus hauts que les mains."
   ],
   "errors": [
    "Tirer trop lourd avec le dos en se penchant en arrière."
   ]
  },
  "en": {
   "mus": "Rear shoulders, upper back, rotator cuff",
   "setup": "Pulley at face height, rope in hand, arms straight.",
   "steps": [
    "Pull the rope towards your forehead while spreading your hands, elbows high.",
    "Hold for a second, then return slowly."
   ],
   "breath": "Breathe out as you pull, in as you return.",
   "focus": [
    "Finish with hands by your ears, elbows higher than your hands."
   ],
   "errors": [
    "Going too heavy and leaning back to pull."
   ]
  }
 },
 "Reverse pec deck": {
  "fr": {
   "mus": "Arrière des épaules, haut du dos",
   "setup": "Assis face à la machine, poitrine contre le dossier, poignées à hauteur d'épaules.",
   "steps": [
    "Ouvre les bras vers l'arrière, coudes légèrement fléchis.",
    "Reviens lentement, sans laisser les poids se toucher."
   ],
   "breath": "Expire en ouvrant les bras, inspire en revenant.",
   "focus": [
    "Bras à hauteur d'épaules, sans les laisser descendre."
   ],
   "errors": [
    "Serrer les omoplates et tirer avec le dos : laisse travailler l'arrière des épaules."
   ]
  },
  "en": {
   "mus": "Rear shoulders, upper back",
   "setup": "Seated facing the machine, chest against the pad, handles at shoulder height.",
   "steps": [
    "Open your arms backwards, elbows slightly bent.",
    "Return slowly without letting the weights touch."
   ],
   "breath": "Breathe out as you open your arms, in as you return.",
   "focus": [
    "Keep your arms at shoulder height, don't let them drop."
   ],
   "errors": [
    "Squeezing your shoulder blades and pulling with your back: let the rear shoulders work."
   ]
  }
 },
 "Oiseau à la poulie": {
  "fr": {
   "mus": "Arrière des épaules",
   "setup": "Entre deux poulies réglées en position haute, poignées croisées devant toi, bras presque tendus.",
   "steps": [
    "Écarte les bras sur les côtés et vers l'arrière, coudes légèrement fléchis.",
    "Reviens lentement en gardant la tension."
   ],
   "breath": "Expire en écartant, inspire en revenant.",
   "focus": [
    "Garde le même angle des coudes pendant tout le mouvement."
   ],
   "errors": [
    "Monter les épaules vers les oreilles pendant le mouvement."
   ]
  },
  "en": {
   "mus": "Rear shoulders",
   "setup": "Between two cables set high, handles crossed in front of you, arms almost straight.",
   "steps": [
    "Spread your arms out and back, elbows slightly bent.",
    "Return slowly while keeping tension."
   ],
   "breath": "Breathe out as you open, in as you return.",
   "focus": [
    "Keep the same elbow angle throughout."
   ],
   "errors": [
    "Shrugging your shoulders towards your ears during the movement."
   ]
  }
 },
 "Écartés élastique devant soi": {
  "fr": {
   "mus": "Arrière des épaules, haut du dos",
   "setup": "Debout, bras tendus devant toi à hauteur d'épaules, élastique tenu à deux mains, mains à largeur d'épaules.",
   "steps": [
    "Écarte les bras sur les côtés en étirant l'élastique jusqu'à ce qu'il touche presque la poitrine.",
    "Reviens lentement devant toi sans relâcher complètement l'élastique."
   ],
   "breath": "Expire en écartant, inspire en revenant.",
   "focus": [
    "Bras presque tendus et à hauteur d'épaules pendant tout le mouvement."
   ],
   "errors": [
    "Monter les épaules vers les oreilles."
   ]
  },
  "en": {
   "mus": "Rear shoulders, upper back",
   "setup": "Stand with your arms straight in front of you at shoulder height, band held in both hands, hands shoulder-width apart.",
   "steps": [
    "Pull your arms out to the sides until the band nearly touches your chest.",
    "Return slowly to the front without letting the band go slack."
   ],
   "breath": "Breathe out as you pull apart, in as you return.",
   "focus": [
    "Arms nearly straight and at shoulder height throughout."
   ],
   "errors": [
    "Shrugging your shoulders up to your ears."
   ]
  }
 },
 "Développé épaules haltères debout": {
  "fr": {
   "mus": "Épaules (avant et milieu), triceps",
   "setup": "Debout, pieds à largeur de hanches, haltères à hauteur d'épaules, paumes vers l'avant, ventre serré.",
   "steps": [
    "Pousse les haltères au-dessus de la tête jusqu'aux bras presque tendus, sans les cogner.",
    "Redescends en contrôlant jusqu'à hauteur d'épaules."
   ],
   "breath": "Expire en poussant, inspire en redescendant.",
   "focus": [
    "Serre les fessiers et le ventre pour ne pas cambrer le bas du dos."
   ],
   "errors": [
    "Se pencher en arrière pour pousser plus lourd."
   ]
  },
  "en": {
   "mus": "Shoulders (front and side), triceps",
   "setup": "Stand with feet hip-width apart, dumbbells at shoulder height, palms forward, abs braced.",
   "steps": [
    "Press the dumbbells overhead until your arms are almost straight, without clashing them.",
    "Lower under control back to shoulder height."
   ],
   "breath": "Breathe out as you press, in as you lower.",
   "focus": [
    "Squeeze your glutes and abs so your lower back doesn't arch."
   ],
   "errors": [
    "Leaning back to press a heavier weight."
   ]
  }
 },
 "Curl barre EZ": {
  "fr": {
   "mus": "Biceps",
   "setup": "Debout, barre EZ en main, bras tendus, coudes près du corps.",
   "steps": [
    "Monte la barre en pliant les coudes, sans les avancer.",
    "Redescends lentement jusqu'aux bras presque tendus."
   ],
   "breath": "Expire en montant la barre, inspire en redescendant.",
   "focus": [
    "Garde les poignets dans l'axe des avant-bras."
   ],
   "errors": [
    "Se balancer avec le dos pour monter la barre."
   ]
  },
  "en": {
   "mus": "Biceps",
   "setup": "Standing, EZ bar in hand, arms straight, elbows close to your body.",
   "steps": [
    "Curl the bar up by bending your elbows, without moving them forward.",
    "Lower slowly until your arms are almost straight."
   ],
   "breath": "Breathe out as you curl, in as you lower.",
   "focus": [
    "Keep your wrists in line with your forearms."
   ],
   "errors": [
    "Swinging your back to lift the bar."
   ]
  }
 },
 "Curl incliné haltères": {
  "fr": {
   "mus": "Biceps (partie longue)",
   "setup": "Assis sur un banc incliné à 45-60°, bras pendants derrière le buste.",
   "steps": [
    "Monte les haltères en gardant les coudes immobiles, paumes vers le haut.",
    "Redescends lentement jusqu'à l'étirement complet."
   ],
   "breath": "Expire en montant, inspire en redescendant.",
   "focus": [
    "Garde la tête et le dos contre le banc."
   ],
   "errors": [
    "Avancer les coudes en montant : l'étirement est perdu."
   ]
  },
  "en": {
   "mus": "Biceps (long head)",
   "setup": "Seated on a bench inclined at 45-60°, arms hanging behind your torso.",
   "steps": [
    "Curl the dumbbells up keeping your elbows still, palms up.",
    "Lower slowly to a full stretch."
   ],
   "breath": "Breathe out as you curl, in as you lower.",
   "focus": [
    "Keep your head and back on the bench."
   ],
   "errors": [
    "Bringing your elbows forward as you lift: you lose the stretch."
   ]
  }
 },
 "Curl marteau": {
  "fr": {
   "mus": "Biceps, brachial, avant-bras",
   "setup": "Debout, haltères en main, paumes face à face.",
   "steps": [
    "Monte les haltères sans tourner les poignets, coudes près du corps.",
    "Redescends lentement."
   ],
   "breath": "Expire en montant, inspire en redescendant.",
   "focus": [
    "Pouces vers le haut pendant toute la répétition."
   ],
   "errors": [
    "Utiliser l'élan des épaules ou du dos."
   ]
  },
  "en": {
   "mus": "Biceps, brachialis, forearms",
   "setup": "Standing, dumbbells in hand, palms facing each other.",
   "steps": [
    "Curl the dumbbells up without turning your wrists, elbows close to your body.",
    "Lower slowly."
   ],
   "breath": "Breathe out as you curl, in as you lower.",
   "focus": [
    "Thumbs up for the whole rep."
   ],
   "errors": [
    "Using momentum from your shoulders or back."
   ]
  }
 },
 "Curl poulie": {
  "fr": {
   "mus": "Biceps",
   "setup": "Face à la poulie basse, barre ou poignée en main, bras tendus.",
   "steps": [
    "Monte en pliant les coudes, gardés immobiles le long du corps.",
    "Redescends lentement : la poulie garde la tension tout du long."
   ],
   "breath": "Expire en montant, inspire en redescendant.",
   "focus": [
    "Coudes immobiles le long du corps."
   ],
   "errors": [
    "Reculer le buste pour aider à monter."
   ]
  },
  "en": {
   "mus": "Biceps",
   "setup": "Facing the low pulley, bar or handle in hand, arms straight.",
   "steps": [
    "Curl up by bending your elbows, kept still by your sides.",
    "Lower slowly: the pulley keeps tension all the way."
   ],
   "breath": "Breathe out as you curl, in as you lower.",
   "focus": [
    "Elbows still at your sides."
   ],
   "errors": [
    "Leaning your torso back to help lift."
   ]
  }
 },
 "Curl élastique debout": {
  "fr": {
   "mus": "Biceps",
   "setup": "Debout sur le milieu de l'élastique, pieds à largeur de hanches, une extrémité dans chaque main, paumes vers l'avant, bras tendus.",
   "steps": [
    "Plie les coudes pour monter les mains vers les épaules, coudes collés au corps.",
    "Redescends lentement jusqu'aux bras tendus."
   ],
   "breath": "Expire en montant, inspire en redescendant.",
   "focus": [
    "Écarte les pieds pour plus de résistance, rapproche-les pour moins."
   ],
   "errors": [
    "Avancer les coudes ou se balancer pour monter."
   ]
  },
  "en": {
   "mus": "Biceps",
   "setup": "Stand on the middle of the band, feet hip-width apart, one end in each hand, palms forward, arms straight.",
   "steps": [
    "Bend your elbows to bring your hands towards your shoulders, elbows tucked in.",
    "Lower slowly until your arms are straight."
   ],
   "breath": "Breathe out as you curl, in as you lower.",
   "focus": [
    "Widen your stance for more resistance, narrow it for less."
   ],
   "errors": [
    "Moving your elbows forward or swinging to lift."
   ]
  }
 },
 "Extension au-dessus de la tête à la poulie": {
  "fr": {
   "mus": "Triceps (partie longue)",
   "setup": "Dos à la poulie, corde au-dessus de la tête, coudes pliés et pointés vers l'avant.",
   "steps": [
    "Tends les bras vers l'avant et le haut, coudes immobiles.",
    "Reviens lentement jusqu'à l'étirement derrière la tête."
   ],
   "breath": "Expire en tendant les bras, inspire en revenant.",
   "focus": [
    "Serre le ventre pour ne pas cambrer le bas du dos."
   ],
   "errors": [
    "Écarter les coudes sur les côtés pendant l'effort."
   ]
  },
  "en": {
   "mus": "Triceps (long head)",
   "setup": "Back to the pulley, rope above your head, elbows bent and pointing forward.",
   "steps": [
    "Extend your arms forward and up, elbows still.",
    "Return slowly to the stretch behind your head."
   ],
   "breath": "Breathe out as you extend, in as you return.",
   "focus": [
    "Brace your abs so your lower back doesn't arch."
   ],
   "errors": [
    "Letting your elbows flare out to the sides."
   ]
  }
 },
 "Extension poulie haute à la corde": {
  "fr": {
   "mus": "Triceps",
   "setup": "Face à la poulie haute, corde en main, coudes collés au corps.",
   "steps": [
    "Pousse vers le bas en tendant les bras et écarte la corde en bas.",
    "Remonte lentement jusqu'à l'angle droit, sans décoller les coudes."
   ],
   "breath": "Expire en poussant vers le bas, inspire en remontant.",
   "focus": [
    "Seuls les avant-bras bougent."
   ],
   "errors": [
    "Laisser les coudes partir vers l'avant : les épaules prennent le relais."
   ]
  },
  "en": {
   "mus": "Triceps",
   "setup": "Facing the high pulley, rope in hand, elbows tucked against your body.",
   "steps": [
    "Push down to straight arms and spread the rope at the bottom.",
    "Return slowly to a right angle without moving your elbows."
   ],
   "breath": "Breathe out as you push down, in as you return.",
   "focus": [
    "Only your forearms move."
   ],
   "errors": [
    "Letting your elbows drift forward: your shoulders take over."
   ]
  }
 },
 "Extension triceps élastique debout": {
  "fr": {
   "mus": "Triceps",
   "setup": "Élastique accroché en hauteur (porte fermée, ancrage prévu pour), face à lui, mains sur l'élastique, coudes pliés et collés au corps.",
   "steps": [
    "Pousse vers le bas en tendant les bras, coudes immobiles.",
    "Remonte lentement jusqu'à l'angle droit."
   ],
   "breath": "Expire en poussant, inspire en remontant.",
   "focus": [
    "Vérifie que l'ancrage est solide avant de tirer."
   ],
   "errors": [
    "Laisser les coudes partir vers l'avant."
   ]
  },
  "en": {
   "mus": "Triceps",
   "setup": "Band anchored up high (closed door, purpose-made anchor), facing it, hands on the band, elbows bent and tucked in.",
   "steps": [
    "Push down by straightening your arms, elbows still.",
    "Return slowly to a right angle."
   ],
   "breath": "Breathe out as you push down, in as you return.",
   "focus": [
    "Check the anchor is secure before pulling."
   ],
   "errors": [
    "Letting your elbows drift forward."
   ]
  }
 },
 "Presse à cuisses amplitude limitée": {
  "fr": {
   "mus": "Quadriceps, fessiers",
   "setup": "Dos et fesses collés au siège, pieds à largeur de hanches au milieu de la plateforme.",
   "steps": [
    "Descends jusqu'à ce que les genoux forment environ un angle droit, sans douleur.",
    "Pousse avec tout le pied, sans verrouiller les genoux en haut."
   ],
   "breath": "Inspire en descendant, expire en poussant.",
   "focus": [
    "Genoux dans l'axe des pieds, sans les laisser rentrer."
   ],
   "errors": [
    "Laisser le bas du dos se décoller du siège en bas du mouvement."
   ]
  },
  "en": {
   "mus": "Quads, glutes",
   "setup": "Back and hips against the seat, feet hip-width apart in the middle of the platform.",
   "steps": [
    "Lower until your knees are at about a right angle, without pain.",
    "Push through your whole foot without locking your knees at the top."
   ],
   "breath": "Breathe in as you lower, out as you push.",
   "focus": [
    "Knees in line with your feet, don't let them cave in."
   ],
   "errors": [
    "Letting your lower back lift off the seat at the bottom."
   ]
  }
 },
 "Leg extension charge modérée": {
  "fr": {
   "mus": "Quadriceps",
   "setup": "Dos contre le dossier, l'axe de la machine aligné avec le genou, boudin sur le bas du tibia.",
   "steps": [
    "Tends les jambes en serrant les quadriceps une seconde en haut.",
    "Redescends lentement, sans laisser tomber la charge."
   ],
   "breath": "Expire en tendant les jambes, inspire en redescendant.",
   "focus": [
    "Mouvement lent et sans à-coup, surtout en haut."
   ],
   "errors": [
    "Charge trop lourde avec des à-coups : c'est dur pour les genoux."
   ]
  },
  "en": {
   "mus": "Quads",
   "setup": "Back against the pad, machine pivot aligned with your knee, roller on your lower shins.",
   "steps": [
    "Straighten your legs and squeeze your quads for a second at the top.",
    "Lower slowly without dropping the weight."
   ],
   "breath": "Breathe out as you extend, in as you lower.",
   "focus": [
    "Move slowly and smoothly, especially at the top."
   ],
   "errors": [
    "Too heavy with jerky reps: hard on the knees."
   ]
  }
 },
 "Hack squat amplitude limitée": {
  "fr": {
   "mus": "Quadriceps, fessiers",
   "setup": "Dos et épaules contre les appuis, pieds à largeur d'épaules sur la plateforme.",
   "steps": [
    "Descends en contrôlant jusqu'à un angle confortable, sans douleur aux genoux.",
    "Remonte en poussant avec tout le pied, genoux dans l'axe des orteils."
   ],
   "breath": "Inspire en descendant, expire en remontant.",
   "focus": [
    "Garde les talons au contact de la plateforme."
   ],
   "errors": [
    "Laisser les genoux rentrer vers l'intérieur en remontant."
   ]
  },
  "en": {
   "mus": "Quads, glutes",
   "setup": "Back and shoulders against the pads, feet shoulder-width apart on the platform.",
   "steps": [
    "Lower with control to a comfortable depth, without knee pain.",
    "Push back up through your whole foot, knees in line with your toes."
   ],
   "breath": "Breathe in as you lower, out as you rise.",
   "focus": [
    "Keep your heels on the platform."
   ],
   "errors": [
    "Letting your knees cave in on the way up."
   ]
  }
 },
 "Squat au poids du corps": {
  "fr": {
   "mus": "Quadriceps, fessiers",
   "setup": "Debout, pieds à largeur d'épaules ou un peu plus, pointes légèrement vers l'extérieur, mains derrière la tête (ou bras tendus devant toi pour l'équilibre).",
   "steps": [
    "Descends en poussant les hanches en arrière et en pliant les genoux, poids sur tout le pied.",
    "Remonte en poussant dans le sol jusqu'à être debout."
   ],
   "breath": "Inspire en descendant, expire en remontant.",
   "focus": [
    "Descends seulement jusqu'où ton dos reste droit et tes talons au sol."
   ],
   "errors": [
    "Laisser les genoux rentrer vers l'intérieur.",
    "Décoller les talons."
   ]
  },
  "en": {
   "mus": "Quads, glutes",
   "setup": "Stand with feet shoulder-width apart or a little wider, toes slightly out, hands behind your head (or arms in front of you for balance).",
   "steps": [
    "Lower by pushing your hips back and bending your knees, weight over the whole foot.",
    "Stand back up by pushing through the floor."
   ],
   "breath": "Breathe in as you lower, out as you stand.",
   "focus": [
    "Only go as low as you can with a straight back and heels down."
   ],
   "errors": [
    "Letting your knees cave in.",
    "Lifting your heels."
   ]
  }
 },
 "Goblet squat": {
  "fr": {
   "mus": "Quadriceps, fessiers, gainage",
   "setup": "Debout, pieds à largeur d'épaules, un haltère tenu verticalement contre la poitrine (mains sous la tête de l'haltère), coudes vers le bas. Avec une kettlebell : tiens-la par les côtés de la poignée, même mouvement.",
   "steps": [
    "Descends en gardant le buste droit et la charge contre la poitrine, coudes entre les genoux.",
    "Remonte en poussant dans le sol, genoux dans l'axe des pieds."
   ],
   "breath": "Inspire en descendant, expire en remontant.",
   "focus": [
    "La charge reste collée à la poitrine pendant tout le mouvement."
   ],
   "errors": [
    "Pencher le buste en avant et laisser la charge s'éloigner."
   ]
  },
  "en": {
   "mus": "Quads, glutes, core",
   "setup": "Stand with feet shoulder-width apart, a dumbbell held vertically against your chest (hands under the top end), elbows down. With a kettlebell: hold it by the sides of the handle, same movement.",
   "steps": [
    "Lower with your chest up and the weight against it, elbows between your knees.",
    "Stand up by pushing through the floor, knees in line with your feet."
   ],
   "breath": "Breathe in as you lower, out as you stand.",
   "focus": [
    "Keep the weight against your chest the whole time."
   ],
   "errors": [
    "Leaning forward and letting the weight drift away."
   ]
  }
 },
 "Hip thrust machine": {
  "fr": {
   "mus": "Fessiers",
   "setup": "Haut du dos contre l'appui, ceinture ou boudin sur les hanches, pieds à plat.",
   "steps": [
    "Pousse les hanches vers le haut en serrant les fessiers, menton rentré.",
    "Tiens une seconde en haut, puis redescends lentement."
   ],
   "breath": "Expire en montant les hanches, inspire en redescendant.",
   "focus": [
    "Tibias verticaux en haut du mouvement."
   ],
   "errors": [
    "Cambrer le bas du dos en haut au lieu de serrer les fessiers."
   ]
  },
  "en": {
   "mus": "Glutes",
   "setup": "Upper back against the pad, belt or roller on your hips, feet flat.",
   "steps": [
    "Drive your hips up while squeezing your glutes, chin tucked.",
    "Hold for a second at the top, then lower slowly."
   ],
   "breath": "Breathe out as you drive your hips up, in as you lower.",
   "focus": [
    "Shins vertical at the top."
   ],
   "errors": [
    "Arching your lower back at the top instead of squeezing your glutes."
   ]
  }
 },
 "Abduction hanche machine": {
  "fr": {
   "mus": "Fessiers (moyen fessier)",
   "setup": "Assis, dos contre le dossier, coussins contre l'extérieur des genoux.",
   "steps": [
    "Écarte les jambes en contrôlant, tiens une seconde.",
    "Reviens lentement, sans laisser les poids se toucher."
   ],
   "breath": "Expire en écartant, inspire en revenant.",
   "focus": [
    "Garde le dos contre le dossier sans te pencher."
   ],
   "errors": [
    "Faire des mouvements rapides et saccadés."
   ]
  },
  "en": {
   "mus": "Glutes (gluteus medius)",
   "setup": "Seated, back against the pad, pads on the outside of your knees.",
   "steps": [
    "Push your legs apart with control, hold for a second.",
    "Return slowly without letting the weights touch."
   ],
   "breath": "Breathe out as you push out, in as you return.",
   "focus": [
    "Keep your back on the seat without leaning."
   ],
   "errors": [
    "Doing fast, jerky reps."
   ]
  }
 },
 "Pont fessier au sol": {
  "fr": {
   "mus": "Fessiers, ischio-jambiers",
   "setup": "Allongé sur le dos, genoux pliés, pieds à plat à largeur de hanches, talons à environ une main des fesses, bras le long du corps.",
   "steps": [
    "Pousse dans les talons pour lever les hanches jusqu'à une ligne droite des genoux aux épaules.",
    "Serre les fessiers une seconde en haut, puis redescends lentement."
   ],
   "breath": "Expire en montant les hanches, inspire en redescendant.",
   "focus": [
    "Rentre légèrement le menton et garde les côtes basses."
   ],
   "errors": [
    "Monter trop haut en cambrant le bas du dos."
   ]
  },
  "en": {
   "mus": "Glutes, hamstrings",
   "setup": "Lie on your back, knees bent, feet flat and hip-width apart, heels about a hand's length from your glutes, arms by your sides.",
   "steps": [
    "Push through your heels to lift your hips into a straight line from knees to shoulders.",
    "Squeeze your glutes for a second at the top, then lower slowly."
   ],
   "breath": "Breathe out as you lift, in as you lower.",
   "focus": [
    "Tuck your chin slightly and keep your ribs down."
   ],
   "errors": [
    "Going too high by arching your lower back."
   ]
  }
 },
 "Abduction de hanche sur le côté": {
  "fr": {
   "mus": "Fessiers (moyen fessier)",
   "setup": "Allongé sur le côté, jambes tendues l'une sur l'autre, tête posée sur le bras, bassin vertical.",
   "steps": [
    "Monte la jambe du dessus d'environ 30 à 45°, pied parallèle au sol, sans tourner le bassin.",
    "Redescends lentement sans poser complètement la jambe."
   ],
   "breath": "Expire en montant la jambe, inspire en la redescendant.",
   "focus": [
    "Garde la jambe légèrement en arrière de l'axe du corps."
   ],
   "errors": [
    "Pivoter le bassin vers l'arrière pour monter plus haut."
   ]
  },
  "en": {
   "mus": "Glutes (gluteus medius)",
   "setup": "Lie on your side, legs straight and stacked, head resting on your arm, hips stacked vertically.",
   "steps": [
    "Raise your top leg about 30 to 45°, foot parallel to the floor, without rolling your hips.",
    "Lower slowly without fully resting the leg."
   ],
   "breath": "Breathe out as you lift, in as you lower.",
   "focus": [
    "Keep the leg slightly behind your body line."
   ],
   "errors": [
    "Rolling your hips back to lift higher."
   ]
  }
 },
 "Leg curl assis": {
  "fr": {
   "mus": "Ischio-jambiers",
   "setup": "Assis, genoux alignés avec l'axe de la machine, cuisses bloquées par l'appui.",
   "steps": [
    "Plie les jambes vers le bas et l'arrière, tiens une seconde.",
    "Remonte lentement jusqu'aux jambes presque tendues."
   ],
   "breath": "Expire en pliant les jambes, inspire en remontant.",
   "focus": [
    "Pieds relâchés, sans pousser avec les orteils."
   ],
   "errors": [
    "Décoller les fesses du siège pour finir le mouvement."
   ]
  },
  "en": {
   "mus": "Hamstrings",
   "setup": "Seated, knees aligned with the machine pivot, thighs held by the pad.",
   "steps": [
    "Bend your legs down and back, hold for a second.",
    "Return slowly until your legs are almost straight."
   ],
   "breath": "Breathe out as you curl, in as you return.",
   "focus": [
    "Relax your feet, don't push with your toes."
   ],
   "errors": [
    "Lifting your hips off the seat to finish the rep."
   ]
  }
 },
 "Leg curl allongé": {
  "fr": {
   "mus": "Ischio-jambiers",
   "setup": "Allongé sur le ventre, genoux juste après le bord du banc, boudin au-dessus des talons.",
   "steps": [
    "Ramène les talons vers les fesses, hanches collées au banc.",
    "Redescends lentement."
   ],
   "breath": "Expire en ramenant les talons, inspire en redescendant.",
   "focus": [
    "Garde le ventre et les hanches contre le banc."
   ],
   "errors": [
    "Lever les hanches du banc pour s'aider."
   ]
  },
  "en": {
   "mus": "Hamstrings",
   "setup": "Lying face down, knees just past the edge of the bench, roller above your heels.",
   "steps": [
    "Bring your heels towards your glutes, hips pressed into the bench.",
    "Lower slowly."
   ],
   "breath": "Breathe out as you curl, in as you lower.",
   "focus": [
    "Keep your belly and hips on the bench."
   ],
   "errors": [
    "Lifting your hips off the bench to help."
   ]
  }
 },
 "Charnière de hanches sans charge": {
  "fr": {
   "mus": "Ischio-jambiers, fessiers, bas du dos",
   "setup": "Debout, pieds à largeur de hanches, genoux légèrement fléchis, mains sur les hanches ou un bâton le long du dos.",
   "steps": [
    "Pousse les hanches vers l'arrière en penchant le buste, dos plat, jusqu'à sentir l'étirement derrière les cuisses.",
    "Reviens debout en poussant les hanches vers l'avant et en serrant les fessiers."
   ],
   "breath": "Inspire en te penchant, expire en te redressant.",
   "focus": [
    "Avec un bâton : il touche la tête, le haut du dos et le bassin pendant tout le mouvement."
   ],
   "errors": [
    "Plier les genoux comme pour un squat au lieu de reculer les hanches."
   ]
  },
  "en": {
   "mus": "Hamstrings, glutes, lower back",
   "setup": "Stand with feet hip-width apart, knees slightly bent, hands on your hips or a stick along your back.",
   "steps": [
    "Push your hips back as you lean forward with a flat back, until you feel a stretch in your hamstrings.",
    "Stand back up by driving your hips forward and squeezing your glutes."
   ],
   "breath": "Breathe in as you hinge, out as you stand.",
   "focus": [
    "With a stick: it touches your head, upper back and pelvis throughout."
   ],
   "errors": [
    "Bending your knees like a squat instead of pushing your hips back."
   ]
  }
 },
 "Soulevé de terre roumain haltères": {
  "fr": {
   "mus": "Ischio-jambiers, fessiers, bas du dos",
   "setup": "Debout, pieds à largeur de hanches, un haltère dans chaque main (ou une kettlebell à deux mains) devant les cuisses, genoux légèrement fléchis.",
   "steps": [
    "Recule les hanches en faisant glisser la charge le long des jambes, dos plat, jusqu'à mi-tibia ou à l'étirement des ischios.",
    "Remonte en poussant les hanches vers l'avant, charge près du corps."
   ],
   "breath": "Inspire en descendant, expire en remontant.",
   "focus": [
    "La charge frôle les jambes pendant tout le mouvement."
   ],
   "errors": [
    "Arrondir le dos pour descendre plus bas."
   ]
  },
  "en": {
   "mus": "Hamstrings, glutes, lower back",
   "setup": "Stand with feet hip-width apart, a dumbbell in each hand (or a kettlebell in both hands) in front of your thighs, knees slightly bent.",
   "steps": [
    "Push your hips back as the weight slides down your legs, back flat, to mid-shin or a hamstring stretch.",
    "Stand up by driving your hips forward, keeping the weight close."
   ],
   "breath": "Breathe in as you lower, out as you stand.",
   "focus": [
    "The weight stays close to your legs throughout."
   ],
   "errors": [
    "Rounding your back to go lower."
   ]
  }
 },
 "Adduction machine": {
  "fr": {
   "mus": "Adducteurs (intérieur des cuisses)",
   "setup": "Assis, dos contre le dossier, coussins contre l'intérieur des genoux.",
   "steps": [
    "Rapproche les jambes en contrôlant, tiens une seconde.",
    "Reviens lentement jusqu'à un écart confortable."
   ],
   "breath": "Expire en rapprochant, inspire en revenant.",
   "focus": [
    "Commence avec un écart réduit et augmente progressivement."
   ],
   "errors": [
    "Ouvrir trop grand dès le départ avec une charge lourde."
   ]
  },
  "en": {
   "mus": "Adductors (inner thighs)",
   "setup": "Seated, back against the pad, pads on the inside of your knees.",
   "steps": [
    "Bring your legs together with control, hold for a second.",
    "Return slowly to a comfortable width."
   ],
   "breath": "Breathe out as you squeeze in, in as you return.",
   "focus": [
    "Start with a small range and widen it gradually."
   ],
   "errors": [
    "Starting too wide with a heavy weight."
   ]
  }
 },
 "Mollets assis": {
  "fr": {
   "mus": "Mollets (soléaire)",
   "setup": "Assis, genoux sous l'appui, avant des pieds sur la marche.",
   "steps": [
    "Descends les talons le plus bas possible et marque une pause dans l'étirement.",
    "Monte sur la pointe des pieds le plus haut possible, tiens une seconde."
   ],
   "breath": "Expire en montant, inspire en descendant.",
   "focus": [
    "Mouvement lent, avec une pause en haut et en bas."
   ],
   "errors": [
    "Rebondir en bas : marque une vraie pause pour que le mollet travaille."
   ]
  },
  "en": {
   "mus": "Calves (soleus)",
   "setup": "Seated, knees under the pad, balls of your feet on the step.",
   "steps": [
    "Lower your heels as far as possible and pause in the stretch.",
    "Rise onto your toes as high as possible and hold for a second."
   ],
   "breath": "Breathe out as you rise, in as you lower.",
   "focus": [
    "Move slowly, with a pause at the top and bottom."
   ],
   "errors": [
    "Bouncing at the bottom: pause properly so your calves do the work."
   ]
  }
 },
 "Mollets debout machine": {
  "fr": {
   "mus": "Mollets (jumeaux)",
   "setup": "Debout, épaules sous les appuis, avant des pieds sur la marche, jambes tendues.",
   "steps": [
    "Descends les talons le plus bas possible et marque une pause dans l'étirement.",
    "Monte sur la pointe des pieds le plus haut possible, tiens une seconde."
   ],
   "breath": "Expire en montant, inspire en descendant.",
   "focus": [
    "Genoux tendus mais pas verrouillés."
   ],
   "errors": [
    "Rebondir en bas : marque une vraie pause pour que le mollet travaille."
   ]
  },
  "en": {
   "mus": "Calves (gastrocnemius)",
   "setup": "Standing, shoulders under the pads, balls of your feet on the step, legs straight.",
   "steps": [
    "Lower your heels as far as possible and pause in the stretch.",
    "Rise onto your toes as high as possible and hold for a second."
   ],
   "breath": "Breathe out as you rise, in as you lower.",
   "focus": [
    "Knees straight but not locked."
   ],
   "errors": [
    "Bouncing at the bottom: pause properly so your calves do the work."
   ]
  }
 },
 "Mollets à la presse": {
  "fr": {
   "mus": "Mollets",
   "setup": "À la presse à cuisses, seulement l'avant des pieds sur le bas de la plateforme, jambes presque tendues.",
   "steps": [
    "Descends les talons le plus bas possible et marque une pause dans l'étirement.",
    "Monte sur la pointe des pieds le plus haut possible, tiens une seconde."
   ],
   "breath": "Expire en poussant, inspire en revenant.",
   "focus": [
    "Garde les crochets de sécurité de la presse prêts."
   ],
   "errors": [
    "Rebondir en bas : marque une vraie pause pour que le mollet travaille."
   ]
  },
  "en": {
   "mus": "Calves",
   "setup": "On the leg press, only the balls of your feet on the bottom of the platform, legs almost straight.",
   "steps": [
    "Lower your heels as far as possible and pause in the stretch.",
    "Rise onto your toes as high as possible and hold for a second."
   ],
   "breath": "Breathe out as you push, in as you return.",
   "focus": [
    "Keep the leg press safety catches ready."
   ],
   "errors": [
    "Bouncing at the bottom: pause properly so your calves do the work."
   ]
  }
 },
 "Mollets debout au poids du corps": {
  "fr": {
   "mus": "Mollets (jumeaux)",
   "setup": "Debout, avant des pieds sur une marche stable, talons dans le vide, une main contre un mur pour l'équilibre.",
   "steps": [
    "Descends les talons sous la marche et marque une pause dans l'étirement.",
    "Monte sur la pointe des pieds le plus haut possible et tiens une seconde."
   ],
   "breath": "Inspire en descendant, expire en montant.",
   "focus": [
    "Sans marche, fais-le à plat au sol : l'amplitude est plus petite mais l'exercice reste utile."
   ],
   "errors": [
    "Rebondir en bas au lieu de marquer la pause."
   ]
  },
  "en": {
   "mus": "Calves (gastrocnemius)",
   "setup": "Stand with the balls of your feet on a stable step, heels hanging off, one hand on a wall for balance.",
   "steps": [
    "Lower your heels below the step and pause in the stretch.",
    "Rise onto your toes as high as you can and hold for a second."
   ],
   "breath": "Breathe in as you lower, out as you rise.",
   "focus": [
    "Without a step, do it flat on the floor: smaller range, still useful."
   ],
   "errors": [
    "Bouncing at the bottom instead of pausing."
   ]
  }
 },
 "Crunch à la poulie": {
  "fr": {
   "mus": "Abdominaux (grand droit)",
   "setup": "À genoux face à la poulie haute, corde tenue près de la tête.",
   "steps": [
    "Enroule le dos vers le bas en rapprochant les côtes du bassin, hanches immobiles.",
    "Remonte lentement en gardant la tension dans le ventre."
   ],
   "breath": "Expire en enroulant le dos, inspire en remontant.",
   "focus": [
    "Hanches fixes : c'est le dos qui s'enroule."
   ],
   "errors": [
    "Tirer avec les bras ou s'asseoir sur les talons au lieu d'enrouler le dos."
   ]
  },
  "en": {
   "mus": "Abs (rectus abdominis)",
   "setup": "Kneeling facing the high pulley, rope held next to your head.",
   "steps": [
    "Curl your spine down, bringing your ribs towards your pelvis, hips still.",
    "Come back up slowly, keeping tension in your abs."
   ],
   "breath": "Breathe out as you curl down, in as you rise.",
   "focus": [
    "Hips fixed: your back does the curling."
   ],
   "errors": [
    "Pulling with your arms or sitting back on your heels instead of curling your spine."
   ]
  }
 },
 "Dead bug": {
  "fr": {
   "mus": "Abdominaux (transverse, grand droit)",
   "setup": "Allongé sur le dos, bras tendus vers le plafond, hanches et genoux pliés à 90°, bas du dos plaqué au sol.",
   "steps": [
    "Garde les bras tendus vers le plafond et allonge lentement une jambe vers le sol, sans décoller le bas du dos.",
    "Ramène la jambe, puis change de jambe."
   ],
   "breath": "Expire en allongeant la jambe, inspire en la ramenant.",
   "focus": [
    "Va seulement aussi loin que ton bas du dos reste au sol ; plus tard, tu pourras ajouter le bras opposé."
   ],
   "errors": [
    "Aller trop vite ou laisser le dos se cambrer."
   ]
  },
  "en": {
   "mus": "Abs (deep core, rectus abdominis)",
   "setup": "Lie on your back, arms straight up to the ceiling, hips and knees bent at 90°, lower back pressed into the floor.",
   "steps": [
    "Keep your arms pointing at the ceiling and slowly extend one leg towards the floor, without lifting your lower back.",
    "Bring the leg back, then switch legs."
   ],
   "breath": "Breathe out as you extend the leg, in as you bring it back.",
   "focus": [
    "Only go as far as your lower back stays down; later you can add the opposite arm."
   ],
   "errors": [
    "Rushing or letting your back arch."
   ]
  }
 },
 "Planche sur les avant-bras": {
  "fr": {
   "mus": "Abdominaux, gainage, épaules",
   "setup": "Avant-bras au sol, coudes sous les épaules, jambes tendues sur la pointe des pieds, corps droit de la tête aux talons.",
   "steps": [
    "Serre le ventre et les fessiers pour garder la ligne droite.",
    "Tiens la position le temps prévu, puis repose les genoux."
   ],
   "breath": "Respire calmement et régulièrement, sans bloquer ton souffle.",
   "focus": [
    "Exercice statique : arrête la série dès que le bassin descend ou monte."
   ],
   "errors": [
    "Laisser le bassin tomber vers le sol.",
    "Monter les fesses en pointe."
   ]
  },
  "en": {
   "mus": "Abs, core, shoulders",
   "setup": "Forearms on the floor, elbows under your shoulders, legs straight on your toes, body straight from head to heels.",
   "steps": [
    "Squeeze your abs and glutes to hold the straight line.",
    "Hold for the planned time, then lower your knees."
   ],
   "breath": "Breathe calmly and steadily, never hold your breath.",
   "focus": [
    "Static exercise: stop the set as soon as your hips sag or rise."
   ],
   "errors": [
    "Letting your hips sag.",
    "Piking your hips up."
   ]
  }
 }
};
