/* ---------- v76 : Sid'Bot, l'assistant intégré aux trois apps (remplace Claude : liens claude.ai, conversations reliées, assistant de branchement) ---------- */
// Tout se passe dans Sid'Compagnon : la fonction Supabase « sidbot » relaie la demande vers le fournisseur choisi côté serveur (clé jamais dans le site).
// Ce qui part : la question et un résumé de l'app ouverte, que la personne voit et peut retirer (puces « Partagé avec Sid'Bot »).
// Jamais : mots de passe, documents, notes secrètes. Une note n'est jointe que si la personne le demande.
// Sid'Bot ne modifie rien seul : il propose des actions (ajouter une activité, une note, un repas) que la personne valide d'un toucher.
// Historique : les 20 derniers messages par app, sur cet appareil seulement (localStorage, par compte).
const SB_NAME=MARQUES.bot;
const SB_APPS={journee:{label:MARQUES.journee,app:"agenda",hint:"Ex. : ajoute « réviser chimie » jeudi à 14 h"},
  forme:{label:MARQUES.forme,app:"fit",hint:"Ex. : propose-moi un dîner riche en protéines"},
  note:{label:MARQUES.note,app:"note",hint:"Ex. : résume la note ouverte en 5 points"}};
const SB_TOPIC={agenda:"journee",nutri:"forme",muscu:"forme",note:"note"};
const SB_MAX=20,SB_TIMEOUT=50000,SB_IMG_MAX=1100000,SB_HIST_CHARS=20000; // délai > auth + quota + fournisseur côté serveur ; historique borné sous la limite serveur (24 000)
const SB_ERR={auth:"Reconnecte-toi pour utiliser Sid'Bot.",quota:"Le quota gratuit de Sid'Bot est épuisé pour aujourd'hui. Il revient demain : rien n'est facturé.",
  rate:"Trop de demandes d'un coup. Réessaie dans un instant.",timeout:"Sid'Bot met trop de temps à répondre. Réessaie.",
  unavailable:"Sid'Bot est indisponible pour l'instant. Réessaie plus tard.",not_configured:"Sid'Bot n'est pas encore activé sur ce serveur.",
  bad_request:"Cette demande n'a pas pu être envoyée. Raccourcis-la ou retire la photo.",offline:"Pas de connexion internet : Sid'Bot a besoin du réseau.",
  trial:"Mode essai : crée ton compte pour utiliser Sid'Bot."};
