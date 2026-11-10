// Parcours local avec un relais Open Food Facts simulé. Lancer tests/serve.js avant ce test.
const {chromium}=require('../app/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch();try{
 for (const fallback of [false,true]) {
  const p=await b.newPage({viewport:{width:390,height:844}});
  p.on('pageerror',console.error);
  await p.addInitScript(f=>{window.__noIntro=true;window.__noIslands=f},fallback);
  await p.route('**/functions/v1/aliments',async route=>{
   const {code,query}=route.request().postDataJSON();
   const product={code:'5449000000996',name:'Coca-Cola Original',kcal:42.4,p:0,c:10.6,f:0,basis:'100ml',servingMl:330};
   await route.fulfill({json:code?{product}:query==='Coca'?{items:[{code:product.code,name:product.name}]}:{items:[]}});
  });
  await p.goto('http://localhost:'+(process.env.SID_SITE_PORT||8766));
  await p.fill('#aName','Nutrition');await p.fill('#aEmail',`catalogue-${Date.now()}@test.be`);await p.fill('#aPw','secret11');await p.fill('#aPw2','secret11');await p.check('#aAgree');await p.click('#aBtn');await p.click('#onbSkip');
  await p.evaluate(()=>{
   data.nutri={consent:new Date().toISOString(),profile:{sex:'h',age:28,height:178,weight:75,goal:'maintain',sports:[]},
    plan:{kcal:2400,p:140,c:280,f:80,bmr:1750,tdee:2400,text:'',warn:[]},log:[]};
   data.ui.nuTab='day';show('nutri');
  });
  await p.click('#nuMealAdd');
  await p.click('#foodCatalog summary');
  await p.fill('#foodCatalogQuery','riz basmati cuit');
  await p.click('#foodCatalogSearch button');
  await p.locator('#foodCatalogList button').filter({hasText:'Riz basmati, cuit, sans sel ajouté'}).click();
  await p.fill('#foodCatalogAmount','150');
  await p.click('#foodCatalogPortion [type=submit]');
  assert.equal(await p.evaluate(()=>nuPending.items[0].kcal),222);
  await p.click('#nuResult [data-nuadd]');
  assert.ok(await p.evaluate(()=>NU().log.some(x=>x.kcal===222&&x.qty==='150 g'&&x.source.includes('Anses'))));
  await p.click('#nuMealAdd');
  await p.click('#foodCatalog summary');
  await p.fill('#foodCatalogQuery','5449000000996');
  await p.click('#foodCatalogSearch button');
  await p.click('#foodCatalogServing');
  assert.equal(await p.inputValue('#foodCatalogAmount'),'330');
  await p.click('#foodCatalogPortion [type=submit]');
  await p.click('#nuResult [data-nuadd]');
  const saved=await p.evaluate(()=>NU().log.find(x=>x.source==='Open Food Facts'));
  assert.equal(saved.qty,'330 ml');assert.equal(saved.kcal,140);
  assert.deepEqual(await p.evaluate(x=>[scaleQty(x,'100 g'),scaleQty(x,'50 cl'),x.kcal],saved),[false,true,212]);
  await p.close();console.log('Ciqual + code-barres et journal : '+(fallback?'secours':'React')+' OK');
 }
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
