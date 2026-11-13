const assert=require('node:assert/strict'),fs=require('node:fs');
const engine=new Function(fs.readFileSync('supabase/functions/_shared/nutrition-menu.js','utf8').replace('export function','function')+';return createNutritionMenu()')();
const {contextFor,validateResult,validateRequest,instructions}=require('./sidbot-loader.cjs');
const request={id:'menu-983',date:'2026-11-11',weighing_mode:'cooked',budget_kind:'meal',meals:[{slot:'dinner',name:'Dîner',kcal:983}],must_include:'wrap, viande hachée cuite au four, frites au four',avoid:'',notes:''};
const food=(name,g,kcal,weight_state='cooked')=>({name,g,kcal,p:10,c:20,f:5,weight_state});
const payload={request_id:request.id,meals:[{slot:'dinner',name:'Wrap, viande hachée et frites au four',items:[food('Wrap',80,240,'unspecified'),food('Viande hachée cuite au four',150,330),food('Frites au four',200,323),food('Huile',10,90,'unspecified')]}]};
const result=p=>validateResult({reply:'Voici un aperçu à confirmer.',actions:[{type:'save_menu',label:'Menu',payload:p}]},'forme',contextFor('forme',{menu_request:request}));
assert.equal(result(payload).actions[0].payload.meals[0].target,983);
for(const bad of [ {...payload,request_id:'stale'}, {...payload,meals:[]}, {...payload,meals:[...payload.meals,...payload.meals]}, {...payload,meals:[{...payload.meals[0],slot:'lunch'}]}, {...payload,meals:[{...payload.meals[0],items:[food('riz cru',300,2400,'raw')]}]} ])assert.throws(()=>result(bad));
assert.throws(()=>engine.item({...food('riz',180,266),yield_factor:3}));
const estimated=engine.item({...food('Riz blanc long poli bouilli',180,266),cooking_method:'boiled',estimated:true,yield_factor:2.98,yield_source:'https://www.fao.org/uploads/media/bognar_bfe-r-02-03.pdf#page=38'});assert.equal(estimated.estimated,true);
assert.equal(engine.inferState('Poulet, filet sans peau grillé/poêlé'),'cooked');assert.equal(engine.inferState('Riz basmati, cru'),'raw');
const two={...request,id:'two',budget_kind:'remaining',meals:[{slot:'lunch',name:'Déjeuner',kcal:600},{slot:'dinner',name:'Dîner',kcal:800}]};
const response={request_id:'two',meals:two.meals.map(m=>({...m,items:[food('Riz basmati cuit',200,m.kcal)]}))};assert.equal(engine.menu(response,two).meals.length,2);
assert.throws(()=>engine.menu({...response,meals:[response.meals[0]]},two));
const req=validateRequest({app:'forme',task:'menu',locale:'fr',messages:[{role:'user',content:'dîner 983 kcal, après cuisson'}],context:{menu_request:request}}),prompt=instructions(req);
assert.match(prompt,/oil, butter, honey and sauces/);assert.match(prompt,/983 kcal/);assert.match(prompt,/COOKED weight/);assert.match(prompt,/Never ask a question/);assert.match(prompt,/KNOWN FOODS: .*Frites cuites au four/);assert.doesNotMatch(prompt,/\bask if\b|demande si/i);
assert.match(engine.prompt(request),/Poids APRÈS cuisson/);assert.match(engine.prompt({...request,weighing_mode:'unspecified'}),/Poids AVANT cuisson/);assert.ok(engine.prompt(request).length<260,'message visible court');
assert.equal(validateResult({reply:'Aperçu',actions:[{type:'log_meal',label:'Manger',payload:{date:request.date,name:'test',items:[{...food('riz',100,100),qty:'100 g'}]}}]},'forme',{}).actions.length,1);
assert.throws(()=>validateResult({reply:'Aperçu',actions:[{type:'log_meal',label:'Manger',payload:{date:request.date,name:'test',items:[{...food('riz',100,100),qty:'100 g'}]}}]},'forme',{menu_request:request}));
console.log('nutrition menu: 983 kcal cooked / two-meal remaining budget / stale, count, slot, state, calorie bounds / preview contract OK');
// Real handler (v85): values are recalculated by code, so a wrong kcal from the model is corrected without a second call;
// a proposal the code cannot fix (a food the person never wants) gets ONE repair call on the same quota, then a bounded error.
(async()=>{const config={SUPABASE_URL:'https://db.test',SUPABASE_SERVICE_ROLE_KEY:'test',SIDBOT_PROVIDER:'groq',SIDBOT_FREE_PLAN_CONFIRMED:'true',SIDBOT_API_KEY:'test'};
 const never={...request,avoid:'champignons'},bad=JSON.parse(JSON.stringify(payload));bad.meals[0].items.push(food('Champignons',100,22,'unspecified'));
 for(const mode of ['wrong-kcal','repair','always-bad']){let calls=0,quotas=0,last;
  const handler=require('./sidbot-loader.cjs').createHandler(k=>config[k],async(url,opt)=>{
   if(url.endsWith('/auth/v1/user'))return Response.json({id:'test'});
   if(url.includes('/rpc/')){quotas++;return Response.json({used:1,limit:20})}
   calls++;last=JSON.parse(opt.body);
   let p=JSON.parse(JSON.stringify(payload));if(mode==='wrong-kcal')p.meals[0].items[0].kcal+=1000;if(mode==='always-bad'||mode==='repair'&&calls===1)p=bad;
   return Response.json({choices:[{message:{content:JSON.stringify({reply:'Aperçu',actions:[{type:'save_menu',label:'Menu',payload:p}]})}}]});
  });
  const res=await handler(new Request('https://test',{method:'POST',headers:{Authorization:'Bearer test'},body:JSON.stringify({app:'forme',task:'menu',locale:'fr',messages:[{role:'user',content:'Dîner'}],context:{menu_request:never}})}));
  const out=await res.json();assert.equal(quotas,1);
  assert.equal(last.response_format.type,'json_schema');assert.equal(last.response_format.json_schema.strict,true);assert.equal(last.reasoning_effort,'low');assert.equal(last.messages[0].role,'system');
  if(mode==='wrong-kcal'){assert.equal(calls,1);assert.equal(last.messages.length,2,'la demande part une seule fois : système + dernier message');const m=out.actions[0].payload.meals[0],sum=m.items.reduce((t,x)=>t+x.kcal,0);
   assert.ok(Math.abs(sum-983)<=983*.05,'total recalculé dans les 5 % ('+sum+')');assert.match(out.reply,new RegExp('^Total : '+sum+' kcal \\(objectif 983\\)\\nJe l\'enregistre \\?$'))}
  else{assert.equal(calls,2);assert.match(last.messages.at(-1).content,/^Rejected: it uses a food the person never wants \(champignons\)/);
   if(mode==='always-bad'){assert.equal(out.error,'invalid_menu');assert.equal(out.actions,undefined)}else{assert.equal(res.status,200);assert.equal(out.actions[0].type,'save_menu')}}
 }
 console.log('nutrition menu server: wrong kcal corrected by code in one call, strict schema, unfixable proposal repaired once on one quota, bounded error OK');
})().catch(e=>{console.error(e);process.exitCode=1});
