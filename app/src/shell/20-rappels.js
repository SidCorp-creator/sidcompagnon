/* ---------- rappels (notifications) ---------- */
const VAPID_PUBLIC="BIWx3Uk7vX6yeb6rht0Rpz4eW25rwCzuQWIfNWxdxUePx7XkmISBvtbY47jthl51PVJaY9QkrG5LRl8Whx1TjK4";
const pushOK=()=>"serviceWorker" in navigator&&"PushManager" in window&&"Notification" in window;
const isIOS=/iphone|ipad|ipod/i.test(navigator.userAgent);
const standalone=()=>window.matchMedia("(display-mode: standalone)").matches||navigator.standalone===true;
function b64u(s){const p="=".repeat((4-s.length%4)%4),b=atob((s+p).replace(/-/g,"+").replace(/_/g,"/"));return Uint8Array.from(b,c=>c.charCodeAt(0))}
async function currentSub(){if(!pushOK())return null;const r=await navigator.serviceWorker.ready;return r.pushManager.getSubscription()}
// le bloc « notifications » existe à deux endroits (Réglages et Planning) : même contenu, mêmes réglages
let nfState=/** @type {{kind:string,msg?:string}} */({kind:"off",msg:""}),nfCustom=false;
async function renderNotif(){
  if(!pushOK())nfState={kind:"na",msg:isIOS&&!standalone()?"Pour activer les notifications, ouvre Sid'compagnon depuis l'icône de ton écran d'accueil.":"Ce navigateur ne gère pas les notifications."};
  else if(Notification.permission==="denied")nfState={kind:"na",msg:"Notifications bloquées. Autorise-les dans les réglages de ton smartphone (Notifications > Sid'compagnon)."};
  else{const sub=await currentSub().catch(()=>null);nfState=sub&&Notification.permission==="granted"?{kind:"on"}:{kind:"off"}}
  renderLeads();
}
function renderLeads(){
  const cur=notifLeads(),on=nfState.kind==="on",ical=notifIcal(),all=[...new Set([...LEADS.map(x=>x[0]),...cur])].sort((a,b)=>a-b);
  if(shIsl("notifBox")){try{const p={kind:nfState.kind,msg:nfState.msg||"",leads:all.map(m=>({m,lbl:leadLbl(m),on:cur.includes(m)})),custom:nfCustom,cals:!!CALS().length,ical:!!ical,i18n:agI18n()}; // v68 (#3)
    document.querySelectorAll(".notif-box").forEach(b=>{window.SCIslands.notifBox(b,p);const c=b.querySelector('[data-nf="ical"]');if(c&&c.checked!==!!ical)c.checked=!!ical});
    renderRem("f");if(!$("sheet").hidden&&editing&&editing.kind==="task")renderRem("e");return}
    catch(e){reportErr("island notifBox: "+(e&&e.message));document.querySelectorAll(".notif-box").forEach(b=>{try{window.SCIslands.unmount(b)}catch(_){}})}}
  const html=`<div class="card">
      <div class="row"><div class="grow">${L("Sois prévenu avant chaque activité du planning.")}<div class="small muted">${nfState.kind==="na"?L(nfState.msg):on?`<span class="syncdot"></span>${L("Activés sur cet appareil")}`:L("Désactivés sur cet appareil.")}</div></div></div>
      ${nfState.kind==="na"?"":`<div class="row" style="gap:8px"><button type="button" class="btn ${on?"ghost":""}" data-nf="toggle" style="flex:1">${L(on?"Désactiver":"Activer les notifications")}</button>${on?`<button type="button" class="btn ghost" data-nf="test">${L("Tester")}</button>`:""}</div>`}
    </div>
    <div class="label" style="margin:12px 4px 6px">${L("Me prévenir")}</div>
    <div class="chips" style="flex-wrap:wrap;margin:0;padding-inline:0">${all.map(m=>m===1440?`<span class="pill lock" aria-pressed="true" title="${L("Toujours active")}">${leadLbl(m)} · ${L("toujours")}</span>`:`<button type="button" class="pill" data-lead="${m}" aria-pressed="${cur.includes(m)}">${leadLbl(m)}</button>`).join("")}<button type="button" class="pill add" data-nf="custom">+ ${L("Autre délai")}</button></div>
    ${nfCustom?`<form class="notif-lead-custom" data-nf="customf"><input type="text" inputmode="numeric" maxlength="3" name="n" placeholder="15" aria-label="${L("Durée")}" autocomplete="off"><select class="sel" name="u" aria-label="${L("Unité")}"><option value="1">${L("minutes")}</option><option value="60" selected>${L("heures")}</option><option value="1440">${L("jours")}</option></select><span class="small muted">${L("avant")}</span><button class="btn" type="submit" style="padding:8px 14px">OK</button></form>`:""}
    ${CALS().length?`<label class="nf-ical"><input type="checkbox" data-nf="ical" ${ical?"checked":""}> <span>${L("Cours du calendrier relié : mêmes rappels que tes activités")}</span></label>`:""}
    <p class="small muted" style="margin:8px 4px 0">${L("Tu peux en choisir plusieurs. Une activité sans heure compte pour 8 h. Sur smartphone, ouvre Sid'compagnon depuis l'écran d'accueil (iOS 16.4 ou plus).")}</p>`;
  const ae=document.activeElement,typing=ae&&ae.matches&&ae.matches("input[type=text],select");
  document.querySelectorAll(".notif-box").forEach(b=>{if(!(typing&&b.contains(ae)))b.innerHTML=html});
  renderRem("f");if(!$("sheet").hidden&&editing&&editing.kind==="task")renderRem("e");
  const s=$("planNotifSum");if(s)s.textContent=on?`${L("Rappels")} · ${cur.map(leadLbl).join(", ")}${ical?` · ${L("cours")}`:""}`:L("Rappels : activer les notifications");
}
async function saveSub(sub){
  await api("/rest/v1/push_subscriptions?on_conflict=endpoint",{method:"POST",token:await token(),
    headers:{Prefer:"resolution=merge-duplicates,return=minimal"},body:{endpoint:sub.endpoint,user_id:session.user.id,subscription:sub.toJSON()}});
}
async function dropSub(){
  const sub=await currentSub().catch(()=>null);if(!sub)return;
  try{await api(`/rest/v1/push_subscriptions?endpoint=eq.${encodeURIComponent(sub.endpoint)}`,{method:"DELETE",token:await token()})}catch(e){}
  try{await sub.unsubscribe()}catch(e){}
}
async function notifToggle(btn){
  btn.disabled=true;
  try{
    const sub=await currentSub();
    if(sub&&Notification.permission==="granted"){await dropSub();toast("Notifications désactivées")}
    else{
      const perm=await Notification.requestPermission();
      if(perm!=="granted"){toast("Notifications refusées");renderNotif();return}
      const r=await navigator.serviceWorker.ready;
      const s=sub||await r.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64u(VAPID_PUBLIC)});
      await saveSub(s);toast("Notifications activées");
    }
  }catch(ex){toast(ex instanceof TypeError?"Pas de connexion internet":"Activation impossible : "+(ex.message||"erreur"))}
  renderNotif();
}
// délais choisis (minutes avant l'activité), synchronisés avec le compte : le serveur les lit
const LEADS=[[10,"10 min"],[30,"30 min"],[60,"1 h"],[120,"2 h"],[1440,"La veille"],[2880,"2 jours"]];
// v39 : la veille est toujours active (le serveur l'envoie de toute façon), en plus des délais choisis
const notifLeads=()=>{const n=data.prefs.notif,a=n&&Array.isArray(n.leads)?n.leads:[];return [...new Set([...a,1440])].sort((x,y)=>x-y)};
// cours de l'horaire iCal : prévenus 24 h avant (activé par défaut) ; le serveur lit data.icalSoon
const notifIcal=()=>!(data.prefs.notif&&data.prefs.notif.ical===false);
function leadLbl(m){const p=LEADS.find(x=>x[0]===m);if(p)return L(p[1]);
  if(m%1440===0)return `${m/1440} ${L(m/1440>1?"jours":"jour")}`;if(m%60===0)return `${m/60} h`;if(m>60)return `${Math.floor(m/60)} h ${two(m%60)}`;return `${m} min`}
