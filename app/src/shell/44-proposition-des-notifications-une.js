/* ---------- proposition des notifications (v27) : une fois par appareil ---------- */
function maybeAskNotif(){if(!session||isTrial()||data.ui.notifAsked||!$("onb").hidden)return;
  const can=pushOK();if(can&&(Notification.permission!=="default"))return;
  if(!can&&!(isIOS&&!standalone()))return; // navigateur sans notifications : rien à proposer
  $("naTitle").textContent=L("Ne rate plus rien");
  $("naText").textContent=L(can?"Active les notifications : Sid'Compagnon te prévient avant tes rendez-vous, tes cours et tes échéances. Tu choisis quand, dans Agenda ou Réglages."
    :"Pour recevoir des rappels avant tes rendez-vous et tes cours, installe d'abord Sid'Compagnon sur ton écran d'accueil, puis ouvre-le depuis son icône.");
  $("naYes").textContent=L(can?"Activer les notifications":"Voir comment l'installer");$("notifAsk").hidden=false}
const naDone=()=>{data.ui.notifAsked=Date.now();saveUI();$("notifAsk").hidden=true};
$("naYes").addEventListener("click",async e=>{if(pushOK()){await notifToggle(e.currentTarget);naDone()}else{naDone();show("app")}});
$("naNo").addEventListener("click",naDone);