/* ---------- traductions : tables DICT / PATS (anglais) et DICT_NL / PATS_NL (néerlandais) dans i18n.js ---------- */
let LANG=null; // fixé plus bas, une fois les données chargées
const L=x=>LANG&&LANG!=="fr"&&DICT[x]!==undefined?DICT[x]:x;
const defaultUI=()=>({view:"plan",filter:"Toutes",doneOpen:false,pausedOpen:true});
const blank=()=>({todos:[],tasks:[],courses:[],types:[{name:"Événement",c:"--c-event"},{name:"Perso",c:"--c-perso"}],ui:defaultUI()});
let session=ls.get(SESSION_KEY);
let cache=session?ls.get(cacheKey(session.user.id)):null;
if(session&&!cache){session=null;ls.del(SESSION_KEY)}
const TEST_EMAILS=["test@sidcorp.app"]; // compte test : remis à zéro à chaque connexion
const ssGet=k=>{try{return sessionStorage.getItem(k)}catch(e){return null}},ssSet=(k,v)=>{try{sessionStorage.setItem(k,v)}catch(e){}};
// « Rester connecté » décoché : la session s'arrête quand l'app est fermée
const ephExpired=!!(session&&session.eph&&!ssGet("sidnote-alive"));
if(session&&!ephExpired)ssSet("sidnote-alive","1");
let data=/** @type {any} */(cache?cache.data:blank());
if(cache&&!("base" in cache)){cache.base="";cache.dirty=true;ls.set(cacheKey(session.user.id),cache)}
data.ui=data.ui||defaultUI();
if(!Array.isArray(data.types))data.types=Object.entries(CATS).map(([name,c])=>({name,c}));
if(!Array.isArray(data.courses))data.courses=[];
if(!Array.isArray(data.todos))data.todos=[];
if(!Array.isArray(data.tasks))data.tasks=[];
if(!Array.isArray(data.todoCats))data.todoCats=[];
if(!Array.isArray(data.docs))data.docs=[];
if(!Array.isArray(data.notes))data.notes=[];
if(!Array.isArray(data.pwds))data.pwds=[];
LANG=(data.prefs&&data.prefs.lang)||ls.get("sidnote-lang")||"fr";if(session)ls.set("sidnote-lang",LANG);
if(LANG==="nl"){for(const k in DICT)delete DICT[k];Object.assign(DICT,DICT_NL);PATS.splice(0,PATS.length,...PATS_NL)}
if(!["fr","en","nl"].includes(LANG))LANG="fr";
const TABS=[["plan","Agenda"],["todo","Tâches"],["lists","Listes"],["notes","Notes"],["pomo","Focus"],["muscu","Musculation"],["nutri","Nutrition"],["graph","Graphiques"],["docs","Documents"],["pwd","Mots de passe"],["app","Appli"]];
data.prefs=data.prefs||{};data.prefs.tabs=data.prefs.tabs||{plan:true,todo:true,pomo:true,app:true};

