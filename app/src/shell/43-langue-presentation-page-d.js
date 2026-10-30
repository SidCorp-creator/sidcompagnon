/* ---------- langue, présentation, page d'accueil ---------- */
// v64 (#3) : atouts de l'écran de connexion (React quand le module est là ; repris à son arrivée)
const AUTH_FEATS=[["plan","Organise tes journées","Agenda et tâches du jour, avec des rappels."],
  ["pwd","Garde tout à l'abri","Notes, documents scannés et mots de passe, chiffrés sur ton appareil."],
  ["muscu","Ta santé","Programme de musculation sur mesure, nutrition et graphiques."],
  ["app","Partout avec toi","Sur smartphone et sur ordinateur, même sans connexion."]];
function renderAuthFeats(){const el=$("authFeats");if(!el)return;
  if(shIsl("authFeats")){const old=el.innerHTML;try{if(!Object.keys(el).some(k=>k.startsWith("__reactContainer")))el.innerHTML="";window.SCIslands.authFeats(el,{i18n:agI18n(),items:AUTH_FEATS.map(([k,t,d])=>({icon:ICON(k)||"",t,d}))});return}catch(e){el.innerHTML=old;reportErr("island authFeats: "+(e&&e.message))}}
  el.innerHTML=AUTH_FEATS.map(([k,t,d])=>`<li><span class="af-ic">${ICON(k)}</span><span><b>${L(t)}</b><span class="small muted">${L(d)}</span></span></li>`).join("")}
function setLang(v){LANG=v;ls.set("sidnote-lang",v);if(session){data.prefs.lang=v;save()}location.reload()}
// traduction de l'interface : on remplace les textes français affichés par leur version anglaise
const NOTR=".ttl,.ms-name,.doc-open b,#vwTitle,.blk b,.next .t,.notr,#accName,textarea,input,select option[data-user]";
function trStr(raw){
  const t=raw.trim();if(!t||!/[A-Za-zÀ-ÿ]/.test(t))return raw;
  let r=DICT[t];
  if(r===undefined){for(const[re,f]of PATS){const m=t.match(re);if(m){r=typeof f==="function"?f(...m.slice(1)):t.replace(re,f);break}}}
  if(r===undefined||r===t)return raw;
  return raw.replace(t,r);
}
function trNode(n){
  if(n.nodeType===3){const p=n.parentElement;if(!p||p.closest(NOTR)||p.closest("script,style"))return;const v=trStr(n.nodeValue);if(v!==n.nodeValue)n.nodeValue=v;return}
  if(n.nodeType!==1||n.matches("script,style"))return;
  for(const a of ["placeholder","aria-label","title"]){const v=n.getAttribute(a);if(v){const w=trStr(v);if(w!==v)n.setAttribute(a,w)}}
  if(n.closest(NOTR)&&!n.matches("input,select,textarea"))return;
  const w=document.createTreeWalker(n,NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT);let x;
  while((x=w.nextNode()))if(x.nodeType===3)trNode(x);else for(const a of ["placeholder","aria-label","title"]){const v=x.getAttribute(a);if(v){const u=trStr(v);if(u!==v)x.setAttribute(a,u)}}
}
function startTranslate(){
  document.documentElement.lang=LANG;document.title="Sid'compagnon";
  if(LANG==="nl"){
    MO.splice(0,12,"jan.","feb.","mrt.","apr.","mei","jun.","jul.","aug.","sep.","okt.","nov.","dec.");
    MOL.splice(0,12,"Januari","Februari","Maart","April","Mei","Juni","Juli","Augustus","September","Oktober","November","December");
    DOW.splice(0,7,"zondag","maandag","dinsdag","woensdag","donderdag","vrijdag","zaterdag");
    DOWL.splice(0,7,"zondag","maandag","dinsdag","woensdag","donderdag","vrijdag","zaterdag");
    const dw=document.querySelector(".cal-dow");if(dw)dw.innerHTML="<span>M</span><span>D</span><span>W</span><span>D</span><span>V</span><span>Z</span><span>Z</span>";
  }else{
  MO.splice(0,12,"Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec");
  MOL.splice(0,12,"January","February","March","April","May","June","July","August","September","October","November","December");
  DOW.splice(0,7,"Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday");
  DOWL.splice(0,7,"Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday");
  const dw=document.querySelector(".cal-dow");if(dw)dw.innerHTML="<span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>";
  }
  trNode(document.body);
  new MutationObserver(ms=>{for(const m of ms){
    if(m.type==="characterData")trNode(m.target);
    else if(m.type==="attributes")trNode(m.target);
    else m.addedNodes.forEach(trNode)}}).observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:["placeholder","aria-label","title"]});
}
// v31 : choix de la langue sur l'écran de connexion (français, anglais, néerlandais)
{const LN={fr:"Français",en:"English",nl:"Nederlands"},el=$("authLang");el.outerHTML=`<span class="auth-langs">${Object.entries(LN).map(([k,v])=>`<button type="button" class="linkbtn" data-alang="${k}" aria-pressed="${k===(LANG||"fr")}">${v}</button>`).join("")}</span>`;
  document.addEventListener("click",e=>{const b=e.target.closest("[data-alang]");if(b&&b.dataset.alang!==LANG)setLang(b.dataset.alang)})}
