// v85 : chaque page d'une note est une feuille distincte, numérotée « 1 / N » en bas au centre, avec un vide net entre deux feuilles.
const {chromium}=require('../app/node_modules/playwright'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch();try{
 const p=await browser.newPage({viewport:{width:390,height:844}});const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>{window.__noIntro=true});await p.goto('http://localhost:'+(process.env.SID_SITE_PORT||8766));
 await p.fill('#aName','Pages');await p.fill('#aEmail',`pages-${Date.now()}@test.be`);await p.fill('#aPw','secret11');await p.fill('#aPw2','secret11');await p.check('#aAgree');await p.click('#aBtn');await p.click('#onbSkip');
 await p.evaluate(()=>{show('notes');const n={id:'long',title:'Longue',body:'',html:'<p>'+('Texte de la note. '.repeat(700))+'</p>',upd:Date.now()};NT().push(n);openNote(n.id)});
 await p.waitForFunction(()=>Number($('notePages').dataset.pages)>2&&document.querySelectorAll('.note-sheet').length===Number($('notePages').dataset.pages));
 const m=await p.evaluate(()=>{const n=Number($('notePages').dataset.pages),body=$('noteBody').getBoundingClientRect();
  return {n,sheets:[...document.querySelectorAll('.note-sheet')].map(s=>{const r=s.getBoundingClientRect(),l=s.querySelector('.note-sheet-n'),q=l.getBoundingClientRect(),c=getComputedStyle(s);
   return {top:r.top,bottom:r.bottom,left:r.left,right:r.right,label:l.textContent,lx:(q.left+q.right)/2,lb:q.bottom,border:parseFloat(c.borderTopWidth),shadow:c.boxShadow}}),
   texts:(()=>{const w=document.createTreeWalker($('noteBody'),NodeFilter.SHOW_TEXT),out=[];let t;while(t=w.nextNode()){const g=document.createRange();g.selectNodeContents(t);for(const r of g.getClientRects())if(r.width)out.push([r.top,r.bottom])}return out})(),hidden:$('notePageSheets').getAttribute('aria-hidden')}});
 assert.equal(m.sheets.length,m.n);assert.equal(m.hidden,'true','numéros décoratifs, hors lecture d\'écran et hors texte de la note');
 m.sheets.forEach((s,i)=>{assert.equal(s.label,`${i+1} / ${m.n}`);assert.ok(Math.abs(s.lx-(s.left+s.right)/2)<1.5,'numéro centré');assert.ok(s.bottom-s.lb>=3&&s.bottom-s.lb<=12,'numéro en bas de la feuille');
  assert.ok(s.border>=1&&s.shadow!=='none','bordure fine et ombre');
  if(i)assert.ok(s.top-m.sheets[i-1].bottom>=24,'vide net entre deux feuilles ('+(s.top-m.sheets[i-1].bottom)+' px)')});
 // aucun texte dans le vide entre deux feuilles ni sur le numéro de page
 for(const [top,bottom] of m.texts){const s=m.sheets.find(x=>top>=x.top-1&&bottom<=x.bottom+1);assert.ok(s,'ligne entièrement dans une feuille');assert.ok(bottom<=s.lb-14,'le texte ne touche pas le numéro')}
 assert.doesNotMatch(await p.evaluate(()=>rtText($('noteBody'))+noteView(noteFind('long')).body),/\d+ \/ \d+/,'le numéro ne fait pas partie du texte de la note');
 // une note courte : « 1 / 1 » ; supprimer du texte réduit le nombre de feuilles
 await p.evaluate(()=>{$('noteBody').innerHTML='<p>Courte</p>';noteInput()});await p.waitForFunction(()=>document.querySelectorAll('.note-sheet').length===1);
 assert.equal(await p.textContent('.note-sheet-n'),'1 / 1');
 await p.screenshot({path:'tests/out/v85-pages.png'});assert.deepEqual(errors,[]);console.log('notes-pages OK ('+m.n+' feuilles)');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
