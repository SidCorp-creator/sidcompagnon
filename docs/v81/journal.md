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
### 2026-11-11 — Claude — aliments, Sid'Bot→Claude, notifications (FAIT)
- aliments (Edge, en ligne) : OFF v3.6 aggregated_set, 4 valeurs + même base exigées, sinon « incomplet » ; JWT session ; cache 24 h ; 30 req/min/personne. Preuve : 6 EAN échantillon (deno run), 401 sans session.
- Sid'Note → Claude : 32-sidbot.js (ncOpen/ncRender/ncCheck/ncReset), 9 chaînes EN. Preuve : `node tests/sidnote-claude.test.cjs` OK FR+EN.
- Notifications : 09-planning.js (renderDayNotif, MutationObserver sur #vhead, minute, visibilitychange), CSS fin de site/app.css, 7 chaînes EN. Preuve : `node tests/notif-planning.test.cjs` OK (vide, tâche seule, multi, ajout formulaire, modif, suppression, autre app, minuit Bruxelles, EN) ; captures clair/sombre vérifiées.
- Muscu : RUN_MAX 4 h gardé (pas de commande d'arrêt depuis v74.1) → à confirmer par Sid.
Prochaine étape : Codex intègre (build + version) ; Claude relit le lot Sid'Note de Codex ; redéployer aliments avec num durci de Codex.

### 2026-11-11 — Codex et Claude — vérification croisée
Claude vérifie dans Chromium une note existante avec titres, listes, styles et photo. 13 pages à l’ouverture, 15 après ajout et 9 après suppression, contenu conservé après fermeture.
Codex teste la position du curseur sur la dernière page, l’export du coffre renforcé et la migration d’une note chiffrée v1, avec conservation des archives.
Le test musculation vérifie la reprise après cinq heures, la propagation de l’arrêt, une autre séance ouverte et une saisie le lendemain. Les tests Focus et notifications passent également.

### 2026-11-11 — Codex — reprise et validation de 41e2533
Décision : répartition confirmée avec Claude : revue des huit derniers commits et comparaison nutrition côté Claude ; suite complète et traitement des remarques côté Codex. OFF + Ciqual reste le choix au vu de l’échantillon documenté.
Preuve : `ELAN_OUT=/tmp/v81-41e2533-elan ELAN_REPORT=/tmp/v81-41e2533-elan/manifest.json npm test` sur HEAD `41e2533`, sortie 0. Les 15 configurations Élan passent dès cette exécution, y compris 1280 px clair React. Tous les tests du lanceur passent : crypto, mémoire, fusion, rappels, shell/version, Sid’Bot, accueil, agenda-minuit, Focus persistant, chrono muscu, catalogue nutrition, notes/projets/exports, connecteur Claude et notifications.
Fichiers : rapport et captures hors dépôt dans `/tmp/v81-41e2533-elan/` ; aucun changement de code nécessaire pour cette validation.
Prochaine étape : traiter les remarques de Claude ; publication et purge du coffre restent des décisions de Sid, après vérification des exports réels.

### 2026-11-11 — Codex — expiration du chrono au lendemain
Revue Claude : le test antérieur acceptait l’absence de durée le lendemain. `msRunGet` arrête désormais une horloge d’un autre jour sans modifier le journal passé ; une nouvelle saisie démarre une horloge du jour.
Preuves : build et `node tests/shell.test.js` OK ; `LD_LIBRARY_PATH=~/.local/share/refonte-libs/usr/lib/x86_64-linux-gnu node tests/muscu-chrono.test.cjs` OK. Cas vérifiés : même séance le lendemain, durée de deux minutes enregistrée, journal antérieur inchangé, autre séance le lendemain, reprise après cinq heures et arrêt entre onglets. La suite complète 15/15 ci-dessus portait sur 41e2533 avant ce correctif.
Ouvert : optimisation des lectures de cache dans save/saveUI ; garde conservée pour éviter une régression des écritures concurrentes.

### 2026-11-11 — Codex — comparaison nutrition close
Essais USDA de Claude ajoutés à nutrition-codex.md ; conditions Edamam et portail Nutritionix vérifiés sur leurs pages officielles. Décision commune : OFF + Ciqual 2025, analyse IA existante pour les recettes. Couverture FR/BE des offres commerciales non mesurée ; aucun prix tiers Nutritionix retenu. Modification documentaire uniquement.
