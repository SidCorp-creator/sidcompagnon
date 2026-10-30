/* ---------- v37 : listes partagées entre proches ---------- */
// Tables Supabase shared_lists / shared_members / shared_items (supabase/sql/v37.sql) ; chacun ne voit que ses listes.
// Pas de copie dans data : c'est en ligne seulement, rechargé à l'ouverture et toutes les 15 s tant que la page est ouverte.
let slLists=[],slOpen=null,slItems=[],slErr="",slForm="",slArmed="";
const slMe=()=>String((session&&session.name)||L("Moi")).slice(0,40);
async function slApi(path,o){return api(path,{...(o||{}),token:await token()})}
const slErrMsg=e=>e instanceof TypeError||!navigator.onLine?L("Pas de connexion internet : les listes partagées ont besoin d'internet."):/Code inconnu/.test(e.message)?L("Ce code ne correspond à aucune liste."):(e.message||L("Erreur"));
async function slLoad(){if(!session||isTrial())return renderLists();
  try{slLists=await slApi("/rest/v1/shared_lists?select=id,name,owner,code,shared_members(user_id,name),shared_items(id,done)&order=created_at.asc")||[];slErr="";
    if(slOpen&&!slLists.some(l=>l.id===slOpen)){slOpen=null;slItems=[]}
    if(slOpen)slItems=await slApi(`/rest/v1/shared_items?select=id,text,done,by_name,created_at&list_id=eq.${slOpen}&order=created_at.asc`)||[]}
  catch(e){slErr=slErrMsg(e)}
  renderLists()}
