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

### 2026-11-11 — Claude — mcp lire_note + pièces jointes (FAIT, en ligne)
Décision : extraction texte côté serveur (npm:unpdf@1.8.1) + photos de note en image ; mêmes contrôles (clé → user_id, ni secrète ni supprimée, chemins notes/ de la note seulement) ; coffre jamais lu. Version connecteur 1.9.0.
Preuve : déployé par `npx supabase@2.48.3 functions deploy mcp --no-verify-jwt --use-api` ; `POST /mcp/<faux>` → « Clé inconnue » ; vrai connecteur : `lire_note mwbc4usw3y7zp` → « Code du casier du labo : ORCHIDEE-7342 » (présent uniquement dans le PDF) ; PDF réel de l'app (7 pages) lu ; `notes` affiche « [pièces jointes : PDF] ». `deno check` : seule l'erreur préexistante l. ~621 (cal null).
Fichiers : supabase/functions/mcp/index.ts (l. 9-10, 300-310, 559-600, dispatch tools/call)
Données de test : note « Test v81 — PDF joint (à supprimer) » (id mwbc4usw3y7zp) + documents/<uid Sid>/notes/mwbc4usw3y7zp.pdf → à supprimer après la livraison (ou par Sid).
Prochaine étape : relais Edge `aliments` (OFF), Sid'Bot → Claude, notifications.

### 2026-11-11 — Codex — Sid’Note
Décision : Focus et Projets sous Sid’Note. Pagination horizontale dans le champ riche existant. Export ZIP des PDF du coffre avec manifeste, CSV des mots de passe, puis retrait des écrans. Les données du coffre restent accessibles à l’export dans Réglages.
Preuves : commits e3f892f et fb7bd99. Chromium 390 px, parcours Focus React et secours, création et rattachement dans Projets, édition et annulation sur une note longue. Export chiffré de test déverrouillé via l’interface, CRC ZIP et octets PDF vérifiés, CSV relu.
Fichiers : app/src/shell/07, 26, 29, 29c, 35a, site/index.html et site/app.css.
Prochaine étape : valider le parcours avec le nouveau bouton Claude et conserver les données du coffre jusqu’à vérification des exports réels.

### 2026-11-11 — Codex — Focus, MCP et nutrition
Décision : fusion du chrono Focus et de son identifiant de séance. Pièces jointes avec identifiants filtrés avant lecture. Ciqual local pour les génériques et relais `aliments` pour les produits emballés.
Preuves : `node tests/chrono-persistant.test.cjs` OK (fermeture complète, deux onglets, arrêt, déduplication). `node tests/nutrition-catalog.test.cjs` OK (Ciqual réel, relais simulé, React et secours). Échantillon réel et liens dans nutrition-codex.md.
Fichiers : app/src/shell/15 et 39a, supabase/functions/{mcp,aliments}, site/ciqual-2025.json.
Prochaine étape : recevoir Sid’Bot → Claude, notifications et chrono de musculation. Régénérer les bundles et lancer les tests de la branche réunie.
