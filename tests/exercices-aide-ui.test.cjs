// v79 : fiche « ? » des exercices dans l'app réelle (serveur local). Vérifie : « ? » seulement si fiche complète, deux photos chargées,
// rubriques FR/EN, Échap + retour du focus, saisie d'une série et minuteur intacts, exercice non reconnu -> association explicite,
// « ? » dans l'aperçu d'un programme, photo cassée -> état d'erreur. La correspondance visuelle photo/mouvement se vérifie à l'œil (captures).
const {chromium,devices}=require('../app/node_modules/playwright'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const OUT=path.resolve(__dirname,'out');fs.mkdirSync(OUT,{recursive:true});const BASE=process.env.EX_BASE_URL||'http://localhost:8766';
(async()=>{const b=await chromium.launch();const errors=[];
 for(const [lang,vp] of [['fr',{...devices['iPhone 13']}],['en',{viewport:{width:1280,height:900}}]]){
  const c=await b.newContext({...vp,locale:lang==='fr'?'fr-BE':'en-GB'}),p=await c.newPage();p.setDefaultTimeout(8000);
  await c.addInitScript(l=>{window.__noIntro=true;localStorage.setItem('sidnote-lang',JSON.stringify(l))},lang);p.on('pageerror',e=>errors.push(lang+': '+e.message));
  await p.goto(BASE);await p.fill('#aName','Camille');await p.fill('#aEmail',`exh-${Date.now()}-${lang}@test.be`);await p.fill('#aPw','secret11');await p.fill('#aPw2','secret11');await p.check('#aAgree');await p.click('#aBtn');
  await p.waitForSelector('#onb:not([hidden])');await p.click('#onbSkip');if(await p.isVisible('#notifAsk'))await p.click('#naNo');
  const ready=await p.evaluate(()=>{const X=window.SIDFIT_EXERCICES.groupes.flatMap(g=>g.exercices);return {all:X.length,ok:X.filter(e=>exHelpReady(e.nom)).map(e=>e.nom)}});
  console.log(`  fiches complètes affichées : ${ready.ok.length} / ${ready.all}`);assert.ok(ready.ok.length>0);
  const known=ready.ok[0];
  // séance : un exercice connu, un exercice libre non reconnu
  await p.evaluate(k=>{const m=M();m.sessions.push({id:'s1',name:'Test',ord:0,upd:Date.now(),exercises:[{id:'e1',name:k,reps:'8-12',rest:90,ps:1,sets:[{kg:'',reps:''},{kg:'',reps:''}]},{id:'e2',name:'Mon exercice maison',ps:1,sets:[{kg:'',reps:''}]}]});save();show('muscu');renderMuscu()},known);
  await p.waitForTimeout(250);await p.evaluate(()=>{const d=document.querySelector('#msList [data-ms="s1"]');if(d&&d.tagName==='DETAILS')d.open=true});await p.waitForTimeout(150);
  const e1=p.locator('#msList [data-ex="e1"]'),e2=p.locator('#msList [data-ex="e2"]');
  assert.equal(await e1.locator('[data-exhelp]').isVisible(),true,'« ? » sur un exercice du catalogue');
  assert.match(await e1.locator('[data-exhelp]').getAttribute('aria-label'),lang==='fr'?/Voir comment effectuer/:/See how to do/);
  assert.equal(await e2.locator('[data-exhelp]').isVisible(),false,'pas de « ? » pour un exercice non reconnu');
  assert.equal(await e2.locator('[data-exlink]').isVisible(),true,'association proposée');
  // saisie en cours + minuteur, puis ouverture de la fiche
  await e1.locator('[data-si="0"] input').first().fill('22.5');await p.waitForTimeout(100);
  const before=await p.evaluate(()=>JSON.stringify([M().sessions.find(s=>s.id==='s1').exercises[0].sets,typeof msRunGet==='function'?msRunGet('s1'):null]));
  await e1.locator('[data-exhelp]').focus();await p.keyboard.press('Enter');await p.waitForSelector('#exHelpSheet:not([hidden])');
  await p.waitForTimeout(600);
  const pics=await p.evaluate(()=>[...document.querySelectorAll('#exHelpBody .exh-pics img')].map(i=>({ok:i.complete&&i.naturalWidth>0,src:i.getAttribute('src'),alt:i.alt})));
  assert.equal(pics.length,2);assert.ok(pics.every(x=>x.ok),'deux photos chargées '+JSON.stringify(pics));assert.notEqual(pics[0].src,pics[1].src);assert.ok(pics.every(x=>x.alt.length>5));
  const txt=(await p.locator('#exHelpBody').textContent());
  for(const k of lang==='fr'?['Placement','Exécution','Respiration','Points d\'attention','Erreurs fréquentes']:['Setup','Movement','Breathing','Key points','Common mistakes'])assert.ok(txt.includes(k),k+' présent');
  await p.waitForTimeout(400);await p.screenshot({path:path.join(OUT,`exh-${lang}-fiche.png`)});
  await p.keyboard.press('Escape');assert.equal(await p.isVisible('#exHelpSheet'),false);
  assert.equal(await p.evaluate(()=>document.activeElement&&document.activeElement.hasAttribute('data-exhelp')),true,'focus revenu sur « ? »');
  assert.equal(await p.evaluate(()=>JSON.stringify([M().sessions.find(s=>s.id==='s1').exercises[0].sets,typeof msRunGet==='function'?msRunGet('s1'):null])),before,'séries et minuteur intacts');
  // association explicite d'un exercice non reconnu
  await e2.locator('[data-exlink]').click();await p.waitForSelector('#actSheet:not([hidden])');await p.locator('#actList [data-act]').first().click();await p.waitForTimeout(200);
  assert.ok(await p.evaluate(()=>!!M().sessions.find(s=>s.id==='s1').exercises[1].ref),'association enregistrée');
  assert.equal(await p.evaluate(()=>M().sessions.find(s=>s.id==='s1').exercises[1].name),'Mon exercice maison','nom de l\'utilisateur gardé');
  assert.equal(await p.locator('#msList [data-ex="e2"] [data-exhelp]').isVisible(),true,'« ? » après association');
  // photo cassée -> état d'erreur
  const kk=ready.ok[ready.ok.length-1],slug=await p.evaluate(k=>{const s=window.SIDFIT_IMG[k];window.SIDFIT_IMG[k]='introuvable-v79';exHelpOpen(k,null);return s},kk);await p.waitForTimeout(800);
  assert.equal(await p.locator('#exHelpBody .exh-miss').count(),2,'photos introuvables signalées');await p.keyboard.press('Escape');await p.evaluate(([k,s])=>{window.SIDFIT_IMG[k]=s},[kk,slug]);
  // « ? » dans l'aperçu d'un programme
  await p.evaluate(()=>{muqOpen({fresh:true});muq.answers={v:1,goal:'muscle',level:'inter',days:3,dur:60,place:'gym',equip:['dumbbells','bench','pullup','barbell','machines','cables','bands'],prefer:[],avoidEx:[],avoidZones:[],pain:'',other:[],notes:''};muq.step='recap';muqRender()});
  await p.click('[data-muqgen="app"]');await p.waitForSelector('.muq-days');
  const nh=await p.locator('.muq-days [data-muqhelp]').count();assert.ok(nh>0,'« ? » dans l\'aperçu');
  await p.locator('.muq-days [data-muqhelp]').first().click();await p.waitForSelector('#exHelpSheet:not([hidden])');await p.keyboard.press('Escape');
  assert.equal(await p.isVisible('.muq-days'),true,'aperçu toujours là');
  await c.close();console.log('OK fiches d\'exercices',lang)}
 await b.close();if(errors.length){console.error(errors.join('\n'));process.exitCode=1}
})().catch(e=>{console.error(e);process.exitCode=1});
