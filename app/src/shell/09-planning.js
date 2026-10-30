/* ---------- Planning ---------- */
let calY=new Date().getFullYear(),calM=new Date().getMonth(),selDay=null,calMode="month",planQ="",qOpen=false,zoomFrom=null;
const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const DOW=["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"];
const toMin=h=>{if(!h)return null;const[a,b]=h.split(":").map(Number);return a*60+b};
const hrs=t=>t.time?(t.timeEnd?`${t.time}–${t.timeEnd}`:t.time):"";
const sk=t=>t.date+(t.time||"99:99");
const onDay=(t,k)=>t.date===k||(t.end&&t.date<=k&&t.end>=k);
// v47 (#16) : grilles de calendrier communes (agenda, nutrition, choix de jours) : mêmes classes .day / .ym partout
function monthGrid(y,m,cell){const first=new Date(y,m,1),lead=(first.getDay()+6)%7,n=new Date(y,m+1,0).getDate();
  let h="";for(let i=0;i<lead;i++)h+=`<span class="day out"></span>`;for(let d=1;d<=n;d++)h+=cell(iso(new Date(y,m,d)),d);return h}
function yearGrid(y,cls){const now=today();let h="";
  for(let m=0;m<12;m++){const first=new Date(y,m,1),lead=(first.getDay()+6)%7,n=new Date(y,m+1,0).getDate();
    let g="";for(let i=0;i<lead;i++)g+="<i></i>";
    for(let d=1;d<=n;d++)g+=`<i class="${cls(iso(new Date(y,m,d)))}">${d}</i>`;
    h+=`<button class="ym ${y===now.getFullYear()&&m===now.getMonth()?"cur":""}" data-ym="${m}" aria-label="${MOL[m]} ${y}"><b>${MOL[m]}</b><div class="ym-g">${g}</div></button>`}return h}
// v53 (#3) : textes des îlots de l'agenda (tr = traduction avec les motifs, comme la traduction automatique du DOM)
const agI18n=()=>({tr:x=>LANG&&LANG!=="fr"?trStr(x):x,L,MOL,MO,locale:LANG==="en"?"en-GB":LANG==="nl"?"nl-BE":"fr-BE"});
function renderMonth(){
  const T=allT(),tIso=iso(today());
  if(shIsl("calTitle")){try{window.SCIslands.calTitle($("calTitle"),{mo:MOL[calM],y:calY,i18n:agI18n()})}catch(e){reportErr("island calTitle: "+(e&&e.message))}}
  else $("calTitle").innerHTML=`${MOL[calM]} ${calY} <span class="yr-ic">▦ ${L("Année")}</span>`;$("calTitle").setAttribute("aria-label",`${MOL[calM]} ${calY}, ${L("voir toute l'année")}`);
  if(window.SCIslands&&window.SCIslands.agMonth&&!window.__noIslands){try{window.SCIslands.agMonth($("calDays"),{y:calY,m:calM,today:tIso,tasks:T,color:colorOf,i18n:agI18n()});return}catch(e){reportErr("island agMonth: "+(e&&e.message))}}
  const h=monthGrid(calY,calM,(k,d)=>{
    const per=T.filter(t=>t.end&&t.date<=k&&t.end>=k).slice(0,2);
    const pts=T.filter(t=>!t.end&&t.date===k);
    const bars=per.map(t=>`<i class="${t.date===k?"s":""} ${t.end===k?"e":""}" style="--c:var(${colorOf(t)})"></i>`).join("");
    const dots=pts.slice(0,3).map(t=>`<i style="--c:var(${colorOf(t)});opacity:${t.status==="fait"||t.canc?.35:1}"></i>`).join("");
    return `<button class="day ${k===tIso?"today":""} ${k<tIso?"past":""}" data-day="${k}" aria-label="${d} ${MOL[calM]}${per.length+pts.length?", "+(per.length+pts.length)+" élément(s)":""}"><span class="num">${d}</span><span class="marks">${bars?`<span class="bars">${bars}</span>`:""}${dots?`<span class="dots">${dots}</span>`:""}</span></button>`});
  $("calDays").innerHTML=h;
}
// v39 : tâches du jour dans l'agenda (cocher, ajouter pour ce jour) ; les reportées arrivent sur aujourd'hui
function dayTasksBox(k){if(!visibleTabs().includes("todo"))return"";const list=dayTodos(k),past=k<iso(today());
  const row=t=>`<div class="dt-row ${t.done?"done":""}"><button type="button" class="check" data-dtg="${t.id}" aria-label="${L(t.done?"Remettre à faire":"Terminer")}">${t.done?CHECK:""}</button><button type="button" class="grow ttl ttl-btn" data-dtmore="${t.id}">${esc(t.title)}${tLate(t)?` <span class="tchip late">↻ ${L("reportée")}</span>`:""}</button></div>`;
  return `<div class="card dt-box"><div class="dt-h"><b>${IC("check")||""} ${L("Tâches du jour")}</b><span class="small muted">${list.filter(t=>t.done).length}/${list.length}</span></div>
    ${list.map(row).join("")||`<div class="small muted dt-empty">${L(past?"Aucune tâche ce jour-là.":"Aucune tâche prévue. Ajoute-en une ci-dessous.")}</div>`}
    ${past?"":`<form class="dt-add" data-dtadd="${k}"><input placeholder="${L("+ Tâche pour ce jour")}" aria-label="${L("Nouvelle tâche pour ce jour")}" autocomplete="off" enterkeyhint="done"></form>`}</div>`}
