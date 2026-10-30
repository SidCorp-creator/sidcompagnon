/* ---------- v47 : vues semaine / mois / année de la nutrition (#16) et copie d'un repas sur d'autres jours (#15) ---------- */
// mêmes grilles que l'agenda (monthGrid / yearGrid, mêmes classes .day, .ym)
let nuRange=null,nuRY=0,nuRM=0,nuRW="";
const dowHead=()=>[1,2,3,4,5,6,0].map(i=>`<span>${esc(String(DOWL[i]||"").slice(0,1).toUpperCase())}</span>`).join("");
// état d'un jour : dans l'objectif (90 à 105 %), en dessous, au-dessus ; rien si aucun repas
function nuDays(){const m={};for(const x of NU().log||[]){if(!x||!x.day)continue;m[x.day]=(m[x.day]||0)+(+x.kcal||0)}return m}
function nuSt(by,k){if(by[k]==null)return "";const t=dayTarget(k).kcal||1,r=by[k]/t;return r>1.05?"over":r>=.9?"ok":"under"}
function nuCalOpen(mode){const d=parse(nuDay);nuRange=mode;nuRY=d.getFullYear();nuRM=d.getMonth();nuRW=wKey(nuDay);renderNuCal()}
function renderNuCal(){const box=$("nuCal"),btn=$("nuDayBtn");if(!box)return;box.hidden=!nuRange;if(btn)btn.setAttribute("aria-expanded",String(!!nuRange));if(!nuRange)return;
  // v50 (ticket #3) : premier écran migré en TypeScript + React (app/src/NutritionCalendar.tsx, build site/react/islands.js) ;
  // même rendu, mêmes data-* (les clics restent gérés ici). Si le module n'est pas chargé, l'ancien rendu ci-dessous sert de secours.
  if(window.SCIslands&&window.SCIslands.nuCal&&!window.__noIslands){try{window.SCIslands.nuCal(box,{range:nuRange,year:nuRY,month:nuRM,weekStart:nuRW,today:iso(today()),selected:nuDay,byDay:nuDays(),target:k=>dayTarget(k).kcal||0,i18n:{L,MOL,MO,DOWL}});return}catch(e){reportErr&&reportErr("island nuCal: "+(e&&e.message))}}
  const tIso=iso(today()),by=nuDays();let title="",body="",tot=0,nd=0,start="";
  const sum=()=>`<div class="small muted nu-cal-sum">${nd?`${nd} ${L(nd>1?"jours notés":"jour noté")} · ${L("moyenne")} ${r0(tot/nd)} kcal`:L("Aucun repas noté sur cette période.")}</div>`;
  const leg=`<div class="nu-leg small muted"><span><i class="nu-st ok"></i>${L("Dans l'objectif")}</span><span><i class="nu-st under"></i>${L("En dessous")}</span><span><i class="nu-st over"></i>${L("Au-dessus")}</span></div>`;
  if(nuRange==="week"){const m=parse(nuRW),e=new Date(m);e.setDate(e.getDate()+6);start=nuRW;
    title=`${m.getDate()} ${MO[m.getMonth()]} – ${e.getDate()} ${MO[e.getMonth()]} ${e.getFullYear()}`;
    let rows="";for(let i=0;i<7;i++){const d=new Date(m);d.setDate(d.getDate()+i);const k=iso(d),st=nuSt(by,k),tg=dayTarget(k).kcal||0,v=by[k];if(v!=null){tot+=v;nd++}
      rows+=`<button type="button" class="nwk-row ${k===nuDay?"on":""} ${st}" data-nuday="${k}" ${k>tIso?"disabled":""}><span class="nwk-d"><b>${esc(DOWL[d.getDay()])}</b><small>${d.getDate()} ${MO[d.getMonth()]}</small></span><span class="nwk-bar"><i style="width:${tg&&v?Math.min(100,v/tg*100):0}%"></i></span><span class="nwk-k">${v!=null?r0(v):"–"}${v!=null&&tg?`<small> / ${tg}</small>`:""}</span></button>`}
    body=`<div class="nwk">${rows}</div>`+leg+sum()}
  else if(nuRange==="month"){title=`${MOL[nuRM]} ${nuRY}`;start=iso(new Date(nuRY,nuRM,1));
    const g=monthGrid(nuRY,nuRM,(k,d)=>{const st=nuSt(by,k);if(st){tot+=by[k];nd++}
      return `<button type="button" class="day ${k===tIso?"today":""} ${k===nuDay?"sel":""} ${k<tIso?"past":""}" data-nuday="${k}" ${k>tIso?"disabled":""} aria-label="${d} ${MOL[nuRM]}${st?" · "+r0(by[k])+" kcal":""}"><span class="num">${d}</span><span class="marks">${st?`<span class="dots"><i class="nu-st ${st}"></i></span>`:""}</span></button>`});
    body=`<div class="cal-grid cal-dow">${dowHead()}</div><div class="cal-grid nu-mgrid">${g}</div>`+leg+sum()}
  else{title=String(nuRY);start=iso(new Date(nuRY,0,1));
    for(const k in by)if(k.startsWith(nuRY+"-")){tot+=by[k];nd++}
    body=`<div class="yr-grid nu-ygrid">${yearGrid(nuRY,k=>{const st=nuSt(by,k);return `${k===tIso?"td":st?"ev nu-"+st:""} ${k<tIso?"past":""}`})}</div><p class="small muted" style="text-align:center;margin:8px 0 0">${L("Touche un mois pour l'ouvrir.")}</p>`+sum()}
  // période suivante seulement si elle a déjà commencé
  const nx=nuRange==="week"?(()=>{const d=parse(nuRW);d.setDate(d.getDate()+7);return iso(d)})():nuRange==="month"?iso(new Date(nuRY,nuRM+1,1)):iso(new Date(nuRY+1,0,1));
  box.innerHTML=`<div class="seg nu-cal-seg" role="group" aria-label="${L("Vue")}">${["week","month","year"].map(m=>`<button type="button" data-nurange="${m}" aria-pressed="${m===nuRange}">${L({week:"Semaine",month:"Mois",year:"Année"}[m])}</button>`).join("")}</div>
    <div class="cal-head"><button type="button" class="cal-nav" data-nurn="-1" aria-label="${L("Période précédente")}">‹</button><b class="nu-cal-t">${esc(title)}</b><button type="button" class="cal-nav" data-nurn="1" aria-label="${L("Période suivante")}" ${nx>tIso?"disabled":""}>›</button></div>
    ${body}<button type="button" class="linkbtn nu-cal-x" data-nurange="">${L("Fermer le calendrier")}</button>`}
