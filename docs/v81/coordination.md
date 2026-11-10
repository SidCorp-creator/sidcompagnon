# v81 — coordination Claude Code ↔ Codex

Brief de Sid : `docs/v81/brief.md` (copie intégrale de la demande du 11 nov. 2026).
Base : `origin/main` = 81e39b0 (v80 en ligne). Claude : worktree `~/sidcompagnon-claude`, branche `v81-claude`.
Méthode commune : skill `sid-relais` (étendu en « Gestion du contexte et des tokens », § Journal de passation).

## 1. Exposé de Claude Code (11 nov.)
Compris :
- App sans framework : shell `app/src/shell/*.js` → `site/app.js` (généré, `cd app && npm run build`), îlots React `app/src/*.tsx` → `site/react/`.
- Sid'Bot actuel (v76) : `32-sidbot.js` + fonction Supabase `sidbot` (secrets `SIDBOT_*`, clé API). L'ancien parcours Claude est dans `ef2ae43^` : `31-connecteur-claude.js` (adresses `mcp_tokens`, assistant de branchement pré-rempli `claude.ai/customize/connectors?modal=add-custom-connector…`, liens `claude.ai/new?q=` et projets/conversations `data.prefs.aiConv`). La règle v76 « jamais de lien claude.ai » est levée par Sid pour Sid'Note.
- Connecteur `mcp` (Supabase, `/mcp/<clé>`), outil `lire_note` : à lire pour les pièces jointes (PDF dans le bucket `documents` ?).
Accès / outils de Claude : connecteur Supabase (SQL, journaux, déploiement de fonctions Edge, migrations), **connecteur Sid'note réel** (je peux appeler `lire_note`, `notes`, `agenda`… → test de bout en bout du PDF), WebSearch/WebFetch, Playwright local (à revérifier), git/gh.
Où j'apporte le plus : connecteur `mcp` + pièces jointes, restauration Sid'Bot → Claude, données Supabase (inventaire/export Documents & Mots de passe avant purge), recherche API nutrition (docs officielles), revue.
Risques vus :
1. Purge Documents/Mots de passe : données chiffrées côté client (coffre) → l'export ne peut se faire que dans l'app (clé locale) ; ne rien supprimer côté serveur avant export confirmé par Sid.
2. Éditeur paginé : risque de casser notes existantes / PDF joints (`29b-note-pdf.js`) ; faire une pagination d'affichage (calcul des sauts), sans changer le format stocké.
3. Chrono persistant : l'état doit vivre dans `data` synchronisé (startedAt absolu), pas en mémoire ; gare au rechargement auto `updCheck` (déjà bloqué si chrono en cours).
4. Fichiers partagés à forte collision : `index.html`, `i18n.js`, `app.css`, `ORDER.txt`, `04-…js` (APP_V), `46-demarrage.js` (BUILD), `sw.js`. → un seul intégrateur pour le numéro de version et la reconstruction.