$("langSel").value=LANG;
$("langSel").addEventListener("change",e=>setLang(e.target.value));
// page d'accueil
function renderHomeSel(){
  const cur=(data.prefs&&data.prefs.home)||"home";
  $("homeSel").innerHTML=`<option value="home">${L("Aujourd'hui")}</option><option value="last">${L("Dernière page ouverte")}</option>`+
    [...TABS.filter(([k])=>tabAllowed(k)&&data.prefs.tabs[k]!==false),["more","Réglages"]].map(([k,l])=>`<option value="${k}">${L(l)}</option>`).join("");
  $("homeSel").value=[...$("homeSel").options].some(o=>o.value===cur)?cur:"home";
}
$("homeSel").addEventListener("change",e=>{data.prefs.home=e.target.value;data.prefs.homeV=1;save();toast("Page d'accueil enregistrée")});
// présentation au premier lancement
const ONB_DESC={
  lists:"Une liste de courses ou de choses à faire, partagée avec tes proches : chacun la voit et la coche.",
  plan:"Ton calendrier : examens, rendez-vous, événements. Tu peux aussi y relier ton horaire de cours.",
  todo:"Tes tâches, rangées par catégories pour regrouper tout ce qu'il faut faire pour un projet.",
  notes:"Tes notes libres : idées, listes, brouillons, à écrire comme tu veux.",
  pwd:"Tes mots de passe et les sites qui vont avec, protégés par un code à 5 chiffres.",
  pomo:"Travaille concentré : sessions et pauses s'enchaînent toutes seules, avec ta musique.",
  graph:"Tes macros, ton poids et tes calories en graphiques, avec un bilan du jour et de la semaine.",
  nutri:"Tes calories et tes macros du jour, et des menus faits pour toi.",
  muscu:"Tes séances et tes programmes, tes charges et tes répétitions, avec la progression d'une fois à l'autre.",
  docs:"Range tes PDF, scanne des feuilles avec l'appareil photo et retrouve-les en un instant.",
  app:"Les étapes pour installer Sid'compagnon sur ton écran d'accueil."};
let onbSel={};
const ONB_GROUP={orga:["agenda","Organise tes journées","Ton agenda, tes tâches du jour et un minuteur de concentration."],
  sport:["fit","Bouge et mange bien","Ton programme de musculation, ta nutrition et tes progrès en graphiques."],
  perso:["note","Garde tout à l'abri","Tes notes, tes documents et tes mots de passe, protégés par ton code et le mot de passe de ton compte."]};
