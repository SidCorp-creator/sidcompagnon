/* ---------- v39 : brancher Claude en quelques touches et lui confier les calculs (v42 : Claude seulement) ---------- */
// data.prefs.ai = "claude" (v42 : seule IA proposée ; une ancienne valeur "chatgpt"/"mistral" compte comme non branchée) ; data.prefs.aiOk = date du premier appel reçu de cette IA (branchement vérifié)
const AIS={
  claude:{name:"Claude",ask:q=>"https://claude.ai/new?q="+encodeURIComponent(q),conn:"https://claude.ai/settings/connectors",
    // v40 : la fenêtre « Ajouter un connecteur personnalisé » s'ouvre déjà remplie (nom + adresse) : il ne reste qu'à toucher « Ajouter »
    add:u=>"https://claude.ai/customize/connectors?modal=add-custom-connector&connectorName="+encodeURIComponent("Sid'note")+"&connectorUrl="+encodeURIComponent(u),
    steps:()=>[T3("Touche « Ouvrir Claude » : la page Connecteurs s'ouvre (connecte-toi si besoin).","Tap “Open Claude”: the Connectors page opens (sign in if needed).","Tik op ‘Claude openen’: de pagina Connectoren opent (log in indien nodig)."),
      T3("Touche « Ajouter un connecteur personnalisé ».","Tap “Add custom connector”.","Tik op ‘Aangepaste connector toevoegen’."),
      T3("Nom : Sid'note. URL : colle l'adresse (elle est déjà copiée). Authentification : « Aucune connexion ».","Name: Sid'note. URL: paste the address (already copied). Authentication: “None”.","Naam: Sid'note. URL: plak het adres (al gekopieerd). Authenticatie: ‘Geen’."),
      T3("Touche « Ajouter », puis reviens ici.","Tap “Add”, then come back here.","Tik op ‘Toevoegen’ en kom dan hier terug.")]}};
