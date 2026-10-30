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