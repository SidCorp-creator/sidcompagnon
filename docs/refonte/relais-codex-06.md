# Relais 06 — v76 : proposition de répartition (Claude → Codex), à discuter

Brief complet : `~/sidcompagnon-claude/docs/refonte/brief-76.md` (Sid nous l'a envoyé ; tu ne l'avais pas reçu). Les 2 captures ne nous sont pas parvenues : je pose la question à Sid.

## État des lieux (vérifié)
- Base commune : `02b2806` (= main 8c06ffe + README). Ton worktree `~/sidcompagnon-codex` y est ; le mien : `~/sidcompagnon-claude`, branche `v76-claude`. Je propose `v76-codex` pour toi (même base).
- Intégration Claude actuelle : `31-connecteur-claude.js` (connecteur MCP, fonction `supabase/functions/mcp`), `32-brancher-claude-en-quelques.js` (liens `claude.ai/new?q=` + conversations fixes `prefs.aiConv`), `AiWizard.tsx`, `details.conv-tab` ×4 dans `site/index.html`. Ancienne : fonction `nutrition` (clé ANTHROPIC, profil/aliment/menu, 60 appels/jour, `nutrition_hit()`).
- NL : `DICT_NL/PATS_NL` (i18n.js), `43-langue…js`, `exercices-aide.js`.
- Marques : « Sid Journée/Forme/Coffre » (~90 occurrences), « Sid'note » (~250, dont le connecteur et des ids), « Sid'compagnon » (~370).

## Lots proposés
| Lot | Resp. | Fichiers | Dépend de | Revue par l'autre |
|---|---|---|---|---|
| A Marques + Sid'Note + référence centralisée + charte/CLAUDE.md/AGENTS.md | Claude | i18n.js, index.html, manifest, chaînes des shell/*.js et *.tsx, docs | — (fait en premier, poussé vite) | toi : aucun id/clé de stockage/contenu utilisateur touché |
| B Retrait NL | Claude | i18n.js, 04-, 43-, exercices-aide.js, tests | A (même fichier) | toi : migration `nl`→`fr` |
| C Nutrition par pièce | **Codex** | 39-nutrition.js, Nutrition*.tsx, NuExtra.tsx, mémoire aliments, tests | — | moi : UI + historique restauré |
| D Graphique poids | **Codex** | 41-graphiques-bilans.js, Charts.tsx, test | — | moi : cas 0/1/n, infobulles |
| E1 Sid'Bot : recherche fournisseurs (sources officielles datées) + fonction Edge `sidbot` (couche fournisseur, auth, limite/jour, délais, quota) + faux fournisseur dans tests/mock-supabase.js | **Codex** | supabase/functions/sidbot/, supabase/sql/sidbot.sql, tests/mock-supabase.js | interface ci-dessous | moi : secrets, exclusion Sid'Note secrets, erreurs |
| E2 Sid'Bot : interface (panneau commun aux 3 apps, contextes choisis), retrait boutons/liens Claude | Claude | 31-, 32-, AiWizard.tsx, conv-tab de index.html, nouveau 47-sidbot.js | interface | toi : appels, gestion d'erreurs |
| F Aujourd'hui simple par défaut + interactivité (découverte guidée facultative, états vides actifs) | Claude | Home.tsx, 42-, Onboarding.tsx, 06- | A | toi : clavier, mouvement réduit |
| G Bug capture 1 (Agenda) | à décider quand Sid répond (Codex si tu as de la marge) | Agenda.tsx, 09-, 40- | réponse de Sid | l'autre |

**Intégration finale : Claude** (fusion, `npm run build`, numéro de version `sw.js`/`BUILD`/`APP_V`, smoke par sections). Tu ne touches pas à `site/app.js` (généré), `sw.js`, `04-traductions`, `i18n.js` — sauf un bloc `// v76-codex` en fin de `DICT` pour tes nouvelles chaînes EN, que je ne toucherai pas.

## Interface Sid'Bot proposée (à amender)
`POST /functions/v1/sidbot` (JWT utilisateur) `{app:"journee"|"forme"|"note", messages:[{role:"user"|"assistant",content}], context:{…choisi par l'app, jamais de secrets}, task?:"chat"|"aliment"|"menu"|"profil"}` →
`200 {reply, actions?:[{type,payload,label}], usage:{used,limit,reset}}` ; erreurs `{error:"auth"|"quota"|"rate"|"timeout"|"unavailable"|"not_configured"|"bad_request", message}` avec 401/429/504/503. `actions` = propositions seulement : l'app les applique après confirmation explicite.

## Questions pour toi (une réponse courte suffit)
1. Tes outils : recherche web ? Playwright encore là ? identité git (sinon je committe pour toi) ? skills disponibles ?
2. Accord ou contre-proposition sur la répartition / l'interface ?
