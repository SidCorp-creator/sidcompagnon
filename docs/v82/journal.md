# Journal de passation v82

### 2026-11-11 — Codex — démarrage et prototype
Décision : base d25b94d, branche v82-codex ; Claude prend pastilles/retrait Projets, Codex pagination verticale/intégration, revue croisée.
Preuve : prototype /tmp/v82-prototype.cjs Chromium vert (paragraphe long, liste imbriquée, undo) ; CSS Shapes réserve les intervalles entre pages sans modifier le DOM éditable.
Fichiers en cours : 29-notes-libres.js, bloc .note-pages de app.css, éditeur index.html. Aucun changement du format stocké ou du PDF.
Prochaine étape : tests dans le vrai éditeur, long contenu, sélection, collage, annulation, redimensionnement et clavier simulé ; recevoir les commits et hunks de Claude.

### 2026-11-11 — Codex — pagination verticale, sources prêtes pour revue
Décision : pseudo-élément flottant avec shape-outside polygon réserve les interpages ; le navigateur répartit les lignes sans modifier le DOM, y compris paragraphes longs et listes. Composition : recalcul différé jusqu’à compositionend.
Preuve : build, tests/notes-v81.test.cjs et tests/note-pdf.test.cjs verts ; contrôle des lignes hors interpages, sélection/remplacement entre pages et undo, collage riche et undo, HTML/texte brut identiques après sauvegarde/réouverture, resize 320/390/1280 et viewport clavier 440 px. Capture /tmp/v82-pages.png. Chromium seul à ce stade ; Safari réel non vérifié.
Fichiers : 29-notes-libres.js, .note-pages dans app.css, éditeur index.html, tests/notes-v81.test.cjs. MDN shape-outside consulté : https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/shape-outside (11 novembre 2026).
Prochaine étape : relecture Claude, réception de ses commits/hunks, intégration version 82 et parcours commun.

### 2026-11-11 — Codex — curseur et note vide
Décision : conserver le défilement pendant la mesure du flux puis révéler le curseur replié, car le recalcul pouvait le laisser hors viewport. Le placeholder des notes vides passe sur ::after, la forme de pagination reste sur ::before.
Preuve : test navigateur réel 17 pages : caret dans viewport (809–828 sur 844 px), lignes hors interpages, undo intact ; tests/notes-v81.test.cjs renforcé sur la visibilité du curseur.
Fichiers : 29-notes-libres.js, app.css, tests/notes-v81.test.cjs.
Prochaine étape : relecture croisée et intégration des commits de Claude.

### 2026-11-11 — Claude et Codex — répartition
Décision : Claude = pastille rouge (logo tuile lanceur + vhead de l'app ; jamais dans une autre app ni sur la nav) + retrait de Projets (données gardées). Codex = pages verticales (une zone éditable, mesure par lignes, prototype d'abord) + intégration (v82, CACHE/BUILD). Relecture croisée.
Preuve : échange tmux-bridge du 11 nov. ; captures de Sid 141414 (lanceur) et 141429 (bandeau à retirer).
Base : d25b94d (inclut les retouches v81.1 non publiées). Claude : ~/sidcompagnon-v82 (v82-claude).
Prochaine étape : Claude code la pastille ; Codex prototype la pagination.

### 2026-11-11 — Claude — pastille + retrait de Projets (FAIT, à relire)
Décision : la zone .day-notif est retirée. Pastille = enveloppe .logo-badged[data-badge-app] + ::after(data-n), posée par renderAppBadges (09), sur la tuile du lanceur (simple et détaillée), le vhead (shell et React) et nulle part ailleurs. Les compteurs de la barre latérale d'une autre app (« 3 à venir ») sont masqués hors de cette app. Projets : écran, onglet, liens, i18n et BK_LISTS retirés ; data.noteProjects et n.project sont gardés ; 29c ne garde que focusSessions et recordFocusSession.
Preuve : node tests/notif-planning.test.cjs OK (vide, tâche seule, 3, ajout, modification, suppression, notes/pomo/muscu/nutri à 390 et 1280, barre latérale, lanceur détaillé, minuit, EN, taille). notes-v81 (partie Projets réécrite), accueil, sidnote-claude, sidbot, chrono-persistant, agenda-minuit, shell et merge OK. Captures 390/1280 clair et sombre relues.
Fichiers : app/src/shell/{04,07,09,12,15,29,29c}, app/src/{Home,Shell}.tsx, site/{index.html,i18n.js,app.css}, tests/{notif-planning.test.cjs,notes-v81.test.cjs,elan.js}.
Prochaine étape : Codex intègre (bundle reconstruit) ; Claude relit la pagination de v82-codex.
