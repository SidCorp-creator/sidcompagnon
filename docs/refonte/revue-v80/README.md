# G1 — illustrations v80

État : prêt à intégrer. Les 17 exercices (34 images sélectionnées) ont été validés visuellement par Claude V1 ; décisions et corrections conservées dans [VALIDATIONS.md](VALIDATIONS.md). Aucun nouvel appel de génération après cette validation.

Génération : outil intégré OpenAI image_gen exclusivement, quota inclus demandé, aucune API payante ni crédit supplémentaire appelé. 42 générations réussies, dont 8 essais écartés et conservés dans les sous-dossiers `rejets/` avec leurs prompts. Aucun signal de quota reçu. Le nom de modèle est documenté comme « gpt-image-2 (selon la documentation Codex) » : l’outil ne renvoie pas son identifiant de modèle.

Les dossiers `pilote`, `lot-01`, `lot-02`, `lot-03`, `lot-04` contiennent chacun les JPEG de revue et `PROMPTS.json` (prompts exacts, références, empreintes de l’original et du JPEG, validation). Les originaux PNG sont conservés localement aux chemins consignés, hors dépôt. Les 34 JPEG validés ont été copiés sans nouvelle transformation dans `site/exercices/illustration-*.jpg`.

Contrat : `SIDFIT_ILLUS[nom]={tool,model,date}`, `SOURCES.json` avec `provider/kind: illustration`, conditions OpenAI (aucune licence CC revendiquée), prompts et preuves de validation. W : `SIDFIT_PHOTO_LABELS` distingue la vue de dessus bras posés de la vue latérale bras décollés, en FR/EN. Shrugs : haltères illustrés, machine non illustrée ; goblet squat : haltère illustré, kettlebell non illustrée. Les textes visibles correspondants et la mention « Illustration » relèvent de U1 chez Claude.

Couverture après intégration : 58/58, dont 41 paires photographiques existantes et 17 paires originales illustrées ; `MISSING.json` vide. Aucun exercice retiré du moteur. Les anciennes attributions Commons et les anciennes images sont conservées.

Vérifications réussies :

- `LD_LIBRARY_PATH=~/.local/share/refonte-libs/usr/lib/x86_64-linux-gnu node tests/exercices-aide.test.cjs --require-complete` : 116 JPEG décodés par Chromium, 480×320 progressifs, ≤40 KiB, empreintes, conseils FR/EN, sources, marquage illustration, prompts/V1, alias et parité moteur ; cas négatifs pour données manquantes ou falsifiées.
- `node app/scripts/build-muscu-engine.mjs --check`.
- `node tests/muscu-programme.test.cjs`.
- `node tests/sidbot-programme.test.cjs`.
- `node tests/sidbot-serveur.test.cjs`.
- `git diff --check`.

Pas de publication par Codex ; interface U1, reconstruction app, service worker, version et intégration finale à la charge de Claude.
