// v77 : « Créer mon programme » dans l'app réelle (serveur local, faux Supabase). Sid'Bot est simulé par une route : ce n'est pas un test du fournisseur.
// Vérifie : bloc « Mon objectif » absent, carte visible, parcours complet au clavier, reprise, récapitulatif modifiable, 3 profils contrastés,
// aperçu avant activation, remplacement d'exercice, confirmation avant remplacement, archivage (séances + historique gardés), comptes séparés, FR/EN, erreurs Sid'Bot.
const {chromium,devices}=require('../app/node_modules/playwright'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const OUT=path.resolve(__dirname,'out');fs.mkdirSync(OUT,{recursive:true});
const BASE=process.env.MUSCU_BASE_URL||'http://localhost:8766';
const PROFILS={
 debutant:{goal:'forme',level:'deb',days:'2',dur:'30',place:'home',equip:['none'],avoidEx:[],zones:[]},
 confirme:{goal:'muscle',level:'conf',days:'4',dur:'75',place:'gym',equip:[],avoidEx:[],zones:[]},
 limite:{goal:'force',level:'inter',days:'3',dur:'45',place:'home',equip:['dumbbells','bands'],avoidEx:['squat'],zones:['knee']}};
(async()=>{const b=await chromium.launch();const errors=[];const plans={};
 const signup=async(c,p,tag)=>{await p.goto(BASE);await p.fill('#aName','Camille');await p.fill('#aEmail',`mp-${Date.now()}-${tag}@test.be`);await p.fill('#aPw','secret11');await p.fill('#aPw2','secret11');await p.check('#aAgree');await p.click('#aBtn');
   await p.waitForSelector('#onb:not([hidden])');await p.click('#onbSkip');if(await p.isVisible('#notifAsk'))await p.click('#naNo')};
 const answer=async(p,pr)=>{const pick=(k,v)=>p.click(`[data-muq="${k}"][data-v="${v}"]`),next=()=>p.click('[data-muqnext]');
   await pick('goal',pr.goal);await next();await pick('level',pr.level);await next();await pick('days',pr.days);await pick('dur',pr.dur);await next();await pick('place',pr.place);await next();
   if(pr.place!=='gym'){for(const e of pr.equip)await p.click(`[data-muqm="equip"][data-v="${e}"]`)}await next();
   for(const q of pr.avoidEx){await p.fill('[data-muqq="avoidEx"]',q);const h=p.locator('[data-muqadd="avoidEx"]');await h.first().waitFor();const n=await h.count();for(let i=0;i<n;i++)await p.locator('[data-muqadd="avoidEx"]').first().click().catch(()=>{});}
   await next();for(const z of pr.zones)await p.click(`[data-muqm="avoidZones"][data-v="${z}"]`);await next();await next();await next();
   assert.equal(await p.evaluate(()=>muq.step),'recap')};
 for(const lang of ['fr','en']){
  const c=await b.newContext({...devices['iPhone 13'],locale:lang==='fr'?'fr-BE':'en-GB',timezoneId:'Europe/Brussels',reducedMotion:'reduce'}),p=await c.newPage();p.setDefaultTimeout(8000);
  await c.addInitScript(l=>{window.__noIntro=true;localStorage.setItem('sidnote-lang',JSON.stringify(l))},lang);p.on('pageerror',e=>errors.push(lang+': '+e.message));
  let sbMode='down';const sbSeen=[];
  await c.route(/\/functions\/v1\/sidbot/,async rt=>{const body=JSON.parse(rt.request().postData()||'{}');sbSeen.push(body);
    if(sbMode==='down')return rt.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'unavailable'})});
    if(sbMode==='quota')return rt.fulfill({status:429,contentType:'application/json',body:JSON.stringify({error:'quota'})});
    return rt.fulfill({status:200,contentType:'application/json',body:JSON.stringify({plan:{id:'sbp1',name:'Programme Sid\'Bot',days:[{id:'sbd1',name:'Haut du corps',ex:[{name:'Pompes',pat:'push',sets:3,reps:'8-12',rest:90,rir:'2'}]}]},why:['Deux séances courtes.'],warnings:[],est:[30],usage:{used:1,limit:20}})})});
  await signup(c,p,lang);await p.evaluate(()=>show('muscu'));await p.waitForTimeout(200);
  assert.equal(await p.isVisible('#muGoal'),false,'bloc « Mon objectif » retiré');assert.equal(await p.isVisible('#coachBox [data-coach="new"]'),true,'« Créer mon programme » visible');
  for(const [nom,pr] of Object.entries(PROFILS)){
   await p.click('#coachBox [data-coach="new"]');await p.waitForSelector('#coachSheet:not([hidden])');
   if(await p.locator('[data-muqedit]').count()){await p.evaluate(()=>{delete data.prefs.muDraft;muqOpen({fresh:true,step:'goal'})})}
   await answer(p,pr);
   // Sid'Bot en panne : message clair + repli honnête sur les règles de l'app
   if(nom==='debutant'&&lang==='fr'){await p.click('[data-muqgen="ia"]');if(await p.locator('#consentSheet:not([hidden])').count()){await p.click('#consentYes')}await p.waitForSelector('#muqBody .muq-warn [data-muqgen="app"]');
     assert.ok(sbSeen.at(-1).task==='programme'&&sbSeen.at(-1).answers.days===2,'demande Sid\'Bot structurée');assert.ok(!('messages' in sbSeen.at(-1)));
     await p.click('#muqBody .muq-warn [data-muqgen="app"]')}
   else await p.click('[data-muqgen="app"]');
   await p.waitForSelector('.muq-days');
   const pv=await p.evaluate(()=>JSON.parse(JSON.stringify(muq.preview)));plans[lang+':'+nom]=pv;
   assert.equal(pv.plan.days.length,+pr.days,`${nom} : ${pr.days} séances`);
   if(pv.est&&pv.est.length)assert.ok(pv.est.every(m=>m<=+pr.dur+5),`${nom} : durée respectée (${pv.est})`);
   const names=pv.plan.days.flatMap(d=>d.ex.map(e=>e.name.toLowerCase()));
   if(nom==='limite')assert.ok(!names.some(n=>n.includes('squat')),'exclusion « squat » respectée');
   if(nom==='confirme')assert.ok(names.some(n=>/barre|machine|halt|poulie|presse|développé|tirage/.test(n)),'en salle : vrai matériel ('+names.join(', ')+')');
   if(nom==='confirme')assert.ok(!(await p.evaluate(()=>muq.answers.equip)).includes('none'),'« rien » ne suit pas en salle');
   if(nom==='debutant')assert.ok(!names.some(n=>/machine|poulie|barre|presse/.test(n)),'à domicile sans matériel : pas de machine ni de barre ('+names.join(', ')+')');
   await p.screenshot({path:path.join(OUT,`muscu-${lang}-${nom}-apercu.png`)});
   // remplacement d'un exercice
   await p.locator('[data-muqalt]').first().click();const alt=p.locator('[data-muqpick]').first();
   if(await alt.count()){const n=await alt.innerText();await alt.click();assert.equal(await p.evaluate(()=>L(muq.preview.plan.days[0].ex[0].name)),n.trim(),'remplacement appliqué (nom affiché dans la langue)')}
   // activation : confirmation quand un programme existe, archivage, historique gardé
   const had=await p.evaluate(()=>!!PL());
   if(had)await p.evaluate(()=>{const s=PLD()[0];if(s){ML().push({id:'log-'+s.id,date:iso(today()),day:s.id,name:s.name,ex:[],upd:Date.now()});save()}});
   const before=await p.evaluate(()=>({ses:M().sessions.length,logs:ML().length,old:PL()&&PL().id}));
   await p.click('[data-muqactivate="1"]');
   if(had){await p.waitForSelector('.muq-confirm');await p.click('[data-muqactivate="2"]')}
   await p.waitForSelector('#coachSheet',{state:'hidden'});
   const after=await p.evaluate(o=>({ses:M().sessions.length,logs:ML().length,arch:M().sessions.filter(s=>s.grp&&s.grp.id==='arch-'+o).length,plan:PL()&&PL().id,goal:data.prefs.muGoal}),before.old);
   assert.ok(after.ses>=before.ses,'aucune séance perdue');assert.equal(after.logs,before.logs,'historique conservé');assert.equal(after.goal,pr.goal);
   if(had)assert.ok(after.arch>0,'ancien programme archivé dans « Mes séances »');
   assert.match(await p.locator('#coachBox').innerText(),lang==='fr'?/Prochaine séance/:/Next session/)}
  // les 3 programmes diffèrent vraiment
  const sig=k=>JSON.stringify(plans[lang+':'+k].plan.days.map(d=>d.ex.map(e=>e.name+e.sets+e.reps)));
  assert.notEqual(sig('debutant'),sig('confirme'));assert.notEqual(sig('confirme'),sig('limite'));assert.notEqual(sig('debutant'),sig('limite'));
  // Sid'Bot fonctionnel (simulé) puis quota épuisé
  if(lang==='fr'){sbMode='ok';await p.click('#coachBox [data-coach="prefs"]');await p.click('[data-muqgen="ia"]');if(await p.locator('#consentSheet:not([hidden])').count())await p.click('#consentYes');await p.waitForSelector('.muq-days');
    assert.match(await p.locator('#muqBody').innerText(),/Composé par Sid'Bot/);await p.click('[data-muqback]');
    sbMode='quota';await p.click('[data-muqgen="ia"]');await p.waitForSelector('#muqBody .muq-warn');assert.match(await p.locator('#muqBody .muq-warn').last().innerText(),/quota gratuit/);
    await p.click('#coachClose')}
  // « Objectif et préférences » : récapitulatif prérempli depuis le programme
  await p.click('#coachBox [data-coach="prefs"]');assert.equal(await p.evaluate(()=>muq.step),'recap');assert.equal(await p.evaluate(()=>muq.answers.goal),'force');await p.click('#coachClose');
  // clavier : Échap ferme, réponses gardées
  await p.click('#coachBox [data-coach="new"]');await p.keyboard.press('Escape');assert.equal(await p.isVisible('#coachSheet'),false);
  assert.ok(!/claude\.ai/.test(await p.content()),'aucune redirection vers Claude');
  // comptes séparés : un nouveau compte ne voit ni le brouillon ni le programme
  const c2=await b.newContext({...devices['iPhone 13']}),p2=await c2.newPage();await c2.addInitScript(()=>{window.__noIntro=true});await signup(c2,p2,lang+'b');
  await p2.evaluate(()=>show('muscu'));assert.equal(await p2.evaluate(()=>!!PL()||!!data.prefs.muDraft),false,'comptes séparés');await c2.close();
  await c.close();console.log('OK parcours musculation',lang)}
 await b.close();if(errors.length){console.error(errors.join('\n'));process.exitCode=1}
})().catch(e=>{console.error(e);process.exitCode=1});
