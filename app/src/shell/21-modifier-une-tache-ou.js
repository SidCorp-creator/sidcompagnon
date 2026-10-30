/* ---------- modifier une tâche ou une date ---------- */
let editing=null;
function openEdit(ref){
  const [kind,id]=ref.split(":");
  const item=(kind==="todo"?data.todos:kind==="doc"?docsArr():data.tasks).find(x=>x.id===id);if(!item)return;
  editing={kind,item};
  $("sheetTitle").textContent=L(kind==="todo"?"Modifier la tâche":kind==="doc"?"Renommer le document":"Modifier l'activité");
  $("eTitle").value=item.title;$("eTask").hidden=kind!=="task";$("eTodoWrap").hidden=kind!=="todo";
  $("eDocWrap").hidden=kind!=="doc";
  if(kind==="doc")$("eDocFolder").innerHTML=`<option value="">${L("Aucun classeur")}</option>`+DF().map(f=>`<option value="${f.id}" ${item.folder===f.id?"selected":""}>${f.locked?L("Verrouillé")+" · ":""}${esc(f.name)}</option>`).join("");
  if(kind==="todo")$("eTodoCat").innerHTML=`<option value="">${L("Sans catégorie")}</option>`+TC().map(c=>`<option value="${c.id}" ${item.cat===c.id?"selected":""}>${esc(c.name)}</option>`).join("");
  if(kind==="task"){$("eDate").value=item.date;$("eEnd").value=item.end||"";$("eTime").value=item.time||"";$("eTimeEnd").value=item.timeEnd||"";$("eCat").value=item.cat||"";remSel.e=remOf(item);remCustom.e=false;renderRem("e")}
  const d=$("eDelete");d.classList.remove("armed");d.textContent="Supprimer";
  $("sheet").hidden=false;setTimeout(()=>$("eTitle").focus(),50);
}
function closeEdit(){$("sheet").hidden=true;editing=null}
document.addEventListener("click",e=>{const b=e.target.closest("[data-edit]");if(b){e.stopPropagation();openEdit(b.dataset.edit)}},true);
$("sheetClose").addEventListener("click",closeEdit);
$("sheet").addEventListener("click",e=>{if(e.target.id==="sheet")closeEdit()});
$("editForm").addEventListener("submit",e=>{
  e.preventDefault();if(!editing)return;
  const title=$("eTitle").value.trim();if(!title){toast("Le titre ne peut pas être vide");return}
  const it=editing.item;it.title=title;
  if(editing.kind==="todo"){const c=$("eTodoCat").value;if(c&&catOf(c)){if(it.cat!==c)delete it.ord;it.cat=c}else delete it.cat}
  if(editing.kind==="doc"){it.mod=Date.now();const f=$("eDocFolder").value;if(f&&DF().some(x=>x.id===f))it.folder=f;else delete it.folder}
  if(editing.kind==="task"){
    if(!$("eDate").value){toast("Choisis une date");return}
    it.date=$("eDate").value;
    if($("eEnd").value&&$("eEnd").value>it.date)it.end=$("eEnd").value;else delete it.end;
    if($("eTime").value)it.time=$("eTime").value;else delete it.time;
    if(it.time&&$("eTimeEnd").value){if($("eTimeEnd").value<=it.time){toast("L'heure de fin doit être après l'heure de début");return}it.timeEnd=$("eTimeEnd").value}else delete it.timeEnd;
    it.cat=ensureType($("eCat").value);remApply(it,"e");
  }
  save();closeEdit();renderTodos();renderPlan();renderTypes();renderDocs();toast("Modifié");
});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("sheet").hidden)closeEdit()});
$("eDelete").addEventListener("click",e=>{
  const b=e.currentTarget;if(!editing)return;
  const {kind,item}=editing;
  if(kind==="doc"){closeEdit();docDelete(item);return}
  closeEdit();if(kind==="todo")todoDel(item.id);else taskDel(item.id);
});
