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
      return {slot:m.slot,name:str(m.name),em:'',items,...(target!==undefined?{target}:{}),steps:Array.isArray(m.steps)?m.steps.slice(0,12).map(s=>str(s,500)):null};
    });
    return {meals,tips:typeof v.tips==='string'?v.tips.slice(0,2000):'',...(r?{request_id:r.id,weighing_mode:r.weighing_mode,date:r.date}:{})};
  }
  function inferState(name){const s=String(name).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();return /\b(cru|crue|crus|crues|raw|sec|seche|secs|seches)\b/.test(s)?'raw':/\b(cuit|cuite|cuits|cuites|cooked|grille|grillee|grilles|grillees|poele|poelee|bouilli|bouillie|roti|rotie|rotis|roties)\b/.test(s)?'cooked':'unspecified'}
  // v85 : message court, visible dans la conversation. Les consignes techniques sont dans le prompt système du serveur (une seule fois).
  function prompt(r,english=false){
    r=request(r);const total=r.meals.reduce((t,m)=>t+m.kcal,0),meals=r.meals.map(m=>m.name+' ('+m.kcal+' kcal)').join(', '),notes=r.notes.split(' Références de composition')[0].split(' Composition references')[0].trim();
    const kind=english?{remaining:'what is left of my day',day:'my daily target',meal:'this meal only'}[r.budget_kind]:{remaining:'le reste de ma journée',day:'mon objectif du jour',meal:'ce repas seulement'}[r.budget_kind];
    const mode=english?(r.weighing_mode==='cooked'?'Weights AFTER cooking (cooked).':'Weights BEFORE cooking (raw).'):(r.weighing_mode==='cooked'?'Poids APRÈS cuisson (cuits).':'Poids AVANT cuisson (crus).');
    return english?`Plan ${r.meals.length} meal(s): ${meals}. Budget: ${total} kcal (${kind}). ${mode}${r.must_include?' Include: '+r.must_include+'.':''}${r.avoid?' Never: '+r.avoid+'.':''}${notes?' '+notes:''}`:
      `Prépare ${r.meals.length} repas : ${meals}. Budget : ${total} kcal (${kind}). ${mode}${r.must_include?' À inclure : '+r.must_include+'.':''}${r.avoid?' Jamais : '+r.avoid+'.':''}${notes?' '+notes:''}`;
  }
  return {weightMeta,request,item,menu,inferState,prompt};
}
