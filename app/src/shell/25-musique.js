/* ---------- musique (Spotify) ---------- */
const SPOT_DEFAULT="playlist/37i9dQZF1DWZeKCadgRdKQ"; // Deep Focus
let spotShown=null;
function parseSpot(v){
  v=String(v||"").trim();
  let m=v.match(/open\.spotify\.com\/(?:intl-[a-z-]+\/)?(?:embed\/)?(playlist|album|track|artist|show|episode)\/([A-Za-z0-9]+)/);
  if(!m)m=v.match(/^spotify:(playlist|album|track|artist|show|episode):([A-Za-z0-9]+)$/);
  return m?`${m[1]}/${m[2]}`:null;
}
// v43 (RGPD / cookies) : le lecteur Spotify est un contenu tiers (Spotify reçoit l'adresse IP et peut déposer ses cookies).
// Il n'est chargé qu'après un accord donné sur cet appareil (data.ui.spotOk), retirable à tout moment.
function renderSpotify(){
  const ref=(data.prefs&&data.prefs.spotify)||SPOT_DEFAULT;
  $("spotOpen").href=`https://open.spotify.com/${ref}`;$("spotName").textContent=ref===SPOT_DEFAULT?"Playlist par défaut : Deep Focus":"Ta musique";
  if(shIsl("spotEmbed")){try{if(data.ui.spotOk&&spotShown===ref)return;spotShown=data.ui.spotOk?ref:null;
    window.SCIslands.spotEmbed($("spotEmbed"),{ok:!!data.ui.spotOk,src:`https://open.spotify.com/embed/${ref}?utm_source=generator`,i18n:agI18n()});return}catch(e){reportErr("island spotEmbed: "+(e&&e.message));try{window.SCIslands.unmount($("spotEmbed"))}catch(_){}}}
  if(!data.ui.spotOk){spotShown=null;$("spotEmbed").innerHTML=`<div class="spot-gate"><p class="small">${L("Le lecteur est fourni par Spotify. En le chargeant, Spotify reçoit ton adresse IP et peut déposer ses propres cookies sur cet appareil.")} <button type="button" class="linkbtn" data-openlegal="cookies">${L("En savoir plus")}</button></p><button type="button" class="btn" data-spotok="1">${L("Charger le lecteur Spotify")}</button></div>`;return}
  if(spotShown===ref)return;spotShown=ref;
  $("spotEmbed").innerHTML=`<div class="small spot-off"><button type="button" class="linkbtn" data-spotno="1">${L("Ne plus charger Spotify sur cet appareil")}</button></div><iframe title="Lecteur Spotify" src="https://open.spotify.com/embed/${ref}?utm_source=generator" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`;
}
$("spotEmbed").addEventListener("click",e=>{if(e.target.closest("[data-spotok]")){data.ui.spotOk=Date.now();saveUI();renderSpotify()}
  else if(e.target.closest("[data-spotno]")){delete data.ui.spotOk;saveUI();renderSpotify();toast("Spotify n'est plus chargé")}});
$("spotForm").addEventListener("submit",e=>{
  e.preventDefault();const v=$("spotIn").value.trim();
  if(!v){data.prefs.spotify=null;save();spotShown=null;renderSpotify();toast("Playlist par défaut");return}
  const ref=parseSpot(v);
  if(!ref){toast("Ce lien Spotify n'est pas reconnu. Copie le lien depuis Spotify > Partager.");return}
  data.prefs.spotify=ref;save();$("spotIn").value="";renderSpotify();toast("Musique mise à jour");
});
