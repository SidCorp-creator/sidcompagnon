# Sid'home v43 — rapport RGPD, cookies et accessibilité (22 oct. 2026)

> Ce rapport est un travail technique soigné, **pas un avis juridique**. Il réduit fortement les risques, mais seul un juriste (ou l'APD) peut confirmer la conformité. Les points « à faire par Sid » sont indispensables.

## 1. Inventaire des données

| Donnée | Finalité | Base légale | Conservation | Où | Sous-traitant |
|---|---|---|---|---|---|
| E-mail, pseudo | Compte, connexion | Contrat (6.1.b) | Vie du compte | Supabase (Francfort) | Supabase |
| Mot de passe (haché) | Connexion | Contrat | Vie du compte | Supabase Auth | Supabase |
| Acceptation des conditions (date, version) | Preuve | Obligation / intérêt légitime | Vie du compte | Supabase Auth (métadonnées) | Supabase |
| Agenda, tâches, notes, dossiers, réglages | Le service, synchro | Contrat | Vie du compte ; supprimés : 90 j ; sauvegardes : 14 j* | Supabase + appareil | Supabase |
| Mots de passe, notes secrètes, documents | Coffre | Contrat | Vie du compte | Supabase (chiffré de bout en bout) | Supabase (ne peut pas lire) |
| **Santé** : poids, repas, profil, séances, zones à ménager | Nutrition, graphiques, programme | **Consentement explicite (9.2.a)** | Vie du compte / retrait | Supabase + appareil | Supabase ; Anthropic si la personne branche *son* Claude |
| Photos des notes | Affichage | Contrat | Vie de la note | Supabase Storage | Supabase |
| Mémoire des aliments | Réponses sans IA | Intérêt légitime (anonyme) | Illimitée | Supabase | Supabase |
| Abonnement notifications | Rappels | Consentement | Jusqu'à désactivation | Supabase | Supabase + Apple/Google/Mozilla |
| Clés du connecteur (empreinte) | Connecteur Claude | Contrat | Jusqu'au retrait | Supabase | Supabase ; Anthropic à l'usage |
| Rapports d'erreur (version, message, navigateur) | Corriger les bugs | Intérêt légitime | 90 j* | Supabase | Supabase |
| Compteur mémoire des aliments / anti-doublon notifications | Abus, doublons | Intérêt légitime | 30 j* | Supabase | Supabase |
| Journaux du site (IP…) | Fonctionnement, sécurité | Intérêt légitime | Selon Netlify | Netlify | Netlify (USA) |
| Journaux de la base (IP) | Sécurité | Intérêt légitime | Quelques jours | Supabase | Supabase |
| Stockage local (session, copie, préférences, cache) | Faire marcher l'app | Strictement nécessaire (loi 13/06/2005, art. 129) | Jusqu'à déconnexion | Appareil | — |
| Lecteur Spotify | Musique (Focus) | Consentement (clic) | Selon Spotify | Spotify | Spotify AB |
| Copies d'avant la v42 (schéma `sauvegarde`) | Filet de sécurité de la mise à jour | Intérêt légitime | **À supprimer** dès validation | Supabase | Supabase |

\* durées effectives seulement après exécution de `supabase/sql/v43.sql`.

**Cookies** : aucun cookie déposé par Sid'home. **Analytics** : aucun. **Scripts / polices tiers** : supprimés en v43 (polices et pdf.js hébergés sur le site). **API Claude** : Sid'home n'appelle plus l'API d'Anthropic ; c'est le compte Claude de chaque personne qui lit ses données par le connecteur, à sa demande.

## 2. Corrigé en v43
- Polices Google hébergées localement (plus d'IP envoyée à Google — cf. jugement LG München 2022) ; pdf.js hébergé localement (empreintes vérifiées) ; CSP sans aucun domaine tiers pour scripts, styles et polices.
- Spotify chargé seulement après un clic explicite, retirable (« Ne plus charger Spotify sur cet appareil »).
- Textes de confidentialité corrigés (ils disaient encore que la santé passe par le serveur vers Anthropic) ; ajout d'une politique des cookies ; pages publiques `confidentialite.html`, `conditions.html`, `cookies.html` avec l'inventaire complet.
- Inscription : case **non pré-cochée** « J'accepte les conditions… et j'ai lu la politique de confidentialité », date et version enregistrées avec le compte.
- Accord santé : texte mis à jour, demandé aussi avant d'envoyer une demande de programme à Claude.
- Accessibilité : contraste des textes gris (4,49 → 5,5 : 1), onglets Chrono / Minuteur annoncés correctement (rôle, flèches), lien « Aller au contenu », audit axe-core WCAG 2.1 AA sans violation (clair et sombre, iPhone et ordinateur, 14 écrans + pages légales).
- `robots.txt`, `sitemap.xml`, `llms.txt`, balises meta (description, Open Graph, canonical), `<noscript>` explicatif.

## 3. Déjà conforme
- Export complet des données (Réglages > « Tes données et ta vie privée »), suppression des données et **suppression du compte en libre-service** (fichiers, abonnements, clés, données ; cascade en base).
- Coffre chiffré de bout en bout ; règles RLS sur toutes les tables publiques ; données dans l'UE.
- Accord santé explicite, retirable dans Réglages.
- Pas de remboursement à prévoir : rien n'est payant (si un jour il y a un abonnement, il faudra CGV, droit de rétractation de 14 jours et politique de remboursement).

## 4. À faire / vérifier par Sid
1. **Compléter les champs `[À COMPLÉTER]`** des pages légales : nom et prénom du responsable, adresse, e-mail de contact vie privée, n° BCE si SidCorp est une entreprise, tribunal compétent.
2. **Exécuter `supabase/sql/v43.sql`** (purge des vieilles sauvegardes et journaux, protection du schéma `sauvegarde`), puis, une fois la v43 validée, **supprimer le schéma `sauvegarde`** (ligne commentée à la fin du fichier).
3. **Accepter les DPA** (accords de sous-traitance) de Supabase et de Netlify dans leurs tableaux de bord, et vérifier leur mécanisme de transfert hors UE (Data Privacy Framework ou clauses types).
4. Tenir un **registre des traitements** (art. 30) : le tableau ci-dessus peut servir de base.
5. Données de santé : l'utilisation est limitée à toi et tes proches, mais une **analyse d'impact (AIPD)** est recommandée par l'APD dès qu'il y a des données de santé ; à faire si l'app s'ouvre plus largement.
6. Vérifier la durée des journaux Netlify (offre gratuite) et la mentionner.
7. Faire relire les textes par un juriste si l'app dépasse le cercle des proches.
