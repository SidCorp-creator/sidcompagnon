/* ---------- v77 : « Créer mon programme » — parcours de questions, récapitulatif, aperçu, activation (lot M3, Claude Code) ---------- */
// Le moteur (muBuild, muAlternatives) est dans 23b (lot M1, Codex) ; la génération par Sid'Bot passe par la fonction « sidbot » (task "programme", lot M2).
// Réponses par compte : data.prefs.muDraft = {v:1, answers, step, at} (synchronisé avec le compte, donc séparé entre personnes).
// Rien n'est activé sans aperçu ni confirmation ; l'ancien programme est archivé (ses séances et leur historique restent dans « Mes séances »).
const MUQ_GOALS=[["muscle","Prendre du muscle"],["force","Gagner en force"],["gras","Perdre du gras"],["forme","Être en forme"],["endu","Gagner en endurance"]];
const MUQ_LEVELS=[["deb","Débutant","moins de 6 mois de pratique"],["inter","Intermédiaire","6 mois à 2 ans"],["conf","Confirmé","plus de 2 ans, technique sûre"]];
const MUQ_PLACES=[["home","À la maison"],["gym","En salle"],["outdoor","Dehors"]];
const MUQ_EQUIP=[["none","Rien (poids du corps)"],["bands","Élastiques"],["dumbbells","Haltères"],["kettlebell","Kettlebell"],["bench","Banc"],["pullup","Barre de traction"],["barbell","Barre et disques"],["machines","Machines guidées"],["cables","Poulies"]];
const MUQ_GYM=["dumbbells","kettlebell","bench","pullup","barbell","machines","cables","bands"];
const MUQ_ZONES=[["shoulder","Épaules"],["back","Bas du dos"],["knee","Genoux"],["wrist","Poignets"],["hip","Hanches"]];
const MUQ_PAIN=[["none","Non"],["some","Une gêne légère"],["yes","Oui, une douleur"]];
const MUQ_OTHER=[["run","Course à pied"],["bike","Vélo"],["swim","Natation"],["team","Sport collectif"],["combat","Sport de combat"],["walk","Beaucoup de marche"]];
const MUQ_DUR=[20,30,45,60,75,90];
const muqLbl=(list,v)=>{const x=list.find(a=>a[0]===v);return x?L(x[1]):""};
// étapes : id, titre, utilité (une phrase), requise ?, condition d'affichage
const MUQ_STEPS=[
  {id:"goal",t:"Quel est ton objectif principal ?",why:"Il règle les répétitions, les repos et la progression.",req:a=>!!a.goal},
  {id:"level",t:"Quelle est ton expérience en musculation ?",why:"Elle décide du nombre d'exercices et de la difficulté des mouvements.",req:a=>!!a.level},
  {id:"freq",t:"Combien de séances par semaine, et combien de temps ?",why:"Le programme tient dans ce temps-là, échauffement compris.",req:a=>!!a.days&&!!a.dur},
  {id:"place",t:"Où vas-tu t'entraîner ?",why:"On ne te propose que des exercices faisables là où tu es.",req:a=>!!a.place},
  {id:"equip",t:"Quel matériel as-tu ?",why:"Coche tout ce qui est disponible ; sans rien, le programme se fait au poids du corps.",req:a=>(a.equip||[]).length>0},
  {id:"prefs",t:"Des exercices à privilégier ou à éviter ?",why:"Facultatif : tes exclusions sont toujours respectées.",opt:true},
  {id:"body",t:"Des zones à ménager ?",why:"Facultatif. Sert seulement à éviter certains mouvements ; ce n'est pas un avis médical.",opt:true},
  {id:"other",t:"Pratiques-tu d'autres sports ?",why:"Facultatif. Avec beaucoup d'autres activités, le volume de musculation reste modéré pour laisser récupérer.",opt:true,req:a=>(a.other||[]).every(o=>Number.isInteger(o.perWeek)&&o.perWeek>=1&&o.perWeek<=14)},
  {id:"notes",t:"Une précision ?",why:"Facultatif. Utilisée seulement par Sid'Bot quand tu crées avec lui.",opt:true},
  {id:"recap",t:"Récapitulatif",why:"Vérifie, corrige une réponse si besoin, puis crée ton programme."}];
