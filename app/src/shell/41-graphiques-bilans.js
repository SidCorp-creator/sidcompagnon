/* ---------- graphiques (macros, poids, calories) + bilans ---------- */
// Couleurs validées (outil de la charte dataviz) : protéines bleu, glucides orange, lipides vert d'eau ; calories en couleurs d'état + icône.
let grRange=7,grTipT=null;
const cssv=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
function grDays(n){const out=[],t=today();for(let i=n-1;i>=0;i--){const d=new Date(t);d.setDate(d.getDate()-i);out.push(iso(d))}return out}
const dLbl=(k,long)=>{const d=parse(k);return long?`${DOW[d.getDay()]} ${d.getDate()} ${MO[d.getMonth()]}`:`${d.getDate()}/${d.getMonth()+1}`};
function niceStep(v){if(!(v>0))return 1;const p=Math.pow(10,Math.floor(Math.log10(v))),f=v/p;return(f<=1?1:f<=2?2:f<=2.5?2.5:f<=5?5:10)*p}
function niceMax(v){const st=niceStep(v/4);return Math.max(st,Math.ceil(v/st)*st)}
const fmtFull=v=>Math.round(v).toLocaleString(LANG==="en"?"en-US":LANG==="nl"?"nl-NL":"fr-FR");
const fmtN=v=>{v=Math.round(v*10)/10;return v>=1000?(Math.round(v/100)/10+"K").replace(".",LANG==="en"?".":","):String(v).replace(".",LANG==="en"?".":",")};
function grTipShow(ev,html){const t=$("grTip");t.innerHTML=html;t.hidden=false;const x=ev.clientX,y=ev.clientY,w=t.offsetWidth,h=t.offsetHeight;
  t.style.left=Math.min(innerWidth-w-8,Math.max(8,x-w/2))+"px";t.style.top=Math.max(8,y-h-14)+"px";clearTimeout(grTipT)}
