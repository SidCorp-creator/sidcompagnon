# Passation — Sid'compagnon

Dernière mise à jour : **4 nov. 2026** (Claude Code + Codex, sur le PC de Sid).

## Où en est le projet
- **En ligne** (sidcompagnon.com, Vercel) : **74.3**. Connecteur `mcp` en ligne : **v14** (« 1.7.0 »).
- **`main` local (`~/sidcompagnon`)** : 74.4, **pas encore poussée** (2 commits d'avance sur `origin/main`).
- **Branche `correctifs-74-5`** (partie de `main` local) : lot 74.5, **locale seulement**, à faire relire par Sid avant toute fusion.
- Le connecteur du dépôt est en **v16 (« 1.8.0 »)**, pas encore déployé. Il contient la v15 (objectif du programme → `prefs.muGoal`) et l'attente de la photo du lot 74.5.

## Ce qui bloque la mise en ligne
1. **GitHub** : ce PC n'a pas d'identifiants (`git push` → « could not read Username »). À faire par Sid une fois : `! sudo apt install -y gh && gh auth login && gh auth setup-git`.
2. **Supabase** : la CLI n'est pas connectée. À faire par Sid une fois : `! cd ~/sidcompagnon && npx -y supabase login`, puis `npx supabase functions deploy mcp --no-verify-jwt --project-ref eloeoaidgbkygazwjwiu` (Verify JWT doit rester OFF).
3. **Accord de Sid** pour fusionner `correctifs-74-5` dans `main` et pousser (une mise en ligne = un `git push origin main`).

Ordre conseillé : examiner la branche → fusionner dans `main` → `git push` → vérifier `https://sidcompagnon.com/sw.js` (`sidnote-v74-5`) → déployer le connecteur v16.

## Lot 74.5 (branche `correctifs-74-5`)
Voir l'entrée « 74.5 » de `CLAUDE.md` pour le détail (fichiers, fonctions, raisons, tests). En bref : nom complet des exercices,
plus de ligne rouge dans les cartes de notes, « Partager » dans le lecteur PDF, parcours photo de la Nutrition fiabilisé
(causes trouvées par Codex) + bouton Galerie, « À éviter » vide pour un nouveau profil, carte Sid'note de l'accueil lisible.

## Limites connues
- Photo de la Nutrition : l'app ouvre Claude **pendant** le toucher (obligatoire sur iPhone), avant la fin du dépôt de la photo. Le connecteur v16 attend jusqu'à 15 s la photo annoncée par son numéro (`photo=<n>` dans le message, `nutri.photoId`) : en pratique suffisant, pas une garantie absolue. Une garantie stricte demanderait un 2ᵉ toucher (« Ouvrir Claude » quand la photo est prête) : choix à faire par Sid.
- Musculation : les séries « touchées aujourd'hui » (`data.ui.msT`) restent propres à l'appareil ; reprendre la même séance le même jour sur un autre appareil réécrit l'entrée du jour avec les seules séries de cet appareil.
- HEIC / orientation des photos iPhone, choix Photo / Galerie : à vérifier sur un vrai iPhone.
- Les captures d'écran de Sid (images 1 à 4) n'étaient pas lisibles par Claude Code dans cette session : les corrections ont été faites d'après la description et le code.

## Outils sur ce PC
- Session tmux avec deux panneaux : `claude` (Claude Code) et `codex` (Codex CLI), messages par `tmux-bridge`. Codex relit en lecture seule ; Claude Code écrit dans le dépôt.
- Test navigateur sans `sudo` : bibliothèques de Chromium (libnss3, libnspr4, libasound2t64) extraites avec `apt-get download` + `dpkg -x` dans un dossier temporaire, puis `LD_LIBRARY_PATH=<dossier>/usr/lib/x86_64-linux-gnu`, et `NODE_PATH` vers un `playwright` installé à part et vers `app/node_modules`. Commande : `node tests/smoke.js`.
- Tests rapides : `NODE_PATH=app/node_modules node tests/<crypto|memory|merge|rappels|shell>.test.js`.
