// v85 : parcours Nutrition dans l'app (faux Supabase, serveur Sid'Bot simulé avec le vrai code de finalisation).
const {chromium}=require('../app/node_modules/playwright'),assert=require('node:assert/strict'),core=require('./sidbot-loader.cjs');
// CSP stricte : pas de waitForFunction (évaluation de chaîne refusée), on interroge la page à intervalles
const until=async(page,fn,label)=>{for(let i=0;i<150;i++){if(await page.evaluate(fn))return;await page.waitForTimeout(100)}throw Error('Attente dépassée : '+label)};
(async()=>{const browser=await chromium.launch();try{for(const fallback of [false,true]){
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(f=>{window.__noIntro=true;window.__noIslands=f},fallback);
 const calls=[];
 await page.route('**/functions/v1/nutrition',r=>r.fulfill({json:{result:null}}));
 await page.route('**/functions/v1/sidbot',async route=>{const sent=route.request().postDataJSON();calls.push(sent);const b=core.validateRequest(sent),r=b.context.menu_request;
  const model={meals:r.meals.map(m=>({slot:m.slot,name:'Wrap bœuf et frites au four',items:[{name:'Wrap de blé',g:62,method:null,per100:null},{name:'Bœuf haché 5 % MG cru',g:150,method:'au four',per100:null},{name:'Frites surgelées pour four, crues',g:250,method:'au four',per100:null},{name:"Huile d'olive",g:14,method:null,per100:null}],steps:['Cuire la viande au four.','Cuire les frites au four.','Garnir le wrap.']}))};
  await route.fulfill({json:core.validateResult(core.finalizeMenu(model,r,'fr'),'forme',b.context)})});
 await page.goto('http://localhost:'+(process.env.SID_SITE_PORT||8766));
 await page.fill('#aName','Nutrition v85');await page.fill('#aEmail',`v85-${fallback}-${Date.now()}@test.be`);await page.fill('#aPw','secret11');await page.fill('#aPw2','secret11');await page.check('#aAgree');await page.click('#aBtn');await page.click('#onbSkip');
 await page.evaluate(()=>{data.nutri={consent:new Date().toISOString(),profile:{notes:'',goal:'maintain'},plan:{kcal:2400,p:140,c:280,f:80,bmr:1700,tdee:2400,warn:[]},log:[{id:'a',day:iso(today()),name:'Déjeuner',kcal:1417,p:60,c:150,f:50}]};
   const mp=nuMP();mp.pick={breakfast:false,lunch:true,dinner:true};mp.snacks=0;data.ui.nuTab='menu';show('nutri')});
 // réglage durable « Je n'aime pas » : pastille ajoutée, champ vidé après envoi
 await page.fill('#nuAlways [data-nualf="avoid"] input','champignons');await page.press('#nuAlways [data-nualf="avoid"] input','Enter');
 assert.equal(await page.inputValue('#nuAlways [data-nualf="avoid"] input'),'','champ vidé après ajout');assert.deepEqual(await page.evaluate(()=>nuMP().always.avoid.map(x=>x.t)),['champignons']);assert.ok(await page.evaluate(()=>!!nuMP().always.avoid[0].id),'entrée avec identifiant (fusion entre appareils)');
 assert.match(await page.locator('#nuAlways .nu-al-chips').first().innerText(),/champignons/);
 // 1. Sid'Bot : « j'ai mangé 50 g de flocons d'avoine » → tableau, total, question ; aucun appel réseau ; rien d'enregistré avant confirmation
 await page.evaluate(()=>sbOpen('forme'));await page.fill('#sbIn',"j'ai mangé 50 g de flocons d'avoine");await page.click('#sbSend');await page.waitForSelector('.sb-msg.bot [data-sbact]');
 assert.equal(calls.length,0,'aucun appel à Sid\'Bot serveur');assert.equal(await page.inputValue('#sbIn'),'','champ vidé après envoi');
 const bubble=await page.locator('.sb-msg.bot').last().innerText();assert.match(bubble,/Flocons d'avoine[\s\S]*50 g[\s\S]*187[\s\S]*6,7 · 30 · 3,5[\s\S]*Total : 187 kcal · P 6,7 g · G 30 g · L 3,5 g[\s\S]*Je l'enregistre \?/);
 assert.doesNotMatch(bubble,/\p{Extended_Pictographic}/u);assert.equal(await page.evaluate(()=>NU().log.length),1,'rien noté avant le toucher');
 await page.locator('[data-sbact]').last().click();assert.deepEqual(await page.evaluate(()=>{const x=NU().log.at(-1);return [x.name,x.kcal,x.p,x.c,x.f,x.day===iso(today())]}),["Flocons d'avoine",187,6.7,30,3.5,true]);
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'pas de débordement horizontal');
 // 2. « Que manger ce soir ? » → un seul appel, vraie demande de menu : dîner = kcal restantes exactes, poids crus, « je n'aime pas » joint
 const left=await page.evaluate(()=>Math.round(dayTarget(iso(today())).kcal-NU().log.filter(x=>x.day===iso(today())).reduce((t,x)=>t+x.kcal,0)));
 await page.evaluate(()=>{window.__h=Date.prototype.getHours;Date.prototype.getHours=()=>19});
 await page.fill('#sbIn','Que manger ce soir ? viande hachée au four, frites au four et wrap');await page.click('#sbSend');await until(page,()=>sbMsgs('forme').filter(x=>x.role==='assistant').length===2,'état attendu');
 assert.equal(calls.length,1);const r=calls[0].context.menu_request;assert.equal(calls[0].task,'menu');assert.deepEqual(r.meals.map(m=>[m.slot,m.kcal]),[['dinner',left]]);assert.equal(r.weighing_mode,'raw');assert.equal(r.avoid,'champignons');assert.match(r.notes,/viande hachée au four/);
 const menu=await page.locator('.sb-msg.bot').last().innerText(),sum=await page.evaluate(()=>sbMsgs('forme').at(-1).actions[0].payload.meals[0].items.reduce((t,x)=>t+x.kcal,0));
 assert.ok(Math.abs(sum-left)<=left*.05,`total ${sum} pour ${left}`);assert.match(menu,new RegExp(`Bœuf haché 5 % MG cru[\\s\\S]*Total : ${sum} kcal \\(objectif ${left}\\)[\\s\\S]*Je l'enregistre \\?`));
 assert.match(menu,/1 c\. à soupe/,'huile affichée en cuillères');assert.equal(await page.evaluate(()=>NU().menu?.meals?.length||0),0,'menu non enregistré avant confirmation');
 await page.locator('[data-sbact]').last().click();assert.equal(await page.evaluate(()=>NU().menu.meals[0].items.reduce((t,x)=>t+x.kcal,0)),sum);assert.equal(await page.evaluate(()=>NU().log.length),2,'un menu prévu ne va pas au journal');
 assert.deepEqual(await page.evaluate(()=>mpAlways().avoid),['champignons'],'le réglage durable survit à la demande');
 // 3. formulaire « Ajouter ce que tu manges » : « 50 g de flocons d'avoine et 2 œufs » → résultat direct, sans ouvrir Sid'Bot
 await page.evaluate(()=>{sbClose();data.ui.nuTab='day';renderNutri()});await page.click('#nuMealAdd');await page.fill('#nuAsk',"50 g de flocons d'avoine et 2 œufs");await page.click('#nuAskBtn');await until(page,()=>nuPending&&nuPending.items.length,'état attendu');
 assert.deepEqual(await page.evaluate(()=>[nuPending.items[0].name,nuPending.items[0].kcal,nuPending.items[0].weight_state,$('sbSheet').hidden]),["Flocons d'avoine",187,'unspecified',true]);assert.equal(calls.length,1);
 assert.deepEqual(await page.evaluate(()=>[nuPending.items[1].name,nuPending.items[1].kcal,!!nuPending.items[1].extra]),['Œuf entier',154,false]);
 assert.deepEqual(errors,[]);await page.screenshot({path:`tests/out/v85-nutrition-${fallback?'secours':'react'}.png`});await page.close();console.log('nutrition v85',fallback?'secours':'React','OK')}
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
