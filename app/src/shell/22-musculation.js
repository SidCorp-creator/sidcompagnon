/* ---------- musculation ---------- */
// v44 : un seul format pour les séances libres, les programmes de Sid'compagnon, ceux de Claude et ceux importés.
// data.muscu.sessions = [{id, name, upd, grp?:{id, name, src:"app"|"claude"|"import"}, ord?, exercises:[{id, name, sets:[{kg, reps}], reps?, rest?, rir?, note?, pat?}]}]
//   une séance sans grp est une séance libre ; un programme = les séances d'un même grp (ordre : ord).
// data.muscu.plan = {id, v:2, profile, at, upd, src, aiWait?} : le programme suivi (ses séances ont grp.id === plan.id) ; supprimé = {deleted, upd}.
// data.muscu.log = séances faites (day = id de la séance) : sert à la progression, quel que soit le type de séance.
data.muscu=data.muscu||{sessions:[]};
// v44 : chrono et minuteur retirés : leurs réglages enregistrés sur l'appareil aussi
if(data.ui&&["tmCfg","tmDur","restSlide"].some(k=>k in data.ui)){["tmCfg","tmDur","restSlide"].forEach(k=>delete data.ui[k]);saveUI()}
let msOpenId=null,msTimer=null;
const M=()=>data.muscu||(data.muscu={sessions:[]});
const msFind=id=>M().sessions.find(x=>x.id===id);
const newSet=()=>({reps:"",kg:""});
const newEx=(name="",n=3)=>({id:uid(),name,ps:1,sets:Array.from({length:n},newSet)});
const seTouch=se=>{se.upd=Date.now();M().upd=Date.now()};
const GSRC={app:"Créé par Sid'compagnon",claude:"Créé par Claude",import:"Importé"};
// ancien programme (avant la v44 : plan.days, exercices avec un nombre de séries) → séances au format commun, sans rien perdre
function muMigrate(){const m=M(),p=m.plan;if(!Array.isArray(m.sessions))m.sessions=[];let ch=false;
  if(p&&!p.deleted&&Array.isArray(p.days)){const grp={id:p.id,name:L("Mon programme"),src:p.src==="ia"?"claude":"app"};
    p.days.forEach((d,i)=>{if(m.sessions.some(s=>s.id===d.id)||(data.del&&data.del[d.id]))return; // v44.6 : jamais une séance supprimée
      m.sessions.push({id:d.id,name:d.name||`${L("Séance")} ${"ABCDEFG"[i]||i+1}`,grp,ord:i,upd:Date.now(),
        exercises:(d.ex||[]).map(e=>({id:uid(),name:e.name||"",pat:e.pat||"",reps:e.reps||"",rest:+e.rest||120,rir:e.rir||"",note:e.note||"",...(e.int?{int:e.int}:{}),...(e.rpe?{rpe:e.rpe}:{}),...(e.tempo?{tempo:e.tempo}:{}),sets:Array.from({length:Math.max(1,Math.min(20,+e.sets||3))},newSet)}))})});
    delete p.days;p.v=2;p.upd=Date.now();ch=true}
  for(const se of m.sessions)if(se&&!Array.isArray(se.exercises)){se.exercises=[];ch=true}
  // v44.7 : retour à une ligne par série (kg puis répétitions). Un poids / un nombre de répétitions communs tapés en 44.6
  // (ex.kg, ex.reps) sont recopiés dans les séries seulement si toutes étaient vides ; la fourchette visée d'un programme (« 8–12 ») n'est jamais recopiée
  for(const se of m.sessions)for(const ex of (se&&se.exercises)||[]){if(!ex||ex.ps)continue;if(!Array.isArray(ex.sets)||!ex.sets.length)ex.sets=[newSet()];
    const kg=String(ex.kg==null?"":ex.kg).trim(),rp=String(ex.reps||"").trim(),empty=k=>ex.sets.every(x=>!x||String(x[k]==null?"":x[k]).trim()==="");
    if(kg&&empty("kg"))ex.sets.forEach(x=>{x.kg=kg});if(/^\d+$/.test(rp)&&empty("reps"))ex.sets.forEach(x=>{x.reps=rp});
    delete ex.kg;ex.ps=1;ch=true}
  if(ch){m.upd=Date.now();save()}}
