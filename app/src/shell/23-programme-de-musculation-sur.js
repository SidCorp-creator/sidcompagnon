/* ---------- v41 : programme de musculation sur mesure ---------- */
// data.muscu.plan = {id, profile, days:[{id, name, ex:[{name, pat, sets, reps, rest, rir, note?}]}], at, upd, src:"app"|"ia"}
// data.muscu.log = [{id, date, day, name, ex:[{name, sets:[{kg, reps}]}], upd}] : séances faites (sert à la progression)
// Le programme est calculé dans l'app (règles simples, prudentes) ; l'IA de la personne peut l'affiner par le connecteur.
// v42 : chaque exercice est classé (muscle principal, portion ciblée, schéma de mouvement, geste, résistance) pour qu'une séance
// travaille le muscle dans son ensemble sans doublon : jamais deux exercices du même schéma pour le même muscle, ni du même geste.
// Champs : n nom · m muscle · pat schéma · part portion ciblée · g geste (deux exercices du même geste ne vont pas ensemble) ·
// res résistance · eq matériel (g salle, d haltères, b poids du corps) · z zones sollicitées (s épaules, b bas du dos, k genoux) ·
// t type : H polyarticulaire très lourd, C polyarticulaire chargé, L polyarticulaire léger (poids du corps), I isolation
const EX=(n,m,pat,part,res,eq,z,t,g)=>({n,m,pat,part,res,eq,z,t,g:g||m+":"+pat});
// v44 : la liste vient de exercices.js (seule source, facile à modifier) ; p = prioritaire (P), proposé en premier dans son groupe.
// Les autres exercices restent possibles tapés à la main, mais ne sont jamais suggérés ni mis dans un programme.
const EXDB=((window.SIDFIT_EXERCICES&&window.SIDFIT_EXERCICES.groupes)||[]).flatMap(g=>(g.exercices||[]).map(x=>({...EX(x.nom,g.muscle,x.schema,g.nom,"",x.materiel||"g",x.zones||"",x.type||"I"),p:!!x.p,note:x.note||"",grp:g.nom})));
// texte de la liste pour Claude (groupes, P = à privilégier)
const exListTxt=()=>((window.SIDFIT_EXERCICES&&window.SIDFIT_EXERCICES.groupes)||[]).map(g=>`${g.nom} : ${g.exercices.map(x=>x.nom+(x.p?" (P)":"")+(x.note?` (${x.note.toLowerCase()})`:"")).join(", ")}`).join(" ; ");
const EXN=n=>EXDB.find(e=>e.n===n);
const MUS={chest:"Pectoraux",back:"Dos",traps:"Trapèzes",shoulders:"Épaules",triceps:"Triceps",biceps:"Biceps",quads:"Quadriceps",hams:"Ischios",glutes:"Fessiers",adductors:"Adducteurs",calves:"Mollets",abs:"Abdos"};
const PRIO={chest:["chest"],back:["back","traps"],shoulders:["shoulders"],arms:["biceps","triceps"],legs:["quads","hams","calves","adductors"],glutes:["glutes"],abs:["abs"]};
// séances types : chaque ligne = un rôle « muscle:schéma », dans l'ordre de priorité
// v44 : rôles adaptés à la liste d'exercices de exercices.js
const DAYT={
  full1:["quads:squat","chest:hpress","back:hrow","hams:curl","shoulders:lat","abs:flex","biceps:curl"],
  full2:["back:vpull","shoulders:ohp","quads:iso","chest:ipress","triceps:oh","calves:seated","shoulders:rear"],
  full3:["quads:squat","chest:fly","back:hrow","hams:curl","shoulders:rear","biceps:stretch","triceps:push"],
  push:["chest:hpress","chest:ipress","shoulders:ohp","shoulders:lat","chest:fly","triceps:oh","triceps:push"],
  pull:["back:vpull","back:hrow","shoulders:rear","biceps:curl","biceps:stretch","back:pullover","traps:shrug"],
  legs:["quads:squat","hams:curl","quads:iso","glutes:thrust","calves:seated","adductors:add","abs:flex"],
  upper1:["chest:hpress","back:vpull","shoulders:lat","back:hrow","shoulders:ohp","triceps:push","biceps:curl"],
  upper2:["chest:ipress","back:vpull","back:hrow","chest:fly","shoulders:rear","biceps:stretch","triceps:oh"],
  lower1:["quads:squat","hams:curl","quads:iso","calves:seated","glutes:abd","abs:flex","adductors:add"],
  lower2:["hams:curl","quads:squat","glutes:thrust","quads:iso","calves:calf","abs:flex","glutes:abd"]};
