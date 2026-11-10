// v81 : le chrono Focus continue après la fermeture de tous les onglets et la réouverture, plusieurs onglets montrent le même
// état, l'arrêt dans un onglet arrête les autres, une fin vue par deux onglets n'est comptée qu'une fois (P.done, pomoFinished).
// Faux Supabase (tests/serve.js). Une « minute » de Focus = 1 s (POMO_TEST_MIN).
const BASE=process.env.SID_BASE_URL||'http://localhost:'+(process.env.SID_SITE_PORT||8766);
const {chromium}=require('../app/node_modules/playwright'),assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch(),errors=[];
 const ctxOpts={locale:'fr-BE',timezoneId:'Europe/Brussels',viewport:{width:390,height:844}};
 const init=()=>{window.__noIntro=true;window.POMO_TEST_MIN=1000;
   window.pomoFinished=i=>{const k='test-fin';const a=JSON.parse(localStorage.getItem(k)||'[]');a.push(i.id);localStorage.setItem(k,JSON.stringify(a))}};
 const open=async c=>{const p=await c.newPage();p.setDefaultTimeout(8000);p.on('pageerror',e=>errors.push(e.message));await p.goto(BASE);
   await p.waitForFunction(()=>typeof P==='object'&&typeof session!=='undefined'&&session);return p};
 const until=async(p,fn,arg,ms=6000)=>{const t=Date.now();while(!(await p.evaluate(fn,arg))){if(Date.now()-t>ms)throw Error('délai dépassé : '+fn);await p.waitForTimeout(100)}};
 // 1. compte, réglage d'une séance de 60 « minutes » (60 s)
 let c=await b.newContext(ctxOpts);await c.addInitScript(init);
 const a=await c.newPage();a.setDefaultTimeout(8000);a.on('pageerror',e=>errors.push(e.message));
 await a.goto(BASE);await a.fill('#aName','Camille');await a.fill('#aEmail',`chrono-${Date.now()}@test.be`);await a.fill('#aPw','secret11');await a.fill('#aPw2','secret11');await a.check('#aAgree');await a.click('#aBtn');
 await a.waitForSelector('#onb:not([hidden])');await a.click('#onbSkip');if(await a.isVisible('#notifAsk'))await a.click('#naNo');
 await a.evaluate(()=>{P.cfg={work:25,brk:5,total:60};P.run=null;save();show('pomo')});
 const bb=await open(c);await bb.evaluate(()=>show('pomo'));
 // 2. départ dans l'onglet A → l'onglet B affiche la même séance (même id) sans rechargement
 await a.click('#pomoStart');const id=await a.evaluate(()=>P.run&&P.run.id);assert.ok(id,'identifiant de séance');
 await until(bb,i=>P.run&&P.run.id===i&&!document.getElementById('pomoRun').hidden,id);
 console.log('ok  deux onglets : même séance',id);
 // 3. fermeture de tous les onglets et du navigateur (contexte), 3 s d'attente, réouverture : le temps a continué
 const state=await c.storageState();await a.close();await bb.close();await c.close();
 await new Promise(r=>setTimeout(r,3000));
 c=await b.newContext({...ctxOpts,storageState:state});await c.addInitScript(init);
 const a2=await open(c);await a2.evaluate(()=>show('pomo'));
 const el=await a2.evaluate(()=>P.run&&P.run.id&&elapsed(P.run));
 assert.equal(await a2.evaluate(()=>P.run.id),id,'même séance après réouverture');
 assert.ok(el>=3000&&el<15000,'temps recalculé depuis l\'heure de départ : '+el+' ms');
 const clock=await a2.textContent('#clock');assert.match(clock,/^00:(1\d|2[0-2])$/,'horloge reprise ('+clock+')');
 console.log('ok  réouverture après fermeture complète :',el,'ms écoulées, horloge',clock);
 // 4. arrêt (commande « Arrêter » + confirmation) dans un onglet → l'autre s'arrête aussi ; temps compté une fois
 const b2=await open(c);await b2.evaluate(()=>show('pomo'));await until(b2,i=>P.run&&P.run.id===i,id);
 await a2.click('#pomoStop');await a2.click('#pomoStop');
 await until(b2,()=>!P.run&&!document.getElementById('pomoSetup').hidden);
 const logA=await a2.evaluate(()=>JSON.stringify(P.log)),logB=await b2.evaluate(()=>JSON.stringify(P.log));assert.equal(logA,logB,'même historique');
 assert.ok(await a2.evaluate(i=>!!(P.done&&P.done[i]),id),'fin enregistrée');
 console.log('ok  arrêt propagé à l\'autre onglet, historique identique',logA);
 // 5. fin naturelle vue par deux onglets ouverts : comptée une seule fois
 await a2.evaluate(()=>{localStorage.removeItem('test-fin');P.log={};P.cfg={work:1,brk:1,total:2};save();renderPomo()});
 await until(b2,()=>P.cfg.total===2);
 await a2.click('#pomoStart');const id2=await a2.evaluate(()=>P.run.id);await until(b2,i=>P.run&&P.run.id===i,id2);
 await until(a2,()=>!P.run,null,8000);await until(b2,()=>!P.run,null,8000);await a2.waitForTimeout(600);
 const fin=await a2.evaluate(()=>JSON.parse(localStorage.getItem('test-fin')||'[]'));
 assert.deepEqual(fin,[id2],'pomoFinished appelé une fois : '+JSON.stringify(fin));
 const tot=await a2.evaluate(()=>Object.values(P.log).reduce((x,y)=>x+y,0)),totB=await b2.evaluate(()=>Object.values(P.log).reduce((x,y)=>x+y,0));
 assert.equal(tot,2000,'2 « minutes » de travail comptées une fois ('+tot+')');assert.equal(totB,2000);
 console.log('ok  fin vue par deux onglets : une seule fois');
 assert.deepEqual(errors,[],'erreurs de page : '+errors.join(' | '));
 await b.close();console.log('chrono-persistant : OK');
})().catch(e=>{console.error(e);process.exit(1)});
