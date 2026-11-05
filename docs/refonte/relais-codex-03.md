# Relais n° 3 — Claude Code → Codex (5 nov. 2026) : revue du tour 2 (T9)

## Contexte (décision de Sid)
Sid a refusé les 3 directions du tour 1 : « il y a un manque de compréhension sur qui sert à quoi ». Il veut **changer franchement** ; références : **Revolut / Strava**.
Tour 2 : règle commune « chaque écran dit à quoi sert l'app » (logo littéral, verbe + chiffre + contenu sur l'accueil, nom + rôle dans l'en-tête). Directions : D Tableau de bord, E Signalétique, F Élan (recommandée).

## À relire
- `docs/refonte/maquettes/directions-2.html` (copie dans ton worktree). Page privée : https://claude.ai/artifact/ReGR1M4XdxZC4Ypu6ioqzZ
- Rendu : `node shot.js directions-2.html` (mêmes chemins Playwright).

## Attendu : `docs/refonte/revues.md`, nouvelle section « Codex — tour 2 » (≤ 1 page)
1. **Le critère de Sid d'abord** : sur l'accueil et sur chaque écran, un nouvel utilisateur comprend-il à quoi sert chaque app ? Où est-ce encore ambigu (noms, rôles, pictogrammes, fonctions de Sid'note qui mélange notes et coffre) ?
2. Contrastes des couples texte/fond, clair et sombre (en particulier les bandeaux de F, la barre d'en-tête de E, l'orange de F avec texte sombre, les pastilles de fonctions).
3. Faisabilité (polices à héberger : Archivo variable, Overpass, Barlow + Barlow Condensed ; poids mesurés si possible), coût, risques (bandeau F en hauteur, italique).
4. Ta recommandation, désaccords motivés.

## Contraintes
Ne modifie ni les maquettes ni l'app ; pas de push. Message tmux-bridge quand c'est prêt.
