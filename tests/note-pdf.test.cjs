const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx={Uint8Array};vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(__dirname,'../app/src/shell/29b-note-pdf.js'),'utf8'),ctx);
const pdfjs=require('../site/lib/pdfjs/pdf.min.js');pdfjs.GlobalWorkerOptions.workerSrc=path.join(__dirname,'../site/lib/pdfjs/pdf.worker.min.js');
const normal=s=>s.replace(/\s+/g,' ').trim();
const read=async bytes=>{const doc=await pdfjs.getDocument({data:bytes,disableFontFace:true,useSystemFonts:true,isEvalSupported:false}).promise;const pages=[];for(let n=1;n<=doc.numPages;n++){const p=await doc.getPage(n),text=await p.getTextContent({disableNormalization:true});pages.push({text:normal(text.items.map(x=>x.str||'').join(' ')),items:text.items.filter(x=>typeof x.str==='string'),view:p.view,fonts:text.styles})}const meta=await doc.getMetadata();return {doc,pages,meta}};
(async()=>{
const fixture={title:'Résumé d’été — « Œuvres »',date:'8 novembre 2026',locale:'fr',blocks:[{t:'h',runs:[{text:'Objectif : écrire'}]},{t:'p',runs:[{text:'Élève, cœur, œuf : Noël, façade, déjà, où, ça, € et … '},{text:'gras',b:true},{text:' / '},{text:'italique',i:true},{text:' / '},{text:'les deux',b:true,i:true}]},{t:'li',runs:[{text:'Premier élément'}]},{t:'oli',n:4,runs:[{text:'Quatrième'}]},{t:'p',runs:[]},{t:'hr',runs:[]},{t:'p',runs:[{text:'Parenthèses (texte), antislash \\ et balises <script>.'}]}]};
const bytes=ctx.notePdf(fixture);assert.ok(bytes instanceof Uint8Array);assert.equal(Buffer.from(bytes).subarray(0,8).toString(),'%PDF-1.4');assert.deepEqual(ctx.notePdf(fixture),bytes,'pure deterministic output');
const r=await read(bytes);assert.equal(r.doc.numPages,1);assert.equal(r.meta.info.Title,fixture.title);assert.equal(r.meta.info.Producer,"Sid'Compagnon");
assert.equal(r.pages[0].text,normal(fixture.title+' '+fixture.date+' Objectif : écrire Élève, cœur, œuf : Noël, façade, déjà, où, ça, € et … gras / italique / les deux • Premier élément 4. Quatrième Parenthèses (texte), antislash \\ et balises <script>. Sid\'Compagnon · page 1 / 1'));
assert.equal(Object.keys(r.pages[0].fonts).length,4,'four font styles are used and parsed');
for(const p of r.pages){assert.ok(Math.abs(p.view[2]-595.2756)<0.01);assert.ok(Math.abs(p.view[3]-841.8898)<0.01);for(const x of p.items){assert.ok(x.transform[4]>=56.68,'left margin');assert.ok(x.transform[4]+x.width<=538.60,'right margin')}}
const unsupported=await read(ctx.notePdf({title:'Unicode',locale:'en',blocks:[{t:'p',runs:[{text:'Cafe\u0301 😀 漢字 fin'}]}]}));assert.match(unsupported.pages[0].text,/Café \? \?\? fin/);
// Stress width, styles and page breaks; textContent verifies byte offsets and Unicode mapping on every page.
const longWord='W'.repeat(260),wide='WWW iii ',blocks=[{t:'p',runs:[{text:longWord,b:true,i:true}]}];for(let i=0;i<180;i++)blocks.push({t:'p',runs:[{text:`Paragraphe ${i} : `},{text:wide.repeat(10),b:i%2===0,i:i%3===0},{text:'œuvre et café.'}]});
const multi=await read(ctx.notePdf({title:'Long note',locale:'en',blocks,photosOmitted:true}));assert.ok(multi.doc.numPages>3);
let extracted='';for(let i=0;i<multi.pages.length;i++){const p=multi.pages[i];assert.ok(p.text.includes(`page ${i+1} / ${multi.doc.numPages}`));assert.match(p.text,/Photos not included/);extracted+=p.text.replace(/^Long note /,'').replace(/Sid'Compagnon · page \d+ \/ \d+ · Photos not included$/,'')+' ';for(const item of p.items){assert.ok(item.transform[4]>=56.68);assert.ok(item.transform[4]+item.width<=538.60,`long text outside margin: ${item.str.slice(0,10)}`)}}
const expected=blocks.flatMap(b=>b.runs.map(r=>r.text)).join(' ');assert.equal(extracted.replace(/\s/g,''),expected.replace(/\s/g,''),'all source text survives page/word wraps');
const empty=await read(ctx.notePdf({title:'',locale:'fr',blocks:[]}));assert.equal(empty.doc.numPages,1);assert.match(empty.pages[0].text,/page 1 \/ 1/);
assert.throws(()=>ctx.notePdf({title:'x',blocks:[{t:'script',runs:[]}]}),e=>e.code==='note_pdf_invalid');assert.throws(()=>ctx.notePdf({title:'x',blocks:[{t:'p',runs:[{text:'x'.repeat(250001)}]}]}),e=>e.code==='note_pdf_too_large');
await Promise.all([r.doc.destroy(),unsupported.doc.destroy(),multi.doc.destroy(),empty.doc.destroy()]);
console.log('note PDF: pdf.js round trip, FR accents/œ/punctuation, 4 fonts, lists/blank/hr, exact text, A4/margins, long words/multipage/footer, Unicode fallback OK');
})().catch(e=>{console.error(e);process.exitCode=1});
