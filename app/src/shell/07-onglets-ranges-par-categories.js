/* ---------- onglets, rangés par catégories ---------- */
// La barre du bas montre des catégories ; dans une catégorie, une barre en haut permet de choisir la fonction.
// v25 : les catégories deviennent des « espaces » (page Espaces + barre latérale sur ordinateur)
// v42 : trois applications dans l'application mère Sid'Compagnon (même compte, mêmes données) ; Réglages et Compte sont dans Sid'Compagnon
const GROUPS=[
  {k:"orga",label:MARQUES.journee,app:"agenda",tabs:["plan","todo","pomo"]}, // v41 : Listes retirées ; v42 : Focus (pomodoro) revient
  {k:"sport",label:MARQUES.forme,app:"fit",tabs:["muscu","nutri","graph"]},
  {k:"perso",label:MARQUES.note,app:"note",tabs:["notes","docs","pwd"]},
  {k:"more",label:MARQUES.compagnon,app:"home",tabs:["more","app"]}];
const APP_GROUPS=GROUPS.slice(0,3);
const appOf=v=>v==="home"||v==="spaces"?"home":groupOf(v).app;
const SHORT={plan:"Agenda",todo:"Tâches",lists:"Listes",pomo:"Focus",muscu:"Musculation",nutri:"Nutrition",graph:"Graphiques",notes:"Notes",docs:"Documents",pwd:"Mots de passe",more:"Réglages",app:"Installer l'app"};
const ICON=k=>{const e=$("fnIcons").querySelector(`[data-ic="${k}"]`);return e?e.innerHTML:""};
const groupOf=v=>GROUPS.find(g=>g.tabs.includes(v))||GROUPS[0];
// v32 : Nutrition et Graphiques n'apparaissent que pour les comptes qui y ont accès (décidé par le serveur)
const RESERVED={}; // v39 : Nutrition et Graphiques ouverts à tous (le calcul passe par l'IA de chacun, plus par la clé de Sid)
const tabAllowed=k=>!RESERVED[k]||!!(session&&Array.isArray(session.feat)&&session.feat.includes(RESERVED[k]));
const OFF_TABS=["lists"];
const visibleTabs=()=>[...TABS.filter(([k])=>!OFF_TABS.includes(k)&&tabAllowed(k)&&data.prefs.tabs[k]!==false).map(([k])=>k),"more"];
const groupTabs=g=>g.tabs.filter(k=>visibleTabs().includes(k));
// icônes du dock et de la barre latérale
const HOMEIC=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z"/></svg>`;
const GRIDIC=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/></svg>`;
const USERIC=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M5 21v-1a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v1"/></svg>`;
const PLUSIC=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`;
// v28 : la barre du bas montre directement les 3 espaces (demande de Sid) : Aujourd'hui, Organisation, Santé, Coffre, Compte.
// Toucher un espace rouvre sa dernière fonction ; en haut, des pastilles passent d'une fonction à l'autre. Le « + » est sur la page Aujourd'hui.
const DOCK=[["home","Aujourd'hui",HOMEIC],["orga","Organisation",null],["sport","Santé",null],["perso","Coffre",null],["more","Compte",USERIC]];
// v42 : la barre du bas montre les fonctions de l'app ouverte (sid'agenda : Agenda, Tâches, Focus…) ; dans Sid'Compagnon, pas de barre
// v44.7 : la page garde toujours en bas la place de la barre (sa hauteur réelle, 0 si elle est cachée) : le dernier élément
// n'est plus coupé derrière (ordinateur avec la barre latérale masquée, téléphone, tablette)
function navPad(){const n=document.querySelector("nav"),h=n&&!n.hidden&&getComputedStyle(n).display!=="none"?Math.ceil(n.getBoundingClientRect().height):0;
  document.documentElement.style.setProperty("--navh",h+"px")}
addEventListener("resize",()=>requestAnimationFrame(navPad));
if(window.ResizeObserver)new ResizeObserver(()=>navPad()).observe(document.querySelector("nav"));
const shIsl=k=>!!(window.SCIslands&&window.SCIslands[k]&&!window.__noIslands);
function renderNav(v){requestAnimationFrame(navPad);const nav=document.querySelector("nav"),a=appOf(v);
  if(a==="home"){nav.hidden=true;document.body.classList.remove("has-nav");return}
  const ts=groupTabs(groupOf(v));nav.hidden=false;document.body.classList.add("has-nav");$("navIn").style.gridTemplateColumns=`repeat(${ts.length},minmax(0,1fr))`;
  // v61 (#3) : barres de navigation dessinées par React (app/src/Shell.tsx) ; ancien rendu en secours
  if(shIsl("nav")){try{window.SCIslands.nav($("navIn"),{cur:v,i18n:agI18n(),items:ts.map(k=>({k,icon:ICON(k)||"",label:SHORT[k],badge:BADGES[k]||0}))});return}catch(e){reportErr("island nav: "+(e&&e.message))}}
  $("navIn").innerHTML=ts.map(k=>`<button type="button" class="tab" data-go="${k}"${k===v?' aria-current="page"':""}><span class="tabicon">${ICON(k)}</span><span class="tab-l">${L(SHORT[k])}</span>${badgeHtml(k)}</button>`).join("")}
// page affichée → bouton du dock allumé
const dockOf=v=>v==="home"?"home":v==="more"||v==="app"?"more":v==="spaces"?"":groupOf(v).k;
// espace touché → dernière fonction ouverte dans cet espace (sinon la première affichée)
function openGroup(k){const g=GROUPS.find(x=>x.k===k);if(!g)return;const ts=groupTabs(g);if(!ts.length)return;
  // chaque app s'ouvre toujours sur sa fonction principale (demandes de Sid) : sid'agenda → Agenda, sid'fit → Nutrition, sid'note → Notes
  const OPEN_ON={orga:"plan",sport:"nutri",perso:"notes"},first=OPEN_ON[k];if(k==="orga"&&Object.keys(planOpenMem).length){planOpenMem={};renderPlan()}
  const last=first&&ts.includes(first)?first:data.ui.glast&&data.ui.glast[k];show(ts.includes(last)?last:ts[0])}
// pastilles : chaque fonction a la sienne, dans la barre du haut (À faire : tâches ouvertes, Pomodoro : en cours)
const BADGES={};
const badgeHtml=k=>{const b=BADGES[k];return !b?"":b==="dot"?`<i class="sbadge dot" aria-label="${L("En cours")}"></i>`:`<i class="sbadge">${b>99?"99+":b}</i>`};
function setBadge(k,v){if(BADGES[k]===v)return;BADGES[k]=v;
  if(shIsl("nav")&&Object.keys($("navIn")).some(x=>x.startsWith("__reactContainer"))){const cv=data.ui&&data.ui.view;if(cv)renderNav(cv);renderGroupBadges();return} // React : on redessine la barre
  const sb=document.querySelector(`#navIn [data-go="${k}"]`);if(sb)sb.querySelector(".sbadge")?.remove(),sb.insertAdjacentHTML("beforeend",badgeHtml(k));
  renderGroupBadges()}