function renderDayView(){
  if(window.SCIslands&&window.SCIslands.dayView&&!window.__noIslands){try{const n=new Date();
    window.SCIslands.dayView($("calDayView"),{day:selDay,today:iso(today()),tasks:allT(),todos:visibleTabs().includes("todo")?dayTodos(selDay):null,qOpen,nowMin:n.getHours()*60+n.getMinutes(),
      color:colorOf,checkIcon:IC("check")||"",i18n:{...agI18n(),DOW,lang:LANG||"fr"}});return}catch(e){reportErr("island dayView: "+(e&&e.message))}}
  const T=allT(),k=selDay,tIso=iso(today()),sd=parse(k);
  const items=T.filter(t=>onDay(t,k)).sort((a,b)=>sk(a).localeCompare(sk(b)));
  const timed=items.filter(t=>t.time&&t.date===k),allday=items.filter(t=>!(t.time&&t.date===k));
  // plage horaire affichée
  let H0=7,H1=22;
  timed.forEach(t=>{const s=toMin(t.time),e=Math.max(toMin(t.timeEnd)||0,s+60);H0=Math.min(H0,Math.floor(s/60));H1=Math.max(H1,Math.min(24,Math.ceil(e/60)))});
  const PX=48;
  // colonnes pour les activités qui se chevauchent
  const ev=timed.map(t=>{const s=toMin(t.time);let e=toMin(t.timeEnd);if(e===null||e<=s)e=s+60;return{t,s,e,col:0}}).sort((a,b)=>a.s-b.s);
  const ends=[];ev.forEach(x=>{let c=ends.findIndex(e=>e<=x.s);if(c<0){c=ends.length;ends.push(0)}ends[c]=x.e;x.col=c});
  const ncol=Math.max(1,ends.length);
  let hours="";for(let hh=H0;hh<=H1;hh++)hours+=`<div class="hr" style="top:${(hh-H0)*PX}px"><span>${two(hh%24)}:00</span></div>`;
  const blocks=ev.map(x=>`<button class="blk ${x.t.status==="fait"?"fait":""} ${x.t.canc?"canc":""}" ${x.t.src==="ical"?`data-icalinfo="${esc(x.t.id)}"`:`data-edit="task:${x.t.id}"`} style="--c:var(${colorOf(x.t)});top:${(x.s/60-H0)*PX+1}px;height:${Math.max((x.e-x.s)/60*PX-2,26)}px;left:calc(${x.col*100/ncol}% + 2px);width:calc(${100/ncol}% - 4px)"><span class="t">${hrs(x.t)}${x.t.canc?'<span class="canc-pill">Annulé</span>':""}</span><b>${esc(x.t.title)}</b>${x.t.loc?`<span class="loc">${esc(x.t.loc)}</span>`:""}</button>`).join("");
  let now="";if(k===tIso){const n=new Date(),m=n.getHours()*60+n.getMinutes();if(m>=H0*60&&m<=H1*60)now=`<div class="nowline" style="top:${(m/60-H0)*PX}px"></div>`}
  const prev=new Date(sd);prev.setDate(prev.getDate()-1);const nxt=new Date(sd);nxt.setDate(nxt.getDate()+1);
  $("calDayView").innerHTML=`<div class="dayv-head">
      <button class="back" id="dayBack">‹ ${MOL[sd.getMonth()]}</button>
      <div class="dayv-title">${DOW[sd.getDay()]} ${sd.getDate()} ${mlow(sd.getMonth())}${k===tIso?" · aujourd'hui":""}</div>
      <button class="cal-nav" data-dayjump="${iso(prev)}" aria-label="Jour précédent">‹</button><button class="cal-nav" data-dayjump="${iso(nxt)}" aria-label="Jour suivant">›</button>
    </div>
    ${allday.length?`<div class="allday">${allday.map(t=>`<div class="chip-ev ${t.canc?"canc":""}" style="--c:var(${colorOf(t)})"><span class="grow ttl" style="${t.status==="fait"?"text-decoration:line-through;color:var(--muted)":""}">${t.time?`<span class="time">${hrs(t)}</span> `:""}${esc(t.title)}${t.end?` <span class="small muted">· ${fmt(t.date)} → ${fmt(t.end)}</span>`:""}</span>${t.src==="ical"?(t.canc?'<span class="canc-pill">Annulé</span>':""):`<button class="pen" data-edit="task:${t.id}" aria-label="Modifier">${PEN}</button><button class="x" data-caldel="${t.id}" aria-label="Supprimer">×</button>`}</div>`).join("")}</div>`:""}
    ${dayTasksBox(k)}
    ${!items.length?`<p class="small muted" style="margin:0 4px 8px">Rien de prévu ce jour-là.</p>`:""}
    <div class="tline" style="height:${(H1-H0)*PX}px">${hours}${blocks}${now}</div>
    ${qOpen?`<form class="qform" id="qForm">
      <input id="qTitle" placeholder="Que fais-tu ce jour-là ?" aria-label="Activité" required autocomplete="off">
      <div class="small muted" style="margin:2px 0 -4px">Heures (optionnel)</div><div class="two"><label>Heure de début<input id="qTime" type="time"></label><label>Heure de fin<input id="qTimeEnd" type="time"></label></div>
      <div class="two"><label>Type<input id="qCat" list="typeList" placeholder="Ex. Sport" autocomplete="off"></label><label>Jusqu'au (optionnel)<input id="qEnd" type="date" min="${k}"></label></div>
      <div class="two"><button type="button" class="btn ghost" id="qCancel">Annuler</button><button class="btn" type="submit">Ajouter</button></div>
    </form>`:`<button class="qbtn" id="qOpen">+ Ajouter une activité ce jour</button>`}`;
}
function renderCal(){
  if(!selDay)selDay=iso(today());
  const day=calMode==="day",yr=calMode==="year";
  $("calMonth").hidden=day||yr;$("calDayView").hidden=!day;$("calYear").hidden=!yr;
  $("calH2").textContent=L(day?"Journée":yr?"Cette année":"Ce mois-ci");
  if(day)renderDayView();else if(yr)renderYear();else renderMonth();
}
// vue année : 12 petits mois, jours avec activité en couleur, aujourd'hui en rouge (comme le Calendrier de l'iPhone)
function renderYear(){
  if(window.SCIslands&&window.SCIslands.agYear&&!window.__noIslands){try{window.SCIslands.agYear($("calYear"),{y:calY,today:iso(today()),tasks:allT(),i18n:agI18n()});return}catch(e){reportErr("island agYear: "+(e&&e.message))}}
  const T=allT(),tIso=iso(today()),has=new Set();T.forEach(t=>{if(!t.date)return;const e=t.end&&t.end>t.date?t.end:t.date;for(let d=parse(t.date);iso(d)<=e;d.setDate(d.getDate()+1))has.add(iso(d))});
  const h=yearGrid(calY,k=>`${k===tIso?"td":has.has(k)?"ev":""} ${k<tIso?"past":""}`);
  $("calYear").innerHTML=`<div class="yr-head"><button class="cal-nav" data-yrn="-1" aria-label="${L("Année précédente")}">‹</button><button type="button" class="yr-title" data-yrtoday="1" aria-label="${L("Revenir au mois actuel")}">${calY}<span class="yr-ic">↩ ${L("Mois actuel")}</span></button><button class="cal-nav" data-yrn="1" aria-label="${L("Année suivante")}">›</button></div><div class="yr-grid">${h}</div>
    <p class="small muted" style="text-align:center;margin:10px 0 4px">${L("Touche un mois pour l'ouvrir.")} <button type="button" class="linkbtn" data-yrtoday="1" style="background:none;border:0;cursor:pointer">${L("Aujourd'hui")}</button></p>`;
}
$("calYear").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;
  if(b.dataset.yrn){calY+= +b.dataset.yrn;renderCal();return}
  if(b.dataset.yrtoday){const t=today();calY=t.getFullYear();calM=t.getMonth();calMode="month";renderCal();zoom($("calMonth"));return}
  if(b.dataset.ym){const r=b.getBoundingClientRect(),c=$("calYear").getBoundingClientRect();
    $("calMonth").style.setProperty("--zo",`${((r.left+r.width/2-c.left)/c.width*100).toFixed(0)}% ${((r.top-c.top)/c.height*100).toFixed(0)}%`);
    calM=+b.dataset.ym;calMode="month";renderCal();zoom($("calMonth"))}});
