/* ---------- Réglages ---------- */
function renderStats(){
  const td=data.todos,tk=data.tasks;
  // v62 (#3) : Réglages et petites fenêtres dessinés par React (app/src/Settings.tsx) ; ancien rendu en secours
  if(shIsl("stats")){try{window.SCIslands.stats($("stats"),{i18n:agI18n(),rows:[["Tâches réalisées",`${td.filter(t=>t.done).length} / ${td.length}`],["Dates du planning terminées",`${tk.filter(t=>t.status==="fait").length} / ${tk.length}`],["Dates encore à confirmer",tk.filter(t=>t.tbc).length]]});return}catch(e){reportErr("island stats: "+(e&&e.message))}}
  $("stats").innerHTML=[
    ["Tâches réalisées",`${td.filter(t=>t.done).length} / ${td.length}`],
    ["Dates du planning terminées",`${tk.filter(t=>t.status==="fait").length} / ${tk.length}`],
    ["Dates encore à confirmer",tk.filter(t=>t.tbc).length]
  ].map(([a,b])=>`<div class="row"><div class="grow">${a}</div><b style="font-variant-numeric:tabular-nums">${b}</b></div>`).join("");
}
// v33 : une seule sauvegarde, complète et versionnée (tout le compte, sauf les fichiers des documents)
// {app:"sidnote", v:2, exported, data} ; l'ancien format (v1 : tâches et agenda seulement) se restaure encore
async function saveJSON(obj,name,title){
  const file=new File([JSON.stringify(obj,null,1)],name,{type:"application/json"});
  try{if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title});return}}catch(e){if(e.name==="AbortError")return}
  const a=document.createElement("a");a.href=URL.createObjectURL(file);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000)}
