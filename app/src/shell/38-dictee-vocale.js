/* ---------- dictée vocale ---------- */
// Reconnaissance vocale du navigateur (Safari iOS 14.5+). Sinon, le micro du clavier de l'iPhone marche toujours.
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
let dict=null;
function dictStop(){if(dict){try{dict.rec.stop()}catch(e){}dict.btn.classList.remove("on");dict=null}}
function dictate(btn,field,onChange){
  if(dict){const same=dict.btn===btn;dictStop();if(same)return}
  if(!SR){toast("Dictée indisponible ici : touche le micro du clavier de ton smartphone.");field.focus();return}
  const rec=new SR();rec.lang=LANG==="en"?"en-US":LANG==="nl"?"nl-NL":"fr-FR";rec.continuous=true;rec.interimResults=true;
  // le texte dicté s'insère à l'endroit du curseur
  const start=field.selectionStart??field.value.length,before=field.value.slice(0,start),after=field.value.slice(field.selectionEnd??start);
  const sep=before&&!/\s$/.test(before)?" ":"";let finals="";
  rec.onresult=ev=>{let interim="";for(let i=ev.resultIndex;i<ev.results.length;i++){const r=ev.results[i];if(r.isFinal)finals+=r[0].transcript;else interim+=r[0].transcript}
    field.value=before+sep+(finals+interim).trimStart()+after;onChange&&onChange()};
  rec.onerror=ev=>{if(ev.error==="not-allowed"||ev.error==="service-not-allowed")toast("Micro refusé : autorise-le dans les réglages de ton smartphone.");else if(ev.error!=="aborted"&&ev.error!=="no-speech")toast("Dictée interrompue")};
  rec.onend=()=>{if(dict&&dict.rec===rec){btn.classList.remove("on");dict=null}};
  try{rec.start();dict={rec,btn};btn.classList.add("on");toast("Parle, je t'écoute…")}catch(e){toast("Dictée indisponible ici : touche le micro du clavier de ton smartphone.")}
}
$("noteMic").addEventListener("click",e=>{const el=$("noteBody"),btn=e.currentTarget;if(dict){dictate(btn,null);return}
  // le texte dicté arrive dans un petit repère posé à l'endroit du curseur (l'éditeur n'est pas un champ texte)
  el.focus();const sel=getSelection();let r=sel.rangeCount&&el.contains(sel.anchorNode)?sel.getRangeAt(0):null;
  if(!r){r=document.createRange();r.selectNodeContents(el);r.collapse(false)}
  const sp=document.createElement("span");sp.className="dict-tmp";r.deleteContents();r.insertNode(sp);
  const field={get value(){return sp.textContent},set value(x){sp.textContent=x},selectionStart:0,selectionEnd:0,focus(){el.focus()}};
  dictate(btn,field,()=>{noteInput()});
  // v44.7 : le bouton est gardé dans « btn » (e.currentTarget est vide après le clic : le repère était retiré au bout de 0,5 s et la dictée se perdait)
  const stopWatch=setInterval(()=>{if(!dict||dict.btn!==btn){clearInterval(stopWatch);if(sp.isConnected)sp.replaceWith(...sp.childNodes);noteInput()}},500)});
// --- barre de mise en forme ---
function rtBlock(){const s=getSelection();let n=s.rangeCount?s.anchorNode:null;while(n&&n!==$("noteBody")){if(n.nodeType===1&&/^(H2|H3|BLOCKQUOTE|LI|DIV|P)$/.test(n.tagName))return n;n=n.parentNode}return null}
function rtCmd(k){const el=$("noteBody");el.focus();const ex=(c,v)=>document.execCommand(c,false,v===undefined?null:v);
  const b=rtBlock(),tag=b&&b.tagName;
  if(k==="h2"||k==="h3")ex("formatBlock",tag===k.toUpperCase()?"div":k);
  else if(k==="p")ex("formatBlock","div");
  else if(/^(hl|tc):/.test(k)){const[t,v]=k.split(":");rtWrap(t==="hl"?"mark":"span",t==="hl"?"data-hl":"data-tc",v==="none"?"":v)}
  else if(k==="link"){const s=getSelection();if(!s.rangeCount||s.isCollapsed){toast("Sélectionne d'abord du texte");return}
    const r=s.getRangeAt(0).cloneRange(),u=prompt(L("Adresse du lien (https://…)"),"https://");if(!u||!/^https?:\/\/\S+$/i.test(u.trim())){if(u)toast("Adresse non valable");return}
    el.focus();s.removeAllRanges();s.addRange(r);ex("createLink",u.trim())}
  else if(k==="date")ex("insertText",new Date().toLocaleDateString(LANG==="fr"?"fr-BE":LANG==="nl"?"nl-BE":"en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"}));
  else if(k==="quote")ex("formatBlock",b&&b.closest("blockquote")?"div":"blockquote");
  else if(k==="ul"||k==="ol")ex(k==="ul"?"insertUnorderedList":"insertOrderedList");
  else if(k==="chk"){const ul0=b&&b.closest("ul");if(ul0&&ul0.classList.contains("chk")){ul0.classList.remove("chk");ex("insertUnorderedList")}
    else{if(!ul0)ex("insertUnorderedList");const s=getSelection(),n=s.anchorNode&&(s.anchorNode.nodeType===1?s.anchorNode:s.anchorNode.parentNode),ul=n&&n.closest&&n.closest("ul");
      if(ul){ul.className="chk";ul.querySelectorAll(":scope>li").forEach(li=>{if(!li.hasAttribute("data-c"))li.setAttribute("data-c","0")})}}}
  else if(k==="hr")ex("insertHorizontalRule");
  else if(k==="mark"){const s=getSelection();const n=s.anchorNode&&(s.anchorNode.nodeType===1?s.anchorNode:s.anchorNode.parentNode),m=n&&n.closest&&n.closest("mark");
    if(m)m.replaceWith(...m.childNodes);else if(s.rangeCount&&!s.isCollapsed){const t=s.toString();ex("insertHTML",`<mark>${esc(t).replace(/\n/g,"<br>")}</mark>`)}else toast("Sélectionne d'abord du texte")}
  else if(k==="clear"){ex("removeFormat");if(tag&&tag!=="DIV"&&tag!=="LI")ex("formatBlock","div");const m=b&&b.querySelectorAll("mark");if(m)m.forEach(x=>x.replaceWith(...x.childNodes))}
  else ex(k);
  noteInput();rtState()}