const muqSteps=a=>MUQ_STEPS.filter(s=>!s.show||s.show(a));
// réponses de départ : brouillon en cours, sinon profil du programme actuel (ancien format compris), sinon valeurs courantes
function muqFromProfile(p){p=p||{};const eq=p.equip;
  return {v:1,goal:p.goal||data.prefs.muGoal||"",level:p.level||"",days:+p.days||0,dur:+p.dur||0,
    place:p.place||(eq==="gym"?"gym":eq==="db"||eq==="bw"?"home":""),
    equip:Array.isArray(p.equip)?p.equip.slice():eq==="db"?["dumbbells"]:eq==="bw"?["none"]:[],
    prefer:(p.prefer||p.must||[]).slice(0,12),avoidEx:(p.avoidEx||p.never||[]).slice(0,20),avoidZones:(p.avoidZones||p.avoid||[]).slice(0,8),
    pain:p.pain||"",other:(p.other||[]).slice(0,6).map(o=>typeof o==="string"?{sport:o}:o),notes:typeof p.notes==="string"?p.notes.slice(0,600):""}}
let muq=null; // {answers, step, back:"recap"|null, preview:{plan,why,warnings,est,src}, busy, req}
function muqSave(){data.prefs.muDraft={v:1,answers:muq.answers,step:muq.step,at:new Date().toISOString()};save()}
function muqOpen(opt){opt=opt||{};const d=data.prefs.muDraft;
  const a=opt.fresh||!d||!d.answers?muqFromProfile(PL()&&PL().profile):d.answers;
  muq={uid:sbUid(),answers:JSON.parse(JSON.stringify(a)),step:opt.step||(!opt.fresh&&d&&d.step)||"goal",back:null,preview:null,busy:false,req:null,q:""};
  if(opt.step==="recap")muq.step="recap";
  $("coachSheet").hidden=false;muqRender()}
function muqClose(){if(muq&&!muq.preview)muqSave();$("coachSheet").hidden=true}
function muqGo(id){muq.step=id;muqSave();muqRender();const f=$("muqBody");if(f)f.scrollTop=0;setTimeout(()=>{const h=$("muqTitle");if(h)h.focus({preventScroll:true})},30)}
function muqNext(){const st=muqSteps(muq.answers),i=st.findIndex(s=>s.id===muq.step);if(muq.back==="recap"){muq.back=null;muqGo("recap");return}muqGo(st[Math.min(st.length-1,i+1)].id)}
function muqPrev(){const st=muqSteps(muq.answers),i=st.findIndex(s=>s.id===muq.step);if(i>0)muqGo(st[i-1].id)}
// ---- rendu ----
const muqChoice=(k,list,v,cols)=>`<div class="seg muq-seg" role="group" style="grid-template-columns:repeat(${cols||2},minmax(0,1fr))">${list.map(([id,lbl,sub])=>`<button type="button" data-muq="${k}" data-v="${id}" aria-pressed="${String(v)===String(id)}">${esc(L(lbl))}${sub?`<small>${esc(L(sub))}</small>`:""}</button>`).join("")}</div>`;
const muqMulti=(k,list,vals)=>`<div class="chips muq-chips">${list.map(([id,lbl])=>`<button type="button" class="pill" data-muqm="${k}" data-v="${id}" aria-pressed="${(vals||[]).includes(id)}">${esc(L(lbl))}</button>`).join("")}</div>`;
function muqExNames(){return ((window.SIDFIT_EXERCICES&&window.SIDFIT_EXERCICES.groupes)||[]).flatMap(g=>g.exercices.map(x=>x.nom))}
function muqPicker(k,label){const sel=muq.answers[k]||[],q=muq.q&&muq.qk===k?muq.q:"",n=norm(q);
  const hits=n?muqExNames().filter(x=>norm(x).includes(n)&&!sel.includes(x)).slice(0,8):[];
  return `<div class="muq-pick"><label class="eyebrow" for="muqQ-${k}">${L(label)}</label><input type="search" id="muqQ-${k}" class="search" data-muqq="${k}" value="${esc(q)}" placeholder="${L("Rechercher un exercice")}" autocomplete="off" enterkeyhint="search">
    ${hits.length?`<div class="muq-hits">${hits.map(h=>`<button type="button" class="muq-hit" data-muqadd="${k}" data-v="${esc(h)}">${esc(L(h))}</button>`).join("")}</div>`:n?`<div class="small muted">${L("Aucun exercice trouvé")}</div>`:""}
    <div class="chips">${sel.map(x=>`<span class="pill on"><span>${esc(L(x))}</span><button type="button" class="x" data-muqrm="${k}" data-v="${esc(x)}" aria-label="${L("Retirer")} ${esc(L(x))}"><span class="gi gi-close" aria-hidden="true"></span></button></span>`).join("")}</div></div>`}