// pincer pour dézoomer (mois → année) ou zoomer (année → mois)
(()=>{let d0=0,ratio=1,mid=null;const dist=t=>Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY);const box=document.querySelector(".card.cal");
  box.addEventListener("touchstart",e=>{if(e.touches.length===2){d0=dist(e.touches);ratio=1;mid={x:(e.touches[0].clientX+e.touches[1].clientX)/2,y:(e.touches[0].clientY+e.touches[1].clientY)/2}}},{passive:true});
  box.addEventListener("touchmove",e=>{if(e.touches.length===2&&d0){e.preventDefault();ratio=dist(e.touches)/d0}},{passive:false});
  box.addEventListener("touchend",()=>{if(!d0)return;const r=ratio;d0=0;
    if(r<.75&&calMode==="month"){calMode="year";renderCal();zoom($("calYear"))}
    else if(r>1.33&&calMode==="year"){const el=document.elementFromPoint(mid.x,mid.y),b=el&&el.closest("[data-ym]");calM=b?+b.dataset.ym:calM;calMode="month";renderCal();zoom($("calMonth"))}});
})();
function zoom(el){el.classList.remove("zoom");void el.offsetWidth;el.classList.add("zoom")}
$("calDays").addEventListener("click",e=>{const b=e.target.closest(".day[data-day]");if(!b)return;
  const r=b.getBoundingClientRect(),c=$("calMonth").getBoundingClientRect();
  $("calDayView").style.setProperty("--zo",`${((r.left+r.width/2-c.left)/c.width*100).toFixed(0)}% ${((r.top-c.top)/c.height*100).toFixed(0)}%`);
  selDay=b.dataset.day;calMode="day";qOpen=false;renderCal();zoom($("calDayView"))});
