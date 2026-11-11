# Vie privée v82.1 — vérification du 11 novembre 2026

Les textes distinguent le stockage du compte, les inférences IA, la recherche de produits et le compte Claude facultatif. Revue documentaire et technique, **non relue par un juriste**.

- [Données Groq](https://console.groq.com/docs/your-data) : contenu d’inférence non conservé par défaut ; journaux possibles pour fiabilité/abus jusqu’à 30 jours, davantage si une obligation légale l’impose ; métadonnées distinctes. Les données conservées sont aux États-Unis. Aucun engagement sur l’entraînement n’est déduit de cette page.
- [DPA Groq](https://console.groq.com/docs/legal/customer-data-processing-addendum), §2 et §8 : rôle de sous-traitant et clauses contractuelles types, modules 2/3 selon le rôle du client. Cette référence contractuelle ne constitue pas une conclusion de conformité globale.
- [DPA Vercel](https://vercel.com/legal/dpa), §13 et annexe 3 : transferts et clauses contractuelles types ; [politique Vercel](https://vercel.com/legal/privacy-notice) pour les données techniques. L’ancienne durée générale « environ 30 jours selon Netlify » est retirée. Les durées de visibilité des Runtime Logs ne permettent pas d’affirmer une durée unique pour tous les journaux.
- [Politique Anthropic](https://www.anthropic.com/legal/privacy) : compte Claude de la personne, offre et réglages applicables. Ne pas lui attribuer automatiquement les conditions de conservation de l’API professionnelle.
- [Politique Open Food Facts](https://world.openfoodfacts.org/privacy) : lien fourni ; consultation automatisée bloquée, aucune durée de conservation chez OFF affirmée. Le relais local, vérifié dans aliments/index.ts, utilise un cache de 24 h.

ZDR est recommandé à Sid pour les appels d’inférence utilisés ici. Son activation dans la console est une action de Sid, non effectuée ni confirmée par Codex. Les métadonnées d’usage restent distinctes. Le code ne fait pas appel aux fonctions batch/fine-tuning désactivées par ZDR.

Points supplémentaires observés :

- `site/vercel.json` relaie `/mcp/*` vers Supabase ; Vercel transporte donc les échanges du connecteur. La politique ne doit pas dire qu’il héberge seulement les fichiers de l’interface ou qu’il ne reçoit aucune donnée.
- Le MCP expose les outils d’agenda, nutrition et musculation en plus des notes non secrètes et pièces jointes, ainsi que des outils d’écriture. La documentation ne promet pas une restriction aux notes qui n’existe pas dans le code.
- Le DPA Vercel, annexe 1 §6, exclut les données sensibles de Customer Data. L’exposition des outils de santé par le relais MCP est donc un point contractuel à examiner avec Sid et un conseil compétent. Aucun changement d’architecture ou de permissions n’est effectué dans ce lot.
- `food_answers.query` conserve le texte de la requête d’origine sans identifiant de compte associé. Cela ne suffit pas à garantir l’absence de données personnelles saisies dans le texte ; la mémoire est décrite comme partagée, sans promesse générale d’anonymat.
- Les anciennes durées de conservation Supabase (dont sauvegardes annoncées à 14 jours) n’ont pas été auditées dans ce lot, centré sur les fournisseurs réellement utilisés. Elles restent à vérifier séparément avant de présenter le document comme un audit complet.