function muqStepBody(id,a){
  if(id==="goal")return muqChoice("goal",MUQ_GOALS,a.goal,2);
  if(id==="level")return muqChoice("level",MUQ_LEVELS,a.level,1);
  if(id==="freq")return `<span class="eyebrow">${L("Séances par semaine")}</span>${muqChoice("days",[1,2,3,4,5,6].map(n=>[String(n),String(n)]),a.days,6)}
    <span class="eyebrow">${L("Durée d'une séance")}</span>${muqChoice("dur",MUQ_DUR.map(n=>[String(n),n+" min"]),a.dur,3)}`;
  if(id==="place")return muqChoice("place",MUQ_PLACES,a.place,3);
  if(id==="equip")return muqMulti("equip",MUQ_EQUIP,a.equip);
  if(id==="prefs")return muqPicker("prefer","À privilégier")+muqPicker("avoidEx","À éviter");
  if(id==="body")return `${muqMulti("avoidZones",MUQ_ZONES,a.avoidZones)}<span class="eyebrow">${L("As-tu une douleur en ce moment ?")}</span>${muqChoice("pain",MUQ_PAIN,a.pain,3)}
    ${a.pain==="yes"?`<p class="muq-warn" role="note">${IC("alert")||""}<span>${L("En cas de douleur, demande d'abord l'avis d'un médecin ou d'un kinésithérapeute. Le programme évitera les zones cochées, sans adaptation médicale.")}</span></p>`:""}`;
  if(id==="other")return muqMulti("other",MUQ_OTHER,(a.other||[]).map(o=>o.sport||o))+(a.other||[]).map(o=>`<div class="muq-freq"><span class="eyebrow">${esc(muqLbl(MUQ_OTHER,o.sport))} : ${L("combien de fois par semaine ?")}</span>${muqChoice("perWeek:"+o.sport,[1,2,3,4,5,6,7].map(n=>[String(n),String(n)]),o.perWeek,7)}</div>`).join("");
  if(id==="notes")return `<label class="eyebrow" for="muqNotes">${L("Ta précision")}</label><textarea id="muqNotes" rows="4" maxlength="600" placeholder="${L("Ex. je veux des abdos à chaque séance")}">${esc(a.notes||"")}</textarea>`;
  if(id==="recap"){const rows=[["goal","Objectif",muqLbl(MUQ_GOALS,a.goal)],["level","Expérience",muqLbl(MUQ_LEVELS,a.level)],["freq","Rythme",a.days&&a.dur?`${a.days} × ${a.dur} min ${L("par semaine")}`:""],
      ["place","Lieu",muqLbl(MUQ_PLACES,a.place)],["equip","Matériel",(a.equip||[]).map(e=>muqLbl(MUQ_EQUIP,e)).join(", ")],
      ["prefs","Préférences",[...(a.prefer||[]).map(x=>"+ "+x),...(a.avoidEx||[]).map(x=>"− "+x)].join(", ")],["body","Zones à ménager",[...(a.avoidZones||[]).map(z=>muqLbl(MUQ_ZONES,z)),a.pain&&a.pain!=="none"?muqLbl(MUQ_PAIN,a.pain):""].filter(Boolean).join(", ")],
      ["other","Autres sports",(a.other||[]).map(o=>`${muqLbl(MUQ_OTHER,o.sport||o)}${o.perWeek?` (${o.perWeek}×/${L("sem.")})`:""}`).join(", ")],["notes","Précision",a.notes||""]];
    const missing=muqSteps(a).filter(s=>s.req&&!s.req(a));
    return `<dl class="muq-recap">${rows.map(([s,k,v])=>`<div class="muq-rr"><dt>${L(k)}</dt><dd class="notr">${v?esc(v):`<span class="muted">${L("Non renseigné")}</span>`}</dd><button type="button" class="linkbtn" data-muqedit="${s}" aria-label="${L("Modifier")} : ${L(k)}">${L("Modifier")}</button></div>`).join("")}</dl>
      ${missing.length?`<p class="muq-warn" role="alert">${IC("alert")||""}<span>${L("Il manque une réponse")} : ${missing.map(s=>L(s.t)).join(" ; ")}</span></p>`:""}
      <div class="muq-gen">${sbReadyForProgram()?`<button type="button" class="btn" data-muqgen="ia" ${missing.length||muq.busy?"disabled":""}>${L("Créer avec Sid'Bot")}</button>`:""}
        <button type="button" class="btn ${sbReadyForProgram()?"ghost":""}" data-muqgen="app" ${missing.length||muq.busy?"disabled":""}>${L(sbReadyForProgram()?"Créer avec les règles de l'app":"Créer mon programme")}</button></div>
      <p class="small muted">${L("Sid'Bot compose à partir de tes réponses ; les règles de l'app fonctionnent sans connexion. Dans les deux cas, tu vois l'aperçu avant d'activer.")}</p>
      ${PL()?`<button type="button" class="linkbtn" data-muqsaveprefs="1">${L("Enregistrer mes réponses sans changer de programme")}</button>`:""}`}
  return ""}
