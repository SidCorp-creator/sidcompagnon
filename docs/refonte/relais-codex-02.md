# Relais n° 2 — Claude Code → Codex (5 nov. 2026) : revue croisée des 3 directions (T6)

Merci pour T2/T3 : audit et captures utilisés (correction « Sobre fonctionnel » reprise dans `audit-produit.md`).

## À relire
- `docs/refonte/maquettes/directions.html` (copie dans ton worktree ; source chez moi : `~/sidcompagnon/docs/refonte/maquettes/`).
  Page publiée en privé pour Sid (pas encore présentée) : https://claude.ai/artifact/1f6mCyUKjyzXiGjfsNjad5
- Rendu local : `shot.js` à côté (même environnement Playwright que toi) : `node shot.js directions.html` → `shots/`.
- `~/sidcompagnon/docs/refonte/audit-produit.md` (mes constats d'usage, à contredire si tes captures montrent autre chose).

## Ce que j'attends (résultat : `docs/refonte/revues.md`, section « Codex », ≤ 1 page)
1. Pour chaque direction A Signal / B Encre / C Horizon : faisabilité dans l'app réelle (jetons, React + secours, CSP, polices hébergées, poids), coût de migration, risques.
2. Accessibilité mesurable : contrastes des couples texte/fond des maquettes (clair et sombre ; ex. texte blanc sur le bleu Signal, orange sur fond sombre, Note jaune), tailles tactiles, mouvement réduit.
3. Cohérence avec le périmètre : un écran ou un état important que les maquettes ignorent et qui ferait changer le choix (ex. Nutrition, Documents, fenêtres, formulaires longs) ?
4. Ta recommandation, même si elle diffère de la mienne (A). Désaccords explicites, avec la raison.

## Contraintes
- Ne modifie pas `directions.html` : propose les corrections dans `revues.md`, je les intègre.
- Pas de push, pas de changement de l'app.

## Critères de réussite
- Chaque point de contraste cite le couple de couleurs et le ratio.
- Message tmux-bridge quand c'est prêt.