const setNotif=o=>{data.prefs.notif={...(data.prefs.notif||{}),...o};save();renderLeads()};
document.addEventListener("click",async e=>{const box=e.target.closest(".notif-box");if(!box)return;
  const l=e.target.closest("[data-lead]");
  if(l){const m=+l.dataset.lead;let cur=notifLeads().slice();cur=cur.includes(m)?cur.filter(x=>x!==m):[...cur,m].sort((a,b)=>a-b);
    if(m===1440)return;setNotif({leads:cur});return}
  const b=e.target.closest("button[data-nf]");if(!b)return;
  if(b.dataset.nf==="toggle")notifToggle(b);
  else if(b.dataset.nf==="custom"){nfCustom=!nfCustom;renderLeads();const i=box.querySelector('[data-nf="customf"] input');if(i)i.focus()}
  else if(b.dataset.nf==="test"){try{await api("/functions/v1/rappels",{method:"POST",token:await token(),body:{test:true,lang:LANG}});toast("Notification de test envoyée")}
    catch(ex){toast("Test impossible : "+(ex.message||"erreur"))}}
});
document.addEventListener("change",e=>{const c=e.target.closest('.notif-box [data-nf="ical"]');if(!c)return;setNotif({ical:c.checked});icalSoonSync();
  toast(c.checked?"Cours : rappels activés":"Cours : plus de rappel")});
