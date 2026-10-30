/* ---------- À faire ---------- */
// v39 : tâches planifiées (todo.day = AAAA-MM-JJ). Une tâche pas faite à temps passe toute seule au jour suivant :
// le jour affiché devient aujourd'hui (tDay), sans réécrire les données ; tLate = nombre de jours de retard (badge « reportée »).
const tDay=t=>{if(!t||!t.day)return null;if(t.done)return t.day;const k=iso(today());return t.day<k?k:t.day};
const tLate=t=>!t.done&&t.day&&t.day<iso(today())?Math.round((parse(iso(today()))-parse(t.day))/864e5):0;
const doneDay=t=>t.doneAt?iso(new Date(t.doneAt)):null;
// tâches d'un jour : prévues (ou reportées) ce jour-là, et celles réalisées ce jour-là qui étaient planifiées
const dayTodos=k=>data.todos.filter(t=>!t.paused&&(t.done?t.day&&doneDay(t)===k:tDay(t)===k)).sort((a,b)=>(a.done-b.done)||ordSort(a,b));
function dayLbl(k){const t0=iso(today());if(k===t0)return L("Aujourd'hui");const d=parse(k),tm=new Date(today());tm.setDate(tm.getDate()+1);
  if(k===iso(tm))return L("Demain");return `${DOW[d.getDay()].slice(0,3)}. ${d.getDate()} ${MO[d.getMonth()]}`}
const planChip=t=>{if(t.done||!t.day)return"";const n=tLate(t);return ` <span class="tchip ${n?"late":tDay(t)===iso(today())?"today":""}">${n?`↻ ${L("reportée")}`:esc(dayLbl(t.day))}</span>`};
function todoToggle(t){t.done=!t.done;delete t.paused;if(t.done){t.doneAt=new Date().toISOString();if(t.day&&t.day<iso(today()))t.day=iso(today());toast("Tâche réalisée")}else delete t.doneAt;
  freshId=t.id;save();renderTodos();if(navigator.vibrate)navigator.vibrate(10)}
// planifier : aujourd'hui, demain, une date, ou retirer la date
function todoPlan(t,after){const set=k=>{if(k)t.day=k;else delete t.day;t.upd=Date.now();save();renderTodos();if(after)after();toast(k?`${L("Prévue")} : ${dayLbl(k)}`:"Date retirée")};
  const tm=new Date(today());tm.setDate(tm.getDate()+1);
  openActions(L("Planifier"),[{l:"Aujourd'hui",on:t.day===iso(today()),fn:()=>set(iso(today()))},{l:"Demain",on:t.day===iso(tm),fn:()=>set(iso(tm))},
    {l:"Choisir une date…",fn:()=>{const i=$("planPick");i.value=t.day||iso(today());i.onchange=()=>{if(i.value)set(i.value)};try{i.showPicker()}catch(e){i.focus();i.click()}}},
    ...(t.day?[{l:"Retirer la date",fn:()=>set(null)}]:[])])}