// en bas : seulement si la catégorie n'a qu'une fonction affichée (sinon la pastille est en haut)
function renderGroupBadges(){GROUPS.forEach(g=>{const el=document.querySelector(`[data-gbadge="${g.k}"]`);if(!el)return;const ts=groupTabs(g),b=ts.length===1?BADGES[ts[0]]:0;
  el.hidden=!b;el.textContent=b&&b!=="dot"?b:"";el.classList.toggle("dot",b==="dot")})}
function show(v){
  if(v!=="home"&&v!=="spaces"&&!visibleTabs().includes(v))v="home";
  const g=groupOf(v);
  const wasApp=document.documentElement.dataset.app;
  {const was=wasApp,nx=appOf(v);if(introReady&&was&&nx!=="home"&&was!==nx)appIntro(nx)}
  data.ui.view=v;if(GROUPS.some(x=>x.tabs.includes(v))){data.ui.glast=data.ui.glast||{};data.ui.glast[g.k]=v}saveUI();
  document.body.dataset.g=g.k;document.body.dataset.v=v;if(v==="muscu"){const sd=$("muStatsD");if(sd)sd.open=false} // v74.2 : statistiques toujours refermées
if(v!=="notes")document.body.classList.remove("note-full");if(v==="more"){try{renderBio();renderAiCards();mcpLoad()}catch(e){}}
  document.querySelectorAll(".view").forEach(s=>s.hidden=s.id!=="v-"+v);
  document.documentElement.dataset.app=appOf(v);renderNav(v);renderVhead(v);renderSide(v);
  if(v==="home")renderHome();
  if(wasApp!==appOf(v)&&appOf(v)!=="home"&&$("vhead").animate&&!window.__noIntro)$("vhead").animate([{clipPath:"inset(0 100% 0 0)"},{clipPath:"inset(0 0 0 0)"}],{duration:matchMedia("(prefers-reduced-motion: reduce)").matches?1:260,easing:"ease-out"});
  if(v==="spaces")renderSpaces();
  if(v==="more"){renderStats();renderTabsCard();renderHomeSel();renderLook();if(session)renderNotif()}
  // v37 : le coffre se reverrouille en le quittant, tout de suite ou après le délai choisi (Réglages)
  secCheck();for(const k of SEC_K){if(k===v)delete secAway[k];else secLeave(k)}
  if(v==="docs")docsEnter();
  if(v!=="docs"&&ps&&ps.host)psEnd(null);
  if(v==="pwd"){renderPwd();if(!vaultKey&&pinStep==="unlock")bioAuto("main",()=>$("pinBio").click())}
  if(v==="lists")slEnter();
  if(v==="notes"&&!noteOpenId)renderNotes();
  if(v!=="notes"&&v!=="nutri")dictStop();
  if(v==="nutri")renderNutri();
  if(v==="todo"&&!TV().doneCal){TV().doneCal=true;renderTodos()} // v31 : « Réalisées » s'ouvre toujours sur le calendrier
  if(v==="graph")renderGraph();
  if(v!=="graph")grTipHide();
  if(v==="pomo")renderSpotify();
  window.scrollTo(0,0);elanCompact();
  if(v==="home"&&introReady&&INTRO[wasApp])appOutro(wasApp);
}
$("navIn").addEventListener("click",e=>{const t=e.target.closest("[data-go]");if(t)show(t.dataset.go)});
function applyTabs(){
  const vis=visibleTabs();
  const v=data.ui.view;if(v&&v!=="home"&&v!=="spaces"&&!vis.includes(v))show("home");else{renderSide(v);if(v)renderNav(v);if(v==="home")renderHome()}
}
// --- en-tête d'un module : nom de l'espace + pastilles de ses fonctions ---
// v28 : nom de l'espace + pastilles des fonctions de cet espace (Agenda · Tâches · Focus…)
// v42 : en-tête d'une app : son logo et son nom, et le retour à Sid'Compagnon (les fonctions sont dans la barre du bas)
const APP_ROLES={agenda:"Agenda, tâches, focus",fit:"Sport et alimentation",note:"Notes, documents, mots de passe",home:"Tes réglages"};
function renderVhead(v){const el=$("vhead");
 if(v==="home"||v==="spaces"){el.hidden=true;document.title="Sid'Compagnon";return}
 const g=groupOf(v),previous=el.dataset.app===g.app?Number(el.querySelector("[role=progressbar]")?.getAttribute("aria-valuenow")||0):0;el.hidden=false;el.dataset.app=g.app;el.classList.remove("many");
 const list=allT().filter(t=>onDay(t,iso(today()))&&!t.canc),done=list.filter(t=>t.status==="fait"||(t.date===iso(today())&&t.timeEnd&&toMin(t.timeEnd)<=new Date().getHours()*60+new Date().getMinutes())).length;
 let progress=`${done} / ${list.length} ${L("activités réalisées")}`,percent=list.length?Math.round(done/list.length*100):0,hasProgress=g.app==="agenda";
 // v76 (capture 1) : journée vide → une phrase claire au lieu de « 0 / 0 » et d'une barre vide
 if(g.app==="agenda"&&!list.length){progress=L("Aucune activité aujourd'hui");hasProgress=false}
 if(v==="todo"){const day=iso(today()),items=data.todos.filter(t=>!t.paused&&(t.done?doneDay(t)===day:!t.day||tDay(t)===day)),completed=items.filter(t=>t.done).length;progress=`${completed} / ${items.length} ${L("tâches réalisées aujourd'hui")}`;percent=items.length?Math.round(completed/items.length*100):0;hasProgress=true}
 if(v==="todo"&&progress.startsWith("0 / 0")){progress=L("Aucune tâche aujourd'hui");hasProgress=false}
 if(v==="pomo"){const r=P.run,segs=r?r.segs:buildSegs(P.cfg),total=r?segs.reduce((a,x)=>a+x.d*MIN,0):pomoLastPosition?pomoLastPosition.total:segs.reduce((a,x)=>a+x.d*MIN,0),taken=r?Math.max(0,Math.min(total,elapsed(r))):pomoLastPosition?total:0,n=r?segs.filter(x=>x.t==="w").length:pomoLastPosition?pomoLastPosition.cycles:segs.filter(x=>x.t==="w").length,cycle=r?segs.slice(0,locate(r,taken).i+1).filter(x=>x.t==="w").length:pomoLastPosition?n:0;progress=!r&&!pomoLastPosition?`${pomoDuration(total/MIN)} · ${n} ${L(n===1?"session":"sessions")}`:`${pomoDuration(taken/MIN)} ${L("sur")} ${pomoDuration(total/MIN)} · ${L("session")} ${Math.min(n,cycle)} ${L("sur")} ${n}`;percent=total?Math.min(100,Math.round(taken/total*1000)/10):0;hasProgress=true}
 if(g.app==="fit"){const n=NU();
  if(v==="muscu"){const p=muSessionProgress();progress=`${p.done} / ${p.total} ${L("séries complètes")}`;percent=p.total?Math.round(p.done/p.total*100):0;hasProgress=true}
  else if(nutriAllowed()&&n.plan?.kcal){const eaten=Math.round(sumOf(dayLog(iso(today()))).kcal),target=dayTarget(iso(today())).kcal;progress=`${fmtFull(eaten)} / ${fmtFull(Math.round(target))}\u00a0kcal`;percent=Math.min(100,Math.round(eaten/target*100));hasProgress=true}
  else{progress=L("Définis ton objectif alimentaire");hasProgress=false}}
 if(g.app==="note"){progress=elanCoffreMetric(v);hasProgress=false}
 if(g.app==="home"){progress="";hasProgress=false}
 const title=SHORT[v]||g.label;
 document.title=`${g.label} · ${L(title)} — Sid'Compagnon`;
 const props={app:g.app,label:g.label,role:APP_ROLES[g.app],title,progress,percent,hasProgress,gridIcon:GRIDIC,askIcon:IC("message"),i18n:agI18n()};
 if(shIsl("appHead")){try{window.SCIslands.appHead(el,props);return}catch(e){reportErr("island appHead: "+(e&&e.message))}}
 el.innerHTML=`<div class="elan-head-row"><button type="button" class="ah-home" data-go="home" aria-label="${L("Toutes les apps")}"><span class="ah-grid">${GRIDIC}</span></button><span class="ah-brand">${LOGO(g.app,"ah-logo")}<span class="ah-names"><b>${g.label}</b><small>${L(APP_ROLES[g.app])}</small></span></span>${ahBotBtn()}</div><h1 class="elan-title">${L(title)}</h1><div class="elan-progress"><span>${progress}</span><span class="elan-progress-track" ${hasProgress?"":"hidden"} role="progressbar" aria-label="${L("Progression du jour")}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percent}"><i style="width:${percent}%"></i></span></div>`;
 const bar=el.querySelector(".elan-progress-track i");if(bar&&hasProgress){bar.style.width=previous+"%";bar.getBoundingClientRect();requestAnimationFrame(()=>bar.style.width=percent+"%")}

}
// v77 (capture Sid'Note) : un seul bouton Sid'Bot pour tous les bandeaux d'app (bandeau commun et éditeur de notes) ;
// avant, l'éditeur de notes avait sa copie, restée « Claude ». Le clic est géré par elanHeadClick → sbOpen (Sid'Bot, dans l'app).
const ahBotBtn=()=>`<button type="button" class="ah-claude" data-app-claude="1" aria-label="${L("Ouvrir Sid'Bot, l'assistant")}"><span class="ah-chat">${IC("message")}</span><span class="notr">${MARQUES.bot}</span></button>`;
function elanHeadClick(e){const b=e.target.closest("[data-go]");if(b)show(b.dataset.go);if(e.target.closest("[data-app-claude]"))sbOpen(sbAppOfView(data.ui.view)); // v76 : Sid'Bot, dans l'app (plus de lien vers Claude)
}
for(const id of ["vhead","noteAppHead"])$(id).addEventListener("click",elanHeadClick);
let compactMotion=null,headerPointer=false;
// Un bandeau ne doit pas déplacer la cible entre l’appui et le clic.
addEventListener("pointerdown",()=>{headerPointer=true},true);
const headerRelease=()=>{headerPointer=false;requestAnimationFrame(elanCompact)};
addEventListener("pointerup",headerRelease,true);addEventListener("pointercancel",headerRelease,true);
function elanCompact(){const e=$("vhead");if(!e||headerPointer)return;const compact=window.scrollY>24||innerHeight<700||document.documentElement.classList.contains("kb-open");if(e.classList.contains("compact")===compact)return;
 const title=e.querySelector(".elan-title"),before=title?parseFloat(getComputedStyle(title).fontSize):0;if(compactMotion)compactMotion.cancel();e.style.marginBottom="";const scroll=window.scrollY,height=e.offsetHeight,margin=parseFloat(getComputedStyle(e).marginBottom)||0;e.classList.toggle("compact",compact);
 // Garder la hauteur du document au défilement évite le retour forcé à scrollY=0 sur une page courte.
 if(compact&&scroll>24&&innerHeight>=700&&!document.documentElement.classList.contains("kb-open")){e.style.marginBottom=(margin+height-e.offsetHeight)+"px";window.scrollTo(0,scroll)}
 // Le flux prend sa taille finale immédiatement : un clic pendant le défilement garde sa cible.
 if(title&&title.animate&&before){const after=parseFloat(getComputedStyle(title).fontSize);compactMotion=title.animate([{transform:`scale(${before/after})`,opacity:.7},{transform:"scale(1)",opacity:1}],{duration:matchMedia("(prefers-reduced-motion: reduce)").matches?1:180,easing:"ease-out"})}}