function muqRender(){const box=$("muqBody");if(!box)return;
  if(muq.preview){muqRenderPreview();return}
  const st=muqSteps(muq.answers),i=Math.max(0,st.findIndex(s=>s.id===muq.step)),s=st[i];
  $("coachTitle").textContent=L("Créer mon programme");
  box.innerHTML=`<div class="muq-prog"><span class="small muted">${s.id==="recap"?L("Dernière étape"):`${L("Étape")} ${i+1} ${L("sur")} ${st.length-1}`}</span><span class="muq-bar" aria-hidden="true"><i style="width:${Math.round((i+1)/st.length*100)}%"></i></span></div>
    <h2 class="muq-t" id="muqTitle" tabindex="-1">${L(s.t)}</h2><p class="small muted muq-why">${L(s.why)}</p>
    <div class="muq-body">${muqStepBody(s.id,muq.answers)}</div>
    ${muq.busy?`<div class="muq-busy" role="status"><span class="spin" aria-hidden="true"></span>${L(muq.busy==="ia"?"Sid'Bot compose ton programme…":"Création du programme…")}</div>`:""}
    ${muq.err?`<p class="muq-warn" role="alert">${IC("alert")||""}<span>${esc(L(muq.err))}</span>${muq.errApp?`<button type="button" class="linkbtn" data-muqgen="app">${L("Créer avec les règles de l'app")}</button>`:""}</p>`:""}
    ${s.id!=="recap"?`<div class="muq-nav"><button type="button" class="btn ghost" data-muqprev="1" ${i?"":"disabled"}>${L("Retour")}</button>
      <button type="button" class="btn" data-muqnext="1" ${s.req&&!s.req(muq.answers)?"disabled":""}>${L(muq.back==="recap"?"Revenir au récapitulatif":s.opt&&!muqHas(s.id)?"Passer":"Suivant")}</button></div>`:`<div class="muq-nav"><button type="button" class="btn ghost" data-muqprev="1">${L("Retour")}</button></div>`}`}