let freshId=null,todoQ="";
const PEN=`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/></svg>`,PAUSE=`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M9 6v12M15 6v12"/></svg>`;
const DOWL=["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"];
const mlow=i=>LANG==="en"?MOL[i]:MOL[i].toLowerCase();
const two=n=>String(n).padStart(2,"0");
const CHEV=`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>`;
const GRIP=`<svg width="14" height="18" viewBox="0 0 14 18" aria-hidden="true" fill="currentColor"><circle cx="4" cy="4" r="1.6"/><circle cx="10" cy="4" r="1.6"/><circle cx="4" cy="9" r="1.6"/><circle cx="10" cy="9" r="1.6"/><circle cx="4" cy="14" r="1.6"/><circle cx="10" cy="14" r="1.6"/></svg>`;
const TC=()=>data.todoCats||(data.todoCats=[]);
const catOf=id=>TC().find(c=>c.id===id);
function todoDel(id){undoable("Tâche supprimée",[id],()=>{tomb(id);data.todos=data.todos.filter(x=>x.id!==id)},{after:renderTodos})}
// v34 : une ligne simple : rond (réaliser), titre (toucher = modifier), « ⋯ » pour le reste (suspendre, déplacer, supprimer)
const MORE=`<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.9"/><circle cx="12" cy="12" r="1.9"/><circle cx="19" cy="12" r="1.9"/></svg>`;
const ttlBtn=(t,extra)=>`<button type="button" class="grow ttl ttl-btn" data-edit="todo:${t.id}">${esc(t.title)}${extra||""}</button>`;
const moreBtn=t=>`<button class="pen" data-tmore="${t.id}" aria-label="Plus d'actions">${MORE}</button>`;
function todoRow(t){
  if(t.done){const d=new Date(t.doneAt||t.createdAt);
    return `<div class="row done ${t.id===freshId?"fresh":""}"><span class="donetime">${two(d.getHours())}:${two(d.getMinutes())}</span>
    <button class="check" data-tg="${t.id}" aria-label="Remettre à faire">${CHECK}</button>${ttlBtn(t,catLbl(t))}${moreBtn(t)}</div>`}
  if(t.paused)return `<div class="row paused ${t.id===freshId?"fresh":""}">${ttlBtn(t,catLbl(t))}
    <button class="resume" data-resume="${t.id}">Reprendre</button>${moreBtn(t)}</div>`;
  return `<div class="row ${t.id===freshId?"fresh":""}" data-tid="${t.id}">
    ${todoQ?"":`<button class="grip" data-grip="1" aria-label="Déplacer" title="Maintenir et glisser pour déplacer">${GRIP}</button>`}
    <button class="check" data-tg="${t.id}" aria-label="Terminer">${""}</button>${ttlBtn(t,planChip(t))}${moreBtn(t)}</div>`;
}
// fenêtre d'actions réutilisable : openActions(titre, [{l, fn, danger, on}])
function openActions(title,items){$("actTitle").textContent=title;$("actList").querySelectorAll("[data-c2]").forEach(c2Off); // v70 : un bouton encore armé est remis avant le nouveau contenu
  if(shIsl("actList")){try{window.SCIslands.actList($("actList"),{items:items.map(it=>({l:it.l,danger:!!it.danger,on:!!it.on})),check:CHECK,i18n:agI18n()});$("actSheet")._items=items;$("actSheet").hidden=false;return}
    catch(e){reportErr("island actList: "+(e&&e.message));try{window.SCIslands.unmount($("actList"))}catch(_){}}}
  $("actList").innerHTML=items.map((it,i)=>`<button type="button" class="act-it ${it.danger?"danger":""}" data-act="${i}" ${it.on?'aria-pressed="true"':""}>${esc(L(it.l))}${it.on?CHECK:""}</button>`).join("");
  $("actSheet")._items=items;$("actSheet").hidden=false}
const closeActions=()=>{$("actSheet").hidden=true};
$("actSheet").addEventListener("click",e=>{if(e.target.id==="actSheet"||e.target.closest("#actClose")){closeActions();return}
  const b=e.target.closest("[data-act]");if(!b)return;const it=$("actSheet")._items[+b.dataset.act];
  if(it.danger){confirm2(b,()=>{if(!it.keep)closeActions();it.fn()});return}
  if(!it.keep)closeActions();it.fn()});
function todoActions(id){const t=data.todos.find(x=>x.id===id);if(!t)return;
  const it=[{l:"Modifier",fn:()=>openEdit("todo:"+id)}];
  if(!t.done)it.push({l:t.day?"Changer la date":"Planifier un jour",fn:()=>todoPlan(t)});
  if(!t.done)it.push(t.paused?{l:"Reprendre",fn:()=>{delete t.paused;delete t.pausedAt;freshId=t.id;save();renderTodos();toast("Tâche reprise")}}
    :{l:"Mettre en suspens",fn:()=>{t.paused=true;t.pausedAt=new Date().toISOString();freshId=t.id;save();renderTodos();toast("Tâche mise en suspens")}});
  else it.push({l:"Remettre à faire",fn:()=>{t.done=false;delete t.doneAt;freshId=t.id;save();renderTodos()}});
  if(TC().length)it.push({l:"Déplacer vers une catégorie",fn:()=>openActions(L("Déplacer vers"),[{l:"Sans catégorie",on:!t.cat,fn:()=>{delete t.cat;save();renderTodos()}},
    ...TC().map(c=>({l:c.name,on:t.cat===c.id,fn:()=>{t.cat=c.id;save();renderTodos();toast(`${L("Rangé dans")} « ${c.name} »`)}}))])});
  it.push({l:"Supprimer",danger:true,fn:()=>todoDel(id)});
  openActions(t.title,it)}
