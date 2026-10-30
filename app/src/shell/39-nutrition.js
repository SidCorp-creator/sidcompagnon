/* ---------- nutrition (calories et macros, calculés par Claude) ---------- */
// data.nutri = {profile, plan, menuPrefs, menu, upd, rev, log:[{id, day, at, grp, gname, gem, name, qty, em, kcal, p, c, f, upd}], weights:[{id, day, kg, upd}], weeks:[…]}
// Accès réservé (le reste des comptes voit l'onglet flouté « Bientôt disponible ») ; la fonction serveur vérifie aussi.
const nutriAllowed=()=>!!session; // v39 : pour tout le monde
function applySoon(){const on=!nutriAllowed();document.querySelectorAll(".soonable").forEach(sec=>{sec.classList.toggle("is-soon",on);sec.querySelector(".soon").hidden=!on})}
const NU=()=>{const n=data.nutri||(data.nutri={});if(!Array.isArray(n.log))n.log=[];if(!Array.isArray(n.weights))n.weights=[];if(!Array.isArray(n.weeks))n.weeks=[];return n};
let nuDay=iso(today()),nuEditing=false,nuDraft=null,nuPending=null,nuBusy="",nuEditId=null,nuPhoto=null;
const r0=x=>Math.round(+x||0),r1=x=>Math.round((+x||0)*10)/10;
const numIn=v=>{const n=parseFloat(String(v||"").replace(",",".").replace(/[^0-9.]/g,""));return isFinite(n)?n:0};
// « 1h30 », « 90 », « 1:30 », « 45 min » → minutes
function parseDur(v){v=String(v||"").toLowerCase().replace(/\s/g,"");if(!v)return 0;let m=v.match(/^(\d+)(?:h|:)(\d{0,2})/);if(m)return +m[1]*60+(+m[2]||0);m=v.match(/^(\d+)/);return m?+m[1]:0}
const fmtDur=m=>!m?"":m>=60?`${Math.floor(m/60)}h${m%60?two(m%60):""}`:`${m} min`;
const MAC=[["p","Protéines","--m-p"],["c","Glucides","--m-c"],["f","Lipides","--m-f"]];
/* v39 : plus de clé Claude de Sid. Le profil est calculé dans l'app ; les aliments déjà connus viennent de la mémoire partagée (gratuite) ;
   le reste (aliment inconnu, photo, menu, recette, bilan) est confié à l'IA de la personne, branchée par le connecteur (aiHandoff). */
const T3=(fr,en,nl)=>LANG==="en"?en:LANG==="nl"?nl:fr;
async function nuCall(kind,payload){payload=payload||{};
  if(!(await nuConsent()))throw new Error(L("Il faut ton accord pour utiliser Nutrition (données de santé)."));
  if(kind==="profil")return nuProfileLocal(payload.data||{});
  if(kind==="aliment"&&!payload.image&&String(payload.text||"").trim()){
    if(!navigator.onLine)throw new Error(L("Pas de connexion internet"));
    const j=await api("/functions/v1/nutrition",{method:"POST",token:await token(),body:{kind,lang:LANG,text:payload.text}});
    if(j&&j.result){j.result._src="memory";return j.result}}
  throw aiNeed(kind,payload)}
function aiNeed(kind,p){aiHandoff(aiPrompt(kind,p),"nutri",p&&p.image?{img:"data:image/jpeg;base64,"+p.image}:null);const e=new Error(L("Claude s'en charge : suis les étapes à l'écran, le résultat arrivera ici."));e.ai=true;return e}
// profil : métabolisme (Mifflin-St Jeor), dépense avec le sport, objectif selon le rythme, macros (mêmes règles prudentes qu'avant)
const SPORT_MET=[[/muscu|fitness|gym|halt|crossfit|weight|kracht/,5.5],[/course|running|jogg|run|lopen|hardlo/,9.8],[/v[eé]lo|cycl|bike|fiets|spinning/,7.5],[/nata|swim|zwem|piscine/,7],
  [/foot|basket|tennis|padel|hand|volley|rugby|hockey/,7],[/marche|walk|wandel|randon/,3.8],[/boxe|box|mma|judo|karat|combat|lutte/,9],[/yoga|pilates|stretch/,3],[/danse|dance|dans/,5.5]];
function nuProfileLocal(d){const w=+d.weight_kg||70,h=+d.height_cm||170,a=+d.age||30,male=d.sex==="male",goal=d.goal||"maintain";
  const bmr=Math.round(10*w+6.25*h-5*a+(male?5:-161));
  const sports=(d.sports||[]).map(x=>{const n=fold(x.sport||""),met=(SPORT_MET.find(([re])=>re.test(n))||[0,6])[1];return{sport:x.sport,kcal:Math.round(met*w*(+x.minutes_per_session||60)/60),freq:+x.times_per_week||0}});
  const tdee=Math.round(bmr*1.2+sports.reduce((s,x)=>s+x.kcal*x.freq,0)/7);
  const pace=d.pace||"realistic",PCT={lose:{drastic:.01,realistic:.006,relaxed:.0035},gain:{drastic:.005,realistic:.003,relaxed:.002}};
  const pct=goal==="maintain"?0:(PCT[goal]||PCT.lose)[pace]||PCT[goal].realistic,wk=Math.round(pct*w*100)/100,delta=Math.round(wk*7700/7);
  let target=goal==="lose"?tdee-delta:goal==="gain"?tdee+delta:tdee;if(goal==="lose")target=Math.max(target,bmr,male?1500:1200);target=Math.round(target);
  const p=Math.round(w*(goal==="lose"?2:goal==="gain"?1.8:1.6)),f=Math.round(Math.max(w*.8,target*.25/9)),c=Math.max(0,Math.round((target-p*4-f*9)/4));
  const warn=[];if(a<18)warn.push(T3("Moins de 18 ans : demande conseil à un médecin avant de changer ton alimentation.","Under 18: ask a doctor before changing your diet.","Jonger dan 18: vraag een arts om advies voor je je voeding verandert."));
  if(/enceinte|grossesse|allait|pregnan|breastfeed|zwanger|borstvoed|diab|trouble|anorex|boulim|eating disorder|eetstoornis/i.test(d.notes||""))warn.push(T3("Avec ce que tu indiques dans tes notes, demande l'avis d'un médecin ou d'un diététicien avant de suivre ces chiffres.","Given what you wrote in your notes, check with a doctor or dietitian before following these numbers.","Gezien wat je in je notities schreef: vraag een arts of diëtist om advies voor je deze cijfers volgt."));
  const tw=+d.target_weight_kg||0;let wg={realistic:true,weekly_change_kg:0,suggested_weeks:0,advice:""};
  if(tw){const diff=tw-w,dir=goal==="lose"?-1:goal==="gain"?1:0,weeks=wk?Math.ceil(Math.abs(diff)/wk):0,tf=+d.timeframe_weeks||0;
    if(dir&&Math.sign(diff)!==dir&&diff)wg={realistic:false,weekly_change_kg:dir*wk,suggested_weeks:0,advice:T3("Ce poids visé va dans le sens contraire de ton objectif : vérifie l'un des deux.","This target weight goes against your goal: check one of them.","Dit streefgewicht gaat tegen je doel in: controleer een van beide.")};
    else{const max=goal==="gain"?.005:.01,ok=!tf||Math.abs(diff)/tf<=max*w+1e-9;
      wg={realistic:ok,weekly_change_kg:dir*wk,suggested_weeks:weeks,advice:ok?T3(`À ce rythme (environ ${wk} kg par semaine), compte à peu près ${weeks} semaines. Tu peux y arriver !`,`At this pace (about ${wk} kg a week), count roughly ${weeks} weeks. You can do it!`,`In dit tempo (ongeveer ${wk} kg per week) reken je op zo'n ${weeks} weken. Dat lukt je!`)
        :T3(`En ${tf} semaines, il faudrait changer de plus de ${Math.round(max*w*10)/10} kg par semaine : c'est trop rapide pour rester en bonne santé. Compte plutôt ${weeks} semaines.`,`In ${tf} weeks you would need to change more than ${Math.round(max*w*10)/10} kg a week: too fast to stay healthy. Plan for about ${weeks} weeks instead.`,`In ${tf} weken zou je meer dan ${Math.round(max*w*10)/10} kg per week moeten veranderen: te snel om gezond te blijven. Reken eerder op ${weeks} weken.`)}}}
  const gl=T3({lose:"perdre du poids",gain:"prendre du poids",maintain:"garder ton poids"}[goal],{lose:"lose weight",gain:"gain weight",maintain:"keep your weight"}[goal],{lose:"af te vallen",gain:"aan te komen",maintain:"je gewicht te behouden"}[goal]);
  const explanation=T3(`Ton corps brûle environ ${bmr} kcal par jour au repos (formule de Mifflin-St Jeor). Avec ta vie de tous les jours et ton sport, tu dépenses environ ${tdee} kcal par jour. Pour ${gl}, vise ${target} kcal par jour${goal==="maintain"?"":` (environ ${wk} kg par semaine)`}. Protéines ${p} g, glucides ${c} g, lipides ${f} g : de quoi garder tes muscles et ton énergie.`,
    `Your body burns about ${bmr} kcal a day at rest (Mifflin-St Jeor formula). With daily life and your sport, you spend about ${tdee} kcal a day. To ${gl}, aim for ${target} kcal a day${goal==="maintain"?"":` (about ${wk} kg a week)`}. Protein ${p} g, carbs ${c} g, fat ${f} g: enough to keep your muscles and energy.`,
    `Je lichaam verbrandt in rust ongeveer ${bmr} kcal per dag (formule van Mifflin-St Jeor). Met je dagelijkse leven en je sport verbruik je ongeveer ${tdee} kcal per dag. Om ${gl}, mik op ${target} kcal per dag${goal==="maintain"?"":` (ongeveer ${wk} kg per week)`}. Eiwitten ${p} g, koolhydraten ${c} g, vetten ${f} g: genoeg om je spieren en energie te behouden.`);
  return {bmr_kcal:bmr,tdee_kcal:tdee,target_kcal:target,protein_g:p,carbs_g:c,fat_g:f,explanation,warnings:warn,weight_goal:wg,sports_kcal:sports.map(x=>({sport:x.sport,kcal_per_session:x.kcal}))}}
