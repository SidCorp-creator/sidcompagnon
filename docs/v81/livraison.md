# Sid’Compagnon v81

La branche d’intégration est `v81-codex`, issue de `origin/main` à `81e39b0`. La [répartition](coordination.md) et le [journal](journal.md) retracent les décisions et vérifications.

## Sid’Note

- Focus rejoint Sid’Note avec ses réglages et son historique quotidien. Projets regroupe des notes et des séances Focus enregistrées en v81. L’historique antérieur contient des totaux quotidiens.
- L’éditeur répartit automatiquement le contenu dans des pages consultables horizontalement. Le texte riche reste dans le même champ, avec la sélection, la mise en forme, le collage et l’annulation du navigateur. Le lecteur PDF et les photos des notes gardent leurs chemins de stockage.
- Dans **Réglages → Tes données et ta vie privée → Exporter l’ancien coffre**, les utilisateurs concernés peuvent télécharger les PDF et leur manifeste de classeurs en ZIP, puis les mots de passe en CSV. Le test local déverrouille un coffre renforcé et contrôle le contenu des deux téléchargements. Sid doit ouvrir les PDF exportés et vérifier le CSV dans un éditeur de texte ou son gestionnaire de mots de passe avant la purge des anciennes données.
- Sid’Bot ouvre le parcours Claude depuis Sid’Note. Si le raccourci prérempli ne s’ouvre pas, l’adresse est visible dans la fenêtre du connecteur et peut être saisie dans **Customize → Connectors → Add custom connector**. Le test navigateur vérifie les liens, le passage d’une référence de note, l’exclusion des notes secrètes et la disparition de l’adresse au changement de compte. [Configuration Claude](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp)
- Claude a testé `lire_note` sur une note avec un PDF réel contenant une information absente du corps. Le connecteur renvoie le texte des PDF de 20 Mo ou moins et jusqu’à quatre photos par note. Les PDF scannés sans couche de texte demandent une photo ou une capture des pages utiles.

## Sid’Nutrition

Open Food Facts fournit les produits emballés recherchés par nom ou code-barres, via le relais authentifié `aliments`. Ciqual 2025 fournit les aliments génériques via un index local de 3 006 entrées renseignant l’énergie et les trois macros. L’ajout passe par la confirmation du journal existant, avec les valeurs par 100 g ou 100 ml et la source. Les mesures par portion sont proposées quand la source donne un poids ou un volume. L’analyse de repas, le calendrier et les graphiques continuent d’utiliser le journal existant. Les deux sources fonctionnent sans clé fournisseur. Claude a vérifié le relais en production avec un compte de test supprimé ensuite. [Échantillon, conditions et alternatives](nutrition-codex.md)

## Planning et chronomètres

La zone en haut des apps affiche les événements du jour selon le fuseau de l’appareil. L’agenda affiche la liste complète. Le test couvre plusieurs événements, les modifications, la suppression, une tâche seule et le passage à minuit.

Focus et le chrono de musculation reprennent à partir de l’heure de départ enregistrée. Dans la fiche d’une séance de musculation, **Démarrer le chrono** et **Arrêter le chrono** pilotent la même horloge que la saisie des séries. Le test rouvre le navigateur avec cinq heures écoulées et vérifie que l’arrêt se propage à un deuxième onglet. Changer la séance chronométrée demande une commande explicite. Une séance du lendemain conserve ses propres statistiques.

## Validation et mise en ligne

Le build v81 et les vérifications ciblées passent. Les 15 configurations Élan passent sur Chromium, de 320 à 1 280 px, en clair et sombre, en français et en anglais, avec React et le rendu de secours. Le contrôle de focus du cas 1 280 px clair avec React a nécessité une relance isolée. Claude a aussi vérifié l’édition d’une note existante avec photo, titres, listes et gras.

Le connecteur MCP et le relais `aliments` sont en service. L’interface v81 est sur la branche d’intégration locale et la production web est en v80. La purge du coffre reste suspendue à la vérification des exports de chaque compte concerné.

## Skills

Smux pour les échanges entre agents, `sid-relais` et `gestion-contexte-tokens` pour la passation, et Supabase pour les fonctions Edge et la revue des accès. L’inventaire des deux agents figure dans la coordination.
