/* ---------- calendriers reliés (iCal) ---------- */
// v45 : plusieurs calendriers superposés dans la même vue. data.prefs.icals = [{id, name, url, c (couleur), on (affiché)}] ;
// data.prefs.ical garde le lien du 1er (anciennes versions). Calendrier privé : identifiant + mot de passe gardés sur l'appareil
// seulement (localStorage « sidnote-icalauth-<uid> », jamais envoyés au compte), passés au relais « horaire » le temps de la lecture.
const ICAL_CAT="Calendrier relié"; // nom par défaut d'un calendrier (v28 : neutre, marche avec tout lien iCal)
const CAL_COLORS=["--x4","--x1","--x2","--x3","--x5","--x6","--c-cours","--c-event"];
let icalEvents=[],icalAt=0,icalBusy=false,icalAll={},icalErr={};
const icalKey=()=>"sidnote-ical-"+(session?session.user.id:"x");
const icalAuthKey=()=>"sidnote-icalauth-"+(session?session.user.id:"x");
const icalAuth=id=>(ls.get(icalAuthKey())||{})[id]||null;
function icalAuthSet(id,v){const a=ls.get(icalAuthKey())||{};if(v)a[id]=v;else delete a[id];ls.set(icalAuthKey(),a)}
function CALS(){const p=data.prefs||(data.prefs={});
  if(!Array.isArray(p.icals))p.icals=p.ical?[{id:"cal1",name:ICAL_CAT,url:p.ical,c:"--x4",on:true}]:[];
  return p.icals}
const calOf=id=>CALS().find(c=>c.id===id);
function calsSave(){const l=CALS();data.prefs.ical=l.length?l[0].url:null;save()}
const allT=()=>data.tasks.concat(icalEvents);
const colorOf=t=>t&&t.src==="ical"?((calOf(t.cal)||{}).c||"--x4"):tc(t&&t.cat);
// événements affichés = ceux des calendriers allumés, chacun avec le nom de son calendrier comme catégorie
function icalMix(){icalEvents=[];let at=0;
  for(const c of CALS()){const x=icalAll[c.id];if(!x||x.url!==c.url)continue;at=Math.max(at,x.at||0);
    if(c.on===false)continue;x.events.forEach(e=>{e.cal=c.id;e.cat=c.name||ICAL_CAT});icalEvents=icalEvents.concat(x.events)}
  icalAt=at}
function icalLoadCache(){const c=ls.get(icalKey());icalAll={};
  if(c&&c.cals)icalAll=c.cals;
  else if(c&&Array.isArray(c.events)){const f=CALS()[0];if(f&&c.url===f.url)icalAll[f.id]={url:c.url,at:c.at||0,events:c.events}} // cache d'avant la v45
  icalMix()}