const DAYN={full1:"Corps complet A",full2:"Corps complet B",full3:"Corps complet C",push:"Poussée (pecs, épaules, triceps)",pull:"Tirage (dos, biceps)",legs:"Jambes",
  upper1:"Haut du corps",upper2:"Haut du corps",lower1:"Bas du corps",lower2:"Bas du corps",upper:"Haut du corps",lower:"Bas du corps"};
// repos par défaut (demande de Sid : bien récupérer) : très lourd 4 min, polyarticulaire 3 min, le reste 2 min ; modifiable ensuite
const REST={H:240,C:180,L:120,I:120};
const EXHEAVY=e=>e.t!=="I";
function coachBuild(p){const split={2:["full1","full2"],3:p.level==="deb"?["full1","full2","full3"]:["push","pull","legs"],4:["upper1","lower1","upper2","lower2"],
    5:["push","pull","legs","upper1","lower2"],6:["push","pull","legs","push","pull","legs"]}[p.days]||["full1","full2"];
  const nEx={45:4,60:5,75:6,90:7}[p.dur]||5,eq=p.equip==="gym"?"g":p.equip==="db"?"d":"b",av=(p.avoid||[]).map(x=>({shoulder:"s",back:"b",knee:"k"}[x])).filter(Boolean);
  const never=new Set(p.never||[]),R={muscle:["6–10","10–15"],force:["3–5","8–10"],gras:["8–12","12–15"],forme:["8–12","12–15"],endu:["12–15","15–20"]}[p.goal]||["8–12","10–15"];
  const rir={deb:"2–3",inter:"1–2",conf:"0–1"}[p.level]||"2",prio=new Set((p.prio||[]).flatMap(k=>PRIO[k]||[])),turn={};
  let relax=false; // v44 : la liste d'exercices est surtout faite pour la salle : si le matériel laisse une séance presque vide, on l'ignore pour cette séance
  const ok=e=>(relax||e.eq.includes(eq))&&!never.has(e.n)&&!av.some(z=>e.z.includes(z));
  // v73 : séries, répétitions, repos, intensité, RPE et tempo suivent les paramètres de référence de l'objectif (MU_PARAMS)
  const PP=MU_PARAMS[p.goal]||MU_PARAMS.muscle;
  const mk=(e,far)=>{const x=PP[EXHEAVY(e)?"H":"I"];let sets=p.level==="deb"?Math.min(3,x.sets):x.sets;if(prio.has(e.m))sets++;
    return{name:e.n,pat:e.m+":"+e.pat,sets,reps:x.reps,rest:x.rest,rir,...(PP.int?{int:PP.int}:{}),rpe:PP.rpe,tempo:PP.tempo,note:[e.note,p.level==="conf"&&!EXHEAVY(e)?"Dernière série au plus près de l'échec":"",far?L("Matériel de salle : remplace-le si tu ne l'as pas"):""].filter(Boolean).join(". ")}};
  // exercices imposés : chacun va dans la séance qui travaille déjà ce muscle (la moins chargée en imposés)
  const forced=split.map(()=>[]);
  for(const n of p.must||[]){const e=EXN(n);if(!e||never.has(n)||av.some(z=>e.z.includes(z)))continue; // v74.4 : les zones à ménager passent avant les exercices imposés
    const fit=split.map((t,i)=>({i,score:(DAYT[t].includes(e.m+":"+e.pat)?2:DAYT[t].some(r=>r.startsWith(e.m+":"))?1:0)-forced[i].length*0.1})).sort((a,b)=>b.score-a.score);
    forced[fit[0].i].push(e)}
  const days=split.map((t,di)=>{relax=false;let d=buildDay(t,di);if(d.ex.length<3){relax=true;d=buildDay(t,di)}relax=false;return d});
  function buildDay(t,di){const ex=[...forced[di]],gest=new Set(ex.map(e=>e.g)),pats=new Set(ex.map(e=>e.m+":"+e.pat)),names=new Set(ex.map(e=>e.n));
    const free=e=>ok(e)&&!names.has(e.n)&&!gest.has(e.g)&&!pats.has(e.m+":"+e.pat);
    const add=e=>{ex.push(e);gest.add(e.g);pats.add(e.m+":"+e.pat);names.add(e.n)};
    for(const role of DAYT[t]){if(ex.length>=Math.max(nEx,forced[di].length))break;const[m,pat]=role.split(":");
      // zone à ménager ou matériel absent : on prend un autre schéma pour le même muscle, jamais un exercice qui la sollicite
      let c=EXDB.filter(e=>e.m===m&&e.pat===pat&&free(e));if(!c.length)c=EXDB.filter(e=>e.m===m&&free(e));if(!c.length)continue;
      if(c.some(e=>e.p))c=c.filter(e=>e.p); // v44 : exercices prioritaires (P) d'abord
      const k=turn[role]=(turn[role]||0)+1;add(c[(k-1+di)%c.length])}
    ex.sort((a,b)=>"HCLI".indexOf(a.t)-"HCLI".indexOf(b.t));
    // v74.4 : un exercice hors du matériel de la personne (secours « relax » ou exercice imposé) est signalé, pas glissé en silence
    return{id:uid(),name:`${L("Séance")} ${"ABCDEF"[di]} · ${L(DAYN[t])}`,ex:ex.map(e=>mk(e,!e.eq.includes(eq)))}}
  return{id:uid(),profile:p,days,at:new Date().toISOString(),upd:Date.now(),src:"app"}}