$("nuDayBtn").addEventListener("click",()=>{if(nuRange){nuRange=null;renderNuCal()}else nuCalOpen("month")});
window.addEventListener("sc-islands",()=>{if(nuRange)renderNuCal();if(data&&data.ui&&data.ui.view==="graph")renderGraph();if(data&&data.ui&&data.ui.view==="pomo")renderPomo();if(data&&data.ui&&data.ui.view==="muscu")renderMuscu();if(session&&data&&data.tasks){renderPlan();renderTodos();renderHome();try{setSync();renderCals()}catch(e){}}if(session&&data&&data.ui){const v=data.ui.view||"home";renderNav(v);renderVhead(v);renderSide(v)}
  // v63 : claviers de code dessinés au démarrage par l'ancien code (avant le module) : React les reprend (touches gérées par padTap sur le conteneur)
  if(!session&&$("authFeats")&&$("authFeats").children.length)renderAuthFeats();
  for(const [id,attr] of [["pinPad","pin"],["psPad","ps"]]){const el=$(id);if(el&&el.children.length&&!Object.keys(el).some(k=>k.startsWith("__reactContainer"))){const old=el.innerHTML;try{el.innerHTML="";window.SCIslands.keypad(el,{attr,del:attr==="ps"?agI18n().tr(L("Effacer")):agI18n().tr("Effacer")})}catch(e){el.innerHTML=old;reportErr("island keypad: "+(e&&e.message))}}}}); // en cas d'erreur, l'ancien clavier revient // module React chargé après coup : on redessine avec lui
$("nuCal").addEventListener("click",e=>{const b=e.target.closest("button");if(!b||b.disabled)return;
  if(b.dataset.nurange!==undefined){if(b.dataset.nurange)nuCalOpen(b.dataset.nurange);else{nuRange=null;renderNuCal()}return}
  if(b.dataset.nurn){const s=+b.dataset.nurn;if(nuRange==="week"){const d=parse(nuRW);d.setDate(d.getDate()+7*s);nuRW=iso(d)}
    else if(nuRange==="month"){nuRM+=s;if(nuRM<0){nuRM=11;nuRY--}if(nuRM>11){nuRM=0;nuRY++}}else nuRY+=s;renderNuCal();return}
  if(b.dataset.ym){nuRM=+b.dataset.ym;nuRange="month";renderNuCal();return}
  if(b.dataset.nuday){const w=nuRange==="week";if(!w)nuRange=null;nuSetDay(b.dataset.nuday);if(!w)$("nuDayBtn").scrollIntoView({block:"nearest"})}});
// copier un repas (tout le plat) sur un ou plusieurs autres jours ; annulable
let nuCp=null;
function nuCopyOpen(g){const items=NU().log.filter(x=>(x.grp||x.id)===g);if(!items.length)return;const d=parse(items[0].day||nuDay);
  nuCp={g,y:d.getFullYear(),m:d.getMonth(),sel:new Set(),src:items[0].day};$("nuCopyTitle").textContent=`${L("Copier")} « ${items[0].gname||items[0].name} »`;renderNuCopy();$("nuCopySheet").hidden=false}
function renderNuCopy(){if(!nuCp)return;const tIso=iso(today()),mx=(()=>{const d=today();d.setDate(d.getDate()+14);return iso(d)})(),n=nuCp.sel.size;
  // v59 (#3) : fenêtre dessinée par React (app/src/NuExtra.tsx)
  if(nuIsl("nuCopy")){try{window.SCIslands.nuCopy($("nuCopyBody"),{MOL,i18n:agI18n(),c:{y:nuCp.y,m:nuCp.m,sel:[...nuCp.sel],src:nuCp.src,today:tIso,max:mx,nextOff:iso(new Date(nuCp.y,nuCp.m+1,1))>mx,
    dow:[1,2,3,4,5,6,0].map(i=>String(DOWL[i]||"").slice(0,1).toUpperCase())}});return}catch(e){reportErr("island nuCopy: "+(e&&e.message))}}
  $("nuCopyBody").innerHTML=`<p class="small muted" style="margin:0 0 8px">${L("Touche les jours où tu as mangé (ou mangeras) la même chose.")}</p>
    <div class="cal-head"><button type="button" class="cal-nav" data-nucpn="-1" aria-label="${L("Mois précédent")}">‹</button><b>${MOL[nuCp.m]} ${nuCp.y}</b><button type="button" class="cal-nav" data-nucpn="1" aria-label="${L("Mois suivant")}" ${iso(new Date(nuCp.y,nuCp.m+1,1))>mx?"disabled":""}>›</button></div>
    <div class="cal-grid cal-dow">${dowHead()}</div>
    <div class="cal-grid nu-cpgrid">${monthGrid(nuCp.y,nuCp.m,(k,d)=>`<button type="button" class="day ${k===tIso?"today":""} ${nuCp.sel.has(k)?"sel":""} ${k===nuCp.src?"nu-cp-src":""}" data-nucpd="${k}" aria-pressed="${nuCp.sel.has(k)}" ${k>mx||k===nuCp.src?"disabled":""} aria-label="${d} ${MOL[nuCp.m]}"><span class="num">${d}</span></button>`)}</div>
    <button type="button" class="btn" id="nuCopyGo" ${n?"":"disabled"} style="width:100%;margin-top:12px">${n?`${L("Copier sur")} ${n} ${L(n>1?"jours":"jour")}`:L("Choisis au moins un jour")}</button>`}
function nuCopyDo(){const src=NU().log.filter(x=>(x.grp||x.id)===nuCp.g);if(!src.length||!nuCp.sel.size)return;const ids=[],now=Date.now(),days=[...nuCp.sel].sort();
  for(const k of days){const grp=src.length>1||src[0].grp?uid():null;
    for(const x of src){const at=parse(k),t=new Date(x.at||Date.now());at.setHours(t.getHours(),t.getMinutes());const id=uid();ids.push(id);
      const y={...x,id,day:k,at:at.toISOString(),upd:now};if(grp)y.grp=grp;else delete y.grp;NU().log.push(y)}}
  NU().upd=now;save();$("nuCopySheet").hidden=true;nuCp=null;renderNutri();
  toastAct(`${L("Repas copié sur")} ${days.length} ${L(days.length>1?"jours":"jour")}`,"Annuler",()=>{ids.forEach(tomb);NU().log=NU().log.filter(x=>!ids.includes(x.id));save();renderNutri();toast("Annulé")})}
