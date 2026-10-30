/* ---------- apparence : couleur et thème ---------- */
// v29 : ambiances (couleur d'accent de toute l'app) ; [nom, accent clair, fond clair, accent sombre, fond sombre]
const PALETTES={or:["Noir & or","#9C7A3C","#F4F4F2","#C9B48A","#0E0F11"],saphir:["Saphir","#2F5DA8","#F3F5F9","#8FB3EA","#0D1017"],
  emeraude:["Émeraude","#2F7A5B","#F2F5F3","#86C6A4","#0C110F"],bordeaux:["Bordeaux","#9B3550","#F7F3F4","#E0A3B4","#120D0F"],platine:["Platine","#55585F","#F4F4F4","#C9CCD3","#0F1012"]};
function applyLook(){
  const p=(session&&data.prefs)||{},look=ls.get("sidnote-look")||{};
  // v42 : direction « Éditorial de précision » : clair ivoire ou graphite ; les anciennes ambiances ne sont plus appliquées (le choix reste dans les données)
  const pal=PALETTES[p.palette||look.palette]?(p.palette||look.palette):"or";
  document.documentElement.removeAttribute("data-palette");document.documentElement.dataset.ds="edito";
  // v45 : sombre par défaut pour tout le monde (avant : clair) ; seul un choix fait par la personne (prefs.theme) est gardé
  const theme=p.theme||(session?"dark":look.theme)||"dark";
  if(theme==="auto")document.documentElement.removeAttribute("data-theme");else document.documentElement.setAttribute("data-theme",theme);
  const dark=theme==="dark"||(theme==="auto"&&matchMedia("(prefers-color-scheme: dark)").matches);
  document.querySelectorAll('meta[name="theme-color"]').forEach(m=>m.setAttribute("content",dark?"#111214":"#F4F0E8"));
  ls.set("sidnote-look",{theme,palette:pal}); // pour l'écran de connexion
}
function renderLook(){
  const th=data.prefs.theme||"dark",dark=document.documentElement.dataset.theme==="dark"||(!document.documentElement.dataset.theme&&matchMedia("(prefers-color-scheme: dark)").matches);
  document.querySelectorAll("#themeSel button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.theme===th));
  const pal=data.prefs.palette||"or";
  $("palSel").innerHTML=Object.entries(PALETTES).map(([k,a])=>`<button type="button" class="pal" data-pal="${k}" aria-pressed="${k===pal}"><span class="pal-dot" style="--pa:${dark?a[3]:a[1]};--pb:${dark?a[4]:a[2]}">${k===pal?CHECK:""}</span><span class="pal-n">${L(a[0])}</span></button>`).join("");
}
$("palSel").addEventListener("click",e=>{const b=e.target.closest("[data-pal]");if(!b)return;data.prefs.palette=b.dataset.pal;save();applyLook();renderLook()});
$("themeSel").addEventListener("click",e=>{const b=e.target.closest("[data-theme]");if(!b)return;data.prefs.theme=b.dataset.theme;save();applyLook();renderLook()});
applyLook();
// sections des réglages : on se souvient de celles qui sont ouvertes (sur cet appareil)
// v39 : les sections de Réglages s'ouvrent fermées à chaque lancement (demande de Sid : « quand je reviens, tout est fermé »)
data.ui.setOpen={};