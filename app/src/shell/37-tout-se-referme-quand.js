/* ---------- v39 : tout se referme quand on revient (lancement, ou retour après 10 min ailleurs) ---------- */
function closeAll(){
  document.querySelectorAll(".sheet-bg:not([hidden])").forEach(sb=>{const x=sb.querySelector(".sheet-head .x,[data-esc]");if(x)x.click();else sb.hidden=true});
  ["viewer","lightbox"].forEach(id=>{const v=$(id);if(v&&!v.hidden){const c=v.querySelector("#vwClose,#lbClose,.x");if(c)c.click();else v.hidden=true}});
  document.querySelectorAll("details.setsec[open],details[open]").forEach(d=>d.open=false);
  ["nfForm","catForm"].forEach(id=>{const f=$(id);if(f)f.hidden=true});
  if(noteOpenId)closeNote();noteDir=null;if(typeof qOpen!=="undefined")qOpen=false;
  if(calMode==="day"){calMode="month";renderCal()}
  if(typeof syncScrollLock==="function")syncScrollLock()}
let awayAt=0;document.addEventListener("visibilitychange",()=>{if(document.hidden){awayAt=Date.now();return}
  if(awayAt&&Date.now()-awayAt>10*60000&&session)closeAll();awayAt=0});