## 2. Exposé de Codex
- Je propose de prendre Sid’Note de bout en bout, avec Claude en relecture : export Documents et Mots de passe, retrait des écrans et du code associé, déplacement de Focus avec ses réglages et son historique, Projets, éditeur paginé. Je relis le connecteur, le retour vers Claude, les notifications et le chrono, dont Claude serait responsable.
- Ordre proposé pour Sid’Note : inventorier les références de fichiers et éprouver l’export sur des données de test avant le retrait, déplacer Focus avant de relier les séances aux projets, puis valider la pagination avec des notes existantes. Le coffre doit pouvoir être exporté après déverrouillage. L’inventaire doit établir quels fichiers servent aux notes et au connecteur avant toute purge. Je privilégie des sauts calculés à l’affichage et je veux vérifier la saisie, la sélection, le collage, l’annulation et les PDF sur une note qui déborde.
- Deux contrats à régler ensemble avant de coder : les références et droits des pièces jointes lus par le MCP, et la frontière entre Focus et le chrono. Si les deux touchent la même routine, je propose que Claude prenne la persistance de l’état et que je prenne les routes, écrans et liens aux projets. Se coordonner sur `29-notes-libres.js`, `29b-note-pdf.js`, le shell Focus/chrono, `index.html`, `i18n.js`, `app.css` et `ORDER.txt`. Je peux intégrer les branches et régénérer les fichiers livrés, la version et le service worker en fin de chantier.
- Nutrition : recherches indépendantes en parallèle, même échantillon FR/BE (produits emballés par nom et code-barres, aliments génériques, variantes de portions) et comparaison sur résultats observés, docs officielles, coût et droits d’usage. Je propose Claude responsable si une fonction Edge et des secrets sont nécessaires, Codex si l’intégration réutilise le client actuel, avec revue croisée dans les deux cas.
- Accès : shell et réseau disponibles, outil web de recherche et lecture, git/gh authentifié et fetch GitHub vérifié. Connecteurs GitHub et Supabase exposés, droits Supabase du projet à vérifier. Aucun outil Sid’Note authentifié exposé dans ma session. Claude ferait le test réel avec le PDF et je vérifierais les parcours de l’interface et les cas de refus. Playwright et Chromium sont présents localement, mais le lancement direct de Chromium échoue sur `libnss3.so`. L’environnement navigateur reste à valider.
- Skills : smux utilisé pour la coordination. Le dépôt contient déjà `.agents/skills/sid-relais` et sa source sous `.claude/skills/`. Je propose de partager un seul journal de passation via ce skill et de relire ensemble son extension. Côté Codex, skill-creator et skill-installer sont disponibles pour l’évolution du skill ou une installation justifiée. Le catalogue comprend aussi les deux skills Supabase, openai-docs, imagegen et les skills des connecteurs. Le skill Supabase sera pertinent dès qu’on interviendra sur le backend. La pagination est un chantier de code dans l’application existante.
- Branche locale `v81-codex` créée dans `~/sidcompagnon-codex` sur `origin/main` à `81e39b0`. Les captures non suivies de v80 sont toujours présentes dans le worktree.

## 3. Répartition convenue (11 nov., accord tmux-bridge Claude ↔ Codex)
| Chantier | Responsable | Relecteur |
|---|---|---|
| Sid'Note : export puis retrait Documents/Mots de passe, Focus → Sid'Note (écran, routes), Projets, éditeur paginé | Codex | Claude |
| Connecteur `mcp` : `lire_note` + pièces jointes, test réel | Claude | Codex |
| Sid'Bot → Claude depuis Sid'Note (ancien parcours `31-connecteur-claude.js`) | Claude | Codex |
| Notifications planning du jour | Claude | Codex |
| Chrono persistant (séance muscu `data.ui.msRun` + Focus `data.pomo.run`) | Claude | Codex |
| API nutrition : recherche | les deux, échantillon commun | croisée |
| API nutrition : relais Open Food Facts | Claude | Codex |
| API nutrition : index Ciqual et interface | Codex | Claude |
| Skill « Gestion du contexte et des tokens » (extension de `sid-relais`) | Claude | Codex |
| Intégration finale (version, `npm run build`, fichiers communs) | Codex | Claude |

Contrats :
- Pièces jointes de notes (ne pas toucher) : `documents/<uid>/notes/<noteId>.pdf` (`n.pdf`), `documents/<uid>/notes/<photoId>.jpg` (`n.photos[]`). Coffre seul concerné par la purge : `documents/<uid>/<docId>.pdf` (`docPath`, chiffré si `d.enc`).
- `15-pomodoro.js` : séquence Codex (déplacement) puis Claude (persistance) ; `data.pomo` inchangé par le déplacement.
- Fichiers communs (`index.html`, `i18n.js`, `app.css`, `ORDER.txt`, 04, 46, `sw.js`) : chacun envoie ses hunks, Codex assemble.
- Ordre : skill → recherche nutrition + mcp (serveur) → Sid'Note (Codex) en parallèle de notifications/chrono (Claude) → Sid'Bot→Claude après le retrait côté Sid'Note → intégration → parcours navigateur → compte rendu.

## 4. Journal de passation
(format : date — agent — décision / preuve / fichiers / prochaine étape)
