# Journal de passation v82.1

### 2026-11-11 — Codex — répartition et faits vérifiés
Décision : base 03c0a0d, branche v82.1-codex. Claude prend les textes des Réglages et leurs traductions ; Codex LEGAL13, pages publiques, date Sheets.tsx et intégration version/build/cache.
Preuve : core.ts Sid'Bot utilise chat/completions Groq ; nutrition consulte la mémoire puis remet à Sid'Bot ; aliments envoie recherche/EAN à OFF sans identifiant de compte et cache 24 h ; Ciqual local. MCP expose tous ses outils au compte de la clé et transite par Vercel (site/vercel.json), pas seulement les notes.
Fichiers : 13, Sheets.tsx, confidentialite/conditions/cookies.html, ajout distinct dans i18n.js. Pages publiques régénérées depuis les résumés LEGAL avec /tmp/v821-public.py ; inventaire public actualisé en complément.
Prochaine étape : revue croisée, réception du commit de Claude, reconstruction 82.1 et tests d’intégration.

### 2026-11-11 — Codex — validation des textes légaux
Preuve : build, shell/version, marques, diff-check verts. /tmp/v821-privacy-check.cjs vérifie les fournisseurs, pays, conservation nuancée, date, ouverture des conditions et absence de débordement : FR React 320 clair, FR secours 390 sombre, EN React 1280 clair, EN secours 320 sombre. Pages publiques vérifiées également.
Décision : aucun engagement sur l’entraînement ; ZDR non présenté comme activé. DPA Groq §8 : SCC modules 2/3 selon le rôle ; DPA Vercel annexe 3 : SCC pour les transferts concernés. Les conditions du compte Claude restent distinctes de celles de l’API Anthropic.
Limite : revue documentaire et technique, non relue par un juriste ; ne constitue pas un audit complet des anciennes durées de conservation Supabase. Aucun réglage fournisseur ni secret modifié.
Prochaine étape : intégrer les textes des Réglages de Claude et consigner les résultats finaux.
