/* ---------- v29 : quand une fenêtre (feuille) est ouverte, la page derrière est figée ---------- */
// sur iPhone, overflow:hidden ne suffit pas : on fige le corps de la page à sa position et on la rétablit à la fermeture
let lockY=0;
function syncScrollLock(){const open=[...document.querySelectorAll(".sheet-bg")].some(x=>!x.hidden),on=document.documentElement.classList.contains("modal-open");
  if(open&&!on){lockY=window.scrollY;document.body.style.top=`-${lockY}px`;document.documentElement.classList.add("modal-open")}
  else if(!open&&on){document.documentElement.classList.remove("modal-open");document.body.style.top="";window.scrollTo(0,lockY)}}
{const mo=new MutationObserver(syncScrollLock);document.querySelectorAll(".sheet-bg").forEach(x=>mo.observe(x,{attributes:true,attributeFilter:["hidden"]}))}
// v35 : fenêtres accessibles : annoncées comme fenêtres, le focus y entre (et y reste au clavier), revient où il était à la fermeture, Échap ferme
// v36 : sur iPhone, quand le clavier s'ouvre, la fenêtre suit la partie visible de l'écran (sinon les touchers tombent à côté)
let kbUser=false;addEventListener("keydown",e=>{if(e.key==="Tab")kbUser=true},true);addEventListener("pointerdown",()=>{kbUser=false},true);
// v44.4 : pendant la saisie (clavier ouvert), la barre du bas est masquée (html.kb-open) ; à la fermeture du clavier, iOS est forcé
// à se recaler (sinon les éléments « fixes » peuvent rester à la hauteur du clavier). v44.5 : la barre n'utilise plus --vvt/--vvh.
if(window.visualViewport){const vv=visualViewport,de=document.documentElement,st=de.style,maxH={};
  const editing=()=>{const a=document.activeElement;return !!a&&(a.isContentEditable||a.tagName==="TEXTAREA"||(a.tagName==="INPUT"&&!/^(button|checkbox|radio|range|color|file|submit|reset|image)$/.test(a.type)))};
  const f=()=>{st.setProperty("--vvh",vv.height+"px");st.setProperty("--vvt",vv.offsetTop+"px");
    const o=innerWidth>innerHeight?"l":"p";if(!editing()||!maxH[o])maxH[o]=Math.max(maxH[o]||0,vv.height*vv.scale);
    de.classList.toggle("kb-open",editing()&&vv.height*vv.scale<maxH[o]-120)};
  vv.addEventListener("resize",f);vv.addEventListener("scroll",f);addEventListener("orientationchange",()=>{for(const k in maxH)delete maxH[k];setTimeout(f,400)});
  addEventListener("focusin",()=>setTimeout(f,350));
  addEventListener("focusout",()=>setTimeout(()=>{f();if(!editing()&&!de.classList.contains("modal-open"))window.scrollTo(window.scrollX,window.scrollY)},350));f()}
{const sheets=[...document.querySelectorAll(".sheet-bg")],FOC='a[href],button:not([disabled]),input:not([disabled]):not([type=hidden]),select,textarea,[tabindex]:not([tabindex="-1"])';
  const vis=el=>!!(el.offsetWidth||el.offsetHeight||el.getClientRects().length);
  const top=()=>sheets.filter(x=>!x.hidden).pop()||null;
  sheets.forEach(bg=>{const d=bg.querySelector(".sheet")||bg;d.setAttribute("role","dialog");d.setAttribute("aria-modal","true");d.tabIndex=-1;
    const t=d.querySelector(".sheet-head b,.na-t");if(t){if(!t.id)t.id=bg.id+"-t";d.setAttribute("aria-labelledby",t.id)}
    new MutationObserver(()=>{
      if(!bg.hidden){if(!bg._back)bg._back=document.activeElement;setTimeout(()=>{if(bg.hidden||!kbUser||d.contains(document.activeElement))return;
        d.focus({preventScroll:true})},60)} // la fenêtre elle-même (pas un champ : le clavier de l'iPhone ne s'ouvre pas tout seul)
      else{const b=bg._back;bg._back=null;if(b&&document.contains(b)&&!top())try{b.focus({preventScroll:true})}catch(e){}}
    }).observe(bg,{attributes:true,attributeFilter:["hidden"]})});
  window.addEventListener("keydown",e=>{const bg=top();if(!bg)return;
    if(e.key==="Escape"){e.preventDefault();e.stopPropagation();const c=bg.querySelector(".sheet-head .x,[data-esc]");if(c)c.click();else bg.hidden=true;return}
    if(e.key==="Tab"){const f=[...bg.querySelectorAll(FOC)].filter(vis);if(!f.length)return;const a=f[0],z=f[f.length-1];
      if(!bg.contains(document.activeElement)){e.preventDefault();a.focus();return}
      if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}},true)}