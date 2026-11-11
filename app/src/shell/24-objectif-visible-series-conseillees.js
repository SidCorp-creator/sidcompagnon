/* ---------- v47 : objectif visible, séries conseillées, types de séances, demande à Sid'Bot (#13, #14, #17) ---------- */
// objectif d'entraînement (data.prefs.muGoal, synchronisé ; repris du programme suivi s'il n'est pas réglé)
const MU_GOALS={force:"Force",muscle:"Prise de masse",gras:"Sèche",endu:"Endurance",forme:"Forme"};
// v73 (demande de Sid du 30 oct. 2026) : paramètres de référence par objectif. H = polyarticulaire (squat, développé, rowing, tractions…),
// I = isolation (curl, extensions, élévations…). sets = nombre appliqué, setsTxt = fourchette affichée, rest = repos appliqué (s).
// Ce sont des points de départ : chaque exercice garde ses propres réglages (ex.reps, ex.rest, ex.int, ex.rpe, ex.tempo), modifiables à la main ou par Claude.
const MU_PARAMS={
  force:{H:{sets:5,setsTxt:"4–5",reps:"3–6",rest:240,restTxt:"3–5 min"},I:{sets:3,setsTxt:"2–3",reps:"6–10",rest:120,restTxt:"2 min"},
    int:"80–90 %",rpe:"8–9",tempo:"2-0-X",tempoTxt:"descente contrôlée 2 s, montée explosive",
    prog:"Quand toutes les séries sont réussies au haut de la fourchette : +2,5 kg (haut du corps) ou +5 kg (bas du corps).",stat:"Charge maximale et max estimé (1RM)"},
  muscle:{H:{sets:4,setsTxt:"3–4",reps:"6–10",rest:150,restTxt:"2–3 min"},I:{sets:3,setsTxt:"3–4",reps:"10–15",rest:75,restTxt:"60–90 s"},
    int:"65–80 %",rpe:"7–9",tempo:"3-0-1",tempoTxt:"descente lente 3 s, pause 0, montée 1 s",
    prog:"Double progression : monte les répétitions jusqu'au haut de la fourchette sur toutes les séries, puis augmente la charge et repars du bas.",stat:"Volume total et séries par muscle sur la semaine"},
  gras:{H:{sets:3,setsTxt:"3",reps:"6–10",rest:105,restTxt:"90 s – 2 min"},I:{sets:3,setsTxt:"3",reps:"10–15",rest:60,restTxt:"45–60 s"},
    int:"",intTxt:"charges habituelles",rpe:"7–8",tempo:"2-0-1",tempoTxt:"descente contrôlée 2 s, montée 1 s",
    prog:"Garde tes charges lourdes : c'est le déficit calorique qui fait sécher. L'objectif est de maintenir les charges.",stat:"Maintien de la force et durée de la séance"},
  endu:{H:{sets:3,setsTxt:"2–3",reps:"15–25",rest:45,restTxt:"30–60 s"},I:{sets:3,setsTxt:"2–3",reps:"15–25",rest:45,restTxt:"30–60 s"},
    int:"40–60 %",rpe:"6–7",tempo:"1-0-1",tempoTxt:"régulier, 1 s descente, 1 s montée",
    prog:"D'abord plus de répétitions, puis moins de repos, et seulement ensuite plus de charge.",stat:"Répétitions totales et temps de repos moyen"}};
MU_PARAMS.forme=MU_PARAMS.muscle;
const muGoal=()=>{const g=data.prefs.muGoal||(PL()&&PL().profile&&PL().profile.goal);return MU_PARAMS[g]?g:"muscle"};
const HEAVY_RE=/squat|souleve|developpe|rowing|traction|presse|dips|hip thrust|fente|military|bench|deadlift|\brow\b|press|pull-?up|lunge/;
const LOWER_RE=/squat|souleve|deadlift|fente|lunge|presse a cuisses|leg press|hip thrust|mollet|calf|ischio|leg curl|leg extension|adducteur|abducteur|fessier|glute/;
const exKind=name=>{const n=String(name||"").trim();if(!n)return null;const e=EXN(n)||EXDB.find(x=>fold(x.n)===fold(n));
  return e?(e.t==="I"?"I":"H"):(HEAVY_RE.test(fold(n))?"H":"I")};
