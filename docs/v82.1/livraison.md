# Sid'Compagnon v82.1 — vie privée

Base : v82 en ligne (`03c0a0d`). Cette version corrige les textes, leurs traductions et les pages légales ; elle ne modifie aucun secret, réglage fournisseur, droit d’accès ou mécanisme de traitement.

Les Réglages, la fenêtre légale et les pages publiques nomment Groq pour Sid'Bot et les estimations nutritionnelles, Open Food Facts pour la recherche de produits, Ciqual pour la recherche locale et Anthropic pour le compte Claude facultatif de la personne. Vercel est décrit comme hébergeur et relais des échanges MCP vers Supabase. Le connecteur est décrit selon ses outils réellement exposés, y compris agenda, nutrition et musculation ; retirer l’accès bloque les appels futurs sans effacer les copies reçues par Anthropic.

La conservation Groq est nuancée : contenu non conservé par défaut, journaux possibles jusqu’à 30 jours pour fiabilité ou abus, davantage si la loi l’impose, et métadonnées d’usage conservées séparément. Aucun engagement sur l’entraînement ni activation ZDR n’est affirmé. La mémoire nutritionnelle est décrite comme partagée, sans garantie générale d’anonymat. Les pages publiques remplacent les anciennes mentions Netlify, le fournisseur « à compléter », le connecteur annoncé désactivé et la date/version 43.

Validation sur le build 82.1 : build, shell/version, marques et diff-check verts. Contrôle dédié des Réglages, fenêtre légale et pages publiques en FR/EN, React/secours, à 320/390/1280 px, sans débordement. `npm test` avec `ELAN_CASE=390-dark-react-fr` passe avec ce parcours Élan et tous les tests ciblés du lanceur. La matrice complète de quinze configurations validée pour v82 n’a pas été relancée pour ce changement de textes.

Les [sources et limites](vie-privee-sources.md) comprennent les DPA officiels, la recommandation d’activation ZDR par Sid et le point contractuel à examiner pour les données sensibles transitant via Vercel. Les textes n’ont pas été relus par un juriste ; les anciennes durées de conservation Supabase n’ont pas été auditées ici.

Publication réservée à Claude après revue croisée et accord de Sid. Aucun déploiement par Codex.

Gel final : livraison fondée sur le code relu `011c8f0`, avec uniquement la dernière précision autorisée sur la mémoire d’aliments (`fdf2aa1`, reprise en `dbb99f4`, bundle `94dbb8d`). Une recherche n’est pas enregistrée dans cette mémoire ; le nom d’un aliment noté via le connecteur peut y être ajouté. Réglages, LEGAL et page publique sont alignés. La passe finale de `npm test` avec `ELAN_CASE=390-dark-react-fr` et le contrôle de vie privée FR/EN React/secours à 320/390/1280 passent. Aucune modification applicative après ces tests ; les autres remarques sont reportées dans `docs/v83/suivi.md`.
