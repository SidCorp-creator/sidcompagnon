// v85 : Sid'Bot et la nutrition, de bout en bout sur le vrai gestionnaire (fournisseur simulé).
// Il ne demande jamais les calories ; les valeurs viennent de la table ; un menu aux totaux faux n'est jamais renvoyé.
const assert=require('node:assert/strict');
const core=require('./sidbot-loader.cjs');
const config={SUPABASE_URL:'https://db.test',SUPABASE_SERVICE_ROLE_KEY:'test',SIDBOT_PROVIDER:'groq',SIDBOT_FREE_PLAN_CONFIRMED:'true',SIDBOT_API_KEY:'test'};
const EMOJI=/\p{Extended_Pictographic}/u;
async function run(body,answers){let calls=0,quotas=0;const sent=[];
  const handler=core.createHandler(k=>config[k],async(url,opt)=>{
    if(url.endsWith('/auth/v1/user'))return Response.json({id:'test'});
    if(url.includes('/rpc/')){quotas++;return Response.json({used:1,limit:20})}
    const a=answers[Math.min(calls,answers.length-1)];calls++;sent.push(JSON.parse(opt.body));
    return typeof a==='number'?Response.json({error:{code:'bad'}},{status:a}):Response.json({choices:[{message:{content:JSON.stringify(a)}}]})});
  const res=await handler(new Request('https://test',{method:'POST',headers:{Authorization:'Bearer test'},body:JSON.stringify({app:'forme',locale:'fr',context:{today:'2026-11-13'},...body})}));
  return {status:res.status,out:await res.json(),calls,quotas,sent}}