const PL=()=>{const p=M().plan;return p&&!p.deleted&&(p.v===2||Array.isArray(p.days))?p:null}; // supprimé = {deleted, upd} pour que la suppression gagne à la fusion
const grpSe=id=>M().sessions.filter(s=>s&&s.grp&&s.grp.id===id).sort((a,b)=>(a.ord||0)-(b.ord||0));
const PLD=()=>{const p=PL();return p?grpSe(p.id):[]}; // séances du programme suivi
// texte de partage commun (séance seule, ou programme entier) : c'est aussi le format d'import (et celui que Claude peut donner)
const exLine=(e,i)=>`${i+1}. ${e.name||L("Exercice")} : ${e.sets.length} ${e.sets.length>1?"séries":"série"}${e.reps?` × ${e.reps}`:""}${e.rest?`, repos ${restLbl(e.rest)}`:""}${e.note?` (${e.note})`:""}`;
const seTxt=se=>`Séance « ${se.name||"Séance"} »\n${se.exercises.map(exLine).join("\n")}`;
const shareTxt=(list,prog)=>prog?`Programme « ${prog} » (Sid'compagnon)\n\n${list.map(seTxt).join("\n\n")}`:`${seTxt(list[0]).replace(/\n/," (Sid'compagnon)\n")}`;
// lecture tolérante : texte de Sid'compagnon (ancien et nouveau), ou programme écrit par Claude (titres « ## Séance … », puces, « 4 × 8–10 »)
function parseShared(txt){
  const lines=String(txt||"").split(/\r?\n/).map(l=>l.replace(/\*\*/g,"").trim()).filter(Boolean);if(!lines.length)return null;
  let prog="",cur=/** @type {any} */(null);const out=/** @type {any[]} */([]);
  // titre « Séance « Push » » (format de Sid'compagnon : le nom est entre guillemets) ou « ## Séance A — Haut du corps » (on garde tout le titre)
  const head=(l,w)=>{const t=l.replace(/^#{1,4}\s*/,"").replace(/\s*\((?:sid'?(?:note|home|compagnon))\)\s*:?\s*$/i,"").replace(/\s*:\s*$/,"");
    if(!new RegExp(`^(?:${w})\\b`,"i").test(t))return null;const q=t.match(/[«"“]\s*(.+?)\s*[»"”]/);return q?q[1]:t};
  for(const l of lines){
    const pg=head(l,"programme|program|schema|schéma");if(pg!==null&&!/^\d/.test(l)){prog=pg||L("Programme importé");continue}
    const sh=head(l,"s[ée]ance|session|workout|training|jour|day|dag");
    if(sh!==null&&!/^(?:\d+\s*[.)-]|[-•*])/.test(l)){cur={id:uid(),name:sh||`${L("Séance")} ${out.length+1}`,exercises:[]};out.push(cur);continue}
    const r=l.match(/^(?:\d+\s*[.)-]|[-•*])\s*(.+?)(?:\s*:\s*|\s+[—–-]\s+)(\d+)\s*(?:s[ée]ries?|sets?|x|×)(.*)$/i);if(!r)continue;
    const rest=r[3]||"",rp=rest.match(/^\s*(?:[x×]|de|of)?\s*(\d+\s*(?:[–-]|à|to)\s*\d+|\d+)/i),rs=rest.match(/repos\s*:?\s*(\d+(?:[.,]\d+)?)\s*(min|s)/i)||rest.match(/rest\s*:?\s*(\d+(?:[.,]\d+)?)\s*(min|s)/i);
    const ex=newEx(r[1].replace(/\s*\(.*\)\s*$/,"").trim(),Math.min(20,Math.max(1,+r[2])));
    if(rp)ex.reps=rp[1].replace(/\s*(?:à|to|-)\s*/,"–").replace(/\s+/g,"");
    if(rs)ex.rest=Math.round(parseFloat(rs[1].replace(",","."))*(/min/i.test(rs[2])?60:1));
    {const kg=rest.match(/(\d+(?:[.,]\d+)?)\s*kg\b/i);if(kg)ex.sets.forEach(x=>{x.kg=kg[1].replace(",",".")})} // poids donné dans le texte (44.6)
    const nt=rest.match(/\(([^)]+)\)\s*$/);if(nt&&!/repos|rest/i.test(nt[1]))ex.note=nt[1].slice(0,160);
    if(!cur){cur={id:uid(),name:L("Séance importée"),exercises:[]};out.push(cur)}cur.exercises.push(ex)}
  const ses=out.filter(s=>s.exercises.length);if(!ses.length)return null;
  return{prog:prog||(ses.length>1?L("Programme importé"):""),ses}}
