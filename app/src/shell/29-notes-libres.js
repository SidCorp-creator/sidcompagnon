/* ---------- notes libres (+ notes secrètes) ---------- */
const NT=()=>data.notes||(data.notes=[]);
/* v39 : notes « façon Word » : texte mis en forme (n.html, nettoyé) + texte brut (n.body, pour la recherche, l'aperçu et le connecteur).
   Dossiers et sous-dossiers : data.noteFolders = [{id, name, parent}] ; note.folder = id du dossier. */
const NF=()=>data.noteFolders||(data.noteFolders=[]);
let noteDir=null,nfRen=null; // dossier ouvert (en mémoire : tout se referme quand on revient), dossier en cours de renommage
const nfOf=id=>id?NF().find(f=>f.id===id):null;
const nfPath=id=>{const p=[];let f=nfOf(id),g=0;while(f&&g++<30){p.unshift(f);f=nfOf(f.parent)}return p};
const nfKids=id=>NF().filter(f=>(nfOf(f.parent)?f.parent:null)===(id||null)).sort((a,b)=>a.name.localeCompare(b.name));
const noteDirOf=n=>nfOf(n.folder)?n.folder:null;
const nfSub=id=>{const s=new Set([id]);let add=true;while(add){add=false;for(const f of NF())if(!s.has(f.id)&&s.has(f.parent)){s.add(f.id);add=true}}return s};
const nfCount=id=>{const s=nfSub(id);return NT().filter(n=>s.has(n.folder)).length};
const RT_DROP=new Set(["SCRIPT","STYLE","IFRAME","OBJECT","EMBED","SVG","MATH","IMG","PICTURE","VIDEO","AUDIO","CANVAS","TEMPLATE","FORM","INPUT","BUTTON","TEXTAREA","SELECT","LINK","META","TITLE","HEAD"]);
const RT_KEEP=new Set(["B","STRONG","I","EM","U","S","STRIKE","DEL","MARK","SPAN","H2","H3","P","DIV","BR","UL","OL","LI","BLOCKQUOTE","HR","A"]);
const RT_HL=["y","g","b","p"],RT_TC=["r","o","g","b","v"]; // v41 : surligneur et couleur du texte (data-hl, data-tc)
// garde seulement la mise en forme autorisée (rien d'exécutable, pas de style) : sert à l'enregistrement et au collage
function rtClean(html){const t=document.createElement("template");t.innerHTML=String(html||"");
  const walk=n=>{for(const c of [...n.childNodes]){if(c.nodeType===3)continue;if(c.nodeType!==1){c.remove();continue}
    let tag=c.tagName;if(RT_DROP.has(tag)){c.remove();continue}
    if(tag==="H1"||tag==="H4"||tag==="H5"||tag==="H6"){const h=document.createElement(tag==="H1"?"h2":"h3");h.append(...c.childNodes);c.replaceWith(h);walk(h);continue}
    walk(c);if(!RT_KEEP.has(tag)){c.replaceWith(...c.childNodes);continue}
    const hl=tag==="MARK"&&RT_HL.includes(c.getAttribute("data-hl"))?c.getAttribute("data-hl"):null,tc=tag==="SPAN"&&RT_TC.includes(c.getAttribute("data-tc"))?c.getAttribute("data-tc"):null;
    if(tag==="SPAN"&&!tc){c.replaceWith(...c.childNodes);continue}
    const href=tag==="A"&&/^https?:\/\//i.test(c.getAttribute("href")||"")?c.getAttribute("href"):null,chk=tag==="UL"&&c.classList.contains("chk"),dc=tag==="LI"?c.getAttribute("data-c"):null;
    for(const a of [...c.attributes])c.removeAttribute(a.name);
    if(href){c.setAttribute("href",href);c.setAttribute("target","_blank");c.setAttribute("rel","noopener")}else if(tag==="A"){c.replaceWith(...c.childNodes);continue}
    if(chk)c.className="chk";if(dc==="1"||dc==="0")c.setAttribute("data-c",dc);if(hl)c.setAttribute("data-hl",hl);if(tc)c.setAttribute("data-tc",tc)}};
  walk(t.content);return t.innerHTML.trim()}
const rtFromText=b=>String(b||"").split("\n").map(l=>`<div>${l?esc(l):"<br>"}</div>`).join("");
const rtText=el=>String(el.innerText||"").replace(/\u00a0/g," ").replace(/\n{3,}/g,"\n\n").trim();
const rtSet=v=>{$("noteBody").innerHTML=v.html?rtClean(v.html):rtFromText(v.body);rtEmpty()};
const rtEmpty=()=>$("noteBody").classList.toggle("is-empty",!rtText($("noteBody"))&&!$("noteBody").querySelector("li,hr"))
let noteOpenId=null,noteQ="",noteSaveT=null,notePend=null;
const noteFind=id=>NT().find(n=>n.id===id);
const fmtWhen=t=>{const d=new Date(t),n=new Date();
  if(d.toDateString()===n.toDateString())return `${two(d.getHours())}:${two(d.getMinutes())}`;
  return `${d.getDate()} ${MO[d.getMonth()]}${d.getFullYear()!==n.getFullYear()?" "+d.getFullYear():""}`};
