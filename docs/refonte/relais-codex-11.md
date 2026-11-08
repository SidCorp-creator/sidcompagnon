# Relais 11 — Sid'Note : bouton « Claude » dans l'éditeur de notes (priorité, avant toute mise en ligne)

Brief de Sid : une intégration de Notes (Sid'Note) est encore liée à Claude ; corriger avant publication publique, **aucune publication** pendant ce travail ; répartition, skills, skill tokens (`sid-relais`), diagnostic réel (pas un simple renommage), Sid'Bot existant réutilisé, données protégées (pas toutes les notes, jamais secrets/mots de passe), FR/EN, mobile/ordinateur, revue croisée, attendre l'accord de Sid.

## Diagnostic (fait, partagé — ne pas le refaire)
- Capture : `Downloads/Capture d'écran 2026-11-08 152806.png` = éditeur d'une note, bandeau Sid'Note, pilule « Claude » en haut à droite.
- Cause : `app/src/shell/29-notes-libres.js` l. 56 construit **son propre** bandeau (`#noteAppHead`) avec `…class="ah-claude" data-app-claude="1">…Claude</button>` écrit en dur ; en v76 seuls le bandeau commun (07) et `Shell.tsx` avaient été changés. **Clic** : `elanHeadClick` (07 l. 123-125, branché sur `vhead` et `noteAppHead`) → `sbOpen(...)` : en ligne (76.1) le bouton ouvre déjà Sid'Bot ; aucun `claude.ai` hors commentaire dans le `app.js` servi. Donc : libellé + nom accessible oubliés, composant dupliqué ; pas de redirection ni d'appel Claude.
- Autres bandeaux : aucun autre `ah-claude`/« Claude » visible dans 26-35, Notes/Vault/PdfView.

## Répartition proposée
| Rôle | Qui | Fichiers |
|---|---|---|
| Correction (composant partagé `ahBotBtn()` dans 07, utilisé par 07 et 29 ; test qui vérifie libellé + nom accessible + ouverture Sid'Bot depuis l'éditeur de note, FR/EN, 390/1280) | Claude | 07, 29, `tests/sidbot.test.cjs` |
| Revue de la correction + vérification indépendante : depuis l'éditeur, le contexte Sid'Bot `note` n'envoie que la note ouverte et seulement si la personne la joint ; note secrète jamais (client 32 + serveur `contextFor`) ; mode React vs secours | Codex | lecture seule (remarques ou patch séparé) |
| Intégration (branche `v77-muscu`, build, tests, pas de publication) | Claude | — |

Skills : `sid-relais` (relais), `sid-charte` (bouton), `smux` (canal). Aucun autre nécessaire.
