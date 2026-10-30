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
async function bioKey(first){if(CC())return CC().bioKey(first);const hk=await crypto.subtle.importKey("raw",first,"HKDF",false,["deriveKey"]);
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
  const opts=/** @type {(ev:boolean)=>any} */(ev=>({publicKey:{challenge:crypto.getRandomValues(new Uint8Array(32)),rp:{name:"Sid'note",id:location.hostname},
      user:{id:crypto.getRandomValues(new Uint8Array(16)),name:accEmail()||"Sid'note",displayName:"Sid'note"},pubKeyCredParams:[{type:"public-key",alg:-7},{type:"public-key",alg:-257}],
      authenticatorSelection:{authenticatorAttachment:"platform",residentKey:"preferred",userVerification:"required"},timeout:60000,attestation:"none",extensions:{prf:ev?{eval:{first:salt}}:{}}}}));
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