// petite étiquette de catégorie (dans « Toutes » seulement)
function catLbl(t){const c=t.cat&&catOf(t.cat);return c&&curCat()==="all"?` <span class="small muted">· ${esc(c.name)}</span>`:""}
const mondayOf=d=>{const x=new Date(d.getFullYear(),d.getMonth(),d.getDate());x.setDate(x.getDate()-((x.getDay()+6)%7));return x};
function doneGroups(list){
  // année > mois > semaine > jour, du plus récent au plus ancien
  let h="",Y=null,M=null,W=null,D=null,open=false;
  const close=()=>{if(open){h+="</div>";open=false}};
  for(const t of list){
    const d=new Date(t.doneAt||t.createdAt),y=d.getFullYear(),m=d.getMonth(),mon=mondayOf(d),w=iso(mon),dk=iso(d);
    if(y!==Y){close();h+=`<div class="grp-y">${y}</div>`;Y=y;M=null}
    if(m!==M){close();h+=`<div class="grp-m">${MOL[m]}</div>`;M=m;W=null}
    if(w!==W){close();const sun=new Date(mon);sun.setDate(sun.getDate()+6);
      h+=`<div class="grp-w">${L("Semaine du")} ${mon.getDate()}${mon.getMonth()!==sun.getMonth()?" "+MO[mon.getMonth()]:""} ${L("au")} ${sun.getDate()} ${MO[sun.getMonth()]}</div>`;W=w;D=null}
    if(dk!==D){if(!open){h+='<div class="card" style="margin-bottom:8px">';open=true}h+=`<div class="grp-d">${DOWL[d.getDay()]} ${d.getDate()} ${mlow(m)}</div>`;D=dk}
    h+=todoRow(t);
  }
  close();return h;
}
// v28 : catégories repliées, sections ouvertes et catégorie choisie sont gardées dans le compte (data.prefs.todoView) :
// on retrouve Tâches comme on l'a laissé, même après avoir fermé l'app ou sur un autre appareil
function TV(){const p=data.prefs;if(!p.todoView){const u=data.ui||{};p.todoView={fold:{...(u.todoFold||{})},doneOpen:!!u.doneOpen,pausedOpen:u.pausedOpen!==false,cat:u.todoCat||"all",showFin:!!u.showDoneCats,doneCal:false}}
  const v=p.todoView;v.fold=v.fold||{};return v}