const bkObj=extra=>({app:"sidnote",v:2,exported:new Date().toISOString(),...(extra||{}),data:forServer(data)});
$("backupBtn").addEventListener("click",()=>saveJSON(bkObj(),`sidnote-sauvegarde-${new Date().toISOString().slice(0,10)}.json`,L("Sauvegarde Sid'note")));
// RGPD : export complet (JSON) et suppression des données du compte
$("exportAllBtn").addEventListener("click",()=>saveJSON(bkObj({account:{email:session&&session.email,id:session&&session.user.id}}),`sidnote-mes-donnees-${new Date().toISOString().slice(0,10)}.json`,L("Mes données Sid'compagnon")));
$("wipeBtn").addEventListener("click",async e=>{
  const b=e.currentTarget;
  if(!b.dataset.armed){b.dataset.armed="1";b.textContent=L("Tout effacer ? Toucher encore pour confirmer");setTimeout(()=>{delete b.dataset.armed;b.textContent=L("Supprimer mes données")},4000);return}
  if(!confirm(L("Tout ce que tu as mis dans Sid'compagnon sera effacé, sur tous tes appareils. C'est définitif. Continuer ?")))return;
  b.disabled=true;b.textContent="…";
  try{
    const t=await token(),u=session.user.id;
    for(const d of docsArr())if(d.up||d.path){try{await stor("DELETE","documents/"+(d.path||docPath(d)))}catch(x){}}
    await dropSub().catch(()=>{});
    const fresh={...blank(),wipe:new Date().toISOString()},rev=new Date().toISOString();
    await api("/rest/v1/user_data?on_conflict=user_id",{method:"POST",token:t,headers:{Prefer:"resolution=merge-duplicates,return=minimal"},body:{user_id:u,data:forServer(fresh),updated_at:rev}});
    await idbClearUser(u);ls.del("sidnote-ical-"+u);ls.del("sidnote-icalauth-"+u);ls.del(cacheKey(u));ls.del("sidnote-mk-"+u);ls.del("sidnote-bio-"+u);
    toast(L("Tes données ont été supprimées"));
    try{api("/auth/v1/logout",{method:"POST",token:session.access_token}).catch(()=>{})}catch(x){}
    setTimeout(()=>endSession("",false),900);
  }catch(ex){b.disabled=false;delete b.dataset.armed;b.textContent=L("Supprimer mes données");toast(ex instanceof TypeError?L("Pas de connexion internet"):L("Suppression impossible : ")+(ex.message||""))}
});
// restauration : aperçu, puis Fusionner (rien n'est perdu) ou Remplacer (confirmation), sans jamais casser les coffres
const BK_LISTS=[["pdfAnns","Annotations de PDF"],["todos","Tâches"],["tasks","Activités de l'agenda"],["notes","Notes"],["muscu.sessions","Séances de musculation"],["muscu.log","Séances faites (programme)"],["nutri.log","Repas notés"],["pwds","Mots de passe"],["docs","Documents (la liste)"],["todoCats",null],["docFolders",null],["noteFolders",null],["nutri.weights",null],["nutri.weeks",null]];
const bkGet=(d,k)=>{const v=k.split(".").reduce((o,x)=>o&&o[x],d);return Array.isArray(v)?v.filter(x=>x&&x.id):[]};
function bkParse(j){
  if(j&&typeof j==="object"&&j.data&&typeof j.data==="object"&&/^(sidnote|Sid'note)$/.test(j.app||""))return {d:j.data,at:j.exported};
  if(j&&Array.isArray(j.todos)&&Array.isArray(j.tasks))return {d:{todos:j.todos,tasks:j.tasks,types:j.types,courses:j.courses,todoCats:j.todoCats},at:null,v1:true}; // ancien format
  return null}
// copie nettoyée de la sauvegarde : jamais ses suppressions ni son effacement, et les coffres de ce compte gardés tels quels
function bkPrepare(src){const d=JSON.parse(JSON.stringify(src));delete d.ui;delete d.wipe;delete d.del;delete d.res;let skipped=0;
  const drop=(lk,keep)=>{const a=bkGet(d,lk),b=a.filter(keep);skipped+=a.length-b.length;if(lk==="pwds")d.pwds=b;else d.notes=b};
  const phx=data.phx||d.phx||null,phxOk=v=>!isV2(v)||!!(phx&&d.phx&&phx.id===d.phx.id);
  for(const [vk,lk,secret] of /** @type {[string,string,boolean][]} */([["vault","pwds",false],["noteVault","notes",true]])){const cur=data[vk],iv=d[vk];
    if(cur&&cur.chk){if(!iv||iv.id!==cur.id)drop(lk,x=>secret&&!x.secret||x.vid===cur.id);d[vk]=cur}
    else if(iv&&!phxOk(iv)){drop(lk,x=>secret&&!x.secret);d[vk]=null}}
  if(data.docVault&&data.docVault.chk)d.docVault=data.docVault;else if(d.docVault&&!phxOk(d.docVault))d.docVault=null;
  d.phx=phx;return {d,skipped}}
let bkCur=null;
$("restoreIn").addEventListener("change",async e=>{
  const f=e.target.files[0];e.target.value="";if(!f)return;
  let p=null;try{p=bkParse(JSON.parse(await f.text()))}catch(err){}
  if(!p){toast("Ce fichier n'est pas une sauvegarde Sid'note");return}
  bkCur=bkPrepare(p.d);const d=bkCur.d;bkCur.v1=!!p.v1;
  $("bkWhen").textContent=p.at?`${L("Sauvegarde du")} ${fmtDay(p.at)}`:L("Ancienne sauvegarde (tâches et agenda seulement)");
  if(shIsl("bkList")){try{window.SCIslands.bkList($("bkList"),{rows:BK_LISTS.filter(x=>x[1]).map(([k,lb])=>({lb,n:bkGet(d,k).length,now:bkGet(data,k).length})),i18n:agI18n()})}catch(e){reportErr("island bkList: "+(e&&e.message))}}
  else $("bkList").innerHTML=`<div class="row small muted"><span class="grow"></span><span class="n">${L("Fichier")}</span><span class="now">${L("Maintenant")}</span></div>`+
    BK_LISTS.filter(x=>x[1]).map(([k,lb])=>`<div class="row"><span class="grow">${L(lb)}</span><span class="n">${bkGet(d,k).length}</span><span class="now muted">${bkGet(data,k).length}</span></div>`).join("");
  $("bkNote").hidden=!bkCur.skipped;$("bkNote").textContent=bkCur.skipped?`${bkCur.skipped} ${L("élément(s) protégé(s) par un autre coffre ne seront pas repris : ton coffre actuel est gardé.")}`:"";
  const r=$("bkReplace");delete r.dataset.armed;r.textContent=L("Remplacer mes données");$("bkSheet").hidden=false});
const bkClose=()=>{$("bkSheet").hidden=true;bkCur=null};
$("bkClose").addEventListener("click",bkClose);$("bkSheet").addEventListener("click",e=>{if(e.target.id==="bkSheet")bkClose()});
// les éléments de la sauvegarde annulent les suppressions plus anciennes, sur tous les appareils (data.res)
function bkRevive(d){const now=Date.now();data.res=data.res||{};for(const [k] of BK_LISTS)for(const x of bkGet(d,k))data.res[x.id]=now}
function bkApply(mode){if(!bkCur)return;const d=bkCur.d;
  bkRevive(d);
  if(mode==="merge"){applyRemote(mergeData(data,d))}
  else{
    // remplacer : ce qui n'est pas dans la sauvegarde est supprimé (sauf les documents et leurs classeurs : leurs fichiers ne sont pas dans la sauvegarde)
    for(const [k] of BK_LISTS){if(k==="docs"||k==="docFolders"||k.split(".").reduce((o,x)=>o&&o[x],d)===undefined)continue;const keep=new Set(bkGet(d,k).map(x=>x.id));for(const x of bkGet(data,k))if(!keep.has(x.id))tomb(x.id)}
    const nd={...d,del:data.del,res:data.res,wipe:data.wipe,docs:mergeData(data,d).docs,docFolders:mergeData(data,d).docFolders};
    if(bkCur.v1)for(const k of Object.keys(data))if(!(k in nd)&&k!=="ui")nd[k]=data[k]; // ancien format : le reste du compte ne bouge pas
    applyRemote(mergeData(nd,{}))}
  save();bkClose();renderAll();toast(mode==="merge"?"Sauvegarde fusionnée":"Sauvegarde restaurée")}
$("bkMerge").addEventListener("click",()=>bkApply("merge"));
$("bkReplace").addEventListener("click",e=>{const b=e.currentTarget;
  if(!b.dataset.armed){b.dataset.armed="1";b.textContent=L("Tout remplacer ? Touche encore pour confirmer");return}
  bkApply("replace")});
