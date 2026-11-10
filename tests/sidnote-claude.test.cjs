// v81 : depuis Sid'Note, Sid'Bot redirige vers Claude (ancien parcours) : aucun appel à la fonction sidbot (clé API), lien « Ouvrir Claude »
// (avec la note ouverte, jamais une note secrète), raccourci « Ajouter le connecteur Sid'Note » pré-rempli (adresse personnelle créée dans
// mcp_tokens), branchement confirmé quand Claude utilise l'adresse. Sid'Journée garde Sid'Bot. Faux Supabase (tests/serve.js).
const BASE=process.env.SID_BASE_URL||'http://localhost:'+(process.env.SID_SITE_PORT||8766);
const {chromium}=require('../app/node_modules/playwright'),assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch(),errors=[];
 for(const lang of ['fr','en']){
 const c=await b.newContext({locale:lang==='fr'?'fr-BE':'en-GB',timezoneId:'Europe/Brussels',viewport:{width:390,height:844}});
 await c.addInitScript(l=>{window.__noIntro=true;localStorage.setItem('sidnote-lang',JSON.stringify(l))},lang);
 const p=await c.newPage();p.setDefaultTimeout(8000);p.on('pageerror',e=>errors.push(lang+': '+e.message));
 const bot=[];await c.route(/\/functions\/v1\/sidbot/,rt=>{bot.push(rt.request().url());rt.fulfill({status:200,contentType:'application/json',body:'{"reply":"ok"}'})});
 await p.goto(BASE);await p.fill('#aName','Camille');await p.fill('#aEmail',`nc-${Date.now()}-${lang}@test.be`);await p.fill('#aPw','secret11');await p.fill('#aPw2','secret11');await p.check('#aAgree');await p.click('#aBtn');
 await p.waitForSelector('#onb:not([hidden])');await p.click('#onbSkip');if(await p.isVisible('#notifAsk'))await p.click('#naNo');
 // une note ouverte et une note secrète
 await p.evaluate(()=>{data.notes.push({id:'nPdf',title:'Protocole TP',body:'voir PDF',pdf:{name:'tp.pdf',size:10,pages:2,up:true},createdAt:new Date().toISOString(),upd:Date.now()},{id:'nSec',secret:true,enc:'x',upd:Date.now()});save();show('notes');openNote('nPdf')});
 // 1. bouton Sid'Bot de l'en-tête Sid'Note → feuille Claude (pas Sid'Bot)
 await p.locator('#noteAppHead [data-app-claude]').first().click();
 await p.waitForSelector('#ncSheet:not([hidden])');assert.ok(await p.isHidden('#sbSheet'),'Sid\'Bot ne s\'ouvre pas pour Sid\'Note');
 const go=await p.getAttribute('#ncGo','href');assert.match(go,/^https:\/\/claude\.ai\/new\?q=/);
 const q=decodeURIComponent(go.split('q=')[1]);assert.match(q,/Protocole TP/);assert.match(q,/nPdf/);assert.match(q,/lire_note/);
 // 2. raccourci du connecteur : adresse personnelle créée, fenêtre « Ajouter un connecteur personnalisé » pré-remplie
 await p.waitForSelector('[data-ncadd]');const add=await p.getAttribute('[data-ncadd]','href');
 assert.ok(add.startsWith('https://claude.ai/customize/connectors?modal=add-custom-connector&connectorName='+encodeURIComponent("Sid'Note")+'&connectorUrl='),add);
 const url=decodeURIComponent(add.split('connectorUrl=')[1]);assert.match(url,/^https:\/\/sidcompagnon\.com\/mcp\/[A-Za-z0-9_-]{40,}$/);
 const rows=await p.evaluate(async()=>await api('/rest/v1/mcp_tokens?select=hash,last_used',{token:await token()}));assert.equal(rows.length,1,'une adresse créée');
 // 3. Claude utilise l'adresse (mcp_tokens.last_used rempli côté serveur) → « branché », data.prefs.aiOk posé
 await c.route(/\/rest\/v1\/mcp_tokens\?select=last_used/,rt=>rt.fulfill({status:200,contentType:'application/json',body:JSON.stringify([{last_used:new Date().toISOString()}])}));
 await p.click('[data-ncadd]').catch(()=>{});for(const pg of c.pages())if(pg!==p)await pg.close();
 await p.waitForSelector('#ncBody .ok',{timeout:9000});assert.ok(await p.evaluate(()=>!!data.prefs.aiOk));
 // 4. note secrète ouverte : jamais dans le lien
 await p.click('#ncClose');await p.evaluate(()=>{noteOpenId='nSec'});await p.evaluate(()=>sbOpen('note'));
 const go2=decodeURIComponent((await p.getAttribute('#ncGo','href')).split('q=')[1]||'');assert.doesNotMatch(go2,/nSec/);
 // 5. onglet Sid'Note dans la feuille Sid'Bot → Claude ; Sid'Journée garde Sid'Bot
 await p.click('#ncClose');await p.evaluate(()=>sbOpen('journee'));await p.waitForSelector('#sbSheet:not([hidden])');
 await p.click('#sbSheet [data-sbapp="note"]');await p.waitForSelector('#ncSheet:not([hidden])');assert.ok(await p.isHidden('#sbSheet'));
 // 6. changement de compte : raccourci et adresse du compte précédent oubliés, feuille fermée
 await p.evaluate(()=>{ncW.url='https://sidcompagnon.com/mcp/ancien';ncW.hash='h'});const realId=await p.evaluate(()=>session.user.id);
 await p.evaluate(()=>{session.user.id='autre-compte'});await p.waitForTimeout(1300);
 assert.ok(await p.evaluate(()=>!ncW.url&&!ncW.hash&&ncW.uid==='autre-compte'&&document.getElementById('ncSheet').hidden),'état oublié au changement de compte');
 await p.evaluate(i=>{session.user.id=i},realId);
 assert.equal(bot.length,0,'aucun appel à la fonction sidbot depuis Sid\'Note');
 if(lang==='en')assert.match(await p.textContent('#ncGo'),/Open Claude/);
 console.log('ok ',lang,': Sid\'Note → Claude, raccourci du connecteur, note secrète exclue');
 await c.close()}
 assert.deepEqual(errors,[],errors.join(' | '));await b.close();console.log('sidnote-claude : OK');
})().catch(e=>{console.error(e);process.exit(1)});
