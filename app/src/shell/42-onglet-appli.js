/* ---------- onglet Appli ---------- */
function renderApp(){
  const ok=window.matchMedia("(display-mode: standalone)").matches||navigator.standalone===true;
  if(shIsl("appStatus")){try{window.SCIslands.appStatus($("appStatus"),{ok,i18n:agI18n()})}catch(e){reportErr("island appStatus: "+(e&&e.message))}}else
  $("appStatus").innerHTML=ok?'<span class="syncdot"></span><span>Tu utilises déjà Sid\'note comme application.</span>'
    :'<span class="syncdot wait"></span><span>Tu es dans le navigateur. Suis les étapes ci-dessous pour installer l\'app.</span>';
  const ai=$("authInstall");if(ai)ai.hidden=ok;
}
renderApp();