async function slEnter(){renderLists();const c=ls.get("sidnote-join");if(c&&session&&!isTrial()){ls.del("sidnote-join");await slJoin(c)}else slLoad()}
setInterval(()=>{if(data.ui.view==="lists"&&!document.hidden&&!isTyping())slLoad()},15000);
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&data.ui.view==="lists")slLoad()});
function renderLists(){const el=$("slBody");if(!el)return;
  if(!session||isTrial()){el.innerHTML=`<div class="card empty-card"><p>${L("Crée ton compte pour partager des listes avec tes proches.")}</p><button type="button" class="btn" data-trialacc="1">${L("Créer mon compte")}</button></div>`;return}
  const err=slErr?`<p class="err" role="alert">${esc(slErr)}</p>`:"";
  const l=slOpen&&slLists.find(x=>x.id===slOpen);
  if(l){const mine=l.owner===session.user.id,todo=slItems.filter(i=>!i.done),done=slItems.filter(i=>i.done);
    const row=i=>`<div class="row sl-it ${i.done?"done":""}"><button class="check" data-sltg="${i.id}" aria-label="${L(i.done?"Remettre à faire":"Cocher")}">${i.done?CHECK:""}</button>
      <div class="grow"><span class="ttl notr">${esc(i.text)}</span>${i.by_name?`<span class="small muted notr"> · ${esc(i.by_name)}</span>`:""}</div>
      <button class="x" data-sldel="${i.id}" aria-label="${L("Supprimer")}">×</button></div>`;
    el.innerHTML=`<button type="button" class="linkbtn sl-back" data-slback="1">‹ ${L("Toutes les listes")}</button>
      <h2 class="notr sl-name">${esc(l.name)}</h2>${err}
      <form class="addbar" id="slAdd"><input id="slIn" placeholder="${L("Ajouter un élément…")}" aria-label="${L("Ajouter un élément")}" autocomplete="off" maxlength="200"><button class="btn" type="submit">${L("Ajouter")}</button></form>
      <div class="card">${todo.length?todo.map(row).join(""):`<div class="empty">${L(slItems.length?"Tout est coché.":"La liste est vide. Ajoute le premier élément.")}</div>`}</div>
      ${done.length?`<div class="sl-done-h"><span class="eyebrow">${L("Cochés")} (${done.length})</span><button type="button" class="mini" data-slclear="1">${L("Retirer les cochés")}</button></div><div class="card">${done.map(row).join("")}</div>`:""}
      <div class="card sl-share"><div class="row"><div class="grow"><b>${L("Code d'invitation")}</b><div class="sl-code notr">${esc(l.code)}</div><div class="small muted">${L("Avec")} : <span class="notr">${esc((l.shared_members||[]).map(m=>m.user_id===session.user.id?L("toi"):(m.name||"?")).join(", "))}</span></div></div>
        <button type="button" class="btn" data-slinvite="1">${L("Inviter")}</button></div></div>
      <button type="button" class="btn stop sl-leave" data-slleave="1">${L(slArmed==="leave"?(mine?"Supprimer pour tout le monde ? Touche encore":"Quitter ? Touche encore"):(mine?"Supprimer la liste":"Quitter la liste"))}</button>`;
    return}
  el.innerHTML=`${err}<div class="sl-acts"><button type="button" class="btn" data-slnew="1">+ ${L("Nouvelle liste")}</button><button type="button" class="btn ghost" data-sljoin="1">${L("Rejoindre avec un code")}</button></div>
    ${slForm==="new"?`<form class="addbar" id="slNewForm"><input id="slNewIn" placeholder="${L("Nom de la liste, ex. Courses")}" aria-label="${L("Nom de la liste")}" autocomplete="off" maxlength="80"><button class="btn" type="submit">${L("Créer")}</button></form>`:""}
    ${slForm==="join"?`<form class="addbar" id="slJoinForm"><input id="slJoinIn" placeholder="${L("Code à 6 caractères")}" aria-label="${L("Code d'invitation")}" autocomplete="off" autocapitalize="characters" maxlength="6"><button class="btn" type="submit">${L("Rejoindre")}</button></form>`:""}
    <div class="card">${slLists.length?slLists.map(x=>{const left=(x.shared_items||[]).filter(i=>!i.done).length,n=(x.shared_members||[]).length;
      return `<button type="button" class="sp-row" data-slopen="${x.id}"><span class="sp-ic">${ICON("lists")}</span><span class="grow"><b class="notr">${esc(x.name)}</b><span class="small muted"> ${left} ${L(left>1?"à faire":"à faire")} · ${n} ${L(n>1?"personnes":"personne")}</span></span>${CHEVR}</button>`}).join("")
      :`<div class="empty">${L("Aucune liste partagée pour l'instant. Crée-en une, puis invite tes proches avec son code.")}</div>`}</div>`;
  const f=$("slNewIn")||$("slJoinIn");if(f)setTimeout(()=>f.focus(),50)}
async function slJoin(code){try{const id=await slApi("/rest/v1/rpc/join_shared_list",{method:"POST",body:{p_code:String(code).trim().toUpperCase(),p_member_name:slMe()}});
  slForm="";slOpen=id;await slLoad();const l=slLists.find(x=>x.id===id);toast(l?`${L("Tu as rejoint")} « ${l.name} »`:L("Liste rejointe"))}catch(e){slErr=slErrMsg(e);renderLists()}}
$("slBody").addEventListener("submit",async e=>{e.preventDefault();const f=e.target;
  if(f.id==="slAdd"){const v=$("slIn").value.trim();if(!v||!slOpen)return;$("slIn").value="";
    const tmp={id:"tmp"+uid(),text:v,done:false,by_name:slMe()};slItems.push(tmp);renderLists();$("slIn").focus();
    try{await slApi("/rest/v1/shared_items",{method:"POST",headers:{Prefer:"return=minimal"},body:{list_id:slOpen,text:v.slice(0,200),by_name:slMe()}});await slLoad();$("slIn")&&$("slIn").focus()}
    catch(ex){slItems=slItems.filter(i=>i!==tmp);slErr=slErrMsg(ex);renderLists()}}
  else if(f.id==="slNewForm"){const v=$("slNewIn").value.trim();if(!v)return;
    try{const id=await slApi("/rest/v1/rpc/create_shared_list",{method:"POST",body:{p_name:v.slice(0,80),p_member_name:slMe()}});slForm="";slOpen=id;await slLoad();toast("Liste créée : invite tes proches avec son code")}
    catch(ex){slErr=slErrMsg(ex);renderLists()}}
  else if(f.id==="slJoinForm"){const v=$("slJoinIn").value.trim();if(v.length<4)return;await slJoin(v)}});
$("slBody").addEventListener("click",async e=>{const b=e.target.closest("button");if(!b)return;const d=b.dataset;
  if(d.slback){slOpen=null;slItems=[];slArmed="";renderLists();slLoad()}
  else if(d.slopen){slOpen=d.slopen;slArmed="";slItems=[];renderLists();slLoad()}
  else if(d.slnew||d.sljoin){slForm=slForm===(d.slnew?"new":"join")?"":(d.slnew?"new":"join");slErr="";renderLists()}
  else if(d.sltg){const i=slItems.find(x=>x.id===d.sltg);if(!i||String(i.id).startsWith("tmp"))return;i.done=!i.done;renderLists();if(navigator.vibrate)navigator.vibrate(10);
    try{await slApi(`/rest/v1/shared_items?id=eq.${i.id}`,{method:"PATCH",headers:{Prefer:"return=minimal"},body:{done:i.done,updated_at:new Date().toISOString()}})}catch(ex){i.done=!i.done;slErr=slErrMsg(ex);renderLists()}}
  else if(d.sldel){const id=d.sldel;slItems=slItems.filter(x=>x.id!==id);renderLists();
    try{await slApi(`/rest/v1/shared_items?id=eq.${id}`,{method:"DELETE"})}catch(ex){slErr=slErrMsg(ex);slLoad()}}
  else if(d.slclear){const ids=slItems.filter(x=>x.done);slItems=slItems.filter(x=>!x.done);renderLists();
    try{await slApi(`/rest/v1/shared_items?list_id=eq.${slOpen}&done=eq.true`,{method:"DELETE"});toast(`${ids.length} ${L(ids.length>1?"éléments retirés":"élément retiré")}`)}catch(ex){slErr=slErrMsg(ex);slLoad()}}
  else if(d.slinvite){const l=slLists.find(x=>x.id===slOpen);if(!l)return;
    const txt=`${L("Rejoins ma liste")} « ${l.name} » ${L("sur Sid'compagnon avec le code")} ${l.code} : ${location.origin}/#rejoindre=${l.code}`;
    try{if(navigator.share){await navigator.share({title:"Sid'compagnon",text:txt});return}}catch(ex){if(ex.name==="AbortError")return}
    toast(await copyTxt(txt)?L("Invitation copiée : colle-la dans un message"):`${L("Code")} : ${l.code}`,5000)}
  else if(d.slleave){if(slArmed!=="leave"){slArmed="leave";renderLists();setTimeout(()=>{if(slArmed==="leave"){slArmed="";renderLists()}},4000);return}
    const l=slLists.find(x=>x.id===slOpen);if(!l)return;slArmed="";
    try{if(l.owner===session.user.id)await slApi(`/rest/v1/shared_lists?id=eq.${l.id}`,{method:"DELETE"});
      else await slApi(`/rest/v1/shared_members?list_id=eq.${l.id}&user_id=eq.${session.user.id}`,{method:"DELETE"});
      slOpen=null;slItems=[];await slLoad();toast(l.owner===session.user.id?"Liste supprimée":"Tu as quitté la liste")}catch(ex){slErr=slErrMsg(ex);renderLists()}}});
// lien d'invitation : <adresse du site>/#rejoindre=CODE (gardé jusqu'à la connexion si besoin)
function slFromHash(){const m=location.hash.match(/rejoindre=([A-Za-z0-9]{4,8})/);if(!m)return false;ls.set("sidnote-join",m[1].toUpperCase());history.replaceState(null,"",location.pathname+location.search);return true}
slFromHash();
addEventListener("hashchange",()=>{if(slFromHash()&&session&&!isTrial())show("lists")}); // lien ouvert alors que l'app l'est déjà
