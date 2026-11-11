// v82 (demande de Sid, capture du 11 nov.) : pastille rouge sur le logo de l'app au lieu de la zone de notifications v81.
// Agenda : nombre d'événements du planning du jour (jamais les tâches ni un annulé, passés compris), masquée à 0.
// Visible sur la tuile Sid'Journée du lanceur (vues simple et détaillée) et sur le logo de l'en-tête de l'agenda ;
// jamais dans une autre app (ni sur les logos de la barre latérale). Cas : vide, tâche seule, 3 événements, ajout, modification,
// suppression, autre app (390 et 1280 px), minuit à Bruxelles, anglais, taille proportionnée au logo. Faux Supabase (tests/serve.js).
const BASE=process.env.SID_BASE_URL||'http://localhost:'+(process.env.SID_SITE_PORT||8766);
const {chromium}=require('../app/node_modules/playwright'),assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch(),errors=[];
 const c=await b.newContext({locale:'fr-BE',timezoneId:'Europe/Brussels',viewport:{width:390,height:844}});
 await c.addInitScript(()=>{window.__noIntro=true});
 const p=await c.newPage();p.setDefaultTimeout(8000);p.on('pageerror',e=>errors.push(e.message));
 await p.clock.install({time:new Date('2026-11-11T23:50:00+01:00')});
 await p.goto(BASE);await p.fill('#aName','Camille');await p.fill('#aEmail',`pa-${Date.now()}@test.be`);await p.fill('#aPw','secret11');await p.fill('#aPw2','secret11');await p.check('#aAgree');await p.click('#aBtn');
 await p.waitForSelector('#onb:not([hidden])');await p.click('#onbSkip');if(await p.isVisible('#notifAsk'))await p.click('#naNo');
 // pastilles visibles : [app, nombre, où]
 const badges=async()=>{await p.clock.runFor(50);return p.evaluate(()=>[...document.querySelectorAll('.logo-badged')].filter(w=>w.offsetParent!==null&&w.dataset.n&&getComputedStyle(w,'::after').content!=='none')
   .map(w=>[w.dataset.badgeApp,w.dataset.n,w.closest('#vhead')?'vhead':w.closest('#homeBody')?'lanceur':w.closest('#side')?'side':'autre']).sort())};
 const go=async v=>{await p.evaluate(v=>{show(v);if(v==='plan')renderPlan()},v);};
 // 1. journée vide : aucune pastille, ni au lanceur ni dans l'agenda
 await p.evaluate(()=>{data.tasks=[];data.todos=[];save()});await go('home');
 assert.deepEqual(await badges(),[],'lanceur, journée vide');await go('plan');assert.deepEqual(await badges(),[],'agenda, journée vide');
 assert.equal(await p.locator('#dayNotif,.day-notif').count(),0,'plus de zone de notifications');
 // 2. tâche seule : ne compte pas
 await p.evaluate(()=>{data.todos.push({id:'td1',title:'Rendre le rapport',day:iso(today()),done:false});save()});await go('plan');
 assert.deepEqual(await badges(),[],'une tâche seule ne compte pas');
 // 3. trois événements (dont un passé) ; annulé et lendemain exclus
 await p.evaluate(()=>{const d=iso(today()),t=new Date(today());t.setDate(t.getDate()+1);const n=iso(t);
   data.tasks.push({id:'e1',title:'Cours de finance',date:d,time:'08:30',timeEnd:'10:30'},{id:'e2',title:'Dentiste',date:d,time:'15:00'},{id:'e5',title:'Sport',date:d,time:'23:55'},
     {id:'e3',title:'Réunion annulée',date:d,time:'11:00',canc:true},{id:'e4',title:'Examen de demain',date:n,time:'09:00'});save()});
 await go('plan');assert.deepEqual(await badges(),[['agenda','3','vhead']],'agenda : 3');
 await go('home');assert.deepEqual(await badges(),[['agenda','3','lanceur']],'lanceur : 3 sur Sid\'Journée seulement');
 assert.match(await p.locator('#homeBody [data-app=agenda]').first().textContent(),/3 événements aujourd'hui/,'nom accessible');
 // taille : pastille proportionnée au logo
 const size=await p.evaluate(()=>{const w=document.querySelector('#homeBody .logo-badged[data-n]'),s=getComputedStyle(w,'::after');return [parseFloat(s.height),w.getBoundingClientRect().height]});
 assert.ok(size[0]>=16&&size[0]<=size[1]*0.45,'taille de la pastille '+size);
 // 4. ajout par le formulaire, modification (passe au lendemain), suppression
 await go('plan');await p.evaluate(()=>openTaskSheet(iso(today())));await p.fill('#fTitle','Réunion');await p.fill('#fTime','18:00');
 await p.locator('#taskForm button[type=submit]').click();for(let i=0;i<40&&!(await p.evaluate(()=>document.getElementById('taskSheet').hidden));i++)await p.clock.runFor(100);
 assert.deepEqual(await badges(),[['agenda','4','vhead']],'ajout');
 await p.evaluate(()=>{const t=data.tasks.find(x=>x.id==='e2'),d=new Date(today());d.setDate(d.getDate()+1);t.date=iso(d);save();renderPlan()});
 assert.deepEqual(await badges(),[['agenda','3','vhead']],'modification');
 await p.evaluate(()=>taskDel('e1'));await p.clock.runFor(200);
 assert.deepEqual(await badges(),[['agenda','2','vhead']],'suppression');
 // 5. dans une autre app : aucune pastille de l'agenda (390 px puis 1280 px avec la barre latérale)
 for(const v of ['notes','pomo','muscu','nutri']){await go(v);assert.deepEqual(await badges(),[],'rien dans '+v)}
 await p.setViewportSize({width:1280,height:900});
 for(const v of ['notes','muscu']){await go(v);assert.deepEqual(await badges(),[],'rien dans '+v+' à 1280 px')}
 assert.ok(await p.evaluate(()=>!!document.querySelector('#side [data-app=agenda] .logo')),'la barre latérale affiche bien le logo de l\'agenda');
 assert.equal(await p.evaluate(()=>[...document.querySelectorAll('#side [data-app=agenda] .sp-meta')].map(x=>x.textContent.trim()).join('')),'','aucun compteur de l\'agenda dans la barre latérale d\'une autre app');
 await go('plan');assert.deepEqual(await badges(),[['agenda','2','vhead']],'agenda à 1280 px');
 assert.match(await p.locator('#side [data-go=plan] .sp-meta').textContent(),/à venir/,'compteur gardé dans l\'agenda');
 // vue détaillée du lanceur (îlot React)
 await go('home');await p.evaluate(()=>setHomeView('detail'));assert.deepEqual(await badges(),[['agenda','2','lanceur']],'lanceur détaillé');
 await p.evaluate(()=>setHomeView('simple'));await p.setViewportSize({width:390,height:844});
 // 6. minuit à Bruxelles : la pastille passe au lendemain sans action (Dentiste déplacé + examen)
 await go('plan');await p.clock.runFor(11*60*1000);
 assert.equal(await p.evaluate(()=>iso(today())),'2026-11-12');assert.deepEqual(await badges(),[['agenda','2','vhead']],'changement de jour');
 await p.evaluate(()=>{data.tasks=data.tasks.filter(t=>t.id!=='e4');save();renderPlan()});assert.deepEqual(await badges(),[['agenda','1','vhead']],'un seul événement');
 await p.evaluate(()=>{data.tasks=[];save();renderPlan()});assert.deepEqual(await badges(),[],'planning vidé : pastille masquée');
 // 7. anglais
 await p.evaluate(()=>{data.tasks=[{id:'x1',title:'Gym',date:iso(today()),time:'19:00'}];save()});await Promise.all([p.waitForEvent('load'),p.evaluate(()=>{setLang('en')})]);
 for(let i=0;i<50&&!(await p.evaluate(()=>typeof renderPlan==='function'&&!!session).catch(()=>false));i++)await p.waitForTimeout(100);
 await go('home');assert.deepEqual(await badges(),[['agenda','1','lanceur']]);
 assert.match(await p.locator('#homeBody [data-app=agenda]').first().textContent(),/1 event today/);
 assert.deepEqual(errors,[],errors.join(' | '));await b.close();console.log('pastille (notif-planning) : OK');
})().catch(e=>{console.error(e);process.exit(1)});