// ce qu'on demande à l'IA de la personne (elle lit et écrit dans Sid'note grâce au connecteur)
function aiPrompt(kind,p){const d=(p&&p.data)||{};
  if(kind==="aliment")return aiPrompt0(kind,p)+nuDayNote();
  return aiPrompt0(kind,p)}
// v44.4 : repas d'un jour passé → la date est dite à Claude (sinon il note le repas aujourd'hui)
function nuDayNote(){if(nuDay>=iso(today()))return "";const d=parse(nuDay),txt=`${DOWL[d.getDay()]} ${d.getDate()} ${MOL[d.getMonth()].toLowerCase()}`;
  return T3(` C'était le ${txt} : note-le à la date ${nuDay} (pas aujourd'hui).`,` It was on ${nuDay}: log it on that date (not today).`,` Het was op ${nuDay}: noteer het op die datum (niet vandaag).`)}
function aiPrompt0(kind,p){const d=(p&&p.data)||{};
  if(kind==="aliment"&&p.image)return T3("Je t'envoie la photo de mon assiette (je la joins). Estime ce que j'ai mangé et note-le dans Sid'note.","I'm sending you a photo of my plate (attached). Estimate what I ate and log it in Sid'note.","Ik stuur je een foto van mijn bord (bijgevoegd). Schat wat ik gegeten heb en noteer het in Sid'note.");
  if(kind==="aliment")return T3(`Note dans Sid'note ce que j'ai mangé : ${p.text}`,`Log in Sid'note what I ate: ${p.text}`,`Noteer in Sid'note wat ik gegeten heb: ${p.text}`);
  if(kind==="menu"){const meals=(d.meals||[]).map(m=>`${m.name} (~${m.kcal} kcal)`).join(", "),inc=d.must_include,exc=d.avoid;
    return T3(`Avec Sid'note : lis ma journée nutrition, puis compose-moi ${(d.meals||[]).length>1?"un menu pour la journée":"un repas"} : ${meals}.${inc?` À inclure : ${inc}.`:""}${exc?` À éviter : ${exc}.`:""}${d.notes?` ${d.notes}`:""} Poids crus en grammes, puis enregistre le menu dans Sid'note.`,
      `With Sid'note: read my nutrition day, then make me ${(d.meals||[]).length>1?"a menu for the day":"a meal"}: ${meals}.${inc?` Include: ${inc}.`:""}${exc?` Avoid: ${exc}.`:""}${d.notes?` ${d.notes}`:""} Raw weights in grams, then save the menu in Sid'note.`,
      `Met Sid'note: lees mijn voedingsdag en stel ${(d.meals||[]).length>1?"een dagmenu":"een maaltijd"} voor me samen: ${meals}.${inc?` Opnemen: ${inc}.`:""}${exc?` Vermijden: ${exc}.`:""}${d.notes?` ${d.notes}`:""} Rauwe gewichten in gram, en sla het menu op in Sid'note.`)}
  if(kind==="recette"){const f=(d.foods||[]).map(x=>`${x.food}${x.grams?` ${x.grams} g`:""}`).join(", ");
    return T3(`Avec Sid'note : donne-moi la recette de « ${d.name} » (${f}), avec exactement ces aliments et ces quantités, puis ajoute les étapes à ce repas dans mon menu Sid'note.`,`With Sid'note: give me the recipe for "${d.name}" (${f}) with exactly these foods and amounts, then add the steps to this meal in my Sid'note menu.`,`Met Sid'note: geef me het recept voor "${d.name}" (${f}) met precies deze ingrediënten en hoeveelheden, en voeg de stappen toe aan deze maaltijd in mijn Sid'note-menu.`)}
  if(kind==="bilan")return p.scope==="week"?T3("Avec Sid'note : fais le bilan nutrition de ma semaine (calories, macros, poids) : ce qui va bien, ce qui peut s'améliorer, et 2 ou 3 conseils concrets. Puis enregistre ce commentaire dans Sid'note pour que je le voie dans l'app.","With Sid'note: review my nutrition week (calories, macros, weight): what went well, what could improve, and 2 or 3 concrete tips. Then save this review in Sid'note so I can see it in the app.","Met Sid'note: maak een voedingsoverzicht van mijn week (calorieën, macro's, gewicht): wat goed ging, wat beter kan, en 2 of 3 concrete tips. Sla dit overzicht daarna op in Sid'note zodat ik het in de app zie.")
    :T3("Avec Sid'note : commente ma journée nutrition d'aujourd'hui et donne-moi 1 ou 2 conseils pour la suite. Puis enregistre ce commentaire dans Sid'note pour que je le voie dans l'app.","With Sid'note: comment on my nutrition today and give me 1 or 2 tips for the rest of the day. Then save this comment in Sid'note so I can see it in the app.","Met Sid'note: geef commentaar op mijn voedingsdag van vandaag en 1 of 2 tips voor de rest van de dag. Sla dit commentaar daarna op in Sid'note zodat ik het in de app zie.");
  return T3("Avec Sid'note : aide-moi pour ma nutrition.","With Sid'note: help me with my nutrition.","Met Sid'note: help me met mijn voeding.")}
const nuErrMsg=ex=>ex instanceof TypeError?L("Pas de connexion internet"):ex.status===404?L("La fonction « nutrition » n'est pas encore installée sur Supabase."):ex.message;
// animation pendant que Claude travaille
function nuLoading(el,msgs){const EM=[""];let i=0;
  el.innerHTML=`<div class="loadcard" role="status"><div class="load-em">${EM[0]}</div><div class="load-msg">${L(msgs[0])}</div><div class="load-bar"><i></i></div><div class="shim"></div><div class="shim" style="width:70%"></div></div>`;
  const t=setInterval(()=>{i++;const e=el.querySelector(".load-em"),m=el.querySelector(".load-msg");if(!e){clearInterval(t);return}e.textContent=EM[i%EM.length];m.textContent=L(msgs[i%msgs.length])},1300);
  return()=>clearInterval(t)}
