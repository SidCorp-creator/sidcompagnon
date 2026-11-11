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
const SB_ERR={invalid_menu:"Le menu proposé ne respecte pas encore tes repas, leur budget ou la pesée demandée. Précise ta demande puis réessaie. Rien n’a été enregistré.",auth:"Reconnecte-toi pour utiliser Sid'Bot.",quota:"Le quota gratuit de Sid'Bot est épuisé pour aujourd'hui. Il revient demain : rien n'est facturé.",
  rate:"Trop de demandes d'un coup. Réessaie dans un instant.",timeout:"Sid'Bot met trop de temps à répondre. Réessaie.",
  unavailable:"Sid'Bot est indisponible pour l'instant. Réessaie plus tard.",not_configured:"Sid'Bot n'est pas encore activé sur ce serveur.",
  bad_request:"Cette demande n'a pas pu être envoyée. Raccourcis-la ou retire la photo.",offline:"Pas de connexion internet : Sid'Bot a besoin du réseau.",
  trial:"Mode essai : crée ton compte pour utiliser Sid'Bot."};
// compatibilité : plus aucune IA externe à brancher (anciennes préférences ai / aiOk / aiConv laissées telles quelles dans les données)
const AIS={},aiCur=()=>null;
let sbApp="journee",sbBusy=false,sbImg=null,sbCtl=null,sbUse={},sbShare={},sbMenuRequest=null;
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
      {k:"muscu",label:"Ton programme de musculation",on:true,v:{goal:pr.goal||"",days:pr.days||null,minutes:pr.dur||null,name:pl&&pl.name?String(pl.name).slice(0,80):""}},...(sbMenuRequest&&n.menuRequest?.id===sbMenuRequest.id?[{k:"menu_request",label:"Le menu demandé",on:true,v:sbMenuRequest}]:[])]}
  if(app==="note"){const n=typeof noteOpenId!=="undefined"&&noteOpenId&&typeof noteFind==="function"?noteFind(noteOpenId):null;
    // une note secrète n'est jamais jointe, même déverrouillée
    if(n&&!n.secret&&!$("noteEdit").hidden)return [{k:"note",sk:"note:"+n.id,label:"La note ouverte",on:false,v:(()=>{const ti=String(n.title||""),bo=String(n.body||""),complete=ti.length<=200&&bo.length<=8000;return {title:ti.slice(0,200),body:bo.slice(0,complete?8000:6000),complete}})()}]; // v78 : complete=true seulement si la note entière part (sinon pas de modification possible)
    return []}
  return []}
// choix « partager » : par compte, par app et (pour une note) par note : joindre une note ne joint pas la suivante
const sbSK=(app,p)=>sbUid()+":"+app+":"+(p.sk||p.k);
function sbContext(app){const out={today:iso(today())};for(const p of sbCtxParts(app))if(sbShare[sbSK(app,p)]??p.on)out[p.k]=p.v;return out}
// ---- ouverture ----
function sbOpen(app,opt){opt=opt||{};if(app==="note"){ncOpen(opt.prompt);return} // v81 : Sid'Note → Claude (connecteur), sans la clé de Sid'Bot
  sbMenuRequest=opt.menuRequest||null;sbApp=SB_APPS[app]?app:"journee";sbImg=opt.img||null;
  $("sbSheet").hidden=false;sbRender();
  const i=$("sbIn");if(opt.prompt){i.value=opt.prompt;grow(i);if(opt.send){sbSend();return}}
  setTimeout(()=>{if(!matchMedia("(pointer:coarse)").matches)i.focus({preventScroll:true})},80)}
