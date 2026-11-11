// Shared, pure browser/Edge contract. Nutrients are totals for the displayed edible mass.
export function createNutritionMenu() {
  const states=['raw','cooked','unspecified'], slots=['breakfast','lunch','snack','dinner','meal'];
  const fail=()=>{throw Error('invalid_menu')}, str=(v,n=300)=>{if(typeof v!=='string'||!v.trim()||v.length>n)fail();return v.trim()}, num=(v,max=20000)=>{if(typeof v!=='number'||!Number.isFinite(v)||v<0||v>max)fail();return v};
  function weightMeta(x){
    let state=x.weight_state===undefined?'unspecified':x.weight_state;if(state==='unspecified')state=inferState(x.name||x.food);if(!states.includes(state))fail();
    const out={weight_state:state};
    for(const k of ['cooking_method','source','yield_source'])if(x[k]!==undefined)out[k]=str(x[k],800);
    if(x.yield_factor!==undefined){if(!num(x.yield_factor,10))fail();if(!x.yield_source||x.estimated!==true||state!=='cooked')fail();
      const name=String(x.name||x.food).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(),method=String(x.cooking_method||'');
      const url='https://www.fao.org/uploads/media/bognar_bfe-r-02-03.pdf';
      const rice=/riz|rice/.test(name)&&/blanc|white|poli|polished/.test(name)&&/long/.test(name)&&!/(complet|brown|unpolished|parboil|etuv)/.test(name)&&x.yield_factor===2.98&&x.yield_source===url+'#page=38';
      const pasta=/pasta|pates|noodles/.test(name)&&/durum|ble dur/.test(name)&&/sans oeuf|egg.free/.test(name)&&x.yield_factor===2.1&&x.yield_source===url+'#page=39';
      if(!/boil|bouilli|eau/i.test(method)||!(rice||pasta))fail();out.yield_factor=x.yield_factor;out.estimated=true}
    if(x.estimated!==undefined){if(typeof x.estimated!=='boolean')fail();out.estimated=x.estimated}
    return out;
  }
  function request(v){
    if(!v||!Array.isArray(v.meals)||!v.meals.length||v.meals.length>6)fail();
    const id=str(v.id,80);if(!/^[\w-]+$/.test(id))fail();
    const date=str(v.date,10);if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||new Date(date+'T12:00:00Z').toISOString().slice(0,10)!==date)fail();
    const mode=v.weighing_mode||'unspecified';if(!states.includes(mode))fail();
    const meals=v.meals.map(m=>{if(!slots.includes(m.slot)||!num(m.kcal,10000))fail();return {slot:m.slot,name:str(m.name,100),kcal:m.kcal}});
    const out={id,date,weighing_mode:mode,meals,budget_kind:['day','meal','remaining'].includes(v.budget_kind)?v.budget_kind:'meal'};
    for(const k of ['must_include','avoid','notes'])out[k]=v[k]===undefined?'':(typeof v[k]==='string'&&v[k].length<=2000?v[k]:fail());
    return out;
  }
  function item(x){
    if(!x||typeof x!=='object')fail();const g=num(x.g===undefined?x.grams:x.g);if(!g)fail();
    return {name:str(x.name||x.food),g,qty:g+' g',kcal:num(x.kcal),p:num(x.p===undefined?x.protein_g:x.p),c:num(x.c===undefined?x.carbs_g:x.c),f:num(x.f===undefined?x.fat_g:x.f),...weightMeta(x)};
  }
  function menu(v,r){
    r=r?request(r):null;if(!v||!Array.isArray(v.meals)||!v.meals.length||v.meals.length>6)fail();
    if(r&&(v.request_id!==r.id||v.meals.length!==r.meals.length))fail();
    const meals=v.meals.map((m,i)=>{
      if(!slots.includes(m.slot)||r&&m.slot!==r.meals[i].slot||!Array.isArray(m.items)||!m.items.length||m.items.length>30)fail();
      const items=m.items.map(item),kcal=items.reduce((s,x)=>s+x.kcal,0),target=r?r.meals[i].kcal:m.target;
      // A target is a budget, not an instruction to replace it with the daily allowance.
      if(target!==undefined){num(target,10000);if(Math.abs(kcal-target)>Math.max(30,target*.05))fail()}
      if(r&&r.weighing_mode!=='unspecified'&&items.some(x=>x.weight_state!=='unspecified'?x.weight_state!==r.weighing_mode:/riz|rice|p[aâ]tes|pasta|pomme de terre|potato|frites|viande|boeuf|bœuf|beef|poulet|chicken|poisson|fish/i.test(x.name)))fail();
      return {slot:m.slot,name:str(m.name),em:typeof m.emoji==='string'?m.emoji.slice(0,8):'🍽️',items,...(target!==undefined?{target}:{}),steps:Array.isArray(m.steps)?m.steps.slice(0,12).map(s=>str(s,500)):null};
    });
    return {meals,tips:typeof v.tips==='string'?v.tips.slice(0,2000):'',...(r?{request_id:r.id,weighing_mode:r.weighing_mode,date:r.date}:{})};
  }
  function inferState(name){const s=String(name).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();return /\b(cru|crue|raw)\b/.test(s)?'raw':/\b(cuit|cuite|cuits|cuites|cooked|grille|grillee|poele|bouilli)\b/.test(s)?'cooked':'unspecified'}
  function protocolPrompt(r,english=false){r=request(r);return (english?'Prepare a PLANNED menu, not a consumed meal.':'Prépare un menu PRÉVU, pas un repas consommé.')+' '+JSON.stringify(r)+' '+(english?
    'Respect exactly the requested number of meals, foods and each meal budget; these are not extra daily calories. Weights in grams: raw = before cooking, cooked = AFTER cooking, unspecified = ask if needed. Keep the requested cooking method. Give grams and kcal for EVERY ingredient, including oils and sauces, macros and each meal total. Prefer a matching cooked Ciqual composition for cooked weights. Never apply raw composition to cooked mass. Only use a documented, method-specific yield when no cooked composition exists; include yield_factor, yield_source and estimated:true. No universal meat or rice factor. Use unspecified only for ready-to-eat ingredients where cooking state is irrelevant. Preview first; save_menu only on confirmation, never log_meal.':
    'Respecte exactement le nombre de repas, les aliments et le budget de CHAQUE repas ; ce ne sont pas des calories à ajouter à la journée. Grammes crus = avant cuisson ; cuits = APRÈS cuisson ; non précisé = demander si nécessaire. Garde le mode de cuisson demandé. Donne g et kcal pour CHAQUE ingrédient, huiles et sauces comprises, macros et total par repas. Pour un poids cuit, privilégie la composition Ciqual cuite correspondante. Jamais de composition crue appliquée à une masse cuite. À défaut seulement, rendement documenté propre à l’aliment et à la cuisson : yield_factor, yield_source et estimated:true. Aucun facteur universel viande ou riz. unspecified seulement pour les ingrédients prêts à manger où la cuisson ne s’applique pas. Aperçu avant confirmation ; save_menu, jamais log_meal.')+' Fallback yields ONLY (cooked mass/raw mass; estimated:true; cooking_method:boiled): long-grain polished WHITE rice 2.98, yield_source https://www.fao.org/uploads/media/bognar_bfe-r-02-03.pdf#page=38 (Bognar 2002 table 29); egg-free durum wheat pasta 2.10, yield_source https://www.fao.org/uploads/media/bognar_bfe-r-02-03.pdf#page=39 (table 30). Include those food qualifiers in name. Otherwise use matching cooked composition or ask; no guessed yield, particularly for meat.';}
  function prompt(r,english=false,technical=false){
    r=request(r);if(technical)return protocolPrompt(r,english);
    const meals=r.meals.map(m=>m.name+' (~'+m.kcal+' kcal)').join(', '),total=r.meals.reduce((t,m)=>t+m.kcal,0);
    const mode=english?{raw:'BEFORE cooking (raw)',cooked:'AFTER cooking (cooked)',unspecified:'not specified; ask if necessary'}[r.weighing_mode]:{raw:'AVANT cuisson (crus)',cooked:'APRÈS cuisson (cuits)',unspecified:'non précisé ; demande si nécessaire'}[r.weighing_mode];
    const notes=r.notes.split(' Références de composition')[0];
    return english?`Prepare exactly ${r.meals.length} planned meal(s): ${meals}. Combined budget: ${total} kcal (${r.budget_kind==='remaining'?'remaining daily allowance':r.budget_kind==='day'?'daily target':'this meal only, not the daily allowance'}). Weights in grams: ${mode}. Include: ${r.must_include||'no preference'}. Avoid: ${r.avoid||'no exclusion'}. ${notes} Keep the requested cooking methods. Give grams and kcal per ingredient, including oils and sauces, and a total per meal. Prefer matching cooked Ciqual values for cooked weights; document and label any fallback yield as an estimate. Show a preview; save the planned menu only after my confirmation. Do not log it as eaten.`:
      `Prépare exactement ${r.meals.length} repas prévu(s) : ${meals}. Budget total à répartir : ${total} kcal (${r.budget_kind==='remaining'?'reste de la journée':r.budget_kind==='day'?'objectif de la journée':'ce repas seulement, pas toute la journée'}). Poids en grammes : ${mode}. À inclure : ${r.must_include||'pas de préférence'}. À éviter : ${r.avoid||'pas d’exclusion'}. ${notes} Garde les modes de cuisson demandés. Donne g et kcal par ingrédient, huiles et sauces comprises, et le total par repas. Privilégie une fiche Ciqual cuite correspondante pour les poids cuits ; documente et signale tout rendement de secours comme estimation. Montre un aperçu ; enregistre le menu prévu après ma confirmation seulement. Ne le note pas comme consommé.`;
  }
  return {weightMeta,request,item,menu,inferState,prompt};
}