new MutationObserver(elanCompact).observe(document.documentElement,{attributes:true,attributeFilter:["class"]});
addEventListener("scroll",elanCompact,{passive:true});addEventListener("resize",elanCompact);document.addEventListener("focusin",elanCompact);document.addEventListener("focusout",()=>requestAnimationFrame(elanCompact));

// --- page Espaces et barre latérale (ordinateur) : tous les modules, rangés par espace, avec un chiffre utile ---
function spaceMeta(k){try{
  if(k==="plan"){const t0=iso(today()),n=allT().filter(t=>t.status!=="fait"&&!t.canc&&(t.end||t.date)>=t0).length;return n?`${n} ${L("à venir")}`:""}
  if(k==="todo"){const n=data.todos.filter(t=>!t.done&&!t.paused).length;return n?`${n} ${L(n>1?"ouvertes":"ouverte")}`:""}
  if(k==="pomo"){const m=Math.round(((data.pomo&&data.pomo.log||{})[dayKey(new Date())]||0)/60000);return m?`${m} min ${L("aujourd'hui")}`:""}
  if(k==="nutri"){const n=NU();if(!nutriAllowed()||!n.plan||!n.plan.kcal)return"";const left=Math.round(dayTarget(iso(today())).kcal-sumOf(dayLog(iso(today()))).kcal);return `${fmtFull(Math.max(0,left))} kcal`}
  if(k==="notes"){const n=NT().length;return n?String(n):""}
  if(k==="docs"){const n=docsArr().length;return n?String(n):""}
  if(k==="muscu"){const n=(data.muscu&&data.muscu.sessions||[]).length;return n?`${n} ${L(n>1?"séances":"séance")}`:""}
  return""}catch(e){return""}}
