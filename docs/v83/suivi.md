# Points reportés après le gel de v82.1

Aucune modification applicative supplémentaire dans v82.1. À examiner pour v83, sur demande de Sid :

- Nettoyer les traductions orphelines et consolider les blocs i18n sans changer les textes gelés de v82.1.
- Revoir les libellés légaux des notes secrètes et des anciennes archives ; les retouches facultatives ne sont pas reprises dans la livraison fondée sur 011c8f0.
- Examiner la clé MCP dans le chemin URL et les mécanismes d’authentification acceptés par Claude. Un accès direct à Supabase seul ne retire pas une clé du chemin ; la collecte réelle dans les journaux reste non vérifiée. Examiner aussi le point DPA Vercel sur les données sensibles.
- Vérifier séparément les anciennes durées de conservation Supabase, dont les sauvegardes annoncées à 14 jours, sans présenter la revue v82.1 comme un audit juridique complet.
