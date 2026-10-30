/* ---------- fenêtre de code à 5 chiffres (réutilisable) ---------- */
// askPin({mode:"new"}) → code choisi et confirmé ; askPin({mode:"unlock", verify}) → code vérifié ; null si annulé
let ps=null;
// v29 : dans Documents, le clavier s'affiche dans la page (comme pour les mots de passe), pas dans une fenêtre
const PS_PIN=document.querySelector("#pinSheet .pin");
function askPin(o){return new Promise(res=>{
  if(ps)psEnd(null);
  const host=data.ui.view==="docs"&&$("docPinHost");
  ps={...o,step:o.mode,buf:"",first:"",fails:0,wait:0,busy:false,resolve:res,host:host||null};
  if(!$("psPad").children.length&&shIsl("keypad")){try{window.SCIslands.keypad($("psPad"),{attr:"ps",del:agI18n().tr(L("Effacer"))})}catch(e){reportErr("island keypad: "+(e&&e.message))}} // v63 (#3) : clavier dessiné par React
  if(!$("psPad").children.length)$("psPad").innerHTML=[1,2,3,4,5,6,7,8,9].map(d=>`<button type="button" data-ps="${d}">${d}</button>`).join("")+
    `<button type="button" class="blank" tabindex="-1" aria-hidden="true"></button><button type="button" data-ps="0">0</button><button type="button" class="del" data-ps="del">${L("Effacer")}</button>`;
  $("psErr").textContent="";psRender();
  if(host){host.appendChild(PS_PIN);host.hidden=false;$("docLocked").hidden=true}else $("pinSheet").hidden=false})}
function psRender(){
  if(!ps)return;
  const T={new:["Choisis ton code",ps.sub],confirm:["Confirme ton code","Tape à nouveau les 5 chiffres."],unlock:["Entre ton code",ps.sub]}[ps.step];
  $("psHead").textContent=L(ps.head||"Code");$("psTitle").textContent=L(T[0]);$("psSub").textContent=L(T[1]||"");
  $("psForgot").hidden=!(ps.step==="unlock"&&(ps.forgot||ps.rec||ps.phrase));
  $("psBio").hidden=!(ps.step==="unlock"&&ps.ctx&&bioHas(ps.ctx));$("psBio").textContent=bioUse();
  if(ps.step==="unlock"&&ps.ctx&&!ps.autoDone){ps.autoDone=true;bioAuto(ps.ctx,()=>$("psBio").click())}
  [...$("psDots").children].forEach((d,i)=>d.classList.toggle("on",i<ps.buf.length));
}
function psFail(msg){const d=$("psDots");$("psErr").textContent=L(msg);d.classList.remove("shake");void d.offsetWidth;d.classList.add("shake");if(navigator.vibrate)navigator.vibrate(60);ps.buf="";psRender()}
function psEnd(v){if(!ps)return;const r=ps.resolve,host=ps.host;ps=null;$("pinSheet").hidden=true;
  if(host){host.hidden=true;$("pinSheet").querySelector(".sheet").appendChild(PS_PIN);renderDocLock()}const f=$("psForgot");delete f.dataset.armed;f.textContent=L("Code oublié ?");r(v)}
async function psDone(){
  const code=ps.buf;
  if(ps.step==="new"){ps.first=code;ps.buf="";ps.step="confirm";$("psErr").textContent="";psRender();return}
  if(ps.step==="confirm"){if(code!==ps.first){ps.first="";ps.step="new";psFail("Les deux codes ne sont pas identiques. Recommence.");return}psEnd(code);return}
  if(Date.now()<ps.wait){psFail("Trop d'essais. Attends 30 secondes.");return}
  ps.busy=true;$("psErr").textContent="";const ok=await ps.verify(code);if(!ps)return;ps.busy=false;
  if(ok){const cx=ps.ctx;psEnd(code);if(cx)bioOffer(cx,code);return}
  ps.fails++;if(ps.fails>=5){ps.fails=0;ps.wait=Date.now()+30000;psFail("Trop d'essais. Attends 30 secondes.")}else psFail("Code incorrect.");
}
function psPress(k){
  if(!ps||ps.busy)return;
  if(k==="del"){ps.buf=ps.buf.slice(0,-1);psRender();return}
  if(ps.buf.length>=PIN_LEN)return;ps.buf+=k;psRender();if(ps.buf.length===PIN_LEN)setTimeout(psDone,120);
}
padTap($("psPad"),"ps",psPress);
$("psClose").addEventListener("click",()=>psEnd(null));
$("pinSheet").addEventListener("click",e=>{if(e.target.id==="pinSheet")psEnd(null)});
document.addEventListener("keydown",e=>{if(!ps||(!ps.host&&$("pinSheet").hidden))return;if(/^[0-9]$/.test(e.key))psPress(e.key);else if(e.key==="Backspace")psPress("del");else if(e.key==="Escape")psEnd(null)});
$("psForgot").addEventListener("click",async e=>{const b=e.currentTarget;if(!ps)return;
  if(ps.phrase){psEnd("forgot");return} // coffre renforcé : on rouvre avec la phrase secrète (devSetup)
  if(ps.rec){const cur=ps,code=await recRecover({rec:cur.rec});if(code&&ps===cur&&await cur.verify(code))psEnd(code);return}
  if(!b.dataset.armed){b.dataset.armed="1";b.textContent=L(ps.forgotText||"La récupération n'était pas activée. Effacer toutes les notes secrètes et choisir un nouveau code ? Touche encore pour confirmer.");return}
  const f=ps.forgot;psEnd(null);f()});