// notes secrètes : titre et texte chiffrés avec un code à 5 chiffres propre aux notes (même méthode que le coffre)
// note secrète = {id, secret:true, vid, iv, ct, createdAt, upd} ; le texte clair ne vit qu'en mémoire (nsPlain)
let nsKey=null,nsVid=null,nsPlain=new Map(),nsLoading=false;
const nsOn=()=>!!(data.noteVault&&data.noteVault.chk);
const noteView=n=>!n?null:n.secret?(nsKey&&n.vid===nsVid&&nsPlain.get(n.id))||null:n; // null = verrouillée
// enregistrement différé (le chiffrement d'une note secrète est asynchrone)
function noteQueue(fn){clearTimeout(noteSaveT);notePend=fn;noteSaveT=setTimeout(noteFlush,600)}
async function noteFlush(){clearTimeout(noteSaveT);noteSaveT=null;const f=notePend;notePend=null;if(f)await f()}
function renderNotes(){
  if(!$("noteList"))return;if(typeof pvRefresh==="function")pvRefresh();
  // coffre des notes remis à zéro ou recréé ailleurs : on reverrouille
  if(nsKey&&(!nsOn()||data.noteVault.id!==nsVid)){nsKey=null;nsVid=null;nsPlain=new Map()}
  // notes secrètes arrivées d'un autre appareil : on les déchiffre puis on réaffiche
  if(nsKey&&!nsLoading&&NT().some(n=>n.secret&&n.vid===nsVid&&(nsPlain.get(n.id)||{})._iv!==n.iv)){nsLoading=true;nsLoad().finally(()=>{nsLoading=false;renderNotes()})}
  const n=noteOpenId&&noteFind(noteOpenId),v=noteView(n);
  if(noteOpenId&&!v)noteOpenId=null; // supprimée ailleurs, ou verrouillée
  $("notesList").hidden=!!noteOpenId;$("noteEdit").hidden=!noteOpenId;document.body.classList.toggle("note-full",data.ui.view==="notes"&&!!noteOpenId);if(data.ui.view==="notes")$("vhead").hidden=!!noteOpenId;
  if(noteOpenId){
    if(document.activeElement!==$("noteTitle"))$("noteTitle").value=v.title||"";
    if(document.activeElement!==$("noteBody"))rtSet(v);
    $("noteWhen").textContent=fmtWhen(n.upd||Date.parse(n.createdAt));
    $("noteSecBar").hidden=!n.secret;
    // v65 : les photos s'affichent aussi en rouvrant la note (avant : seulement juste après l'ajout)
    const pk=n.id+":"+(n.secret?"":(n.photos||[]).map(p=>p.id).join());if(renderNotes.phk!==pk){renderNotes.phk=pk;renderNotePhotos(n.secret?null:n)}
    $("noteLock").setAttribute("aria-label",L(n.secret?"Verrouiller la note":"Rendre la note secrète"));$("noteLock").title=$("noteLock").getAttribute("aria-label");
    return}
  renderNotes.phk=null;
  const q=noteQ.trim(),secN=NT().filter(x=>x.secret).length;
  $("nsBar").hidden=!(nsKey&&secN);
  if(shIsl("nsBar")){try{window.SCIslands.nsBar($("nsBar"),{unlock:IC("unlock"),lock:IC("lock"),i18n:agI18n()})}catch(e){reportErr("island nsBar: "+(e&&e.message))}}
  else $("nsBar").innerHTML=`<span class="grow">${IC("unlock")} ${L("Notes secrètes déverrouillées")}</span><button type="button" class="mini" data-nslock="1">${IC("lock")} ${L("Verrouiller")}</button>`;
  let list=NT().slice().sort((a,b)=>(b.upd||0)-(a.upd||0));
  if(noteDir&&!nfOf(noteDir))noteDir=null;$("nfNew").textContent=L(noteDir?"+ Sous-dossier":"+ Dossier");
  const path=nfPath(noteDir);$("nfPath").hidden=!!q||!noteDir;
  // v41 : dans un dossier, un vrai bouton retour (vers le dossier parent) + le chemin complet ; on peut y déposer une note ou un dossier
  const up=path.length>1?path[path.length-2]:null;
  const isl=window.SCIslands&&window.SCIslands.notes&&!window.__noIslands;
  if(isl){}else $("nfPath").innerHTML=noteDir?`<button type="button" class="back nf-back" data-nfgo="${up?up.id:""}">‹ ${esc(up?up.name:L("Notes"))}</button>
    <div class="nf-crumbs"><button type="button" class="nf-crumb" data-nfgo="">${L("Notes")}</button>`+path.map((f,i)=>`<span aria-hidden="true">›</span>${i===path.length-1?`<b class="notr">${esc(f.name)}</b>`:`<button type="button" class="nf-crumb notr" data-nfgo="${f.id}">${esc(f.name)}</button>`}`).join("")+`</div>`:"";
  $("notesList").classList.toggle("in-dir",!!noteDir&&!q);const h1=$("notesList").querySelector("h1");if(h1){h1.textContent=noteDir&&!q?path[path.length-1].name:L("Notes");h1.classList.toggle("notr",!!noteDir)}
  // v42 : les dossiers en tuiles (section « Dossiers »), bien distincts des notes en lignes (section « Notes »)
  const kids=q?[]:nfKids(noteDir);
  const dirs=kids.length?`<h2 class="nl-h">${L(noteDir?"Sous-dossiers":"Dossiers")}</h2><div class="nf-grid">`+kids.map(f=>`<div class="nf-row nf-tile"><span class="ngrip" data-fgrip="${f.id}" aria-hidden="true" title="${L("Maintenir et glisser")}">${GRIP}</span><button type="button" class="nf-open" data-nfopen="${f.id}"><span class="nf-ic">${IC("folder")}</span><b class="grow notr">${esc(f.name)}</b><span class="nf-n">${nfCount(f.id)||"0"}</span></button><button type="button" class="pen" data-nfmore="${f.id}" aria-label="${L("Plus d'actions")}">${MORE}</button></div>`).join("")+`</div>`:"";
  if(!q)list=list.filter(x=>noteDirOf(x)===noteDir);
  if(q)list=list.filter(x=>noteView(x)).map(x=>{const w=noteView(x);return{x,s:Math.max(fuzzyScore(w.title||"",q),fold(w.body).includes(fold(q))?11:0)}}).filter(o=>o.s>0).sort((a,b)=>b.s-a.s).map(o=>o.x);
  // v57 (#3) : chemin et liste dessinés par React (app/src/Notes.tsx) ; les notes secrètes arrivent déchiffrées (en mémoire) ou « locked »
  if(isl){try{const ic={folder:IC("folder"),lock:IC("lock"),camera:IC("camera")};
    window.SCIslands.notes({path:$("nfPath"),list:$("noteList")},{path:noteDir?path.map(f=>({id:f.id,name:f.name,count:0})):[],dirs:kids.map(f=>({id:f.id,name:f.name,count:nfCount(f.id)})),inDir:!!noteDir,search:!!q,
      empty:q?"Aucune note ne correspond.":noteDir?"Ce dossier est vide. Touche « + Note » pour y écrire.":"Aucune note pour l'instant. Touche « + Note » pour écrire.",icons:ic,i18n:agI18n(),
      notes:list.map(x=>{const w=noteView(x),when=fmtWhen(x.upd||Date.parse(x.createdAt));
        if(!w)return{id:x.id,locked:true,secret:true,title:"",prev:"",path:"",photos:0,pdf:null,when};
        const lines=String(w.body||"").trim().split("\n").filter(Boolean),t=w.title&&w.title.trim()?w.title:(lines.shift()||L("Nouvelle note"));
        return{id:x.id,locked:false,secret:!!x.secret,title:t,prev:lines.join(" · ")||"",path:q&&noteDirOf(x)?nfPath(x.folder).map(f=>f.name).join(" › "):"",
          photos:x.photos&&x.photos.length||0,pdf:x.pdf?{pages:x.pdf.pages||0,anns:pvAnns(x.id).length}:null,when}})});return}
    catch(e){reportErr("island notes: "+(e&&e.message))}}
  $("noteList").innerHTML=dirs+(list.length&&dirs?`<h2 class="nl-h">${L("Notes")}</h2>`:"")+(list.length?`<div class="nl-notes">`+list.map(x=>{const w=noteView(x),when=`<span class="when">${fmtWhen(x.upd||Date.parse(x.createdAt))}</span>`;
    const more=`<button type="button" class="pen note-more" data-nmore="${x.id}" aria-label="${L("Plus d'actions")}">${MORE}</button>`;
    if(!w)return `<div class="note-row"><button class="note note-lock" data-note="${x.id}"><b>${IC("lock")} ${L("Note secrète")}</b><span class="prev">${L("Touche pour l'ouvrir avec ton code")}</span>${when}</button>${more}</div>`;
    const lines=String(w.body||"").trim().split("\n").filter(Boolean);
    const t=w.title&&w.title.trim()?w.title:(lines.shift()||L("Nouvelle note"));
    const fp=q&&noteDirOf(x)?`<span class="small muted nf-in">${IC("folder")} ${esc(nfPath(x.folder).map(f=>f.name).join(" › "))}</span>`:"";
    return `<div class="note-row"><span class="ngrip" data-ngrip="${x.id}" aria-hidden="true" title="${L("Maintenir et glisser")}">${GRIP}</span><button class="note" data-note="${x.id}"><b class="notr">${x.secret?IC("lock")+" ":""}${esc(t)}</b>${fp}<span class="prev notr">${esc(lines.join(" · ")||"")}</span>${x.photos&&x.photos.length?`<span class="np-count">${IC("camera")} ${x.photos.length} ${L(x.photos.length>1?"photos":"photo")}</span>`:""}${x.pdf?`<span class="np-count pdf-badge">PDF${x.pdf.pages?` · ${x.pdf.pages} ${L(x.pdf.pages>1?"pages":"page")}`:""}${(()=>{const k=pvAnns(x.id).length;return k?` · ${k} ${L(k>1?"annotations":"annotation")}`:""})()}</span>`:""}${when}</button>${more}</div>`}).join("")+`</div>`
    :dirs?"":`<div class="empty">${L(q?"Aucune note ne correspond.":noteDir?"Ce dossier est vide. Touche « + Note » pour y écrire.":"Aucune note pour l'instant. Touche « + Note » pour écrire.")}</div>`);
}
function openNote(id){noteOpenId=id;renderNotes();window.scrollTo(0,0)}
async function closeNote(){
  await noteFlush();const n=noteOpenId&&noteFind(noteOpenId),v=noteView(n);
  // une note laissée vide n'est pas gardée
  if(n&&v&&!String(v.title||"").trim()&&!String(v.body||"").trim()&&!(n.photos&&n.photos.length)){tomb(n.id);data.notes=NT().filter(x=>x!==n);nsPlain.delete(n.id)}
  save();noteOpenId=null;renderNotes();
}
$("noteNew").addEventListener("click",()=>{const n={id:uid(),title:"",body:"",createdAt:new Date().toISOString(),upd:Date.now()};if(noteDir)n.folder=noteDir;NT().push(n);openNote(n.id);$("noteTitle").focus()});
// --- dossiers de notes ---
function nfFormOpen(f){nfRen=f||null;$("nfForm").hidden=false;$("nfIn").value=f?f.name:"";$("nfForm").querySelector("[type=submit]").textContent=L(f?"Renommer":"Créer");setTimeout(()=>$("nfIn").focus(),30)}
$("nfNew").addEventListener("click",()=>nfFormOpen(null));
$("nfCancel").addEventListener("click",()=>{$("nfForm").hidden=true;nfRen=null});
$("nfForm").addEventListener("submit",e=>{e.preventDefault();const v=$("nfIn").value.trim().replace(/\s+/g," ").slice(0,60);if(!v)return;
  if(nfRen){nfRen.name=v;toast("Dossier renommé")}else{NF().push({id:uid(),name:v,parent:noteDir||null,createdAt:new Date().toISOString()});toast(`${L("Dossier créé")} : ${v}`)}
  $("nfForm").hidden=true;nfRen=null;save();renderNotes()});