// --- profil ---
function nuFillForm(){
  const p=NU().profile||{};nuDraft={sex:p.sex||"",goal:p.goal||"",pace:p.pace||"real",sports:(p.sports||[]).map(x=>({name:x.name,freq:x.freq||"",dur:fmtDur(x.min)}))};
  $("nuAge").value=p.age||"";$("nuHeight").value=p.height||"";$("nuWeight").value=p.weight?String(p.weight).replace(".",LANG==="en"?".":","):"";$("nuNotes").value=p.notes||"";
  $("nuTarget").value=p.target?String(p.target).replace(".",LANG==="en"?".":","):"";$("nuDur").value=p.dur||"";$("nuDurU").value=p.durU||"m";
  if(!nuDraft.sports.length)nuDraft.sports.push({name:"",freq:"",dur:""});
  $("nuErr").hidden=true;nuDraftRender();
}
function nuDraftRender(){
  document.querySelectorAll("#nuSex button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.sex===nuDraft.sex));
  document.querySelectorAll("#nuGoal button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.goal===nuDraft.goal));
  document.querySelectorAll("#nuPace button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.pace===nuDraft.pace));
  $("nuPaceWrap").hidden=!nuDraft.goal||nuDraft.goal==="maintain";
  if(shIsl("nuSports")){try{window.SCIslands.nuSports($("nuSports"),{i18n:agI18n(),sports:nuDraft.sports.map(x=>({name:String(x.name||""),freq:String(x.freq||""),dur:String(x.dur||"")}))});
      $("nuSports").querySelectorAll("input").forEach(i=>{if(i!==document.activeElement&&i.value!==i.defaultValue)i.value=i.defaultValue});return}catch(e){reportErr("island nuSports: "+(e&&e.message))}} // champs hors saisie = valeur enregistrée (ex. après « × »)
  $("nuSports").innerHTML=nuDraft.sports.map((x,i)=>`<div class="nu-sport">
    <input class="nu-name" data-sp="${i}" data-f="name" value="${esc(x.name)}" placeholder="${L("Ex. Musculation")}" aria-label="${L("Sport")}" autocomplete="off">
    <button type="button" class="x" data-sprm="${i}" aria-label="${L("Retirer ce sport")}">×</button>
    <label class="nu-f"><span>${L("Fois par semaine")}</span><span class="nu-in"><input data-sp="${i}" data-f="freq" type="text" inputmode="numeric" maxlength="2" value="${esc(x.freq)}" autocomplete="off"><i>${L("/sem")}</i></span></label>
    <label class="nu-f"><span>${L("Durée d'une séance")}</span><span class="nu-in"><input data-sp="${i}" data-f="dur" type="text" maxlength="6" value="${esc(x.dur)}" placeholder="1h30" autocomplete="off"></span></label></div>`).join("");
}
$("nuSports").addEventListener("input",e=>{const i=e.target.dataset.sp;if(i!==undefined)nuDraft.sports[+i][e.target.dataset.f]=e.target.value});
$("nuSports").addEventListener("click",e=>{const b=e.target.closest("[data-sprm]");if(!b)return;nuDraft.sports.splice(+b.dataset.sprm,1);nuDraftRender()});
$("nuSportAdd").addEventListener("click",()=>{nuDraft.sports.push({name:"",freq:"",dur:""});nuDraftRender();const ins=$("nuSports").querySelectorAll('[data-f="name"]');ins[ins.length-1].focus()});
$("nuSex").addEventListener("click",e=>{const b=e.target.closest("[data-sex]");if(b){nuDraft.sex=b.dataset.sex;nuDraftRender()}});
$("nuGoal").addEventListener("click",e=>{const b=e.target.closest("[data-goal]");if(b){nuDraft.goal=b.dataset.goal;nuDraftRender()}});
$("nuPace").addEventListener("click",e=>{const b=e.target.closest("[data-pace]");if(b){nuDraft.pace=b.dataset.pace;nuDraftRender()}});
$("nuCancel").addEventListener("click",()=>{nuEditing=false;renderNutri()});
$("nuEditProfile").addEventListener("click",()=>{nuEditing=true;nuFillForm();
  // v31 : le délai est pré-rempli avec celui que l'analyse vient de conseiller (en semaines, ou en mois au-delà de 12 semaines)
  const n=NU(),wg=n.plan&&n.plan.wg;if(wg&&wg.weeks>0&&n.profile&&n.profile.target){const w=Math.round(wg.weeks);
    if(w>12){$("nuDur").value=String(Math.round(w/4.345));$("nuDurU").value="m"}else{$("nuDur").value=String(w);$("nuDurU").value="w"}}
  renderNutri();window.scrollTo(0,0)});
$("nuForm").addEventListener("submit",async e=>{
  e.preventDefault();if(nuBusy||!nutriAllowed())return;
  const fail=m=>{$("nuErr").textContent=L(m);$("nuErr").hidden=false;$("nuErr").scrollIntoView({block:"center"})};
  const age=numIn($("nuAge").value),height=numIn($("nuHeight").value),weight=numIn($("nuWeight").value);
  if(!nuDraft.sex)return fail("Indique ton sexe.");
  if(!(age>=10&&age<=100))return fail("Indique ton âge.");
  if(!(height>=100&&height<=250))return fail("Indique ta taille en cm.");
  if(!(weight>=25&&weight<=300))return fail("Indique ton poids en kg.");
  if(!nuDraft.goal)return fail("Choisis ton objectif.");
  const keep=nuDraft.goal!=="maintain",target=keep?numIn($("nuTarget").value):0,dur=keep&&target?Math.round(numIn($("nuDur").value)):0,durU=$("nuDurU").value;
  if(target&&!(target>=30&&target<=300))return fail("Indique un poids visé en kg.");
  const weeks=dur?Math.round((durU==="m"?dur*4.35:dur)*10)/10:0;
  const sports=nuDraft.sports.map(x=>({name:String(x.name||"").trim(),freq:Math.round(numIn(x.freq)),min:parseDur(x.dur)})).filter(x=>x.name);
  const profile={sex:nuDraft.sex,age,height,weight,sports,goal:nuDraft.goal,pace:keep?nuDraft.pace:"",target,dur,durU,notes:$("nuNotes").value.trim().slice(0,800)};
  $("nuErr").hidden=true;nuBusy="profil";const btn=$("nuCalc");btn.disabled=true;btn.hidden=true;
  const box=document.createElement("div");btn.after(box);const stop=nuLoading(box,["Calcul de ton métabolisme…","Prise en compte de tes sports…","Calcul de tes macros…"]);
  try{
    const r=await nuCall("profil",{data:{sex:profile.sex==="h"?"male":"female",age,height_cm:height,weight_kg:weight,
      sports:sports.map(x=>({sport:x.name,times_per_week:x.freq,minutes_per_session:x.min})),goal:profile.goal,pace:{fast:"drastic",real:"realistic",easy:"relaxed"}[profile.pace]||null,
      target_weight_kg:target||null,timeframe_weeks:weeks||null,notes:profile.notes}});
    const n=NU();n.profile=profile;n.plan={bmr:r0(r.bmr_kcal),tdee:r0(r.tdee_kcal),kcal:r0(r.target_kcal),p:r0(r.protein_g),c:r0(r.carbs_g),f:r0(r.fat_g),
      text:String(r.explanation||""),warn:(r.warnings||[]).map(String),at:new Date().toISOString()};
    n.plan.kps={};(r.sports_kcal||[]).forEach(x=>{if(x&&x.sport)n.plan.kps[norm(x.sport)]=r0(x.kcal_per_session)});
    const wg=r.weight_goal||{};if(target)n.plan.wg={ok:wg.realistic!==false,wk:r1(wg.weekly_change_kg),weeks:r0(wg.suggested_weeks),advice:String(wg.advice||"")};
    // le poids du profil devient la première mesure du graphique
    if(!n.weights.some(w=>w.day===iso(today())))n.weights.push({id:uid(),day:iso(today()),kg:weight,upd:Date.now()});
    n.upd=Date.now();nuEditing=false;save();renderNutri();window.scrollTo(0,0);toast("Tes besoins sont calculés");
  }catch(ex){fail(nuErrMsg(ex))}
  stop();box.remove();nuBusy="";btn.disabled=false;btn.hidden=false;
});
// --- sport de la semaine : le nombre de séances peut changer d'une semaine à l'autre, l'objectif suit ---
// plan.kps = calories d'une séance par sport (donné par Claude) ; à défaut, estimation simple (6 MET × poids × durée)
const sportKps=()=>{const n=NU(),pl=n.plan||{},p=n.profile||{},m={};(p.sports||[]).forEach(s=>{const c=(pl.kps||{})[norm(s.name)];m[s.name]=c||Math.round(6*(p.weight||70)*((s.min||60)/60))});return m};
const wKey=d=>iso(mondayOf(parse(d)));
function weekSports(wk){const n=NU(),p=n.profile||{},o=(n.wsports||{})[wk]||{},k=sportKps();
  return (p.sports||[]).map(s=>({name:s.name,base:s.freq||0,count:o[s.name]!=null?o[s.name]:(s.freq||0),kps:k[s.name]||0}))}
function dayTarget(d){const pl=NU().plan||{},delta=Math.round(weekSports(wKey(d)).reduce((a,s)=>a+(s.count-s.base)*s.kps,0)/7);
  return{kcal:(pl.kcal||0)+delta,p:pl.p||0,c:Math.max(0,(pl.c||0)+Math.round(delta/4)),f:pl.f||0,delta}}
// v56 (#3) : plats, résultat d'analyse et sport de la semaine dessinés par React (app/src/Nutrition.tsx)
const nuIsl=k=>!!(window.SCIslands&&window.SCIslands[k]&&!window.__noIslands);
const NU_MAC=()=>MAC.map(([k,label,c])=>({k,label,c}));
const qtyVM=(key,x)=>({key,label:qtyTxt(x)||"",value:x.qty||"",editing:qtyEd===key});
function renderNuWeek(){
  const ws=weekSports(wKey(nuDay)),el=$("nuWeek");el.hidden=!ws.length;if(!ws.length)return;
  const m=parse(wKey(nuDay)),e=new Date(m);e.setDate(e.getDate()+6),t=dayTarget(nuDay);
  if(nuIsl("nuWeek")){try{window.SCIslands.nuWeek(el,{sports:ws.map(s=>({name:s.name,kps:s.kps,count:s.count,base:s.base})),range:`${m.getDate()} ${MO[m.getMonth()]} – ${e.getDate()} ${MO[e.getMonth()]}`,
    target:fmtFull(t.kcal),delta:t.delta||0,actIcon:IC("activity"),i18n:agI18n()});return}catch(x){reportErr("island nuWeek: "+(x&&x.message))}}
  el.innerHTML=`<div class="nu-week-h"><b>${IC("activity")} ${L("Ton sport cette semaine")}</b><span class="small muted">${m.getDate()} ${MO[m.getMonth()]} – ${e.getDate()} ${MO[e.getMonth()]}</span></div>`+
    ws.map(s=>`<div class="nu-wsp"><div class="grow"><b class="notr">${esc(s.name)}</b><span class="small muted">≈ ${s.kps} kcal ${L("par séance")}${s.count!==s.base?` · ${L("d'habitude")} ${s.base}`:""}</span></div><div class="stepper"><button type="button" data-ws="${esc(s.name)}" data-d="-1" aria-label="${L("Une séance de moins")}">−</button><output>${s.count}</output><button type="button" data-ws="${esc(s.name)}" data-d="1" aria-label="${L("Une séance de plus")}">+</button></div></div>`).join("")+
    `<div class="small">${L("Objectif par jour cette semaine")} : <b>${fmtFull(t.kcal)} kcal</b>${t.delta?` <span class="muted">(${t.delta>0?"+":""}${t.delta} ${L("selon ton sport")})</span>`:""}</div>`;
}
$("nuWeek").addEventListener("click",e=>{const b=e.target.closest("[data-ws]");if(!b)return;const n=NU(),wk=wKey(nuDay);n.wsports=n.wsports||{};const o=n.wsports[wk]=n.wsports[wk]||{};
  const cur=weekSports(wk).find(s=>s.name===b.dataset.ws);if(!cur)return;o[cur.name]=Math.max(0,Math.min(21,cur.count+ +b.dataset.d));n.upd=Date.now();save();renderNutri()});
// --- journée ---
const dayLog=d=>NU().log.filter(x=>x.day===d).sort((a,b)=>(a.at||"").localeCompare(b.at||""));
const sumOf=list=>list.reduce((s,x)=>({kcal:s.kcal+(+x.kcal||0),p:s.p+(+x.p||0),c:s.c+(+x.c||0),f:s.f+(+x.f||0)}),{kcal:0,p:0,c:0,f:0});
function nuDayLabel(d){const t=iso(today()),dt=parse(d),y=new Date(today());y.setDate(y.getDate()-1);
  if(d===t)return L("Aujourd'hui");if(d===iso(y))return L("Hier");return `${DOW[dt.getDay()]} ${dt.getDate()} ${MO[dt.getMonth()]}`}
// barre et pastilles de macros d'un plat
function macroHtml(s){const tot=(s.p*4+s.c*4+s.f*9)||1;
  return `<div class="mbar" aria-hidden="true">${MAC.map(([k,,v])=>`<i style="--c:var(${v});width:${(k==="f"?9:4)*s[k]/tot*100}%"></i>`).join("")}</div>
    <div class="mchips">${MAC.map(([k,l,v])=>`<span class="mchip"><b>${r1(s[k])} g</b><span><span class="mdot" style="--c:var(${v})"></span>${L(l)}</span></span>`).join("")}</div>`}
const thumbs=new Map();
const thumbKey=g=>session.user.id+":thumb:"+g;
async function loadThumb(g){if(thumbs.has(g))return;thumbs.set(g,null);const b=await idb.get(thumbKey(g));if(b){thumbs.set(g,b);
  if(nuIsl("nuLog")&&$("nuLog")._isl){nuLogDraw();return} // React dessine la vignette (on ne touche pas à son DOM)
  document.querySelectorAll(`[data-thumb="${g}"]`).forEach(el=>el.innerHTML=`<img src="${b}" alt="">`)}}
// barres des macros (ancien rendu, gardé en secours de la version React)
function nuMacrosHtml(s,tg){return MAC.map(([k,l,v])=>`<div class="nu-m"><div class="top"><b><span class="mdot" style="--c:var(${v})"></span>${L(l)}</b><span>${r0(s[k])} / ${tg[k]} g</span></div><div class="bar"><i style="--c:var(${v});width:${Math.min(100,tg[k]?s[k]/tg[k]*100:0)}%"></i></div></div>`).join("");}
function renderNutri(){try{renderAiCards()}catch(e){}
  if(!$("nuMain"))return;
  applySoon();
  const n=NU(),has=!!(n.plan&&n.plan.kcal);
  $("nuProfile").hidden=has&&!nuEditing;$("nuMain").hidden=!has||nuEditing;$("nuCancel").hidden=!has;
  $("nuProfSub").textContent=L(has?"Modifie tes infos : tes besoins sont recalculés.":"Présente-toi en quelques infos : on calcule ton métabolisme, tes besoins du jour et tes macros.");
  if(!has||nuEditing){if(!nuDraft)nuFillForm();return}
  const pl=n.plan,list=dayLog(nuDay),s=sumOf(list),tg=dayTarget(nuDay);
  if(nuIsl("nuGoal")){try{window.SCIslands.nuGoal($("nuGoalCard"),{g:nuGoalVM(true),alert:IC("alert"),i18n:agI18n()})}catch(e){reportErr("island nuGoal: "+(e&&e.message));$("nuGoalCard").innerHTML=nuGoalHtml()}}
  else $("nuGoalCard").innerHTML=nuGoalHtml();$("nuGoalCard").hidden=!pl.wg||(pl.wg.ok&&pl.wgSeen);$("nuGoalCard").classList.toggle("ok",!!(pl.wg&&pl.wg.ok));
  $("nuDayTxt").textContent=nuDayLabel(nuDay);$("nuDate").value=nuDay;$("nuNext").disabled=nuDay>=iso(today());renderNuCal();
  // v44.4 : le jour du repas se choisit aussi dans « Ajouter ce que tu manges » (jours passés)
  $("nuForTxt").textContent=nuDayLabel(nuDay);$("nuForDate").value=nuDay;$("nuForDate").max=iso(today());$("nuForNext").disabled=nuDay>=iso(today());$("nuFor").classList.toggle("past",nuDay<iso(today()));
  const pct=Math.min(1,s.kcal/tg.kcal);$("nuRing").style.strokeDashoffset=326.73*(1-pct);
  $("nuRing").closest(".nu-ring").classList.toggle("over",s.kcal>tg.kcal*1.05);
  $("nuKcal").textContent=r0(s.kcal);
  if(shIsl("nuKcalOf")){try{window.SCIslands.nuKcalOf($("nuKcalOf"),{target:tg.kcal,over:s.kcal>tg.kcal?r0(s.kcal-tg.kcal):0,left:r0(tg.kcal-s.kcal),i18n:agI18n()})}catch(e){reportErr("island nuKcalOf: "+(e&&e.message))}}
  else $("nuKcalOf").innerHTML=`${L("sur")} ${tg.kcal} kcal<br>`+(s.kcal>tg.kcal?`<b style="color:var(--late)">+${r0(s.kcal-tg.kcal)}</b>`:`${L("reste")} ${r0(tg.kcal-s.kcal)}`);
  // v52 (ticket #3) : barres des macros dessinées par React (app/src/Small.tsx) ; ancien rendu en secours
  if(window.SCIslands&&window.SCIslands.nuMacros&&!window.__noIslands){try{window.SCIslands.nuMacros($("nuMacros"),{rows:MAC.map(([k,l,v])=>({k,label:l,c:v,val:s[k],target:tg[k]})),i18n:{L,MOL,MO,DOWL}})}catch(e){reportErr("island nuMacros: "+(e&&e.message));$("nuMacros").innerHTML=nuMacrosHtml(s,tg)}}
  else $("nuMacros").innerHTML=nuMacrosHtml(s,tg);
  $("nuLogH").textContent=nuDay===iso(today())?L("Ma journée"):L("Ce jour-là");
  // plats du jour : une carte par plat, ses aliments dedans
  const groups=[];list.forEach(x=>{const g=x.grp||x.id;let G=groups.find(y=>y.g===g);if(!G){G={g,items:[],name:x.gname||x.name,em:x.gem||x.em||"🍽️",at:x.at};groups.push(G)}G.items.push(x)});
  $("nuLog")._isl=false;
  if(nuIsl("nuLog")){try{nuLogDraw(groups);groups.forEach(G=>loadThumb(G.g));renderNuResult();renderNuPlan();renderNuMenu();renderMenuForm();renderNuWeek();renderMenuLeft();nuShowTab();
    if(qtyEd){const i=$("qtyEdIn");if(i&&document.activeElement!==i){i.focus();i.select()}}return}catch(x){reportErr("island nuLog: "+(x&&x.message))}}
  $("nuLog").innerHTML=groups.length?groups.map(G=>{const t=sumOf(G.items),d=new Date(G.at);
    return `<details class="dish" open><summary class="dish-h"><span class="dish-ic" data-thumb="${G.g}">${mono(G.name)}</span>
      <span class="dish-t"><b class="notr">${esc(G.name)}</b><span class="dish-time">${two(d.getHours())}:${two(d.getMinutes())}</span>${G.items.length>1?` <span class="small muted">· ${G.items.length} ${L("aliments")}</span>`:""}</span>
      <span class="dish-kcal">${r0(t.kcal)}<small>kcal</small></span><button type="button" class="pen nu-cp" data-nucopy="${G.g}" aria-label="${L("Copier ce repas sur d'autres jours")}" title="${L("Copier sur d'autres jours")}">+</button>${G.items.length===1?`<button class="pen" data-nuedit="${G.items[0].id}" aria-label="${L("Modifier")}">${PEN}</button>`:""}<button type="button" class="x" data-nudelg="${G.g}" aria-label="${L("Supprimer ce plat")}">×</button></summary>
      ${macroHtml(t)}${G.items.length===1?`<div class="dish-note">${qtyCell("log:"+G.items[0].id,G.items[0])}</div>`:`<div class="dish-items">${G.items.map(x=>`<div class="dish-it"><span class="em">·</span><div class="grow"><b class="notr">${esc(x.name)}</b>${qtyCell("log:"+x.id,x)}</div><span class="k">${r0(x.kcal)} kcal</span><button class="pen" data-nuedit="${x.id}" aria-label="${L("Modifier")}">${PEN}</button><button class="x" data-nudel="${x.id}" aria-label="${L("Supprimer")}">×</button></div>`).join("")}</div>`}</details>`}).join("")
    :`<div class="card"><div class="empty">${L(nuDay===iso(today())?"Rien pour l'instant. Écris ce que tu manges ci-dessus, ou prends ton plat en photo.":"Rien d'enregistré ce jour-là. Tu peux encore le compléter.")}</div></div>`;
  groups.forEach(G=>loadThumb(G.g));
  renderNuResult();renderNuPlan();renderNuMenu();renderMenuForm();renderNuWeek();renderMenuLeft();nuShowTab();
  if(qtyEd){const i=$("qtyEdIn");if(i&&document.activeElement!==i){i.focus();i.select()}}
}
// trois onglets : la journée, les menus, le profil (on se souvient du dernier ouvert)
function nuShowTab(){const t=data.ui.nuTab||"day";
  document.querySelectorAll("#nuTabs [data-nutab]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.nutab===t));
  document.querySelectorAll("#nuMain [data-nupane]").forEach(p=>p.hidden=p.dataset.nupane!==t)}
function nuGoTab(t){data.ui.nuTab=t;saveUI();nuShowTab();const tb=$("nuTabs");if(tb.getBoundingClientRect().top<0)tb.scrollIntoView({block:"start"})}
$("nuTabs").addEventListener("click",e=>{const b=e.target.closest("[data-nutab]");if(b)nuGoTab(b.dataset.nutab)});
$("nuMain").addEventListener("click",e=>{const b=e.target.closest("[data-nugo]");if(b)nuGoTab(b.dataset.nugo)});
// --- quantité modifiable directement (journée et analyse) : calories et macros suivent ---
let qtyEd=null;
function qtyCell(key,x){
  if(qtyEd===key)return `<span class="qty-in"><input id="qtyEdIn" value="${esc(x.qty||"")}" placeholder="${L("Ex. 150 g")}" aria-label="${L("Quantité")}" autocomplete="off" enterkeyhint="done"><button type="button" class="mini" data-qok="${key}">OK</button></span>`;
  return `<button type="button" class="qty-ed notr" data-qed="${key}">${esc(qtyTxt(x)||L("Ajouter une quantité"))} ✎</button>`}
// « 2 c. à soupe » d'huile → grammes ; « 150 g » → 150 ; sinon le premier nombre
function toGrams(name,t){t=String(t||"").toLowerCase().replace(",",".");
  const sp=t.match(/(\d+(?:\.\d+)?)\s*(?:c\.?|cuill[eè]res?)\s*(?:à|a)?\s*(soupe|s\b|caf[ée]|c\b)/),S=SPOONS.find(([re])=>re.test(name||""));
  if(sp&&S)return +sp[1]*(/^s/.test(sp[2])?S[1]:S[2]);const g=t.match(/(\d+(?:\.\d+)?)\s*g\b/);return g?+g[1]:0}
function scaleQty(x,q){const a=toGrams(x.name,x.qty),b=toGrams(x.name,q),k=a>0&&b>0?b/a:(qtyNum(x.qty)>0&&qtyNum(q)>0?qtyNum(q)/qtyNum(x.qty):0);
  x.qty=q;if(x.g&&b)x.g=r0(b);if(!k){if(q)toast("Quantité sans chiffre : calories inchangées");return}
  x.kcal=r0(x.kcal*k);x.p=r1(x.p*k);x.c=r1(x.c*k);x.f=r1(x.f*k)}
function qtyCommit(key){const inp=$("qtyEdIn");if(!inp){qtyEd=null;return}const q=inp.value.trim(),[kind,id]=key.split(":");qtyEd=null;
  if(kind==="log"){const x=NU().log.find(e=>e.id===id);if(x&&q!==x.qty){scaleQty(x,q);x.upd=Date.now();save();toast("Quantité mise à jour")}renderNutri()}
  else if(nuPending){const x=nuPending.items[+id];if(x&&q!==x.qty)scaleQty(x,q);renderNuResult()}}
["nuLog","nuResult"].forEach(id=>{$(id).addEventListener("click",e=>{const b=e.target.closest("[data-qed],[data-qok]");if(!b)return;e.preventDefault();e.stopPropagation();
    if(b.dataset.qok){qtyCommit(b.dataset.qok);return}if(qtyEd)qtyCommit(qtyEd);qtyEd=b.dataset.qed;if(id==="nuLog")renderNutri();else{renderNuResult();const i=$("qtyEdIn");if(i){i.focus();i.select()}}},true);
  $(id).addEventListener("keydown",e=>{if(e.target.id==="qtyEdIn"&&e.key==="Enter"){e.preventDefault();qtyCommit(qtyEd)}else if(e.target.id==="qtyEdIn"&&e.key==="Escape"){qtyEd=null;id==="nuLog"?renderNutri():renderNuResult()}})});
// objectif de poids : chemin conseillé, et alerte si le délai choisi n'est pas réaliste
// objectif de poids pour React (mêmes textes que nuGoalHtml)
function nuGoalVM(button){const n=NU(),pl=n.plan,p=n.profile||{},w=pl&&pl.wg;if(!w||!p.target)return null;
  const unit=p.durU==="m"?(LANG==="en"?(p.dur>1?"months":"month"):LANG==="nl"?(p.dur>1?"maanden":"maand"):"mois"):L(p.dur>1?"semaines":"semaine");
  const pace=w.wk?`${w.wk>0?"+":""}${String(w.wk).replace(".",LANG==="en"?".":",")} kg ${L("par semaine")}`:"";
  const PACE={fast:"Drastique",real:"Réaliste",easy:"À mon aise"}[p.pace];
  return{ok:!!w.ok,head:`${p.weight} → ${p.target} kg${p.dur?` ${L("en")} ${p.dur} ${unit}`:""}`,pace:PACE?`${L("Rythme")} : ${L(PACE)}`:"",real:p.dur?L(w.ok?"Ton délai est réaliste.":"Ce délai n'est pas réaliste, ni bon pour ta santé."):"",
    advice:w.advice||"",path:pace||w.weeks?` ${pace}${pace&&w.weeks?" · ":""}${w.weeks?`${L("environ")} ${w.weeks} ${L("semaines")}`:""}`:"",button}}
function nuGoalHtml(){
  const n=NU(),pl=n.plan,p=n.profile||{},w=pl&&pl.wg;if(!w||!p.target)return"";
  const unit=p.durU==="m"?(LANG==="en"?(p.dur>1?"months":"month"):LANG==="nl"?(p.dur>1?"maanden":"maand"):"mois"):L(p.dur>1?"semaines":"semaine");
  const pace=w.wk?`${w.wk>0?"+":""}${String(w.wk).replace(".",LANG==="en"?".":",")} kg ${L("par semaine")}`:"";
  const PACE={fast:"Drastique",real:"Réaliste",easy:"À mon aise"}[p.pace];
  return `<b>${w.ok?"✓ ":IC("alert")+" "}${p.weight} → ${p.target} kg${p.dur?` ${L("en")} ${p.dur} ${unit}`:""}</b>
    ${PACE?`<span class="small">${L("Rythme")} : ${L(PACE)}</span>`:""}
    ${p.dur?`<span class="small">${L(w.ok?"Ton délai est réaliste.":"Ce délai n'est pas réaliste, ni bon pour ta santé.")}</span>`:""}
    ${w.advice?`<span class="small muted notr">${esc(w.advice)}</span>`:""}
    ${pace||w.weeks?`<span class="small"><b>${L("Chemin conseillé")} :</b> ${pace}${pace&&w.weeks?" · ":""}${w.weeks?`${L("environ")} ${w.weeks} ${L("semaines")}`:""}</span>`:""}
    ${w.ok?`<button type="button" class="mini" data-nugoalok="1" style="justify-self:start;margin-top:4px">${L("OK, compris")}</button>`:`<button type="button" class="mini" data-nugoaledit="1" style="justify-self:start;margin-top:4px">${L("Changer mon objectif")}</button>`}`;
}
$("nuGoalCard").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;
  if(b.dataset.nugoalok){NU().plan.wgSeen=true;save();renderNutri()}
  else if(b.dataset.nugoaledit){nuEditing=true;nuFillForm();renderNutri();window.scrollTo(0,0);setTimeout(()=>$("nuTarget").focus(),100)}});
const boxes=(items)=>`<div class="nu-plan ${items.length===4?"four":""}">${items.map(([v,l,c])=>`<div><b>${v}</b><span>${c?`<span class="mdot" style="--c:var(${c})"></span>`:""}${L(l)}</span></div>`).join("")}</div>`;
function renderNuPlan(){
  const pl=NU().plan;if(!pl)return;
  if(nuIsl("nuPlan")){try{window.SCIslands.nuPlan($("nuPlan"),{alert:IC("alert"),i18n:agI18n(),pl:{bmr:pl.bmr,tdee:pl.tdee,kcal:pl.kcal,p:pl.p,c:pl.c,f:pl.f,text:pl.text||"",warn:pl.warn||[],goal:pl.wg?nuGoalVM(false):null}});return}
    catch(e){reportErr("island nuPlan: "+(e&&e.message))}}
  $("nuPlan").innerHTML=boxes([[pl.bmr,"Métabolisme de base"],[pl.tdee,"Dépense du jour"],[pl.kcal,"Objectif (kcal)"]])+
    boxes([[pl.p+" g","Protéines","--m-p"],[pl.c+" g","Glucides","--m-c"],[pl.f+" g","Lipides","--m-f"]])+
    `${pl.wg?`<div class="card nu-goalcard ${pl.wg.ok?"ok":""}" style="background:var(--bg)">${nuGoalHtml().replace(/<button[^>]*>.*?<\/button>/,"")}</div>`:""}
    <p class="small notr" style="margin:0 4px">${esc(pl.text)}</p>${pl.warn.map(w=>`<div class="nu-warn notr">${esc(w)}</div>`).join("")}`;
}
function nuSetDay(d){nuDay=d>iso(today())?iso(today()):d;nuPending=null;renderNutri()}
$("nuFor").addEventListener("click",e=>{const b=e.target.closest("[data-nufor]");if(!b)return;const d=parse(nuDay);d.setDate(d.getDate()+ +b.dataset.nufor);nuSetDay(iso(d))});
$("nuForDate").addEventListener("change",e=>{if(e.target.value)nuSetDay(e.target.value)});
$("nuPrev").addEventListener("click",()=>{const d=parse(nuDay);d.setDate(d.getDate()-1);nuSetDay(iso(d))});
$("nuNext").addEventListener("click",()=>{const d=parse(nuDay);d.setDate(d.getDate()+1);nuSetDay(iso(d))});
$("nuDate").addEventListener("change",e=>{if(e.target.value)nuSetDay(e.target.value)});
// heure de l'entrée : maintenant si c'est aujourd'hui, sinon midi (modifiable)
const nuAt=(time)=>{const d=parse(nuDay),now=new Date();
  if(time){const[h,m]=time.split(":").map(Number);d.setHours(h,m)}else if(nuDay===iso(today()))d.setHours(now.getHours(),now.getMinutes());else d.setHours(12,0);
  return d.toISOString()};
// champ qui s'agrandit en écrivant
const grow=t=>{t.style.height="auto";t.style.height=Math.max(56,t.scrollHeight+2)+"px"};
$("nuAsk").addEventListener("input",e=>grow(e.target));
$("nuAsk").addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();$("nuAskForm").requestSubmit()}});
// photo du plat : réduite (1280 px) pour l'envoi, et une vignette gardée sur l'appareil
function shrink(file,max,q){return new Promise((res,rej)=>{const u=URL.createObjectURL(file),im=new Image();
  im.onload=()=>{const k=Math.min(1,max/Math.max(im.naturalWidth,im.naturalHeight)),c=document.createElement("canvas");c.width=Math.round(im.naturalWidth*k);c.height=Math.round(im.naturalHeight*k);
    const g=c.getContext("2d");g.imageSmoothingQuality="high";g.drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);res(c.toDataURL("image/jpeg",q))};
  im.onerror=()=>{URL.revokeObjectURL(u);rej(new Error("image"))};im.src=u})}
