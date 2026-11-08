// v78 : Sid'Note — Sid'Bot modifie la note ouverte (aperçu avant/après, « Remplacer », annulation, garde de version)
// et « Exporter en PDF » (bouton de l'éditeur, menu « ⋯ », action Sid'Bot). Sid'Bot est simulé par une route : pas un test du fournisseur.
const {chromium,devices}=require('../app/node_modules/playwright'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const OUT=path.resolve(__dirname,'out');fs.mkdirSync(OUT,{recursive:true});
const BASE=process.env.NOTE_BASE_URL||'http://localhost:8766';
(async()=>{const b=await chromium.launch();const errors=[];
 for(const [lang,vp] of [['fr',{...devices['iPhone 13']}],['en',{viewport:{width:1280,height:900}}]]){
  const c=await b.newContext({...vp,locale:lang==='fr'?'fr-BE':'en-GB',acceptDownloads:true}),p=await c.newPage();p.setDefaultTimeout(8000);
  await c.addInitScript(l=>{window.__noIntro=true;localStorage.setItem('sidnote-lang',JSON.stringify(l))},lang);p.on('pageerror',e=>errors.push(lang+': '+e.message));
  const sent=[];let reply='edit';
  await c.route(/\/functions\/v1\/sidbot/,async rt=>{const body=JSON.parse(rt.request().postData()||'{}');sent.push(body);
    if(!body.context||!body.context.note)return rt.fulfill({status:200,contentType:'application/json',body:JSON.stringify({reply:'Touche « La note ouverte » puis redemande.',actions:[]})});
    const acts=reply==='edit'?[{type:'edit_note',label:'Note corrigée',payload:{title:'Courses (corrigé)',body:'## Marché\n- **pain** complet\n- lait\n1. payer'}}]:[{type:'share_note_pdf',label:'PDF',payload:{}}];
    return rt.fulfill({status:200,contentType:'application/json',body:JSON.stringify({reply:'Je te propose ceci.',actions:acts})})});
  await p.goto(BASE);await p.fill('#aName','Camille');await p.fill('#aEmail',`np-${Date.now()}-${lang}@test.be`);await p.fill('#aPw','secret11');await p.fill('#aPw2','secret11');await p.check('#aAgree');await p.click('#aBtn');
  await p.waitForSelector('#onb:not([hidden])');await p.click('#onbSkip');if(await p.isVisible('#notifAsk'))await p.click('#naNo');
  await p.evaluate(()=>{NT().push({id:'n1',title:'Courses',body:'pian\nlait',html:'<div><b>pian</b></div><div>lait</div>',createdAt:new Date().toISOString(),upd:1000},
    {id:'n2',title:'Autre',body:'ne pas toucher',createdAt:new Date().toISOString(),upd:1000});save();show('notes');openNote('n1')});await p.waitForTimeout(250);
  // 1) sans note jointe : rien n'est proposé, l'explication s'affiche ; la note n'a pas été envoyée
  await p.click('#noteAppHead [data-app-claude]');await p.waitForSelector('#sbSheet:not([hidden])');
  assert.equal(await p.locator('[data-sbctx="note"]').getAttribute('aria-pressed'),'false');
  await p.fill('#sbIn','corrige ma note');await p.click('#sbSend');await p.waitForSelector('.sb-msg.bot');
  assert.equal(sent.at(-1).context.note,undefined);assert.equal(await p.locator('[data-sbact]').count(),0);
  // 2) note jointe : complète, la proposition apparaît, l'aperçu avant/après s'ouvre
  await p.click('[data-sbctx="note"]');await p.fill('#sbIn','corrige ma note');await p.click('#sbSend');await p.waitForSelector('[data-sbact]');
  const ctx=sent.at(-1).context.note;assert.deepEqual([ctx.title,ctx.body,ctx.complete],['Courses','pian\nlait',true]);assert.ok(!('html' in ctx)&&!('id' in ctx));
  await p.click('[data-sbact]');await p.waitForSelector('.sb-diff');
  const diff=await p.locator('.sb-diff').innerText();assert.match(diff,/pian/);assert.match(diff,/pain complet/);
  await p.screenshot({path:path.join(OUT,`note-sidbot-${lang}-avant-apres.png`)});
  await p.click('[data-sbdiffok]');await p.waitForSelector('.sb-ok');
  const n1=await p.evaluate(()=>{const n=noteFind('n1');return {t:n.title,b:n.body,h:n.html}});
  assert.equal(n1.t,'Courses (corrigé)');assert.match(n1.b,/pain complet/);assert.match(n1.h,/<b>pain<\/b>/);assert.match(n1.h,/<ul>/);assert.match(n1.h,/<ol>/);
  assert.match(n1.b,/Marché\n- pain complet\n- lait\n1\. payer/,'texte brut avec retours à la ligne ('+JSON.stringify(n1.b)+')');
  assert.equal(await p.evaluate(()=>noteFind('n2').body),'ne pas toucher','autre note intacte');
  // annulation
  await p.locator('#toast .toast-act,#toast button').first().click();await p.waitForTimeout(300);
  assert.equal(await p.evaluate(()=>noteFind('n1').title),'Courses','annulation : note restaurée');
  // 3) garde de version : la note change entre la demande et le remplacement -> refus
  await p.fill('#sbIn','encore');await p.click('#sbSend');await p.waitForFunction(()=>document.querySelectorAll('[data-sbact]').length>=1);
  await p.evaluate(()=>{const n=noteFind('n1');n.body+='\najout';n.upd=Date.now();save()});
  await p.locator('[data-sbact]').last().click();await p.locator('[data-sbdiffok]').last().click();await p.waitForTimeout(200);
  assert.doesNotMatch(await p.evaluate(()=>noteFind('n1').body),/pain complet/,'note modifiée entre-temps : pas de remplacement');
  await p.keyboard.press('Escape');
  // 4) note secrète : jamais proposée au contexte
  await p.evaluate(()=>{NT().push({id:'s1',secret:true,vid:'v',iv:'x',ct:'y',createdAt:new Date().toISOString(),upd:1});save()});
  // 5) export PDF : bouton de l'éditeur
  if(await p.evaluate(()=>typeof notePdf==='function')){
   const [dl]=await Promise.all([p.waitForEvent('download'),p.click('#notePdf')]);const f=await dl.path();const head=fs.readFileSync(f).subarray(0,5).toString();
   assert.equal(head,'%PDF-');assert.match(dl.suggestedFilename(),/\.pdf$/);
   // action Sid'Bot share_note_pdf
   reply='pdf';await p.click('#noteAppHead [data-app-claude]');await p.click('[data-sbctx="note"]').catch(()=>{});
   if(await p.locator('[data-sbctx="note"]').getAttribute('aria-pressed')!=='true')await p.click('[data-sbctx="note"]');
   await p.fill('#sbIn','exporte en pdf');await p.click('#sbSend');await p.waitForFunction(()=>[...document.querySelectorAll('[data-sbact]')].some(b=>/PDF/.test(b.textContent)));
   const [dl2]=await Promise.all([p.waitForEvent('download'),p.locator('[data-sbact]').last().click()]);assert.match(dl2.suggestedFilename(),/\.pdf$/);await p.keyboard.press('Escape');
   // menu « ⋯ » de la liste
   await p.evaluate(()=>{closeNote&&closeNote();renderNotes()});await p.evaluate(()=>noteActions('n2'));
   const [dl3]=await Promise.all([p.waitForEvent('download'),p.locator('#actSheet button',{hasText:lang==='fr'?'Exporter en PDF':'Export as PDF'}).click()]);assert.match(dl3.suggestedFilename(),/^Autre\.pdf$/);
   // note secrète : confirmation avant export
   await p.evaluate(()=>noteActions('s1'));assert.equal(await p.locator('#actSheet button',{hasText:lang==='fr'?'Exporter en PDF':'Export as PDF'}).count(),0,'note secrète verrouillée : pas d\'export');
   await p.keyboard.press('Escape');
  } else console.log('  (notePdf absent : partie PDF non testée)');
  assert.ok(!sent.some(s=>JSON.stringify(s).includes('"secret"')||JSON.stringify(s).includes('"ct"')),'aucune donnée secrète envoyée');
  assert.ok(!/claude\.ai/.test(await p.content()));
  await c.close();console.log('OK note Sid\'Bot + PDF',lang)}
 await b.close();if(errors.length){console.error(errors.join('\n'));process.exitCode=1}
})().catch(e=>{console.error(e);process.exitCode=1});
