/* ---------- v47 : objectif visible, séries conseillées, types de séances, demande à Claude (#13, #14, #17) ---------- */
// objectif d'entraînement (data.prefs.muGoal, synchronisé ; repris du programme suivi s'il n'est pas réglé)
const MU_GOALS={force:"Force",muscle:"Prise de masse",gras:"Sèche",endu:"Endurance",forme:"Forme"};
// séries × répétitions conseillées : H = exercice polyarticulaire (lourd), I = isolation
const MU_SCHEME={force:{H:[5,"3–5"],I:[3,"8–10"]},muscle:{H:[4,"6–10"],I:[3,"10–15"]},gras:{H:[3,"8–12"],I:[3,"12–15"]},endu:{H:[3,"12–15"],I:[3,"15–20"]},forme:{H:[3,"8–12"],I:[3,"12–15"]}};
const muGoal=()=>{const g=data.prefs.muGoal||(PL()&&PL().profile&&PL().profile.goal);return MU_SCHEME[g]?g:"muscle"};
const HEAVY_RE=/squat|souleve|developpe|rowing|traction|presse|dips|hip thrust|fente|military|bench|deadlift|\brow\b|press|pull-?up|lunge/;
function exAdv(name){const n=String(name||"").trim();if(!n)return null;const e=EXN(n)||EXDB.find(x=>fold(x.n)===fold(n));
  const k=e?(e.t==="I"?"I":"H"):(HEAVY_RE.test(fold(n))?"H":"I");const[sets,reps]=MU_SCHEME[muGoal()][k];return{sets,reps}}
function exAdvHtml(ex){const a=exAdv(ex.name);if(!a)return `<div class="ex-adv" hidden></div>`;
  const same=ex.sets.length===a.sets&&ex.reps===a.reps;
  return `<div class="ex-adv"><span class="grow">${L("Conseillé")} (${L(MU_GOALS[muGoal()])}) : <b>${a.sets} × ${a.reps}</b></span>${same?`<span class="ok">✓</span>`:`<button type="button" class="linkbtn" data-msadv="1">${L("Appliquer")}</button>`}</div>`}
// applique le conseil : nombre de séries (seules des séries vides sont retirées) et répétitions visées ; annulable
function exAdvApply(se,ex){const a=exAdv(ex.name);if(!a)return;const before={sets:ex.sets.map(x=>({...x})),reps:ex.reps};
  while(ex.sets.length<a.sets)ex.sets.push(newSet());
  for(let j=ex.sets.length-1;j>=a.sets;j--){const x=ex.sets[j];if(!String(x.kg||"").trim()&&!String(x.reps||"").trim())ex.sets.splice(j,1)}
  ex.reps=a.reps;seTouch(se);save();renderMuscu();
  toastAct(`${a.sets} ${L("séries")} × ${a.reps}`,"Annuler",()=>{ex.sets=before.sets;ex.reps=before.reps;seTouch(se);save();renderMuscu()})}
function renderMuGoal(){const box=$("muGoal");if(!box)return;const g=muGoal(),keys=["force","muscle","gras","endu"].concat(g==="forme"?["forme"]:[]);
  // v52 (ticket #3) : dessiné par React (app/src/Small.tsx) ; ancien rendu en secours
  if(window.SCIslands&&window.SCIslands.muGoal&&!window.__noIslands){try{window.SCIslands.muGoal(box,{keys,goal:g,names:MU_GOALS,i18n:{L,MOL,MO,DOWL}});return}catch(e){reportErr("island muGoal: "+(e&&e.message))}}
  box.innerHTML=`<span class="eyebrow">${L("Mon objectif")}</span><div class="seg mu-goal-seg" role="group" aria-label="${L("Mon objectif")}" style="grid-template-columns:repeat(${keys.length},minmax(0,1fr))">${keys.map(k=>`<button type="button" data-mugoal="${k}" aria-pressed="${k===g}">${L(MU_GOALS[k])}</button>`).join("")}</div>
    <div class="small muted">${L("Les séries et répétitions conseillées de chaque exercice suivent cet objectif.")}</div>`}
