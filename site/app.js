// v43 : l'app s'ouvre toujours en haut d'Aujourd'hui. Le navigateur ne doit pas restaurer l'ancien défilement,
// et tant que la personne n'a pas touché l'écran, on remet en haut après chaque étape asynchrone (animation, polices, synchro).
try{history.scrollRestoration="manual"}catch(e){}
let bootFresh=true;
["wheel","touchstart","keydown","pointerdown"].forEach(t=>addEventListener(t,()=>{bootFresh=false},{once:true,passive:true}));
function bootTop(){if(bootFresh&&typeof data!=="undefined"&&data.ui&&data.ui.view==="home")window.scrollTo(0,0)}
/* ---------- icônes au trait (v24, style Graphite : plus aucun émoji dans l'interface) ---------- */
const ICS={
  search:'<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
  bell:'<path d="M10 5a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3H4a4 4 0 0 0 2-3v-3a7 7 0 0 1 4-6"/><path d="M9 17v1a3 3 0 0 0 6 0v-1"/>',
  calendar:'<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M16 3v4M8 3v4M4 11h16"/>',
  utensils:'<path d="M7 3v18M4 3v5a3 3 0 0 0 6 0V3M17 21V3c-2 1.5-3 4-3 8h3"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M5 21v-1a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v1"/>',
  camera:'<path d="M5 7h1a2 2 0 0 0 2-2a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1a2 2 0 0 0 2 2h1a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2"/><circle cx="12" cy="13" r="3"/>',
  mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6"/>',
  lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  unlock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.5-2"/>',
  trendup:'<path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/>',
  trenddown:'<path d="M3 7l6 6 4-4 8 8"/><path d="M21 10v7h-7"/>',
  equal:'<path d="M5 9h14M5 15h14"/>',
  flame:'<path d="M12 21c3.9 0 7-2.9 7-6.8 0-3.6-2.6-5.8-4-8.7-1.6 1.6-2.6 3.5-2.6 5.5-1.1-.8-1.9-2.2-2-3.8C7.6 9 5 11.6 5 14.2 5 18.1 8.1 21 12 21z"/>',
  target:'<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r=".6"/>',
  leaf:'<path d="M5 21c.5-4.5 2.5-8 7-10"/><path d="M9 18c6.2 0 10.5-3.3 11-12V4h-4c-7 0-11 4-11 9 0 1.8.4 3.3 1 5"/>',
  sunrise:'<path d="M3 17h18M6 21h12M7 13a5 5 0 0 1 10 0M12 4v3M4.6 8.6l1.4 1.4M19.4 8.6 18 10"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M5.6 5.6 7 7M17 17l1.4 1.4M3 12h2M19 12h2M5.6 18.4 7 17M17 7l1.4-1.4"/>',
  moon:'<path d="M12 3a7 7 0 1 0 9 9 8 8 0 1 1-9-9"/>',
  apple:'<path d="M12 7.5c-1.7-1.4-5.4-1.4-6.4 2.3-1 3.7 1.4 8.9 3.7 9.9 1 .4 1.5-.3 2.7-.3s1.7.7 2.7.3c2.3-1 4.7-6.2 3.7-9.9-1-3.7-4.7-3.7-6.4-2.3z"/><path d="M12 7.5c0-2 .9-3.4 2.9-4"/>',
  book:'<path d="M4 19V5a2 2 0 0 1 2-2h14v14H6a2 2 0 0 0-2 2zm0 0a2 2 0 0 0 2 2h14v-4"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  activity:'<path d="M3 12h4l3-8 4 16 3-8h4"/>',
  bolt:'<path d="M13 3 4 14h7l-1 7 9-11h-7z"/>',
  alert:'<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>',
  folder:'<path d="M4 5h5l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1"/>',
  file:'<path d="M14 3v5h5"/><path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2"/>',
  database:'<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>',
  shield:'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
  globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  grad:'<path d="M22 9 12 4 2 9l10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/>',
  trash:'<path d="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/>'};
const IC=n=>ICS[n]?`<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICS[n]}</svg>`:"";
// initiales d'un plat à la place de l'émoji : « Poulet riz » → « PR »
const mono=s=>{const w=String(s||"").normalize("NFC").split(/[\s,'’-]+/).filter(x=>x&&/^\p{L}/u.test(x)&&!/^(de|du|des|la|le|les|au|aux|et|à|a|en|of|the|and|with|avec)$/i.test(x));return (w.length?w.slice(0,2).map(x=>x[0]).join(""):"·").toUpperCase()};
const hydrateIcons=root=>(root||document).querySelectorAll("i.ic[data-i]").forEach(e=>{if(!e.firstChild)e.innerHTML=IC(e.dataset.i)});
/* ---------- données de départ ---------- */
const CATS={"Événement":"--c-event","Cours":"--c-cours","Stage":"--c-stage","Mémoire":"--c-memoire","Perso":"--c-perso"};
const PALETTE=["--c-event","--c-cours","--c-stage","--c-memoire","--c-perso","--x1","--x2","--x3","--x4","--x5","--x6"];
const STATUSES=["à faire","en cours","fait"];
const MO=["janv.","févr.","mars","avr.","mai","juin","juil.","août","sept.","oct.","nov.","déc."];
const MOL=["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

/* ---------- compte & synchronisation ---------- */
const SUPABASE_URL="https://eloeoaidgbkygazwjwiu.supabase.co";
const SUPABASE_KEY="sb_publishable_IpzPmZmRdVxkOjSBOLNtGw_40TsVfSg";
const CONFIGURED=!SUPABASE_URL.startsWith("__");
const SESSION_KEY="sidnote-session",LAST_KEY="sidnote-last-user",EMAIL_DOMAIN="sidnote.netlify.app";
const cacheKey=uid=>"sidnote-u-"+uid;
const ls={get(k){try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}},
          set(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}},
          del(k){try{localStorage.removeItem(k)}catch(e){}}};
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
let data=cache?cache.data:blank();
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
async function api(path,{method="GET",body,token,headers={}}={}){
  const r=await fetch(SUPABASE_URL+path,{method,headers:{apikey:SUPABASE_KEY,"Content-Type":"application/json",...(token?{Authorization:"Bearer "+token}:{}),...headers},body:body?JSON.stringify(body):undefined});
  const txt=await r.text();let j=null;try{j=txt?JSON.parse(txt):null}catch(e){}
  if(!r.ok){const err=new Error((j&&(j.msg||j.message||j.error_description||j.error))||("Erreur "+r.status));err.status=r.status;err.code=j&&(j.error_code||j.code);throw err}
  return j;
}
// v37 : les erreurs de l'app sont envoyées (table client_errors, lisible seulement dans le tableau de bord Supabase) :
// au plus 5 par ouverture, sans doublon, jamais en mode essai ni sans connexion. Aucun contenu de l'utilisateur, juste le message technique.
const APP_V="54";const errSent=new Set();
function reportErr(msg,stack){try{
  msg=String(msg||"").slice(0,500);if(!msg||errSent.has(msg)||errSent.size>=5||!session||session.trial||!navigator.onLine||!CONFIGURED)return;errSent.add(msg);
  token().then(t=>api("/rest/v1/client_errors",{method:"POST",token:t,headers:{Prefer:"return=minimal"},
    body:{user_id:session.user.id,version:APP_V,msg,stack:String(stack||"").slice(0,2000),url:(data.ui&&data.ui.view)||"",ua:navigator.userAgent.slice(0,200)}})).catch(()=>{})}catch(e){}}
addEventListener("error",e=>{if(e.message)reportErr(e.message,e.error&&e.error.stack)});
addEventListener("unhandledrejection",e=>{const r=e.reason;if(r&&(r.trial||r instanceof TypeError&&!navigator.onLine))return;reportErr(r&&r.message||String(r),r&&r.stack)});
// v32 : fonctions réservées (ex. Nutrition), décidées par le serveur dans app_metadata.features
const userFeat=u=>u&&u.app_metadata&&Array.isArray(u.app_metadata.features)?u.app_metadata.features.map(String):null;
function storeSession(j,name){
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
function mergeData(loc,rem,opt){
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
    for(let attempt=0;attempt<4&&!rev;attempt++){
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
  if(isTrial()){el.innerHTML=`<span class="syncdot wait"></span>${L("Mode essai : tes données restent sur cet appareil")}`;const t=document.getElementById("homeTrial");if(t)t.hidden=false;return}
  const wait=cache&&cache.dirty,bad=!!(syncErr&&wait&&navigator.onLine);
  el.innerHTML=bad?`<span class="syncdot err"></span>${L("Synchronisation en échec")} · <button type="button" class="linkbtn" data-syncretry="1">${L("Réessayer")}</button>`
    :`<span class="syncdot ${wait?"wait":""}"></span>`+(!navigator.onLine?"Hors connexion · tes modifications seront envoyées plus tard":wait?"Synchronisation…":"Synchronisé");
  const hb=document.getElementById("homeSync");
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
  box.innerHTML=data.types.map(t=>`<button type="button" class="pill" data-tchip="${esc(t.name)}" aria-pressed="${norm(t.name)===cur}"><span class="dot" style="background:var(${t.c})"></span>${esc(t.name)}</button>`).join("")}
function typeChipsFor(inp){if(!inp||inp.dataset.chips)return;inp.dataset.chips="1";
  const box=document.createElement("div");box.className="chips tchips";box.dataset.for=inp.id;(inp.closest(".two")||inp.closest("label")).after(box);fillTypeChips(box);
  inp.addEventListener("input",()=>fillTypeChips(box))}
document.addEventListener("click",e=>{const c=e.target.closest("[data-tchip]");if(!c)return;const box=c.closest(".tchips"),inp=document.getElementById(box.dataset.for);
  inp.value=c.dataset.tchip;fillTypeChips(box);inp.dispatchEvent(new Event("input",{bubbles:true}))});
if(navigator.storage&&navigator.storage.persist)navigator.storage.persist().catch(()=>{});

/* ---------- utilitaires ---------- */
const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const parse=d=>{const[y,m,x]=d.split("-").map(Number);return new Date(y,m-1,x)};
const today=()=>{const t=new Date();return new Date(t.getFullYear(),t.getMonth(),t.getDate())};
const fmt=d=>{const x=parse(d);return x.getDate()+" "+MO[x.getMonth()]};
const daysTo=d=>Math.round((parse(d)-today())/864e5);
function toast(m,ms){const t=$("toast");t.textContent=m;t.hidden=false;clearTimeout(toast.h);toast.h=setTimeout(()=>t.hidden=true,ms||2200)}
// v34 : message avec un bouton (ex. « Annuler »)
function toastAct(m,label,fn,ms){const t=$("toast");t.innerHTML=`<span>${esc(L(m))}</span><button type="button" class="toast-act">${esc(L(label))}</button>`;t.hidden=false;
  t.querySelector(".toast-act").addEventListener("click",()=>{t.hidden=true;clearTimeout(toast.h);fn()},{once:true});clearTimeout(toast.h);toast.h=setTimeout(()=>t.hidden=true,ms||5000)}
// v34 : suppression immédiate, « Annuler » pendant 5 s (plus de double appui pour confirmer).
// L'annulation remet l'état d'avant ; data.res annule la pierre tombale, même si elle est déjà partie vers les autres appareils.
// o.later : action définitive (fichiers en ligne…) faite seulement quand on ne peut plus annuler ; o.revert : ce que la fusion ne remet pas seule.
let undoPend=null;
function undoable(msg,ids,apply,o){o=o||{};
  if(undoPend)undoPend.flush();
  const snap=JSON.parse(JSON.stringify(forServer(data)));apply();save();if(o.after)o.after();
  let done=false;const tm=setTimeout(()=>p.flush(),5600);
  const p=undoPend={flush(){if(done)return;done=true;clearTimeout(tm);if(undoPend===p)undoPend=null;if(o.later)try{o.later()}catch(e){}}};
  toastAct(msg,"Annuler",()=>{if(done)return;done=true;clearTimeout(tm);if(undoPend===p)undoPend=null;
    const now=Date.now();data.res=data.res||{};ids.forEach(id=>{data.res[id]=now;if(data.del)delete data.del[id]});
    applyRemote(mergeData(data,snap));if(o.revert)o.revert();save();renderAll();if(o.after)o.after();toast("Annulé")},5000)}
const CHECK='<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M2.5 7.5l3 3 6-7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
// suppression en deux temps : 1er appui → bouton rouge « Confirmer ? », 2e appui dans les 3 s → suppression ; sinon le bouton revient
function confirm2(btn,fn,txt){
  if(btn.dataset.c2){clearTimeout(btn._c2);delete btn.dataset.c2;btn.classList.remove("armed");btn.innerHTML=btn._c2h;fn();return}
  btn._c2h=btn.innerHTML;btn.dataset.c2="1";btn.classList.add("armed");btn.textContent=L(txt||"Confirmer ?");
  btn._c2=setTimeout(()=>{delete btn.dataset.c2;btn.classList.remove("armed");btn.innerHTML=btn._c2h},3000);
}
const armDelete=confirm2;
// champs de nombres : au toucher, le curseur va à la fin du nombre (pour effacer et retaper directement)
document.addEventListener("focusin",e=>{const el=e.target;if(!(el instanceof HTMLInputElement)||!/^(numeric|decimal)$/.test(el.inputMode||""))return;
  const end=()=>{try{const n=el.value.length;el.setSelectionRange(n,n)}catch(x){}};end();setTimeout(end,0);setTimeout(end,60)});
// même chose pour un gestionnaire de clic : faux au 1er appui (bouton armé), vrai au 2e
const c2ok=b=>{if(b.dataset.c2){clearTimeout(b._c2);delete b.dataset.c2;b.classList.remove("armed");b.innerHTML=b._c2h;return true}confirm2(b,()=>{});return false};

// v42 : logos (S signature gravé dans la silhouette de chaque app) ; couleur = currentColor, la découpe laisse voir le fond
// (v42–44.6 : logos dessinés ici en SVG ; remplacés en 44.7 par site/icons/*.svg)
// v44.7 : nouvelles icônes des apps (fournies par Sid : pictogramme + sceau « S », version pleine arrondie), dans site/icons/
const LOGO_APPS={home:1,agenda:1,fit:1,note:1};
const LOGO=(app,cls)=>`<img class="logo ${cls||""}" src="icons/${LOGO_APPS[app]?app:"home"}.svg" alt="" aria-hidden="true" draggable="false">`;

// v42 : animation d'ouverture (2 s) : le logo Sid'compagnon, puis les trois apps ; elle ne bloque jamais les touchers
if($("authLogo"))$("authLogo").innerHTML=LOGO("home");
(()=>{const sp=$("splash");if(!sp)return;$("spMark").innerHTML=LOGO("home");$("spApps").innerHTML=["agenda","fit","note"].map(a=>`<span data-app="${a}">${LOGO(a)}</span>`).join("");
  const quick=matchMedia("(prefers-reduced-motion: reduce)").matches;sp.classList.add("go");setTimeout(()=>{sp.remove();bootTop()},quick?400:2100)})();

/* ---------- v43 : animation d'ouverture de sid'agenda, sid'fit et sid'note (≈ 2 s) ----------
   Propre à chaque app (sa couleur, son univers), une variante tirée au hasard à chaque ouverture, avec des réglages
   aléatoires (rythme, sens, nombre d'éléments). Un clic, une touche ou « Passer » l'arrête. Rien si « réduire les animations ». */
let introReady=false,introT=null;
const irnd=(a,b)=>a+Math.random()*(b-a),irint=(a,b)=>Math.floor(irnd(a,b+1)),ipick=a=>a[Math.floor(Math.random()*a.length)];
const INTRO={
  agenda:[
    ()=>{const n=ipick([5,6,7]),rows=ipick([3,4]),dir=Math.random()<.5;let c="";for(let r=0;r<rows;r++)for(let k=0;k<n;k++){const i=r*n+k,d=(dir?i:(rows*n-1-i))*irnd(.025,.04);
        c+=`<rect x="${k*22}" y="${r*22}" width="18" height="18" rx="3" style="animation-delay:${d.toFixed(2)}s" class="${Math.random()<.18?"hot":""}"/>`}
      return `<svg class="it-grid" viewBox="-2 -2 ${n*22+2} ${rows*22+2}" aria-hidden="true">${c}</svg>`},
    ()=>{const t=irnd(.9,1.3).toFixed(2),turns=ipick([1,1.25,1.5]),cw=Math.random()<.5?1:-1;
      return `<svg class="it-clock" viewBox="0 0 120 120" aria-hidden="true" style="--t:${t}s;--turn:${turns*cw*360}deg"><circle cx="60" cy="60" r="52"/><circle class="arc" cx="60" cy="60" r="52"/>${[...Array(12)].map((_,i)=>`<path d="M60 12v6" transform="rotate(${i*30} 60 60)"/>`).join("")}<path class="hand" d="M60 60V22"/><path class="hand2" d="M60 60h26"/></svg>`},
    ()=>{const n=irint(4,6);return `<div class="it-pages" aria-hidden="true">${[...Array(n)].map((_,i)=>`<span style="animation-delay:${(i*irnd(.1,.16)).toFixed(2)}s;--r:${irnd(-6,6).toFixed(1)}deg"><b>${new Date(Date.now()+i*864e5).getDate()}</b></span>`).join("")}</div>`}],
  fit:[
    ()=>{const amp=irint(18,30),beats=irint(2,3);let d="M0 50",x=0;for(let b=0;b<beats;b++){d+=` L${x+30} 50 L${x+38} ${50-amp} L${x+46} ${50+amp*.7} L${x+54} 50`;x+=70}d+=` L${x+20} 50`;
      return `<svg class="it-pulse" viewBox="0 0 ${x+20} 100" aria-hidden="true" style="--len:${x*2}"><path d="${d}"/></svg>`},
    ()=>{const n=irint(5,8),h=[...Array(n)].map(()=>irint(30,100));return `<div class="it-bars" aria-hidden="true">${h.map((v,i)=>`<i style="--h:${v}%;animation-delay:${(i*irnd(.05,.09)).toFixed(2)}s"></i>`).join("")}</div>`},
    ()=>{const reps=irint(6,10);return `<svg class="it-ring" viewBox="0 0 120 120" aria-hidden="true" style="--t:${irnd(1,1.3).toFixed(2)}s"><circle cx="60" cy="60" r="50"/><circle class="arc" cx="60" cy="60" r="50"/>${[...Array(reps)].map((_,i)=>`<g transform="rotate(${i*360/reps} 60 60)"><circle class="dot" cx="60" cy="10" r="3" style="animation-delay:${(.2+i*1/reps).toFixed(2)}s"/></g>`).join("")}</svg>`}],
  note:[
    ()=>{const w=[irint(60,90),irint(70,100),irint(40,80),irint(65,95)];return `<div class="it-lines" aria-hidden="true">${w.map((v,i)=>`<i style="--w:${v}%;animation-delay:${(i*irnd(.18,.26)).toFixed(2)}s"></i>`).join("")}</div>`},
    ()=>{const k=irnd(.9,1.2).toFixed(2),y=irint(-8,8);return `<svg class="it-sign" viewBox="0 0 200 90" aria-hidden="true" style="--t:${k}s"><path d="M10 ${60+y} C 40 ${10+y}, 60 ${80-y}, 85 45 S 120 ${15+y}, 140 55 S 175 ${70-y}, 190 ${35+y}"/></svg>`},
    ()=>{const n=irint(3,5);return `<div class="it-stack" aria-hidden="true">${[...Array(n)].map((_,i)=>`<span style="animation-delay:${(i*irnd(.12,.18)).toFixed(2)}s;--x:${irint(-14,14)}px;--r:${irnd(-5,5).toFixed(1)}deg"></span>`).join("")}</div>`}]};
const INTRO_NAME={agenda:"sid'agenda",fit:"sid'fit",note:"sid'note"};
function appIntro(app,vv){
  if(!INTRO[app]||matchMedia("(prefers-reduced-motion: reduce)").matches||window.__noIntro)return;
  introEnd(true);const el=document.createElement("div");el.className="app-intro";el.id="appIntro";el.dataset.app=app;el.setAttribute("role","presentation");
  const v=vv!==undefined?vv:Math.floor(Math.random()*INTRO[app].length);el.dataset.variant=v;
  el.innerHTML=`<div class="ai-art">${INTRO[app][v]()}</div><div class="ai-brand"><span class="ai-logo">${LOGO(app)}</span><span class="ai-name">${INTRO_NAME[app]}</span></div><button type="button" class="ai-skip">${L("Passer")}</button>`;
  document.body.appendChild(el);el.addEventListener("pointerdown",e=>{e.preventDefault();introEnd()});el.querySelector(".ai-skip").addEventListener("click",()=>introEnd());
  introT=setTimeout(()=>introEnd(),2000)}
function introEnd(now){clearTimeout(introT);const el=$("appIntro");if(!el)return;if(now){el.remove();return}el.classList.add("out");setTimeout(()=>el.remove(),180)}
addEventListener("keydown",e=>{if($("appIntro"))introEnd()},true);
// v44.4 : animation de sortie (retour à Sid'compagnon) : le logo de l'app, au centre, rejoint sa place parmi les 3 logos de l'accueil
const OUT_K={agenda:"orga",fit:"sport",note:"perso"};
function appOutro(app){
  if(matchMedia("(prefers-reduced-motion: reduce)").matches||window.__noIntro||!document.body.animate)return;
  introEnd(true);$("appOutro")?.remove();
  const el=document.createElement("div");el.className="app-outro";el.id="appOutro";el.dataset.app=app;el.setAttribute("aria-hidden","true");
  el.innerHTML=`<div class="ao-brand"><span class="ao-logo">${LOGO(app)}</span><span class="ao-name">${INTRO_NAME[app]}</span></div>`;
  document.body.appendChild(el);
  const lg=el.querySelector(".ao-logo"),nm=el.querySelector(".ao-name"),tile=document.querySelector(`[data-gapp="${OUT_K[app]}"] .home-applogo`);
  const done=()=>el.remove(); // l'overlay laisse passer les touchers : on peut rouvrir une app sans attendre
  el.animate([{opacity:1},{opacity:1,offset:.55},{opacity:0}],{duration:1500,easing:"ease-out",fill:"forwards"}).onfinish=done; // v44.5 : 1,5 s (demande de Sid)
  nm.animate([{opacity:1,transform:"none"},{opacity:1,transform:"none",offset:.4},{opacity:0,transform:"translateY(6px)"}],{duration:600,easing:"ease-in",fill:"forwards"});
  const r=lg.getBoundingClientRect(),t=tile&&tile.getBoundingClientRect();
  if(t&&t.width&&t.top<innerHeight){const dx=t.left+t.width/2-(r.left+r.width/2),dy=t.top+t.height/2-(r.top+r.height/2),k=t.width/r.width;
    lg.animate([{transform:"none"},{transform:`translate(${dx}px,${dy}px) scale(${k})`}],{duration:1000,delay:300,easing:"cubic-bezier(.45,0,.2,1)",fill:"forwards"})}
  else lg.animate([{transform:"none",opacity:1},{transform:"scale(.6)",opacity:0}],{duration:1000,delay:300,easing:"ease-in",fill:"forwards"});
  $("v-home")?.animate([{opacity:0,transform:"translateY(8px)"},{opacity:1,transform:"none"}],{duration:700,delay:800,easing:"ease-out",fill:"backwards"})}
/* ---------- onglets, rangés par catégories ---------- */
// La barre du bas montre des catégories ; dans une catégorie, une barre en haut permet de choisir la fonction.
// v25 : les catégories deviennent des « espaces » (page Espaces + barre latérale sur ordinateur)
// v42 : trois applications dans l'application mère Sid'compagnon (même compte, mêmes données) ; Réglages et Compte sont dans Sid'compagnon
const GROUPS=[
  {k:"orga",label:"sid'agenda",app:"agenda",tabs:["plan","todo","pomo"]}, // v41 : Listes retirées ; v42 : Focus (pomodoro) revient
  {k:"sport",label:"sid'fit",app:"fit",tabs:["muscu","nutri","graph"]},
  {k:"perso",label:"sid'note",app:"note",tabs:["notes","docs","pwd"]},
  {k:"more",label:"Sid'compagnon",app:"home",tabs:["more","app"]}];
const APP_GROUPS=GROUPS.slice(0,3);
const appOf=v=>v==="home"||v==="spaces"?"home":groupOf(v).app;
const SHORT={plan:"Agenda",todo:"Tâches",lists:"Listes",pomo:"Focus",muscu:"Musculation",nutri:"Nutrition",graph:"Graphiques",notes:"Notes",docs:"Documents",pwd:"Mots de passe",more:"Réglages",app:"Installer l'app"};
const ICON=k=>{const e=$("fnIcons").querySelector(`[data-ic="${k}"]`);return e?e.innerHTML:""};
const groupOf=v=>GROUPS.find(g=>g.tabs.includes(v))||GROUPS[0];
// v32 : Nutrition et Graphiques n'apparaissent que pour les comptes qui y ont accès (décidé par le serveur)
const RESERVED={}; // v39 : Nutrition et Graphiques ouverts à tous (le calcul passe par l'IA de chacun, plus par la clé de Sid)
const tabAllowed=k=>!RESERVED[k]||!!(session&&Array.isArray(session.feat)&&session.feat.includes(RESERVED[k]));
const OFF_TABS=["lists"];
const visibleTabs=()=>[...TABS.filter(([k])=>!OFF_TABS.includes(k)&&tabAllowed(k)&&data.prefs.tabs[k]!==false).map(([k])=>k),"more"];
const groupTabs=g=>g.tabs.filter(k=>visibleTabs().includes(k));
// icônes du dock et de la barre latérale
const HOMEIC=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z"/></svg>`;
const GRIDIC=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/></svg>`;
const USERIC=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M5 21v-1a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v1"/></svg>`;
const PLUSIC=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`;
// v28 : la barre du bas montre directement les 3 espaces (demande de Sid) : Aujourd'hui, Organisation, Santé, Coffre, Compte.
// Toucher un espace rouvre sa dernière fonction ; en haut, des pastilles passent d'une fonction à l'autre. Le « + » est sur la page Aujourd'hui.
const DOCK=[["home","Aujourd'hui",HOMEIC],["orga","Organisation",null],["sport","Santé",null],["perso","Coffre",null],["more","Compte",USERIC]];
// v42 : la barre du bas montre les fonctions de l'app ouverte (sid'agenda : Agenda, Tâches, Focus…) ; dans Sid'compagnon, pas de barre
// v44.7 : la page garde toujours en bas la place de la barre (sa hauteur réelle, 0 si elle est cachée) : le dernier élément
// n'est plus coupé derrière (ordinateur avec la barre latérale masquée, téléphone, tablette)
function navPad(){const n=document.querySelector("nav"),h=n&&!n.hidden&&getComputedStyle(n).display!=="none"?Math.ceil(n.getBoundingClientRect().height):0;
  document.documentElement.style.setProperty("--navh",h+"px")}
addEventListener("resize",()=>requestAnimationFrame(navPad));
if(window.ResizeObserver)new ResizeObserver(()=>navPad()).observe(document.querySelector("nav"));
function renderNav(v){requestAnimationFrame(navPad);const nav=document.querySelector("nav"),a=appOf(v);
  if(a==="home"){nav.hidden=true;document.body.classList.remove("has-nav");return}
  const ts=groupTabs(groupOf(v));nav.hidden=false;document.body.classList.add("has-nav");$("navIn").style.gridTemplateColumns=`repeat(${ts.length},minmax(0,1fr))`;
  $("navIn").innerHTML=ts.map(k=>`<button type="button" class="tab" data-go="${k}"${k===v?' aria-current="page"':""}><span class="tabicon">${ICON(k)}</span><span class="tab-l">${L(SHORT[k])}</span>${badgeHtml(k)}</button>`).join("")}
// page affichée → bouton du dock allumé
const dockOf=v=>v==="home"?"home":v==="more"||v==="app"?"more":v==="spaces"?"":groupOf(v).k;
// espace touché → dernière fonction ouverte dans cet espace (sinon la première affichée)
function openGroup(k){const g=GROUPS.find(x=>x.k===k);if(!g)return;const ts=groupTabs(g);if(!ts.length)return;
  // chaque app s'ouvre toujours sur sa fonction principale (demandes de Sid) : sid'agenda → Agenda, sid'fit → Nutrition, sid'note → Notes
  const OPEN_ON={orga:"plan",sport:"nutri",perso:"notes"},first=OPEN_ON[k];if(k==="orga"&&Object.keys(planOpenMem).length){planOpenMem={};renderPlan()}
  const last=first&&ts.includes(first)?first:data.ui.glast&&data.ui.glast[k];show(ts.includes(last)?last:ts[0])}
// pastilles : chaque fonction a la sienne, dans la barre du haut (À faire : tâches ouvertes, Pomodoro : en cours)
const BADGES={};
const badgeHtml=k=>{const b=BADGES[k];return !b?"":b==="dot"?`<i class="sbadge dot" aria-label="${L("En cours")}"></i>`:`<i class="sbadge">${b>99?"99+":b}</i>`};
function setBadge(k,v){if(BADGES[k]===v)return;BADGES[k]=v;
  const sb=document.querySelector(`#navIn [data-go="${k}"]`);if(sb)sb.querySelector(".sbadge")?.remove(),sb.insertAdjacentHTML("beforeend",badgeHtml(k));
  renderGroupBadges()}
// en bas : seulement si la catégorie n'a qu'une fonction affichée (sinon la pastille est en haut)
function renderGroupBadges(){GROUPS.forEach(g=>{const el=document.querySelector(`[data-gbadge="${g.k}"]`);if(!el)return;const ts=groupTabs(g),b=ts.length===1?BADGES[ts[0]]:0;
  el.hidden=!b;el.textContent=b&&b!=="dot"?b:"";el.classList.toggle("dot",b==="dot")})}
function show(v){
  if(v!=="home"&&v!=="spaces"&&!visibleTabs().includes(v))v="home";
  const g=groupOf(v);
  const wasApp=document.documentElement.dataset.app;
  {const was=wasApp,nx=appOf(v);if(introReady&&was&&nx!=="home"&&was!==nx)appIntro(nx)}
  data.ui.view=v;if(GROUPS.some(x=>x.tabs.includes(v))){data.ui.glast=data.ui.glast||{};data.ui.glast[g.k]=v}saveUI();
  document.body.dataset.g=g.k;document.body.dataset.v=v;if(v!=="notes")document.body.classList.remove("note-full");if(v==="more"){try{renderBio();renderAiCards();$("mcpSec").hidden=!session||isTrial()}catch(e){}}
  document.querySelectorAll(".view").forEach(s=>s.hidden=s.id!=="v-"+v);
  document.documentElement.dataset.app=appOf(v);renderNav(v);renderVhead(v);renderSide(v);
  if(v==="home")renderHome();
  if(v==="spaces")renderSpaces();
  if(v==="more"){renderStats();renderTabsCard();renderHomeSel();renderLook();if(session)renderNotif()}
  // v37 : le coffre se reverrouille en le quittant, tout de suite ou après le délai choisi (Réglages)
  secCheck();for(const k of SEC_K){if(k===v)delete secAway[k];else secLeave(k)}
  if(v==="docs")docsEnter();
  if(v!=="docs"&&ps&&ps.host)psEnd(null);
  if(v==="pwd"){renderPwd();if(!vaultKey&&pinStep==="unlock")bioAuto("main",()=>$("pinBio").click())}
  if(v==="lists")slEnter();
  if(v==="notes"&&!noteOpenId)renderNotes();
  if(v!=="notes"&&v!=="nutri")dictStop();
  if(v==="nutri")renderNutri();
  if(v==="todo"&&!TV().doneCal){TV().doneCal=true;renderTodos()} // v31 : « Réalisées » s'ouvre toujours sur le calendrier
  if(v==="graph")renderGraph();
  if(v!=="graph")grTipHide();
  if(v==="pomo")renderSpotify();
  window.scrollTo(0,0);
  if(v==="home"&&introReady&&INTRO[wasApp])appOutro(wasApp);
}
$("navIn").addEventListener("click",e=>{const t=e.target.closest("[data-go]");if(t)show(t.dataset.go)});
function applyTabs(){
  const vis=visibleTabs();
  const v=data.ui.view;if(v&&v!=="home"&&v!=="spaces"&&!vis.includes(v))show("home");else{renderSide(v);if(v)renderNav(v);if(v==="home")renderHome()}
}
// --- en-tête d'un module : nom de l'espace + pastilles de ses fonctions ---
// v28 : nom de l'espace + pastilles des fonctions de cet espace (Agenda · Tâches · Focus…)
// v42 : en-tête d'une app : son logo et son nom, et le retour à Sid'compagnon (les fonctions sont dans la barre du bas)
function renderVhead(v){const el=$("vhead");
  if(v==="home"||v==="spaces"){el.hidden=true;return}
  const g=groupOf(v);el.hidden=false;el.classList.remove("many");
  el.innerHTML=`<span class="ah-brand">${LOGO(g.app,"ah-logo")}<span class="eyebrow">${esc(g.label)}</span></span><button type="button" class="ah-home" data-go="home" aria-label="${L("Retour à Sid'compagnon")}">${GRIDIC}<span>Sid'compagnon</span></button>`}
$("vhead").addEventListener("click",e=>{const b=e.target.closest("[data-go]");if(b)show(b.dataset.go)});
// --- page Espaces et barre latérale (ordinateur) : tous les modules, rangés par espace, avec un chiffre utile ---
function spaceMeta(k){try{
  if(k==="plan"){const t0=iso(today()),n=allT().filter(t=>t.status!=="fait"&&!t.canc&&(t.end||t.date)>=t0).length;return n?`${n} ${L("à venir")}`:""}
  if(k==="todo"){const n=data.todos.filter(t=>!t.done&&!t.paused).length;return n?`${n} ${L(n>1?"ouvertes":"ouverte")}`:""}
  if(k==="pomo"){const m=Math.round(((data.pomo&&data.pomo.log||{})[dayKey(new Date())]||0)/60000);return m?`${m} min ${L("aujourd'hui")}`:""}
  if(k==="nutri"){const n=NU();if(!nutriAllowed()||!n.plan||!n.plan.kcal)return"";const left=Math.round(dayTarget(iso(today())).kcal-sumOf(dayLog(iso(today()))).kcal);return `${fmtFull(Math.max(0,left))} kcal`}
  if(k==="notes"){const n=NT().length;return n?String(n):""}
  if(k==="docs"){const n=docsArr().length;return n?String(n):""}
  if(k==="muscu"){const n=(data.muscu&&data.muscu.sessions||[]).length;return n?`${n} ${L(n>1?"séances":"séance")}`:""}
  return""}catch(e){return""}}
const CHEVR=`<svg class="chev-r" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>`;
function renderSpaces(){
  $("spacesList").innerHTML=GROUPS.map(g=>{const ts=groupTabs(g);if(!ts.length)return"";
    return `<div class="eyebrow sp-h">${L(g.label)}</div><div class="card sp-card">${ts.map(k=>`<button type="button" class="sp-row" data-go="${k}"><span class="sp-ic">${ICON(k)||USERIC}</span><span class="grow">${L(SHORT[k])}</span><span class="sp-meta">${esc(spaceMeta(k))}</span>${CHEVR}</button>`).join("")}</div>`}).join("");
}
$("spacesList").addEventListener("click",e=>{const b=e.target.closest("[data-go]");if(b)show(b.dataset.go)});
// v43 : la barre latérale (ordinateur et tablette) peut être masquée ; le choix est propre à l'appareil (data.ui.sideOff).
// Par défaut : affichée à partir de 960 px, masquée sur tablette (768–959 px). Masquée, la barre du bas de l'app reprend sa place.
const SIDEIC='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="4.5" width="17" height="15" rx="2"/><path d="M9.5 4.5v15"/></svg>';
function sideApply(){requestAnimationFrame(navPad);const wide=matchMedia("(min-width:768px)").matches,u=data.ui||{};
  const on=wide&&(u.sideOff===undefined?innerWidth>=960:!u.sideOff);
  document.body.classList.toggle("side-off",wide&&!on);document.body.classList.toggle("side-on",on);
  const sb=$("sideShow");if(sb){sb.hidden=!(wide&&!on);sb.setAttribute("aria-expanded","false")}}
function sideToggle(show){data.ui.sideOff=!show;saveUI();sideApply();const f=show?document.querySelector("#side .side-tog"):$("sideShow");if(f)f.focus({preventScroll:true})}
addEventListener("resize",()=>sideApply());
function renderSide(v){const el=$("side");if(!el)return;v=v||data.ui.view;
  el.innerHTML=`<div class="side-brand">${LOGO("home","side-logo")}<span class="grow">Sid'compagnon</span><button type="button" class="side-tog" aria-label="${L("Masquer la barre latérale")}" title="${L("Masquer la barre latérale")}" aria-expanded="true" aria-controls="side">${SIDEIC}</button></div>
    <button type="button" class="side-it" data-go="home" aria-current="${v==="home"}"><span class="sp-ic">${HOMEIC}</span><span class="grow">${L("Aujourd'hui")}</span></button>
    <button type="button" class="side-add" data-sadd="1"><span class="sp-ic">${PLUSIC}</span><span class="grow">${L("Ajouter")}</span></button>`+
    GROUPS.map(g=>{const ts=groupTabs(g);if(!ts.length)return"";
      return `<div class="side-grp" data-app="${g.app}"><div class="eyebrow side-h">${g.app!=="home"?LOGO(g.app,"side-applogo"):""}${esc(g.label)}</div>`+ts.map(k=>`<button type="button" class="side-it" data-go="${k}" aria-current="${v===k}"><span class="sp-ic">${ICON(k)||USERIC}</span><span class="grow">${L(SHORT[k])}</span><span class="sp-meta">${esc(spaceMeta(k))}</span></button>`).join("")+`</div>`}).join("");
  sideApply()}
$("sideShow").addEventListener("click",()=>sideToggle(true));
$("side").addEventListener("click",e=>{if(e.target.closest(".side-tog")){sideToggle(false);return}if(e.target.closest("[data-sadd]")){openQuickAdd();return}const b=e.target.closest("[data-go]");if(b)show(b.dataset.go)});
// --- ajout rapide (bouton + de la page Aujourd'hui et de la barre latérale) ---
function openQuickAdd(){const vis=visibleTabs(),acts=[
  ["plan","Une activité","Dans ton agenda",ICON("plan")],["todo","Une tâche","Dans ta liste",ICON("todo")],["notes","Une note","Texte ou photo",ICON("notes")],
  ["nutri","Un repas","Ce que tu manges",ICON("nutri")],["muscu","Une séance","Musculation",ICON("muscu")]].filter(a=>vis.includes(a[0]));
  $("qaList").innerHTML=acts.map(([k,t,s,ic])=>`<button type="button" class="qa-it" data-qa="${k}"><span class="sp-ic">${ic}</span><span class="grow"><b>${L(t)}</b><span class="small muted">${L(s)}</span></span>${CHEVR}</button>`).join("");
  $("qaSheet").hidden=false}
$("qaClose").addEventListener("click",()=>$("qaSheet").hidden=true);
$("qaSheet").addEventListener("click",e=>{if(e.target.id==="qaSheet"){$("qaSheet").hidden=true;return}const b=e.target.closest("[data-qa]");if(!b)return;$("qaSheet").hidden=true;const k=b.dataset.qa;show(k);
  setTimeout(()=>{if(k==="plan")openTaskSheet()
    else if(k==="todo")$("todoIn").focus();
    else if(k==="notes"){if(noteOpenId)closeNote();$("noteNew").click()}
    else if(k==="nutri"){nuGoTab("day");$("nuAsk").focus();$("nuAsk").scrollIntoView({block:"center"})}
    else if(k==="muscu"){$("msName")&&$("msName").focus()}},80)});
// --- page Aujourd'hui : la journée en un coup d'œil ---
function inCount(ms){const m=Math.round(ms/60000);if(m<60)return `${L("dans")} ${m} min`;const h=Math.floor(m/60),r=m%60;return `${L("dans")} ${h} h${r?" "+two(r):""}`}
function renderHome(){if(!$("homeBody"))return;
  const now=new Date(),t0=iso(today()),nm=(session&&session.name||"").trim(); // v42 : surnom complet
  $("homeDate").textContent=`${DOW[now.getDay()]} ${now.getDate()} ${MOL[now.getMonth()]}`;
  $("homeHello").textContent=`${L(now.getHours()>=18?"Bonsoir":"Bonjour")}${nm?" "+nm:""}.`;
  $("homeAvatar").textContent=(nm||"S").slice(0,2).toUpperCase();
  const vis=visibleTabs(),T=vis.includes("plan")?allT().filter(t=>t.status!=="fait"&&!t.canc):[];
  const start=t=>{const d=parse(t.date);const[h,m]=(t.time||"08:00").split(":").map(Number);d.setHours(h,m);return d};
  const next=T.filter(t=>t.time&&start(t)>now).sort((a,b)=>start(a)-start(b))[0]||T.filter(t=>!t.time&&t.date>t0).sort((a,b)=>a.date.localeCompare(b.date))[0];
  // v44.7 : Sid'compagnon = 3 grandes cartes, une par app (nom, identité, ce qu'elle fait en une ligne, 1 ou 2 repères du jour) ;
  // toucher une carte ouvre l'app. Tout le reste a quitté cette page (il est dans chaque app).
  const cards=[];
  {const g=APP_GROUPS.find(x=>x.app==="agenda");if(groupTabs(g).length){const it=[];
    if(next){const s=start(next),same=next.date===t0,tm=parse(next.date);tm.setDate(tm.getDate()-1);
      const when=next.time&&same?inCount(s-now):next.time&&iso(tm)===t0?`${L("demain")} · ${next.time}`:`${DOW[s.getDay()]} ${s.getDate()} ${MO[s.getMonth()]}${next.time?" · "+next.time:""}`;
      it.push([L("Prochain"),`<span class="notr">${esc(next.title)}</span>`,esc(when)])}
    if(vis.includes("todo")){const n=dayTodos(t0).filter(t=>!t.done).length;it.push([L("Tâches"),n?`${n} ${L(n>1?"tâches aujourd'hui":"tâche aujourd'hui")}`:L("Aucune tâche aujourd'hui"),""])}
    if(!it.length)it.push([L("Prochain"),L("Rien de prévu"),""]);
    cards.push({g,desc:"Ton agenda et tes tâches, jour après jour.",it})}}
  {const g=APP_GROUPS.find(x=>x.app==="fit");if(groupTabs(g).length){const it=[];
    if(vis.includes("nutri")&&nutriAllowed()&&NU().plan&&NU().plan.kcal){const tg=dayTarget(t0).kcal,eat=sumOf(dayLog(t0)).kcal;it.push([L("Nutrition"),`${fmtFull(Math.round(eat))} / ${fmtFull(tg)} kcal`,""])}
    if(vis.includes("muscu")){const nd=coachNext();if(nd)it.push([L("Séance"),`<span class="notr">${esc(nd.name)}</span>`,""])}
    if(!it.length)it.push([L("Pour commencer"),L("Crée ton profil ou ta première séance"),""]);
    cards.push({g,desc:"Musculation, nutrition et graphiques de ta forme.",it:it.slice(0,2)})}}
  {const g=APP_GROUPS.find(x=>x.app==="note");if(groupTabs(g).length){const it=[];
    const last=NT().filter(n=>!n.secret&&(n.title||n.body)).sort((a,b)=>(b.upd||0)-(a.upd||0))[0];
    if(last)it.push([L("Dernière note"),`<span class="notr">${esc(last.title||String(last.body||"").slice(0,40))}</span>`,""]);
    const nN=NT().length;it.push([L("Classeur"),`${nN} ${L(nN>1?"notes":"note")} · ${NF().length} ${L(NF().length>1?"dossiers":"dossier")}`,""]);
    cards.push({g,desc:"Notes, documents et mots de passe, à l'abri.",it:it.slice(0,2)})}}
  let h=`<div class="hc-list">${cards.map(({g,desc,it})=>`<button type="button" class="hc" data-app="${g.app}" data-gapp="${g.k}">
    <span class="hc-top">${LOGO(g.app,"home-applogo hc-logo")}<span class="hc-name">${esc(g.label)}</span><span class="hc-go" aria-hidden="true">›</span></span>
    <span class="hc-desc">${L(desc)}</span>
    <span class="hc-items">${it.map(([k,v,w])=>`<span class="hc-it"><span class="hc-k">${k}</span><span class="hc-v">${v}${w?` <span class="hc-w">· ${w}</span>`:""}</span></span>`).join("")}</span>
  </button>`).join("")}</div>`;
  $("homeBody").innerHTML=h}
$("homeBody").addEventListener("click",e=>{
  const ga=e.target.closest("[data-gapp]");if(ga){openGroup(ga.dataset.gapp);return}
  if(e.target.closest("[data-aioff]")){data.ui.aiCardOff=1;saveUI();renderHome();return}
  const hg=e.target.closest("[data-htg]");if(hg){const t=data.todos.find(x=>x.id===hg.dataset.htg);if(t){todoToggle(t);renderHome()}return}
  const hp=e.target.closest("[data-hplan]");if(hp){const t=data.todos.find(x=>x.id===hp.dataset.hplan);if(t){t.day=iso(today());save();renderTodos();renderHome();toast("Prévue aujourd'hui")}return}
  const n=e.target.closest("[data-note-open]");if(n){show("notes");openNote(n.dataset.noteOpen);return}
  const fo=e.target.closest("[data-folder-open]");if(fo){show("notes");noteDir=fo.dataset.folderOpen;renderNotes();window.scrollTo(0,0);return}
  const td=e.target.closest("[data-todo-open]");if(td){goToTodo(td.dataset.todoOpen);return}const b=e.target.closest("[data-go]");if(b)show(b.dataset.go)});
$("homeAvatar").addEventListener("click",()=>show("more"));
$("homeAdd").addEventListener("click",openQuickAdd);
// ouvre « Tâches » directement sur une tâche : filtre et recherche retirés, catégorie dépliée, tâche mise en évidence
function goToTodo(id){const t=data.todos.find(x=>x.id===id);show("todo");if(!t)return;
  TV().cat="all";todoQ="";if($("todoSearch"))$("todoSearch").value="";
  const k=t.cat&&catOf(t.cat)?t.cat:"none";if(TV().fold[k])delete TV().fold[k];tvSave();renderTodos();
  setTimeout(()=>{const r=document.querySelector(`#v-todo [data-tid="${id}"]`);if(!r)return;r.scrollIntoView({block:"center",behavior:"smooth"});
    r.classList.remove("hl");void r.offsetWidth;r.classList.add("hl")},60)}
setInterval(()=>{if(data.ui.view==="home"&&!document.hidden)renderHome()},60000);
function renderTabsCard(){
  $("tabsCard").innerHTML=GROUPS.map(g=>`<div class="tabgrp">${ICON("g-"+g.k)}${L(g.label)}</div><div class="card">`+
    g.tabs.filter(tabAllowed).map(k=>k==="more"?`<div class="row"><span class="grow">${L("Réglages")}</span><span class="small muted">${L("toujours affiché")}</span></div>`
      :`<label class="row" style="cursor:pointer"><span class="grow">${L(TABS.find(t=>t[0]===k)[1])}</span><input type="checkbox" class="switch" data-tabpref="${k}" ${data.prefs.tabs[k]!==false?"checked":""}></label>`).join("")+`</div>`).join("");
}
$("tabsCard").addEventListener("change",e=>{const c=e.target.closest("[data-tabpref]");if(!c)return;
  data.prefs.tabs[c.dataset.tabpref]=c.checked;save();applyTabs();renderHomeSel();toast(c.checked?"Onglet affiché":"Onglet masqué")});

/* ---------- À faire ---------- */
// v39 : tâches planifiées (todo.day = AAAA-MM-JJ). Une tâche pas faite à temps passe toute seule au jour suivant :
// le jour affiché devient aujourd'hui (tDay), sans réécrire les données ; tLate = nombre de jours de retard (badge « reportée »).
const tDay=t=>{if(!t||!t.day)return null;if(t.done)return t.day;const k=iso(today());return t.day<k?k:t.day};
const tLate=t=>!t.done&&t.day&&t.day<iso(today())?Math.round((parse(iso(today()))-parse(t.day))/864e5):0;
const doneDay=t=>t.doneAt?iso(new Date(t.doneAt)):null;
// tâches d'un jour : prévues (ou reportées) ce jour-là, et celles réalisées ce jour-là qui étaient planifiées
const dayTodos=k=>data.todos.filter(t=>!t.paused&&(t.done?t.day&&doneDay(t)===k:tDay(t)===k)).sort((a,b)=>(a.done-b.done)||ordSort(a,b));
function dayLbl(k){const t0=iso(today());if(k===t0)return L("Aujourd'hui");const d=parse(k),tm=new Date(today());tm.setDate(tm.getDate()+1);
  if(k===iso(tm))return L("Demain");return `${DOW[d.getDay()].slice(0,3)}. ${d.getDate()} ${MO[d.getMonth()]}`}
const planChip=t=>{if(t.done||!t.day)return"";const n=tLate(t);return ` <span class="tchip ${n?"late":tDay(t)===iso(today())?"today":""}">${n?`↻ ${L("reportée")}`:esc(dayLbl(t.day))}</span>`};
function todoToggle(t){t.done=!t.done;delete t.paused;if(t.done){t.doneAt=new Date().toISOString();if(t.day&&t.day<iso(today()))t.day=iso(today());toast("Tâche réalisée")}else delete t.doneAt;
  freshId=t.id;save();renderTodos();if(navigator.vibrate)navigator.vibrate(10)}
// planifier : aujourd'hui, demain, une date, ou retirer la date
function todoPlan(t,after){const set=k=>{if(k)t.day=k;else delete t.day;t.upd=Date.now();save();renderTodos();if(after)after();toast(k?`${L("Prévue")} : ${dayLbl(k)}`:"Date retirée")};
  const tm=new Date(today());tm.setDate(tm.getDate()+1);
  openActions(L("Planifier"),[{l:"Aujourd'hui",on:t.day===iso(today()),fn:()=>set(iso(today()))},{l:"Demain",on:t.day===iso(tm),fn:()=>set(iso(tm))},
    {l:"Choisir une date…",fn:()=>{const i=$("planPick");i.value=t.day||iso(today());i.onchange=()=>{if(i.value)set(i.value)};try{i.showPicker()}catch(e){i.focus();i.click()}}},
    ...(t.day?[{l:"Retirer la date",fn:()=>set(null)}]:[])])}
let freshId=null,todoQ="";
const PEN=`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/></svg>`,PAUSE=`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M9 6v12M15 6v12"/></svg>`;
const DOWL=["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"];
const mlow=i=>LANG==="en"?MOL[i]:MOL[i].toLowerCase();
const two=n=>String(n).padStart(2,"0");
const CHEV=`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>`;
const GRIP=`<svg width="14" height="18" viewBox="0 0 14 18" aria-hidden="true" fill="currentColor"><circle cx="4" cy="4" r="1.6"/><circle cx="10" cy="4" r="1.6"/><circle cx="4" cy="9" r="1.6"/><circle cx="10" cy="9" r="1.6"/><circle cx="4" cy="14" r="1.6"/><circle cx="10" cy="14" r="1.6"/></svg>`;
const TC=()=>data.todoCats||(data.todoCats=[]);
const catOf=id=>TC().find(c=>c.id===id);
function todoDel(id){undoable("Tâche supprimée",[id],()=>{tomb(id);data.todos=data.todos.filter(x=>x.id!==id)},{after:renderTodos})}
// v34 : une ligne simple : rond (réaliser), titre (toucher = modifier), « ⋯ » pour le reste (suspendre, déplacer, supprimer)
const MORE=`<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.9"/><circle cx="12" cy="12" r="1.9"/><circle cx="19" cy="12" r="1.9"/></svg>`;
const ttlBtn=(t,extra)=>`<button type="button" class="grow ttl ttl-btn" data-edit="todo:${t.id}">${esc(t.title)}${extra||""}</button>`;
const moreBtn=t=>`<button class="pen" data-tmore="${t.id}" aria-label="Plus d'actions">${MORE}</button>`;
function todoRow(t){
  if(t.done){const d=new Date(t.doneAt||t.createdAt);
    return `<div class="row done ${t.id===freshId?"fresh":""}"><span class="donetime">${two(d.getHours())}:${two(d.getMinutes())}</span>
    <button class="check" data-tg="${t.id}" aria-label="Remettre à faire">${CHECK}</button>${ttlBtn(t,catLbl(t))}${moreBtn(t)}</div>`}
  if(t.paused)return `<div class="row paused ${t.id===freshId?"fresh":""}">${ttlBtn(t,catLbl(t))}
    <button class="resume" data-resume="${t.id}">Reprendre</button>${moreBtn(t)}</div>`;
  return `<div class="row ${t.id===freshId?"fresh":""}" data-tid="${t.id}">
    ${todoQ?"":`<button class="grip" data-grip="1" aria-label="Déplacer" title="Maintenir et glisser pour déplacer">${GRIP}</button>`}
    <button class="check" data-tg="${t.id}" aria-label="Terminer">${""}</button>${ttlBtn(t,planChip(t))}${moreBtn(t)}</div>`;
}
// fenêtre d'actions réutilisable : openActions(titre, [{l, fn, danger, on}])
function openActions(title,items){$("actTitle").textContent=title;
  $("actList").innerHTML=items.map((it,i)=>`<button type="button" class="act-it ${it.danger?"danger":""}" data-act="${i}" ${it.on?'aria-pressed="true"':""}>${esc(L(it.l))}${it.on?CHECK:""}</button>`).join("");
  $("actSheet")._items=items;$("actSheet").hidden=false}
const closeActions=()=>{$("actSheet").hidden=true};
$("actSheet").addEventListener("click",e=>{if(e.target.id==="actSheet"||e.target.closest("#actClose")){closeActions();return}
  const b=e.target.closest("[data-act]");if(!b)return;const it=$("actSheet")._items[+b.dataset.act];
  if(it.danger){confirm2(b,()=>{if(!it.keep)closeActions();it.fn()});return}
  if(!it.keep)closeActions();it.fn()});
function todoActions(id){const t=data.todos.find(x=>x.id===id);if(!t)return;
  const it=[{l:"Modifier",fn:()=>openEdit("todo:"+id)}];
  if(!t.done)it.push({l:t.day?"Changer la date":"Planifier un jour",fn:()=>todoPlan(t)});
  if(!t.done)it.push(t.paused?{l:"Reprendre",fn:()=>{delete t.paused;delete t.pausedAt;freshId=t.id;save();renderTodos();toast("Tâche reprise")}}
    :{l:"Mettre en suspens",fn:()=>{t.paused=true;t.pausedAt=new Date().toISOString();freshId=t.id;save();renderTodos();toast("Tâche mise en suspens")}});
  else it.push({l:"Remettre à faire",fn:()=>{t.done=false;delete t.doneAt;freshId=t.id;save();renderTodos()}});
  if(TC().length)it.push({l:"Déplacer vers une catégorie",fn:()=>openActions(L("Déplacer vers"),[{l:"Sans catégorie",on:!t.cat,fn:()=>{delete t.cat;save();renderTodos()}},
    ...TC().map(c=>({l:c.name,on:t.cat===c.id,fn:()=>{t.cat=c.id;save();renderTodos();toast(`${L("Rangé dans")} « ${c.name} »`)}}))])});
  it.push({l:"Supprimer",danger:true,fn:()=>todoDel(id)});
  openActions(t.title,it)}
// petite étiquette de catégorie (dans « Toutes » seulement)
function catLbl(t){const c=t.cat&&catOf(t.cat);return c&&curCat()==="all"?` <span class="small muted">· ${esc(c.name)}</span>`:""}
const mondayOf=d=>{const x=new Date(d.getFullYear(),d.getMonth(),d.getDate());x.setDate(x.getDate()-((x.getDay()+6)%7));return x};
function doneGroups(list){
  // année > mois > semaine > jour, du plus récent au plus ancien
  let h="",Y=null,M=null,W=null,D=null,open=false;
  const close=()=>{if(open){h+="</div>";open=false}};
  for(const t of list){
    const d=new Date(t.doneAt||t.createdAt),y=d.getFullYear(),m=d.getMonth(),mon=mondayOf(d),w=iso(mon),dk=iso(d);
    if(y!==Y){close();h+=`<div class="grp-y">${y}</div>`;Y=y;M=null}
    if(m!==M){close();h+=`<div class="grp-m">${MOL[m]}</div>`;M=m;W=null}
    if(w!==W){close();const sun=new Date(mon);sun.setDate(sun.getDate()+6);
      h+=`<div class="grp-w">${L("Semaine du")} ${mon.getDate()}${mon.getMonth()!==sun.getMonth()?" "+MO[mon.getMonth()]:""} ${L("au")} ${sun.getDate()} ${MO[sun.getMonth()]}</div>`;W=w;D=null}
    if(dk!==D){if(!open){h+='<div class="card" style="margin-bottom:8px">';open=true}h+=`<div class="grp-d">${DOWL[d.getDay()]} ${d.getDate()} ${mlow(m)}</div>`;D=dk}
    h+=todoRow(t);
  }
  close();return h;
}
// v28 : catégories repliées, sections ouvertes et catégorie choisie sont gardées dans le compte (data.prefs.todoView) :
// on retrouve Tâches comme on l'a laissé, même après avoir fermé l'app ou sur un autre appareil
function TV(){const p=data.prefs;if(!p.todoView){const u=data.ui||{};p.todoView={fold:{...(u.todoFold||{})},doneOpen:!!u.doneOpen,pausedOpen:u.pausedOpen!==false,cat:u.todoCat||"all",showFin:!!u.showDoneCats,doneCal:false}}
  const v=p.todoView;v.fold=v.fold||{};return v}
const tvSave=()=>{data.prefs.todoView={...TV()};save()};
// v28 : tâches réalisées en calendrier : chaque jour montre combien de tâches ont été faites ; toucher un jour affiche sa liste
let dcMonth=null,dcSel=null;
function doneCal(list){const byDay={};list.forEach(t=>{const k=iso(new Date(t.doneAt||t.createdAt));(byDay[k]=byDay[k]||[]).push(t)});
  const now=new Date(),cur=now.getFullYear()*12+now.getMonth();if(dcMonth===null)dcMonth=cur;
  const y=Math.floor(dcMonth/12),m=dcMonth%12,first=new Date(y,m,1),shift=(first.getDay()+6)%7,nd=new Date(y,m+1,0).getDate(),tk=iso(now);
  const max=Math.max(1,...Object.entries(byDay).filter(([k])=>k.startsWith(`${y}-${two(m+1)}`)).map(([,v])=>v.length));
  const monthN=Object.entries(byDay).filter(([k])=>k.startsWith(`${y}-${two(m+1)}`)).reduce((a,[,v])=>a+v.length,0);
  let g="";for(let i=0;i<shift;i++)g+="<span></span>";
  for(let d=1;d<=nd;d++){const k=`${y}-${two(m+1)}-${two(d)}`,n=(byDay[k]||[]).length,lv=n?Math.ceil(n/max*4):0;
    g+=`<button type="button" class="dc-d lv${lv} ${k===tk?"td":""}" data-dcday="${k}" aria-pressed="${dcSel===k}" ${n?"":"disabled"} aria-label="${d} ${MOL[m]} : ${n}"><span>${d}</span>${n?`<b>${n}</b>`:""}</button>`}
  const sel=dcSel&&byDay[dcSel];const sd=dcSel?parse(dcSel):null;
  return `<div class="card dc"><div class="dc-top"><button type="button" class="mini" data-dcm="${dcMonth-1}" aria-label="${L("Mois précédent")}">‹</button><b>${L(MOL[m])} ${y}</b><button type="button" class="mini" data-dcm="${dcMonth+1}" ${dcMonth>=cur?"disabled":""} aria-label="${L("Mois suivant")}">›</button></div>
    <div class="small muted" style="text-align:center;margin:-2px 0 8px">${monthN} ${L(monthN>1?"tâches réalisées ce mois-ci":"tâche réalisée ce mois-ci")}</div>
    <div class="dc-g">${[...({fr:"LMMJVSD",en:"MTWTFSS",nl:"MDWDVZZ"}[LANG]||"LMMJVSD")].map(x=>`<i>${x}</i>`).join("")}${g}</div></div>`+
    (sel?`<div class="grp-d" style="margin:10px 4px 6px">${DOWL[sd.getDay()]} ${sd.getDate()} ${mlow(sd.getMonth())} · ${sel.length} ${L(sel.length>1?"tâches":"tâche")}</div><div class="card">${sel.map(todoRow).join("")}</div>`
      :`<p class="small muted" style="text-align:center;margin:10px 0 0">${L("Touche un jour pour voir ce que tu as fait.")}</p>`)}
const curCat=()=>{const c=TV().cat||"all";return c==="all"||c==="none"||catOf(c)?c:"all"};
const ordSort=(a,b)=>((typeof a.ord==="number"?a.ord:1e9)-(typeof b.ord==="number"?b.ord:1e9))||a.createdAt.localeCompare(b.createdAt);
let catEditing=false,todoDragging=false,todoRenderPending=false;
function renderTodos(){
  if(todoDragging){todoRenderPending=true;return}
  const q=norm(todoQ),match=t=>!q||fold(t.title).includes(fold(todoQ.trim()));
  const cc=curCat(),inCat=t=>cc==="all"||(cc==="none"?!(t.cat&&catOf(t.cat)):t.cat===cc);
  const all=data.todos.filter(inCat),cats=TC();
  const open=all.filter(t=>!t.done&&!t.paused&&match(t)).sort(ordSort);
  const paused=all.filter(t=>!t.done&&t.paused&&match(t)).sort((a,b)=>(a.pausedAt||"").localeCompare(b.pausedAt||""));
  const done=all.filter(t=>t.done&&match(t)).sort((a,b)=>(b.doneAt||"").localeCompare(a.doneAt||""));
  const doneOpen=q?true:!!TV().doneOpen,pausedOpen=q?true:TV().pausedOpen!==false;
  // catégories
  const openN=id=>data.todos.filter(t=>!t.done&&!t.paused&&(id==="none"?!(t.cat&&catOf(t.cat)):t.cat===id)).length;
  // une catégorie dont toutes les tâches sont réalisées quitte la rangée du haut (rangée dans « ✓ Terminées »)
  const finished=c=>!openN(c.id)&&!data.todos.some(t=>t.cat===c.id&&t.paused)&&data.todos.some(t=>t.cat===c.id&&t.done);
  const fin=cats.filter(finished),showFin=!!TV().showFin||fin.some(c=>c.id===cc);
  const isl=window.SCIslands&&window.SCIslands.todos&&!window.__noIslands;
  if(!isl)$("todoCats").innerHTML=`<button class="pill" data-tcat="all" aria-pressed="${cc==="all"}">${L("Toutes")}</button>`+
    cats.filter(c=>!finished(c)).map(c=>`<button class="pill" data-tcat="${c.id}" aria-pressed="${cc===c.id}">${esc(c.name)} <span class="cnt">${openN(c.id)||""}</span></button>`).join("")+
    (fin.length?`<button class="pill" data-tcatfin="1" aria-pressed="${showFin}">✓ ${fin.length} ${L(fin.length>1?"terminées":"terminée")}</button>`+(showFin?fin.map(c=>`<button class="pill" data-tcat="${c.id}" aria-pressed="${cc===c.id}" style="opacity:.75">✓ ${esc(c.name)}</button>`).join(""):""):"")+
    `<button class="pill add" data-tcatnew="1">+ ${L("Catégorie")}</button>`;
  const cat=catOf(cc);
  $("catBar").hidden=!cat;
  if(cat&&!isl){const tot=data.todos.filter(t=>t.cat===cat.id&&!t.paused).length,dn=data.todos.filter(t=>t.cat===cat.id&&t.done).length;
    $("catBar").innerHTML=catEditing?`<form id="catRename" style="display:flex;gap:8px;width:100%"><input id="catRenIn" value="${esc(cat.name)}" aria-label="Nouveau nom" autocomplete="off"><button class="btn" type="submit">OK</button></form>`
      :`<div class="grow"><b>${esc(cat.name)}</b><div class="small muted">${tot?`${dn}/${tot} ${L("réalisées")}`:L("Aucune tâche pour l'instant")}</div></div>
        <div class="cat-prog" style="width:70px"><i style="width:${tot?dn/tot*100:0}%"></i></div>
        <button class="mini" data-catren="1">${L("Renommer")}</button><button class="x" data-catdel="1" aria-label="Supprimer la catégorie">×</button>`}
  $("todoIn").placeholder=cat?`${L("Nouvelle tâche dans")} « ${cat.name} »…`:L("Nouvelle tâche…");
  // liste à faire
  const emptyMsg=`<div class="card"><div class="empty">${q?"Aucune tâche à faire ne correspond.":all.some(t=>t.done)?"Tout est réalisé. Bravo !":cat?"Aucune tâche dans cette catégorie. Ajoute-en une ci-dessus.":"Aucune tâche. Ajoute-en une ci-dessus."}</div></div>`;
  if(isl){}
  else if(cc==="all"&&cats.length&&open.length){
    // v44.6 : les tâches sans catégorie d'abord, puis les catégories
    const groups=[{c:null,items:open.filter(t=>!(t.cat&&catOf(t.cat)))},...cats.map(c=>({c,items:open.filter(t=>t.cat===c.id)}))].filter(g=>g.items.length);
    // chaque catégorie peut être repliée (réglage propre à cet appareil)
    const fold=TV().fold,allFolded=groups.every(g=>fold[g.c?g.c.id:"none"]);
    const fbtn=(k,n)=>`<button class="foldc" data-tfold="${k}" aria-expanded="${!fold[k]}" aria-label="${L(fold[k]?"Déplier":"Replier")}">${CHEV}</button>`;
    const body=(k,items)=>fold[k]?"":`<div class="card" data-group="${k}">${items.map(todoRow).join("")}</div>`;
    const cnt=(k,n)=>fold[k]?`<span class="fold-n">${n}</span>`:"";
    $("todoOpen").innerHTML=(groups.length>1?`<div style="display:flex;justify-content:flex-end;margin:-4px 0 -10px"><button type="button" class="mini" data-tfoldall="1">${L(allFolded?"Tout déplier":"Tout replier")}</button></div>`:"")+groups.map(g=>{
      if(!g.c)return `<div class="cat-h">${fbtn("none")}<h2>${L("Sans catégorie")}</h2>${cnt("none",g.items.length)}</div>${body("none",g.items)}`;
      const tot=data.todos.filter(t=>t.cat===g.c.id&&!t.paused).length,dn=data.todos.filter(t=>t.cat===g.c.id&&t.done).length;
      return `<div class="cat-h">${fbtn(g.c.id)}<h2><button class="back" data-tcat="${g.c.id}" style="padding:0;font:inherit;color:inherit;text-transform:inherit;letter-spacing:inherit">${esc(g.c.name)} ›</button></h2>${cnt(g.c.id,g.items.length)}<span class="small muted">${dn}/${tot}</span><div class="cat-prog"><i style="width:${tot?dn/tot*100:0}%"></i></div></div>${body(g.c.id,g.items)}`}).join("");
  }else $("todoOpen").innerHTML=open.length?`<div class="card" data-group="${cc}">${open.map(todoRow).join("")}</div>`:emptyMsg;
  $("foldPaused").hidden=!paused.length;
  $("pausedTitle").textContent=`${L("En suspens")} (${paused.length})`;$("pausedArrow").textContent=L(pausedOpen?"Masquer":"Afficher");
  if(!isl)$("todoPaused").innerHTML=pausedOpen?paused.map(todoRow).join(""):"";$("todoPaused").hidden=!pausedOpen||!paused.length;
  $("foldDone").hidden=!done.length;
  $("doneTitle").textContent=`${L("Réalisées")} (${done.length})`;$("doneArrow").textContent=L(doneOpen?"Masquer":"Afficher");
  $("doneView").hidden=!doneOpen||!done.length||!!q;$("doneView").querySelectorAll("[data-dv]").forEach(b=>b.setAttribute("aria-pressed",String((b.dataset.dv==="cal")===!!TV().doneCal)));
  if(!isl)$("todoDone").innerHTML=doneOpen?(TV().doneCal&&!q?doneCal(done):doneGroups(done)):"";$("todoDone").hidden=!doneOpen||!done.length;
  const n=all.length,nd=all.filter(t=>t.done).length,no=data.todos.filter(t=>!t.done&&!t.paused).length;
  $("pfill").style.width=n?(nd/n*100)+"%":"0";
  $("ptext").textContent=n?`${nd}/${n}`:"";
  setBadge("todo",no);
  // v54 (#3) : listes rendues par React (même rendu) ; en cas d'erreur, ancien rendu
  if(isl){try{const v=TV();if(dcMonth===null){const n=new Date();dcMonth=n.getFullYear()*12+n.getMonth()}
      window.SCIslands.todos({cats:$("todoCats"),bar:$("catBar"),open:$("todoOpen"),paused:$("todoPaused"),done:$("todoDone")},
        {todos:data.todos,cats,open,paused,done,view:{cat:cc,fold:v.fold,doneOpen:!!v.doneOpen,pausedOpen:v.pausedOpen!==false,showFin:!!v.showFin,doneCal:!!v.doneCal},
         search:!!q,grip:!todoQ,catEditing,freshId,today:iso(today()),dcMonth,dcSel,i18n:{...agI18n(),DOW,DOWL,lang:LANG||"fr"}})}
    catch(e){reportErr("island todos: "+(e&&e.message));window.__noIslands=true;try{renderTodos()}finally{window.__noIslands=false}return}}
  freshId=null;
}
$("todoSearch").addEventListener("input",e=>{todoQ=e.target.value;renderTodos()});
// v44.6 : la recherche s'ouvre avec la loupe (et se referme vide)
$("todoSearchBtn").addEventListener("click",()=>{const i=$("todoSearch"),open=i.hidden;i.hidden=!open;$("todoSearchBtn").setAttribute("aria-expanded",open);
  if(open)i.focus();else if(todoQ){todoQ="";i.value="";renderTodos()}});
$("todoSearch").addEventListener("blur",e=>{if(!e.target.value)setTimeout(()=>{if(!$("todoSearch").value&&document.activeElement!==$("todoSearch")){$("todoSearch").hidden=true;$("todoSearchBtn").setAttribute("aria-expanded","false")}},150)});
// crée (ou retrouve) une catégorie à partir de son nom
function catMake(name){const v=name.trim().replace(/\s+/g," ");if(!v)return null;
  let c=TC().find(x=>norm(x.name)===norm(v));const isNew=!c;if(!c){c={id:uid(),name:v};TC().push(c)}
  TV().cat=c.id;$("catIn").value="";$("catForm").hidden=true;return {c,isNew}}
$("todoForm").addEventListener("submit",e=>{
  e.preventDefault();const v=$("todoIn").value.trim();if(!v)return;
  // v28 : nom de catégorie tapé mais pas validé → la catégorie est créée et la tâche y est rangée
  if(!$("catForm").hidden&&$("catIn").value.trim()){const r=catMake($("catIn").value);if(r&&r.isNew)toast(`${L("Catégorie créée")} : ${r.c.name}`)}
  const q=parseQuick(v),t={id:uid(),title:q.date&&q.title?q.title:v,createdAt:new Date().toISOString(),done:false};
  if(q.date&&q.title)t.day=q.date; // v39 : « Appeler maman demain » → prévue demain
  const cc=curCat();if(catOf(cc))t.cat=cc;
  data.todos.push(t);freshId=t.id;save();renderTodos();$("todoIn").value="";
});
$("catForm").addEventListener("submit",e=>{
  e.preventDefault();const v=$("catIn").value.trim().replace(/\s+/g," ");if(!v)return;
  if(TC().some(c=>norm(c.name)===norm(v))){toast("Cette catégorie existe déjà");return}
  catMake(v);save();renderTodos();toast("Catégorie créée");$("todoIn").focus();
});
$("foldDone").addEventListener("click",()=>{const v=TV();v.doneOpen=!v.doneOpen;tvSave();renderTodos()});
$("foldPaused").addEventListener("click",()=>{const v=TV();v.pausedOpen=v.pausedOpen===false;tvSave();renderTodos()});
$("doneView").addEventListener("click",e=>{const b=e.target.closest("[data-dv]");if(!b)return;TV().doneCal=b.dataset.dv==="cal";tvSave();renderTodos()});
$("v-todo").addEventListener("submit",e=>{if(e.target.id!=="catRename")return;e.preventDefault();
  const c=catOf(curCat()),v=$("catRenIn").value.trim().replace(/\s+/g," ");if(c&&v){c.name=v;save()}catEditing=false;renderTodos()});
document.getElementById("v-todo").addEventListener("click",e=>{
  const b=e.target.closest("button");if(!b)return;
  const find=id=>data.todos.find(x=>x.id===id);
  if(b.dataset.dcday){dcSel=dcSel===b.dataset.dcday?null:b.dataset.dcday;renderTodos();return}
  if(b.dataset.dcm){dcMonth=+b.dataset.dcm;dcSel=null;renderTodos();return}
  if(b.dataset.tcat){TV().cat=b.dataset.tcat;catEditing=false;tvSave();$("catForm").hidden=true;renderTodos();return}
  if(b.dataset.tfold){const f=TV().fold,k=b.dataset.tfold;if(f[k])delete f[k];else f[k]=1;tvSave();renderTodos();return}
  if(b.dataset.tfoldall){const ks=[...document.querySelectorAll("#todoOpen [data-tfold]")].map(x=>x.dataset.tfold),f=TV().fold;
    const close=ks.some(k=>!f[k]);ks.forEach(k=>{if(close)f[k]=1;else delete f[k]});tvSave();renderTodos();return}
  if(b.dataset.tcatfin){const v=TV();v.showFin=!v.showFin;tvSave();renderTodos();return}
  if(b.dataset.tcatnew){const f=$("catForm");f.hidden=!f.hidden;if(!f.hidden)$("catIn").focus();return}
  if(b.dataset.catren){catEditing=true;renderTodos();const i=$("catRenIn");i.focus();i.select();return}
  if(b.dataset.catdel){const c=catOf(curCat());if(!c||!c2ok(b))return;const had=data.todos.filter(t=>t.cat===c.id).map(t=>t.id);
    undoable("Catégorie supprimée, ses tâches sont gardées",[c.id],()=>{tomb(c.id);data.todos.forEach(t=>{if(t.cat===c.id)delete t.cat});data.todoCats=TC().filter(x=>x!==c);TV().cat="all";tvSave()},
      {after:renderTodos,revert:()=>{data.todos.forEach(t=>{if(had.includes(t.id))t.cat=c.id});TV().cat=c.id;tvSave()}});return}
  if(b.dataset.tg){const t=find(b.dataset.tg);if(!t)return;todoToggle(t)}
  else if(b.dataset.pause){const t=find(b.dataset.pause);t.paused=true;t.pausedAt=new Date().toISOString();freshId=t.id;save();renderTodos();toast("Tâche mise en suspens")}
  else if(b.dataset.resume){const t=find(b.dataset.resume);delete t.paused;delete t.pausedAt;freshId=t.id;save();renderTodos();toast("Tâche reprise")}
  else if(b.dataset.del)todoDel(b.dataset.del);
  else if(b.dataset.tmore)todoActions(b.dataset.tmore);
});
// glisser-déposer pour changer l'ordre (poignée ⠿)
$("todoOpen").addEventListener("pointerdown",e=>{
  const g=e.target.closest("[data-grip]");if(!g)return;
  const row=g.closest(".row"),box=row.parentElement;if(!box||!box.dataset.group)return;
  e.preventDefault();
  const rows=[...box.querySelectorAll(":scope > .row[data-tid]")],from=rows.indexOf(row);
  const tops=rows.map(r=>r.offsetTop),hts=rows.map(r=>r.offsetHeight),y0=e.clientY,sy0=window.scrollY;
  let to=from,raf=null,lastY=e.clientY,lastX=e.clientX,pill=null;todoDragging=true;
  row.classList.add("dragging");rows.forEach(r=>{if(r!==row)r.classList.add("drop-anim")});
  try{g.setPointerCapture(e.pointerId)}catch(x){}
  if(navigator.vibrate)navigator.vibrate(10);
  const place=()=>{
    const dy=lastY-y0+(window.scrollY-sy0);row.style.transform=`translateY(${dy}px)`;
    const mid=tops[from]+hts[from]/2+dy;
    // nouvelle position = nombre de lignes dont le centre est au-dessus
    let k=0;for(let i=0;i<rows.length;i++){if(i!==from&&mid>tops[i]+hts[i]/2)k++}to=k;
    rows.forEach((r,i)=>{if(i===from)return;let s=0;if(from<to&&i>from&&i<=to)s=-hts[from];if(from>to&&i>=to&&i<from)s=hts[from];r.style.transform=s?`translateY(${s}px)`:""});
  };
  const scroller=()=>{if(!todoDragging)return;if(lastY<90)window.scrollBy(0,-8);else if(lastY>innerHeight-130)window.scrollBy(0,8);place();raf=requestAnimationFrame(scroller)};
  raf=requestAnimationFrame(scroller);
  // la rangée des catégories reste visible pendant le glisser
  document.body.classList.add("todo-dragging");
  // v28 : lâcher la tâche sur une pastille de catégorie (en haut) la range dans cette catégorie
  const overPill=()=>{const el=document.elementFromPoint(lastX,lastY),p=el&&el.closest("#todoCats [data-tcat]");
    if(p!==pill){if(pill)pill.classList.remove("drop");pill=p;if(pill)pill.classList.add("drop")}};
  const mv=ev=>{lastY=ev.clientY;lastX=ev.clientX;place();row.style.visibility="hidden";overPill();row.style.visibility=""};
  const up=()=>{
    g.removeEventListener("pointermove",mv);g.removeEventListener("pointerup",up);g.removeEventListener("pointercancel",up);
    cancelAnimationFrame(raf);todoDragging=false;document.body.classList.remove("todo-dragging");
    rows.forEach(r=>{r.classList.remove("dragging","drop-anim");r.style.transform=""});
    if(pill){const t=data.todos.find(x=>x.id===row.dataset.tid),k=pill.dataset.tcat,c=catOf(k);pill.classList.remove("drop");
      if(t&&k!=="all"&&(c?t.cat!==c.id:t.cat)){if(c)t.cat=c.id;else delete t.cat;delete t.ord;freshId=t.id;save();toast(c?`${L("Rangée dans")} « ${c.name} »`:L("Tâche sortie de sa catégorie"))}
      todoRenderPending=false;renderTodos();return}
    const ids=rows.map(r=>r.dataset.tid),[m]=ids.splice(from,1);ids.splice(to,0,m);
    if(to!==from){ids.forEach((id,i)=>{const t=data.todos.find(x=>x.id===id);if(t)t.ord=i});save()}
    todoRenderPending=false;renderTodos();
  };
  g.addEventListener("pointermove",mv);g.addEventListener("pointerup",up);g.addEventListener("pointercancel",up);
});

/* ---------- Planning ---------- */
let calY=new Date().getFullYear(),calM=new Date().getMonth(),selDay=null,calMode="month",planQ="",qOpen=false,zoomFrom=null;
const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const DOW=["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"];
const toMin=h=>{if(!h)return null;const[a,b]=h.split(":").map(Number);return a*60+b};
const hrs=t=>t.time?(t.timeEnd?`${t.time}–${t.timeEnd}`:t.time):"";
const sk=t=>t.date+(t.time||"99:99");
const onDay=(t,k)=>t.date===k||(t.end&&t.date<=k&&t.end>=k);
// v47 (#16) : grilles de calendrier communes (agenda, nutrition, choix de jours) : mêmes classes .day / .ym partout
function monthGrid(y,m,cell){const first=new Date(y,m,1),lead=(first.getDay()+6)%7,n=new Date(y,m+1,0).getDate();
  let h="";for(let i=0;i<lead;i++)h+=`<span class="day out"></span>`;for(let d=1;d<=n;d++)h+=cell(iso(new Date(y,m,d)),d);return h}
function yearGrid(y,cls){const now=today();let h="";
  for(let m=0;m<12;m++){const first=new Date(y,m,1),lead=(first.getDay()+6)%7,n=new Date(y,m+1,0).getDate();
    let g="";for(let i=0;i<lead;i++)g+="<i></i>";
    for(let d=1;d<=n;d++)g+=`<i class="${cls(iso(new Date(y,m,d)))}">${d}</i>`;
    h+=`<button class="ym ${y===now.getFullYear()&&m===now.getMonth()?"cur":""}" data-ym="${m}" aria-label="${MOL[m]} ${y}"><b>${MOL[m]}</b><div class="ym-g">${g}</div></button>`}return h}
// v53 (#3) : textes des îlots de l'agenda (tr = traduction avec les motifs, comme la traduction automatique du DOM)
const agI18n=()=>({tr:x=>LANG&&LANG!=="fr"?trStr(x):x,L,MOL,MO,locale:LANG==="en"?"en-GB":LANG==="nl"?"nl-BE":"fr-BE"});
function renderMonth(){
  const T=allT(),tIso=iso(today());
  $("calTitle").innerHTML=`${MOL[calM]} ${calY} <span class="yr-ic">▦ ${L("Année")}</span>`;$("calTitle").setAttribute("aria-label",`${MOL[calM]} ${calY}, ${L("voir toute l'année")}`);
  if(window.SCIslands&&window.SCIslands.agMonth&&!window.__noIslands){try{window.SCIslands.agMonth($("calDays"),{y:calY,m:calM,today:tIso,tasks:T,color:colorOf,i18n:agI18n()});return}catch(e){reportErr("island agMonth: "+(e&&e.message))}}
  const h=monthGrid(calY,calM,(k,d)=>{
    const per=T.filter(t=>t.end&&t.date<=k&&t.end>=k).slice(0,2);
    const pts=T.filter(t=>!t.end&&t.date===k);
    const bars=per.map(t=>`<i class="${t.date===k?"s":""} ${t.end===k?"e":""}" style="--c:var(${colorOf(t)})"></i>`).join("");
    const dots=pts.slice(0,3).map(t=>`<i style="--c:var(${colorOf(t)});opacity:${t.status==="fait"||t.canc?.35:1}"></i>`).join("");
    return `<button class="day ${k===tIso?"today":""} ${k<tIso?"past":""}" data-day="${k}" aria-label="${d} ${MOL[calM]}${per.length+pts.length?", "+(per.length+pts.length)+" élément(s)":""}"><span class="num">${d}</span><span class="marks">${bars?`<span class="bars">${bars}</span>`:""}${dots?`<span class="dots">${dots}</span>`:""}</span></button>`});
  $("calDays").innerHTML=h;
}
// v39 : tâches du jour dans l'agenda (cocher, ajouter pour ce jour) ; les reportées arrivent sur aujourd'hui
function dayTasksBox(k){if(!visibleTabs().includes("todo"))return"";const list=dayTodos(k),past=k<iso(today());
  const row=t=>`<div class="dt-row ${t.done?"done":""}"><button type="button" class="check" data-dtg="${t.id}" aria-label="${L(t.done?"Remettre à faire":"Terminer")}">${t.done?CHECK:""}</button><button type="button" class="grow ttl ttl-btn" data-dtmore="${t.id}">${esc(t.title)}${tLate(t)?` <span class="tchip late">↻ ${L("reportée")}</span>`:""}</button></div>`;
  return `<div class="card dt-box"><div class="dt-h"><b>${IC("check")||""} ${L("Tâches du jour")}</b><span class="small muted">${list.filter(t=>t.done).length}/${list.length}</span></div>
    ${list.map(row).join("")||`<div class="small muted dt-empty">${L(past?"Aucune tâche ce jour-là.":"Aucune tâche prévue. Ajoute-en une ci-dessous.")}</div>`}
    ${past?"":`<form class="dt-add" data-dtadd="${k}"><input placeholder="${L("+ Tâche pour ce jour")}" aria-label="${L("Nouvelle tâche pour ce jour")}" autocomplete="off" enterkeyhint="done"></form>`}</div>`}
function renderDayView(){
  if(window.SCIslands&&window.SCIslands.dayView&&!window.__noIslands){try{const n=new Date();
    window.SCIslands.dayView($("calDayView"),{day:selDay,today:iso(today()),tasks:allT(),todos:visibleTabs().includes("todo")?dayTodos(selDay):null,qOpen,nowMin:n.getHours()*60+n.getMinutes(),
      color:colorOf,checkIcon:IC("check")||"",i18n:{...agI18n(),DOW,lang:LANG||"fr"}});return}catch(e){reportErr("island dayView: "+(e&&e.message))}}
  const T=allT(),k=selDay,tIso=iso(today()),sd=parse(k);
  const items=T.filter(t=>onDay(t,k)).sort((a,b)=>sk(a).localeCompare(sk(b)));
  const timed=items.filter(t=>t.time&&t.date===k),allday=items.filter(t=>!(t.time&&t.date===k));
  // plage horaire affichée
  let H0=7,H1=22;
  timed.forEach(t=>{const s=toMin(t.time),e=Math.max(toMin(t.timeEnd)||0,s+60);H0=Math.min(H0,Math.floor(s/60));H1=Math.max(H1,Math.min(24,Math.ceil(e/60)))});
  const PX=48;
  // colonnes pour les activités qui se chevauchent
  const ev=timed.map(t=>{const s=toMin(t.time);let e=toMin(t.timeEnd);if(e===null||e<=s)e=s+60;return{t,s,e,col:0}}).sort((a,b)=>a.s-b.s);
  const ends=[];ev.forEach(x=>{let c=ends.findIndex(e=>e<=x.s);if(c<0){c=ends.length;ends.push(0)}ends[c]=x.e;x.col=c});
  const ncol=Math.max(1,ends.length);
  let hours="";for(let hh=H0;hh<=H1;hh++)hours+=`<div class="hr" style="top:${(hh-H0)*PX}px"><span>${two(hh%24)}:00</span></div>`;
  const blocks=ev.map(x=>`<button class="blk ${x.t.status==="fait"?"fait":""} ${x.t.canc?"canc":""}" ${x.t.src==="ical"?`data-icalinfo="${esc(x.t.id)}"`:`data-edit="task:${x.t.id}"`} style="--c:var(${colorOf(x.t)});top:${(x.s/60-H0)*PX+1}px;height:${Math.max((x.e-x.s)/60*PX-2,26)}px;left:calc(${x.col*100/ncol}% + 2px);width:calc(${100/ncol}% - 4px)"><span class="t">${hrs(x.t)}${x.t.canc?'<span class="canc-pill">Annulé</span>':""}</span><b>${esc(x.t.title)}</b>${x.t.loc?`<span class="loc">${esc(x.t.loc)}</span>`:""}</button>`).join("");
  let now="";if(k===tIso){const n=new Date(),m=n.getHours()*60+n.getMinutes();if(m>=H0*60&&m<=H1*60)now=`<div class="nowline" style="top:${(m/60-H0)*PX}px"></div>`}
  const prev=new Date(sd);prev.setDate(prev.getDate()-1);const nxt=new Date(sd);nxt.setDate(nxt.getDate()+1);
  $("calDayView").innerHTML=`<div class="dayv-head">
      <button class="back" id="dayBack">‹ ${MOL[sd.getMonth()]}</button>
      <div class="dayv-title">${DOW[sd.getDay()]} ${sd.getDate()} ${mlow(sd.getMonth())}${k===tIso?" · aujourd'hui":""}</div>
      <button class="cal-nav" data-dayjump="${iso(prev)}" aria-label="Jour précédent">‹</button><button class="cal-nav" data-dayjump="${iso(nxt)}" aria-label="Jour suivant">›</button>
    </div>
    ${allday.length?`<div class="allday">${allday.map(t=>`<div class="chip-ev ${t.canc?"canc":""}" style="--c:var(${colorOf(t)})"><span class="grow ttl" style="${t.status==="fait"?"text-decoration:line-through;color:var(--muted)":""}">${t.time?`<span class="time">${hrs(t)}</span> `:""}${esc(t.title)}${t.end?` <span class="small muted">· ${fmt(t.date)} → ${fmt(t.end)}</span>`:""}</span>${t.src==="ical"?(t.canc?'<span class="canc-pill">Annulé</span>':""):`<button class="pen" data-edit="task:${t.id}" aria-label="Modifier">${PEN}</button><button class="x" data-caldel="${t.id}" aria-label="Supprimer">×</button>`}</div>`).join("")}</div>`:""}
    ${dayTasksBox(k)}
    ${!items.length?`<p class="small muted" style="margin:0 4px 8px">Rien de prévu ce jour-là.</p>`:""}
    <div class="tline" style="height:${(H1-H0)*PX}px">${hours}${blocks}${now}</div>
    ${qOpen?`<form class="qform" id="qForm">
      <input id="qTitle" placeholder="Que fais-tu ce jour-là ?" aria-label="Activité" required autocomplete="off">
      <div class="small muted" style="margin:2px 0 -4px">Heures (optionnel)</div><div class="two"><label>Heure de début<input id="qTime" type="time"></label><label>Heure de fin<input id="qTimeEnd" type="time"></label></div>
      <div class="two"><label>Type<input id="qCat" list="typeList" placeholder="Ex. Sport" autocomplete="off"></label><label>Jusqu'au (optionnel)<input id="qEnd" type="date" min="${k}"></label></div>
      <div class="two"><button type="button" class="btn ghost" id="qCancel">Annuler</button><button class="btn" type="submit">Ajouter</button></div>
    </form>`:`<button class="qbtn" id="qOpen">+ Ajouter une activité ce jour</button>`}`;
}
function renderCal(){
  if(!selDay)selDay=iso(today());
  const day=calMode==="day",yr=calMode==="year";
  $("calMonth").hidden=day||yr;$("calDayView").hidden=!day;$("calYear").hidden=!yr;
  $("calH2").textContent=L(day?"Journée":yr?"Cette année":"Ce mois-ci");
  if(day)renderDayView();else if(yr)renderYear();else renderMonth();
}
// vue année : 12 petits mois, jours avec activité en couleur, aujourd'hui en rouge (comme le Calendrier de l'iPhone)
function renderYear(){
  if(window.SCIslands&&window.SCIslands.agYear&&!window.__noIslands){try{window.SCIslands.agYear($("calYear"),{y:calY,today:iso(today()),tasks:allT(),i18n:agI18n()});return}catch(e){reportErr("island agYear: "+(e&&e.message))}}
  const T=allT(),tIso=iso(today()),has=new Set();T.forEach(t=>{if(!t.date)return;const e=t.end&&t.end>t.date?t.end:t.date;for(let d=parse(t.date);iso(d)<=e;d.setDate(d.getDate()+1))has.add(iso(d))});
  const h=yearGrid(calY,k=>`${k===tIso?"td":has.has(k)?"ev":""} ${k<tIso?"past":""}`);
  $("calYear").innerHTML=`<div class="yr-head"><button class="cal-nav" data-yrn="-1" aria-label="${L("Année précédente")}">‹</button><button type="button" class="yr-title" data-yrtoday="1" aria-label="${L("Revenir au mois actuel")}">${calY}<span class="yr-ic">↩ ${L("Mois actuel")}</span></button><button class="cal-nav" data-yrn="1" aria-label="${L("Année suivante")}">›</button></div><div class="yr-grid">${h}</div>
    <p class="small muted" style="text-align:center;margin:10px 0 4px">${L("Touche un mois pour l'ouvrir.")} <button type="button" class="linkbtn" data-yrtoday="1" style="background:none;border:0;cursor:pointer">${L("Aujourd'hui")}</button></p>`;
}
$("calYear").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;
  if(b.dataset.yrn){calY+= +b.dataset.yrn;renderCal();return}
  if(b.dataset.yrtoday){const t=today();calY=t.getFullYear();calM=t.getMonth();calMode="month";renderCal();zoom($("calMonth"));return}
  if(b.dataset.ym){const r=b.getBoundingClientRect(),c=$("calYear").getBoundingClientRect();
    $("calMonth").style.setProperty("--zo",`${((r.left+r.width/2-c.left)/c.width*100).toFixed(0)}% ${((r.top-c.top)/c.height*100).toFixed(0)}%`);
    calM=+b.dataset.ym;calMode="month";renderCal();zoom($("calMonth"))}});
// pincer pour dézoomer (mois → année) ou zoomer (année → mois)
(()=>{let d0=0,ratio=1,mid=null;const dist=t=>Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY);const box=document.querySelector(".card.cal");
  box.addEventListener("touchstart",e=>{if(e.touches.length===2){d0=dist(e.touches);ratio=1;mid={x:(e.touches[0].clientX+e.touches[1].clientX)/2,y:(e.touches[0].clientY+e.touches[1].clientY)/2}}},{passive:true});
  box.addEventListener("touchmove",e=>{if(e.touches.length===2&&d0){e.preventDefault();ratio=dist(e.touches)/d0}},{passive:false});
  box.addEventListener("touchend",()=>{if(!d0)return;const r=ratio;d0=0;
    if(r<.75&&calMode==="month"){calMode="year";renderCal();zoom($("calYear"))}
    else if(r>1.33&&calMode==="year"){const el=document.elementFromPoint(mid.x,mid.y),b=el&&el.closest("[data-ym]");calM=b?+b.dataset.ym:calM;calMode="month";renderCal();zoom($("calMonth"))}});
})();
function zoom(el){el.classList.remove("zoom");void el.offsetWidth;el.classList.add("zoom")}
$("calDays").addEventListener("click",e=>{const b=e.target.closest(".day[data-day]");if(!b)return;
  const r=b.getBoundingClientRect(),c=$("calMonth").getBoundingClientRect();
  $("calDayView").style.setProperty("--zo",`${((r.left+r.width/2-c.left)/c.width*100).toFixed(0)}% ${((r.top-c.top)/c.height*100).toFixed(0)}%`);
  selDay=b.dataset.day;calMode="day";qOpen=false;renderCal();zoom($("calDayView"))});
$("calDayView").addEventListener("click",e=>{
  const dg=e.target.closest("[data-dtg]");if(dg){const t=data.todos.find(x=>x.id===dg.dataset.dtg);if(t){todoToggle(t);renderCal();renderHome()}return}
  const dm=e.target.closest("[data-dtmore]");if(dm){todoActions(dm.dataset.dtmore);return}
  const ii=e.target.closest("[data-icalinfo]");if(ii){icalInfo(ii.dataset.icalinfo);return}
  const d=e.target.closest("[data-caldel]");
  if(d){taskDel(d.dataset.caldel);return}
  const j=e.target.closest("[data-dayjump]");if(j){selDay=j.dataset.dayjump;qOpen=false;renderCal();return}
  if(e.target.closest("#dayBack")){const sd=parse(selDay);calY=sd.getFullYear();calM=sd.getMonth();calMode="month";renderCal();zoom($("calMonth"));return}
  if(e.target.closest("#qOpen")){qOpen=true;renderCal();$("qTitle").focus()}
  else if(e.target.closest("#qCancel")){qOpen=false;renderCal()}
});
$("calDayView").addEventListener("submit",e=>{
  e.preventDefault();
  const da=e.target.closest("[data-dtadd]");if(da){const i=da.querySelector("input"),v=i.value.trim();if(!v)return;i.value="";
    data.todos.push({id:uid(),title:v,createdAt:new Date().toISOString(),done:false,day:da.dataset.dtadd});save();renderTodos();renderCal();
    const ni=$("calDayView").querySelector("[data-dtadd] input");if(ni)ni.focus();return}const title=$("qTitle").value.trim();if(!title)return;
  const t={id:uid(),title,date:selDay,status:"à faire",tbc:false,cat:ensureType($("qCat").value)};
  if($("qEnd").value&&$("qEnd").value>selDay)t.end=$("qEnd").value;
  if($("qTime").value)t.time=$("qTime").value;
  if(t.time&&$("qTimeEnd").value&&$("qTimeEnd").value>t.time)t.timeEnd=$("qTimeEnd").value;
  data.tasks.push(t);qOpen=false;save();renderPlan();renderTypes();toast("Ajouté au calendrier");
});
$("calPrev").addEventListener("click",()=>{calM--;if(calM<0){calM=11;calY--}renderCal()});
$("calNext").addEventListener("click",()=>{calM++;if(calM>11){calM=0;calY++}renderCal()});
$("calTitle").addEventListener("click",()=>{calMode="year";renderCal();zoom($("calYear"))});
$("planSearch").addEventListener("input",e=>{planQ=e.target.value;renderPlan()});
// v45.3 : ajouter des activités en les disant à Claude (même fonctionnement que Nutrition) : le message part chez Claude,
// qui les enregistre avec le connecteur (ajouter_activite) ; l'agenda les récupère au retour dans l'app. Recherche derrière la loupe.
$("planSearchBtn").addEventListener("click",()=>{const i=$("planSearch"),open=i.hidden;i.hidden=!open;$("planSearchBtn").setAttribute("aria-expanded",open);
  if(open)i.focus();else if(planQ){i.value="";planQ="";renderPlan()}});
$("plMic").addEventListener("click",e=>dictate(e.currentTarget,$("plAsk")));
$("plAsk").addEventListener("input",e=>grow(e.target));
$("plAsk").addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();$("plAskForm").requestSubmit()}});
function plPrompt(q){const d=today(),day=`${d.toLocaleDateString(LANG==="en"?"en-GB":LANG==="nl"?"nl-BE":"fr-BE",{weekday:"long"})} ${iso(d)}`;
  return T3(`Ajoute dans mon agenda Sid'compagnon : ${q}\n(Aujourd'hui : ${day}, heure de Bruxelles. Utilise ajouter_activite avec le titre, la date, l'heure de début et de fin, le type et les rappels si je les donne. S'il y a plusieurs activités, ajoute-les toutes. Si la date ou l'heure n'est pas claire, demande-moi avant.)`,
    `Add to my Sid'compagnon calendar: ${q}\n(Today: ${day}, Brussels time. Use ajouter_activite with the title, date, start and end time, type and reminders if I give them. If there are several activities, add them all. If the date or time is unclear, ask me first.)`,
    `Voeg toe aan mijn Sid'compagnon-agenda: ${q}\n(Vandaag: ${day}, Brusselse tijd. Gebruik ajouter_activite met de titel, datum, begin- en einduur, het type en herinneringen als ik die geef. Bij meerdere activiteiten: voeg ze allemaal toe. Als de datum of het uur niet duidelijk is, vraag het me eerst.)`)}
$("plAskForm").addEventListener("submit",e=>{e.preventDefault();const q=$("plAsk").value.trim();if(!q)return;dictStop();
  aiHandoff(plPrompt(q),"agenda");$("plAsk").value="";grow($("plAsk"))});
let planOpenMem={}; // mois ouverts dans « Toutes les dates » ; v44.6 : tous repliés par défaut (à l'ouverture de sid'agenda et au rechargement)
function renderPlan(){
  const T=data.tasks,q=norm(planQ);
  $("planTop").hidden=!!q;
  const isl=window.SCIslands&&window.SCIslands.agPlan&&!window.__noIslands;
  const up=T.filter(t=>t.status!=="fait"&&daysTo(t.end||t.date)>=0).sort((a,b)=>sk(a).localeCompare(sk(b))).slice(0,4);
  if(!isl)$("next").innerHTML=up.length?up.map(t=>{const d=daysTo(t.date);const w=d>1?`dans ${d} j`:d===1?"demain":d===0?"aujourd'hui":"en cours";
    return `<div class="n" style="--c:var(${colorOf(t)})"><div class="d">${fmt(t.date)}${t.time?" · "+hrs(t):""} · ${w}</div><div class="t">${esc(t.title)}</div></div>`}).join("")
    :`<div class="n" style="--c:var(--line)"><div class="t muted">${L("Rien à venir")}</div></div>`;
  renderCal();
  // filtres
  // v45 : une pastille par calendrier relié affiché (sa couleur)
  const calF=CALS().filter(c=>c.on!==false&&icalEvents.some(t=>t.cal===c.id));
  let f=data.ui.filter||"Toutes";if(f!=="Toutes"&&!typeOf(f)&&!calF.some(c=>c.name===f))f="Toutes";
  const used=data.types.filter(ty=>T.some(t=>norm(t.cat)===norm(ty.name)));
  calF.forEach(c=>{if(!used.some(u=>norm(u.name)===norm(c.name)))used.push({name:c.name,c:c.c||"--x4"})});
  const chips=[{name:"Toutes"},...used];
  if(!isl)$("chips").innerHTML=chips.map(c=>`<button class="pill" data-f="${esc(c.name)}" aria-pressed="${c.name===f}">${c.c?`<span class="dot" style="background:var(${c.c})"></span>`:""}${esc(c.name)}</button>`).join("");
  fillTypeList();
  $("listH2").textContent=q?"Résultats":"Toutes les dates";
  // liste
  const src=calF.some(c=>c.name===f)?icalEvents:q?T.concat(icalEvents):T;
  const list=src.filter(t=>(f==="Toutes"||norm(t.cat)===norm(f))&&(!q||norm(t.title+" "+(t.cat||"")+" "+(t.note||"")+" "+(t.loc||"")).includes(q))).sort((a,b)=>sk(a).localeCompare(sk(b)));
  if(isl){try{window.SCIslands.agPlan({next:$("next"),chips:$("chips"),list:$("tasks")},{tasks:T,list,chips:chips.map(c=>({name:c.name,c:c.c})),filter:f,search:!!q,open:Object.keys(planOpenMem),today:iso(today()),color:colorOf,icalCat:ICAL_CAT,i18n:agI18n()});return}
    catch(e){reportErr("island agPlan: "+(e&&e.message));window.__noIslands=true;try{renderPlan()}finally{window.__noIslands=false}return}}
  if(!list.length){$("tasks").innerHTML=`<div class="card" style="margin-top:10px"><div class="empty">${q?"Aucune activité ne correspond.":"Rien dans cette catégorie."}</div></div>`;return}
  const g={};list.forEach(t=>{const d=parse(t.date);const k=d.getFullYear()*100+d.getMonth();(g[k]=g[k]||[]).push(t)});
  // v29 : chaque mois se replie (toucher son nom) ; v44.6 : tous repliés par défaut, ouverts à la demande (en mémoire seulement, planOpenMem)
  const pf=new Proxy({},{get:(o,k)=>!planOpenMem[k]}),ks=Object.keys(g).sort(),allF=ks.every(k=>pf[k]);
  $("tasks").innerHTML=(ks.length>1&&!q?`<div class="mfold-all"><button type="button" class="mini" data-mfoldall="1">${L(allF?"Tout déplier":"Tout replier")}</button></div>`:"")+ks.map(k=>{const shut=!q&&pf[k];
    return `<button type="button" class="mfold" data-mfold="${k}" aria-expanded="${!shut}"><span class="mf-chev">${CHEV}</span><span class="grow">${L(MOL[k%100])} ${Math.floor(k/100)}</span><span class="mf-n">${g[k].length}</span></button>`+(shut?"":`<div class="card">${g[k].map(t=>{
    // v44.4 : ligne aérée : jour à gauche, titre + détails au milieu, statut et « ⋯ » à droite (toucher le titre = modifier)
    const d=parse(t.date),dd=`<div class="pr-date" aria-hidden="true"><b>${d.getDate()}</b><span class="notr">${d.toLocaleDateString(LANG==="en"?"en-GB":LANG==="nl"?"nl-BE":"fr-BE",{weekday:"short"})}</span></div>`;
    if(t.src==="ical")return `<div class="row task prow ${t.canc?"isfait":""}" style="--c:var(${colorOf(t)})" data-icalinfo="${esc(t.id)}">${dd}
      <div class="grow pr-main"><div class="ttl">${esc(t.title)}</div><div class="pr-meta"><i class="pr-dot"></i><span class="notr">${esc(t.cat||L(ICAL_CAT))}</span>${t.time?` · <span class="pr-time">${hrs(t)}</span>`:""}${t.canc?'<span class="canc-pill">Annulé</span>':""}${t.loc?` · ${esc(t.loc)}`:""}</div></div></div>`;
    const late=t.status!=="fait"&&daysTo(t.end||t.date)<0;
    return `<div class="row task prow ${t.status==="fait"?"isfait":""} ${late?"is-past":""}" style="--c:var(${colorOf(t)})">${dd}
      <div class="grow pr-main"><button type="button" class="ttl ttl-btn" data-edit="task:${t.id}">${esc(t.title)}</button>
      <div class="pr-meta"><i class="pr-dot"></i>${esc(t.cat||"")}${t.time?` · <span class="pr-time">${hrs(t)}</span>`:""}${t.end?` · → ${fmt(t.end)}`:""}${t.tbc?` <button class="tbc" data-cf="${t.id}" title="Toucher pour confirmer la date">à confirmer</button>`:""}${late?' <span class="past">Passé</span>':""}</div>
      ${t.note?`<div class="pr-note">${esc(t.note)}</div>`:""}</div>
      <button class="status" data-st="${t.id}" data-s="${t.status}">${t.status}</button>
      <button type="button" class="pr-more" data-tmore2="${t.id}" aria-label="Plus d'actions">⋯</button></div>`}).join("")}</div>`)}).join("");
}
$("v-plan").addEventListener("click",e=>{
  const ii=e.target.closest(".row[data-icalinfo]");if(ii){icalInfo(ii.dataset.icalinfo);return}
  const b=e.target.closest("button");if(!b)return;
  if(b.dataset.f){data.ui.filter=b.dataset.f;saveUI();renderPlan();return}
  if(b.dataset.mfold){const k=b.dataset.mfold;if(planOpenMem[k])delete planOpenMem[k];else planOpenMem[k]=1;renderPlan();return}
  if(b.dataset.mfoldall){const ks=[...document.querySelectorAll("#tasks [data-mfold]")].map(x=>x.dataset.mfold),close=ks.some(k=>planOpenMem[k]);
    ks.forEach(k=>{if(close)delete planOpenMem[k];else planOpenMem[k]=1});renderPlan();return}
  if(b.dataset.tmore2){const t=data.tasks.find(x=>x.id===b.dataset.tmore2);if(!t)return;
    openActions(t.title,[{l:"Modifier",fn:()=>openEdit("task:"+t.id)},
      ...STATUSES.map(s=>({l:s==="à faire"?"Marquer à faire":s==="en cours"?"Marquer en cours":"Marquer comme fait",on:t.status===s,fn:()=>{t.status=s;save();renderPlan()}})),
      {l:"Supprimer",danger:true,fn:()=>taskDel(t.id)}]);return}
  const T=data.tasks;
  if(b.dataset.st){const t=T.find(x=>x.id===b.dataset.st);t.status=STATUSES[(STATUSES.indexOf(t.status)+1)%3];save();renderPlan()}
  else if(b.dataset.cf){const t=T.find(x=>x.id===b.dataset.cf);t.tbc=false;save();renderPlan();toast("Date confirmée")}
  else if(b.dataset.tdel){if(c2ok(b))taskDel(b.dataset.tdel)}
});
// v34 : le formulaire n'occupe plus le haut de l'Agenda : il s'ouvre dans une fenêtre (« + Activité »)
// v37 : ajout rapide en langage courant : « Dentiste jeudi 14h », « Réunion demain à 9h30 », « Anniv le 12/11 »
// parseQuick(texte, maintenant) → {title, date?, time?} ; la date et l'heure trouvées remplissent les champs (sauf s'ils ont été touchés à la main)
const QW={fr:["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"],en:["sunday","monday","tuesday","wednesday","thursday","friday","saturday"],nl:["zondag","maandag","dinsdag","woensdag","donderdag","vrijdag","zaterdag"]};
const QM=[["janv","jan","janvier","january","januari"],["fevr","feb","fevrier","february","februari"],["mars","mar","march","maart"],["avr","apr","avril","april"],["mai","may","mei"],["juin","jun","june","juni"],["juil","jul","juillet","july","juli"],["aout","aug","august","augustus"],["sept","sep","septembre","september"],["oct","octobre","october","okt","oktober"],["nov","novembre","november"],["dec","decembre","december"]];
function parseQuick(text,now){now=now||new Date();const fold0=t=>t.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
  let t=" "+text+" ",date=null,time=null;const low=()=>fold0(t);
  const cut=(re,f)=>{const m=low().match(re);if(!m)return false;const r=f(m);if(r===false)return false;const i=m.index;t=t.slice(0,i)+" "+t.slice(i+m[0].length);return true};
  const d0=new Date(now.getFullYear(),now.getMonth(),now.getDate()),add=n=>{const d=new Date(d0);d.setDate(d.getDate()+n);return d};
  // heure : 14h, 14h30, 14:30, 9 h, 9am, 2.30pm, 14u, 14u30 (précédée ou non de « à », « at », « om »)
  cut(/\s(?:a|at|om|vers)?\s*(\d{1,2})\s*(?:h|u|:|\.)\s*(\d{2})?(?=\s)/,m=>{const h=+m[1],mi=+(m[2]||0);if(h>23||mi>59)return false;time=`${two(h)}:${two(mi)}`})||
  cut(/\s(?:at\s)?(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)(?=\s)/,m=>{let h=+m[1]%12;if(m[3]==="pm")h+=12;time=`${two(h)}:${two(+(m[2]||0))}`})||
  cut(/\s(?:a\s)?midi(?=\s)/,()=>{time="12:00"});
  // jour : aujourd'hui, demain, après-demain (+ anglais, néerlandais)
  cut(/\s(?:apres[- ]demain|overmorgen|day after tomorrow)(?=\s)/,()=>{date=add(2)})||
  cut(/\s(?:demain|tomorrow|morgen)(?=\s)/,()=>{date=add(1)})||
  cut(/\s(?:aujourd'?hui|ce soir|today|tonight|vandaag|vanavond)(?=\s)/,m=>{date=add(0);if(!time&&/soir|tonight|vanavond/.test(m[0]))time="20:00"})||
  // date : 12/11, 12/11/2026, le 12 novembre, 12 nov, nov 12
  cut(/\s(?:le\s|on\s|op\s)?(\d{1,2})[\/.-](\d{1,2})(?:[\/.-](\d{2,4}))?(?=\s)/,m=>{const dd=+m[1],mm=+m[2]-1;if(mm>11||dd>31||dd<1)return false;let y=m[3]?+m[3]:d0.getFullYear();if(y<100)y+=2000;
    let d=new Date(y,mm,dd);if(!m[3]&&d<d0)d=new Date(y+1,mm,dd);date=d})||
  cut(/\s(?:le\s|on\s|op\s)?(\d{1,2})(?:er|st|nd|rd|th|e)?\s+([a-z]+)\.?(?=\s)/,m=>{const mi=QM.findIndex(a=>a.some(w=>m[2].startsWith(w)&&m[2].length>=3));if(mi<0)return false;
    const dd=+m[1];if(dd<1||dd>31)return false;let d=new Date(d0.getFullYear(),mi,dd);if(d<d0)d=new Date(d0.getFullYear()+1,mi,dd);date=d})||
  // jour de la semaine : jeudi, jeudi prochain, next thursday
  cut(/\s(?:next\s|volgende\s)?(dimanche|lundi|mardi|mercredi|jeudi|vendredi|samedi|sunday|monday|tuesday|wednesday|thursday|friday|saturday|zondag|maandag|dinsdag|woensdag|donderdag|vrijdag|zaterdag)(\s+prochain)?(?=\s)/,m=>{
    let wd=-1;for(const k in QW){const i=QW[k].indexOf(m[1]);if(i>=0)wd=i}let n=(wd-d0.getDay()+7)%7;if(n===0)n=7;date=add(n)});
  const title=t.replace(/\s(?:le|la|a|à|at|on|om|op)\s*$/i," ").replace(/\s+/g," ").trim();
  return {title:title||text.trim(),date:date?iso(date):null,time}}
let fTouched=false;
function quickPreview(){const v=$("fTitle").value,h=$("fHint");if(!v.trim()){h.hidden=true;return}
  const q=parseQuick(v);if(!q.date&&!q.time){h.hidden=true;return}
  if(!fTouched){if(q.date)$("fDate").value=q.date;$("fTime").value=q.time||""}
  const d=q.date?new Date(q.date+"T12:00"):null;
  h.innerHTML=`${IC("calendar")||""}<span>${L("Compris")} : <b class="notr">${esc(q.title)}</b> · ${d?esc(d.toLocaleDateString(LANG==="fr"?"fr-BE":LANG==="nl"?"nl-BE":"en-GB",{weekday:"long",day:"numeric",month:"long"})):""}${q.time?` ${d?"· ":""}${q.time}`:""}</span>`;h.hidden=false}
$("fTitle").addEventListener("input",quickPreview);
["fDate","fTime"].forEach(id=>$(id).addEventListener("input",()=>{fTouched=true}));
function openTaskSheet(date){const f=$("taskForm");fTouched=false;$("fHint").hidden=true;if(!$("fDate").value||date)$("fDate").value=date||iso(today());
  $("taskSheet").hidden=false;setTimeout(()=>$("fTitle").focus(),80)}
function closeTaskSheet(){$("taskSheet").hidden=true;$("fMore").open=false}
$("taskAdd").addEventListener("click",()=>openTaskSheet(typeof selDay==="string"&&calMode==="day"?selDay:null));
$("taskClose").addEventListener("click",closeTaskSheet);
$("taskSheet").addEventListener("click",e=>{if(e.target.id==="taskSheet")closeTaskSheet()});
function taskDel(id){undoable("Activité supprimée",[id],()=>{tomb(id);data.tasks=data.tasks.filter(x=>x.id!==id)},{after:()=>{renderPlan();renderTypes()}})}
$("taskForm").addEventListener("submit",e=>{
  e.preventDefault();
  const q=parseQuick($("fTitle").value),t={id:uid(),title:(q.date||q.time)?q.title:$("fTitle").value.trim(),date:$("fDate").value,status:"à faire",tbc:false};
  if(!t.title||!t.date)return;
  t.cat=ensureType($("fCat").value);
  if($("fTime").value)t.time=$("fTime").value;
  if(t.time&&$("fTimeEnd").value){if($("fTimeEnd").value<=t.time){toast("L'heure de fin doit être après l'heure de début");return}t.timeEnd=$("fTimeEnd").value}
  if($("fEnd").value&&$("fEnd").value>=t.date)t.end=$("fEnd").value;
  remApply(t,"f");data.tasks.push(t);save();renderPlan();renderTypes();e.target.reset();remSel.f=null;renderRem("f");closeTaskSheet();toast("Ajouté à l'agenda");if(t.time)setTimeout(maybeAskNotif,900); // v37 : la proposition arrive quand elle a du sens
});

/* ---------- calendriers reliés (iCal) ---------- */
// v45 : plusieurs calendriers superposés dans la même vue. data.prefs.icals = [{id, name, url, c (couleur), on (affiché)}] ;
// data.prefs.ical garde le lien du 1er (anciennes versions). Calendrier privé : identifiant + mot de passe gardés sur l'appareil
// seulement (localStorage « sidnote-icalauth-<uid> », jamais envoyés au compte), passés au relais « horaire » le temps de la lecture.
const ICAL_CAT="Calendrier relié"; // nom par défaut d'un calendrier (v28 : neutre, marche avec tout lien iCal)
const CAL_COLORS=["--x4","--x1","--x2","--x3","--x5","--x6","--c-cours","--c-event"];
let icalEvents=[],icalAt=0,icalBusy=false,icalAll={},icalErr={};
const icalKey=()=>"sidnote-ical-"+(session?session.user.id:"x");
const icalAuthKey=()=>"sidnote-icalauth-"+(session?session.user.id:"x");
const icalAuth=id=>(ls.get(icalAuthKey())||{})[id]||null;
function icalAuthSet(id,v){const a=ls.get(icalAuthKey())||{};if(v)a[id]=v;else delete a[id];ls.set(icalAuthKey(),a)}
function CALS(){const p=data.prefs||(data.prefs={});
  if(!Array.isArray(p.icals))p.icals=p.ical?[{id:"cal1",name:ICAL_CAT,url:p.ical,c:"--x4",on:true}]:[];
  return p.icals}
const calOf=id=>CALS().find(c=>c.id===id);
function calsSave(){const l=CALS();data.prefs.ical=l.length?l[0].url:null;save()}
const allT=()=>data.tasks.concat(icalEvents);
const colorOf=t=>t&&t.src==="ical"?((calOf(t.cal)||{}).c||"--x4"):tc(t&&t.cat);
// événements affichés = ceux des calendriers allumés, chacun avec le nom de son calendrier comme catégorie
function icalMix(){icalEvents=[];let at=0;
  for(const c of CALS()){const x=icalAll[c.id];if(!x||x.url!==c.url)continue;at=Math.max(at,x.at||0);
    if(c.on===false)continue;x.events.forEach(e=>{e.cal=c.id;e.cat=c.name||ICAL_CAT});icalEvents=icalEvents.concat(x.events)}
  icalAt=at}
function icalLoadCache(){const c=ls.get(icalKey());icalAll={};
  if(c&&c.cals)icalAll=c.cals;
  else if(c&&Array.isArray(c.events)){const f=CALS()[0];if(f&&c.url===f.url)icalAll[f.id]={url:c.url,at:c.at||0,events:c.events}} // cache d'avant la v45
  icalMix()}
function icalCacheSave(){const keep={};CALS().forEach(c=>{if(icalAll[c.id])keep[c.id]=icalAll[c.id]});icalAll=keep;ls.set(icalKey(),{v:2,cals:keep})}
// lecture d'un fichier iCal (.ics)
function parseICS(text,now=new Date()){
  const lines=String(text).replace(/\r?\n[ \t]/g,"").split(/\r?\n/);
  const out=[];let ev=null;
  const unesc=v=>v.replace(/\\n/gi,"\n").replace(/\\,/g,",").replace(/\;/g,";").replace(/\\\\/g,"\\");
  const toLocal=(v,params)=>{
    const m=v.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?$/);if(!m)return null;
    if(!m[4])return{date:`${m[1]}-${m[2]}-${m[3]}`,allday:true};
    let d;if(m[7])d=new Date(Date.UTC(+m[1],+m[2]-1,+m[3],+m[4],+m[5],+(m[6]||0)));
    else d=new Date(+m[1],+m[2]-1,+m[3],+m[4],+m[5],+(m[6]||0)); // heure locale (Europe/Bruxelles)
    return{date:iso(d),time:`${two(d.getHours())}:${two(d.getMinutes())}`,allday:false};
  };
  const from=new Date(now);from.setDate(from.getDate()-31);const to=new Date(now);to.setDate(to.getDate()+200);
  for(const line of lines){
    if(line==="BEGIN:VEVENT"){ev={};continue}
    if(line==="END:VEVENT"){
      if(ev&&ev.DTSTART){
        const s=toLocal(ev.DTSTART.v,ev.DTSTART.p),e=ev.DTEND?toLocal(ev.DTEND.v,ev.DTEND.p):null;
        if(s){
          const title=unesc((ev.SUMMARY&&ev.SUMMARY.v)||"Cours").trim();
          const canc=/CANCELLED/i.test((ev.STATUS&&ev.STATUS.v)||"")||/annul/i.test(title);
          const t={id:"ical:"+((ev.UID&&ev.UID.v)||title)+":"+ev.DTSTART.v,src:"ical",title:title.replace(/^\s*annul[ée]e?s?\s*[:\-–]\s*/i,""),date:s.date,cat:ICAL_CAT,status:"à faire",canc};
          if(!s.allday){t.time=s.time;if(e&&!e.allday&&e.date===s.date&&e.time>s.time)t.timeEnd=e.time}
          else if(e&&e.allday){const d=parse(e.date);d.setDate(d.getDate()-1);const last=iso(d);if(last>s.date)t.end=last}
          if(ev.LOCATION)t.loc=unesc(ev.LOCATION.v).trim();
          if(ev.DESCRIPTION)t.note=unesc(ev.DESCRIPTION.v).trim().slice(0,400);
          const dd=parse(t.date);if(dd>=from&&dd<=to)out.push(t);
        }
      }
      ev=null;continue}
    if(!ev)continue;
    const i=line.indexOf(":");if(i<0)continue;
    const head=line.slice(0,i),v=line.slice(i+1),[name,...params]=head.split(";");
    ev[name.toUpperCase()]={v,p:params};
  }
  const seen=new Set();return out.filter(t=>!seen.has(t.id)&&seen.add(t.id));
}
async function icalFetchOne(c){
  const au=icalAuth(c.id),body={url:c.url};if(au){body.user=au.user||"";body.pass=au.pass||""}
  const r=await fetch(SUPABASE_URL+"/functions/v1/horaire",{method:"POST",headers:{apikey:SUPABASE_KEY,"Content-Type":"application/json",Authorization:"Bearer "+await token()},body:JSON.stringify(body)});
  const txt=await r.text();
  if(!r.ok){let m="";try{m=JSON.parse(txt).error||""}catch(e){}
    throw new Error(r.status===404?"La fonction « horaire » n'est pas encore installée sur Supabase.":m||("Erreur "+r.status))}
  icalAll[c.id]={url:c.url,at:Date.now(),events:parseICS(txt)}}
// v46 (#8) : mise à jour automatique toutes les 6 heures au plus (avant : 15 min) ; « ↻ Actualiser » relit tout de suite
const ICAL_EVERY=6*3600e3;
// force : tout relire ; only : un seul calendrier (ajout, identifiant changé)
async function icalFetch(force,only){
  const list=CALS().filter(c=>c.on!==false&&(!only||c.id===only));
  if(!list.length||!session||icalBusy)return;
  if(!force&&Date.now()-icalAt<ICAL_EVERY)return;
  icalBusy=true;icalState("Mise à jour du calendrier…");let off=false;
  for(const c of list){try{await icalFetchOne(c);delete icalErr[c.id]}catch(ex){if(ex instanceof TypeError)off=true;icalErr[c.id]=ex instanceof TypeError?L("Pas de connexion"):ex.message}}
  icalBusy=false;icalCacheSave();icalMix();icalSoonSync();renderAllSafe();renderCals();
  const bad=list.filter(c=>icalErr[c.id]);
  if(off)icalState("Pas de connexion : le calendrier sera mis à jour plus tard.");else icalState();
  if(force){const n=icalEvents.filter(t=>!t.canc).length;
    if(bad.length===list.length)toast("Mise à jour impossible");else toast(`Calendrier à jour : ${n} ${n>1?"événements":"événement"}`)}
}
// les cours des 14 prochains jours sont copiés dans le compte (data.icalSoon) : le serveur des rappels
// ne peut pas lire l'horaire lui-même, il prévient 24 h avant chaque cours à partir de cette liste
function icalSoonSync(){if(!session)return;
  const t0=iso(today()),e=new Date(today());e.setDate(e.getDate()+14);const t1=iso(e);
  const list=notifIcal()&&CALS().length?icalEvents.filter(t=>!t.canc&&t.date>=t0&&t.date<=t1).map(t=>({id:t.id,title:t.title,date:t.date,time:t.time||"",loc:t.loc||""})).slice(0,200):[];
  if(JSON.stringify(list)===JSON.stringify(data.icalSoon||[]))return;data.icalSoon=list;save()}
function icalState(msg){
  const el=$("icalState");if(!el)return;const has=CALS().length;
  $("icalRefresh").hidden=!has;
  if(msg){el.textContent=L(msg);return}
  if(!has){el.textContent=L("Aucun calendrier relié.");return}
  const n=icalEvents.filter(t=>!t.canc).length,c=icalEvents.filter(t=>t.canc).length;
  el.textContent=icalAt?`${n} ${n>1?"événements":"événement"}${c?` · ${c} annulé${c>1?"s":""}`:""} · mis à jour à ${new Date(icalAt).toLocaleTimeString("fr-BE",{hour:"2-digit",minute:"2-digit"})}`:L("Pas encore mis à jour.");
}
function icalInfo(id){
  const t=icalEvents.find(x=>x.id===id);if(!t)return;
  toast(`${t.canc?L("Annulé")+" · ":""}${t.title}${t.time?" · "+hrs(t):""}${t.loc?" · "+t.loc:""}${t.cat?" · "+t.cat:""}`);
}
// liste des calendriers (Agenda → « Calendriers reliés ») + pastilles au-dessus du calendrier pour afficher / masquer chacun
function renderCals(){
  const box=$("calList");if(!box)return;const l=CALS();
  box.innerHTML=l.map(c=>{const n=(icalAll[c.id]&&icalAll[c.id].url===c.url)?icalAll[c.id].events.filter(t=>!t.canc).length:null,err=icalErr[c.id];
    return `<div class="cal-row${c.on===false?" off":""}"><button type="button" class="cal-dot" data-calcolor="${c.id}" style="--c:var(${c.c||"--x4"})" aria-label="${L("Changer la couleur")}"></button>
      <div class="grow cal-main"><b class="notr">${esc(c.name||ICAL_CAT)}</b><span class="small ${err?"cal-err":"muted"}"><span>${err?esc(err):n===null?L("Pas encore mis à jour."):`${n} ${n>1?"événements":"événement"}`}</span>${icalAuth(c.id)?` · <span>${L("privé")}</span>`:""}</span></div>
      <input type="checkbox" class="switch" data-calon="${c.id}" ${c.on===false?"":"checked"} title="${L("Afficher")}" aria-label="${L("Afficher")} ${esc(c.name||ICAL_CAT)}">
      <button type="button" class="pen" data-calmore="${c.id}" aria-label="${L("Plus d'actions")}">${MORE}</button></div>`}).join("")||`<div class="small muted">${L("Aucun calendrier relié.")}</div>`;
  const lg=$("calLegend");if(lg){lg.hidden=l.length<1;
    lg.innerHTML=l.map(c=>`<button type="button" class="pill cal-pill" data-calon2="${c.id}" aria-pressed="${c.on!==false}"><span class="dot" style="background:var(${c.c||"--x4"})"></span><span class="notr">${esc(c.name||ICAL_CAT)}</span></button>`).join("")}
  icalState()}
function calToggle(id,on){const c=calOf(id);if(!c)return;c.on=on;c.upd=Date.now();calsSave();icalMix();
  if(on&&!(icalAll[id]&&icalAll[id].url===c.url))icalFetch(true,id);icalSoonSync();renderAllSafe();renderCals()}
function calActions(id){const c=calOf(id);if(!c)return;
  openActions(c.name||ICAL_CAT,[
    {l:"Renommer",fn:()=>{const v=prompt(L("Nom du calendrier"),c.name||"");if(v&&v.trim()){c.name=v.trim().slice(0,40);c.upd=Date.now();calsSave();icalMix();renderAllSafe();renderCals()}}},
    {l:"Changer la couleur",fn:()=>calColor(id)},
    {l:icalAuth(id)?"Modifier l'identifiant":"Ajouter un identifiant (calendrier privé)",fn:()=>calAuthAsk(id)},
    {l:"Actualiser",fn:()=>icalFetch(true,id)},
    {l:"Retirer ce calendrier",danger:true,fn:()=>{data.prefs.icals=CALS().filter(x=>x!==c);delete icalAll[id];delete icalErr[id];icalAuthSet(id,null);calsSave();icalCacheSave();icalMix();icalSoonSync();renderAllSafe();renderCals();toast("Calendrier retiré")}}])}
function calColor(id){const c=calOf(id);if(!c)return;const i=CAL_COLORS.indexOf(c.c);c.c=CAL_COLORS[(i+1)%CAL_COLORS.length];c.upd=Date.now();calsSave();renderAllSafe();renderCals()}
function calAuthAsk(id){const a=icalAuth(id)||{};
  const u=prompt(L("Identifiant du calendrier (laisse vide pour retirer)"),a.user||"");if(u===null)return;
  if(!u.trim()){icalAuthSet(id,null);renderCals();icalFetch(true,id);return}
  const pw=prompt(L("Mot de passe du calendrier (de préférence un mot de passe d'application)"),"");if(pw===null)return;
  icalAuthSet(id,{user:u.trim(),pass:pw});renderCals();icalFetch(true,id)}
$("calList").addEventListener("click",e=>{const m=e.target.closest("[data-calmore]");if(m){calActions(m.dataset.calmore);return}
  const d=e.target.closest("[data-calcolor]");if(d)calColor(d.dataset.calcolor)});
$("calList").addEventListener("change",e=>{const t=e.target.closest("[data-calon]");if(t)calToggle(t.dataset.calon,t.checked)});
$("calLegend").addEventListener("click",e=>{const b=e.target.closest("[data-calon2]");if(!b)return;const c=calOf(b.dataset.calon2);if(c)calToggle(c.id,c.on===false)});
$("icalSave").addEventListener("click",()=>{
  const v=$("icalUrl").value.trim().replace(/^webcal:/i,"https:");
  if(!/^https:\/\/\S+$/i.test(v)){toast("Colle un lien qui commence par https://");return}
  if(CALS().some(c=>c.url===v)){toast("Ce calendrier est déjà relié");return}
  if(CALS().length>=12){toast("12 calendriers au maximum");return}
  const l=CALS(),used=l.map(c=>c.c),id="cal"+Date.now().toString(36);
  let name=$("icalName").value.trim().slice(0,40);if(!name)name=l.length?`${L("Calendrier")} ${l.length+1}`:ICAL_CAT;
  l.push({id,name,url:v,c:CAL_COLORS.find(x=>!used.includes(x))||CAL_COLORS[l.length%CAL_COLORS.length],on:true,upd:Date.now()});
  const u=$("icalUser").value.trim(),pw=$("icalPass").value;if(u||pw)icalAuthSet(id,{user:u,pass:pw});
  ["icalUrl","icalName","icalUser","icalPass"].forEach(k=>$(k).value="");$("icalPriv").open=false;
  calsSave();renderCals();icalFetch(true,id)});
$("icalRefresh").addEventListener("click",()=>icalFetch(true));

/* ---------- Types d'événement ---------- */
function renderTypes(){
  const cnt=n=>data.tasks.filter(t=>norm(t.cat)===norm(n)).length;
  $("typesCard").innerHTML=data.types.map((t,i)=>`<div class="row">
      <button class="swatch" data-tcol="${i}" style="background:var(${t.c})" aria-label="Changer la couleur de ${esc(t.name)}"></button>
      <div class="grow">${esc(t.name)} <span class="small muted">· ${cnt(t.name)}</span></div>
      <button class="x" data-tydel="${i}" aria-label="Supprimer ${esc(t.name)}">×</button></div>`).join("")+
    `<form class="row" id="typeForm"><input id="typeIn" placeholder="Nouveau type, ex. Examen" aria-label="Nouveau type" autocomplete="off"><button class="btn" type="submit">Ajouter</button></form>`;
}
$("typesCard").addEventListener("click",e=>{
  const b=e.target.closest("button");if(!b)return;
  if(b.dataset.tcol){const t=data.types[+b.dataset.tcol];t.c=PALETTE[(PALETTE.indexOf(t.c)+1)%PALETTE.length];save();renderTypes();renderPlan()}
  else if(b.dataset.tydel){armDelete(b,()=>{const t=data.types[+b.dataset.tydel];
    data.tasks.forEach(x=>{if(norm(x.cat)===norm(t.name))x.cat=""});
    data.types.splice(+b.dataset.tydel,1);save();renderTypes();renderPlan();toast(`Type « ${t.name} » supprimé`)})}
});
$("typesCard").addEventListener("submit",e=>{e.preventDefault();const v=$("typeIn").value.trim();if(!v)return;
  if(typeOf(v)){toast("Ce type existe déjà");return}
  ensureType(v);save();renderTypes();renderPlan();toast("Type ajouté")});

/* ---------- Réglages ---------- */
function renderStats(){
  const td=data.todos,tk=data.tasks;
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
  for(const [vk,lk,secret] of [["vault","pwds",false],["noteVault","notes",true]]){const cur=data[vk],iv=d[vk];
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
  $("bkList").innerHTML=`<div class="row small muted"><span class="grow"></span><span class="n">${L("Fichier")}</span><span class="now">${L("Maintenant")}</span></div>`+
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

/* ---------- v35 : confidentialité, conditions d'utilisation, consentement santé, suppression du compte ---------- */
// v43 : textes légaux mis à jour (connecteur Claude, Spotify à la demande, polices hébergées ici) ; version complète dans les pages publiques
const LEGAL={privacy:[
  ["Qui est responsable","Sid'compagnon est édité par SidCorp, qui est responsable du traitement de tes données. Les coordonnées complètes figurent dans la version complète de cette politique. Pas de publicité : aucune donnée n'est vendue ni utilisée à des fins commerciales."],
  ["Ce qui est enregistré, et pourquoi","Ton e-mail, ton pseudo et ton mot de passe (gardé haché par Supabase), pour ton compte. Ce que tu mets dans l'app (agenda, tâches, notes, documents, séances, nutrition, réglages), pour te rendre le service : c'est la base légale « exécution du contrat ». Des rapports d'erreur techniques (version, message d'erreur, type de navigateur, sans ton contenu), pour corriger les bugs : intérêt légitime. Ton abonnement aux notifications, seulement si tu les actives."],
  ["Données de santé","Ton poids, tes repas, ton profil (âge, taille, sport), tes séances et les zones à ménager sont des données de santé. Sid'compagnon ne les utilise qu'avec ton accord explicite, que tu peux retirer à tout moment dans Réglages. Sid'compagnon ne les envoie à aucune IA de lui-même : si tu branches Claude, c'est ton propre compte Claude (Anthropic) qui les lit par le connecteur, quand tu le lui demandes, selon les conditions d'Anthropic. La photo d'assiette que tu envoies à Claude est déposée dans ton dossier privé, lue une seule fois par ton Claude, puis effacée (au plus tard après 24 h). Les aliments sont retenus dans une mémoire commune anonyme (jamais ton nom)."],
  ["Où, et avec qui","Tes données sont dans ton compte chez Supabase, en Europe (Francfort, Allemagne). Le site est hébergé par Netlify, qui garde des journaux techniques (dont ton adresse IP) pour faire tourner le site. Anthropic n'intervient que si tu branches Claude, Spotify seulement si tu charges son lecteur. Plus aucune police ni bibliothèque n'est chargée chez un tiers. Sur ton appareil, l'app garde une copie de tes données pour marcher sans connexion."],
  ["Ce qui est chiffré","Mots de passe, notes secrètes et documents sont chiffrés sur ton appareil avec une clé protégée par le mot de passe de ton compte (ou ta phrase secrète pour les coffres créés avant) avant d'être envoyés : personne d'autre ne peut les lire, pas même SidCorp. Le reste est protégé par ton compte ; l'administrateur pourrait techniquement y accéder pour l'entretien, mais ne le fait pas."],
  ["Combien de temps","Tant que ton compte existe. Les éléments supprimés quittent la synchronisation après 90 jours ; les sauvegardes automatiques sont gardées 14 jours ; les rapports d'erreur 90 jours. « Supprimer mon compte » efface tout de suite ton compte et tes données (les sauvegardes disparaissent dans les 14 jours)."],
  ["Tes droits","Tu peux voir, télécharger, corriger et supprimer tes données à tout moment (Réglages, « Tes données et ta vie privée »), retirer ton accord pour les données de santé, t'opposer à un traitement et supprimer ton compte. Tu peux aussi porter plainte auprès de l'Autorité de protection des données (Belgique, www.autoriteprotectiondonnees.be)."]],
 terms:[
  ["Le service","Sid'compagnon est gratuit, sans achat ni abonnement, et fourni tel quel. Il peut évoluer, être interrompu ou s'arrêter ; tu seras prévenu à l'avance si possible."],
  ["Ton compte","Ton compte est personnel. Garde ton mot de passe pour toi : il protège aussi tes coffres. Si tu le remets à zéro par e-mail, ouvre d'abord tes coffres sur un appareil où ils sont déjà ouverts pour garder l'accès ; sinon, ils ne peuvent pas être rouverts, même par SidCorp."],
  ["Ce que tu y mets","Tu restes propriétaire de ton contenu. N'y mets rien d'illégal. Fais de temps en temps une sauvegarde (Réglages, « Sauvegarde »)."],
  ["Santé : nutrition et musculation","Les calculs, menus et programmes sont donnés à titre indicatif, parfois par une IA qui peut se tromper. Ce n'est pas un avis médical : demande conseil à un médecin, un diététicien ou un coach, surtout en cas de douleur, de grossesse, de maladie ou de troubles alimentaires."],
  ["Claude (facultatif)","Brancher Claude est facultatif. Claude est un service d'Anthropic, utilisé avec ton propre compte et selon ses conditions ; SidCorp n'en est pas responsable. Tu peux débrancher le connecteur à tout moment (Réglages)."],
  ["Fin et droit applicable","Tu peux supprimer ton compte à tout moment. SidCorp peut fermer un compte utilisé de façon abusive. Ces conditions relèvent du droit belge ; elles ne retirent aucun droit que la loi te donne comme consommateur."]],
 cookies:[
  ["Pas de cookie","Sid'compagnon ne dépose aucun cookie : ni publicité, ni mesure d'audience, ni pisteur."],
  ["Ce qui est gardé sur ton appareil","Seulement ce qui est nécessaire pour faire marcher l'app que tu as demandée : ta session (rester connecté), une copie de tes données pour marcher sans connexion, tes fichiers, tes préférences d'affichage (langue, thème, barre latérale), un compteur anti-essais pour la connexion, et le cache de l'app. Ces éléments sont dispensés de consentement (loi belge du 13 juin 2005, art. 129) car strictement nécessaires."],
  ["Contenu tiers : Spotify","Le lecteur Spotify (Focus) n'est chargé que si tu touches « Charger le lecteur Spotify ». Spotify reçoit alors ton adresse IP et peut déposer ses propres cookies, selon sa politique. Tu peux retirer ce choix à tout moment sous le lecteur."],
  ["Pas de bandeau","Comme rien de non nécessaire n'est chargé sans ton action, Sid'compagnon n'affiche pas de bandeau de cookies."]]};
const LEGAL_PAGE={privacy:"confidentialite.html",terms:"conditions.html",cookies:"cookies.html"};
function openLegal(k){k=LEGAL[k]?k:"privacy";
  document.querySelectorAll("#legalSeg [data-legal]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.legal===k)));
  $("legalBody").innerHTML=LEGAL[k].map(([h,t])=>`<h3>${esc(L(h))}</h3><p>${esc(L(t))}</p>`).join("")+`<p><a href="${LEGAL_PAGE[k]}" target="_blank" rel="noopener">${L("Lire la version complète")} ↗</a></p><p class="small muted">${esc(L("Mis à jour le 22 octobre 2026."))}</p>`;
  $("legalBody").scrollTop=0;$("legalSheet").hidden=false}
document.addEventListener("click",e=>{const b=e.target.closest("[data-openlegal]");if(b){e.preventDefault();openLegal(b.dataset.openlegal)}});
$("legalSeg").addEventListener("click",e=>{const b=e.target.closest("[data-legal]");if(b)openLegal(b.dataset.legal)});
$("legalClose").addEventListener("click",()=>$("legalSheet").hidden=true);
$("legalSheet").addEventListener("click",e=>{if(e.target.id==="legalSheet")$("legalSheet").hidden=true});
// accord explicite avant le premier envoi de données de santé à l'IA (data.nutri.consent = date) ; retirable dans Réglages
let consentRes=null;
function nuConsent(){if(NU().consent)return Promise.resolve(true);
  return new Promise(res=>{consentRes=res;$("consentSheet").hidden=false})}
const consentEnd=v=>{$("consentSheet").hidden=true;const r=consentRes;consentRes=null;if(r)r(v)};
$("consentYes").addEventListener("click",()=>{const n=NU();n.consent=new Date().toISOString();n.upd=Date.now();save();renderConsent();consentEnd(true)});
$("consentNo").addEventListener("click",()=>consentEnd(false));$("consentClose").addEventListener("click",()=>consentEnd(false));
function renderLockSel(){const v=data.ui&&data.ui.lockDelay,d=String(v===undefined||v===null?-1:v);document.querySelectorAll("#lockSel [data-lock]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.lock===d)))}
$("lockSel").addEventListener("click",e=>{const b=e.target.closest("[data-lock]");if(!b)return;data.ui.lockDelay=+b.dataset.lock;saveUI();renderLockSel();toast("Réglage enregistré")});
function renderConsent(){renderLockSel();try{renderBio();$("mcpSec").hidden=!session||isTrial()}catch(e){}const row=$("nuConsentRow");if(!row)return;row.hidden=!tabAllowed("nutri");const c=NU().consent;
  $("nuConsentState").textContent=c?`${L("accord donné le")} ${fmtDay(c)}`:L("pas d'accord");$("nuConsentBtn").textContent=L(c?"Retirer":"Donner mon accord")}
$("nuConsentBtn").addEventListener("click",async()=>{const n=NU();
  if(n.consent){delete n.consent;n.upd=Date.now();save();renderConsent();toast("Accord retiré : Nutrition ne calculera plus rien")}else{await nuConsent();renderConsent()}});
// suppression du compte, en libre-service (fonction serveur delete-account) ; le mot de passe est redemandé
$("delAccBtn").addEventListener("click",async()=>{
  if(!session||isTrial()||isTestAcc())return;
  const pw=await askAccountPw("Supprimer mon compte","Ton compte et tout ce qu'il contient (agenda, tâches, notes, coffres, documents…) seront effacés définitivement, sur tous tes appareils. Entre ton mot de passe pour confirmer.",
    async pw=>{try{await api("/auth/v1/token?grant_type=password",{method:"POST",body:{email:accEmail(),password:pw}});return null}
      catch(ex){return ex instanceof TypeError?"Pas de connexion internet. Réessaie quand tu es connecté.":"Mot de passe incorrect."}},"Annuler");
  if(!pw)return;
  const b=$("delAccBtn");b.disabled=true;b.textContent="…";
  try{const u=session.user.id;await dropSub().catch(()=>{});
    await api("/functions/v1/delete-account",{method:"POST",token:await token(),body:{}});
    await idbClearUser(u);["sidnote-ical-"+u,"sidnote-icalauth-"+u,cacheKey(u),"sidnote-mk-"+u,"sidnote-bio-"+u,LAST_KEY].forEach(k=>ls.del(k));
    endSession(L("Ton compte a été supprimé. Merci d'avoir utilisé Sid'compagnon."),true);
  }catch(ex){b.disabled=false;b.textContent=L("Supprimer mon compte");toast(ex instanceof TypeError?L("Pas de connexion internet"):(ex.message||L("Suppression impossible")))}});

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

/* ---------- Pomodoro ---------- */
const MIN=window.POMO_TEST_MIN||60000;
data.pomo=data.pomo||{cfg:{work:25,brk:5,total:120},run:null,log:{}};
const P=data.pomo;
const PRESETS=[60,90,120,180];
const hm=m=>{m=Math.round(m);const h=Math.floor(m/60),r=m%60;return h?`${h} h${r?" "+String(r).padStart(2,"0"):""}`:`${r} min`};
const clockTxt=ms=>{const s=Math.max(0,Math.ceil(ms/1000));return String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0")};
const hhmm=d=>String(d.getHours()).padStart(2,"0")+"h"+String(d.getMinutes()).padStart(2,"0");
const dayKey=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;

function buildSegs({work,brk,total}){
  const segs=[];let t=0;
  while(t<total){
    const w=Math.min(work,total-t);segs.push({t:"w",d:w});t+=w;
    if(total-t<=brk){segs[segs.length-1].d+=total-t;break} // pas de pause finale : le reste s'ajoute au dernier travail
    segs.push({t:"b",d:brk});t+=brk;
  }
  return segs;
}
function planBar(segs,el,doneIdx=-1){
  const tot=segs.reduce((a,s)=>a+s.d,0);
  el.innerHTML=segs.map((s,i)=>`<i class="${s.t==="w"?"w":"b"} ${i<doneIdx?"past":""}" style="flex:${s.d/tot}"></i>`).join("");
}
function renderSetup(){
  const c=P.cfg;
  $("presets").innerHTML=PRESETS.map(m=>`<button class="preset" data-total="${m}" aria-pressed="${c.total===m}">${hm(m)}</button>`).join("");
  $("oWork").textContent=c.work+" min";$("oBrk").textContent=c.brk+" min";$("oTotal").textContent=hm(c.total);
  const segs=buildSegs(c),n=segs.filter(s=>s.t==="w").length,
        work=segs.filter(s=>s.t==="w").reduce((a,s)=>a+s.d,0),real=segs.reduce((a,s)=>a+s.d,0);
  planBar(segs,$("planBar"));
  $("planTxt").textContent=`${n} session${n>1?"s":""} de travail et ${n-1} pause${n-1>1?"s":""} · ${hm(work)} de travail · si tu démarres maintenant, fin à ${hhmm(new Date(Date.now()+real*60000))}`;
}
$("pomoSetup").addEventListener("click",e=>{
  const b=e.target.closest("button");if(!b)return;
  if(b.dataset.total){P.cfg.total=+b.dataset.total}
  else if(b.dataset.step){const[k,v]=b.dataset.step.split(",");const lim={work:[5,90],brk:[1,30],total:[15,480]}[k];
    P.cfg[k]=Math.min(lim[1],Math.max(lim[0],P.cfg[k]+ +v))}
  else return;
  save();renderSetup();
});

/* son : débloqué au clic sur Démarrer (obligatoire sur iPhone) */
let actx=null;
function unlockAudio(){try{actx=actx||new (window.AudioContext||window.webkitAudioContext)();if(actx.state==="suspended")actx.resume()}catch(e){}}
function chime(kind,delay=0,q=null){
  if(!actx)return;try{
  const notes=kind==="w"?[523,659,784]:kind==="b"?[784,659,523]:[523,659,784,1047];
  notes.forEach((f,i)=>{const o=actx.createOscillator(),g=actx.createGain(),t=actx.currentTime+delay+i*.22;
    o.type="sine";o.frequency.value=f;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.35,t+.02);g.gain.exponentialRampToValueAtTime(.001,t+.5);
    o.connect(g).connect(actx.destination);o.start(t);o.stop(t+.55);if(q)q.push(o)});
  }catch(e){}
}
// v43 : sons programmés à l'avance sur l'horloge audio. En arrière-plan, le navigateur ralentit les minuteries
// (setInterval peut ne tourner qu'une fois par minute) : le son de fin arrivait en retard. L'horloge audio, elle, reste exacte.
const CHQ={};
function chimeCancel(key){(CHQ[key]||[]).forEach(o=>{try{o.stop()}catch(e){}});delete CHQ[key]}
function chimePlan(key,items){chimeCancel(key);if(!actx||actx.state!=="running")return false;CHQ[key]=[];items.forEach(([kind,ms])=>{if(ms>=0)chime(kind,ms/1000,CHQ[key])});return true}
let wake=null;
async function keepAwake(on){
  try{if(on&&"wakeLock" in navigator&&!wake){wake=await navigator.wakeLock.request("screen");wake.addEventListener("release",()=>wake=null)}
      else if(!on&&wake){await wake.release();wake=null}}catch(e){}
}

function elapsed(r,now=Date.now()){return (r.pausedAt||now)-r.startAt-r.pausedTotal}
function locate(r,el){
  let t=0;for(let i=0;i<r.segs.length;i++){const d=r.segs[i].d*MIN;if(el<t+d)return{i,into:el-t,d};t+=d}
  return{i:r.segs.length,into:0,d:0};
}
function workDone(r,el){let t=0,w=0;for(const s of r.segs){const d=s.d*MIN;if(s.t==="w")w+=Math.max(0,Math.min(d,el-t));t+=d}return w}
let lastIdx=null,pomoSched=false;
function pomoPlan(){const r=P.run;if(!r||r.pausedAt){chimeCancel("pomo");pomoSched=false;return}
  const el=elapsed(r),it=[];let t=0;r.segs.forEach((s,i)=>{if(i&&t>el)it.push([s.t,t-el]);t+=s.d*MIN});it.push(["end",t-el]);pomoSched=chimePlan("pomo",it)}
function startPomo(){
  unlockAudio();
  const segs=buildSegs(P.cfg);
  P.run={segs,startAt:Date.now(),pausedAt:null,pausedTotal:0};lastIdx=0;
  save();chime("w");keepAwake(true);pomoPlan();renderPomo();
}
function finishPomo(completed){
  const r=P.run;if(!r)return;
  const w=workDone(r,elapsed(r)),k=dayKey(new Date(r.startAt));
  P.log[k]=(P.log[k]||0)+w;P.run=null;lastIdx=null;save();keepAwake(false);
  const pre=pomoSched;if(!completed)chimeCancel("pomo");pomoSched=false;
  if(completed){if(!pre)chime("end");toast(`Bravo ! ${hm(w/MIN)} de travail terminées`)}
  renderPomo();
}
$("pomoStart").addEventListener("click",startPomo);
$("pomoPause").addEventListener("click",()=>{const r=P.run;if(!r)return;unlockAudio();
  if(r.pausedAt){r.pausedTotal+=Date.now()-r.pausedAt;r.pausedAt=null;keepAwake(true)}else{r.pausedAt=Date.now();keepAwake(false)}
  save();pomoPlan();renderPomo()});
$("pomoSkip").addEventListener("click",()=>{const r=P.run;if(!r)return;unlockAudio();
  const L=locate(r,elapsed(r));r.pausedTotal-=(L.d-L.into);save();chimeCancel("pomo");pomoSched=false;tickPomo();pomoPlan()});
$("pomoStop").addEventListener("click",e=>{const b=e.currentTarget;
  if(b.dataset.armed){finishPomo(false);toast("Session arrêtée")}
  else{b.dataset.armed="1";b.textContent="Confirmer ?";setTimeout(()=>{delete b.dataset.armed;b.textContent="Arrêter"},3000)}});

function tickPomo(){
  const r=P.run;if(!r)return;
  const el=elapsed(r),L=locate(r,el);
  if(L.i>=r.segs.length){finishPomo(true);return}
  if(lastIdx!==null&&L.i!==lastIdx){
    const s=r.segs[L.i];if(!pomoSched)chime(s.t);toast(s.t==="w"?"Au travail !":`Pause de ${s.d} min`);
    $("stage").classList.remove("flash");void $("stage").offsetWidth;$("stage").classList.add("flash");
  }
  lastIdx=L.i;
  const s=r.segs[L.i],isW=s.t==="w";
  const nW=r.segs.filter(x=>x.t==="w").length,curW=r.segs.slice(0,L.i+1).filter(x=>x.t==="w").length;
  $("stage").style.setProperty("--pc",`var(${isW?"--accent":"--ok"})`);
  $("phase").textContent=r.pausedAt?"En pause":isW?"Travail":"Pause";
  $("clock").textContent=clockTxt(L.d-L.into);
  $("segInfo").textContent=isW?`Session ${curW} sur ${nW}`:`Prochaine : session ${curW+1} sur ${nW}`;
  $("ring").style.strokeDashoffset=(339.29*(L.into/L.d)).toFixed(2);
  planBar(r.segs,$("runBar"),L.i);
  const totalMs=r.segs.reduce((a,x)=>a+x.d*MIN,0);
  $("mDone").textContent=hm(workDone(r,el)/MIN);
  $("mLeft").textContent=hm((totalMs-el)/MIN);
  $("mEnd").textContent=hhmm(new Date(Date.now()+(totalMs-el)));
  $("pomoPause").textContent=r.pausedAt?"Reprendre":"Pause";
  document.title=r.pausedAt?"Sid'compagnon":`${clockTxt(L.d-L.into)} · ${isW?"Travail":"Pause"}`;
}
function renderPomo(){
  const run=!!P.run;
  $("pomoSetup").hidden=run;$("pomoRun").hidden=!run;setBadge("pomo",run?"dot":0);
  if(run)tickPomo();else{renderSetup();document.title="Sid'compagnon"}
  renderPomoStats();
}
function renderPomoStats(){
  const today=P.log[dayKey(new Date())]||0;
  let week=0;for(let i=0;i<7;i++){const d=new Date();d.setDate(d.getDate()-i);week+=P.log[dayKey(d)]||0}
  const live=P.run?workDone(P.run,elapsed(P.run)):0;
  // v51 (ticket #3) : résumé dessiné par React (app/src/PomoStats.tsx) ; ancien rendu en secours
  if(window.SCIslands&&window.SCIslands.pomoStats&&!window.__noIslands){try{window.SCIslands.pomoStats($("pomoStats"),{todayMin:(today+live)/MIN,weekMin:(week+live)/MIN,i18n:{L,MOL,MO,DOWL}});return}catch(e){reportErr("island pomo: "+(e&&e.message))}}
  $("pomoStats").innerHTML=`<div class="row"><div class="grow">Travail concentré aujourd'hui</div><b>${hm((today+live)/MIN)}</b></div>
    <div class="row"><div class="grow">Sur les 7 derniers jours</div><b>${hm((week+live)/MIN)}</b></div>`;
}
setInterval(()=>{if(P.run){tickPomo();if(!$("v-pomo").hidden)renderPomoStats()}},500);
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&P.run){unlockAudio();if(!P.run.pausedAt)keepAwake(true);tickPomo();pomoPlan()}});

function renderAll(){renderTodos();renderPlan();renderStats();renderPomo();renderTypes();renderMuscu();renderDocs();renderNotes();renderPwd();renderNutri();if(data.ui.view==="graph")renderGraph();if(data.ui.view==="home")renderHome();if(data.ui.view==="spaces")renderSpaces();renderSide()}

/* ---------- écran de connexion ---------- */
let authMode="login";
const isEmail=v=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
function setMode(m){
  authMode=m;
  $("mLogin").setAttribute("aria-pressed",m==="login");$("mSignup").setAttribute("aria-pressed",m==="signup");
  $("aNameWrap").hidden=m!=="signup";$("aPw2Wrap").hidden=m!=="signup";
  $("aEmailLbl").textContent=m==="signup"?"E-mail":"E-mail";
  $("aEmail").type=m==="signup"?"email":"text";
  $("aBtn").textContent=m==="signup"?"Créer mon compte":"Se connecter";
  $("aPw").autocomplete=m==="signup"?"new-password":"current-password";
  $("authHint").hidden=m==="signup";$("aLegal").hidden=m!=="signup";
  $("aErr").hidden=true;
}
$("mLogin").addEventListener("click",()=>setMode("login"));
// v28 : œil pour afficher ou masquer un mot de passe pendant la saisie
const EYE_O=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>`;
const EYE_X=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l18 18M10.6 5.1A9.9 9.9 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4.1M6.6 6.6C3.8 8.4 2 12 2 12s3.6 7 10 7a9.6 9.6 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>`;
document.querySelectorAll("[data-pweyefor]").forEach(b=>b.innerHTML=EYE_O);
document.addEventListener("click",e=>{const b=e.target.closest("[data-pweyefor]");if(!b)return;e.preventDefault();const i=$(b.dataset.pweyefor);if(!i)return;
  const show=i.type==="password";i.type=show?"text":"password";b.innerHTML=show?EYE_X:EYE_O;b.setAttribute("aria-label",L(show?"Masquer le mot de passe":"Afficher le mot de passe"))});
// v28 : blocage après trop d'essais ratés sur cet appareil : 5 erreurs → 30 s d'attente, puis le double à chaque nouvelle erreur (15 min au plus)
const AUTH_LOCK="sidnote-auth-lock";
const authLock=()=>ls.get(AUTH_LOCK)||{n:0,until:0};
function authFailed(){const a=authLock();a.n++;if(a.n>=5)a.until=Date.now()+Math.min(900,30*2**(a.n-5))*1000;ls.set(AUTH_LOCK,a);return a}
let authTick=null;
function authWait(){const a=authLock(),left=Math.ceil((a.until-Date.now())/1000),btn=$("aBtn");clearTimeout(authTick);
  if(left>0){btn.disabled=true;btn.textContent=`${L("Trop d'essais : réessaie dans")} ${left>=60?Math.ceil(left/60)+" min":left+" s"}`;authTick=setTimeout(authWait,1000);return true}
  if(btn.disabled&&btn.textContent.startsWith(L("Trop d'essais"))){btn.disabled=false;setMode(authMode)}return false}
$("mSignup").addEventListener("click",()=>setMode("signup"));
const slug=n=>n.normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,".").replace(/^\.+|\.+$/g,"");
function authError(e){
  const m=String(e&&e.message||"").toLowerCase();
  if(e instanceof TypeError||m.includes("failed to fetch")||m.includes("load failed"))return "Pas de connexion internet. Réessaie quand tu es connecté.";
  if(m.includes("already")||e.code==="user_already_exists"||e.code==="email_exists")return "Un compte existe déjà avec cet e-mail. Connecte-toi.";
  if(m.includes("invalid login")||e.code==="invalid_credentials")return "E-mail ou mot de passe incorrect.";
  if(m.includes("password")&&(m.includes("least")||m.includes("weak")||m.includes("short")))return "Le mot de passe doit faire au moins 8 caractères.";
  if(m.includes("email")&&(m.includes("invalid")||m.includes("valid")))return "Cette adresse e-mail n'est pas valide.";
  if(m.includes("signups not allowed")||m.includes("signup is disabled"))return "La création de comptes est désactivée pour le moment.";
  if(e.status===429)return "Trop d'essais. Attends une minute et réessaie.";
  return "Impossible de continuer : "+(e&&e.message||"erreur inconnue");
}
// après connexion : récupère (ou crée) les données du compte puis recharge l'app
async function finishLogin(j,name,{carry=null,stay=true,pwReset=false}={}){
  const display=(j.user&&j.user.user_metadata&&j.user.user_metadata.name)||name||(j.user.email||"").split("@")[0];
  const uidv=j.user.id;
  const row=await fetchRow(uidv,j.access_token);
  const existing=ls.get(cacheKey(uidv));
  let c;
  const isTest=TEST_EMAILS.includes(String(j.user.email||"").toLowerCase());
  if(isTest)c={data:blank(),rev:new Date().toISOString(),base:row?row.updated_at:"",dirty:true}; // repart de zéro
  else if(carry)c={data:carry,rev:new Date().toISOString(),dirty:true};
  else if(ls.get("sidnote-trial-carry")&&ls.get(cacheKey(TRIAL_ID))){
    // v34 : données de l'essai reprises dans le compte
    const td=JSON.parse(JSON.stringify(ls.get(cacheKey(TRIAL_ID)).data||{}));delete td.ui;
    if(row){const rd=row.data||{};
      // compte existant : ses coffres et sa phrase restent ; ceux de l'essai ne sont pas repris (illisibles avec la phrase du compte)
      if(rd.phx||rd.vault||rd.docVault||rd.noteVault){const sealed=isV2(td.docVault);["vault","docVault","noteVault","phx"].forEach(k=>delete td[k]);
        td.pwds=[];td.notes=(td.notes||[]).filter(n=>!n.secret);if(sealed)td.docs=[]}
      c={data:mergeData(rd,td),rev:new Date().toISOString(),base:row.updated_at,dirty:true}}
    else{c={data:td,rev:new Date().toISOString(),dirty:true};const mk=ls.get("sidnote-mk-"+TRIAL_ID);if(mk)ls.set("sidnote-mk-"+uidv,mk)}
    await idbRekey(TRIAL_ID,uidv);ls.del(cacheKey(TRIAL_ID));ls.del("sidnote-mk-"+TRIAL_ID);ls.del("sidnote-trial-carry")}
  else if(row){c={data:row.data,rev:row.updated_at,base:row.updated_at,dirty:false};
    if(existing&&existing.dirty)c={data:mergeData(existing.data,row.data,{base:baseGet(uidv,existing.base||"")}),rev:new Date().toISOString(),base:row.updated_at,dirty:true}}
  else{
    c={data:existing?existing.data:blank(),rev:new Date().toISOString(),dirty:true};
  }
  if(row&&!isTest)baseSet(uidv,row.updated_at,row.data); // v44.6 : version du serveur connue ici
  if(pwReset&&c.data&&c.data.phx&&c.data.phx.pw){c.data.phx={...c.data.phx,pwStale:Date.now()};c.dirty=true} // v48 : réenveloppé au prochain déverrouillage
  session=null;storeSession(j,display);session.eph=isTest||!stay;ls.set(SESSION_KEY,session);ssSet("sidnote-alive","1");
  if(isTest)idbClearUser(uidv);
  ls.set(cacheKey(uidv),c);
  if(isTest||!stay)ls.del(LAST_KEY);else ls.set(LAST_KEY,j.user.email&&!j.user.email.endsWith("@"+EMAIL_DOMAIN)?j.user.email:(name||""));
  location.reload();
}
$("authForm").addEventListener("submit",async e=>{
  e.preventDefault();
  const err=$("aErr"),btn=$("aBtn"),ident=$("aEmail").value.trim(),pw=$("aPw").value,name=$("aName").value.trim().replace(/\s+/g," ");
  const fail=m=>{err.textContent=m;err.hidden=false;err.classList.remove("shake");void err.offsetWidth;err.classList.add("shake");if(navigator.vibrate)navigator.vibrate(60)};
  err.hidden=true;
  if(!CONFIGURED)return fail("L'app n'est pas encore reliée à son serveur.");
  if(authMode==="login"&&authWait())return;
  if(authMode==="signup"){
    if(!name)return fail("Choisis un pseudo.");
    if(!isEmail(ident))return fail("Écris une adresse e-mail valide.");
  }else if(!ident)return fail("Écris ton e-mail.");
  if(!pw)return fail("Écris ton mot de passe.");
  // v32 : 8 caractères pour un nouveau compte (les anciens mots de passe plus courts marchent toujours pour se connecter)
  if(authMode==="signup"&&pw.length<8)return fail("Le mot de passe doit faire au moins 8 caractères.");
  if(authMode==="signup"&&pw!==$("aPw2").value)return fail("Les deux mots de passe ne sont pas identiques.");
  // v43 : acceptation explicite des conditions (case non pré-cochée) ; la date et la version sont gardées avec le compte
  if(authMode==="signup"&&!$("aAgree").checked)return fail("Coche la case pour accepter les conditions d'utilisation.");
  // ancien compte : pseudo à la place de l'e-mail
  const email=ident.includes("@")?ident.toLowerCase():`${slug(ident)}@${EMAIL_DOMAIN}`;
  if(!ident.includes("@")&&!slug(ident))return fail("Écris ton e-mail.");
  btn.disabled=true;btn.textContent=authMode==="signup"?"Création…":"Connexion…";
  try{
    let j;
    if(authMode==="signup"){
      j=await api("/auth/v1/signup",{method:"POST",body:{email,password:pw,data:{name,terms_at:new Date().toISOString(),terms_v:"2026-10-22"}}});
      if(!j||!j.access_token)throw new Error("La confirmation par e-mail est activée sur le serveur.");
    }else j=await api("/auth/v1/token?grant_type=password",{method:"POST",body:{email,password:pw}});
    ls.del(AUTH_LOCK);
    await finishLogin(j,authMode==="signup"?name:"",{stay:$("aStay").checked});
  }catch(ex){btn.disabled=false;setMode(authMode);
    const bad=authMode==="login"&&!(ex instanceof TypeError)&&ex.status!==429&&ex.status<500;let a=null;if(bad)a=authFailed();
    fail(authError(ex)+(a&&a.n>=3&&a.n<5?` ${L("Encore")} ${5-a.n} ${L(5-a.n>1?"essais avant une pause.":"essai avant une pause.")}`:""));
    $("aPw").value="";if(!authWait())$("aPw").focus()}
});

/* ---------- v28 : mot de passe oublié (lien par e-mail) et changement de mot de passe ---------- */
$("aForgot").addEventListener("click",()=>{$("fpEmail").value=$("aEmail").value.includes("@")?$("aEmail").value.trim():"";$("fpErr").hidden=true;$("fpOk").hidden=true;$("fpBtn").disabled=false;$("fpSheet").hidden=false;setTimeout(()=>$("fpEmail").focus(),60)});
$("fpClose").addEventListener("click",()=>$("fpSheet").hidden=true);
$("fpForm").addEventListener("submit",async e=>{e.preventDefault();const em=$("fpEmail").value.trim().toLowerCase(),er=$("fpErr"),btn=$("fpBtn");er.hidden=true;
  if(!isEmail(em)){er.textContent=L("Écris une adresse e-mail valide.");er.hidden=false;return}
  if(em.endsWith("@"+EMAIL_DOMAIN)){er.textContent=L("Ce compte utilise un pseudo, sans e-mail : demande à SidCorp de remettre ton mot de passe à zéro.");er.hidden=false;return}
  btn.disabled=true;btn.textContent=L("Envoi…");
  try{await api("/auth/v1/recover?redirect_to="+encodeURIComponent(location.origin+location.pathname),{method:"POST",body:{email:em}});
    $("fpOk").textContent=L("C'est envoyé. Si un compte existe avec cette adresse, tu vas recevoir un e-mail : ouvre le lien sur cet appareil (regarde aussi dans les spams).");$("fpOk").hidden=false;btn.textContent=L("Envoyé");}
  catch(ex){btn.disabled=false;btn.textContent=L("Envoyer le lien");er.textContent=ex.status===429?L("Trop de demandes. Attends quelques minutes et réessaie."):authError(ex);er.hidden=false}});
// les codes (mots de passe, notes, documents) peuvent être retrouvés avec le mot de passe du compte : on les rechiffre avec le nouveau
async function recRewrap(oldPw,newPw){let n=0;
  for(const v of [data.vault,data.noteVault,data.docVault,data.phx]){if(!v||!v.rec)continue; // v32 : la phrase secrète aussi
    try{const o=await decJ(await pinKey(oldPw,v.rec.salt,PIN_ITER),v.rec);const salt=b64e(crypto.getRandomValues(new Uint8Array(16)));
      v.rec={salt,...await encJ(await pinKey(newPw,salt,PIN_ITER),o)};n++}catch(e){}}
  // v48 : la clé maître enveloppée par le mot de passe du compte
  if(data.phx&&data.phx.pw){try{const o=await decJ(await pinKey(oldPw,data.phx.pw.salt,PIN_ITER),data.phx.pw),salt=rnd(16);
    const x={...data.phx,pw:{salt,...await encJ(await pinKey(newPw,salt,PIN_ITER),o)}};delete x.pwStale;data.phx=x;n++}catch(e){}}
  if(n)save();return n}
let npCtx=null; // {mode:"change"} ou {mode:"recovery",token}
function openNp(ctx){npCtx=ctx;const ch=ctx.mode==="change";$("npTitle").textContent=L(ch?"Changer mon mot de passe":"Nouveau mot de passe");
  $("npText").textContent=L(ch?"Entre ton mot de passe actuel, puis le nouveau (8 caractères minimum).":"Choisis ton nouveau mot de passe (8 caractères minimum).");
  $("npOldWrap").hidden=!ch;["npOld","npPw","npPw2"].forEach(i=>{$(i).value="";$(i).type="password"});$("npErr").hidden=true;$("npBtn").disabled=false;$("npBtn").textContent=L("Enregistrer");
  $("npSheet").hidden=false;setTimeout(()=>$(ch?"npOld":"npPw").focus(),60)}
$("npClose").addEventListener("click",()=>{$("npSheet").hidden=true;npCtx=null});
$("chPwBtn").addEventListener("click",()=>{if(!session)return;if(String(accEmail()).endsWith("@"+EMAIL_DOMAIN)){toast("Passe d'abord à la connexion par e-mail (plus bas)");return}openNp({mode:"change"})});
$("npForm").addEventListener("submit",async e=>{e.preventDefault();if(!npCtx)return;const er=$("npErr"),btn=$("npBtn"),pw=$("npPw").value,ch=npCtx.mode==="change";
  const fail=m=>{er.textContent=L(m);er.hidden=false};er.hidden=true;
  if(pw.length<8)return fail("Le mot de passe doit faire au moins 8 caractères.");
  if(pw!==$("npPw2").value)return fail("Les deux mots de passe ne sont pas identiques.");
  btn.disabled=true;btn.textContent=L("Enregistrement…");
  try{
    if(ch){const old=$("npOld").value;if(old===pw){btn.disabled=false;btn.textContent=L("Enregistrer");return fail("Le nouveau mot de passe doit être différent de l'actuel.")}
      let j;try{j=await api("/auth/v1/token?grant_type=password",{method:"POST",body:{email:accEmail(),password:old}})}
      catch(ex){btn.disabled=false;btn.textContent=L("Enregistrer");return fail(ex instanceof TypeError?"Pas de connexion internet. Réessaie quand tu es connecté.":"Mot de passe actuel incorrect.")}
      await api("/auth/v1/user",{method:"PUT",token:j.access_token,body:{password:pw}});
      await recRewrap(old,pw);$("npSheet").hidden=true;npCtx=null;toast("Mot de passe changé");return}
    // lien reçu par e-mail : la session de récupération permet de changer le mot de passe, puis on se connecte normalement
    const u=await api("/auth/v1/user",{method:"PUT",token:npCtx.token,body:{password:pw}});
    const em=(u&&u.email)||npCtx.email;$("npSheet").hidden=true;npCtx=null;ls.del(AUTH_LOCK);
    if(session&&session.user&&u&&session.user.id===u.id){if(data.phx&&data.phx.pw){data.phx={...data.phx,pwStale:Date.now()};save()}toast("Mot de passe changé");return}
    if(session)await endSessionQuiet();
    const j=await api("/auth/v1/token?grant_type=password",{method:"POST",body:{email:em,password:pw}});
    try{sessionStorage.setItem("sidnote-msg-ok","1")}catch(x){}
    await finishLogin(j,"",{stay:true,pwReset:true});
  }catch(ex){btn.disabled=false;btn.textContent=L("Enregistrer");fail(ex.status===401||ex.status===403?"Ce lien a expiré. Redemande un e-mail avec « Mot de passe oublié ? ».":authError(ex))}});
async function endSessionQuiet(){try{if(cache&&cache.dirty)await push()}catch(e){}ls.del(SESSION_KEY);session=null}
// retour depuis l'e-mail : l'adresse contient #access_token=…&type=recovery (ou une erreur si le lien a expiré)
function recoveryFromHash(){const h=new URLSearchParams(location.hash.slice(1));if(!h.get("type")&&!h.get("error"))return false;
  history.replaceState(null,"",location.pathname+location.search);
  if(h.get("error")){setTimeout(()=>toast(h.get("error_code")==="otp_expired"?"Ce lien a expiré : redemande-en un avec « Mot de passe oublié ? »":"Lien invalide : redemande-en un",6000),300);return false}
  if(h.get("type")!=="recovery"||!h.get("access_token"))return false;
  setTimeout(()=>openNp({mode:"recovery",token:h.get("access_token")}),200);return true}
/* ---------- compte dans Réglages ---------- */
document.addEventListener("click",e=>{if(e.target.closest("[data-trialacc]"))trialToAccount()});
$("logoutBtn").addEventListener("click",async e=>{
  const b=e.currentTarget;
  if(isTrial()){if(!b.dataset.armed){b.dataset.armed="1";b.textContent=L("Les données de l'essai seront effacées. Toucher encore pour confirmer");return}
    ls.del("sidnote-mk-"+TRIAL_ID);ls.del("sidnote-trial-carry");endSession("",false);return}
  if(!b.dataset.armed){b.dataset.armed="1";b.textContent="Toucher encore pour confirmer";setTimeout(()=>{delete b.dataset.armed;b.textContent="Se déconnecter"},3500);return}
  if(cache&&cache.dirty){await push();
    if(cache.dirty&&b.dataset.armed!=="2"){b.dataset.armed="2";b.textContent="Modifs non envoyées : déconnecter quand même ?";return}}
  await dropSub().catch(()=>{});
  try{api("/auth/v1/logout",{method:"POST",token:session.access_token}).catch(()=>{})}catch(x){}
  endSession("",false);
});

/* ---------- changer de pseudo ---------- */
$("nameForm").addEventListener("submit",async e=>{
  e.preventDefault();
  const name=$("newName").value.trim().replace(/\s+/g," "),btn=e.target.querySelector("button");
  if(!name)return;
  if(name===session.name){toast("C'est déjà ton pseudo");return}
  btn.disabled=true;btn.textContent="…";
  try{
    await api("/auth/v1/user",{method:"PUT",token:await token(),body:{data:{name}}});
    session.name=name;ls.set(SESSION_KEY,session);
    renderAccount();$("newName").value="";toast("Pseudo modifié");
  }catch(ex){toast(ex instanceof TypeError?"Pas de connexion internet":"Modification impossible : "+ex.message)}
  btn.disabled=false;btn.textContent="Modifier";
});
const isTestAcc=()=>!!session&&TEST_EMAILS.includes(String(session.email||"").toLowerCase());
const isLegacyAcc=()=>!session.email||session.email.endsWith("@"+EMAIL_DOMAIN);
function renderAccount(){
  $("accName").textContent=session.name;$("hello").textContent=`Salut ${session.name} !`;
  $("accEmail").textContent=isLegacyAcc()?"Compte sans e-mail (ancien système)":session.email;
  $("migrateSec").hidden=!isLegacyAcc();
  $("testBanner").hidden=!isTestAcc();$("delAccRow").hidden=$("delAccNote").hidden=isTrial()||isTestAcc();if(typeof renderConsent==="function")renderConsent();
  const tr=isTrial();$("trialBanner").hidden=!tr;$("nameForm").hidden=tr;$("chPwBtn").closest(".row").hidden=tr;$("rappelsSec").hidden=tr;
  $("logoutBtn").textContent=L(tr?"Quitter l'essai":"Se déconnecter");if(tr)$("accEmail").textContent=L("Sans compte");
}
// ancien compte (pseudo) -> nouveau compte avec e-mail, données transférées
$("migrateForm").addEventListener("submit",async e=>{
  e.preventDefault();
  const email=$("mEmail").value.trim().toLowerCase(),pw=$("mPw").value,btn=$("mBtn");
  if(!isEmail(email)){toast("Écris une adresse e-mail valide");return}
  if(pw.length<8){toast("Le mot de passe doit faire au moins 8 caractères");return}
  btn.disabled=true;btn.textContent="Transfert…";
  try{
    await push();
    const j=await api("/auth/v1/signup",{method:"POST",body:{email,password:pw,data:{name:session.name}}});
    if(!j||!j.access_token)throw new Error("La confirmation par e-mail est activée sur le serveur.");
    const carry=JSON.parse(JSON.stringify(data));
    const old=session.user.id;
    await dropSub().catch(()=>{});
    ls.del(cacheKey(old));
    await finishLogin(j,session.name,{carry,stay:!session.eph});
  }catch(ex){toast(authError(ex));btn.disabled=false;btn.textContent="Passer à l'e-mail"}
});

/* ---------- rappels (notifications) ---------- */
const VAPID_PUBLIC="BIWx3Uk7vX6yeb6rht0Rpz4eW25rwCzuQWIfNWxdxUePx7XkmISBvtbY47jthl51PVJaY9QkrG5LRl8Whx1TjK4";
const pushOK=()=>"serviceWorker" in navigator&&"PushManager" in window&&"Notification" in window;
const isIOS=/iphone|ipad|ipod/i.test(navigator.userAgent);
const standalone=()=>window.matchMedia("(display-mode: standalone)").matches||navigator.standalone===true;
function b64u(s){const p="=".repeat((4-s.length%4)%4),b=atob((s+p).replace(/-/g,"+").replace(/_/g,"/"));return Uint8Array.from(b,c=>c.charCodeAt(0))}
async function currentSub(){if(!pushOK())return null;const r=await navigator.serviceWorker.ready;return r.pushManager.getSubscription()}
// le bloc « notifications » existe à deux endroits (Réglages et Planning) : même contenu, mêmes réglages
let nfState={kind:"off",msg:""},nfCustom=false;
async function renderNotif(){
  if(!pushOK())nfState={kind:"na",msg:isIOS&&!standalone()?"Pour activer les notifications, ouvre Sid'compagnon depuis l'icône de ton écran d'accueil.":"Ce navigateur ne gère pas les notifications."};
  else if(Notification.permission==="denied")nfState={kind:"na",msg:"Notifications bloquées. Autorise-les dans les réglages de ton smartphone (Notifications > Sid'compagnon)."};
  else{const sub=await currentSub().catch(()=>null);nfState=sub&&Notification.permission==="granted"?{kind:"on"}:{kind:"off"}}
  renderLeads();
}
function renderLeads(){
  const cur=notifLeads(),on=nfState.kind==="on",ical=notifIcal(),all=[...new Set([...LEADS.map(x=>x[0]),...cur])].sort((a,b)=>a-b);
  const html=`<div class="card">
      <div class="row"><div class="grow">${L("Sois prévenu avant chaque activité du planning.")}<div class="small muted">${nfState.kind==="na"?L(nfState.msg):on?`<span class="syncdot"></span>${L("Activés sur cet appareil")}`:L("Désactivés sur cet appareil.")}</div></div></div>
      ${nfState.kind==="na"?"":`<div class="row" style="gap:8px"><button type="button" class="btn ${on?"ghost":""}" data-nf="toggle" style="flex:1">${L(on?"Désactiver":"Activer les notifications")}</button>${on?`<button type="button" class="btn ghost" data-nf="test">${L("Tester")}</button>`:""}</div>`}
    </div>
    <div class="label" style="margin:12px 4px 6px">${L("Me prévenir")}</div>
    <div class="chips" style="flex-wrap:wrap;margin:0;padding-inline:0">${all.map(m=>m===1440?`<span class="pill lock" aria-pressed="true" title="${L("Toujours active")}">${leadLbl(m)} · ${L("toujours")}</span>`:`<button type="button" class="pill" data-lead="${m}" aria-pressed="${cur.includes(m)}">${leadLbl(m)}</button>`).join("")}<button type="button" class="pill add" data-nf="custom">+ ${L("Autre délai")}</button></div>
    ${nfCustom?`<form class="notif-lead-custom" data-nf="customf"><input type="text" inputmode="numeric" maxlength="3" name="n" placeholder="15" aria-label="${L("Durée")}" autocomplete="off"><select class="sel" name="u" aria-label="${L("Unité")}"><option value="1">${L("minutes")}</option><option value="60" selected>${L("heures")}</option><option value="1440">${L("jours")}</option></select><span class="small muted">${L("avant")}</span><button class="btn" type="submit" style="padding:8px 14px">OK</button></form>`:""}
    ${CALS().length?`<label class="nf-ical"><input type="checkbox" data-nf="ical" ${ical?"checked":""}> <span>${L("Cours du calendrier relié : mêmes rappels que tes activités")}</span></label>`:""}
    <p class="small muted" style="margin:8px 4px 0">${L("Tu peux en choisir plusieurs. Une activité sans heure compte pour 8 h. Sur smartphone, ouvre Sid'compagnon depuis l'écran d'accueil (iOS 16.4 ou plus).")}</p>`;
  const ae=document.activeElement,typing=ae&&ae.matches&&ae.matches("input[type=text],select");
  document.querySelectorAll(".notif-box").forEach(b=>{if(!(typing&&b.contains(ae)))b.innerHTML=html});
  renderRem("f");if(!$("sheet").hidden&&editing&&editing.kind==="task")renderRem("e");
  const s=$("planNotifSum");if(s)s.textContent=on?`${L("Rappels")} · ${cur.map(leadLbl).join(", ")}${ical?` · ${L("cours")}`:""}`:L("Rappels : activer les notifications");
}
async function saveSub(sub){
  await api("/rest/v1/push_subscriptions?on_conflict=endpoint",{method:"POST",token:await token(),
    headers:{Prefer:"resolution=merge-duplicates,return=minimal"},body:{endpoint:sub.endpoint,user_id:session.user.id,subscription:sub.toJSON()}});
}
async function dropSub(){
  const sub=await currentSub().catch(()=>null);if(!sub)return;
  try{await api(`/rest/v1/push_subscriptions?endpoint=eq.${encodeURIComponent(sub.endpoint)}`,{method:"DELETE",token:await token()})}catch(e){}
  try{await sub.unsubscribe()}catch(e){}
}
async function notifToggle(btn){
  btn.disabled=true;
  try{
    const sub=await currentSub();
    if(sub&&Notification.permission==="granted"){await dropSub();toast("Notifications désactivées")}
    else{
      const perm=await Notification.requestPermission();
      if(perm!=="granted"){toast("Notifications refusées");renderNotif();return}
      const r=await navigator.serviceWorker.ready;
      const s=sub||await r.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64u(VAPID_PUBLIC)});
      await saveSub(s);toast("Notifications activées");
    }
  }catch(ex){toast(ex instanceof TypeError?"Pas de connexion internet":"Activation impossible : "+(ex.message||"erreur"))}
  renderNotif();
}
// délais choisis (minutes avant l'activité), synchronisés avec le compte : le serveur les lit
const LEADS=[[10,"10 min"],[30,"30 min"],[60,"1 h"],[120,"2 h"],[1440,"La veille"],[2880,"2 jours"]];
// v39 : la veille est toujours active (le serveur l'envoie de toute façon), en plus des délais choisis
const notifLeads=()=>{const n=data.prefs.notif,a=n&&Array.isArray(n.leads)?n.leads:[];return [...new Set([...a,1440])].sort((x,y)=>x-y)};
// cours de l'horaire iCal : prévenus 24 h avant (activé par défaut) ; le serveur lit data.icalSoon
const notifIcal=()=>!(data.prefs.notif&&data.prefs.notif.ical===false);
function leadLbl(m){const p=LEADS.find(x=>x[0]===m);if(p)return L(p[1]);
  if(m%1440===0)return `${m/1440} ${L(m/1440>1?"jours":"jour")}`;if(m%60===0)return `${m/60} h`;if(m>60)return `${Math.floor(m/60)} h ${two(m%60)}`;return `${m} min`}
const setNotif=o=>{data.prefs.notif={...(data.prefs.notif||{}),...o};save();renderLeads()};
document.addEventListener("click",async e=>{const box=e.target.closest(".notif-box");if(!box)return;
  const l=e.target.closest("[data-lead]");
  if(l){const m=+l.dataset.lead;let cur=notifLeads().slice();cur=cur.includes(m)?cur.filter(x=>x!==m):[...cur,m].sort((a,b)=>a-b);
    if(m===1440)return;setNotif({leads:cur});return}
  const b=e.target.closest("button[data-nf]");if(!b)return;
  if(b.dataset.nf==="toggle")notifToggle(b);
  else if(b.dataset.nf==="custom"){nfCustom=!nfCustom;renderLeads();const i=box.querySelector('[data-nf="customf"] input');if(i)i.focus()}
  else if(b.dataset.nf==="test"){try{await api("/functions/v1/rappels",{method:"POST",token:await token(),body:{test:true,lang:LANG}});toast("Notification de test envoyée")}
    catch(ex){toast("Test impossible : "+(ex.message||"erreur"))}}
});
document.addEventListener("change",e=>{const c=e.target.closest('.notif-box [data-nf="ical"]');if(!c)return;setNotif({ical:c.checked});icalSoonSync();
  toast(c.checked?"Cours : rappels activés":"Cours : plus de rappel")});
document.addEventListener("submit",e=>{const f=e.target.closest('.notif-box [data-nf="customf"]');if(!f)return;e.preventDefault();
  const n=Math.round(numIn(f.elements.n.value)),m=n*(+f.elements.u.value);if(!(m>=5&&m<=20160)){toast("Choisis entre 5 minutes et 14 jours");return}
  document.activeElement&&document.activeElement.blur();nfCustom=false;const cur=notifLeads();setNotif({leads:[...new Set([...cur,m])].sort((a,b)=>a-b)});toast(`${L("Rappel ajouté")} : ${leadLbl(m)}`)});
// --- rappel propre à une activité (formulaire du planning et fiche « Modifier ») : t.leads = délais choisis, t.remind = false = aucun rappel
const remSel={f:null,e:null},remCustom={f:false,e:false};
const remOf=t=>[...new Set([...(t&&t.remind!==false&&Array.isArray(t.leads)&&t.leads.length?t.leads:t&&t.remind===false?[]:notifLeads()),1440])].sort((a,b)=>a-b);
function renderRem(k){const box=$(k==="f"?"fRem":"eRem");if(!box)return;if(!remSel[k])remSel[k]=notifLeads().slice();
  const sel=remSel[k],on=nfState.kind==="on",all=[...new Set([...LEADS.map(x=>x[0]),...sel])].sort((a,b)=>a-b);
  box.innerHTML=`<div class="rem-h">${IC("bell")} ${L("Me prévenir")}</div>
    <div class="rem-chips">${all.map(m=>m===1440?`<span class="pill lock" aria-pressed="true">${leadLbl(m)} · ${L("toujours")}</span>`:`<button type="button" class="pill" data-rl="${m}" aria-pressed="${sel.includes(m)}">${leadLbl(m)}</button>`).join("")}<button type="button" class="pill add" data-rcustom="1">+ ${L("Autre")}</button></div>
    ${remCustom[k]?`<div class="notif-lead-custom"><input type="text" inputmode="numeric" maxlength="3" data-rn placeholder="15" aria-label="${L("Durée")}" autocomplete="off"><select class="sel" data-ru aria-label="${L("Unité")}"><option value="1">${L("minutes")}</option><option value="60" selected>${L("heures")}</option><option value="1440">${L("jours")}</option></select><span class="small muted">${L("avant")}</span><button type="button" class="btn" data-rok="1" style="padding:8px 14px">OK</button></div>`:""}
    ${on?`<div class="small muted">${L("Sans heure, l'activité compte pour 8 h.")}</div>`:nfState.kind==="na"?`<div class="small muted">${L(nfState.msg)}</div>`:`<button type="button" class="btn ghost rem-on" data-ron="1">${IC("bell")} ${L("Activer les notifications")}</button>`}`}
const remApply=(t,k)=>{const s=[...new Set([...(remSel[k]||notifLeads()),1440])],d=notifLeads();delete t.leads;delete t.remind;
  if(!s.length)t.remind=false;else if(s.length!==d.length||s.some(x=>!d.includes(x)))t.leads=s.slice().sort((a,b)=>a-b)};
["fRem","eRem"].forEach(id=>{const k=id[0];$(id).addEventListener("click",async e=>{const b=e.target.closest("button");if(!b)return;e.preventDefault();
  if(b.dataset.rnone)remSel[k]=[];
  else if(b.dataset.rl){const m=+b.dataset.rl,s=remSel[k];remSel[k]=s.includes(m)?s.filter(x=>x!==m):[...s,m].sort((a,c)=>a-c)}
  else if(b.dataset.rcustom)remCustom[k]=!remCustom[k];
  else if(b.dataset.rok){const box=$(id),n=Math.round(numIn(box.querySelector("[data-rn]").value)),m=n*(+box.querySelector("[data-ru]").value);
    if(!(m>=5&&m<=10080)){toast("Choisis entre 5 minutes et 7 jours");return}remSel[k]=[...new Set([...remSel[k],m])].sort((a,c)=>a-c);remCustom[k]=false}
  else if(b.dataset.ron){await notifToggle(b)}
  renderRem(k);if(remCustom[k]){const i=$(id).querySelector("[data-rn]");if(i)i.focus()}})});
// garder l'abonnement à jour côté serveur (il peut changer)
async function refreshSub(){try{const s=await currentSub();if(s&&Notification.permission==="granted")await saveSub(s)}catch(e){}}

/* ---------- modifier une tâche ou une date ---------- */
let editing=null;
function openEdit(ref){
  const [kind,id]=ref.split(":");
  const item=(kind==="todo"?data.todos:kind==="doc"?docsArr():data.tasks).find(x=>x.id===id);if(!item)return;
  editing={kind,item};
  $("sheetTitle").textContent=L(kind==="todo"?"Modifier la tâche":kind==="doc"?"Renommer le document":"Modifier l'activité");
  $("eTitle").value=item.title;$("eTask").hidden=kind!=="task";$("eTodoWrap").hidden=kind!=="todo";
  $("eDocWrap").hidden=kind!=="doc";
  if(kind==="doc")$("eDocFolder").innerHTML=`<option value="">${L("Aucun classeur")}</option>`+DF().map(f=>`<option value="${f.id}" ${item.folder===f.id?"selected":""}>${f.locked?L("Verrouillé")+" · ":""}${esc(f.name)}</option>`).join("");
  if(kind==="todo")$("eTodoCat").innerHTML=`<option value="">${L("Sans catégorie")}</option>`+TC().map(c=>`<option value="${c.id}" ${item.cat===c.id?"selected":""}>${esc(c.name)}</option>`).join("");
  if(kind==="task"){$("eDate").value=item.date;$("eEnd").value=item.end||"";$("eTime").value=item.time||"";$("eTimeEnd").value=item.timeEnd||"";$("eCat").value=item.cat||"";remSel.e=remOf(item);remCustom.e=false;renderRem("e")}
  const d=$("eDelete");d.classList.remove("armed");d.textContent="Supprimer";
  $("sheet").hidden=false;setTimeout(()=>$("eTitle").focus(),50);
}
function closeEdit(){$("sheet").hidden=true;editing=null}
document.addEventListener("click",e=>{const b=e.target.closest("[data-edit]");if(b){e.stopPropagation();openEdit(b.dataset.edit)}},true);
$("sheetClose").addEventListener("click",closeEdit);
$("sheet").addEventListener("click",e=>{if(e.target.id==="sheet")closeEdit()});
$("editForm").addEventListener("submit",e=>{
  e.preventDefault();if(!editing)return;
  const title=$("eTitle").value.trim();if(!title){toast("Le titre ne peut pas être vide");return}
  const it=editing.item;it.title=title;
  if(editing.kind==="todo"){const c=$("eTodoCat").value;if(c&&catOf(c)){if(it.cat!==c)delete it.ord;it.cat=c}else delete it.cat}
  if(editing.kind==="doc"){it.mod=Date.now();const f=$("eDocFolder").value;if(f&&DF().some(x=>x.id===f))it.folder=f;else delete it.folder}
  if(editing.kind==="task"){
    if(!$("eDate").value){toast("Choisis une date");return}
    it.date=$("eDate").value;
    if($("eEnd").value&&$("eEnd").value>it.date)it.end=$("eEnd").value;else delete it.end;
    if($("eTime").value)it.time=$("eTime").value;else delete it.time;
    if(it.time&&$("eTimeEnd").value){if($("eTimeEnd").value<=it.time){toast("L'heure de fin doit être après l'heure de début");return}it.timeEnd=$("eTimeEnd").value}else delete it.timeEnd;
    it.cat=ensureType($("eCat").value);remApply(it,"e");
  }
  save();closeEdit();renderTodos();renderPlan();renderTypes();renderDocs();toast("Modifié");
});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("sheet").hidden)closeEdit()});
$("eDelete").addEventListener("click",e=>{
  const b=e.currentTarget;if(!editing)return;
  const {kind,item}=editing;
  if(kind==="doc"){closeEdit();docDelete(item);return}
  closeEdit();if(kind==="todo")todoDel(item.id);else taskDel(item.id);
});

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
        exercises:(d.ex||[]).map(e=>({id:uid(),name:e.name||"",pat:e.pat||"",reps:e.reps||"",rest:+e.rest||120,rir:e.rir||"",note:e.note||"",sets:Array.from({length:Math.max(1,Math.min(20,+e.sets||3))},newSet)}))})});
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
  let prog="",cur=null;const out=[];
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
const exKg=x=>String(x==null?"":x).replace(".",LANG==="en"?".":",");
function seCard(se,letter){const nS=se.exercises.reduce((a,e)=>a+e.sets.length,0),ty=seType(se),T=ty&&SE_T[ty];
  // v47 (#14) : lettre de la séance dans son programme + type (poussée, tirage, jambes…) en couleur ; séance libre en pointillés
  const tag=letter||T?`<span class="se-tag">${letter?`<b>${letter}</b>`:""}${T?`<span>${L(T[0])}</span>`:""}</span>`:`<span class="se-tag se-free">${L("Libre")}</span>`;
  const shown=String(se.name||"").replace(/^(?:Séance|Session|Training)\s+[A-F]\s*·\s*/i,"")||L("Séance");
  return `<details class="ms${letter?"":" ms-free"}" data-ms="${se.id}" ${ty?`data-se="${ty}"`:""} ${se.id===msOpenId?"open":""}>
    <summary><span class="chev">›</span><span class="grow">${tag}<span class="ms-name notr">${esc(shown)}</span><br><span class="small muted">${se.exercises.length} ${L(se.exercises.length>1?"exercices":"exercice")} · ${nS} ${L(nS>1?"séries":"série")}</span></span><button type="button" class="x ms-del" data-msdel="1" aria-label="${L("Supprimer la séance")}">${IC("trash")}</button></summary>
    <div class="ms-body">
      <label class="small muted" style="display:grid;gap:4px">${L("Nom de la séance")}<input data-f="msname" value="${esc(se.name)}" autocomplete="off"></label>
      ${se.exercises.map((ex,i)=>`<div class="ex ex3" data-ex="${ex.id}">
        <div class="ex-head"><span class="num">${i+1}</span><input data-f="exname" value="${esc(ex.name)}" placeholder="${L("Nom de l'exercice")}" aria-label="${L("Nom de l'exercice")}" autocomplete="off" list="exList"><button type="button" class="mini ex-help" data-exhelp="1" aria-label="${L("Comment faire cet exercice")}" title="${L("Comment faire cet exercice")}"${exAide(ex.name)?"":" hidden"}>?</button><button type="button" class="x" data-msdelex="${ex.id}" aria-label="${L("Supprimer l'exercice")}">×</button></div>
        ${exAdvHtml(ex)}
        <div class="set-rows">${ex.sets.map((st,j)=>`<div class="set-row" data-si="${j}"><span class="set-l">${L("Série")} ${j+1}</span>
          <input class="set-in" data-f="setkg" value="${esc(exKg(st&&st.kg))}" placeholder="kg" aria-label="${L("Série")} ${j+1} : kg" autocomplete="off" inputmode="decimal">
          <span class="set-sep" aria-hidden="true">–</span>
          <input class="set-in" data-f="setreps" value="${esc(String((st&&st.reps)||""))}" placeholder="reps" aria-label="${L("Série")} ${j+1} : ${L("répétitions")}" autocomplete="off" inputmode="numeric">
          <button type="button" class="set-del" data-msdelset="${j}" aria-label="${L("Retirer la série")} ${j+1}" ${ex.sets.length<=1?"disabled":""}>×</button></div>`).join("")}</div>
        <div class="set-acts"><button type="button" class="set-add" data-msaddset="1" ${ex.sets.length>=20?"disabled":""}>+ ${L("Ajouter une série")}</button>${ex.sets.length>1?`<button type="button" class="set-add set-copy" data-mscopy1="1" title="${L("Recopier le poids et les répétitions de la série 1 dans toutes les séries")}">↓ ${L("Série 1 sur toutes")}</button>`:""}</div>
      </div>`).join("")}
      <button type="button" class="qbtn" data-msaddex="1">+ ${L("Ajouter un exercice")}</button>
      <div class="ms-actions">
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
  const gHtml=g=>`<section class="ms-grp" data-msgrp="${g.id}"><div class="ms-grp-h"><div class="grow"><span class="eyebrow notr">${esc(g.name)}</span><span class="small muted">${L(GSRC[g.src]||"Importé")} · ${g.ses.length} ${L(g.ses.length>1?"séances":"séance")}${g.plan?` · ${L("suivi")}`:""}</span></div><button type="button" class="pen" data-msgact="${g.id}" aria-label="${L("Actions du programme")}">${MORE}</button></div>
    ${g.ses.map((se,i)=>seCard(se,"ABCDEFGHIJ"[i]||"")).join("")||`<div class="small muted">${L("Aucune séance dans ce programme.")}</div>`}</section>`;
  $("msList").innerHTML=groups.map(gHtml).join("")+
    `<section class="ms-grp" data-msgrp=""><div class="ms-grp-h"><div class="grow"><span class="eyebrow">${L("Séances libres")}</span><span class="small muted">${free.length} ${L(free.length>1?"séances":"séance")}</span></div>${free.length?`<button type="button" class="pen" data-msgact="" aria-label="${L("Actions des séances libres")}">${MORE}</button>`:""}</div>
    ${free.map(se=>seCard(se)).join("")||`<div class="small muted">${L("Aucune séance libre. Crée-en une ci-dessous.")}</div>`}</section>`;
  renderMuGoal();
  const dl=$("exList");if(dl&&!dl.childElementCount)dl.innerHTML=EXDB.map(e=>`<option value="${esc(e.n)}"></option>`).join("")}
function msSaveSoon(se){if(se)seTouch(se);clearTimeout(msTimer);msTimer=setTimeout(save,500)}
$("msForm").addEventListener("submit",e=>{e.preventDefault();const n=$("msName").value.trim();if(!n)return;
  const se={id:uid(),name:n,exercises:[newEx()],upd:Date.now()};M().sessions.push(se);msOpenId=se.id;save();renderMuscu();$("msName").value="";toast("Séance créée")});
$("msList").addEventListener("toggle",e=>{const d=e.target.closest("[data-ms]");if(d&&d.open)msOpenId=d.dataset.ms},true);
$("msList").addEventListener("input",e=>{
  const inp=e.target,f=inp.dataset.f;if(!f)return;
  const se=msFind(inp.closest("[data-ms]").dataset.ms);if(!se)return;
  if(f==="msname"){se.name=inp.value;const n=inp.closest("[data-ms]").querySelector(".ms-name");if(n)n.textContent=inp.value||L("Séance")}
  else{const ex=se.exercises.find(x=>x.id===inp.closest("[data-ex]").dataset.ex);if(!ex)return;
    if(f==="exname"){ex.name=inp.value;const h=inp.parentElement.querySelector("[data-exhelp]");if(h)h.hidden=!exAide(ex.name);
      const av=inp.closest("[data-ex]").querySelector(".ex-adv");if(av)av.outerHTML=exAdvHtml(ex)}
    else if(f==="setkg"||f==="setreps"){const st=ex.sets[+inp.closest("[data-si]").dataset.si];if(!st)return;
      if(f==="setkg")st.kg=inp.value.replace(",",".").replace(/[^0-9.]/g,"").slice(0,7);else st.reps=inp.value.replace(/[^0-9]/g,"").slice(0,4)}}
  msSaveSoon(se)});
// v44.7 : fiche « comment faire » de chaque exercice proposé (site/exercices-aide.js), dans la langue de l'app
function exAide(name){const A=window.SIDFIT_AIDE||{},k=fold(String(name||"").trim());if(!k)return null;
  const key=Object.keys(A).find(x=>fold(x)===k);return key?{name:key,f:A[key][LANG]||A[key].fr}:null}
function exHelpOpen(name){const a=exAide(name);if(!a)return;const[mus,steps,err]=a.f;
  $("exHelpTitle").textContent=name.trim();
  const im=(window.SIDFIT_IMG||{})[a.name];
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
  // v44.4 : aussi depuis l'en-tête de la séance (poubelle, 2 appuis)
  else if(b.dataset.msdel&&c2ok(b))undoable("Séance supprimée",[se.id],()=>{tomb(se.id);M().sessions=M().sessions.filter(x=>x!==se)},{after:renderMuscu});
});
// actions d'un programme (ou des séances libres) : partager, suivre, renommer, supprimer
function grpActions(id){
  if(!id){const free=M().sessions.filter(s=>s&&!s.grp);
    openActions(L("Séances libres"),[{l:"Partager toutes les séances libres",fn:()=>copyText(shareTxt(free,L("Séances libres")),"prog")}]);return}
  const ses=grpSe(id),pl=PL(),isPlan=pl&&pl.id===id,name=(ses[0]&&ses[0].grp&&ses[0].grp.name)||L("Mon programme");
  const it=[{l:"Partager le programme",fn:()=>copyText(shareTxt(ses,isPlan?L("Mon programme"):name),"prog")}];
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
  const mk=e=>{let sets=p.level==="deb"?3:EXHEAVY(e)?4:3;if(prio.has(e.m))sets++;if(p.level==="conf"&&EXHEAVY(e))sets=Math.max(sets,4);
    return{name:e.n,pat:e.m+":"+e.pat,sets,reps:EXHEAVY(e)?R[0]:R[1],rest:REST[e.t]||120,rir,note:[e.note,p.level==="conf"&&!EXHEAVY(e)?"Dernière série au plus près de l'échec":""].filter(Boolean).join(". ")}};
  // exercices imposés : chacun va dans la séance qui travaille déjà ce muscle (la moins chargée en imposés)
  const forced=split.map(()=>[]);
  for(const n of p.must||[]){const e=EXN(n);if(!e||never.has(n))continue;
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
    return{id:uid(),name:`${L("Séance")} ${"ABCDEF"[di]} · ${L(DAYN[t])}`,ex:ex.map(mk)}}
  return{id:uid(),profile:p,days,at:new Date().toISOString(),upd:Date.now(),src:"app"}}
// v44 : le programme devient le programme suivi : ses séances passent au format commun, celles de l'ancien programme suivi sont retirées
function planApply(pl){const m=M(),old=PL();if(old)for(const s of grpSe(old.id)){tomb(s.id);m.sessions=m.sessions.filter(x=>x!==s)}
  m.plan=pl;muMigrate();m.upd=Date.now()}
const ML=()=>{const m=M();if(!Array.isArray(m.log))m.log=[];return m.log};
const coachNext=()=>{const ds=PLD();if(!ds.length)return null;const last=ML().filter(l=>ds.some(d=>d.id===l.day)).sort((a,b)=>(b.date||"").localeCompare(a.date||""))[0];
  const i=last?ds.findIndex(d=>d.id===last.day):-1;return ds[(i+1)%ds.length]};
function renderCoach(){const box=$("coachBox");if(!box)return;const pl=PL(),ds=PLD();
  const rmk=$("coRemark")?$("coRemark").value:""; // v43 : le rendu garde la remarque en cours
  if(!pl){box.innerHTML=`<div class="card coach-card"><div class="grow"><b>${L("Ton programme sur mesure")}</b><div class="small muted">${L("Quelques questions (niveau, objectif, jours, matériel) et Sid'compagnon crée tes séances.")}</div></div><button type="button" class="btn" data-coach="new">${L("Créer mon programme")}</button></div>`;return}
  const p=pl.profile||{},G={muscle:"Prendre du muscle",force:"Gagner en force",gras:"Perdre du gras",forme:"Être en forme",endu:"Gagner en endurance"},LV={deb:"Débutant",inter:"Intermédiaire",conf:"Confirmé"};
  box.innerHTML=`<div class="card coach-card coach-on"><div class="coach-top"><div class="grow"><span class="eyebrow">${L("Mon programme")}</span><b>${esc(L(G[p.goal]||"Sur mesure"))}${pl.src==="ia"?` · ${L("ajusté par Claude")}`:""}</b><div class="small muted">${p.level?esc(L(LV[p.level]||""))+" · ":""}${ds.length} ${L(ds.length>1?"séances":"séance")}</div></div><button type="button" class="pen" data-coach="more" aria-label="${L("Plus d'actions")}">${MORE}</button></div>
    ${pl.aiWait?`<div class="coach-wait" role="status"><span class="grow">${L("Demande envoyée à Claude : le programme ajusté arrivera ici tout seul.")}</span><button type="button" class="linkbtn" data-coach="resend">${L("Renvoyer")}</button><button type="button" class="x" data-coach="unwait" aria-label="${L("Masquer")}">×</button></div>`:""}
    <div class="coach-adj"><label for="coRemark" class="eyebrow">${L("Ta remarque sur ce programme")}</label><textarea id="coRemark" class="autogrow" rows="2" maxlength="600" placeholder="${L("Ex. remplace la 2e séance jambes par une séance haut du corps")}">${esc(pl.aiWait?"":rmk)}</textarea>
      <div class="coach-adj-b"><button type="button" class="btn" data-coach="adjust">${L("Ajuster avec Claude")}</button></div>
      ${(p.remarks||[]).length?`<details class="coach-rem"><summary class="small muted">${(p.remarks||[]).length} ${L((p.remarks||[]).length>1?"remarques envoyées":"remarque envoyée")}</summary><ul>${p.remarks.slice().reverse().map(r=>`<li class="small"><span class="notr">${esc(r.text)}</span> <span class="muted">· ${fmtWhen(Date.parse(r.at))}</span></li>`).join("")}</ul></details>`:""}</div></div>`}
let cfDraft={};
const restLbl=r=>r>=60?String(Math.round(r/60*10)/10).replace(".",",")+" min":r+" s";
function coachOpen(){const p=(PL()&&PL().profile)||{level:"deb",goal:"muscle",days:3,dur:60,equip:"gym",avoid:[],prio:[],must:[],never:[]};cfDraft=JSON.parse(JSON.stringify(p));
  document.querySelectorAll("#coachForm .cf-pick input").forEach(i=>i.value="");cfDraft.notes="";cfDraft.avoidTxt="";$("cfNotes").value="";$("cfAvoidTxt").value=""; // v43 : textes libres envoyés à Claude, jamais pré-remplis ensuite
  cfRender();$("coachErr").hidden=true;$("coachSheet").hidden=false}
// v43 : nombre de précisions facultatives remplies (résumé du bloc replié)
const cfOptN=()=>["prio","avoid","must","never"].reduce((n,k)=>n+((cfDraft[k]||[]).length?1:0),0)+(String(cfDraft.notes||"").trim()?1:0)+(String(cfDraft.avoidTxt||"").trim()?1:0);
function cfRender(){{const n=cfOptN();$("cfMoreSum").textContent=n?`${n} ${L(n>1?"précisions":"précision")}`:L("facultatif")}
  document.querySelectorAll("#coachForm [data-cf]").forEach(g=>{const k=g.dataset.cf,v=cfDraft[k];g.querySelectorAll("[data-v]").forEach(b=>b.setAttribute("aria-pressed",String(Array.isArray(v)?v.includes(b.dataset.v):String(v)===b.dataset.v)))});
  document.querySelectorAll("#coachForm .cf-pick").forEach(box=>{const k=box.dataset.cfx,a=cfDraft[k]||[];
    box.querySelector(".cf-sel").innerHTML=a.map(n=>`<span class="pill on cf-chip"><span class="notr">${esc(n)}</span><button type="button" class="x" data-cfrm="${esc(n)}" aria-label="${L("Retirer")}">×</button></span>`).join("");cfSearch(box)})}
// v42 : recherche d'exercices (sans accents, un morceau de mot suffit) pour « je veux absolument » / « je ne veux pas du tout »
const cfFold=x=>String(x||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
function cfSearch(box){const q=cfFold(box.querySelector("input").value).trim(),k=box.dataset.cfx,a=cfDraft[k]||[],res=box.querySelector(".cf-res");
  if(!q){res.innerHTML="";return}const w=q.split(/\s+/);
  const hits=EXDB.filter(e=>!a.includes(e.n)&&w.every(x=>cfFold(e.n+" "+MUS[e.m]+" "+e.part).includes(x))).slice(0,8);
  res.innerHTML=hits.length?hits.map(e=>`<button type="button" class="cf-hit" data-cfadd="${esc(e.n)}"><span class="notr">${esc(e.n)}</span><small>${esc(L(e.grp))}${e.p?` · ${L("prioritaire")}`:""}</small></button>`).join(""):`<div class="small muted">${L("Aucun exercice trouvé")}</div>`}
$("coachForm").addEventListener("input",e=>{const box=e.target.closest(".cf-pick");if(box)cfSearch(box);
  if(e.target.id==="cfNotes"||e.target.id==="cfAvoidTxt"){cfDraft[e.target.id==="cfNotes"?"notes":"avoidTxt"]=e.target.value.slice(0,600);const n=cfOptN();$("cfMoreSum").textContent=n?`${n} ${L(n>1?"précisions":"précision")}`:L("facultatif")}});
$("coachForm").addEventListener("keydown",e=>{if(e.key==="Enter"&&e.target.closest(".cf-pick")){e.preventDefault();const f=e.target.closest(".cf-pick").querySelector("[data-cfadd]");if(f)f.click()}});
$("coachForm").addEventListener("click",e=>{const ad=e.target.closest("[data-cfadd]"),rm=e.target.closest("[data-cfrm]");
  if(ad){const box=ad.closest(".cf-pick"),k=box.dataset.cfx,o=k==="must"?"never":"must",n=ad.dataset.cfadd;cfDraft[k]=[...new Set([...(cfDraft[k]||[]),n])];cfDraft[o]=(cfDraft[o]||[]).filter(x=>x!==n);box.querySelector("input").value="";cfRender();return}
  if(rm){const k=rm.closest(".cf-pick").dataset.cfx;cfDraft[k]=(cfDraft[k]||[]).filter(x=>x!==rm.dataset.cfrm);cfRender();return}
  const b=e.target.closest("[data-cf] [data-v]");if(!b)return;const g=b.closest("[data-cf]"),k=g.dataset.cf,v=b.dataset.v;
  if(g.classList.contains("cf-multi")){const a=cfDraft[k]||(cfDraft[k]=[]);cfDraft[k]=a.includes(v)?a.filter(x=>x!==v):[...a,v]}else cfDraft[k]=/^\d+$/.test(v)?+v:v;cfRender()});
$("coachForm").addEventListener("submit",async e=>{e.preventDefault();const p=cfDraft,withAi=!(e.submitter&&e.submitter.dataset.cfgo==="app");
  if(!p.level||!p.goal||!p.days||!p.dur||!p.equip){$("coachErr").textContent=L("Réponds aux cinq premières questions.");$("coachErr").hidden=false;return}
  p.notes=String(p.notes||"").trim();p.avoidTxt=String(p.avoidTxt||"").trim();
  const old=PL();p.remarks=(old&&old.profile&&old.profile.remarks)||[];if(p.notes&&!p.remarks.some(r=>r.text===p.notes))p.remarks=[...p.remarks,{at:new Date().toISOString(),text:p.notes}].slice(-10);
  // v43 : le programme de l'app est toujours créé (il sert de base, et de secours si Claude ne répond pas)
  planApply(coachBuild(p));
  if(withAi){if(!(await nuConsent())){save();$("coachSheet").hidden=true;renderMuscu();toast("Ton programme est prêt (sans Claude)");return}
    M().plan.aiWait=Date.now();save();$("coachSheet").hidden=true;renderMuscu();aiHandoff(coachPrompt("new"),"muscu")}
  else{save();$("coachSheet").hidden=true;renderMuscu();toast("Ton programme est prêt")}});
// v43 : demandes envoyées au Claude de la personne (même principe que Nutrition) : il lit le profil et les remarques
// avec muscu_programme, puis enregistre le programme avec enregistrer_programme ; le résultat revient ici tout seul.
const GOALS={muscle:["prendre du muscle","build muscle","spiermassa opbouwen"],force:["gagner en force","get stronger","sterker worden"],gras:["perdre du gras","lose fat","vet verliezen"],forme:["être en forme","get fit","fit worden"],endu:["gagner en endurance","build endurance","uithoudingsvermogen opbouwen"]};
function coachPrompt(kind,remark){const p=(PL()&&PL().profile)||cfDraft||{},li=LANG==="en"?1:LANG==="nl"?2:0,g=(GOALS[p.goal]||GOALS.muscle)[li];
  const AV={shoulder:["épaules","shoulders","schouders"],back:["bas du dos","lower back","onderrug"],knee:["genoux","knees","knieën"]};
  const av=[...(p.avoid||[]).map(x=>(AV[x]||[x,x,x])[li]),p.avoidTxt].filter(Boolean).join(", ");
  const extra=[p.notes&&T3(`Mes remarques : ${p.notes}`,`My wishes: ${p.notes}`,`Mijn wensen: ${p.notes}`),av&&T3(`À ménager : ${av}`,`Go easy on: ${av}`,`Ontzien: ${av}`),(p.must||[]).length&&T3(`Exercices voulus : ${p.must.join(", ")}`,`Exercises I want: ${p.must.join(", ")}`,`Oefeningen die ik wil: ${p.must.join(", ")}`),(p.never||[]).length&&T3(`Exercices exclus : ${p.never.join(", ")}`,`Exercises to avoid: ${p.never.join(", ")}`,`Oefeningen om te vermijden: ${p.never.join(", ")}`)].filter(Boolean).join(". ");
  // v44 : seulement les exercices de exercices.js, les prioritaires (P) en premier dans leur groupe (noms gardés en français : ce sont ceux de l'app)
  const only=T3(`Utilise uniquement ces exercices, avec leur nom exact ; ceux marqués (P) sont à privilégier en premier dans leur groupe musculaire : ${exListTxt()}. N'ajoute aucun autre exercice, sauf un exercice que je demande moi-même.`,
    `Use only these exercises, with their exact names; those marked (P) come first in their muscle group: ${exListTxt()}. Do not add any other exercise, unless I ask for it myself.`,
    `Gebruik alleen deze oefeningen, met hun exacte naam; die met (P) krijgen voorrang in hun spiergroep: ${exListTxt()}. Voeg geen andere oefening toe, tenzij ik er zelf om vraag.`);
  if(kind==="improve")return T3("Avec Sid'note : lis mon programme de musculation et mon historique (muscu_programme), puis améliore-le pour moi (choix des exercices, volume, progression). Enregistre la nouvelle version avec enregistrer_programme.","With Sid'note: read my workout program and history (muscu_programme), then improve it for me (exercise choice, volume, progression). Save the new version with enregistrer_programme.","Met Sid'note: lees mijn trainingsschema en geschiedenis (muscu_programme) en verbeter het (oefeningen, volume, progressie). Sla de nieuwe versie op met enregistrer_programme.")+" "+only;
  if(kind==="adjust")return T3(`Avec Sid'note : lis mon programme de musculation (muscu_programme) et ajuste-le selon ma remarque, sans tout recommencer : « ${remark} ». Garde ce qui va bien, puis enregistre la nouvelle version avec enregistrer_programme.`,
    `With Sid'note: read my workout program (muscu_programme) and adjust it to my remark without starting over: "${remark}". Keep what works, then save the new version with enregistrer_programme.`,
    `Met Sid'note: lees mijn trainingsschema (muscu_programme) en pas het aan volgens mijn opmerking, zonder opnieuw te beginnen: "${remark}". Houd wat goed is en sla de nieuwe versie op met enregistrer_programme.`)+" "+only;
  return T3(`Avec Sid'note : compose mon programme de musculation. Objectif ${g}, ${p.days} séances par semaine de ${p.dur} min. Lis d'abord mon profil complet avec muscu_programme.${extra?" "+extra+".":""} Enregistre-le ensuite avec enregistrer_programme.`,
    `With Sid'note: build my workout program. Goal: ${g}, ${p.days} sessions a week of ${p.dur} min. First read my full profile with muscu_programme.${extra?" "+extra+".":""} Then save it with enregistrer_programme.`,
    `Met Sid'note: stel mijn trainingsschema samen. Doel: ${g}, ${p.days} trainingen per week van ${p.dur} min. Lees eerst mijn volledige profiel met muscu_programme.${extra?" "+extra+".":""} Sla het daarna op met enregistrer_programme.`)+" "+only}
async function coachAdjust(text){text=String(text||"").trim();if(!text){toast("Écris d'abord ta remarque");return}const pl=PL();if(!pl)return;
  if(!(await nuConsent()))return;
  const pr=pl.profile||(pl.profile={});pr.remarks=[...(pr.remarks||[]),{at:new Date().toISOString(),text:text.slice(0,600)}].slice(-10);pl.aiWait=Date.now();pl.upd=Date.now();M().upd=Date.now();save();renderMuscu();
  aiHandoff(coachPrompt("adjust",text.slice(0,600)),"muscu")}
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

/* ---------- musique (Spotify) ---------- */
const SPOT_DEFAULT="playlist/37i9dQZF1DWZeKCadgRdKQ"; // Deep Focus
let spotShown=null;
function parseSpot(v){
  v=String(v||"").trim();
  let m=v.match(/open\.spotify\.com\/(?:intl-[a-z-]+\/)?(?:embed\/)?(playlist|album|track|artist|show|episode)\/([A-Za-z0-9]+)/);
  if(!m)m=v.match(/^spotify:(playlist|album|track|artist|show|episode):([A-Za-z0-9]+)$/);
  return m?`${m[1]}/${m[2]}`:null;
}
// v43 (RGPD / cookies) : le lecteur Spotify est un contenu tiers (Spotify reçoit l'adresse IP et peut déposer ses cookies).
// Il n'est chargé qu'après un accord donné sur cet appareil (data.ui.spotOk), retirable à tout moment.
function renderSpotify(){
  const ref=(data.prefs&&data.prefs.spotify)||SPOT_DEFAULT;
  $("spotOpen").href=`https://open.spotify.com/${ref}`;$("spotName").textContent=ref===SPOT_DEFAULT?"Playlist par défaut : Deep Focus":"Ta musique";
  if(!data.ui.spotOk){spotShown=null;$("spotEmbed").innerHTML=`<div class="spot-gate"><p class="small">${L("Le lecteur est fourni par Spotify. En le chargeant, Spotify reçoit ton adresse IP et peut déposer ses propres cookies sur cet appareil.")} <button type="button" class="linkbtn" data-openlegal="cookies">${L("En savoir plus")}</button></p><button type="button" class="btn" data-spotok="1">${L("Charger le lecteur Spotify")}</button></div>`;return}
  if(spotShown===ref)return;spotShown=ref;
  $("spotEmbed").innerHTML=`<div class="small spot-off"><button type="button" class="linkbtn" data-spotno="1">${L("Ne plus charger Spotify sur cet appareil")}</button></div><iframe title="Lecteur Spotify" src="https://open.spotify.com/embed/${ref}?utm_source=generator" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`;
}
$("spotEmbed").addEventListener("click",e=>{if(e.target.closest("[data-spotok]")){data.ui.spotOk=Date.now();saveUI();renderSpotify()}
  else if(e.target.closest("[data-spotno]")){delete data.ui.spotOk;saveUI();renderSpotify();toast("Spotify n'est plus chargé")}});
$("spotForm").addEventListener("submit",e=>{
  e.preventDefault();const v=$("spotIn").value.trim();
  if(!v){data.prefs.spotify=null;save();spotShown=null;renderSpotify();toast("Playlist par défaut");return}
  const ref=parseSpot(v);
  if(!ref){toast("Ce lien Spotify n'est pas reconnu. Copie le lien depuis Spotify > Partager.");return}
  data.prefs.spotify=ref;save();$("spotIn").value="";renderSpotify();toast("Musique mise à jour");
});

/* ---------- documents (PDF) ---------- */
const PDFJS="lib/pdfjs/"; // v43 : pdf.js 3.11.174 hébergé sur le site (vérifié avec les empreintes officielles de cdnjs), plus d'appel à un tiers
const DOC_MAX=50*1024*1024;
const docsArr=()=>data.docs||(data.docs=[]);
let docQ="",docStoreMsg="",docBusy=new Set();
// petit coffre local (IndexedDB) : les PDF restent lisibles hors connexion
const idb={db:null,
  open(){return this.db||(this.db=new Promise((res,rej)=>{const r=indexedDB.open("sidnote-docs",1);r.onupgradeneeded=()=>r.result.createObjectStore("files");r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}))},
  async run(mode,fn){const db=await this.open();return new Promise((res,rej)=>{const tx=db.transaction("files",mode),st=tx.objectStore("files"),q=fn(st);tx.oncomplete=()=>res(q&&q.result);tx.onerror=()=>rej(tx.error)})},
  get(k){return this.run("readonly",s=>s.get(k)).catch(()=>null)},
  put(k,v){return this.run("readwrite",s=>s.put(v,k))},
  del(k){return this.run("readwrite",s=>s.delete(k)).catch(()=>{})}};
async function idbClearUser(u){try{const db=await idb.open();const tx=db.transaction("files","readwrite"),st=tx.objectStore("files");
  st.openCursor().onsuccess=e=>{const c=e.target.result;if(!c)return;if(String(c.key).startsWith(u+":"))c.delete();c.continue()}}catch(e){}}
const docKey=d=>session.user.id+":"+d.id;
const docPath=d=>`${session.user.id}/${d.id}.pdf`;
async function stor(method,path,body,type){
  const r=await fetch(SUPABASE_URL+"/storage/v1/object/"+path,{method,body,
    headers:{apikey:SUPABASE_KEY,Authorization:"Bearer "+await token(),...(body?{"Content-Type":type||"application/pdf","x-upsert":"true"}:{})}});
  if(!r.ok){let m="";try{const j=await r.json();m=j.message||j.error||""}catch(e){}const er=new Error(m||"Erreur "+r.status);er.status=r.status;throw er}
  return r;
}
function storErr(ex){
  if(ex&&ex.trial)return "Mode essai : tes documents restent sur cet appareil.";
  if(ex instanceof TypeError)return "Pas de connexion : le document sera envoyé plus tard.";
  if(/bucket/i.test(ex.message)||ex.status===404)return "Le stockage en ligne n'est pas encore activé : tes documents restent sur cet appareil.";
  if(ex.status===413||/size|large/i.test(ex.message))return "Document trop lourd pour le stockage en ligne.";
  if(ex.status===401||ex.status===403)return "Accès au stockage refusé : vérifie la configuration Supabase.";
  return "Envoi impossible : "+ex.message;
}
// v22 : les documents sont chiffrés sur l'appareil avec la clé du code des documents avant l'envoi.
// En ligne, il n'y a que du contenu illisible (« SNE1 » + iv + chiffré) : ni l'administrateur ni Supabase ne peuvent les ouvrir.
const ENC_MAGIC=[83,78,69,49]; // "SNE1"
const isEnc=u=>u.length>16&&ENC_MAGIC.every((c,i)=>u[i]===c);
async function docEncrypt(blob,key){const iv=crypto.getRandomValues(new Uint8Array(12));
  const ct=await crypto.subtle.encrypt({name:"AES-GCM",iv},key||dvKey,await blob.arrayBuffer());
  return new Blob([new Uint8Array(ENC_MAGIC),iv,new Uint8Array(ct)],{type:"application/pdf"})}
async function docDecrypt(u,key){key=key||dvKey;if(!key)throw new Error(L("Déverrouille tes documents pour ouvrir ce fichier."));
  try{return new Blob([await crypto.subtle.decrypt({name:"AES-GCM",iv:u.slice(4,16)},key,u.slice(16))],{type:"application/pdf"})}
  catch(e){throw new Error(L("Ce document a été protégé avec un ancien code : ouvre-le sur l'appareil où tu l'as ajouté."))}}
// v32 : avec le coffre renforcé, la copie gardée sur l'appareil (IndexedDB) est chiffrée elle aussi
const sealOn=()=>isV2(data.docVault)&&!!dvKey;
const blobIsEnc=async b=>!!b&&b.size>16&&isEnc(new Uint8Array(await b.slice(0,17).arrayBuffer()));
async function docUpload(d){
  if(d.up||docBusy.has(d.id)||!dvKey)return; // sans la clé (documents verrouillés), l'envoi attend le prochain déverrouillage
  if(!(await idb.get(docKey(d))))return;
  docBusy.add(d.id);renderDocs();
  try{const b=await docBlob(d);await stor("POST","documents/"+docPath(d),await docEncrypt(b));d.up=true;d.enc=data.docVault&&data.docVault.id;d.path=docPath(d);docStoreMsg="";save()}
  catch(ex){docStoreMsg=storErr(ex)}
  docBusy.delete(d.id);renderDocs();
}
function docsSyncPending(){if(!session)return;docsArr().filter(d=>!d.up).forEach(d=>docUpload(d))}
// documents envoyés avant le chiffrement (ou avec un ancien code) : rechiffrés au déverrouillage
let docsSecuring=false;
async function docsSecure(){if(!session||!dvKey||docsSecuring)return;docsSecuring=true;const vid=data.docVault&&data.docVault.id;
  try{for(const d of docsArr().filter(x=>x.up&&x.enc!==vid)){if(!dvKey)break;
    try{const b=await docBlob(d);await stor("POST","documents/"+(d.path||docPath(d)),await docEncrypt(b));d.enc=vid;save()}catch(e){}}
    // copies de l'appareil encore lisibles en clair : chiffrées (coffre renforcé seulement)
    for(const d of docsArr()){if(!sealOn())break;const b=await idb.get(docKey(d));
      try{if(b&&!(await blobIsEnc(b)))await idb.put(docKey(d),await docEncrypt(b))}catch(e){}}}
  finally{docsSecuring=false}}
// contenu lisible d'un document (copie de l'appareil, sinon version en ligne) ; key : autre clé que celle du coffre ouvert (passage au coffre renforcé)
async function docBlob(d,key){
  let b=await idb.get(docKey(d));
  if(b){if(!(await blobIsEnc(b)))return b;try{return await docDecrypt(new Uint8Array(await b.arrayBuffer()),key)}catch(e){if(!d.up)throw e}}
  if(!d.up)throw new Error("Ce document n'a pas encore été envoyé en ligne : ouvre-le sur l'appareil où tu l'as ajouté.");
  const r=await stor("GET","authenticated/documents/"+(d.path||docPath(d))),u=new Uint8Array(await r.arrayBuffer());
  const plain=isEnc(u)?await docDecrypt(u,key):new Blob([u],{type:"application/pdf"});
  if(!key){const same=isEnc(u)&&isV2(data.docVault)&&d.enc===data.docVault.id; // déjà chiffré avec la clé du coffre : gardé tel quel
    (async()=>idb.put(docKey(d),same?new Blob([u],{type:"application/pdf"}):sealOn()?await docEncrypt(plain):plain))().catch(()=>{})}
  return plain;
}
const countPages=bytes=>{try{const t=new TextDecoder("latin1").decode(bytes);const m=t.match(/\/Type\s*\/Page(?![a-zA-Z])/g);return m?m.length:0}catch(e){return 0}};
async function addDoc(blob,title,pages){
  if(blob.size>DOC_MAX){toast("Document trop lourd (50 Mo maximum)");return null}
  const d={id:uid(),title:(title||"Document").slice(0,120),size:blob.size,pages:pages||countPages(new Uint8Array(await blob.arrayBuffer())),createdAt:new Date().toISOString(),up:false};
  try{await idb.put(docKey(d),sealOn()?await docEncrypt(blob):blob)}catch(e){toast("Espace insuffisant sur cet appareil");return null}
  const cf=curFolder();if(cf)d.folder=cf.id; // importé ou scanné dans le classeur ouvert
  docsArr().push(d);save();renderDocs();docUpload(d);return d;
}
async function docDelete(d){
  // le fichier (appareil + en ligne) n'est effacé qu'une fois l'annulation impossible
  undoable("Document supprimé",[d.id],()=>{tomb(d.id);data.docs=docsArr().filter(x=>x.id!==d.id)},{after:renderDocs,
    later:()=>{if(docsArr().some(x=>x.id===d.id))return;idb.del(docKey(d));if(d.up)stor("DELETE","documents/"+(d.path||docPath(d))).catch(()=>{})}});
}
async function docShare(d){
  try{const b=await docBlob(d);const name=(d.title.replace(/[\\/:*?"<>|]+/g," ").trim()||"document")+".pdf";
    const f=new File([b],name,{type:"application/pdf"});
    try{if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:d.title});return}}catch(e){if(e.name==="AbortError")return}
    const a=document.createElement("a");a.href=URL.createObjectURL(f);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),5000);
  }catch(ex){toast(ex instanceof TypeError?"Pas de connexion internet":ex.message)}
}
// recherche tolérante : sans accents, un seul mot suffit, fautes de frappe acceptées
const fold=s=>String(s||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase();
const words=s=>fold(s).split(/[^a-z0-9]+/).filter(Boolean);
function lev(a,b){if(Math.abs(a.length-b.length)>2)return 9;let p=Array.from({length:b.length+1},(_,i)=>i);
  for(let i=1;i<=a.length;i++){const c=[i];for(let j=1;j<=b.length;j++)c[j]=Math.min(p[j]+1,c[j-1]+1,p[j-1]+(a[i-1]===b[j-1]?0:1));p=c}return p[b.length]}
function tokScore(t,ws){let best=0;
  for(const w of ws){let s=0;
    if(w===t)s=3;else if(w.startsWith(t))s=2.5;else if(t.length>=3&&w.includes(t))s=2;
    else if(t.length>=4){const al=t.length>=7?2:1,d=Math.min(lev(t,w),lev(t,w.slice(0,t.length)));if(d<=al)s=1.5-d*.3}
    best=Math.max(best,s)}
  return best}
function fuzzyScore(title,q){
  const ts=words(q);if(!ts.length)return 1;const ws=words(title);
  const sc=ts.map(t=>tokScore(t,ws)),hit=sc.filter(x=>x>0).length;if(!hit)return 0;
  return sc.reduce((a,b)=>a+b,0)+(hit===ts.length?10:0)+(fold(title).includes(fold(q).trim())?5:0);
}
const fmtSize=n=>LANG!=="fr"?(n<1048576?Math.max(1,Math.round(n/1024))+" KB":(n/1048576).toFixed(1)+" MB"):(n<1048576?Math.max(1,Math.round(n/1024))+" Ko":(n/1048576).toFixed(1).replace(".",",")+" Mo");
const fmtDay=s=>{const d=new Date(s);return `${d.getDate()} ${MO[d.getMonth()]} ${d.getFullYear()}`};
// classeurs : data.docFolders = [{id, name, locked}] ; doc.folder = id du classeur
// la recherche du haut cherche partout ; celle du classeur ouvert, seulement dedans
// un classeur « protégé » demande le code des documents (data.docVault) ; le fichier lui-même reste privé dans ton compte
const DF=()=>data.docFolders||(data.docFolders=[]);
let dfQ="",dfEditing=false,dvOpen=false;
const folderOf=d=>d.folder&&DF().find(f=>f.id===d.folder);
const curFolder=()=>DF().find(x=>x.id===data.ui.docFolder)||null;
const docHidden=()=>false; // v22 : tout l'onglet est protégé par le code, plus de classeur verrouillé à part
function renderDocs(){
  if(!$("docList"))return;
  if(dvOpen&&(!data.docVault||data.docVault.id!==dvVid))dvLock(); // coffre remplacé ailleurs : on reverrouille
  renderDocLock();
  const all=docsArr(),q=docQ.trim(),cf=curFolder(),fq=dfQ.trim();
  const alpha=data.prefs.docSort==="alpha";
  // classeurs
  const cnt=id=>all.filter(d=>d.folder===id).length;
  $("docFolders").innerHTML=`<button class="pill" data-dfold="all" aria-pressed="${!cf}">${L("Tous")}</button>`+
    DF().map(f=>`<button class="pill" data-dfold="${f.id}" aria-pressed="${cf&&cf.id===f.id}">${IC("folder")} ${esc(f.name)} <span class="cnt">${cnt(f.id)||""}</span></button>`).join("")+
    `<button class="pill add" data-dfoldnew="1">+ ${L("Classeur")}</button>`;
  $("folderBar").hidden=!cf;
  if(cf)$("folderBar").innerHTML=dfEditing?`<form id="folderRename" style="display:flex;gap:8px;width:100%"><input id="folderRenIn" value="${esc(cf.name)}" aria-label="${L("Nouveau nom")}" autocomplete="off"><button class="btn" type="submit">OK</button></form>`
    :`<div class="grow"><b class="notr">${IC("folder")} ${esc(cf.name)}</b><div class="small muted">${cnt(cf.id)} ${L(cnt(cf.id)>1?"documents":"document")}</div></div>
      <button class="mini" data-dfren="1">${L("Renommer")}</button><button class="x" data-dfdel="1" aria-label="${L("Supprimer le classeur")}">×</button>
      <input type="search" class="search" id="folderSearch" style="margin:8px 0 0;width:100%" placeholder="${L("Rechercher dans ce classeur")}" aria-label="${L("Rechercher dans ce classeur")}" value="${esc(dfQ)}" autocomplete="off">`;
  // liste : recherche globale (partout) > classeur ouvert (avec sa recherche) > tous
  let list,scope;
  if(q){list=all.filter(d=>!docHidden(d));scope="all"}
  else if(cf){list=all.filter(d=>d.folder===cf.id);scope="folder"}
  else{list=all.filter(d=>!docHidden(d));scope="all"}
  list=list.slice().sort(alpha?(a,b)=>a.title.localeCompare(b.title,LANG,{sensitivity:"base",numeric:true}):(a,b)=>(b.createdAt||"").localeCompare(a.createdAt||""));
  document.querySelectorAll("#docSort button").forEach(b=>b.setAttribute("aria-pressed",(b.dataset.dsort==="alpha")===alpha));
  const sq=q||(scope==="folder"?fq:"");
  if(sq)list=list.map(d=>({d,s:fuzzyScore(d.title,sq)})).filter(x=>x.s>0).sort((a,b)=>b.s-a.s).map(x=>x.d);
  const SHARE=`<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 15V3M7.5 7.5L12 3l4.5 4.5M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg>`;
  $("docList").innerHTML=list.length?list.map(d=>{
    const st=docBusy.has(d.id)?L("Envoi…"):d.up?"":L("Sur cet appareil seulement"),f=folderOf(d);
    return `<div class="doc" data-doc="${d.id}">${DF().length?`<button class="grip" data-dgrip="${d.id}" aria-label="${L("Glisser vers un classeur")}" title="${L("Glisser vers un classeur")}">${GRIP}</button>`:""}<button class="doc-ic" data-docopen="${d.id}" aria-label="Ouvrir">PDF</button>
      <button class="doc-open" data-docopen="${d.id}"><b>${esc(d.title)}</b><span class="small muted">${f&&scope==="all"?`${IC("folder")} <span class="notr">${esc(f.name)}</span> · `:""}${d.pages?`${d.pages} ${L(d.pages>1?"pages":"page")} · `:""}${fmtSize(d.size||0)} · ${fmtDay(d.createdAt)}${st?` · <span style="color:var(--warn)">${st}</span>`:""}</span></button>
      <button class="pen" data-docshare="${d.id}" aria-label="Partager ou enregistrer">${SHARE}</button>
      <button class="pen" data-edit="doc:${d.id}" aria-label="Modifier">${PEN}</button></div>`}).join("")
    :`<div class="empty">${sq?L("Aucun document ne correspond."):scope==="folder"?L("Ce classeur est vide. Importe ou scanne un document : il sera rangé ici."):L("Aucun document pour l'instant. Importe un PDF ou scanne une feuille.")}</div>`;
  const tot=all.reduce((a,d)=>a+(d.size||0),0);
  $("docInfo").textContent=docStoreMsg||(all.length?`${all.length} ${L(all.length>1?"documents":"document")} · ${fmtSize(tot)}`:"");
  $("docInfo").style.color=docStoreMsg?"var(--warn)":"";
}
// code des documents : vérifié comme les autres codes (PBKDF2 + petit texte chiffré), récupérable avec le mot de passe du compte
let dvKey=null; // clé des documents, en mémoire seulement tant que l'onglet est déverrouillé
let dvVid=null; // coffre auquel appartient dvKey (s'il est remplacé sur un autre appareil, on reverrouille)
async function dvTry(code){try{const v=data.docVault,key=await vOpen(v,code,"main");dvKey=key;dvVid=v.id;dvOpen=true;return true}catch(e){return false}}
// v27 : un seul code pour les documents et les mots de passe (celui du coffre des mots de passe).
// Chaque coffre garde son propre sel et sa propre clé ; seul le code est commun (docVault.uni = true).
async function vaultCheck(code){try{return await vOpen(data.vault,code,"main")}catch(e){return null}}
async function newDocVault(code){const salt=b64e(crypto.getRandomValues(new Uint8Array(16))),key=await pinKey(code,salt,PIN_ITER);
  return{v:{id:uid(),salt,iter:PIN_ITER,chk:await encJ(key,{ok:"sidnote-docs"}),createdAt:new Date().toISOString(),uni:true,...(data.vault&&data.vault.rec?{rec:data.vault.rec}:{})},key}}
async function newPwVault(code){const salt=b64e(crypto.getRandomValues(new Uint8Array(16))),key=await pinKey(code,salt,PIN_ITER);
  return{id:uid(),salt,iter:PIN_ITER,chk:await encJ(key,{ok:"sidnote"}),createdAt:new Date().toISOString(),...(data.docVault&&data.docVault.rec?{rec:data.docVault.rec}:{})}}
const DV_FORGOT2="Sans ta phrase secrète, tes documents ne peuvent plus être ouverts. Tout effacer et choisir un nouveau code ? Touche encore pour confirmer.";
const DV_FORGOT="La récupération n'était pas activée. Choisir un nouveau code ? Seuls les documents déjà sur cet appareil pourront encore s'ouvrir. Touche encore pour confirmer.";
async function dvUnlock(){
  if(dvOpen)return true;
  const hasV=vaultOn(),hasD=!!(data.docVault&&data.docVault.chk);
  // aucun code encore : on choisit le code unique (documents + mots de passe), puis la phrase secrète (v32)
  if(!hasD&&!hasV){const code=await askPin({mode:"new",head:"Ton code Sid'compagnon",sub:"Choisis ton code à 5 chiffres : il ouvre tes documents et tes mots de passe sur cet appareil."});if(!code)return false;
    const mk=await mkNeed();if(!mk)return false;
    const d=await v2Make(mk,"sidnote-docs",{uni:true}),w=await v2Make(mk,"sidnote",{uni:true});
    data.docVault=d.v;data.vault=w.v;dvKey=d.key;dvVid=d.v.id;dvOpen=true;await mkWrap("main",code,mk);save();toast("Code enregistré");return true}
  // coffre renforcé, première ouverture sur cet appareil : phrase secrète puis code de l'appareil
  const ref=hasD?data.docVault:data.vault;
  if(isV2(ref)&&!mkHas("main")){const code=await devSetup("main","Documents");if(!code)return false;
    if(hasD)return await dvTry(code);
    const k=await vaultCheck(code);if(!k)return false;const d=await v2Make(phMem,"sidnote-docs",{uni:true});data.docVault=d.v;dvKey=d.key;dvVid=d.v.id;dvOpen=true;save();return true}
  // coffre des mots de passe déjà là : les documents prennent le même code
  if(!hasD){let code=await askPin({mode:"unlock",ctx:"main",head:"Documents",sub:"Entre ton code (le même que pour tes mots de passe).",verify:async c=>!!(await vaultCheck(c)),rec:isV2(data.vault)?null:data.vault.rec,phrase:isV2(data.vault)});
    if(code==="forgot")code=await devSetup("main","Documents",true);if(!code)return false;
    let d;if(isV2(data.vault)){d=await v2Make(phMem,"sidnote-docs",{uni:true})}
    else{const mk=await mkNeed({mode:"new",title:"Renforce ta protection",later:"Plus tard"});
      d=mk?await v2Make(mk,"sidnote-docs",{uni:true}):await newDocVault(code);if(mk&&!mkHas("main"))await mkWrap("main",code,mk)}
    data.docVault=d.v;dvKey=d.key;dvVid=d.v.id;dvOpen=true;save();return true}
  const v=data.docVault;
  if(v.uni||!hasV||isV2(v)){
    let code=await askPin({mode:"unlock",ctx:"main",head:"Documents",sub:hasV?"Entre ton code (le même que pour tes mots de passe).":"Entre ton code.",verify:dvTry,rec:isV2(v)?null:v.rec,phrase:isV2(v),forgot:dvReset,forgotText:isV2(v)?DV_FORGOT2:DV_FORGOT});
    if(code==="forgot"){code=await devSetup("main","Documents",true);if(code&&!(await dvTry(code)))code=null}
    if(code&&dvOpen&&!isV2(v)){ // ancien coffre : passage au coffre renforcé (plus besoin de proposer l'ancienne récupération du code)
      const nk=await v2Upgrade("docs",code,dvKey);if(nk){dvKey=nk;dvVid=data.docVault.id}
      if(!hasV){data.vault=isV2(data.docVault)&&phMem?(await v2Make(phMem,"sidnote",{uni:true})).v:await newPwVault(code);data.docVault.uni=true;save()}}
    return !!code&&dvOpen}
  return dvMigrate();
}
// passage à un seul code (une fois) : ancien code des documents, puis code des mots de passe ; les documents sont rechiffrés
async function dvMigrate(){
  const old=data.docVault;
  const c1=await askPin({mode:"unlock",head:"Un seul code",sub:"Désormais, un seul code protège tes documents et tes mots de passe. Entre d'abord l'ancien code de tes documents.",verify:dvTry,rec:old.rec,forgot:dvReset,forgotText:DV_FORGOT});
  if(!c1||!dvOpen)return false;
  if(await vaultCheck(c1)){old.uni=true;save();toast("Tes deux codes étaient déjà identiques : c'est réglé");return true}
  const c2=await askPin({mode:"unlock",head:"Un seul code",sub:"Entre maintenant le code de tes mots de passe : il ouvrira aussi tes documents.",verify:async c=>!!(await vaultCheck(c)),rec:data.vault.rec});
  if(!c2)return true; // documents ouverts avec l'ancien code cette fois-ci ; le passage sera reproposé
  if(!navigator.onLine){toast("Connecte-toi à internet pour passer à un seul code");return true}
  toast("Passage à un seul code…");
  // 1) une copie lisible de chaque document en ligne, gardée sur cet appareil (déchiffrée avec l'ancienne clé)
  for(const d of docsArr().filter(x=>x.up)){if(await idb.get(docKey(d)))continue;
    try{await idb.put(docKey(d),await docBlob(d))}catch(e){toast("Passage impossible pour l'instant (réseau). Réessaie plus tard.");return true}}
  // 2) nouveau coffre des documents avec le code des mots de passe, puis tout est rechiffré et renvoyé
  const n=await newDocVault(c2);data.docVault=n.v;dvKey=n.key;dvVid=n.v.id;save();
  await docsSecure();toast("C'est fait : un seul code pour tes documents et tes mots de passe");return true;
}
// l'onglet Documents s'ouvre avec le code, comme Mots de passe
function renderDocLock(){const lk=!dvOpen;$("v-docs").classList.toggle("is-locked",lk);$("docLocked").hidden=!lk||!!(ps&&ps.host)}
async function docsEnter(){renderDocLock();if(dvOpen){renderDocs();return}if(await dvUnlock()){renderDocLock();renderDocs();docsSyncPending();docsSecure()}}
$("docUnlockBtn").addEventListener("click",docsEnter);
// glisser un document (poignée ⠿) sur un classeur pour l'y ranger ; sur « Tous » pour le sortir de son classeur
$("docList").addEventListener("pointerdown",e=>{const g=e.target.closest("[data-dgrip]");if(!g)return;e.preventDefault();
  const d=docsArr().find(x=>x.id===g.dataset.dgrip),row=g.closest(".doc");if(!d)return;
  const ghost=document.createElement("div");ghost.className="doc-ghost";ghost.textContent=d.title;document.body.appendChild(ghost);row.classList.add("dragging");
  try{g.setPointerCapture(e.pointerId)}catch(x){}if(navigator.vibrate)navigator.vibrate(10);
  let over=null;const pos=ev=>{ghost.style.left=(ev.clientX+12)+"px";ghost.style.top=(ev.clientY-20)+"px";
    const el=document.elementFromPoint(ev.clientX,ev.clientY),c=el&&el.closest("#docFolders [data-dfold]");
    if(c!==over){if(over)over.classList.remove("drop");over=c;if(over)over.classList.add("drop")}
    if(ev.clientY<90)window.scrollBy(0,-12)};pos(e);
  const up=()=>{g.removeEventListener("pointermove",pos);g.removeEventListener("pointerup",up);g.removeEventListener("pointercancel",up);ghost.remove();row.classList.remove("dragging");
    if(over){const id=over.dataset.dfold,f=DF().find(x=>x.id===id);over.classList.remove("drop");
      if(id==="all"){if(d.folder){delete d.folder;d.mod=Date.now();save();toast("Document sorti de son classeur")}}
      else if(f&&d.folder!==f.id){d.folder=f.id;d.mod=Date.now();save();toast(`${L("Rangé dans")} « ${f.name} »`)}}
    renderDocs()};
  g.addEventListener("pointermove",pos);g.addEventListener("pointerup",up);g.addEventListener("pointercancel",up)});
// code oublié sans récupération : on choisit un nouveau code, les documents sont gardés
// les documents présents sur cet appareil sont renvoyés, chiffrés avec le nouveau code
async function dvReset(){data.docVault=null;dvOpen=false;dvKey=null;
  for(const d of docsArr())if(d.up&&await idb.get(docKey(d)))d.up=false;
  save();toast("Code effacé : choisis-en un nouveau. Les documents de cet appareil sont gardés.");docsEnter()}
function dvLock(){if(!dvOpen)return;dvOpen=false;dvKey=null;renderDocLock()}
// v37 : délai avant reverrouillage (data.ui.lockDelay en minutes, propre à l'appareil ; 0 = tout de suite)
const SEC_K=["docs","pwd","notes"],secAway={};
// v41 : par défaut (-1), le coffre reste ouvert jusqu'à la fermeture complète de l'app (demande de Sid)
const lockDelay=()=>{const v=data.ui&&data.ui.lockDelay;return v===undefined||v===null||+v<0?Infinity:Math.max(0,+v)*60000};
const secLockOne=k=>k==="docs"?dvLock():k==="pwd"?pwdLock():(nsKey&&nsLock());
function secLeave(k){const d=lockDelay();if(d===Infinity)return;if(!d){secLockOne(k);return}if(!secAway[k])secAway[k]=Date.now()}
function secCheck(){const d=lockDelay(),now=Date.now();for(const k of SEC_K){const t=secAway[k];if(t&&now-t>=d){delete secAway[k];secLockOne(k)}}}
document.addEventListener("visibilitychange",()=>{if(document.hidden)SEC_K.forEach(secLeave);else{secCheck();delete secAway[data.ui.view]}});
setInterval(secCheck,15000);
$("docFolders").addEventListener("click",async e=>{const b=e.target.closest("button");if(!b)return;
  if(b.dataset.dfoldnew){const f=$("folderForm");f.hidden=!f.hidden;if(!f.hidden)$("folderIn").focus();return}
  if(b.dataset.dfold){const id=b.dataset.dfold;
    data.ui.docFolder=id;dfQ="";dfEditing=false;docQ="";$("docSearch").value="";saveUI();renderDocs()}});
$("folderForm").addEventListener("submit",e=>{e.preventDefault();const v=$("folderIn").value.trim().replace(/\s+/g," ");if(!v)return;
  if(DF().some(f=>norm(f.name)===norm(v))){toast("Ce classeur existe déjà");return}
  const f={id:uid(),name:v};DF().push(f);data.ui.docFolder=f.id;saveUI();save();$("folderIn").value="";$("folderForm").hidden=true;renderDocs();toast("Classeur créé")});
$("folderBar").addEventListener("input",e=>{if(e.target.id==="folderSearch"){dfQ=e.target.value;const pos=e.target.selectionStart;renderDocs();const i=$("folderSearch");i.focus();i.setSelectionRange(pos,pos)}});
$("folderBar").addEventListener("submit",e=>{e.preventDefault();const f=curFolder(),v=$("folderRenIn").value.trim();if(f&&v){f.name=v;save()}dfEditing=false;renderDocs()});
$("folderBar").addEventListener("click",async e=>{const b=e.target.closest("button");if(!b)return;const f=curFolder();if(!f)return;
  if(b.dataset.dfren){dfEditing=true;renderDocs();const i=$("folderRenIn");i.focus();i.select()}
  else if(b.dataset.dfdel){if(!c2ok(b))return;const had=docsArr().filter(d=>d.folder===f.id).map(d=>d.id);
    undoable("Classeur supprimé, ses documents sont gardés",[f.id],()=>{tomb(f.id);docsArr().forEach(d=>{if(d.folder===f.id)delete d.folder});data.docFolders=DF().filter(x=>x!==f);data.ui.docFolder="all";saveUI()},
      {after:renderDocs,revert:()=>{docsArr().forEach(d=>{if(had.includes(d.id))d.folder=f.id});data.ui.docFolder=f.id;saveUI()}})}
});
$("docSearch").addEventListener("input",e=>{docQ=e.target.value;renderDocs()});
$("docSort").addEventListener("click",e=>{const b=e.target.closest("[data-dsort]");if(!b)return;data.prefs.docSort=b.dataset.dsort;save();renderDocs()});
$("docList").addEventListener("click",e=>{
  const o=e.target.closest("[data-docopen]"),sh=e.target.closest("[data-docshare]");
  const d=docsArr().find(x=>x.id===(o?o.dataset.docopen:sh?sh.dataset.docshare:""));if(!d)return;
  if(o)openViewer(d);else docShare(d);
});
$("docImport").addEventListener("change",async e=>{
  const files=[...e.target.files];e.target.value="";let n=0;
  for(const f of files){
    try{
      const base=f.name.replace(/\.[a-z0-9]{2,5}$/i,"").replace(/[_]+/g," ").trim();
      if(/pdf$/i.test(f.type)||/\.pdf$/i.test(f.name)){if(await addDoc(new Blob([await f.arrayBuffer()],{type:"application/pdf"}),base))n++}
      else if(/^image\//.test(f.type)){const src=await loadImg(f);const pg=renderPage(src,"color",0);if(await addDoc(makePDF([pg]),base||L("Image"),1))n++}
      else toast(`${f.name} : ${L("format non pris en charge")}`);
    }catch(ex){toast(`${f.name} : ${L("import impossible")}`)}
  }
  if(n)toast(n>1?`${n} ${L("documents ajoutés")}`:L("Document ajouté"));
});
/* lecteur de PDF */
let pdfjsP=null,viewTok=0,viewDoc=null;
function loadPdfJs(){
  if(window.pdfjsLib)return Promise.resolve(window.pdfjsLib);
  return pdfjsP||(pdfjsP=new Promise((res,rej)=>{const sc=document.createElement("script");sc.src=PDFJS+"pdf.min.js";
    sc.onload=()=>{window.pdfjsLib.GlobalWorkerOptions.workerSrc=PDFJS+"pdf.worker.min.js";res(window.pdfjsLib)};
    sc.onerror=()=>{pdfjsP=null;sc.remove();rej(new Error("pdfjs"))};document.head.appendChild(sc)}));
}
async function openViewer(d){
  const tok=++viewTok;viewDoc=d;
  $("vwTitle").textContent=d.title;$("viewer").hidden=false;document.body.style.overflow="hidden";
  const body=$("vwBody");body.innerHTML=`<p class="muted">${L("Ouverture…")}</p>`;
  let blob;try{blob=await docBlob(d)}catch(ex){if(tok===viewTok)body.innerHTML=`<p class="muted" style="text-align:center;padding:20px">${esc(ex instanceof TypeError?L("Pas de connexion internet"):ex.message)}</p>`;return}
  try{
    const lib=await loadPdfJs();
    const pdf=await lib.getDocument({data:new Uint8Array(await blob.arrayBuffer())}).promise;
    if(tok!==viewTok)return;body.innerHTML="";
    const W=Math.min(body.clientWidth-16,900),dpr=Math.min(2,window.devicePixelRatio||1);
    for(let i=1;i<=pdf.numPages;i++){
      if(tok!==viewTok)return;
      const page=await pdf.getPage(i),v0=page.getViewport({scale:1}),sc=W/v0.width,vp=page.getViewport({scale:sc*dpr});
      const c=document.createElement("canvas");c.width=vp.width;c.height=vp.height;c.style.width=W+"px";body.appendChild(c);
      await page.render({canvasContext:c.getContext("2d"),viewport:vp}).promise;
    }
    if(!d.pages&&pdf.numPages){d.pages=pdf.numPages;save();renderDocs()}
  }catch(ex){
    if(tok!==viewTok)return;
    // secours : lecteur intégré du navigateur
    const u=URL.createObjectURL(blob);body.innerHTML=`<iframe src="${u}" title="${esc(d.title)}"></iframe><p class="small muted" style="text-align:center">${L("Si le document ne s'affiche pas, touche « Partager » pour l'ouvrir avec une autre app.")}</p>`;
  }
}
function closeViewer(){viewTok++;viewDoc=null;$("viewer").hidden=true;$("vwBody").innerHTML="";document.body.style.overflow=""}
$("vwBack").addEventListener("click",closeViewer);
$("vwShare").addEventListener("click",()=>{if(viewDoc)docShare(viewDoc)});
/* scanner : photo -> rendu « document » -> PDF */
let scanPages=[],scanFlt="doc";
function loadImg(file){return new Promise((res,rej)=>{const u=URL.createObjectURL(file),im=new Image();
  im.onload=()=>{const MAX=2600,k=Math.min(1,MAX/Math.max(im.naturalWidth,im.naturalHeight));
    const c=document.createElement("canvas");c.width=Math.round(im.naturalWidth*k);c.height=Math.round(im.naturalHeight*k);
    const g=c.getContext("2d");g.imageSmoothingQuality="high";g.drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);res(c)};
  im.onerror=()=>{URL.revokeObjectURL(u);rej(new Error("image"))};im.src=u})}
function renderPage(src,flt,rot){
  const r=((rot%4)+4)%4,c=document.createElement("canvas");c.width=r%2?src.height:src.width;c.height=r%2?src.width:src.height;
  const x=c.getContext("2d");x.translate(c.width/2,c.height/2);x.rotate(r*Math.PI/2);x.drawImage(src,-src.width/2,-src.height/2);x.setTransform(1,0,0,1,0,0);
  if(flt==="doc"){
    const im=x.getImageData(0,0,c.width,c.height),p=im.data,h=new Uint32Array(256),n=p.length/4;
    for(let i=0;i<p.length;i+=4){const v=(p[i]*299+p[i+1]*587+p[i+2]*114)/1000|0;p[i]=v;h[v]++}
    const pct=f=>{let a=0;for(let v=0;v<256;v++){a+=h[v];if(a>=n*f)return v}return 255};
    const lo=pct(.02),hi=Math.max(lo+30,pct(.80)),lut=new Uint8ClampedArray(256);
    for(let v=0;v<256;v++){const t=Math.min(1,Math.max(0,(v-lo)/(hi-lo)));lut[v]=255*Math.pow(t,1.6)}
    for(let i=0;i<p.length;i+=4){const v=lut[p[i]];p[i]=p[i+1]=p[i+2]=v}
    x.putImageData(im,0,0);
  }
  const url=c.toDataURL("image/jpeg",flt==="doc"?.85:.88),b=atob(url.split(",")[1]),bytes=new Uint8Array(b.length);
  for(let i=0;i<b.length;i++)bytes[i]=b.charCodeAt(i);
  return{bytes,w:c.width,h:c.height,url};
}
// PDF minimal : une image JPEG par page
function makePDF(pages){
  const enc=new TextEncoder(),parts=[],offs=[];let pos=0;
  const add=x=>{const b=typeof x==="string"?enc.encode(x):x;parts.push(b);pos+=b.length};
  const N=pages.length,ids=pages.map((_,i)=>({pg:3+i*3,im:4+i*3,ct:5+i*3}));
  add("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");
  const obj=(id,...body)=>{offs[id]=pos;add(`${id} 0 obj\n`);body.forEach(add);add("\nendobj\n")};
  obj(1,"<< /Type /Catalog /Pages 2 0 R >>");
  obj(2,`<< /Type /Pages /Kids [${ids.map(o=>o.pg+" 0 R").join(" ")}] /Count ${N} >>`);
  pages.forEach((p,i)=>{
    const W=595.28,H=+(W*p.h/p.w).toFixed(2),cs=`q ${W} 0 0 ${H} 0 0 cm /Im${i} Do Q`;
    obj(ids[i].pg,`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /XObject << /Im${i} ${ids[i].im} 0 R >> >> /Contents ${ids[i].ct} 0 R >>`);
    obj(ids[i].im,`<< /Type /XObject /Subtype /Image /Width ${p.w} /Height ${p.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${p.bytes.length} >>\nstream\n`,p.bytes,"\nendstream");
    obj(ids[i].ct,`<< /Length ${cs.length} >>\nstream\n${cs}\nendstream`);
  });
  const xref=pos,size=3+N*3;
  add(`xref\n0 ${size}\n0000000000 65535 f \n`+Array.from({length:size-1},(_,k)=>String(offs[k+1]).padStart(10,"0")+" 00000 n \n").join(""));
  add(`trailer\n<< /Size ${size} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
  return new Blob(parts,{type:"application/pdf"});
}
function renderScan(){
  $("scanPages").innerHTML=scanPages.map((p,i)=>`<div class="pg"><img src="${p.out.url}" alt="Page ${i+1}"><button class="rot" data-scrot="${i}" aria-label="Pivoter">↻</button><button class="rm" data-scrm="${i}" aria-label="Retirer">×</button><span>${i+1}</span></div>`).join("");
  document.querySelectorAll("#scanFilter button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.flt===scanFlt));
  $("scanSave").disabled=!scanPages.length;
  $("scanAddTxt").textContent=L(scanPages.length?"◎ Page suivante":"◎ Prendre une photo");
  $("scanSave").textContent=scanPages.length?`${L("Enregistrer le PDF")} (${scanPages.length} ${L(scanPages.length>1?"pages":"page")})`:L("Enregistrer le PDF");
}
function openScan(){
  scanPages=[];const n=new Date();
  $("scanName").value=`Scan ${n.getDate()} ${MO[n.getMonth()]} ${n.getFullYear()} ${two(n.getHours())}h${two(n.getMinutes())}`;
  $("scan").hidden=false;renderScan();
}
$("docScanBtn").addEventListener("click",()=>{openScan();$("scanCam").click()});
$("scanClose").addEventListener("click",()=>{$("scan").hidden=true;scanPages=[]});
async function scanAdd(files){
  for(const f of files){try{const src=await loadImg(f);scanPages.push({src,rot:0,out:renderPage(src,scanFlt,0)})}catch(e){toast("Photo illisible")}}
  renderScan();
}
$("scanCam").addEventListener("change",e=>{scanAdd([...e.target.files]);e.target.value=""});
$("scanLib").addEventListener("change",e=>{scanAdd([...e.target.files]);e.target.value=""});
$("scan").addEventListener("click",e=>{
  if(e.target.id==="scan"){$("scan").hidden=true;scanPages=[];return}
  const b=e.target.closest("button");if(!b)return;
  if(b.dataset.flt){scanFlt=b.dataset.flt;scanPages.forEach(p=>p.out=renderPage(p.src,scanFlt,p.rot));renderScan()}
  else if(b.dataset.scrot){const p=scanPages[+b.dataset.scrot];p.rot++;p.out=renderPage(p.src,scanFlt,p.rot);renderScan()}
  else if(b.dataset.scrm){scanPages.splice(+b.dataset.scrm,1);renderScan()}
});
$("scanSave").addEventListener("click",async()=>{
  if(!scanPages.length)return;const btn=$("scanSave");btn.disabled=true;
  const d=await addDoc(makePDF(scanPages.map(p=>p.out)),$("scanName").value.trim()||"Scan",scanPages.length);
  btn.disabled=false;if(d){$("scan").hidden=true;scanPages=[];toast("Scan enregistré dans Documents")}
});

/* ---------- récupération d'un code oublié, grâce au mot de passe du compte ---------- */
// Quand on choisit un code (mots de passe, notes secrètes, documents), on le garde aussi chiffré avec le mot de passe
// du compte Sid'note (v.rec). Code oublié → on redemande le mot de passe du compte → le code est retrouvé, rien n'est effacé.
let recRes=null,recCheck=null;const recAsked=new Set();
function askAccountPw(title,text,check,laterLabel){return new Promise(res=>{
  recRes=res;recCheck=check;$("recTitle").textContent=L(title);$("recText").textContent=L(text);$("recPw").value="";$("recErr").hidden=true;
  $("recLater").textContent=L(laterLabel||"Annuler");$("recOk").disabled=false;$("recSheet").hidden=false;setTimeout(()=>$("recPw").focus(),80)})}
function recEnd(v){$("recSheet").hidden=true;$("recPw").value="";const r=recRes;recRes=null;if(r)r(v)}
$("recForm").addEventListener("submit",async e=>{e.preventDefault();const pw=$("recPw").value;if(!pw)return;
  $("recOk").disabled=true;const err=await recCheck(pw);$("recOk").disabled=false;
  if(err){$("recErr").textContent=L(err);$("recErr").hidden=false;$("recPw").select();return}recEnd(pw)});
$("recLater").addEventListener("click",()=>recEnd(null));$("recClose").addEventListener("click",()=>recEnd(null));
const accEmail=()=>session.email||`${slug(session.name||"")}@${EMAIL_DOMAIN}`;
// active la récupération pour un coffre (après création du code, ou plus tard)
async function recEnable(v,code){
  if(v&&v.id)recAsked.add(v.id); // une seule proposition par session, même si on répond « Plus tard »
  const pw=await askAccountPw("Ne perds jamais ton code","Entre le mot de passe de ton compte Sid'compagnon : si tu oublies ce code un jour, il te suffira de ce mot de passe pour le retrouver.",
    async pw=>{try{await api("/auth/v1/token?grant_type=password",{method:"POST",body:{email:accEmail(),password:pw}});return null}
      catch(ex){return ex instanceof TypeError?"Pas de connexion internet. Réessaie quand tu es connecté.":"Mot de passe incorrect."}},"Plus tard");
  if(!pw)return false;
  const salt=b64e(crypto.getRandomValues(new Uint8Array(16))),key=await pinKey(pw,salt,PIN_ITER);
  v.rec={salt,...await encJ(key,{pin:code})};save();toast("Récupération du code activée");return true;
}
function recOffer(v,code){if(v&&!isV2(v)&&!v.rec&&!recAsked.has(v.id)){recAsked.add(v.id);recEnable(v,code)}}
// retrouve le code oublié (null si annulé)
async function recRecover(v){let code=null;
  await askAccountPw("Code oublié","Entre le mot de passe de ton compte Sid'compagnon pour retrouver ton code.",
    async pw=>{try{const key=await pinKey(pw,v.rec.salt,PIN_ITER);code=(await decJ(key,v.rec)).pin;return null}catch(e){return "Mot de passe incorrect."}});
  if(code)toast(`${L("Ton code est")} ${code}`,6000);return code}

/* ---------- claviers de code : appui instantané, sans zoom au double appui ---------- */
// Sur iPhone, deux appuis rapides sur le même chiffre déclenchent le zoom : on gère le toucher nous-mêmes
// (touchend + preventDefault annule le zoom et le clic simulé), la souris passe par click.
function padTap(pad,key,press){
  pad.addEventListener("touchend",e=>{const b=e.target.closest(`[data-${key}]`);if(!b)return;e.preventDefault();press(b.dataset[key])},{passive:false});
  pad.addEventListener("click",e=>{const b=e.target.closest(`[data-${key}]`);if(b)press(b.dataset[key])});
}

/* ---------- notes libres (+ notes secrètes) ---------- */
const NT=()=>data.notes||(data.notes=[]);
/* v39 : notes « façon Word » : texte mis en forme (n.html, nettoyé) + texte brut (n.body, pour la recherche, l'aperçu et le connecteur).
   Dossiers et sous-dossiers : data.noteFolders = [{id, name, parent}] ; note.folder = id du dossier. */
const NF=()=>data.noteFolders||(data.noteFolders=[]);
let noteDir=null,nfRen=null; // dossier ouvert (en mémoire : tout se referme quand on revient), dossier en cours de renommage
const nfOf=id=>id?NF().find(f=>f.id===id):null;
const nfPath=id=>{const p=[];let f=nfOf(id),g=0;while(f&&g++<30){p.unshift(f);f=nfOf(f.parent)}return p};
const nfKids=id=>NF().filter(f=>(nfOf(f.parent)?f.parent:null)===(id||null)).sort((a,b)=>a.name.localeCompare(b.name));
const noteDirOf=n=>nfOf(n.folder)?n.folder:null;
const nfSub=id=>{const s=new Set([id]);let add=true;while(add){add=false;for(const f of NF())if(!s.has(f.id)&&s.has(f.parent)){s.add(f.id);add=true}}return s};
const nfCount=id=>{const s=nfSub(id);return NT().filter(n=>s.has(n.folder)).length};
const RT_DROP=new Set(["SCRIPT","STYLE","IFRAME","OBJECT","EMBED","SVG","MATH","IMG","PICTURE","VIDEO","AUDIO","CANVAS","TEMPLATE","FORM","INPUT","BUTTON","TEXTAREA","SELECT","LINK","META","TITLE","HEAD"]);
const RT_KEEP=new Set(["B","STRONG","I","EM","U","S","STRIKE","DEL","MARK","SPAN","H2","H3","P","DIV","BR","UL","OL","LI","BLOCKQUOTE","HR","A"]);
const RT_HL=["y","g","b","p"],RT_TC=["r","o","g","b","v"]; // v41 : surligneur et couleur du texte (data-hl, data-tc)
// garde seulement la mise en forme autorisée (rien d'exécutable, pas de style) : sert à l'enregistrement et au collage
function rtClean(html){const t=document.createElement("template");t.innerHTML=String(html||"");
  const walk=n=>{for(const c of [...n.childNodes]){if(c.nodeType===3)continue;if(c.nodeType!==1){c.remove();continue}
    let tag=c.tagName;if(RT_DROP.has(tag)){c.remove();continue}
    if(tag==="H1"||tag==="H4"||tag==="H5"||tag==="H6"){const h=document.createElement(tag==="H1"?"h2":"h3");h.append(...c.childNodes);c.replaceWith(h);walk(h);continue}
    walk(c);if(!RT_KEEP.has(tag)){c.replaceWith(...c.childNodes);continue}
    const hl=tag==="MARK"&&RT_HL.includes(c.getAttribute("data-hl"))?c.getAttribute("data-hl"):null,tc=tag==="SPAN"&&RT_TC.includes(c.getAttribute("data-tc"))?c.getAttribute("data-tc"):null;
    if(tag==="SPAN"&&!tc){c.replaceWith(...c.childNodes);continue}
    const href=tag==="A"&&/^https?:\/\//i.test(c.getAttribute("href")||"")?c.getAttribute("href"):null,chk=tag==="UL"&&c.classList.contains("chk"),dc=tag==="LI"?c.getAttribute("data-c"):null;
    for(const a of [...c.attributes])c.removeAttribute(a.name);
    if(href){c.setAttribute("href",href);c.setAttribute("target","_blank");c.setAttribute("rel","noopener")}else if(tag==="A"){c.replaceWith(...c.childNodes);continue}
    if(chk)c.className="chk";if(dc==="1"||dc==="0")c.setAttribute("data-c",dc);if(hl)c.setAttribute("data-hl",hl);if(tc)c.setAttribute("data-tc",tc)}};
  walk(t.content);return t.innerHTML.trim()}
const rtFromText=b=>String(b||"").split("\n").map(l=>`<div>${l?esc(l):"<br>"}</div>`).join("");
const rtText=el=>String(el.innerText||"").replace(/\u00a0/g," ").replace(/\n{3,}/g,"\n\n").trim();
const rtSet=v=>{$("noteBody").innerHTML=v.html?rtClean(v.html):rtFromText(v.body);rtEmpty()};
const rtEmpty=()=>$("noteBody").classList.toggle("is-empty",!rtText($("noteBody"))&&!$("noteBody").querySelector("li,hr"))
let noteOpenId=null,noteQ="",noteSaveT=null,notePend=null;
const noteFind=id=>NT().find(n=>n.id===id);
const fmtWhen=t=>{const d=new Date(t),n=new Date();
  if(d.toDateString()===n.toDateString())return `${two(d.getHours())}:${two(d.getMinutes())}`;
  return `${d.getDate()} ${MO[d.getMonth()]}${d.getFullYear()!==n.getFullYear()?" "+d.getFullYear():""}`};
// notes secrètes : titre et texte chiffrés avec un code à 5 chiffres propre aux notes (même méthode que le coffre)
// note secrète = {id, secret:true, vid, iv, ct, createdAt, upd} ; le texte clair ne vit qu'en mémoire (nsPlain)
let nsKey=null,nsVid=null,nsPlain=new Map(),nsLoading=false;
const nsOn=()=>!!(data.noteVault&&data.noteVault.chk);
const noteView=n=>!n?null:n.secret?(nsKey&&n.vid===nsVid&&nsPlain.get(n.id))||null:n; // null = verrouillée
// enregistrement différé (le chiffrement d'une note secrète est asynchrone)
function noteQueue(fn){clearTimeout(noteSaveT);notePend=fn;noteSaveT=setTimeout(noteFlush,600)}
async function noteFlush(){clearTimeout(noteSaveT);noteSaveT=null;const f=notePend;notePend=null;if(f)await f()}
function renderNotes(){
  if(!$("noteList"))return;if(typeof pvRefresh==="function")pvRefresh();
  // coffre des notes remis à zéro ou recréé ailleurs : on reverrouille
  if(nsKey&&(!nsOn()||data.noteVault.id!==nsVid)){nsKey=null;nsVid=null;nsPlain=new Map()}
  // notes secrètes arrivées d'un autre appareil : on les déchiffre puis on réaffiche
  if(nsKey&&!nsLoading&&NT().some(n=>n.secret&&n.vid===nsVid&&(nsPlain.get(n.id)||{})._iv!==n.iv)){nsLoading=true;nsLoad().finally(()=>{nsLoading=false;renderNotes()})}
  const n=noteOpenId&&noteFind(noteOpenId),v=noteView(n);
  if(noteOpenId&&!v)noteOpenId=null; // supprimée ailleurs, ou verrouillée
  $("notesList").hidden=!!noteOpenId;$("noteEdit").hidden=!noteOpenId;document.body.classList.toggle("note-full",data.ui.view==="notes"&&!!noteOpenId);if(data.ui.view==="notes")$("vhead").hidden=!!noteOpenId;
  if(noteOpenId){
    if(document.activeElement!==$("noteTitle"))$("noteTitle").value=v.title||"";
    if(document.activeElement!==$("noteBody"))rtSet(v);
    $("noteWhen").textContent=fmtWhen(n.upd||Date.parse(n.createdAt));
    $("noteSecBar").hidden=!n.secret;
    $("noteLock").setAttribute("aria-label",L(n.secret?"Verrouiller la note":"Rendre la note secrète"));$("noteLock").title=$("noteLock").getAttribute("aria-label");
    return}
  const q=noteQ.trim(),secN=NT().filter(x=>x.secret).length;
  $("nsBar").hidden=!(nsKey&&secN);
  $("nsBar").innerHTML=`<span class="grow">${IC("unlock")} ${L("Notes secrètes déverrouillées")}</span><button type="button" class="mini" data-nslock="1">${IC("lock")} ${L("Verrouiller")}</button>`;
  let list=NT().slice().sort((a,b)=>(b.upd||0)-(a.upd||0));
  if(noteDir&&!nfOf(noteDir))noteDir=null;$("nfNew").textContent=L(noteDir?"+ Sous-dossier":"+ Dossier");
  const path=nfPath(noteDir);$("nfPath").hidden=!!q||!noteDir;
  // v41 : dans un dossier, un vrai bouton retour (vers le dossier parent) + le chemin complet ; on peut y déposer une note ou un dossier
  const up=path.length>1?path[path.length-2]:null;
  $("nfPath").innerHTML=noteDir?`<button type="button" class="back nf-back" data-nfgo="${up?up.id:""}">‹ ${esc(up?up.name:L("Notes"))}</button>
    <div class="nf-crumbs"><button type="button" class="nf-crumb" data-nfgo="">${L("Notes")}</button>`+path.map((f,i)=>`<span aria-hidden="true">›</span>${i===path.length-1?`<b class="notr">${esc(f.name)}</b>`:`<button type="button" class="nf-crumb notr" data-nfgo="${f.id}">${esc(f.name)}</button>`}`).join("")+`</div>`:"";
  $("notesList").classList.toggle("in-dir",!!noteDir&&!q);const h1=$("notesList").querySelector("h1");if(h1){h1.textContent=noteDir&&!q?path[path.length-1].name:L("Notes");h1.classList.toggle("notr",!!noteDir)}
  // v42 : les dossiers en tuiles (section « Dossiers »), bien distincts des notes en lignes (section « Notes »)
  const kids=q?[]:nfKids(noteDir);
  const dirs=kids.length?`<h2 class="nl-h">${L(noteDir?"Sous-dossiers":"Dossiers")}</h2><div class="nf-grid">`+kids.map(f=>`<div class="nf-row nf-tile"><span class="ngrip" data-fgrip="${f.id}" aria-hidden="true" title="${L("Maintenir et glisser")}">${GRIP}</span><button type="button" class="nf-open" data-nfopen="${f.id}"><span class="nf-ic">${IC("folder")}</span><b class="grow notr">${esc(f.name)}</b><span class="nf-n">${nfCount(f.id)||"0"}</span></button><button type="button" class="pen" data-nfmore="${f.id}" aria-label="${L("Plus d'actions")}">${MORE}</button></div>`).join("")+`</div>`:"";
  if(!q)list=list.filter(x=>noteDirOf(x)===noteDir);
  if(q)list=list.filter(x=>noteView(x)).map(x=>{const w=noteView(x);return{x,s:Math.max(fuzzyScore(w.title||"",q),fold(w.body).includes(fold(q))?11:0)}}).filter(o=>o.s>0).sort((a,b)=>b.s-a.s).map(o=>o.x);
  $("noteList").innerHTML=dirs+(list.length&&dirs?`<h2 class="nl-h">${L("Notes")}</h2>`:"")+(list.length?`<div class="nl-notes">`+list.map(x=>{const w=noteView(x),when=`<span class="when">${fmtWhen(x.upd||Date.parse(x.createdAt))}</span>`;
    const more=`<button type="button" class="pen note-more" data-nmore="${x.id}" aria-label="${L("Plus d'actions")}">${MORE}</button>`;
    if(!w)return `<div class="note-row"><button class="note note-lock" data-note="${x.id}"><b>${IC("lock")} ${L("Note secrète")}</b><span class="prev">${L("Touche pour l'ouvrir avec ton code")}</span>${when}</button>${more}</div>`;
    const lines=String(w.body||"").trim().split("\n").filter(Boolean);
    const t=w.title&&w.title.trim()?w.title:(lines.shift()||L("Nouvelle note"));
    const fp=q&&noteDirOf(x)?`<span class="small muted nf-in">${IC("folder")} ${esc(nfPath(x.folder).map(f=>f.name).join(" › "))}</span>`:"";
    return `<div class="note-row"><span class="ngrip" data-ngrip="${x.id}" aria-hidden="true" title="${L("Maintenir et glisser")}">${GRIP}</span><button class="note" data-note="${x.id}"><b class="notr">${x.secret?IC("lock")+" ":""}${esc(t)}</b>${fp}<span class="prev notr">${esc(lines.join(" · ")||"")}</span>${x.photos&&x.photos.length?`<span class="np-count">${IC("camera")} ${x.photos.length} ${L(x.photos.length>1?"photos":"photo")}</span>`:""}${x.pdf?`<span class="np-count pdf-badge">PDF${x.pdf.pages?` · ${x.pdf.pages} ${L(x.pdf.pages>1?"pages":"page")}`:""}${(()=>{const k=pvAnns(x.id).length;return k?` · ${k} ${L(k>1?"annotations":"annotation")}`:""})()}</span>`:""}${when}</button>${more}</div>`}).join("")+`</div>`
    :dirs?"":`<div class="empty">${L(q?"Aucune note ne correspond.":noteDir?"Ce dossier est vide. Touche « + Note » pour y écrire.":"Aucune note pour l'instant. Touche « + Note » pour écrire.")}</div>`);
}
function openNote(id){noteOpenId=id;renderNotes();window.scrollTo(0,0)}
async function closeNote(){
  await noteFlush();const n=noteOpenId&&noteFind(noteOpenId),v=noteView(n);
  // une note laissée vide n'est pas gardée
  if(n&&v&&!String(v.title||"").trim()&&!String(v.body||"").trim()&&!(n.photos&&n.photos.length)){tomb(n.id);data.notes=NT().filter(x=>x!==n);nsPlain.delete(n.id)}
  save();noteOpenId=null;renderNotes();
}
$("noteNew").addEventListener("click",()=>{const n={id:uid(),title:"",body:"",createdAt:new Date().toISOString(),upd:Date.now()};if(noteDir)n.folder=noteDir;NT().push(n);openNote(n.id);$("noteTitle").focus()});
// --- dossiers de notes ---
function nfFormOpen(f){nfRen=f||null;$("nfForm").hidden=false;$("nfIn").value=f?f.name:"";$("nfForm").querySelector("[type=submit]").textContent=L(f?"Renommer":"Créer");setTimeout(()=>$("nfIn").focus(),30)}
$("nfNew").addEventListener("click",()=>nfFormOpen(null));
$("nfCancel").addEventListener("click",()=>{$("nfForm").hidden=true;nfRen=null});
$("nfForm").addEventListener("submit",e=>{e.preventDefault();const v=$("nfIn").value.trim().replace(/\s+/g," ").slice(0,60);if(!v)return;
  if(nfRen){nfRen.name=v;toast("Dossier renommé")}else{NF().push({id:uid(),name:v,parent:noteDir||null,createdAt:new Date().toISOString()});toast(`${L("Dossier créé")} : ${v}`)}
  $("nfForm").hidden=true;nfRen=null;save();renderNotes()});
function nfDelete(f){const kids=NF().filter(x=>x.parent===f.id).map(x=>x.id),ns=NT().filter(n=>n.folder===f.id).map(n=>n.id),up=f.parent||null;
  undoable("Dossier supprimé, son contenu est gardé",[f.id],()=>{tomb(f.id);NF().forEach(x=>{if(x.parent===f.id)x.parent=up});NT().forEach(n=>{if(n.folder===f.id){if(up)n.folder=up;else delete n.folder}});data.noteFolders=NF().filter(x=>x!==f);if(noteDir===f.id)noteDir=up},
    {after:renderNotes,revert:()=>{NF().forEach(x=>{if(kids.includes(x.id))x.parent=f.id});NT().forEach(n=>{if(ns.includes(n.id))n.folder=f.id})}})}
// liste des dossiers (arbre aplati) pour ranger une note ou un dossier
function nfChoices(cur,skip,set){const out=[{l:L("Notes (aucun dossier)"),on:!cur,fn:()=>set(null)}];
  const add=(pid,depth)=>nfKids(pid).forEach(f=>{if(skip&&skip.has(f.id))return;out.push({l:`${"   ".repeat(depth)}${depth?"└ ":""}${f.name}`,on:cur===f.id,fn:()=>set(f.id)});add(f.id,depth+1)});
  add(null,0);return out}
function nfActions(id){const f=nfOf(id);if(!f)return;
  openActions(f.name,[{l:"Renommer",fn:()=>nfFormOpen(f)},
    {l:"Déplacer",fn:()=>openActions(L("Déplacer vers"),nfChoices(f.parent||null,nfSub(f.id),pid=>{f.parent=pid;save();renderNotes();toast("Dossier déplacé")}))},
    {l:"Supprimer",danger:true,fn:()=>nfDelete(f)}])}
$("nfPath").addEventListener("click",e=>{const b=e.target.closest("[data-nfgo]");if(b){noteDir=b.dataset.nfgo||null;renderNotes();window.scrollTo(0,0)}});
// v41 : glisser une note ou un dossier (poignée ⠿) sur un dossier pour l'y ranger, ou sur le bouton retour / le chemin pour le remonter
$("noteList").addEventListener("pointerdown",e=>{const g=e.target.closest("[data-ngrip],[data-fgrip]");if(!g)return;e.preventDefault();
  const isF=!!g.dataset.fgrip,id=g.dataset.ngrip||g.dataset.fgrip,item=isF?nfOf(id):noteFind(id);if(!item)return;
  const w=noteView(item)||{},label=isF?item.name:(w.title||String(w.body||"").split("\n")[0]||L("Note secrète"));
  const row=g.closest(".nf-row,.note-row"),ghost=document.createElement("div");ghost.className="doc-ghost";ghost.textContent=label;document.body.appendChild(ghost);row.classList.add("dragging");
  try{g.setPointerCapture(e.pointerId)}catch(x){}if(navigator.vibrate)navigator.vibrate(10);
  const bad=isF?nfSub(id):new Set();let over=null;
  const pos=ev=>{ghost.style.left=(ev.clientX+12)+"px";ghost.style.top=(ev.clientY-20)+"px";
    const el=document.elementFromPoint(ev.clientX,ev.clientY);let c=el&&el.closest("#noteList [data-nfopen],#nfPath [data-nfgo]");
    if(c&&bad.has(c.dataset.nfopen||c.dataset.nfgo))c=null;
    if(c!==over){if(over)over.classList.remove("drop");over=c;if(over)over.classList.add("drop")}
    if(ev.clientY<90)window.scrollBy(0,-12);else if(ev.clientY>innerHeight-120)window.scrollBy(0,12)};pos(e);
  const up=()=>{g.removeEventListener("pointermove",pos);g.removeEventListener("pointerup",up);g.removeEventListener("pointercancel",up);ghost.remove();row.classList.remove("dragging");
    if(over){const to=(over.dataset.nfopen||over.dataset.nfgo)||null,f=nfOf(to);over.classList.remove("drop");
      if(isF){if((item.parent||null)!==to){item.parent=to;save();toast(f?`${L("Dossier rangé dans")} « ${f.name} »`:"Dossier remis dans Notes")}}
      else if((noteDirOf(item)||null)!==to){if(to)item.folder=to;else delete item.folder;item.upd=Date.now();save();toast(f?`${L("Rangée dans")} « ${f.name} »`:"Rangée dans Notes")}}
    renderNotes()};
  g.addEventListener("pointermove",pos);g.addEventListener("pointerup",up);g.addEventListener("pointercancel",up)});
$("noteMove").addEventListener("click",()=>{const n=noteFind(noteOpenId);if(!n)return;
  if(!NF().length){toast("Crée d'abord un dossier dans la liste des notes");return}
  openActions(L("Ranger dans"),nfChoices(noteDirOf(n),null,fid=>{if(fid)n.folder=fid;else delete n.folder;n.upd=Date.now();save();toast(fid?`${L("Rangée dans")} « ${nfOf(fid).name} »`:"Rangée dans Notes")}))});
$("noteList").addEventListener("click",async e=>{
  const fo=e.target.closest("[data-nfopen]");if(fo){noteDir=fo.dataset.nfopen;renderNotes();window.scrollTo(0,0);return}
  const fm=e.target.closest("[data-nfmore]");if(fm){nfActions(fm.dataset.nfmore);return}
  const nm=e.target.closest("[data-nmore]");if(nm){noteActions(nm.dataset.nmore);return}
  const b=e.target.closest("[data-note]");if(!b)return;const n=noteFind(b.dataset.note);if(!n)return;
  if(n.pdf){pdfOpen(n.id);return} // v44.7 : une note PDF s'ouvre dans le lecteur-annoteur
  if(n.secret&&!noteView(n)){if(!(await nsUnlock()))return;await nsLoad();if(!noteView(n))return}
  openNote(n.id)});
$("nsBar").addEventListener("click",e=>{if(e.target.closest("[data-nslock]")){nsLock();toast("Notes secrètes verrouillées")}});
$("noteBack").addEventListener("click",closeNote);
$("noteSearch").addEventListener("input",e=>{noteQ=e.target.value;renderNotes()});
function noteInput(){
  const n=noteFind(noteOpenId),v=noteView(n);if(!v)return;
  const el=$("noteBody");v.title=$("noteTitle").value;v.body=rtText(el);v.html=el.innerHTML;n.upd=Date.now();$("noteWhen").textContent=fmtWhen(n.upd);rtEmpty();
  if(!n.secret){noteQueue(async()=>{v.html=rtClean(el.innerHTML);save()});return}
  const k=nsKey;noteQueue(async()=>{v.html=rtClean(v.html);const e=await encJ(k,{title:v.title,body:v.body,html:v.html});n.iv=e.iv;n.ct=e.ct;v._iv=e.iv;save()});
}
$("noteTitle").addEventListener("input",noteInput);$("noteBody").addEventListener("input",noteInput);
$("noteTitle").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();$("noteBody").focus()}});
// les photos (et le PDF) ne sont effacés qu'une fois l'annulation impossible
function noteRemove(n){undoable("Note supprimée",[n.id],()=>{tomb(n.id);data.notes=NT().filter(x=>x!==n)},{after:renderNotes,later:()=>{if(!noteFind(n.id)){npDropAll(n);nsPlain.delete(n.id)}}})}
$("noteDel").addEventListener("click",async()=>{if(!c2ok($("noteDel")))return;await noteFlush();const n=noteFind(noteOpenId);noteOpenId=null;if(!n){renderNotes();return}
  noteRemove(n)});
// v44.7 : « ⋯ » sur chaque note de la liste : la ranger ou la supprimer sans l'ouvrir (suppression annulable 5 s)
function noteActions(id){const n=noteFind(id);if(!n)return;const w=noteView(n);
  const t=w?(w.title&&w.title.trim()?w.title:String(w.body||"").trim().split("\n")[0]||(n.pdf&&n.pdf.name)||L("Nouvelle note")):L("Note secrète");
  const items=[];
  if(NF().length)items.push({l:"Ranger dans un dossier",fn:()=>openActions(L("Ranger dans"),nfChoices(noteDirOf(n),null,fid=>{if(fid)n.folder=fid;else delete n.folder;n.upd=Date.now();save();renderNotes();toast(fid?`${L("Rangée dans")} « ${nfOf(fid).name} »`:"Rangée dans Notes")}))});
  items.push({l:"Supprimer",danger:true,fn:()=>noteRemove(n)});
  openActions(t,items)}
// cadenas : rend la note secrète (ou la verrouille si elle l'est déjà), puis la ferme
$("noteLock").addEventListener("click",async()=>{
  const n=noteFind(noteOpenId);if(!n)return;dictStop();
  if(n.secret){await noteFlush();nsLock();toast("Note verrouillée");return}
  const plain={title:$("noteTitle").value,body:rtText($("noteBody")),html:rtClean($("noteBody").innerHTML)};
  if(!plain.title.trim()&&!plain.body.trim()){toast("Écris d'abord quelque chose");return}
  if(!(await nsUnlock()))return;
  await noteFlush();
  const e=await encJ(nsKey,plain);
  Object.assign(n,{secret:true,vid:nsVid,iv:e.iv,ct:e.ct,upd:Date.now()});delete n.title;delete n.body;delete n.html;
  save();nsLock();toast("Note secrète verrouillée");
});
$("noteUnsecret").addEventListener("click",async()=>{
  const n=noteFind(noteOpenId),v=noteView(n);if(!n||!v)return;await noteFlush();
  n.title=v.title||"";n.body=v.body||"";if(v.html)n.html=v.html;["secret","vid","iv","ct"].forEach(k=>delete n[k]);n.upd=Date.now();nsPlain.delete(n.id);
  save();renderNotes();toast("La note n'est plus secrète");
});
// --- photos dans les notes (v24) : n.photos = [{id, up}] ; l'image (réduite, JPEG) est gardée sur l'appareil (IndexedDB)
// et copiée dans l'espace privé Supabase (bucket « documents », dossier <uid>/notes/). Pas de photo dans une note secrète.
const npKey=id=>session.user.id+":np:"+id,npPath=id=>`${session.user.id}/notes/${id}.jpg`;
const npCache=new Map();let npBusy=new Set(),lbCur=null;
const dataToBlob=u=>fetch(u).then(r=>r.blob());
const blobToData=b=>new Promise((res,rej)=>{const f=new FileReader();f.onload=()=>res(f.result);f.onerror=rej;f.readAsDataURL(b)});
async function npGet(id){if(npCache.has(id))return npCache.get(id);let u=await idb.get(npKey(id));
  if(!u){try{const r=await stor("GET","authenticated/documents/"+npPath(id));u=await blobToData(new Blob([await r.arrayBuffer()],{type:"image/jpeg"}));idb.put(npKey(id),u).catch(()=>{})}catch(e){return null}}
  npCache.set(id,u);return u}
async function npUpload(n,p){if(p.up||npBusy.has(p.id))return;const u=await idb.get(npKey(p.id));if(!u)return;npBusy.add(p.id);
  try{const b=await dataToBlob(u);await stor("POST","documents/"+npPath(p.id),b,"image/jpeg"); // v32 : le stockage accepte les photos (plus de détour par le type PDF)
    p.up=true;save()}catch(e){}
  npBusy.delete(p.id)}
function notesPhotosPending(){if(!session)return;NT().forEach(n=>{(n.photos||[]).forEach(p=>{if(!p.up)npUpload(n,p)});if(n.pdf&&!n.pdf.up)pdfUpload(n)})}
function renderNotePhotos(n){const box=$("notePhotos");if(!box)return;const ps=(n&&n.photos)||[];box.hidden=!ps.length;
  box.innerHTML=ps.map(p=>`<button type="button" class="np" data-np="${p.id}" aria-label="${L("Voir la photo")}"><span class="np-load"></span></button>`).join("");
  ps.forEach(async p=>{const u=await npGet(p.id),el=box.querySelector(`[data-np="${p.id}"]`);if(el)el.innerHTML=u?`<img src="${u}" alt="">`:`<span class="small muted">${L("Indisponible")}</span>`})}
$("notePhotoIn").addEventListener("change",async e=>{const files=[...e.target.files];e.target.value="";const n=noteFind(noteOpenId);if(!n||!files.length)return;
  if(n.secret){toast("Pas de photo dans une note secrète");return}
  n.photos=n.photos||[];
  for(const f of files.slice(0,10)){try{const u=await shrink(f,1600,.82),id=uid();await idb.put(npKey(id),u);npCache.set(id,u);const p={id,up:false};n.photos.push(p);n.upd=Date.now();save();renderNotePhotos(n);npUpload(n,p)}
    catch(ex){toast("Photo illisible")}}
  toast(files.length>1?"Photos ajoutées":"Photo ajoutée")});
// --- v44.7 : PDF de cours dans sid'note (demande de Sid) : une « note PDF » = {id, title, body (mes notes), pdf:{name, size, pages, up}}.
// Le fichier est gardé sur l'appareil (IndexedDB) et copié dans l'espace privé (documents/<uid>/notes/<id>.pdf, pas chiffré, comme les notes).
// Annotations : data.pdfAnns = [{id, note, page, t:"text"|"hl", x, y, w, h?, txt?, upd}] (positions en fraction de la page),
// fusionnées par id entre appareils comme les notes. Outils : Lire, Texte (zone de texte posée sur la page), Surligner (au doigt), Mes notes.
const pdfKey=id=>session.user.id+":npdf:"+id,pdfPath=id=>`${session.user.id}/notes/${id}.pdf`;
const PA=()=>data.pdfAnns||(data.pdfAnns=[]);
const pdfBusy=new Set();
async function pdfUpload(n){if(!n.pdf||n.pdf.up||pdfBusy.has(n.id))return;const b=await idb.get(pdfKey(n.id));if(!b)return;pdfBusy.add(n.id);
  try{await stor("POST","documents/"+pdfPath(n.id),b,"application/pdf");n.pdf.up=true;save()}catch(e){}pdfBusy.delete(n.id)}
async function pdfBlob(n){let b=await idb.get(pdfKey(n.id));if(b)return b;
  const r=await stor("GET","authenticated/documents/"+pdfPath(n.id));b=new Blob([await r.arrayBuffer()],{type:"application/pdf"});idb.put(pdfKey(n.id),b).catch(()=>{});return b}
$("pdfIn").addEventListener("change",async e=>{const files=[...e.target.files];e.target.value="";let k=0,last=null;
  for(const f of files.slice(0,10)){if(!/pdf$/i.test(f.type||f.name)){toast(`${f.name} : ${L("ce n'est pas un PDF")}`);continue}
    if(f.size>50*1024*1024){toast(`${f.name} : ${L("trop lourd (50 Mo maximum)")}`);continue}
    const id=uid(),n={id,title:f.name.replace(/\.pdf$/i,"").slice(0,120),body:"",createdAt:new Date().toISOString(),upd:Date.now(),pdf:{name:f.name.slice(0,120),size:f.size,up:false}};
    if(noteDir)n.folder=noteDir;
    try{await idb.put(pdfKey(id),f)}catch(ex){toast("Enregistrement impossible sur cet appareil");continue}
    NT().push(n);k++;last=n;pdfUpload(n)}
  if(!k)return;save();renderNotes();toast(k>1?`${k} ${L("PDF ajoutés")}`:L("PDF ajouté"));if(k===1&&last)pdfOpen(last.id)});
let pv={note:null,tok:0,tool:"read",io:null,draw:null,sel:null};
const pvAnns=(nid,pg)=>PA().filter(a=>a&&a.note===nid&&(pg===undefined||a.page===pg)&&!(data.del&&data.del[a.id]));
async function pdfOpen(id){const n=noteFind(id);if(!n||!n.pdf)return;const tok=++pv.tok;pv.note=n.id;pvTool("read");
  $("pvTitle").value=n.title||"";$("pvNoteTxt").value=n.body||"";$("pvNotes").hidden=true;$("pdfv").hidden=false;document.body.style.overflow="hidden";
  const body=$("pvBody");body.innerHTML=`<p class="muted pv-wait">${L("Ouverture…")}</p>`;
  let blob;try{blob=await pdfBlob(n)}catch(ex){if(tok===pv.tok)body.innerHTML=`<p class="muted pv-wait">${esc(ex instanceof TypeError?L("Pas de connexion internet"):L("PDF introuvable sur cet appareil et en ligne"))}</p>`;return}
  try{const lib=await loadPdfJs(),pdf=await lib.getDocument({data:new Uint8Array(await blob.arrayBuffer())}).promise;if(tok!==pv.tok)return;
    pv.pdf=pdf;body.innerHTML="";if(pv.io)pv.io.disconnect();
    pv.io=new IntersectionObserver(es=>es.forEach(en=>{const w=en.target;if(en.isIntersecting)pvRender(w,tok);else if(w._c&&Math.abs(en.boundingClientRect.top)>innerHeight*3){w._c.remove();w._c=null}}),{root:body,rootMargin:"120% 0px"});
    for(let i=1;i<=pdf.numPages;i++){if(tok!==pv.tok)return;const pg=await pdf.getPage(i),v=pg.getViewport({scale:1});
      const w=document.createElement("div");w.className="pv-page";w.dataset.pg=i;w.style.aspectRatio=`${v.width} / ${v.height}`;w.innerHTML=`<div class="pv-ov" data-pg="${i}"></div><span class="pv-num">${i}</span>`;
      body.appendChild(w);pvOverlay(w);pv.io.observe(w)}
    if(n.pdf.pages!==pdf.numPages){n.pdf.pages=pdf.numPages;save();renderNotes()}
  }catch(ex){if(tok===pv.tok)body.innerHTML=`<p class="muted pv-wait">${L("Ce PDF ne peut pas être affiché.")}</p>`}}
async function pvRender(w,tok){if(w._c||w._busy||!pv.pdf)return;w._busy=true;
  try{const pg=await pv.pdf.getPage(+w.dataset.pg),v0=pg.getViewport({scale:1}),W=w.clientWidth||600,dpr=Math.min(2,window.devicePixelRatio||1),vp=pg.getViewport({scale:W/v0.width*dpr});
    const c=document.createElement("canvas");c.width=vp.width;c.height=vp.height;await pg.render({canvasContext:c.getContext("2d"),viewport:vp}).promise;
    if(tok!==pv.tok)return;w.prepend(c);w._c=c}catch(e){}w._busy=false}
function pvClose(){pvFlushTxt();pv.tok++;pv.note=null;pv.pdf=null;if(pv.io)pv.io.disconnect();$("pdfv").hidden=true;$("pvBody").innerHTML="";document.body.style.overflow="";renderNotes()}
// annotations placées en fraction de la page (même rendu sur iPhone et sur PC). v45 : zones de texte déplaçables et
// redimensionnables (× pour supprimer), traits libres au stylo et au surligneur ({t:"ink", pts:[[x,y]…], c, w, hl}), gomme.
const pct=v=>(Math.round(v*10000)/100)+"%";
const PV_COL={hl:["#FFD400","#7CE07C","#6EC6FF","#FF8AD0","#FFA94D"],pen:["#1C1A17","#D62828","#1D4ED8","#2F7A3A","#7C3AED"]};
const pvPen=k=>{const u=(data.ui.pvPen=data.ui.pvPen||{});return u[k]=u[k]||{c:PV_COL[k][0],s:k==="hl"?4:3}};
const pvW=(k,s)=>k==="hl"?.008+s*.005:.0015+s*.0012; // épaisseur en fraction de la largeur de la page (réglage 1 à 10)
const pvRatio=w=>{const m=String(w.style.aspectRatio||"1 / 1.4").split("/").map(Number);return m[1]/m[0]||1.4};
const pvPath=(pts,r)=>pts.map((p,i)=>(i?"L":"M")+(p[0]*1000).toFixed(1)+" "+(p[1]*1000*r).toFixed(1)).join(" ")+(pts.length===1?" l0.1 0":"");
function pvOverlay(w){const ov=w.querySelector(".pv-ov"),pg=+w.dataset.pg,act=document.activeElement,keep=act&&ov.contains(act)?act.closest("[data-ann]"):null,r=pvRatio(w);
  ov.querySelectorAll("[data-ann]").forEach(el=>{if(el!==keep)el.remove()});
  let svg=ov.querySelector("svg.pv-ink");if(!svg){ov.insertAdjacentHTML("afterbegin",`<svg class="pv-ink" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"></svg>`);svg=ov.querySelector("svg.pv-ink")}
  svg.setAttribute("viewBox",`0 0 1000 ${(1000*r).toFixed(1)}`);
  for(const a of pvAnns(pv.note,pg)){if(keep&&keep.dataset.ann===a.id)continue;
    if(a.t==="ink"&&Array.isArray(a.pts)&&a.pts.length)svg.insertAdjacentHTML("beforeend",`<path data-ann="${a.id}" class="${a.hl?"ink-hl":"ink-pen"}" d="${pvPath(a.pts,r)}" stroke="${esc(/^#[0-9a-f]{6}$/i.test(a.c||"")?a.c:"#1C1A17")}" stroke-width="${((a.w||.004)*1000).toFixed(1)}"/>`);
    else if(a.t==="hl")ov.insertAdjacentHTML("beforeend",`<button type="button" class="pv-hl" data-ann="${a.id}" style="left:${pct(a.x)};top:${pct(a.y)};width:${pct(a.w)};height:${pct(a.h)}" aria-label="${L("Surlignage")}"></button>`);
    else if(a.t==="text")ov.insertAdjacentHTML("beforeend",`<div class="pv-txt${pv.sel===a.id?" pv-on":""}" data-ann="${a.id}" style="left:${pct(a.x)};top:${pct(a.y)};width:${pct(a.w||.4)}${a.h?`;height:${pct(a.h)}`:""}"><textarea rows="1" class="notr" aria-label="${L("Texte sur le PDF")}" placeholder="${L("Écris ici…")}">${esc(a.txt||"")}</textarea><button type="button" class="pv-txt-x" data-pvdel="${a.id}" aria-label="${L("Supprimer ce texte")}">×</button><span class="pv-txt-mv" data-pvmv="${a.id}" title="${L("Déplacer")}" aria-hidden="true">${GRIP}</span><span class="pv-txt-rs" data-pvrs="${a.id}" title="${L("Agrandir ou rétrécir")}" aria-hidden="true"></span></div>`)}
  ov.querySelectorAll(".pv-txt textarea").forEach(pvGrow)}
const pvGrow=t=>{t.style.height="auto";const box=t.parentElement,h=box&&box.style.height?box.clientHeight:0;t.style.height=Math.max(t.scrollHeight,h)+"px"};
function pvRefresh(){if(!pv.note||$("pdfv").hidden)return;if(!noteFind(pv.note)){pvClose();return}document.querySelectorAll("#pvBody .pv-page").forEach(pvOverlay)}
const PV_HINT={text:"Touche la page à l'endroit où tu veux écrire. Tu restes en mode Texte jusqu'à ce que tu changes d'outil.",hl:"Fais glisser ton doigt (ou la souris) sur ce que tu veux surligner.",pen:"Écris ou dessine au doigt, au stylet ou à la souris.",erase:"Passe sur un trait, un surlignage ou une zone de texte pour l'effacer.",read:""};
function pvTool(t){if(t==="notes"){const op=$("pvNotes").hidden;$("pvNotes").hidden=!op;document.querySelector('[data-pvt="notes"]').setAttribute("aria-pressed",op);if(op&&matchMedia("(min-width:900px)").matches)$("pvNoteTxt").focus();return}
  pv.tool=t;$("pdfv").dataset.tool=t;document.querySelectorAll("[data-pvt]").forEach(b=>{if(b.dataset.pvt!=="notes")b.setAttribute("aria-pressed",b.dataset.pvt===t)});
  const h=$("pvHint");h.hidden=!PV_HINT[t];h.textContent=L(PV_HINT[t]||"");pvOpts()}
// couleurs et épaisseur du surligneur et du stylo (gardées sur l'appareil)
function pvOpts(){const o=$("pvOpts"),k=pv.tool==="hl"||pv.tool==="pen"?pv.tool:null;o.hidden=!k;if(!k)return;const st=pvPen(k);
  o.innerHTML=`<div class="pv-sw" role="group" aria-label="${L("Couleur")}">${PV_COL[k].map(c=>`<button type="button" data-pvc="${c}" style="--sw:${c}" aria-pressed="${st.c===c}" aria-label="${L("Couleur")} ${c}"></button>`).join("")}</div>
    <label class="pv-size"><span>${L("Épaisseur")}</span><input type="range" id="pvSize" min="1" max="10" step="1" value="${st.s}" aria-label="${L("Épaisseur")}"><i class="pv-dot" style="--d:${Math.round(pvW(k,st.s)*360)}px;--sw:${st.c}${k==="hl"?";opacity:.55":""}"></i></label>`}
$("pvOpts").addEventListener("click",e=>{const b=e.target.closest("[data-pvc]");if(!b)return;const k=pv.tool;if(!PV_COL[k])return;pvPen(k).c=b.dataset.pvc;saveUI();pvOpts()});
$("pvOpts").addEventListener("input",e=>{if(e.target.id!=="pvSize")return;const k=pv.tool;if(!PV_COL[k])return;pvPen(k).s=+e.target.value;saveUI();
  const d=$("pvOpts").querySelector(".pv-dot");if(d)d.style.setProperty("--d",Math.round(pvW(k,+e.target.value)*360)+"px")});
document.querySelector(".pv-tools").addEventListener("click",e=>{const b=e.target.closest("[data-pvt]");if(b)pvTool(b.dataset.pvt)});
$("pvNotesClose").addEventListener("click",()=>pvTool("notes"));
$("pvBack").addEventListener("click",pvClose);
$("pvMore").innerHTML=MORE;
$("pvMore").addEventListener("click",()=>{const n=noteFind(pv.note);if(!n)return;
  openActions(n.title||L("PDF"),[{l:"Ranger dans un dossier",fn:()=>openActions(L("Ranger dans"),nfChoices(noteDirOf(n),null,fid=>{if(fid)n.folder=fid;else delete n.folder;n.upd=Date.now();save();toast(fid?`${L("Rangée dans")} « ${nfOf(fid).name} »`:"Rangée dans Notes")}))},
    {l:"Supprimer ce PDF",danger:true,fn:()=>{const id=n.id;pvClose();undoable("PDF supprimé",[id],()=>{tomb(id);data.notes=NT().filter(x=>x!==n)},{after:renderNotes,later:()=>{if(!noteFind(id))npDropAll(n)}})}}])});
// titre et notes liées au PDF (texte simple, enregistré au fur et à mesure)
$("pvTitle").addEventListener("input",()=>{const n=noteFind(pv.note);if(!n)return;n.title=$("pvTitle").value.slice(0,120);n.upd=Date.now();msSaveSoon()});
$("pvNoteTxt").addEventListener("input",()=>{const n=noteFind(pv.note);if(!n)return;n.body=$("pvNoteTxt").value;n.html=rtFromText(n.body);n.upd=Date.now();msSaveSoon()});
// zones de texte : enregistrées pendant la saisie ; une zone laissée vide disparaît
let pvTxtT=null,pvTxtEl=null;
function pvFlushTxt(){clearTimeout(pvTxtT);const el=pvTxtEl;pvTxtEl=null;if(!el)return;const a=PA().find(x=>x.id===el.closest("[data-ann]").dataset.ann);if(!a)return;
  const v=el.value.slice(0,2000);if(a.txt!==v){a.txt=v;a.upd=Date.now();save()}}
$("pvBody").addEventListener("input",e=>{const ta=e.target.closest(".pv-txt textarea");if(!ta)return;pvGrow(ta);pvTxtEl=ta;clearTimeout(pvTxtT);pvTxtT=setTimeout(pvFlushTxt,500)});
$("pvBody").addEventListener("focusin",e=>{const t=e.target.closest(".pv-txt");if(t)pvSelect(t.dataset.ann)});
$("pvBody").addEventListener("focusout",e=>{const ta=e.target.closest(".pv-txt textarea");if(!ta)return;pvTxtEl=ta;pvFlushTxt();
  if(!ta.value.trim()){const id=ta.closest("[data-ann]").dataset.ann;setTimeout(()=>{if(document.activeElement===ta)return;const a=PA().find(x=>x.id===id);if(a&&!String(a.txt||"").trim()){tomb(id);data.pdfAnns=PA().filter(x=>x!==a);save();pvRefresh()}},150)}});
function pvSelect(id){pv.sel=id||null;document.querySelectorAll("#pvBody .pv-txt").forEach(t=>t.classList.toggle("pv-on",t.dataset.ann===pv.sel))}
function pvDel(id,msg){const a=PA().find(x=>x.id===id);if(!a)return;if(pv.sel===id)pv.sel=null;undoable(msg,[id],()=>{tomb(id);data.pdfAnns=PA().filter(x=>x!==a)},{after:pvRefresh})}
const PV_DELMSG={text:"Texte supprimé",hl:"Surlignage supprimé",ink:"Trait supprimé"};
// les poignées des zones de texte ne prennent pas le focus (sinon la zone se ferme avant le clic)
$("pvBody").addEventListener("mousedown",e=>{if(e.target.closest(".pv-txt-x,.pv-txt-mv,.pv-txt-rs"))e.preventDefault()});
$("pvBody").addEventListener("click",e=>{
  const d=e.target.closest("[data-pvdel]");if(d){pvDel(d.dataset.pvdel,"Texte supprimé");return}
  if(e.target.closest(".pv-txt-mv,.pv-txt-rs"))return;
  if(pv.tool==="read"){const hl=e.target.closest(".pv-hl,path[data-ann]");
    if(hl){const a=PA().find(x=>x.id===hl.dataset.ann);if(!a)return;pv.sel=a.id;openActions(L(a.t==="hl"||a.hl?"Surlignage":"Trait"),[{l:a.t==="hl"||a.hl?"Supprimer le surlignage":"Supprimer le trait",danger:true,fn:()=>pvDel(a.id,PV_DELMSG[a.t==="ink"&&!a.hl?"ink":a.t==="ink"?"hl":a.t])}]);return}
    if(!e.target.closest(".pv-txt"))pvSelect(null);return}
  if(pv.tool!=="text"||e.target.closest(".pv-txt"))return;const ov=e.target.closest(".pv-ov");if(!ov)return;
  const r=ov.getBoundingClientRect(),x=Math.min(.75,Math.max(0,(e.clientX-r.left)/r.width)),y=Math.min(.97,Math.max(0,(e.clientY-r.top)/r.height));
  const a={id:uid(),note:pv.note,page:+ov.dataset.pg,t:"text",x,y,w:Math.min(.45,1-x),txt:"",upd:Date.now()};PA().push(a);save();pv.sel=a.id;pvOverlay(ov.closest(".pv-page"));
  const ta=ov.querySelector(`[data-ann="${a.id}"] textarea`);if(ta)ta.focus()}); // v45 : on reste en mode Texte
// déplacer / redimensionner une zone de texte (poignées ⠿ et coin bas droit)
$("pvBody").addEventListener("pointerdown",e=>{const h=e.target.closest("[data-pvmv],[data-pvrs]");if(!h)return;e.preventDefault();e.stopPropagation();
  const box=h.closest(".pv-txt"),ov=box.closest(".pv-ov"),a=PA().find(x=>x.id===box.dataset.ann);if(!a)return;pvSelect(a.id);
  const r=ov.getBoundingClientRect(),mv=!!h.dataset.pvmv,x0=e.clientX,y0=e.clientY,s={x:a.x,y:a.y,w:a.w||.4,h:a.h||box.offsetHeight/r.height};
  try{h.setPointerCapture(e.pointerId)}catch(_){}
  const move=ev=>{const dx=(ev.clientX-x0)/r.width,dy=(ev.clientY-y0)/r.height;
    if(mv){a.x=Math.min(1-s.w,Math.max(0,s.x+dx));a.y=Math.min(.98,Math.max(0,s.y+dy));box.style.left=pct(a.x);box.style.top=pct(a.y)}
    else{a.w=Math.min(1-a.x,Math.max(.08,s.w+dx));a.h=Math.min(1-a.y,Math.max(.025,s.h+dy));box.style.width=pct(a.w);box.style.height=pct(a.h);pvGrow(box.querySelector("textarea"))}};
  const up=()=>{h.removeEventListener("pointermove",move);h.removeEventListener("pointerup",up);h.removeEventListener("pointercancel",up);a.upd=Date.now();save()};
  h.addEventListener("pointermove",move);h.addEventListener("pointerup",up);h.addEventListener("pointercancel",up)},true);
// stylo, surligneur (trait libre) et gomme : on glisse sur la page (elle ne défile pas pendant ce temps)
const pvPt=(r,ev)=>[Math.min(1,Math.max(0,(ev.clientX-r.left)/r.width)),Math.min(1,Math.max(0,(ev.clientY-r.top)/r.height))];
$("pvBody").addEventListener("pointerdown",e=>{if(!["hl","pen","erase"].includes(pv.tool)||e.target.closest(".pv-txt"))return;const ov=e.target.closest(".pv-ov");if(!ov)return;e.preventDefault();
  const w=ov.closest(".pv-page"),r=ov.getBoundingClientRect(),rat=pvRatio(w);try{ov.setPointerCapture(e.pointerId)}catch(_){}
  if(pv.tool==="erase"){pv.draw={erase:true,ov,r,rat,hit:new Set()};pvErase(e);return}
  const k=pv.tool,st=pvPen(k),svg=ov.querySelector("svg.pv-ink"),el=document.createElementNS("http://www.w3.org/2000/svg","path");
  el.setAttribute("class",k==="hl"?"ink-hl":"ink-pen");el.setAttribute("stroke",st.c);el.setAttribute("stroke-width",(pvW(k,st.s)*1000).toFixed(1));svg.appendChild(el);
  pv.draw={ov,r,rat,el,k,c:st.c,w:pvW(k,st.s),pts:[pvPt(r,e)]};el.setAttribute("d",pvPath(pv.draw.pts,rat))});
function pvErase(ev){const d=pv.draw,[x,y]=pvPt(d.r,ev),pg=+d.ov.dataset.pg,rad=.018;
  for(const a of pvAnns(pv.note,pg)){if(d.hit.has(a.id))continue;let hit=false;
    if(a.t==="ink")hit=(a.pts||[]).some(p=>Math.hypot(p[0]-x,(p[1]-y)*d.rat)<rad+(a.w||0)/2);
    else if(a.t==="hl")hit=x>=a.x-rad&&x<=a.x+a.w+rad&&y>=a.y-rad&&y<=a.y+a.h+rad;
    else if(a.t==="text"){const el=d.ov.querySelector(`.pv-txt[data-ann="${a.id}"]`),hh=el?el.offsetHeight/d.r.height:(a.h||.04);hit=x>=a.x&&x<=a.x+(a.w||.4)&&y>=a.y&&y<=a.y+hh}
    if(hit){d.hit.add(a.id);d.ov.querySelectorAll(`[data-ann="${a.id}"]`).forEach(el=>el.classList.add("pv-gone"))}}}
$("pvBody").addEventListener("pointermove",e=>{const d=pv.draw;if(!d)return;if(d.erase){pvErase(e);return}
  const p=pvPt(d.r,e),l=d.pts[d.pts.length-1];if(Math.hypot(p[0]-l[0],(p[1]-l[1])*d.rat)<.003)return;d.pts.push(p);d.el.setAttribute("d",pvPath(d.pts,d.rat))});
const pvDrawEnd=()=>{const d=pv.draw;if(!d)return;pv.draw=null;
  if(d.erase){const ids=[...d.hit];if(!ids.length)return;const gone=PA().filter(a=>ids.includes(a.id));
    undoable(ids.length>1?"Éléments effacés":"Élément effacé",ids,()=>{ids.forEach(tomb);data.pdfAnns=PA().filter(a=>!gone.includes(a))},{after:pvRefresh});return}
  d.el.remove();if(d.pts.length>1200)d.pts=d.pts.filter((_,i)=>i%2===0);
  const r4=v=>Math.round(v*10000)/10000;
  PA().push({id:uid(),note:pv.note,page:+d.ov.dataset.pg,t:"ink",hl:d.k==="hl",c:d.c,w:r4(d.w),pts:d.pts.map(p=>[r4(p[0]),r4(p[1])]),upd:Date.now()});save();pvOverlay(d.ov.closest(".pv-page"))};
$("pvBody").addEventListener("pointerup",pvDrawEnd);$("pvBody").addEventListener("pointercancel",pvDrawEnd);
// clavier : Échap ferme ; Suppr / Retour arrière efface la zone de texte sélectionnée (vide ou pas en cours d'écriture)
addEventListener("keydown",e=>{if($("pdfv").hidden||!$("actSheet").hidden)return;
  if(e.key==="Escape"&&!e.target.closest(".pv-txt")){pvClose();return}
  if((e.key==="Delete"||e.key==="Backspace")&&pv.sel){const ta=e.target.closest&&e.target.closest(".pv-txt textarea");
    if(ta&&ta.value)return;e.preventDefault();const id=pv.sel,a=PA().find(x=>x.id===id);if(!a)return;if(ta)ta.blur();pvDel(id,PV_DELMSG[a.t==="ink"&&a.hl?"hl":a.t])}});
$("notePhotos").addEventListener("click",async e=>{const b=e.target.closest("[data-np]");if(!b)return;const u=await npGet(b.dataset.np);if(!u)return;
  lbCur=b.dataset.np;$("lbImg").src=u;$("lightbox").hidden=false;const d=$("lbDel");d.classList.remove("armed");d.textContent=L("Supprimer la photo")});
$("lbClose").addEventListener("click",()=>{$("lightbox").hidden=true;lbCur=null});
$("lightbox").addEventListener("click",e=>{if(e.target.id==="lightbox"){$("lightbox").hidden=true;lbCur=null}});
$("lbDel").addEventListener("click",e=>{const b=e.currentTarget,n=noteFind(noteOpenId);if(!n||!lbCur)return;
  if(!b.classList.contains("armed")){b.classList.add("armed");b.textContent=L("Confirmer la suppression");return}
  const id=lbCur;n.photos=(n.photos||[]).filter(p=>p.id!==id);n.upd=Date.now();save();idb.del(npKey(id));npCache.delete(id);stor("DELETE","documents/"+npPath(id)).catch(()=>{});
  $("lightbox").hidden=true;lbCur=null;renderNotePhotos(n);toast("Photo supprimée")});
const npDropAll=n=>{(n&&n.photos||[]).forEach(p=>{idb.del(npKey(p.id));npCache.delete(p.id);stor("DELETE","documents/"+npPath(p.id)).catch(()=>{})});
  if(n&&n.pdf){idb.del(pdfKey(n.id));stor("DELETE","documents/"+pdfPath(n.id)).catch(()=>{});(data.pdfAnns||[]).filter(a=>a.note===n.id).forEach(a=>tomb(a.id));data.pdfAnns=(data.pdfAnns||[]).filter(a=>a.note!==n.id);save()}};
async function nsLoad(){
  if(!nsKey)return;const k=nsKey,m=new Map();
  for(const n of NT()){if(!n.secret||n.vid!==nsVid)continue;const o=nsPlain.get(n.id);
    if(o&&o._iv===n.iv){m.set(n.id,o);continue}
    try{m.set(n.id,{...await decJ(k,n),_iv:n.iv})}catch(e){}}
  if(k===nsKey)nsPlain=m;
}
async function nsTry(code){
  try{const v=data.noteVault,key=await vOpen(v,code,"notes");nsKey=key;nsVid=v.id;await nsLoad();return true}
  catch(e){return false}
}
// ouvre les notes secrètes : crée le code la première fois, sinon le demande
async function nsUnlock(){
  if(nsKey)return true;
  if(!nsOn()){
    const code=await askPin({mode:"new",head:"Notes secrètes",sub:"Choisis le code de tes notes secrètes (5 chiffres). Il les ouvre sur cet appareil."});
    if(!code)return false;
    const mk=await mkNeed();if(!mk)return false;
    const n=await v2Make(mk,"sidnote-notes");data.noteVault=n.v;await mkWrap("notes",code,mk);
    nsKey=n.key;nsVid=n.v.id;nsPlain=new Map();save();toast("Code enregistré");return true}
  const v=data.noteVault;
  if(isV2(v)&&!mkHas("notes")){const code=await devSetup("notes","Notes secrètes");return !!code&&await nsTry(code)}
  let code=await askPin({mode:"unlock",ctx:"notes",head:"Notes secrètes",sub:"Entre le code de tes notes secrètes.",verify:nsTry,forgot:nsReset,rec:isV2(v)?null:v.rec,phrase:isV2(v)});
  if(code==="forgot"){code=await devSetup("notes","Notes secrètes",true);if(code&&!(await nsTry(code)))code=null}
  if(code&&nsKey&&!isV2(v)){const nk=await v2Upgrade("notes",code,nsKey);if(nk){nsKey=nk;nsVid=data.noteVault.id;await nsLoad()}}
  return !!code&&!!nsKey;
}
function nsLock(){
  if(notePend&&noteOpenId){const n=noteFind(noteOpenId);if(n&&n.secret)noteFlush()} // la dernière frappe est enregistrée (clé déjà capturée)
  nsKey=null;nsVid=null;nsPlain=new Map();renderNotes();
}
function nsReset(){
  NT().filter(n=>n.secret).forEach(n=>tomb(n.id));data.notes=NT().filter(n=>!n.secret);data.noteVault=null;
  nsKey=null;nsVid=null;nsPlain=new Map();save();renderNotes();toast("Notes secrètes effacées");
}


/* ---------- fenêtre de code à 5 chiffres (réutilisable) ---------- */
// askPin({mode:"new"}) → code choisi et confirmé ; askPin({mode:"unlock", verify}) → code vérifié ; null si annulé
let ps=null;
// v29 : dans Documents, le clavier s'affiche dans la page (comme pour les mots de passe), pas dans une fenêtre
const PS_PIN=document.querySelector("#pinSheet .pin");
function askPin(o){return new Promise(res=>{
  if(ps)psEnd(null);
  const host=data.ui.view==="docs"&&$("docPinHost");
  ps={...o,step:o.mode,buf:"",first:"",fails:0,wait:0,busy:false,resolve:res,host:host||null};
  if(!$("psPad").children.length)$("psPad").innerHTML=[1,2,3,4,5,6,7,8,9].map(d=>`<button type="button" data-ps="${d}">${d}</button>`).join("")+
    `<button type="button" class="blank" tabindex="-1" aria-hidden="true"></button><button type="button" data-ps="0">0</button><button type="button" class="del" data-ps="del">${L("Effacer")}</button>`;
  $("psErr").textContent="";psRender();
  if(host){host.appendChild(PS_PIN);host.hidden=false;$("docLocked").hidden=true}else $("pinSheet").hidden=false})}
function psRender(){
  if(!ps)return;
  const T={new:["Choisis ton code",ps.sub],confirm:["Confirme ton code","Tape à nouveau les 5 chiffres."],unlock:["Entre ton code",ps.sub]}[ps.step];
  $("psHead").textContent=L(ps.head||"Code");$("psTitle").textContent=L(T[0]);$("psSub").textContent=L(T[1]||"");
  $("psForgot").hidden=!(ps.step==="unlock"&&(ps.forgot||ps.rec||ps.phrase));
  $("psBio").hidden=!(ps.step==="unlock"&&ps.ctx&&bioHas(ps.ctx));$("psBio").textContent=bioUse();
  if(ps.step==="unlock"&&ps.ctx&&!ps.autoDone){ps.autoDone=true;bioAuto(ps.ctx,()=>$("psBio").click())}
  [...$("psDots").children].forEach((d,i)=>d.classList.toggle("on",i<ps.buf.length));
}
function psFail(msg){const d=$("psDots");$("psErr").textContent=L(msg);d.classList.remove("shake");void d.offsetWidth;d.classList.add("shake");if(navigator.vibrate)navigator.vibrate(60);ps.buf="";psRender()}
function psEnd(v){if(!ps)return;const r=ps.resolve,host=ps.host;ps=null;$("pinSheet").hidden=true;
  if(host){host.hidden=true;$("pinSheet").querySelector(".sheet").appendChild(PS_PIN);renderDocLock()}const f=$("psForgot");delete f.dataset.armed;f.textContent=L("Code oublié ?");r(v)}
async function psDone(){
  const code=ps.buf;
  if(ps.step==="new"){ps.first=code;ps.buf="";ps.step="confirm";$("psErr").textContent="";psRender();return}
  if(ps.step==="confirm"){if(code!==ps.first){ps.first="";ps.step="new";psFail("Les deux codes ne sont pas identiques. Recommence.");return}psEnd(code);return}
  if(Date.now()<ps.wait){psFail("Trop d'essais. Attends 30 secondes.");return}
  ps.busy=true;$("psErr").textContent="";const ok=await ps.verify(code);if(!ps)return;ps.busy=false;
  if(ok){const cx=ps.ctx;psEnd(code);if(cx)bioOffer(cx,code);return}
  ps.fails++;if(ps.fails>=5){ps.fails=0;ps.wait=Date.now()+30000;psFail("Trop d'essais. Attends 30 secondes.")}else psFail("Code incorrect.");
}
function psPress(k){
  if(!ps||ps.busy)return;
  if(k==="del"){ps.buf=ps.buf.slice(0,-1);psRender();return}
  if(ps.buf.length>=PIN_LEN)return;ps.buf+=k;psRender();if(ps.buf.length===PIN_LEN)setTimeout(psDone,120);
}
padTap($("psPad"),"ps",psPress);
$("psClose").addEventListener("click",()=>psEnd(null));
$("pinSheet").addEventListener("click",e=>{if(e.target.id==="pinSheet")psEnd(null)});
document.addEventListener("keydown",e=>{if(!ps||(!ps.host&&$("pinSheet").hidden))return;if(/^[0-9]$/.test(e.key))psPress(e.key);else if(e.key==="Backspace")psPress("del");else if(e.key==="Escape")psEnd(null)});
$("psForgot").addEventListener("click",async e=>{const b=e.currentTarget;if(!ps)return;
  if(ps.phrase){psEnd("forgot");return} // coffre renforcé : on rouvre avec la phrase secrète (devSetup)
  if(ps.rec){const cur=ps,code=await recRecover({rec:cur.rec});if(code&&ps===cur&&await cur.verify(code))psEnd(code);return}
  if(!b.dataset.armed){b.dataset.armed="1";b.textContent=L(ps.forgotText||"La récupération n'était pas activée. Effacer toutes les notes secrètes et choisir un nouveau code ? Touche encore pour confirmer.");return}
  const f=ps.forgot;psEnd(null);f()});

/* ---------- v38 : connecteur Claude (fonction Edge « mcp ») ---------- */
// v45.2 : adresse sur le domaine de l'app (sidcompagnon.com/mcp/<clé>, relayée par Vercel vers la fonction Supabase, voir vercel.json) :
// Claude affiche l'icône du site de l'adresse. Les anciennes adresses …supabase.co/functions/v1/mcp/<clé> marchent toujours.
const MCP_BASE="https://sidcompagnon.com/mcp/";
// Une adresse secrète par personne : …/functions/v1/mcp/<clé>. Seule l'empreinte SHA-256 de la clé est gardée (table mcp_tokens) ;
// la clé n'est montrée qu'une fois. Retirer une adresse coupe aussitôt l'accès de Claude.
let mcpRows=[];
const hex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("");
async function mcpLoad(){const sec=$("mcpSec");if(!sec)return;sec.hidden=!session||isTrial();if(sec.hidden)return;
  try{mcpRows=await api("/rest/v1/mcp_tokens?select=hash,label,created_at,last_used&order=created_at",{token:await token()})||[]}catch(e){mcpRows=[]}
  const d=v=>v?new Date(v).toLocaleDateString(LANG==="fr"?"fr-BE":LANG==="nl"?"nl-BE":"en-GB",{day:"numeric",month:"short",year:"numeric"}):"";
  $("mcpList").innerHTML=mcpRows.map(r=>`<div class="row mcp-it"><div class="grow"><b>${esc(L("Adresse du"))} ${esc(d(r.created_at))}</b><span class="small muted">${r.last_used?`${esc(L("Utilisée le"))} ${esc(d(r.last_used))}`:esc(L("Pas encore utilisée"))}</span></div><button type="button" class="mini" data-mcpdel="${esc(r.hash)}">${esc(L("Retirer"))}</button></div>`).join("");
  $("mcpNew").textContent=L(mcpRows.length?"Créer une nouvelle adresse":"Créer mon adresse pour Claude")}
// nouvelle adresse secrète : seule son empreinte part sur le serveur ; renvoie {url, hash}
async function mcpCreate(label){const key=b64e(crypto.getRandomValues(new Uint8Array(32))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
  const hash=hex(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(key)));
  await api("/rest/v1/mcp_tokens",{method:"POST",token:await token(),headers:{Prefer:"return=minimal"},body:{hash,user_id:session.user.id,label:String(label||"IA").slice(0,40)}});
  return {url:MCP_BASE+key,hash}}
$("mcpNew").addEventListener("click",async e=>{const b=e.currentTarget;if(b.disabled)return;b.disabled=true;
  try{const r=await mcpCreate("Claude");$("mcpUrl").textContent=r.url;$("mcpOut").hidden=false;await mcpLoad()}
  catch(ex){toast(ex instanceof TypeError?"Pas de connexion internet":"Création impossible pour l'instant")}
  b.disabled=false});
$("mcpCopy").addEventListener("click",async()=>{toast(await copyTxt($("mcpUrl").textContent)?"Adresse copiée":"Copie impossible : sélectionne-la et copie-la")});
$("mcpList").addEventListener("click",async e=>{const b=e.target.closest("[data-mcpdel]");if(!b)return;
  if(!b.dataset.armed){b.dataset.armed="1";b.textContent=L("Confirmer");return}
  try{await api("/rest/v1/mcp_tokens?hash=eq."+b.dataset.mcpdel,{method:"DELETE",token:await token()});toast("Adresse retirée : Claude n'a plus accès");$("mcpOut").hidden=true;mcpLoad()}
  catch(ex){toast("Impossible pour l'instant")}});
$("mcpSec").addEventListener("toggle",e=>{if(e.currentTarget.open)mcpLoad()});

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
  const st=$("aiState");if(st){st.classList.toggle("on",ok);st.innerHTML=ok?`<span class="ai-dot"></span><b>${L("Claude est branché")}</b>`:`<span class="ai-dot"></span><b>${L("Claude n'est pas branché")}</b>`}
  const mb=$("aiMain");if(mb)mb.textContent=L(ok?"Tester la connexion":"Brancher Claude");
  const c=$("nuAiCard");if(!c)return;c.hidden=isTrial()||ok; // v43 : Claude branché → la carte cède la place à « Ajouter ce que tu manges » (en haut)
  const lk=$("nuAiLink");if(lk){lk.hidden=!ok||isTrial();if(ok)lk.href=convUrl("nutri")||ai.ask(T3("J'ai mangé : ","I ate: ","Ik heb gegeten: "))}renderConv();
  c.innerHTML=ok?`<div class="grow"><b>${IC("sparkle")||""} ${L("Claude calcule pour toi")}</b><div class="small muted">${L("Dis-lui ce que tu as mangé ou envoie-lui la photo de ton assiette : tout arrive ici.")}</div></div><a class="btn" href="${ai.ask(T3("J'ai mangé : ","I ate: ","Ik heb gegeten: "))}" target="_blank" rel="noopener">${L("Ouvrir")} ${esc(ai.name)}</a>`
    :`<div class="grow"><b>${L("Branche Claude")}</b><div class="small muted">${L("Calories, menus et bilans sont calculés par Claude, même avec la version gratuite. 2 minutes, une seule fois.")}</div></div><button type="button" class="btn" data-aiwiz="1">${L("Brancher")}</button>`}

/* ---------- v38 : Face ID / Touch ID (WebAuthn + extension PRF) ---------- */
// Une clé d'accès (passkey) propre à Sid'note donne, après Face ID, un secret (PRF) qui chiffre le code à 5 chiffres sur cet appareil.
// Rien ne part sur le serveur : localStorage « sidnote-bio-<uid> » = {cred, salt, main?, notes?} (main = mots de passe + documents).
// Face ID ne fait que retrouver le code : tout le reste (phrase secrète, coffres) ne change pas, et le code marche toujours.
const bioLsKey=()=>"sidnote-bio-"+session.user.id;
const bioStore=()=>session&&ls.get(bioLsKey())||null;
// v39 : seulement si l'appareil a vraiment Face ID / Touch ID (capteur de l'appareil, pas une clé USB)
let bioPlat=false;try{PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable().then(v=>{bioPlat=!!v;try{renderBio()}catch(e){}}).catch(()=>{})}catch(e){}
const bioOk=()=>!!(window.PublicKeyCredential&&navigator.credentials&&window.isSecureContext&&session&&!isTrial()&&bioPlat);
const bioHas=ctx=>{const s=bioStore();return !!(s&&s[ctx])};
const bioName=()=>/iPhone|iPad|Macintosh/.test(navigator.userAgent)?"Face ID":L("l'empreinte");
const bioUse=()=>`${L("Utiliser")} ${bioName()}`;
async function bioKey(first){const hk=await crypto.subtle.importKey("raw",first,"HKDF",false,["deriveKey"]);
  return crypto.subtle.deriveKey({name:"HKDF",hash:"SHA-256",salt:new Uint8Array(0),info:new TextEncoder().encode("sidnote-bio")},hk,{name:"AES-GCM",length:256},false,["encrypt","decrypt"])}
// Face ID → clé tirée du secret de la passkey
async function bioPrf(s){
  const r=await navigator.credentials.get({publicKey:{challenge:crypto.getRandomValues(new Uint8Array(32)),rpId:location.hostname,timeout:60000,userVerification:"required",
    allowCredentials:[{type:"public-key",id:b64d(s.cred)}],extensions:{prf:{eval:{first:b64d(s.salt)}}}}});
  const p=r.getClientExtensionResults().prf,first=p&&p.results&&p.results.first;if(!first)throw new Error("noprf");return bioKey(first)}
// code retrouvé par Face ID (null si annulé ou impossible)
// v39 : erreurs Face ID relevées (table client_errors) pour comprendre ce qui bloque sur un iPhone donné
const bioErr=(where,e)=>{try{reportErr(`bio ${where}: ${e&&e.name||""} ${e&&e.message||e}`.slice(0,400),"")}catch(x){}};
const bioMsg=e=>e&&e.name==="NotAllowedError"?"Face ID annulé":e&&e.message==="noprf"?"Ton appareil ne permet pas le déverrouillage biométrique ici (iOS 18 ou plus, ou un Android récent)":`${L("Face ID indisponible")} (${e&&e.name||"?"})`;
async function bioCode(ctx){const s=bioStore();if(!s||!s[ctx])return null;try{return (await decJ(await bioPrf(s),s[ctx])).c}catch(e){if(!(e&&e.name==="NotAllowedError"))bioErr("get",e);return null}}
function bioDrop(ctx){const s=bioStore();if(!s)return;delete s[ctx];if(!s.main&&!s.notes)ls.del(bioLsKey());else ls.set(bioLsKey(),s);renderBio()}
// le code qui ouvre chaque coffre de cet appareil (vérifié avant d'être gardé)
const bioCtxs=()=>[...((vaultOn()||(data.docVault&&data.docVault.chk))?["main"]:[]),...(nsOn()?["notes"]:[])];
async function bioCheck(ctx,code){try{const v=ctx==="notes"?data.noteVault:(vaultOn()?data.vault:data.docVault);await vOpen(v,code,ctx);return true}catch(e){return false}}
// ajoute un coffre à Face ID quand la passkey existe déjà (un seul Face ID) ; sinon activation complète
async function bioAdd(ctx,code){const s=bioStore();
  if(!(s&&s.cred))return bioEnable({[ctx]:code});
  try{s[ctx]=await encJ(await bioPrf(s),{c:code});ls.set(bioLsKey(),s);renderBio();toast(`${bioName()} ${L("est activé")}`)}catch(e){bioErr("add",e);toast(bioMsg(e))}}
// v39 : proposé tout seul juste après avoir tapé (ou choisi) le bon code, une fois ; « Plus tard » → reproposé dans 30 jours
let bioOffered=new Set();
let bioDiagSent=false;
function bioOffer(ctx,code){
  // v41 : si Face ID n'est pas proposé alors qu'on vient de taper le bon code, on envoie la raison (pour comprendre sur l'iPhone de Sid)
  if(!bioOk()&&session&&!isTrial()&&!bioDiagSent){bioDiagSent=true;bioErr("diag",{name:"pas proposé",message:`pkc=${!!window.PublicKeyCredential} plat=${bioPlat} secure=${!!window.isSecureContext} standalone=${typeof standalone==="function"?standalone():"?"}`})}
  if(!bioOk()||!code||bioHas(ctx)||bioOffered.has(ctx))return;
  const no=ls.get("sidnote-bio-no-"+session.user.id)||0;if(Date.now()-no<30*864e5)return;bioOffered.add(ctx);
  setTimeout(()=>openActions(`${L("Ouvrir avec")} ${bioName()} ?`,[{l:`${L("Activer")} ${bioName()}`,fn:()=>bioAdd(ctx,code)},{l:"Plus tard",fn:()=>ls.set("sidnote-bio-no-"+session.user.id,Date.now())}]),350)}
// v39 : en arrivant sur un coffre verrouillé, Face ID se lance tout seul (pendant le toucher : Safari l'exige)
const bioAutoAt={};
function bioAuto(ctx,go){if(!bioHas(ctx)||Date.now()-(bioAutoAt[ctx]||0)<4000)return;bioAutoAt[ctx]=Date.now();go()}
async function bioEnable(pre){
  if(!bioOk())return toast("Ce navigateur ne permet pas Face ID");
  const ctxs=pre?Object.keys(pre):bioCtxs();if(!ctxs.length)return toast("Choisis d'abord un code (Mots de passe ou Documents)");
  // 1) la passkey (tout de suite, pendant le toucher : Safari l'exige)
  let cred,first;const salt=crypto.getRandomValues(new Uint8Array(32));
  const opts=ev=>({publicKey:{challenge:crypto.getRandomValues(new Uint8Array(32)),rp:{name:"Sid'note",id:location.hostname},
      user:{id:crypto.getRandomValues(new Uint8Array(16)),name:accEmail()||"Sid'note",displayName:"Sid'note"},pubKeyCredParams:[{type:"public-key",alg:-7},{type:"public-key",alg:-257}],
      authenticatorSelection:{authenticatorAttachment:"platform",residentKey:"preferred",userVerification:"required"},timeout:60000,attestation:"none",extensions:{prf:ev?{eval:{first:salt}}:{}}}});
  try{let c;try{c=await navigator.credentials.create(opts(true))}catch(e){if(e&&e.name==="NotAllowedError")throw e;bioErr("create-eval",e);c=await navigator.credentials.create(opts(false))}
    const p=c.getClientExtensionResults().prf||{};if(!p.enabled&&!(p.results&&p.results.first))throw new Error("noprf");
    cred=b64e(c.rawId);first=p.results&&p.results.first}
  catch(e){if(!(e&&e.name==="NotAllowedError"))bioErr("create",e);toast(bioMsg(e));return}
  const s={cred,salt:b64e(salt)};
  // 2) les codes de cet appareil (déjà connus quand Face ID est proposé juste après le code)
  const codes={...(pre||{})};
  for(const ctx of pre?[]:ctxs){const isN=ctx==="notes";
    if(isV2(isN?data.noteVault:(vaultOn()?data.vault:data.docVault))&&!mkHas(ctx))continue; // coffre pas encore ouvert sur cet appareil
    const code=await askPin({mode:"unlock",head:bioName(),sub:isN?"Entre le code de tes notes secrètes.":"Entre ton code (mots de passe et documents).",verify:c=>bioCheck(ctx,c)});
    if(code)codes[ctx]=code}
  if(!Object.keys(codes).length)return toast("Face ID n'a pas été activé");
  // 3) chiffrés avec le secret de la passkey (si l'appareil ne l'a pas donné à la création, on le redemande par Face ID)
  const fin=async k=>{for(const ctx in codes)s[ctx]=await encJ(k,{c:codes[ctx]});ls.set(bioLsKey(),s);renderBio();toast(`${bioName()} ${L("est activé")}`)};
  if(first)return fin(await bioKey(first));
  openActions(bioName(),[{l:`${L("Confirmer avec")} ${bioName()}`,fn:async()=>{try{await fin(await bioPrf(s))}catch(e){if(!(e&&e.name==="NotAllowedError"))bioErr("confirm",e);toast(bioMsg(e))}}}]);
}
function renderBio(){const c=$("bioCard");if(!c)return;const on=bioOk()&&bioCtxs().length>0;c.hidden=!on;if(!on)return;
  const s=bioStore(),act=!!(s&&(s.main||s.notes));$("bioT").textContent=bioName();$("bioBtn").textContent=L(act?"Désactiver":"Activer");
  $("bioS").textContent=L(act?"Activé sur cet appareil : touche le bouton sous le clavier du code pour ouvrir tes coffres. Le code marche toujours.":"Ouvre tes mots de passe, documents et notes secrètes sans taper ton code. Le code reste toujours possible. Propre à cet appareil.")}
$("bioBtn").addEventListener("click",()=>{if(bioHas("main")||bioHas("notes")){ls.del(bioLsKey());renderBio();toast(`${bioName()} ${L("est désactivé")}`)}else bioEnable()});
// bouton sous le clavier de la fenêtre de code (documents, notes secrètes)
$("psBio").addEventListener("click",async()=>{const cur=ps;if(!cur||!cur.ctx||cur.busy)return;
  const code=await bioCode(cur.ctx);if(!code||ps!==cur)return;
  cur.busy=true;const ok=await cur.verify(code);if(ps!==cur)return;cur.busy=false;
  if(ok){psEnd(code);return}bioDrop(cur.ctx);psFail("Ton code a changé : tape-le, puis réactive Face ID dans Réglages.")});

/* ---------- mots de passe (coffre chiffré par un code à 5 chiffres) ---------- */
// Le code ne quitte jamais l'appareil : il sert à fabriquer une clé (PBKDF2) qui chiffre chaque entrée (AES-GCM).
// Le serveur ne reçoit que du texte chiffré. Sans le code, impossible de relire les mots de passe.
const PIN_LEN=5,PIN_ITER=600000;
const PW=()=>data.pwds||(data.pwds=[]);
let vaultVid=null,vaultKey=null,vaultItems=new Map(),pinStep="",pinBuf="",pinFirst="",pinBusy=false,pwQ="",pwShown=new Set(),pwEditId=null,pinFails=0,pinWait=0;
const b64e=u=>{let s="";const a=new Uint8Array(u);for(let i=0;i<a.length;i++)s+=String.fromCharCode(a[i]);return btoa(s)};
const b64d=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
async function pinKey(pin,salt,iter){
  const base=await crypto.subtle.importKey("raw",new TextEncoder().encode(pin),"PBKDF2",false,["deriveKey"]);
  return crypto.subtle.deriveKey({name:"PBKDF2",salt:b64d(salt),iterations:iter,hash:"SHA-256"},base,{name:"AES-GCM",length:256},false,["encrypt","decrypt"]);
}
async function encJ(key,obj){const iv=crypto.getRandomValues(new Uint8Array(12));
  const ct=await crypto.subtle.encrypt({name:"AES-GCM",iv},key,new TextEncoder().encode(JSON.stringify(obj)));return{iv:b64e(iv),ct:b64e(ct)}}
async function decJ(key,e){const pt=await crypto.subtle.decrypt({name:"AES-GCM",iv:b64d(e.iv)},key,b64d(e.ct));return JSON.parse(new TextDecoder().decode(pt))}
const vaultOn=()=>!!(data.vault&&data.vault.chk);

/* ---------- v32 : coffre renforcé (phrase secrète + code de l'appareil) ---------- */
// Avant : la clé venait du code à 5 chiffres seul (100 000 possibilités, faciles à essayer avec les données du serveur).
// Maintenant : la vraie clé vient d'une phrase secrète (10 caractères ou plus) qui ne quitte jamais l'appareil.
// - data.phx = {id, salt, iter, chk, at, rec?} : de quoi vérifier la phrase ; clé maître MK = PBKDF2(phrase, salt).
// - coffre v2 = {id, v:2, wk, chk, at, uni?} : clé aléatoire VK, rangée chiffrée par MK (wk) ; les éléments sont chiffrés avec VK.
// - sur chaque appareil, MK est gardée chiffrée par le code à 5 chiffres (localStorage « sidnote-mk-<uid> »),
//   une entrée par usage : main = mots de passe + documents, notes = notes secrètes.
// Le code ne sert donc qu'à déverrouiller sur l'appareil : sans l'appareil, le deviner ne sert à rien.
// Nouvel appareil ou code oublié : on entre la phrase (ou le mot de passe du compte si la récupération est activée), puis on choisit le code.
// Les anciens coffres (code seul) passent au nouveau format au déverrouillage (v2Upgrade), sans perte.
const PH_MIN=10;
let phMem=null; // clé maître en mémoire le temps que l'app est ouverte (effacée dès qu'on la quitte)
const isV2=v=>!!(v&&v.v===2&&v.wk);
const phOn=()=>!!(data.phx&&data.phx.chk);
const rnd=n=>b64e(crypto.getRandomValues(new Uint8Array(n)));
const rawKey=raw=>crypto.subtle.importKey("raw",b64d(raw),"AES-GCM",false,["encrypt","decrypt"]);
const mkLsKey=()=>"sidnote-mk-"+session.user.id;
const mkStore=()=>{const s=ls.get(mkLsKey());return s&&data.phx&&s.phx===data.phx.id?s:{}};
const mkHas=ctx=>!!mkStore()[ctx];
const ctxOf=v=>v&&data.noteVault&&v.id===data.noteVault.id?"notes":"main";
async function phDerive(ph,salt,iter){
  const base=await crypto.subtle.importKey("raw",new TextEncoder().encode(String(ph).normalize("NFC")),"PBKDF2",false,["deriveBits"]);
  const raw=b64e(await crypto.subtle.deriveBits({name:"PBKDF2",salt:b64d(salt),iterations:iter||PIN_ITER,hash:"SHA-256"},base,256));
  return {raw,key:await rawKey(raw)}}
async function phCheck(ph){const x=data.phx,mk=await phDerive(ph,x.salt,x.iter);await decJ(mk.key,x.chk);return mk} // erreur si la phrase est fausse
async function mkWrap(ctx,code,mk){const s=mkStore(),salt=rnd(16);s.phx=data.phx.id;s[ctx]={salt,...await encJ(await pinKey(code,salt,PIN_ITER),{k:mk.raw})};ls.set(mkLsKey(),s);
  if(bioHas(ctx))bioDrop(ctx);bioOffer(ctx,code)} // nouveau code sur cet appareil : Face ID est (re)proposé avec ce code
async function mkUnwrap(ctx,code){const w=mkStore()[ctx];if(!w)throw new Error("nodev");const raw=(await decJ(await pinKey(code,w.salt,PIN_ITER),w)).k;return {raw,key:await rawKey(raw)}}
async function v2Make(mk,ok,extra){const raw=rnd(32),key=await rawKey(raw),now=Date.now();
  return {v:{id:uid(),v:2,wk:await encJ(mk.key,{k:raw}),chk:await encJ(key,{ok}),createdAt:new Date(now).toISOString(),at:now,...(extra||{})},key}}
async function v2Key(v,mk){const key=await rawKey((await decJ(mk.key,v.wk)).k);await decJ(key,v.chk);return key}
// clé d'un coffre à partir du code tapé ; erreur si le code est faux (ou si cet appareil n'a pas encore la phrase)
async function vOpen(v,code,ctx){
  if(!isV2(v)){const k=await pinKey(code,v.salt,v.iter||PIN_ITER);await decJ(k,v.chk);return k}
  const mk=await mkUnwrap(ctx||ctxOf(v),code),k=await v2Key(v,mk);phMem=mk;setTimeout(phPwOffer,1500);return k}
document.addEventListener("visibilitychange",()=>{if(document.hidden)phMem=null});

// fenêtre de la phrase secrète : mode "new" (choisir, deux fois) ou "enter" ; renvoie {mk, ph} ou null
let phRes=null,phMode="enter",phOpt={};
function askPhrase(o){return new Promise(res=>{
  if(phRes)phEnd(null);
  phRes=res;phOpt=o;delete $("phForgot").dataset.armed;$("phForgot").textContent=L("Phrase oubliée ?");phMode=o.mode==="new"&&!phOn()?"new":"enter";const nw=phMode==="new";
  $("phTitle").textContent=L(o.title||(nw?"Ta phrase secrète":"Phrase secrète"));
  $("phText").textContent=L(o.text||(nw?"Choisis une phrase d'au moins 10 caractères, facile à retenir pour toi (par exemple trois mots et un chiffre). C'est elle qui protège vraiment tes coffres : elle ne quitte jamais ton appareil, même le serveur ne la connaît pas.":"Entre ta phrase secrète."));
  $("ph2Wrap").hidden=!nw;["phIn","ph2In"].forEach(i=>{$(i).value="";$(i).type="password"});$("phErr").hidden=true;
  $("phLater").textContent=L(o.later||"Annuler");$("phOk").disabled=false;$("phOk").textContent=L("Valider");
  $("phForgot").hidden=nw;$("phSheet").hidden=false;setTimeout(()=>$("phIn").focus(),80)})}
function phEnd(v){$("phSheet").hidden=true;["phIn","ph2In"].forEach(i=>$(i).value="");const r=phRes;phRes=null;if(r)r(v)}
const phFail=m=>{$("phErr").textContent=L(m);$("phErr").hidden=false;$("phOk").disabled=false;$("phOk").textContent=L("Valider")};
$("phForm").addEventListener("submit",async e=>{e.preventDefault();if(!phRes)return;const ph=$("phIn").value;
  if(phMode==="new"){
    if(ph.trim().length<PH_MIN)return phFail("La phrase doit faire au moins 10 caractères.");
    if(/^\d+$/.test(ph.trim()))return phFail("Pas seulement des chiffres : ajoute des mots.");
    if(ph!==$("ph2In").value)return phFail("Les deux phrases ne sont pas identiques.");
  }else if(!ph)return;
  $("phOk").disabled=true;$("phOk").textContent=L("Vérification…");
  try{
    if(phMode==="new"){
      // une phrase a peut-être déjà été choisie sur un autre appareil : on vérifie avant d'en créer une
      try{await pull()}catch(x){}
      if(phOn()){phMode="enter";$("ph2Wrap").hidden=true;$("phForgot").hidden=false;$("phIn").value="";$("ph2In").value="";
        return phFail("Une phrase secrète a déjà été choisie sur un autre appareil : entre-la.")}
      const salt=rnd(16),now=Date.now(),mk=await phDerive(ph,salt,PIN_ITER);
      data.phx={id:uid(),salt,iter:PIN_ITER,chk:await encJ(mk.key,{ok:"sidnote-phrase"}),createdAt:new Date(now).toISOString(),at:now};save();
      phMem=mk;phEnd({mk,ph,created:true});return}
    const mk=await phCheck(ph);phMem=mk;phEnd({mk,ph});
  }catch(ex){phFail(phMode==="new"?"Ce navigateur ne permet pas de chiffrer les données.":"Phrase incorrecte.")}});
["phIn","ph2In"].forEach(i=>$(i).addEventListener("input",()=>{$("phErr").hidden=true}));
$("phLater").addEventListener("click",()=>phEnd(null));$("phClose").addEventListener("click",()=>phEnd(null));
$("phForgot").addEventListener("click",async()=>{if(!phRes||!phOn())return;const x=data.phx;
  if(!x.rec){const b=$("phForgot");
    if(!b.dataset.armed){b.dataset.armed="1";phFail("La récupération par le mot de passe du compte n'était pas activée : sans ta phrase, tes coffres ne peuvent pas être rouverts.");
      b.textContent=L("Tout effacer et recommencer ? Touche encore pour confirmer");return}
    phEnd(null);vaultsReset();return}
  let ph=null;await askAccountPw("Phrase oubliée","Entre le mot de passe de ton compte Sid'compagnon pour retrouver ta phrase secrète.",
    async pw=>{try{ph=(await decJ(await pinKey(pw,x.rec.salt,PIN_ITER),x.rec)).ph;return ph?null:"Mot de passe incorrect."}catch(e){return "Mot de passe incorrect."}});
  if(!ph)return;
  try{const mk=await phCheck(ph);phMem=mk;toast(`${L("Ta phrase secrète est")} « ${ph} »`,8000);phEnd({mk,ph})}catch(e){phFail("Phrase incorrecte.")}});
// récupération de la phrase grâce au mot de passe du compte (proposée quand la phrase est choisie)
async function phRecOffer(ph){if(!data.phx||data.phx.rec||isTrial())return;
  const pw=await askAccountPw("Ne perds jamais ta phrase","Entre le mot de passe de ton compte Sid'compagnon : si tu oublies ta phrase secrète un jour, ce mot de passe suffira pour la retrouver.",
    async pw=>{try{await api("/auth/v1/token?grant_type=password",{method:"POST",body:{email:accEmail(),password:pw}});return null}
      catch(ex){return ex instanceof TypeError?"Pas de connexion internet. Réessaie quand tu es connecté.":"Mot de passe incorrect."}},"Plus tard");
  if(!pw||!data.phx)return;const salt=rnd(16);
  data.phx.rec={salt,...await encJ(await pinKey(pw,salt,PIN_ITER),{ph})};save();toast("Récupération de la phrase activée")}
// v48 (option A choisie par Sid, #18) : le mot de passe du compte remplace la phrase secrète, le chiffrement ne change pas.
// data.phx.pw = {salt, iv, ct} : la clé maître MK, chiffrée dans le navigateur avec une clé tirée du mot de passe du compte (PBKDF2).
// - nouveau coffre : MK aléatoire, aucune phrase ; nouvel appareil ou code oublié : le mot de passe du compte suffit ;
// - ancienne phrase : toujours valable en secours (phx.salt / chk gardés) ; MK reçoit seulement cette enveloppe en plus (rien n'est rechiffré) ;
// - mot de passe changé : l'enveloppe suit (recRewrap) ; remis à zéro par e-mail : phx.pwStale, réenveloppé au prochain déverrouillage.
// Mode essai (sans compte) : phrase comme avant.
const phPw=()=>!!(data.phx&&data.phx.pw);
async function pwWrap(mk,pw){const salt=rnd(16);return {salt,...await encJ(await pinKey(pw,salt,PIN_ITER),{k:mk.raw})}}
async function pwUnwrap(pw){const w=data.phx.pw,raw=(await decJ(await pinKey(pw,w.salt,PIN_ITER),w)).k,mk={raw,key:await rawKey(raw)};await decJ(mk.key,data.phx.chk);return mk}
const pwCheckSrv=async pw=>{try{await api("/auth/v1/token?grant_type=password",{method:"POST",body:{email:accEmail(),password:pw}});return null}
  catch(ex){return ex instanceof TypeError?"Pas de connexion internet. Réessaie quand tu es connecté.":"Mot de passe incorrect."}};
// nouvelle clé maître, protégée par le mot de passe du compte
async function mkCreate(o){try{await pull()}catch(x){}
  if(phOn())return null; // une clé a été créée entre-temps sur un autre appareil
  const pw=await askAccountPw(o.title||"Protège ton coffre",o.ptext||"Entre le mot de passe de ton compte Sid'compagnon : il protège tes coffres. Sur un nouvel appareil, il suffira pour les rouvrir.",pwCheckSrv,o.later||"Annuler");
  if(!pw||phOn())return null;
  const raw=rnd(32),mk={raw,key:await rawKey(raw)},now=Date.now();
  data.phx={id:uid(),chk:await encJ(mk.key,{ok:"sidnote-phrase"}),pw:await pwWrap(mk,pw),createdAt:new Date(now).toISOString(),at:now};save();phMem=mk;return mk}
// clé maître retrouvée avec le mot de passe du compte (repli : l'ancienne phrase, si elle existe)
async function mkFromPw(o){o=o||{};let mk=null;
  const pw=await askAccountPw(o.title||"Mot de passe du compte",o.ptext||"Entre le mot de passe de ton compte Sid'compagnon pour ouvrir tes coffres sur cet appareil.",
    async pw=>{try{mk=await pwUnwrap(pw);return null}catch(e){return data.phx.pwStale?"Ton mot de passe a été réinitialisé : ouvre d'abord tes coffres sur un appareil où ils sont déjà ouverts (ou annule pour utiliser ta phrase secrète, si tu en avais une).":data.phx.salt?"Mot de passe incorrect. Tu peux aussi annuler et utiliser ta phrase secrète.":"Mot de passe incorrect."}},"Annuler");
  if(pw&&mk){phMem=mk;setTimeout(phPwOffer,1500);return mk}
  if(data.phx&&data.phx.salt){const r=await askPhrase({mode:"enter",title:o.title});return r&&r.mk||null}
  return null}
// coffre ouvert avec la phrase (anciens comptes) ou mot de passe réinitialisé : on ajoute l'enveloppe du mot de passe, une fois
let pwOfferDone=false;
async function phPwOffer(){if(pwOfferDone||!phMem||isTrial()||!data.phx||(data.phx.pw&&!data.phx.pwStale))return;
  if(document.querySelector(".sheet-bg:not([hidden])")){setTimeout(phPwOffer,2500);return}
  pwOfferDone=true;const mk=phMem,stale=!!data.phx.pwStale;
  const pw=await askAccountPw(stale?"Ton mot de passe a changé":"Plus besoin de phrase secrète",
    stale?"Entre ton nouveau mot de passe une fois : il rouvrira tes coffres sur tes autres appareils.":"Entre le mot de passe de ton compte une fois : sur un nouvel appareil, il suffira pour rouvrir tes coffres. Ta phrase secrète reste valable en secours.",pwCheckSrv,"Plus tard");
  if(!pw||!data.phx)return;try{await decJ(mk.key,data.phx.chk)}catch(e){return} // la clé en mémoire doit être celle de ces coffres
  const x={...data.phx,pw:await pwWrap(mk,pw)};delete x.pwStale;data.phx=x;save();toast("C'est fait : ton mot de passe suffit désormais")}
// clé maître : en mémoire, sinon mot de passe du compte (ou phrase pour les anciens coffres et l'essai) ; nouvelle clé si aucune
async function mkNeed(o){if(phMem)return phMem;o=o||{mode:"new"};
  if(!isTrial()){if(!phOn()){const mk=await mkCreate(o);if(mk||!phOn())return mk}if(phPw())return await mkFromPw(o)}
  const r=await askPhrase(o);if(!r)return null;if(r.created)await phRecOffer(r.ph);return r.mk}
// nouvel appareil, ou code oublié : phrase (ou mot de passe du compte), puis code à 5 chiffres pour cet appareil ; renvoie le code
async function devSetup(ctx,head,forgot){
  const mk=phMem&&!forgot?phMem:phPw()&&!isTrial()?await mkFromPw({title:head,ptext:forgot?"Code oublié : entre le mot de passe de ton compte, puis choisis un nouveau code pour cet appareil.":"Première ouverture sur cet appareil : entre le mot de passe de ton compte. Ensuite, choisis le code à 5 chiffres qui l'ouvrira ici."})
    :(await askPhrase({mode:"enter",title:head,text:forgot?"Code oublié : entre ta phrase secrète, puis choisis un nouveau code pour cet appareil.":"Première ouverture sur cet appareil : entre ta phrase secrète. Ensuite, choisis le code à 5 chiffres qui l'ouvrira ici."})||{}).mk;
  if(!mk)return null;
  const code=await askPin({mode:"new",head,sub:"Le code qui ouvrira ce coffre sur cet appareil. Tu peux reprendre ton code habituel."});
  if(!code||code==="forgot")return null;
  await mkWrap(ctx,code,mk);phMem=mk;toast("Code enregistré sur cet appareil");return code}
// phrase perdue sans récupération : les coffres renforcés sont illisibles, on repart de zéro (mots de passe, notes secrètes, code des documents)
function vaultsReset(){
  PW().forEach(x=>tomb(x.id));data.pwds=[];data.vault=null;
  NT().filter(n=>n.secret).forEach(n=>tomb(n.id));data.notes=NT().filter(n=>!n.secret);data.noteVault=null;
  data.docVault=null;data.phx=null;phMem=null;ls.del(mkLsKey());ls.del(bioLsKey());
  dvOpen=false;dvKey=null;vaultKey=null;vaultItems=new Map();nsKey=null;nsVid=null;nsPlain=new Map();pinStep="";
  save();renderAllSafe();toast("Coffres remis à zéro : choisis un nouveau code et une nouvelle phrase")}
// ancien coffre (code seul) → coffre v2, au déverrouillage. Renvoie la nouvelle clé, ou null (plus tard / impossible).
const upAsked=new Set();
async function v2Upgrade(kind,code,oldKey){
  const old=kind==="pw"?data.vault:kind==="docs"?data.docVault:data.noteVault;
  if(!old||isV2(old)||upAsked.has(old.id))return null;upAsked.add(old.id);
  if(kind==="docs"&&!navigator.onLine)return null; // les documents en ligne doivent être relus : on réessaiera
  const r=phMem?{mk:phMem}:{mk:await mkNeed({mode:"new",title:"Renforce ta protection",later:"Plus tard",
    ptext:"Ton code à 5 chiffres seul est trop facile à deviner pour quelqu'un qui volerait les données du serveur. Entre le mot de passe de ton compte : il protégera vraiment tes coffres. Ton code reste le même sur cet appareil.",
    text:phOn()?"Ton coffre passe à la protection renforcée : entre ta phrase secrète. Ton code reste le même.":"Ton code à 5 chiffres seul est trop facile à deviner pour quelqu'un qui volerait les données du serveur. Choisis une phrase secrète d'au moins 10 caractères : elle protégera vraiment tes coffres. Ton code reste le même pour ouvrir l'app sur cet appareil."})};
  if(!r.mk)return null;const mk=r.mk;
  const ctx=kind==="notes"?"notes":"main";
  let nk;
  if(kind==="pw"){const n=await v2Make(mk,"sidnote",{uni:true});nk=n.key;const now=Date.now();
    for(const e of PW()){if(e.vid!==old.id)continue;try{const p=await decJ(oldKey,e),x=await encJ(nk,p);Object.assign(e,{iv:x.iv,ct:x.ct,vid:n.v.id,upd:now})}catch(x){}}
    data.vault=n.v;if(vaultKey){vaultKey=nk;vaultVid=n.v.id;vaultItems=new Map()}} // la clé ouverte suit le nouveau coffre
  else if(kind==="notes"){const n=await v2Make(mk,"sidnote-notes");nk=n.key;const now=Date.now();
    for(const e of NT()){if(!e.secret||e.vid!==old.id)continue;try{const p=await decJ(oldKey,e),x=await encJ(nk,p);Object.assign(e,{iv:x.iv,ct:x.ct,vid:n.v.id,upd:now})}catch(x){}}
    data.noteVault=n.v;if(nsKey){nsKey=nk;nsVid=n.v.id}}
  else{
    // 1) chaque document lisible (copie de l'appareil, ou version en ligne déchiffrée avec l'ancienne clé)
    const plain=new Map();
    for(const d of docsArr()){try{plain.set(d.id,await docBlob(d,oldKey))}catch(e){if(d.up&&!(await idb.get(docKey(d)))){toast("Passage impossible pour l'instant (réseau). Réessaie plus tard.");upAsked.delete(old.id);return null}}}
    const n=await v2Make(mk,"sidnote-docs",{uni:true});nk=n.key;data.docVault=n.v;if(dvOpen){dvKey=nk;dvVid=n.v.id}
    // 2) rechiffrés avec la nouvelle clé, sur l'appareil et en ligne
    for(const d of docsArr()){const b=plain.get(d.id);if(!b)continue;const enc=await docEncrypt(b,nk);
      try{await idb.put(docKey(d),enc)}catch(e){}
      if(d.up){try{await stor("POST","documents/"+(d.path||docPath(d)),enc);d.enc=n.v.id}catch(e){d.up=false}}}
  }
  if(!mkHas(ctx))await mkWrap(ctx,code,mk);
  else{try{await mkUnwrap(ctx,code)}catch(e){await mkWrap(ctx,code,mk)}} // le dernier code tapé ouvre ce coffre sur cet appareil
  save();toast("Protection renforcée");if(r.created)await phRecOffer(r.ph);return nk}
function pwdLock(){if(!vaultKey&&!pinBuf)return;vaultKey=null;vaultItems=new Map();pwShown.clear();pinBuf="";pinStep="";closePwSheet();if(data.ui.view==="pwd")renderPwd()}
// déchiffre les entrées (après déverrouillage ou après une synchro)
async function vaultLoad(){
  if(!vaultKey)return;const k=vaultKey,vid=data.vault.id,m=new Map();
  for(const e of PW()){if(e.vid!==vid)continue;const old=vaultItems.get(e.id);
    if(old&&old._iv===e.iv){m.set(e.id,old);continue}
    try{m.set(e.id,{...await decJ(k,e),_iv:e.iv})}catch(x){}}
  if(k===vaultKey){vaultItems=m;renderPwList()}
}
function renderPwd(){
  if(!$("pinBox"))return;
  // coffre remis à zéro ou recréé sur un autre appareil : on reverrouille
  if(vaultKey&&(!vaultOn()||data.vault.id!==vaultVid)){vaultKey=null;vaultItems=new Map();pinStep=""}
  const open=!!vaultKey;$("pinBox").hidden=open;$("vault").hidden=!open;
  if(open){renderPwList();vaultLoad();return}
  // un coffre arrivé d'un autre appareil pendant qu'on était sur « Choisis ton code » : on passe au déverrouillage (sinon on en créerait un second)
  if(vaultOn()&&/^(new|confirm|adopt)$/.test(pinStep)){pinStep="";pinBuf="";pinFirst=""}
  if(!pinStep)pinStep=vaultOn()?(isV2(data.vault)&&!mkHas("main")?"device":"unlock"):(data.docVault&&data.docVault.chk?"adopt":"new");
  if(pinStep==="device"&&!(vaultOn()&&isV2(data.vault)&&!mkHas("main")))pinStep="unlock";
  $("pinDev").hidden=pinStep!=="device";$("pinPad").hidden=$("pinDots").hidden=pinStep==="device";
  const T={new:["Choisis ton code","5 chiffres pour protéger tes mots de passe. Retiens-le bien : sans lui, ils ne peuvent pas être récupérés."],
    confirm:["Confirme ton code","Tape à nouveau les 5 chiffres."],unlock:["Entre ton code","Tes mots de passe sont verrouillés."],
    adopt:["Entre ton code","Le même que pour tes documents : il protégera aussi tes mots de passe."],
    device:["Nouvel appareil",phPw()?"Pour ouvrir tes mots de passe ici, entre d'abord le mot de passe de ton compte, puis choisis le code de cet appareil.":"Pour ouvrir tes mots de passe ici, entre d'abord ta phrase secrète, puis choisis le code de cet appareil."]}[pinStep];
  $("pinDev").textContent=L(phPw()?"Entrer le mot de passe de mon compte":"Entrer ma phrase secrète");
  $("pinTitle").textContent=L(T[0]);$("pinSub").textContent=L(T[1]);$("pinForgot").hidden=pinStep!=="unlock";
  $("pinBio").hidden=!(pinStep==="unlock"&&bioHas("main"));$("pinBio").textContent=bioUse();
  if(!$("pinPad").children.length)$("pinPad").innerHTML=[1,2,3,4,5,6,7,8,9].map(d=>`<button type="button" data-pin="${d}">${d}</button>`).join("")+
    `<button type="button" class="blank" tabindex="-1" aria-hidden="true"></button><button type="button" data-pin="0">0</button><button type="button" class="del" data-pin="del">Effacer</button>`;
  pinDots();
}
function pinDots(){[...$("pinDots").children].forEach((d,i)=>d.classList.toggle("on",i<pinBuf.length))}
function pinFail(msg){const d=$("pinDots");$("pinErr").textContent=L(msg);d.classList.remove("shake");void d.offsetWidth;d.classList.add("shake");if(navigator.vibrate)navigator.vibrate(60);pinBuf="";pinDots()}
async function pinDone(){
  const code=pinBuf;
  if(pinStep==="new"){pinFirst=code;pinBuf="";pinStep="confirm";$("pinErr").textContent="";renderPwd();return}
  // v27 : les documents ont déjà un code → les mots de passe prennent le même
  if(pinStep==="adopt"){pinBusy=true;$("pinErr").textContent="";
    try{await vOpen(data.docVault,code,"main")}catch(e){pinBusy=false;pinFail("Code incorrect.");return}
    try{if(isV2(data.docVault)){const n=await v2Make(phMem,"sidnote",{uni:true});data.vault=n.v;vaultKey=n.key}
      else{data.vault=await newPwVault(code);vaultKey=await pinKey(code,data.vault.salt,PIN_ITER)}
      data.docVault.uni=true;save();vaultVid=data.vault.id;vaultItems=new Map();pinBuf="";pinStep="";toast("Code enregistré");renderPwd()}
    catch(ex){pinFail("Ce navigateur ne permet pas de chiffrer les données.")}
    pinBusy=false;return}
  if(pinStep==="confirm"){
    if(code!==pinFirst){pinFirst="";pinStep="new";renderPwd();pinFail("Les deux codes ne sont pas identiques. Recommence.");return}
    pinBusy=true;$("pinErr").textContent="";$("pinSub").textContent=L("Création du coffre…");
    // v32 : puis la phrase secrète, qui protège vraiment le coffre
    const mk=await mkNeed();if(!mk){pinBusy=false;pinFirst="";pinBuf="";pinStep="new";renderPwd();return}
    try{const n=await v2Make(mk,"sidnote",{uni:true});data.vault=n.v;
      if(!(data.docVault&&data.docVault.chk))data.docVault=(await v2Make(mk,"sidnote-docs",{uni:true})).v; // même code pour les documents
      else if(data.docVault.uni&&!isV2(data.docVault))data.docVault.uni=false; // ancien code des documents : ils repasseront au code unique au prochain déverrouillage
      await mkWrap("main",code,mk);
      save();vaultKey=n.key;vaultVid=data.vault.id;vaultItems=new Map();pinFirst="";pinBuf="";pinStep="";toast("Code enregistré");renderPwd()}
    catch(ex){pinStep="new";renderPwd();pinFail("Ce navigateur ne permet pas de chiffrer les données.")}
    pinBusy=false;return}
  // déverrouillage
  if(Date.now()<pinWait){pinFail("Trop d'essais. Attends 30 secondes.");return}
  pinBusy=true;$("pinErr").textContent="";
  try{const v=data.vault,key=await vOpen(v,code,"main");
    pinFails=0;vaultKey=key;vaultVid=v.id;pinBuf="";pinStep="";renderPwd();vaultLoad();if(!pinBioRun)bioOffer("main",code);
    if(!isV2(v)){v2Upgrade("pw",code,key).then(nk=>{if(nk&&vaultKey){vaultKey=nk;vaultVid=data.vault.id;vaultItems=new Map();vaultLoad()}})}}
  catch(ex){pinFails++;if(pinFails>=5){pinFails=0;pinWait=Date.now()+30000;pinFail("Trop d'essais. Attends 30 secondes.")}else pinFail("Code incorrect.")}
  pinBusy=false;
}
function pinPress(k){
  if(pinBusy)return;
  if(k==="del"){pinBuf=pinBuf.slice(0,-1);pinDots();return}
  if(pinBuf.length>=PIN_LEN)return;
  pinBuf+=k;pinDots();if(pinBuf.length===PIN_LEN)setTimeout(pinDone,120);
}
padTap($("pinPad"),"pin",pinPress);
document.addEventListener("keydown",e=>{if(data.ui.view!=="pwd"||vaultKey||!$("pwSheet").hidden||!$("pinSheet").hidden||document.body.classList.contains("locked"))return;
  if(/^[0-9]$/.test(e.key))pinPress(e.key);else if(e.key==="Backspace")pinPress("del")});
let pinBioRun=false;
$("pinBio").addEventListener("click",async()=>{if(pinBusy||vaultKey)return;const code=await bioCode("main");if(!code||vaultKey)return;
  pinBuf=code;pinStep="unlock";pinWait=0;pinBioRun=true;await pinDone();pinBioRun=false;if(!vaultKey){bioDrop("main");$("pinErr").textContent=L("Ton code a changé : tape-le, puis réactive Face ID dans Réglages.")}});
$("pinForgot").addEventListener("click",async e=>{const b=e.currentTarget;
  if(isV2(data.vault)){const code=await devSetup("main","Mots de passe",true);if(code){pinBuf=code;pinStep="unlock";pinWait=0;pinDone()}return}
  if(data.vault&&data.vault.rec){const code=await recRecover(data.vault);if(code){pinBuf=code;pinStep="unlock";pinWait=0;pinDone()}return}
  if(!b.dataset.armed){b.dataset.armed="1";b.textContent=L("La récupération n'était pas activée. Effacer tous les mots de passe et choisir un nouveau code ? Touche encore pour confirmer.");
    setTimeout(()=>{delete b.dataset.armed;b.textContent=L("Code oublié ?")},5000);return}
  delete b.dataset.armed;b.textContent=L("Code oublié ?");
  PW().forEach(x=>tomb(x.id));data.pwds=[];data.vault=null;save();pinStep="new";pinBuf="";renderPwd();toast("Coffre remis à zéro");
});

$("pinDev").addEventListener("click",async()=>{const code=await devSetup("main","Mots de passe");if(code){pinBuf=code;pinStep="unlock";pinWait=0;pinDone()}});
$("pwLock").addEventListener("click",()=>{pwdLock();toast("Mots de passe verrouillés")});
const EYE=`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>`;
const COPY=`<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8.5" y="8.5" width="12" height="12" rx="2.5"/><path d="M15.5 8.5V6a2.5 2.5 0 0 0-2.5-2.5H6A2.5 2.5 0 0 0 3.5 6v7A2.5 2.5 0 0 0 6 15.5h2.5"/></svg>`;
function renderPwList(){
  if(!vaultKey)return;
  const q=pwQ.trim();let list=[...vaultItems.entries()].map(([id,v])=>({id,...v}));
  // v28 : classement au choix (data.prefs.pwSort) : A → Z (par défaut) ou les plus récents d'abord (date d'ajout ou de modification)
  const srt=data.prefs.pwSort==="date"?"date":"alpha",at=id=>{const r=PW().find(x=>x.id===id);return r?(r.upd||Date.parse(r.createdAt)||0):0};
  $("pwSort").querySelectorAll("[data-pwsort]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.pwsort===srt)));
  list.sort(srt==="date"?(a,b)=>at(b.id)-at(a.id):(a,b)=>String(a.site).localeCompare(String(b.site),LANG,{sensitivity:"base",numeric:true}));
  if(q)list=list.map(x=>({x,s:fuzzyScore(`${x.site} ${x.user||""}`,q)})).filter(o=>o.s>0).sort((a,b)=>b.s-a.s).map(o=>o.x);
  $("pwList").innerHTML=list.length?list.map(x=>{const show=pwShown.has(x.id);
    return `<div class="pw-row"><div class="pw-av notr">${esc((String(x.site).trim()[0]||"?"))}</div>
      <div class="pw-main notr"><b>${esc(x.site)}</b>${x.user?`<span class="small muted">${esc(x.user)}</span>`:""}<span class="pw-sec">${show?esc(x.pw):"••••••••"}</span>${x.note&&show?`<span class="small muted">${esc(x.note)}</span>`:""}</div>
      <button class="pen" data-pweye="${x.id}" aria-label="${L(show?"Masquer":"Afficher")}">${EYE}</button>
      <button class="pen" data-pwcopy="${x.id}" aria-label="Copier le mot de passe">${COPY}</button>
      <button class="pen" data-pwedit="${x.id}" aria-label="Modifier">${PEN}</button></div>`}).join("")
    :`<div class="empty">${L(q?"Aucun site ne correspond.":"Aucun mot de passe pour l'instant. Touche « + Ajouter ».")}</div>`;
}
$("pwSearch").addEventListener("input",e=>{pwQ=e.target.value;renderPwList()});
$("pwSort").addEventListener("click",e=>{const b=e.target.closest("[data-pwsort]");if(!b)return;data.prefs.pwSort=b.dataset.pwsort;save();renderPwList()});
async function copyTxt(t){try{await navigator.clipboard.writeText(t);return true}catch(e){
  const a=document.createElement("textarea");a.value=t;a.setAttribute("readonly","");a.style.position="fixed";a.style.opacity="0";document.body.appendChild(a);a.select();
  let ok=false;try{ok=document.execCommand("copy")}catch(x){}a.remove();return ok}}
$("pwList").addEventListener("click",async e=>{const b=e.target.closest("button");if(!b)return;
  if(b.dataset.pweye){const id=b.dataset.pweye;pwShown.has(id)?pwShown.delete(id):pwShown.add(id);renderPwList()}
  else if(b.dataset.pwcopy){const v=vaultItems.get(b.dataset.pwcopy);if(v)toast(await copyTxt(v.pw||"")?"Mot de passe copié":"Copie impossible")}
  else if(b.dataset.pwedit)openPwSheet(b.dataset.pwedit);
});
function openPwSheet(id){
  if(!vaultKey)return;pwEditId=id||null;const v=id?vaultItems.get(id)||{}:{};
  $("pwSheetTitle").textContent=L(id?"Modifier le mot de passe":"Nouveau mot de passe");
  $("pwSite").value=v.site||"";$("pwUser").value=v.user||"";$("pwPass").value=v.pw||"";$("pwNote").value=v.note||"";
  $("pwPass").type="password";$("pwEye").textContent=L("Voir");
  const d=$("pwDel");d.hidden=!id;d.classList.remove("armed");d.textContent=L("Supprimer");
  $("pwSheet").hidden=false;if(!id)setTimeout(()=>$("pwSite").focus(),50);
}
function closePwSheet(){$("pwSheet").hidden=true;pwEditId=null;["pwSite","pwUser","pwPass","pwNote"].forEach(k=>$(k).value="")}
$("pwNew").addEventListener("click",()=>openPwSheet(null));
$("pwClose").addEventListener("click",closePwSheet);
$("pwSheet").addEventListener("click",e=>{if(e.target.id==="pwSheet")closePwSheet()});
$("pwEye").addEventListener("click",()=>{const i=$("pwPass"),s=i.type==="password";i.type=s?"text":"password";$("pwEye").textContent=L(s?"Cacher":"Voir")});
$("pwGen").addEventListener("click",()=>{
  const A="abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789",S="-_!?.@#",r=crypto.getRandomValues(new Uint32Array(16));
  let p=[...r].map(n=>A[n%A.length]);p[3]=S[r[3]%S.length];p[10]=String(r[10]%10);
  $("pwPass").value=p.join("");$("pwPass").type="text";$("pwEye").textContent=L("Cacher");toast("Mot de passe généré");
});
$("pwForm").addEventListener("submit",async e=>{
  e.preventDefault();if(!vaultKey)return;
  const v={site:$("pwSite").value.trim(),user:$("pwUser").value.trim(),pw:$("pwPass").value,note:$("pwNote").value.trim()};
  if(!v.site){toast("Indique le site ou l'application");return}
  if(!v.pw){toast("Indique le mot de passe");return}
  const id=pwEditId||uid(),enc=await encJ(vaultKey,v),old=PW().find(x=>x.id===id);
  const rec={id,vid:data.vault.id,iv:enc.iv,ct:enc.ct,upd:Date.now(),createdAt:old?old.createdAt:new Date().toISOString()};
  data.pwds=[...PW().filter(x=>x.id!==id),rec];vaultItems.set(id,{...v,_iv:rec.iv});
  save();closePwSheet();renderPwList();toast(old?"Modifié":"Mot de passe enregistré");
});
$("pwDel").addEventListener("click",e=>{const b=e.currentTarget;if(!pwEditId)return;
  const id=pwEditId;closePwSheet();
  undoable("Mot de passe supprimé",[id],()=>{tomb(id);data.pwds=PW().filter(x=>x.id!==id);vaultItems.delete(id);pwShown.delete(id)},{after:()=>{renderPwList();vaultLoad()}});
});

/* ---------- apparence : couleur et thème ---------- */
// v29 : ambiances (couleur d'accent de toute l'app) ; [nom, accent clair, fond clair, accent sombre, fond sombre]
const PALETTES={or:["Noir & or","#9C7A3C","#F4F4F2","#C9B48A","#0E0F11"],saphir:["Saphir","#2F5DA8","#F3F5F9","#8FB3EA","#0D1017"],
  emeraude:["Émeraude","#2F7A5B","#F2F5F3","#86C6A4","#0C110F"],bordeaux:["Bordeaux","#9B3550","#F7F3F4","#E0A3B4","#120D0F"],platine:["Platine","#55585F","#F4F4F4","#C9CCD3","#0F1012"]};
function applyLook(){
  const p=(session&&data.prefs)||{},look=ls.get("sidnote-look")||{};
  // v42 : direction « Éditorial de précision » : clair ivoire ou graphite ; les anciennes ambiances ne sont plus appliquées (le choix reste dans les données)
  const pal=PALETTES[p.palette||look.palette]?(p.palette||look.palette):"or";
  document.documentElement.removeAttribute("data-palette");document.documentElement.dataset.ds="edito";
  // v45 : sombre par défaut pour tout le monde (avant : clair) ; seul un choix fait par la personne (prefs.theme) est gardé
  const theme=p.theme||(session?"dark":look.theme)||"dark";
  if(theme==="auto")document.documentElement.removeAttribute("data-theme");else document.documentElement.setAttribute("data-theme",theme);
  const dark=theme==="dark"||(theme==="auto"&&matchMedia("(prefers-color-scheme: dark)").matches);
  document.querySelectorAll('meta[name="theme-color"]').forEach(m=>m.setAttribute("content",dark?"#111214":"#F4F0E8"));
  ls.set("sidnote-look",{theme,palette:pal}); // pour l'écran de connexion
}
function renderLook(){
  const th=data.prefs.theme||"dark",dark=document.documentElement.dataset.theme==="dark"||(!document.documentElement.dataset.theme&&matchMedia("(prefers-color-scheme: dark)").matches);
  document.querySelectorAll("#themeSel button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.theme===th));
  const pal=data.prefs.palette||"or";
  $("palSel").innerHTML=Object.entries(PALETTES).map(([k,a])=>`<button type="button" class="pal" data-pal="${k}" aria-pressed="${k===pal}"><span class="pal-dot" style="--pa:${dark?a[3]:a[1]};--pb:${dark?a[4]:a[2]}">${k===pal?CHECK:""}</span><span class="pal-n">${L(a[0])}</span></button>`).join("");
}
$("palSel").addEventListener("click",e=>{const b=e.target.closest("[data-pal]");if(!b)return;data.prefs.palette=b.dataset.pal;save();applyLook();renderLook()});
$("themeSel").addEventListener("click",e=>{const b=e.target.closest("[data-theme]");if(!b)return;data.prefs.theme=b.dataset.theme;save();applyLook();renderLook()});
applyLook();
// sections des réglages : on se souvient de celles qui sont ouvertes (sur cet appareil)
// v39 : les sections de Réglages s'ouvrent fermées à chaque lancement (demande de Sid : « quand je reviens, tout est fermé »)
data.ui.setOpen={};
/* ---------- v39 : tout se referme quand on revient (lancement, ou retour après 10 min ailleurs) ---------- */
function closeAll(){
  document.querySelectorAll(".sheet-bg:not([hidden])").forEach(sb=>{const x=sb.querySelector(".sheet-head .x,[data-esc]");if(x)x.click();else sb.hidden=true});
  ["viewer","lightbox"].forEach(id=>{const v=$(id);if(v&&!v.hidden){const c=v.querySelector("#vwClose,#lbClose,.x");if(c)c.click();else v.hidden=true}});
  document.querySelectorAll("details.setsec[open],details[open]").forEach(d=>d.open=false);
  ["nfForm","catForm"].forEach(id=>{const f=$(id);if(f)f.hidden=true});
  if(noteOpenId)closeNote();noteDir=null;if(typeof qOpen!=="undefined")qOpen=false;
  if(calMode==="day"){calMode="month";renderCal()}
  if(typeof syncScrollLock==="function")syncScrollLock()}
let awayAt=0;document.addEventListener("visibilitychange",()=>{if(document.hidden){awayAt=Date.now();return}
  if(awayAt&&Date.now()-awayAt>10*60000&&session)closeAll();awayAt=0});

/* ---------- dictée vocale ---------- */
// Reconnaissance vocale du navigateur (Safari iOS 14.5+). Sinon, le micro du clavier de l'iPhone marche toujours.
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
let dict=null;
function dictStop(){if(dict){try{dict.rec.stop()}catch(e){}dict.btn.classList.remove("on");dict=null}}
function dictate(btn,field,onChange){
  if(dict){const same=dict.btn===btn;dictStop();if(same)return}
  if(!SR){toast("Dictée indisponible ici : touche le micro du clavier de ton smartphone.");field.focus();return}
  const rec=new SR();rec.lang=LANG==="en"?"en-US":LANG==="nl"?"nl-NL":"fr-FR";rec.continuous=true;rec.interimResults=true;
  // le texte dicté s'insère à l'endroit du curseur
  const start=field.selectionStart??field.value.length,before=field.value.slice(0,start),after=field.value.slice(field.selectionEnd??start);
  const sep=before&&!/\s$/.test(before)?" ":"";let finals="";
  rec.onresult=ev=>{let interim="";for(let i=ev.resultIndex;i<ev.results.length;i++){const r=ev.results[i];if(r.isFinal)finals+=r[0].transcript;else interim+=r[0].transcript}
    field.value=before+sep+(finals+interim).trimStart()+after;onChange&&onChange()};
  rec.onerror=ev=>{if(ev.error==="not-allowed"||ev.error==="service-not-allowed")toast("Micro refusé : autorise-le dans les réglages de ton smartphone.");else if(ev.error!=="aborted"&&ev.error!=="no-speech")toast("Dictée interrompue")};
  rec.onend=()=>{if(dict&&dict.rec===rec){btn.classList.remove("on");dict=null}};
  try{rec.start();dict={rec,btn};btn.classList.add("on");toast("Parle, je t'écoute…")}catch(e){toast("Dictée indisponible ici : touche le micro du clavier de ton smartphone.")}
}
$("noteMic").addEventListener("click",e=>{const el=$("noteBody"),btn=e.currentTarget;if(dict){dictate(btn,null);return}
  // le texte dicté arrive dans un petit repère posé à l'endroit du curseur (l'éditeur n'est pas un champ texte)
  el.focus();const sel=getSelection();let r=sel.rangeCount&&el.contains(sel.anchorNode)?sel.getRangeAt(0):null;
  if(!r){r=document.createRange();r.selectNodeContents(el);r.collapse(false)}
  const sp=document.createElement("span");sp.className="dict-tmp";r.deleteContents();r.insertNode(sp);
  const field={get value(){return sp.textContent},set value(x){sp.textContent=x},selectionStart:0,selectionEnd:0,focus(){el.focus()}};
  dictate(btn,field,()=>{noteInput()});
  // v44.7 : le bouton est gardé dans « btn » (e.currentTarget est vide après le clic : le repère était retiré au bout de 0,5 s et la dictée se perdait)
  const stopWatch=setInterval(()=>{if(!dict||dict.btn!==btn){clearInterval(stopWatch);if(sp.isConnected)sp.replaceWith(...sp.childNodes);noteInput()}},500)});
// --- barre de mise en forme ---
function rtBlock(){const s=getSelection();let n=s.rangeCount?s.anchorNode:null;while(n&&n!==$("noteBody")){if(n.nodeType===1&&/^(H2|H3|BLOCKQUOTE|LI|DIV|P)$/.test(n.tagName))return n;n=n.parentNode}return null}
function rtCmd(k){const el=$("noteBody");el.focus();const ex=(c,v)=>document.execCommand(c,false,v===undefined?null:v);
  const b=rtBlock(),tag=b&&b.tagName;
  if(k==="h2"||k==="h3")ex("formatBlock",tag===k.toUpperCase()?"div":k);
  else if(k==="p")ex("formatBlock","div");
  else if(/^(hl|tc):/.test(k)){const[t,v]=k.split(":");rtWrap(t==="hl"?"mark":"span",t==="hl"?"data-hl":"data-tc",v==="none"?"":v)}
  else if(k==="link"){const s=getSelection();if(!s.rangeCount||s.isCollapsed){toast("Sélectionne d'abord du texte");return}
    const r=s.getRangeAt(0).cloneRange(),u=prompt(L("Adresse du lien (https://…)"),"https://");if(!u||!/^https?:\/\/\S+$/i.test(u.trim())){if(u)toast("Adresse non valable");return}
    el.focus();s.removeAllRanges();s.addRange(r);ex("createLink",u.trim())}
  else if(k==="date")ex("insertText",new Date().toLocaleDateString(LANG==="fr"?"fr-BE":LANG==="nl"?"nl-BE":"en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"}));
  else if(k==="quote")ex("formatBlock",b&&b.closest("blockquote")?"div":"blockquote");
  else if(k==="ul"||k==="ol")ex(k==="ul"?"insertUnorderedList":"insertOrderedList");
  else if(k==="chk"){const ul0=b&&b.closest("ul");if(ul0&&ul0.classList.contains("chk")){ul0.classList.remove("chk");ex("insertUnorderedList")}
    else{if(!ul0)ex("insertUnorderedList");const s=getSelection(),n=s.anchorNode&&(s.anchorNode.nodeType===1?s.anchorNode:s.anchorNode.parentNode),ul=n&&n.closest&&n.closest("ul");
      if(ul){ul.className="chk";ul.querySelectorAll(":scope>li").forEach(li=>{if(!li.hasAttribute("data-c"))li.setAttribute("data-c","0")})}}}
  else if(k==="hr")ex("insertHorizontalRule");
  else if(k==="mark"){const s=getSelection();const n=s.anchorNode&&(s.anchorNode.nodeType===1?s.anchorNode:s.anchorNode.parentNode),m=n&&n.closest&&n.closest("mark");
    if(m)m.replaceWith(...m.childNodes);else if(s.rangeCount&&!s.isCollapsed){const t=s.toString();ex("insertHTML",`<mark>${esc(t).replace(/\n/g,"<br>")}</mark>`)}else toast("Sélectionne d'abord du texte")}
  else if(k==="clear"){ex("removeFormat");if(tag&&tag!=="DIV"&&tag!=="LI")ex("formatBlock","div");const m=b&&b.querySelectorAll("mark");if(m)m.forEach(x=>x.replaceWith(...x.childNodes))}
  else ex(k);
  noteInput();rtState()}
// entoure la sélection d'une couleur (surligneur ou texte) ; valeur vide = retire cette couleur
function rtWrap(tag,attr,val){const s=getSelection();if(!s.rangeCount||s.isCollapsed){toast("Sélectionne d'abord du texte");return}
  const r=s.getRangeAt(0),box=document.createElement("div");box.appendChild(r.cloneContents());
  box.querySelectorAll(`${tag}[${attr}]`).forEach(x=>x.replaceWith(...x.childNodes));
  let anc=r.commonAncestorContainer;anc=anc.nodeType===1?anc:anc.parentNode;const outer=anc&&anc.closest&&anc.closest(`${tag}[${attr}]`);
  if(outer&&$("noteBody").contains(outer)){r.selectNode(outer);s.removeAllRanges();s.addRange(r)}
  document.execCommand("insertHTML",false,val?`<${tag} ${attr}="${val}">${box.innerHTML}</${tag}>`:box.innerHTML)}
// v41 : menus déroulants de la barre (comme Word) ; la sélection est gardée pendant le choix
const RT_MENUS={style:[["h2","Titre"],["h3","Sous-titre"],["p","Texte normal"],["quote","Citation"],["strikeThrough","Barré"]],
  hl:[["hl:y","Jaune"],["hl:g","Vert"],["hl:b","Bleu"],["hl:p","Rose"],["hl:none","Sans surlignage"]],
  tc:[["tc:none","Automatique"],["tc:r","Rouge"],["tc:o","Orange"],["tc:g","Vert"],["tc:b","Bleu"],["tc:v","Violet"]],
  ul:[["ul","Liste à puces"],["chk","Cases à cocher"]],
  ins:[["hr","Séparateur"],["link","Lien"],["date","Date du jour"]],
  edit:[["clear","Retirer la mise en forme"],["undo","Annuler"],["redo","Rétablir"]]};
let rtRange=null;
function rtMenu(btn){const pop=$("rtPop"),k=btn.dataset.rtm;if(!pop.hidden&&pop.dataset.for===k){pop.hidden=true;return}
  const s=getSelection();rtRange=s.rangeCount&&$("noteBody").contains(s.anchorNode)?s.getRangeAt(0).cloneRange():null;
  pop.dataset.for=k;pop.innerHTML=RT_MENUS[k].map(([c,l])=>`<button type="button" role="menuitem" data-rtc="${c}"${/^(hl|tc):/.test(c)?` data-sw="${c}"`:""}>${/^(hl|tc):/.test(c)?`<i class="rt-sw"></i>`:""}${esc(L(l))}</button>`).join("");
  const b=btn.getBoundingClientRect();pop.hidden=false;const w=pop.offsetWidth;pop.style.left=Math.max(8,Math.min(innerWidth-w-8,b.left))+"px";pop.style.top=(b.bottom+6)+"px"}
$("rtPop").addEventListener("pointerdown",e=>e.preventDefault());$("rtPop").addEventListener("mousedown",e=>e.preventDefault());
$("rtPop").addEventListener("click",e=>{const b=e.target.closest("[data-rtc]");if(!b)return;$("rtPop").hidden=true;
  if(rtRange){$("noteBody").focus();const s=getSelection();s.removeAllRanges();s.addRange(rtRange)}rtCmd(b.dataset.rtc)});
document.addEventListener("pointerdown",e=>{if(!$("rtPop").hidden&&!e.target.closest("#rtPop,[data-rtm]"))$("rtPop").hidden=true});
function rtState(){const q=c=>{try{return document.queryCommandState(c)}catch(e){return false}},b=rtBlock(),tag=b&&b.tagName;
  document.querySelectorAll("#rtBar [data-rt]").forEach(x=>{const k=x.dataset.rt;let on=false;
    if(["bold","italic","underline","strikeThrough"].includes(k))on=q(k);else if(k==="h2"||k==="h3")on=tag===k.toUpperCase();else if(k==="quote")on=!!(b&&b.closest("blockquote"));
    else if(k==="ul")on=!!(b&&b.closest("ul:not(.chk)"));else if(k==="ol")on=!!(b&&b.closest("ol"));else if(k==="chk")on=!!(b&&b.closest("ul.chk"));
    x.setAttribute("aria-pressed",String(on))});
  const st=document.querySelector('#rtBar [data-rtm="style"]');if(st)st.setAttribute("aria-pressed",String(tag==="H2"||tag==="H3"||!!(b&&b.closest("blockquote"))));
  const ul=document.querySelector('#rtBar [data-rtm="ul"]');if(ul)ul.setAttribute("aria-pressed",String(!!(b&&b.closest("ul"))))}
// les boutons ne prennent pas le focus : la sélection et le clavier restent dans la note
$("rtBar").addEventListener("pointerdown",e=>{if(e.target.closest("[data-rt]"))e.preventDefault()});
$("rtBar").addEventListener("mousedown",e=>{if(e.target.closest("[data-rt]"))e.preventDefault()});
$("rtBar").addEventListener("pointerdown",e=>{if(e.target.closest("[data-rtm]"))e.preventDefault()});$("rtBar").addEventListener("mousedown",e=>{if(e.target.closest("[data-rtm]"))e.preventDefault()});
$("rtBar").addEventListener("click",e=>{const m=e.target.closest("[data-rtm]");if(m){rtMenu(m);return}const b=e.target.closest("[data-rt]");if(b){$("rtPop").hidden=true;rtCmd(b.dataset.rt)}});
document.addEventListener("selectionchange",()=>{if(noteOpenId&&$("noteBody").contains(document.activeElement||null)||document.activeElement===$("noteBody"))rtState()});
// cases à cocher : toucher la case coche ou décoche
$("noteBody").addEventListener("click",e=>{const li=e.target.closest("ul.chk>li");if(!li)return;const r=li.getBoundingClientRect();
  if(e.clientX-r.left<30){e.preventDefault();li.setAttribute("data-c",li.getAttribute("data-c")==="1"?"0":"1");noteInput()}});
// collage : mise en forme nettoyée (rien d'exécutable, pas de couleurs ni de polices)
$("noteBody").addEventListener("paste",e=>{const cd=e.clipboardData;if(!cd)return;const h=cd.getData("text/html"),t=cd.getData("text/plain");e.preventDefault();
  document.execCommand("insertHTML",false,h?rtClean(h):rtFromText(t));noteInput()});
// Entrée sur une case vide d'une liste de cases : nouvelle case non cochée
$("noteBody").addEventListener("keyup",e=>{if(e.key==="Enter"){const b=rtBlock(),li=b&&b.closest("ul.chk>li");if(li&&li.getAttribute("data-c")==="1"&&!li.textContent.trim())li.setAttribute("data-c","0")}});
$("nuMic").addEventListener("click",e=>dictate(e.currentTarget,$("nuAsk")));
document.addEventListener("visibilitychange",()=>{if(document.hidden)dictStop()});

// bouton 🎤 ajouté à côté des champs de saisie principaux
function micFor(inp){if(!inp||inp.dataset.mic)return;inp.dataset.mic="1";
  const b=document.createElement("button");b.type="button";b.className="mini nu-mic";b.innerHTML=IC("mic");b.setAttribute("aria-label",L("Dicter"));
  const par=inp.parentElement;
  if(par.classList.contains("addbar")||par.classList.contains("pw-field"))inp.after(b);
  else{const w=document.createElement("span");w.className="mic-field";inp.before(w);w.append(inp,b)}
  b.addEventListener("click",()=>dictate(b,inp,()=>inp.dispatchEvent(new Event("input",{bubbles:true}))));
}
["todoIn","fTitle","eTitle","msName","catIn","pwNote"].forEach(id=>micFor($(id)));

/* ---------- nutrition (calories et macros, calculés par Claude) ---------- */
// data.nutri = {profile, plan, menuPrefs, menu, upd, rev, log:[{id, day, at, grp, gname, gem, name, qty, em, kcal, p, c, f, upd}], weights:[{id, day, kg, upd}], weeks:[…]}
// Accès réservé (le reste des comptes voit l'onglet flouté « Bientôt disponible ») ; la fonction serveur vérifie aussi.
const nutriAllowed=()=>!!session; // v39 : pour tout le monde
function applySoon(){const on=!nutriAllowed();document.querySelectorAll(".soonable").forEach(sec=>{sec.classList.toggle("is-soon",on);sec.querySelector(".soon").hidden=!on})}
const NU=()=>{const n=data.nutri||(data.nutri={});if(!Array.isArray(n.log))n.log=[];if(!Array.isArray(n.weights))n.weights=[];if(!Array.isArray(n.weeks))n.weeks=[];return n};
let nuDay=iso(today()),nuEditing=false,nuDraft=null,nuPending=null,nuBusy="",nuEditId=null,nuPhoto=null;
const r0=x=>Math.round(+x||0),r1=x=>Math.round((+x||0)*10)/10;
const numIn=v=>{const n=parseFloat(String(v||"").replace(",",".").replace(/[^0-9.]/g,""));return isFinite(n)?n:0};
// « 1h30 », « 90 », « 1:30 », « 45 min » → minutes
function parseDur(v){v=String(v||"").toLowerCase().replace(/\s/g,"");if(!v)return 0;let m=v.match(/^(\d+)(?:h|:)(\d{0,2})/);if(m)return +m[1]*60+(+m[2]||0);m=v.match(/^(\d+)/);return m?+m[1]:0}
const fmtDur=m=>!m?"":m>=60?`${Math.floor(m/60)}h${m%60?two(m%60):""}`:`${m} min`;
const MAC=[["p","Protéines","--m-p"],["c","Glucides","--m-c"],["f","Lipides","--m-f"]];
/* v39 : plus de clé Claude de Sid. Le profil est calculé dans l'app ; les aliments déjà connus viennent de la mémoire partagée (gratuite) ;
   le reste (aliment inconnu, photo, menu, recette, bilan) est confié à l'IA de la personne, branchée par le connecteur (aiHandoff). */
const T3=(fr,en,nl)=>LANG==="en"?en:LANG==="nl"?nl:fr;
async function nuCall(kind,payload){payload=payload||{};
  if(!(await nuConsent()))throw new Error(L("Il faut ton accord pour utiliser Nutrition (données de santé)."));
  if(kind==="profil")return nuProfileLocal(payload.data||{});
  if(kind==="aliment"&&!payload.image&&String(payload.text||"").trim()){
    if(!navigator.onLine)throw new Error(L("Pas de connexion internet"));
    const j=await api("/functions/v1/nutrition",{method:"POST",token:await token(),body:{kind,lang:LANG,text:payload.text}});
    if(j&&j.result){j.result._src="memory";return j.result}}
  throw aiNeed(kind,payload)}
function aiNeed(kind,p){aiHandoff(aiPrompt(kind,p),"nutri",p&&p.image?{img:"data:image/jpeg;base64,"+p.image}:null);const e=new Error(L("Claude s'en charge : suis les étapes à l'écran, le résultat arrivera ici."));e.ai=true;return e}
// profil : métabolisme (Mifflin-St Jeor), dépense avec le sport, objectif selon le rythme, macros (mêmes règles prudentes qu'avant)
const SPORT_MET=[[/muscu|fitness|gym|halt|crossfit|weight|kracht/,5.5],[/course|running|jogg|run|lopen|hardlo/,9.8],[/v[eé]lo|cycl|bike|fiets|spinning/,7.5],[/nata|swim|zwem|piscine/,7],
  [/foot|basket|tennis|padel|hand|volley|rugby|hockey/,7],[/marche|walk|wandel|randon/,3.8],[/boxe|box|mma|judo|karat|combat|lutte/,9],[/yoga|pilates|stretch/,3],[/danse|dance|dans/,5.5]];
function nuProfileLocal(d){const w=+d.weight_kg||70,h=+d.height_cm||170,a=+d.age||30,male=d.sex==="male",goal=d.goal||"maintain";
  const bmr=Math.round(10*w+6.25*h-5*a+(male?5:-161));
  const sports=(d.sports||[]).map(x=>{const n=fold(x.sport||""),met=(SPORT_MET.find(([re])=>re.test(n))||[0,6])[1];return{sport:x.sport,kcal:Math.round(met*w*(+x.minutes_per_session||60)/60),freq:+x.times_per_week||0}});
  const tdee=Math.round(bmr*1.2+sports.reduce((s,x)=>s+x.kcal*x.freq,0)/7);
  const pace=d.pace||"realistic",PCT={lose:{drastic:.01,realistic:.006,relaxed:.0035},gain:{drastic:.005,realistic:.003,relaxed:.002}};
  const pct=goal==="maintain"?0:(PCT[goal]||PCT.lose)[pace]||PCT[goal].realistic,wk=Math.round(pct*w*100)/100,delta=Math.round(wk*7700/7);
  let target=goal==="lose"?tdee-delta:goal==="gain"?tdee+delta:tdee;if(goal==="lose")target=Math.max(target,bmr,male?1500:1200);target=Math.round(target);
  const p=Math.round(w*(goal==="lose"?2:goal==="gain"?1.8:1.6)),f=Math.round(Math.max(w*.8,target*.25/9)),c=Math.max(0,Math.round((target-p*4-f*9)/4));
  const warn=[];if(a<18)warn.push(T3("Moins de 18 ans : demande conseil à un médecin avant de changer ton alimentation.","Under 18: ask a doctor before changing your diet.","Jonger dan 18: vraag een arts om advies voor je je voeding verandert."));
  if(/enceinte|grossesse|allait|pregnan|breastfeed|zwanger|borstvoed|diab|trouble|anorex|boulim|eating disorder|eetstoornis/i.test(d.notes||""))warn.push(T3("Avec ce que tu indiques dans tes notes, demande l'avis d'un médecin ou d'un diététicien avant de suivre ces chiffres.","Given what you wrote in your notes, check with a doctor or dietitian before following these numbers.","Gezien wat je in je notities schreef: vraag een arts of diëtist om advies voor je deze cijfers volgt."));
  const tw=+d.target_weight_kg||0;let wg={realistic:true,weekly_change_kg:0,suggested_weeks:0,advice:""};
  if(tw){const diff=tw-w,dir=goal==="lose"?-1:goal==="gain"?1:0,weeks=wk?Math.ceil(Math.abs(diff)/wk):0,tf=+d.timeframe_weeks||0;
    if(dir&&Math.sign(diff)!==dir&&diff)wg={realistic:false,weekly_change_kg:dir*wk,suggested_weeks:0,advice:T3("Ce poids visé va dans le sens contraire de ton objectif : vérifie l'un des deux.","This target weight goes against your goal: check one of them.","Dit streefgewicht gaat tegen je doel in: controleer een van beide.")};
    else{const max=goal==="gain"?.005:.01,ok=!tf||Math.abs(diff)/tf<=max*w+1e-9;
      wg={realistic:ok,weekly_change_kg:dir*wk,suggested_weeks:weeks,advice:ok?T3(`À ce rythme (environ ${wk} kg par semaine), compte à peu près ${weeks} semaines. Tu peux y arriver !`,`At this pace (about ${wk} kg a week), count roughly ${weeks} weeks. You can do it!`,`In dit tempo (ongeveer ${wk} kg per week) reken je op zo'n ${weeks} weken. Dat lukt je!`)
        :T3(`En ${tf} semaines, il faudrait changer de plus de ${Math.round(max*w*10)/10} kg par semaine : c'est trop rapide pour rester en bonne santé. Compte plutôt ${weeks} semaines.`,`In ${tf} weeks you would need to change more than ${Math.round(max*w*10)/10} kg a week: too fast to stay healthy. Plan for about ${weeks} weeks instead.`,`In ${tf} weken zou je meer dan ${Math.round(max*w*10)/10} kg per week moeten veranderen: te snel om gezond te blijven. Reken eerder op ${weeks} weken.`)}}}
  const gl=T3({lose:"perdre du poids",gain:"prendre du poids",maintain:"garder ton poids"}[goal],{lose:"lose weight",gain:"gain weight",maintain:"keep your weight"}[goal],{lose:"af te vallen",gain:"aan te komen",maintain:"je gewicht te behouden"}[goal]);
  const explanation=T3(`Ton corps brûle environ ${bmr} kcal par jour au repos (formule de Mifflin-St Jeor). Avec ta vie de tous les jours et ton sport, tu dépenses environ ${tdee} kcal par jour. Pour ${gl}, vise ${target} kcal par jour${goal==="maintain"?"":` (environ ${wk} kg par semaine)`}. Protéines ${p} g, glucides ${c} g, lipides ${f} g : de quoi garder tes muscles et ton énergie.`,
    `Your body burns about ${bmr} kcal a day at rest (Mifflin-St Jeor formula). With daily life and your sport, you spend about ${tdee} kcal a day. To ${gl}, aim for ${target} kcal a day${goal==="maintain"?"":` (about ${wk} kg a week)`}. Protein ${p} g, carbs ${c} g, fat ${f} g: enough to keep your muscles and energy.`,
    `Je lichaam verbrandt in rust ongeveer ${bmr} kcal per dag (formule van Mifflin-St Jeor). Met je dagelijkse leven en je sport verbruik je ongeveer ${tdee} kcal per dag. Om ${gl}, mik op ${target} kcal per dag${goal==="maintain"?"":` (ongeveer ${wk} kg per week)`}. Eiwitten ${p} g, koolhydraten ${c} g, vetten ${f} g: genoeg om je spieren en energie te behouden.`);
  return {bmr_kcal:bmr,tdee_kcal:tdee,target_kcal:target,protein_g:p,carbs_g:c,fat_g:f,explanation,warnings:warn,weight_goal:wg,sports_kcal:sports.map(x=>({sport:x.sport,kcal_per_session:x.kcal}))}}
// ce qu'on demande à l'IA de la personne (elle lit et écrit dans Sid'note grâce au connecteur)
function aiPrompt(kind,p){const d=(p&&p.data)||{};
  if(kind==="aliment")return aiPrompt0(kind,p)+nuDayNote();
  return aiPrompt0(kind,p)}
// v44.4 : repas d'un jour passé → la date est dite à Claude (sinon il note le repas aujourd'hui)
function nuDayNote(){if(nuDay>=iso(today()))return "";const d=parse(nuDay),txt=`${DOWL[d.getDay()]} ${d.getDate()} ${MOL[d.getMonth()].toLowerCase()}`;
  return T3(` C'était le ${txt} : note-le à la date ${nuDay} (pas aujourd'hui).`,` It was on ${nuDay}: log it on that date (not today).`,` Het was op ${nuDay}: noteer het op die datum (niet vandaag).`)}
function aiPrompt0(kind,p){const d=(p&&p.data)||{};
  if(kind==="aliment"&&p.image)return T3("Je t'envoie la photo de mon assiette (je la joins). Estime ce que j'ai mangé et note-le dans Sid'note.","I'm sending you a photo of my plate (attached). Estimate what I ate and log it in Sid'note.","Ik stuur je een foto van mijn bord (bijgevoegd). Schat wat ik gegeten heb en noteer het in Sid'note.");
  if(kind==="aliment")return T3(`Note dans Sid'note ce que j'ai mangé : ${p.text}`,`Log in Sid'note what I ate: ${p.text}`,`Noteer in Sid'note wat ik gegeten heb: ${p.text}`);
  if(kind==="menu"){const meals=(d.meals||[]).map(m=>`${m.name} (~${m.kcal} kcal)`).join(", "),inc=d.must_include,exc=d.avoid;
    return T3(`Avec Sid'note : lis ma journée nutrition, puis compose-moi ${(d.meals||[]).length>1?"un menu pour la journée":"un repas"} : ${meals}.${inc?` À inclure : ${inc}.`:""}${exc?` À éviter : ${exc}.`:""}${d.notes?` ${d.notes}`:""} Poids crus en grammes, puis enregistre le menu dans Sid'note.`,
      `With Sid'note: read my nutrition day, then make me ${(d.meals||[]).length>1?"a menu for the day":"a meal"}: ${meals}.${inc?` Include: ${inc}.`:""}${exc?` Avoid: ${exc}.`:""}${d.notes?` ${d.notes}`:""} Raw weights in grams, then save the menu in Sid'note.`,
      `Met Sid'note: lees mijn voedingsdag en stel ${(d.meals||[]).length>1?"een dagmenu":"een maaltijd"} voor me samen: ${meals}.${inc?` Opnemen: ${inc}.`:""}${exc?` Vermijden: ${exc}.`:""}${d.notes?` ${d.notes}`:""} Rauwe gewichten in gram, en sla het menu op in Sid'note.`)}
  if(kind==="recette"){const f=(d.foods||[]).map(x=>`${x.food}${x.grams?` ${x.grams} g`:""}`).join(", ");
    return T3(`Avec Sid'note : donne-moi la recette de « ${d.name} » (${f}), avec exactement ces aliments et ces quantités, puis ajoute les étapes à ce repas dans mon menu Sid'note.`,`With Sid'note: give me the recipe for "${d.name}" (${f}) with exactly these foods and amounts, then add the steps to this meal in my Sid'note menu.`,`Met Sid'note: geef me het recept voor "${d.name}" (${f}) met precies deze ingrediënten en hoeveelheden, en voeg de stappen toe aan deze maaltijd in mijn Sid'note-menu.`)}
  if(kind==="bilan")return p.scope==="week"?T3("Avec Sid'note : fais le bilan nutrition de ma semaine (calories, macros, poids) : ce qui va bien, ce qui peut s'améliorer, et 2 ou 3 conseils concrets. Puis enregistre ce commentaire dans Sid'note pour que je le voie dans l'app.","With Sid'note: review my nutrition week (calories, macros, weight): what went well, what could improve, and 2 or 3 concrete tips. Then save this review in Sid'note so I can see it in the app.","Met Sid'note: maak een voedingsoverzicht van mijn week (calorieën, macro's, gewicht): wat goed ging, wat beter kan, en 2 of 3 concrete tips. Sla dit overzicht daarna op in Sid'note zodat ik het in de app zie.")
    :T3("Avec Sid'note : commente ma journée nutrition d'aujourd'hui et donne-moi 1 ou 2 conseils pour la suite. Puis enregistre ce commentaire dans Sid'note pour que je le voie dans l'app.","With Sid'note: comment on my nutrition today and give me 1 or 2 tips for the rest of the day. Then save this comment in Sid'note so I can see it in the app.","Met Sid'note: geef commentaar op mijn voedingsdag van vandaag en 1 of 2 tips voor de rest van de dag. Sla dit commentaar daarna op in Sid'note zodat ik het in de app zie.");
  return T3("Avec Sid'note : aide-moi pour ma nutrition.","With Sid'note: help me with my nutrition.","Met Sid'note: help me met mijn voeding.")}
const nuErrMsg=ex=>ex instanceof TypeError?L("Pas de connexion internet"):ex.status===404?L("La fonction « nutrition » n'est pas encore installée sur Supabase."):ex.message;
// animation pendant que Claude travaille
function nuLoading(el,msgs){const EM=[""];let i=0;
  el.innerHTML=`<div class="loadcard" role="status"><div class="load-em">${EM[0]}</div><div class="load-msg">${L(msgs[0])}</div><div class="load-bar"><i></i></div><div class="shim"></div><div class="shim" style="width:70%"></div></div>`;
  const t=setInterval(()=>{i++;const e=el.querySelector(".load-em"),m=el.querySelector(".load-msg");if(!e){clearInterval(t);return}e.textContent=EM[i%EM.length];m.textContent=L(msgs[i%msgs.length])},1300);
  return()=>clearInterval(t)}
// --- profil ---
function nuFillForm(){
  const p=NU().profile||{};nuDraft={sex:p.sex||"",goal:p.goal||"",pace:p.pace||"real",sports:(p.sports||[]).map(x=>({name:x.name,freq:x.freq||"",dur:fmtDur(x.min)}))};
  $("nuAge").value=p.age||"";$("nuHeight").value=p.height||"";$("nuWeight").value=p.weight?String(p.weight).replace(".",LANG==="en"?".":","):"";$("nuNotes").value=p.notes||"";
  $("nuTarget").value=p.target?String(p.target).replace(".",LANG==="en"?".":","):"";$("nuDur").value=p.dur||"";$("nuDurU").value=p.durU||"m";
  if(!nuDraft.sports.length)nuDraft.sports.push({name:"",freq:"",dur:""});
  $("nuErr").hidden=true;nuDraftRender();
}
function nuDraftRender(){
  document.querySelectorAll("#nuSex button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.sex===nuDraft.sex));
  document.querySelectorAll("#nuGoal button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.goal===nuDraft.goal));
  document.querySelectorAll("#nuPace button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.pace===nuDraft.pace));
  $("nuPaceWrap").hidden=!nuDraft.goal||nuDraft.goal==="maintain";
  $("nuSports").innerHTML=nuDraft.sports.map((x,i)=>`<div class="nu-sport">
    <input class="nu-name" data-sp="${i}" data-f="name" value="${esc(x.name)}" placeholder="${L("Ex. Musculation")}" aria-label="${L("Sport")}" autocomplete="off">
    <button type="button" class="x" data-sprm="${i}" aria-label="${L("Retirer ce sport")}">×</button>
    <label class="nu-f"><span>${L("Fois par semaine")}</span><span class="nu-in"><input data-sp="${i}" data-f="freq" type="text" inputmode="numeric" maxlength="2" value="${esc(x.freq)}" autocomplete="off"><i>${L("/sem")}</i></span></label>
    <label class="nu-f"><span>${L("Durée d'une séance")}</span><span class="nu-in"><input data-sp="${i}" data-f="dur" type="text" maxlength="6" value="${esc(x.dur)}" placeholder="1h30" autocomplete="off"></span></label></div>`).join("");
}
$("nuSports").addEventListener("input",e=>{const i=e.target.dataset.sp;if(i!==undefined)nuDraft.sports[+i][e.target.dataset.f]=e.target.value});
$("nuSports").addEventListener("click",e=>{const b=e.target.closest("[data-sprm]");if(!b)return;nuDraft.sports.splice(+b.dataset.sprm,1);nuDraftRender()});
$("nuSportAdd").addEventListener("click",()=>{nuDraft.sports.push({name:"",freq:"",dur:""});nuDraftRender();const ins=$("nuSports").querySelectorAll('[data-f="name"]');ins[ins.length-1].focus()});
$("nuSex").addEventListener("click",e=>{const b=e.target.closest("[data-sex]");if(b){nuDraft.sex=b.dataset.sex;nuDraftRender()}});
$("nuGoal").addEventListener("click",e=>{const b=e.target.closest("[data-goal]");if(b){nuDraft.goal=b.dataset.goal;nuDraftRender()}});
$("nuPace").addEventListener("click",e=>{const b=e.target.closest("[data-pace]");if(b){nuDraft.pace=b.dataset.pace;nuDraftRender()}});
$("nuCancel").addEventListener("click",()=>{nuEditing=false;renderNutri()});
$("nuEditProfile").addEventListener("click",()=>{nuEditing=true;nuFillForm();
  // v31 : le délai est pré-rempli avec celui que l'analyse vient de conseiller (en semaines, ou en mois au-delà de 12 semaines)
  const n=NU(),wg=n.plan&&n.plan.wg;if(wg&&wg.weeks>0&&n.profile&&n.profile.target){const w=Math.round(wg.weeks);
    if(w>12){$("nuDur").value=String(Math.round(w/4.345));$("nuDurU").value="m"}else{$("nuDur").value=String(w);$("nuDurU").value="w"}}
  renderNutri();window.scrollTo(0,0)});
$("nuForm").addEventListener("submit",async e=>{
  e.preventDefault();if(nuBusy||!nutriAllowed())return;
  const fail=m=>{$("nuErr").textContent=L(m);$("nuErr").hidden=false;$("nuErr").scrollIntoView({block:"center"})};
  const age=numIn($("nuAge").value),height=numIn($("nuHeight").value),weight=numIn($("nuWeight").value);
  if(!nuDraft.sex)return fail("Indique ton sexe.");
  if(!(age>=10&&age<=100))return fail("Indique ton âge.");
  if(!(height>=100&&height<=250))return fail("Indique ta taille en cm.");
  if(!(weight>=25&&weight<=300))return fail("Indique ton poids en kg.");
  if(!nuDraft.goal)return fail("Choisis ton objectif.");
  const keep=nuDraft.goal!=="maintain",target=keep?numIn($("nuTarget").value):0,dur=keep&&target?Math.round(numIn($("nuDur").value)):0,durU=$("nuDurU").value;
  if(target&&!(target>=30&&target<=300))return fail("Indique un poids visé en kg.");
  const weeks=dur?Math.round((durU==="m"?dur*4.35:dur)*10)/10:0;
  const sports=nuDraft.sports.map(x=>({name:String(x.name||"").trim(),freq:Math.round(numIn(x.freq)),min:parseDur(x.dur)})).filter(x=>x.name);
  const profile={sex:nuDraft.sex,age,height,weight,sports,goal:nuDraft.goal,pace:keep?nuDraft.pace:"",target,dur,durU,notes:$("nuNotes").value.trim().slice(0,800)};
  $("nuErr").hidden=true;nuBusy="profil";const btn=$("nuCalc");btn.disabled=true;btn.hidden=true;
  const box=document.createElement("div");btn.after(box);const stop=nuLoading(box,["Calcul de ton métabolisme…","Prise en compte de tes sports…","Calcul de tes macros…"]);
  try{
    const r=await nuCall("profil",{data:{sex:profile.sex==="h"?"male":"female",age,height_cm:height,weight_kg:weight,
      sports:sports.map(x=>({sport:x.name,times_per_week:x.freq,minutes_per_session:x.min})),goal:profile.goal,pace:{fast:"drastic",real:"realistic",easy:"relaxed"}[profile.pace]||null,
      target_weight_kg:target||null,timeframe_weeks:weeks||null,notes:profile.notes}});
    const n=NU();n.profile=profile;n.plan={bmr:r0(r.bmr_kcal),tdee:r0(r.tdee_kcal),kcal:r0(r.target_kcal),p:r0(r.protein_g),c:r0(r.carbs_g),f:r0(r.fat_g),
      text:String(r.explanation||""),warn:(r.warnings||[]).map(String),at:new Date().toISOString()};
    n.plan.kps={};(r.sports_kcal||[]).forEach(x=>{if(x&&x.sport)n.plan.kps[norm(x.sport)]=r0(x.kcal_per_session)});
    const wg=r.weight_goal||{};if(target)n.plan.wg={ok:wg.realistic!==false,wk:r1(wg.weekly_change_kg),weeks:r0(wg.suggested_weeks),advice:String(wg.advice||"")};
    // le poids du profil devient la première mesure du graphique
    if(!n.weights.some(w=>w.day===iso(today())))n.weights.push({id:uid(),day:iso(today()),kg:weight,upd:Date.now()});
    n.upd=Date.now();nuEditing=false;save();renderNutri();window.scrollTo(0,0);toast("Tes besoins sont calculés");
  }catch(ex){fail(nuErrMsg(ex))}
  stop();box.remove();nuBusy="";btn.disabled=false;btn.hidden=false;
});
// --- sport de la semaine : le nombre de séances peut changer d'une semaine à l'autre, l'objectif suit ---
// plan.kps = calories d'une séance par sport (donné par Claude) ; à défaut, estimation simple (6 MET × poids × durée)
const sportKps=()=>{const n=NU(),pl=n.plan||{},p=n.profile||{},m={};(p.sports||[]).forEach(s=>{const c=(pl.kps||{})[norm(s.name)];m[s.name]=c||Math.round(6*(p.weight||70)*((s.min||60)/60))});return m};
const wKey=d=>iso(mondayOf(parse(d)));
function weekSports(wk){const n=NU(),p=n.profile||{},o=(n.wsports||{})[wk]||{},k=sportKps();
  return (p.sports||[]).map(s=>({name:s.name,base:s.freq||0,count:o[s.name]!=null?o[s.name]:(s.freq||0),kps:k[s.name]||0}))}
function dayTarget(d){const pl=NU().plan||{},delta=Math.round(weekSports(wKey(d)).reduce((a,s)=>a+(s.count-s.base)*s.kps,0)/7);
  return{kcal:(pl.kcal||0)+delta,p:pl.p||0,c:Math.max(0,(pl.c||0)+Math.round(delta/4)),f:pl.f||0,delta}}
function renderNuWeek(){
  const ws=weekSports(wKey(nuDay)),el=$("nuWeek");el.hidden=!ws.length;if(!ws.length)return;
  const m=parse(wKey(nuDay)),e=new Date(m);e.setDate(e.getDate()+6),t=dayTarget(nuDay);
  el.innerHTML=`<div class="nu-week-h"><b>${IC("activity")} ${L("Ton sport cette semaine")}</b><span class="small muted">${m.getDate()} ${MO[m.getMonth()]} – ${e.getDate()} ${MO[e.getMonth()]}</span></div>`+
    ws.map(s=>`<div class="nu-wsp"><div class="grow"><b class="notr">${esc(s.name)}</b><span class="small muted">≈ ${s.kps} kcal ${L("par séance")}${s.count!==s.base?` · ${L("d'habitude")} ${s.base}`:""}</span></div><div class="stepper"><button type="button" data-ws="${esc(s.name)}" data-d="-1" aria-label="${L("Une séance de moins")}">−</button><output>${s.count}</output><button type="button" data-ws="${esc(s.name)}" data-d="1" aria-label="${L("Une séance de plus")}">+</button></div></div>`).join("")+
    `<div class="small">${L("Objectif par jour cette semaine")} : <b>${fmtFull(t.kcal)} kcal</b>${t.delta?` <span class="muted">(${t.delta>0?"+":""}${t.delta} ${L("selon ton sport")})</span>`:""}</div>`;
}
$("nuWeek").addEventListener("click",e=>{const b=e.target.closest("[data-ws]");if(!b)return;const n=NU(),wk=wKey(nuDay);n.wsports=n.wsports||{};const o=n.wsports[wk]=n.wsports[wk]||{};
  const cur=weekSports(wk).find(s=>s.name===b.dataset.ws);if(!cur)return;o[cur.name]=Math.max(0,Math.min(21,cur.count+ +b.dataset.d));n.upd=Date.now();save();renderNutri()});
// --- journée ---
const dayLog=d=>NU().log.filter(x=>x.day===d).sort((a,b)=>(a.at||"").localeCompare(b.at||""));
const sumOf=list=>list.reduce((s,x)=>({kcal:s.kcal+(+x.kcal||0),p:s.p+(+x.p||0),c:s.c+(+x.c||0),f:s.f+(+x.f||0)}),{kcal:0,p:0,c:0,f:0});
function nuDayLabel(d){const t=iso(today()),dt=parse(d),y=new Date(today());y.setDate(y.getDate()-1);
  if(d===t)return L("Aujourd'hui");if(d===iso(y))return L("Hier");return `${DOW[dt.getDay()]} ${dt.getDate()} ${MO[dt.getMonth()]}`}
// barre et pastilles de macros d'un plat
function macroHtml(s){const tot=(s.p*4+s.c*4+s.f*9)||1;
  return `<div class="mbar" aria-hidden="true">${MAC.map(([k,,v])=>`<i style="--c:var(${v});width:${(k==="f"?9:4)*s[k]/tot*100}%"></i>`).join("")}</div>
    <div class="mchips">${MAC.map(([k,l,v])=>`<span class="mchip"><b>${r1(s[k])} g</b><span><span class="mdot" style="--c:var(${v})"></span>${L(l)}</span></span>`).join("")}</div>`}
const thumbs=new Map();
const thumbKey=g=>session.user.id+":thumb:"+g;
async function loadThumb(g){if(thumbs.has(g))return;thumbs.set(g,null);const b=await idb.get(thumbKey(g));if(b){thumbs.set(g,b);document.querySelectorAll(`[data-thumb="${g}"]`).forEach(el=>el.innerHTML=`<img src="${b}" alt="">`)}}
// barres des macros (ancien rendu, gardé en secours de la version React)
function nuMacrosHtml(s,tg){return MAC.map(([k,l,v])=>`<div class="nu-m"><div class="top"><b><span class="mdot" style="--c:var(${v})"></span>${L(l)}</b><span>${r0(s[k])} / ${tg[k]} g</span></div><div class="bar"><i style="--c:var(${v});width:${Math.min(100,tg[k]?s[k]/tg[k]*100:0)}%"></i></div></div>`).join("");}
function renderNutri(){try{renderAiCards()}catch(e){}
  if(!$("nuMain"))return;
  applySoon();
  const n=NU(),has=!!(n.plan&&n.plan.kcal);
  $("nuProfile").hidden=has&&!nuEditing;$("nuMain").hidden=!has||nuEditing;$("nuCancel").hidden=!has;
  $("nuProfSub").textContent=L(has?"Modifie tes infos : tes besoins sont recalculés.":"Présente-toi en quelques infos : on calcule ton métabolisme, tes besoins du jour et tes macros.");
  if(!has||nuEditing){if(!nuDraft)nuFillForm();return}
  const pl=n.plan,list=dayLog(nuDay),s=sumOf(list),tg=dayTarget(nuDay);
  $("nuGoalCard").innerHTML=nuGoalHtml();$("nuGoalCard").hidden=!pl.wg||(pl.wg.ok&&pl.wgSeen);$("nuGoalCard").classList.toggle("ok",!!(pl.wg&&pl.wg.ok));
  $("nuDayTxt").textContent=nuDayLabel(nuDay);$("nuDate").value=nuDay;$("nuNext").disabled=nuDay>=iso(today());renderNuCal();
  // v44.4 : le jour du repas se choisit aussi dans « Ajouter ce que tu manges » (jours passés)
  $("nuForTxt").textContent=nuDayLabel(nuDay);$("nuForDate").value=nuDay;$("nuForDate").max=iso(today());$("nuForNext").disabled=nuDay>=iso(today());$("nuFor").classList.toggle("past",nuDay<iso(today()));
  const pct=Math.min(1,s.kcal/tg.kcal);$("nuRing").style.strokeDashoffset=326.73*(1-pct);
  $("nuRing").closest(".nu-ring").classList.toggle("over",s.kcal>tg.kcal*1.05);
  $("nuKcal").textContent=r0(s.kcal);
  $("nuKcalOf").innerHTML=`${L("sur")} ${tg.kcal} kcal<br>`+(s.kcal>tg.kcal?`<b style="color:var(--late)">+${r0(s.kcal-tg.kcal)}</b>`:`${L("reste")} ${r0(tg.kcal-s.kcal)}`);
  // v52 (ticket #3) : barres des macros dessinées par React (app/src/Small.tsx) ; ancien rendu en secours
  if(window.SCIslands&&window.SCIslands.nuMacros&&!window.__noIslands){try{window.SCIslands.nuMacros($("nuMacros"),{rows:MAC.map(([k,l,v])=>({k,label:l,c:v,val:s[k],target:tg[k]})),i18n:{L,MOL,MO,DOWL}})}catch(e){reportErr("island nuMacros: "+(e&&e.message));$("nuMacros").innerHTML=nuMacrosHtml(s,tg)}}
  else $("nuMacros").innerHTML=nuMacrosHtml(s,tg);
  $("nuLogH").textContent=nuDay===iso(today())?L("Ma journée"):L("Ce jour-là");
  // plats du jour : une carte par plat, ses aliments dedans
  const groups=[];list.forEach(x=>{const g=x.grp||x.id;let G=groups.find(y=>y.g===g);if(!G){G={g,items:[],name:x.gname||x.name,em:x.gem||x.em||"🍽️",at:x.at};groups.push(G)}G.items.push(x)});
  $("nuLog").innerHTML=groups.length?groups.map(G=>{const t=sumOf(G.items),d=new Date(G.at);
    return `<details class="dish" open><summary class="dish-h"><span class="dish-ic" data-thumb="${G.g}">${mono(G.name)}</span>
      <span class="dish-t"><b class="notr">${esc(G.name)}</b><span class="dish-time">${two(d.getHours())}:${two(d.getMinutes())}</span>${G.items.length>1?` <span class="small muted">· ${G.items.length} ${L("aliments")}</span>`:""}</span>
      <span class="dish-kcal">${r0(t.kcal)}<small>kcal</small></span><button type="button" class="pen nu-cp" data-nucopy="${G.g}" aria-label="${L("Copier ce repas sur d'autres jours")}" title="${L("Copier sur d'autres jours")}">+</button>${G.items.length===1?`<button class="pen" data-nuedit="${G.items[0].id}" aria-label="${L("Modifier")}">${PEN}</button>`:""}<button type="button" class="x" data-nudelg="${G.g}" aria-label="${L("Supprimer ce plat")}">×</button></summary>
      ${macroHtml(t)}${G.items.length===1?`<div class="dish-note">${qtyCell("log:"+G.items[0].id,G.items[0])}</div>`:`<div class="dish-items">${G.items.map(x=>`<div class="dish-it"><span class="em">·</span><div class="grow"><b class="notr">${esc(x.name)}</b>${qtyCell("log:"+x.id,x)}</div><span class="k">${r0(x.kcal)} kcal</span><button class="pen" data-nuedit="${x.id}" aria-label="${L("Modifier")}">${PEN}</button><button class="x" data-nudel="${x.id}" aria-label="${L("Supprimer")}">×</button></div>`).join("")}</div>`}</details>`}).join("")
    :`<div class="card"><div class="empty">${L(nuDay===iso(today())?"Rien pour l'instant. Écris ce que tu manges ci-dessus, ou prends ton plat en photo.":"Rien d'enregistré ce jour-là. Tu peux encore le compléter.")}</div></div>`;
  groups.forEach(G=>loadThumb(G.g));
  renderNuResult();renderNuPlan();renderNuMenu();renderMenuForm();renderNuWeek();renderMenuLeft();nuShowTab();
  if(qtyEd){const i=$("qtyEdIn");if(i&&document.activeElement!==i){i.focus();i.select()}}
}
// trois onglets : la journée, les menus, le profil (on se souvient du dernier ouvert)
function nuShowTab(){const t=data.ui.nuTab||"day";
  document.querySelectorAll("#nuTabs [data-nutab]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.nutab===t));
  document.querySelectorAll("#nuMain [data-nupane]").forEach(p=>p.hidden=p.dataset.nupane!==t)}
function nuGoTab(t){data.ui.nuTab=t;saveUI();nuShowTab();const tb=$("nuTabs");if(tb.getBoundingClientRect().top<0)tb.scrollIntoView({block:"start"})}
$("nuTabs").addEventListener("click",e=>{const b=e.target.closest("[data-nutab]");if(b)nuGoTab(b.dataset.nutab)});
$("nuMain").addEventListener("click",e=>{const b=e.target.closest("[data-nugo]");if(b)nuGoTab(b.dataset.nugo)});
// --- quantité modifiable directement (journée et analyse) : calories et macros suivent ---
let qtyEd=null;
function qtyCell(key,x){
  if(qtyEd===key)return `<span class="qty-in"><input id="qtyEdIn" value="${esc(x.qty||"")}" placeholder="${L("Ex. 150 g")}" aria-label="${L("Quantité")}" autocomplete="off" enterkeyhint="done"><button type="button" class="mini" data-qok="${key}">OK</button></span>`;
  return `<button type="button" class="qty-ed notr" data-qed="${key}">${esc(qtyTxt(x)||L("Ajouter une quantité"))} ✎</button>`}
// « 2 c. à soupe » d'huile → grammes ; « 150 g » → 150 ; sinon le premier nombre
function toGrams(name,t){t=String(t||"").toLowerCase().replace(",",".");
  const sp=t.match(/(\d+(?:\.\d+)?)\s*(?:c\.?|cuill[eè]res?)\s*(?:à|a)?\s*(soupe|s\b|caf[ée]|c\b)/),S=SPOONS.find(([re])=>re.test(name||""));
  if(sp&&S)return +sp[1]*(/^s/.test(sp[2])?S[1]:S[2]);const g=t.match(/(\d+(?:\.\d+)?)\s*g\b/);return g?+g[1]:0}
function scaleQty(x,q){const a=toGrams(x.name,x.qty),b=toGrams(x.name,q),k=a>0&&b>0?b/a:(qtyNum(x.qty)>0&&qtyNum(q)>0?qtyNum(q)/qtyNum(x.qty):0);
  x.qty=q;if(x.g&&b)x.g=r0(b);if(!k){if(q)toast("Quantité sans chiffre : calories inchangées");return}
  x.kcal=r0(x.kcal*k);x.p=r1(x.p*k);x.c=r1(x.c*k);x.f=r1(x.f*k)}
function qtyCommit(key){const inp=$("qtyEdIn");if(!inp){qtyEd=null;return}const q=inp.value.trim(),[kind,id]=key.split(":");qtyEd=null;
  if(kind==="log"){const x=NU().log.find(e=>e.id===id);if(x&&q!==x.qty){scaleQty(x,q);x.upd=Date.now();save();toast("Quantité mise à jour")}renderNutri()}
  else if(nuPending){const x=nuPending.items[+id];if(x&&q!==x.qty)scaleQty(x,q);renderNuResult()}}
["nuLog","nuResult"].forEach(id=>{$(id).addEventListener("click",e=>{const b=e.target.closest("[data-qed],[data-qok]");if(!b)return;e.preventDefault();e.stopPropagation();
    if(b.dataset.qok){qtyCommit(b.dataset.qok);return}if(qtyEd)qtyCommit(qtyEd);qtyEd=b.dataset.qed;if(id==="nuLog")renderNutri();else{renderNuResult();const i=$("qtyEdIn");if(i){i.focus();i.select()}}},true);
  $(id).addEventListener("keydown",e=>{if(e.target.id==="qtyEdIn"&&e.key==="Enter"){e.preventDefault();qtyCommit(qtyEd)}else if(e.target.id==="qtyEdIn"&&e.key==="Escape"){qtyEd=null;id==="nuLog"?renderNutri():renderNuResult()}})});
// objectif de poids : chemin conseillé, et alerte si le délai choisi n'est pas réaliste
function nuGoalHtml(){
  const n=NU(),pl=n.plan,p=n.profile||{},w=pl&&pl.wg;if(!w||!p.target)return"";
  const unit=p.durU==="m"?(LANG==="en"?(p.dur>1?"months":"month"):LANG==="nl"?(p.dur>1?"maanden":"maand"):"mois"):L(p.dur>1?"semaines":"semaine");
  const pace=w.wk?`${w.wk>0?"+":""}${String(w.wk).replace(".",LANG==="en"?".":",")} kg ${L("par semaine")}`:"";
  const PACE={fast:"Drastique",real:"Réaliste",easy:"À mon aise"}[p.pace];
  return `<b>${w.ok?"✓ ":IC("alert")+" "}${p.weight} → ${p.target} kg${p.dur?` ${L("en")} ${p.dur} ${unit}`:""}</b>
    ${PACE?`<span class="small">${L("Rythme")} : ${L(PACE)}</span>`:""}
    ${p.dur?`<span class="small">${L(w.ok?"Ton délai est réaliste.":"Ce délai n'est pas réaliste, ni bon pour ta santé.")}</span>`:""}
    ${w.advice?`<span class="small muted notr">${esc(w.advice)}</span>`:""}
    ${pace||w.weeks?`<span class="small"><b>${L("Chemin conseillé")} :</b> ${pace}${pace&&w.weeks?" · ":""}${w.weeks?`${L("environ")} ${w.weeks} ${L("semaines")}`:""}</span>`:""}
    ${w.ok?`<button type="button" class="mini" data-nugoalok="1" style="justify-self:start;margin-top:4px">${L("OK, compris")}</button>`:`<button type="button" class="mini" data-nugoaledit="1" style="justify-self:start;margin-top:4px">${L("Changer mon objectif")}</button>`}`;
}
$("nuGoalCard").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;
  if(b.dataset.nugoalok){NU().plan.wgSeen=true;save();renderNutri()}
  else if(b.dataset.nugoaledit){nuEditing=true;nuFillForm();renderNutri();window.scrollTo(0,0);setTimeout(()=>$("nuTarget").focus(),100)}});
const boxes=(items)=>`<div class="nu-plan ${items.length===4?"four":""}">${items.map(([v,l,c])=>`<div><b>${v}</b><span>${c?`<span class="mdot" style="--c:var(${c})"></span>`:""}${L(l)}</span></div>`).join("")}</div>`;
function renderNuPlan(){
  const pl=NU().plan;if(!pl)return;
  $("nuPlan").innerHTML=boxes([[pl.bmr,"Métabolisme de base"],[pl.tdee,"Dépense du jour"],[pl.kcal,"Objectif (kcal)"]])+
    boxes([[pl.p+" g","Protéines","--m-p"],[pl.c+" g","Glucides","--m-c"],[pl.f+" g","Lipides","--m-f"]])+
    `${pl.wg?`<div class="card nu-goalcard ${pl.wg.ok?"ok":""}" style="background:var(--bg)">${nuGoalHtml().replace(/<button[^>]*>.*?<\/button>/,"")}</div>`:""}
    <p class="small notr" style="margin:0 4px">${esc(pl.text)}</p>${pl.warn.map(w=>`<div class="nu-warn notr">${esc(w)}</div>`).join("")}`;
}
function nuSetDay(d){nuDay=d>iso(today())?iso(today()):d;nuPending=null;renderNutri()}
$("nuFor").addEventListener("click",e=>{const b=e.target.closest("[data-nufor]");if(!b)return;const d=parse(nuDay);d.setDate(d.getDate()+ +b.dataset.nufor);nuSetDay(iso(d))});
$("nuForDate").addEventListener("change",e=>{if(e.target.value)nuSetDay(e.target.value)});
$("nuPrev").addEventListener("click",()=>{const d=parse(nuDay);d.setDate(d.getDate()-1);nuSetDay(iso(d))});
$("nuNext").addEventListener("click",()=>{const d=parse(nuDay);d.setDate(d.getDate()+1);nuSetDay(iso(d))});
$("nuDate").addEventListener("change",e=>{if(e.target.value)nuSetDay(e.target.value)});
// heure de l'entrée : maintenant si c'est aujourd'hui, sinon midi (modifiable)
const nuAt=(time)=>{const d=parse(nuDay),now=new Date();
  if(time){const[h,m]=time.split(":").map(Number);d.setHours(h,m)}else if(nuDay===iso(today()))d.setHours(now.getHours(),now.getMinutes());else d.setHours(12,0);
  return d.toISOString()};
// champ qui s'agrandit en écrivant
const grow=t=>{t.style.height="auto";t.style.height=Math.max(56,t.scrollHeight+2)+"px"};
$("nuAsk").addEventListener("input",e=>grow(e.target));
$("nuAsk").addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();$("nuAskForm").requestSubmit()}});
// photo du plat : réduite (1280 px) pour l'envoi, et une vignette gardée sur l'appareil
function shrink(file,max,q){return new Promise((res,rej)=>{const u=URL.createObjectURL(file),im=new Image();
  im.onload=()=>{const k=Math.min(1,max/Math.max(im.naturalWidth,im.naturalHeight)),c=document.createElement("canvas");c.width=Math.round(im.naturalWidth*k);c.height=Math.round(im.naturalHeight*k);
    const g=c.getContext("2d");g.imageSmoothingQuality="high";g.drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);res(c.toDataURL("image/jpeg",q))};
  im.onerror=()=>{URL.revokeObjectURL(u);rej(new Error("image"))};im.src=u})}
// v43 (demande de Sid) : photo du plat → « Envoyer à Claude », et c'est tout. La photo est déposée tout de suite dans le
// dossier privé de la personne (Storage, documents/<uid>/repas-<horodatage>.jpg) ; son Claude la lit par le connecteur
// (outil photo_repas), estime le repas et le note ; la photo est effacée dès qu'elle a été lue (au plus tard après 24 h).
const nuDirect=()=>!!(session&&!isTrial()&&data.prefs.aiOk&&(aiCur()||AIS.claude)&&navigator.onLine);
function nuPhotoUp(){if(!nuPhoto||!nuDirect())return;const ph=nuPhoto,path=`documents/${session.user.id}/repas-${Date.now()}.jpg`;
  ph.up=(async()=>{const b=await (await fetch(ph.big)).blob();await stor("POST",path,b,"image/jpeg");ph.done=path;return path})();ph.up.catch(()=>{});return ph.up}
const nuPhotoDrop=ph=>{if(ph&&ph.up)ph.up.then(p=>stor("DELETE",p)).catch(()=>{})}
function nuAskLbl(){$("nuAskBtn").textContent=L(nuPhoto&&nuDirect()?"Envoyer à Claude":"Analyser")}
$("nuPhoto").addEventListener("change",async e=>{const f=e.target.files[0];e.target.value="";if(!f)return;
  try{nuPhoto={big:await shrink(f,1280,.8),small:await shrink(f,240,.7)};
    $("nuPhotoPrev").hidden=false;$("nuPhotoPrev").innerHTML=`<img src="${nuPhoto.small}" alt="${L("Photo du plat")}"><button type="button" aria-label="${L("Retirer la photo")}" data-nuphrm="1">×</button>`;
    if(nuDirect()){if(await nuConsent())nuPhotoUp()}nuAskLbl()}
  catch(ex){toast("Photo illisible")}});
$("nuPhotoPrev").addEventListener("click",e=>{if(e.target.closest("[data-nuphrm]")){nuPhotoDrop(nuPhoto);nuPhoto=null;$("nuPhotoPrev").hidden=true;$("nuPhotoPrev").innerHTML="";nuAskLbl()}});
// envoi direct : Claude s'ouvre avec le message ; la fenêtre est ouverte pendant le toucher (sinon le navigateur la bloque)
// Sur iPhone (app installée), un lien vers Claude ouvre une petite fenêtre de navigateur qui passe la main à l'app Claude,
// puis reste vide derrière : on la garde sous la main et on la ferme dès que la personne revient dans Sid'compagnon
let extWin=null;
function extOpen(u){
  // app installée sur iPhone : on ouvre directement l'app Claude (adresse claude://…), sans fenêtre de navigateur qui resterait blanche ;
  // le message est aussi copié (au cas où l'app ne le pré-remplit pas) ; si l'app Claude ne s'ouvre pas, repli sur le lien web
  if(navigator.standalone&&/^https:\/\/claude\.ai\//.test(u)){
    try{const q=new URL(u).searchParams.get("q");if(q&&navigator.clipboard)navigator.clipboard.writeText(q).catch(()=>{})}catch(e){}
    location.href="claude://"+u.slice(8);setTimeout(()=>{if(!document.hidden)location.href=u},1600);return null}
  const w=window.open(u,"_blank");if(w){try{w.opener=null}catch(e){}extWin=w}return w}
document.addEventListener("visibilitychange",()=>{if(document.hidden||!extWin)return;const w=extWin;extWin=null;setTimeout(()=>{try{if(!w.closed)w.close()}catch(e){}},250)});
$("nuAiLink").addEventListener("click",e=>{e.preventDefault();const dn=nuDayNote();aiGo("nutri",dn?T3("Note dans Sid'note ce que j'ai mangé.","Log in Sid'note what I ate.","Noteer in Sid'note wat ik gegeten heb.")+dn+T3(" J'ai mangé : "," I ate: "," Ik heb gegeten: "):T3("J'ai mangé : ","I ate: ","Ik heb gegeten: "))});
document.addEventListener("click",e=>{const a=e.target.closest&&e.target.closest('a[target="_blank"][href^="https://claude.ai/"]');if(!a||e.defaultPrevented)return;e.preventDefault();extOpen(a.href)});
// « Envoyer à Claude » : la photo déposée (repas-…) est renommée envoi-… ; le connecteur la joint à nutrition_journee, un outil que
// Claude connaît déjà (sa liste d'outils peut dater d'avant photo_repas), puis l'efface
function nuPhotoMark(ph){const src=ph.done,dst=src.replace("/repas-","/envoi-"),key=x=>x.replace(/^documents\//,"");
  return (async()=>{const r=await fetch(SUPABASE_URL+"/storage/v1/object/move",{method:"POST",headers:{apikey:SUPABASE_KEY,Authorization:"Bearer "+await token(),"Content-Type":"application/json"},
    body:JSON.stringify({bucketId:"documents",sourceKey:key(src),destinationKey:key(dst)})});if(!r.ok)throw new Error("move "+r.status)})()
    .catch(async()=>{await stor("POST",dst,await (await fetch(ph.big)).blob(),"image/jpeg")})}
function nuPhotoSend(q){const ph=nuPhoto;
  const msg=T3(`Avec Sid'note : lis ma journée nutrition (nutrition_journee) : la photo de mon assiette que je viens d'envoyer y est jointe. Estime ce que j'ai mangé, puis note-le avec noter_repas.${q?` Précision : ${q}`:""}${nuDayNote()}`,
    `With Sid'note: read my nutrition day (nutrition_journee): the photo of my plate I just sent is attached to it. Estimate what I ate, then log it with noter_repas.${q?` Note: ${q}`:""}${nuDayNote()}`,
    `Met Sid'note: lees mijn voedingsdag (nutrition_journee): de foto van mijn bord die ik net stuurde zit erbij. Schat wat ik gegeten heb en noteer het met noter_repas.${q?` Toelichting: ${q}`:""}${nuDayNote()}`);
  const clear=()=>{nuPhoto=null;$("nuPhotoPrev").hidden=true;$("nuPhotoPrev").innerHTML="";$("nuAsk").value="";grow($("nuAsk"));nuAskLbl()};
  // Claude s'ouvre tout de suite, pendant le toucher (une fenêtre vide remplie plus tard reste blanche dans l'app installée sur iPhone) ;
  // la photo finit de partir pendant que Claude s'ouvre (elle est en général déjà déposée depuis la prise de vue)
  // v44 : dans la conversation Nutrition si elle est réglée (le message est copié : il suffit de coller), sinon une nouvelle conversation
  const conv=aiGo("nutri",msg,true);clear();if(conv==="chat")toast("Prompt copié, colle-le dans la conversation");
  (ph.up||nuPhotoUp()||Promise.reject()).then(()=>nuPhotoMark(ph)).then(()=>toast(conv==="chat"?"Photo envoyée. Prompt copié, colle-le dans la conversation":"Photo envoyée : Claude note le repas, il arrivera ici"),
    ()=>toast("Envoi de la photo impossible : réessaie"))}
// un aliment renvoyé par l'IA apparaît-il dans ce que la personne a écrit ? (racine des mots, sans accents)
const nz=x=>String(x||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase();
function mentioned(q,name){const Q=nz(q),stems=nz(name).split(/[^a-z0-9]+/).filter(w=>w.length>=3&&!/^(les|des|une|avec|sans|aux|the|and|with|cuit|cuite|nature|frais|fraiche|maison)$/.test(w));
  return !stems.length||stems.some(w=>Q.includes(w.length>5?w.slice(0,5):w.replace(/[sx]$/,"")))}
$("nuAskForm").addEventListener("submit",async e=>{
  e.preventDefault();const q=$("nuAsk").value.trim();if((!q&&!nuPhoto)||nuBusy||!nutriAllowed())return;dictStop();
  if(nuPhoto&&nuDirect()){if(NU().consent)return nuPhotoSend(q);if(!(await nuConsent()))return;nuPhotoUp();return nuPhotoSend(q)}
  nuBusy="aliment";const btn=$("nuAskBtn");btn.disabled=true;nuPending=null;
  const stop=nuLoading($("nuResult"),nuPhoto?["Analyse de la photo…","Reconnaissance des aliments…","Estimation des portions…","Calcul des calories…"]:["Analyse du plat…","Calcul des calories…","Estimation des macros…"]);
  const photo=nuPhoto;
  // texte seul : le serveur (v23) ne compte que ce qui est écrit ; le texte est envoyé tel quel pour garder la mémoire des aliments
  try{const r=await nuRetry(()=>nuCall("aliment",{text:q,image:photo?photo.big.split(",")[1]:undefined}),r=>r&&Array.isArray(r.items)&&r.items.length);
    nuPending={q,mem:r._src==="memory",title:String(r.dish||q||L("Mon plat")),em:String(r.emoji||"🍽️"),note:String(r.note||""),photo:photo&&photo.small,
      items:(r.items||[]).map(x=>({name:String(x.name||q),qty:String(x.quantity||""),em:String(x.emoji||""),kcal:r0(x.kcal),p:r1(x.protein_g),c:r1(x.carbs_g),f:r1(x.fat_g)}))};
    if(!photo&&nuPending.items.length>1)nuPending.items.forEach(x=>x.extra=!mentioned(q,x.name));
    if(!nuPending.items.length){nuPending=null;toast("Aliment non reconnu, précise un peu")}
  }catch(ex){toast(nuErrMsg(ex));if(ex.ai){nuPhoto=null;$("nuPhotoPrev").hidden=true;$("nuPhotoPrev").innerHTML="";$("nuAsk").value="";grow($("nuAsk"))}} // v43 : demande partie chez Claude → rien ne reste pré-rempli
  stop();nuBusy="";btn.disabled=false;renderNuResult();
});
function renderNuResult(){
  const p=nuPending;if(!p){if(!nuBusy)$("nuResult").innerHTML="";return}
  const s=sumOf(p.items);
  $("nuResult").innerHTML=`<div class="dish"><div class="dish-h"><span class="dish-ic">${p.photo?`<img src="${p.photo}" alt="">`:mono(p.title)}</span><span class="dish-t"><b class="notr">${esc(p.title)}</b><span class="small muted">${p.items.length} ${L(p.items.length>1?"aliments":"aliment")}</span>${p.mem?`<span class="memtag">${IC("bolt")} ${L("Mémoire Sid'note")}</span>`:""}</span><span class="dish-kcal">${r0(s.kcal)}<small>kcal</small></span></div>
    ${macroHtml(s)}<div class="dish-items">${p.items.map((x,i)=>`<div class="dish-it"><span class="em">·</span><div class="grow"><b class="notr">${esc(x.name)}</b>${x.extra?`<span class="notmention">${L("pas dans ta description")}</span>`:""}${qtyCell("res:"+i,x)}</div><span class="k">${x.kcal} kcal</span><button type="button" class="x" data-nurm="${i}" aria-label="${L("Retirer")}">×</button></div>`).join("")}</div>
    ${p.note?`<div class="dish-note notr" style="padding-top:8px">${esc(p.note)}</div>`:""}
    <div class="dish-act"><button type="button" class="btn ghost" data-nucancel="1">${L("Annuler")}</button><button type="button" class="btn" data-nuadd="1">${L("Ajouter")} · ${r0(s.kcal)} kcal</button></div></div>`;
}
$("nuResult").addEventListener("click",async e=>{const b=e.target.closest("button");if(!b||!nuPending)return;
  if(b.dataset.nurm){nuPending.items.splice(+b.dataset.nurm,1);if(!nuPending.items.length)nuPending=null;renderNuResult()}
  else if(b.dataset.nucancel){nuPending=null;renderNuResult()}
  else if(b.dataset.nuadd){const p=nuPending,g=nuAddItems(p.items,null,{name:p.title,em:p.em});
    if(p.photo){try{await idb.put(thumbKey(g),p.photo);thumbs.set(g,p.photo)}catch(x){}}
    nuPending=null;nuPhoto=null;$("nuPhotoPrev").hidden=true;$("nuPhotoPrev").innerHTML="";$("nuAsk").value="";grow($("nuAsk"));renderNutri();toast(nuDay===iso(today())?"Ajouté à ta journée":"Ajouté à ce jour")}
});
function nuAddItems(items,time,meta){const at=nuAt(time),grp=uid();
  items.forEach(x=>NU().log.push({id:uid(),day:nuDay,at,grp,gname:meta&&meta.name||"",gem:meta&&meta.em||"",name:x.name,qty:x.qty||"",em:x.em||"",kcal:r0(x.kcal),p:r1(x.p),c:r1(x.c),f:r1(x.f),upd:Date.now()}));
  save();return grp}
// supprimer un aliment, ou tout un plat
$("nuLog").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;
  if(b.dataset.nuedit){e.preventDefault();nuOpenSheet(b.dataset.nuedit)}
  else if(b.dataset.nudel){e.preventDefault();if(!c2ok(b))return;const id=b.dataset.nudel;undoable("Supprimé",[id],()=>{tomb(id);NU().log=NU().log.filter(x=>x.id!==id)},{after:renderNutri})}
  else if(b.dataset.nucopy){e.preventDefault();e.stopPropagation();nuCopyOpen(b.dataset.nucopy)}
  else if(b.dataset.nudelg){e.preventDefault();e.stopPropagation();if(!c2ok(b))return;const g=b.dataset.nudelg,ids=NU().log.filter(x=>(x.grp||x.id)===g).map(x=>x.id);
    undoable("Plat supprimé",ids,()=>{ids.forEach(tomb);NU().log=NU().log.filter(x=>(x.grp||x.id)!==g)},{after:renderNutri,later:()=>{if(!NU().log.some(x=>(x.grp||x.id)===g))idb.del(thumbKey(g))}})}
});
/* ---------- v47 : vues semaine / mois / année de la nutrition (#16) et copie d'un repas sur d'autres jours (#15) ---------- */
// mêmes grilles que l'agenda (monthGrid / yearGrid, mêmes classes .day, .ym)
let nuRange=null,nuRY=0,nuRM=0,nuRW="";
const dowHead=()=>[1,2,3,4,5,6,0].map(i=>`<span>${esc(String(DOWL[i]||"").slice(0,1).toUpperCase())}</span>`).join("");
// état d'un jour : dans l'objectif (90 à 105 %), en dessous, au-dessus ; rien si aucun repas
function nuDays(){const m={};for(const x of NU().log||[]){if(!x||!x.day)continue;m[x.day]=(m[x.day]||0)+(+x.kcal||0)}return m}
function nuSt(by,k){if(by[k]==null)return "";const t=dayTarget(k).kcal||1,r=by[k]/t;return r>1.05?"over":r>=.9?"ok":"under"}
function nuCalOpen(mode){const d=parse(nuDay);nuRange=mode;nuRY=d.getFullYear();nuRM=d.getMonth();nuRW=wKey(nuDay);renderNuCal()}
function renderNuCal(){const box=$("nuCal"),btn=$("nuDayBtn");if(!box)return;box.hidden=!nuRange;if(btn)btn.setAttribute("aria-expanded",String(!!nuRange));if(!nuRange)return;
  // v50 (ticket #3) : premier écran migré en TypeScript + React (app/src/NutritionCalendar.tsx, build site/react/islands.js) ;
  // même rendu, mêmes data-* (les clics restent gérés ici). Si le module n'est pas chargé, l'ancien rendu ci-dessous sert de secours.
  if(window.SCIslands&&window.SCIslands.nuCal&&!window.__noIslands){try{window.SCIslands.nuCal(box,{range:nuRange,year:nuRY,month:nuRM,weekStart:nuRW,today:iso(today()),selected:nuDay,byDay:nuDays(),target:k=>dayTarget(k).kcal||0,i18n:{L,MOL,MO,DOWL}});return}catch(e){reportErr&&reportErr("island nuCal: "+(e&&e.message))}}
  const tIso=iso(today()),by=nuDays();let title="",body="",tot=0,nd=0,start="";
  const sum=()=>`<div class="small muted nu-cal-sum">${nd?`${nd} ${L(nd>1?"jours notés":"jour noté")} · ${L("moyenne")} ${r0(tot/nd)} kcal`:L("Aucun repas noté sur cette période.")}</div>`;
  const leg=`<div class="nu-leg small muted"><span><i class="nu-st ok"></i>${L("Dans l'objectif")}</span><span><i class="nu-st under"></i>${L("En dessous")}</span><span><i class="nu-st over"></i>${L("Au-dessus")}</span></div>`;
  if(nuRange==="week"){const m=parse(nuRW),e=new Date(m);e.setDate(e.getDate()+6);start=nuRW;
    title=`${m.getDate()} ${MO[m.getMonth()]} – ${e.getDate()} ${MO[e.getMonth()]} ${e.getFullYear()}`;
    let rows="";for(let i=0;i<7;i++){const d=new Date(m);d.setDate(d.getDate()+i);const k=iso(d),st=nuSt(by,k),tg=dayTarget(k).kcal||0,v=by[k];if(v!=null){tot+=v;nd++}
      rows+=`<button type="button" class="nwk-row ${k===nuDay?"on":""} ${st}" data-nuday="${k}" ${k>tIso?"disabled":""}><span class="nwk-d"><b>${esc(DOWL[d.getDay()])}</b><small>${d.getDate()} ${MO[d.getMonth()]}</small></span><span class="nwk-bar"><i style="width:${tg&&v?Math.min(100,v/tg*100):0}%"></i></span><span class="nwk-k">${v!=null?r0(v):"–"}${v!=null&&tg?`<small> / ${tg}</small>`:""}</span></button>`}
    body=`<div class="nwk">${rows}</div>`+leg+sum()}
  else if(nuRange==="month"){title=`${MOL[nuRM]} ${nuRY}`;start=iso(new Date(nuRY,nuRM,1));
    const g=monthGrid(nuRY,nuRM,(k,d)=>{const st=nuSt(by,k);if(st){tot+=by[k];nd++}
      return `<button type="button" class="day ${k===tIso?"today":""} ${k===nuDay?"sel":""} ${k<tIso?"past":""}" data-nuday="${k}" ${k>tIso?"disabled":""} aria-label="${d} ${MOL[nuRM]}${st?" · "+r0(by[k])+" kcal":""}"><span class="num">${d}</span><span class="marks">${st?`<span class="dots"><i class="nu-st ${st}"></i></span>`:""}</span></button>`});
    body=`<div class="cal-grid cal-dow">${dowHead()}</div><div class="cal-grid nu-mgrid">${g}</div>`+leg+sum()}
  else{title=String(nuRY);start=iso(new Date(nuRY,0,1));
    for(const k in by)if(k.startsWith(nuRY+"-")){tot+=by[k];nd++}
    body=`<div class="yr-grid nu-ygrid">${yearGrid(nuRY,k=>{const st=nuSt(by,k);return `${k===tIso?"td":st?"ev nu-"+st:""} ${k<tIso?"past":""}`})}</div><p class="small muted" style="text-align:center;margin:8px 0 0">${L("Touche un mois pour l'ouvrir.")}</p>`+sum()}
  // période suivante seulement si elle a déjà commencé
  const nx=nuRange==="week"?(()=>{const d=parse(nuRW);d.setDate(d.getDate()+7);return iso(d)})():nuRange==="month"?iso(new Date(nuRY,nuRM+1,1)):iso(new Date(nuRY+1,0,1));
  box.innerHTML=`<div class="seg nu-cal-seg" role="group" aria-label="${L("Vue")}">${["week","month","year"].map(m=>`<button type="button" data-nurange="${m}" aria-pressed="${m===nuRange}">${L({week:"Semaine",month:"Mois",year:"Année"}[m])}</button>`).join("")}</div>
    <div class="cal-head"><button type="button" class="cal-nav" data-nurn="-1" aria-label="${L("Période précédente")}">‹</button><b class="nu-cal-t">${esc(title)}</b><button type="button" class="cal-nav" data-nurn="1" aria-label="${L("Période suivante")}" ${nx>tIso?"disabled":""}>›</button></div>
    ${body}<button type="button" class="linkbtn nu-cal-x" data-nurange="">${L("Fermer le calendrier")}</button>`}
$("nuDayBtn").addEventListener("click",()=>{if(nuRange){nuRange=null;renderNuCal()}else nuCalOpen("month")});
window.addEventListener("sc-islands",()=>{if(nuRange)renderNuCal();if(data&&data.ui&&data.ui.view==="graph")renderGraph();if(data&&data.ui&&data.ui.view==="pomo")renderPomoStats();if(session&&data&&data.tasks){renderPlan();renderTodos()}}); // module React chargé après coup : on redessine avec lui
$("nuCal").addEventListener("click",e=>{const b=e.target.closest("button");if(!b||b.disabled)return;
  if(b.dataset.nurange!==undefined){if(b.dataset.nurange)nuCalOpen(b.dataset.nurange);else{nuRange=null;renderNuCal()}return}
  if(b.dataset.nurn){const s=+b.dataset.nurn;if(nuRange==="week"){const d=parse(nuRW);d.setDate(d.getDate()+7*s);nuRW=iso(d)}
    else if(nuRange==="month"){nuRM+=s;if(nuRM<0){nuRM=11;nuRY--}if(nuRM>11){nuRM=0;nuRY++}}else nuRY+=s;renderNuCal();return}
  if(b.dataset.ym){nuRM=+b.dataset.ym;nuRange="month";renderNuCal();return}
  if(b.dataset.nuday){const w=nuRange==="week";if(!w)nuRange=null;nuSetDay(b.dataset.nuday);if(!w)$("nuDayBtn").scrollIntoView({block:"nearest"})}});
// copier un repas (tout le plat) sur un ou plusieurs autres jours ; annulable
let nuCp=null;
function nuCopyOpen(g){const items=NU().log.filter(x=>(x.grp||x.id)===g);if(!items.length)return;const d=parse(items[0].day||nuDay);
  nuCp={g,y:d.getFullYear(),m:d.getMonth(),sel:new Set(),src:items[0].day};$("nuCopyTitle").textContent=`${L("Copier")} « ${items[0].gname||items[0].name} »`;renderNuCopy();$("nuCopySheet").hidden=false}
function renderNuCopy(){if(!nuCp)return;const tIso=iso(today()),mx=(()=>{const d=today();d.setDate(d.getDate()+14);return iso(d)})(),n=nuCp.sel.size;
  $("nuCopyBody").innerHTML=`<p class="small muted" style="margin:0 0 8px">${L("Touche les jours où tu as mangé (ou mangeras) la même chose.")}</p>
    <div class="cal-head"><button type="button" class="cal-nav" data-nucpn="-1" aria-label="${L("Mois précédent")}">‹</button><b>${MOL[nuCp.m]} ${nuCp.y}</b><button type="button" class="cal-nav" data-nucpn="1" aria-label="${L("Mois suivant")}" ${iso(new Date(nuCp.y,nuCp.m+1,1))>mx?"disabled":""}>›</button></div>
    <div class="cal-grid cal-dow">${dowHead()}</div>
    <div class="cal-grid nu-cpgrid">${monthGrid(nuCp.y,nuCp.m,(k,d)=>`<button type="button" class="day ${k===tIso?"today":""} ${nuCp.sel.has(k)?"sel":""} ${k===nuCp.src?"nu-cp-src":""}" data-nucpd="${k}" aria-pressed="${nuCp.sel.has(k)}" ${k>mx||k===nuCp.src?"disabled":""} aria-label="${d} ${MOL[nuCp.m]}"><span class="num">${d}</span></button>`)}</div>
    <button type="button" class="btn" id="nuCopyGo" ${n?"":"disabled"} style="width:100%;margin-top:12px">${n?`${L("Copier sur")} ${n} ${L(n>1?"jours":"jour")}`:L("Choisis au moins un jour")}</button>`}
function nuCopyDo(){const src=NU().log.filter(x=>(x.grp||x.id)===nuCp.g);if(!src.length||!nuCp.sel.size)return;const ids=[],now=Date.now(),days=[...nuCp.sel].sort();
  for(const k of days){const grp=src.length>1||src[0].grp?uid():null;
    for(const x of src){const at=parse(k),t=new Date(x.at||Date.now());at.setHours(t.getHours(),t.getMinutes());const id=uid();ids.push(id);
      const y={...x,id,day:k,at:at.toISOString(),upd:now};if(grp)y.grp=grp;else delete y.grp;NU().log.push(y)}}
  NU().upd=now;save();$("nuCopySheet").hidden=true;nuCp=null;renderNutri();
  toastAct(`${L("Repas copié sur")} ${days.length} ${L(days.length>1?"jours":"jour")}`,"Annuler",()=>{ids.forEach(tomb);NU().log=NU().log.filter(x=>!ids.includes(x.id));save();renderNutri();toast("Annulé")})}
$("nuCopyBody").addEventListener("click",e=>{const b=e.target.closest("button");if(!b||b.disabled||!nuCp)return;
  if(b.dataset.nucpn){nuCp.m+= +b.dataset.nucpn;if(nuCp.m<0){nuCp.m=11;nuCp.y--}if(nuCp.m>11){nuCp.m=0;nuCp.y++}renderNuCopy();return}
  if(b.dataset.nucpd){const k=b.dataset.nucpd;nuCp.sel.has(k)?nuCp.sel.delete(k):nuCp.sel.add(k);renderNuCopy();return}
  if(b.id==="nuCopyGo")nuCopyDo()});
$("nuCopyClose").addEventListener("click",()=>{$("nuCopySheet").hidden=true;nuCp=null});
$("nuCopySheet").addEventListener("click",e=>{if(e.target.id==="nuCopySheet"){$("nuCopySheet").hidden=true;nuCp=null}});
// saisie ou correction à la main
function nuOpenSheet(id){
  const x=id?NU().log.find(e=>e.id===id):null;nuEditId=x?x.id:null;
  $("nuSheetTitle").textContent=L(x?"Modifier":"Ajouter à la main");$("nuEDel").hidden=!x;$("nuEDel").classList.remove("armed");$("nuEDel").textContent=L("Supprimer");
  const d=x?new Date(x.at):null;
  $("nuEName").value=x?x.name:($("nuAsk").value.trim());$("nuEQty").value=x?x.qty:"";$("nuETime").value=d?`${two(d.getHours())}:${two(d.getMinutes())}`:"";
  $("nuEKcal").value=x?x.kcal:"";$("nuEP").value=x?x.p:"";$("nuEC").value=x?x.c:"";$("nuEF").value=x?x.f:"";
  nuEBase=x?{qty:x.qty,kcal:x.kcal,p:x.p,c:x.c,f:x.f}:null;$("nuEHint").hidden=true;
  $("nuSheet").hidden=false;
}
$("nuManual").addEventListener("click",()=>nuOpenSheet(null));
// quantité lue dans un texte : « 1/3 de baguette » → 0,333 ; « 150 g » → 150 ; « ½ » → 0,5 ; « 2 oeufs » → 2
function qtyNum(t){t=String(t||"").replace(/½/g,"1/2").replace(/¼/g,"1/4").replace(/¾/g,"3/4").replace(",",".");
  let m=t.match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/);if(m&&+m[2])return +m[1]/+m[2];m=t.match(/\d+(?:\.\d+)?/);return m?+m[0]:0}
let nuEBase=null;
$("nuEQty").addEventListener("input",()=>{if(!nuEBase)return;const a=qtyNum(nuEBase.qty),b=qtyNum($("nuEQty").value),h=$("nuEHint");
  if(a>0&&b>0){const k=b/a;$("nuEKcal").value=r0(nuEBase.kcal*k);$("nuEP").value=r1(nuEBase.p*k);$("nuEC").value=r1(nuEBase.c*k);$("nuEF").value=r1(nuEBase.f*k);
    h.hidden=k===1;h.innerHTML=`✓ ${L("Calories recalculées selon la quantité")}`}
  else{h.hidden=false;h.innerHTML=`${L("Quantité sans chiffre : je ne peux pas recalculer seul.")}<button type="button" class="mini" id="nuERecalc">↻ ${L("Recalculer")}</button>`}});
$("nuEHint").addEventListener("click",async e=>{if(!e.target.closest("#nuERecalc")||nuBusy)return;const q=`${$("nuEQty").value.trim()} ${$("nuEName").value.trim()}`.trim();if(!q)return;
  nuBusy="recalc";e.target.innerHTML=`<span class="spin"></span>`;
  try{const r=await nuCall("aliment",{text:q}),t=(r.items||[]).reduce((s,x)=>({k:s.k+(+x.kcal||0),p:s.p+(+x.protein_g||0),c:s.c+(+x.carbs_g||0),f:s.f+(+x.fat_g||0)}),{k:0,p:0,c:0,f:0});
    $("nuEKcal").value=r0(t.k);$("nuEP").value=r1(t.p);$("nuEC").value=r1(t.c);$("nuEF").value=r1(t.f);$("nuEHint").innerHTML=`✓ ${L("Calories recalculées selon la quantité")}`}
  catch(ex){toast(nuErrMsg(ex))}nuBusy=""});
$("nuSheetClose").addEventListener("click",()=>{$("nuSheet").hidden=true});
$("nuSheet").addEventListener("click",e=>{if(e.target.id==="nuSheet")$("nuSheet").hidden=true});
$("nuEntryForm").addEventListener("submit",e=>{
  e.preventDefault();const name=$("nuEName").value.trim(),num=id=>Math.max(0,numIn($(id).value));
  if(!name){toast("Indique l'aliment");return}
  const v={name,qty:$("nuEQty").value.trim(),kcal:num("nuEKcal"),p:num("nuEP"),c:num("nuEC"),f:num("nuEF")};
  if(nuEditId){const x=NU().log.find(e=>e.id===nuEditId);if(x){Object.assign(x,{...v,kcal:r0(v.kcal),p:r1(v.p),c:r1(v.c),f:r1(v.f),upd:Date.now()});
      if($("nuETime").value){const d=parse(x.day),[h,m]=$("nuETime").value.split(":").map(Number);d.setHours(h,m);NU().log.filter(y=>(y.grp||y.id)===(x.grp||x.id)).forEach(y=>y.at=d.toISOString())}save()}}
  else nuAddItems([v],$("nuETime").value,{name:v.name,em:"✍️"});
  $("nuSheet").hidden=true;renderNutri();toast("Enregistré");
});
$("nuEDel").addEventListener("click",e=>{const b=e.currentTarget;if(!nuEditId)return;
  if(!b.classList.contains("armed")){b.classList.add("armed");b.textContent=L("Confirmer la suppression");return}
  tomb(nuEditId);NU().log=NU().log.filter(x=>x.id!==nuEditId);save();$("nuSheet").hidden=true;renderNutri();toast("Supprimé")});
// --- menus sur mesure : journée complète ou un seul repas, calories précises par repas, menu modifiable ---
// « meal » = repas unique de la journée (OMAD)
const SLOT={breakfast:["Petit-déjeuner","sunrise",25],lunch:["Déjeuner","sun",35],snack:["Collation","apple",10],dinner:["Dîner","moon",30],meal:["Repas unique (OMAD)","utensils",100]};
const MAINS=["breakfast","lunch","dinner"];
// repas choisis : petit-déj / déjeuner / dîner (oui ou non) + nombre de collations, placées entre les repas
function mpSlots(){const mp=nuMP(),on=MAINS.filter(s=>mp.pick[s]),sn=mp.snacks||0;
  if(on.length===1&&!sn)return["meal"];
  if(!on.length)return Array(Math.max(1,sn)).fill("snack");
  const out=[];let left=sn;on.forEach((s,i)=>{out.push(s);if(left&&i<on.length-1){out.push("snack");left--}});while(left-->0)out.push("snack");return out}
const slotsFor=n=>({1:["meal"],2:["lunch","dinner"],3:["breakfast","lunch","dinner"],4:["breakfast","lunch","snack","dinner"],5:["breakfast","snack","lunch","snack","dinner"]})[n]||["breakfast","snack","lunch","snack","dinner",...Array(n-5).fill("snack")];
const slotName=s=>SLOT[s]?SLOT[s][0]:"Repas";
const splitKcal=(total,slots)=>{const w=slots.map(s=>SLOT[s][2]),t=w.reduce((a,b)=>a+b,0);return w.map(x=>Math.round(total*x/t/10)*10)};
// v31 : « à inclure » et « à éviter » sont propres à chaque type de repas (journée, petit-déj, déjeuner…) : rien n'est recopié d'un repas à l'autre
const mpPref=(mp,type,k)=>{const p=mp.pp&&mp.pp[type];if(p&&p[k]!=null)return p[k];return type==="day"?(k==="include"?mp.include:mp.exclude)||"":""};
const mpSet=(mp,type,k,v)=>{mp.pp=mp.pp||{};mp.pp[type]={...(mp.pp[type]||{}),[k]:v}};
const nuMP=()=>{const n=NU();n.menuPrefs=n.menuPrefs||{};const m=n.menuPrefs;m.type=m.type||"day";m.one=m.one||{};
  // ancien réglage « repas par jour » → choix des repas
  if(!m.pick){const sl=slotsFor(m.meals||3);m.pick={breakfast:sl.includes("breakfast"),lunch:sl.includes("lunch")||sl.includes("meal"),dinner:sl.includes("dinner")};m.snacks=sl.filter(s=>s==="snack").length}
  return m};
// calories par repas : toujours ramenées à l'objectif du jour, en gardant la répartition choisie
const mpKcals=()=>{const mp=nuMP(),sl=mpSlots(),tg=dayTarget(iso(today())).kcal;
  if(!(mp.kcals&&mp.kcals.length===sl.length&&mp.kcalsFor===sl.join()))return splitKcal(tg,sl);
  const tot=mp.kcals.reduce((a,b)=>a+b,0);if(!tot||Math.abs(tot-tg)<=20)return mp.kcals;
  return fitKcals(mp.kcals.map(x=>x*tg/tot),tg)};
// arrondit à 10 kcal et corrige le dernier repas pour que le total tombe juste
function fitKcals(arr,tg){const out=arr.map(x=>Math.max(0,Math.round(x/10)*10));const d=tg-out.reduce((a,b)=>a+b,0);
  for(let i=out.length-1;i>=0&&d;i--){if(out[i]+d>=0){out[i]+=d;break}}return out}
// un repas change : les autres s'adaptent, proportionnellement à leur part actuelle
function rebalance(k,i,v,tg){v=Math.max(0,Math.min(tg,v));const rest=tg-v,others=k.reduce((a,x,j)=>j===i?a:a+x,0),n=k.length-1;
  const out=k.map((x,j)=>j===i?v:Math.round((others>0?x*rest/others:rest/n)/10)*10);
  let big=-1;out.forEach((x,j)=>{if(j!==i&&(big<0||x>out[big]))big=j});
  if(big>=0)out[big]=Math.max(0,out[big]+tg-out.reduce((a,b)=>a+b,0));return out}
const oneKcal=slot=>{const mp=nuMP();return mp.one[slot]||splitKcal(dayTarget(iso(today())).kcal,slotsFor(4))[["breakfast","lunch","snack","dinner"].indexOf(slot)]};
function renderMenuForm(){
  const mp=nuMP(),day=mp.type==="day";
  document.querySelectorAll("#nuMType button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.mtype===mp.type));
  $("nuMDay").hidden=!day;$("nuMOne").hidden=day;$("nuSnacks").textContent=mp.snacks||0;
  $("nuSlots").innerHTML=MAINS.map(s=>`<button type="button" class="pill meal-tg" data-pick="${s}" aria-pressed="${!!mp.pick[s]}"><span class="tg-box" aria-hidden="true">${mp.pick[s]?"✓":""}</span>${IC(SLOT[s][1])} ${L(SLOT[s][0])}</button>`).join("");
  const sl=mpSlots();
  $("nuMenuBtn").textContent=L(day?(sl.length===1&&sl[0]==="meal"?"Générer mon repas unique":"Générer ma journée"):{breakfast:"Générer un petit-déjeuner",lunch:"Générer un déjeuner",snack:"Générer une collation",dinner:"Générer un dîner"}[mp.type]);
  if(day){const k=mpKcals(),tot=k.reduce((a,b)=>a+b,0),tg=dayTarget(iso(today())).kcal;
    if(!$("nuMealKcal").contains(document.activeElement))$("nuMealKcal").innerHTML=sl.map((s,i)=>`<div class="row"><span class="em">${IC(SLOT[s][1])}</span><span class="grow">${L(slotName(s))}</span><span class="nu-in"><input data-mk="${i}" type="text" inputmode="numeric" maxlength="4" value="${k[i]}" aria-label="${L("Calories")} ${L(slotName(s))}"><i>kcal</i></span></div>`).join("");
    $("nuMkTot").innerHTML=`${L("Total")} <b>${fmtFull(tot)}</b> / ${fmtFull(tg)} kcal ✓${mp.kcals?` <button type="button" class="mini" data-mkreset="1">${L("Répartition conseillée")}</button>`:""}`;
    document.querySelector(".nu-mk-note").hidden=sl.length<2}
  else if(document.activeElement!==$("nuOneKcal"))$("nuOneKcal").value=oneKcal(mp.type);
  if(document.activeElement!==$("nuInclude"))$("nuInclude").value=mpPref(mp,mp.type,"include");if(document.activeElement!==$("nuExclude"))$("nuExclude").value=mpPref(mp,mp.type,"exclude");autoGrow($("nuInclude"));autoGrow($("nuExclude"));
}
$("nuMType").addEventListener("click",e=>{const b=e.target.closest("[data-mtype]");if(!b)return;nuMP().type=b.dataset.mtype;NU().upd=Date.now();save();renderMenuForm()});
$("nuMenuSec").addEventListener("click",e=>{const b=e.target.closest("[data-pick],[data-snacks],[data-mkreset]");if(!b)return;const mp=nuMP();
  if(b.dataset.mkreset)mp.kcals=null;
  else if(b.dataset.pick){const s=b.dataset.pick;mp.pick[s]=!mp.pick[s];if(!MAINS.some(x=>mp.pick[x])&&!mp.snacks){mp.pick[s]=true;toast("Garde au moins un repas");return}mp.kcals=null}
  else{mp.snacks=Math.min(4,Math.max(0,(mp.snacks||0)+ +b.dataset.snacks));if(!MAINS.some(x=>mp.pick[x])&&!mp.snacks)mp.snacks=1;mp.kcals=null}
  NU().upd=Date.now();save();$("nuMealKcal").innerHTML="";renderMenuForm()});
$("nuMealKcal").addEventListener("change",e=>{const i=e.target.dataset.mk;if(i===undefined)return;const mp=nuMP(),tg=dayTarget(iso(today())).kcal,k=mpKcals().slice();
  const v=Math.round(numIn(e.target.value)/10)*10;if(v>tg)toast(`${L("Maximum")} ${fmtFull(tg)} kcal`);
  mp.kcals=k.length>1?rebalance(k,+i,v,tg):[tg];mp.kcalsFor=mpSlots().join();NU().upd=Date.now();save();$("nuMealKcal").innerHTML="";renderMenuForm()});
$("nuOneKcal").addEventListener("change",e=>{const mp=nuMP();mp.one[mp.type]=Math.max(0,Math.round(numIn(e.target.value)));NU().upd=Date.now();save()});
["nuInclude","nuExclude"].forEach(id=>$(id).addEventListener("change",e=>{const mp=nuMP();mpSet(mp,mp.type,id==="nuInclude"?"include":"exclude",e.target.value.trim());NU().upd=Date.now();save()}));
// champs qui grandissent avec le texte
function autoGrow(t){if(!t||t.tagName!=="TEXTAREA")return;t.style.height="auto";t.style.height=Math.min(t.scrollHeight+2,220)+"px"}
document.addEventListener("input",e=>{if(e.target.classList&&e.target.classList.contains("autogrow"))autoGrow(e.target)});
// huiles, beurre, miel, sauces… : exprimés en cuillères plutôt qu'en grammes
const SPOONS=[[/huile|oil/i,13.5,4.5],[/beurre de cacahu|peanut butter|pur[ée]e d'amande|tahin|tahini/i,16,5],[/beurre|butter|margarine|ghee/i,14,5],
  [/miel|honey|sirop|syrup|confiture|jam/i,21,7],[/vinaigre|vinegar|sauce soja|soy sauce|moutarde|mustard|ketchup|mayonnaise|mayo|pesto|cr[eè]me fra[iî]che/i,15,5]];
function spoonQty(name,g){if(!(g>0)||g>80)return"";const s=SPOONS.find(([re])=>re.test(name||""));if(!s)return"";
  const half=x=>Math.max(.5,Math.round(x*2)/2),fr=x=>String(x).replace(".",LANG==="en"?".":",");
  const tb=g/s[1];if(tb>=.75)return `${fr(half(tb))} ${L("c. à soupe")}`;return `${fr(half(g/s[2]))} ${L("c. à café")}`}
const qtyTxt=x=>{const m=String(x.qty||"").trim().match(/^(\d+(?:[.,]\d+)?)\s*g$/i),g=x.g||(m?+m[1].replace(",","."):0),sp=g?spoonQty(x.name,g):"";return sp?`${sp} (${r0(g)} g)`:(x.qty||"")};
// le serveur connaît les créneaux classiques : le repas unique part comme un déjeuner, avec son propre nom
const srvSlot=s=>s==="meal"?"lunch":s;
// la toute première génération peut échouer (serveur qui démarre, réponse vide) : on réessaie une fois tout seul
async function nuRetry(fn,ok){let last;for(let a=0;a<2;a++){try{const r=await fn();if(!ok||ok(r))return r;last=new Error(L("Réponse vide, réessaie."))}
  catch(ex){last=ex;if(ex.ai||ex instanceof TypeError||(ex.status&&ex.status<500&&![422,429].includes(ex.status)))throw ex}
  if(a===0)await new Promise(r=>setTimeout(r,1200))}throw last}
// demande à Claude un ou plusieurs repas (calories précises par repas)
async function genMeals(slots,kcals){
  const n=NU(),mp=nuMP(),t=dayTarget(iso(today())),tot=kcals.reduce((a,b)=>a+b,0)||1,k=tot/t.kcal,one=slots.length===1;
  const notes=[n.profile&&n.profile.notes,slots[0]==="meal"&&one?"Un seul repas dans la journée (OMAD) : il doit couvrir tous les besoins du jour.":"",
    "Huiles, beurre, miel et sauces : indique la quantité en grammes, elle sera affichée en cuillères.",
    "Donne toujours le poids des aliments crus (avant cuisson) : riz, pâtes, viande, poisson, légumineuses… et écris « cru » dans le nom quand c'est utile."].filter(Boolean).join(" ");
  const pty=one&&mp.type!=="day"?mp.type:one&&mp.pp&&mp.pp[slots[0]]?slots[0]:"day";
  const r=await nuRetry(()=>nuCall("menu",{data:{meal_type:one&&mp.type!=="day"?srvSlot(slots[0]):"day",meals:slots.map((s,i)=>({slot:srvSlot(s),name:L(slotName(s)),kcal:kcals[i]})),
    target_kcal:tot,protein_g:r0(t.p*k),carbs_g:r0(t.c*k),fat_g:r0(t.f*k),must_include:mpPref(mp,pty,"include"),avoid:mpPref(mp,pty,"exclude"),goal:n.profile&&n.profile.goal,notes}}),
    r=>r&&Array.isArray(r.meals)&&r.meals.some(m=>m&&Array.isArray(m.items)&&m.items.length));
  const meals=(r.meals||[]).filter(m=>m&&Array.isArray(m.items)&&m.items.length).map((m,i)=>({slot:slots[i]||slots[slots.length-1],target:kcals[i]||kcals[kcals.length-1],name:String(m.name||""),em:String(m.emoji||"🍽️"),
    steps:recipeSteps(m.steps||m.recipe||m.instructions),
    items:(m.items||[]).map(x=>({name:String(x.food||x.name||""),em:String(x.emoji||""),g:r0(x.grams),qty:r0(x.grams)+" g",kcal:r0(x.kcal),p:r1(x.protein_g),c:r1(x.carbs_g),f:r1(x.fat_g)}))}));
  return{meals,tips:String(r.tips||"")};
}
// étapes de recette : liste, ou texte « 1. … 2. … » découpé
function recipeSteps(v){if(!v)return null;if(Array.isArray(v))return v.map(x=>String(x&&x.text||x).trim()).filter(Boolean);
  const s=String(v).split(/\n+|(?:^|\s)(?=\d{1,2}[.)]\s)/).map(x=>x.replace(/^\s*(?:\d{1,2}[.)]|[-•])\s*/,"").trim()).filter(x=>x.length>2);return s.length?s:null}
// recette d'un repas déjà généré : demande « recette » du serveur (v23) ; ancien serveur : on redemande le repas avec ses étapes dans « tips »
async function getRecipe(ml){
  const n=NU(),list=ml.items.map(x=>`${qtyTxt(x)} ${x.name}`).join(", ");
  try{const r=await nuRetry(()=>nuCall("recette",{data:{name:ml.name,kcal:ml.kcal,foods:ml.items.map(x=>({food:x.name,grams:x.g||null,quantity:x.qty}))}}),r=>r&&Array.isArray(r.steps)&&r.steps.length);
    const st=recipeSteps(r.steps);if(st){const t=[r.prep_min?`${L("Préparation")} ${r0(r.prep_min)} min`:"",r.cook_min?`${L("Cuisson")} ${r0(r.cook_min)} min`:""].filter(Boolean).join(" · ");
      if(t)st.unshift(L("Temps")+" : "+t);if(r.tips)st.push(L("Astuce")+" : "+r.tips);return st}}
  catch(ex){if(ex.status!==400)throw ex}
  const r=await nuRetry(()=>nuCall("menu",{data:{meal_type:srvSlot(ml.slot||"lunch"),meals:[{slot:srvSlot(ml.slot||"lunch"),name:ml.name,kcal:ml.kcal}],target_kcal:ml.kcal,protein_g:r0(ml.p),carbs_g:r0(ml.c),fat_g:r0(ml.f),
    must_include:list,avoid:"",goal:n.profile&&n.profile.goal,want_recipe:true,
    notes:`RECETTE DEMANDÉE pour ce repas exact : « ${ml.name} » avec ${list}. Garde exactement ces aliments et ces quantités. Écris la préparation pas à pas (4 à 8 étapes numérotées « 1. … », avec temps de cuisson) dans le champ tips, et aussi dans « steps » si possible.`}}),
    r=>r&&(r.tips||(r.meals&&r.meals[0]&&(r.meals[0].steps||r.meals[0].recipe))));
  const m=r.meals&&r.meals[0]||{};return recipeSteps(m.steps||m.recipe||m.instructions)||recipeSteps(r.tips)}
$("nuMenuBtn").addEventListener("click",async()=>{
  if(nuBusy||!nutriAllowed())return;const n=NU(),mp=nuMP();mpSet(mp,mp.type,"include",$("nuInclude").value.trim());mpSet(mp,mp.type,"exclude",$("nuExclude").value.trim());
  if(mp.type!=="day")mp.one[mp.type]=Math.max(0,Math.round(numIn($("nuOneKcal").value)))||oneKcal(mp.type);
  const slots=mp.type==="day"?mpSlots():[mp.type],kcals=mp.type==="day"?mpKcals():[mp.one[mp.type]];
  nuBusy="menu";const btn=$("nuMenuBtn");btn.disabled=true;const stop=nuLoading($("nuMenu"),["Préparation du menu…","Choix des recettes…","Calcul des grammages…","Équilibrage des macros…"]);
  // v43 (demande de Sid) : « à inclure » / « à éviter » ne servent qu'à cette demande ; ils repartent vides ensuite
  const mpClear=()=>{mpSet(mp,mp.type,"include","");mpSet(mp,mp.type,"exclude","");if(mp.type==="day"){delete mp.include;delete mp.exclude}$("nuInclude").value="";$("nuExclude").value="";autoGrow($("nuInclude"));autoGrow($("nuExclude"));n.upd=Date.now();save()};
  try{const g=await genMeals(slots,kcals);mpClear();
    if(mp.type==="day"||!n.menu||!n.menu.meals)n.menu={meals:g.meals,tips:g.tips,at:new Date().toISOString()};
    else{const i=n.menu.meals.findIndex(m=>m.slot===mp.type);if(i>=0)n.menu.meals[i]=g.meals[0];else n.menu.meals.push(g.meals[0]);n.menu.at=new Date().toISOString()}
    n.upd=Date.now();save();toast("Menu prêt");
  }catch(ex){toast(nuErrMsg(ex));if(ex.ai)mpClear()}
  stop();nuBusy="";btn.disabled=false;renderNuMenu();
  const f=$("nuMenu").querySelector(".dish");if(f)f.scrollIntoView({behavior:"smooth",block:"start"});
});
let meEdit=null,meAdd=null,meRecipe=null;
function renderNuMenu(){
  if(nuBusy==="menu")return;
  const m=NU().menu;if(!m||!m.meals||!m.meals.length){$("nuMenu").innerHTML=`<div class="card"><div class="empty">${L("Choisis tes repas, puis touche « Générer ».")}</div></div>`;return}
  m.meals.forEach(ml=>{const s=sumOf(ml.items);Object.assign(ml,{kcal:r0(s.kcal),p:r1(s.p),c:r1(s.c),f:r1(s.f)})});
  const T=sumOf(m.meals),td=iso(today());
  $("nuMenu").innerHTML=`<h2 style="margin-top:16px">${L("Ton menu")}</h2>`+boxes([[r0(T.kcal),"kcal"],[r1(T.p)+" g","Protéines","--m-p"],[r1(T.c)+" g","Glucides","--m-c"],[r1(T.f)+" g","Lipides","--m-f"]])+
    m.meals.map((ml,i)=>`<div class="dish"><div class="dish-h"><span class="dish-ic">${mono(ml.name)}</span><span class="dish-t"><b class="notr">${esc(ml.name)}</b><span class="small muted">${L(slotName(ml.slot))}${ml.target?` · ${L("objectif")} ${ml.target} kcal`:""}</span></span><span class="dish-kcal">${ml.kcal}<small>kcal</small></span><button type="button" class="x" data-medel="${i}" aria-label="${L("Retirer ce repas")}">×</button></div>
      ${macroHtml(ml)}<div class="dish-items">${ml.items.map((x,j)=>`<div class="dish-it"><span class="em">·</span><div class="grow"><b class="notr">${esc(x.name)}</b>${meEdit===`${i}:${j}`?`<span class="me-qty"><input type="text" inputmode="decimal" id="meQtyIn" value="${x.g||""}" aria-label="${L("Grammes")}"> g <button type="button" class="mini" data-meqok="${i}:${j}">OK</button></span>`:x.g?`<button type="button" class="qty-ed notr" data-meq="${i}:${j}" aria-label="${L("Changer la quantité")}">${esc(qtyTxt(x))}</button>`:`<span class="small muted notr">${esc(x.qty)}</span>`}</div><span class="k">${x.kcal} kcal</span>${x.g?`<button class="pen" data-meq="${i}:${j}" aria-label="${L("Changer la quantité")}">${PEN}</button>`:""}<button class="x" data-merm="${i}:${j}" aria-label="${L("Retirer")}">×</button></div>`).join("")}</div>
      ${meAdd===i?`<form class="me-add" data-meaddf="${i}"><input id="meAddIn" placeholder="${L("Ex. 30 g d'amandes")}" autocomplete="off"><button class="btn" type="submit">OK</button></form>`:""}
      ${meRecipe===i?`<div class="recipe"><b>${IC("book")} ${L("Recette")}</b>${nuBusy==="recipe"?`<div class="small muted" style="margin-top:6px"><span class="spin"></span> ${L("Préparation de la recette…")}</div>`:ml.steps&&ml.steps.length?`<ol class="notr">${ml.steps.map(s=>`<li>${esc(s)}</li>`).join("")}</ol>`:`<div class="small muted">${L("Recette indisponible pour le moment.")}</div>`}</div>`:""}
      <div class="me-act"><button type="button" class="mini" data-meadd="${i}">+ ${L("Aliment")}</button><button type="button" class="mini" data-merec="${i}">${IC("book")} ${L(meRecipe===i?"Cacher la recette":"Recette")}</button><button type="button" class="mini" data-meregen="${i}">↻ ${L("Autre idée")}</button>
        ${ml.ate===td?`<span class="me-done">✓ ${L("Dans ta journée")}</span>`:`<button type="button" class="mini" data-numeal="${i}" style="background:var(--accent);color:var(--on-accent)">＋ ${L("Ajouter à ma journée")}</button>`}</div></div>`).join("")+
    (m.tips?`<p class="small muted notr" style="margin:6px 4px">${esc(m.tips)}</p>`:"");
  if(meEdit){const i=$("meQtyIn");if(i){i.focus();i.select()}}if(meAdd!==null){const i=$("meAddIn");if(i)i.focus()}
}
// bandeau du menu : ce qu'il reste à manger aujourd'hui
function renderMenuLeft(){const el=$("nuMenuLeft");if(!el||!NU().plan)return;const t=dayTarget(iso(today())),s=sumOf(dayLog(iso(today()))),left=r0(t.kcal-s.kcal);
  el.innerHTML=`${IC("target")}<span class="grow">${left>=0?`${L("Il te reste")} <b>${fmtFull(left)} kcal</b> ${L("à manger aujourd'hui")}`:`${L("Objectif dépassé de")} <b>${fmtFull(-left)} kcal</b>`} <span class="muted">(${L("objectif")} ${fmtFull(t.kcal)})</span></span>`}
// changer la quantité d'un aliment du menu : calories et macros suivent
function meScale(i,j,g){const it=NU().menu.meals[i].items[j];if(!(g>0)||!it.g)return;const k=g/it.g;
  Object.assign(it,{g:r0(g),qty:r0(g)+" g",kcal:r0(it.kcal*k),p:r1(it.p*k),c:r1(it.c*k),f:r1(it.f*k)});NU().upd=Date.now();save()}
$("nuMenu").addEventListener("click",async e=>{const b=e.target.closest("button");if(!b)return;const n=NU(),M=n.menu;
  if(b.dataset.numeal){const ml=M.meals[+b.dataset.numeal],d0=nuDay;nuDay=iso(today());
    nuAddItems(ml.items,null,{name:ml.name,em:ml.em});nuDay=d0;ml.ate=iso(today());n.upd=Date.now();save();renderNutri();toast(`${L("Ajouté à ta journée")} · ${ml.kcal} kcal`);return}
  if(b.dataset.merec){const i=+b.dataset.merec,ml=M.meals[i];if(meRecipe===i){meRecipe=null;renderNuMenu();return}
    meRecipe=i;if(ml.steps&&ml.steps.length||nuBusy){renderNuMenu();return}
    nuBusy="recipe";renderNuMenu();
    try{const st=await getRecipe(ml);if(st){ml.steps=st;n.upd=Date.now();save()}else toast("Recette indisponible pour le moment.")}catch(ex){toast(nuErrMsg(ex))}
    nuBusy="";renderNuMenu();return}
  if(b.dataset.meq){meEdit=b.dataset.meq;meAdd=null;renderNuMenu();return}
  if(b.dataset.meqok){const[i,j]=b.dataset.meqok.split(":").map(Number);meScale(i,j,numIn($("meQtyIn").value));meEdit=null;renderNuMenu();return}
  if(b.dataset.merm){const[i,j]=b.dataset.merm.split(":").map(Number);M.meals[i].items.splice(j,1);if(!M.meals[i].items.length)M.meals.splice(i,1);n.upd=Date.now();save();renderNuMenu();return}
  if(b.dataset.medel){armDelete(b,()=>{M.meals.splice(+b.dataset.medel,1);n.upd=Date.now();save();renderNuMenu()});return}
  if(b.dataset.meadd){meAdd=+b.dataset.meadd;meEdit=null;renderNuMenu();return}
  if(b.dataset.meregen&&!nuBusy){const i=+b.dataset.meregen,ml=M.meals[i];nuBusy="regen";b.innerHTML=`<span class="spin"></span>`;
    try{const g=await genMeals([ml.slot||"lunch"],[ml.target||ml.kcal]);if(g.meals[0])M.meals[i]=g.meals[0];n.upd=Date.now();save();toast("Nouvelle idée prête")}catch(ex){toast(nuErrMsg(ex))}
    nuBusy="";renderNuMenu()}
});
$("nuMenu").addEventListener("keydown",e=>{if(e.target.id==="meQtyIn"&&e.key==="Enter"){e.preventDefault();const[i,j]=meEdit.split(":").map(Number);meScale(i,j,numIn(e.target.value));meEdit=null;renderNuMenu()}});
// ajouter un aliment à un repas du menu (mémoire ou analyse)
$("nuMenu").addEventListener("submit",async e=>{const f=e.target.closest("[data-meaddf]");if(!f)return;e.preventDefault();const q=$("meAddIn").value.trim();if(!q||nuBusy)return;
  const i=+f.dataset.meaddf;nuBusy="add";f.querySelector("button").innerHTML=`<span class="spin"></span>`;
  try{const r=await nuCall("aliment",{text:q});(r.items||[]).forEach(x=>NU().menu.meals[i].items.push({name:String(x.name||q),em:String(x.emoji||""),g:r0(x.grams),qty:String(x.quantity||r0(x.grams)+" g"),kcal:r0(x.kcal),p:r1(x.protein_g),c:r1(x.carbs_g),f:r1(x.fat_g)}));
    NU().upd=Date.now();save();meAdd=null}catch(ex){toast(nuErrMsg(ex))}
  nuBusy="";renderNuMenu()});
// minuit passé : la journée suivante commence
// retour sur Nutrition : on revient à aujourd'hui seulement après une longue absence (v44.4 : pas au retour de Claude, pour un repas d'un jour passé)
{let nuAway=0;document.addEventListener("visibilitychange",()=>{if(document.hidden){nuAway=Date.now();return}
  if(data.ui.view==="nutri"&&nuDay<iso(today())&&!nuPending&&Date.now()-nuAway>30*60e3){nuDay=iso(today());renderNutri()}})}

/* ---------- graphiques (macros, poids, calories) + bilans ---------- */
// Couleurs validées (outil de la charte dataviz) : protéines bleu, glucides orange, lipides vert d'eau ; calories en couleurs d'état + icône.
let grRange=7,grTipT=null;
const cssv=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
function grDays(n){const out=[],t=today();for(let i=n-1;i>=0;i--){const d=new Date(t);d.setDate(d.getDate()-i);out.push(iso(d))}return out}
const dLbl=(k,long)=>{const d=parse(k);return long?`${DOW[d.getDay()]} ${d.getDate()} ${MO[d.getMonth()]}`:`${d.getDate()}/${d.getMonth()+1}`};
function niceStep(v){if(!(v>0))return 1;const p=Math.pow(10,Math.floor(Math.log10(v))),f=v/p;return(f<=1?1:f<=2?2:f<=2.5?2.5:f<=5?5:10)*p}
function niceMax(v){const st=niceStep(v/4);return Math.max(st,Math.ceil(v/st)*st)}
const fmtFull=v=>Math.round(v).toLocaleString(LANG==="en"?"en-US":LANG==="nl"?"nl-NL":"fr-FR");
const fmtN=v=>{v=Math.round(v*10)/10;return v>=1000?(Math.round(v/100)/10+"K").replace(".",LANG==="en"?".":","):String(v).replace(".",LANG==="en"?".":",")};
function grTipShow(ev,html){const t=$("grTip");t.innerHTML=html;t.hidden=false;const x=ev.clientX,y=ev.clientY,w=t.offsetWidth,h=t.offsetHeight;
  t.style.left=Math.min(innerWidth-w-8,Math.max(8,x-w/2))+"px";t.style.top=Math.max(8,y-h-14)+"px";clearTimeout(grTipT)}
function grTipHide(){$("grTip").hidden=true;document.querySelectorAll("#v-graph .gr-x").forEach(x=>x.setAttribute("visibility","hidden"))}
// v44.7 : sur téléphone, l'infobulle reste tant qu'on est sur le graphique ; elle disparaît dès qu'on fait défiler la page
// (le navigateur annule alors le toucher : pointercancel) ou qu'on touche ailleurs
addEventListener("scroll",()=>{if(!$("grTip").hidden)grTipHide()},{passive:true,capture:true});
document.addEventListener("pointerdown",e=>{if(!$("grTip").hidden&&!e.target.closest("#v-graph svg"))grTipHide()},true);
document.addEventListener("pointercancel",e=>{if(e.target.closest&&e.target.closest("#v-graph svg"))grTipHide()},true);
document.addEventListener("touchmove",e=>{if(!$("grTip").hidden&&!(e.target.closest&&e.target.closest("#v-graph svg")))grTipHide()},{passive:true,capture:true});
// courbe(s) : 2px, points d'extrémité, réticule + bulle sur toutes les séries
function lineChart(el,days,series,opt={}){
  const W=Math.max(280,el.clientWidth||320),H=170,ml=34,mr=14,mt=12,mb=24,pw=W-ml-mr,ph=H-mt-mb;
  const all=series.flatMap(s=>s.vals.filter(v=>v!=null));if(opt.ref)all.push(opt.ref.v);
  if(!series.some(s=>s.vals.some(v=>v!=null))){el.innerHTML=`<div class="gr-empty">${L(opt.empty||"Pas encore de données sur cette période.")}</div>`;return}
  let lo=opt.zero?0:Math.min(...all),hi=Math.max(...all);if(!opt.zero){const pad=Math.max(1,(hi-lo)*.15);lo=Math.floor(lo-pad);hi=hi+pad}
  const top=opt.zero?niceMax(hi):Math.ceil(hi),step=opt.zero?niceStep(hi/4):(top-lo)/4,X=i=>ml+(days.length<2?pw/2:i*pw/(days.length-1)),Y=v=>mt+ph-(v-lo)/(top-lo||1)*ph;
  let g="";for(let v=lo;v<=top+1e-9;v+=step){const y=Y(v);g+=`<line class="grid" x1="${ml}" x2="${W-mr}" y1="${y}" y2="${y}"/><text class="ax" x="${ml-6}" y="${y+4}" text-anchor="end">${fmtN(v)}</text>`}
  const every=days.length>10?7:1;days.forEach((k,i)=>{if((days.length-1-i)%every===0)g+=`<text class="ax" x="${X(i)}" y="${H-6}" text-anchor="middle">${dLbl(k)}</text>`});
  if(opt.ref){const y=Y(opt.ref.v);g+=`<line x1="${ml}" x2="${W-mr}" y1="${y}" y2="${y}" stroke="var(--muted)" stroke-width="1"/><text class="lbl" x="${W-mr}" y="${y-5}" text-anchor="end">${esc(opt.ref.label)}</text>`}
  series.forEach(s=>{let d="",on=false;s.vals.forEach((v,i)=>{if(v==null){on=false;return}d+=(on?"L":"M")+X(i).toFixed(1)+" "+Y(v).toFixed(1);on=true});
    g+=`<path d="${d}" fill="none" stroke="var(${s.c})" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
    s.vals.forEach((v,i)=>{if(v!=null&&(opt.dots||i===s.vals.length-1||s.vals[i+1]==null&&(i===0||s.vals[i-1]==null)))g+=`<circle cx="${X(i)}" cy="${Y(v)}" r="4" fill="var(${s.c})" stroke="var(--surface)" stroke-width="2"/>`})});
  g+=`<line class="gr-x" x1="0" x2="0" y1="${mt}" y2="${mt+ph}" stroke="var(--muted)" stroke-width="1" visibility="hidden"/><rect class="gr-hit" x="${ml}" y="0" width="${pw}" height="${H}" fill="transparent"/>`;
  el.innerHTML=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(opt.aria||"")}" style="touch-action:pan-y">${g}</svg>`;
  const svg=el.querySelector("svg"),xl=svg.querySelector(".gr-x");
  const move=ev=>{const r=svg.getBoundingClientRect(),x=(ev.clientX-r.left)*W/r.width,i=Math.max(0,Math.min(days.length-1,Math.round((x-ml)/(pw/(Math.max(1,days.length-1))))));
    xl.setAttribute("x1",X(i));xl.setAttribute("x2",X(i));xl.setAttribute("visibility","visible");
    const rows=series.map(s=>s.vals[i]==null?"":`<div><b>${fmtN(s.vals[i])}${opt.unit||""}</b> <span class="k" style="--c:var(${s.c})"></span>${esc(L(s.label))}</div>`).join("");
    grTipShow(ev,`<div style="opacity:.75;margin-bottom:2px">${dLbl(days[i],true)}</div>${rows||L("Pas de données")}`)};
  svg.addEventListener("pointermove",move);svg.addEventListener("pointerdown",move);
  svg.addEventListener("pointerleave",ev=>{if(ev.pointerType!=="touch"){grTipHide();xl.setAttribute("visibility","hidden")}});
}
// colonnes des calories : couleur d'état (✓ dans l'objectif, ↓ pas assez, ↑ trop) + trait de l'objectif
const KST=v=>v.k==null?null:v.k<v.t*.9?"low":v.k>v.t*1.1?"high":"ok";
const KLAB={ok:["✓","Dans l'objectif","--st-good"],low:["↓","Pas assez","--st-warn"],high:["↑","Trop","--st-bad"]};
function colChart(el,days,vals){
  if(!vals.some(v=>v.k!=null)){el.innerHTML=`<div class="gr-empty">${L("Pas encore de données sur cette période.")}</div>`;return}
  const W=Math.max(280,el.clientWidth||320),H=170,ml=38,mr=8,mt=14,mb=24,pw=W-ml-mr,ph=H-mt-mb,n=days.length,band=pw/n,bw=Math.min(24,band*.62);
  const top=niceMax(Math.max(...vals.map(v=>Math.max(v.k||0,v.t||0)))*1.05),Y=v=>mt+ph-v/top*ph;
  const kst=niceStep(top/4);let g="";for(let v=0;v<=top+1e-9;v+=kst){const y=Y(v);g+=`<line class="grid" x1="${ml}" x2="${W-mr}" y1="${y}" y2="${y}"/><text class="ax" x="${ml-6}" y="${y+4}" text-anchor="end">${fmtN(v)}</text>`}
  const every=n>10?7:1;
  vals.forEach((v,i)=>{const cx=ml+band*i+band/2;if((n-1-i)%every===0)g+=`<text class="ax" x="${cx}" y="${H-6}" text-anchor="middle">${dLbl(days[i])}</text>`;
    if(v.k==null||v.k<=0)return;const st=KST(v),y=Y(v.k),h=mt+ph-y,r=Math.min(4,h,bw/2),x0=cx-bw/2;
    g+=`<path d="M${x0} ${mt+ph}V${y+r}Q${x0} ${y} ${x0+r} ${y}H${x0+bw-r}Q${x0+bw} ${y} ${x0+bw} ${y+r}V${mt+ph}Z" fill="var(${KLAB[st][2]})"/>
      <rect class="gr-bar" data-i="${i}" x="${ml+band*i}" y="${mt}" width="${band}" height="${ph}" fill="transparent"/>`});
  const t=vals[vals.length-1].t;if(t){const y=Y(t);g+=`<line x1="${ml}" x2="${W-mr}" y1="${y}" y2="${y}" stroke="var(--ink)" stroke-width="1" opacity=".55"/><text class="lbl" x="${W-mr}" y="${y-5}" text-anchor="end">${L("Objectif")} ${fmtFull(t)} kcal</text>`}
  el.innerHTML=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${L("Calories par jour")}" style="touch-action:pan-y">${g}</svg>`;
  el.querySelector("svg").addEventListener("pointermove",ev=>{const b=ev.target.closest(".gr-bar");if(!b){grTipHide();return}const v=vals[+b.dataset.i],st=KLAB[KST(v)];
    grTipShow(ev,`<div style="opacity:.75;margin-bottom:2px">${dLbl(days[+b.dataset.i],true)}</div><b>${r0(v.k)} kcal</b> / ${r0(v.t)}<div>${st[0]} ${L(st[1])}</div>`)});
  el.querySelector("svg").addEventListener("pointerdown",ev=>ev.target.dispatchEvent(new PointerEvent("pointermove",ev)));
  el.querySelector("svg").addEventListener("pointerleave",ev=>{if(ev.pointerType!=="touch")grTipHide()});
}
function grData(days){const n=NU(),pl=n.plan||{},W=new Map(n.weights.map(w=>[w.day,w.kg]));
  return days.map(k=>{const l=dayLog(k),s=sumOf(l);return{k,has:l.length>0,kcal:s.kcal,p:s.p,c:s.c,f:s.f,t:pl.kcal?dayTarget(k).kcal:0,kg:W.has(k)?W.get(k):null}})}
function renderGraph(){
  if(!$("grMacros"))return;applySoon();
  grRange=data.ui.grRange||7;document.querySelectorAll("#grRange button").forEach(b=>b.setAttribute("aria-pressed",+b.dataset.range===grRange));
  const days=grDays(grRange),D=grData(days),n=NU(),pl=n.plan||{};
  // v51 (ticket #3) : courbes, colonnes, légendes et tableau dessinés par React (app/src/Charts.tsx) ; ancien rendu en secours
  if(window.SCIslands&&window.SCIslands.graph&&!window.__noIslands){try{
    window.SCIslands.graph({macros:$("grMacros"),weight:$("grWeight"),kcal:$("grKcal"),table:$("grTable"),macroLeg:$("grMacroLeg"),kcalLeg:$("grKcalLeg")},
      {days,D,macros:MAC.map(([k,l,v])=>({k,label:l,c:v,goal:pl[k]||undefined})),targetWeight:(n.profile&&n.profile.target)||null,
       widths:{macros:$("grMacros").clientWidth,weight:$("grWeight").clientWidth,kcal:$("grKcal").clientWidth},
       i18n:{L,MOL,MO,DOWL,DOW,lang:LANG},tip:{show:grTipShow,hide:grTipHide}});
    const tw=n.profile&&n.profile.target;$("grWeightSub").textContent=tw?`${L("en kg")} · ${L("objectif")} ${fmtN(tw)} kg`:L("en kg");
    const tk=D.find(d=>d.k===iso(today()));if(document.activeElement!==$("grWIn"))$("grWIn").value=tk&&tk.kg!=null?String(tk.kg).replace(".",LANG==="en"?".":","):"";
    renderReviews();return}catch(e){reportErr("island graph: "+(e&&e.message))}}
  $("grMacroLeg").innerHTML=MAC.map(([k,l,v])=>`<span><i style="--c:var(${v})"></i>${L(l)}${pl[k]?` <span>(${L("objectif")} ${pl[k]} g)</span>`:""}</span>`).join("");
  lineChart($("grMacros"),days,MAC.map(([k,l,v])=>({label:l,c:v,vals:D.map(d=>d.has?r1(d[k]):null)})),{zero:true,unit:" g",aria:L("Macros par jour")});
  const tw=n.profile&&n.profile.target;$("grWeightSub").textContent=tw?`${L("en kg")} · ${L("objectif")} ${fmtN(tw)} kg`:L("en kg");
  lineChart($("grWeight"),days,[{label:"Poids",c:"--m-p",vals:D.map(d=>d.kg)}],{dots:true,unit:" kg",ref:tw?{v:tw,label:`${L("Objectif")} ${fmtN(tw)} kg`}:null,empty:"Entre ton poids ci-dessus pour suivre son évolution.",aria:L("Poids")});
  const tk=D.find(d=>d.k===iso(today()));if(document.activeElement!==$("grWIn"))$("grWIn").value=tk&&tk.kg!=null?String(tk.kg).replace(".",LANG==="en"?".":","):"";
  $("grKcalLeg").innerHTML=Object.values(KLAB).map(([ic,l,v])=>`<span><i class="box" style="--c:var(${v})"></i>${ic} ${L(l)}</span>`).join("");
  colChart($("grKcal"),days,D.map(d=>({k:d.has?d.kcal:null,t:d.t})));
  $("grTable").innerHTML=`<table class="gr-tbl"><thead><tr><th>${L("Jour")}</th><th>kcal</th><th>P</th><th>G</th><th>L</th><th>kg</th></tr></thead><tbody>${D.slice().reverse().map(d=>`<tr><td>${dLbl(d.k,true)}</td><td>${d.has?r0(d.kcal):"–"}</td><td>${d.has?r0(d.p):"–"}</td><td>${d.has?r0(d.c):"–"}</td><td>${d.has?r0(d.f):"–"}</td><td>${d.kg!=null?fmtN(d.kg):"–"}</td></tr>`).join("")}</tbody></table>`;
  renderReviews();
}
$("grRange").addEventListener("click",e=>{const b=e.target.closest("[data-range]");if(!b)return;data.ui.grRange=+b.dataset.range;saveUI();renderGraph()});
$("grWForm").addEventListener("submit",e=>{e.preventDefault();const kg=numIn($("grWIn").value);if(!(kg>=25&&kg<=300)){toast("Indique ton poids en kg.");return}
  const n=NU(),k=iso(today()),w=n.weights.find(x=>x.day===k);if(w){w.kg=kg;w.upd=Date.now()}else n.weights.push({id:uid(),day:k,kg,upd:Date.now()});
  save();$("grWIn").blur();renderGraph();toast("Poids enregistré")});
addEventListener("resize",()=>{if(data.ui.view==="graph")renderGraph()});
// --- bilans : commentaire du jour, de la semaine, et suivi semaine par semaine ---
const weekKey=d=>iso(mondayOf(d||new Date()));
function grPayload(days){const D=grData(days),n=NU(),pl=n.plan||{};
  return{targets:{kcal:pl.kcal,protein_g:pl.p,carbs_g:pl.c,fat_g:pl.f},goal:n.profile&&n.profile.goal,target_weight_kg:n.profile&&n.profile.target||null,
    days:D.map(d=>({date:d.k,logged:d.has,kcal:r0(d.kcal),protein_g:r0(d.p),carbs_g:r0(d.c),fat_g:r0(d.f),weight_kg:d.kg,foods:dayLog(d.k).map(x=>x.name).slice(0,20)}))}}
let revBusy="";
function revHtml(r,scope){
  const head=scope==="day"?L("Commentaire du jour"):`${L("Commentaire de la semaine")}`;
  if(revBusy===scope)return `<h3>${head}</h3><div id="revLoad-${scope}"></div>`;
  if(!r)return `<h3>${head}</h3><p class="muted">${L(scope==="day"?"Un résumé de ta journée : macros, poids et calories.":"Ce que tu as bien fait cette semaine, ce qui reste à améliorer, et des pistes concrètes.")}</p><button type="button" class="btn" data-rev="${scope}">${L("Générer")}</button>`;
  const li=a=>a&&a.length?`<ul>${a.map(x=>`<li class="notr">${esc(x)}</li>`).join("")}</ul>`:"";
  return `<h3>${head}<button type="button" class="mini" data-rev="${scope}">↻ ${L("Actualiser")}</button></h3><p class="notr">${esc(r.summary)}</p>
    ${r.good&&r.good.length?`<div class="lab">✓ ${L("Bien joué")}</div>${li(r.good)}`:""}${r.improve&&r.improve.length?`<div class="lab">↓ ${L("À améliorer")}</div>${li(r.improve)}`:""}${r.tips&&r.tips.length?`<div class="lab">→ ${L("Pistes")}</div>${li(r.tips)}`:""}
    <span class="small muted">${L("Mis à jour")} ${fmtWhen(Date.parse(r.at))}</span>`;
}
function renderReviews(){
  const n=NU(),rv=n.rev||{},dk=iso(today()),wk=weekKey();
  // v52 (ticket #3) : commentaires et historique dessinés par React (app/src/Reviews.tsx) ; l'animation de chargement reste celle de l'app
  if(window.SCIslands&&window.SCIslands.reviews&&!window.__noIslands){try{
    window.SCIslands.reviews({day:$("grDay"),week:$("grWeek"),weeks:$("grWeeks")},{day:rv.day&&rv.day.key===dk?rv.day:null,week:rv.week&&rv.week.key===wk?rv.week:null,
      weeks:n.weeks.slice().sort((a,b)=>b.id.localeCompare(a.id)),busy:revBusy,i18n:{L,MOL,MO,DOWL}});
    ["day","week"].forEach(sc=>{const el=$("revLoad-"+sc);if(el)revStops[sc]=nuLoading(el,sc==="day"?["Lecture de ta journée…","Analyse des macros…","Rédaction du commentaire…"]:["Lecture de ta semaine…","Analyse des tendances…","Recherche de pistes d'amélioration…"])});
    return}catch(e){reportErr("island reviews: "+(e&&e.message))}}
  $("grDay").innerHTML=revHtml(rv.day&&rv.day.key===dk?rv.day:null,"day");
  $("grWeek").innerHTML=revHtml(rv.week&&rv.week.key===wk?rv.week:null,"week");
  ["day","week"].forEach(sc=>{const el=$("revLoad-"+sc);if(el)revStops[sc]=nuLoading(el,sc==="day"?["Lecture de ta journée…","Analyse des macros…","Rédaction du commentaire…"]:["Lecture de ta semaine…","Analyse des tendances…","Recherche de pistes d'amélioration…"])});
  const past=n.weeks.slice().sort((a,b)=>b.id.localeCompare(a.id));
  $("grWeeks").innerHTML=past.length?past.map(w=>{const m=parse(w.id),s=new Date(m);s.setDate(s.getDate()+6);
    return `<details class="setsec gr-wk"><summary><span>${L("Semaine du")} ${m.getDate()} ${MO[m.getMonth()]} ${L("au")} ${s.getDate()} ${MO[s.getMonth()]}</span><svg class="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></summary><div class="setsec-in gr-rev" style="padding-top:0">${revHtml(w,"past").replace(/<h3>.*?<\/h3>/,"")}</div></details>`}).join("")
    :`<div class="card"><div class="empty">${L("Génère le commentaire de la semaine : chaque semaine sera gardée ici pour suivre tes progrès.")}</div></div>`;
}
const revStops={};
document.addEventListener("click",async e=>{const b=e.target.closest("[data-rev]");if(!b||revBusy||!nutriAllowed())return;const scope=b.dataset.rev;
  revBusy=scope;renderReviews();
  try{const days=scope==="day"?grDays(7):grDays(7),r=await nuCall("bilan",{scope,data:{...grPayload(days),today:iso(today())}});
    const n=NU(),rec={key:scope==="day"?iso(today()):weekKey(),summary:String(r.summary||""),good:(r.good||[]).map(String),improve:(r.improve||[]).map(String),tips:(r.tips||[]).map(String),at:new Date().toISOString()};
    n.rev=n.rev||{};n.rev[scope]=rec;
    if(scope==="week"){const w=n.weeks.find(x=>x.id===rec.key);if(w)Object.assign(w,rec,{upd:Date.now()});else n.weeks.push({id:rec.key,...rec,upd:Date.now()})}
    n.upd=Date.now();save();
  }catch(ex){toast(nuErrMsg(ex))}
  (revStops[scope]||(()=>{}))();revBusy="";renderReviews();
});

/* ---------- onglet Appli ---------- */
function renderApp(){
  const ok=window.matchMedia("(display-mode: standalone)").matches||navigator.standalone===true;
  $("appStatus").innerHTML=ok?'<span class="syncdot"></span><span>Tu utilises déjà Sid\'note comme application.</span>'
    :'<span class="syncdot wait"></span><span>Tu es dans le navigateur. Suis les étapes ci-dessous pour installer l\'app.</span>';
  const ai=$("authInstall");if(ai)ai.hidden=ok;
}
renderApp();

/* ---------- langue, présentation, page d'accueil ---------- */
function setLang(v){LANG=v;ls.set("sidnote-lang",v);if(session){data.prefs.lang=v;save()}location.reload()}
// traduction de l'interface : on remplace les textes français affichés par leur version anglaise
const NOTR=".ttl,.ms-name,.doc-open b,#vwTitle,.blk b,.next .t,.notr,#accName,textarea,input,select option[data-user]";
function trStr(raw){
  const t=raw.trim();if(!t||!/[A-Za-zÀ-ÿ]/.test(t))return raw;
  let r=DICT[t];
  if(r===undefined){for(const[re,f]of PATS){const m=t.match(re);if(m){r=typeof f==="function"?f(...m.slice(1)):t.replace(re,f);break}}}
  if(r===undefined||r===t)return raw;
  return raw.replace(t,r);
}
function trNode(n){
  if(n.nodeType===3){const p=n.parentElement;if(!p||p.closest(NOTR)||p.closest("script,style"))return;const v=trStr(n.nodeValue);if(v!==n.nodeValue)n.nodeValue=v;return}
  if(n.nodeType!==1||n.matches("script,style"))return;
  for(const a of ["placeholder","aria-label","title"]){const v=n.getAttribute(a);if(v){const w=trStr(v);if(w!==v)n.setAttribute(a,w)}}
  if(n.closest(NOTR)&&!n.matches("input,select,textarea"))return;
  const w=document.createTreeWalker(n,NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT);let x;
  while((x=w.nextNode()))if(x.nodeType===3)trNode(x);else for(const a of ["placeholder","aria-label","title"]){const v=x.getAttribute(a);if(v){const u=trStr(v);if(u!==v)x.setAttribute(a,u)}}
}
function startTranslate(){
  document.documentElement.lang=LANG;document.title="Sid'compagnon";
  if(LANG==="nl"){
    MO.splice(0,12,"jan.","feb.","mrt.","apr.","mei","jun.","jul.","aug.","sep.","okt.","nov.","dec.");
    MOL.splice(0,12,"Januari","Februari","Maart","April","Mei","Juni","Juli","Augustus","September","Oktober","November","December");
    DOW.splice(0,7,"zondag","maandag","dinsdag","woensdag","donderdag","vrijdag","zaterdag");
    DOWL.splice(0,7,"zondag","maandag","dinsdag","woensdag","donderdag","vrijdag","zaterdag");
    const dw=document.querySelector(".cal-dow");if(dw)dw.innerHTML="<span>M</span><span>D</span><span>W</span><span>D</span><span>V</span><span>Z</span><span>Z</span>";
  }else{
  MO.splice(0,12,"Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec");
  MOL.splice(0,12,"January","February","March","April","May","June","July","August","September","October","November","December");
  DOW.splice(0,7,"Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday");
  DOWL.splice(0,7,"Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday");
  const dw=document.querySelector(".cal-dow");if(dw)dw.innerHTML="<span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>";
  }
  trNode(document.body);
  new MutationObserver(ms=>{for(const m of ms){
    if(m.type==="characterData")trNode(m.target);
    else if(m.type==="attributes")trNode(m.target);
    else m.addedNodes.forEach(trNode)}}).observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:["placeholder","aria-label","title"]});
}
// v31 : choix de la langue sur l'écran de connexion (français, anglais, néerlandais)
{const LN={fr:"Français",en:"English",nl:"Nederlands"},el=$("authLang");el.outerHTML=`<span class="auth-langs">${Object.entries(LN).map(([k,v])=>`<button type="button" class="linkbtn" data-alang="${k}" aria-pressed="${k===(LANG||"fr")}">${v}</button>`).join("")}</span>`;
  document.addEventListener("click",e=>{const b=e.target.closest("[data-alang]");if(b&&b.dataset.alang!==LANG)setLang(b.dataset.alang)})}
$("langSel").value=LANG;
$("langSel").addEventListener("change",e=>setLang(e.target.value));
// page d'accueil
function renderHomeSel(){
  const cur=(data.prefs&&data.prefs.home)||"home";
  $("homeSel").innerHTML=`<option value="home">${L("Aujourd'hui")}</option><option value="last">${L("Dernière page ouverte")}</option>`+
    [...TABS.filter(([k])=>tabAllowed(k)&&data.prefs.tabs[k]!==false),["more","Réglages"]].map(([k,l])=>`<option value="${k}">${L(l)}</option>`).join("");
  $("homeSel").value=[...$("homeSel").options].some(o=>o.value===cur)?cur:"home";
}
$("homeSel").addEventListener("change",e=>{data.prefs.home=e.target.value;data.prefs.homeV=1;save();toast("Page d'accueil enregistrée")});
// présentation au premier lancement
const ONB_DESC={
  lists:"Une liste de courses ou de choses à faire, partagée avec tes proches : chacun la voit et la coche.",
  plan:"Ton calendrier : examens, rendez-vous, événements. Tu peux aussi y relier ton horaire de cours.",
  todo:"Tes tâches, rangées par catégories pour regrouper tout ce qu'il faut faire pour un projet.",
  notes:"Tes notes libres : idées, listes, brouillons, à écrire comme tu veux.",
  pwd:"Tes mots de passe et les sites qui vont avec, protégés par un code à 5 chiffres.",
  pomo:"Travaille concentré : sessions et pauses s'enchaînent toutes seules, avec ta musique.",
  graph:"Tes macros, ton poids et tes calories en graphiques, avec un bilan du jour et de la semaine.",
  nutri:"Tes calories et tes macros du jour, et des menus faits pour toi.",
  muscu:"Tes séances et tes programmes, tes charges et tes répétitions, avec la progression d'une fois à l'autre.",
  docs:"Range tes PDF, scanne des feuilles avec l'appareil photo et retrouve-les en un instant.",
  app:"Les étapes pour installer Sid'compagnon sur ton écran d'accueil."};
let onbSel={};
const ONB_GROUP={orga:["agenda","Organise tes journées","Ton agenda, tes tâches du jour et un minuteur de concentration."],
  sport:["fit","Bouge et mange bien","Ton programme de musculation, ta nutrition et tes progrès en graphiques."],
  perso:["note","Garde tout à l'abri","Tes notes, tes documents et tes mots de passe, protégés par ton code et le mot de passe de ton compte."]};
function openOnb(){
  onbSel={};TABS.forEach(([k])=>{if(!OFF_TABS.includes(k))onbSel[k]=data.prefs.tabs[k]!==false});
  document.querySelectorAll("#onbLang button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.lang===LANG));
  const it=([k,l])=>`<label class="onb-it ${onbSel[k]?"":"off"}" data-onb="${k}"><span class="ic">${ICON(k)}</span><span class="grow"><b>${L(l)}</b><span class="small muted">${L(ONB_DESC[k])}</span></span><input type="checkbox" class="switch" data-onbk="${k}" ${onbSel[k]?"checked":""} aria-label="${L("Garder")} ${L(l)}"></label>`;
  $("onbGroups").innerHTML=GROUPS.filter(g=>ONB_GROUP[g.k]).map(g=>{const ts=TABS.filter(([k])=>g.tabs.includes(k)&&tabAllowed(k)),[em,t,sub0]=ONB_GROUP[g.k],sub=g.k==="sport"&&!tabAllowed("nutri")?"Tes séances, ton chrono et ton minuteur.":sub0;
    // v43 : une diapositive par app, dans sa couleur : à gauche l'app (logo, nom, promesse), à droite ses fonctions à garder
    return `<section class="onb-slide onb-app" data-app="${em}"><div class="onb-box onb-split">
      <div class="onb-hero"><div class="onb-logo" data-app="${em}">${LOGO(em)}</div><div class="onb-grp">${esc(g.label)}</div><h1>${L(t)}</h1><p class="sub">${L(sub)}</p>
        <p class="onb-count">${ts.length} ${L(ts.length>1?"fonctions":"fonction")}</p></div>
      <div class="onb-pick"><div class="onb-pick-h"><span class="eyebrow">${L("Ce que tu gardes")}</span>${ts.length>1?`<button type="button" class="linkbtn onb-all" data-onball="${g.k}"></button>`:""}</div>
        <div class="onb-list">${ts.map(it).join("")}</div><p class="small muted onb-hint">${L("Touche une ligne pour la garder ou la masquer. Tout reste modifiable dans Réglages.")}</p></div>
    </div></section>`}).join("");
  onbAllLbl();onbLook();$("onb").hidden=false;document.body.style.overflow="hidden";onbGoTo(0);
}
const onbSlides=()=>[...document.querySelectorAll("#onbTrack .onb-slide")];
// v43 : diapositive affichée selon son numéro, jamais selon la position de défilement
let onbI=0;const onbIdx=()=>onbI;
function onbStep(){const sl=onbSlides(),i=Math.min(sl.length-1,onbIdx());sl.forEach((x,j)=>{x.classList.toggle("on",j===i);x.inert=j!==i});const ap=sl[i]&&sl[i].dataset.app;if(ap)$("onb").dataset.app=ap;else delete $("onb").dataset.app;
  $("onbDots").innerHTML=sl.map((_,j)=>`<i class="${j===i?"on":""}"></i>`).join("");$("onbPrev").style.visibility=i?"visible":"hidden";$("onbNext").hidden=i===sl.length-1}
function onbGoTo(i){const sl=onbSlides();onbI=Math.max(0,Math.min(sl.length-1,i));const t=$("onbTrack");t.scrollLeft=0;t.style.setProperty("--i",onbI);onbStep();const s=sl[onbI];if(s)s.scrollTop=0}
$("onbTrack").addEventListener("scroll",()=>{if($("onbTrack").scrollLeft)$("onbTrack").scrollLeft=0});
$("onbNext").addEventListener("click",()=>onbGoTo(onbIdx()+1));$("onbPrev").addEventListener("click",()=>onbGoTo(onbIdx()-1));
// thème appliqué tout de suite
function onbLook(){const th=data.prefs.theme||"dark";document.querySelectorAll("#onbTheme button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.otheme===th));
  // v36 : les couleurs (ambiances) se choisissent aussi ici
  const pal=data.prefs.palette||"or",dark=document.documentElement.dataset.theme==="dark"||(!document.documentElement.dataset.theme&&matchMedia("(prefers-color-scheme: dark)").matches);
  $("onbPal").innerHTML=Object.entries(PALETTES).map(([k,a])=>`<button type="button" class="pal" data-opal="${k}" aria-pressed="${k===pal}"><span class="pal-dot" style="--pa:${dark?a[3]:a[1]};--pb:${dark?a[4]:a[2]}">${k===pal?CHECK:""}</span><span class="pal-n">${L(a[0])}</span></button>`).join("")}
$("onbPal").addEventListener("click",e=>{const b=e.target.closest("[data-opal]");if(!b)return;data.prefs.palette=b.dataset.opal;applyLook();onbLook()});
$("onbTheme").addEventListener("click",e=>{const b=e.target.closest("[data-otheme]");if(!b)return;data.prefs.theme=b.dataset.otheme;applyLook();onbLook()});
$("onbGroups").addEventListener("change",e=>{const c=e.target.closest("[data-onbk]");if(!c)return;onbSel[c.dataset.onbk]=c.checked;const card=c.closest(".onb-it");card.classList.toggle("off",!c.checked);card.classList.remove("bump");void card.offsetWidth;card.classList.add("bump");if(navigator.vibrate)navigator.vibrate(8)});
// v36 : « Tout décocher » / « Tout cocher » sur chaque diapositive de modules
function onbAllLbl(){document.querySelectorAll("#onbGroups [data-onball]").forEach(b=>{const ks=[...b.closest(".onb-slide").querySelectorAll("[data-onbk]")];
  b.textContent=L(ks.some(c=>c.checked)?"Tout décocher":"Tout cocher")})}
$("onbGroups").addEventListener("click",e=>{const b=e.target.closest("[data-onball]");if(!b)return;const ks=[...b.closest(".onb-slide").querySelectorAll("[data-onbk]")],on=!ks.some(c=>c.checked);
  ks.forEach(c=>{c.checked=on;onbSel[c.dataset.onbk]=on;c.closest(".onb-it").classList.toggle("off",!on)});onbAllLbl()});
$("onbGroups").addEventListener("change",()=>setTimeout(onbAllLbl));
$("onbLang").addEventListener("click",e=>{const b=e.target.closest("[data-lang]");if(!b||b.dataset.lang===LANG)return;data.prefs.onbPending=true;setLang(b.dataset.lang)});
function onbFinish(){
  if(!Object.values(onbSel).some(Boolean)){toast("Garde au moins un onglet");return}
  Object.assign(data.prefs.tabs,onbSel);data.prefs.onboarded=true;delete data.prefs.onbPending;save();
  $("onb").hidden=true;document.body.style.overflow="";applyTabs();renderHomeSel();
  show("home");toast("Bienvenue sur Sid'compagnon");
}
$("onbGo").addEventListener("click",onbFinish);$("onbSkip").addEventListener("click",onbFinish);
$("replayOnb").addEventListener("click",openOnb);

/* ---------- proposition des notifications (v27) : une fois par appareil ---------- */
function maybeAskNotif(){if(!session||isTrial()||data.ui.notifAsked||!$("onb").hidden)return;
  const can=pushOK();if(can&&(Notification.permission!=="default"))return;
  if(!can&&!(isIOS&&!standalone()))return; // navigateur sans notifications : rien à proposer
  $("naTitle").textContent=L("Ne rate plus rien");
  $("naText").textContent=L(can?"Active les notifications : Sid'compagnon te prévient avant tes rendez-vous, tes cours et tes échéances. Tu choisis quand, dans Agenda ou Réglages."
    :"Pour recevoir des rappels avant tes rendez-vous et tes cours, installe d'abord Sid'compagnon sur ton écran d'accueil, puis ouvre-le depuis son icône.");
  $("naYes").textContent=L(can?"Activer les notifications":"Voir comment l'installer");$("notifAsk").hidden=false}
const naDone=()=>{data.ui.notifAsked=Date.now();saveUI();$("notifAsk").hidden=true};
$("naYes").addEventListener("click",async e=>{if(pushOK()){await notifToggle(e.currentTarget);naDone()}else{naDone();show("app")}});
$("naNo").addEventListener("click",naDone);
/* ---------- v29 : quand une fenêtre (feuille) est ouverte, la page derrière est figée ---------- */
// sur iPhone, overflow:hidden ne suffit pas : on fige le corps de la page à sa position et on la rétablit à la fermeture
let lockY=0;
function syncScrollLock(){const open=[...document.querySelectorAll(".sheet-bg")].some(x=>!x.hidden),on=document.documentElement.classList.contains("modal-open");
  if(open&&!on){lockY=window.scrollY;document.body.style.top=`-${lockY}px`;document.documentElement.classList.add("modal-open")}
  else if(!open&&on){document.documentElement.classList.remove("modal-open");document.body.style.top="";window.scrollTo(0,lockY)}}
{const mo=new MutationObserver(syncScrollLock);document.querySelectorAll(".sheet-bg").forEach(x=>mo.observe(x,{attributes:true,attributeFilter:["hidden"]}))}
// v35 : fenêtres accessibles : annoncées comme fenêtres, le focus y entre (et y reste au clavier), revient où il était à la fermeture, Échap ferme
// v36 : sur iPhone, quand le clavier s'ouvre, la fenêtre suit la partie visible de l'écran (sinon les touchers tombent à côté)
let kbUser=false;addEventListener("keydown",e=>{if(e.key==="Tab")kbUser=true},true);addEventListener("pointerdown",()=>{kbUser=false},true);
// v44.4 : pendant la saisie (clavier ouvert), la barre du bas est masquée (html.kb-open) ; à la fermeture du clavier, iOS est forcé
// à se recaler (sinon les éléments « fixes » peuvent rester à la hauteur du clavier). v44.5 : la barre n'utilise plus --vvt/--vvh.
if(window.visualViewport){const vv=visualViewport,de=document.documentElement,st=de.style,maxH={};
  const editing=()=>{const a=document.activeElement;return !!a&&(a.isContentEditable||a.tagName==="TEXTAREA"||(a.tagName==="INPUT"&&!/^(button|checkbox|radio|range|color|file|submit|reset|image)$/.test(a.type)))};
  const f=()=>{st.setProperty("--vvh",vv.height+"px");st.setProperty("--vvt",vv.offsetTop+"px");
    const o=innerWidth>innerHeight?"l":"p";if(!editing()||!maxH[o])maxH[o]=Math.max(maxH[o]||0,vv.height*vv.scale);
    de.classList.toggle("kb-open",editing()&&vv.height*vv.scale<maxH[o]-120)};
  vv.addEventListener("resize",f);vv.addEventListener("scroll",f);addEventListener("orientationchange",()=>{for(const k in maxH)delete maxH[k];setTimeout(f,400)});
  addEventListener("focusin",()=>setTimeout(f,350));
  addEventListener("focusout",()=>setTimeout(()=>{f();if(!editing()&&!de.classList.contains("modal-open"))window.scrollTo(window.scrollX,window.scrollY)},350));f()}
{const sheets=[...document.querySelectorAll(".sheet-bg")],FOC='a[href],button:not([disabled]),input:not([disabled]):not([type=hidden]),select,textarea,[tabindex]:not([tabindex="-1"])';
  const vis=el=>!!(el.offsetWidth||el.offsetHeight||el.getClientRects().length);
  const top=()=>sheets.filter(x=>!x.hidden).pop()||null;
  sheets.forEach(bg=>{const d=bg.querySelector(".sheet")||bg;d.setAttribute("role","dialog");d.setAttribute("aria-modal","true");d.tabIndex=-1;
    const t=d.querySelector(".sheet-head b,.na-t");if(t){if(!t.id)t.id=bg.id+"-t";d.setAttribute("aria-labelledby",t.id)}
    new MutationObserver(()=>{
      if(!bg.hidden){if(!bg._back)bg._back=document.activeElement;setTimeout(()=>{if(bg.hidden||!kbUser||d.contains(document.activeElement))return;
        d.focus({preventScroll:true})},60)} // la fenêtre elle-même (pas un champ : le clavier de l'iPhone ne s'ouvre pas tout seul)
      else{const b=bg._back;bg._back=null;if(b&&document.contains(b)&&!top())try{b.focus({preventScroll:true})}catch(e){}}
    }).observe(bg,{attributes:true,attributeFilter:["hidden"]})});
  window.addEventListener("keydown",e=>{const bg=top();if(!bg)return;
    if(e.key==="Escape"){e.preventDefault();e.stopPropagation();const c=bg.querySelector(".sheet-head .x,[data-esc]");if(c)c.click();else bg.hidden=true;return}
    if(e.key==="Tab"){const f=[...bg.querySelectorAll(FOC)].filter(vis);if(!f.length)return;const a=f[0],z=f[f.length-1];
      if(!bg.contains(document.activeElement)){e.preventDefault();a.focus();return}
      if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}},true)}
/* ---------- démarrage ---------- */
hydrateIcons();document.querySelectorAll(".onb-floats [data-fn]").forEach(e=>e.innerHTML=ICON(e.dataset.fn));
document.addEventListener("focusin",e=>{if(e.target.matches&&e.target.matches('input[list="typeList"]'))typeChipsFor(e.target)});
typeChipsFor($("fCat"));typeChipsFor($("eCat"));
if(LANG==="en"||LANG==="nl")startTranslate();
recoveryFromHash();
if(ephExpired){
  // l'app a été fermée sans « Rester connecté » : on envoie les dernières modifs puis on déconnecte
  document.body.classList.add("locked");
  Promise.race([push(),new Promise(r=>setTimeout(r,4000))]).catch(()=>{}).finally(()=>endSession("",false));
}else if(!session){
  document.body.classList.add("locked");$("auth").hidden=false;
  $("aEmail").value=ls.get(LAST_KEY)||"";
  // v34 : nouveau visiteur → « Créer un compte » en premier ; on montre ce que fait l'app
  setMode(ls.get(LAST_KEY)&&!ls.get("sidnote-trial-carry")?"login":"signup");authWait();
  $("authFeats").innerHTML=[["plan","Organise tes journées","Agenda et tâches du jour, avec des rappels."],
    ["pwd","Garde tout à l'abri","Notes, documents scannés et mots de passe, chiffrés sur ton appareil."],
    ["muscu","Ta santé","Programme de musculation sur mesure, nutrition et graphiques."],
    ["app","Partout avec toi","Sur smartphone et sur ordinateur, même sans connexion."]].map(([k,t,d])=>`<li><span class="af-ic">${ICON(k)}</span><span><b>${L(t)}</b><span class="small muted">${L(d)}</span></span></li>`).join("");
  $("aTrial").addEventListener("click",startTrial);if(ls.get("sidnote-trial-carry")){$("aTrial").textContent=L("Revenir à l'essai");$("authSub").textContent=L("Crée ton compte : les données de ton essai seront reprises.")}
  if(!CONFIGURED){$("authSub").textContent="L'app n'est pas encore reliée à son serveur.";}
  try{const m=sessionStorage.getItem("sidnote-msg");if(m){$("aErr").textContent=m;$("aErr").hidden=false;sessionStorage.removeItem("sidnote-msg")}}catch(e){}
}else{
  // anciens utilisateurs : pas de présentation, ils connaissent déjà l'app
  if(!data.prefs.onboarded&&(data.todos.length||data.tasks.length||(data.muscu&&data.muscu.sessions.length)||(data.pomo&&Object.keys(data.pomo.log||{}).length))){data.prefs.onboarded=true;save()}
  renderAccount();
  icalLoadCache();renderCals();
  renderAll();applyTabs();icalState();icalFetch(false);renderHomeSel();
  document.addEventListener("visibilitychange",()=>{if(!document.hidden)icalFetch(false)});
  // v32 : page d'ouverture choisie dans Réglages (« Aujourd'hui » par défaut, ou la dernière page ouverte)
  // v36 : un ancien choix caché (d'avant la v32) ne doit plus faire ouvrir l'app ailleurs qu'Aujourd'hui : on repart d'Aujourd'hui une fois
  if(!data.prefs.homeV){data.prefs.home="home";data.prefs.homeV=1;save()}
  // v43 : toujours Aujourd'hui, en haut (demande de Sid) ; l'ancien réglage « Page d'accueil » est gardé dans les données mais n'est plus proposé
  show("home");introReady=true;bootTop();[120,500,1200,2600].forEach(t=>setTimeout(bootTop,t));
  try{document.fonts&&document.fonts.ready.then(bootTop)}catch(e){}
  addEventListener("pageshow",e=>{if(e.persisted){bootFresh=true;bootTop()}});
  if(ls.get("sidnote-join")&&!isTrial())show("lists"); // v37 : arrivé par un lien d'invitation à une liste partagée
  if(!data.prefs.onboarded)openOnb();
  // e-mail et fonctions réservées relus au lancement (un accès ouvert ou retiré s'applique sans se reconnecter)
  if(!isTrial())token().then(t=>api("/auth/v1/user",{token:t})).then(u=>{if(!u||!session)return;if(u.email)session.email=u.email;const f=userFeat(u)||[],ch=String(f)!==String(session.feat||[]);
    session.feat=f;ls.set(SESSION_KEY,session);renderAccount();if(ch){applySoon();applyTabs();renderAll()}}).catch(()=>{});
  setSync();pull();if(!isTrial()){renderNotif();refreshSub();docsSyncPending();notesPhotosPending()}
  window.addEventListener("online",()=>{setSync();push();pull();docsSyncPending()});
  window.addEventListener("offline",setSync);
  document.addEventListener("visibilitychange",()=>{if(!document.hidden)pull();else if(session&&session.eph&&cache&&cache.dirty){clearTimeout(pushTimer);push()}});
}
document.addEventListener("visibilitychange",()=>{if(!document.hidden){renderPlan();renderStats()}});

if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});
// une nouvelle version est en ligne (CACHE de sw.js) → l'app se recharge toute seule au retour, si rien n'est en cours
// (sinon un iPhone garde l'ancien programme en mémoire tant que l'app n'est pas fermée complètement)
const BUILD="sidnote-v54";
async function updCheck(){try{const t=await (await fetch("sw.js",{cache:"no-store"})).text(),m=/CACHE = "([^"]+)"/.exec(t);
  if(!m||m[1]===BUILD)return;const busy=document.querySelector(".sheet-bg:not([hidden])")||document.body.classList.contains("note-full")||(P&&P.run)||nuBusy||
    (document.activeElement&&/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName))||document.activeElement?.isContentEditable;
  if(busy||sessionStorage.getItem("sidnote-upd")===m[1])return; // une seule fois par version : jamais de boucle
  sessionStorage.setItem("sidnote-upd",m[1]);if(data&&cache&&cache.dirty)await push().catch(()=>{});location.reload()}catch(e){}}
if(!window.__noIntro)setTimeout(updCheck,3000);
document.addEventListener("visibilitychange",()=>{if(!document.hidden)updCheck()});
setInterval(()=>{if(!document.hidden&&!window.__noIntro)updCheck()},20*60e3); // v44.6 : un onglet resté ouvert (ordinateur) se met aussi à jour
