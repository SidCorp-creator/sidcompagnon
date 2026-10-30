/* ---------- compte dans Réglages ---------- */
document.addEventListener("click",e=>{if(e.target.closest("[data-trialacc]"))trialToAccount()});
$("logoutBtn").addEventListener("click",async e=>{
  const b=e.currentTarget;
  if(isTrial()){if(!b.dataset.armed){b.dataset.armed="1";b.textContent=L("Les données de l'essai seront effacées. Toucher encore pour confirmer");return}
    ls.del("sidnote-mk-"+TRIAL_ID);ls.del("sidnote-trial-carry");endSession("",false);return}
  if(!b.dataset.armed){b.dataset.armed="1";b.textContent="Toucher encore pour confirmer";setTimeout(()=>{delete b.dataset.armed;b.textContent="Se déconnecter"},3500);return}
  if(cache&&cache.dirty){await push();
    if(cache.dirty&&b.dataset.armed!=="2"){b.dataset.armed="2";b.textContent="Modifs non envoyées : déconnecter quand même ?";return}}
  await dropSub().catch(()=>{});
  try{api("/auth/v1/logout",{method:"POST",token:session.access_token}).catch(()=>{})}catch(x){}
  endSession("",false);
});
