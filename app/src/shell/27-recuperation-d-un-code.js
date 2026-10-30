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
