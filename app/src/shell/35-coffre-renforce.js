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
const rawKey=raw=>CC()?CC().rawKey(raw):crypto.subtle.importKey("raw",b64d(raw),"AES-GCM",false,["encrypt","decrypt"]);
const mkLsKey=()=>"sidnote-mk-"+session.user.id;
const mkStore=()=>{const s=ls.get(mkLsKey());return s&&data.phx&&s.phx===data.phx.id?s:{}};
const mkHas=ctx=>!!mkStore()[ctx];
const ctxOf=v=>v&&data.noteVault&&v.id===data.noteVault.id?"notes":"main";
async function phDerive(ph,salt,iter){if(CC())return CC().phDerive(ph,salt,iter||PIN_ITER);
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
  if(!x.rec){
    if((isV2(data.vault)&&PW().length)||(isV2(data.docVault)&&docsArr().length)){
      phFail("La phrase secrète est nécessaire pour récupérer les données de l’ancien coffre.");
      return;
    }
    const b=$("phForgot");
    if(!b.dataset.armed){b.dataset.armed="1";phFail("La récupération par le mot de passe du compte n'était pas activée : sans ta phrase, tes coffres ne peuvent pas être rouverts.");
      b.textContent=L("Tout effacer et recommencer ? Touche encore pour confirmer");return}
    phEnd(null);vaultsReset();return}
  let ph=null;await askAccountPw("Phrase oubliée","Entre le mot de passe de ton compte Sid'Compagnon pour retrouver ta phrase secrète.",
    async pw=>{try{ph=(await decJ(await pinKey(pw,x.rec.salt,PIN_ITER),x.rec)).ph;return ph?null:"Mot de passe incorrect."}catch(e){return "Mot de passe incorrect."}});
  if(!ph)return;
  try{const mk=await phCheck(ph);phMem=mk;toast(`${L("Ta phrase secrète est")} « ${ph} »`,8000);phEnd({mk,ph})}catch(e){phFail("Phrase incorrecte.")}});
// récupération de la phrase grâce au mot de passe du compte (proposée quand la phrase est choisie)
async function phRecOffer(ph){if(!data.phx||data.phx.rec||isTrial())return;
  const pw=await askAccountPw("Ne perds jamais ta phrase","Entre le mot de passe de ton compte Sid'Compagnon : si tu oublies ta phrase secrète un jour, ce mot de passe suffira pour la retrouver.",
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
  const pw=await askAccountPw(o.title||"Protège ton coffre",o.ptext||"Entre le mot de passe de ton compte Sid'Compagnon : il protège tes coffres. Sur un nouvel appareil, il suffira pour les rouvrir.",pwCheckSrv,o.later||"Annuler");
  if(!pw||phOn())return null;
  const raw=rnd(32),mk={raw,key:await rawKey(raw)},now=Date.now();
  data.phx={id:uid(),chk:await encJ(mk.key,{ok:"sidnote-phrase"}),pw:await pwWrap(mk,pw),createdAt:new Date(now).toISOString(),at:now};save();phMem=mk;return mk}
// clé maître retrouvée avec le mot de passe du compte (repli : l'ancienne phrase, si elle existe)
async function mkFromPw(o){o=o||{};let mk=null;
  const pw=await askAccountPw(o.title||"Mot de passe du compte",o.ptext||"Entre le mot de passe de ton compte Sid'Compagnon pour ouvrir tes coffres sur cet appareil.",
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
  NT().filter(n=>n.secret).forEach(n=>tomb(n.id));data.notes=NT().filter(n=>!n.secret);data.noteVault=null;
  if(isV2(data.docVault))data.docVault=null;if(isV2(data.vault))data.vault=null;data.phx=null;phMem=null;ls.del(mkLsKey());ls.del(bioLsKey());
  nsKey=null;nsVid=null;nsPlain=new Map();
  save();renderAllSafe();toast("Coffres remis à zéro : choisis un nouveau code et une nouvelle phrase")}
// ancien coffre (code seul) → coffre v2, au déverrouillage. Renvoie la nouvelle clé, ou null (plus tard / impossible).
const upAsked=new Set();
async function v2Upgrade(code,oldKey){
  const old=data.noteVault;
  if(!old||isV2(old)||upAsked.has(old.id))return null;upAsked.add(old.id);
  const r=phMem?{mk:phMem}:{mk:await mkNeed({mode:"new",title:"Renforce ta protection",later:"Plus tard",
    ptext:"Ton code à 5 chiffres seul est trop facile à deviner pour quelqu'un qui volerait les données du serveur. Entre le mot de passe de ton compte : il protégera vraiment tes coffres. Ton code reste le même sur cet appareil.",
    text:phOn()?"Ton coffre passe à la protection renforcée : entre ta phrase secrète. Ton code reste le même.":"Ton code à 5 chiffres seul est trop facile à deviner pour quelqu'un qui volerait les données du serveur. Choisis une phrase secrète d'au moins 10 caractères : elle protégera vraiment tes coffres. Ton code reste le même pour ouvrir l'app sur cet appareil."})};
  if(!r.mk)return null;const mk=r.mk;
  const ctx="notes",n=await v2Make(mk,"sidnote-notes"),nk=n.key,now=Date.now();
  for(const e of NT()){if(!e.secret||e.vid!==old.id)continue;try{const p=await decJ(oldKey,e),x=await encJ(nk,p);Object.assign(e,{iv:x.iv,ct:x.ct,vid:n.v.id,upd:now})}catch(x){}}
  data.noteVault=n.v;if(nsKey){nsKey=nk;nsVid=n.v.id}
  if(!mkHas(ctx))await mkWrap(ctx,code,mk);
  else{try{await mkUnwrap(ctx,code)}catch(e){await mkWrap(ctx,code,mk)}} // le dernier code tapé ouvre ce coffre sur cet appareil
  save();toast("Protection renforcée");if(r.created)await phRecOffer(r.ph);return nk}
async function copyTxt(t){try{await navigator.clipboard.writeText(t);return true}catch(e){
  const a=document.createElement("textarea");a.value=t;a.setAttribute("readonly","");a.style.position="fixed";a.style.opacity="0";document.body.appendChild(a);a.select();
  let ok=false;try{ok=document.execCommand("copy")}catch(x){}a.remove();return ok}}