const CHEVR=`<svg class="chev-r" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>`;
function renderSpaces(){
  $("spacesList").innerHTML=GROUPS.map(g=>{const ts=groupTabs(g);if(!ts.length)return"";
    return `<div class="eyebrow sp-h">${L(g.label)}</div><div class="card sp-card">${ts.map(k=>`<button type="button" class="sp-row" data-go="${k}"><span class="sp-ic">${ICON(k)||USERIC}</span><span class="grow">${L(SHORT[k])}</span><span class="sp-meta">${esc(spaceMeta(k))}</span>${CHEVR}</button>`).join("")}</div>`}).join("");
}
$("spacesList").addEventListener("click",e=>{const b=e.target.closest("[data-go]");if(b)show(b.dataset.go)});
// v43 : la barre latérale (ordinateur et tablette) peut être masquée ; le choix est propre à l'appareil (data.ui.sideOff).
// Par défaut : affichée à partir de 960 px, masquée sur tablette (768–959 px). Masquée, la barre du bas de l'app reprend sa place.
const SIDEIC='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="4.5" width="17" height="15" rx="2"/><path d="M9.5 4.5v15"/></svg>';
function sideApply(){requestAnimationFrame(navPad);const wide=matchMedia("(min-width:1024px)").matches,u=data.ui||{};
  const on=wide&&(u.sideOff===undefined?innerWidth>=1024:!u.sideOff);
  document.body.classList.toggle("side-off",wide&&!on);document.body.classList.toggle("side-on",on);
  const sb=$("sideShow");if(sb){sb.hidden=!(wide&&!on);sb.setAttribute("aria-expanded","false")}}