// muscle principal d'un exercice : d'après la liste d'exercices, sinon d'après son nom (pour les statistiques par muscle)
const MUS_RE=/** @type {[RegExp,string][]} */([[/curl|biceps/,"biceps"],[/triceps|extension (?:verticale|horizontale|nuque)|barre au front|kick ?back|dips? (?:entre|sur banc)/,"triceps"],
  [/couche|pec|bench|ecarte|fly|pompe|push-?up|dips/,"chest"],[/militaire|military|overhead|elevation|epaule|shoulder|oiseau|face pull|arnold/,"shoulders"],
  [/shrug|trap/,"traps"],[/rowing|row|traction|pull-?up|chin-?up|tirage|pull-?down|lat/,"back"],[/mollet|calf/,"calves"],
  [/hip thrust|fessier|glute|kickback/,"glutes"],[/souleve|deadlift|ischio|leg curl|good morning/,"hams"],[/adducteur|adductor/,"adductors"],
  [/squat|fente|lunge|presse|leg press|leg extension|step-?up/,"quads"],[/abdo|crunch|gainage|plank|planche|releve de jambes/,"abs"]]);
function exMus(name){const n=String(name||"").trim();if(!n)return "";const e=EXN(n)||EXDB.find(x=>fold(x.n)===fold(n));if(e&&e.m)return e.m;
  const f=fold(n),r=MUS_RE.find(([re])=>re.test(f));return r?r[1]:""}
const exLower=name=>{const e=EXN(String(name||"").trim());return e?["quads","hams","glutes","adductors","calves"].includes(e.m):LOWER_RE.test(fold(name))};
// paramètres conseillés pour un exercice selon l'objectif
function exAdv(name){const k=exKind(name);if(!k)return null;const P=MU_PARAMS[muGoal()],x=P[k];
  return{k,sets:x.sets,setsTxt:x.setsTxt,reps:x.reps,rest:x.rest,restTxt:x.restTxt,int:P.int,intTxt:P.intTxt||P.int,rpe:P.rpe,tempo:P.tempo}}
const exAdvSame=(ex,a)=>ex.sets.length===a.sets&&ex.reps===a.reps&&(+ex.rest||0)===a.rest&&(ex.int||"")===a.int&&(ex.rpe||"")===a.rpe&&(ex.tempo||"")===a.tempo;
// repos lisible : 45 s, 2 min, 2 min 30
const restFmt=r=>{r=Math.round(+r||0);if(r<60)return r+" s";const m=Math.floor(r/60),x=r%60;return x?`${m} min ${String(x).padStart(2,"0")}`:`${m} min`};
const exAdvVal=a=>`${a.sets} × ${a.reps} · RPE ${a.rpe} · ${restFmt(a.rest)}`;
function exAdvHtml(ex){const a=exAdv(ex.name);if(!a)return `<div class="ex-adv" hidden></div>`;
  return `<div class="ex-adv"><span class="grow">${L("Conseillé")} (${L(MU_GOALS[muGoal()])}) : <b>${exAdvVal(a)}</b></span>${exAdvSame(ex,a)?`<span class="ok">${IC("tick")}</span>`:`<button type="button" class="linkbtn" data-msadv="1">${L("Appliquer")}</button>`}</div>`}
// applique le conseil : séries (seules des séries vides sont retirées), répétitions visées, repos, intensité, RPE, tempo ; annulable
function exAdvApply(se,ex){const a=exAdv(ex.name);if(!a)return;const K=["reps","rest","int","rpe","tempo"],before={sets:ex.sets.map(x=>({...x}))};K.forEach(k=>before[k]=ex[k]);
  while(ex.sets.length<a.sets)ex.sets.push(newSet());
  for(let j=ex.sets.length-1;j>=a.sets;j--){const x=ex.sets[j];if(!String(x.kg||"").trim()&&!String(x.reps||"").trim())ex.sets.splice(j,1)}
  ex.reps=a.reps;ex.rest=a.rest;ex.int=a.int;ex.rpe=a.rpe;ex.tempo=a.tempo;seTouch(se);save();renderMuscu();
  toastAct(`${a.sets} ${L("séries")} × ${a.reps}`,"Annuler",()=>{ex.sets=before.sets;K.forEach(k=>{if(before[k]===undefined)delete ex[k];else ex[k]=before[k]});seTouch(se);save();renderMuscu()})}