$("calDayView").addEventListener("click",e=>{
  const dg=e.target.closest("[data-dtg]");if(dg){const t=data.todos.find(x=>x.id===dg.dataset.dtg);if(t){todoToggle(t);renderCal();renderHome()}return}
  const dm=e.target.closest("[data-dtmore]");if(dm){todoActions(dm.dataset.dtmore);return}
  const ii=e.target.closest("[data-icalinfo]");if(ii){icalInfo(ii.dataset.icalinfo);return}
  const d=e.target.closest("[data-caldel]");
  if(d){taskDel(d.dataset.caldel);return}
  const j=e.target.closest("[data-dayjump]");if(j){selDay=j.dataset.dayjump;qOpen=false;renderCal();return}
  if(e.target.closest("#dayBack")){const sd=parse(selDay);calY=sd.getFullYear();calM=sd.getMonth();calMode="month";renderCal();zoom($("calMonth"));return}
  if(e.target.closest("#qOpen")){qOpen=true;renderCal();$("qTitle").focus()}
  else if(e.target.closest("#qCancel")){qOpen=false;renderCal()}
});
$("calDayView").addEventListener("submit",e=>{
  e.preventDefault();
  const da=e.target.closest("[data-dtadd]");if(da){const i=da.querySelector("input"),v=i.value.trim();if(!v)return;i.value="";
    data.todos.push({id:uid(),title:v,createdAt:new Date().toISOString(),done:false,day:da.dataset.dtadd});save();renderTodos();renderCal();
    const ni=$("calDayView").querySelector("[data-dtadd] input");if(ni)ni.focus();return}const title=$("qTitle").value.trim();if(!title)return;
  const t={id:uid(),title,date:selDay,status:"à faire",tbc:false,cat:ensureType($("qCat").value)};
  if($("qEnd").value&&$("qEnd").value>selDay)t.end=$("qEnd").value;
  if($("qTime").value)t.time=$("qTime").value;
  if(t.time&&$("qTimeEnd").value&&$("qTimeEnd").value>t.time)t.timeEnd=$("qTimeEnd").value;
  data.tasks.push(t);qOpen=false;save();renderPlan();renderTypes();toast("Ajouté au calendrier");
});
$("calPrev").addEventListener("click",()=>{calM--;if(calM<0){calM=11;calY--}renderCal()});
$("calNext").addEventListener("click",()=>{calM++;if(calM>11){calM=0;calY++}renderCal()});
$("calTitle").addEventListener("click",()=>{calMode="year";renderCal();zoom($("calYear"))});
$("planSearch").addEventListener("input",e=>{planQ=e.target.value;renderPlan()});
// v45.3 : ajouter des activités en les disant à Claude (même fonctionnement que Nutrition) : le message part chez Claude,
// qui les enregistre avec le connecteur (ajouter_activite) ; l'agenda les récupère au retour dans l'app. Recherche derrière la loupe.
$("planSearchBtn").addEventListener("click",()=>{const i=$("planSearch"),open=i.hidden;i.hidden=!open;$("planSearchBtn").setAttribute("aria-expanded",open);
  if(open)i.focus();else if(planQ){i.value="";planQ="";renderPlan()}});
