/* ---------- documents (PDF) ---------- */
const PDFJS="lib/pdfjs/"; // v43 : pdf.js 3.11.174 hébergé sur le site (vérifié avec les empreintes officielles de cdnjs), plus d'appel à un tiers
const docsArr=()=>data.docs||(data.docs=[]);
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
// v22 : les documents sont chiffrés sur l'appareil avec la clé du code des documents avant l'envoi.
// En ligne, il n'y a que du contenu illisible (« SNE1 » + iv + chiffré) : ni l'administrateur ni Supabase ne peuvent les ouvrir.
const ENC_MAGIC=[83,78,69,49]; // "SNE1"
const isEnc=u=>u.length>16&&ENC_MAGIC.every((c,i)=>u[i]===c);
const blobIsEnc=async b=>b.size>16&&isEnc(new Uint8Array(await b.slice(0,17).arrayBuffer()));
// v60 (#3, coquille étape 2) : briques de chiffrement en TypeScript (app/src/core/crypto.ts, window.SCCore.crypto) ; mêmes formats,
// l'ancien code ci-dessous sert si core.js manque (test croisé : tests/crypto.test.js)
const CC=()=>window.SCCore&&window.SCCore.crypto&&!window.__noCore?window.SCCore.crypto:null;
async function docDecrypt(u,key){if(!key)throw new Error(L("Déverrouille tes documents pour ouvrir ce fichier."));
  try{return new Blob([CC()?await CC().docDecryptBytes(u,key):await crypto.subtle.decrypt({name:"AES-GCM",iv:u.slice(4,16)},key,u.slice(16))],{type:"application/pdf"})}
  catch(e){throw new Error(L("Ce document a été protégé avec un ancien code : ouvre-le sur l'appareil où tu l'as ajouté."))}}
// contenu lisible d'un document (copie de l'appareil, sinon version en ligne) ; key : autre clé que celle du coffre ouvert (passage au coffre renforcé)
async function docBlob(d,key){
  let b=await idb.get(docKey(d));
  if(b){if(!(await blobIsEnc(b)))return b;try{return await docDecrypt(new Uint8Array(await b.arrayBuffer()),key)}catch(e){if(!d.up)throw e}}
  if(!d.up)throw new Error("Ce document n'a pas encore été envoyé en ligne : ouvre-le sur l'appareil où tu l'as ajouté.");
  const r=await stor("GET","authenticated/documents/"+(d.path||docPath(d))),u=new Uint8Array(await r.arrayBuffer());
  return isEnc(u)?await docDecrypt(u,key):new Blob([u],{type:"application/pdf"});
}
// v74.5 : partage d'un PDF commun aux Documents et au lecteur PDF de Sid'note : partage natif du fichier, sinon téléchargement
const pdfName=t=>(String(t||"").replace(/\.pdf$/i,"").replace(/[\\/:*?"<>|]+/g," ").trim()||"document")+".pdf";
async function fileShare(b,title){const name=pdfName(title),f=new File([b],name,{type:"application/pdf"});
  try{if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:String(title||name)});return}}catch(e){if(e&&e.name==="AbortError")return}
  const a=document.createElement("a");a.href=URL.createObjectURL(f);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),5000)}
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
const fmtDay=s=>{const d=new Date(s);return `${d.getDate()} ${MO[d.getMonth()]} ${d.getFullYear()}`};
const SEC_K=["notes"],secAway={};
// v41 : par défaut (-1), le coffre reste ouvert jusqu'à la fermeture complète de l'app (demande de Sid)
const lockDelay=()=>{const v=data.ui&&data.ui.lockDelay;return v===undefined||v===null||+v<0?Infinity:Math.max(0,+v)*60000};
const secLockOne=()=>{if(nsKey)nsLock()};
function secLeave(k){const d=lockDelay();if(d===Infinity)return;if(!d){secLockOne();return}if(!secAway[k])secAway[k]=Date.now()}
function secCheck(){const d=lockDelay(),now=Date.now();for(const k of SEC_K){const t=secAway[k];if(t&&now-t>=d){delete secAway[k];secLockOne()}}}
document.addEventListener("visibilitychange",()=>{if(document.hidden)SEC_K.forEach(secLeave);else{secCheck();delete secAway[data.ui.view]}});
setInterval(secCheck,15000);
/* lecteur de PDF */
let pdfjsP=null;
function loadPdfJs(){
  if(window.pdfjsLib)return Promise.resolve(window.pdfjsLib);
  return pdfjsP||(pdfjsP=new Promise((res,rej)=>{const sc=document.createElement("script");sc.src=PDFJS+"pdf.min.js";
    sc.onload=()=>{window.pdfjsLib.GlobalWorkerOptions.workerSrc=PDFJS+"pdf.worker.min.js";res(window.pdfjsLib)};
    sc.onerror=()=>{pdfjsP=null;sc.remove();rej(new Error("pdfjs"))};document.head.appendChild(sc)}));
}
