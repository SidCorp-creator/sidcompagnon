/* ---------- projets Sid’Note ---------- */
const noteProjects=()=>data.noteProjects||(data.noteProjects=[]);
const focusSessions=()=>data.focusSessions||(data.focusSessions=[]);
let noteProjectId=null;

function recordFocusSession(id,startAt,workMs){
  if(workMs<=0||focusSessions().some(s=>s.id===id))return;
  focusSessions().push({id,startAt,workMs,upd:Date.now()});
  if(data.ui.view==="projects")renderNoteProjects();
}

function projectChoices(selected,onSelect){
  const choices=noteProjects().filter(p=>p.id!==selected).map(p=>({l:p.name,fn:()=>onSelect(p.id)}));
  if(selected)choices.unshift({l:"Sans projet",fn:()=>onSelect(null)});
  return choices;
}

function renderNoteProjects(){
  const projects=noteProjects(),current=projects.find(p=>p.id===noteProjectId);
  const list=$("projectList");
  $("projectBack").hidden=!current;
  $("projectForm").hidden=!!current;
  if(!current){
    list.innerHTML=projects.map(p=>`<button class="row grow project-open" type="button" data-project="${esc(p.id)}"><b class="notr">${esc(p.name)}</b></button>`).join("")
      ||`<p class="empty">${L("Aucun projet")}</p>`;
    const free=focusSessions().filter(s=>!projects.some(p=>p.id===s.project));
    list.insertAdjacentHTML("beforeend",projectFocusRows(free,"Séances Focus sans projet"));
    return;
  }
  const notes=NT().filter(n=>n.project===current.id);
  list.innerHTML=`<div class="row"><h2 class="grow notr">${esc(current.name)}</h2><button type="button" class="mini" id="projectDelete">${L("Supprimer le projet")}</button></div>
    <h3>${L("Notes")}</h3>`+notes.map(n=>{
    const view=noteView(n);
    const title=view?(view.title||n.pdf?.name||view.body?.split("\n")[0]||L("Nouvelle note")):L("Note secrète");
    return `<div class="row"><button type="button" class="btn ghost notr grow" data-project-note="${esc(n.id)}">${esc(title)}</button>
      <button type="button" class="mini" data-project-note-move="${esc(n.id)}">${L("Changer de projet")}</button></div>`;
  }).join("")+projectFocusRows(focusSessions().filter(s=>s.project===current.id),"Séances Focus");
}

function projectFocusRows(sessions,title){
  if(!sessions.length)return "";
  return `<h3>${L(title)}</h3>`+[...sessions].sort((a,b)=>b.startAt-a.startAt).map(s=>
    `<div class="row"><span class="grow">${esc(fmtDay(s.startAt))} · ${esc(hm(s.workMs/60000))}</span>
      <button type="button" class="mini" data-project-session="${esc(s.id)}">${L("Changer de projet")}</button></div>`).join("");
}

function moveNoteToProject(note){
  const choices=projectChoices(note.project,id=>{
    note.project=id;note.upd=Date.now();save();
    if(data.ui.view==="projects")renderNoteProjects();
  });
  if(choices.length)openActions(L("Changer de projet"),choices);
}

$("projectForm").addEventListener("submit",e=>{
  e.preventDefault();
  const input=$("projectName"),name=input.value.trim();
  if(!name)return;
  const project={id:uid(),name,upd:Date.now()};
  noteProjects().push(project);noteProjectId=project.id;input.value="";
  save();renderNoteProjects();
});
$("projectBack").addEventListener("click",()=>{noteProjectId=null;renderNoteProjects()});
$("projectList").addEventListener("click",async e=>{
  const button=e.target.closest("button");
  if(!button)return;
  if(button.dataset.project){noteProjectId=button.dataset.project;renderNoteProjects();return}
  const n=noteFind(button.dataset.projectNote||button.dataset.projectNoteMove);
  if(n){
    if(button.dataset.projectNoteMove){moveNoteToProject(n);return}
    if(n.secret&&!noteView(n)){if(!await nsUnlock())return;await nsLoad();if(!noteView(n))return}
    show("notes");if(n.pdf)pdfOpen(n.id);else openNote(n.id);
    return;
  }
  if(button.id==="projectDelete"){
    if(!c2ok(button))return;
    const id=noteProjectId;
    tomb(id);data.noteProjects=noteProjects().filter(p=>p.id!==id);
    for(const item of [...NT(),...focusSessions()])if(item.project===id){item.project=null;item.upd=Date.now()}
    noteProjectId=null;save();renderNoteProjects();return;
  }
  const focus=focusSessions().find(s=>s.id===button.dataset.projectSession);
  if(!focus)return;
  const choices=projectChoices(focus.project,id=>{
    focus.project=id;focus.upd=Date.now();save();renderNoteProjects();
  });
  if(choices.length)openActions(L("Changer de projet"),choices);
});