function muqHas(id){const a=muq.answers;return id==="prefs"?(a.prefer||[]).length+(a.avoidEx||[]).length>0:id==="body"?(a.avoidZones||[]).length>0||!!a.pain:id==="other"?(a.other||[]).length>0:id==="notes"?!!String(a.notes||"").trim():true}
// ---- génération ----
const sbReadyForProgram=()=>!!(session&&!isTrial()&&navigator.onLine);
async function muqGenerate(mode){if(muq.busy)return;const a=muq.answers,reqId=uid();muq.req=reqId;muq.err="";muq.errApp=false;muq.busy=mode;muqRender();
  try{let r;
    if(mode==="ia"){if(!(await nuConsent())){muq.busy=false;muqRender();return}r=await muqAskSidbot(a,reqId)}
    else{if(typeof muBuild!=="function")throw Object.assign(new Error("Le créateur de programme n'est pas disponible dans cette version."),{fatal:true});r=muBuild(a,LANG==="en"?"en":"fr");r.src="app"}
    if(muq.req!==reqId)return; // une demande plus récente a pris le relais (double toucher, nouvel essai)
    if(!r||!r.plan||!Array.isArray(r.plan.days)||!r.plan.days.length)throw new Error("Le programme reçu est incomplet.");
    muq.preview={plan:r.plan,why:r.why||[],warnings:r.warnings||[],est:r.est||[],src:r.src||mode};muq.busy=false;muqRender()}
  catch(e){if(!muq||muq.req!==reqId||e&&e.stale)return;muq.busy=false;muq.err=e&&e.message?e.message:"Création impossible pour l'instant.";muq.errApp=mode==="ia"&&typeof muBuild==="function";muqRender()}}
// revue Codex : la réponse n'est appliquée que pour le compte qui a fait la demande (déconnexion ou changement de compte pendant l'appel)
async function muqAskSidbot(a,reqId,change,current){const ctl=new AbortController(),tm=setTimeout(()=>ctl.abort(),60000),uid0=sbUid(),same=()=>sbUid()===uid0;
  try{const jwt=await token();if(!same())throw Object.assign(new Error("Compte changé : demande annulée."),{stale:true});
    const r=await fetch(SUPABASE_URL+"/functions/v1/sidbot",{method:"POST",signal:ctl.signal,headers:{apikey:SUPABASE_KEY,"Content-Type":"application/json",Authorization:"Bearer "+jwt},
      body:JSON.stringify({app:"forme",task:"programme",locale:LANG==="en"?"en":"fr",requestId:reqId,answers:a,...(change?{change:String(change).slice(0,600)}:{}),...(current?{currentPlan:current}:{})})});
    let j=null;try{j=await r.json()}catch(e){}
    if(!same())throw Object.assign(new Error("Compte changé : demande annulée."),{stale:true});
    if(j&&j.usage)sbUse=j.usage;
    if(!r.ok||!j||j.error){const code=(j&&j.error)||(r.status===429?"rate":r.status===401?"auth":"unavailable");throw new Error(SB_ERR[code]||(j&&typeof j.message==="string"?j.message.slice(0,200):SB_ERR.unavailable))}
    return {...j,src:"ia"}}
  catch(e){if(e&&e.name==="AbortError")throw new Error(SB_ERR.timeout);if(e instanceof TypeError)throw new Error(SB_ERR.offline);throw e}
  finally{clearTimeout(tm)}}