function nfDelete(f){const kids=NF().filter(x=>x.parent===f.id).map(x=>x.id),ns=NT().filter(n=>n.folder===f.id).map(n=>n.id),up=f.parent||null;
  undoable("Dossier supprimé, son contenu est gardé",[f.id],()=>{tomb(f.id);NF().forEach(x=>{if(x.parent===f.id)x.parent=up});NT().forEach(n=>{if(n.folder===f.id){if(up)n.folder=up;else delete n.folder}});data.noteFolders=NF().filter(x=>x!==f);if(noteDir===f.id)noteDir=up},
    {after:renderNotes,revert:()=>{NF().forEach(x=>{if(kids.includes(x.id))x.parent=f.id});NT().forEach(n=>{if(ns.includes(n.id))n.folder=f.id})}})}
// liste des dossiers (arbre aplati) pour ranger une note ou un dossier
function nfChoices(cur,skip,set){const out=[{l:L("Notes (aucun dossier)"),on:!cur,fn:()=>set(null)}];
  const add=(pid,depth)=>nfKids(pid).forEach(f=>{if(skip&&skip.has(f.id))return;out.push({l:`${"   ".repeat(depth)}${depth?"└ ":""}${f.name}`,on:cur===f.id,fn:()=>set(f.id)});add(f.id,depth+1)});
  add(null,0);return out}
function nfActions(id){const f=nfOf(id);if(!f)return;
  openActions(f.name,[{l:"Renommer",fn:()=>nfFormOpen(f)},
    {l:"Déplacer",fn:()=>openActions(L("Déplacer vers"),nfChoices(f.parent||null,nfSub(f.id),pid=>{f.parent=pid;save();renderNotes();toast("Dossier déplacé")}))},
    {l:"Supprimer",danger:true,fn:()=>nfDelete(f)}])}
$("nfPath").addEventListener("click",e=>{const b=e.target.closest("[data-nfgo]");if(b){noteDir=b.dataset.nfgo||null;renderNotes();window.scrollTo(0,0)}});
// v41 : glisser une note ou un dossier (poignée ⠿) sur un dossier pour l'y ranger, ou sur le bouton retour / le chemin pour le remonter
$("noteList").addEventListener("pointerdown",e=>{const g=e.target.closest("[data-ngrip],[data-fgrip]");if(!g)return;e.preventDefault();
  const isF=!!g.dataset.fgrip,id=g.dataset.ngrip||g.dataset.fgrip,item=isF?nfOf(id):noteFind(id);if(!item)return;
  const w=noteView(item)||{},label=isF?item.name:(w.title||String(w.body||"").split("\n")[0]||L("Note secrète"));
  const row=g.closest(".nf-row,.note-row"),ghost=document.createElement("div");ghost.className="doc-ghost";ghost.textContent=label;document.body.appendChild(ghost);row.classList.add("dragging");
  try{g.setPointerCapture(e.pointerId)}catch(x){}if(navigator.vibrate)navigator.vibrate(10);
  const bad=isF?nfSub(id):new Set();let over=null;
  const pos=ev=>{ghost.style.left=(ev.clientX+12)+"px";ghost.style.top=(ev.clientY-20)+"px";
    const el=document.elementFromPoint(ev.clientX,ev.clientY);let c=el&&el.closest("#noteList [data-nfopen],#nfPath [data-nfgo]");
    if(c&&bad.has(c.dataset.nfopen||c.dataset.nfgo))c=null;
    if(c!==over){if(over)over.classList.remove("drop");over=c;if(over)over.classList.add("drop")}
    if(ev.clientY<90)window.scrollBy(0,-12);else if(ev.clientY>innerHeight-120)window.scrollBy(0,12)};pos(e);
  const up=()=>{g.removeEventListener("pointermove",pos);g.removeEventListener("pointerup",up);g.removeEventListener("pointercancel",up);ghost.remove();row.classList.remove("dragging");
    if(over){const to=(over.dataset.nfopen||over.dataset.nfgo)||null,f=nfOf(to);over.classList.remove("drop");
      if(isF){if((item.parent||null)!==to){item.parent=to;save();toast(f?`${L("Dossier rangé dans")} « ${f.name} »`:"Dossier remis dans Notes")}}
      else if((noteDirOf(item)||null)!==to){if(to)item.folder=to;else delete item.folder;item.upd=Date.now();save();toast(f?`${L("Rangée dans")} « ${f.name} »`:"Rangée dans Notes")}}
    renderNotes()};
  g.addEventListener("pointermove",pos);g.addEventListener("pointerup",up);g.addEventListener("pointercancel",up)});
$("noteMove").addEventListener("click",()=>{const n=noteFind(noteOpenId);if(!n)return;
  if(!NF().length){toast("Crée d'abord un dossier dans la liste des notes");return}
  openActions(L("Ranger dans"),nfChoices(noteDirOf(n),null,fid=>{if(fid)n.folder=fid;else delete n.folder;n.upd=Date.now();save();toast(fid?`${L("Rangée dans")} « ${nfOf(fid).name} »`:"Rangée dans Notes")}))});
$("noteList").addEventListener("click",async e=>{
  const fo=e.target.closest("[data-nfopen]");if(fo){noteDir=fo.dataset.nfopen;renderNotes();window.scrollTo(0,0);return}
  const fm=e.target.closest("[data-nfmore]");if(fm){nfActions(fm.dataset.nfmore);return}
  const nm=e.target.closest("[data-nmore]");if(nm){noteActions(nm.dataset.nmore);return}
  const b=e.target.closest("[data-note]");if(!b)return;const n=noteFind(b.dataset.note);if(!n)return;
  if(n.pdf){pdfOpen(n.id);return} // v44.7 : une note PDF s'ouvre dans le lecteur-annoteur
  if(n.secret&&!noteView(n)){if(!(await nsUnlock()))return;await nsLoad();if(!noteView(n))return}
  openNote(n.id)});