// entoure la sélection d'une couleur (surligneur ou texte) ; valeur vide = retire cette couleur
function rtWrap(tag,attr,val){const s=getSelection();if(!s.rangeCount||s.isCollapsed){toast("Sélectionne d'abord du texte");return}
  const r=s.getRangeAt(0),box=document.createElement("div");box.appendChild(r.cloneContents());
  box.querySelectorAll(`${tag}[${attr}]`).forEach(x=>x.replaceWith(...x.childNodes));
  let anc=r.commonAncestorContainer;anc=anc.nodeType===1?anc:anc.parentNode;const outer=anc&&anc.closest&&anc.closest(`${tag}[${attr}]`);
  if(outer&&$("noteBody").contains(outer)){r.selectNode(outer);s.removeAllRanges();s.addRange(r)}
  document.execCommand("insertHTML",false,val?`<${tag} ${attr}="${val}">${box.innerHTML}</${tag}>`:box.innerHTML)}
// v41 : menus déroulants de la barre (comme Word) ; la sélection est gardée pendant le choix
const RT_MENUS={style:[["h2","Titre"],["h3","Sous-titre"],["p","Texte normal"],["quote","Citation"],["strikeThrough","Barré"]],
  hl:[["hl:y","Jaune"],["hl:g","Vert"],["hl:b","Bleu"],["hl:p","Rose"],["hl:none","Sans surlignage"]],
  tc:[["tc:none","Automatique"],["tc:r","Rouge"],["tc:o","Orange"],["tc:g","Vert"],["tc:b","Bleu"],["tc:v","Violet"]],
  ul:[["ul","Liste à puces"],["chk","Cases à cocher"]],
  ins:[["hr","Séparateur"],["link","Lien"],["date","Date du jour"]],
  edit:[["clear","Retirer la mise en forme"],["undo","Annuler"],["redo","Rétablir"]]};
let rtRange=null;
function rtMenu(btn){const pop=$("rtPop"),k=btn.dataset.rtm;if(!pop.hidden&&pop.dataset.for===k){pop.hidden=true;return}
  const s=getSelection();rtRange=s.rangeCount&&$("noteBody").contains(s.anchorNode)?s.getRangeAt(0).cloneRange():null;
  pop.dataset.for=k;let isl=false;if(shIsl("rtMenu")){try{window.SCIslands.rtMenu(pop,{items:RT_MENUS[k].map(([c,l])=>({c,l,sw:/^(hl|tc):/.test(c)})),i18n:agI18n()});isl=true}catch(e){reportErr("island rtMenu: "+(e&&e.message));try{window.SCIslands.unmount(pop)}catch(_){}}}
  if(!isl)pop.innerHTML=RT_MENUS[k].map(([c,l])=>`<button type="button" role="menuitem" data-rtc="${c}"${/^(hl|tc):/.test(c)?` data-sw="${c}"`:""}>${/^(hl|tc):/.test(c)?`<i class="rt-sw"></i>`:""}${esc(L(l))}</button>`).join("");
  const b=btn.getBoundingClientRect();pop.hidden=false;const w=pop.offsetWidth;pop.style.left=Math.max(8,Math.min(innerWidth-w-8,b.left))+"px";pop.style.top=(b.bottom+6)+"px"}