function grTipHide(){$("grTip").hidden=true;document.querySelectorAll("#v-graph .gr-x").forEach(x=>x.setAttribute("visibility","hidden"))}
// v44.7 : sur téléphone, l'infobulle reste tant qu'on est sur le graphique ; elle disparaît dès qu'on fait défiler la page
// (le navigateur annule alors le toucher : pointercancel) ou qu'on touche ailleurs
addEventListener("scroll",()=>{if(!$("grTip").hidden)grTipHide()},{passive:true,capture:true});
document.addEventListener("pointerdown",e=>{if(!$("grTip").hidden&&!e.target.closest("#v-graph svg"))grTipHide()},true);
document.addEventListener("pointercancel",e=>{if(e.target.closest&&e.target.closest("#v-graph svg"))grTipHide()},true);
document.addEventListener("touchmove",e=>{if(!$("grTip").hidden&&!(e.target.closest&&e.target.closest("#v-graph svg")))grTipHide()},{passive:true,capture:true});
// courbe(s) : 2px, points d'extrémité, réticule + bulle sur toutes les séries
function lineChart(el,days,series,opt={}){
  const W=Math.max(280,el.clientWidth||320),H=170,ml=34,mr=14,mt=12,mb=24,pw=W-ml-mr,ph=H-mt-mb;
  const all=series.flatMap(s=>s.vals.filter(v=>v!=null));if(opt.ref)all.push(opt.ref.v);
  if(!series.some(s=>s.vals.some(v=>v!=null))){el.innerHTML=`<div class="gr-empty">${L(opt.empty||"Pas encore de données sur cette période.")}</div>`;return}
  let lo=opt.zero?0:Math.min(...all),hi=Math.max(...all);if(!opt.zero){const pad=Math.max(1,(hi-lo)*.15);lo=Math.floor(lo-pad);hi=hi+pad}
  const top=opt.zero?niceMax(hi):Math.ceil(hi),step=opt.zero?niceStep(hi/4):(top-lo)/4,X=i=>ml+(days.length<2?pw/2:i*pw/(days.length-1)),Y=v=>mt+ph-(v-lo)/(top-lo||1)*ph;
  let g="";for(let v=lo;v<=top+1e-9;v+=step){const y=Y(v);g+=`<line class="grid" x1="${ml}" x2="${W-mr}" y1="${y}" y2="${y}"/><text class="ax" x="${ml-6}" y="${y+4}" text-anchor="end">${fmtN(v)}</text>`}
  const every=days.length>10?7:1;days.forEach((k,i)=>{if((days.length-1-i)%every===0)g+=`<text class="ax" x="${X(i)}" y="${H-6}" text-anchor="middle">${dLbl(k)}</text>`});
  if(opt.ref){const y=Y(opt.ref.v);g+=`<line x1="${ml}" x2="${W-mr}" y1="${y}" y2="${y}" stroke="var(--muted)" stroke-width="1"/><text class="lbl" x="${W-mr}" y="${y-5}" text-anchor="end">${esc(opt.ref.label)}</text>`}
  series.forEach(s=>{let d="",on=false;s.vals.forEach((v,i)=>{if(v==null){on=false;return}d+=(on?"L":"M")+X(i).toFixed(1)+" "+Y(v).toFixed(1);on=true});
    g+=`<path d="${d}" fill="none" stroke="var(${s.c})" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
    s.vals.forEach((v,i)=>{if(v!=null&&(opt.dots||i===s.vals.length-1||s.vals[i+1]==null&&(i===0||s.vals[i-1]==null)))g+=`<circle cx="${X(i)}" cy="${Y(v)}" r="4" fill="var(${s.c})" stroke="var(--surface)" stroke-width="2"/>`})});
  g+=`<line class="gr-x" x1="0" x2="0" y1="${mt}" y2="${mt+ph}" stroke="var(--muted)" stroke-width="1" visibility="hidden"/><rect class="gr-hit" x="${ml}" y="0" width="${pw}" height="${H}" fill="transparent"/>`;
  el.innerHTML=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(opt.aria||"")}" style="touch-action:pan-y">${g}</svg>`;
  const svg=el.querySelector("svg"),xl=svg.querySelector(".gr-x");
  const move=ev=>{const r=svg.getBoundingClientRect(),x=(ev.clientX-r.left)*W/r.width,i=Math.max(0,Math.min(days.length-1,Math.round((x-ml)/(pw/(Math.max(1,days.length-1))))));
    xl.setAttribute("x1",X(i));xl.setAttribute("x2",X(i));xl.setAttribute("visibility","visible");
    const rows=series.map(s=>s.vals[i]==null?"":`<div><b>${fmtN(s.vals[i])}${opt.unit||""}</b> <span class="k" style="--c:var(${s.c})"></span>${esc(L(s.label))}</div>`).join("");
    grTipShow(ev,`<div style="opacity:.75;margin-bottom:2px">${dLbl(days[i],true)}</div>${rows||L("Pas de données")}`)};
  svg.addEventListener("pointermove",move);svg.addEventListener("pointerdown",move);
  svg.addEventListener("pointerleave",ev=>{if(ev.pointerType!=="touch"){grTipHide();xl.setAttribute("visibility","hidden")}});
}
// colonnes des calories : couleur d'état (✓ dans l'objectif, ↓ pas assez, ↑ trop) + trait de l'objectif
const KST=v=>v.k==null?null:v.k<v.t*.9?"low":v.k>v.t*1.1?"high":"ok";
const KLAB={ok:["✓","Dans l'objectif","--st-good"],low:["↓","Pas assez","--st-warn"],high:["↑","Trop","--st-bad"]};
function colChart(el,days,vals){
  if(!vals.some(v=>v.k!=null)){el.innerHTML=`<div class="gr-empty">${L("Pas encore de données sur cette période.")}</div>`;return}
  const W=Math.max(280,el.clientWidth||320),H=170,ml=38,mr=8,mt=14,mb=24,pw=W-ml-mr,ph=H-mt-mb,n=days.length,band=pw/n,bw=Math.min(24,band*.62);
  const top=niceMax(Math.max(...vals.map(v=>Math.max(v.k||0,v.t||0)))*1.05),Y=v=>mt+ph-v/top*ph;
  const kst=niceStep(top/4);let g="";for(let v=0;v<=top+1e-9;v+=kst){const y=Y(v);g+=`<line class="grid" x1="${ml}" x2="${W-mr}" y1="${y}" y2="${y}"/><text class="ax" x="${ml-6}" y="${y+4}" text-anchor="end">${fmtN(v)}</text>`}
  const every=n>10?7:1;
  vals.forEach((v,i)=>{const cx=ml+band*i+band/2;if((n-1-i)%every===0)g+=`<text class="ax" x="${cx}" y="${H-6}" text-anchor="middle">${dLbl(days[i])}</text>`;
    if(v.k==null||v.k<=0)return;const st=KST(v),y=Y(v.k),h=mt+ph-y,r=Math.min(4,h,bw/2),x0=cx-bw/2;
    g+=`<path d="M${x0} ${mt+ph}V${y+r}Q${x0} ${y} ${x0+r} ${y}H${x0+bw-r}Q${x0+bw} ${y} ${x0+bw} ${y+r}V${mt+ph}Z" fill="var(${KLAB[st][2]})"/>
      <rect class="gr-bar" data-i="${i}" x="${ml+band*i}" y="${mt}" width="${band}" height="${ph}" fill="transparent"/>`});
  const t=vals[vals.length-1].t;if(t){const y=Y(t);g+=`<line x1="${ml}" x2="${W-mr}" y1="${y}" y2="${y}" stroke="var(--ink)" stroke-width="1" opacity=".55"/><text class="lbl" x="${W-mr}" y="${y-5}" text-anchor="end">${L("Objectif")} ${fmtFull(t)} kcal</text>`}
  el.innerHTML=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${L("Calories par jour")}" style="touch-action:pan-y">${g}</svg>`;
  el.querySelector("svg").addEventListener("pointermove",ev=>{const b=ev.target.closest(".gr-bar");if(!b){grTipHide();return}const v=vals[+b.dataset.i],st=KLAB[KST(v)];
    grTipShow(ev,`<div style="opacity:.75;margin-bottom:2px">${dLbl(days[+b.dataset.i],true)}</div><b>${r0(v.k)} kcal</b> / ${r0(v.t)}<div>${st[0]} ${L(st[1])}</div>`)});
  el.querySelector("svg").addEventListener("pointerdown",ev=>ev.target.dispatchEvent(new PointerEvent("pointermove",ev)));
  el.querySelector("svg").addEventListener("pointerleave",ev=>{if(ev.pointerType!=="touch")grTipHide()});
}
function grData(days){const n=NU(),pl=n.plan||{},W=new Map(n.weights.map(w=>[w.day,w.kg]));
  return days.map(k=>{const l=dayLog(k),s=sumOf(l);return{k,has:l.length>0,kcal:s.kcal,p:s.p,c:s.c,f:s.f,t:pl.kcal?dayTarget(k).kcal:0,kg:W.has(k)?W.get(k):null}})}
function renderGraph(){
  if(!$("grMacros"))return;applySoon();
  grRange=data.ui.grRange||7;document.querySelectorAll("#grRange button").forEach(b=>b.setAttribute("aria-pressed",+b.dataset.range===grRange));
  const days=grDays(grRange),D=grData(days),n=NU(),pl=n.plan||{};
  // v51 (ticket #3) : courbes, colonnes, légendes et tableau dessinés par React (app/src/Charts.tsx) ; ancien rendu en secours
  if(window.SCIslands&&window.SCIslands.graph&&!window.__noIslands){try{
    window.SCIslands.graph({macros:$("grMacros"),weight:$("grWeight"),kcal:$("grKcal"),table:$("grTable"),macroLeg:$("grMacroLeg"),kcalLeg:$("grKcalLeg")},
      {days,D,macros:MAC.map(([k,l,v])=>({k,label:l,c:v,goal:pl[k]||undefined})),targetWeight:(n.profile&&n.profile.target)||null,
       widths:{macros:$("grMacros").clientWidth,weight:$("grWeight").clientWidth,kcal:$("grKcal").clientWidth},
       i18n:{L,MOL,MO,DOWL,DOW,lang:LANG},tip:{show:grTipShow,hide:grTipHide}});
    const tw=n.profile&&n.profile.target;$("grWeightSub").textContent=tw?`${L("en kg")} · ${L("objectif")} ${fmtN(tw)} kg`:L("en kg");
    const tk=D.find(d=>d.k===iso(today()));if(document.activeElement!==$("grWIn"))$("grWIn").value=tk&&tk.kg!=null?String(tk.kg).replace(".",LANG==="en"?".":","):"";
    renderReviews();return}catch(e){reportErr("island graph: "+(e&&e.message))}}
  $("grMacroLeg").innerHTML=MAC.map(([k,l,v])=>`<span><i style="--c:var(${v})"></i>${L(l)}${pl[k]?` <span>(${L("objectif")} ${pl[k]} g)</span>`:""}</span>`).join("");
  lineChart($("grMacros"),days,MAC.map(([k,l,v])=>({label:l,c:v,vals:D.map(d=>d.has?r1(d[k]):null)})),{zero:true,unit:" g",aria:L("Macros par jour")});
  const tw=n.profile&&n.profile.target;$("grWeightSub").textContent=tw?`${L("en kg")} · ${L("objectif")} ${fmtN(tw)} kg`:L("en kg");
  lineChart($("grWeight"),days,[{label:"Poids",c:"--m-p",vals:D.map(d=>d.kg)}],{dots:true,unit:" kg",ref:tw?{v:tw,label:`${L("Objectif")} ${fmtN(tw)} kg`}:null,empty:"Entre ton poids ci-dessus pour suivre son évolution.",aria:L("Poids")});
  const tk=D.find(d=>d.k===iso(today()));if(document.activeElement!==$("grWIn"))$("grWIn").value=tk&&tk.kg!=null?String(tk.kg).replace(".",LANG==="en"?".":","):"";
  $("grKcalLeg").innerHTML=Object.values(KLAB).map(([ic,l,v])=>`<span><i class="box" style="--c:var(${v})"></i>${ic} ${L(l)}</span>`).join("");
  colChart($("grKcal"),days,D.map(d=>({k:d.has?d.kcal:null,t:d.t})));
  $("grTable").innerHTML=`<table class="gr-tbl"><thead><tr><th>${L("Jour")}</th><th>kcal</th><th>P</th><th>G</th><th>L</th><th>kg</th></tr></thead><tbody>${D.slice().reverse().map(d=>`<tr><td>${dLbl(d.k,true)}</td><td>${d.has?r0(d.kcal):"–"}</td><td>${d.has?r0(d.p):"–"}</td><td>${d.has?r0(d.c):"–"}</td><td>${d.has?r0(d.f):"–"}</td><td>${d.kg!=null?fmtN(d.kg):"–"}</td></tr>`).join("")}</tbody></table>`;
  renderReviews();
}
$("grRange").addEventListener("click",e=>{const b=e.target.closest("[data-range]");if(!b)return;data.ui.grRange=+b.dataset.range;saveUI();renderGraph()});
$("grWForm").addEventListener("submit",e=>{e.preventDefault();const kg=numIn($("grWIn").value);if(!(kg>=25&&kg<=300)){toast("Indique ton poids en kg.");return}
  const n=NU(),k=iso(today()),w=n.weights.find(x=>x.day===k);if(w){w.kg=kg;w.upd=Date.now()}else n.weights.push({id:uid(),day:k,kg,upd:Date.now()});
  save();$("grWIn").blur();renderGraph();toast("Poids enregistré")});
addEventListener("resize",()=>{if(data.ui.view==="graph")renderGraph()});
// --- bilans : commentaire du jour, de la semaine, et suivi semaine par semaine ---
const weekKey=d=>iso(mondayOf(d||new Date()));
function grPayload(days){const D=grData(days),n=NU(),pl=n.plan||{};
  return{targets:{kcal:pl.kcal,protein_g:pl.p,carbs_g:pl.c,fat_g:pl.f},goal:n.profile&&n.profile.goal,target_weight_kg:n.profile&&n.profile.target||null,
    days:D.map(d=>({date:d.k,logged:d.has,kcal:r0(d.kcal),protein_g:r0(d.p),carbs_g:r0(d.c),fat_g:r0(d.f),weight_kg:d.kg,foods:dayLog(d.k).map(x=>x.name).slice(0,20)}))}}
let revBusy="";
function revHtml(r,scope){
  const head=scope==="day"?L("Commentaire du jour"):`${L("Commentaire de la semaine")}`;
  if(revBusy===scope)return `<h3>${head}</h3><div id="revLoad-${scope}"></div>`;
  if(!r)return `<h3>${head}</h3><p class="muted">${L(scope==="day"?"Un résumé de ta journée : macros, poids et calories.":"Ce que tu as bien fait cette semaine, ce qui reste à améliorer, et des pistes concrètes.")}</p><button type="button" class="btn" data-rev="${scope}">${L("Générer")}</button>`;
  const li=a=>a&&a.length?`<ul>${a.map(x=>`<li class="notr">${esc(x)}</li>`).join("")}</ul>`:"";
  return `<h3>${head}<button type="button" class="mini" data-rev="${scope}">↻ ${L("Actualiser")}</button></h3><p class="notr">${esc(r.summary)}</p>
    ${r.good&&r.good.length?`<div class="lab">✓ ${L("Bien joué")}</div>${li(r.good)}`:""}${r.improve&&r.improve.length?`<div class="lab">↓ ${L("À améliorer")}</div>${li(r.improve)}`:""}${r.tips&&r.tips.length?`<div class="lab">→ ${L("Pistes")}</div>${li(r.tips)}`:""}
    <span class="small muted">${L("Mis à jour")} ${fmtWhen(Date.parse(r.at))}</span>`;
}
function renderReviews(){
  const n=NU(),rv=n.rev||{},dk=iso(today()),wk=weekKey();
  // v52 (ticket #3) : commentaires et historique dessinés par React (app/src/Reviews.tsx) ; l'animation de chargement reste celle de l'app
  if(window.SCIslands&&window.SCIslands.reviews&&!window.__noIslands){try{
    window.SCIslands.reviews({day:$("grDay"),week:$("grWeek"),weeks:$("grWeeks")},{day:rv.day&&rv.day.key===dk?rv.day:null,week:rv.week&&rv.week.key===wk?rv.week:null,
      weeks:n.weeks.slice().sort((a,b)=>b.id.localeCompare(a.id)),busy:revBusy,i18n:{L,MOL,MO,DOWL}});
    ["day","week"].forEach(sc=>{const el=$("revLoad-"+sc);if(el)revStops[sc]=nuLoading(el,sc==="day"?["Lecture de ta journée…","Analyse des macros…","Rédaction du commentaire…"]:["Lecture de ta semaine…","Analyse des tendances…","Recherche de pistes d'amélioration…"])});
    return}catch(e){reportErr("island reviews: "+(e&&e.message))}}
  $("grDay").innerHTML=revHtml(rv.day&&rv.day.key===dk?rv.day:null,"day");
  $("grWeek").innerHTML=revHtml(rv.week&&rv.week.key===wk?rv.week:null,"week");
  ["day","week"].forEach(sc=>{const el=$("revLoad-"+sc);if(el)revStops[sc]=nuLoading(el,sc==="day"?["Lecture de ta journée…","Analyse des macros…","Rédaction du commentaire…"]:["Lecture de ta semaine…","Analyse des tendances…","Recherche de pistes d'amélioration…"])});
  const past=n.weeks.slice().sort((a,b)=>b.id.localeCompare(a.id));
  $("grWeeks").innerHTML=past.length?past.map(w=>{const m=parse(w.id),s=new Date(m);s.setDate(s.getDate()+6);
    return `<details class="setsec gr-wk"><summary><span>${L("Semaine du")} ${m.getDate()} ${MO[m.getMonth()]} ${L("au")} ${s.getDate()} ${MO[s.getMonth()]}</span><svg class="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></summary><div class="setsec-in gr-rev" style="padding-top:0">${revHtml(w,"past").replace(/<h3>.*?<\/h3>/,"")}</div></details>`}).join("")
    :`<div class="card"><div class="empty">${L("Génère le commentaire de la semaine : chaque semaine sera gardée ici pour suivre tes progrès.")}</div></div>`;
}
const revStops={};
document.addEventListener("click",async e=>{const b=e.target.closest("[data-rev]");if(!b||revBusy||!nutriAllowed())return;const scope=b.dataset.rev;
  revBusy=scope;renderReviews();
  try{const days=scope==="day"?grDays(7):grDays(7),r=await nuCall("bilan",{scope,data:{...grPayload(days),today:iso(today())}});
    const n=NU(),rec={key:scope==="day"?iso(today()):weekKey(),summary:String(r.summary||""),good:(r.good||[]).map(String),improve:(r.improve||[]).map(String),tips:(r.tips||[]).map(String),at:new Date().toISOString()};
    n.rev=n.rev||{};n.rev[scope]=rec;
    if(scope==="week"){const w=n.weeks.find(x=>x.id===rec.key);if(w)Object.assign(w,rec,{upd:Date.now()});else n.weeks.push({id:rec.key,...rec,upd:Date.now()})}
    n.upd=Date.now();save();
  }catch(ex){toast(nuErrMsg(ex))}
  (revStops[scope]||(()=>{}))();revBusy="";renderReviews();
});