function save(){
  if(!session)return;
  cache={data,rev:new Date().toISOString(),base:cache&&cache.base,dirty:true};if(pushing)pendingEdit=true;
  if(!ls.set(cacheKey(session.user.id),cache))toast("Enregistrement impossible sur cet appareil");
  schedulePush();
}
function saveUI(){if(session&&cache){cache.data=data;ls.set(cacheKey(session.user.id),cache)}} // préférences d'affichage : pas de synchro
const forServer=d=>{const c={...d};delete c.ui;return c};
// v61 (#3, coquille étape 3) : appels au serveur, session et écriture synchronisée en TypeScript (app/src/core/sync.ts, window.SCCore.sync) ;
// l'ancien code reste en secours (core.js absent, window.__noCore)
const CS=()=>window.SCCore&&window.SCCore.sync&&!window.__noCore?window.SCCore.sync:null;
let coreApi=null;
async function api(path,opt={}){if(CS()){coreApi=coreApi||CS().createApi(SUPABASE_URL,SUPABASE_KEY);return coreApi(path,opt)}return apiOld(path,opt)}
/** @param {string} path @param {{method?:string,body?:any,token?:string,headers?:any}} [o] */
async function apiOld(path,{method="GET",body,token,headers={}}={}){
  const r=await fetch(SUPABASE_URL+path,{method,headers:{apikey:SUPABASE_KEY,"Content-Type":"application/json",...(token?{Authorization:"Bearer "+token}:{}),...headers},body:body?JSON.stringify(body):undefined});
  const txt=await r.text();let j=null;try{j=txt?JSON.parse(txt):null}catch(e){}
  if(!r.ok){const err=new Error((j&&(j.msg||j.message||j.error_description||j.error))||("Erreur "+r.status));err.status=r.status;err.code=j&&(j.error_code||j.code);throw err}
  return j;
}
// v37 : les erreurs de l'app sont envoyées (table client_errors, lisible seulement dans le tableau de bord Supabase) :
// au plus 5 par ouverture, sans doublon, jamais en mode essai ni sans connexion. Aucun contenu de l'utilisateur, juste le message technique.
const APP_V="74.1";const errSent=new Set();
function reportErr(msg,stack){try{
  msg=String(msg||"").slice(0,500);if(!msg||errSent.has(msg)||errSent.size>=5||!session||session.trial||!navigator.onLine||!CONFIGURED)return;errSent.add(msg);
  token().then(t=>api("/rest/v1/client_errors",{method:"POST",token:t,headers:{Prefer:"return=minimal"},
    body:{user_id:session.user.id,version:APP_V,msg,stack:String(stack||"").slice(0,2000),url:(data.ui&&data.ui.view)||"",ua:navigator.userAgent.slice(0,200)}})).catch(()=>{})}catch(e){}}
addEventListener("error",e=>{if(e.message)reportErr(e.message,e.error&&e.error.stack)});
addEventListener("unhandledrejection",e=>{const r=e.reason;if(r&&(r.trial||r instanceof TypeError&&!navigator.onLine))return;reportErr(r&&r.message||String(r),r&&r.stack)});
// v32 : fonctions réservées (ex. Nutrition), décidées par le serveur dans app_metadata.features
const userFeat=u=>u&&u.app_metadata&&Array.isArray(u.app_metadata.features)?u.app_metadata.features.map(String):null;
function storeSession(j,name){
  if(CS()){session=CS().sessionFrom(j,name,session);ls.set(SESSION_KEY,session);return}
  session={access_token:j.access_token,refresh_token:j.refresh_token,
    expires_at:j.expires_at||Math.floor(Date.now()/1000)+(j.expires_in||3600),user:{id:j.user.id},name,
    email:(j.user&&j.user.email)||(session&&session.email)||"",eph:!!(session&&session.eph),
    feat:userFeat(j.user)||(session&&session.feat)||[]};
  ls.set(SESSION_KEY,session);
}
// v34 : mode essai sans compte : tout reste sur l'appareil (pas de serveur), puis « Créer mon compte » emporte les données
const TRIAL_ID="essai",isTrial=()=>!!(session&&session.trial);
function startTrial(){session={trial:true,user:{id:TRIAL_ID},name:L("Invité"),email:"",feat:[],eph:false};ls.set(SESSION_KEY,session);ls.del("sidnote-trial-carry");
  if(!ls.get(cacheKey(TRIAL_ID)))ls.set(cacheKey(TRIAL_ID),{data:blank(),rev:new Date().toISOString(),dirty:true}); // une session sans données locales serait effacée au démarrage
  location.reload()}