// compatibilité : plus aucune IA externe à brancher (anciennes préférences ai / aiOk / aiConv laissées telles quelles dans les données)
const AIS={},aiCur=()=>null;
let sbApp="journee",sbBusy=false,sbImg=null,sbCtl=null,sbUse={},sbShare={};
const sbUid=()=>(session&&session.user&&session.user.id)||"anon",sbKey=u=>"sidnote-sidbot-"+(u||sbUid());
function sbHist(u){try{const h=JSON.parse(ls.get(sbKey(u))||"{}");return h&&typeof h==="object"?h:{}}catch(e){return {}}}
function sbSave(h,u){try{ls.set(sbKey(u),JSON.stringify(h))}catch(e){}}
function sbMsgs(app,u){const h=sbHist(u);return Array.isArray(h[app])?h[app]:[]}
function sbPush(app,m,u){const h=sbHist(u),a=Array.isArray(h[app])?h[app]:[];a.push(m);h[app]=a.slice(-SB_MAX);sbSave(h,u)}
function sbClear(app){const h=sbHist();delete h[app];sbSave(h)}
const sbAppOfView=v=>{const a=appOf(v);return a==="agenda"?"journee":a==="note"?"note":a==="fit"?"forme":"journee"};
// ---- contexte par app : un résumé court, jamais de secrets ----
function sbCtxParts(app){
  const t=iso(today()),end=new Date(today());end.setDate(end.getDate()+7);const e7=iso(end);
  if(app==="journee"){const tasks=(data.tasks||[]).filter(x=>x&&x.date>=t&&x.date<=e7&&!x.canc).sort((a,b)=>(a.date+(a.time||"")).localeCompare(b.date+(b.time||""))).slice(0,40)
      .map(x=>({title:String(x.title||"").slice(0,120),date:x.date,time:x.time||"",status:x.status==="fait"?"done":"todo"}));
    const todos=(data.todos||[]).filter(x=>x&&!x.done).slice(0,20).map(x=>({title:String(x.title||"").slice(0,120),day:x.day||""}));
    return [{k:"agenda",label:"Ton agenda des 7 prochains jours",on:true,v:{tasks,todos}}]}
  if(app==="forme"){const n=NU(),day=n.log.filter(x=>x&&x.day===t),tot={kcal:0,p:0,c:0,f:0};
    day.forEach(x=>{for(const k in tot)tot[k]+=+x[k]||0});
    const meals=day.slice(0,30).map(x=>({name:String(x.name||"").slice(0,80),qty:String(x.qty||"").slice(0,40),kcal:Math.round(+x.kcal||0)}));
    const goal=n.plan&&n.plan.kcal?Math.round(+n.plan.kcal):null;
    const weights=n.weights.filter(w=>w&&w.day&&+w.kg).sort((a,b)=>a.day.localeCompare(b.day)).slice(-5).map(w=>({date:w.day,kg:+w.kg}));
    const pl=typeof PL==="function"?PL():null,pr=(pl&&pl.profile)||{};
    return [{k:"nutrition",label:"Ta nutrition du jour",on:true,v:{goal,totals:{kcal:Math.round(tot.kcal),p:Math.round(tot.p),c:Math.round(tot.c),f:Math.round(tot.f)},meals}},
      {k:"weights",label:"Tes 5 dernières pesées",on:false,v:weights},
      {k:"muscu",label:"Ton programme de musculation",on:true,v:{goal:pr.goal||"",days:pr.days||null,minutes:pr.dur||null,name:pl&&pl.name?String(pl.name).slice(0,80):""}}]}
  if(app==="note"){const n=typeof noteOpenId!=="undefined"&&noteOpenId&&typeof noteFind==="function"?noteFind(noteOpenId):null;
    // une note secrète n'est jamais jointe, même déverrouillée
    if(n&&!n.secret&&!$("noteEdit").hidden)return [{k:"note",sk:"note:"+n.id,label:"La note ouverte",on:false,v:(()=>{const ti=String(n.title||""),bo=String(n.body||""),complete=ti.length<=200&&bo.length<=8000;return {title:ti.slice(0,200),body:bo.slice(0,complete?8000:6000),complete}})()}]; // v78 : complete=true seulement si la note entière part (sinon pas de modification possible)
    return []}
  return []}
// choix « partager » : par compte, par app et (pour une note) par note : joindre une note ne joint pas la suivante
const sbSK=(app,p)=>sbUid()+":"+app+":"+(p.sk||p.k);
function sbContext(app){const out={today:iso(today())};for(const p of sbCtxParts(app))if(sbShare[sbSK(app,p)]??p.on)out[p.k]=p.v;return out}
// ---- ouverture ----
function sbOpen(app,opt){opt=opt||{};sbApp=SB_APPS[app]?app:"journee";sbImg=opt.img||null;
  $("sbSheet").hidden=false;sbRender();
  const i=$("sbIn");if(opt.prompt){i.value=opt.prompt;grow(i);if(opt.send){sbSend();return}}
  setTimeout(()=>{if(!matchMedia("(pointer:coarse)").matches)i.focus({preventScroll:true})},80)}
