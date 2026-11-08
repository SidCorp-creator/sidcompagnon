// Local preview only. Override FORME_BASE_URL when using isolated ports.
const {chromium,devices}=require('../app/node_modules/playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{const browser=await chromium.launch();try{for(const theme of ['light','dark'])for(const width of [320,390,1280])for(const lang of ['fr','en'])for(const fallback of [false,true]){
 const context=await browser.newContext({...devices['iPhone 13'],viewport:{width,height:844},locale:lang==='fr'?'fr-BE':'en-GB',timezoneId:'Europe/Brussels',colorScheme:theme,reducedMotion:'reduce'}),p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await context.addInitScript(({lang,fallback})=>{window.__noIntro=true;window.__noIslands=fallback;localStorage.setItem('sidnote-lang',JSON.stringify(lang))},{lang,fallback});
 await p.goto(process.env.FORME_BASE_URL||'http://localhost:8766');await p.fill('#aName','Camille');await p.fill('#aEmail',`v76-${Date.now()}@test.be`);await p.fill('#aPw','secret11');await p.fill('#aPw2','secret11');await p.check('#aAgree');await p.click('#aBtn');await p.waitForSelector('#onb:not([hidden])');await p.click('#onbSkip');if(await p.isVisible('#notifAsk'))await p.click('#naNo');
 await p.evaluate(theme=>{data.prefs.theme=theme;applyLook();const at=new Date().toISOString(),d=iso(today());data.nutri={consent:at,profile:{weight:75,sex:'h',age:30,height:180,goal:'maintain',sports:[]},plan:{kcal:2400,p:120,c:300,f:80,bmr:1700,tdee:2400,text:'Test',warn:[]},log:[{id:'egg',day:d,at,name:'Œufs',qty:'2 pièces',kcal:140,p:12,c:1,f:10,unit_g:50,unit_label:'moyen, estimé',upd:1}],weights:[],weeks:[]};nuDay=d;nuEditing=false;show('nutri');renderNutri()},theme);
 assert.equal(await p.locator('html').getAttribute('data-theme'),theme);
 await p.locator('[data-qed="log:egg"]').click();await p.fill('#qtyEdIn','100 g');await p.keyboard.press('Enter');assert.equal(await p.evaluate(()=>NU().log[0].kcal),140);
 await p.locator('[data-qed="log:egg"]').click();await p.fill('#qtyEdIn',lang==='en'?'3 pieces':'3 pièces');await p.keyboard.press('Enter');assert.equal(await p.evaluate(()=>NU().log[0].kcal),210);assert.equal(await p.evaluate(()=>NU().log[0].g),150);
 await p.locator('[data-nuedit="egg"]').click();await p.fill('#nuEQty','200 g');await p.locator('#nuEntryForm [type=submit]').click();assert.equal(await p.evaluate(()=>NU().log[0].kcal),280);assert.equal(await p.evaluate(()=>NU().log[0].unit_g),50);
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
 fs.mkdirSync('docs/refonte/apres',{recursive:true});await p.screenshot({path:`docs/refonte/apres/v76-nutrition-${theme}-${width}-${lang}-${fallback?'secours':'react'}.png`});
 await p.evaluate(()=>{const ds=grDays(7);NU().weights=[{id:'w1',day:ds[0],kg:80},{id:'w2',day:ds[4],kg:79}];show('graph');renderGraph()});
 const line=await p.locator('#grWeight path').getAttribute('d');assert.match(line,/M[^L]+L/);assert.equal(await p.locator('#grWeight circle').count(),2);assert.equal(await p.evaluate(()=>NU().weights.length),2);
 await p.locator('#grRange [data-range="30"]').click();assert.equal(await p.locator('#grWeight circle').count(),2);
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);assert.deepEqual(errors,[]);
 fs.mkdirSync('docs/refonte/apres',{recursive:true});await p.screenshot({path:`docs/refonte/apres/v76-poids-${theme}-${width}-${lang}-${fallback?'secours':'react'}.png`});console.log('v76-forme UI OK',theme,width,lang,fallback?'secours':'react');await context.close()
}}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