// « Créer mon compte » depuis l'essai : on revient à l'écran de connexion, les données de l'essai seront reprises (finishLogin)
function trialToAccount(){ls.set("sidnote-trial-carry",1);ls.del(SESSION_KEY);location.reload()}
// copie des fichiers de l'appareil (documents, photos) de l'essai vers le vrai compte
async function idbRekey(from,to){try{const db=await idb.open();const all=await new Promise((res,rej)=>{const out=[],tx=db.transaction("files","readonly");
  tx.objectStore("files").openCursor().onsuccess=e=>{const c=e.target.result;if(!c){res(out);return}if(String(c.key).startsWith(from+":"))out.push([c.key,c.value]);c.continue()};tx.onerror=rej});
  for(const [k,v] of all){await idb.put(to+String(k).slice(from.length),v);await idb.del(k)}}catch(e){}}
async function token(){
  if(isTrial())throw Object.assign(new Error(L("Mode essai : crée ton compte pour utiliser cette fonction.")),{trial:true});
  if(session.expires_at-60>Date.now()/1000)return session.access_token;
  try{const j=await api("/auth/v1/token?grant_type=refresh_token",{method:"POST",body:{refresh_token:session.refresh_token}});
    storeSession(j,session.name);return session.access_token}
  catch(e){if(e.status===400||e.status===401)endSession("Ta session a expiré, reconnecte-toi.",true);throw e}
}
let pushTimer=null,pushing=false;
function tomb(id){if(!id)return;data.del=data.del||{};data.del[id]=Date.now()}
// v44.6 : fusion « à 3 voies ». L'appareil garde la dernière version du serveur qu'il connaît (sa « base », sidnote-base-<uid>).
// Avant, à la synchro, la copie de l'appareil gagnait toujours (tâches, activités, réglages, programme…) : un appareil resté
// sur une vieille copie (iPhone, Mac, ou une app fermée avant l'envoi) remettait en ligne ce qui avait été modifié ou supprimé
// ailleurs (autre appareil, Claude). Maintenant, la copie de l'appareil ne gagne que pour ce qu'elle a vraiment changé depuis
// la base ; ce qui n'a pas bougé ici prend la version du serveur, et ce qui a disparu du serveur disparaît ici aussi.
const baseKey=u=>"sidnote-base-"+u;
function baseGet(uidv,at){const b=at&&ls.get(baseKey(uidv));return b&&b.at===at?b.data:null} // seulement si elle correspond à la version connue
function baseSet(uidv,at,d){if(!at||!d)return;if(!ls.set(baseKey(uidv),{at,data:d}))ls.del(baseKey(uidv))}
const jeq=(a,b)=>a===b||JSON.stringify(a)===JSON.stringify(b);
const isObj=x=>!!x&&typeof x==="object"&&!Array.isArray(x);
const idList=x=>Array.isArray(x)&&x.length>0&&x.every(e=>isObj(e)&&e.id!==undefined&&e.id!==null);
const M3_ATOM=new Set(["plan","profile","menu","vault","docVault","noteVault","phx","grp","consent"]); // gardés d'un bloc (jamais mélangés champ par champ)
const m3pick=(l,r)=>{const t=x=>isObj(x)?(+x.upd||+x.at||Date.parse(x.createdAt)||0):0;return t(r)>t(l)?r:l}; // changé des deux côtés : le plus récent, sinon cet appareil
function merge3(b,l,r,key){
  if(jeq(l,r))return l;if(jeq(l,b))return r;if(jeq(r,b))return l;
  if((idList(l)||idList(r)||idList(b))&&(l===undefined||Array.isArray(l))&&(r===undefined||Array.isArray(r))){
    const B=new Map((Array.isArray(b)?b:[]).filter(isObj).map(x=>[x.id,x])),R=new Map((r||[]).filter(isObj).map(x=>[x.id,x])),out=[],seen=new Set();
    for(const x of l||[]){if(!isObj(x)){out.push(x);continue}seen.add(x.id);const bx=B.get(x.id),rx=R.get(x.id);
      if(rx){out.push(jeq(x,bx)?rx:jeq(rx,bx)?x:m3pick(x,rx));continue}
      if(bx&&jeq(x,bx))continue; // supprimé ailleurs, pas touché ici
      out.push(x)}
    for(const x of r||[]){if(!isObj(x)||seen.has(x.id))continue;const bx=B.get(x.id);
      if(bx&&jeq(x,bx))continue; // supprimé ici, pas touché ailleurs
      out.push(x)}
    return out}
  if(isObj(l)&&isObj(r)&&!M3_ATOM.has(key)){const bo=isObj(b)?b:{},out={};
    for(const k of new Set([...Object.keys(r),...Object.keys(l)])){const v=merge3(bo[k],l[k],r[k],k);if(v!==undefined)out[k]=v}
    return out}
  return m3pick(l,r)}