// v44 : le programme devient le programme suivi : ses séances passent au format commun, celles de l'ancien programme suivi sont retirées
// v77 : l'ancien programme n'est plus effacé : ses séances (et donc leur historique) passent dans un groupe « Programme précédent » de « Mes séances »
function planApply(pl){const m=M(),old=PL();
  if(old){const when=new Date(old.at||Date.now()).toLocaleDateString(LANG==="en"?"en-GB":"fr-BE",{day:"numeric",month:"short",year:"numeric"});
    const grp={id:"arch-"+old.id,name:`${L("Programme précédent")} · ${when}`,src:"archive"};
    for(const s of grpSe(old.id)){s.grp=grp;seTouch(s)}}
  m.plan=pl;muMigrate();m.upd=Date.now()}
const ML=()=>{const m=M();if(!Array.isArray(m.log))m.log=[];return m.log};
const coachNext=()=>{const ds=PLD();if(!ds.length)return null;const last=ML().filter(l=>ds.some(d=>d.id===l.day)).sort((a,b)=>(b.date||"").localeCompare(a.date||""))[0];
  const i=last?ds.findIndex(d=>d.id===last.day):-1;return ds[(i+1)%ds.length]};
// v74.1 : section « Mon programme » cachée ; v77 (demande de Sid) : rétablie, avec « Créer mon programme » et la prochaine séance
function renderCoach(){const box=$("coachBox");if(!box)return;muCoachCard(box);return; // v77 : section de nouveau visible (cachée en 74.1), carte de 23a
  const pl=PL(),ds=PLD();
  const rmk=$("coRemark")?$("coRemark").value:""; // v43 : le rendu garde la remarque en cours
  if(shIsl("coach")){try{const p=(pl&&pl.profile)||{},G={muscle:"Prendre du muscle",force:"Gagner en force",gras:"Perdre du gras",forme:"Être en forme",endu:"Gagner en endurance"},LV={deb:"Débutant",inter:"Intermédiaire",conf:"Confirmé"};
    window.SCIslands.coach(box,{c:pl?{goal:G[p.goal]||"Sur mesure",ia:pl.src==="ia",level:p.level?LV[p.level]||"":"",n:ds.length,wait:!!pl.aiWait,remarks:(p.remarks||[]).slice().reverse().map(r=>({text:r.text,when:fmtWhen(Date.parse(r.at))}))}:null,more:MORE,i18n:agI18n()});
    const ta=$("coRemark"),want=pl&&pl.aiWait?"":rmk;if(ta&&ta.value!==want)ta.value=want;return} // v67 (#3)
    catch(e){reportErr("island coach: "+(e&&e.message));try{window.SCIslands.unmount(box)}catch(_){}}}
  if(!pl){box.innerHTML=`<div class="card coach-card"><div class="grow"><b>${L("Ton programme sur mesure")}</b><div class="small muted">${L("Quelques questions (niveau, objectif, jours, matériel) et Sid'Compagnon crée tes séances.")}</div></div><button type="button" class="btn" data-coach="new">${L("Créer mon programme")}</button></div>`;return}
  const p=pl.profile||{},G={muscle:"Prendre du muscle",force:"Gagner en force",gras:"Perdre du gras",forme:"Être en forme",endu:"Gagner en endurance"},LV={deb:"Débutant",inter:"Intermédiaire",conf:"Confirmé"};
  box.innerHTML=`<div class="card coach-card coach-on"><div class="coach-top"><div class="grow"><span class="eyebrow">${L("Mon programme")}</span><b>${esc(L(G[p.goal]||"Sur mesure"))}${pl.src==="ia"?` · ${L("ajusté par Claude")}`:""}</b><div class="small muted">${p.level?esc(L(LV[p.level]||""))+" · ":""}${ds.length} ${L(ds.length>1?"séances":"séance")}</div></div><button type="button" class="pen" data-coach="more" aria-label="${L("Plus d'actions")}">${MORE}</button></div>
    ${pl.aiWait?`<div class="coach-wait" role="status"><span class="grow">${L("Une ancienne demande d'ajustement est en attente : tu peux l'annuler.")}</span><button type="button" class="linkbtn" data-coach="resend">${L("Renvoyer")}</button><button type="button" class="x" data-coach="unwait" aria-label="${L("Masquer")}"><span class="gi gi-close" aria-hidden="true"></span></button></div>`:""}
    <div class="coach-adj"><label for="coRemark" class="eyebrow">${L("Ta remarque sur ce programme")}</label><textarea id="coRemark" class="autogrow" rows="2" maxlength="600" placeholder="${L("Ex. remplace la 2e séance jambes par une séance haut du corps")}">${esc(pl.aiWait?"":rmk)}</textarea>
      <div class="coach-adj-b"><button type="button" class="btn" data-coach="adjust">${L("Demander conseil à Sid'Bot")}</button></div>
      ${(p.remarks||[]).length?`<details class="coach-rem"><summary class="small muted">${(p.remarks||[]).length} ${L((p.remarks||[]).length>1?"remarques envoyées":"remarque envoyée")}</summary><ul>${p.remarks.slice().reverse().map(r=>`<li class="small"><span class="notr">${esc(r.text)}</span> <span class="muted">· ${fmtWhen(Date.parse(r.at))}</span></li>`).join("")}</ul></details>`:""}</div></div>`}