// v43 (demande de Sid) : photo du plat → « Envoyer à Claude », et c'est tout. La photo est déposée tout de suite dans le
// dossier privé de la personne (Storage, documents/<uid>/repas-<horodatage>.jpg) ; son Claude la lit par le connecteur
// (outil photo_repas), estime le repas et le note ; la photo est effacée dès qu'elle a été lue (au plus tard après 24 h).
const nuDirect=()=>!!(session&&!isTrial()&&data.prefs.aiOk&&(aiCur()||AIS.claude)&&navigator.onLine);
function nuPhotoUp(){if(!nuPhoto||!nuDirect())return;const ph=nuPhoto,path=`documents/${session.user.id}/repas-${Date.now()}.jpg`;
  ph.up=(async()=>{const b=await (await fetch(ph.big)).blob();await stor("POST",path,b,"image/jpeg");ph.done=path;return path})();ph.up.catch(()=>{});return ph.up}
const nuPhotoDrop=ph=>{if(ph&&ph.up)ph.up.then(p=>stor("DELETE",p)).catch(()=>{})}
function nuAskLbl(){$("nuAskBtn").textContent=L(nuPhoto&&nuDirect()?"Envoyer à Claude":"Analyser")}
$("nuPhoto").addEventListener("change",async e=>{const f=e.target.files[0];e.target.value="";if(!f)return;
  try{nuPhoto={big:await shrink(f,1280,.8),small:await shrink(f,240,.7)};
    nuPhotoPrevSet(nuPhoto.small);
    if(nuDirect()){if(await nuConsent())nuPhotoUp()}nuAskLbl()}
  catch(ex){toast("Photo illisible")}});
