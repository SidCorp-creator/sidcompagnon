# Sid'Bot — choix et configuration v76

Recherche vérifiée le **8 novembre 2026**. Sources officielles uniquement. Aucun appel réel à un fournisseur : pas de clé configurée dans ce travail. Les tests exécutés sont des simulations du transport et des réponses ; ils ne mesurent ni qualité FR/EN, ni latence fournisseur.

## Recommandation par app

| App | Choix proposé | Capacités et limites |
|---|---|---|
| Sid'Journée | Groq Free, `openai/gpt-oss-20b` | Conversation FR/EN, proposition de tâche structurée. Qualité à mesurer sur demandes anonymes avant activation. |
| Sid'Forme | Même fournisseur pour le texte ; calcul du profil et mémoire alimentaire restent locaux/existants | Repas proposés, quantités et macros explicitement estimées. Photo : modèle vision à configurer séparément après essai réel ; aucune fausse reconnaissance en mode texte. |
| Sid'Note | Même fournisseur, seulement la note choisie explicitement | Aide à la rédaction et proposition de note. Aucun document, mot de passe ni note protégée envoyé par le contexte. Pour texte confidentiel : ne rien joindre ou prévoir le local. |

Un fournisseur commun simplifie configuration et erreurs. Le modèle texte choisi n'est pas un modèle vision. Aucun fournisseur n'est activé par défaut et aucune bascule automatique n'existe.

## Comparaison documentée