$("nuCopyBody").addEventListener("click",e=>{const b=e.target.closest("button");if(!b||b.disabled||!nuCp)return;
  if(b.dataset.nucpn){nuCp.m+= +b.dataset.nucpn;if(nuCp.m<0){nuCp.m=11;nuCp.y--}if(nuCp.m>11){nuCp.m=0;nuCp.y++}renderNuCopy();return}
  if(b.dataset.nucpd){const k=b.dataset.nucpd;nuCp.sel.has(k)?nuCp.sel.delete(k):nuCp.sel.add(k);renderNuCopy();return}
  if(b.id==="nuCopyGo")nuCopyDo()});
$("nuCopyClose").addEventListener("click",()=>{$("nuCopySheet").hidden=true;nuCp=null});
$("nuCopySheet").addEventListener("click",e=>{if(e.target.id==="nuCopySheet"){$("nuCopySheet").hidden=true;nuCp=null}});
// saisie ou correction à la main
function nuOpenSheet(id){
  const x=id?NU().log.find(e=>e.id===id):null;nuEditId=x?x.id:null;
  $("nuSheetTitle").textContent=L(x?"Modifier":"Ajouter à la main");$("nuEDel").hidden=!x;$("nuEDel").classList.remove("armed");$("nuEDel").textContent=L("Supprimer");
  const d=x?new Date(x.at):null;
  $("nuEName").value=x?x.name:($("nuAsk").value.trim());$("nuEQty").value=x?x.qty:"";$("nuETime").value=d?`${two(d.getHours())}:${two(d.getMinutes())}`:"";
  $("nuEKcal").value=x?x.kcal:"";$("nuEP").value=x?x.p:"";$("nuEC").value=x?x.c:"";$("nuEF").value=x?x.f:"";
  nuEBase=x?{qty:x.qty,kcal:x.kcal,p:x.p,c:x.c,f:x.f}:null;$("nuEHint").hidden=true;
  $("nuSheet").hidden=false;
}
$("nuManual").addEventListener("click",()=>nuOpenSheet(null));
// quantité lue dans un texte : « 1/3 de baguette » → 0,333 ; « 150 g » → 150 ; « ½ » → 0,5 ; « 2 oeufs » → 2
function qtyNum(t){t=String(t||"").replace(/½/g,"1/2").replace(/¼/g,"1/4").replace(/¾/g,"3/4").replace(",",".");
  let m=t.match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/);if(m&&+m[2])return +m[1]/+m[2];m=t.match(/\d+(?:\.\d+)?/);return m?+m[0]:0}
let nuEBase=null;
$("nuEQty").addEventListener("input",()=>{if(!nuEBase)return;const a=qtyNum(nuEBase.qty),b=qtyNum($("nuEQty").value),h=$("nuEHint");
  if(a>0&&b>0){const k=b/a;$("nuEKcal").value=r0(nuEBase.kcal*k);$("nuEP").value=r1(nuEBase.p*k);$("nuEC").value=r1(nuEBase.c*k);$("nuEF").value=r1(nuEBase.f*k);
    h.hidden=k===1;nuEHintSet("ok")}
  else{h.hidden=false;nuEHintSet("none")}});
// v69 (#3) : aide du recalcul (React, ancien rendu en secours)
function nuEHintSet(st){const h=$("nuEHint");if(shIsl("nuEHint")){try{window.SCIslands.nuEHint(h,{st,i18n:agI18n()});return}catch(e){reportErr("island nuEHint: "+(e&&e.message));try{window.SCIslands.unmount(h)}catch(_){}}}
  h.innerHTML=st==="ok"?`✓ ${L("Calories recalculées selon la quantité")}`:`${L("Quantité sans chiffre : je ne peux pas recalculer seul.")}<button type="button" class="mini" id="nuERecalc">${st==="busy"?`<span class="spin"></span>`:`↻ ${L("Recalculer")}`}</button>`}
$("nuEHint").addEventListener("click",async e=>{if(!e.target.closest("#nuERecalc")||nuBusy)return;const q=`${$("nuEQty").value.trim()} ${$("nuEName").value.trim()}`.trim();if(!q)return;
  nuBusy="recalc";nuEHintSet("busy");
  try{const r=await nuCall("aliment",{text:q}),t=(r.items||[]).reduce((s,x)=>({k:s.k+(+x.kcal||0),p:s.p+(+x.protein_g||0),c:s.c+(+x.carbs_g||0),f:s.f+(+x.fat_g||0)}),{k:0,p:0,c:0,f:0});
    $("nuEKcal").value=r0(t.k);$("nuEP").value=r1(t.p);$("nuEC").value=r1(t.c);$("nuEF").value=r1(t.f);nuEHintSet("ok")}
  catch(ex){toast(nuErrMsg(ex));nuEHintSet("none")}nuBusy=""});
$("nuSheetClose").addEventListener("click",()=>{$("nuSheet").hidden=true});
$("nuSheet").addEventListener("click",e=>{if(e.target.id==="nuSheet")$("nuSheet").hidden=true});
$("nuEntryForm").addEventListener("submit",e=>{
  e.preventDefault();const name=$("nuEName").value.trim(),num=id=>Math.max(0,numIn($(id).value));
  if(!name){toast("Indique l'aliment");return}
  const v={name,qty:$("nuEQty").value.trim(),kcal:num("nuEKcal"),p:num("nuEP"),c:num("nuEC"),f:num("nuEF")};
  if(nuEditId){const x=NU().log.find(e=>e.id===nuEditId);if(x){Object.assign(x,{...v,kcal:r0(v.kcal),p:r1(v.p),c:r1(v.c),f:r1(v.f),upd:Date.now()});
      if($("nuETime").value){const d=parse(x.day),[h,m]=$("nuETime").value.split(":").map(Number);d.setHours(h,m);NU().log.filter(y=>(y.grp||y.id)===(x.grp||x.id)).forEach(y=>y.at=d.toISOString())}save()}}
  else nuAddItems([v],$("nuETime").value,{name:v.name,em:"✍️"});
  $("nuSheet").hidden=true;renderNutri();toast("Enregistré");
});
$("nuEDel").addEventListener("click",e=>{const b=e.currentTarget;if(!nuEditId)return;
  if(!b.classList.contains("armed")){b.classList.add("armed");b.textContent=L("Confirmer la suppression");return}
  tomb(nuEditId);NU().log=NU().log.filter(x=>x.id!==nuEditId);save();$("nuSheet").hidden=true;renderNutri();toast("Supprimé")});