const tvSave=()=>{data.prefs.todoView={...TV()};save()};
// v28 : tâches réalisées en calendrier : chaque jour montre combien de tâches ont été faites ; toucher un jour affiche sa liste
let dcMonth=null,dcSel=null;
function doneCal(list){const byDay={};list.forEach(t=>{const k=iso(new Date(t.doneAt||t.createdAt));(byDay[k]=byDay[k]||[]).push(t)});
  const now=new Date(),cur=now.getFullYear()*12+now.getMonth();if(dcMonth===null)dcMonth=cur;
  const y=Math.floor(dcMonth/12),m=dcMonth%12,first=new Date(y,m,1),shift=(first.getDay()+6)%7,nd=new Date(y,m+1,0).getDate(),tk=iso(now);
  const max=Math.max(1,...Object.entries(byDay).filter(([k])=>k.startsWith(`${y}-${two(m+1)}`)).map(([,v])=>v.length));
  const monthN=Object.entries(byDay).filter(([k])=>k.startsWith(`${y}-${two(m+1)}`)).reduce((a,[,v])=>a+v.length,0);
  let g="";for(let i=0;i<shift;i++)g+="<span></span>";
  for(let d=1;d<=nd;d++){const k=`${y}-${two(m+1)}-${two(d)}`,n=(byDay[k]||[]).length,lv=n?Math.ceil(n/max*4):0;
    g+=`<button type="button" class="dc-d lv${lv} ${k===tk?"td":""}" data-dcday="${k}" aria-pressed="${dcSel===k}" ${n?"":"disabled"} aria-label="${d} ${MOL[m]} : ${n}"><span>${d}</span>${n?`<b>${n}</b>`:""}</button>`}
  const sel=dcSel&&byDay[dcSel];const sd=dcSel?parse(dcSel):null;
  return `<div class="card dc"><div class="dc-top"><button type="button" class="mini" data-dcm="${dcMonth-1}" aria-label="${L("Mois précédent")}">‹</button><b>${L(MOL[m])} ${y}</b><button type="button" class="mini" data-dcm="${dcMonth+1}" ${dcMonth>=cur?"disabled":""} aria-label="${L("Mois suivant")}">›</button></div>
    <div class="small muted" style="text-align:center;margin:-2px 0 8px">${monthN} ${L(monthN>1?"tâches réalisées ce mois-ci":"tâche réalisée ce mois-ci")}</div>
    <div class="dc-g">${[...({fr:"LMMJVSD",en:"MTWTFSS",nl:"MDWDVZZ"}[LANG]||"LMMJVSD")].map(x=>`<i>${x}</i>`).join("")}${g}</div></div>`+
    (sel?`<div class="grp-d" style="margin:10px 4px 6px">${DOWL[sd.getDay()]} ${sd.getDate()} ${mlow(sd.getMonth())} · ${sel.length} ${L(sel.length>1?"tâches":"tâche")}</div><div class="card">${sel.map(todoRow).join("")}</div>`
      :`<p class="small muted" style="text-align:center;margin:10px 0 0">${L("Touche un jour pour voir ce que tu as fait.")}</p>`)}
