// Offline model transport; real UI, shared Edge validation, catalogue and persistence.
const {chromium}=require('../app/node_modules/playwright'),assert=require('node:assert/strict');
const core=require('./sidbot-loader.cjs');
(async()=>{const browser=await chromium.launch();try{for(const [width,fallback,lang] of [[390,false,"fr"],[1280,true,"fr"],[390,false,"en"]]){
 const page=await browser.newPage({viewport:{width,height:900}}),errors=[];page.on('pageerror',e=>(errors.push(e.message),console.error(e.stack)));
 await page.addInitScript(({fallback,lang})=>{window.__noIntro=true;window.__noIslands=fallback;localStorage.setItem('sidnote-lang',JSON.stringify(lang))},{fallback,lang});
 let sent;
 await page.route('**/functions/v1/nutrition',r=>r.fulfill({json:{result:null}}));
 await page.route('**/functions/v1/sidbot',async route=>{
  sent=route.request().postDataJSON();const b=core.validateRequest(sent),r=b.context.menu_request;
  if(!r){const out=core.validateResult({reply:'Aperçu du repas cuit',actions:[{type:'log_meal',label:'Poulet',payload:{date:b.context.today,name:'Poulet cuit',items:[{name:'Blanc de poulet cuit',qty:'180 g',g:180,kcal:254,p:54,c:0,f:4,weight_state:'cooked'}]}}]},'forme',b.context);await route.fulfill({json:out});return}
  const meals=r.meals.map(m=>({slot:m.slot,name:m.name,items:r.meals.length===1?[
   {name:'Wrap',g:80,kcal:240,p:8,c:40,f:5,weight_state:'unspecified'},
   {name:'Viande hachée cuite au four',g:150,kcal:330,p:35,c:0,f:21,weight_state:'cooked'},
   {name:'Frites au four',g:200,kcal:323,p:5,c:58,f:8,weight_state:'cooked'},
   {name:'Huile',g:10,kcal:90,p:0,c:0,f:10,weight_state:'unspecified'}
  ]:[{name:'Riz basmati cuit',g:200,kcal:m.kcal,p:10,c:80,f:10,weight_state:'cooked'}]}));
  const out=core.validateResult({reply:'Aperçu : vérifie avant de confirmer.',actions:[{type:'save_menu',label:'Menu',payload:{request_id:r.id,meals}}]},'forme',b.context);
  await route.fulfill({json:out});
 });
 await page.goto('http://localhost:'+(process.env.SID_SITE_PORT||8766));
 await page.fill('#aName','Nutrition v83');await page.fill('#aEmail',`v83-${width}-${Date.now()}@test.be`);await page.fill('#aPw','secret11');await page.fill('#aPw2','secret11');await page.check('#aAgree');await page.click('#aBtn');await page.click('#onbSkip');
 await page.evaluate(()=>{data.nutri={consent:new Date().toISOString(),profile:{notes:'',goal:'maintain'},plan:{kcal:2400,p:140,c:280,f:80,bmr:1700,tdee:2400,warn:[]},log:[]};data.ui.nuTab='menu';show('nutri')});
 await page.click('[data-mtype="dinner"]');await page.evaluate(()=>{nuMP().one.dinner=983;renderMenuForm()});await page.selectOption('#nuWeighingMode','cooked');
 await page.fill('#nuInclude','wrap, viande hachée cuite au four, frites au four');await page.click('#nuMenuBtn');await page.waitForSelector('#sbSheet:not([hidden])');
 assert.match(await page.inputValue('#sbIn'),lang==='en'?/AFTER cooking/:/APRÈS cuisson/);assert.match(await page.inputValue('#sbIn'),/983/);
 assert.equal(await page.evaluate(()=>NU().menu?.meals?.length||0),0);assert.equal(await page.evaluate(()=>NU().log.length),0);
 await page.click('#sbSend');await page.waitForSelector('[data-sbact]');
 assert.equal(sent.task,'menu');assert.equal(sent.context.menu_request.meals.length,1);assert.equal(sent.context.menu_request.meals[0].kcal,983);
 assert.match(await page.locator('.sb-acts').last().innerText(),lang==='en'?/150 g · cooked · 330 kcal/:/150 g · cuit · 330 kcal/);
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no horizontal overflow');
 await page.screenshot({path:`tests/out/v83-menu-${width}-${lang}.png`});
 const preview=await page.evaluate(()=>sbMsgs('forme').filter(x=>x.role==='assistant').at(-1).actions[0].payload.meals.map(m=>m.items.map(x=>[x.g,x.kcal,x.weight_state])));
 assert.equal(await page.evaluate(()=>NU().menu?.meals?.length||0),0);
 // Closing/reopening the bot does not save; snapshot and weighing preference remain durable.
 await page.evaluate(()=>{sbClose();save()});await page.reload();await page.waitForFunction(()=>typeof NU==='function'&&NU().menuRequest);
 assert.equal(await page.evaluate(()=>NU().menuRequest.weighing_mode),'cooked');
 await page.evaluate(()=>sbOpen('forme'));await page.locator('[data-sbact]').last().click();
 assert.equal(await page.evaluate(()=>NU().menu.meals.length),1);assert.equal(await page.evaluate(()=>NU().log.length),0);
 assert.deepEqual(await page.evaluate(()=>NU().menu.meals.map(m=>m.items.map(x=>[x.g,x.kcal,x.weight_state]))),preview);
 assert.deepEqual(await page.evaluate(()=>{const oil=JSON.parse(JSON.stringify(NU().menu.meals[0].items.find(x=>x.name==='Huile')));const before=[oil.g,oil.kcal];scaleQty(oil,'20 g');return [before,oil.g,oil.kcal]}),[[10,90],20,180]);
 assert.equal(await page.evaluate(()=>NU().menu.meals[0].items[1].weight_state),'cooked');
 assert.equal(await page.evaluate(()=>NU().menuRequest||null),null);
 // Two meals share the remaining allowance, never the whole daily target each.
 await page.evaluate(async()=>{sbClose();NU().log=[{id:uid(),day:iso(today()),kcal:1000}];const mp=nuMP();mp.type='day';mp.pick={breakfast:false,lunch:true,dinner:true};mp.snacks=0;mp.kcals=null;mp.budget_kind='remaining';mpSet(mp,'day','weighing_mode','cooked');data.ui.nuTab='menu';NU().upd=Date.now();show('nutri');renderNutri();save();await push()});
 await page.click('#nuMenuBtn');await page.waitForSelector('#sbSheet:not([hidden])');await page.click('#sbSend');await page.waitForFunction(()=>sbMsgs('forme').filter(x=>x.role==='assistant').length===2);
 assert.equal(sent.context.menu_request.budget_kind,'remaining');assert.equal(sent.context.menu_request.meals.length,2);assert.equal(sent.context.menu_request.meals.reduce((s,m)=>s+m.kcal,0),1400);
 const twoPreview=await page.evaluate(()=>sbMsgs('forme').filter(x=>x.role==='assistant').at(-1).actions[0].payload.meals.map(m=>m.items.reduce((t,x)=>t+x.kcal,0)));
 await page.locator('[data-sbact]').last().click();assert.deepEqual(await page.evaluate(()=>NU().menu.meals.map(m=>m.items.reduce((t,x)=>t+x.kcal,0))),twoPreview);assert.equal(await page.evaluate(()=>NU().menu.meals.length),2);assert.equal(await page.evaluate(()=>NU().log.length),1);
 // Single food natural text uses actual cooked Ciqual composition, no yield guess.
 await page.evaluate(async()=>{sbClose();NU().log=[];data.ui.nuTab='day';renderNutri()});await page.click('#nuMealAdd');
 await page.fill('#nuAsk',"j'ai pesé 180 g de riz basmati cuit");await page.click('#nuAskBtn');await page.waitForFunction(()=>nuPending?.items?.length);
 assert.equal(await page.evaluate(()=>nuPending.items[0].kcal),266);assert.equal(await page.evaluate(()=>nuPending.items[0].weight_state),'cooked');await page.click('#nuResult [data-nuadd]');
 await page.click('#nuMealAdd');await page.fill('#nuAsk','180 g de poulet filet sans peau grillé');await page.click('#nuAskBtn');await page.waitForFunction(()=>nuPending?.items?.length);
 assert.equal(await page.evaluate(()=>nuPending.items[0].kcal),254);await page.click('#nuResult [data-nuadd]');
 assert.ok(await page.evaluate(()=>NU().log.every(x=>x.weight_state==='cooked'&&x.source.includes('Anses'))));
 // Force the missing-local-food path: the cooked wording survives memory miss, Sid'Bot and the consumed log.
 await page.evaluate(()=>{ciqualSearch=async()=>[]});await page.click('#nuMealAdd');await page.fill('#nuAsk','180 g de blanc de poulet cuit');await page.click('#nuAskBtn');await page.waitForSelector('#sbSheet:not([hidden])');
 assert.match(await page.inputValue('#sbIn'),/cuit/);await page.click('#sbSend');await page.waitForFunction(()=>sbMsgs('forme').filter(x=>x.role==='assistant').length===3);
 assert.match(sent.messages.at(-1).content,/180 g de blanc de poulet cuit/);await page.locator('[data-sbact]').last().click();
 assert.equal(await page.evaluate(()=>NU().log.at(-1).weight_state),'cooked');assert.equal(await page.evaluate(()=>NU().log.at(-1).g),180);
 assert.deepEqual(errors,[]);await page.close();console.log(`nutrition v83 ${width}/${fallback?'fallback':'React'}/${lang}: cooked rice + meat, 983 kcal preview/confirmation/reload, 2-meal remaining budget OK`);
 }}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