// réglages propres à l'exercice (panneau « Réglages » sous le conseil) : résumé affiché quand il est replié
const msPrmOpen=new Set();
function exPrmSum(ex){const p=[];if(ex.reps)p.push(`${ex.reps} reps`);if(+ex.rest)p.push(`${L("repos")} ${restFmt(+ex.rest)}`);if(ex.int)p.push(ex.int);if(ex.rpe)p.push(`RPE ${ex.rpe}`);if(ex.tempo)p.push(`${L("tempo")} ${ex.tempo}`);
  return p.length?`${L("Réglages")} : ${p.join(" · ")}`:L("Réglages de l'exercice")}
function exPrmHtml(ex){const v=k=>esc(String(ex[k]==null?"":ex[k]));
  return `<details class="ex-prm" data-prm="${ex.id}"${msPrmOpen.has(ex.id)?" open":""}><summary class="small">${esc(exPrmSum(ex))}</summary><div class="ex-prm-g">
    <label><span>${L("Répétitions visées")}</span><input data-f="xreps" value="${v("reps")}" placeholder="8–12" maxlength="9" autocomplete="off"></label>
    <label><span>${L("Repos (secondes)")}</span><input data-f="xrest" value="${+ex.rest||""}" placeholder="120" inputmode="numeric" maxlength="3" autocomplete="off"></label>
    <label><span>${L("Intensité")}</span><input data-f="xint" value="${v("int")}" placeholder="70 %" maxlength="16" autocomplete="off"></label>
    <label><span>RPE</span><input data-f="xrpe" value="${v("rpe")}" placeholder="8" maxlength="9" autocomplete="off"></label>
    <label><span>${L("Tempo")}</span><input data-f="xtempo" value="${v("tempo")}" placeholder="3-0-1" maxlength="9" autocomplete="off"></label></div></details>`}
// progression (v73) : d'après la dernière séance faite qui contient cet exercice
const repTop=r=>{const m=String(r||"").match(/(\d+)\s*$/);return m?+m[1]:0};
function exLastLog(name){const k=fold(String(name||"").trim());if(!k)return null;
  const L0=ML().filter(l=>l&&!(data.del&&data.del[l.id])&&(l.ex||[]).some(x=>fold(x.name)===k)).sort((a,b)=>(b.date||"").localeCompare(a.date||"")||(b.upd||0)-(a.upd||0));
  return L0.length?(L0[0].ex||[]).find(x=>fold(x.name)===k):null}
function exProg(ex){const top=repTop(ex.reps),last=exLastLog(ex.name),g=muGoal();if(!top||!last||!last.sets||!last.sets.length)return "";
  if(last.sets.length<(ex.sets||[]).length||!last.sets.every(s=>(+s.reps||0)>=top))return ""; // v74.3 : toutes les séries prévues, pas une seule
  if(g==="force")return `${L("Toutes les séries réussies au haut de la fourchette")} : +${exLower(ex.name)?"5":LANG==="en"?"2.5":"2,5"} kg`;
  if(g==="endu")return L("Haut de la fourchette atteint : réduis le repos, puis augmente la charge");
  if(g==="gras")return "";
  return L("Haut de la fourchette atteint : augmente la charge et repars du bas")}
