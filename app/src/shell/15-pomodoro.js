/* ---------- Pomodoro ---------- */
const MIN=window.POMO_TEST_MIN||60000;
data.pomo=data.pomo||{cfg:{work:25,brk:5,total:120},run:null,log:{}};
const P=data.pomo;
const PRESETS=[60,90,120,180];
const hm=m=>{m=Math.round(m);const h=Math.floor(m/60),r=m%60;return h?`${h} h${r?" "+String(r).padStart(2,"0"):""}`:`${r} min`};
const clockTxt=ms=>{const s=Math.max(0,Math.ceil(ms/1000));return String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0")};
const hhmm=d=>String(d.getHours()).padStart(2,"0")+"h"+String(d.getMinutes()).padStart(2,"0");
const dayKey=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;

function buildSegs({work,brk,total}){
  const segs=[];let t=0;
  while(t<total){
    const w=Math.min(work,total-t);segs.push({t:"w",d:w});t+=w;
    if(total-t<=brk){segs[segs.length-1].d+=total-t;break} // pas de pause finale : le reste s'ajoute au dernier travail
    segs.push({t:"b",d:brk});t+=brk;
  }
  return segs;
}
function planBar(segs,el,doneIdx=-1){
  if(window.SCIslands&&window.SCIslands.planBar&&!window.__noIslands){try{window.SCIslands.planBar(el,{segs,doneIdx});return}catch(e){reportErr("island planBar: "+(e&&e.message))}}
  const tot=segs.reduce((a,s)=>a+s.d,0);
  el.innerHTML=segs.map((s,i)=>`<i class="${s.t==="w"?"w":"b"} ${i<doneIdx?"past":""}" style="flex:${s.d/tot}"></i>`).join("");
}
function renderSetup(){
  const c=P.cfg;
  if(window.SCIslands&&window.SCIslands.pomoPresets&&!window.__noIslands){try{window.SCIslands.pomoPresets($("presets"),{presets:PRESETS,total:c.total,labels:PRESETS.map(m=>agI18n().tr(hm(m)))})}catch(e){reportErr("island presets: "+(e&&e.message));window.__noIslands=true;try{renderSetup()}finally{window.__noIslands=false}return}}
  else $("presets").innerHTML=PRESETS.map(m=>`<button class="preset" data-total="${m}" aria-pressed="${c.total===m}">${hm(m)}</button>`).join("");
  $("oWork").textContent=c.work+" min";$("oBrk").textContent=c.brk+" min";$("oTotal").textContent=hm(c.total);
  const segs=buildSegs(c),n=segs.filter(s=>s.t==="w").length,
        work=segs.filter(s=>s.t==="w").reduce((a,s)=>a+s.d,0),real=segs.reduce((a,s)=>a+s.d,0);
  planBar(segs,$("planBar"));
  $("planTxt").textContent=`${n} session${n>1?"s":""} de travail et ${n-1} pause${n-1>1?"s":""} · ${hm(work)} de travail · si tu démarres maintenant, fin à ${hhmm(new Date(Date.now()+real*60000))}`;
}
$("pomoSetup").addEventListener("click",e=>{
  const b=e.target.closest("button");if(!b)return;
  if(b.dataset.total){P.cfg.total=+b.dataset.total}
  else if(b.dataset.step){const[k,v]=b.dataset.step.split(",");const lim={work:[5,90],brk:[1,30],total:[15,480]}[k];
    P.cfg[k]=Math.min(lim[1],Math.max(lim[0],P.cfg[k]+ +v))}
  else return;
  save();renderSetup();
});

/* son : débloqué au clic sur Démarrer (obligatoire sur iPhone) */
let actx=null;
function unlockAudio(){try{actx=actx||new (window.AudioContext||window.webkitAudioContext)();if(actx.state==="suspended")actx.resume()}catch(e){}}
function chime(kind,delay=0,q=null){
  if(!actx)return;try{
  const notes=kind==="w"?[523,659,784]:kind==="b"?[784,659,523]:[523,659,784,1047];
  notes.forEach((f,i)=>{const o=actx.createOscillator(),g=actx.createGain(),t=actx.currentTime+delay+i*.22;
    o.type="sine";o.frequency.value=f;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.35,t+.02);g.gain.exponentialRampToValueAtTime(.001,t+.5);
    o.connect(g).connect(actx.destination);o.start(t);o.stop(t+.55);if(q)q.push(o)});
  }catch(e){}
}
// v43 : sons programmés à l'avance sur l'horloge audio. En arrière-plan, le navigateur ralentit les minuteries
// (setInterval peut ne tourner qu'une fois par minute) : le son de fin arrivait en retard. L'horloge audio, elle, reste exacte.
const CHQ={};
function chimeCancel(key){(CHQ[key]||[]).forEach(o=>{try{o.stop()}catch(e){}});delete CHQ[key]}
function chimePlan(key,items){chimeCancel(key);if(!actx||actx.state!=="running")return false;CHQ[key]=[];items.forEach(([kind,ms])=>{if(ms>=0)chime(kind,ms/1000,CHQ[key])});return true}
let wake=null;
async function keepAwake(on){
  try{if(on&&"wakeLock" in navigator&&!wake){wake=await navigator.wakeLock.request("screen");wake.addEventListener("release",()=>wake=null)}
      else if(!on&&wake){await wake.release();wake=null}}catch(e){}
}