// ---- aperçu ----
const muqRest=s=>{s=+s||0;return s>=60?(Math.round(s/60*10)/10+"").replace(".",LANG==="en"?".":",")+" min":s+" s"};
const muqRir=r=>{const n=parseInt(r,10);return isFinite(n)?`${L("garde")} ${n} ${L(n>1?"répétitions en réserve":"répétition en réserve")}`:""};
function muqRenderPreview(){const pv=muq.preview,box=$("muqBody"),old=PL();$("coachTitle").textContent=L("Aperçu du programme");
  box.innerHTML=`<p class="small muted">${L(pv.src==="ia"?"Composé par Sid'Bot à partir de tes réponses, vérifié par l'app.":"Créé par les règles de l'app à partir de tes réponses.")} ${L("Rien n'est activé tant que tu n'as pas confirmé.")}</p>
    ${pv.why.length?`<div class="muq-why-box"><b>${L("Pourquoi cette organisation")}</b><ul>${pv.why.map(w=>`<li>${esc(w)}</li>`).join("")}</ul></div>`:""}
    ${pv.warnings.map(w=>`<p class="muq-warn" role="note">${IC("alert")||""}<span>${esc(w)}</span></p>`).join("")}
    <ol class="muq-days">${pv.plan.days.map((d,di)=>`<li class="muq-day"><div class="muq-dh"><b class="notr">${esc(d.name||L("Séance")+" "+(di+1))}</b>${pv.est[di]?`<span class="small muted">≈ ${pv.est[di]} min</span>`:""}</div>
      <ul class="muq-ex">${(d.ex||[]).map((e,ei)=>`<li><div class="grow"><span class="muq-exn">${esc(L(e.name))}</span><span class="small muted">${esc([e.sets?`${e.sets} × ${e.reps||""}`.trim():"",e.rest?`${L("repos")} ${muqRest(e.rest)}`:"",muqRir(e.rir)].filter(Boolean).join(" · "))}</span>${e.note?`<span class="small muted notr">${esc(e.note)}</span>`:""}</div>
        <button type="button" class="linkbtn" data-muqalt="${di}:${ei}">${L("Remplacer")}</button>${muq.alt===di+":"+ei?muqAltList(e):""}</li>`).join("")}</ul></li>`).join("")}</ol>
    <p class="small muted">${L("Charges : commence léger, avec une charge que tu peux soulever 2 à 3 répétitions de plus que prévu ; augmente quand toutes les séries atteignent le haut de la fourchette.")} ${L("Ce programme n'est pas un avis médical.")}</p>
    ${sbReadyForProgram()?`<div class="muq-change"><label class="eyebrow" for="muqChange">${L("Demander une modification à Sid'Bot")}</label><textarea id="muqChange" rows="2" maxlength="600" placeholder="${L("Ex. remplace la séance jambes du vendredi par du haut du corps")}"></textarea><button type="button" class="btn ghost" data-muqchange="1" ${muq.busy?"disabled":""}>${L("Demander")}</button></div>`:""}
    ${muq.busy?`<div class="muq-busy" role="status"><span class="spin" aria-hidden="true"></span>${L("Sid'Bot modifie le programme…")}</div>`:""}
    ${muq.err?`<p class="muq-warn" role="alert">${IC("alert")||""}<span>${esc(L(muq.err))}</span></p>`:""}
    ${muq.confirm?`<div class="muq-confirm" role="alertdialog" aria-labelledby="muqCfT"><b id="muqCfT">${L("Remplacer ton programme actuel ?")}</b><p class="small">${L("Ton programme actuel")} « <span class="notr">${esc((old&&old.name)||L("Mon programme"))}</span> » ${L("sera rangé dans « Mes séances » comme programme précédent : ses séances et ton historique sont conservés. Le nouveau programme devient ton programme suivi.")}</p>
      <div class="two"><button type="button" class="btn ghost" data-muqcancel="1">${L("Annuler")}</button><button type="button" class="btn" data-muqactivate="2">${L("Oui, activer")}</button></div></div>`:""}
    <div class="muq-nav"><button type="button" class="btn ghost" data-muqback="1">${L("Modifier mes réponses")}</button><button type="button" class="btn" data-muqactivate="1" ${muq.busy?"disabled":""}>${L("Enregistrer et activer")}</button></div>`}
function muqAltList(e){const alts=typeof muAlternatives==="function"?muAlternatives(e.name,muq.answers):[];
  return `<div class="muq-alts" role="group" aria-label="${L("Remplacer par")}">${alts.length?alts.slice(0,6).map(n=>`<button type="button" class="pill" data-muqpick="${esc(n)}">${esc(L(n))}</button>`).join(""):`<span class="small muted">${L("Aucune alternative compatible avec ton matériel et tes exclusions.")}</span>`}</div>`}
// ---- activation : archive l'ancien programme, jamais de remplacement silencieux ----
function muqActivate(){const pv=muq.preview;if(!pv||muq.activating)return;if(muq.uid&&muq.uid!==sbUid()){muq=null;$("coachSheet").hidden=true;return}muq.activating=true;
  try{const a=muq.answers,pl={...pv.plan,id:pv.plan.id||uid(),v:undefined,profile:{...a},at:new Date().toISOString(),upd:Date.now(),src:pv.src==="ia"?"ia":"app"};delete pl.v;
    planApply(pl);data.prefs.muGoal=a.goal;delete data.prefs.muDraft;save();
    $("coachSheet").hidden=true;muq=null;renderMuscu();toast("Programme activé : tes anciennes séances restent dans « Mes séances »")}
  finally{if(muq)muq.activating=false}}
