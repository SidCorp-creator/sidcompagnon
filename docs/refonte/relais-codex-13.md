# v78 — P1 / S1 prêts pour revue

Base `375485f`, branche `v78-codex`. Aucun fichier du worktree Claude modifié. Aucun déploiement.

## P1 : PDF pur

`notePdf({title,date,blocks,locale,photosOmitted?}) -> Uint8Array`, dans `app/src/shell/29b-note-pdf.js`. Ajouter après 29 dans ORDER et dans tsconfig.shell.json (Claude). Pas de DOM, réseau, stockage, bibliothèque ou police à télécharger à l'exécution. La sortie dépend uniquement de l'entrée.

- A4, marges du contenu de 20 mm, titre 20 pt, intertitres 15 pt, texte 11 pt, listes avec retrait suspendu, paragraphes vides et traits séparateurs. Les mots trop longs sont coupés par glyphe ; les lignes suivantes gardent l'alignement du texte des listes.
- Helvetica, Helvetica-Bold, Helvetica-Oblique et Helvetica-BoldOblique, WinAnsi ; avances réelles des glyphes pour chaque variante (sans appliquer de crénage, comme les opérateurs texte émis). Métadonnées Title et Producer, ce dernier exactement `Sid'Compagnon`. Métadonnées encodées en UTF-16BE ; contenu texte en WinAnsi avec ToUnicode explicite.
- NFC pour les accents décomposés ; espaces fines insécables converties en espaces insécables. Caractères hors WinAnsi remplacés par `?` par point de code non pris en charge ; caractères de jointure/variation non imprimables omis. Ce n'est pas une prise en charge intégrale d'Unicode (emoji, arabe, CJK).
- Pied `Sid'Compagnon · page n / N`, plus `Photos non incluses` / `Photos not included` si photosOmitted. Aucune photo n'est incluse. Le texte est sérialisé en chaînes hexadécimales, jamais comme commandes PDF ; pas de liens actifs, JavaScript ou pièces jointes générés.
- Entrées : title/date sont du texte (date déjà formatée par le client), blocks selon relais12, n des listes ordonnées entier (zéro/négatif acceptés), locale fr/en. Limites : 5 000 blocs, 250 000 caractères, 500 pages, titre 2 000 caractères. Échec lisible FR/EN avec code `note_pdf_invalid` ou `note_pdf_too_large`.

Sources des métriques : AFM Helvetica d'Adobe distribués dans [PDFKit](https://github.com/foliojs/pdfkit/tree/master/lib/font/data), correspondances de glyphes [Adobe Glyph List](https://github.com/adobe-type-tools/agl-aglfn/), encodages et structure selon la [référence PDF 1.7 Adobe](https://opensource.adobe.com/dc-acrobat-sdk-docs/pdfstandards/pdfreference1.7old.pdf). Seules les valeurs numériques des métriques sont utilisées, aucun programme de police redistribué. Notice de provenance en tête du fichier. Les standards ne sont pas une nouvelle dépendance d'exécution.

Vérification : `node tests/note-pdf.test.cjs` relit les octets produits avec **le pdf.js du dépôt**. Texte attendu = texte extrait normalisé (espaces des coupures de lignes seulement), accents/œ/ponctuation FR, quatre styles réellement analysés, titres/listes/paragraphes vides/hr, chaînes avec parenthèses/antislash/balises, longs mots et document multipage, A4 et positions dans les marges, pieds et photos omises, métadonnées et remplacement Unicode. Sortie identique pour deux entrées identiques. Pas une simple recherche dans les octets du PDF.

## S1 : actions limitées à la note jointe

Actions proposées seulement :

```
edit_note {title?: string <=300, body: string <=8000}
share_note_pdf {}
```

Seulement app=`note` avec un contexte note explicite contenant title/body. Autres apps et absence de note : actions écartées, réponse texte conservée. Marqueurs secret/iv/ct/vid : rejet de la requête avant tout appel amont comme auparavant. `edit_note` interdit les champs supplémentaires (id/html/target…), `share_note_pdf` exige un objet vide. Au plus une proposition edit_note par réponse, doublons supprimés. Titre absent reste absent : le client doit conserver le titre actuel. Corps vide accepté pour un effacement **explicitement confirmé**.

### Garde-fou contre les remplacements depuis un extrait

Le contexte historique tronquait body à 6 000 caractères. **Le client doit transmettre `context.note.complete:true` uniquement si le titre et le corps joints sont intégraux** (titre <=300, body <=8000). Ce booléen est conservé par contextFor. Sans ce signal, edit_note est écarté ; add_note reste inchangé et share_note_pdf reste possible si une note est jointe. Une note plus longue peut être exportée localement intégralement, mais ne doit pas être remplacée à partir de son extrait envoyé à l'IA.

Le serveur vérifie la structure, la taille, le contexte et la portée des propositions. Il ne peut pas prouver sémantiquement que le modèle a changé « seulement ce qui est demandé » : l'instruction exige le corps complet sans placeholders, mais l'aperçu avant/après et la confirmation C1 restent nécessaires. Markdown léger seulement dans l'instruction (listes, gras, italique, titres) ; le client doit traiter le corps comme texte non fiable, l'échapper avant conversion en HTML puis appliquer rtClean.

Le client doit associer chaque proposition à **l'id, au compte et au contenu/version de la note jointe au moment de la demande**. Avant d'appliquer l'édition : vérifier que cette cible est toujours la bonne, non secrète, et inchangée. Ne pas appliquer à la note qui se trouverait ouverte plus tard par hasard. Conserver photos, pièces jointes et champs de protection ; changer seulement titre/body/html/upd selon C1. Undo après confirmation.

Le PDF proposé est fabriqué/partagé localement après clic ; le serveur ne renvoie ni lien ni fichier et ne stocke rien. Le bouton d'export manuel d'une note secrète relève de C1 et doit conserver la confirmation « PDF non protégé ». Ne pas joindre cette note à Sid'Bot pour l'exporter.

Instructions mises à jour avec les trois actions de Notes (add_note/edit_note/share_note_pdf), la portée de la note jointe, la conservation du reste, l'absence de modification automatique et la différence proposition/action réalisée. Les formes d'action proposées varient selon le contexte. Réponse plafonnée à 3 800 tokens quand une note complète est jointe, pour permettre un corps de remplacement jusqu'à 8 000 caractères ; limites/quota et fournisseur inchangés. Cette limite ne garantit pas une réponse valide du fournisseur ; en cas d'erreur aucun remplacement n'est effectué.

Tests : `node tests/sidbot-note-actions.test.cjs`, `node tests/sidbot-serveur.test.cjs`, `node tests/sidbot-programme.test.cjs`. Attachement/complet/non complet, apps, secrets, tailles, champs non autorisés, titre absent, corps vide, doublons, instruction, réponse fournisseur simulée de bout en bout et quota. Aucune écriture de note ni création/partage de fichier côté serveur. Les tests ne sont pas des appels à un fournisseur réel.

## Vérification et reprise

- P1 contrôlé par TypeScript `--allowJs --checkJs --target es2022 --lib es2022,dom` ; source isolée, sans globaux app requis.
- S1 : `npx --yes --package deno@2.9.6 deno check supabase/functions/sidbot/index.ts`.
- C1/build/captures/navigateur/partage réel sur mobile : Claude ; Codex fera la revue des contrôles de cible, de données et du rendu après intégration.
- Skills : sid-relais pour périmètre/relais et sorties ciblées, Supabase pour la frontière Edge. Aucune installation de bibliothèque dans l'app et aucun sous-agent. Aucun pourcentage d'économie de tokens inventé.