const aiCur=()=>data.prefs.ai==="claude"?AIS.claude:null; // v42 : Claude seulement (un ancien choix ChatGPT / Le Chat = pas encore branché)
const AI_TEST=()=>T3("Qu'est-ce que j'ai de prévu aujourd'hui dans Sid'note ?","What do I have planned today in Sid'note?","Wat staat er vandaag gepland in Sid'note?");
const AI_HABIT=()=>T3("À partir de maintenant, quand je te dis ce que j'ai mangé ou que je t'envoie la photo de mon assiette, calcule les calories et note-le toujours dans Sid'note, sans me le redemander.","From now on, whenever I tell you what I ate or send a photo of my plate, work out the calories and always log it in Sid'note without asking me again.","Vanaf nu: als ik je vertel wat ik gegeten heb of een foto van mijn bord stuur, bereken de calorieën en noteer het altijd in Sid'note zonder het opnieuw te vragen.");
let aiW={step:"pick",url:"",hash:"",poll:null};
function aiWizard(step){if(data.prefs.ai!=="claude"){data.prefs.ai="claude";delete data.prefs.aiOk;save()}aiW={step:step==="setup"?"setup":data.prefs.aiOk?"test":"setup",url:"",hash:"",poll:null};$("aiSheet").hidden=false;aiRender()}
function aiStop(){if(aiW.poll){clearInterval(aiW.poll);aiW.poll=null}}
function aiRender(){const b=$("aiBody"),ai=aiCur()||AIS.claude;aiStop();
  if(shIsl("aiWizard")&&["none","setup","test"].includes(aiW.step)){try{const ok=!!data.prefs.aiOk&&!aiW.hash; // v68 (#3)
    $("aiTitle").textContent=aiW.step==="none"?L("Créer un compte Claude"):ai.name;
    window.SCIslands.aiWizard(b,{w:{step:aiW.step,name:ai.name,url:aiW.url||"",urlErr:aiW.err||"",add:aiW.url?ai.add(aiW.url):"",ok,test:AI_TEST(),testHref:ai.ask(AI_TEST()),habit:AI_HABIT(),habitHref:ai.ask(AI_HABIT())},i18n:agI18n()});
    if(aiW.step==="setup"&&!aiW.url&&!aiW.busy){aiW.busy=true;mcpCreate(ai.name).then(r=>{aiW.busy=false;aiW.url=r.url;aiW.hash=r.hash;aiW.err="";mcpLoad();if(aiW.step==="setup")aiRender()})
      .catch(ex=>{aiW.busy=false;aiW.err=ex instanceof TypeError?"Pas de connexion internet":"Création impossible pour l'instant";if(aiW.step==="setup")aiRender();toast(aiW.err)})}
    if(aiW.step==="test"&&!ok)aiW.poll=setInterval(aiCheck,3000);return}
    catch(e){reportErr("island aiWizard: "+(e&&e.message));try{window.SCIslands.unmount(b)}catch(_){}}}
  if(aiW.step==="none"){$("aiTitle").textContent=L("Créer un compte Claude");
    b.innerHTML=`<p>${L("Crée un compte Claude gratuit (e-mail ou Google), puis reviens ici pour continuer.")}</p>
      <div class="ai-acts"><a class="btn" href="https://claude.ai/login" target="_blank" rel="noopener">${L("Créer mon compte Claude")}</a><button type="button" class="btn ghost" data-aistep="setup">${L("C'est fait, continuer")}</button></div>`;return}
  if(aiW.step==="setup"){$("aiTitle").textContent=ai.name;
    b.innerHTML=`<div class="ai-step"><b>${L("Tout est prêt")}</b><div class="small muted">${L("Touche le bouton : Claude s'ouvre avec Sid'note déjà rempli. Là-bas, touche simplement « Ajouter », puis reviens ici.")}</div>
        ${aiW.url?`<a class="btn" href="${esc(ai.add(aiW.url))}" target="_blank" rel="noopener" style="width:100%;margin-top:10px" data-aiadd="1">${L("Ajouter Sid'compagnon à")} ${esc(ai.name)}</a>`:`<button type="button" class="btn" disabled style="width:100%;margin-top:10px">${L("Préparation…")}</button>`}
        <div class="small muted" style="margin-top:8px">${L("Si Claude te demande de te connecter, fais-le : la fenêtre s'ouvrira ensuite toute seule.")}</div></div>
      <details class="ai-more"><summary class="small">${L("Voir mon adresse (si besoin)")}</summary><div class="mcp-url notr" id="aiUrl">${aiW.url?esc(aiW.url):L("Création…")}</div>
        <button type="button" class="btn ghost" data-aicopy="1" style="width:100%;margin-top:8px">${L("Copier l'adresse")}</button></details>
      <div class="ai-acts"><button type="button" class="btn ghost" data-aistep="none">${L("Pas encore de compte Claude ?")}</button><button type="button" class="btn" data-aistep="test">${L("C'est fait : tester")}</button></div>`;
    if(!aiW.url)mcpCreate(ai.name).then(r=>{aiW.url=r.url;aiW.hash=r.hash;mcpLoad();if(aiW.step==="setup")aiRender()})
      .catch(ex=>{const u=$("aiUrl");if(u)u.textContent=L(ex instanceof TypeError?"Pas de connexion internet":"Création impossible pour l'instant");toast(ex instanceof TypeError?"Pas de connexion internet":"Création impossible pour l'instant")});
    return}
  if(aiW.step==="test"){$("aiTitle").textContent=ai.name;const ok=!!data.prefs.aiOk&&!aiW.hash;
    b.innerHTML=`<button type="button" class="btn ai-back" data-aistep="setup">↺ ${L("Revoir les étapes")}</button>
      <div class="ai-step"><b>3. ${L("Envoie ce message à")} ${esc(ai.name)}</b><div class="ai-prompt notr">${esc(AI_TEST())}</div>
        <a class="btn" href="${ai.ask(AI_TEST())}" target="_blank" rel="noopener" style="width:100%;margin-top:8px">${L("Envoyer avec")} ${esc(ai.name)}</a></div>
      <div class="ai-wait" id="aiWait">${ok?`<b class="ok">✓ ${L("C'est branché !")}</b>`:`<span class="spin"></span>${L("En attente de Claude… (accepte l'accès à Sid'note s'il te le demande)")}`}</div>
      <div class="ai-step" id="aiHabit" ${ok?"":"hidden"}><b>${L("Dernière astuce")}</b><div class="small muted">${L("Pour que tes repas arrivent tout seuls dans Sid'note, envoie-lui une fois ce message :")}</div>
        <div class="ai-prompt notr">${esc(AI_HABIT())}</div><a class="btn ghost" href="${ai.ask(AI_HABIT())}" target="_blank" rel="noopener" style="width:100%;margin-top:8px">${L("Envoyer avec")} ${esc(ai.name)}</a>
        <button type="button" class="btn ghost" data-convset="nutri" style="width:100%;margin-top:8px">${L("Une conversation par app")}</button></div>
      <div class="ai-acts"><button type="button" class="btn" id="aiDone" ${ok?"":"hidden"}>${L("Terminer")}</button></div>`;
    if(!ok)aiW.poll=setInterval(aiCheck,3000);return}}
