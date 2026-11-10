# Journal de passation v81 (skill gestion-contexte-tokens)

### 2026-11-11 — Claude — démarrage
Décision : répartition figée (coordination.md § 3) après échange tmux-bridge avec Codex.
Preuve : messages tmux-bridge %0↔%1 ; base origin/main 81e39b0.
Fichiers : docs/v81/{brief,coordination,journal}.md, .claude/skills/gestion-contexte-tokens/SKILL.md
Prochaine étape : Claude → recherche nutrition + `lire_note` (mcp) ; Codex → inventaire Sid'Note.

### 2026-11-11 — Claude — constats
- `lire_note` (supabase/functions/mcp/index.ts l. 690-695) renvoie seulement `# titre` + `body`. PDF de note : `documents/<uid>/notes/<id>.pdf`, non chiffré (29-notes-libres.js l. 233-237).
- Ancien parcours Claude : `git show ef2ae43^:app/src/shell/31-connecteur-claude.js` (AIS.claude, mcpCreate, lien pré-rempli `claude.ai/customize/connectors?modal=add-custom-connector`).
- Chrono libre retiré en v44 ; chrono de séance = `data.ui.msRun` (local, saveUI sans synchro, 24-objectif… l. 81-90) ; Focus = `data.pomo.run` (15-pomodoro.js).
- Nutrition actuelle : `nuCall` (39-nutrition.js l. 19-25) → fonction `nutrition` (mémoire food_answers/foods) sinon Sid'Bot. Pas de code-barres.
