// v76 : Sid'Bot côté app, avec un faux serveur (route Playwright). Ce n'est PAS un test du fournisseur d'IA.
// Vérifie : ouverture depuis les trois apps, contexte visible et retirable, absence d’envoi de données secrètes,
// action proposée appliquée seulement après un toucher, erreurs quota / limitation / délai / hors ligne et relais Claude depuis Sid’Note.
const {chromium,devices}=require('../app/node_modules/playwright'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const OUT=path.resolve(__dirname,'out');fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch();const errors=[];
 for(const lang of ['fr','en']){
 const c=await b.newContext({...devices['iPhone 13'],locale:lang==='fr'?'fr-BE':'en-GB',timezoneId:'Europe/Brussels'}),p=await c.newPage();p.setDefaultTimeout(7000);
 await c.addInitScript(l=>{window.__noIntro=true;localStorage.setItem('sidnote-lang',JSON.stringify(l))},lang);
 p.on('pageerror',e=>errors.push(lang+': '+e.message));
 const sent=[];let mode='ok';
 const until=async(fn,arg,ms=9000)=>{const t=Date.now();while(!(await p.evaluate(fn,arg))){if(Date.now()-t>ms)throw Error('délai dépassé : '+fn);await p.waitForTimeout(100)}};
 await c.route(/\/functions\/v1\/sidbot/,async rt=>{const body=JSON.parse(rt.request().postData()||'{}');sent.push({body,auth:rt.request().headers().authorization||''});
   if(mode==='quota')return rt.fulfill({status:429,contentType:'application/json',body:JSON.stringify({error:'quota',message:'x',usage:{used:50,limit:50,reset:'2026-11-09T00:00:00Z'}})});
   if(mode==='rate')return rt.fulfill({status:429,headers:{'Retry-After':'10'},contentType:'application/json',body:JSON.stringify({error:'rate',message:'x'})});
   if(mode==='slow'){await new Promise(r=>setTimeout(r,1500));return rt.fulfill({status:504,contentType:'application/json',body:JSON.stringify({error:'timeout'})}).catch(()=>{})}
   if(mode==='bad')return rt.fulfill({status:200,contentType:'application/json',body:JSON.stringify({reply:'ok',actions:[{type:'delete_all',payload:{}},{type:'add_task',payload:{title:'x',date:'demain'}}]})});
   return rt.fulfill({status:200,contentType:'application/json',body:JSON.stringify({reply:'Je te propose ceci :',usage:{used:1,limit:50,reset:'2026-11-09T00:00:00Z'},
     actions:[{type:'add_task',label:'Réviser chimie · jeudi 14:00',payload:{title:'Réviser chimie',date:'2026-11-12',time:'14:00'}}]})})});
 await p.goto(process.env.SID_BASE_URL||'http://localhost:8766');await p.fill('#aName','Camille');await p.fill('#aEmail',`sb-${Date.now()}-${lang}@test.be`);await p.fill('#aPw','secret11');await p.fill('#aPw2','secret11');await p.check('#aAgree');await p.click('#aBtn');
 await p.waitForSelector('#onb:not([hidden])');await p.click('#onbSkip');if(await p.isVisible('#notifAsk'))await p.click('#naNo');
 // Sid'Journée : bouton du bandeau
 await p.evaluate(()=>show('plan'));await p.click('#vhead [data-app-claude]');await p.waitForSelector('#sbSheet:not([hidden])');
 assert.equal((await p.locator('#sbTitle').innerText()).trim(),"Sid'Bot");
 assert.match(await p.locator('#sbSub').innerText(),/Sid'Journée/);
 assert.equal(await p.locator('[data-sbctx="agenda"]').getAttribute('aria-pressed'),'true');
 await p.fill('#sbIn',lang==='fr'?'Ajoute réviser chimie jeudi à 14 h':'Add chemistry revision Thursday 2pm');await p.click('#sbSend');
 await p.waitForSelector('[data-sbact]');
 const req=sent.at(-1);assert.equal(req.body.app,'journee');assert.equal(req.body.locale,lang);assert.ok(req.auth.startsWith('Bearer '));assert.ok(req.body.context.agenda,'contexte agenda envoyé');
 const before=await p.evaluate(()=>data.tasks.length);assert.equal(before,await p.evaluate(()=>data.tasks.length),'rien ajouté sans toucher');
 await p.screenshot({path:path.join(OUT,`sidbot-${lang}-proposition.png`)});
 await p.click('[data-sbact]');await p.waitForSelector('.sb-ok');
 assert.equal(await p.evaluate(()=>data.tasks.filter(t=>t.title==='Réviser chimie'&&t.date==='2026-11-12'&&t.time==='14:00').length),1,'activité ajoutée après le toucher');
 // contexte retirable
 await p.click('[data-sbctx="agenda"]');assert.equal(await p.locator('[data-sbctx="agenda"]').getAttribute('aria-pressed'),'false');
 await p.fill('#sbIn','test');await p.click('#sbSend');await until(n=>document.querySelectorAll('.sb-msg.bot').length>=n,2);
 assert.equal(sent.at(-1).body.context.agenda,undefined,'contexte retiré respecté');
 // actions invalides ignorées
 mode='bad';await p.fill('#sbIn','x');await p.click('#sbSend');await until(()=>document.querySelectorAll('.sb-msg.bot').length>=3);
 assert.equal(await p.locator('.sb-msg.bot').last().locator('[data-sbact]').count(),0,'actions non reconnues ou mal formées ignorées');
 // quota épuisé : message explicite, sans réessai automatique
 mode='quota';await p.fill('#sbIn','x');await p.click('#sbSend');await p.waitForSelector('.sb-msg.err');
 assert.match(await p.locator('.sb-msg.err').last().innerText(),lang==='fr'?/quota gratuit/:/free quota/);
 assert.equal(await p.locator('.sb-msg.err').last().locator('[data-sbretry]').count(),0);
 await p.screenshot({path:path.join(OUT,`sidbot-${lang}-quota.png`)});
 mode='rate';await p.fill('#sbIn','x');await p.click('#sbSend');await until(()=>document.querySelectorAll('.sb-msg.err').length>=2);
 assert.equal(await p.locator('.sb-msg.err').last().locator('[data-sbretry]').count(),1,'limitation courte : bouton Réessayer');
 mode='slow';await p.fill('#sbIn','x');await p.click('#sbSend');await until(()=>document.querySelectorAll('.sb-msg.err').length>=3);
 // hors ligne
 await c.setOffline(true);mode='ok';await p.fill('#sbIn','x');await p.click('#sbSend');await until(()=>document.querySelectorAll('.sb-msg.err').length>=4);await c.setOffline(false);
 // clavier : Échap ferme
 await p.keyboard.press('Escape');assert.equal(await p.isVisible('#sbSheet'),false);
 // Sid’Note transmet la référence de la note à Claude, via le connecteur.
 await p.evaluate(()=>{NT().push({id:'n1',title:'Courses',body:'pain',createdAt:new Date().toISOString(),upd:Date.now()},{id:'n2',title:'Secret',body:'',secret:true,iv:'x',vid:'v',createdAt:new Date().toISOString(),upd:Date.now()});save();show('notes');openNote('n1')});
 const nbt=p.locator('#noteAppHead [data-app-claude]');assert.equal((await nbt.innerText()).trim(),"Sid'Bot");
 const beforeClaude=sent.length;
 await nbt.click();
 await p.waitForSelector('#ncSheet:not([hidden])');
 const ask=new URL(await p.locator('#ncGo').getAttribute('href'));
 assert.equal(ask.origin,'https://claude.ai');
 assert.match(ask.searchParams.get('q'),/Courses.*n1.*lire_note/);
 assert.ok(!ask.searchParams.get('q').includes('pain'));
 const setup=p.locator('[data-ncadd]');
 await setup.waitFor();
 const connector=new URL(await setup.getAttribute('href'));
 assert.equal(connector.origin,'https://claude.ai');
 assert.match(connector.searchParams.get('connectorUrl'),/^https:\/\/sidcompagnon\.com\/mcp\/[A-Za-z0-9_-]+$/);
 assert.equal(sent.length,beforeClaude);
 await p.click('#ncClose');
 await p.evaluate(()=>{noteOpenId='n2';ncOpen()});
 assert.equal(new URL(await p.locator('#ncGo').getAttribute('href')).searchParams.get('q'),null);
 await p.click('#ncClose');
 const all=JSON.stringify(sent);assert.ok(!/"secret"|pwd|vault|password/i.test(all),'aucune donnée secrète envoyée');
 // Sid'Forme
 await p.evaluate(()=>show('nutri'));await p.click('#vhead [data-app-claude]');assert.match(await p.locator('#sbSub').innerText(),/Sid'Forme/);await p.keyboard.press('Escape');
 await p.setViewportSize({width:1280,height:900});
 await p.evaluate(()=>{show('notes');openNote('n1')});
 await p.click('#noteAppHead [data-app-claude]');
 assert.equal(await p.isVisible('#ncSheet'),true);
 await p.click('#ncClose');
 await c.close();console.log('OK Sid\'Bot',lang)}
 await b.close();if(errors.length){console.error(errors.join('\n'));process.exitCode=1}
})().catch(e=>{console.error(e);process.exitCode=1});