// fusionne les données d'un autre appareil avec celles de cet appareil, sans rien perdre
// v60 (#3, coquille étape 1) : le code de référence est app/src/core/merge.ts (site/react/core.js, window.SCCore, chargé avant ce fichier) ;
// cette version reste en secours (core.js absent ou erreur) et sert de témoin au test tests/merge.test.js
function mergeData(loc,rem,opt){
  if(window.SCCore&&window.SCCore.mergeData&&!window.__noCore){try{return window.SCCore.mergeData(loc,rem,opt,{forServer,norm,L})}catch(e){try{reportErr("core merge: "+(e&&e.message))}catch(x){}}}
  return mergeDataOld(loc,rem,opt)}
function mergeDataOld(loc,rem,opt){
  loc=loc||{};rem=rem||{};const since=(opt&&opt.since)||0;
  // v44.6 : avec la base, on reconstruit d'abord la version de cet appareil comme « serveur + ce qui a vraiment changé ici »,
  // puis la fusion habituelle (pierres tombales, notes en conflit, coffres…) s'applique à cette version-là
  if(opt&&opt.base&&!(rem.wipe||loc.wipe)){const base=opt.base,ui=loc.ui;const l2=merge3(forServer(base),forServer(loc),forServer(rem));
    if(ui)l2.ui=ui;
    // ce qui a disparu des deux côtés par rapport à la base est vraiment supprimé : on l'enlève aussi de la version du serveur
    // avant la réunion par id (sinon arr() le rajouterait)
    const strip=(bb,ll,rr)=>{if(Array.isArray(rr)&&idList(bb)&&Array.isArray(ll)){const keep=new Set(ll.filter(isObj).map(x=>x.id)),bi=new Set(bb.map(x=>x.id));
        return rr.filter(x=>!isObj(x)||keep.has(x.id)||!bi.has(x.id))}
      if(isObj(rr)&&isObj(bb)&&isObj(ll)){const o={...rr};for(const k in o){if(!(k in ll)&&(k in bb)&&jeq(bb[k],rr[k])){delete o[k];continue}o[k]=strip(bb[k],ll[k],rr[k])}return o}return rr};
    rem=strip(forServer(base),l2,forServer(rem));loc=l2}
  // « Supprimer mes données » sur un autre appareil : l'effacement gagne sur tout le reste
  if((rem.wipe||"")>(loc.wipe||""))return {...JSON.parse(JSON.stringify(rem)),ui:loc.ui||rem.ui};
  if((loc.wipe||"")>(rem.wipe||""))return {...loc};
  const now=Date.now(),del={};
  for(const src of [rem.del||{},loc.del||{}])for(const k in src)if(now-src[k]<90*864e5)del[k]=Math.max(del[k]||0,src[k]);
  // v33 : élément restauré depuis une sauvegarde (data.res) : il annule une suppression plus ancienne
  const res={};for(const src of [rem.res||{},loc.res||{}])for(const k in src)if(now-src[k]<90*864e5)res[k]=Math.max(res[k]||0,src[k]);
  for(const k in res)if(del[k]&&del[k]<=res[k])delete del[k];
  const arr=(a,b)=>{a=Array.isArray(a)?a:[];b=Array.isArray(b)?b:[];const ids=new Set(a.map(x=>x&&x.id));
    return [...a.filter(x=>x&&!del[x.id]),...b.filter(x=>x&&!ids.has(x.id)&&!del[x.id])]};
  // notes et mots de passe : si les deux appareils ont modifié le même élément, on garde le plus récent
  const arrU=(a,b)=>{const rb=new Map((Array.isArray(b)?b:[]).map(x=>[x&&x.id,x]));
    return arr(a,b).map(x=>{const r=rb.get(x.id);return r&&(r.upd||0)>(x.upd||0)?r:x})};
  const out={...rem,...loc,del,res};
  out.todos=arr(loc.todos,rem.todos);out.tasks=arr(loc.tasks,rem.tasks);
  out.todoCats=arr(loc.todoCats,rem.todoCats);out.docs=arr(loc.docs,rem.docs);out.docFolders=arr(loc.docFolders,rem.docFolders);out.noteFolders=arr(loc.noteFolders,rem.noteFolders);
  out.notes=arrU(loc.notes,rem.notes);out.pwds=arrU(loc.pwds,rem.pwds);out.pdfAnns=arrU(loc.pdfAnns,rem.pdfAnns); // v44.7 : annotations des PDF de cours
  // v33 : une note modifiée sur les deux appareils depuis la dernière synchro : on garde aussi l'autre version, en copie
  if(since){const ln=new Map((Array.isArray(loc.notes)?loc.notes:[]).map(x=>[x&&x.id,x]));
    for(const r of Array.isArray(rem.notes)?rem.notes:[]){const l=r&&ln.get(r.id);if(!l||del[r.id]||(l.upd||0)<=since||(r.upd||0)<=since||(l.upd||0)===(r.upd||0))continue;
      const same=l.secret?l.ct===r.ct:(l.title||"")===(r.title||"")&&(l.body||"")===(r.body||"");if(same)continue;
      const lose=(r.upd||0)>(l.upd||0)?l:r,cid=lose.id+"-c"+(lose.upd||0);
      if(!out.notes.some(x=>x.id===cid)&&!del[cid])out.notes.push({...lose,id:cid,...(lose.secret?{}:{title:(lose.title||"")+" "+L("(copie de conflit)")}),photos:undefined})}}
  // nutrition : profil, besoins et menu = version la plus récente ; journal = union des entrées
  const ln=loc.nutri||{},rn=rem.nutri||{};
  out.nutri={...((ln.upd||0)>=(rn.upd||0)?{...rn,...ln}:{...ln,...rn}),log:arrU(ln.log,rn.log),weights:arrU(ln.weights,rn.weights),weeks:arrU(ln.weeks,rn.weeks)};
  // un document envoyé sur le serveur depuis un autre appareil reste marqué « en ligne »
  const remDocs=new Map((rem.docs||[]).map(d=>[d&&d.id,d]));out.docs=out.docs.map(d=>{const r=remDocs.get(d.id);return r&&r.up&&!d.up?{...d,up:true,path:r.path}:d});
  const tn=new Set((loc.types||[]).map(t=>norm(t.name)));
  out.types=[...(loc.types||[]),...(rem.types||[]).filter(t=>!tn.has(norm(t.name)))];
  {const lm=loc.muscu||{},rm=rem.muscu||{},pu=x=>(x&&x.plan&&x.plan.upd)||0;
    out.muscu={...rm,...lm,sessions:arrU(lm.sessions,rm.sessions),log:arr(lm.log,rm.log),plan:pu(rm)>pu(lm)?rm.plan:(lm.plan!==undefined?lm.plan:rm.plan)}}
  out.prefs={...(rem.prefs||{}),...(loc.prefs||{})};
  // v32 : coffres et phrase secrète : si les deux appareils en ont un différent, le plus récent gagne
  // (sinon un appareil resté sur l'ancien coffre écraserait le coffre renforcé, et les éléments rechiffrés deviendraient illisibles)
  const vAt=v=>v?(v.at||Date.parse(v.createdAt)||0):0;
  for(const k of ["vault","docVault","noteVault","phx"]){const a=loc[k],b=rem[k];if(a&&b&&a.id!==b.id&&vAt(b)>vAt(a))out[k]=b}
  return out;
}
function schedulePush(){clearTimeout(pushTimer);pushTimer=setTimeout(push,1200);setSync()}
// v33 : un échec d'envoi n'est plus silencieux : syncErr est affiché (Compte + Aujourd'hui) et on réessaie de plus en plus espacé
let syncErr=null,retryIn=0,retryT=null;
async function push(){
  if(!session||isTrial()||!CONFIGURED||!cache||!cache.dirty||pushing)return;
  pushing=true;clearTimeout(retryT);let failed=false;
  const since=Date.parse(cache.base||"")||0; // dernière version du serveur connue ici : sert à repérer les notes modifiées des deux côtés
  try{
    const t=await token(),uid0=session.user.id;
    // v31 : écriture « à condition que personne n'ait écrit entre-temps » : si un autre appareil a enregistré
    // pendant qu'on fusionnait, on relit, on refusionne et on réessaie (sinon ses suppressions ou les nôtres seraient perdues)
    let rev=null,sent=null,known=cache.base||"",base=baseGet(uid0,known); // v44.6 : dernière version du serveur connue ici (fusion à 3 voies)
    if(CS())({rev,sent}=await CS().pushLoop(uid0,t,known,base,since,{api,fetchRow:()=>fetchRow(uid0,t),getData:()=>data,mergeData,applyRemote,setDel:d=>{data.del=d},forServer}));
    else for(let attempt=0;attempt<4&&!rev;attempt++){
      const row=await fetchRow(uid0,t);
      if(row&&row.updated_at!==known){const m=mergeData(data,row.data,{since,base});
        if(JSON.stringify(forServer(m))!==JSON.stringify(forServer(data)))applyRemote(m);else data.del=m.del;
        base=row.data;known=row.updated_at} // cette version est maintenant intégrée ici : elle sert de base si on doit recommencer
      const r=new Date().toISOString();sent=forServer(data);const body=JSON.parse(JSON.stringify(sent));
      if(!row){await api("/rest/v1/user_data?on_conflict=user_id",{method:"POST",token:t,headers:{Prefer:"resolution=merge-duplicates,return=minimal"},body:{user_id:uid0,data:body,updated_at:r}});rev=r;sent=body;break}
      const done=await api(`/rest/v1/user_data?user_id=eq.${uid0}&updated_at=eq.${encodeURIComponent(row.updated_at)}&select=updated_at`,{method:"PATCH",token:t,
        headers:{Prefer:"return=representation"},body:{data:body,updated_at:r}});
      if(Array.isArray(done)&&done.length){rev=done[0].updated_at||r;sent=body;break}
      // quelqu'un a écrit entre-temps : on recommence avec sa version
    }
    if(!rev)throw new Error("conflit");
    baseSet(uid0,rev,sent);
    cache={data,rev,base:rev,dirty:pendingEdit};pendingEdit=false;ls.set(cacheKey(session.user.id),cache);
    syncErr=null;retryIn=0;
  }catch(e){failed=true;
    // hors connexion : pas une erreur (l'envoi repart dès le retour du réseau) ; sinon on la montre
    if(!(e instanceof TypeError)&&navigator.onLine)syncErr=e}
  finally{pushing=false;
    if(cache&&cache.dirty){if(failed){retryIn=Math.min((retryIn||2000)*2,60000);retryT=setTimeout(push,retryIn)}else schedulePush()}
    setSync()}
}
function syncRetry(){retryIn=0;clearTimeout(retryT);if(cache)cache.dirty=true;push()}
document.addEventListener("click",e=>{if(e.target.closest("[data-syncretry]")){e.preventDefault();syncRetry();toast("Nouvel essai d'envoi…")}});
let pendingEdit=false;
async function fetchRow(uid,t){
  const rows=await api(`/rest/v1/user_data?select=data,updated_at&user_id=eq.${uid}`,{token:t});
  return rows&&rows[0]||null;
}
async function pull(){
  if(!session||isTrial()||!CONFIGURED||pushing)return;
  try{
    if(cache.dirty){push();return}
    const row=await fetchRow(session.user.id,await token());
    if(!row){cache.dirty=true;push();return}
    if(row.updated_at!==cache.base){applyRemote(row.data);cache={data,rev:row.updated_at,base:row.updated_at,dirty:false};ls.set(cacheKey(session.user.id),cache)}
    if(!baseGet(session.user.id,row.updated_at))baseSet(session.user.id,row.updated_at,row.data);
  }catch(e){}
  setSync();
}
const isTyping=()=>{const a=document.activeElement;return !!(a&&(a.tagName==="INPUT"||a.tagName==="TEXTAREA")&&a.closest("main"))};
let renderWaiting=false;
function renderAllSafe(){
  if(!isTyping()){renderAll();applyTabs();return}
  if(renderWaiting)return;renderWaiting=true;
  const h=()=>setTimeout(()=>{if(isTyping())return;document.removeEventListener("focusout",h);renderWaiting=false;renderAll();applyTabs()},120);
  document.addEventListener("focusout",h);
}
function applyRemote(d){
  const prevIcal=JSON.stringify([data.prefs&&data.prefs.ical,data.prefs&&data.prefs.icals]);
  for(const k of Object.keys(data))if(k!=="ui"&&k!=="pomo")delete data[k];
  for(const k of Object.keys(d))if(k!=="ui"&&k!=="pomo")data[k]=d[k];
  if(d.pomo&&data.pomo&&d.pomo!==data.pomo){const np=JSON.parse(JSON.stringify(d.pomo));for(const k of Object.keys(data.pomo))delete data.pomo[k];Object.assign(data.pomo,np)}
  ["todos","tasks","courses","types","todoCats","docs","docFolders","noteFolders","notes","pwds","pdfAnns"].forEach(k=>{if(!Array.isArray(data[k]))data[k]=[]});
  data.prefs=data.prefs||{};data.prefs.tabs=data.prefs.tabs||{plan:true,todo:true,pomo:true,app:true};
  data.muscu=data.muscu||{sessions:[]};if(!Array.isArray(data.muscu.sessions))data.muscu.sessions=[];
  data.nutri=data.nutri||{};["log","weights","weeks"].forEach(k=>{if(!Array.isArray(data.nutri[k]))data.nutri[k]=[]});
  if(typeof applyLook==="function")applyLook();
  if(JSON.stringify([data.prefs.ical,data.prefs.icals])!==prevIcal&&typeof icalFetch==="function"){CALS();icalMix();renderCals();icalFetch(true)}
  renderAllSafe();
}
function setSync(){
  const el=document.getElementById("syncState");if(!el||!session)return;
  const wait=cache&&cache.dirty,bad=!isTrial()&&!!(syncErr&&wait&&navigator.onLine),hb=document.getElementById("homeSync");
  if(shIsl("syncState")){try{ // v66 (#3)
    window.SCIslands.syncState(el,{st:isTrial()?"trial":bad?"bad":!navigator.onLine?"off":wait?"wait":"ok",i18n:agI18n()});
    if(isTrial()){const t=document.getElementById("homeTrial");if(t)t.hidden=false;return}
    if(hb){hb.hidden=!bad;if(bad)window.SCIslands.homeSync(hb,{msg:syncErr&&syncErr.message?String(syncErr.message).slice(0,80):"",i18n:agI18n()})}return}
    catch(e){reportErr("island sync: "+(e&&e.message));try{window.SCIslands.unmount(el);if(hb)window.SCIslands.unmount(hb)}catch(_){}}}
  if(isTrial()){el.innerHTML=`<span class="syncdot wait"></span>${L("Mode essai : tes données restent sur cet appareil")}`;const t=document.getElementById("homeTrial");if(t)t.hidden=false;return}
  el.innerHTML=bad?`<span class="syncdot err"></span>${L("Synchronisation en échec")} · <button type="button" class="linkbtn" data-syncretry="1">${L("Réessayer")}</button>`
    :`<span class="syncdot ${wait?"wait":""}"></span>`+(!navigator.onLine?"Hors connexion · tes modifications seront envoyées plus tard":wait?"Synchronisation…":"Synchronisé");
  if(hb){hb.hidden=!bad;if(bad)hb.innerHTML=`<span class="grow"><b>${L("Pas encore enregistré en ligne")}</b><span class="small">${L("Tes dernières modifications sont gardées sur cet appareil, mais le serveur les a refusées. Nouvel essai automatique.")}${syncErr&&syncErr.message?` <span class="muted notr">(${esc(String(syncErr.message).slice(0,80))})</span>`:""}</span></span><button type="button" class="mini" data-syncretry="1">${L("Réessayer")}</button>`}
}
function endSession(msg,keepCache){
  if(session&&!keepCache){ls.del(cacheKey(session.user.id));ls.del(baseKey(session.user.id));ls.del("sidnote-ical-"+session.user.id);ls.del("sidnote-icalauth-"+session.user.id);try{idbClearUser(session.user.id)}catch(e){}}
  ls.del(SESSION_KEY);
  try{if(msg)sessionStorage.setItem("sidnote-msg",msg)}catch(e){}
  location.reload();
}
const norm=x=>String(x||"").trim().toLowerCase();
const typeOf=n=>data.types.find(t=>norm(t.name)===norm(n));
const tc=n=>(typeOf(n)||{}).c||"--muted";
function ensureType(n){n=String(n||"").trim().replace(/\s+/g," ");if(!n)return "";let t=typeOf(n);
  if(!t){const used=data.types.map(x=>x.c);t={name:n.charAt(0).toUpperCase()+n.slice(1),c:PALETTE.find(c=>!used.includes(c))||PALETTE[data.types.length%PALETTE.length]};data.types.push(t)}
  return t.name}
