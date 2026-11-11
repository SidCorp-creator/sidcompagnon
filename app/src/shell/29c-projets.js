/* ---------- séances Focus de Sid’Note ----------
   v82 (demande de Sid) : la rubrique Projets est retirée (écran, onglet, liens). Les données restent pour ne rien perdre :
   data.noteProjects (synchronisé, gardé dans les sauvegardes sans être affiché) et le champ project des notes et des séances Focus.
   Les notes restent dans Notes et les séances Focus dans l'historique de Focus. */
const noteProjects=()=>data.noteProjects||(data.noteProjects=[]);
const focusSessions=()=>data.focusSessions||(data.focusSessions=[]);

function recordFocusSession(id,startAt,workMs){
  if(workMs<=0||focusSessions().some(s=>s.id===id))return;
  focusSessions().push({id,startAt,workMs,upd:Date.now()});
}