$("plMic").addEventListener("click",e=>dictate(e.currentTarget,$("plAsk")));
$("plAsk").addEventListener("input",e=>grow(e.target));
$("plAsk").addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();$("plAskForm").requestSubmit()}});
function plPrompt(q){const d=today(),day=`${d.toLocaleDateString(LANG==="en"?"en-GB":LANG==="nl"?"nl-BE":"fr-BE",{weekday:"long"})} ${iso(d)}`;
  return T3(`Ajoute dans mon agenda Sid'compagnon : ${q}\n(Aujourd'hui : ${day}, heure de Bruxelles. Utilise ajouter_activite avec le titre, la date, l'heure de début et de fin, le type et les rappels si je les donne. S'il y a plusieurs activités, ajoute-les toutes. Si la date ou l'heure n'est pas claire, demande-moi avant.)`,
    `Add to my Sid'compagnon calendar: ${q}\n(Today: ${day}, Brussels time. Use ajouter_activite with the title, date, start and end time, type and reminders if I give them. If there are several activities, add them all. If the date or time is unclear, ask me first.)`,
    `Voeg toe aan mijn Sid'compagnon-agenda: ${q}\n(Vandaag: ${day}, Brusselse tijd. Gebruik ajouter_activite met de titel, datum, begin- en einduur, het type en herinneringen als ik die geef. Bij meerdere activiteiten: voeg ze allemaal toe. Als de datum of het uur niet duidelijk is, vraag het me eerst.)`)}
$("plAskForm").addEventListener("submit",e=>{e.preventDefault();const q=$("plAsk").value.trim();if(!q)return;dictStop();
  aiHandoff(plPrompt(q),"agenda");$("plAsk").value="";grow($("plAsk"))});