function openOnb(){
  onbSel={};TABS.forEach(([k])=>{if(!OFF_TABS.includes(k))onbSel[k]=data.prefs.tabs[k]!==false});
  document.querySelectorAll("#onbLang button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.lang===LANG));
  onbRenderGroups();onbAllLbl();onbLook();$("onb").hidden=false;document.body.style.overflow="hidden";onbGoTo(0);
}
// v63 (#3) : diapositives des apps dessinées par React (app/src/Onboarding.tsx) à partir de onbSel ; ancien rendu en secours
const onbIsl=()=>shIsl("onbGroups");
function onbRenderGroups(){
  const sub=g=>g.k==="sport"&&!tabAllowed("nutri")?"Tes séances, ton chrono et ton minuteur.":ONB_GROUP[g.k][2];
  if(onbIsl()){try{window.SCIslands.onbGroups($("onbGroups"),{i18n:agI18n(),groups:GROUPS.filter(g=>ONB_GROUP[g.k]).map(g=>({k:g.k,app:ONB_GROUP[g.k][0],label:g.label,title:ONB_GROUP[g.k][1],sub:sub(g),
    tabs:TABS.filter(([k])=>g.tabs.includes(k)&&tabAllowed(k)).map(([k,l])=>({k,icon:ICON(k)||"",label:l,desc:ONB_DESC[k]||"",on:!!onbSel[k]}))}))});return}
    catch(e){reportErr("island onb: "+(e&&e.message))}}
  const it=([k,l])=>`<label class="onb-it ${onbSel[k]?"":"off"}" data-onb="${k}"><span class="ic">${ICON(k)}</span><span class="grow"><b>${L(l)}</b><span class="small muted">${L(ONB_DESC[k])}</span></span><input type="checkbox" class="switch" data-onbk="${k}" ${onbSel[k]?"checked":""} aria-label="${L("Garder")} ${L(l)}"></label>`;
  $("onbGroups").innerHTML=GROUPS.filter(g=>ONB_GROUP[g.k]).map(g=>{const ts=TABS.filter(([k])=>g.tabs.includes(k)&&tabAllowed(k)),[em,t,sub0]=ONB_GROUP[g.k],sub=g.k==="sport"&&!tabAllowed("nutri")?"Tes séances, ton chrono et ton minuteur.":sub0;
    // v43 : une diapositive par app, dans sa couleur : à gauche l'app (logo, nom, promesse), à droite ses fonctions à garder
    return `<section class="onb-slide onb-app" data-app="${em}"><div class="onb-box onb-split">
      <div class="onb-hero"><div class="onb-logo" data-app="${em}">${LOGO(em)}</div><div class="onb-grp">${esc(g.label)}</div><h1>${L(t)}</h1><p class="sub">${L(sub)}</p>
        <p class="onb-count">${ts.length} ${L(ts.length>1?"fonctions":"fonction")}</p></div>
      <div class="onb-pick"><div class="onb-pick-h"><span class="eyebrow">${L("Ce que tu gardes")}</span>${ts.length>1?`<button type="button" class="linkbtn onb-all" data-onball="${g.k}"></button>`:""}</div>
        <div class="onb-list">${ts.map(it).join("")}</div><p class="small muted onb-hint">${L("Touche une ligne pour la garder ou la masquer. Tout reste modifiable dans Réglages.")}</p></div>
    </div></section>`}).join("");
}
const onbSlides=()=>[...document.querySelectorAll("#onbTrack .onb-slide")];
// v43 : diapositive affichée selon son numéro, jamais selon la position de défilement
let onbI=0;const onbIdx=()=>onbI;
function onbStep(){const sl=onbSlides(),i=Math.min(sl.length-1,onbIdx());sl.forEach((x,j)=>{x.classList.toggle("on",j===i);x.inert=j!==i});const ap=sl[i]&&sl[i].dataset.app;if(ap)$("onb").dataset.app=ap;else delete $("onb").dataset.app;
  if(shIsl("onbDots")){try{window.SCIslands.onbDots($("onbDots"),{n:sl.length,cur:i})}catch(e){$("onbDots").innerHTML=sl.map((_,j)=>`<i class="${j===i?"on":""}"></i>`).join("")}}
  else $("onbDots").innerHTML=sl.map((_,j)=>`<i class="${j===i?"on":""}"></i>`).join("");$("onbPrev").style.visibility=i?"visible":"hidden";$("onbNext").hidden=i===sl.length-1}
function onbGoTo(i){const sl=onbSlides();onbI=Math.max(0,Math.min(sl.length-1,i));const t=$("onbTrack");t.scrollLeft=0;t.style.setProperty("--i",onbI);onbStep();const s=sl[onbI];if(s)s.scrollTop=0}
$("onbTrack").addEventListener("scroll",()=>{if($("onbTrack").scrollLeft)$("onbTrack").scrollLeft=0});
$("onbNext").addEventListener("click",()=>onbGoTo(onbIdx()+1));$("onbPrev").addEventListener("click",()=>onbGoTo(onbIdx()-1));
// thème appliqué tout de suite
function onbLook(){const th=data.prefs.theme||"dark";document.querySelectorAll("#onbTheme button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.otheme===th));
  // v36 : les couleurs (ambiances) se choisissent aussi ici
  const pal=data.prefs.palette||"or",dark=document.documentElement.dataset.theme==="dark"||(!document.documentElement.dataset.theme&&matchMedia("(prefers-color-scheme: dark)").matches);
  if(shIsl("onbPal")){try{window.SCIslands.onbPal($("onbPal"),{check:CHECK,i18n:agI18n(),pals:Object.entries(PALETTES).map(([k,a])=>({k,name:a[0],a:dark?a[3]:a[1],b:dark?a[4]:a[2],on:k===pal}))});return}catch(e){reportErr("island onbPal: "+(e&&e.message))}}
  $("onbPal").innerHTML=Object.entries(PALETTES).map(([k,a])=>`<button type="button" class="pal" data-opal="${k}" aria-pressed="${k===pal}"><span class="pal-dot" style="--pa:${dark?a[3]:a[1]};--pb:${dark?a[4]:a[2]}">${k===pal?CHECK:""}</span><span class="pal-n">${L(a[0])}</span></button>`).join("")}
$("onbPal").addEventListener("click",e=>{const b=e.target.closest("[data-opal]");if(!b)return;data.prefs.palette=b.dataset.opal;applyLook();onbLook()});
$("onbTheme").addEventListener("click",e=>{const b=e.target.closest("[data-otheme]");if(!b)return;data.prefs.theme=b.dataset.otheme;applyLook();onbLook()});
$("onbGroups").addEventListener("change",e=>{const c=e.target.closest("[data-onbk]");if(!c)return;onbSel[c.dataset.onbk]=c.checked;
  if(onbIsl()&&Object.keys($("onbGroups")).some(x=>x.startsWith("__reactContainer"))){onbRenderGroups();onbStep()} // React redessine (classe « off », « Tout cocher »), puis la diapositive affichée est remise
  const card=c.closest(".onb-it");card.classList.toggle("off",!c.checked);card.classList.remove("bump");void card.offsetWidth;card.classList.add("bump");if(navigator.vibrate)navigator.vibrate(8)});
// v36 : « Tout décocher » / « Tout cocher » sur chaque diapositive de modules
function onbAllLbl(){if(onbIsl())return;document.querySelectorAll("#onbGroups [data-onball]").forEach(b=>{const ks=[...b.closest(".onb-slide").querySelectorAll("[data-onbk]")];
  b.textContent=L(ks.some(c=>c.checked)?"Tout décocher":"Tout cocher")})}
$("onbGroups").addEventListener("click",e=>{const b=e.target.closest("[data-onball]");if(!b)return;const ks=[...b.closest(".onb-slide").querySelectorAll("[data-onbk]")],on=!ks.some(c=>c.checked);
  ks.forEach(c=>{c.checked=on;onbSel[c.dataset.onbk]=on;c.closest(".onb-it").classList.toggle("off",!on)});onbAllLbl();if(onbIsl()){onbRenderGroups();onbStep()}});
$("onbGroups").addEventListener("change",()=>setTimeout(onbAllLbl));
$("onbLang").addEventListener("click",e=>{const b=e.target.closest("[data-lang]");if(!b||b.dataset.lang===LANG)return;data.prefs.onbPending=true;setLang(b.dataset.lang)});
function onbFinish(){
  if(!Object.values(onbSel).some(Boolean)){toast("Garde au moins un onglet");return}
  Object.assign(data.prefs.tabs,onbSel);data.prefs.onboarded=true;delete data.prefs.onbPending;save();
  $("onb").hidden=true;document.body.style.overflow="";applyTabs();renderHomeSel();
  show("home");toast("Bienvenue sur Sid'compagnon");
}
$("onbGo").addEventListener("click",onbFinish);$("onbSkip").addEventListener("click",onbFinish);
$("replayOnb").addEventListener("click",openOnb);