$("rtPop").addEventListener("pointerdown",e=>e.preventDefault());$("rtPop").addEventListener("mousedown",e=>e.preventDefault());
$("rtPop").addEventListener("click",e=>{const b=e.target.closest("[data-rtc]");if(!b)return;$("rtPop").hidden=true;
  if(rtRange){$("noteBody").focus();const s=getSelection();s.removeAllRanges();s.addRange(rtRange)}rtCmd(b.dataset.rtc)});
document.addEventListener("pointerdown",e=>{if(!$("rtPop").hidden&&!e.target.closest("#rtPop,[data-rtm]"))$("rtPop").hidden=true});
function rtState(){const q=c=>{try{return document.queryCommandState(c)}catch(e){return false}},b=rtBlock(),tag=b&&b.tagName;
  document.querySelectorAll("#rtBar [data-rt]").forEach(x=>{const k=x.dataset.rt;let on=false;
    if(["bold","italic","underline","strikeThrough"].includes(k))on=q(k);else if(k==="h2"||k==="h3")on=tag===k.toUpperCase();else if(k==="quote")on=!!(b&&b.closest("blockquote"));
    else if(k==="ul")on=!!(b&&b.closest("ul:not(.chk)"));else if(k==="ol")on=!!(b&&b.closest("ol"));else if(k==="chk")on=!!(b&&b.closest("ul.chk"));
    x.setAttribute("aria-pressed",String(on))});
  const st=document.querySelector('#rtBar [data-rtm="style"]');if(st)st.setAttribute("aria-pressed",String(tag==="H2"||tag==="H3"||!!(b&&b.closest("blockquote"))));
  const ul=document.querySelector('#rtBar [data-rtm="ul"]');if(ul)ul.setAttribute("aria-pressed",String(!!(b&&b.closest("ul"))))}
// les boutons ne prennent pas le focus : la sélection et le clavier restent dans la note
$("rtBar").addEventListener("pointerdown",e=>{if(e.target.closest("[data-rt]"))e.preventDefault()});
$("rtBar").addEventListener("mousedown",e=>{if(e.target.closest("[data-rt]"))e.preventDefault()});
$("rtBar").addEventListener("pointerdown",e=>{if(e.target.closest("[data-rtm]"))e.preventDefault()});$("rtBar").addEventListener("mousedown",e=>{if(e.target.closest("[data-rtm]"))e.preventDefault()});
$("rtBar").addEventListener("click",e=>{const m=e.target.closest("[data-rtm]");if(m){rtMenu(m);return}const b=e.target.closest("[data-rt]");if(b){$("rtPop").hidden=true;rtCmd(b.dataset.rt)}});
document.addEventListener("selectionchange",()=>{if(noteOpenId&&$("noteBody").contains(document.activeElement||null)||document.activeElement===$("noteBody"))rtState()});
// cases à cocher : toucher la case coche ou décoche
$("noteBody").addEventListener("click",e=>{const li=e.target.closest("ul.chk>li");if(!li)return;const r=li.getBoundingClientRect();
  if(e.clientX-r.left<30){e.preventDefault();li.setAttribute("data-c",li.getAttribute("data-c")==="1"?"0":"1");noteInput()}});
// collage : mise en forme nettoyée (rien d'exécutable, pas de couleurs ni de polices)
$("noteBody").addEventListener("paste",e=>{const cd=e.clipboardData;if(!cd)return;const h=cd.getData("text/html"),t=cd.getData("text/plain");e.preventDefault();
  document.execCommand("insertHTML",false,h?rtClean(h):rtFromText(t));noteInput()});
// Entrée sur une case vide d'une liste de cases : nouvelle case non cochée
$("noteBody").addEventListener("keyup",e=>{if(e.key==="Enter"){const b=rtBlock(),li=b&&b.closest("ul.chk>li");if(li&&li.getAttribute("data-c")==="1"&&!li.textContent.trim())li.setAttribute("data-c","0")}});
$("nuMic").addEventListener("click",e=>dictate(e.currentTarget,$("nuAsk")));
document.addEventListener("visibilitychange",()=>{if(document.hidden)dictStop()});

// bouton 🎤 ajouté à côté des champs de saisie principaux
function micFor(inp){if(!inp||inp.dataset.mic)return;inp.dataset.mic="1";
  const b=document.createElement("button");b.type="button";b.className="mini nu-mic";b.innerHTML=IC("mic");b.setAttribute("aria-label",L("Dicter"));
  const par=inp.parentElement;
  if(par.classList.contains("addbar")||par.classList.contains("pw-field"))inp.after(b);
  else{const w=document.createElement("span");w.className="mic-field";inp.before(w);w.append(inp,b)}
  b.addEventListener("click",()=>dictate(b,inp,()=>inp.dispatchEvent(new Event("input",{bubbles:true}))));
}
["todoIn","fTitle","eTitle","msName","catIn","pwNote"].forEach(id=>micFor($(id)));
