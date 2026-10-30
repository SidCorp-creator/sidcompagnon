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