// v68 (#3) : vignette de la photo du plat (React, ancien rendu en secours)
function nuPhotoPrevSet(src){const el=$("nuPhotoPrev");el.hidden=!src;
  if(shIsl("nuPhotoPrev")){try{window.SCIslands.nuPhotoPrev(el,{src:src||"",i18n:agI18n()});return}catch(e){reportErr("island nuPhotoPrev: "+(e&&e.message));try{window.SCIslands.unmount(el)}catch(_){}}}
  el.innerHTML=src?`<img src="${src}" alt="${L("Photo du plat")}"><button type="button" aria-label="${L("Retirer la photo")}" data-nuphrm="1">×</button>`:""}
$("nuPhotoPrev").addEventListener("click",e=>{if(e.target.closest("[data-nuphrm]")){nuPhotoDrop(nuPhoto);nuPhoto=null;nuPhotoPrevSet(null);nuAskLbl()}});
// envoi direct : Claude s'ouvre avec le message ; la fenêtre est ouverte pendant le toucher (sinon le navigateur la bloque)
// Sur iPhone (app installée), un lien vers Claude ouvre une petite fenêtre de navigateur qui passe la main à l'app Claude,
// puis reste vide derrière : on la garde sous la main et on la ferme dès que la personne revient dans Sid'compagnon
let extWin=null;
function extOpen(u){
  // app installée sur iPhone : on ouvre directement l'app Claude (adresse claude://…), sans fenêtre de navigateur qui resterait blanche ;
  // le message est aussi copié (au cas où l'app ne le pré-remplit pas) ; si l'app Claude ne s'ouvre pas, repli sur le lien web
  if(navigator.standalone&&/^https:\/\/claude\.ai\//.test(u)){
    try{const q=new URL(u).searchParams.get("q");if(q&&navigator.clipboard)navigator.clipboard.writeText(q).catch(()=>{})}catch(e){}
    location.href="claude://"+u.slice(8);setTimeout(()=>{if(!document.hidden)location.href=u},1600);return null}
  const w=window.open(u,"_blank");if(w){try{w.opener=null}catch(e){}extWin=w}return w}
