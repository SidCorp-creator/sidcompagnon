# Relais 12 — v78 Sid'Note : Sid'Bot modifie la note ouverte + « Exporter en PDF » (demande de Sid)

Sid : « j'ai essayé de modifier une note, il n'arrive pas ; partager une note en PDF, il n'arrive pas ». Constat : Sid'Bot `note` n'a que `add_note` ; l'app n'a **aucun** export note → PDF (le « Partager » de 29 l. 312 ne vaut que pour un PDF importé). Sid a validé les deux ajouts ; **pas de publication sans son accord**.

Format note (29 l. 3, 166, 197) : `n.html` (mise en forme nettoyée par `rtClean`) + `n.body` (texte brut). Secrètes : chiffrées, jamais dans Sid'Bot.

## Répartition proposée
| Lot | Resp. | Fichiers | Résultat | Revue |
|---|---|---|---|---|
| P1 Générateur PDF pur, sans dépendance (CSP `self`) | **Codex** | nouveau `app/src/shell/29b-note-pdf.js` (+ ORDER/tsconfig : moi), `tests/note-pdf.test.cjs` | `notePdf({title,date,blocks,locale}) -> Uint8Array` ; A4, marges 2 cm, Helvetica/Helvetica-Bold/Oblique/BoldOblique en WinAnsiEncoding (accents FR, œ, «», –, …), retour à la ligne par largeur réelle des glyphes, pages multiples, pied « page n / N », métadonnées Title/Producer « Sid'Compagnon » ; caractères hors WinAnsi remplacés proprement ; le test relit le fichier avec `site/lib/pdfjs` (texte extrait = texte attendu) | Claude |
| S1 Sid'Bot serveur : actions `edit_note {title?, body}` et `share_note_pdf {}` | **Codex** | `supabase/functions/sidbot/core.ts`, tests serveur | autorisées seulement si `context.note` joint ; `body` en texte avec Markdown léger (`- `, `1. `, `**gras**`, `*italique*`, `## titre`) ≤ 8000 ; consigne : modifier seulement ce qui est demandé, garder le reste ; proposer, ne pas affirmer | Claude |
| C1 Client : action `edit_note` (aperçu avant/après, avertissement si mise en forme remplacée, « Remplacer », annulation par `undoable`), `share_note_pdf`, bouton « Exporter en PDF » dans le menu de la note, conversion `html -> blocks`, partage `navigator.share` sinon téléchargement, note secrète : confirmation « PDF non protégé », FR/EN, tests navigateur | **Claude** | 29, 32, index.html, app.css, i18n.js, tests | — | Codex |
| Intégration, version 78, tests réunis | Claude | — | — | — |

## Interface `blocks`
`[{t:"h"|"p"|"li"|"oli"|"hr", n?:numéro, runs:[{text, b?:true, i?:true}]}]` — paragraphes vides = `{t:"p",runs:[]}`. Photos de note : non incluses en v78 (mention « photos non incluses » dans le pied si la note en a : champ `photosOmitted:true`).

Branches : moi `v78-notes` depuis `375485f` (= main). Toi : `v78-codex` depuis `375485f`. Skills : `sid-relais`, `sid-charte` (moi), `supabase` (toi) ; aucun autre.
