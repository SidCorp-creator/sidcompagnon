/* ---------- claviers de code : appui instantané, sans zoom au double appui ---------- */
// Sur iPhone, deux appuis rapides sur le même chiffre déclenchent le zoom : on gère le toucher nous-mêmes
// (touchend + preventDefault annule le zoom et le clic simulé), la souris passe par click.
function padTap(pad,key,press){
  pad.addEventListener("touchend",e=>{const b=e.target.closest(`[data-${key}]`);if(!b)return;e.preventDefault();press(b.dataset[key])},{passive:false});
  pad.addEventListener("click",e=>{const b=e.target.closest(`[data-${key}]`);if(b)press(b.dataset[key])});
}