const curCat=()=>{const c=TV().cat||"all";return c==="all"||c==="none"||catOf(c)?c:"all"};
const ordSort=(a,b)=>((typeof a.ord==="number"?a.ord:1e9)-(typeof b.ord==="number"?b.ord:1e9))||a.createdAt.localeCompare(b.createdAt);
let catEditing=false,todoDragging=false,todoRenderPending=false;
function renderTodos(){
  if(todoDragging){todoRenderPending=true;return}
  const q=norm(todoQ),match=t=>!q||fold(t.title).includes(fold(todoQ.trim()));
  const cc=curCat(),inCat=t=>cc==="all"||(cc==="none"?!(t.cat&&catOf(t.cat)):t.cat===cc);
  const all=data.todos.filter(inCat),cats=TC();
  const open=all.filter(t=>!t.done&&!t.paused&&match(t)).sort(ordSort);
  const paused=all.filter(t=>!t.done&&t.paused&&match(t)).sort((a,b)=>(a.pausedAt||"").localeCompare(b.pausedAt||""));
  const done=all.filter(t=>t.done&&match(t)).sort((a,b)=>(b.doneAt||"").localeCompare(a.doneAt||""));
  const doneOpen=q?true:!!TV().doneOpen,pausedOpen=q?true:TV().pausedOpen!==false;
  // catégories
  const openN=id=>data.todos.filter(t=>!t.done&&!t.paused&&(id==="none"?!(t.cat&&catOf(t.cat)):t.cat===id)).length;
  // une catégorie dont toutes les tâches sont réalisées quitte la rangée du haut (rangée dans « ✓ Terminées »)
  const finished=c=>!openN(c.id)&&!data.todos.some(t=>t.cat===c.id&&t.paused)&&data.todos.some(t=>t.cat===c.id&&t.done);
  const fin=cats.filter(finished),showFin=!!TV().showFin||fin.some(c=>c.id===cc);
  const isl=window.SCIslands&&window.SCIslands.todos&&!window.__noIslands;
  if(!isl)$("todoCats").innerHTML=`<button class="pill" data-tcat="all" aria-pressed="${cc==="all"}">${L("Toutes")}</button>`+
    cats.filter(c=>!finished(c)).map(c=>`<button class="pill" data-tcat="${c.id}" aria-pressed="${cc===c.id}">${esc(c.name)} <span class="cnt">${openN(c.id)||""}</span></button>`).join("")+
    (fin.length?`<button class="pill" data-tcatfin="1" aria-pressed="${showFin}">✓ ${fin.length} ${L(fin.length>1?"terminées":"terminée")}</button>`+(showFin?fin.map(c=>`<button class="pill" data-tcat="${c.id}" aria-pressed="${cc===c.id}" style="opacity:.75">✓ ${esc(c.name)}</button>`).join(""):""):"")+
    `<button class="pill add" data-tcatnew="1">+ ${L("Catégorie")}</button>`;
  const cat=catOf(cc);
  $("catBar").hidden=!cat;
  if(cat&&!isl){const tot=data.todos.filter(t=>t.cat===cat.id&&!t.paused).length,dn=data.todos.filter(t=>t.cat===cat.id&&t.done).length;
    $("catBar").innerHTML=catEditing?`<form id="catRename" style="display:flex;gap:8px;width:100%"><input id="catRenIn" value="${esc(cat.name)}" aria-label="Nouveau nom" autocomplete="off"><button class="btn" type="submit">OK</button></form>`
      :`<div class="grow"><b>${esc(cat.name)}</b><div class="small muted">${tot?`${dn}/${tot} ${L("réalisées")}`:L("Aucune tâche pour l'instant")}</div></div>
        <div class="cat-prog" style="width:70px"><i style="width:${tot?dn/tot*100:0}%"></i></div>
        <button class="mini" data-catren="1">${L("Renommer")}</button><button class="x" data-catdel="1" aria-label="Supprimer la catégorie">×</button>`}
  $("todoIn").placeholder=cat?`${L("Nouvelle tâche dans")} « ${cat.name} »…`:L("Nouvelle tâche…");
  // liste à faire
  const emptyMsg=`<div class="card"><div class="empty">${q?"Aucune tâche à faire ne correspond.":all.some(t=>t.done)?"Tout est réalisé. Bravo !":cat?"Aucune tâche dans cette catégorie. Ajoute-en une ci-dessus.":"Aucune tâche. Ajoute-en une ci-dessus."}</div></div>`;
  if(isl){}
  else if(cc==="all"&&cats.length&&open.length){
    // v44.6 : les tâches sans catégorie d'abord, puis les catégories
    const groups=[{c:null,items:open.filter(t=>!(t.cat&&catOf(t.cat)))},...cats.map(c=>({c,items:open.filter(t=>t.cat===c.id)}))].filter(g=>g.items.length);
    // chaque catégorie peut être repliée (réglage propre à cet appareil)
    const fold=TV().fold,allFolded=groups.every(g=>fold[g.c?g.c.id:"none"]);
    const fbtn=(k,n)=>`<button class="foldc" data-tfold="${k}" aria-expanded="${!fold[k]}" aria-label="${L(fold[k]?"Déplier":"Replier")}">${CHEV}</button>`;
    const body=(k,items)=>fold[k]?"":`<div class="card" data-group="${k}">${items.map(todoRow).join("")}</div>`;
    const cnt=(k,n)=>fold[k]?`<span class="fold-n">${n}</span>`:"";
    $("todoOpen").innerHTML=(groups.length>1?`<div style="display:flex;justify-content:flex-end;margin:-4px 0 -10px"><button type="button" class="mini" data-tfoldall="1">${L(allFolded?"Tout déplier":"Tout replier")}</button></div>`:"")+groups.map(g=>{
      if(!g.c)return `<div class="cat-h">${fbtn("none")}<h2>${L("Sans catégorie")}</h2>${cnt("none",g.items.length)}</div>${body("none",g.items)}`;
      const tot=data.todos.filter(t=>t.cat===g.c.id&&!t.paused).length,dn=data.todos.filter(t=>t.cat===g.c.id&&t.done).length;
      return `<div class="cat-h">${fbtn(g.c.id)}<h2><button class="back" data-tcat="${g.c.id}" style="padding:0;font:inherit;color:inherit;text-transform:inherit;letter-spacing:inherit">${esc(g.c.name)} ›</button></h2>${cnt(g.c.id,g.items.length)}<span class="small muted">${dn}/${tot}</span><div class="cat-prog"><i style="width:${tot?dn/tot*100:0}%"></i></div></div>${body(g.c.id,g.items)}`}).join("");
  }else $("todoOpen").innerHTML=open.length?`<div class="card" data-group="${cc}">${open.map(todoRow).join("")}</div>`:emptyMsg;
  $("foldPaused").hidden=!paused.length;
  $("pausedTitle").textContent=`${L("En suspens")} (${paused.length})`;$("pausedArrow").textContent=L(pausedOpen?"Masquer":"Afficher");
  if(!isl)$("todoPaused").innerHTML=pausedOpen?paused.map(todoRow).join(""):"";$("todoPaused").hidden=!pausedOpen||!paused.length;
  $("foldDone").hidden=!done.length;
  $("doneTitle").textContent=`${L("Réalisées")} (${done.length})`;$("doneArrow").textContent=L(doneOpen?"Masquer":"Afficher");
  $("doneView").hidden=!doneOpen||!done.length||!!q;$("doneView").querySelectorAll("[data-dv]").forEach(b=>b.setAttribute("aria-pressed",String((b.dataset.dv==="cal")===!!TV().doneCal)));
  if(!isl)$("todoDone").innerHTML=doneOpen?(TV().doneCal&&!q?doneCal(done):doneGroups(done)):"";$("todoDone").hidden=!doneOpen||!done.length;
  const n=all.length,nd=all.filter(t=>t.done).length,no=data.todos.filter(t=>!t.done&&!t.paused).length;
  $("pfill").style.width=n?(nd/n*100)+"%":"0";
  $("ptext").textContent=n?`${nd}/${n}`:"";
  setBadge("todo",no);
  // v54 (#3) : listes rendues par React (même rendu) ; en cas d'erreur, ancien rendu
  if(isl){try{const v=TV();if(dcMonth===null){const n=new Date();dcMonth=n.getFullYear()*12+n.getMonth()}
      window.SCIslands.todos({cats:$("todoCats"),bar:$("catBar"),open:$("todoOpen"),paused:$("todoPaused"),done:$("todoDone")},
        {todos:data.todos,cats,open,paused,done,view:{cat:cc,fold:v.fold,doneOpen:!!v.doneOpen,pausedOpen:v.pausedOpen!==false,showFin:!!v.showFin,doneCal:!!v.doneCal},
         search:!!q,grip:!todoQ,catEditing,freshId,today:iso(today()),dcMonth,dcSel,i18n:{...agI18n(),DOW,DOWL,lang:LANG||"fr"}})}
    catch(e){reportErr("island todos: "+(e&&e.message));window.__noIslands=true;try{renderTodos()}finally{window.__noIslands=false}return}}
  freshId=null;
}
$("todoSearch").addEventListener("input",e=>{todoQ=e.target.value;renderTodos()});
// v44.6 : la recherche s'ouvre avec la loupe (et se referme vide)
$("todoSearchBtn").addEventListener("click",()=>{const i=$("todoSearch"),open=i.hidden;i.hidden=!open;$("todoSearchBtn").setAttribute("aria-expanded",open);
  if(open)i.focus();else if(todoQ){todoQ="";i.value="";renderTodos()}});