function renderMuGoal(){const box=$("muGoal");if(!box)return;box.hidden=true;box.innerHTML="";return; // v77 (demande de Sid) : plus de bloc permanent « Mon objectif » ; objectif dans « Objectif et préférences » (data.prefs.muGoal gardé)
const g=muGoal(),keys=["force","muscle","gras","endu"].concat(g==="forme"?["forme"]:[]);
  // v52 (ticket #3) : dessiné par React (app/src/Small.tsx) ; ancien rendu en secours
  if(window.SCIslands&&window.SCIslands.muGoal&&!window.__noIslands){try{window.SCIslands.muGoal(box,{keys,goal:g,names:MU_GOALS,i18n:{L,MOL,MO,DOWL}});return}catch(e){reportErr("island muGoal: "+(e&&e.message))}}
  box.innerHTML=`<span class="eyebrow">${L("Mon objectif")}</span><div class="seg mu-goal-seg" role="group" aria-label="${L("Mon objectif")}" style="grid-template-columns:repeat(${keys.length},minmax(0,1fr))">${keys.map(k=>`<button type="button" data-mugoal="${k}" aria-pressed="${k===g}">${L(MU_GOALS[k])}</button>`).join("")}</div>
    <div class="small muted">${L("Les séries et répétitions conseillées de chaque exercice suivent cet objectif.")}</div>`}
$("muGoal").addEventListener("click",e=>{const b=e.target.closest("[data-mugoal]");if(!b)return;const g=b.dataset.mugoal;if(g===muGoal()&&data.prefs.muGoal)return;
  data.prefs.muGoal=g;const pl=PL();if(pl){pl.profile=pl.profile||{};pl.profile.goal=g;pl.upd=Date.now();M().upd=Date.now()}save();renderMuscu();
  toast(`${L("Objectif")} : ${L(MU_GOALS[g])}`)});
/* ---- v73 : séance faite (« Séance terminée »), chrono automatique, statistiques par objectif ---- */
// L’horloge utilise l’heure de départ absolue. Un état arrêté est conservé pour la fusion entre appareils.
function msRunGet(id){
  const r=data.muscuClock?.run;
  return r&&msFind(r.se)&&(!id||r.se===id)?r:null;
}
function msClockSave(run){
  data.muscuClock={run,upd:Math.max(Date.now(),(data.muscuClock?.upd||0)+1)};
  save();
}
function msClockMigrate(){
  const old=data.ui?.msRun;
  if(!old)return;
  msTT(old.se);
  delete data.ui.msRun;
  if(!data.muscuClock&&msFind(old.se)&&Number.isFinite(old.t0)){
    data.muscuClock={run:{se:old.se,t0:old.t0,marks:old.marks||{}},upd:old.last||old.t0};
    save();
  }else saveUI();
}
function msClockRead(){
  const saved=session&&ls.get(cacheKey(session.user.id))?.data;
  if(!saved||(data.wipe||"")>(saved.wipe||""))return false;
  const disk=saved.muscuClock,current=data.muscuClock;
  if(!disk||(current&&(disk.upd<current.upd||(disk.upd===current.upd&&(disk.run||!current.run)))))return false;
  data.muscuClock=disk;
  return true;
}
function msClockStart(se){
  msClockRead();
  const current=msRunGet();
  if(current?.se===se.id)return;
  if(current)msClockStop(msFind(current.se));
  msClockSave({se:se.id,t0:Date.now(),marks:{}});
}
function msRunTouch(se,ex,j,done){
  msClockRead();
  const k=ex.id+":"+j,run=msRunGet(),now=Date.now();
  const touched=msTT(se.id,true).t,first=!touched[k];
  touched[k]=1;
  if(first&&run&&run.se!==se.id)toast(`${L("Chrono en cours sur")} ${msFind(run.se).name||L("une autre séance")}`);
  if(!run)msClockSave({se:se.id,t0:now,marks:done?{[k]:now}:{}});
  else if(run.se===se.id&&done&&!run.marks[k])msClockSave({...run,marks:{...run.marks,[k]:now}});
  else saveUI();
}
function msClockStop(se){
  msClockRead();
  const run=msRunGet(se.id);
  if(!run)return;
  clearTimeout(msAutoT[se.id]);delete msAutoT[se.id];
  msDone(se,true);
  const date=iso(today());
  const log=iso(new Date(run.t0))===date&&ML().find(l=>l?.day===se.id&&l.date===date&&l.upd>=run.t0&&!(data.del&&data.del[l.id]));
  if(log){log.min=msRunMin(run);M().upd=log.upd=Date.now()}
  msClockSave(null);renderMuscu();
}
// v74.4 : séries touchées aujourd'hui, par séance (data.ui.msT = {séance: {d: date, t: {"exId:série": 1}}}), indépendantes du chrono :
// passer à une autre séance puis revenir ne fait plus oublier les séries déjà faites ; « Annuler » peut les remettre comme avant
function msTT(id,make){const u=data.ui.msT||(data.ui.msT={}),d=iso(today()),r=data.ui.msRun;
  // séance commencée avant la mise à jour : les repères de l'ancien chrono (msRun.t) sont repris s'ils datent d'aujourd'hui
  if(r&&r.t){if(iso(new Date(r.t0||0))===d){const x=u[r.se]&&u[r.se].d===d?u[r.se]:(u[r.se]={d,t:{}});Object.assign(x.t,r.t)}delete r.t;saveUI()}
  for(const k of Object.keys(u))if(!u[k]||u[k].d!==d)delete u[k];
  if(!u[id]&&make)u[id]={d,t:{}};return u[id]||null}
