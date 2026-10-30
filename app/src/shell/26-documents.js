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
// v60 (#3, coquille étape 2) : briques de chiffrement en TypeScript (app/src/core/crypto.ts, window.SCCore.crypto) ; mêmes formats,
// l'ancien code ci-dessous sert si core.js manque (test croisé : tests/crypto.test.js)
const CC=()=>window.SCCore&&window.SCCore.crypto&&!window.__noCore?window.SCCore.crypto:null;
async function docEncrypt(blob,key){if(CC())return new Blob([await CC().docEncryptBytes(await blob.arrayBuffer(),key||dvKey)],{type:"application/pdf"});
  const iv=crypto.getRandomValues(new Uint8Array(12));
  const ct=await crypto.subtle.encrypt({name:"AES-GCM",iv},key||dvKey,await blob.arrayBuffer());
  return new Blob([new Uint8Array(ENC_MAGIC),iv,new Uint8Array(ct)],{type:"application/pdf"})}
async function docDecrypt(u,key){key=key||dvKey;if(!key)throw new Error(L("Déverrouille tes documents pour ouvrir ce fichier."));
  try{return new Blob([CC()?await CC().docDecryptBytes(u,key):await crypto.subtle.decrypt({name:"AES-GCM",iv:u.slice(4,16)},key,u.slice(16))],{type:"application/pdf"})}
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
const docHidden=(_d)=>false; // v22 : tout l'onglet est protégé par le code, plus de classeur verrouillé à part
function renderDocs(){
  if(!$("docList"))return;
  if(dvOpen&&(!data.docVault||data.docVault.id!==dvVid))dvLock(); // coffre remplacé ailleurs : on reverrouille
  renderDocLock();
  const all=docsArr(),q=docQ.trim(),cf=curFolder(),fq=dfQ.trim();
  const alpha=data.prefs.docSort==="alpha";
  // classeurs
  const cnt=id=>all.filter(d=>d.folder===id).length;
  const isl=window.SCIslands&&window.SCIslands.docs&&!window.__noIslands;
  if(!isl)$("docFolders").innerHTML=`<button class="pill" data-dfold="all" aria-pressed="${!cf}">${L("Tous")}</button>`+
    DF().map(f=>`<button class="pill" data-dfold="${f.id}" aria-pressed="${!!(cf&&cf.id===f.id)}">${IC("folder")} ${esc(f.name)} <span class="cnt">${cnt(f.id)||""}</span></button>`).join("")+
    `<button class="pill add" data-dfoldnew="1">+ ${L("Classeur")}</button>`;
  $("folderBar").hidden=!cf;
  if(cf&&shIsl("folderBar")){try{window.SCIslands.folderBar($("folderBar"),{name:cf.name,count:cnt(cf.id),editing:!!dfEditing,q:dfQ,icon:IC("folder"),i18n:agI18n()})}catch(e){reportErr("island folderBar: "+(e&&e.message))}}
  else if(cf)$("folderBar").innerHTML=dfEditing?`<form id="folderRename" style="display:flex;gap:8px;width:100%"><input id="folderRenIn" value="${esc(cf.name)}" aria-label="${L("Nouveau nom")}" autocomplete="off"><button class="btn" type="submit">OK</button></form>`
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
  // v57 (#3) : classeurs et liste dessinés par React (app/src/Vault.tsx) ; affichage seulement, le chiffrement ne change pas
  if(isl){try{window.SCIslands.docs({folders:$("docFolders"),list:$("docList")},{folders:DF().map(f=>({id:f.id,name:f.name,count:cnt(f.id)})),cur:cf?cf.id:"",icon:IC("folder"),grip:!!DF().length,i18n:agI18n(),
      empty:sq?"Aucun document ne correspond.":scope==="folder"?"Ce classeur est vide. Importe ou scanne un document : il sera rangé ici.":"Aucun document pour l'instant. Importe un PDF ou scanne une feuille.",
      docs:list.map(d=>{const f=folderOf(d);return{id:d.id,title:d.title,folder:f&&scope==="all"?f.name:"",meta:`${d.pages?`${d.pages} ${L(d.pages>1?"pages":"page")} · `:""}${fmtSize(d.size||0)} · ${fmtDay(d.createdAt)}`,
        status:docBusy.has(d.id)?L("Envoi…"):d.up?"":L("Sur cet appareil seulement")}})})}
    catch(e){reportErr("island docs: "+(e&&e.message));window.__noIslands=true;try{renderDocs()}finally{window.__noIslands=false}return}}
  else $("docList").innerHTML=list.length?list.map(d=>{
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
  if(shIsl("scanPages")){try{window.SCIslands.scanPages($("scanPages"),{pages:scanPages.map(p=>p.out.url),i18n:agI18n()})}catch(e){reportErr("island scanPages: "+(e&&e.message))}}else
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
