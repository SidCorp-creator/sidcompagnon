---
name: sid-charte
description: Charte visuelle « Élan » de Sid'Compagnon (Sid'Journée, Sid'Forme, Sid'Note, Sid'Bot). À charger avant toute modification d'interface, de CSS, d'icône, de logo, de texte affiché ou d'animation dans site/ ou app/src/, et avant toute maquette.
---

# Charte Sid'Compagnon · Élan

**Source unique : `docs/refonte/charte.md`.** Lis-la en entier avant de toucher l'interface. Ce skill ne fait que la résumer et rappeler les règles qu'on oublie ; en cas de doute ou d'écart, c'est `charte.md` qui fait foi. Ne recopie pas de valeurs ici : modifie `charte.md` (responsable Claude Code ; jetons § 11 : Codex) et note la décision dans `docs/refonte/README.md`.

## Les règles à ne jamais oublier

1. **Chaque écran dit à quoi sert l'app** : bandeau avec logo, nom et rôle (« Sid'Forme · Sport et alimentation »), titre de la fonction, progression du jour.
2. **Une app = une couleur pleine**, jamais seule (toujours pictogramme + nom). Les fonctions n'ont **pas** de couleur propre : icône + titre.
3. **Couple `--app` / `--on-app` posé sur chaque surface colorée**, jamais hérité. Texte sur couleur d'app toujours opaque. **Sid'Forme (`#F25C19`) : texte `#121212`, jamais blanc.**
4. Couleurs d'état (`--ok --warn --err`) séparées des apps, toujours avec icône + texte.
5. **2 polices seulement**, auto-hébergées (CSP : pas de Google Fonts) : Barlow (texte), Barlow Condensed (titres, chiffres). Italique = titres de bandeau et nom d'app sur sa carte uniquement ; chiffres droits et tabulaires.
6. Icônes : une seule famille SVG au trait (24, trait 2, `currentColor`). Aucun glyphe Unicode comme icône.
7. Cibles ≥ 44 px (boutons principaux 48, lignes 56). Champs ≥ 16 px. Un seul bouton principal par écran. Sid'Bot = bouton pilule en haut à droite du bandeau, même place dans les 3 apps.
8. Pas de dégradé, d'ombre décorative, de carte dans une carte, d'animation sans rôle. Seule la progression rebondit (380 ms). Mouvement réduit : 1 ms, même état final.
9. Focus clavier toujours visible (2 px `--ink`, décalage 2 ; `--on-app` sur fond d'app).

## Noms (graphie exacte, v76)

Sid'Compagnon (suite) · Sid'Journée (Agenda, Tâches, Focus) · Sid'Forme (Musculation, Nutrition, Graphiques) · Sid'Note (Notes, Documents, Mots de passe) · Sid'Bot (assistant intégré).
Toujours « Sid » + apostrophe droite `'` (U+0027) + majuscule, sans espace, identique en FR et EN. Dans le code : `MARQUES` (`site/i18n.js`). Vérifier avec `node tests/marques.test.js`.
**Ne jamais renommer** : les clés de données et identifiants techniques (`orga/sport/perso`, `agenda/fit/note`, `sidnote-*`, HKDF, sauvegarde `app:sidnote`, globaux `SIDFIT`, fonction `mcp`). SidCorp (éditeur) et les contenus des personnes ne sont pas des noms de marque à corriger.
Plus aucun lien vers claude.ai dans l'app : l'assistant est Sid'Bot (`app/src/shell/32-sidbot.js`, fonction Supabase `sidbot`).

## Pièges du projet

- `site/app.js` est **généré** : modifier `app/src/shell/*.js` puis `npm run build` dans `app/`. React : `app/src/*.tsx` → `site/react/`. Toujours vérifier aussi la version de secours (`window.__noIslands`).
- iPhone : `[hidden]{display:none!important}`, `minmax(0,1fr)`, `appearance:none` sur date/heure.
- Logos : `docs/refonte/logos/*.svg` (couleur, `-mono`, `-mini` sous 24 px, `suite-sombre` sur fond sombre).
- Aucune suppression de fonction ni changement de comportement sans accord explicite de Sid (voir README, Décisions).

## Avant de dire « fait »

Suivre `charte.md` § 13 : 390/320/1280 px, clair et sombre, contenu long, clavier, focus, contrastes, mouvement réduit, aucun débordement ni erreur JS, `npm test` + `tests/smoke.js` comparés avant/après, captures dans `docs/refonte/apres/`.
