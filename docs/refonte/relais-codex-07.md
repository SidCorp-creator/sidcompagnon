# v76 — C / D / E1 prêts pour revue Claude

Branche `v76-codex`, base `02b2806`. Aucun fichier modifié chez Claude. Pas de commit : identité git absente ; Claude peut committer les fichiers listés dans le worktree.

- **C nutrition** : 39 + 40 + Nutrition.tsx + NuMenu.tsx + mémoire `nutrition/index.ts`. Masses par aliment (œuf moyen 50 g comestibles, banane 120 g, pomme 150 g : conventions estimatives modifiables par métadonnées de mémoire). Pièce par défaut pour ces aliments, grammes acceptés dans le même champ, référence estimée affichée. Aucune conversion persistante au simple rendu. Recalcul par masse, plus de ratio erroné « 2 œufs → 100 g = ×50 ». Unité inconnue : changement d'unité refusé, valeurs préservées. Copie/restauration JSON conservent quantité, totaux et référence. `nuLogFromBot` vérifie les propositions puis appelle le chemin d'ajout existant avec date préservée, uniquement après confirmation client.
- **Photo et prompts** : 39 ne dépose plus la photo dans Storage et n'ouvre plus Claude ; passe `aiHandoff(prompt,"nutri",{img})` au panneau commun. Les demandes sont FR/EN naturelles, sans outil MCP ni ancienne marque. Retrait du troisième argument NL dans 39. `T3` conserve temporairement un rest ignoré pour compiler contre la base v75 qui en appelle encore trois ailleurs ; à enlever après intégration B. Pas de changement de 31/32.
- **D poids** : 41 + Charts.tsx + une ligne dans islands.tsx. Relie seulement les points du poids, conserve les cases de dates absentes, mêmes infobulles de mesures réelles. Macros inchangées. 0/1/n pesées, période changée : testés.
- **E1** : `supabase/functions/sidbot/{core,index}.ts`, `supabase/sql/sidbot.sql`, branche mock Sid'Bot dans `tests/mock-supabase.js`. Auth réelle via GoTrue, bornes de taille, allowlist contexte par app, actions validées, erreurs FR/EN, délais, compteur atomique service-only/RLS et cadence, aucun stockage de conversation serveur ni action exécutée. Fournisseur choisi côté serveur uniquement, pas de clé ou donnée dans les logs, pas de paiement ni bascule automatique. Contrats décrits dans `sidbot-fournisseurs.md`.
- Recherche E1 inclut la contre-vérification initialement proposée à Gemini. Gemini API gratuit écarté pour les clients EEE. Groq Free texte recommandé sous conditions de configuration ; vision optionnelle à tester, local derrière passerelle sécurisée. Rien n'est activé/déployé et aucun modèle réel n'a été appelé.

## Contrat client vérifié en lecture chez Claude

`32-sidbot.js` utilise `context.agenda={tasks,todos}`, nutrition.goal numérique ou null, muscu.days/minutes parfois null. Le serveur accepte et filtre ces formes, ainsi que `context.tasks` initialement proposé. `nuLogFromBot(payload)` est fourni par 39 ; historique et secrets ne sont pas envoyés automatiquement.

Pour Groq : avant activation réelle, vérifier compte Free sans paiement, accès Belgique, ZDR et restrictions d'âge (18+). La variable `SIDBOT_FREE_PLAN_CONFIRMED=true` est une attestation admin de ce palier, pas une détection par API. Voir document fournisseurs pour les limites précises et les sources.

## Vérifications exécutées

- `npm run build` : OK (génère site/app.js et site/react ; laisser l'intégrateur régénérer après fusion).
- `node tests/nutrition-units.test.cjs` : OK (pièces propres aux aliments, métadonnées, grammes/kg, unité inconnue refusée, sauvegarde/copie, confirmation Sid'Bot et date passée).
- `node tests/weight-gap.test.cjs` : OK (React/secours, coordonnées calendaires, infobulles sans valeurs fictives, 0/1/n).
- `node tests/sidbot.test.cjs` : OK (auth, contextes, secrets, actions, quotas, erreurs, photo et tailles, aucune bascule payante).
- `PGLITE_MODULE=/tmp/v76-pg/node_modules/@electric-sql/pglite node tests/sidbot-sql.test.cjs` : OK (PostgreSQL/WASM isolé 0.5.15, SQL exécuté réellement, rôles, cadence/quota). Ce n'est pas un déploiement Supabase.
- `tests/v76-forme.test.cjs` avec serveur isolé 8876/8890 : OK FR et EN, React et secours, iPhone 390 px, mouvement réduit, absence d'erreur JS et débordement après parcours. Captures : `docs/refonte/apres/v76-poids-{fr,en}-{react,secours}.png`.
- Mémoire alimentaire existante : 6 tests OK. Chiffrement/fusion/rappels/shell : résultats à compléter ci-dessous si nécessaire.

## Revue demandée

Vérifier saisie nutrition, repas restauré, masses distinctes, interface + contexte Sid'Bot, absence de secret/client et filtrage actions. Les essais fournisseur/clé réelle et déploiement restent explicitement à faire après configuration. Intégration globale et smoke final sous responsabilité Claude. Aucun compteur fiable de tokens de développement exposé ; aucun pourcentage d'économie inventé.