// une série retirée : les repères des séries suivantes de l'exercice reculent d'un rang
function msRunShift(seId,exId,j){msClockRead();const r=msRunGet(seId),x=msTT(seId);for(const o of [r&&r.marks,x&&x.t]){if(!o)continue;const nw={};
  for(const[k,v]of Object.entries(o)){const[e,s]=k.split(":");const n=+s;if(e!==exId||n<j)nw[k]=v;else if(n>j)nw[e+":"+(n-1)]=v}
  Object.keys(o).forEach(k=>delete o[k]);Object.assign(o,nw)}if(r)msClockSave(r);else saveUI()}
function msRunRest(r){const t=Object.values(r.marks||{}).map(Number).sort((a,b)=>a-b),g=[];
  for(let i=1;i<t.length;i++){const d=(t[i]-t[i-1])/1000;if(d>=10&&d<=900)g.push(d)}return g.length?Math.round(g.reduce((a,b)=>a+b,0)/g.length):0}
const msRunMin=r=>Math.max(1,Math.round((Date.now()-r.t0)/60000));
function msClockSince(run){
  const start=new Date(run.t0);
  return iso(start)===iso(today())?"":`${L("Depuis le")} ${fmtDay(run.t0)} · ${two(start.getHours())}:${two(start.getMinutes())}`;
}
function msClockLabel(run){
  const seconds=Math.max(0,Math.floor((Date.now()-run.t0)/1000)),hours=Math.floor(seconds/3600);
  const rest=`${two(Math.floor(seconds/60)%60)}:${two(seconds%60)}`;
  return hours?`${hours}:${rest}`:rest;
}
setInterval(()=>{
  if(data.ui.view!=="muscu"||document.hidden)return;
  const elapsed=document.querySelector("[data-mselapsed]"),run=msRunGet();
  if(elapsed&&run)elapsed.textContent=msClockLabel(run);
},1000);
const msDoneToday=se=>ML().some(l=>l&&l.day===se.id&&l.date===iso(today())&&!(data.del&&data.del[l.id]));
// les séries remplies partent dans l'historique (data.muscu.log), avec la durée et le repos moyen mesurés.
// v74.1 (demande de Sid) : plus de bouton « Séance terminée » : l'enregistrement se fait tout seul (quiet), 1,5 s après la dernière série saisie
// at = {d, t} : corrige la séance d'un jour passé (« Annuler » après minuit), sans le chrono en cours
function msDone(se,quiet,at){const r=at?null:msRunGet(se.id),tx=at||msTT(se.id);if(quiet&&!tx)return;const tt=quiet?tx.t:null; // v74.3 : en automatique, seulement les séries touchées aujourd'hui
  const ex=se.exercises.map(x=>({name:String(x.name||"").trim(),sets:(x.sets||[]).filter((s,j)=>(!tt||tt[x.id+":"+j])&&(String(s.kg||"").trim()||String(s.reps||"").trim())).map(s=>({kg:String(s.kg||""),reps:String(s.reps||"")}))})).filter(x=>x.name&&x.sets.length);
  const now=Date.now(),date=at?at.d:iso(today()),L0=ML(),old=L0.find(l=>l&&l.day===se.id&&l.date===date&&!(data.del&&data.del[l.id]));
  if(!ex.length){if(quiet&&old){tomb(old.id);M().log=L0.filter(l=>l!==old);M().upd=now;save();renderMuStats();return}if(!quiet)toast("Remplis au moins une série avant de terminer");return}
  const ent={id:old?old.id:uid(),date,day:se.id,name:se.name||"",ex,goal:muGoal(),upd:now};
  if(r&&iso(new Date(r.t0))===date){ent.min=msRunMin(r);const rest=msRunRest(r);if(rest)ent.rest=rest}else if(old&&old.min){ent.min=old.min;if(old.rest)ent.rest=old.rest}
  const before=old?JSON.parse(JSON.stringify(old)):null;
  if(old){Object.keys(old).forEach(k=>delete old[k]);Object.assign(old,ent)}else L0.push(ent);
  if(quiet){M().upd=now;save();renderMuStats();return}
  if(r)msClockSave(null);M().upd=now;save();renderMuscu();
  toastAct(old?"Séance mise à jour":"Séance enregistrée","Annuler",()=>{const i=ML().findIndex(l=>l&&l.id===ent.id);
    if(before&&i>=0){ML()[i]=before}else{tomb(ent.id);M().log=ML().filter(l=>l&&l.id!==ent.id)}M().upd=Date.now();save();renderMuscu()})}