function icalCacheSave(){const keep={};CALS().forEach(c=>{if(icalAll[c.id])keep[c.id]=icalAll[c.id]});icalAll=keep;ls.set(icalKey(),{v:2,cals:keep})}
// lecture d'un fichier iCal (.ics)
function parseICS(text,now=new Date()){
  const lines=String(text).replace(/\r?\n[ \t]/g,"").split(/\r?\n/);
  const out=[];let ev=/** @type {any} */(null);
  const unesc=v=>v.replace(/\\n/gi,"\n").replace(/\\,/g,",").replace(/\;/g,";").replace(/\\\\/g,"\\");
  const toLocal=(v,params)=>{
    const m=v.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?$/);if(!m)return null;
    if(!m[4])return{date:`${m[1]}-${m[2]}-${m[3]}`,allday:true};
    let d;if(m[7])d=new Date(Date.UTC(+m[1],+m[2]-1,+m[3],+m[4],+m[5],+(m[6]||0)));
    else d=new Date(+m[1],+m[2]-1,+m[3],+m[4],+m[5],+(m[6]||0)); // heure locale (Europe/Bruxelles)
    return{date:iso(d),time:`${two(d.getHours())}:${two(d.getMinutes())}`,allday:false};
  };
  const from=new Date(now);from.setDate(from.getDate()-31);const to=new Date(now);to.setDate(to.getDate()+200);
  for(const line of lines){
    if(line==="BEGIN:VEVENT"){ev={};continue}
    if(line==="END:VEVENT"){
      if(ev&&ev.DTSTART){
        const s=toLocal(ev.DTSTART.v,ev.DTSTART.p),e=ev.DTEND?toLocal(ev.DTEND.v,ev.DTEND.p):null;
        if(s){
          const title=unesc((ev.SUMMARY&&ev.SUMMARY.v)||"Cours").trim();
          const canc=/CANCELLED/i.test((ev.STATUS&&ev.STATUS.v)||"")||/annul/i.test(title);
          const t={id:"ical:"+((ev.UID&&ev.UID.v)||title)+":"+ev.DTSTART.v,src:"ical",title:title.replace(/^\s*annul[ée]e?s?\s*[:\-–]\s*/i,""),date:s.date,cat:ICAL_CAT,status:"à faire",canc};
          if(!s.allday){t.time=s.time;if(e&&!e.allday&&e.date===s.date&&e.time>s.time)t.timeEnd=e.time}
          else if(e&&e.allday){const d=parse(e.date);d.setDate(d.getDate()-1);const last=iso(d);if(last>s.date)t.end=last}
          if(ev.LOCATION)t.loc=unesc(ev.LOCATION.v).trim();
          if(ev.DESCRIPTION)t.note=unesc(ev.DESCRIPTION.v).trim().slice(0,400);
          const dd=parse(t.date);if(dd>=from&&dd<=to)out.push(t);
        }
      }
      ev=null;continue}
    if(!ev)continue;
    const i=line.indexOf(":");if(i<0)continue;
    const head=line.slice(0,i),v=line.slice(i+1),[name,...params]=head.split(";");
    ev[name.toUpperCase()]={v,p:params};
  }
  const seen=new Set();return out.filter(t=>!seen.has(t.id)&&seen.add(t.id));
}
async function icalFetchOne(c){
  const au=icalAuth(c.id),body={url:c.url};if(au){body.user=au.user||"";body.pass=au.pass||""}
  const r=await fetch(SUPABASE_URL+"/functions/v1/horaire",{method:"POST",headers:{apikey:SUPABASE_KEY,"Content-Type":"application/json",Authorization:"Bearer "+await token()},body:JSON.stringify(body)});
  const txt=await r.text();
  if(!r.ok){let m="";try{m=JSON.parse(txt).error||""}catch(e){}
    throw new Error(r.status===404?"La fonction « horaire » n'est pas encore installée sur Supabase.":m||("Erreur "+r.status))}
  icalAll[c.id]={url:c.url,at:Date.now(),events:parseICS(txt)}}
// v46 (#8) : mise à jour automatique toutes les 6 heures au plus (avant : 15 min) ; « ↻ Actualiser » relit tout de suite
const ICAL_EVERY=6*3600e3;
// force : tout relire ; only : un seul calendrier (ajout, identifiant changé)
async function icalFetch(force,only){
  const list=CALS().filter(c=>c.on!==false&&(!only||c.id===only));
  if(!list.length||!session||icalBusy)return;
  if(!force&&Date.now()-icalAt<ICAL_EVERY)return;
  icalBusy=true;icalState("Mise à jour du calendrier…");let off=false;
  for(const c of list){try{await icalFetchOne(c);delete icalErr[c.id]}catch(ex){if(ex instanceof TypeError)off=true;icalErr[c.id]=ex instanceof TypeError?L("Pas de connexion"):ex.message}}
  icalBusy=false;icalCacheSave();icalMix();icalSoonSync();renderAllSafe();renderCals();
  const bad=list.filter(c=>icalErr[c.id]);
  if(off)icalState("Pas de connexion : le calendrier sera mis à jour plus tard.");else icalState();
  if(force){const n=icalEvents.filter(t=>!t.canc).length;
    if(bad.length===list.length)toast("Mise à jour impossible");else toast(`Calendrier à jour : ${n} ${n>1?"événements":"événement"}`)}
}
// les cours des 14 prochains jours sont copiés dans le compte (data.icalSoon) : le serveur des rappels
// ne peut pas lire l'horaire lui-même, il prévient 24 h avant chaque cours à partir de cette liste
function icalSoonSync(){if(!session)return;
  const t0=iso(today()),e=new Date(today());e.setDate(e.getDate()+14);const t1=iso(e);
  const list=notifIcal()&&CALS().length?icalEvents.filter(t=>!t.canc&&t.date>=t0&&t.date<=t1).map(t=>({id:t.id,title:t.title,date:t.date,time:t.time||"",loc:t.loc||""})).slice(0,200):[];
  if(JSON.stringify(list)===JSON.stringify(data.icalSoon||[]))return;data.icalSoon=list;save()}
