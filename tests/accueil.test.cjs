// v76 : page Aujourd'hui — vue simple par défaut (nouveaux et anciens comptes), « Affichage détaillé » persistant, premiers pas réels et facultatifs.
const {chromium,devices}=require('../app/node_modules/playwright'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const OUT=path.resolve(__dirname,'out');fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch();const errors=[];
 for(const [lang,fallback] of [['fr',false],['fr',true],['en',false]]){const tag=`${lang}-${fallback?'secours':'react'}`;
  const c=await b.newContext({...devices['iPhone 13'],locale:lang==='fr'?'fr-BE':'en-GB',timezoneId:'Europe/Brussels',reducedMotion:'reduce'}),p=await c.newPage();p.setDefaultTimeout(7000);
  await c.addInitScript(([l,f])=>{window.__noIntro=true;window.__noIslands=f;localStorage.setItem('sidnote-lang',JSON.stringify(l))},[lang,fallback]);
  p.on('pageerror',e=>errors.push(tag+': '+e.message));
  await p.goto('http://localhost:8766');await p.fill('#aName','Camille');await p.fill('#aEmail',`acc-${Date.now()}-${tag}@test.be`);await p.fill('#aPw','secret11');await p.fill('#aPw2','secret11');await p.check('#aAgree');await p.click('#aBtn');
  await p.waitForSelector('#onb:not([hidden])');await p.click('#onbSkip');if(await p.isVisible('#notifAsk'))await p.click('#naNo');
  await p.evaluate(()=>show('home'));
  // vue simple par défaut : 3 logos, noms exacts, accessibles
  const apps=p.locator('.hs-app');assert.equal(await apps.count(),3);
  const names=await p.locator('.hs-name').allInnerTexts();assert.deepEqual(names,["Sid'Journée","Sid'Forme","Sid'Note"]);
  for(const a of await apps.all())assert.match(await a.getAttribute('aria-label'),/^Sid'(Journée|Forme|Note) — /);
  assert.equal(await p.locator('.hc').count(),0,'pas de cartes détaillées par défaut');
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'débordement');
  // premiers pas : 0 sur 3, aucune donnée créée
  const before=await p.evaluate(()=>JSON.stringify([data.tasks.length,data.todos.length,NU().log.length,NT().length]));
  assert.equal(await p.locator('.hs-step').count(),3);assert.equal(await p.locator('.hs-step[aria-disabled="true"]').count(),0);
  await p.screenshot({path:path.join(OUT,`accueil-${tag}-simple.png`)});
  // clavier : un logo s'ouvre avec Entrée
  await p.locator('.hs-app[data-app="note"]').focus();await p.keyboard.press('Enter');await p.waitForTimeout(250);
  assert.equal(await p.evaluate(()=>data.ui.view),'notes');
  assert.equal(await p.evaluate(()=>JSON.stringify([data.tasks.length,data.todos.length,NU().log.length,NT().length])),before,'aucune donnée créée par l’ouverture');
  // une vraie action coche l'étape
  await p.evaluate(()=>{NT().push({id:'t1',title:'Idée',body:'',createdAt:new Date().toISOString(),upd:Date.now()});save();show('home')});
  assert.equal(await p.locator('.hs-step[aria-disabled="true"]').count(),1);
  assert.match(await p.locator('.hs-tour-h').innerText(),lang==='fr'?/1 sur 3/:/1 of 3/);
  // l'étape Sid'Journée ouvre l'ajout réel
  await p.click('[data-tourgo="plan"]');await p.waitForTimeout(300);assert.equal(await p.evaluate(()=>data.ui.view),'plan');
  await p.keyboard.press('Escape');await p.evaluate(()=>show('home'));
  // masquer puis relancer depuis Réglages
  await p.click('#hsTourHide');assert.equal(await p.locator('.hs-tour').count(),0);
  await p.evaluate(()=>show('more'));await p.evaluate(()=>{const d=document.querySelector('#tourAgain').closest('details');if(d)d.open=true});await p.click('#tourAgain');
  assert.equal(await p.locator('.hs-tour').count(),1);
  // affichage détaillé : persistant après rechargement
  await p.locator('#homeViewSw').focus();await p.keyboard.press('Enter');await p.waitForTimeout(150);assert.ok(await p.locator('.hc').count()>=1,'cartes détaillées');assert.equal(await p.evaluate(()=>data.prefs.homeView),'detail');
  await p.screenshot({path:path.join(OUT,`accueil-${tag}-detail.png`)});
  await p.waitForTimeout(1200);await p.reload();if(await p.isVisible('#notifAsk'))await p.click('#naNo');await p.evaluate(()=>show('home'));
  assert.ok(await p.locator('.hc').count()>=1,'préférence détaillée gardée');
  assert.match(await p.locator('.hc-name').first().innerText(),/^Sid'/);
  await p.locator('#homeViewSw').focus();await p.keyboard.press('Enter');await p.waitForTimeout(150);assert.equal(await p.locator('.hs-app').count(),3);
  // ancien compte sans préférence : vue simple
  await p.evaluate(()=>{delete data.prefs.homeView;renderHome()});assert.equal(await p.locator('.hs-app').count(),3);
  await c.close();console.log('OK accueil',tag)}
 await b.close();if(errors.length){console.error(errors.join('\n'));process.exitCode=1}
})().catch(e=>{console.error(e);process.exitCode=1});