// ---- événements ----
$("muqBody").addEventListener("click",e=>{const t=e.target.closest("button");if(!t||!muq)return;const a=muq.answers,d=t.dataset;
  if(d.muq&&d.muq.startsWith("perWeek:")){const sp=d.muq.slice(8),o=(a.other||[]).find(x=>x.sport===sp);if(o)o.perWeek=+d.v;muqSave();muqRender();return}
  if(d.muq){const k=d.muq,v=d.v;a[k]=k==="days"||k==="dur"?+v:v;if(k==="place"&&v==="gym"&&(!(a.equip||[]).length||(a.equip.length===1&&a.equip[0]==="none")))a.equip=MUQ_GYM.slice(); /* « rien » d'un lieu précédent ne suit pas en salle */if(k==="place"&&v!=="gym")a.equip=(a.equip||[]).filter(e=>e!=="machines"&&e!=="cables");muqSave();muqRender();return}
  if(d.muqm){const k=d.muqm,v=d.v;if(k==="other"){const cur=a.other||[];a.other=cur.some(o=>o.sport===v)?cur.filter(o=>o.sport!==v):[...cur,{sport:v}]}
    else{let cur=a[k]||[];if(k==="equip"&&v==="none")cur=cur.includes("none")?[]:["none"];else{cur=cur.filter(x=>x!=="none"||k!=="equip");cur=cur.includes(v)?cur.filter(x=>x!==v):[...cur,v]}a[k]=cur}
    muqSave();muqRender();return}
  if(d.muqadd){const k=d.muqadd;a[k]=[...(a[k]||[]),d.v].slice(0,20);if(k==="prefer")a.avoidEx=(a.avoidEx||[]).filter(x=>x!==d.v);else a.prefer=(a.prefer||[]).filter(x=>x!==d.v);muq.q="";muqSave();muqRender();const i=$("muqQ-"+k);if(i)i.focus();return}
  if(d.muqrm){a[d.muqrm]=(a[d.muqrm]||[]).filter(x=>x!==d.v);muqSave();muqRender();return}
  if(d.muqnext){if(muq.step==="notes"){const n=$("muqNotes");if(n)a.notes=n.value.trim().slice(0,600)}muqNext();return}
  if(d.muqprev){if(muq.step==="notes"){const n=$("muqNotes");if(n)a.notes=n.value.trim().slice(0,600)}muq.back=null;muqPrev();return}
  if(d.muqedit){muq.back="recap";muqGo(d.muqedit);return}
  if(d.muqgen){muqGenerate(d.muqgen);return}
  if(d.muqsaveprefs){const pl=PL();if(pl){pl.profile={...(pl.profile||{}),...a};pl.upd=Date.now();M().upd=Date.now()}data.prefs.muGoal=a.goal;delete data.prefs.muDraft;save();$("coachSheet").hidden=true;muq=null;renderMuscu();toast("Préférences enregistrées");return}
  if(d.muqback){muq.preview=null;muq.confirm=false;muq.err="";muqGo("recap");return}
  if(d.muqalt){muq.alt=muq.alt===d.muqalt?null:d.muqalt;muqRender();return}
  if(d.muqpick){const [di,ei]=String(muq.alt||"").split(":").map(Number);muq.alt=null;
    try{const r=muReplace(muq.preview.plan,di,ei,d.muqpick,a,LANG==="en"?"en":"fr");muq.preview={...muq.preview,plan:r.plan,why:r.why||muq.preview.why,warnings:r.warnings||[],est:r.est||muq.preview.est};muq.err=""}
    catch(err){muq.err=err&&err.message?err.message:"Remplacement impossible."}muqRender();return}
  if(d.muqchange){const c=$("muqChange"),txt=c?c.value.trim():"";if(!txt){toast("Écris d'abord ta demande");return}if(muq.busy)return;const reqId=uid();muq.req=reqId;muq.busy="ia";muq.err="";muqRender();
    muqAskSidbot(a,reqId,txt,muq.preview&&muq.preview.plan).then(r=>{if(muq.req!==reqId)return;if(!r.plan||!Array.isArray(r.plan.days)||!r.plan.days.length)throw new Error("Le programme reçu est incomplet.");muq.preview={plan:r.plan,why:r.why||[],warnings:r.warnings||[],est:r.est||[],src:"ia"};muq.busy=false;muqRender()})
      .catch(err=>{if(muq.req!==reqId)return;muq.busy=false;muq.err=err.message||"Modification impossible pour l'instant.";muqRender()});return}
  if(d.muqactivate){if(PL()&&d.muqactivate==="1"){muq.confirm=true;muqRender();setTimeout(()=>{const b=document.querySelector('[data-muqactivate="2"]');if(b)b.focus()},30);return}muqActivate();return}
  if(d.muqcancel){muq.confirm=false;muqRender();return}});