let cfDraft={}; // v77 : ancien formulaire « 5 questions » remplacé par le parcours de 23a ; gardé vide pour coachPrompt
const restLbl=r=>r>=60?String(Math.round(r/60*10)/10).replace(".",",")+" min":r+" s";
function coachOpen(o){muqOpen(o)} // v77 : ouvre le parcours « Créer mon programme »
// v76 : demandes envoyées à Sid'Bot (le programme suivi part dans le contexte « Ton programme de musculation ») : il explique et propose, la personne décide
const GOALS={muscle:["prendre du muscle","build muscle"],force:["gagner en force","get stronger"],gras:["perdre du gras","lose fat"],forme:["être en forme","get fit"],endu:["gagner en endurance","build endurance"]};
function coachPrompt(kind,remark){const p=(PL()&&PL().profile)||cfDraft||{},li=LANG==="en"?1:0,g=(GOALS[p.goal]||GOALS.muscle)[li];
  const AV={shoulder:["épaules","shoulders"],back:["bas du dos","lower back"],knee:["genoux","knees"]};
  const av=[...(p.avoid||[]).map(x=>(AV[x]||[x,x])[li]),p.avoidTxt].filter(Boolean).join(", ");
  const extra=[p.notes&&T3(`Mes remarques : ${p.notes}`,`My wishes: ${p.notes}`),av&&T3(`À ménager : ${av}`,`Go easy on: ${av}`)].filter(Boolean).join(". ");
  if(kind==="improve")return T3("Regarde mon programme de musculation et dis-moi ce que tu améliorerais (exercices, volume, progression), avec tes raisons.","Look at my workout program and tell me what you would improve (exercises, volume, progression), with your reasons.");
  if(kind==="adjust")return T3(`Voici ma remarque sur mon programme de musculation : « ${remark} ». Que me conseilles-tu de changer, sans tout recommencer ?`,`Here is my remark on my workout program: "${remark}". What do you suggest I change, without starting over?`);
  return T3(`Je viens de créer mon programme de musculation : objectif ${g}, ${p.days} séances par semaine de ${p.dur} min.${extra?" "+extra+".":""} Explique-le moi simplement et dis-moi comment bien progresser.`,
    `I just created my workout program: goal ${g}, ${p.days} sessions a week of ${p.dur} min.${extra?" "+extra+".":""} Explain it simply and tell me how to progress well.`)}
async function coachAdjust(text){text=String(text||"").trim();if(!text){toast("Écris d'abord ta remarque");return}const pl=PL();if(!pl)return;
  if(!(await nuConsent()))return;
  const pr=pl.profile||(pl.profile={});pr.remarks=[...(pr.remarks||[]),{at:new Date().toISOString(),text:text.slice(0,600)}].slice(-10);pl.upd=Date.now();M().upd=Date.now();save();renderMuscu();
  aiHandoff(coachPrompt("adjust",text.slice(0,600)),"muscu",{send:true})}