function sideToggle(show){data.ui.sideOff=!show;saveUI();sideApply();const f=show?document.querySelector("#side .side-tog"):$("sideShow");if(f)f.focus({preventScroll:true})}
addEventListener("resize",()=>sideApply());
function renderSide(v){const el=$("side");if(!el)return;v=v||data.ui.view;
  if(shIsl("side")){try{window.SCIslands.side(el,{cur:v,i18n:agI18n(),icons:{side:SIDEIC,home:HOMEIC,plus:PLUSIC,user:USERIC},
      groups:GROUPS.map(g=>({app:g.app,label:g.label,items:groupTabs(g).map(k=>({k,icon:ICON(k)||"",label:SHORT[k],badge:0,meta:spaceMeta(k)}))})).filter(g=>g.items.length)});sideApply();return}
    catch(e){reportErr("island side: "+(e&&e.message))}}
  el.innerHTML=`<div class="side-brand">${LOGO("home","side-logo")}<span class="grow">Sid'Compagnon</span><button type="button" class="side-tog" aria-label="${L("Masquer la barre latérale")}" title="${L("Masquer la barre latérale")}" aria-expanded="true" aria-controls="side">${SIDEIC}</button></div>
    <button type="button" class="side-it" data-go="home" aria-current="${v==="home"}"><span class="sp-ic">${HOMEIC}</span><span class="grow">${L("Aujourd'hui")}</span></button>
    <button type="button" class="side-add" data-sadd="1"><span class="sp-ic">${PLUSIC}</span><span class="grow">${L("Ajouter")}</span></button>`+
    GROUPS.map(g=>{const ts=groupTabs(g);if(!ts.length)return"";
      return `<div class="side-grp" data-app="${g.app}"><div class="eyebrow side-h">${g.app!=="home"?LOGO(g.app,"side-applogo"):""}${esc(g.label)}</div>`+ts.map(k=>`<button type="button" class="side-it" data-go="${k}" aria-current="${v===k}"><span class="sp-ic">${ICON(k)||USERIC}</span><span class="grow">${L(SHORT[k])}</span><span class="sp-meta">${esc(spaceMeta(k))}</span></button>`).join("")+`</div>`}).join("");
  sideApply()}
$("sideShow").addEventListener("click",()=>sideToggle(true));
$("side").addEventListener("click",e=>{if(e.target.closest(".side-tog")){sideToggle(false);return}if(e.target.closest("[data-sadd]")){openQuickAdd();return}const b=e.target.closest("[data-go]");if(b)show(b.dataset.go)});
// --- ajout rapide (bouton + de la page Aujourd'hui et de la barre latérale) ---
function openQuickAdd(){const vis=visibleTabs(),acts=[
  ["plan","Une activité","Dans ton agenda",ICON("plan")],["todo","Une tâche","Dans ta liste",ICON("todo")],["notes","Une note","Texte ou photo",ICON("notes")],
  ["nutri","Un repas","Ce que tu manges",ICON("nutri")],["muscu","Une séance","Musculation",ICON("muscu")]].filter(a=>vis.includes(a[0]));
  if(shIsl("quickAdd")){try{window.SCIslands.quickAdd($("qaList"),{i18n:agI18n(),acts:acts.map(([k,t,s,icon])=>({k,t,s,icon}))});$("qaSheet").hidden=false;return}catch(e){reportErr("island quickAdd: "+(e&&e.message))}}
  $("qaList").innerHTML=acts.map(([k,t,s,ic])=>`<button type="button" class="qa-it" data-qa="${k}"><span class="sp-ic">${ic}</span><span class="grow"><b>${L(t)}</b><span class="small muted">${L(s)}</span></span>${CHEVR}</button>`).join("");
  $("qaSheet").hidden=false}
$("qaClose").addEventListener("click",()=>$("qaSheet").hidden=true);
$("qaSheet").addEventListener("click",e=>{if(e.target.id==="qaSheet"){$("qaSheet").hidden=true;return}const b=e.target.closest("[data-qa]");if(!b)return;$("qaSheet").hidden=true;qaGo(b.dataset.qa)});
// v76 : ouvrir directement le bon champ (ajout rapide, premiers pas de l'accueil, états vides)
function qaGo(k){show(k);
  setTimeout(()=>{if(k==="plan")openTaskSheet()
    else if(k==="todo")$("todoIn").focus();
    else if(k==="notes"){if(noteOpenId)closeNote();$("noteNew").click()}
    else if(k==="nutri"){nuGoTab("day");$("nuAsk").focus();$("nuAsk").scrollIntoView({block:"center"})}
    else if(k==="muscu"){$("msName")&&$("msName").focus()}},80)}