function icalState(msg){
  const el=$("icalState");if(!el)return;const has=CALS().length;
  $("icalRefresh").hidden=!has;
  if(msg){el.textContent=L(msg);return}
  if(!has){el.textContent=L("Aucun calendrier relié.");return}
  const n=icalEvents.filter(t=>!t.canc).length,c=icalEvents.filter(t=>t.canc).length;
  el.textContent=icalAt?`${n} ${n>1?"événements":"événement"}${c?` · ${c} annulé${c>1?"s":""}`:""} · mis à jour à ${new Date(icalAt).toLocaleTimeString("fr-BE",{hour:"2-digit",minute:"2-digit"})}`:L("Pas encore mis à jour.");
}
function icalInfo(id){
  const t=icalEvents.find(x=>x.id===id);if(!t)return;
  toast(`${t.canc?L("Annulé")+" · ":""}${t.title}${t.time?" · "+hrs(t):""}${t.loc?" · "+t.loc:""}${t.cat?" · "+t.cat:""}`);
}
// liste des calendriers (Agenda → « Calendriers reliés ») + pastilles au-dessus du calendrier pour afficher / masquer chacun
function renderCals(){
  const box=$("calList");if(!box)return;const l=CALS();
  if(shIsl("calList")){try{const vm=l.map(c=>({id:c.id,name:c.name||ICAL_CAT,c:c.c||"--x4",on:c.on!==false,n:(icalAll[c.id]&&icalAll[c.id].url===c.url)?icalAll[c.id].events.filter(t=>!t.canc).length:null,err:icalErr[c.id]||"",priv:!!icalAuth(c.id)}));
    window.SCIslands.calList(box,{cals:vm,more:MORE,i18n:agI18n()});box.querySelectorAll("[data-calon]").forEach(i=>{const c=vm.find(x=>x.id===i.dataset.calon);if(c&&i.checked!==c.on)i.checked=c.on});
    const lg=$("calLegend");if(lg){lg.hidden=l.length<1;window.SCIslands.calLegend(lg,{cals:vm})}icalState();return}
    catch(e){reportErr("island calList: "+(e&&e.message));try{window.SCIslands.unmount(box);$("calLegend")&&window.SCIslands.unmount($("calLegend"))}catch(_){}}}
  box.innerHTML=l.map(c=>{const n=(icalAll[c.id]&&icalAll[c.id].url===c.url)?icalAll[c.id].events.filter(t=>!t.canc).length:null,err=icalErr[c.id];
    return `<div class="cal-row${c.on===false?" off":""}"><button type="button" class="cal-dot" data-calcolor="${c.id}" style="--c:var(${c.c||"--x4"})" aria-label="${L("Changer la couleur")}"></button>
      <div class="grow cal-main"><b class="notr">${esc(c.name||ICAL_CAT)}</b><span class="small ${err?"cal-err":"muted"}"><span>${err?esc(err):n===null?L("Pas encore mis à jour."):`${n} ${n>1?"événements":"événement"}`}</span>${icalAuth(c.id)?` · <span>${L("privé")}</span>`:""}</span></div>
      <input type="checkbox" class="switch" data-calon="${c.id}" ${c.on===false?"":"checked"} title="${L("Afficher")}" aria-label="${L("Afficher")} ${esc(c.name||ICAL_CAT)}">
      <button type="button" class="pen" data-calmore="${c.id}" aria-label="${L("Plus d'actions")}">${MORE}</button></div>`}).join("")||`<div class="small muted">${L("Aucun calendrier relié.")}</div>`;
  const lg=$("calLegend");if(lg){lg.hidden=l.length<1;
    lg.innerHTML=l.map(c=>`<button type="button" class="pill cal-pill" data-calon2="${c.id}" aria-pressed="${c.on!==false}"><span class="dot" style="background:var(${c.c||"--x4"})"></span><span class="notr">${esc(c.name||ICAL_CAT)}</span></button>`).join("")}
  icalState()}
