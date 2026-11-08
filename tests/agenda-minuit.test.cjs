// v76 (bug capture 1) : l'Agenda ouvert la veille au soir doit passer au nouveau jour après minuit (iPhone : l'app reste en mémoire).
// Reproduit : samedi 7 nov. 2026 23:50 → dimanche 8 nov. 03:28 (heure de la capture), retour au premier plan.
const {chromium,devices}=require('../app/node_modules/playwright'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const OUT=path.resolve(__dirname,'out');fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch();const errors=[];let fail=0;
 for(const fallback of [false,true]){const tag=fallback?'secours':'react';
  const c=await b.newContext({...devices['iPhone 13'],locale:'fr-BE',timezoneId:'Europe/Brussels'}),p=await c.newPage();p.setDefaultTimeout(7000);
  await p.clock.install({time:new Date('2026-11-07T23:50:00+01:00')});
  await c.addInitScript(f=>{window.__noIntro=true;window.__noIslands=f},fallback);
  p.on('pageerror',e=>errors.push(tag+': '+e.message));
  await p.goto('http://localhost:8766');await p.fill('#aName','Camille');await p.fill('#aEmail',`minuit-${Date.now()}-${tag}@test.be`);await p.fill('#aPw','secret11');await p.fill('#aPw2','secret11');await p.check('#aAgree');await p.click('#aBtn');
  await p.waitForSelector('#onb:not([hidden])');await p.click('#onbSkip');if(await p.isVisible('#notifAsk'))await p.click('#naNo');
  await p.evaluate(()=>{data.tasks.push({id:'dim',title:'Brunch dimanche',date:'2026-11-08',time:'11:00',status:'à faire',tbc:false,cat:''});save();show('plan')});
  const day=()=>p.evaluate(()=>({sel:selDay,head:(document.querySelector('#v-plan .elan-daynav, #v-plan [data-elan-daytitle], #v-plan h2')||{}).textContent||'',today:iso(today()),
    pressed:[...document.querySelectorAll('#v-plan [data-elan-day][aria-pressed="true"],#v-plan [data-elan-day][aria-current],#v-plan [data-elan-day].on')].map(x=>x.dataset.elanDay),
    txt:document.querySelector('#v-plan').innerText.slice(0,600)}));
  const d1=await day();assert.equal(d1.sel,'2026-11-07');
  const vh=await p.evaluate(()=>document.querySelector('#vhead .elan-progress>span').textContent);assert.ok(/Aucune activité aujourd'hui/.test(vh)&&!/0 \/ 0/.test(vh),'journée vide : phrase claire, pas « 0 / 0 » ('+vh+')');
  // la nuit passe, l'app reste ouverte ; la personne revient au premier plan
  await p.clock.setSystemTime(new Date('2026-11-08T03:28:00+01:00'));await p.clock.runFor(61000);
  await p.evaluate(()=>{document.dispatchEvent(new Event('visibilitychange'));window.dispatchEvent(new Event('focus'));window.dispatchEvent(new Event('pageshow'))});await p.clock.runFor(1000);
  const d2=await day();await p.screenshot({path:path.join(OUT,`agenda-minuit-${tag}.png`)});
  assert.match(await p.evaluate(()=>document.querySelector('#vhead .elan-progress>span').textContent),/^0 \/ 1 /);
  const ok=d2.sel==='2026-11-08'&&/dimanche 8 novembre/i.test(d2.txt)&&/Brunch dimanche/.test(d2.txt);
  console.log(tag,ok?'OK':'ÉCHEC',JSON.stringify({sel:d2.sel,today:d2.today,pressed:d2.pressed,brunch:/Brunch dimanche/.test(d2.txt),dimanche:/dimanche 8 novembre/i.test(d2.txt)}));
  if(!ok)fail++;
  // un jour choisi exprès par la personne n'est pas écrasé tant qu'on reste le même jour
  await p.evaluate(()=>{selDay='2026-11-12';renderPlan()});await p.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));
  assert.equal(await p.evaluate(()=>selDay),'2026-11-12','le jour choisi reste');
  await c.close()}
 await b.close();if(errors.length){console.error(errors.join('\n'));fail++}process.exitCode=fail?1:0;
})().catch(e=>{console.error(e);process.exitCode=1});