// v76 : « Premiers pas » sur l'accueil : trois petites actions réelles, une par app, cochées d'après tes vraies données (rien n'est créé pour toi).
// Facultatif : « Masquer » (data.prefs.tour="hidden"), « Revoir les premiers pas » dans Réglages le relance. Pas de récompense : juste « 1 sur 3 ».
function tourSteps(){const vis=visibleTabs(),st=[];
  if(vis.includes("plan")||vis.includes("todo"))st.push({k:vis.includes("plan")?"plan":"todo",app:"agenda",t:"Ajoute ta première activité",s:"Sid'Journée · un cours, un rendez-vous, une tâche",done:(data.tasks||[]).some(t=>t&&t.src!=="ical")||(data.todos||[]).length>0});
  if(vis.includes("nutri")||vis.includes("muscu"))st.push({k:vis.includes("nutri")&&nutriAllowed()?"nutri":"muscu",app:"fit",t:"Note un repas ou une séance",s:"Sid'Forme · ce que tu manges ou ton entraînement",done:NU().log.length>0||M().sessions.length>0});
  if(vis.includes("notes"))st.push({k:"notes",app:"note",t:"Écris ta première note",s:"Sid'Note · une idée, une liste, un cours",done:NT().length>0});
  return st}
function homeNext(){if(data.prefs&&data.prefs.tour==="hidden")return "";const st=tourSteps();if(!st.length)return "";const n=st.filter(x=>x.done).length;
  if(n===st.length){if(data.prefs.tour!=="done"){data.prefs.tour="done";save()}return ""}
  if(data.prefs.tour==="done")return "";
  return `<section class="hs-tour" aria-labelledby="hsTourT"><div class="hs-tour-h"><b id="hsTourT">${L("Premiers pas")}</b><span class="small muted">${n} ${L("sur")} ${st.length}</span><button type="button" class="linkbtn" id="hsTourHide">${L("Masquer")}</button></div>
    <div class="elan-progress-track hs-tour-bar" role="progressbar" aria-label="${L("Premiers pas")}" aria-valuemin="0" aria-valuemax="${st.length}" aria-valuenow="${n}"><i style="width:${Math.round(n/st.length*100)}%"></i></div>
    <ul class="hs-steps">${st.map(x=>`<li><button type="button" class="hs-step" data-app="${x.app}" data-tourgo="${x.k}" ${x.done?'aria-disabled="true"':""}><span class="hs-check" aria-hidden="true">${x.done?(IC("tick")||""):""}</span><span class="grow"><b>${L(x.t)}</b><span class="small muted">${L(x.s)}</span></span><span class="sr-only">${L(x.done?"Fait":"À faire")}</span></button></li>`).join("")}</ul></section>`}
