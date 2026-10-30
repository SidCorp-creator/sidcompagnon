/* ---------- v38 : connecteur Claude (fonction Edge « mcp ») ---------- */
// v45.2 : adresse sur le domaine de l'app (sidcompagnon.com/mcp/<clé>, relayée par Vercel vers la fonction Supabase, voir vercel.json) :
// Claude affiche l'icône du site de l'adresse. Les anciennes adresses …supabase.co/functions/v1/mcp/<clé> marchent toujours.
const MCP_BASE="https://sidcompagnon.com/mcp/";
// Une adresse secrète par personne : …/functions/v1/mcp/<clé>. Seule l'empreinte SHA-256 de la clé est gardée (table mcp_tokens) ;
// la clé n'est montrée qu'une fois. Retirer une adresse coupe aussitôt l'accès de Claude.
let mcpRows=[];
const hex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("");
async function mcpLoad(){const sec=$("mcpSec");if(!sec)return;sec.hidden=!session||isTrial();if(sec.hidden)return;
  try{mcpRows=await api("/rest/v1/mcp_tokens?select=hash,label,created_at,last_used&order=created_at",{token:await token()})||[]}catch(e){mcpRows=[]}
  const d=v=>v?new Date(v).toLocaleDateString(LANG==="fr"?"fr-BE":LANG==="nl"?"nl-BE":"en-GB",{day:"numeric",month:"short",year:"numeric"}):"";
  if(shIsl("mcpList")){try{window.SCIslands.mcpList($("mcpList"),{i18n:agI18n(),rows:mcpRows.map(r=>({hash:r.hash,created:d(r.created_at),used:r.last_used?d(r.last_used):""}))})}catch(e){reportErr("island mcpList: "+(e&&e.message))}}
  else $("mcpList").innerHTML=mcpRows.map(r=>`<div class="row mcp-it"><div class="grow"><b>${esc(L("Adresse du"))} ${esc(d(r.created_at))}</b><span class="small muted">${r.last_used?`${esc(L("Utilisée le"))} ${esc(d(r.last_used))}`:esc(L("Pas encore utilisée"))}</span></div><button type="button" class="mini" data-mcpdel="${esc(r.hash)}">${esc(L("Retirer"))}</button></div>`).join("");
  $("mcpNew").textContent=L(mcpRows.length?"Créer une nouvelle adresse":"Créer mon adresse pour Claude")}
// nouvelle adresse secrète : seule son empreinte part sur le serveur ; renvoie {url, hash}
async function mcpCreate(label){const key=b64e(crypto.getRandomValues(new Uint8Array(32))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
  const hash=hex(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(key)));
  await api("/rest/v1/mcp_tokens",{method:"POST",token:await token(),headers:{Prefer:"return=minimal"},body:{hash,user_id:session.user.id,label:String(label||"IA").slice(0,40)}});
  return {url:MCP_BASE+key,hash}}
$("mcpNew").addEventListener("click",async e=>{const b=e.currentTarget;if(b.disabled)return;b.disabled=true;
  try{const r=await mcpCreate("Claude");$("mcpUrl").textContent=r.url;$("mcpOut").hidden=false;await mcpLoad()}
  catch(ex){toast(ex instanceof TypeError?"Pas de connexion internet":"Création impossible pour l'instant")}
  b.disabled=false});
$("mcpCopy").addEventListener("click",async()=>{toast(await copyTxt($("mcpUrl").textContent)?"Adresse copiée":"Copie impossible : sélectionne-la et copie-la")});
$("mcpList").addEventListener("click",async e=>{const b=e.target.closest("[data-mcpdel]");if(!b)return;
  if(!b.dataset.armed){b.dataset.armed="1";b.textContent=L("Confirmer");return}
  try{await api("/rest/v1/mcp_tokens?hash=eq."+b.dataset.mcpdel,{method:"DELETE",token:await token()});toast("Adresse retirée : Claude n'a plus accès");$("mcpOut").hidden=true;mcpLoad()}
  catch(ex){toast("Impossible pour l'instant")}});
$("mcpSec").addEventListener("toggle",e=>{if(e.currentTarget.open)mcpLoad()});