// une carte par séance, la même pour toutes (libre, programme de Sid'compagnon, de Claude ou importé)
// v44.7 (demande de Sid) : une seule interface, modifiée directement ; pour chaque exercice, une ligne par série :
// « Série 1 : [kg] – [reps] », « + Ajouter une série », × pour retirer une série. Rien n'est pré-rempli.
// v73 : résumé d'une séance (exercices, séries, chrono en cours ou « faite aujourd'hui »)
function seSub(se,nS){const r=msRunGet(se.id);return `${se.exercises.length} ${L(se.exercises.length>1?"exercices":"exercice")} · ${nS} ${L(nS>1?"séries":"série")}`+
  (r?` · ⏱ ${msRunMin(r)} min`:msDoneToday(se)?` · ✓ ${L("faite aujourd'hui")}`:"")}
const exKg=x=>String(x==null?"":x).replace(".",LANG==="en"?".":",");
function seCard(se,letter){const nS=se.exercises.reduce((a,e)=>a+e.sets.length,0),ty=seType(se),T=ty&&SE_T[ty];
  // v47 (#14) : lettre de la séance dans son programme + type (poussée, tirage, jambes…) en couleur ; séance libre en pointillés
  const tag=letter||T?`<span class="se-tag">${letter?`<b>${letter}</b>`:""}${T?`<span>${L(T[0])}</span>`:""}</span>`:`<span class="se-tag se-free">${L("Libre")}</span>`;
  const shown=String(se.name||"").replace(/^(?:Séance|Session|Training)\s+[A-F]\s*·\s*/i,"")||L("Séance");
  return `<details class="ms${letter?"":" ms-free"}" data-ms="${se.id}" ${ty?`data-se="${ty}"`:""} ${se.id===msOpenId?"open":""}>
    <summary><span class="chev">›</span><span class="grow">${tag}<span class="ms-name notr">${esc(shown)}</span><br><span class="small muted">${esc(seSub(se,nS))}</span></span><button type="button" class="x ms-del" data-msdel="1" aria-label="${L("Supprimer la séance")}">${IC("trash")}</button></summary>
    <div class="ms-body">
      <label class="small muted" style="display:grid;gap:4px">${L("Nom de la séance")}<input data-f="msname" value="${esc(se.name)}" autocomplete="off"></label>
      ${se.exercises.map((ex,i)=>`<div class="ex ex3" data-ex="${ex.id}">
        <div class="ex-head"><span class="num">${i+1}</span><input data-f="exname" value="${esc(ex.name)}" placeholder="${L("Nom de l'exercice")}" aria-label="${L("Nom de l'exercice")}" autocomplete="off" list="exList"><button type="button" class="mini ex-help" data-exhelp="1" aria-label="${L("Comment faire cet exercice")}" title="${L("Comment faire cet exercice")}"${exAide(ex.name)?"":" hidden"}>?</button><button type="button" class="x" data-msdelex="${ex.id}" aria-label="${L("Supprimer l'exercice")}">×</button></div>
        ${exAdvHtml(ex)}${exPrmHtml(ex)}${(p=>p?`<div class="ex-pro small">↑ ${esc(p)}</div>`:"")(exProg(ex))}
        <div class="set-rows">${ex.sets.map((st,j)=>`<div class="set-row" data-si="${j}"><span class="set-l">${L("Série")} ${j+1}</span>
          <input class="set-in" data-f="setkg" value="${esc(exKg(st&&st.kg))}" placeholder="kg" aria-label="${L("Série")} ${j+1} : kg" autocomplete="off" inputmode="decimal">
          <span class="set-sep" aria-hidden="true">–</span>
          <input class="set-in" data-f="setreps" value="${esc(String((st&&st.reps)||""))}" placeholder="reps" aria-label="${L("Série")} ${j+1} : ${L("répétitions")}" autocomplete="off" inputmode="numeric">
          <button type="button" class="set-del" data-msdelset="${j}" aria-label="${L("Retirer la série")} ${j+1}" ${ex.sets.length<=1?"disabled":""}>×</button></div>`).join("")}</div>
        <div class="set-acts"><button type="button" class="set-add" data-msaddset="1" ${ex.sets.length>=20?"disabled":""}>+ ${L("Ajouter une série")}</button>${ex.sets.length>1?`<button type="button" class="set-add set-copy" data-mscopy1="1" title="${L("Recopier le poids et les répétitions de la série 1 dans toutes les séries")}">↓ ${L("Série 1 sur toutes")}</button>`:""}</div>
      </div>`).join("")}
      <button type="button" class="qbtn" data-msaddex="1">+ ${L("Ajouter un exercice")}</button>
      <div class="ms-actions">
        <button type="button" class="btn" data-msdone="1">${L(msDoneToday(se)?"Mettre à jour la séance faite":"Séance terminée")}</button>
        <button type="button" class="btn ghost" data-msshare="1">${L("Partager")}</button>
        <button type="button" class="btn stop" data-msdel="1">${L("Supprimer")}</button>
      </div>
    </div></details>`}