function sbClose(){$("sbSheet").hidden=true;if(sbCtl){try{sbCtl.abort()}catch(e){}}}
// anciens points d'entrée (Agenda, Musculation, Nutrition, Notes) : la demande arrive dans Sid'Bot, déjà écrite, envoyée d'un toucher
function aiHandoff(prompt,topic,opt){sbOpen(SB_TOPIC[topic]||sbAppOfView(data.ui.view),{prompt,img:opt&&opt.img,send:!!(opt&&opt.send),menuRequest:opt&&opt.menuRequest})}
function aiGo(topic,prompt,quiet){aiHandoff(prompt,topic);return ""}
const convUrl=()=>"",convTabs=()=>{},renderConv=()=>{};
function aiWizard(){sbOpen(sbAppOfView(data.ui.view))}
function renderAiCards(){const c=$("nuAiCard");if(c)c.hidden=true;const st=$("sbState");if(st)st.textContent=sbUse.limit?`${L("Aujourd'hui")} : ${sbUse.used} / ${sbUse.limit} ${L("demandes")}`:""}
// ---- affichage ----
function sbMenuPreview(a){return (a.payload.meals||[]).map(m=>`<b>${esc(m.name)} · ${Math.round(m.items.reduce((t,x)=>t+x.kcal,0))} kcal</b><br>${m.items.map(x=>`${esc(x.name)} · ${esc(qtyTxt(x))} · ${Math.round(x.kcal)} kcal${x.yield_source?" · "+esc(x.yield_source):""}`).join("<br>")}`).join("<br><br>")}
function sbBubble(m){if(m.role==="user")return `<div class="sb-msg me notr">${esc(m.content)}${m.img?`<span class="sb-att">${IC("image")||""} ${L("Photo jointe")}</span>`:""}</div>`;
  if(m.role==="error")return `<div class="sb-msg err" role="alert">${IC("alert")||""}<span>${esc(L(m.content))}</span>${m.retry?`<button type="button" class="linkbtn" data-sbretry="1">${L("Réessayer")}</button>`:""}</div>`;
  const acts=(m.actions||[]).map((a,i)=>`<div class="sb-act" data-done="${a.done?1:0}"><span class="grow notr">${a.type==="save_menu"?sbMenuPreview(a):esc(a.label||sbActLabel(a))}</span>${a.done?`<span class="sb-ok">${IC("tick")||""}${L(a.type==="save_menu"?"Menu enregistré":a.type==="edit_note"?"Note modifiée":a.type==="share_note_pdf"?"Exporté":"Ajouté")}</span>`:`<button type="button" class="btn ghost sm" data-sbact="${m.id}:${i}">${L(sbActVerb(a))}</button>`}</div>${sbOpenDiff===m.id+":"+i&&!a.done?sbDiff(m,a,i):""}`).join("");
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
const sbActVerb=a=>a.type==="add_task"?"Ajouter à l'agenda":a.type==="add_note"?"Créer la note":a.type==="save_menu"?"Enregistrer le menu":a.type==="log_meal"?"Ajouter au repas":a.type==="edit_note"?"Voir la modification":a.type==="share_note_pdf"?"Exporter en PDF":"Appliquer";
const sbActLabel=a=>{const p=a.payload||{};if(a.type==="save_menu")return (p.meals||[]).map(m=>m.name+" : "+(m.items||[]).map(x=>`${x.name} ${qtyTxt(x)} (${x.kcal} kcal)`).join(", ")+" · "+Math.round((m.items||[]).reduce((t,x)=>t+x.kcal,0))+" kcal").join(" ; ");return a.type==="add_task"?`${p.title||""} · ${p.date||""}${p.time?" "+p.time:""}`:a.type==="add_note"?String(p.title||""):a.type==="edit_note"?L("Modifier la note ouverte"):a.type==="share_note_pdf"?L("La note ouverte, en PDF"):a.type==="log_meal"?`${p.name||""} · ${Math.round((p.items||[]).reduce((t,x)=>t+(+x.kcal||0),0))} kcal`:String(p.name||p.title||"")};
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
  sbBusy=true;sbRender();const ctl=sbCtl=new AbortController();const tm=setTimeout(()=>{try{ctl.abort()}catch(e){}},sbMenuRequest?80000:SB_TIMEOUT);
  try{// revue Codex : jeton et contexte figés pour le même compte que l'historique, vérifiés avant l'envoi
    const jwt=await token();if(!same()){clearTimeout(tm);sbBusy=false;return}const ctx=sbContext(app);
    const noteRef=ctx.note&&typeof noteOpenId!=="undefined"&&noteOpenId?noteOpenId:null,noteN=noteRef?noteFind(noteRef):null,noteVer=noteN?noteN.upd||0:0; // v78 : seule la note jointe, dans sa version envoyée
    const r=await fetch(SUPABASE_URL+"/functions/v1/sidbot",{method:"POST",signal:ctl.signal,
      headers:{apikey:SUPABASE_KEY,"Content-Type":"application/json",Authorization:"Bearer "+jwt},
      body:JSON.stringify({app,task:ctx.menu_request?"menu":"chat",locale:LANG==="en"?"en":"fr",messages:hist,context:ctx})});
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
  if(a.type==="save_menu"){try{if(!NU().menuRequest)return false;nutritionMenu.menu(p,NU().menuRequest);return true}catch{return false}}
  if(a.type==="add_task")return typeof p.title==="string"&&p.title.trim()&&SB_D.test(p.date||"")&&(!p.time||SB_T.test(p.time));
  if(a.type==="add_note")return typeof p.title==="string"&&typeof (p.body??"")==="string";
  if(a.type==="edit_note")return typeof p.body==="string"&&p.body.length<=8000&&(p.title===undefined||(typeof p.title==="string"&&p.title.length<=300));
  if(a.type==="share_note_pdf")return true;
  // contrat figé avec Codex (v76) : {date,time?,name,items:[{name,qty,kcal,p,c,f,g?,unit_g?,unit_label?}]} ; kcal/p/c/f = totaux de la quantité
  if(a.type==="log_meal")return typeof nuLogFromBot==="function"&&SB_D.test(p.date||"")&&(!p.time||SB_T.test(p.time))&&typeof p.name==="string"&&p.name.trim()!==""&&
    Array.isArray(p.items)&&p.items.length>0&&p.items.length<=30&&p.items.every(x=>x&&typeof x.name==="string"&&x.name.trim()&&["kcal","p","c","f"].every(k=>Number.isFinite(+x[k])&&+x[k]>=0&&+x[k]<1e4));
  return false}
function sbApply(a){const p=a.payload;
  if(a.type==="save_menu"){const ok=nuSaveMenu(p);if(ok){sbMenuRequest=null;toast(L("Menu enregistré"))}return ok}
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
  const ap=e.target.closest("[data-sbapp]");if(ap){if(ap.dataset.sbapp==="note"){sbClose();ncOpen();return}sbApp=ap.dataset.sbapp;sbImg=null;sbRender();return}
  const cx=e.target.closest("[data-sbctx]");if(cx){const p=sbCtxParts(sbApp).find(x=>x.k===cx.dataset.sbctx);if(!p)return;const k=sbSK(sbApp,p);sbShare[k]=!(sbShare[k]??p.on);sbRender();return}
  const sg=e.target.closest("[data-sbsugg]");if(sg){$("sbIn").value=sg.textContent;sbSend();return}
  if(e.target.closest("[data-sbretry]")){const h=sbHist();h[sbApp]=sbMsgs(sbApp).filter(m=>m.role!=="error");sbSave(h);sbSend(true);return}
  if(e.target.closest("#sbImgDel")){sbImg=null;sbRender();return}
  if(e.target.closest("#sbClear")){sbClear(sbApp);sbRender();toast("Conversation effacée de cet appareil");return}
  const ac=e.target.closest("[data-sbact]");if(ac){const [mid,ix]=ac.dataset.sbact.split(":"),h=sbHist(),m=(h[sbApp]||[]).find(x=>x.id===mid),a=m&&m.actions&&m.actions[+ix];
    if(!a||a.done||!sbActOk(a))return;
    if(a.type==="edit_note"){sbOpenDiff=sbOpenDiff===mid+":"+ix?null:mid+":"+ix;sbRender();return}
    if(a.type==="share_note_pdf"){const n=sbNoteOf(m);if(!n){toast("La note jointe n'est plus disponible.");return}const u0=sbUid(),app0=sbApp;
      noteExportPdf(n).then(ok=>{if(!ok||sbUid()!==u0)return;const h2=sbHist(u0),m2=(h2[app0]||[]).find(x=>x.id===mid),a2=m2&&m2.actions&&m2.actions[+ix];if(a2){a2.done=true;sbSave(h2,u0)}sbRender()});return} // revue Codex : compte figé, « Exporté » seulement si réussi
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
let sbLastUid=null;setInterval(()=>{const u=sbUid();if(sbLastUid!==null&&u!==sbLastUid){if(sbCtl){try{sbCtl.abort()}catch(e){}}sbBusy=false;sbShare={};sbMenuRequest=null;sbUse={};if(!$("sbSheet").hidden)sbClose();ncClose();ncReset()}sbLastUid=u},1000);

/* ---------- v81 (demande de Sid) : depuis Sid'Note, Sid'Bot redirige vers Claude, comme avant la v76 ----------
   Plus aucun appel à la fonction « sidbot » (ni à sa clé API) depuis Sid'Note. Claude lit et modifie les notes par le connecteur
   Sid'Note (fonction « mcp », adresse personnelle sidcompagnon.com/mcp/<clé>, empreinte dans mcp_tokens) ; les PDF et photos joints sont lus
   par lire_note. Raccourci d'origine (v40) : la fenêtre « Ajouter un connecteur personnalisé » de Claude s'ouvre déjà remplie.
   Branchement confirmé quand Claude a utilisé l'adresse (mcp_tokens.last_used → data.prefs.aiOk). Jamais de note secrète dans le lien. */
const NC_MCP="https://sidcompagnon.com/mcp/";
const NC={ask:q=>"https://claude.ai/new"+(q?"?q="+encodeURIComponent(q):""),
  add:u=>"https://claude.ai/customize/connectors?modal=add-custom-connector&connectorName="+encodeURIComponent(MARQUES.note)+"&connectorUrl="+encodeURIComponent(u)};
let ncW={uid:"",url:"",hash:"",busy:false,err:"",poll:null,prompt:"",linked:null};
// relecture Codex : tout l'état du raccourci appartient à un compte ; il est oublié au changement de compte ou à la déconnexion
function ncReset(){if(ncW.poll)clearInterval(ncW.poll);$("ncBody")?.replaceChildren();ncW={uid:sbUid(),url:"",hash:"",busy:false,err:"",poll:null,prompt:"",linked:null}}
const ncHex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("");
const ncKey=()=>{const a=crypto.getRandomValues(new Uint8Array(32));let s="";for(const x of a)s+=String.fromCharCode(x);return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")};
async function ncCreate(){
  const owner=sbUid(),key=ncKey(),hash=ncHex(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(key)));
  const access=await token();
  if(sbUid()!==owner)throw new Error("Compte changé");
  await api("/rest/v1/mcp_tokens",{method:"POST",token:access,headers:{Prefer:"return=minimal"},body:{hash,user_id:owner,label:"Claude"}});
  return {url:NC_MCP+key,hash}}
// note ouverte (jamais secrète) : Claude la lira par le connecteur, avec ses pièces jointes
function ncNotePrompt(){if(data.ui.view!=="notes"||$("noteEdit").hidden)return "";const n=typeof noteOpenId!=="undefined"&&noteOpenId&&typeof noteFind==="function"?noteFind(noteOpenId):null;
  if(!n||n.secret)return "";const t=String(n.title||"").trim().slice(0,120)||L("Note sans titre");
  return T3(`Ouvre ma note « ${t} » (id ${n.id}) dans ${MARQUES.note} avec lire_note (pièces jointes comprises). `,`Open my note “${t}” (id ${n.id}) in ${MARQUES.note} with lire_note (attachments included). `)}
function ncSheet(){let el=$("ncSheet");if(el)return el;el=document.createElement("div");el.className="sheet-bg";el.id="ncSheet";el.hidden=true;
  el.innerHTML=`<div class="sheet card nc-sheet" role="dialog" aria-modal="true" aria-labelledby="ncTitle"><div class="sheet-head"><b id="ncTitle" class="notr"></b><button type="button" class="x" id="ncClose" aria-label="${esc(L("Fermer"))}"><span class="gi gi-close" aria-hidden="true"></span></button></div><div id="ncBody"></div></div>`;
  document.body.appendChild(el);
  el.addEventListener("click",e=>{if(e.target===el||e.target.closest("#ncClose")){ncClose();return}
    if(e.target.closest("[data-ncadd]")){setTimeout(()=>{if(!ncW.poll)ncW.poll=setInterval(ncCheck,3000)},800);return}
    if(e.target.closest("[data-ncnew]")){ncW.url="";ncW.hash="";ncW.linked=false;ncNew();return}
    if(e.target.closest("[data-nccopy]")){navigator.clipboard.writeText(ncW.url).then(()=>toast("Adresse copiée"),()=>toast("Copie impossible : sélectionne-la et copie-la"));return}});
  return el}
function ncClose(){const el=$("ncSheet");if(el)el.hidden=true;if(ncW.poll){clearInterval(ncW.poll);ncW.poll=null}}
function ncNew(){if(ncW.busy||!session||isTrial())return;const w=ncW,u=sbUid();w.busy=true;w.err="";ncRender();
  ncCreate().then(r=>{if(ncW===w&&sbUid()===u){w.url=r.url;w.hash=r.hash;w.linked=false;if(!w.poll)w.poll=setInterval(ncCheck,3000)}})
    .catch(ex=>{if(ncW===w)w.err=ex instanceof TypeError?"Pas de connexion internet":"Création impossible pour l'instant"}).finally(()=>{w.busy=false;if(ncW===w)ncRender()})}
function ncRender(){const b=$("ncBody");if(!b)return;const ok=ncW.linked===true,q=ncW.prompt;
  $("ncTitle").textContent=`${MARQUES.bot} · Claude`;
  const conn=ok?`<div class="ai-wait"><b class="ok">${GI("tick")} ${esc(L("Connecteur Sid'Note branché sur Claude"))}</b></div><button type="button" class="btn ghost" data-ncnew="1" style="width:100%;margin-top:8px">${esc(L("Rebrancher le connecteur"))}</button>`
    :ncW.linked===null?`<button type="button" class="btn ghost" disabled style="width:100%;margin-top:8px">${esc(L("Vérification…"))}</button>`
    :ncW.url?`<a class="btn ghost" href="${esc(NC.add(ncW.url))}" target="_blank" rel="noopener" data-ncadd="1" style="width:100%;margin-top:8px">${esc(L("Ajouter le connecteur Sid'Note à Claude"))}</a>
      <div class="small muted" style="margin-top:6px">${esc(L("Claude s'ouvre avec Sid'Note déjà rempli : touche simplement « Ajouter », puis reviens ici."))}</div>
      <details class="ai-more"><summary class="small">${esc(L("Voir mon adresse (si besoin)"))}</summary><div class="mcp-url notr">${esc(ncW.url)}</div><button type="button" class="btn ghost" data-nccopy="1" style="width:100%;margin-top:8px">${esc(L("Copier l'adresse"))}</button></details>`
    :`<button type="button" class="btn ghost" disabled style="width:100%;margin-top:8px">${esc(L(ncW.err||"Préparation du raccourci…"))}</button>${ncW.err?`<button type="button" class="btn ghost" data-ncnew="1" style="width:100%;margin-top:8px">${esc(L("Réessayer"))}</button>`:""}`;
  b.innerHTML=`<p class="small muted">${esc(L("Pour tes notes, Sid'Bot passe la main à Claude. Claude lit tes notes et leurs PDF par le connecteur Sid'Note ; les notes secrètes ne sont jamais accessibles."))}</p>
    ${q?`<div class="ai-prompt notr">${esc(q)}</div>`:""}
    <a class="btn" href="${esc(NC.ask(q))}" target="_blank" rel="noopener" id="ncGo" style="width:100%;margin-top:8px">${esc(L("Ouvrir Claude"))}</a>
    <div class="ai-step" style="margin-top:14px"><b>${esc(L("Raccourci du connecteur Sid'Note"))}</b>${conn}</div>`}
// branché = une adresse de ce compte a déjà été utilisée par Claude (mcp_tokens.last_used), vérifié à chaque ouverture
async function ncCheck(){const w=ncW,u=sbUid();if(!$("ncSheet")||$("ncSheet").hidden){if(w.poll){clearInterval(w.poll);w.poll=null}return}
  try{const r=await api(`/rest/v1/mcp_tokens?select=last_used${w.hash?`&hash=eq.${w.hash}`:""}&last_used=not.is.null&limit=1`,{token:await token()});
    if(ncW!==w||sbUid()!==u)return;const on=Array.isArray(r)&&r.length>0;
    if(on){if(w.poll){clearInterval(w.poll);w.poll=null}if(w.hash){data.prefs.aiOk=new Date().toISOString();data.prefs.ai="claude";save()}w.hash="";w.url=""}
    const first=w.linked===null;w.linked=on;ncRender();if(first&&!on&&!w.url)ncNew()}catch(e){if(ncW===w&&w.linked===null){w.linked=false;ncRender();if(!w.url)ncNew()}}}
function ncOpen(prompt){if(ncW.uid!==sbUid())ncReset();const el=ncSheet();ncW.prompt=String(prompt||"")||ncNotePrompt();el.hidden=false;ncRender();
  if(ncW.url){if(!ncW.poll)ncW.poll=setInterval(ncCheck,3000)}else{ncW.linked=null;ncRender();ncCheck()}}