// --- menus sur mesure : journée complète ou un seul repas, calories précises par repas, menu modifiable ---
// « meal » = repas unique de la journée (OMAD)
const SLOT={breakfast:["Petit-déjeuner","sunrise",25],lunch:["Déjeuner","sun",35],snack:["Collation","apple",10],dinner:["Dîner","moon",30],meal:["Repas unique (OMAD)","utensils",100]};
const MAINS=["breakfast","lunch","dinner"];
// repas choisis : petit-déj / déjeuner / dîner (oui ou non) + nombre de collations, placées entre les repas
function mpSlots(){const mp=nuMP(),on=MAINS.filter(s=>mp.pick[s]),sn=mp.snacks||0;
  if(on.length===1&&!sn)return["meal"];
  if(!on.length)return Array(Math.max(1,sn)).fill("snack");
  const out=[];let left=sn;on.forEach((s,i)=>{out.push(s);if(left&&i<on.length-1){out.push("snack");left--}});while(left-->0)out.push("snack");return out}
const slotsFor=n=>({1:["meal"],2:["lunch","dinner"],3:["breakfast","lunch","dinner"],4:["breakfast","lunch","snack","dinner"],5:["breakfast","snack","lunch","snack","dinner"]})[n]||["breakfast","snack","lunch","snack","dinner",...Array(n-5).fill("snack")];
const slotName=s=>SLOT[s]?SLOT[s][0]:"Repas";
const splitKcal=(total,slots)=>{const w=slots.map(s=>SLOT[s][2]),t=w.reduce((a,b)=>a+b,0);return w.map(x=>Math.round(total*x/t/10)*10)};
// v31 : « à inclure » et « à éviter » sont propres à chaque type de repas (journée, petit-déj, déjeuner…) : rien n'est recopié d'un repas à l'autre
const mpPref=(mp,type,k)=>{const p=mp.pp&&mp.pp[type];if(p&&p[k]!=null)return p[k];return type==="day"?(k==="include"?mp.include:mp.exclude)||"":""};
const mpSet=(mp,type,k,v)=>{mp.pp=mp.pp||{};mp.pp[type]={...(mp.pp[type]||{}),[k]:v}};
const nuMP=()=>{const n=NU();n.menuPrefs=n.menuPrefs||{};const m=n.menuPrefs;m.type=m.type||"day";m.one=m.one||{};
  // ancien réglage « repas par jour » → choix des repas
  if(!m.pick){const sl=slotsFor(m.meals||3);m.pick={breakfast:sl.includes("breakfast"),lunch:sl.includes("lunch")||sl.includes("meal"),dinner:sl.includes("dinner")};m.snacks=sl.filter(s=>s==="snack").length}
  return m};
// calories par repas : toujours ramenées à l'objectif du jour, en gardant la répartition choisie
const mpKcals=()=>{const mp=nuMP(),sl=mpSlots(),tg=dayTarget(iso(today())).kcal;
  if(!(mp.kcals&&mp.kcals.length===sl.length&&mp.kcalsFor===sl.join()))return splitKcal(tg,sl);
  const tot=mp.kcals.reduce((a,b)=>a+b,0);if(!tot||Math.abs(tot-tg)<=20)return mp.kcals;
  return fitKcals(mp.kcals.map(x=>x*tg/tot),tg)};
// arrondit à 10 kcal et corrige le dernier repas pour que le total tombe juste
function fitKcals(arr,tg){const out=arr.map(x=>Math.max(0,Math.round(x/10)*10));const d=tg-out.reduce((a,b)=>a+b,0);
  for(let i=out.length-1;i>=0&&d;i--){if(out[i]+d>=0){out[i]+=d;break}}return out}
// un repas change : les autres s'adaptent, proportionnellement à leur part actuelle
function rebalance(k,i,v,tg){v=Math.max(0,Math.min(tg,v));const rest=tg-v,others=k.reduce((a,x,j)=>j===i?a:a+x,0),n=k.length-1;
  const out=k.map((x,j)=>j===i?v:Math.round((others>0?x*rest/others:rest/n)/10)*10);
  let big=-1;out.forEach((x,j)=>{if(j!==i&&(big<0||x>out[big]))big=j});
  if(big>=0)out[big]=Math.max(0,out[big]+tg-out.reduce((a,b)=>a+b,0));return out}