**Groq Free.** Offre gratuite à quotas, distincte de crédits promotionnels ; pas de garantie de gratuité perpétuelle. La montée en offre Developer requiert un moyen de paiement : conserver une organisation Free sans paiement et sans contrat payant. L'intégration n'appelle aucun endpoint de facturation. [Facturation](https://console.groq.com/docs/billing-faqs).

Quotas publiés GPT-OSS 20B : 30 requêtes/minute, 1 000/jour, 8 000 tokens/minute et 200 000/jour, partagés au niveau organisation ; vérifier la console pour les limites effectives. Un historique long peut donc épuiser le débit avant les 1 000 demandes. Les 429 comportent des indications de reprise. [Limites](https://console.groq.com/docs/rate-limits).

L'API accepte Chat Completions. GPT-OSS 20B figure parmi les modèles de production ; la vitesse affichée par Groq n'est pas une latence mesurée dans Sid'Bot. [Modèles](https://console.groq.com/docs/models), [compatibilité API](https://console.groq.com/docs/openai). Sortie JSON demandée puis validée indépendamment par le serveur ; JSON syntaxiquement correct ne garantit pas des valeurs nutritionnelles exactes. [Sorties structurées](https://console.groq.com/docs/structured-outputs).

L'accord permet les applications destinées aux utilisateurs finaux, sous conditions et licences des modèles ; il prévoit un cocontractant pour les clients EEE. Vérifier lors de l'inscription l'accès effectif depuis la Belgique et les conditions du modèle ; ce n'est pas une preuve de résidence européenne des traitements. Utilisation réservée aux 18 ans et plus ; pas d'activité médicale à risque ni de PHI soumise aux règles américaines sans cadre adapté. Pas de promesse d'accès permanent ou de SLA gratuit. [Accord des services](https://console.groq.com/docs/legal/services-agreement).

Données d'inférence non conservées par défaut, avec exceptions de fiabilité/abus pouvant durer 30 jours ; activer Zero Data Retention dans la console. Les données retenues sont aux États-Unis et les métadonnées d'usage restent collectées. Ne pas confondre ZDR et hébergement UE, ni en déduire une validation juridique pour toute donnée de santé. L'usage pour entraînement doit être vérifié avec les contrôles contractuels applicables avant activation. [Données et rétention](https://console.groq.com/docs/your-data).

Photo : Groq documente Qwen 3.8 27B vision et les images base64. Ce modèle figure actuellement en preview : candidat à évaluer, pas choix de production automatique. Pas de PDF/OCR documentaire dans cette réalisation. [Vision](https://console.groq.com/docs/vision), [cycle des modèles](https://console.groq.com/docs/models).

**Gemini API.** Les conditions courantes imposent les Paid Services pour un client proposé dans l'EEE ; le quota gratuit affiché n'autorise donc pas de conclure « solution gratuite utilisable en Belgique ». Restrictions d'âge et d'usage professionnel également. Écarté dans le cadre sans facturation. Les protections spécifiques EEE sur les données ne suppriment pas la condition Paid Services. [Conditions](https://ai.google.dev/gemini-api/terms), [tarifs et paliers](https://ai.google.dev/gemini-api/docs/pricing). Pas de test qualité/latence.

**Mistral Studio.** Candidat FR/EN, mais pas d'avantage démontré ici sur gratuité de production et confidentialité : la documentation distingue collecte du mode gratuit et contrôles payants. Pas retenu sans analyse supplémentaire de l'offre et des conditions applicables. [Contrôles des données](https://help.mistral.ai/en/articles/347617-do-you-use-my-user-data-to-train-your-artificial-intelligence-models).

**Local via Ollama.** Pas de quota de fournisseur pour une inférence réellement locale, mais coût machine, électricité, accès distant et maintenance. Le serveur du PC n'est pas accessible depuis Supabase via `localhost`. Prévoir une machine disponible, passerelle HTTPS authentifiée et surveillance ; le code utilise un endpoint configuré côté serveur uniquement. Le modèle et sa licence déterminent FR/EN, vision, JSON et usage commercial ; aucune garantie générale. L'API compatible Chat Completions permet de remplacer Groq. [API locale](https://docs.ollama.com/api/openai-compatibility).

Il faut dimensionner mémoire des poids **et** du contexte, choisir la quantification, mesurer sur le matériel réel et vérifier GPU/CPU avec `ollama ps`. Aucun inventaire matériel de Sid ni mesure locale disponible ; aucun achat recommandé. Le mode cloud d'Ollama est différent du mode local et n'est pas activé. [FAQ et mémoire](https://docs.ollama.com/faq). Aucun paiement unique couvrant un service hébergé durable n'a été établi.

## Réalisation et configuration restante

- Déployer `supabase/functions/sidbot` après exécution de `supabase/sql/sidbot.sql` ; authentification utilisateur contrôlée par `/auth/v1/user`. Les secrets existants `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` restent côté Edge.
- Dans les secrets Supabase, définir `SIDBOT_PROVIDER=groq`, `SIDBOT_MODEL=openai/gpt-oss-20b`, `SIDBOT_API_KEY` (ne jamais coller sa valeur dans le chat, le dépôt ou un journal). Une fois le compte Free sans facturation vérifié, définir `SIDBOT_FREE_PLAN_CONFIRMED=true`. Ce drapeau est une attestation de configuration, pas une détection technique du palier par l'API.
- Option : `SIDBOT_DAILY_LIMIT=20` (maximum serveur 40), plafond individuel ; cela ne remplace pas les quotas globaux Groq. Une tentative ratée est comptée pour éviter les boucles. Délai de 5 secondes entre demandes, fournisseur 25 s, auth et compteur 10 s chacun. Aucun réessai automatique et aucune montée en offre.
- Vision facultative : `SIDBOT_VISION_MODEL` seulement après vérification du modèle, de son palier gratuit et essai réel. JPEG <= 1 Mio, seulement message utilisateur de Sid'Forme. Sans modèle vision, erreur `unavailable` avant consommation du compteur et avant envoi au fournisseur.
- Local : `SIDBOT_PROVIDER=local`, `SIDBOT_LOCAL_URL=https://passerelle.example/v1`, `SIDBOT_API_KEY` de la passerelle et `SIDBOT_MODEL` choisi. La passerelle doit vérifier cette clé ; Ollama seul ignore la clé API. Pas d'endpoint fourni par le navigateur, pas de fallback cloud.
- Avant activation réelle : vérifier limite d'âge côté produit, consentement et notice du fournisseur effectivement choisi, ZDR, accès Belgique, licences, quotas et essais FR/EN sur données fictives. Pas de collecte automatique de toutes les données. Actions uniquement proposées, filtrées par app, à faire confirmer dans le client.
- Sans clé : l'UI, les calculs et les autres fonctionnalités restent testables ; le backend répond `not_configured`. Le faux serveur est explicitement une simulation.

## Contrat et vérifications

POST authentifié : `{app:"journee"|"forme"|"note",locale:"fr"|"en",messages:[{role:"user"|"assistant",content,image?}],context?,task?}`. Maximum 20 messages, 8 000 caractères par message, 24 000 au total, corps <= 1 500 000 octets. Contexte filtré côté serveur : tâches <= 100, repas <= 30, poids <= 5, note explicite <= 8 000 caractères. Les champs hors liste sont écartés ; les notes marquées protégées sont rejetées. La validation structurelle ne peut pas identifier un secret que quelqu'un saisit lui-même dans une conversation ou dans une note ordinaire jointe.

`200 {reply,actions,usage:{used,limit,reset}}`, reset UTC ISO. Erreurs : `auth` 401, `bad_request` 400/413/405, `quota` et `rate` 429 + `Retry-After`, `timeout` 504, `unavailable`/`not_configured` 503. Épuisement quotidien fournisseur détecté via en-tête restant à zéro ; les autres 429 sont des limites temporaires, jamais un passage au payant.

Actions : `add_task`, `add_note`, `log_meal` selon l'app. Repas : `{date,time?,name,items:[{name,qty,kcal,p,c,f,g?,unit_g?,unit_label?}]}` ; nutriments = totaux pour qty, g = masse comestible totale, unit_g = masse par pièce, unit_label = calibre/référence estimative. Date passée préservée. Aucun appel d'écriture dans Edge.

Tests réels exécutés : `tests/sidbot-serveur.test.cjs` (transport simulé), `tests/sidbot-sql.test.cjs` avec PostgreSQL/WASM PGlite 0.5.15 installé séparément en /tmp (installation SQL, limite, cadence, accès refusé aux rôles public). Vérification syntaxique TypeScript du cœur. Ces essais ne valident ni déploiement Supabase distant, ni acceptation d'une clé réelle, ni qualité d'un modèle.

Développement : skills smux, Supabase et bonnes pratiques Postgres lus ; exploration ciblée, tests indépendants, aucun sous-agent. Pas de compteur fiable de tokens de développement exposé, donc aucune économie chiffrée revendiquée. Tokens Sid'Bot distincts : contexte/historique bornés et réponse plafonnée à 1 800 tokens.