function fillTypeList(){$("typeList").innerHTML=data.types.map(t=>`<option value="${esc(t.name)}"></option>`).join("");document.querySelectorAll(".tchips").forEach(fillTypeChips)}
// sous chaque champ « Type » : les types déjà créés, à toucher pour les choisir
function fillTypeChips(box){const inp=document.getElementById(box.dataset.for);const cur=norm(inp&&inp.value);
  if(shIsl("typeChips")){try{window.SCIslands.typeChips(box,{types:data.types.map(t=>({name:t.name,c:t.c})),cur,i18n:agI18n()});return}catch(e){reportErr("island typeChips: "+(e&&e.message));try{window.SCIslands.unmount(box)}catch(_){}}}
  box.innerHTML=data.types.map(t=>`<button type="button" class="pill" data-tchip="${esc(t.name)}" aria-pressed="${norm(t.name)===cur}"><span class="dot" style="background:var(${t.c})"></span>${esc(t.name)}</button>`).join("")}
function typeChipsFor(inp){if(!inp||inp.dataset.chips)return;inp.dataset.chips="1";
  const box=document.createElement("div");box.className="chips tchips";box.dataset.for=inp.id;(inp.closest(".two")||inp.closest("label")).after(box);fillTypeChips(box);
  inp.addEventListener("input",()=>fillTypeChips(box))}
document.addEventListener("click",e=>{const c=e.target.closest("[data-tchip]");if(!c)return;const box=c.closest(".tchips"),inp=document.getElementById(box.dataset.for);
  inp.value=c.dataset.tchip;fillTypeChips(box);inp.dispatchEvent(new Event("input",{bubbles:true}))});
if(navigator.storage&&navigator.storage.persist)navigator.storage.persist().catch(()=>{});