const oneKcal=slot=>{const mp=nuMP();return mp.one[slot]||splitKcal(dayTarget(iso(today())).kcal,slotsFor(4))[["breakfast","lunch","snack","dinner"].indexOf(slot)]};
let nuMkForce=false; // v64 : redessiner les calories par repas même pendant la saisie (après un changement de répartition)
const nuMkClear=()=>{if(Object.keys($("nuMealKcal")).some(k=>k.startsWith("__reactContainer")))nuMkForce=true;else $("nuMealKcal").innerHTML=""};
function renderMenuForm(){
  const mp=nuMP(),day=mp.type==="day";
  document.querySelectorAll("#nuMType button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.mtype===mp.type));
  $("nuMDay").hidden=!day;$("nuMOne").hidden=day;$("nuSnacks").textContent=mp.snacks||0;
  if(shIsl("nuSlots")){try{window.SCIslands.nuSlots($("nuSlots"),{i18n:agI18n(),slots:MAINS.map(s=>({k:s,on:!!mp.pick[s],icon:IC(SLOT[s][1]),name:SLOT[s][0]}))})}catch(e){reportErr("island nuSlots: "+(e&&e.message))}}
  else $("nuSlots").innerHTML=MAINS.map(s=>`<button type="button" class="pill meal-tg" data-pick="${s}" aria-pressed="${!!mp.pick[s]}"><span class="tg-box" aria-hidden="true">${mp.pick[s]?"✓":""}</span>${IC(SLOT[s][1])} ${L(SLOT[s][0])}</button>`).join("");
  const sl=mpSlots();
  $("nuMenuBtn").textContent=L(day?(sl.length===1&&sl[0]==="meal"?"Générer mon repas unique":"Générer ma journée"):{breakfast:"Générer un petit-déjeuner",lunch:"Générer un déjeuner",snack:"Générer une collation",dinner:"Générer un dîner"}[mp.type]);
  if(day){const k=mpKcals(),tot=k.reduce((a,b)=>a+b,0),tg=dayTarget(iso(today())).kcal;
    const mkIsl=shIsl("nuMealKcal");
    if(mkIsl&&(nuMkForce||!$("nuMealKcal").contains(document.activeElement))){nuMkForce=false;try{window.SCIslands.nuMealKcal($("nuMealKcal"),{i18n:agI18n(),rows:sl.map((s,i)=>({icon:IC(SLOT[s][1]),name:slotName(s),kcal:k[i]}))});
      $("nuMealKcal").querySelectorAll("input").forEach(i=>{if(i!==document.activeElement&&i.value!==i.defaultValue)i.value=i.defaultValue})}catch(e){reportErr("island nuMealKcal: "+(e&&e.message))}}
    else if(!mkIsl&&!$("nuMealKcal").contains(document.activeElement))$("nuMealKcal").innerHTML=sl.map((s,i)=>`<div class="row"><span class="em">${IC(SLOT[s][1])}</span><span class="grow">${L(slotName(s))}</span><span class="nu-in"><input data-mk="${i}" type="text" inputmode="numeric" maxlength="4" value="${k[i]}" aria-label="${L("Calories")} ${L(slotName(s))}"><i>kcal</i></span></div>`).join("");
    if(shIsl("nuMkTot")){try{window.SCIslands.nuMkTot($("nuMkTot"),{tot:fmtFull(tot),tg:fmtFull(tg),reset:!!mp.kcals,i18n:agI18n()})}catch(e){reportErr("island nuMkTot: "+(e&&e.message))}}
    else $("nuMkTot").innerHTML=`${L("Total")} <b>${fmtFull(tot)}</b> / ${fmtFull(tg)} kcal ✓${mp.kcals?` <button type="button" class="mini" data-mkreset="1">${L("Répartition conseillée")}</button>`:""}`;
    document.querySelector(".nu-mk-note").hidden=sl.length<2}
  else if(document.activeElement!==$("nuOneKcal"))$("nuOneKcal").value=oneKcal(mp.type);
  if(document.activeElement!==$("nuInclude"))$("nuInclude").value=mpPref(mp,mp.type,"include");if(document.activeElement!==$("nuExclude"))$("nuExclude").value=mpPref(mp,mp.type,"exclude");autoGrow($("nuInclude"));autoGrow($("nuExclude"));
}
$("nuMType").addEventListener("click",e=>{const b=e.target.closest("[data-mtype]");if(!b)return;nuMP().type=b.dataset.mtype;NU().upd=Date.now();save();renderMenuForm()});
$("nuMenuSec").addEventListener("click",e=>{const b=e.target.closest("[data-pick],[data-snacks],[data-mkreset]");if(!b)return;const mp=nuMP();
  if(b.dataset.mkreset)mp.kcals=null;
  else if(b.dataset.pick){const s=b.dataset.pick;mp.pick[s]=!mp.pick[s];if(!MAINS.some(x=>mp.pick[x])&&!mp.snacks){mp.pick[s]=true;toast("Garde au moins un repas");return}mp.kcals=null}
  else{mp.snacks=Math.min(4,Math.max(0,(mp.snacks||0)+ +b.dataset.snacks));if(!MAINS.some(x=>mp.pick[x])&&!mp.snacks)mp.snacks=1;mp.kcals=null}
  NU().upd=Date.now();save();nuMkClear();renderMenuForm()});
$("nuMealKcal").addEventListener("change",e=>{const i=e.target.dataset.mk;if(i===undefined)return;const mp=nuMP(),tg=dayTarget(iso(today())).kcal,k=mpKcals().slice();
  const v=Math.round(numIn(e.target.value)/10)*10;if(v>tg)toast(`${L("Maximum")} ${fmtFull(tg)} kcal`);
  mp.kcals=k.length>1?rebalance(k,+i,v,tg):[tg];mp.kcalsFor=mpSlots().join();NU().upd=Date.now();save();nuMkClear();renderMenuForm()});
$("nuOneKcal").addEventListener("change",e=>{const mp=nuMP();mp.one[mp.type]=Math.max(0,Math.round(numIn(e.target.value)));NU().upd=Date.now();save()});
["nuInclude","nuExclude"].forEach(id=>$(id).addEventListener("change",e=>{const mp=nuMP();mpSet(mp,mp.type,id==="nuInclude"?"include":"exclude",e.target.value.trim());NU().upd=Date.now();save()}));
// champs qui grandissent avec le texte
function autoGrow(t){if(!t||t.tagName!=="TEXTAREA")return;t.style.height="auto";t.style.height=Math.min(t.scrollHeight+2,220)+"px"}
document.addEventListener("input",e=>{if(e.target.classList&&e.target.classList.contains("autogrow"))autoGrow(e.target)});
// huiles, beurre, miel, sauces… : exprimés en cuillères plutôt qu'en grammes
const SPOONS=[[/huile|oil/i,13.5,4.5],[/beurre de cacahu|peanut butter|pur[ée]e d'amande|tahin|tahini/i,16,5],[/beurre|butter|margarine|ghee/i,14,5],
  [/miel|honey|sirop|syrup|confiture|jam/i,21,7],[/vinaigre|vinegar|sauce soja|soy sauce|moutarde|mustard|ketchup|mayonnaise|mayo|pesto|cr[eè]me fra[iî]che/i,15,5]];
function spoonQty(name,g){if(!(g>0)||g>80)return"";const s=SPOONS.find(([re])=>re.test(name||""));if(!s)return"";
  const half=x=>Math.max(.5,Math.round(x*2)/2),fr=x=>String(x).replace(".",LANG==="en"?".":",");
  const tb=g/s[1];if(tb>=.75)return `${fr(half(tb))} ${L("c. à soupe")}`;return `${fr(half(g/s[2]))} ${L("c. à café")}`}
const qtyTxt=x=>{const m=String(x.qty||"").trim().match(/^(\d+(?:[.,]\d+)?)\s*g$/i),g=x.g||(m?+m[1].replace(",","."):0),sp=g?spoonQty(x.name,g):"";return sp?`${sp} (${r0(g)} g)`:(x.qty||"")};
// le serveur connaît les créneaux classiques : le repas unique part comme un déjeuner, avec son propre nom
const srvSlot=s=>s==="meal"?"lunch":s;
// la toute première génération peut échouer (serveur qui démarre, réponse vide) : on réessaie une fois tout seul
async function nuRetry(fn,ok){let last;for(let a=0;a<2;a++){try{const r=await fn();if(!ok||ok(r))return r;last=new Error(L("Réponse vide, réessaie."))}
  catch(ex){last=ex;if(ex.ai||ex instanceof TypeError||(ex.status&&ex.status<500&&![422,429].includes(ex.status)))throw ex}
  if(a===0)await new Promise(r=>setTimeout(r,1200))}throw last}
// demande à Claude un ou plusieurs repas (calories précises par repas)
async function genMeals(slots,kcals){
  const n=NU(),mp=nuMP(),t=dayTarget(iso(today())),tot=kcals.reduce((a,b)=>a+b,0)||1,k=tot/t.kcal,one=slots.length===1;
  const notes=[n.profile&&n.profile.notes,slots[0]==="meal"&&one?"Un seul repas dans la journée (OMAD) : il doit couvrir tous les besoins du jour.":"",
    "Huiles, beurre, miel et sauces : indique la quantité en grammes, elle sera affichée en cuillères.",
    "Donne toujours le poids des aliments crus (avant cuisson) : riz, pâtes, viande, poisson, légumineuses… et écris « cru » dans le nom quand c'est utile."].filter(Boolean).join(" ");
  const pty=one&&mp.type!=="day"?mp.type:one&&mp.pp&&mp.pp[slots[0]]?slots[0]:"day";
  const r=await nuRetry(()=>nuCall("menu",{data:{meal_type:one&&mp.type!=="day"?srvSlot(slots[0]):"day",meals:slots.map((s,i)=>({slot:srvSlot(s),name:L(slotName(s)),kcal:kcals[i]})),
    target_kcal:tot,protein_g:r0(t.p*k),carbs_g:r0(t.c*k),fat_g:r0(t.f*k),must_include:mpPref(mp,pty,"include"),avoid:mpPref(mp,pty,"exclude"),goal:n.profile&&n.profile.goal,notes}}),
    r=>r&&Array.isArray(r.meals)&&r.meals.some(m=>m&&Array.isArray(m.items)&&m.items.length));
  const meals=(r.meals||[]).filter(m=>m&&Array.isArray(m.items)&&m.items.length).map((m,i)=>({slot:slots[i]||slots[slots.length-1],target:kcals[i]||kcals[kcals.length-1],name:String(m.name||""),em:String(m.emoji||"🍽️"),
    steps:recipeSteps(m.steps||m.recipe||m.instructions),
    items:(m.items||[]).map(x=>({name:String(x.food||x.name||""),em:String(x.emoji||""),g:r0(x.grams),qty:r0(x.grams)+" g",kcal:r0(x.kcal),p:r1(x.protein_g),c:r1(x.carbs_g),f:r1(x.fat_g)}))}));
  return{meals,tips:String(r.tips||"")};
}
// étapes de recette : liste, ou texte « 1. … 2. … » découpé
function recipeSteps(v){if(!v)return null;if(Array.isArray(v))return v.map(x=>String(x&&x.text||x).trim()).filter(Boolean);
  const s=String(v).split(/\n+|(?:^|\s)(?=\d{1,2}[.)]\s)/).map(x=>x.replace(/^\s*(?:\d{1,2}[.)]|[-•])\s*/,"").trim()).filter(x=>x.length>2);return s.length?s:null}