// le branchement est confirmé dès que l'IA a utilisé l'adresse (mcp_tokens.last_used)
async function aiCheck(){if($("aiSheet").hidden){aiStop();return}
  try{const q=aiW.hash?`&hash=eq.${aiW.hash}`:"";const r=await api(`/rest/v1/mcp_tokens?select=last_used${q}&last_used=not.is.null&limit=1`,{token:await token()});
    if(Array.isArray(r)&&r.length){aiStop();data.prefs.aiOk=new Date().toISOString();save();aiW.hash="";aiRender();renderAiCards();if(navigator.vibrate)navigator.vibrate([20,40,20])}}catch(e){}}
$("aiBody").addEventListener("click",e=>{const p=e.target.closest("[data-aipick]");
  if(p){aiW.step="setup";aiRender();return}
  const st=e.target.closest("[data-aistep]");if(st){aiW.step=st.dataset.aistep;aiRender();return}
  if(e.target.closest("[data-aiadd]")){setTimeout(()=>{if(aiW.step==="setup"){aiW.step="test";aiRender()}},800);return}
  if(e.target.closest("[data-aicopy]")){copyTxt(aiW.url).then(ok=>toast(ok?"Adresse copiée":"Copie impossible : sélectionne-la et copie-la"));return}
  if(e.target.closest("#aiDone")){$("aiSheet").hidden=true;aiStop();toast("Claude est branché sur Sid'note")}});
$("aiClose").addEventListener("click",()=>{$("aiSheet").hidden=true;aiStop()});
$("aiSheet").addEventListener("click",e=>{if(e.target.id==="aiSheet"){$("aiSheet").hidden=true;aiStop()}});
document.addEventListener("click",e=>{const w=e.target.closest("[data-aiwiz]");if(w){$("aiAskSheet").hidden=true;aiWizard(w.dataset.aiwiz)}
  else if(e.target.closest("[data-convset]")){$("aiAskSheet").hidden=true;$("aiSheet").hidden=true;aiStop();convSettings(e.target.closest("[data-convset]").dataset.convset)}});
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&!$("aiSheet").hidden&&aiW.step==="test")aiCheck()});
// demande confiée à Claude : message prêt, ouvert dans Claude d'un toucher (ou copié)
// v44 : une conversation fixe par sujet (data.prefs.aiConv = {nutri, muscu}, liens claude.ai/chat/… ou claude.ai/project/…) pour ne pas
// ouvrir une nouvelle conversation à chaque demande : une conversation existante ne peut pas être pré-remplie, donc le message est copié
// puis la conversation s'ouvre, il n'y a plus qu'à coller. Ancien « Dossier Santé » (data.prefs.aiProj) : sert de repli pour les deux sujets.
const CONV_OK=u=>/^https:\/\/claude\.ai\/(?:chat|project)\/[\w-]+/.test(u||"");
// v46.1 : une conversation par app (agenda, nutri, muscu, note) ; l'ancien dossier Santé ne sert qu'à sid'fit
const convUrl=t=>{const c=(data.prefs.aiConv||{})[t];return CONV_OK(c)?c:(t==="nutri"||t==="muscu")&&CONV_OK(data.prefs.aiProj)?data.prefs.aiProj:""};
const CONV_NAME={nutri:"Nutrition",muscu:"Musculation",agenda:"sid'agenda",note:"sid'note"};
const CONV_TITLE={agenda:"sid'agenda — discussion avec Claude",nutri:"sid'fit — Nutrition",muscu:"sid'fit — Musculation",note:"sid'note — discussion avec Claude"};
const CONV_IN={agenda:"convAgenda",nutri:"convNutri",muscu:"convMuscu",note:"convNote"};
// nouvelle conversation : le titre de l'app en tête du premier message, pour la retrouver dans Claude et la garder
const convFirst=(t,p)=>CONV_TITLE[t]&&!convUrl(t)?`${L(CONV_TITLE[t])}\n\n${p}`:p;
// copie pendant le toucher (sinon l'iPhone la refuse), avec un repli sans l'API du presse-papiers
function copyNow(t){try{if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).catch(()=>{});return}}catch(e){}
  const x=document.createElement("textarea");x.value=t;x.setAttribute("readonly","");x.style.position="fixed";x.style.opacity="0";document.body.appendChild(x);x.select();try{document.execCommand("copy")}catch(e){}x.remove()}
