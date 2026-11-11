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

### 2026-11-11 — Codex — intégration 82.1 et validation finale
Décision : aefc048 repris en be15948 ; Réglages alignés avec les flux vérifiés (mémoire partagée, Vercel relais, périmètre MCP, exception légale et métadonnées Groq). APP_V/index/public = 82.1 et BUILD/CACHE = sidnote-v82.1 ; build en 8c9230a.
Preuve : `ELAN_CASE=390-dark-react-fr ELAN_OUT=/tmp/v821-elan ELAN_REPORT=/tmp/v821-elan/manifest.json npm test` sort 0 : un Élan et tous les tests ciblés du lanceur verts. Build/shell/marques/diff-check verts. Contrôle /tmp/v821-privacy-check.cjs étendu aux Réglages : FR/EN React/secours à 320/390/1280, fenêtres et pages publiques verts, sans débordement.
Fichiers : index/i18n, versions et bundles intégrés ; livraison.md et vie-privee-sources.md récapitulent faits, sources et limites. Aucun fournisseur reconfiguré, aucun secret modifié.
Prochaine étape : revue finale de Claude sur le hash remis puis publication avec accord de Sid ; aucune publication par Codex.