$("nsBar").addEventListener("click",e=>{if(e.target.closest("[data-nslock]")){nsLock();toast("Notes secrètes verrouillées")}});
$("noteBack").addEventListener("click",closeNote);
$("noteSearch").addEventListener("input",e=>{noteQ=e.target.value;renderNotes()});
function noteInput(){
  const n=noteFind(noteOpenId),v=noteView(n);if(!v)return;
  const el=$("noteBody");v.title=$("noteTitle").value;v.body=rtText(el);v.html=el.innerHTML;n.upd=Date.now();$("noteWhen").textContent=fmtWhen(n.upd);rtEmpty();
  if(!n.secret){noteQueue(async()=>{v.html=rtClean(el.innerHTML);save()});return}
  const k=nsKey;noteQueue(async()=>{v.html=rtClean(v.html);const e=await encJ(k,{title:v.title,body:v.body,html:v.html});n.iv=e.iv;n.ct=e.ct;v._iv=e.iv;save()});
}
$("noteTitle").addEventListener("input",noteInput);$("noteBody").addEventListener("input",noteInput);
$("noteTitle").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();$("noteBody").focus()}});
// les photos (et le PDF) ne sont effacés qu'une fois l'annulation impossible
function noteRemove(n){undoable("Note supprimée",[n.id],()=>{tomb(n.id);data.notes=NT().filter(x=>x!==n)},{after:renderNotes,later:()=>{if(!noteFind(n.id)){npDropAll(n);nsPlain.delete(n.id)}}})}
$("noteDel").addEventListener("click",async()=>{if(!c2ok($("noteDel")))return;await noteFlush();const n=noteFind(noteOpenId);noteOpenId=null;if(!n){renderNotes();return}
  noteRemove(n)});
// v44.7 : « ⋯ » sur chaque note de la liste : la ranger ou la supprimer sans l'ouvrir (suppression annulable 5 s)
function noteActions(id){const n=noteFind(id);if(!n)return;const w=noteView(n);
  const t=w?(w.title&&w.title.trim()?w.title:String(w.body||"").trim().split("\n")[0]||(n.pdf&&n.pdf.name)||L("Nouvelle note")):L("Note secrète");
  const items=[];
  if(NF().length)items.push({l:"Ranger dans un dossier",fn:()=>openActions(L("Ranger dans"),nfChoices(noteDirOf(n),null,fid=>{if(fid)n.folder=fid;else delete n.folder;n.upd=Date.now();save();renderNotes();toast(fid?`${L("Rangée dans")} « ${nfOf(fid).name} »`:"Rangée dans Notes")}))});
  items.push({l:"Supprimer",danger:true,fn:()=>noteRemove(n)});
  openActions(t,items)}
// cadenas : rend la note secrète (ou la verrouille si elle l'est déjà), puis la ferme
$("noteLock").addEventListener("click",async()=>{
  const n=noteFind(noteOpenId);if(!n)return;dictStop();
  if(n.secret){await noteFlush();nsLock();toast("Note verrouillée");return}
  const plain={title:$("noteTitle").value,body:rtText($("noteBody")),html:rtClean($("noteBody").innerHTML)};
  if(!plain.title.trim()&&!plain.body.trim()){toast("Écris d'abord quelque chose");return}
  if(!(await nsUnlock()))return;
  await noteFlush();
  const e=await encJ(nsKey,plain);
  Object.assign(n,{secret:true,vid:nsVid,iv:e.iv,ct:e.ct,upd:Date.now()});delete n.title;delete n.body;delete n.html;
  save();nsLock();toast("Note secrète verrouillée");
});
$("noteUnsecret").addEventListener("click",async()=>{
  const n=noteFind(noteOpenId),v=noteView(n);if(!n||!v)return;await noteFlush();
  n.title=v.title||"";n.body=v.body||"";if(v.html)n.html=v.html;["secret","vid","iv","ct"].forEach(k=>delete n[k]);n.upd=Date.now();nsPlain.delete(n.id);
  save();renderNotes();toast("La note n'est plus secrète");
});
// --- photos dans les notes (v24) : n.photos = [{id, up}] ; l'image (réduite, JPEG) est gardée sur l'appareil (IndexedDB)
// et copiée dans l'espace privé Supabase (bucket « documents », dossier <uid>/notes/). Pas de photo dans une note secrète.
const npKey=id=>session.user.id+":np:"+id,npPath=id=>`${session.user.id}/notes/${id}.jpg`;
const npCache=new Map();let npBusy=new Set(),lbCur=null;
const dataToBlob=u=>fetch(u).then(r=>r.blob());
const blobToData=b=>new Promise((res,rej)=>{const f=new FileReader();f.onload=()=>res(f.result);f.onerror=rej;f.readAsDataURL(b)});
async function npGet(id){if(npCache.has(id))return npCache.get(id);let u=await idb.get(npKey(id));
  if(!u){try{const r=await stor("GET","authenticated/documents/"+npPath(id));u=await blobToData(new Blob([await r.arrayBuffer()],{type:"image/jpeg"}));idb.put(npKey(id),u).catch(()=>{})}catch(e){return null}}
  npCache.set(id,u);return u}
async function npUpload(n,p){if(p.up||npBusy.has(p.id))return;const u=await idb.get(npKey(p.id));if(!u)return;npBusy.add(p.id);
  try{const b=await dataToBlob(u);await stor("POST","documents/"+npPath(p.id),b,"image/jpeg"); // v32 : le stockage accepte les photos (plus de détour par le type PDF)
    p.up=true;save()}catch(e){}
  npBusy.delete(p.id)}
function notesPhotosPending(){if(!session)return;NT().forEach(n=>{(n.photos||[]).forEach(p=>{if(!p.up)npUpload(n,p)});if(n.pdf&&!n.pdf.up)pdfUpload(n)})}
function renderNotePhotos(n){const box=$("notePhotos");if(!box)return;const ps=(n&&n.photos)||[];box.hidden=!ps.length;
  if(shIsl("notePhotos")){try{const tk=renderNotePhotos.tk=(renderNotePhotos.tk||0)+1,got={};ps.forEach(p=>{if(npCache.has(p.id))got[p.id]=npCache.get(p.id)});
    const draw=()=>{if(tk===renderNotePhotos.tk)window.SCIslands.notePhotos(box,{photos:ps.map(p=>({id:p.id,u:got[p.id]})),i18n:agI18n()})};draw(); // v65 (#3)
    ps.forEach(async p=>{if(p.id in got)return;got[p.id]=(await npGet(p.id))||null;draw()});return}
    catch(e){reportErr("island notePhotos: "+(e&&e.message));try{window.SCIslands.unmount(box)}catch(_){}}}
  box.innerHTML=ps.map(p=>`<button type="button" class="np" data-np="${p.id}" aria-label="${L("Voir la photo")}"><span class="np-load"></span></button>`).join("");
  ps.forEach(async p=>{const u=await npGet(p.id),el=box.querySelector(`[data-np="${p.id}"]`);if(el)el.innerHTML=u?`<img src="${u}" alt="">`:`<span class="small muted">${L("Indisponible")}</span>`})}
$("notePhotoIn").addEventListener("change",async e=>{const files=[...e.target.files];e.target.value="";const n=noteFind(noteOpenId);if(!n||!files.length)return;
  if(n.secret){toast("Pas de photo dans une note secrète");return}
  n.photos=n.photos||[];
  for(const f of files.slice(0,10)){try{const u=await shrink(f,1600,.82),id=uid();await idb.put(npKey(id),u);npCache.set(id,u);const p={id,up:false};n.photos.push(p);n.upd=Date.now();save();renderNotePhotos(n);npUpload(n,p)}
    catch(ex){toast("Photo illisible")}}
  toast(files.length>1?"Photos ajoutées":"Photo ajoutée")});