function renderMuscu(){muMigrate();try{renderCoach()}catch(e){}
  const S=M().sessions.filter(Boolean),pl=PL();
  const groups=[];const seen=new Set();
  if(pl){groups.push({id:pl.id,name:L("Mon programme"),src:pl.src==="ia"?"claude":(pl.src||"app"),ses:PLD(),plan:true});seen.add(pl.id)}
  for(const s of S)if(s.grp&&!seen.has(s.grp.id)){seen.add(s.grp.id);groups.push({id:s.grp.id,name:s.grp.name||L("Programme"),src:s.grp.src||"import",ses:grpSe(s.grp.id)})}
  const free=S.filter(s=>!s.grp||!seen.has(s.grp.id));
  // v55 (#3) : liste dessinée par React (app/src/Muscu.tsx) à partir de ce modèle ; ancien rendu en secours
  if(window.SCIslands&&window.SCIslands.muList&&!window.__noIslands){try{msIsland(groups,free);renderMuGoal();renderMuStats();const dl=$("exList");if(dl&&!dl.childElementCount)dl.innerHTML=EXDB.map(e=>`<option value="${esc(e.n)}"></option>`).join("");return}
    catch(e){reportErr("island muList: "+(e&&e.message))}}
  const gHtml=g=>`<section class="ms-grp" data-msgrp="${g.id}"><div class="ms-grp-h"><div class="grow"><span class="eyebrow notr">${esc(g.name)}</span><span class="small muted">${L(GSRC[g.src]||"Importé")} · ${g.ses.length} ${L(g.ses.length>1?"séances":"séance")}${g.plan?` · ${L("suivi")}`:""}</span></div><button type="button" class="pen" data-msgact="${g.id}" aria-label="${L("Actions du programme")}">${MORE}</button></div>
    ${g.ses.map((se,i)=>seCard(se,"ABCDEFGHIJ"[i]||"")).join("")||`<div class="small muted">${L("Aucune séance dans ce programme.")}</div>`}</section>`;
  $("msList").innerHTML=groups.map(gHtml).join("")+
    `<section class="ms-grp" data-msgrp=""><div class="ms-grp-h"><div class="grow"><span class="eyebrow">${L("Séances libres")}</span><span class="small muted">${free.length} ${L(free.length>1?"séances":"séance")}</span></div>${free.length?`<button type="button" class="pen" data-msgact="" aria-label="${L("Actions des séances libres")}">${MORE}</button>`:""}</div>
    ${free.map(se=>seCard(se)).join("")||`<div class="small muted">${L("Aucune séance libre. Crée-en une ci-dessous.")}</div>`}</section>`;
  renderMuGoal();renderMuStats();
  const dl=$("exList");if(dl&&!dl.childElementCount)dl.innerHTML=EXDB.map(e=>`<option value="${esc(e.n)}"></option>`).join("")}