// un minuteur par séance (avant : un seul pour toutes, remplir une autre séance dans la seconde et demie annulait l'enregistrement de la première)
/** @type {Record<string, any>} */ const msAutoT={};
function msAutoLog(se){const id=se.id;clearTimeout(msAutoT[id]);msAutoT[id]=setTimeout(()=>{delete msAutoT[id];try{const x=msFind(id);if(x)msDone(x,true)}catch(e){reportErr("msAutoLog: "+(e&&e.message))}},1500)}
// statistiques mises en avant selon l'objectif, calculées sur l'historique (8 dernières semaines ; « cette semaine » = depuis lundi)
const kgOf=s=>parseFloat(String(s&&s.kg||"").replace(",","."))||0,repsOf=s=>parseInt(String(s&&s.reps||""))||0;
const fmtKg=v=>{const r=Math.round(v*10)/10;return LANG==="en"?String(r):String(r).replace(".",",")};
const daysAgo=n=>{const d=today();d.setDate(d.getDate()-n);return iso(d)};
const wkStart=()=>{const d=today();d.setDate(d.getDate()-(d.getDay()+6)%7);return iso(d)};
function muStatsVM(){const g=muGoal(),P=MU_PARAMS[g],logs=ML().filter(l=>l&&l.date&&!(data.del&&data.del[l.id])).sort((a,b)=>a.date.localeCompare(b.date)||(a.upd||0)-(b.upd||0)),rows=/** @type {{l:string,v:string,u?:boolean,warn?:boolean}[]} */([]);
  const recent=logs.filter(l=>l.date>=daysAgo(56)),week=logs.filter(l=>l.date>=wkStart());
  if(g==="force"){ // par exercice : meilleure charge et max estimé (formule d'Epley, séries de 12 répétitions au plus)
    const by=new Map();for(const l of recent)for(const x of l.ex||[]){const k=fold(x.name);if(!k)continue;const o=by.get(k)||{n:x.name,best:0,orm:0,c:0};o.c++;
      for(const s of x.sets||[]){const kg=kgOf(s),r=repsOf(s);if(!kg||!r)continue;o.best=Math.max(o.best,kg);if(r<=12)o.orm=Math.max(o.orm,kg*(1+r/30))}by.set(k,o)}
    [...by.values()].filter(o=>o.best).sort((a,b)=>b.c-a.c||b.orm-a.orm).slice(0,5).forEach(o=>rows.push({l:o.n,u:true,v:`${fmtKg(o.best)} kg · ${L("max estimé")} ${fmtKg(Math.round((o.orm||o.best)*2)/2)} kg`}))}
  else if(g==="endu"){const reps=week.reduce((a,l)=>a+(l.ex||[]).reduce((b,x)=>b+(x.sets||[]).reduce((c,s)=>c+repsOf(s),0),0),0),rs=recent.filter(l=>+l.rest>0).slice(-8);
    if(week.length)rows.push({l:L("Répétitions cette semaine"),v:String(reps)});
    if(rs.length)rows.push({l:L("Repos moyen entre les séries"),v:`${Math.round(rs.reduce((a,l)=>a+(+l.rest),0)/rs.length)} s`})}
  else if(g==="gras"){ // maintien : charge de la dernière séance / meilleure charge des séances précédentes ; alerte après 2 baisses d'affilée
    const by=new Map();for(const l of recent)for(const x of l.ex||[]){const k=fold(x.name),top=Math.max(0,...(x.sets||[]).map(kgOf));if(!k||!top)continue;const o=by.get(k)||{n:x.name,h:[]};o.h.push(top);by.set(k,o)}
    [...by.values()].sort((a,b)=>b.h.length-a.h.length).slice(0,5).forEach(o=>{const cur=o.h[o.h.length-1],ref=Math.max(cur,...o.h.slice(0,-1)),h=o.h.slice(-3),down=h.length===3&&h[1]<h[0]&&h[2]<h[1];
      rows.push({l:o.n,u:true,v:`${fmtKg(cur)} / ${fmtKg(ref)} kg${down?` · ⚠ ${L("en baisse")}`:""}`,warn:down})});
    const dm=recent.filter(l=>+l.min>0).slice(-8);if(dm.length)rows.push({l:L("Durée moyenne d'une séance"),v:`${Math.round(dm.reduce((a,l)=>a+(+l.min),0)/dm.length)} min`})}
  else{ // prise de masse (et forme) : volume de la semaine (séries × répétitions × poids) et séries par muscle (cible : 10 à 20)
    let vol=0;const mus=new Map();
    for(const l of week)for(const x of l.ex||[]){const m=MUS[exMus(x.name)]||"Autres";for(const s of x.sets||[]){vol+=kgOf(s)*repsOf(s);if(repsOf(s))mus.set(m,(mus.get(m)||0)+1)}}
    if(week.length){rows.push({l:L("Volume cette semaine"),v:`${fmtFull(vol)} kg`});
      [...mus.entries()].sort((a,b)=>b[1]-a[1]).forEach(([m,n])=>rows.push({l:L(m),v:`${n} ${L(n>1?"séries":"série")}${n<10?` · ${L("objectif")} 10–20`:n>20?` · ${L("plus de 20")}`:" ✓"}`,warn:n>20}))}}
  return{title:L(P.stat),prog:L(P.prog),rows,empty:L("Remplis les séries de tes séances pour voir tes statistiques ici.")}}
