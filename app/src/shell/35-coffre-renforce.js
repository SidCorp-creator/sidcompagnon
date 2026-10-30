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
function pwdLock(){if(!vaultKey&&!pinBuf)return;vaultKey=null;vaultItems=new Map();pwShown.clear();
  {const pl=$("pwList");if(window.SCIslands&&Object.keys(pl).some(k=>k.startsWith("__reactContainer")))window.SCIslands.pwList(pl,{items:[],empty:"",i18n:agI18n()});else pl.innerHTML=""} /* v57 : plus rien de déchiffré à l'écran une fois verrouillé */pinBuf="";pinStep="";closePwSheet();if(data.ui.view==="pwd")renderPwd()}
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
  if(!$("pinPad").children.length&&shIsl("keypad")){try{window.SCIslands.keypad($("pinPad"),{attr:"pin",del:agI18n().tr("Effacer")})}catch(e){reportErr("island keypad: "+(e&&e.message))}}
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
  // v57 (#3) : liste dessinée par React ; le mot de passe et la note ne sont transmis que pour les entrées affichées
  if(window.SCIslands&&window.SCIslands.pwList&&!window.__noIslands){try{window.SCIslands.pwList($("pwList"),{empty:q?"Aucun site ne correspond.":"Aucun mot de passe pour l'instant. Touche « + Ajouter ».",i18n:agI18n(),
      items:list.map(x=>{const show=pwShown.has(x.id);return show?{id:x.id,site:String(x.site),user:x.user||"",show,pw:x.pw||"",note:x.note||""}:{id:x.id,site:String(x.site),user:x.user||"",show}})});return}
    catch(e){reportErr("island pwList: "+(e&&e.message))}}
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