// modèle de la liste pour React : mêmes textes et mêmes calculs que seCard / exAdvHtml
let msLast=null;
function msIsland(groups,free){msLast=[groups,free];
  const seVM=(se,letter)=>{const nS=se.exercises.reduce((a,e)=>a+e.sets.length,0),ty=seType(se),T=ty&&SE_T[ty];
    return{id:se.id,name:se.name||"",shown:String(se.name||"").replace(/^(?:Séance|Session|Training)\s+[A-F]\s*·\s*/i,"")||L("Séance"),letter:letter||"",ty:ty||"",tag:T?T[0]:"",open:se.id===msOpenId,
      sub:seSub(se,nS),done:msDoneToday(se),
      ex:se.exercises.map(ex=>{const a=exAdv(ex.name);return{id:ex.id,name:ex.name||"",help:!!exAide(ex.name),
        adv:a?{txt:`${L("Conseillé")} (${L(MU_GOALS[muGoal()])}) : `,val:exAdvVal(a),same:exAdvSame(ex,a)}:null,
        prm:{reps:ex.reps||"",rest:+ex.rest?String(+ex.rest):"",int:ex.int||"",rpe:ex.rpe||"",tempo:ex.tempo||"",sum:exPrmSum(ex),open:msPrmOpen.has(ex.id)},pro:exProg(ex),
        sets:ex.sets.map(st=>({kg:exKg(st&&st.kg),reps:String((st&&st.reps)||"")}))}})}};
  const G=groups.map(g=>({id:g.id,name:g.name,free:false,more:true,sub:`${L(GSRC[g.src]||"Importé")} · ${g.ses.length} ${L(g.ses.length>1?"séances":"séance")}${g.plan?` · ${L("suivi")}`:""}`,
    empty:"Aucune séance dans ce programme.",ses:g.ses.map((se,i)=>seVM(se,"ABCDEFGHIJ"[i]||""))}));
  G.push({id:"",name:"Séances libres",free:true,more:!!free.length,sub:`${free.length} ${L(free.length>1?"séances":"séance")}`,empty:"Aucune séance libre. Crée-en une ci-dessous.",ses:free.map(se=>seVM(se))});
  window.SCIslands.muList($("msList"),{groups:G,trash:IC("trash"),i18n:agI18n()});
  // un champ déjà touché garde son texte chez React : on remet la valeur enregistrée partout sauf dans le champ en cours de saisie (comme l'ancien rendu)
  $("msList").querySelectorAll("input[data-f]").forEach(i=>{if(i!==document.activeElement&&i.value!==i.defaultValue)i.value=i.defaultValue})}
// pendant la saisie : React redessine la liste sans recréer les champs (le clavier reste ouvert)
const msRedraw=()=>{if(msLast&&window.SCIslands&&window.SCIslands.muList&&!window.__noIslands){try{msIsland(...msLast);return true}catch(e){reportErr("island muList: "+(e&&e.message))}}return false};
function msSaveSoon(se){if(se)seTouch(se);clearTimeout(msTimer);msTimer=setTimeout(save,500)}
$("msForm").addEventListener("submit",e=>{e.preventDefault();const n=$("msName").value.trim();if(!n)return;
  const se={id:uid(),name:n,exercises:[newEx()],upd:Date.now()};M().sessions.push(se);msOpenId=se.id;save();renderMuscu();$("msName").value="";toast("Séance créée")});