// ouvre Claude pour un sujet : la conversation fixe si elle est réglée (message copié), sinon une nouvelle conversation pré-remplie
// v44 : un lien de projet (claude.ai/project/…) ouvre une nouvelle discussion DANS le projet avec le message déjà écrit
// (claude.ai/new?project=…&q=…) : rien à coller. Une conversation existante ne peut pas être pré-remplie : message copié.
const projId=u=>(String(u||"").match(/^https:\/\/claude\.ai\/project\/([\w-]+)/)||[])[1]||"";
const convKind=t=>{const u=convUrl(t);return !u?"":projId(u)?"proj":"chat"};
function aiGo(topic,prompt,quiet){const u=topic&&convUrl(topic),ai=aiCur()||AIS.claude,pid=projId(u);
  if(pid){extOpen(`https://claude.ai/new?project=${encodeURIComponent(pid)}&q=${encodeURIComponent(prompt)}`);return "proj"}
  if(u){copyNow(prompt);extOpen(u);if(!quiet)toast("Prompt copié, colle-le dans la conversation");return "chat"}
  extOpen(ai.ask(convFirst(topic,prompt)));return ""}
function convSettings(t){show("more");const d=$("mcpSec"),a=$("aiAdv");if(d){d.open=true;if(a)a.open=true;setTimeout(()=>{const i=$(CONV_IN[t]||"convAgenda");(i?i.closest(".conv-f"):a).scrollIntoView({block:"center",behavior:"smooth"});if(i&&!i.value&&!matchMedia("(pointer:coarse)").matches)i.focus({preventScroll:true})},120)}}
function renderConv(){const c=data.prefs.aiConv||{};for(const[t,id]of Object.entries(CONV_IN)){const i=$(id);if(i&&document.activeElement!==i)i.value=c[t]||""}}
document.addEventListener("submit",e=>{const f=e.target.closest(".conv-f");if(!f)return;e.preventDefault();const t=f.dataset.conv,v=f.querySelector("input").value.trim();
  if(v&&/^https:\/\/claude\.ai\/share\//.test(v)){toast("Ce lien de partage est public : copie plutôt l'adresse de la conversation (https://claude.ai/chat/…)");return}
  if(v&&!CONV_OK(v)){toast("Colle le lien complet de la conversation (https://claude.ai/chat/…)");return}
  const c=data.prefs.aiConv=data.prefs.aiConv||{};if(v)c[t]=v;else delete c[t];save();renderAiCards();
  if(f.closest("#aaActs"))$("aiAskSheet").hidden=true;
  toast(v?`${L("Conversation")} ${L(CONV_NAME[t])} ${L("enregistrée")}`:`${L("Conversation")} ${L(CONV_NAME[t])} ${L("retirée : une nouvelle conversation s'ouvrira à chaque fois")}`)});
// v43 : une photo ne passe pas dans un lien (?q= ne prend que du texte). On la partage avec la feuille de partage
// (iPhone : app Claude, photo + message), sinon on la copie pour la coller dans Claude (ordinateur), ou on l'enregistre.
let aaImg=null;
async function aaImgPrep(dataUrl){aaImg={url:dataUrl,file:null,png:null};
  try{const b=await (await fetch(dataUrl)).blob();aaImg.file=new File([b],"assiette.jpg",{type:"image/jpeg"});
    const bm=await createImageBitmap(b),c=document.createElement("canvas");c.width=bm.width;c.height=bm.height;c.getContext("2d").drawImage(bm,0,0);
    aaImg.png=await new Promise(r=>c.toBlob(r,"image/png"))}catch(e){}
  const can=!!(aaImg.file&&navigator.canShare&&navigator.canShare({files:[aaImg.file]}));
  const sh=$("aaShare");if(sh)sh.hidden=!can;const cp=$("aaImgCopy");if(cp)cp.hidden=can||!(aaImg.png&&window.ClipboardItem&&navigator.clipboard&&navigator.clipboard.write)}
function aiHandoff(prompt,topic,opt){const ai=aiCur()||AIS.claude,cv=topic&&convUrl(topic),img=opt&&opt.img;$("aaPrompt").textContent=prompt;aaImg=null;
  $("aaActs").dataset.topic=topic||"";
  if(shIsl("aaActs")){try{const proj=!!cv&&convKind(topic)==="proj"; // v68 (#3)
    window.SCIslands.aaActs($("aaActs"),{a:{wiz:!(ai&&data.prefs.aiOk),img:img||"",conv:!!cv,proj,convName:CONV_NAME[topic]||"",ask:ai&&!cv&&!img?ai.ask(convFirst(topic,prompt)):"",askOk:!!data.prefs.aiOk,name:ai?ai.name:"",
      form:!!(CONV_TITLE[topic]&&!cv&&!img&&ai&&data.prefs.aiOk),topic:topic||""},i18n:agI18n()});const ci=$("aaConvIn");if(ci&&document.activeElement!==ci)ci.value="";
    $("aiAskSheet").hidden=false;if(img)aaImgPrep(img);return}catch(e){reportErr("island aaActs: "+(e&&e.message));try{window.SCIslands.unmount($("aaActs"))}catch(_){}}}
  $("aaActs").innerHTML=(ai&&data.prefs.aiOk?"":`<button type="button" class="btn" data-aiwiz="1">${L("Brancher Claude")}</button>`)+
    (img?`<div class="aa-img"><img src="${img}" alt="${L("Photo de ton plat")}"><span class="small muted">${L("La photo part avec le message : choisis Claude dans la liste de partage.")}</span></div>
      <button type="button" class="btn" id="aaShare">${L("Envoyer la photo à Claude")}</button>
      <button type="button" class="btn" id="aaImgCopy" hidden>${L("Copier la photo et ouvrir Claude")}</button>
      <a class="btn ghost" id="aaImgSave" href="${img}" download="assiette.jpg">${L("Enregistrer la photo")}</a>`:"")+
    (cv&&!img?`<button type="button" class="btn" data-aaconv="1">${L(convKind(topic)==="proj"?"Ouvrir dans le projet":"Ouvrir la conversation")} ${L(CONV_NAME[topic])}</button><div class="small muted" style="text-align:center">${L(convKind(topic)==="proj"?"Le message sera déjà écrit dans ton projet : il ne reste qu'à l'envoyer.":"Le message sera copié : colle-le dans la conversation.")}</div>`:"")+
    (ai&&!cv&&!img?`<a class="btn ${data.prefs.aiOk?"":"ghost"}" href="${ai.ask(convFirst(topic,prompt))}" target="_blank" rel="noopener">${L("Envoyer avec")} ${esc(ai.name)}</a>`:"")+
    `<button type="button" class="btn ghost" id="aaCopy">${L("Copier le message")}</button>`+
    (CONV_TITLE[topic]&&!cv&&!img&&ai&&data.prefs.aiOk?`<form class="conv-f aa-conv" data-conv="${topic}"><label class="small muted" for="aaConvIn">${L("Ensuite, pour que toutes les demandes")} ${L(CONV_NAME[topic])} ${L("arrivent dans cette même conversation, colle ici son lien :")}</label>
      <div class="conv-row"><input id="aaConvIn" type="url" inputmode="url" placeholder="https://claude.ai/chat/…" autocomplete="off"><button class="btn ghost" type="submit">${L("Enregistrer")}</button></div></form>`:"");
  $("aiAskSheet").hidden=false;if(img)aaImgPrep(img)}
$("aaActs").addEventListener("click",e=>{
  if(e.target.closest("#aaShare")){if(!aaImg||!aaImg.file){toast("Photo en préparation, réessaie");return}
    navigator.share({files:[aaImg.file],text:$("aaPrompt").textContent}).then(()=>{$("aiAskSheet").hidden=true}).catch(x=>{if(x&&x.name!=="AbortError")toast("Partage impossible : enregistre la photo puis ajoute-la dans Claude")});return}
  if(e.target.closest("#aaImgCopy")){const ai=aiCur()||AIS.claude;
    // la copie d'abord (pendant le clic, sinon le navigateur la refuse), puis Claude s'ouvre avec le message
    try{navigator.clipboard.write([new ClipboardItem({"image/png":Promise.resolve(aaImg.png)})]).then(()=>toast("Photo copiée : colle-la dans Claude (Ctrl+V ou ⌘V)"),()=>toast("Copie impossible : enregistre la photo"))}catch(x){toast("Copie impossible : enregistre la photo")}
    extOpen(ai.ask($("aaPrompt").textContent));return}
  if(e.target.closest("[data-aaconv]")){aiGo($("aaActs").dataset.topic,$("aaPrompt").textContent);setTimeout(()=>{$("aiAskSheet").hidden=true},300);return}
  if(e.target.closest("#aaCopy"))copyTxt($("aaPrompt").textContent).then(ok=>toast(ok?"Message copié : colle-le dans Claude":"Copie impossible"));
  else if(e.target.closest("a"))setTimeout(()=>{$("aiAskSheet").hidden=true},300)});
$("aaClose").addEventListener("click",()=>$("aiAskSheet").hidden=true);
$("aiAskSheet").addEventListener("click",e=>{if(e.target.id==="aiAskSheet")$("aiAskSheet").hidden=true});
// cartes « Mon IA » : Nutrition, Réglages
function renderAiCards(){const ai=aiCur(),ok=!!(ai&&data.prefs.aiOk);
  const st=$("aiState");if(st&&shIsl("aiState")){st.classList.toggle("on",ok);try{window.SCIslands.aiState(st,{ok,i18n:agI18n()})}catch(e){reportErr("island aiState: "+(e&&e.message))}}
  else if(st){st.classList.toggle("on",ok);st.innerHTML=ok?`<span class="ai-dot"></span><b>${L("Claude est branché")}</b>`:`<span class="ai-dot"></span><b>${L("Claude n'est pas branché")}</b>`}
  const mb=$("aiMain");if(mb)mb.textContent=L(ok?"Tester la connexion":"Brancher Claude");
  const c=$("nuAiCard");if(!c)return;c.hidden=isTrial()||ok; // v43 : Claude branché → la carte cède la place à « Ajouter ce que tu manges » (en haut)
  const lk=$("nuAiLink");if(lk){lk.hidden=!ok||isTrial();if(ok)lk.href=convUrl("nutri")||ai.ask(T3("J'ai mangé : ","I ate: ","Ik heb gegeten: "))}renderConv();
  if(shIsl("nuAiCard")){try{window.SCIslands.nuAiCard(c,{ok,icon:IC("sparkle")||"",href:ok?ai.ask(T3("J'ai mangé : ","I ate: ","Ik heb gegeten: ")):"",name:ok?ai.name:"",i18n:agI18n()});return}catch(e){reportErr("island nuAiCard: "+(e&&e.message));try{window.SCIslands.unmount(c)}catch(_){}}}
  c.innerHTML=ok?`<div class="grow"><b>${IC("sparkle")||""} ${L("Claude calcule pour toi")}</b><div class="small muted">${L("Dis-lui ce que tu as mangé ou envoie-lui la photo de ton assiette : tout arrive ici.")}</div></div><a class="btn" href="${ai.ask(T3("J'ai mangé : ","I ate: ","Ik heb gegeten: "))}" target="_blank" rel="noopener">${L("Ouvrir")} ${esc(ai.name)}</a>`
    :`<div class="grow"><b>${L("Branche Claude")}</b><div class="small muted">${L("Calories, menus et bilans sont calculés par Claude, même avec la version gratuite. 2 minutes, une seule fois.")}</div></div><button type="button" class="btn" data-aiwiz="1">${L("Brancher")}</button>`}
