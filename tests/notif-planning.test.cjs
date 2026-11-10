// v81 : zone de notifications en haut des apps = événements du planning du jour (jamais les tâches, jamais un événement annulé).
// Cas : journée vide, tâche seule, plusieurs événements (tri par heure, autre jour exclu), ajout par le formulaire, modification,
// suppression, passage de minuit (fuseau Europe/Brussels), affichage compact dans une autre app. Faux Supabase (tests/serve.js).
const BASE=process.env.SID_BASE_URL||'http://localhost:'+(process.env.SID_SITE_PORT||8766);
const {chromium}=require('../app/node_modules/playwright'),assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch(),errors=[];
 const c=await b.newContext({locale:'fr-BE',timezoneId:'Europe/Brussels',viewport:{width:390,height:844}});
 await c.addInitScript(()=>{window.__noIntro=true});
 const p=await c.newPage();p.setDefaultTimeout(8000);p.on('pageerror',e=>errors.push(e.message));
 await p.clock.install({time:new Date('2026-11-11T23:58:00+01:00')});
 await p.goto(BASE);await p.fill('#aName','Camille');await p.fill('#aEmail',`dn-${Date.now()}@test.be`);await p.fill('#aPw','secret11');await p.fill('#aPw2','secret11');await p.check('#aAgree');await p.click('#aBtn');
 await p.waitForSelector('#onb:not([hidden])');await p.click('#onbSkip');if(await p.isVisible('#notifAsk'))await p.click('#naNo');
 const zone=async()=>p.evaluate(()=>{const el=document.getElementById('dayNotif');return el&&!el.hidden?{head:el.querySelector('.dn-head b').textContent,items:[...el.querySelectorAll('.dn-title')].map(x=>x.textContent)}:null});
 const step=async()=>{await p.evaluate(()=>renderPlan());};
 // 1. journée vide
 await p.evaluate(()=>{data.tasks=[];data.todos=[];save();show('plan')});await step();
 assert.deepEqual(await zone(),{head:'Aucun événement aujourd\'hui',items:[]},'journée vide');
 // 2. tâche seule (à faire aujourd'hui) : pas d'événement
 await p.evaluate(()=>{data.todos.push({id:'td1',title:'Rendre le rapport',day:iso(today()),done:false});save()});await step();
 assert.deepEqual(await zone(),{head:'Aucun événement aujourd\'hui',items:[]},'une tâche seule ne compte pas');
 // 3. plusieurs événements : tri par heure ; annulé et autre jour exclus
 await p.evaluate(()=>{const d=iso(today()),t=new Date(today());t.setDate(t.getDate()+1);const n=iso(t);
   data.tasks.push({id:'e2',title:'Dentiste',date:d,time:'15:00',timeEnd:'15:30'},{id:'e1',title:'Cours de finance',date:d,time:'08:30',timeEnd:'10:30'},
     {id:'e3',title:'Réunion annulée',date:d,time:'11:00',canc:true},{id:'e4',title:'Examen de demain',date:n,time:'09:00'});save()});await step();
 assert.deepEqual(await zone(),{head:'2 événements aujourd\'hui',items:['Cours de finance','Dentiste']},'plusieurs événements');
 // 4. ajout par le formulaire de l'agenda
 await p.evaluate(()=>openTaskSheet(iso(today())));await p.fill('#fTitle','Sport');await p.fill('#fTime','18:00');
 await p.locator('#taskForm button[type=submit]').click();for(let i=0;i<40&&!(await p.evaluate(()=>document.getElementById('taskSheet').hidden));i++)await p.clock.runFor(100);
 assert.deepEqual(await zone(),{head:'3 événements aujourd\'hui',items:['Cours de finance','Dentiste','Sport']},'ajout');
 // 5. modification (titre et heure) puis suppression
 await p.evaluate(()=>{const t=data.tasks.find(x=>x.id==='e2');t.title='Dentiste (déplacé)';t.time='19:00';t.timeEnd='';save();renderPlan()});
 assert.deepEqual((await zone()).items,['Cours de finance','Sport','Dentiste (déplacé)'],'modification');
 await p.evaluate(()=>taskDel('e1'));await p.waitForTimeout(100);
 assert.deepEqual(await zone(),{head:'2 événements aujourd\'hui',items:['Sport','Dentiste (déplacé)']},'suppression');
 // 6. autre app (Sid'Forme) : zone présente, compacte (événements à venir)
 await p.evaluate(()=>show('muscu'));await p.waitForTimeout(50);const z=await zone();assert.ok(z&&z.head==='2 événements aujourd\'hui','zone dans Sid\'Forme : '+JSON.stringify(z));
 await p.evaluate(()=>show('plan'));
 // 7. minuit à Bruxelles : la zone passe au lendemain sans action (l'examen apparaît, ceux de la veille disparaissent)
 await p.clock.runFor(3*60*1000);
 assert.deepEqual(await zone(),{head:'1 événement aujourd\'hui',items:['Examen de demain']},'changement de jour');
 assert.equal(await p.evaluate(()=>iso(today())),'2026-11-12');
 // 8. anglais
 await p.evaluate(()=>{data.tasks=[];save()});await Promise.all([p.waitForEvent('load'),p.evaluate(()=>{setLang('en')})]);
 for(let i=0;i<50&&!(await p.evaluate(()=>typeof renderPlan==='function'&&!!session).catch(()=>false));i++)await p.waitForTimeout(100);
 await p.evaluate(()=>{show('plan');renderPlan()});
 assert.equal((await zone()).head,'No events today');
 assert.deepEqual(errors,[],errors.join(' | '));await b.close();console.log('notif-planning : OK');
})().catch(e=>{console.error(e);process.exit(1)});
