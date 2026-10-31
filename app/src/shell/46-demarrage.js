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
  renderAuthFeats();
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
const BUILD="sidnote-v74-2";
async function updCheck(){try{const t=await (await fetch("sw.js",{cache:"no-store"})).text(),m=/CACHE = "([^"]+)"/.exec(t);
  if(!m||m[1]===BUILD)return;const busy=document.querySelector(".sheet-bg:not([hidden])")||document.body.classList.contains("note-full")||(P&&P.run)||nuBusy||
    (document.activeElement&&/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName))||document.activeElement?.isContentEditable;
  if(busy||sessionStorage.getItem("sidnote-upd")===m[1])return; // une seule fois par version : jamais de boucle
  sessionStorage.setItem("sidnote-upd",m[1]);if(data&&cache&&cache.dirty)await push().catch(()=>{});location.reload()}catch(e){}}
if(!window.__noIntro)setTimeout(updCheck,3000);
document.addEventListener("visibilitychange",()=>{if(!document.hidden)updCheck()});
setInterval(()=>{if(!document.hidden&&!window.__noIntro)updCheck()},20*60e3); // v44.6 : un onglet resté ouvert (ordinateur) se met aussi à jour