$("msList").addEventListener("toggle",e=>{const t=e.target;if(t.matches&&t.matches("[data-prm]")){if(t.open)msPrmOpen.add(t.dataset.prm);else msPrmOpen.delete(t.dataset.prm);return}
  const d=t.closest("[data-ms]");if(d&&d.open)msOpenId=d.dataset.ms},true);
$("msList").addEventListener("input",e=>{
  const inp=e.target,f=inp.dataset.f;if(!f)return;
  const se=msFind(inp.closest("[data-ms]").dataset.ms);if(!se)return;
  if(f==="msname"){se.name=inp.value;if(!msRedraw()){const n=inp.closest("[data-ms]").querySelector(".ms-name");if(n)n.textContent=inp.value||L("Séance")}}
  else{const ex=se.exercises.find(x=>x.id===inp.closest("[data-ex]").dataset.ex);if(!ex)return;
    if(f==="exname"){ex.name=inp.value;if(msRedraw()){msSaveSoon(se);return}const h=inp.parentElement.querySelector("[data-exhelp]");if(h)h.hidden=!exAide(ex.name);
      const av=inp.closest("[data-ex]").querySelector(".ex-adv");if(av)av.outerHTML=exAdvHtml(ex)}
    else if(/^x(reps|rest|int|rpe|tempo)$/.test(f)){const k=f.slice(1); // v73 : réglages propres à l'exercice
      if(k==="rest"){const v=parseInt(inp.value.replace(/[^0-9]/g,""));if(v)ex.rest=Math.min(900,v);else delete ex.rest}else{const v=inp.value.slice(0,16).trim();if(v)ex[k]=v;else delete ex[k]}
      if(!msRedraw()){const d=inp.closest("[data-prm]");if(d)d.querySelector("summary").textContent=exPrmSum(ex);const av=inp.closest("[data-ex]").querySelector(".ex-adv");if(av)av.outerHTML=exAdvHtml(ex)}}
    else if(f==="setkg"||f==="setreps"){const j=+inp.closest("[data-si]").dataset.si,st=ex.sets[j];if(!st)return;
      if(f==="setkg")st.kg=inp.value.replace(",",".").replace(/[^0-9.]/g,"").slice(0,7);else st.reps=inp.value.replace(/[^0-9]/g,"").slice(0,4);
      const was=msRunGet(se.id);if(String(st.kg||"").trim()||String(st.reps||"").trim()){msRunTouch(se,ex,j,!!String(st.reps||"").trim());if(!was)msRedraw()}}}
  msSaveSoon(se)});
// v44.7 : fiche « comment faire » de chaque exercice proposé (site/exercices-aide.js), dans la langue de l'app
function exAide(name){const A=window.SIDFIT_AIDE||{},k=fold(String(name||"").trim());if(!k)return null;
  const key=Object.keys(A).find(x=>fold(x)===k);return key?{name:key,f:A[key][LANG]||A[key].fr}:null}
function exHelpOpen(name){const a=exAide(name);if(!a)return;const[mus,steps,err]=a.f;
  $("exHelpTitle").textContent=name.trim();
  const im=(window.SIDFIT_IMG||{})[a.name];
  if(shIsl("exHelp")){try{window.SCIslands.exHelp($("exHelpBody"),{i18n:agI18n(),h:{name:name.trim(),img:im||null,mus,steps,err}});$("exHelpSheet").hidden=false;return}catch(e){reportErr("island exHelp: "+(e&&e.message))}}
  $("exHelpBody").innerHTML=(im?`<div class="exh-pics">${[0,1].map(i=>`<figure><img src="exercices/${encodeURIComponent(im)}-${i}.jpg" alt="${esc(name.trim())} : ${L(i?"arrivée":"départ")}" loading="lazy" decoding="async" width="480" height="320"><figcaption>${L(i?"Arrivée":"Départ")}</figcaption></figure>`).join("")}</div>`:"")+`<p class="exh-lbl">${L("Muscles travaillés")}</p><p class="notr">${esc(mus)}</p>
    <p class="exh-lbl">${L("Comment faire")}</p><ol class="exh-steps notr">${steps.map(x=>`<li>${esc(x)}</li>`).join("")}</ol>
    <p class="exh-lbl">${L("À éviter")}</p><p class="exh-err notr">${esc(err)}</p>${im?`<p class="small muted exh-src">${L("Photos : Free Exercise DB (domaine public)")}</p>`:""}`;
  $("exHelpSheet").hidden=false}