function sbClose(){$("sbSheet").hidden=true;if(sbCtl){try{sbCtl.abort()}catch(e){}}}
// anciens points d'entrée (Agenda, Musculation, Nutrition, Notes) : la demande arrive dans Sid'Bot, déjà écrite, envoyée d'un toucher
function aiHandoff(prompt,topic,opt){sbOpen(SB_TOPIC[topic]||sbAppOfView(data.ui.view),{prompt,img:opt&&opt.img,send:!!(opt&&opt.send)})}
function aiGo(topic,prompt,quiet){aiHandoff(prompt,topic);return ""}
const convUrl=()=>"",convTabs=()=>{},renderConv=()=>{};
function aiWizard(){sbOpen(sbAppOfView(data.ui.view))}
function renderAiCards(){const c=$("nuAiCard");if(c)c.hidden=true;const st=$("sbState");if(st)st.textContent=sbUse.limit?`${L("Aujourd'hui")} : ${sbUse.used} / ${sbUse.limit} ${L("demandes")}`:""}
// ---- affichage ----
function sbBubble(m){if(m.role==="user")return `<div class="sb-msg me notr">${esc(m.content)}${m.img?`<span class="sb-att">${IC("image")||""} ${L("Photo jointe")}</span>`:""}</div>`;
  if(m.role==="error")return `<div class="sb-msg err" role="alert">${IC("alert")||""}<span>${esc(L(m.content))}</span>${m.retry?`<button type="button" class="linkbtn" data-sbretry="1">${L("Réessayer")}</button>`:""}</div>`;
  const acts=(m.actions||[]).map((a,i)=>`<div class="sb-act" data-done="${a.done?1:0}"><span class="grow notr">${esc(a.label||sbActLabel(a))}</span>${a.done?`<span class="sb-ok">${IC("tick")||""}${L(a.type==="edit_note"?"Note modifiée":a.type==="share_note_pdf"?"Exporté":"Ajouté")}</span>`:`<button type="button" class="btn ghost sm" data-sbact="${m.id}:${i}">${L(sbActVerb(a))}</button>`}</div>${sbOpenDiff===m.id+":"+i&&!a.done?sbDiff(m,a,i):""}`).join("");
  return `<div class="sb-msg bot"><div class="notr">${esc(m.content).replace(/\n/g,"<br>")}</div>${acts?`<div class="sb-acts">${acts}</div>`:""}</div>`}