let planOpenMem={}; // mois ouverts dans « Toutes les dates » ; v44.6 : tous repliés par défaut (à l'ouverture de sid'agenda et au rechargement)
function renderPlan(){
  const T=data.tasks,q=norm(planQ);
  $("planTop").hidden=!!q;
  const isl=window.SCIslands&&window.SCIslands.agPlan&&!window.__noIslands;
  const up=T.filter(t=>t.status!=="fait"&&daysTo(t.end||t.date)>=0).sort((a,b)=>sk(a).localeCompare(sk(b))).slice(0,4);
  if(!isl)$("next").innerHTML=up.length?up.map(t=>{const d=daysTo(t.date);const w=d>1?`dans ${d} j`:d===1?"demain":d===0?"aujourd'hui":"en cours";
    return `<div class="n" style="--c:var(${colorOf(t)})"><div class="d">${fmt(t.date)}${t.time?" · "+hrs(t):""} · ${w}</div><div class="t">${esc(t.title)}</div></div>`}).join("")
    :`<div class="n" style="--c:var(--line)"><div class="t muted">${L("Rien à venir")}</div></div>`;
  renderCal();
  // filtres
  // v45 : une pastille par calendrier relié affiché (sa couleur)
  const calF=CALS().filter(c=>c.on!==false&&icalEvents.some(t=>t.cal===c.id));
  let f=data.ui.filter||"Toutes";if(f!=="Toutes"&&!typeOf(f)&&!calF.some(c=>c.name===f))f="Toutes";
  const used=data.types.filter(ty=>T.some(t=>norm(t.cat)===norm(ty.name)));
  calF.forEach(c=>{if(!used.some(u=>norm(u.name)===norm(c.name)))used.push({name:c.name,c:c.c||"--x4"})});
  const chips=[{name:"Toutes"},...used];
  if(!isl)$("chips").innerHTML=chips.map(c=>`<button class="pill" data-f="${esc(c.name)}" aria-pressed="${c.name===f}">${c.c?`<span class="dot" style="background:var(${c.c})"></span>`:""}${esc(c.name)}</button>`).join("");
  fillTypeList();
  $("listH2").textContent=q?"Résultats":"Toutes les dates";
  // liste
  const src=calF.some(c=>c.name===f)?icalEvents:q?T.concat(icalEvents):T;
  const list=src.filter(t=>(f==="Toutes"||norm(t.cat)===norm(f))&&(!q||norm(t.title+" "+(t.cat||"")+" "+(t.note||"")+" "+(t.loc||"")).includes(q))).sort((a,b)=>sk(a).localeCompare(sk(b)));
  if(isl){try{window.SCIslands.agPlan({next:$("next"),chips:$("chips"),list:$("tasks")},{tasks:T,list,chips:chips.map(c=>({name:c.name,c:c.c})),filter:f,search:!!q,open:Object.keys(planOpenMem),today:iso(today()),color:colorOf,icalCat:ICAL_CAT,i18n:agI18n()});return}
    catch(e){reportErr("island agPlan: "+(e&&e.message));window.__noIslands=true;try{renderPlan()}finally{window.__noIslands=false}return}}
  if(!list.length){$("tasks").innerHTML=`<div class="card" style="margin-top:10px"><div class="empty">${q?"Aucune activité ne correspond.":"Rien dans cette catégorie."}</div></div>`;return}
  const g={};list.forEach(t=>{const d=parse(t.date);const k=d.getFullYear()*100+d.getMonth();(g[k]=g[k]||[]).push(t)});
  // v29 : chaque mois se replie (toucher son nom) ; v44.6 : tous repliés par défaut, ouverts à la demande (en mémoire seulement, planOpenMem)
  const pf=new Proxy({},{get:(o,k)=>!planOpenMem[k]}),ks=Object.keys(g).sort(),allF=ks.every(k=>pf[k]);
  $("tasks").innerHTML=(ks.length>1&&!q?`<div class="mfold-all"><button type="button" class="mini" data-mfoldall="1">${L(allF?"Tout déplier":"Tout replier")}</button></div>`:"")+ks.map(k=>{const shut=!q&&pf[k];
    return `<button type="button" class="mfold" data-mfold="${k}" aria-expanded="${!shut}"><span class="mf-chev">${CHEV}</span><span class="grow">${L(MOL[+k%100])} ${Math.floor(+k/100)}</span><span class="mf-n">${g[k].length}</span></button>`+(shut?"":`<div class="card">${g[k].map(t=>{
    // v44.4 : ligne aérée : jour à gauche, titre + détails au milieu, statut et « ⋯ » à droite (toucher le titre = modifier)
    const d=parse(t.date),dd=`<div class="pr-date" aria-hidden="true"><b>${d.getDate()}</b><span class="notr">${d.toLocaleDateString(LANG==="en"?"en-GB":LANG==="nl"?"nl-BE":"fr-BE",{weekday:"short"})}</span></div>`;
    if(t.src==="ical")return `<div class="row task prow ${t.canc?"isfait":""}" style="--c:var(${colorOf(t)})" data-icalinfo="${esc(t.id)}">${dd}
      <div class="grow pr-main"><div class="ttl">${esc(t.title)}</div><div class="pr-meta"><i class="pr-dot"></i><span class="notr">${esc(t.cat||L(ICAL_CAT))}</span>${t.time?` · <span class="pr-time">${hrs(t)}</span>`:""}${t.canc?'<span class="canc-pill">Annulé</span>':""}${t.loc?` · ${esc(t.loc)}`:""}</div></div></div>`;
    const late=t.status!=="fait"&&daysTo(t.end||t.date)<0;
    return `<div class="row task prow ${t.status==="fait"?"isfait":""} ${late?"is-past":""}" style="--c:var(${colorOf(t)})">${dd}
      <div class="grow pr-main"><button type="button" class="ttl ttl-btn" data-edit="task:${t.id}">${esc(t.title)}</button>
      <div class="pr-meta"><i class="pr-dot"></i>${esc(t.cat||"")}${t.time?` · <span class="pr-time">${hrs(t)}</span>`:""}${t.end?` · → ${fmt(t.end)}`:""}${t.tbc?` <button class="tbc" data-cf="${t.id}" title="Toucher pour confirmer la date">à confirmer</button>`:""}${late?' <span class="past">Passé</span>':""}</div>
      ${t.note?`<div class="pr-note">${esc(t.note)}</div>`:""}</div>
      <button class="status" data-st="${t.id}" data-s="${t.status}">${t.status}</button>
      <button type="button" class="pr-more" data-tmore2="${t.id}" aria-label="Plus d'actions">⋯</button></div>`}).join("")}</div>`)}).join("");
}
$("v-plan").addEventListener("click",e=>{
  const ii=e.target.closest(".row[data-icalinfo]");if(ii){icalInfo(ii.dataset.icalinfo);return}
  const b=e.target.closest("button");if(!b)return;
  if(b.dataset.f){data.ui.filter=b.dataset.f;saveUI();renderPlan();return}
  if(b.dataset.mfold){const k=b.dataset.mfold;if(planOpenMem[k])delete planOpenMem[k];else planOpenMem[k]=1;renderPlan();return}
  if(b.dataset.mfoldall){const ks=[...document.querySelectorAll("#tasks [data-mfold]")].map(x=>x.dataset.mfold),close=ks.some(k=>planOpenMem[k]);
    ks.forEach(k=>{if(close)delete planOpenMem[k];else planOpenMem[k]=1});renderPlan();return}
  if(b.dataset.tmore2){const t=data.tasks.find(x=>x.id===b.dataset.tmore2);if(!t)return;
    openActions(t.title,[{l:"Modifier",fn:()=>openEdit("task:"+t.id)},
      ...STATUSES.map(s=>({l:s==="à faire"?"Marquer à faire":s==="en cours"?"Marquer en cours":"Marquer comme fait",on:t.status===s,fn:()=>{t.status=s;save();renderPlan()}})),
      {l:"Supprimer",danger:true,fn:()=>taskDel(t.id)}]);return}
  const T=data.tasks;
  if(b.dataset.st){const t=T.find(x=>x.id===b.dataset.st);t.status=STATUSES[(STATUSES.indexOf(t.status)+1)%3];save();renderPlan()}
  else if(b.dataset.cf){const t=T.find(x=>x.id===b.dataset.cf);t.tbc=false;save();renderPlan();toast("Date confirmée")}
  else if(b.dataset.tdel){if(c2ok(b))taskDel(b.dataset.tdel)}
});
// v34 : le formulaire n'occupe plus le haut de l'Agenda : il s'ouvre dans une fenêtre (« + Activité »)
// v37 : ajout rapide en langage courant : « Dentiste jeudi 14h », « Réunion demain à 9h30 », « Anniv le 12/11 »
// parseQuick(texte, maintenant) → {title, date?, time?} ; la date et l'heure trouvées remplissent les champs (sauf s'ils ont été touchés à la main)
const QW={fr:["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"],en:["sunday","monday","tuesday","wednesday","thursday","friday","saturday"],nl:["zondag","maandag","dinsdag","woensdag","donderdag","vrijdag","zaterdag"]};
const QM=[["janv","jan","janvier","january","januari"],["fevr","feb","fevrier","february","februari"],["mars","mar","march","maart"],["avr","apr","avril","april"],["mai","may","mei"],["juin","jun","june","juni"],["juil","jul","juillet","july","juli"],["aout","aug","august","augustus"],["sept","sep","septembre","september"],["oct","octobre","october","okt","oktober"],["nov","novembre","november"],["dec","decembre","december"]];
function parseQuick(text,now){now=now||new Date();const fold0=t=>t.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
  let t=" "+text+" ",date=null,time=null;const low=()=>fold0(t);
  const cut=(re,f)=>{const m=low().match(re);if(!m)return false;const r=f(m);if(r===false)return false;const i=m.index;t=t.slice(0,i)+" "+t.slice(i+m[0].length);return true};
  const d0=new Date(now.getFullYear(),now.getMonth(),now.getDate()),add=n=>{const d=new Date(d0);d.setDate(d.getDate()+n);return d};
  // heure : 14h, 14h30, 14:30, 9 h, 9am, 2.30pm, 14u, 14u30 (précédée ou non de « à », « at », « om »)
  cut(/\s(?:a|at|om|vers)?\s*(\d{1,2})\s*(?:h|u|:|\.)\s*(\d{2})?(?=\s)/,m=>{const h=+m[1],mi=+(m[2]||0);if(h>23||mi>59)return false;time=`${two(h)}:${two(mi)}`})||
  cut(/\s(?:at\s)?(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)(?=\s)/,m=>{let h=+m[1]%12;if(m[3]==="pm")h+=12;time=`${two(h)}:${two(+(m[2]||0))}`})||
  cut(/\s(?:a\s)?midi(?=\s)/,()=>{time="12:00"});
  // jour : aujourd'hui, demain, après-demain (+ anglais, néerlandais)
  cut(/\s(?:apres[- ]demain|overmorgen|day after tomorrow)(?=\s)/,()=>{date=add(2)})||
  cut(/\s(?:demain|tomorrow|morgen)(?=\s)/,()=>{date=add(1)})||
  cut(/\s(?:aujourd'?hui|ce soir|today|tonight|vandaag|vanavond)(?=\s)/,m=>{date=add(0);if(!time&&/soir|tonight|vanavond/.test(m[0]))time="20:00"})||
  // date : 12/11, 12/11/2026, le 12 novembre, 12 nov, nov 12
  cut(/\s(?:le\s|on\s|op\s)?(\d{1,2})[\/.-](\d{1,2})(?:[\/.-](\d{2,4}))?(?=\s)/,m=>{const dd=+m[1],mm=+m[2]-1;if(mm>11||dd>31||dd<1)return false;let y=m[3]?+m[3]:d0.getFullYear();if(y<100)y+=2000;
    let d=new Date(y,mm,dd);if(!m[3]&&d<d0)d=new Date(y+1,mm,dd);date=d})||
  cut(/\s(?:le\s|on\s|op\s)?(\d{1,2})(?:er|st|nd|rd|th|e)?\s+([a-z]+)\.?(?=\s)/,m=>{const mi=QM.findIndex(a=>a.some(w=>m[2].startsWith(w)&&m[2].length>=3));if(mi<0)return false;
    const dd=+m[1];if(dd<1||dd>31)return false;let d=new Date(d0.getFullYear(),mi,dd);if(d<d0)d=new Date(d0.getFullYear()+1,mi,dd);date=d})||
  // jour de la semaine : jeudi, jeudi prochain, next thursday
  cut(/\s(?:next\s|volgende\s)?(dimanche|lundi|mardi|mercredi|jeudi|vendredi|samedi|sunday|monday|tuesday|wednesday|thursday|friday|saturday|zondag|maandag|dinsdag|woensdag|donderdag|vrijdag|zaterdag)(\s+prochain)?(?=\s)/,m=>{
    let wd=-1;for(const k in QW){const i=QW[k].indexOf(m[1]);if(i>=0)wd=i}let n=(wd-d0.getDay()+7)%7;if(n===0)n=7;date=add(n)});
  const title=t.replace(/\s(?:le|la|a|à|at|on|om|op)\s*$/i," ").replace(/\s+/g," ").trim();
  return {title:title||text.trim(),date:date?iso(date):null,time}}
let fTouched=false;
function quickPreview(){const v=$("fTitle").value,h=$("fHint");if(!v.trim()){h.hidden=true;return}
  const q=parseQuick(v);if(!q.date&&!q.time){h.hidden=true;return}
  if(!fTouched){if(q.date)$("fDate").value=q.date;$("fTime").value=q.time||""}
  const d=q.date?new Date(q.date+"T12:00"):null;
  if(shIsl("quickHint")){try{window.SCIslands.quickHint(h,{icon:ICS.calendar||"",title:q.title,when:`${d?d.toLocaleDateString(LANG==="fr"?"fr-BE":LANG==="nl"?"nl-BE":"en-GB",{weekday:"long",day:"numeric",month:"long"}):""}${q.time?` ${d?"· ":""}${q.time}`:""}`,i18n:agI18n()});h.hidden=false;return}catch(e){reportErr("island quickHint: "+(e&&e.message));try{window.SCIslands.unmount(h)}catch(_){}}}
  h.innerHTML=`${IC("calendar")||""}<span>${L("Compris")} : <b class="notr">${esc(q.title)}</b> · ${d?esc(d.toLocaleDateString(LANG==="fr"?"fr-BE":LANG==="nl"?"nl-BE":"en-GB",{weekday:"long",day:"numeric",month:"long"})):""}${q.time?` ${d?"· ":""}${q.time}`:""}</span>`;h.hidden=false}
$("fTitle").addEventListener("input",quickPreview);
["fDate","fTime"].forEach(id=>$(id).addEventListener("input",()=>{fTouched=true}));
function openTaskSheet(date){const f=$("taskForm");fTouched=false;$("fHint").hidden=true;if(!$("fDate").value||date)$("fDate").value=date||iso(today());
  $("taskSheet").hidden=false;setTimeout(()=>$("fTitle").focus(),80)}
function closeTaskSheet(){$("taskSheet").hidden=true;$("fMore").open=false}
$("taskAdd").addEventListener("click",()=>openTaskSheet(typeof selDay==="string"&&calMode==="day"?selDay:null));
$("taskClose").addEventListener("click",closeTaskSheet);
$("taskSheet").addEventListener("click",e=>{if(e.target.id==="taskSheet")closeTaskSheet()});
function taskDel(id){undoable("Activité supprimée",[id],()=>{tomb(id);data.tasks=data.tasks.filter(x=>x.id!==id)},{after:()=>{renderPlan();renderTypes()}})}
$("taskForm").addEventListener("submit",e=>{
  e.preventDefault();
  const q=parseQuick($("fTitle").value),t={id:uid(),title:(q.date||q.time)?q.title:$("fTitle").value.trim(),date:$("fDate").value,status:"à faire",tbc:false};
  if(!t.title||!t.date)return;
  t.cat=ensureType($("fCat").value);
  if($("fTime").value)t.time=$("fTime").value;
  if(t.time&&$("fTimeEnd").value){if($("fTimeEnd").value<=t.time){toast("L'heure de fin doit être après l'heure de début");return}t.timeEnd=$("fTimeEnd").value}
  if($("fEnd").value&&$("fEnd").value>=t.date)t.end=$("fEnd").value;
  remApply(t,"f");data.tasks.push(t);save();renderPlan();renderTypes();e.target.reset();remSel.f=null;renderRem("f");closeTaskSheet();toast("Ajouté à l'agenda");if(t.time)setTimeout(maybeAskNotif,900); // v37 : la proposition arrive quand elle a du sens
});