$("exHelpClose").addEventListener("click",()=>$("exHelpSheet").hidden=true);
$("exHelpSheet").addEventListener("click",e=>{if(e.target.id==="exHelpSheet")$("exHelpSheet").hidden=true});
async function copyText(txt,what){
  const ok=what==="prog"?"Programme copié : colle-le dans un message":"Séance copiée : colle-la dans un message";
  try{await navigator.clipboard.writeText(txt);toast(ok);return}catch(e){}
  try{if(navigator.share){await navigator.share({text:txt});return}}catch(e){if(e.name==="AbortError")return}
  const t=document.createElement("textarea");t.value=txt;document.body.appendChild(t);t.select();
  try{document.execCommand("copy");toast(ok)}catch(e){toast("Copie impossible")}t.remove()}
$("msList").addEventListener("click",e=>{
  const ga=e.target.closest("[data-msgact]");if(ga){grpActions(ga.dataset.msgact);return}
  const b=e.target.closest("button");if(!b)return;if(b.closest("summary"))e.preventDefault(); // bouton dans l'en-tête : n'ouvre/ferme pas la séance
  const box=b.closest("[data-ms]");if(!box)return;const se=msFind(box.dataset.ms);if(!se)return;if(!b.closest("summary"))msOpenId=se.id;
  const exOf=()=>se.exercises.find(x=>x.id===b.closest("[data-ex]").dataset.ex);
  if(b.dataset.msaddex){se.exercises.push(newEx());seTouch(se);save();renderMuscu();const ins=$("msList").querySelectorAll(`[data-ms="${se.id}"] [data-f=exname]`);ins[ins.length-1]?.focus()}
  else if(b.dataset.msdelex){armDelete(b,()=>{se.exercises=se.exercises.filter(x=>x.id!==b.dataset.msdelex);seTouch(se);save();renderMuscu()})}
  else if(b.dataset.exhelp){const ex=exOf();if(ex)exHelpOpen(ex.name)}
  else if(b.dataset.msadv){const ex=exOf();if(ex)exAdvApply(se,ex)}
  else if(b.dataset.mscopy1){const ex=exOf();if(!ex||ex.sets.length<2)return;const f=ex.sets[0]||{};
    // v45 : la série 1 (poids et répétitions) est recopiée dans toutes les autres séries de l'exercice
    if(!String(f.kg||"").trim()&&!String(f.reps||"").trim()){toast("Remplis d'abord la série 1");return}
    const before=ex.sets.map(x=>({...x}));ex.sets.forEach((x,j)=>{if(j)ex.sets[j]={...x,kg:f.kg||"",reps:f.reps||""}});seTouch(se);save();renderMuscu();
    toastAct("Série 1 recopiée sur toutes les séries","Annuler",()=>{ex.sets=before;seTouch(se);save();renderMuscu()})}
  else if(b.dataset.msaddset){const ex=exOf();if(!ex||ex.sets.length>=20)return;ex.sets.push(newSet());seTouch(se);save();renderMuscu();
    const ins=document.querySelectorAll(`#msList [data-ex="${ex.id}"] [data-f="setkg"]`);ins[ins.length-1]?.focus()}
  else if(b.dataset.msdelset!==undefined){const ex=exOf();if(!ex||ex.sets.length<=1)return;ex.sets.splice(+b.dataset.msdelset,1);seTouch(se);save();renderMuscu()}
  else if(b.dataset.msshare)copyText(shareTxt([se]),"se");
  else if(b.dataset.msdone)msDone(se);
  // v44.4 : aussi depuis l'en-tête de la séance (poubelle, 2 appuis)
  else if(b.dataset.msdel&&c2ok(b))undoable("Séance supprimée",[se.id],()=>{tomb(se.id);M().sessions=M().sessions.filter(x=>x!==se)},{after:renderMuscu});
});
// actions d'un programme (ou des séances libres) : partager, suivre, renommer, supprimer
function grpActions(id){
  if(!id){const free=M().sessions.filter(s=>s&&!s.grp);
    openActions(L("Séances libres"),[{l:"Partager toutes les séances libres",fn:()=>copyText(shareTxt(free,L("Séances libres")),"prog")}]);return}
  const ses=grpSe(id),pl=PL(),isPlan=pl&&pl.id===id,name=(ses[0]&&ses[0].grp&&ses[0].grp.name)||L("Mon programme");
  const it=/** @type {any[]} */([{l:"Partager le programme",fn:()=>copyText(shareTxt(ses,isPlan?L("Mon programme"):name),"prog")}]);
  if(!isPlan&&ses.length)it.push({l:"Suivre ce programme",fn:()=>{const old=M().plan;M().plan={id,v:2,profile:(old&&!old.deleted&&old.profile)||{},at:new Date().toISOString(),upd:Date.now(),src:ses[0].grp.src==="claude"?"ia":ses[0].grp.src||"import"};M().upd=Date.now();save();renderMuscu();toast("Programme suivi : la prochaine séance est proposée en haut")}});
  if(!isPlan)it.push({l:"Renommer",fn:()=>{const n=prompt(L("Nom du programme"),name);if(!n||!n.trim())return;ses.forEach(s=>{s.grp={...s.grp,name:n.trim().slice(0,80)};seTouch(s)});save();renderMuscu()}});
  it.push({l:"Supprimer le programme",danger:true,fn:()=>{const ids=ses.map(s=>s.id),oldPlan=M().plan;
    undoable("Programme supprimé",ids,()=>{ids.forEach(tomb);M().sessions=M().sessions.filter(s=>!ids.includes(s.id));if(isPlan)M().plan={deleted:true,upd:Date.now()}},
      {after:renderMuscu,revert:isPlan?()=>{M().plan={...oldPlan,upd:Date.now()}}:undefined})}});
  openActions(isPlan?L("Mon programme"):name,it)}