// recette d'un repas déjà généré : demande « recette » du serveur (v23) ; ancien serveur : on redemande le repas avec ses étapes dans « tips »
async function getRecipe(ml){
  const n=NU(),list=ml.items.map(x=>`${qtyTxt(x)} ${x.name}`).join(", ");
  try{const r=await nuRetry(()=>nuCall("recette",{data:{name:ml.name,kcal:ml.kcal,foods:ml.items.map(x=>({food:x.name,grams:x.g||null,quantity:x.qty}))}}),r=>r&&Array.isArray(r.steps)&&r.steps.length);
    const st=recipeSteps(r.steps);if(st){const t=[r.prep_min?`${L("Préparation")} ${r0(r.prep_min)} min`:"",r.cook_min?`${L("Cuisson")} ${r0(r.cook_min)} min`:""].filter(Boolean).join(" · ");
      if(t)st.unshift(L("Temps")+" : "+t);if(r.tips)st.push(L("Astuce")+" : "+r.tips);return st}}
  catch(ex){if(ex.status!==400)throw ex}
  const r=await nuRetry(()=>nuCall("menu",{data:{meal_type:srvSlot(ml.slot||"lunch"),meals:[{slot:srvSlot(ml.slot||"lunch"),name:ml.name,kcal:ml.kcal}],target_kcal:ml.kcal,protein_g:r0(ml.p),carbs_g:r0(ml.c),fat_g:r0(ml.f),
    must_include:list,avoid:"",goal:n.profile&&n.profile.goal,want_recipe:true,
    notes:`RECETTE DEMANDÉE pour ce repas exact : « ${ml.name} » avec ${list}. Garde exactement ces aliments et ces quantités. Écris la préparation pas à pas (4 à 8 étapes numérotées « 1. … », avec temps de cuisson) dans le champ tips, et aussi dans « steps » si possible.`}}),
    r=>r&&(r.tips||(r.meals&&r.meals[0]&&(r.meals[0].steps||r.meals[0].recipe))));
  const m=r.meals&&r.meals[0]||{};return recipeSteps(m.steps||m.recipe||m.instructions)||recipeSteps(r.tips)}