function sbRender(){const A=SB_APPS[sbApp],msgs=sbMsgs(sbApp);
  $("sbTitle").textContent=SB_NAME;$("sbSub").textContent=`${L("Avec")} ${A.label}`;
  document.querySelectorAll("[data-sbapp]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.sbapp===sbApp)));
  const parts=sbCtxParts(sbApp);
  $("sbCtx").innerHTML=parts.length?`<span class="small muted">${L("Partagé avec Sid'Bot :")}</span>`+parts.map(p=>{const on=sbShare[sbSK(sbApp,p)]??p.on;
    return `<button type="button" class="sb-chip" data-sbctx="${p.k}" aria-pressed="${on}">${on?(IC("tick")||""):""}${L(p.label)}</button>`}).join(""):
    `<span class="small muted">${L(sbApp==="note"?"Ouvre une note pour pouvoir la joindre. Tes mots de passe, documents et notes secrètes ne sont jamais envoyés.":"Rien d'autre que ta question n'est envoyé.")}</span>`;
  const list=$("sbList");
  list.innerHTML=msgs.length?msgs.map(sbBubble).join(""):`<div class="sb-empty"><b>${L("Pose ta question")}</b><span class="small muted">${L(A.hint)}</span>
    <div class="sb-sugg">${sbSuggest(sbApp).map(s=>`<button type="button" class="sb-chip" data-sbsugg="1">${L(s)}</button>`).join("")}</div></div>`;
  if(sbBusy)list.insertAdjacentHTML("beforeend",`<div class="sb-msg bot sb-wait" aria-live="polite"><span class="spin" aria-hidden="true"></span>${L("Sid'Bot réfléchit…")}</div>`);
  list.scrollTop=list.scrollHeight;
  $("sbImg").hidden=!sbImg;if(sbImg)$("sbImg").innerHTML=`<img src="${sbImg}" alt="${L("Photo de ton plat")}"><button type="button" class="linkbtn" id="sbImgDel">${L("Retirer la photo")}</button>`;
  $("sbSend").disabled=sbBusy;$("sbClear").hidden=!msgs.length;renderAiCards()}
function sbSuggest(app){return app==="journee"?["Qu'est-ce que j'ai de prévu cette semaine ?","Aide-moi à organiser ma journée"]:
  app==="forme"?["Que manger ce soir pour compléter ma journée ?","Explique-moi mon programme"]:["Corrige les fautes de la note ouverte","Résume la note ouverte","Exporte la note ouverte en PDF"]}
const sbActVerb=a=>a.type==="add_task"?"Ajouter à l'agenda":a.type==="add_note"?"Créer la note":a.type==="log_meal"?"Ajouter au repas":a.type==="edit_note"?"Voir la modification":a.type==="share_note_pdf"?"Exporter en PDF":"Appliquer";
const sbActLabel=a=>{const p=a.payload||{};return a.type==="add_task"?`${p.title||""} · ${p.date||""}${p.time?" "+p.time:""}`:a.type==="add_note"?String(p.title||""):a.type==="edit_note"?L("Modifier la note ouverte"):a.type==="share_note_pdf"?L("La note ouverte, en PDF"):a.type==="log_meal"?`${p.name||""} · ${Math.round((p.items||[]).reduce((t,x)=>t+(+x.kcal||0),0))} kcal`:String(p.name||p.title||"")};
// ---- envoi ----
async function sbSend(retry){if(sbBusy)return;const i=$("sbIn");let text=i.value.trim();const app=sbApp,uid0=sbUid(),same=()=>sbUid()===uid0;
  if(retry){const last=sbMsgs(app,uid0).filter(m=>m.role==="user").pop();if(!last)return;text=last.content}
  if(!text)return;
  const fail=(code,again)=>{sbBusy=false;if(!same())return;sbPush(app,{id:uid(),role:"error",content:SB_ERR[code]||SB_ERR.unavailable,retry:!!again},uid0);sbRender()};
  if(!retry){sbPush(app,{id:uid(),role:"user",content:text.slice(0,4000),img:!!sbImg},uid0);i.value="";grow(i)}
  if(!session){fail("auth");return}if(isTrial()){fail("trial");return}if(!navigator.onLine){fail("offline",true);return}
  if(app==="forme"&&!(await nuConsent())){sbBusy=false;sbRender();return}
  if(!same())return;
  // les derniers échanges, du plus récent au plus ancien, tant que le total reste sous SB_HIST_CHARS
  const hist=/** @type {{role:string,content:string,image?:string}[]} */([]);let tot=0;
  for(const m of sbMsgs(app,uid0).filter(m=>m.role==="user"||m.role==="assistant").slice(-10).reverse()){const c=String(m.content).slice(0,4000);if(hist.length&&tot+c.length>SB_HIST_CHARS)break;tot+=c.length;hist.unshift({role:m.role,content:c})}
  if(sbImg&&hist.length){if(sbImg.length>SB_IMG_MAX){fail("bad_request");return}hist[hist.length-1].image=sbImg}
  sbBusy=true;sbRender();const ctl=sbCtl=new AbortController();const tm=setTimeout(()=>{try{ctl.abort()}catch(e){}},SB_TIMEOUT);
  try{// revue Codex : jeton et contexte figés pour le même compte que l'historique, vérifiés avant l'envoi
    const jwt=await token();if(!same()){clearTimeout(tm);sbBusy=false;return}const ctx=sbContext(app);
    const noteRef=ctx.note&&typeof noteOpenId!=="undefined"&&noteOpenId?noteOpenId:null,noteN=noteRef?noteFind(noteRef):null,noteVer=noteN?noteN.upd||0:0; // v78 : seule la note jointe, dans sa version envoyée
    const r=await fetch(SUPABASE_URL+"/functions/v1/sidbot",{method:"POST",signal:ctl.signal,
      headers:{apikey:SUPABASE_KEY,"Content-Type":"application/json",Authorization:"Bearer "+jwt},
      body:JSON.stringify({app,locale:LANG==="en"?"en":"fr",messages:hist,context:ctx})});
    clearTimeout(tm);let j=null;try{j=await r.json()}catch(e){}
    if(!same()){sbBusy=false;return} // compte changé pendant la demande : la réponse est ignorée
    if(j&&j.usage)sbUse=j.usage;
    if(!r.ok||!j||j.error){const code=j&&j.error||(r.status===401?"auth":r.status===429?"rate":r.status===504?"timeout":"unavailable");
      fail(code,code==="rate"||code==="timeout"||code==="unavailable");return}
    sbImg=null;
    const actions=(Array.isArray(j.actions)?j.actions:[]).filter(sbActOk).slice(0,5).map(a=>({type:a.type,payload:a.payload,label:String(a.label||"").slice(0,160)}));
    sbPush(app,{id:uid(),role:"assistant",content:String(j.reply||"").slice(0,8000),actions,...(noteRef?{noteRef,noteVer,noteFull:!!(ctx.note&&ctx.note.complete)}:{})},uid0);sbBusy=false;sbRender()}
  catch(e){clearTimeout(tm);fail(e&&e.name==="AbortError"&&!$("sbSheet").hidden?"timeout":navigator.onLine?"unavailable":"offline",true)}}
// ---- actions proposées : validées ici, appliquées seulement après un toucher ----
const SB_D=/^\d{4}-\d{2}-\d{2}$/,SB_T=/^([01]\d|2[0-3]):[0-5]\d$/;
function sbActOk(a){if(!a||typeof a!=="object"||!a.payload||typeof a.payload!=="object")return false;const p=a.payload;
  if(a.type==="add_task")return typeof p.title==="string"&&p.title.trim()&&SB_D.test(p.date||"")&&(!p.time||SB_T.test(p.time));
  if(a.type==="add_note")return typeof p.title==="string"&&typeof (p.body??"")==="string";
  if(a.type==="edit_note")return typeof p.body==="string"&&p.body.length<=8000&&(p.title===undefined||(typeof p.title==="string"&&p.title.length<=300));
  if(a.type==="share_note_pdf")return true;
  // contrat figé avec Codex (v76) : {date,time?,name,items:[{name,qty,kcal,p,c,f,g?,unit_g?,unit_label?}]} ; kcal/p/c/f = totaux de la quantité
  if(a.type==="log_meal")return typeof nuLogFromBot==="function"&&SB_D.test(p.date||"")&&(!p.time||SB_T.test(p.time))&&typeof p.name==="string"&&p.name.trim()!==""&&
    Array.isArray(p.items)&&p.items.length>0&&p.items.length<=30&&p.items.every(x=>x&&typeof x.name==="string"&&x.name.trim()&&["kcal","p","c","f"].every(k=>Number.isFinite(+x[k])&&+x[k]>=0&&+x[k]<1e4));
  return false}
function sbApply(a){const p=a.payload;
  if(a.type==="add_task"){const t={id:uid(),title:p.title.trim().slice(0,200),date:p.date,status:"à faire",tbc:false,cat:""};if(p.time)t.time=p.time;
    data.tasks.push(t);save();renderPlan();toast(`${L("Ajouté à l'agenda")} : ${t.title}`);return true}
  if(a.type==="add_note"){const n={id:uid(),title:p.title.trim().slice(0,200),body:String(p.body||"").slice(0,20000),createdAt:new Date().toISOString(),upd:Date.now()};
    if(p.folder&&typeof p.folder==="string")n.folder=p.folder.slice(0,80);NT().push(n);save();renderNotes();toast(`${L("Note créée")} : ${n.title}`);return true}
  if(a.type==="log_meal"){const ok=nuLogFromBot(p);if(ok)toast(`${L("Ajouté au repas")} : ${p.name}`);return !!ok}
  return false}
// v78 : modification de la note jointe — aperçu avant / après, puis « Remplacer » (annulable) ; jamais une note secrète, jamais une autre note
let sbOpenDiff=null;
function sbNoteOf(m){const n=m&&m.noteRef&&typeof noteFind==="function"?noteFind(m.noteRef):null;return n&&!n.secret?n:null}
const sbFmtRich=h=>/<(b|strong|i|em|u|s|mark|span|h2|h3|ul|ol|blockquote|a)\b/i.test(String(h||""));
// Markdown léger proposé par Sid'Bot → HTML de note (nettoyé ensuite par rtClean)
function sbMdToHtml(md){const inl=t=>esc(t).replace(/\*\*(.+?)\*\*/g,"<b>$1</b>").replace(/(^|[^*])\*(?!\s)(.+?)\*(?!\*)/g,"$1<i>$2</i>");
  const out=[];let list=null;const close=()=>{if(list){out.push(`</${list}>`);list=null}};
  for(const raw of String(md||"").split("\n")){const l=raw.replace(/\s+$/,"");let mm;
    if((mm=l.match(/^\s*[-*•]\s+(.*)$/))){if(list!=="ul"){close();out.push("<ul>");list="ul"}out.push(`<li>${inl(mm[1])}</li>`);continue}
    if((mm=l.match(/^\s*\d+[.)]\s+(.*)$/))){if(list!=="ol"){close();out.push("<ol>");list="ol"}out.push(`<li>${inl(mm[1])}</li>`);continue}
    close();if((mm=l.match(/^#{1,3}\s+(.*)$/))){out.push(`<h3>${inl(mm[1])}</h3>`);continue}
    out.push(l?`<div>${inl(l)}</div>`:"<div><br></div>")}
  close();return rtClean(out.join(""))}
// texte brut d'une note (recherche, aperçu) sans dépendre de l'affichage : innerText d'un élément hors page ne donne pas les retours à la ligne
function sbPlain(h){const d=document.createElement("div");d.innerHTML=h;d.querySelectorAll("br").forEach(b=>b.replaceWith("\n"));
  d.querySelectorAll("ol").forEach(o=>[...o.children].forEach((li,i)=>li.prepend(`${i+1}. `)));d.querySelectorAll("ul>li").forEach(li=>li.prepend("- "));
  d.querySelectorAll("div,p,li,h2,h3,blockquote").forEach(e=>e.append("\n"));return d.textContent.replace(/[ \t]+\n/g,"\n").replace(/\n{3,}/g,"\n\n").trim()}
function sbDiff(m,a,i){const n=sbNoteOf(m);if(!n)return `<p class="small muted">${L("La note jointe n'est plus disponible.")}</p>`;
  const nt=a.payload.title!==undefined?String(a.payload.title):n.title||"",nh=sbMdToHtml(a.payload.body);
  return `<div class="sb-diff" role="group" aria-label="${L("Modification proposée")}"><div class="sb-dcol"><span class="eyebrow">${L("Avant")}</span><b class="notr">${esc(n.title||"")}</b><div class="sb-dtxt note-rt notr">${n.html?rtClean(n.html):rtFromText(n.body)}</div></div>
    <div class="sb-dcol"><span class="eyebrow">${L("Après")}</span><b class="notr">${esc(nt)}</b><div class="sb-dtxt note-rt notr">${nh}</div></div>
    ${sbFmtRich(n.html)?`<p class="small muted">${L("La mise en forme actuelle (couleurs, surlignages) sera remplacée par celle proposée.")}</p>`:""}
    <div class="two"><button type="button" class="btn ghost" data-sbdiffno="1">${L("Garder ma note")}</button><button type="button" class="btn" data-sbdiffok="${m.id}:${i}">${L("Remplacer la note")}</button></div></div>`}
function sbEditApply(m,a){const n=sbNoteOf(m);if(!n){toast("La note jointe n'est plus disponible.");return false}
  if(!m.noteFull){toast("La note était trop longue pour être envoyée en entier : Sid'Bot ne peut pas la remplacer.");return false}
  if((n.upd||0)!==m.noteVer){toast("La note a changé depuis ta demande : redemande à Sid'Bot.");return false}
  const old={title:n.title||"",body:n.body||"",html:n.html},nh=sbMdToHtml(a.payload.body),nt=a.payload.title!==undefined?String(a.payload.title).slice(0,300):old.title;
  undoable("Note modifiée",[n.id],()=>{n.title=nt;n.html=nh;n.body=sbPlain(nh);n.upd=Date.now()},
    {after:()=>{if(noteOpenId===n.id&&typeof rtSet==="function"){$("noteTitle").value=n.title;rtSet(n)}renderNotes()},revert:()=>{n.title=old.title;n.body=old.body;if(old.html===undefined)delete n.html;else n.html=old.html;n.upd=Date.now()}});
  return true}
// ---- évènements ----
$("sbForm").addEventListener("submit",e=>{e.preventDefault();sbSend()});
$("sbIn").addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey&&!matchMedia("(pointer:coarse)").matches){e.preventDefault();sbSend()}});
$("sbIn").addEventListener("input",e=>grow(e.target));
$("sbClose").addEventListener("click",sbClose);
$("sbSheet").addEventListener("click",e=>{if(e.target.id==="sbSheet"){sbClose();return}
  const ap=e.target.closest("[data-sbapp]");if(ap){sbApp=ap.dataset.sbapp;sbImg=null;sbRender();return}
  const cx=e.target.closest("[data-sbctx]");if(cx){const p=sbCtxParts(sbApp).find(x=>x.k===cx.dataset.sbctx);if(!p)return;const k=sbSK(sbApp,p);sbShare[k]=!(sbShare[k]??p.on);sbRender();return}
  const sg=e.target.closest("[data-sbsugg]");if(sg){$("sbIn").value=sg.textContent;sbSend();return}
  if(e.target.closest("[data-sbretry]")){const h=sbHist();h[sbApp]=sbMsgs(sbApp).filter(m=>m.role!=="error");sbSave(h);sbSend(true);return}
  if(e.target.closest("#sbImgDel")){sbImg=null;sbRender();return}
  if(e.target.closest("#sbClear")){sbClear(sbApp);sbRender();toast("Conversation effacée de cet appareil");return}
  const ac=e.target.closest("[data-sbact]");if(ac){const [mid,ix]=ac.dataset.sbact.split(":"),h=sbHist(),m=(h[sbApp]||[]).find(x=>x.id===mid),a=m&&m.actions&&m.actions[+ix];
    if(!a||a.done||!sbActOk(a))return;
    if(a.type==="edit_note"){sbOpenDiff=sbOpenDiff===mid+":"+ix?null:mid+":"+ix;sbRender();return}
    if(a.type==="share_note_pdf"){const n=sbNoteOf(m);if(!n){toast("La note jointe n'est plus disponible.");return}noteExportPdf(n).then(()=>{a.done=true;sbSave(h);sbRender()});return}
    if(sbApply(a)){a.done=true;sbSave(h);sbRender()}return}
  if(e.target.closest("[data-sbdiffno]")){sbOpenDiff=null;sbRender();return}
  const dk=e.target.closest("[data-sbdiffok]");if(dk){const [mid,ix]=dk.dataset.sbdiffok.split(":"),h=sbHist(),m=(h[sbApp]||[]).find(x=>x.id===mid),a=m&&m.actions&&m.actions[+ix];
    if(!a||a.done||!sbActOk(a))return;if(sbEditApply(m,a)){a.done=true;sbOpenDiff=null;sbSave(h);sbRender()}}});