document.addEventListener("submit",e=>{const f=e.target.closest('.notif-box [data-nf="customf"]');if(!f)return;e.preventDefault();
  const n=Math.round(numIn(f.elements.n.value)),m=n*(+f.elements.u.value);if(!(m>=5&&m<=20160)){toast("Choisis entre 5 minutes et 14 jours");return}
  document.activeElement&&document.activeElement.blur();nfCustom=false;const cur=notifLeads();setNotif({leads:[...new Set([...cur,m])].sort((a,b)=>a-b)});toast(`${L("Rappel ajouté")} : ${leadLbl(m)}`)});
// --- rappel propre à une activité (formulaire du planning et fiche « Modifier ») : t.leads = délais choisis, t.remind = false = aucun rappel
const remSel={f:null,e:null},remCustom={f:false,e:false};
const remOf=t=>[...new Set([...(t&&t.remind!==false&&Array.isArray(t.leads)&&t.leads.length?t.leads:t&&t.remind===false?[]:notifLeads()),1440])].sort((a,b)=>a-b);
function renderRem(k){const box=$(k==="f"?"fRem":"eRem");if(!box)return;if(!remSel[k])remSel[k]=notifLeads().slice();
  const sel=remSel[k],on=nfState.kind==="on",all=[...new Set([...LEADS.map(x=>x[0]),...sel])].sort((a,b)=>a-b);
  if(shIsl("remBox")){try{window.SCIslands.remBox(box,{kind:nfState.kind,msg:nfState.msg||"",leads:all.map(m=>({m,lbl:leadLbl(m),on:sel.includes(m)})),custom:!!remCustom[k],bell:IC("bell"),i18n:agI18n()});return}
    catch(e){reportErr("island remBox: "+(e&&e.message));try{window.SCIslands.unmount(box)}catch(_){}}}
  box.innerHTML=`<div class="rem-h">${IC("bell")} ${L("Me prévenir")}</div>
    <div class="rem-chips">${all.map(m=>m===1440?`<span class="pill lock" aria-pressed="true">${leadLbl(m)} · ${L("toujours")}</span>`:`<button type="button" class="pill" data-rl="${m}" aria-pressed="${sel.includes(m)}">${leadLbl(m)}</button>`).join("")}<button type="button" class="pill add" data-rcustom="1">+ ${L("Autre")}</button></div>
    ${remCustom[k]?`<div class="notif-lead-custom"><input type="text" inputmode="numeric" maxlength="3" data-rn placeholder="15" aria-label="${L("Durée")}" autocomplete="off"><select class="sel" data-ru aria-label="${L("Unité")}"><option value="1">${L("minutes")}</option><option value="60" selected>${L("heures")}</option><option value="1440">${L("jours")}</option></select><span class="small muted">${L("avant")}</span><button type="button" class="btn" data-rok="1" style="padding:8px 14px">OK</button></div>`:""}
    ${on?`<div class="small muted">${L("Sans heure, l'activité compte pour 8 h.")}</div>`:nfState.kind==="na"?`<div class="small muted">${L(nfState.msg)}</div>`:`<button type="button" class="btn ghost rem-on" data-ron="1">${IC("bell")} ${L("Activer les notifications")}</button>`}`}
const remApply=(t,k)=>{const s=[...new Set([...(remSel[k]||notifLeads()),1440])],d=notifLeads();delete t.leads;delete t.remind;
  if(!s.length)t.remind=false;else if(s.length!==d.length||s.some(x=>!d.includes(x)))t.leads=s.slice().sort((a,b)=>a-b)};
["fRem","eRem"].forEach(id=>{const k=id[0];$(id).addEventListener("click",async e=>{const b=e.target.closest("button");if(!b)return;e.preventDefault();
  if(b.dataset.rnone)remSel[k]=[];
  else if(b.dataset.rl){const m=+b.dataset.rl,s=remSel[k];remSel[k]=s.includes(m)?s.filter(x=>x!==m):[...s,m].sort((a,c)=>a-c)}
  else if(b.dataset.rcustom)remCustom[k]=!remCustom[k];
  else if(b.dataset.rok){const box=$(id),n=Math.round(numIn(box.querySelector("[data-rn]").value)),m=n*(+box.querySelector("[data-ru]").value);
    if(!(m>=5&&m<=10080)){toast("Choisis entre 5 minutes et 7 jours");return}remSel[k]=[...new Set([...remSel[k],m])].sort((a,c)=>a-c);remCustom[k]=false}
  else if(b.dataset.ron){await notifToggle(b)}
  renderRem(k);if(remCustom[k]){const i=$(id).querySelector("[data-rn]");if(i)i.focus()}})});
// garder l'abonnement à jour côté serveur (il peut changer)
async function refreshSub(){try{const s=await currentSub();if(s&&Notification.permission==="granted")await saveSub(s)}catch(e){}}
