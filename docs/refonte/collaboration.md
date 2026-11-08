# Collaboration Claude Code ↔ Codex — consignes communes (v76)

Courtes et durables. Elles ne remplacent ni `CLAUDE.md` ni la charte ; elles disent **comment travailler à deux sans gaspiller**. Rien ici n'affaiblit la sécurité ni les vérifications.

## Communes aux deux agents
1. **Canal** : `tmux-bridge` (session `projet-sidcompagnon`, panneaux `claude` / `codex`). Un message = une action attendue, une décision, un blocage ou « lot prêt + commit ». Pas d'accusé de réception ni de confirmation répétée.
2. **Relais minimal** : fichiers touchés, contrat d'interface, question précise. Pour un long contenu : un fichier `docs/refonte/relais-*.md` et son chemin dans le message, jamais le contenu recopié.
3. **Un responsable par fichier** (tableau du `README.md`, section v76). Fichier de l'autre : demander, ou envoyer un patch ; jamais d'édition simultanée. `site/app.js` et `site/react/` sont générés : seul l'intégrateur les reconstruit.
4. **Exploration ciblée** : `grep`/`rg` avec motif précis, lectures par plage de lignes, sorties bornées (`| head`, `cut -c`), et conclusions partagées une fois (dans le relais), pas redécouvertes.
5. **Vérifications déterministes** : un test par comportement changé (`tests/*.test.*`), relancé tel quel ; revues limitées au diff et à ses dépendances.
6. **Sous-agents** : aucun sans bénéfice clair (ils repartent de zéro).
7. **Git** : chacun son worktree et sa branche, base commune ; ne jamais committer de lien local (`node_modules`) ni de secret ; identité du projet `SidCorp-creator` passée par `git -c user.name=… -c user.email=…`.

## Adaptations par outil
- **Claude Code** : skills chargés seulement s'ils servent (ici : `smux`, `sid-charte`) ; tests navigateur avec `LD_LIBRARY_PATH=~/.local/share/refonte-libs/usr/lib/x86_64-linux-gnu`.
- **Codex CLI** : quand Codex est occupé, Entrée ne soumet pas le message tapé par `tmux-bridge` (« tab to queue message ») : l'expéditeur envoie `tmux-bridge keys codex Tab` et vérifie « Queued follow-up inputs ». C'est ce qui a fait croire Codex inactif le 8 nov.
- Le bandeau tmux affiche `claude`/`codex` via un format de fenêtre codé en dur ; un 3e panneau reçoit son propre format (`tmux set -p -t %N pane-border-format ' nom '`).

## Mesures
Aucun des deux outils n'expose ici de compteur fiable de tokens de développement : aucune économie chiffrée n'est revendiquée. Améliorations observables en v76 : brief stocké une fois dans `brief-76.md` (pas recopié), contrats fixés une fois (Sid'Bot, `log_meal`), 13 tests ciblés au lieu de relancer le parcours complet à chaque retouche, revues croisées limitées aux commits cités.

## Skills
Inventaire utilisé : Claude Code — `smux`, `sid-charte` (projet) ; disponibles mais non chargés faute de besoin : `code-review`, `security-review`, `simplify`, `run`. Codex — `smux`, Supabase et bonnes pratiques Postgres (lot E1). Aucun skill tiers « économie de tokens » installé : pas de source vérifiée et compatible trouvée dans le temps de la v76 ; les règles ci-dessus tiennent lieu de workflow.

## Tokens de Sid'Bot (usage produit, distinct)
Historique limité (10 messages, 20 000 caractères côté app ; bornes serveur 20 / 24 000), contexte résumé par app et retirable, réponse plafonnée côté serveur, quota quotidien par personne (`SIDBOT_DAILY_LIMIT`), aucun réessai automatique.
