/* ---------- Types d'événement ---------- */
function renderTypes(){
  const cnt=n=>data.tasks.filter(t=>norm(t.cat)===norm(n)).length;
  if(shIsl("typesCard")){try{window.SCIslands.typesCard($("typesCard"),{i18n:agI18n(),types:data.types.map(t=>({name:t.name,c:t.c,n:cnt(t.name)}))});return}catch(e){reportErr("island typesCard: "+(e&&e.message))}}
  $("typesCard").innerHTML=data.types.map((t,i)=>`<div class="row">
      <button class="swatch" data-tcol="${i}" style="background:var(${t.c})" aria-label="Changer la couleur de ${esc(t.name)}"></button>
      <div class="grow">${esc(t.name)} <span class="small muted">· ${cnt(t.name)}</span></div>
      <button class="x" data-tydel="${i}" aria-label="Supprimer ${esc(t.name)}">×</button></div>`).join("")+
    `<form class="row" id="typeForm"><input id="typeIn" placeholder="Nouveau type, ex. Examen" aria-label="Nouveau type" autocomplete="off"><button class="btn" type="submit">Ajouter</button></form>`;
}
$("typesCard").addEventListener("click",e=>{
  const b=e.target.closest("button");if(!b)return;
  if(b.dataset.tcol){const t=data.types[+b.dataset.tcol];t.c=PALETTE[(PALETTE.indexOf(t.c)+1)%PALETTE.length];save();renderTypes();renderPlan()}
  else if(b.dataset.tydel){armDelete(b,()=>{const t=data.types[+b.dataset.tydel];
    data.tasks.forEach(x=>{if(norm(x.cat)===norm(t.name))x.cat=""});
    data.types.splice(+b.dataset.tydel,1);save();renderTypes();renderPlan();toast(`Type « ${t.name} » supprimé`)})}
});
$("typesCard").addEventListener("submit",e=>{e.preventDefault();const v=$("typeIn").value.trim();if(!v)return;
  if(typeOf(v)){toast("Ce type existe déjà");return}
  ensureType(v);$("typeIn").value="";save();renderTypes();renderPlan();toast("Type ajouté")});