$("muGoal").addEventListener("click",e=>{const b=e.target.closest("[data-mugoal]");if(!b)return;const g=b.dataset.mugoal;if(g===muGoal()&&data.prefs.muGoal)return;
  data.prefs.muGoal=g;const pl=PL();if(pl){pl.profile=pl.profile||{};pl.profile.goal=g;pl.upd=Date.now();M().upd=Date.now()}save();renderMuscu();
  toast(`${L("Objectif")} : ${L(MU_GOALS[g])}`)});
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
// v47 (#17) : un champ en haut de Musculation et de Notes, comme « Planifier » : la demande part chez Claude, le résultat revient par le connecteur
function muPrompt(q){const g=L(MU_GOALS[muGoal()]);return T3(`Avec Sid'note, pour ma musculation : ${q}\n(Lis d'abord mon programme et mes séances avec muscu_programme. Pour changer le programme, enregistre-le avec enregistrer_programme ; pour une séance faite, note-la avec noter_seance. Utilise les exercices de la liste donnée par muscu_programme. Mon objectif : ${g}.)`,
  `With Sid'note, for my workouts: ${q}\n(First read my program and sessions with muscu_programme. To change the program, save it with enregistrer_programme; for a finished session, log it with noter_seance. Use the exercises listed by muscu_programme. My goal: ${g}.)`,
  `Met Sid'note, voor mijn training: ${q}\n(Lees eerst mijn schema en trainingen met muscu_programme. Om het schema te wijzigen: sla het op met enregistrer_programme; een gedane training noteer je met noter_seance. Gebruik de oefeningen uit de lijst van muscu_programme. Mijn doel: ${g}.)`)}
function ntPrompt(q){return T3(`Avec Sid'note, dans mes notes : ${q}\n(Retrouve les notes avec notes et lire_note. Pour une nouvelle note, utilise ajouter_note et propose un dossier si c'est utile ; pour changer une note qui existe, utilise modifier_note, sans créer de doublon. Tu ne vois pas mes notes secrètes.)`,
  `With Sid'note, in my notes: ${q}\n(Find notes with notes and lire_note. For a new note, use ajouter_note and suggest a folder if useful; to change an existing note, use modifier_note without creating a duplicate. You can't see my secret notes.)`,
  `Met Sid'note, in mijn notities: ${q}\n(Zoek notities met notes en lire_note. Voor een nieuwe notitie: ajouter_note en stel een map voor als dat helpt; om een bestaande notitie te wijzigen: modifier_note, zonder dubbel. Je ziet mijn geheime notities niet.)`)}
for(const[k,topic,mk,health]of[["mu","muscu",muPrompt,true],["nt","note",ntPrompt,false]]){const f=$(k+"AskForm"),t=$(k+"Ask");
  $(k+"Mic").addEventListener("click",e=>dictate(e.currentTarget,t));t.addEventListener("input",()=>grow(t));
  t.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();f.requestSubmit()}});
  f.addEventListener("submit",async e=>{e.preventDefault();const q=t.value.trim();if(!q)return;dictStop();
    if(health&&!(await nuConsent()))return;aiHandoff(mk(q.slice(0,1500)),topic);t.value="";grow(t)})}
$("coachClose").addEventListener("click",()=>$("coachSheet").hidden=true);
$("coachSheet").addEventListener("click",e=>{if(e.target.id==="coachSheet")$("coachSheet").hidden=true});
$("coachBox").addEventListener("click",e=>{
  const b=e.target.closest("[data-coach]");if(!b)return;const k=b.dataset.coach;
  if(k==="new")coachOpen();
  else if(k==="adjust")coachAdjust($("coRemark").value);
  else if(k==="resend"){const pl=PL(),rm=pl&&pl.profile&&(pl.profile.remarks||[]).slice(-1)[0];aiHandoff(rm&&rm.text!==pl.profile.notes?coachPrompt("adjust",rm.text):coachPrompt("new"),"muscu")}
  else if(k==="unwait"){const pl=PL();if(pl){delete pl.aiWait;pl.upd=Date.now();save();renderMuscu()}}
  else if(k==="more")openActions(L("Mon programme"),[{l:"Modifier mes réponses",fn:coachOpen},
    {l:"Ajuster avec Claude",fn:async()=>{if(!(await nuConsent()))return;aiHandoff(coachPrompt("improve"),"muscu")}},
    {l:"Partager le programme",fn:()=>copyText(shareTxt(PLD(),L("Mon programme")),"prog")},
    {l:"Supprimer le programme",danger:true,fn:()=>grpActions(PL().id)}])});
// v43 : au retour de veille, on resynchronise les sons programmés du Focus (l'horloge audio a pu être suspendue)
addEventListener("pageshow",()=>{if(P.run)pomoPlan()});