function elapsed(r,now=Date.now()){return (r.pausedAt||now)-r.startAt-r.pausedTotal}
function locate(r,el){
  let t=0;for(let i=0;i<r.segs.length;i++){const d=r.segs[i].d*MIN;if(el<t+d)return{i,into:el-t,d};t+=d}
  return{i:r.segs.length,into:0,d:0};
}
function workDone(r,el){let t=0,w=0;for(const s of r.segs){const d=s.d*MIN;if(s.t==="w")w+=Math.max(0,Math.min(d,el-t));t+=d}return w}
let lastIdx=null,pomoSched=false;
function pomoPlan(){const r=P.run;if(!r||r.pausedAt){chimeCancel("pomo");pomoSched=false;return}
  const el=elapsed(r),it=[];let t=0;r.segs.forEach((s,i)=>{if(i&&t>el)it.push([s.t,t-el]);t+=s.d*MIN});it.push(["end",t-el]);pomoSched=chimePlan("pomo",it)}
function startPomo(){
  unlockAudio();
  const segs=buildSegs(P.cfg);
  P.run={segs,startAt:Date.now(),pausedAt:null,pausedTotal:0};lastIdx=0;
  save();chime("w");keepAwake(true);pomoPlan();renderPomo();
}
function finishPomo(completed){
  const r=P.run;if(!r)return;
  const w=workDone(r,elapsed(r)),k=dayKey(new Date(r.startAt));
  P.log[k]=(P.log[k]||0)+w;P.run=null;lastIdx=null;save();keepAwake(false);
  const pre=pomoSched;if(!completed)chimeCancel("pomo");pomoSched=false;
  if(completed){if(!pre)chime("end");toast(`Bravo ! ${hm(w/MIN)} de travail terminées`)}
  renderPomo();
}
$("pomoStart").addEventListener("click",startPomo);
$("pomoPause").addEventListener("click",()=>{const r=P.run;if(!r)return;unlockAudio();
  if(r.pausedAt){r.pausedTotal+=Date.now()-r.pausedAt;r.pausedAt=null;keepAwake(true)}else{r.pausedAt=Date.now();keepAwake(false)}
  save();pomoPlan();renderPomo()});
$("pomoSkip").addEventListener("click",()=>{const r=P.run;if(!r)return;unlockAudio();
  const L=locate(r,elapsed(r));r.pausedTotal-=(L.d-L.into);save();chimeCancel("pomo");pomoSched=false;tickPomo();pomoPlan()});