// --- v44.7 : PDF de cours dans sid'note (demande de Sid) : une « note PDF » = {id, title, body (mes notes), pdf:{name, size, pages, up}}.
// Le fichier est gardé sur l'appareil (IndexedDB) et copié dans l'espace privé (documents/<uid>/notes/<id>.pdf, pas chiffré, comme les notes).
// Annotations : data.pdfAnns = [{id, note, page, t:"text"|"hl", x, y, w, h?, txt?, upd}] (positions en fraction de la page),
// fusionnées par id entre appareils comme les notes. Outils : Lire, Texte (zone de texte posée sur la page), Surligner (au doigt), Mes notes.
const pdfKey=id=>session.user.id+":npdf:"+id,pdfPath=id=>`${session.user.id}/notes/${id}.pdf`;
const PA=()=>data.pdfAnns||(data.pdfAnns=[]);
const pdfBusy=new Set();
async function pdfUpload(n){if(!n.pdf||n.pdf.up||pdfBusy.has(n.id))return;const b=await idb.get(pdfKey(n.id));if(!b)return;pdfBusy.add(n.id);
  try{await stor("POST","documents/"+pdfPath(n.id),b,"application/pdf");n.pdf.up=true;save()}catch(e){}pdfBusy.delete(n.id)}
async function pdfBlob(n){let b=await idb.get(pdfKey(n.id));if(b)return b;
  const r=await stor("GET","authenticated/documents/"+pdfPath(n.id));b=new Blob([await r.arrayBuffer()],{type:"application/pdf"});idb.put(pdfKey(n.id),b).catch(()=>{});return b}
$("pdfIn").addEventListener("change",async e=>{const files=[...e.target.files];e.target.value="";let k=0,last=null;
  for(const f of files.slice(0,10)){if(!/pdf$/i.test(f.type||f.name)){toast(`${f.name} : ${L("ce n'est pas un PDF")}`);continue}
    if(f.size>50*1024*1024){toast(`${f.name} : ${L("trop lourd (50 Mo maximum)")}`);continue}
    const id=uid(),n={id,title:f.name.replace(/\.pdf$/i,"").slice(0,120),body:"",createdAt:new Date().toISOString(),upd:Date.now(),pdf:{name:f.name.slice(0,120),size:f.size,up:false}};
    if(noteDir)n.folder=noteDir;
    try{await idb.put(pdfKey(id),f)}catch(ex){toast("Enregistrement impossible sur cet appareil");continue}
    NT().push(n);k++;last=n;pdfUpload(n)}
  if(!k)return;save();renderNotes();toast(k>1?`${k} ${L("PDF ajoutés")}`:L("PDF ajouté"));if(k===1&&last)pdfOpen(last.id)});
let pv={note:null,tok:0,tool:"read",io:null,draw:null,sel:null};
const pvAnns=(nid,pg)=>PA().filter(a=>a&&a.note===nid&&(pg===undefined||a.page===pg)&&!(data.del&&data.del[a.id]));
async function pdfOpen(id){const n=noteFind(id);if(!n||!n.pdf)return;const tok=++pv.tok;pv.note=n.id;pvTool("read");
  $("pvTitle").value=n.title||"";$("pvNoteTxt").value=n.body||"";$("pvNotes").hidden=true;$("pdfv").hidden=false;document.body.style.overflow="hidden";
  const body=$("pvBody");body.innerHTML=`<p class="muted pv-wait">${L("Ouverture…")}</p>`;
  let blob;try{blob=await pdfBlob(n)}catch(ex){if(tok===pv.tok)body.innerHTML=`<p class="muted pv-wait">${esc(ex instanceof TypeError?L("Pas de connexion internet"):L("PDF introuvable sur cet appareil et en ligne"))}</p>`;return}
  try{const lib=await loadPdfJs(),pdf=await lib.getDocument({data:new Uint8Array(await blob.arrayBuffer())}).promise;if(tok!==pv.tok)return;
    pv.pdf=pdf;body.innerHTML="";if(pv.io)pv.io.disconnect();
    pv.io=new IntersectionObserver(es=>es.forEach(en=>{const w=en.target;if(en.isIntersecting)pvRender(w,tok);else if(w._c&&Math.abs(en.boundingClientRect.top)>innerHeight*3){w._c.remove();w._c=null}}),{root:body,rootMargin:"120% 0px"});
    for(let i=1;i<=pdf.numPages;i++){if(tok!==pv.tok)return;const pg=await pdf.getPage(i),v=pg.getViewport({scale:1});
      const w=document.createElement("div");w.className="pv-page";w.dataset.pg=i;w.style.aspectRatio=`${v.width} / ${v.height}`;w.innerHTML=`<div class="pv-ov" data-pg="${i}"></div><span class="pv-num">${i}</span>`;
      body.appendChild(w);pvOverlay(w);pv.io.observe(w)}
    if(n.pdf.pages!==pdf.numPages){n.pdf.pages=pdf.numPages;save();renderNotes()}
  }catch(ex){if(tok===pv.tok)body.innerHTML=`<p class="muted pv-wait">${L("Ce PDF ne peut pas être affiché.")}</p>`}}
async function pvRender(w,tok){if(w._c||w._busy||!pv.pdf)return;w._busy=true;
  try{const pg=await pv.pdf.getPage(+w.dataset.pg),v0=pg.getViewport({scale:1}),W=w.clientWidth||600,dpr=Math.min(2,window.devicePixelRatio||1),vp=pg.getViewport({scale:W/v0.width*dpr});
    const c=document.createElement("canvas");c.width=vp.width;c.height=vp.height;await pg.render({canvasContext:c.getContext("2d"),viewport:vp}).promise;
    if(tok!==pv.tok)return;w.prepend(c);w._c=c}catch(e){}w._busy=false}
function pvClose(){pvFlushTxt();pv.tok++;pv.note=null;pv.pdf=null;if(pv.io)pv.io.disconnect();$("pdfv").hidden=true;
  if(window.SCIslands)document.querySelectorAll("#pvBody .pv-ov").forEach(ov=>{try{window.SCIslands.unmount(ov)}catch(_){}});$("pvBody").innerHTML="";document.body.style.overflow="";renderNotes()}