$("todoSearch").addEventListener("blur",e=>{if(!e.target.value)setTimeout(()=>{if(!$("todoSearch").value&&document.activeElement!==$("todoSearch")){$("todoSearch").hidden=true;$("todoSearchBtn").setAttribute("aria-expanded","false")}},150)});
// crée (ou retrouve) une catégorie à partir de son nom
function catMake(name){const v=name.trim().replace(/\s+/g," ");if(!v)return null;
  let c=TC().find(x=>norm(x.name)===norm(v));const isNew=!c;if(!c){c={id:uid(),name:v};TC().push(c)}
  TV().cat=c.id;$("catIn").value="";$("catForm").hidden=true;return {c,isNew}}
$("todoForm").addEventListener("submit",e=>{
  e.preventDefault();const v=$("todoIn").value.trim();if(!v)return;
  // v28 : nom de catégorie tapé mais pas validé → la catégorie est créée et la tâche y est rangée
  if(!$("catForm").hidden&&$("catIn").value.trim()){const r=catMake($("catIn").value);if(r&&r.isNew)toast(`${L("Catégorie créée")} : ${r.c.name}`)}
  const q=parseQuick(v),t={id:uid(),title:q.date&&q.title?q.title:v,createdAt:new Date().toISOString(),done:false};
  if(q.date&&q.title)t.day=q.date; // v39 : « Appeler maman demain » → prévue demain
  const cc=curCat();if(catOf(cc))t.cat=cc;
  data.todos.push(t);freshId=t.id;save();renderTodos();$("todoIn").value="";
});
$("catForm").addEventListener("submit",e=>{
  e.preventDefault();const v=$("catIn").value.trim().replace(/\s+/g," ");if(!v)return;
  if(TC().some(c=>norm(c.name)===norm(v))){toast("Cette catégorie existe déjà");return}
  catMake(v);save();renderTodos();toast("Catégorie créée");$("todoIn").focus();
});
$("foldDone").addEventListener("click",()=>{const v=TV();v.doneOpen=!v.doneOpen;tvSave();renderTodos()});
$("foldPaused").addEventListener("click",()=>{const v=TV();v.pausedOpen=v.pausedOpen===false;tvSave();renderTodos()});
$("doneView").addEventListener("click",e=>{const b=e.target.closest("[data-dv]");if(!b)return;TV().doneCal=b.dataset.dv==="cal";tvSave();renderTodos()});
$("v-todo").addEventListener("submit",e=>{if(e.target.id!=="catRename")return;e.preventDefault();
  const c=catOf(curCat()),v=$("catRenIn").value.trim().replace(/\s+/g," ");if(c&&v){c.name=v;save()}catEditing=false;renderTodos()});