$("muqBody").addEventListener("input",e=>{const i=e.target.closest("[data-muqq]");if(!i||!muq)return;muq.q=i.value;muq.qk=i.dataset.muqq;const pos=i.selectionStart;muqRender();const n=$("muqQ-"+muq.qk);if(n){n.focus();try{n.setSelectionRange(pos,pos)}catch(_){}}});
$("muqBody").addEventListener("change",e=>{if(e.target.id==="muqNotes"&&muq){muq.answers.notes=e.target.value.trim().slice(0,600);muqSave()}});
// ---- carte « Mon programme » sur l'écran principal (remplace le bloc permanent « Mon objectif ») ----
function muCoachCard(box){box.hidden=false;const pl=PL(),ds=PLD(),d=data.prefs.muDraft;
  if(!pl){box.innerHTML=`<div class="card coach-card muq-card"><div class="grow"><b>${L("Ton programme sur mesure")}</b><div class="small muted">${L("Quelques questions rapides, un aperçu, puis tes séances sont prêtes. Tu peux t'arrêter et reprendre plus tard.")}</div></div>
    <div class="muq-card-acts"><button type="button" class="btn" data-coach="new">${L(d&&d.answers?"Reprendre mon programme":"Créer mon programme")}</button>${d&&d.answers?`<button type="button" class="linkbtn" data-coach="restart">${L("Recommencer")}</button>`:""}</div></div>`;return}
  const p=pl.profile||{},nx=coachNext();
  box.innerHTML=`<div class="card coach-card coach-on muq-card"><div class="coach-top"><div class="grow"><span class="eyebrow">${L("Mon programme")}</span><b>${esc(muqLbl(MUQ_GOALS,p.goal)||L("Sur mesure"))}</b>
      <div class="small muted">${[p.level?muqLbl(MUQ_LEVELS,p.level):"",`${ds.length} ${L(ds.length>1?"séances":"séance")}`,p.days&&p.dur?`${p.days} × ${p.dur} min`:""].filter(Boolean).map(esc).join(" · ")}</div></div>
      <button type="button" class="pen" data-coach="more" aria-label="${L("Plus d'actions")}">${MORE}</button></div>
    ${nx?`<div class="muq-next"><span class="small muted">${L("Prochaine séance")}</span><b class="notr">${esc(nx.name||"")}</b><button type="button" class="btn" data-coach="go" data-se="${esc(nx.id)}">${L("Ouvrir la séance")}</button></div>`:""}
    <div class="muq-card-acts"><button type="button" class="linkbtn" data-coach="prefs">${L("Objectif et préférences")}</button><button type="button" class="linkbtn" data-coach="new">${L(d&&d.answers?"Reprendre mon nouveau programme":"Créer un nouveau programme")}</button></div></div>`}
// revue Codex : à la déconnexion ou au changement de compte, le parcours en cours est fermé et ses demandes ignorées
let muqUid=null;setInterval(()=>{const u=sbUid();if(muqUid!==null&&u!==muqUid&&muq){muq.req=null;muq=null;$("coachSheet").hidden=true}muqUid=u},1000);