// annotations placées en fraction de la page (même rendu sur iPhone et sur PC). v45 : zones de texte déplaçables et
// redimensionnables (× pour supprimer), traits libres au stylo et au surligneur ({t:"ink", pts:[[x,y]…], c, w, hl}), gomme.
const pct=v=>(Math.round(v*10000)/100)+"%";
const PV_COL={hl:["#FFD400","#7CE07C","#6EC6FF","#FF8AD0","#FFA94D"],pen:["#1C1A17","#D62828","#1D4ED8","#2F7A3A","#7C3AED"]};
const pvPen=k=>{const u=(data.ui.pvPen=data.ui.pvPen||{});return u[k]=u[k]||{c:PV_COL[k][0],s:k==="hl"?4:3}};
const pvW=(k,s)=>k==="hl"?.008+s*.005:.0015+s*.0012; // épaisseur en fraction de la largeur de la page (réglage 1 à 10)
const pvRatio=w=>{const m=String(w.style.aspectRatio||"1 / 1.4").split("/").map(Number);return m[1]/m[0]||1.4};
const pvPath=(pts,r)=>pts.map((p,i)=>(i?"L":"M")+(p[0]*1000).toFixed(1)+" "+(p[1]*1000*r).toFixed(1)).join(" ")+(pts.length===1?" l0.1 0":"");
// v65 (#3) : calque dessiné par React (PdfView.tsx) ; la zone de texte qui a le focus est gardée, les autres reprennent le texte enregistré
const pvVM=(a,r)=>a.t==="ink"&&Array.isArray(a.pts)&&a.pts.length?{id:a.id,t:"ink",cls:a.hl?"ink-hl":"ink-pen",d:pvPath(a.pts,r),stroke:/^#[0-9a-f]{6}$/i.test(a.c||"")?a.c:"#1C1A17",sw:((a.w||.004)*1000).toFixed(1)}
  :a.t==="hl"?{id:a.id,t:"hl",style:{left:pct(a.x),top:pct(a.y),width:pct(a.w),height:pct(a.h)}}
  :a.t==="text"?{id:a.id,t:"text",on:pv.sel===a.id,style:{left:pct(a.x),top:pct(a.y),width:pct(a.w||.4),...(a.h?{height:pct(a.h)}:{})},txt:a.txt||""}:null;
function pvOverlay(w){const ov=w.querySelector(".pv-ov"),pg=+w.dataset.pg,act=document.activeElement,keep=act&&ov.contains(act)?act.closest("[data-ann]"):null,r=pvRatio(w);
  if(shIsl("pvOverlay")){try{window.SCIslands.pvOverlay(ov,{anns:pvAnns(pv.note,pg).map(a=>pvVM(a,r)).filter(Boolean),viewBox:`0 0 1000 ${(1000*r).toFixed(1)}`,grip:GRIP,i18n:agI18n()});
    ov.querySelectorAll(".pv-txt textarea").forEach(t=>{if(t!==act){const a=PA().find(x=>x.id===t.parentElement.dataset.ann),v=a&&a.txt||"";if(t.value!==v)t.value=v}pvGrow(t)});return}
    catch(e){reportErr("island pvOverlay: "+(e&&e.message));try{window.SCIslands.unmount(ov)}catch(_){}}}
  ov.querySelectorAll("[data-ann]").forEach(el=>{if(el!==keep)el.remove()});
  let svg=ov.querySelector("svg.pv-ink");if(!svg){ov.insertAdjacentHTML("afterbegin",`<svg class="pv-ink" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"></svg>`);svg=ov.querySelector("svg.pv-ink")}
  svg.setAttribute("viewBox",`0 0 1000 ${(1000*r).toFixed(1)}`);
  for(const a of pvAnns(pv.note,pg)){if(keep&&keep.dataset.ann===a.id)continue;
    if(a.t==="ink"&&Array.isArray(a.pts)&&a.pts.length)svg.insertAdjacentHTML("beforeend",`<path data-ann="${a.id}" class="${a.hl?"ink-hl":"ink-pen"}" d="${pvPath(a.pts,r)}" stroke="${esc(/^#[0-9a-f]{6}$/i.test(a.c||"")?a.c:"#1C1A17")}" stroke-width="${((a.w||.004)*1000).toFixed(1)}"/>`);
    else if(a.t==="hl")ov.insertAdjacentHTML("beforeend",`<button type="button" class="pv-hl" data-ann="${a.id}" style="left:${pct(a.x)};top:${pct(a.y)};width:${pct(a.w)};height:${pct(a.h)}" aria-label="${L("Surlignage")}"></button>`);
    else if(a.t==="text")ov.insertAdjacentHTML("beforeend",`<div class="pv-txt${pv.sel===a.id?" pv-on":""}" data-ann="${a.id}" style="left:${pct(a.x)};top:${pct(a.y)};width:${pct(a.w||.4)}${a.h?`;height:${pct(a.h)}`:""}"><textarea rows="1" class="notr" aria-label="${L("Texte sur le PDF")}" placeholder="${L("Écris ici…")}">${esc(a.txt||"")}</textarea><button type="button" class="pv-txt-x" data-pvdel="${a.id}" aria-label="${L("Supprimer ce texte")}">×</button><span class="pv-txt-mv" data-pvmv="${a.id}" title="${L("Déplacer")}" aria-hidden="true">${GRIP}</span><span class="pv-txt-rs" data-pvrs="${a.id}" title="${L("Agrandir ou rétrécir")}" aria-hidden="true"></span></div>`)}
  ov.querySelectorAll(".pv-txt textarea").forEach(pvGrow)}
const pvGrow=t=>{t.style.height="auto";const box=t.parentElement,h=box&&box.style.height?box.clientHeight:0;t.style.height=Math.max(t.scrollHeight,h)+"px"};
function pvRefresh(){if(!pv.note||$("pdfv").hidden)return;if(!noteFind(pv.note)){pvClose();return}document.querySelectorAll("#pvBody .pv-page").forEach(pvOverlay)}
const PV_HINT={text:"Touche la page à l'endroit où tu veux écrire. Tu restes en mode Texte jusqu'à ce que tu changes d'outil.",hl:"Fais glisser ton doigt (ou la souris) sur ce que tu veux surligner.",pen:"Écris ou dessine au doigt, au stylet ou à la souris.",erase:"Passe sur un trait, un surlignage ou une zone de texte pour l'effacer.",read:""};
function pvTool(t){if(t==="notes"){const op=$("pvNotes").hidden;$("pvNotes").hidden=!op;document.querySelector('[data-pvt="notes"]').setAttribute("aria-pressed",op);if(op&&matchMedia("(min-width:900px)").matches)$("pvNoteTxt").focus();return}
  pv.tool=t;$("pdfv").dataset.tool=t;document.querySelectorAll("[data-pvt]").forEach(b=>{if(b.dataset.pvt!=="notes")b.setAttribute("aria-pressed",b.dataset.pvt===t)});
  const h=$("pvHint");h.hidden=!PV_HINT[t];h.textContent=L(PV_HINT[t]||"");pvOpts()}
// couleurs et épaisseur du surligneur et du stylo (gardées sur l'appareil)
const pvDot=(k,st)=>({"--d":Math.round(pvW(k,st.s)*360)+"px","--sw":st.c,...(k==="hl"?{opacity:.55}:{})});
function pvOpts(){const o=$("pvOpts"),k=pv.tool==="hl"||pv.tool==="pen"?pv.tool:null;o.hidden=!k;if(!k)return;const st=pvPen(k);
  if(shIsl("pvOpts")){try{window.SCIslands.pvOpts(o,{cols:PV_COL[k],cur:st.c,size:st.s,dot:pvDot(k,st),i18n:agI18n()});const sz=$("pvSize");if(sz&&document.activeElement!==sz&&+sz.value!==st.s)sz.value=st.s;return}
    catch(e){reportErr("island pvOpts: "+(e&&e.message));try{window.SCIslands.unmount(o)}catch(_){}}}
  o.innerHTML=`<div class="pv-sw" role="group" aria-label="${L("Couleur")}">${PV_COL[k].map(c=>`<button type="button" data-pvc="${c}" style="--sw:${c}" aria-pressed="${st.c===c}" aria-label="${L("Couleur")} ${c}"></button>`).join("")}</div>
    <label class="pv-size"><span>${L("Épaisseur")}</span><input type="range" id="pvSize" min="1" max="10" step="1" value="${st.s}" aria-label="${L("Épaisseur")}"><i class="pv-dot" style="--d:${Math.round(pvW(k,st.s)*360)}px;--sw:${st.c}${k==="hl"?";opacity:.55":""}"></i></label>`}
$("pvOpts").addEventListener("click",e=>{const b=e.target.closest("[data-pvc]");if(!b)return;const k=pv.tool;if(!PV_COL[k])return;pvPen(k).c=b.dataset.pvc;saveUI();pvOpts()});
$("pvOpts").addEventListener("input",e=>{if(e.target.id!=="pvSize")return;const k=pv.tool;if(!PV_COL[k])return;pvPen(k).s=+e.target.value;saveUI();if(shIsl("pvOpts")){pvOpts();return}
  const d=$("pvOpts").querySelector(".pv-dot");if(d)d.style.setProperty("--d",Math.round(pvW(k,+e.target.value)*360)+"px")});
document.querySelector(".pv-tools").addEventListener("click",e=>{const b=e.target.closest("[data-pvt]");if(b)pvTool(b.dataset.pvt)});
$("pvNotesClose").addEventListener("click",()=>pvTool("notes"));
$("pvBack").addEventListener("click",pvClose);
$("pvMore").innerHTML=MORE;
$("pvMore").addEventListener("click",()=>{const n=noteFind(pv.note);if(!n)return;
  openActions(n.title||L("PDF"),[{l:"Ranger dans un dossier",fn:()=>openActions(L("Ranger dans"),nfChoices(noteDirOf(n),null,fid=>{if(fid)n.folder=fid;else delete n.folder;n.upd=Date.now();save();toast(fid?`${L("Rangée dans")} « ${nfOf(fid).name} »`:"Rangée dans Notes")}))},
    {l:"Supprimer ce PDF",danger:true,fn:()=>{const id=n.id;pvClose();undoable("PDF supprimé",[id],()=>{tomb(id);data.notes=NT().filter(x=>x!==n)},{after:renderNotes,later:()=>{if(!noteFind(id))npDropAll(n)}})}}])});
// titre et notes liées au PDF (texte simple, enregistré au fur et à mesure)
$("pvTitle").addEventListener("input",()=>{const n=noteFind(pv.note);if(!n)return;n.title=$("pvTitle").value.slice(0,120);n.upd=Date.now();msSaveSoon()});
$("pvNoteTxt").addEventListener("input",()=>{const n=noteFind(pv.note);if(!n)return;n.body=$("pvNoteTxt").value;n.html=rtFromText(n.body);n.upd=Date.now();msSaveSoon()});
// zones de texte : enregistrées pendant la saisie ; une zone laissée vide disparaît
let pvTxtT=null,pvTxtEl=null;
function pvFlushTxt(){clearTimeout(pvTxtT);const el=pvTxtEl;pvTxtEl=null;if(!el)return;const a=PA().find(x=>x.id===el.closest("[data-ann]").dataset.ann);if(!a)return;
  const v=el.value.slice(0,2000);if(a.txt!==v){a.txt=v;a.upd=Date.now();save()}}
$("pvBody").addEventListener("input",e=>{const ta=e.target.closest(".pv-txt textarea");if(!ta)return;pvGrow(ta);pvTxtEl=ta;clearTimeout(pvTxtT);pvTxtT=setTimeout(pvFlushTxt,500)});
$("pvBody").addEventListener("focusin",e=>{const t=e.target.closest(".pv-txt");if(t)pvSelect(t.dataset.ann)});
$("pvBody").addEventListener("focusout",e=>{const ta=e.target.closest(".pv-txt textarea");if(!ta)return;pvTxtEl=ta;pvFlushTxt();
  if(!ta.value.trim()){const id=ta.closest("[data-ann]").dataset.ann;setTimeout(()=>{if(document.activeElement===ta)return;const a=PA().find(x=>x.id===id);if(a&&!String(a.txt||"").trim()){tomb(id);data.pdfAnns=PA().filter(x=>x!==a);save();pvRefresh()}},150)}});
function pvSelect(id){pv.sel=id||null;if(shIsl("pvOverlay")){if(!$("pdfv").hidden)document.querySelectorAll("#pvBody .pv-page").forEach(pvOverlay);return}document.querySelectorAll("#pvBody .pv-txt").forEach(t=>t.classList.toggle("pv-on",t.dataset.ann===pv.sel))}
function pvDel(id,msg){const a=PA().find(x=>x.id===id);if(!a)return;if(pv.sel===id)pv.sel=null;undoable(msg,[id],()=>{tomb(id);data.pdfAnns=PA().filter(x=>x!==a)},{after:pvRefresh})}
const PV_DELMSG={text:"Texte supprimé",hl:"Surlignage supprimé",ink:"Trait supprimé"};
// les poignées des zones de texte ne prennent pas le focus (sinon la zone se ferme avant le clic)
$("pvBody").addEventListener("mousedown",e=>{if(e.target.closest(".pv-txt-x,.pv-txt-mv,.pv-txt-rs"))e.preventDefault()});
$("pvBody").addEventListener("click",e=>{
  const d=e.target.closest("[data-pvdel]");if(d){pvDel(d.dataset.pvdel,"Texte supprimé");return}
  if(e.target.closest(".pv-txt-mv,.pv-txt-rs"))return;
  if(pv.tool==="read"){const hl=e.target.closest(".pv-hl,path[data-ann]");
    if(hl){const a=PA().find(x=>x.id===hl.dataset.ann);if(!a)return;pv.sel=a.id;openActions(L(a.t==="hl"||a.hl?"Surlignage":"Trait"),[{l:a.t==="hl"||a.hl?"Supprimer le surlignage":"Supprimer le trait",danger:true,fn:()=>pvDel(a.id,PV_DELMSG[a.t==="ink"&&!a.hl?"ink":a.t==="ink"?"hl":a.t])}]);return}
    if(!e.target.closest(".pv-txt"))pvSelect(null);return}
  if(pv.tool!=="text"||e.target.closest(".pv-txt"))return;const ov=e.target.closest(".pv-ov");if(!ov)return;
  const r=ov.getBoundingClientRect(),x=Math.min(.75,Math.max(0,(e.clientX-r.left)/r.width)),y=Math.min(.97,Math.max(0,(e.clientY-r.top)/r.height));
  const a={id:uid(),note:pv.note,page:+ov.dataset.pg,t:"text",x,y,w:Math.min(.45,1-x),txt:"",upd:Date.now()};PA().push(a);save();pv.sel=a.id;pvOverlay(ov.closest(".pv-page"));
  const ta=ov.querySelector(`[data-ann="${a.id}"] textarea`);if(ta)ta.focus()}); // v45 : on reste en mode Texte
// déplacer / redimensionner une zone de texte (poignées ⠿ et coin bas droit)
$("pvBody").addEventListener("pointerdown",e=>{const h=e.target.closest("[data-pvmv],[data-pvrs]");if(!h)return;e.preventDefault();e.stopPropagation();
  const box=h.closest(".pv-txt"),ov=box.closest(".pv-ov"),a=PA().find(x=>x.id===box.dataset.ann);if(!a)return;pvSelect(a.id);
  const r=ov.getBoundingClientRect(),mv=!!h.dataset.pvmv,x0=e.clientX,y0=e.clientY,s={x:a.x,y:a.y,w:a.w||.4,h:a.h||box.offsetHeight/r.height};
  try{h.setPointerCapture(e.pointerId)}catch(_){}
  const move=ev=>{const dx=(ev.clientX-x0)/r.width,dy=(ev.clientY-y0)/r.height;
    if(mv){a.x=Math.min(1-s.w,Math.max(0,s.x+dx));a.y=Math.min(.98,Math.max(0,s.y+dy));box.style.left=pct(a.x);box.style.top=pct(a.y)}
    else{a.w=Math.min(1-a.x,Math.max(.08,s.w+dx));a.h=Math.min(1-a.y,Math.max(.025,s.h+dy));box.style.width=pct(a.w);box.style.height=pct(a.h);pvGrow(box.querySelector("textarea"))}};
  const up=()=>{h.removeEventListener("pointermove",move);h.removeEventListener("pointerup",up);h.removeEventListener("pointercancel",up);a.upd=Date.now();save()};
  h.addEventListener("pointermove",move);h.addEventListener("pointerup",up);h.addEventListener("pointercancel",up)},true);
// stylo, surligneur (trait libre) et gomme : on glisse sur la page (elle ne défile pas pendant ce temps)
const pvPt=(r,ev)=>[Math.min(1,Math.max(0,(ev.clientX-r.left)/r.width)),Math.min(1,Math.max(0,(ev.clientY-r.top)/r.height))];
$("pvBody").addEventListener("pointerdown",e=>{if(!["hl","pen","erase"].includes(pv.tool)||e.target.closest(".pv-txt"))return;const ov=e.target.closest(".pv-ov");if(!ov)return;e.preventDefault();
  const w=ov.closest(".pv-page"),r=ov.getBoundingClientRect(),rat=pvRatio(w);try{ov.setPointerCapture(e.pointerId)}catch(_){}
  if(pv.tool==="erase"){pv.draw={erase:true,ov,r,rat,hit:new Set()};pvErase(e);return}
  const k=pv.tool,st=pvPen(k),svg=ov.querySelector("svg.pv-ink"),el=document.createElementNS("http://www.w3.org/2000/svg","path");
  el.setAttribute("class",k==="hl"?"ink-hl":"ink-pen");el.setAttribute("stroke",st.c);el.setAttribute("stroke-width",(pvW(k,st.s)*1000).toFixed(1));svg.appendChild(el);
  pv.draw={ov,r,rat,el,k,c:st.c,w:pvW(k,st.s),pts:[pvPt(r,e)]};el.setAttribute("d",pvPath(pv.draw.pts,rat))});
function pvErase(ev){const d=pv.draw,[x,y]=pvPt(d.r,ev),pg=+d.ov.dataset.pg,rad=.018;
  for(const a of pvAnns(pv.note,pg)){if(d.hit.has(a.id))continue;let hit=false;
    if(a.t==="ink")hit=(a.pts||[]).some(p=>Math.hypot(p[0]-x,(p[1]-y)*d.rat)<rad+(a.w||0)/2);
    else if(a.t==="hl")hit=x>=a.x-rad&&x<=a.x+a.w+rad&&y>=a.y-rad&&y<=a.y+a.h+rad;
    else if(a.t==="text"){const el=d.ov.querySelector(`.pv-txt[data-ann="${a.id}"]`),hh=el?el.offsetHeight/d.r.height:(a.h||.04);hit=x>=a.x&&x<=a.x+(a.w||.4)&&y>=a.y&&y<=a.y+hh}
    if(hit){d.hit.add(a.id);d.ov.querySelectorAll(`[data-ann="${a.id}"]`).forEach(el=>el.classList.add("pv-gone"))}}}
$("pvBody").addEventListener("pointermove",e=>{const d=pv.draw;if(!d)return;if(d.erase){pvErase(e);return}
  const p=pvPt(d.r,e),l=d.pts[d.pts.length-1];if(Math.hypot(p[0]-l[0],(p[1]-l[1])*d.rat)<.003)return;d.pts.push(p);d.el.setAttribute("d",pvPath(d.pts,d.rat))});
const pvDrawEnd=()=>{const d=pv.draw;if(!d)return;pv.draw=null;
  if(d.erase){const ids=[...d.hit];if(!ids.length)return;const gone=PA().filter(a=>ids.includes(a.id));
    undoable(ids.length>1?"Éléments effacés":"Élément effacé",ids,()=>{ids.forEach(tomb);data.pdfAnns=PA().filter(a=>!gone.includes(a))},{after:pvRefresh});return}
  d.el.remove();if(d.pts.length>1200)d.pts=d.pts.filter((_,i)=>i%2===0);
  const r4=v=>Math.round(v*10000)/10000;
  PA().push({id:uid(),note:pv.note,page:+d.ov.dataset.pg,t:"ink",hl:d.k==="hl",c:d.c,w:r4(d.w),pts:d.pts.map(p=>[r4(p[0]),r4(p[1])]),upd:Date.now()});save();pvOverlay(d.ov.closest(".pv-page"))};
$("pvBody").addEventListener("pointerup",pvDrawEnd);$("pvBody").addEventListener("pointercancel",pvDrawEnd);
// clavier : Échap ferme ; Suppr / Retour arrière efface la zone de texte sélectionnée (vide ou pas en cours d'écriture)
addEventListener("keydown",e=>{if($("pdfv").hidden||!$("actSheet").hidden)return;
  if(e.key==="Escape"&&!e.target.closest(".pv-txt")){pvClose();return}
  if((e.key==="Delete"||e.key==="Backspace")&&pv.sel){const ta=e.target.closest&&e.target.closest(".pv-txt textarea");
    if(ta&&ta.value)return;e.preventDefault();const id=pv.sel,a=PA().find(x=>x.id===id);if(!a)return;if(ta)ta.blur();pvDel(id,PV_DELMSG[a.t==="ink"&&a.hl?"hl":a.t])}});
$("notePhotos").addEventListener("click",async e=>{const b=e.target.closest("[data-np]");if(!b)return;const u=await npGet(b.dataset.np);if(!u)return;
  lbCur=b.dataset.np;$("lbImg").src=u;$("lightbox").hidden=false;const d=$("lbDel");d.classList.remove("armed");d.textContent=L("Supprimer la photo")});
$("lbClose").addEventListener("click",()=>{$("lightbox").hidden=true;lbCur=null});
$("lightbox").addEventListener("click",e=>{if(e.target.id==="lightbox"){$("lightbox").hidden=true;lbCur=null}});
$("lbDel").addEventListener("click",e=>{const b=e.currentTarget,n=noteFind(noteOpenId);if(!n||!lbCur)return;
  if(!b.classList.contains("armed")){b.classList.add("armed");b.textContent=L("Confirmer la suppression");return}
  const id=lbCur;n.photos=(n.photos||[]).filter(p=>p.id!==id);n.upd=Date.now();save();idb.del(npKey(id));npCache.delete(id);stor("DELETE","documents/"+npPath(id)).catch(()=>{});
  $("lightbox").hidden=true;lbCur=null;renderNotePhotos(n);toast("Photo supprimée")});
const npDropAll=n=>{(n&&n.photos||[]).forEach(p=>{idb.del(npKey(p.id));npCache.delete(p.id);stor("DELETE","documents/"+npPath(p.id)).catch(()=>{})});
  if(n&&n.pdf){idb.del(pdfKey(n.id));stor("DELETE","documents/"+pdfPath(n.id)).catch(()=>{});(data.pdfAnns||[]).filter(a=>a.note===n.id).forEach(a=>tomb(a.id));data.pdfAnns=(data.pdfAnns||[]).filter(a=>a.note!==n.id);save()}};
async function nsLoad(){
  if(!nsKey)return;const k=nsKey,m=new Map();
  for(const n of NT()){if(!n.secret||n.vid!==nsVid)continue;const o=nsPlain.get(n.id);
    if(o&&o._iv===n.iv){m.set(n.id,o);continue}
    try{m.set(n.id,{...await decJ(k,n),_iv:n.iv})}catch(e){}}
  if(k===nsKey)nsPlain=m;
}
async function nsTry(code){
  try{const v=data.noteVault,key=await vOpen(v,code,"notes");nsKey=key;nsVid=v.id;await nsLoad();return true}
  catch(e){return false}
}
// ouvre les notes secrètes : crée le code la première fois, sinon le demande
async function nsUnlock(){
  if(nsKey)return true;
  if(!nsOn()){
    const code=await askPin({mode:"new",head:"Notes secrètes",sub:"Choisis le code de tes notes secrètes (5 chiffres). Il les ouvre sur cet appareil."});
    if(!code)return false;
    const mk=await mkNeed();if(!mk)return false;
    const n=await v2Make(mk,"sidnote-notes");data.noteVault=n.v;await mkWrap("notes",code,mk);
    nsKey=n.key;nsVid=n.v.id;nsPlain=new Map();save();toast("Code enregistré");return true}
  const v=data.noteVault;
  if(isV2(v)&&!mkHas("notes")){const code=await devSetup("notes","Notes secrètes");return !!code&&await nsTry(code)}
  let code=await askPin({mode:"unlock",ctx:"notes",head:"Notes secrètes",sub:"Entre le code de tes notes secrètes.",verify:nsTry,forgot:nsReset,rec:isV2(v)?null:v.rec,phrase:isV2(v)});
  if(code==="forgot"){code=await devSetup("notes","Notes secrètes",true);if(code&&!(await nsTry(code)))code=null}
  if(code&&nsKey&&!isV2(v)){const nk=await v2Upgrade("notes",code,nsKey);if(nk){nsKey=nk;nsVid=data.noteVault.id;await nsLoad()}}
  return !!code&&!!nsKey;
}
function nsLock(){
  if(notePend&&noteOpenId){const n=noteFind(noteOpenId);if(n&&n.secret)noteFlush()} // la dernière frappe est enregistrée (clé déjà capturée)
  nsKey=null;nsVid=null;nsPlain=new Map();renderNotes();
}
function nsReset(){
  NT().filter(n=>n.secret).forEach(n=>tomb(n.id));data.notes=NT().filter(n=>!n.secret);data.noteVault=null;
  nsKey=null;nsVid=null;nsPlain=new Map();save();renderNotes();toast("Notes secrètes effacées");
}