// --- page Aujourd'hui : la journée en un coup d'œil ---
function inCount(ms){const m=Math.round(ms/60000);if(m<60)return `${L("dans")} ${m} min`;const h=Math.floor(m/60),r=m%60;return `${L("dans")} ${h} h${r?" "+two(r):""}`}
function renderHome(){if(!$("homeBody"))return;
  const now=new Date(),t0=iso(today()),nm=(session&&session.name||"").trim(); // v42 : surnom complet
  $("homeDate").textContent=now.toLocaleDateString(LANG==="en"?"en-GB":"fr-BE",{weekday:"long",day:"numeric",month:"long"});
  $("homeHello").textContent=`${L(now.getHours()>=18?"Bonsoir":"Bonjour")}${nm?" "+nm:""}.`;
  $("homeAvatar").textContent=(nm||"S").slice(0,2).toUpperCase();
  const vis=visibleTabs(),T=vis.includes("plan")?allT().filter(t=>t.status!=="fait"&&!t.canc):[];
  const start=/** @type {(t:any)=>any} */(t=>{const d=parse(t.date);const[h,m]=(t.time||"08:00").split(":").map(Number);d.setHours(h,m);return d});
  const next=T.filter(t=>t.time&&start(t)>now).sort((a,b)=>start(a)-start(b))[0]||T.filter(t=>!t.time&&t.date>t0).sort((a,b)=>a.date.localeCompare(b.date))[0];
  // v44.7 : Sid'Compagnon = 3 grandes cartes, une par app (nom, identité, ce qu'elle fait en une ligne, 1 ou 2 repères du jour) ;
  // toucher une carte ouvre l'app. Tout le reste a quitté cette page (il est dans chaque app).
  const cards=[];$("homeBody").dataset.view="simple";
  {const g=APP_GROUPS.find(x=>x.app==="agenda");if(groupTabs(g).length){const it=[];
    if(next){const s=start(next),same=next.date===t0,tm=parse(next.date);tm.setDate(tm.getDate()-1);
      const when=next.time&&same?inCount(s-(+now)):next.time&&iso(tm)===t0?`${L("demain")} · ${next.time}`:`${DOW[s.getDay()]} ${s.getDate()} ${MO[s.getMonth()]}${next.time?" · "+next.time:""}`;
      it.push([L("Prochain"),{u:next.title},when])}
    if(vis.includes("todo")){const n=dayTodos(t0).filter(t=>!t.done).length;it.push([L("Tâches"),n?`${n} ${L(n>1?"tâches aujourd'hui":"tâche aujourd'hui")}`:L("Aucune tâche aujourd'hui"),""])}
    if(!it.length)it.push([L("Prochain"),L("Rien de prévu"),""]);
    cards.push({g,desc:"Ton agenda et tes tâches, jour après jour.",it})}}
  {const g=APP_GROUPS.find(x=>x.app==="fit");if(groupTabs(g).length){const it=[];
    if(vis.includes("nutri")&&nutriAllowed()&&NU().plan&&NU().plan.kcal){const tg=dayTarget(t0).kcal,eat=sumOf(dayLog(t0)).kcal;it.push([L("Nutrition"),`${fmtFull(Math.round(eat))} / ${fmtFull(tg)} kcal`,""])}
    if(vis.includes("muscu")){const nd=coachNext();if(nd)it.push([L("Séance"),{u:nd.name},""])}
    if(!it.length)it.push([L("Pour commencer"),L("Crée ton profil ou ta première séance"),""]);
    cards.push({g,desc:"Musculation, nutrition et graphiques de ta forme.",it:it.slice(0,2)})}}
  {const g=APP_GROUPS.find(x=>x.app==="note");if(groupTabs(g).length){const it=[];
    const last=NT().filter(n=>!n.secret&&(n.title||n.body)).sort((a,b)=>(b.upd||0)-(a.upd||0))[0];
    // v74.5 : titre nettoyé (espaces, retours à la ligne), sinon la première ligne du texte ; coupé proprement au mot
    const nTxt=n=>{const t=String(n.title||"").replace(/\s+/g," ").trim()||(String(n.body||"").split(/\n/).map(x=>x.replace(/\s+/g," ").trim()).find(Boolean)||"");
      return t.length>90?t.slice(0,90).replace(/\s+\S*$/,"")+"…":t};
    if(last&&nTxt(last))it.push([L("Dernière note"),{u:nTxt(last)},""]);
    const nN=NT().length;it.push([L("Classeur"),`${nN} ${L(nN>1?"notes":"note")} · ${NF().length} ${L(NF().length>1?"dossiers":"dossier")}`,""]);
    cards.push({g,desc:"Notes, documents et mots de passe, à l'abri.",it:it.slice(0,2)})}}
  const phrases={agenda:"Organise tes journées",fit:"Entraîne-toi, mange bien",note:"Écris, classe et protège"};
  const models=cards.map(({g,it})=>{let count="0",metric="notes";
    if(g.app==="agenda"){count=String(allT().filter(t=>onDay(t,t0)&&!t.canc&&t.status!=="fait").length);metric="activités restantes aujourd'hui"}
    else if(g.app==="fit"){if(vis.includes("nutri")&&nutriAllowed()&&NU().plan?.kcal){count=fmtFull(Math.max(0,Math.round(dayTarget(t0).kcal-sumOf(dayLog(t0)).kcal)));metric="kcal restantes aujourd'hui"}else{count=String(M().sessions.length);metric="séances"}}
    else{count=String(NT().length);metric=NT().length===1?"note":"notes"}
    return {app:g.app,k:g.k,label:g.label,desc:phrases[g.app],count,metric,functions:groupTabs(g).map(k=>({label:SHORT[k],icon:ICON(k)||""})),items:it.map(([k,v,w])=>({k,v:typeof v==="object"?v.u:v,user:typeof v==="object",w:w||""}))};});
  // v76 : vue simple par défaut (les 3 logos), pour tous les comptes tant que la personne n'a pas choisi « Affichage détaillé » (data.prefs.homeView="detail")
  const detail=homeDetail(),sw=`<button type="button" class="linkbtn" id="homeViewSw" aria-pressed="${detail}">${L(detail?"Affichage simple":"Affichage détaillé")}</button>`;$("homeViewBox").innerHTML=sw;
  // le conteneur peut encore porter la racine React de la vue détaillée : on la démonte avant d'écrire la vue simple (revue Codex)
  if(!detail){try{if(window.SCIslands&&window.SCIslands.unmount)window.SCIslands.unmount($("homeBody"))}catch(e){}$("homeBody").innerHTML=`<div class="hs-grid" role="group" aria-label="${L("Tes applications")}">${models.map(c=>`<button type="button" class="hs-app" data-app="${c.app}" data-gapp="${c.k}" aria-label="${esc(c.label)} — ${esc(L(APP_ROLES[c.app]))}">${LOGO(c.app,"hs-logo")}<span class="hs-name notr">${c.label}</span><span class="hs-role">${L(APP_ROLES[c.app])}</span></button>`).join("")}</div>${homeNext()}`;return}
  $("homeBody").dataset.view="detail";
  if(shIsl("home")){try{window.SCIslands.home($("homeBody"),{i18n:agI18n(),cards:models});return}catch(e){reportErr("island home: "+(e&&e.message))}}
  $("homeBody").innerHTML=`<div class="hc-list">${models.map(c=>`<button type="button" class="hc" data-app="${c.app}" data-gapp="${c.k}"><span class="hc-top">${LOGO(c.app,"home-applogo hc-logo")}<span class="hc-heading"><span class="hc-name">${c.label}</span><span class="hc-desc">${L(c.desc)}</span></span><svg class="hc-go" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg></span><span class="hc-main"><span class="hc-count">${c.count}</span><span class="hc-metric">${L(c.metric)}</span></span><span class="hc-detail">${c.items.slice(0,1).map(it=>`<span class="hc-it"><span class="hc-k">${it.k}</span><span class="hc-v">${it.user?`<span class="notr">${esc(it.v)}</span>`:esc(it.v)}</span></span>`).join("")}</span><span class="hc-fns">${c.functions.map(f=>`<span class="hc-fn"><span>${f.icon}</span>${L(f.label)}</span>`).join("")}</span></button>`).join("")}</div>`;
}
const homeDetail=()=>!!(data.prefs&&data.prefs.homeView==="detail");
function setHomeView(v){data.prefs.homeView=v==="detail"?"detail":"simple";save();renderHome();const hs=$("homeViewSel");if(hs)hs.value=data.prefs.homeView;
  toast(v==="detail"?"Affichage détaillé activé":"Affichage simple activé");setTimeout(()=>{const b=$("homeViewSw");if(b)b.focus({preventScroll:true})},30)}