$("pomoStop").addEventListener("click",e=>{const b=e.currentTarget;
  if(b.dataset.armed){finishPomo(false);toast("Session arrêtée")}
  else{b.dataset.armed="1";b.textContent="Confirmer ?";setTimeout(()=>{delete b.dataset.armed;b.textContent="Arrêter"},3000)}});

function tickPomo(){
  const r=P.run;if(!r)return;
  const el=elapsed(r),L=locate(r,el);
  if(L.i>=r.segs.length){finishPomo(true);return}
  if(lastIdx!==null&&L.i!==lastIdx){
    const s=r.segs[L.i];if(!pomoSched)chime(s.t);toast(s.t==="w"?"Au travail !":`Pause de ${s.d} min`);
    $("stage").classList.remove("flash");void $("stage").offsetWidth;$("stage").classList.add("flash");
  }
  lastIdx=L.i;
  const s=r.segs[L.i],isW=s.t==="w";
  const nW=r.segs.filter(x=>x.t==="w").length,curW=r.segs.slice(0,L.i+1).filter(x=>x.t==="w").length;
  $("stage").style.setProperty("--pc",`var(${isW?"--accent":"--ok"})`);
  $("phase").textContent=r.pausedAt?"En pause":isW?"Travail":"Pause";
  $("clock").textContent=clockTxt(L.d-L.into);
  $("segInfo").textContent=isW?`Session ${curW} sur ${nW}`:`Prochaine : session ${curW+1} sur ${nW}`;
  $("ring").style.strokeDashoffset=(339.29*(L.into/L.d)).toFixed(2);
  planBar(r.segs,$("runBar"),L.i);
  const totalMs=r.segs.reduce((a,x)=>a+x.d*MIN,0);
  $("mDone").textContent=hm(workDone(r,el)/MIN);
  $("mLeft").textContent=hm((totalMs-el)/MIN);
  $("mEnd").textContent=hhmm(new Date(Date.now()+(totalMs-el)));
  $("pomoPause").textContent=r.pausedAt?"Reprendre":"Pause";
  document.title=r.pausedAt?"Sid'compagnon":`${clockTxt(L.d-L.into)} · ${isW?"Travail":"Pause"}`;
}
function renderPomo(){
  const run=!!P.run;
  $("pomoSetup").hidden=run;$("pomoRun").hidden=!run;setBadge("pomo",run?"dot":0);
  if(run)tickPomo();else{renderSetup();document.title="Sid'compagnon"}
  renderPomoStats();
}
function renderPomoStats(){
  const today=P.log[dayKey(new Date())]||0;
  let week=0;for(let i=0;i<7;i++){const d=new Date();d.setDate(d.getDate()-i);week+=P.log[dayKey(d)]||0}
  const live=P.run?workDone(P.run,elapsed(P.run)):0;
  // v51 (ticket #3) : résumé dessiné par React (app/src/PomoStats.tsx) ; ancien rendu en secours
  if(window.SCIslands&&window.SCIslands.pomoStats&&!window.__noIslands){try{window.SCIslands.pomoStats($("pomoStats"),{todayMin:(today+live)/MIN,weekMin:(week+live)/MIN,i18n:{L,MOL,MO,DOWL}});return}catch(e){reportErr("island pomo: "+(e&&e.message))}}
  $("pomoStats").innerHTML=`<div class="row"><div class="grow">Travail concentré aujourd'hui</div><b>${hm((today+live)/MIN)}</b></div>
    <div class="row"><div class="grow">Sur les 7 derniers jours</div><b>${hm((week+live)/MIN)}</b></div>`;
}
setInterval(()=>{if(P.run){tickPomo();if(!$("v-pomo").hidden)renderPomoStats()}},500);
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&P.run){unlockAudio();if(!P.run.pausedAt)keepAwake(true);tickPomo();pomoPlan()}});

function renderAll(){renderTodos();renderPlan();renderStats();renderPomo();renderTypes();renderMuscu();renderDocs();renderNotes();renderPwd();renderNutri();if(data.ui.view==="graph")renderGraph();if(data.ui.view==="home")renderHome();if(data.ui.view==="spaces")renderSpaces();renderSide();convTabs()}