function renderMuStats(){const box=$("muStats");if(!box)return;const vm=muStatsVM();
  if(shIsl("muStats")){try{window.SCIslands.muStats(box,{vm,i18n:agI18n()});return}catch(e){reportErr("island muStats: "+(e&&e.message));try{window.SCIslands.unmount(box)}catch(_){}}}
  box.innerHTML=`<div class="mu-st-h"><span class="eyebrow">${L("Mes statistiques")}</span><span class="small muted">${esc(vm.title)}</span></div>`+
    (vm.rows.length?`<div class="mu-st-rows">${vm.rows.map(r=>`<div class="row"><span class="grow${r.u?" notr":""}">${esc(r.l)}</span><b${r.warn?' class="warn"':""}>${esc(r.v)}</b></div>`).join("")}</div>`:`<p class="small muted">${esc(vm.empty)}</p>`)+
    `<p class="small muted mu-st-prog"><b>${L("Progression")}</b> : ${esc(vm.prog)}</p>`}
// chrono visible : la ligne de la séance en cours est redessinée chaque minute (jamais pendant une saisie)
setInterval(()=>{if(data&&data.ui&&data.ui.view==="muscu"&&msRunGet()&&!(document.activeElement&&document.activeElement.matches("input,textarea")))renderMuscu()},60e3);
// type d'une séance : d'après son nom, sinon d'après les muscles de ses exercices
const SE_T={push:["Poussée"],pull:["Tirage"],legs:["Jambes"],upper:["Haut du corps"],lower:["Bas du corps"],full:["Corps complet"]};
function seType(se){const n=fold(se.name||"");
  if(/\bpush\b|pouss|\bpecs?\b/.test(n))return "push";if(/\bpull\b|tirage/.test(n))return "pull";
  if(/bas du corps|\blower\b/.test(n))return "lower";if(/haut du corps|\bupper\b/.test(n))return "upper";
  if(/jambe|\blegs?\b|cuisse/.test(n))return "legs";if(/corps complet|full ?body|\bfull\b/.test(n))return "full";
  const c={push:0,pull:0,legs:0},G={chest:"push",shoulders:"push",triceps:"push",back:"pull",biceps:"pull",traps:"pull",quads:"legs",hams:"legs",glutes:"legs",calves:"legs",adductors:"legs"};
  for(const x of se.exercises||[]){const e=EXN(String(x.name||"").trim());if(e&&G[e.m])c[G[e.m]]++}
  const up=c.push+c.pull;if(!up&&!c.legs)return null;
  if(c.legs&&up)return c.legs>=2&&up>=2?"full":c.legs>up?"legs":"upper";
  if(c.legs)return "legs";return c.push&&c.pull?(c.push>=c.pull*3?"push":c.pull>=c.push*3?"pull":"upper"):c.push?"push":"pull"}