$("homeViewBox").addEventListener("click",e=>{if(e.target.closest("#homeViewSw"))setHomeView(homeDetail()?"simple":"detail")});
$("homeBody").addEventListener("click",e=>{
  if(e.target.closest("#hsTourHide")){data.prefs.tour="hidden";save();renderHome();toast("Premiers pas masqués : tu peux les revoir dans Réglages");return}
  const tg=e.target.closest("[data-tourgo]");if(tg){if(tg.getAttribute("aria-disabled")==="true")return;qaGo(tg.dataset.tourgo);return}
  const ga=e.target.closest("[data-gapp]");if(ga){openGroup(ga.dataset.gapp);return}
  if(e.target.closest("[data-aioff]")){data.ui.aiCardOff=1;saveUI();renderHome();return}
  const hg=e.target.closest("[data-htg]");if(hg){const t=data.todos.find(x=>x.id===hg.dataset.htg);if(t){todoToggle(t);renderHome()}return}
  const hp=e.target.closest("[data-hplan]");if(hp){const t=data.todos.find(x=>x.id===hp.dataset.hplan);if(t){t.day=iso(today());save();renderTodos();renderHome();toast("Prévue aujourd'hui")}return}
  const n=e.target.closest("[data-note-open]");if(n){show("notes");openNote(n.dataset.noteOpen);return}
  const fo=e.target.closest("[data-folder-open]");if(fo){show("notes");noteDir=fo.dataset.folderOpen;renderNotes();window.scrollTo(0,0);return}
  const td=e.target.closest("[data-todo-open]");if(td){goToTodo(td.dataset.todoOpen);return}const b=e.target.closest("[data-go]");if(b)show(b.dataset.go)});
$("homeAvatar").addEventListener("click",()=>show("more"));
$("homeAdd").addEventListener("click",openQuickAdd);
// ouvre « Tâches » directement sur une tâche : filtre et recherche retirés, catégorie dépliée, tâche mise en évidence
function goToTodo(id){const t=data.todos.find(x=>x.id===id);show("todo");if(!t)return;
  TV().cat="all";todoQ="";if($("todoSearch"))$("todoSearch").value="";
  const k=t.cat&&catOf(t.cat)?t.cat:"none";if(TV().fold[k])delete TV().fold[k];tvSave();renderTodos();
  setTimeout(()=>{const r=document.querySelector(`#v-todo [data-tid="${id}"]`);if(!r)return;r.scrollIntoView({block:"center",behavior:"smooth"});
    r.classList.remove("hl");void r.offsetWidth;r.classList.add("hl")},60)}
setInterval(()=>{if(data.ui.view==="home"&&!document.hidden)renderHome()},60000);
function renderTabsCard(){
  if(shIsl("tabsCard")){try{window.SCIslands.tabsCard($("tabsCard"),{i18n:agI18n(),groups:GROUPS.map(g=>({k:g.k,icon:ICON("g-"+g.k)||"",label:g.label,tabs:g.tabs.filter(tabAllowed).map(k=>k==="more"?{k,label:"Réglages",on:true,fixed:true}:{k,label:TABS.find(t=>t[0]===k)[1],on:data.prefs.tabs[k]!==false})}))});return}catch(e){reportErr("island tabsCard: "+(e&&e.message))}}
  $("tabsCard").innerHTML=GROUPS.map(g=>`<div class="tabgrp">${ICON("g-"+g.k)}${L(g.label)}</div><div class="card">`+
    g.tabs.filter(tabAllowed).map(k=>k==="more"?`<div class="row"><span class="grow">${L("Réglages")}</span><span class="small muted">${L("toujours affiché")}</span></div>`
      :`<label class="row" style="cursor:pointer"><span class="grow">${L(TABS.find(t=>t[0]===k)[1])}</span><input type="checkbox" class="switch" data-tabpref="${k}" ${data.prefs.tabs[k]!==false?"checked":""}></label>`).join("")+`</div>`).join("");
}
$("tabsCard").addEventListener("change",e=>{const c=e.target.closest("[data-tabpref]");if(!c)return;
  data.prefs.tabs[c.dataset.tabpref]=c.checked;save();applyTabs();renderHomeSel();toast(c.checked?"Onglet affiché":"Onglet masqué")});

// Compteurs de présentation uniquement ; aucun nombre déchiffré avant ouverture.
function elanCoffreMetric(v){
 if(v==="notes"){const n=NT().length;return `${fmtFull(n)} ${L(n===1?"note":"notes")}`}
 if(v==="docs"){if(!dvOpen)return L("Verrouillé");const a=docsArr(),size=a.reduce((n,d)=>n+(d.size||0),0);return `${fmtFull(a.length)} ${L(a.length===1?"document":"documents")} · ${size?fmtSize(size):"0 "+(LANG==="fr"?"Ko":"KB")}`}
 if(v==="pwd")return vaultKey?`${fmtFull(vaultItems.size)} ${L(vaultItems.size===1?"mot de passe":"mots de passe")}`:L("Verrouillé");return "";
}
function elanRefreshCoffreMetric(){const v=data.ui.view;if(!["notes","docs","pwd"].includes(v))return;const e=$("vhead").querySelector(".elan-progress>span:first-child");if(e)e.textContent=elanCoffreMetric(v)}
