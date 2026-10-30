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