// v47 (#17) : un champ en haut de Musculation et de Notes, comme « Planifier ». v76 : la demande part chez Sid'Bot (dans l'app), telle qu'écrite
const muPrompt=q=>q,ntPrompt=q=>q;
for(const[k,topic,mk,health]of/** @type {[string,string,(q:string)=>string,boolean][]} */([["mu","muscu",muPrompt,true],["nt","note",ntPrompt,false]])){const f=$(k+"AskForm"),t=$(k+"Ask");
  $(k+"Mic").addEventListener("click",e=>dictate(e.currentTarget,t));t.addEventListener("input",()=>grow(t));
  t.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();f.requestSubmit()}});
  f.addEventListener("submit",async e=>{e.preventDefault();const q=t.value.trim();if(!q)return;dictStop();
    if(health&&!(await nuConsent()))return;aiHandoff(mk(q.slice(0,1500)),topic,{send:true});t.value="";grow(t)})}
$("coachClose").addEventListener("click",()=>muqClose());
$("coachSheet").addEventListener("click",e=>{if(e.target.id==="coachSheet")muqClose()});
$("coachBox").addEventListener("click",e=>{
  const b=e.target.closest("[data-coach]");if(!b)return;const k=b.dataset.coach;
  if(k==="new")muqOpen();
  else if(k==="restart"){delete data.prefs.muDraft;save();muqOpen({fresh:true})}
  else if(k==="prefs")muqOpen({fresh:true,step:"recap"});
  else if(k==="go"){const el=document.querySelector(`#msList [data-ms="${CSS.escape(b.dataset.se||"")}"]`);if(el){if(el.tagName==="DETAILS")el.open=true;el.scrollIntoView({block:"start",behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});const f=el.querySelector("summary,button,input");if(f)f.focus({preventScroll:true})}}
  else if(k==="adjust")coachAdjust($("coRemark").value);
  else if(k==="resend"){const pl=PL(),rm=pl&&pl.profile&&(pl.profile.remarks||[]).slice(-1)[0];aiHandoff(rm&&rm.text!==pl.profile.notes?coachPrompt("adjust",rm.text):coachPrompt("new"),"muscu")}
  else if(k==="unwait"){const pl=PL();if(pl){delete pl.aiWait;pl.upd=Date.now();save();renderMuscu()}}
  else if(k==="more")openActions(L("Mon programme"),[{l:"Objectif et préférences",fn:()=>muqOpen({fresh:true,step:"recap"})},
    {l:"Demander conseil à Sid'Bot",fn:async()=>{if(!(await nuConsent()))return;aiHandoff(coachPrompt("improve"),"muscu",{send:true})}},
    {l:"Partager le programme",fn:()=>copyText(shareTxt(PLD(),L("Mon programme")),"prog")},
    {l:"Supprimer le programme",danger:true,fn:()=>grpActions(PL().id)}])});
// v43 : au retour de veille, on resynchronise les sons programmés du Focus (l'horloge audio a pu être suspendue)
addEventListener("pageshow",()=>{if(P.run)pomoPlan()});