$("nuMenuBtn").addEventListener("click",async()=>{
  if(nuBusy||!nutriAllowed())return;const n=NU(),mp=nuMP();mpSet(mp,mp.type,"include",$("nuInclude").value.trim());mpSet(mp,mp.type,"exclude",$("nuExclude").value.trim());
  if(mp.type!=="day")mp.one[mp.type]=Math.max(0,Math.round(numIn($("nuOneKcal").value)))||oneKcal(mp.type);
  const slots=mp.type==="day"?mpSlots():[mp.type],kcals=mp.type==="day"?mpKcals():[mp.one[mp.type]];
  nuBusy="menu";const btn=$("nuMenuBtn");btn.disabled=true;nuMenuFree();const stop=nuLoading($("nuMenu"),["Préparation du menu…","Choix des recettes…","Calcul des grammages…","Équilibrage des macros…"]);
  // v43 (demande de Sid) : « à inclure » / « à éviter » ne servent qu'à cette demande ; ils repartent vides ensuite
  const mpClear=()=>{mpSet(mp,mp.type,"include","");mpSet(mp,mp.type,"exclude","");if(mp.type==="day"){delete mp.include;delete mp.exclude}$("nuInclude").value="";$("nuExclude").value="";autoGrow($("nuInclude"));autoGrow($("nuExclude"));n.upd=Date.now();save()};
  try{const g=await genMeals(slots,kcals);mpClear();
    if(mp.type==="day"||!n.menu||!n.menu.meals)n.menu={meals:g.meals,tips:g.tips,at:new Date().toISOString()};
    else{const i=n.menu.meals.findIndex(m=>m.slot===mp.type);if(i>=0)n.menu.meals[i]=g.meals[0];else n.menu.meals.push(g.meals[0]);n.menu.at=new Date().toISOString()}
    n.upd=Date.now();save();toast("Menu prêt");
  }catch(ex){toast(nuErrMsg(ex));if(ex.ai)mpClear()}
  stop();nuBusy="";btn.disabled=false;renderNuMenu();
  const f=$("nuMenu").querySelector(".dish");if(f)f.scrollIntoView({behavior:"smooth",block:"start"});
});
let meEdit=null,meAdd=null,meRecipe=null,meRegen=null;
function renderNuMenu(){
  if(nuBusy==="menu")return;
  // v58 (#3) : menu dessiné par React (app/src/NuMenu.tsx) ; pendant la génération, #nuMenu est rendu à l'ancien code (animation)
  if(nuIsl("nuMenu")){try{const m=NU().menu,ok=m&&m.meals&&m.meals.length;
      if(ok)m.meals.forEach(ml=>{const s=sumOf(ml.items);Object.assign(ml,{kcal:r0(s.kcal),p:r1(s.p),c:r1(s.c),f:r1(s.f)})});
      const el=$("nuMenu");if(!el._isl){el.innerHTML="";el._isl=true}
      window.SCIslands.nuMenu(el,{mac:NU_MAC(),icons:{book:IC("book")},i18n:agI18n(),m:ok?{total:sumOf(m.meals),tips:m.tips||"",edit:meEdit,add:meAdd,recipe:meRecipe,recipeBusy:nuBusy==="recipe",regen:meRegen,
        meals:m.meals.map(ml=>({name:ml.name,mono:mono(ml.name),slot:slotName(ml.slot),target:ml.target||0,kcal:ml.kcal,sum:{kcal:ml.kcal,p:ml.p,c:ml.c,f:ml.f},ate:ml.ate===iso(today()),steps:ml.steps||null,
          items:ml.items.map(x=>({name:x.name,g:x.g||0,qty:x.qty||"",qtyLbl:qtyTxt(x),kcal:x.kcal}))}))}:null});
      if(meEdit){const i=$("meQtyIn");if(i){i.focus();i.select()}}if(meAdd!==null){const i=$("meAddIn");if(i)i.focus()}return}
    catch(e){reportErr("island nuMenu: "+(e&&e.message))}}
  nuMenuFree();
  const m=NU().menu;if(!m||!m.meals||!m.meals.length){$("nuMenu").innerHTML=`<div class="card"><div class="empty">${L("Choisis tes repas, puis touche « Générer ».")}</div></div>`;return}
  m.meals.forEach(ml=>{const s=sumOf(ml.items);Object.assign(ml,{kcal:r0(s.kcal),p:r1(s.p),c:r1(s.c),f:r1(s.f)})});
  const T=sumOf(m.meals),td=iso(today());
  $("nuMenu").innerHTML=`<h2 style="margin-top:16px">${L("Ton menu")}</h2>`+boxes([[r0(T.kcal),"kcal"],[r1(T.p)+" g","Protéines","--m-p"],[r1(T.c)+" g","Glucides","--m-c"],[r1(T.f)+" g","Lipides","--m-f"]])+
    m.meals.map((ml,i)=>`<div class="dish"><div class="dish-h"><span class="dish-ic">${mono(ml.name)}</span><span class="dish-t"><b class="notr">${esc(ml.name)}</b><span class="small muted">${L(slotName(ml.slot))}${ml.target?` · ${L("objectif")} ${ml.target} kcal`:""}</span></span><span class="dish-kcal">${ml.kcal}<small>kcal</small></span><button type="button" class="x" data-medel="${i}" aria-label="${L("Retirer ce repas")}">×</button></div>
      ${macroHtml(ml)}<div class="dish-items">${ml.items.map((x,j)=>`<div class="dish-it"><span class="em">·</span><div class="grow"><b class="notr">${esc(x.name)}</b>${meEdit===`${i}:${j}`?`<span class="me-qty"><input type="text" inputmode="decimal" id="meQtyIn" value="${x.g||""}" aria-label="${L("Grammes")}"> g <button type="button" class="mini" data-meqok="${i}:${j}">OK</button></span>`:x.g?`<button type="button" class="qty-ed notr" data-meq="${i}:${j}" aria-label="${L("Changer la quantité")}">${esc(qtyTxt(x))}</button>`:`<span class="small muted notr">${esc(x.qty)}</span>`}</div><span class="k">${x.kcal} kcal</span>${x.g?`<button class="pen" data-meq="${i}:${j}" aria-label="${L("Changer la quantité")}">${PEN}</button>`:""}<button class="x" data-merm="${i}:${j}" aria-label="${L("Retirer")}">×</button></div>`).join("")}</div>
      ${meAdd===i?`<form class="me-add" data-meaddf="${i}"><input id="meAddIn" placeholder="${L("Ex. 30 g d'amandes")}" autocomplete="off"><button class="btn" type="submit">OK</button></form>`:""}
      ${meRecipe===i?`<div class="recipe"><b>${IC("book")} ${L("Recette")}</b>${nuBusy==="recipe"?`<div class="small muted" style="margin-top:6px"><span class="spin"></span> ${L("Préparation de la recette…")}</div>`:ml.steps&&ml.steps.length?`<ol class="notr">${ml.steps.map(s=>`<li>${esc(s)}</li>`).join("")}</ol>`:`<div class="small muted">${L("Recette indisponible pour le moment.")}</div>`}</div>`:""}
      <div class="me-act"><button type="button" class="mini" data-meadd="${i}">+ ${L("Aliment")}</button><button type="button" class="mini" data-merec="${i}">${IC("book")} ${L(meRecipe===i?"Cacher la recette":"Recette")}</button><button type="button" class="mini" data-meregen="${i}">↻ ${L("Autre idée")}</button>
        ${ml.ate===td?`<span class="me-done">✓ ${L("Dans ta journée")}</span>`:`<button type="button" class="mini" data-numeal="${i}" style="background:var(--accent);color:var(--on-accent)">＋ ${L("Ajouter à ma journée")}</button>`}</div></div>`).join("")+
    (m.tips?`<p class="small muted notr" style="margin:6px 4px">${esc(m.tips)}</p>`:"");
  if(meEdit){const i=$("meQtyIn");if(i){i.focus();i.select()}}if(meAdd!==null){const i=$("meAddIn");if(i)i.focus()}
}
// rend #nuMenu à l'ancien code (animation de chargement, ancien rendu)
function nuMenuFree(){const el=$("nuMenu");if(el._isl){window.SCIslands.unmount(el);el._isl=false}}
// bandeau du menu : ce qu'il reste à manger aujourd'hui
function renderMenuLeft(){const el=$("nuMenuLeft");if(!el||!NU().plan)return;const t=dayTarget(iso(today())),s=sumOf(dayLog(iso(today()))),left=r0(t.kcal-s.kcal);
  el.innerHTML=`${IC("target")}<span class="grow">${left>=0?`${L("Il te reste")} <b>${fmtFull(left)} kcal</b> ${L("à manger aujourd'hui")}`:`${L("Objectif dépassé de")} <b>${fmtFull(-left)} kcal</b>`} <span class="muted">(${L("objectif")} ${fmtFull(t.kcal)})</span></span>`}
// changer la quantité d'un aliment du menu : calories et macros suivent
function meScale(i,j,g){const it=NU().menu.meals[i].items[j];if(!(g>0)||!it.g)return;const k=g/it.g;
  Object.assign(it,{g:r0(g),qty:r0(g)+" g",kcal:r0(it.kcal*k),p:r1(it.p*k),c:r1(it.c*k),f:r1(it.f*k)});NU().upd=Date.now();save()}
$("nuMenu").addEventListener("click",async e=>{const b=e.target.closest("button");if(!b)return;const n=NU(),M=n.menu;
  if(b.dataset.numeal){const ml=M.meals[+b.dataset.numeal],d0=nuDay;nuDay=iso(today());
    nuAddItems(ml.items,null,{name:ml.name,em:ml.em});nuDay=d0;ml.ate=iso(today());n.upd=Date.now();save();renderNutri();toast(`${L("Ajouté à ta journée")} · ${ml.kcal} kcal`);return}
  if(b.dataset.merec){const i=+b.dataset.merec,ml=M.meals[i];if(meRecipe===i){meRecipe=null;renderNuMenu();return}
    meRecipe=i;if(ml.steps&&ml.steps.length||nuBusy){renderNuMenu();return}
    nuBusy="recipe";renderNuMenu();
    try{const st=await getRecipe(ml);if(st){ml.steps=st;n.upd=Date.now();save()}else toast("Recette indisponible pour le moment.")}catch(ex){toast(nuErrMsg(ex))}
    nuBusy="";renderNuMenu();return}
  if(b.dataset.meq){meEdit=b.dataset.meq;meAdd=null;renderNuMenu();return}
  if(b.dataset.meqok){const[i,j]=b.dataset.meqok.split(":").map(Number);meScale(i,j,numIn($("meQtyIn").value));meEdit=null;renderNuMenu();return}
  if(b.dataset.merm){const[i,j]=b.dataset.merm.split(":").map(Number);M.meals[i].items.splice(j,1);if(!M.meals[i].items.length)M.meals.splice(i,1);n.upd=Date.now();save();renderNuMenu();return}
  if(b.dataset.medel){armDelete(b,()=>{M.meals.splice(+b.dataset.medel,1);n.upd=Date.now();save();renderNuMenu()});return}
  if(b.dataset.meadd){meAdd=+b.dataset.meadd;meEdit=null;renderNuMenu();return}
  if(b.dataset.meregen&&!nuBusy){const i=+b.dataset.meregen,ml=M.meals[i];nuBusy="regen";meRegen=i;if(nuIsl("nuMenu")&&$("nuMenu")._isl)renderNuMenu();else b.innerHTML=`<span class="spin"></span>`;
    try{const g=await genMeals([ml.slot||"lunch"],[ml.target||ml.kcal]);if(g.meals[0])M.meals[i]=g.meals[0];n.upd=Date.now();save();toast("Nouvelle idée prête")}catch(ex){toast(nuErrMsg(ex))}
    nuBusy="";meRegen=null;renderNuMenu()}
});
$("nuMenu").addEventListener("keydown",e=>{if(e.target.id==="meQtyIn"&&e.key==="Enter"){e.preventDefault();const[i,j]=meEdit.split(":").map(Number);meScale(i,j,numIn(e.target.value));meEdit=null;renderNuMenu()}});
// ajouter un aliment à un repas du menu (mémoire ou analyse)
$("nuMenu").addEventListener("submit",async e=>{const f=e.target.closest("[data-meaddf]");if(!f)return;e.preventDefault();const q=$("meAddIn").value.trim();if(!q||nuBusy)return;
  const i=+f.dataset.meaddf;nuBusy="add";f.querySelector("button").innerHTML=`<span class="spin"></span>`;
  try{const r=await nuCall("aliment",{text:q});(r.items||[]).forEach(x=>NU().menu.meals[i].items.push({name:String(x.name||q),em:String(x.emoji||""),g:r0(x.grams),qty:String(x.quantity||r0(x.grams)+" g"),kcal:r0(x.kcal),p:r1(x.protein_g),c:r1(x.carbs_g),f:r1(x.fat_g)}));
    NU().upd=Date.now();save();meAdd=null}catch(ex){toast(nuErrMsg(ex))}
  nuBusy="";renderNuMenu()});
// minuit passé : la journée suivante commence
// retour sur Nutrition : on revient à aujourd'hui seulement après une longue absence (v44.4 : pas au retour de Claude, pour un repas d'un jour passé)
{let nuAway=0;document.addEventListener("visibilitychange",()=>{if(document.hidden){nuAway=Date.now();return}
  if(data.ui.view==="nutri"&&nuDay<iso(today())&&!nuPending&&Date.now()-nuAway>30*60e3){nuDay=iso(today());renderNutri()}})}