// importer une séance ou un programme (texte partagé depuis Sid'compagnon, ou programme écrit par Claude) : même chemin pour tout
function importShared(txt){const r=parseShared(txt);if(!r)return null;
  const grp=r.prog?{id:uid(),name:r.prog.slice(0,80),src:"import"}:null;
  r.ses.forEach((s,i)=>{s.upd=Date.now();if(grp){s.grp=grp;s.ord=i}M().sessions.push(s)});M().upd=Date.now();return r}
$("msImportOpen").addEventListener("click",()=>{$("msImport").hidden=false;$("msImportOpen").hidden=true;$("msPaste").focus()});
$("msImportCancel").addEventListener("click",()=>{$("msImport").hidden=true;$("msImportOpen").hidden=false});
$("msImportBtn").addEventListener("click",()=>{
  const r=importShared($("msPaste").value);
  if(!r){toast("Texte non reconnu. Colle une séance ou un programme partagé depuis Sid'compagnon.");return}
  msOpenId=r.ses[0].id;save();$("msPaste").value="";$("msImport").hidden=true;$("msImportOpen").hidden=false;renderMuscu();
  toast(r.prog?`${L("Programme importé")} : ${r.ses.length} ${L(r.ses.length>1?"séances":"séance")}`:`${L("Séance importée")} : ${r.ses[0].name}`)});