// le bouton Sid'Bot du bandeau (même place dans les trois apps)
document.addEventListener("click",e=>{const b=e.target.closest("[data-sidbot]");if(b){e.preventDefault();sbOpen(b.dataset.sidbot||sbAppOfView(data.ui.view))}});
// v76 : anciennes adresses du connecteur (créées avant Sid'Bot) : on peut encore les voir et les retirer, plus en créer
let mcpRows=[];
async function mcpLoad(){const sec=$("mcpOld");if(!sec)return;if(!session||isTrial()){sec.hidden=true;return}
  try{mcpRows=await api("/rest/v1/mcp_tokens?select=hash,created_at,last_used&order=created_at",{token:await token()})||[]}catch(e){mcpRows=[]}
  sec.hidden=!mcpRows.length;const d=v=>v?new Date(v).toLocaleDateString(LANG==="en"?"en-GB":"fr-BE",{day:"numeric",month:"short",year:"numeric"}):"";
  $("mcpList").innerHTML=mcpRows.map(r=>`<div class="row mcp-it"><div class="grow"><b>${esc(L("Adresse du"))} ${esc(d(r.created_at))}</b><span class="small muted">${r.last_used?`${esc(L("Utilisée le"))} ${esc(d(r.last_used))}`:esc(L("Pas encore utilisée"))}</span></div><button type="button" class="btn ghost sm" data-mcpdel="${esc(r.hash)}">${L("Retirer")}</button></div>`).join("")}
$("mcpList").addEventListener("click",async e=>{const b=e.target.closest("[data-mcpdel]");if(!b)return;
  if(!b.dataset.armed){b.dataset.armed="1";b.textContent=L("Confirmer");return}
  try{await api("/rest/v1/mcp_tokens?hash=eq."+encodeURIComponent(b.dataset.mcpdel),{method:"DELETE",token:await token()});toast("Adresse retirée");mcpLoad()}
  catch(ex){toast("Impossible pour l'instant")}});
// v76 (revue Codex) : à la déconnexion ou au changement de compte, la demande en cours est annulée et les choix de partage oubliés
let sbLastUid=null;setInterval(()=>{const u=sbUid();if(sbLastUid!==null&&u!==sbLastUid){if(sbCtl){try{sbCtl.abort()}catch(e){}}sbBusy=false;sbShare={};sbUse={};if(!$("sbSheet").hidden)sbClose()}sbLastUid=u},1000);
