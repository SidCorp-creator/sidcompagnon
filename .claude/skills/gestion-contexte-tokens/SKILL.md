---
name: gestion-contexte-tokens
description: Gestion du contexte et des tokens pour Claude Code et Codex sur Sid'Compagnon — lire juste ce qu'il faut, borner les sorties, tenir un journal de passation court (décisions, preuves, fichiers touchés, prochaine étape) et le mettre à jour avant toute reprise de session, compaction ou passage de relais. À charger au début de chaque chantier partagé et avant chaque relais.
---

# Gestion du contexte et des tokens

Skill partagé (v81, 11 nov. 2026). Source : `.claude/skills/gestion-contexte-tokens/` ; Codex : `.agents/skills/gestion-contexte-tokens` (lien). Il **réutilise** `sid-relais` (lectures ciblées, carte du projet, relais compacts, pièges tmux-bridge) : appliquer `sid-relais` §§ 1-5 tels quels, et ce qui suit en plus.

## 1. Budget de lecture
- Commencer par le **journal de passation** du chantier (§ 3) et la carte de `sid-relais` § 5. Ne jamais refaire une recherche déjà conclue dans le journal.
- Repérer avant de lire : `grep -n` / `rg -n` précis → plage utile (`sed -n a,bp`, 60 lignes au plus par passe). Couper les lignes longues (`cut -c1-250`) : le shell minifié a des lignes de plusieurs milliers de caractères.
- Sorties d'outil bornées (`head`, `tail`, `--stat`, `grep -c`). Une sortie volumineuse va dans un fichier du scratchpad, puis on n'en lit que l'extrait utile.
- Web : documentation officielle d'abord, une question précise par page, noter l'URL et la date de lecture dans le journal (preuve réutilisable).
- Pas de sous-agent sans demande de Sid : il repart de zéro et double la dépense.

## 2. Garder la fenêtre utile
- Une seule source de vérité par sujet : la décision va dans le journal, pas répétée dans les messages.
- Résultats de test : garder la commande exacte et la ligne de résultat (OK / n échecs), pas toute la sortie.
- Avant une tâche longue ou quand le contexte est chargé : mettre le journal à jour **d'abord** (la compaction peut survenir à tout moment).

## 3. Journal de passation
Fichier : `docs/v81/journal.md` (une version = un dossier `docs/vNN/`). Une entrée par étape significative, 6 lignes au plus :
```
### AAAA-MM-JJ HH:MM — <agent> — <chantier>
Décision : …
Preuve : commande/test/URL + résultat
Fichiers : chemin (l. a-b), …
Prochaine étape : action précise (et qui)
```
Règles : écrire au présent, des faits vérifiés seulement ; marquer « non vérifié » ce qui l'est ; ne jamais y copier un secret, un jeton, une clé ou une donnée personnelle de Sid.

## 4. Reprise et relais
- Avant `/compact`, une fin de session ou un message de relais : entrée de journal à jour, puis message tmux-bridge de 10 lignes au plus qui **pointe** vers l'entrée (format `sid-relais` § 3).
- À la reprise : lire la dernière entrée de chaque chantier, `git status -s` et `git log --oneline -5` de la branche, puis reprendre à « Prochaine étape ».
