---
name: sid-relais
description: Travail à deux (Claude Code + Codex) sur Sid'Compagnon avec un minimum de tokens inutiles — lectures ciblées, carte du projet, relais compacts via tmux-bridge, vérifications déterministes. À charger au début d'un lot partagé, avant d'envoyer un relais, et au changement de contexte.
---

# Sid'relais — travailler à deux sans gaspiller

Skill de projet (v77, 8 nov. 2026). Commun : `.claude/skills/sid-relais/` (Claude Code) = `.agents/skills/sid-relais/` (Codex, lien). Aucun skill externe de gestion du contexte n'a été audité : celui-ci le remplace. Il n'affaiblit **aucune** vérification ni règle de sécurité.

## 1. Avant de lire
- Consulter d'abord la **carte** (§ 5) et le dernier `docs/refonte/relais-codex-NN.md` ; ne pas réexplorer ce qui y est conclu.
- Chercher avant de lire : `grep -n`/`rg -n` avec un motif précis, puis lire **la plage utile** (`sed -n a,bp`, `Read offset/limit`). Jamais un fichier de plus de 200 lignes en entier sans raison (`site/app.js`, `i18n.js`, `index.html`, `app.css` : toujours par motif).
- Sorties bornées : `| head`, `| tail`, `cut -c1-200`, `grep -c` pour compter, `--stat` pour un diff.
- Charger seulement les skills du lot (ex. `sid-charte` pour l'interface). Pas de sous-agent sans bénéfice clair (il repart de zéro). Ce skill n'autorise pas à lancer d'autres agents : le travail en cours est limité à Claude Code et Codex.

## 2. Pendant le travail
- Un responsable par fichier (tableau du `README.md` ou du relais). Fichier de l'autre : demander ou envoyer un patch.
- Tâche répétitive → script déterministe (Python/Node dans le scratchpad, appliqué en une fois, vérifié par un test), pas des dizaines d'éditions à la main.
- Vérifier par un test ciblé (`tests/*.test.*`) relancé tel quel ; un parcours complet seulement avant l'intégration.
- Revue de l'autre agent : limitée au diff et à ses dépendances (`git show --stat`, puis hunks utiles).

## 3. Relais compact (message tmux-bridge ou fichier)
Format, 10 lignes au plus ; au-delà : un fichier `docs/refonte/relais-codex-NN.md` et son chemin.
```
Lot X — état : fait | en cours | bloqué
Fichiers : a.js (l. 10-40), b.css
Contrat/interface : (seulement s'il change)
Vérifié : test-x OK, test-y OK (commande exacte)
Ouvert : question précise ou prochaine action
```
Interdits : recopier l'historique, un gros fichier, une sortie d'outil entière, des confirmations sans contenu (« bien reçu, je continue »), un pourcentage d'économie non mesuré.

## 4. Canal tmux-bridge (pièges vérifiés)
- Règle `smux` : `read` → `message` → `read` (vérifier que le texte est bien dans la saisie, **avant** Entrée) → `read` → `keys Enter`. Chaque `keys` est précédé du `read` exigé par le garde.
- **Exception locale demandée par Sid** (8 nov.), qui s'écarte de `smux` : une seule relecture courte de la ligne de saisie après Entrée, pour constater que le message est parti (un texte resté dans la saisie n'est pas un échange). Jamais pour attendre la réponse, jamais en boucle.
- Si le TUI de Codex affiche réellement « tab to queue message », envoyer `keys codex Tab` (après un `read`) et vérifier « Queued follow-up inputs ». Pas de Tab systématique : il dépend de la version et de ce qui est visible.
- La réponse arrive dans le panneau de l'expéditeur.

## 5. Carte du projet (à tenir courte et à jour)
- Dépôt réel : `~/sidcompagnon` (main = production Vercel). Worktrees : Claude `~/sidcompagnon-claude`, Codex `~/sidcompagnon-codex`.
- `site/app.js` et `site/react/` sont **générés** (`cd app && npm run build`) : seul l'intégrateur les reconstruit et les committe.
- Version : `APP_V` (04), `BUILD` (46), `CACHE` (`site/sw.js`), texte de version (`index.html`) — ensemble.
- Noms : `MARQUES` (`site/i18n.js`) ; FR + EN seulement ; nouvelles chaînes EN dans `DICT`.
- Tests navigateur : `LD_LIBRARY_PATH=~/.local/share/refonte-libs/usr/lib/x86_64-linux-gnu`, serveur `node tests/serve.js` (8766 + faux Supabase 8790 ; un seul à la fois).
- Secrets : `~/sidcompagnon/secrets/` (jamais lus à l'écran, jamais committés).

## 6. Changement de contexte
Avant une compaction ou une fin de session : écrire dans le relais en cours l'état, les fichiers touchés, les contrats, les vérifications passées et la prochaine action ; mettre à jour la mémoire durable seulement pour ce qui n'est pas dans le dépôt.

## 7. Mesures
Les deux outils n'exposent pas ici de compteur fiable de tokens : décrire les gaspillages évités (relectures, sorties longues, explorations en double), sans chiffre inventé.
