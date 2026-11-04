# Passation — Sid'compagnon

Dernière mise à jour : **4 nov. 2026** (Claude Code + Codex, sur le PC de Sid).

## Où en est le projet
- **En ligne** (sidcompagnon.com, Vercel) : **74.5**, publiée le 4 nov. 2026 (commit `530f3bf` sur `main`, même contenu que la branche `correctifs-74-5`, qui garde l'historique détaillé en 3 commits). Vérifiée par Sid sur son iPhone : tout fonctionne.
- **Connecteur `mcp`** : v16 (« 1.8.0 ») déployé sur Supabase (révision 15, Verify JWT OFF).
- `main` local = `origin/main`.

## Comment publier depuis ce PC
- Le terminal (WSL) n'a **pas** d'identifiants GitHub : `git push` échoue (« could not read Username »).
- Ce qui marche : **Codex**, par le connecteur GitHub déjà relié au compte `SidCorp-creator` (publication par l'API GitHub, en un commit). Après une publication par Codex, faire `git fetch` puis aligner `main` local sur `origin/main`.
- Le connecteur `mcp` se déploie par l'outil Supabase (Claude ou Codex), en gardant Verify JWT OFF.

## Lot 74.5 (en ligne)
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
