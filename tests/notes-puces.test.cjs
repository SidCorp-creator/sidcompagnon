// v85 : dans Notes, les puces et les numéros de liste sont à gauche du texte en français ; une ligne en arabe a la sienne à droite.
// Avant : le flottant de pagination (v82, large de 100 %) repoussait les marqueurs natifs à droite de la page.
const {chromium}=require('../app/node_modules/playwright'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch();try{
 const p=await browser.newPage({viewport:{width:390,height:844}});const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>{window.__noIntro=true});
 await p.goto('http://localhost:'+(process.env.SID_SITE_PORT||8766));
 await p.fill('#aName','Puces');await p.fill('#aEmail',`puces-${Date.now()}@test.be`);await p.fill('#aPw','secret11');await p.fill('#aPw2','secret11');await p.check('#aAgree');await p.click('#aBtn');await p.click('#onbSkip');
 const long='<p>'+'Texte de remplissage. '.repeat(420)+'</p>';
 await p.evaluate(h=>{show('notes');const n={id:'l',title:'Liste',body:'',html:h,upd:Date.now()};NT().push(n);openNote(n.id)},
  '<p>Avant</p><ul><li>Premier point</li><li>'+'Un point très long qui passe à la ligne. '.repeat(6)+'</li></ul><ol><li>Un</li><li>Deux</li></ol><ul class="chk"><li data-c="0">case</li></ul><ul><li>مرحبا بالعالم</li><li>Retour au français</li></ul>'+long+'<ul><li>Puce en page suivante</li></ul>');
 await p.waitForFunction(()=>Number($('notePages').dataset.pages)>1);
 const m=await p.evaluate(()=>{const b=$('noteBody'),r=b.getBoundingClientRect();return {left:r.left,right:r.right,ulDir:[...b.querySelectorAll('ul,ol')].map(x=>x.getAttribute('dir')),
  items:[...b.querySelectorAll('li')].map(li=>{const q=li.getBoundingClientRect(),g=document.createRange();g.selectNodeContents(li);const rs=[...g.getClientRects()].filter(x=>x.width);
   const cs=getComputedStyle(li),mk=getComputedStyle(li,'::before');
   return {txt:li.textContent.slice(0,14),dir:cs.direction,attr:li.getAttribute('dir'),liL:q.left,liR:q.right,tL:Math.min(...rs.map(x=>x.left)),tR:Math.max(...rs.map(x=>x.right)),lines:rs.length,marker:mk.content,type:cs.listStyleType}})}});
 assert.ok(m.ulDir.every(d=>d===null),'pas de dir sur la liste entière');
 for(const it of m.items){
  assert.equal(it.attr,'auto',`dir="auto" sur « ${it.txt} »`);assert.equal(it.type,'none',`pas de marqueur natif sur « ${it.txt} »`);
  if(it.dir==='rtl'){assert.match(it.txt,/مرحبا/);assert.ok(Math.abs(it.liR-m.right)<2&&it.liR-it.tR>=24&&it.liR-it.tR<=36&&it.tL>m.left+100,`arabe : texte à droite, place de la puce à droite (${JSON.stringify(it)})`)}
  else{assert.ok(Math.abs(it.liR-m.right)<2,`« ${it.txt} » va jusqu'au bord droit`);assert.ok(Math.abs(it.tL-it.liL)<2&&it.liL-m.left>=24&&it.liL-m.left<=36,`« ${it.txt} » : texte juste après sa puce, à gauche (${it.liL-m.left})`)}}
 const fr=m.items.filter(x=>x.dir==='ltr');assert.equal(fr.length,7);assert.equal(m.items.filter(x=>x.dir==='rtl').length,1);
 assert.ok(m.items[1].lines>1,'le point long tient sur plusieurs lignes, toutes alignées après la puce');
 assert.ok(/•|•/.test(m.items[0].marker)&&/counter\(nli\)/.test(m.items[2].marker),'puce et numéro dessinés');
 // la puce reste sur la ligne de son texte, y compris après un saut de page (écart entre deux feuilles)
 const last=await p.evaluate(()=>{const li=[...$('noteBody').querySelectorAll('li')].pop(),g=document.createRange();g.selectNodeContents(li);const t=g.getClientRects()[0],q=li.getBoundingClientRect();return {tTop:t.top,liTop:q.top,liBottom:q.bottom}});
 assert.ok(last.tTop>=last.liTop-1&&last.tTop<last.liBottom,'texte de la dernière puce dans sa ligne');
 // une liste créée à la main reçoit aussi le sens par ligne, et la note enregistrée le garde
 await p.evaluate(()=>{const b=$('noteBody');b.innerHTML='<ul><li>Nouveau</li></ul><div>Texte</div>';noteInput()});
 assert.deepEqual(await p.evaluate(()=>[...$('noteBody').querySelectorAll('li,div')].map(x=>x.getAttribute('dir'))),['auto','auto']);
 assert.equal(await p.evaluate(()=>rtClean('<ul dir="rtl" style="direction:rtl"><li dir="rtl">a</li></ul>')),'<ul><li dir="auto">a</li></ul>');
 // case à cocher : toujours cliquable à gauche
 await p.evaluate(()=>{$('noteBody').innerHTML='<ul class="chk"><li data-c="0">case</li></ul>';noteInput()});
 const box=await p.locator('#noteBody ul.chk>li').boundingBox();await p.mouse.click(box.x-18,box.y+12);
 assert.equal(await p.getAttribute('#noteBody ul.chk>li','data-c'),'1','case cochée en touchant la case');await p.mouse.click(box.x+20,box.y+12);
 assert.equal(await p.getAttribute('#noteBody ul.chk>li','data-c'),'1');
 assert.deepEqual(errors,[]);console.log('notes-puces OK');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