document.addEventListener("visibilitychange",()=>{if(document.hidden||!extWin)return;const w=extWin;extWin=null;setTimeout(()=>{try{if(!w.closed)w.close()}catch(e){}},250)});
$("nuAiLink").addEventListener("click",e=>{e.preventDefault();const dn=nuDayNote();aiGo("nutri",dn?T3("Note dans Sid'note ce que j'ai mangé.","Log in Sid'note what I ate.","Noteer in Sid'note wat ik gegeten heb.")+dn+T3(" J'ai mangé : "," I ate: "," Ik heb gegeten: "):T3("J'ai mangé : ","I ate: ","Ik heb gegeten: "))});
document.addEventListener("click",e=>{const a=e.target.closest&&e.target.closest('a[target="_blank"][href^="https://claude.ai/"]');if(!a||e.defaultPrevented)return;e.preventDefault();extOpen(a.href)});
// « Envoyer à Claude » : la photo déposée (repas-…) est renommée envoi-… ; le connecteur la joint à nutrition_journee, un outil que
// Claude connaît déjà (sa liste d'outils peut dater d'avant photo_repas), puis l'efface
function nuPhotoMark(ph){const src=ph.done,dst=src.replace("/repas-","/envoi-"),key=x=>x.replace(/^documents\//,"");
  return (async()=>{const r=await fetch(SUPABASE_URL+"/storage/v1/object/move",{method:"POST",headers:{apikey:SUPABASE_KEY,Authorization:"Bearer "+await token(),"Content-Type":"application/json"},
    body:JSON.stringify({bucketId:"documents",sourceKey:key(src),destinationKey:key(dst)})});if(!r.ok)throw new Error("move "+r.status)})()
    .catch(async()=>{await stor("POST",dst,await (await fetch(ph.big)).blob(),"image/jpeg")})}
function nuPhotoSend(q){const ph=nuPhoto;
  const msg=T3(`Avec Sid'note : lis ma journée nutrition (nutrition_journee) : la photo de mon assiette que je viens d'envoyer y est jointe. Estime ce que j'ai mangé, puis note-le avec noter_repas.${q?` Précision : ${q}`:""}${nuDayNote()}`,
    `With Sid'note: read my nutrition day (nutrition_journee): the photo of my plate I just sent is attached to it. Estimate what I ate, then log it with noter_repas.${q?` Note: ${q}`:""}${nuDayNote()}`,
    `Met Sid'note: lees mijn voedingsdag (nutrition_journee): de foto van mijn bord die ik net stuurde zit erbij. Schat wat ik gegeten heb en noteer het met noter_repas.${q?` Toelichting: ${q}`:""}${nuDayNote()}`);
  const clear=()=>{nuPhoto=null;nuPhotoPrevSet(null);$("nuAsk").value="";grow($("nuAsk"));nuAskLbl()};
  // Claude s'ouvre tout de suite, pendant le toucher (une fenêtre vide remplie plus tard reste blanche dans l'app installée sur iPhone) ;
  // la photo finit de partir pendant que Claude s'ouvre (elle est en général déjà déposée depuis la prise de vue)
  // v44 : dans la conversation Nutrition si elle est réglée (le message est copié : il suffit de coller), sinon une nouvelle conversation
  const conv=aiGo("nutri",msg,true);clear();if(conv==="chat")toast("Prompt copié, colle-le dans la conversation");
  (ph.up||nuPhotoUp()||Promise.reject()).then(()=>nuPhotoMark(ph)).then(()=>toast(conv==="chat"?"Photo envoyée. Prompt copié, colle-le dans la conversation":"Photo envoyée : Claude note le repas, il arrivera ici"),
    ()=>toast("Envoi de la photo impossible : réessaie"))}
// un aliment renvoyé par l'IA apparaît-il dans ce que la personne a écrit ? (racine des mots, sans accents)
const nz=x=>String(x||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase();
function mentioned(q,name){const Q=nz(q),stems=nz(name).split(/[^a-z0-9]+/).filter(w=>w.length>=3&&!/^(les|des|une|avec|sans|aux|the|and|with|cuit|cuite|nature|frais|fraiche|maison)$/.test(w));
  return !stems.length||stems.some(w=>Q.includes(w.length>5?w.slice(0,5):w.replace(/[sx]$/,"")))}
$("nuAskForm").addEventListener("submit",async e=>{
  e.preventDefault();const q=$("nuAsk").value.trim();if((!q&&!nuPhoto)||nuBusy||!nutriAllowed())return;dictStop();
  if(nuPhoto&&nuDirect()){if(NU().consent)return nuPhotoSend(q);if(!(await nuConsent()))return;nuPhotoUp();return nuPhotoSend(q)}
  nuBusy="aliment";const btn=$("nuAskBtn");btn.disabled=true;nuPending=null;renderNuResult();
  const stop=nuLoading($("nuResult"),nuPhoto?["Analyse de la photo…","Reconnaissance des aliments…","Estimation des portions…","Calcul des calories…"]:["Analyse du plat…","Calcul des calories…","Estimation des macros…"]);
  const photo=nuPhoto;
  // texte seul : le serveur (v23) ne compte que ce qui est écrit ; le texte est envoyé tel quel pour garder la mémoire des aliments
  try{const r=await nuRetry(()=>nuCall("aliment",{text:q,image:photo?photo.big.split(",")[1]:undefined}),r=>r&&Array.isArray(r.items)&&r.items.length);
    nuPending={q,mem:r._src==="memory",title:String(r.dish||q||L("Mon plat")),em:String(r.emoji||"🍽️"),note:String(r.note||""),photo:photo&&photo.small,
      items:(r.items||[]).map(x=>({name:String(x.name||q),qty:String(x.quantity||""),em:String(x.emoji||""),kcal:r0(x.kcal),p:r1(x.protein_g),c:r1(x.carbs_g),f:r1(x.fat_g)}))};
    if(!photo&&nuPending.items.length>1)nuPending.items.forEach(x=>x.extra=!mentioned(q,x.name));
    if(!nuPending.items.length){nuPending=null;toast("Aliment non reconnu, précise un peu")}
  }catch(ex){toast(nuErrMsg(ex));if(ex.ai){nuPhoto=null;nuPhotoPrevSet(null);$("nuAsk").value="";grow($("nuAsk"))}} // v43 : demande partie chez Claude → rien ne reste pré-rempli
  stop();nuBusy="";btn.disabled=false;renderNuResult();
});
// plats du jour pour React (même regroupement que renderNutri)
function nuLogDraw(groups){if(!groups){const list=dayLog(nuDay);groups=[];list.forEach(x=>{const g=x.grp||x.id;let G=groups.find(y=>y.g===g);if(!G){G={g,items:[],name:x.gname||x.name,at:x.at};groups.push(G)}G.items.push(x)})}
  window.SCIslands.nuLog($("nuLog"),{dishes:groups.map(G=>({g:G.g,name:G.name,mono:mono(G.name),thumb:thumbs.get(G.g)||null,time:hhmm2(G.at),sum:sumOf(G.items),
    items:G.items.map(x=>({id:x.id,name:x.name,kcal:x.kcal,qty:qtyVM("log:"+x.id,x)}))})),mac:NU_MAC(),today:nuDay===iso(today()),i18n:agI18n()});$("nuLog")._isl=true}
const hhmm2=a=>{const d=new Date(a);return `${two(d.getHours())}:${two(d.getMinutes())}`};
function renderNuResult(){
  const p=nuPending;
  // le chargement (nuLoading) est posé directement dans #nuResult : React ne prend la main que pour un résultat, et la rend ensuite
  if(nuIsl("nuResult")&&p){try{const el=$("nuResult");if(!el._isl){el.innerHTML="";el._isl=true}
    window.SCIslands.nuResult(el,{p:{title:p.title,mono:mono(p.title),photo:p.photo||null,mem:!!p.mem,note:p.note||"",sum:sumOf(p.items),items:p.items.map((x,i)=>({id:String(i),name:x.name,kcal:x.kcal,extra:!!x.extra,qty:qtyVM("res:"+i,x)}))},
      mac:NU_MAC(),boltIcon:IC("bolt"),i18n:agI18n()});return}catch(x){reportErr("island nuResult: "+(x&&x.message))}}
  if($("nuResult")._isl){window.SCIslands.unmount($("nuResult"));$("nuResult")._isl=false}
  if(!p){if(!nuBusy)$("nuResult").innerHTML="";return}
  const s=sumOf(p.items);
  $("nuResult").innerHTML=`<div class="dish"><div class="dish-h"><span class="dish-ic">${p.photo?`<img src="${p.photo}" alt="">`:mono(p.title)}</span><span class="dish-t"><b class="notr">${esc(p.title)}</b><span class="small muted">${p.items.length} ${L(p.items.length>1?"aliments":"aliment")}</span>${p.mem?`<span class="memtag">${IC("bolt")} ${L("Mémoire Sid'note")}</span>`:""}</span><span class="dish-kcal">${r0(s.kcal)}<small>kcal</small></span></div>
    ${macroHtml(s)}<div class="dish-items">${p.items.map((x,i)=>`<div class="dish-it"><span class="em">·</span><div class="grow"><b class="notr">${esc(x.name)}</b>${x.extra?`<span class="notmention">${L("pas dans ta description")}</span>`:""}${qtyCell("res:"+i,x)}</div><span class="k">${x.kcal} kcal</span><button type="button" class="x" data-nurm="${i}" aria-label="${L("Retirer")}">×</button></div>`).join("")}</div>
    ${p.note?`<div class="dish-note notr" style="padding-top:8px">${esc(p.note)}</div>`:""}
    <div class="dish-act"><button type="button" class="btn ghost" data-nucancel="1">${L("Annuler")}</button><button type="button" class="btn" data-nuadd="1">${L("Ajouter")} · ${r0(s.kcal)} kcal</button></div></div>`;
}
$("nuResult").addEventListener("click",async e=>{const b=e.target.closest("button");if(!b||!nuPending)return;
  if(b.dataset.nurm){nuPending.items.splice(+b.dataset.nurm,1);if(!nuPending.items.length)nuPending=null;renderNuResult()}
  else if(b.dataset.nucancel){nuPending=null;renderNuResult()}
  else if(b.dataset.nuadd){const p=nuPending,g=nuAddItems(p.items,null,{name:p.title,em:p.em});
    if(p.photo){try{await idb.put(thumbKey(g),p.photo);thumbs.set(g,p.photo)}catch(x){}}
    nuPending=null;nuPhoto=null;nuPhotoPrevSet(null);$("nuAsk").value="";grow($("nuAsk"));renderNutri();toast(nuDay===iso(today())?"Ajouté à ta journée":"Ajouté à ce jour")}
});
function nuAddItems(items,time,meta){const at=nuAt(time),grp=uid();
  items.forEach(x=>NU().log.push({id:uid(),day:nuDay,at,grp,gname:meta&&meta.name||"",gem:meta&&meta.em||"",name:x.name,qty:x.qty||"",em:x.em||"",kcal:r0(x.kcal),p:r1(x.p),c:r1(x.c),f:r1(x.f),upd:Date.now()}));
  save();return grp}
// supprimer un aliment, ou tout un plat
$("nuLog").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;
  if(b.dataset.nuedit){e.preventDefault();nuOpenSheet(b.dataset.nuedit)}
  else if(b.dataset.nudel){e.preventDefault();if(!c2ok(b))return;const id=b.dataset.nudel;undoable("Supprimé",[id],()=>{tomb(id);NU().log=NU().log.filter(x=>x.id!==id)},{after:renderNutri})}
  else if(b.dataset.nucopy){e.preventDefault();e.stopPropagation();nuCopyOpen(b.dataset.nucopy)}
  else if(b.dataset.nudelg){e.preventDefault();e.stopPropagation();if(!c2ok(b))return;const g=b.dataset.nudelg,ids=NU().log.filter(x=>(x.grp||x.id)===g).map(x=>x.id);
    undoable("Plat supprimé",ids,()=>{ids.forEach(tomb);NU().log=NU().log.filter(x=>(x.grp||x.id)!==g)},{after:renderNutri,later:()=>{if(!NU().log.some(x=>(x.grp||x.id)===g))idb.del(thumbKey(g))}})}
});