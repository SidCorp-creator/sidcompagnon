// v83 : texte sélectionnable et copiable dans le lecteur PDF de Sid'Note, bouton Annuler des annotations.
// Faux Supabase : lancer tests/serve.js avant ce test (SID_SITE_PORT). Aucun compte réel.
const {chromium}=require('../app/node_modules/playwright');
const assert=require('node:assert/strict');
const port=process.env.SID_SITE_PORT||8766;
// PDF d'une page sans aucun texte (comme un scan) : un simple rectangle gris
const scan=()=>{const a=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 420] /Contents 4 0 R >>','<< /Length 31 >>\nstream\n0.8 g 40 40 220 340 re f\nendstream'];
  let s='%PDF-1.4\n';const off=[];a.forEach((o,i)=>{off.push(s.length);s+=`${i+1} 0 obj\n${o}\nendobj\n`});const x=s.length;
  s+=`xref\n0 ${a.length+1}\n0000000000 65535 f \n`+off.map(n=>String(n).padStart(10,'0')+' 00000 n \n').join('')+`trailer\n<< /Size ${a.length+1} /Root 1 0 R >>\nstartxref\n${x}\n%%EOF\n`;return Buffer.from(s,'latin1')};
async function run(browser,width,height,touch){
 const ctx=await browser.newContext({viewport:{width,height},hasTouch:touch,permissions:['clipboard-read','clipboard-write']});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));
 await p.addInitScript(()=>{window.__noIntro=true});
 await p.goto('http://localhost:'+port);
 await p.fill('#aName','Lecteur');await p.fill('#aEmail',`pdf-${width}-${Date.now()}@test.be`);await p.fill('#aPw','secret11');await p.fill('#aPw2','secret11');await p.check('#aAgree');await p.click('#aBtn');await p.click('#onbSkip');
 // un vrai PDF avec du texte (polices Helvetica, deux pages), fabriqué par l'export de notes de l'app
 const bytes=await p.evaluate(()=>{show('notes');const blocks=[{t:'h',runs:[{text:'Chapitre un : la photosynthèse'}]},{t:'p',runs:[{text:'La chlorophylle capte la lumière du soleil.'}]},{t:'p',runs:[{text:'Phrase à copier dans ma note : énergie, eau et dioxyde de carbone.'}]}];
   for(let i=0;i<70;i++)blocks.push({t:'p',runs:[{text:'Ligne de remplissage numéro '+i+'.'}]});return Array.from(notePdf({title:'Cours de biologie',date:'',blocks}))});
 const pdf=Buffer.from(bytes);
 await p.locator('#pdfIn').setInputFiles({name:'Cours de biologie.pdf',mimeType:'application/pdf',buffer:pdf});
 await p.waitForSelector('#pvBody .pv-tl span',{timeout:15000});
 assert.equal(await p.getAttribute('#pdfv','data-tool'),'read');assert.equal(await p.isDisabled('#pvUndo'),true,'Annuler désactivé à l\'ouverture');
 assert.equal(await p.isHidden('#pvHint'),true,'pas de message de scan pour un PDF avec du texte');
 // la couche de texte est posée sur le texte dessiné : chaque ligne reste dans la page, et sa largeur suit celle du PDF
 const geo=await p.evaluate(async()=>{const w=document.querySelector('#pvBody .pv-page'),r=w.getBoundingClientRect(),pg=await pv.pdf.getPage(1),v=pg.getViewport({scale:1}),tc=await pg.getTextContent();
   const items=tc.items.filter(i=>i.str),spans=[...w.querySelectorAll('.pv-tl span')];let worst=0,inside=true;
   spans.forEach((s,i)=>{const b=s.getBoundingClientRect(),it=items[i],m=pdfjsLib.Util.transform(v.transform,it.transform),k=r.width/v.width;
     worst=Math.max(worst,Math.abs(b.width-it.width*k),Math.abs(b.left-r.left-m[4]*k),Math.abs(b.bottom-r.top-m[5]*k)-Math.hypot(m[2],m[3])*k*.3);
     if(b.left<r.left-1||b.right>r.right+1||b.top<r.top-1||b.bottom>r.bottom+1)inside=false});
   return {n:spans.length,items:items.length,worst,inside}});
 assert.equal(geo.n,geo.items);assert.ok(geo.n>20);assert.ok(geo.inside,'texte dans la page');assert.ok(geo.worst<2.5,'couche de texte alignée (écart '+geo.worst.toFixed(2)+' px)');
 // en mode Lire, rien ne recouvre le texte : c'est bien lui qui reçoit le pointeur
 const span=p.locator('#pvBody .pv-tl span',{hasText:'Phrase à copier'});const box=await span.boundingBox();
 assert.equal(await p.evaluate(({x,y})=>{const e=document.elementFromPoint(x,y);return !!e.closest('.pv-tl')&&getComputedStyle(e).userSelect},{x:box.x+box.width/2,y:box.y+box.height/2}),'text');
 // sélection à la souris d'un bout à l'autre de la ligne, copie, puis collage dans une note
 await p.mouse.move(box.x+1,box.y+box.height/2);await p.mouse.down();await p.mouse.move(box.x+box.width/2,box.y+box.height/2,{steps:6});await p.mouse.move(box.x+box.width-1,box.y+box.height/2,{steps:6});await p.mouse.up();
 const sel=await p.evaluate(()=>String(getSelection()));assert.ok(sel.includes('énergie, eau et dioxyde de carbon'),'sélection à la souris : « '+sel+' »');
 await p.keyboard.press('Control+c');const clip=await p.evaluate(()=>navigator.clipboard.readText());assert.equal(clip.trim(),sel.trim());
 // sélection sur plusieurs lignes : le texte copié garde les retours à la ligne
 const multi=await p.evaluate(()=>{const s=[...document.querySelectorAll('#pvBody .pv-tl span')],a=s.find(x=>x.textContent.includes('chlorophylle')),b=s.find(x=>x.textContent.includes('Phrase à copier')),r=document.createRange();r.setStart(a.firstChild,0);r.setEnd(b.firstChild,b.textContent.length);getSelection().removeAllRanges();getSelection().addRange(r);return String(getSelection())});
 assert.match(multi,/soleil\.\s*\n\s*Phrase à copier/,'retour à la ligne entre deux lignes copiées');
 // hors du mode Lire, le texte ne gêne pas le dessin
 await p.click('[data-pvt=pen]');assert.equal(await p.evaluate(()=>getComputedStyle(document.querySelector('.pv-tl')).pointerEvents),'none');
 // --- Annuler : deux traits puis une annotation texte, retirés un par un dans l'ordre inverse
 const ov=await p.locator('#pvBody .pv-ov').first().boundingBox();
 const stroke=async(y)=>{await p.mouse.move(ov.x+40,ov.y+y);await p.mouse.down();await p.mouse.move(ov.x+90,ov.y+y+20,{steps:5});await p.mouse.move(ov.x+140,ov.y+y,{steps:5});await p.mouse.up()};
 await stroke(200);assert.equal(await p.isDisabled('#pvUndo'),false);await stroke(260);
 await p.click('[data-pvt=text]');await p.mouse.click(ov.x+60,ov.y+320);await p.locator('#pvBody .pv-txt textarea').fill('Annotation écrite');await p.locator('#pvTitle').focus();
 const ids=await p.evaluate(()=>{pvFlushTxt();return PA().filter(a=>a.note===pv.note).map(a=>a.id+':'+a.t)});assert.deepEqual(ids.map(x=>x.split(':')[1]),['ink','ink','text']);
 const left=()=>p.evaluate(()=>PA().filter(a=>a.note===pv.note).map(a=>a.id+':'+a.t));
 await p.click('#pvUndo');assert.deepEqual(await left(),ids.slice(0,2),'1er clic : l\'annotation texte');assert.equal(await p.locator('#pvBody .pv-txt').count(),0);
 await p.click('#pvUndo');assert.deepEqual(await left(),ids.slice(0,1),'2e clic : le second trait');assert.equal(await p.locator('#pvBody path[data-ann]').count(),1);
 assert.equal(await p.isDisabled('#pvUndo'),false);
 await p.click('#pvUndo');assert.deepEqual(await left(),[],'3e clic : le premier trait');assert.equal(await p.locator('#pvBody path[data-ann]').count(),0);
 assert.equal(await p.isDisabled('#pvUndo'),true,'Annuler désactivé quand l\'historique est vide');
 assert.ok(await p.evaluate(ids=>ids.every(i=>data.del[i.split(':')[0]]),ids),'annotations annulées marquées supprimées (elles ne reviennent pas par la synchro)');
 // un trait gardé, puis un trait effacé à la gomme : Annuler ne le compte plus
 await p.click('[data-pvt=pen]');await stroke(200);await stroke(300);
 // le fichier d'origine n'a pas changé
 const same=await p.evaluate(async orig=>{const b=new Uint8Array(await (await idb.get(pdfKey(pv.note))).arrayBuffer());return b.length===orig.length&&b.every((v,i)=>v===orig[i])},[...pdf]);assert.ok(same,'PDF d\'origine intact');
 await p.click('#pvUndo');const kept=await left();assert.equal(kept.length,1);
 // enregistrement puis réouverture complète : seul le trait gardé est là
 const nid=await p.evaluate(async()=>{const id=pv.note;await pushNow();return id}).catch(async()=>p.evaluate(()=>pv.note));
 await p.waitForTimeout(1500);await p.reload();await p.waitForFunction(()=>typeof PA==='function'&&typeof noteFind==='function'&&NT().length>0,null,{timeout:15000});
 await p.evaluate(id=>{show('notes');pdfOpen(id)},nid);await p.waitForSelector('#pvBody .pv-tl span',{timeout:15000});
 assert.deepEqual(await left(),kept,'après réouverture : rien d\'annulé ne revient');assert.equal(await p.locator('#pvBody path[data-ann]').count(),1);assert.equal(await p.locator('#pvBody .pv-txt').count(),0);
 assert.equal(await p.isDisabled('#pvUndo'),true,'historique vide à la réouverture');
 // collage du texte copié dans une note
 await p.evaluate(()=>navigator.clipboard.writeText('Phrase à copier dans ma note : énergie, eau et dioxyde de carbone.'));
 await p.evaluate(()=>{pvClose();const n={id:'colle',title:'Ma note',body:'',html:'<p><br></p>',upd:Date.now()};NT().push(n);openNote(n.id)});
 await p.locator('#noteBody').focus();await p.keyboard.press('Control+v');await p.waitForFunction(()=>$('noteBody').innerText.includes('dioxyde de carbone'));
 // PDF scanné : pas de couche de texte, et l'interface le dit
 await p.evaluate(()=>{closeNote&&closeNote();show('notes')}).catch(()=>{});
 await p.locator('#pdfIn').setInputFiles({name:'Scan.pdf',mimeType:'application/pdf',buffer:scan()});await p.waitForSelector('#pvBody canvas',{timeout:15000});
 await p.waitForFunction(()=>!$('pvHint').hidden);assert.match(await p.innerText('#pvHint'),/image scannée/);assert.equal(await p.locator('#pvBody .pv-tl').count(),0);
 await p.click('[data-pvt=pen]');assert.doesNotMatch(await p.innerText('#pvHint'),/scannée/);await p.click('[data-pvt=read]');assert.match(await p.innerText('#pvHint'),/image scannée/);
 assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'pas de débordement horizontal');
 await p.screenshot({path:`tests/out/v83-pdf-${width}.png`});
 assert.deepEqual(errs,[]);await ctx.close()}
(async()=>{const browser=await chromium.launch();try{await run(browser,1280,800,false);await run(browser,390,844,true);console.log('ok pdf-copie-annuler (1280 et 390)')}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