function calToggle(id,on){const c=calOf(id);if(!c)return;c.on=on;c.upd=Date.now();calsSave();icalMix();
  if(on&&!(icalAll[id]&&icalAll[id].url===c.url))icalFetch(true,id);icalSoonSync();renderAllSafe();renderCals()}
function calActions(id){const c=calOf(id);if(!c)return;
  openActions(c.name||ICAL_CAT,[
    {l:"Renommer",fn:()=>{const v=prompt(L("Nom du calendrier"),c.name||"");if(v&&v.trim()){c.name=v.trim().slice(0,40);c.upd=Date.now();calsSave();icalMix();renderAllSafe();renderCals()}}},
    {l:"Changer la couleur",fn:()=>calColor(id)},
    {l:icalAuth(id)?"Modifier l'identifiant":"Ajouter un identifiant (calendrier privé)",fn:()=>calAuthAsk(id)},
    {l:"Actualiser",fn:()=>icalFetch(true,id)},
    {l:"Retirer ce calendrier",danger:true,fn:()=>{data.prefs.icals=CALS().filter(x=>x!==c);delete icalAll[id];delete icalErr[id];icalAuthSet(id,null);calsSave();icalCacheSave();icalMix();icalSoonSync();renderAllSafe();renderCals();toast("Calendrier retiré")}}])}
function calColor(id){const c=calOf(id);if(!c)return;const i=CAL_COLORS.indexOf(c.c);c.c=CAL_COLORS[(i+1)%CAL_COLORS.length];c.upd=Date.now();calsSave();renderAllSafe();renderCals()}
function calAuthAsk(id){const a=icalAuth(id)||{};
  const u=prompt(L("Identifiant du calendrier (laisse vide pour retirer)"),a.user||"");if(u===null)return;
  if(!u.trim()){icalAuthSet(id,null);renderCals();icalFetch(true,id);return}
  const pw=prompt(L("Mot de passe du calendrier (de préférence un mot de passe d'application)"),"");if(pw===null)return;
  icalAuthSet(id,{user:u.trim(),pass:pw});renderCals();icalFetch(true,id)}
$("calList").addEventListener("click",e=>{const m=e.target.closest("[data-calmore]");if(m){calActions(m.dataset.calmore);return}
  const d=e.target.closest("[data-calcolor]");if(d)calColor(d.dataset.calcolor)});
$("calList").addEventListener("change",e=>{const t=e.target.closest("[data-calon]");if(t)calToggle(t.dataset.calon,t.checked)});
$("calLegend").addEventListener("click",e=>{const b=e.target.closest("[data-calon2]");if(!b)return;const c=calOf(b.dataset.calon2);if(c)calToggle(c.id,c.on===false)});
$("icalSave").addEventListener("click",()=>{
  const v=$("icalUrl").value.trim().replace(/^webcal:/i,"https:");
  if(!/^https:\/\/\S+$/i.test(v)){toast("Colle un lien qui commence par https://");return}
  if(CALS().some(c=>c.url===v)){toast("Ce calendrier est déjà relié");return}
  if(CALS().length>=12){toast("12 calendriers au maximum");return}
  const l=CALS(),used=l.map(c=>c.c),id="cal"+Date.now().toString(36);
  let name=$("icalName").value.trim().slice(0,40);if(!name)name=l.length?`${L("Calendrier")} ${l.length+1}`:ICAL_CAT;
  l.push({id,name,url:v,c:CAL_COLORS.find(x=>!used.includes(x))||CAL_COLORS[l.length%CAL_COLORS.length],on:true,upd:Date.now()});
  const u=$("icalUser").value.trim(),pw=$("icalPass").value;if(u||pw)icalAuthSet(id,{user:u,pass:pw});
  ["icalUrl","icalName","icalUser","icalPass"].forEach(k=>$(k).value="");$("icalPriv").open=false;
  calsSave();renderCals();icalFetch(true,id)});
$("icalRefresh").addEventListener("click",()=>icalFetch(true));