const user=content=>({messages:[{role:'user',content}]});
const meal=(items,extra={})=>({reply:'Combien de calories fait ce repas ? 😋',actions:[{type:'log_meal',label:'Repas',payload:{date:'2026-11-13',name:'Repas',items,...extra}}]});
(async()=>{
  // 1. « j'ai mangé 50 g de flocons d'avoine » : aucune question, aucun appel au modèle, aucun quota consommé
  {const r=await run(user("j'ai mangé 50 g de flocons d'avoine"),[{reply:'x',actions:[]}]);assert.equal(r.status,200);assert.equal(r.calls,0);assert.equal(r.quotas,0);
   const x=r.out.actions[0].payload.items[0];assert.deepEqual([x.kcal,x.p,x.c,x.f,x.qty],[187,6.7,30,3.5,'50 g']);assert.equal(r.out.reply,"Total : 187 kcal · P 6,7 g · G 30 g · L 3,5 g\nJe l'enregistre ?");
   assert.equal(core.validateResult(r.out,'forme',{}).actions.length,1,'proposition conforme au contrat des actions')}
  // 2. « 150 g de riz cru » (texte venu du formulaire Nutrition) : 525 kcal, fiche crue
  {const r=await run(user("J'ai mangé : 150 g de riz cru"),[{reply:'x',actions:[]}]);assert.equal(r.calls,0);assert.deepEqual([r.out.actions[0].payload.items[0].name,r.out.actions[0].payload.items[0].kcal],['Riz blanc cru',525])}
  // 3. quantité absente : portion standard, dite, sans question
  {const r=await run(user("j'ai mangé une banane et du riz"),[{reply:'x',actions:[]}]);assert.equal(r.calls,0);assert.match(r.out.reply,/portion standard retenue : Riz blanc cuit \(180 g\)/);assert.equal(r.out.actions[0].payload.items.length,2)}
  // 4. aliment inconnu : le modèle léger estime, c'est marqué « estimé », et sa question est remplacée par la réponse du code
  {const r=await run(user("j'ai mangé 30 g de kombucha de yuzu"),[meal([{name:'Kombucha de yuzu',qty:'30 g',g:30,kcal:12,p:0,c:3,f:0,unit_g:0}])]);
   assert.equal(r.calls,1);assert.equal(r.quotas,1);assert.equal(r.sent[0].model,'openai/gpt-oss-20b','modèle le moins cher pour un aliment simple');assert.equal(r.sent[0].reasoning_effort,'low');
   const x=r.out.actions[0].payload.items[0];assert.equal(x.estimated,true);assert.equal(x.kcal,12);assert.equal(x.unit_g,undefined,'unit_g:0 ne fait plus rejeter la proposition');
   assert.equal(r.out.reply,"Total : 12 kcal · P 0 g · G 3 g · L 0 g\nEstimé : Kombucha de yuzu.\nJe l'enregistre ?");assert.doesNotMatch(r.out.reply+r.out.actions[0].label,EMOJI);
   const sys=r.sent[0].messages[0].content;assert.match(sys,/NEVER ask the person for calories, macros or a label/);assert.match(sys,/Quantity missing: use a standard portion/);assert.match(sys,/No emoji/);
   assert.doesNotMatch(sys,/ask one short question|Do not invent stored facts/);assert.ok(sys.length<2200,'prompt court ('+sys.length+' caractères)')}
  // 5. valeurs fausses du modèle pour un aliment connu : remplacées par la table (vérification côté code)
  {const r=await run(user("ce midi j'ai mangé 150 g de riz cru avec une sauce maison au yuzu"),[meal([{name:'Riz cru',qty:'150 g',g:150,kcal:9999,p:1,c:1,f:1},{name:'Sauce maison au yuzu',qty:'20 g',g:20,kcal:40,p:0,c:5,f:2}])]);
   const [riz,sauce]=r.out.actions[0].payload.items;assert.deepEqual([riz.name,riz.kcal,riz.p,riz.source,riz.estimated],['Riz blanc cru',525,10.5,'table',undefined]);assert.equal(sauce.estimated,true);
   assert.match(r.out.reply,/^Total : 565 kcal/);assert.equal(r.out.actions[0].label,'Repas · 565 kcal')}
  // 6. grammes absents mais quantité lisible (« 200 g ») : recalculé quand même
  {const r=await run(user("j'ai mangé 200 g de pâtes cuites à la sauce yuzu"),[meal([{name:'Pâtes cuites',qty:'200 g',kcal:1,p:1,c:1,f:1}])]);assert.equal(r.out.actions[0].payload.items[0].kcal,334)}
  // 7. une question générale reste une réponse du modèle, sans emoji
  {const r=await run(user('Explique-moi mes besoins'),[{reply:'Tes besoins dépendent de ton activité 💪.',actions:[]}]);assert.equal(r.out.reply,'Tes besoins dépendent de ton activité.');assert.equal(r.calls,1);assert.equal(r.sent[0].model,'openai/gpt-oss-120b');assert.equal(r.sent[0].response_format.type,'json_object')}
  // 8. menu : dîner 983 kcal, poids crus, viande hachée au four + frites au four + wrap. Le modèle ne donne que noms, grammes, cuisson, étapes.
  const request={id:'m983',date:'2026-11-13',weighing_mode:'raw',budget_kind:'meal',meals:[{slot:'dinner',name:'Dîner',kcal:983}],must_include:'viande hachée au four, frites au four, wrap',avoid:'champignons',notes:''};
  const dish=(extra=[])=>({meals:[{slot:'dinner',name:'Wrap bœuf et frites au four 🌯',items:[{name:'Wrap de blé',g:62,method:null,per100:null},{name:'Bœuf haché 5 % MG cru',g:150,method:'au four',per100:null},{name:'Frites surgelées pour four, crues',g:250,method:'au four',per100:null},{name:"Huile d'olive",g:5,method:null,per100:null},...extra],steps:['Cuire la viande hachée au four 15 min.','Cuire les frites au four.','Garnir le wrap.']}]});
  {const r=await run({task:'menu',...user('Prépare 1 repas : Dîner (983 kcal).'),context:{today:'2026-11-13',menu_request:request}},[dish()]);
   assert.equal(r.status,200);assert.equal(r.calls,1);assert.equal(r.sent[0].model,'openai/gpt-oss-120b');
   const sys=r.sent[0].messages[0].content;assert.match(sys,/RAW weight in grams, before cooking/);assert.match(sys,/Must include: viande hachée au four, frites au four, wrap\. Never use: champignons\./);assert.match(sys,/dinner "Dîner" = 983 kcal/);assert.match(sys,/Never ask a question/);
   assert.deepEqual(r.sent[0].response_format.json_schema.schema.properties.meals.items.properties.items.items.required,['name','g','method','per100']);
   const m=r.out.actions[0].payload.meals[0],sum=m.items.reduce((t,x)=>t+x.kcal,0);
   assert.ok(Math.abs(sum-983)<=983*.05,'±5 % ('+sum+')');assert.equal(r.out.reply,`Total : ${sum} kcal (objectif 983)\nJe l'enregistre ?`);
   assert.deepEqual(m.items.map(x=>x.name),['Wrap de blé','Bœuf haché 5 % MG cru','Frites surgelées pour four, crues',"Huile d'olive"]);assert.equal(m.items[0].g,62);assert.ok(m.items.every(x=>x.source==='table'&&x.g>0&&['kcal','p','c','f'].every(k=>typeof x[k]==='number')));
   assert.deepEqual(m.items.map(x=>x.weight_state),['unspecified','raw','raw','unspecified']);assert.equal(m.items[1].cooking_method,'au four');assert.equal(m.steps.length,3);assert.doesNotMatch(m.name,EMOJI);
   assert.equal(m.target,983);assert.equal(r.out.actions[0].payload.request_id,'m983')}
  // 9. aliment hors table dans un menu : per100 du modèle, marqué estimé et annoncé ; sans per100 valide → une relance
  {const r=await run({task:'menu',...user('Dîner'),context:{today:'2026-11-13',menu_request:request}},[dish([{name:'Sauce au yuzu',g:20,method:null,per100:[150,1,20,7]}])]);
   assert.match(r.out.reply,/\nValeurs estimées : Sauce au yuzu\.\n/);assert.equal(r.out.actions[0].payload.meals[0].items.at(-1).estimated,true);
   const r2=await run({task:'menu',...user('Dîner'),context:{today:'2026-11-13',menu_request:request}},[dish([{name:'Sauce au yuzu',g:20,method:null,per100:null}]),dish()]);
   assert.equal(r2.calls,2);assert.equal(r2.quotas,1);assert.match(r2.sent[1].messages.at(-1).content,/^Rejected: a food outside KNOWN FOODS has no valid "per100"/);assert.equal(r2.status,200)}
  // 10. aliment imposé absent → une relance ; le modèle pose une question au lieu d'un menu → une relance, puis erreur bornée (rien d'affiché)
  {const noWrap=dish();noWrap.meals[0].items.shift();const r=await run({task:'menu',...user('Dîner'),context:{today:'2026-11-13',menu_request:request}},[noWrap,dish()]);
   assert.equal(r.calls,2);assert.match(r.sent[1].messages.at(-1).content,/a requested food is missing \(wrap\)/);assert.equal(r.status,200);
   const q=await run({task:'menu',...user('Dîner'),context:{today:'2026-11-13',menu_request:request}},[{reply:'Quel poids veux-tu ?',actions:[]}]);assert.equal(q.calls,2);assert.equal(q.out.error,'invalid_menu');assert.equal(q.out.actions,undefined)}
  // 11. menu trop loin de la cible pour être ajusté (un seul wrap) → jamais affiché
  {const tiny={meals:[{slot:'dinner',name:'Wrap',items:[{name:'Wrap de blé',g:62,method:null,per100:null}],steps:[]}]};
   const r=await run({task:'menu',...user('Dîner'),context:{today:'2026-11-13',menu_request:{...request,must_include:'',avoid:''}}},[tiny]);assert.equal(r.calls,2);assert.equal(r.out.error,'invalid_menu');assert.match(r.sent[1].messages.at(-1).content,/portions are too far from the meal kcal/)}
  // 12. deux repas sur le reste de la journée : chaque repas tient son budget, le total est annoncé
  {const two={...request,id:'two',budget_kind:'remaining',must_include:'',avoid:'',meals:[{slot:'lunch',name:'Déjeuner',kcal:600},{slot:'dinner',name:'Dîner',kcal:800}]};
   const m=slot=>({slot,name:'Riz poulet',items:[{name:'Riz basmati cru',g:80,method:null,per100:null},{name:'Filet de poulet cru',g:150,method:'poêle',per100:null},{name:'Brocoli',g:150,method:'vapeur',per100:null},{name:"Huile d'olive",g:8,method:null,per100:null}],steps:['Cuire le riz.','Poêler le poulet.']});
   const r=await run({task:'menu',...user('Menu'),context:{today:'2026-11-13',menu_request:two}},[{meals:[m('lunch'),m('dinner')]}]);
   const sums=r.out.actions[0].payload.meals.map(x=>x.items.reduce((t,y)=>t+y.kcal,0));assert.ok(Math.abs(sums[0]-600)<=30&&Math.abs(sums[1]-800)<=40,sums.join());
   assert.equal(r.out.reply,`Déjeuner : ${sums[0]} kcal (objectif 600)\nDîner : ${sums[1]} kcal (objectif 800)\nTotal : ${sums[0]+sums[1]} kcal (objectif 1400)\nJe l'enregistre ?`)}
  // 13. Groq refuse le schéma strict (400) : une seule bascule sur le mode JSON simple, sans consommer la relance
  {const r=await run({task:'menu',...user('Dîner'),context:{today:'2026-11-13',menu_request:request}},[400,dish()]);assert.equal(r.status,200);assert.equal(r.calls,2);assert.equal(r.sent[1].response_format.type,'json_object');assert.equal(r.sent[1].reasoning_effort,undefined)}
  // 14. photo : même vérification par la table, une seule proposition
  {const img='data:image/jpeg;base64,'+Buffer.from('x').toString('base64');const cfg=config.SIDBOT_VISION_MODEL;config.SIDBOT_VISION_MODEL='vision-test';
   const r=await run({messages:[{role:'user',content:'Voici la photo de mon assiette : estime ce que j\'ai mangé.',image:img}]},[meal([{name:'Œuf au plat',qty:'2',g:100,kcal:50,p:1,c:1,f:1}])]);config.SIDBOT_VISION_MODEL=cfg;
   assert.equal(r.sent[0].model,'vision-test');assert.match(r.sent[0].messages[0].content,/Photo: list only the foods you clearly see/);assert.equal(r.out.actions[0].payload.items[0].kcal,196)}
  console.log('nutrition sidbot: oats without model or quota / raw rice / missing quantity / unknown food estimated on light model / wrong values corrected / menu 983 raw fitted, strict schema, include+avoid, estimates, repair once, bounded error / two meals / strict fallback / photo OK');
})().catch(e=>{console.error(e);process.exitCode=1});