document.getElementById("v-todo").addEventListener("click",e=>{
  const b=e.target.closest("button");if(!b)return;
  const find=id=>data.todos.find(x=>x.id===id);
  if(b.dataset.dcday){dcSel=dcSel===b.dataset.dcday?null:b.dataset.dcday;renderTodos();return}
  if(b.dataset.dcm){dcMonth=+b.dataset.dcm;dcSel=null;renderTodos();return}
  if(b.dataset.tcat){TV().cat=b.dataset.tcat;catEditing=false;tvSave();$("catForm").hidden=true;renderTodos();return}
  if(b.dataset.tfold){const f=TV().fold,k=b.dataset.tfold;if(f[k])delete f[k];else f[k]=1;tvSave();renderTodos();return}
  if(b.dataset.tfoldall){const ks=[...document.querySelectorAll("#todoOpen [data-tfold]")].map(x=>x.dataset.tfold),f=TV().fold;
    const close=ks.some(k=>!f[k]);ks.forEach(k=>{if(close)f[k]=1;else delete f[k]});tvSave();renderTodos();return}
  if(b.dataset.tcatfin){const v=TV();v.showFin=!v.showFin;tvSave();renderTodos();return}
  if(b.dataset.tcatnew){const f=$("catForm");f.hidden=!f.hidden;if(!f.hidden)$("catIn").focus();return}
  if(b.dataset.catren){catEditing=true;renderTodos();const i=$("catRenIn");i.focus();i.select();return}
  if(b.dataset.catdel){const c=catOf(curCat());if(!c||!c2ok(b))return;const had=data.todos.filter(t=>t.cat===c.id).map(t=>t.id);
    undoable("Catégorie supprimée, ses tâches sont gardées",[c.id],()=>{tomb(c.id);data.todos.forEach(t=>{if(t.cat===c.id)delete t.cat});data.todoCats=TC().filter(x=>x!==c);TV().cat="all";tvSave()},
      {after:renderTodos,revert:()=>{data.todos.forEach(t=>{if(had.includes(t.id))t.cat=c.id});TV().cat=c.id;tvSave()}});return}
  if(b.dataset.tg){const t=find(b.dataset.tg);if(!t)return;todoToggle(t)}
  else if(b.dataset.pause){const t=find(b.dataset.pause);t.paused=true;t.pausedAt=new Date().toISOString();freshId=t.id;save();renderTodos();toast("Tâche mise en suspens")}
  else if(b.dataset.resume){const t=find(b.dataset.resume);delete t.paused;delete t.pausedAt;freshId=t.id;save();renderTodos();toast("Tâche reprise")}
  else if(b.dataset.del)todoDel(b.dataset.del);
  else if(b.dataset.tmore)todoActions(b.dataset.tmore);
});
// glisser-déposer pour changer l'ordre (poignée ⠿)
$("todoOpen").addEventListener("pointerdown",e=>{
  const g=e.target.closest("[data-grip]");if(!g)return;
  const row=g.closest(".row"),box=row.parentElement;if(!box||!box.dataset.group)return;
  e.preventDefault();
  const rows=[...box.querySelectorAll(":scope > .row[data-tid]")],from=rows.indexOf(row);
  const tops=rows.map(r=>r.offsetTop),hts=rows.map(r=>r.offsetHeight),y0=e.clientY,sy0=window.scrollY;
  let to=from,raf=null,lastY=e.clientY,lastX=e.clientX,pill=null;todoDragging=true;
  row.classList.add("dragging");rows.forEach(r=>{if(r!==row)r.classList.add("drop-anim")});
  try{g.setPointerCapture(e.pointerId)}catch(x){}
  if(navigator.vibrate)navigator.vibrate(10);
  const place=()=>{
    const dy=lastY-y0+(window.scrollY-sy0);row.style.transform=`translateY(${dy}px)`;
    const mid=tops[from]+hts[from]/2+dy;
    // nouvelle position = nombre de lignes dont le centre est au-dessus
    let k=0;for(let i=0;i<rows.length;i++){if(i!==from&&mid>tops[i]+hts[i]/2)k++}to=k;
    rows.forEach((r,i)=>{if(i===from)return;let s=0;if(from<to&&i>from&&i<=to)s=-hts[from];if(from>to&&i>=to&&i<from)s=hts[from];r.style.transform=s?`translateY(${s}px)`:""});
  };
  const scroller=()=>{if(!todoDragging)return;if(lastY<90)window.scrollBy(0,-8);else if(lastY>innerHeight-130)window.scrollBy(0,8);place();raf=requestAnimationFrame(scroller)};
  raf=requestAnimationFrame(scroller);
  // la rangée des catégories reste visible pendant le glisser
  document.body.classList.add("todo-dragging");
  // v28 : lâcher la tâche sur une pastille de catégorie (en haut) la range dans cette catégorie
  const overPill=()=>{const el=document.elementFromPoint(lastX,lastY),p=el&&el.closest("#todoCats [data-tcat]");
    if(p!==pill){if(pill)pill.classList.remove("drop");pill=p;if(pill)pill.classList.add("drop")}};
  const mv=ev=>{lastY=ev.clientY;lastX=ev.clientX;place();row.style.visibility="hidden";overPill();row.style.visibility=""};
  const up=()=>{
    g.removeEventListener("pointermove",mv);g.removeEventListener("pointerup",up);g.removeEventListener("pointercancel",up);
    cancelAnimationFrame(raf);todoDragging=false;document.body.classList.remove("todo-dragging");
    rows.forEach(r=>{r.classList.remove("dragging","drop-anim");r.style.transform=""});
    if(pill){const t=data.todos.find(x=>x.id===row.dataset.tid),k=pill.dataset.tcat,c=catOf(k);pill.classList.remove("drop");
      if(t&&k!=="all"&&(c?t.cat!==c.id:t.cat)){if(c)t.cat=c.id;else delete t.cat;delete t.ord;freshId=t.id;save();toast(c?`${L("Rangée dans")} « ${c.name} »`:L("Tâche sortie de sa catégorie"))}
      todoRenderPending=false;renderTodos();return}
    const ids=rows.map(r=>r.dataset.tid),[m]=ids.splice(from,1);ids.splice(to,0,m);
    if(to!==from){ids.forEach((id,i)=>{const t=data.todos.find(x=>x.id===id);if(t)t.ord=i});save()}
    todoRenderPending=false;renderTodos();
  };
  g.addEventListener("pointermove",mv);g.addEventListener("pointerup",up);g.addEventListener("pointercancel",up);
});
