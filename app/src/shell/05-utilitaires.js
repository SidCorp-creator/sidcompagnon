/* ---------- utilitaires ---------- */
const $=/** @type {(id:string)=>any} */(id=>document.getElementById(id));
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const parse=/** @type {(d:string)=>any} */(d=>{const[y,m,x]=d.split("-").map(Number);return new Date(y,m-1,x)});
const today=/** @type {()=>any} */(()=>{const t=new Date();return new Date(t.getFullYear(),t.getMonth(),t.getDate())});
const fmt=d=>{const x=parse(d);return x.getDate()+" "+MO[x.getMonth()]};
const daysTo=d=>Math.round((parse(d)-today())/864e5);
// v69 (#3) : message du bas dessiné par React (shIsl est déclaré plus bas : on teste window.SCIslands directement)
const toastIsl=(t,p)=>{if(!(window.SCIslands&&window.SCIslands.toast&&!window.__noIslands))return false;try{window.SCIslands.toast(t,{...p,i18n:agI18n()});return true}catch(e){try{window.SCIslands.unmount(t)}catch(_){}return false}};
function toast(m,ms){const t=$("toast");if(!toastIsl(t,{m:String(m),label:"",onAct:null}))t.textContent=m;t.hidden=false;clearTimeout(toast.h);toast.h=setTimeout(()=>t.hidden=true,ms||2200)}
/** @type {any} */ toast.h=undefined; // minuterie du message (déclarée pour TypeScript)
// v34 : message avec un bouton (ex. « Annuler »)
function toastAct(m,label,fn,ms){const t=$("toast");let used=false;const act=()=>{if(used)return;used=true;t.hidden=true;clearTimeout(toast.h);fn()};
  if(!toastIsl(t,{m,label,onAct:act})){t.innerHTML=`<span>${esc(L(m))}</span><button type="button" class="toast-act">${esc(L(label))}</button>`;t.querySelector(".toast-act").addEventListener("click",act,{once:true})}t.hidden=false;clearTimeout(toast.h);toast.h=setTimeout(()=>t.hidden=true,ms||5000)}
// v34 : suppression immédiate, « Annuler » pendant 5 s (plus de double appui pour confirmer).
// L'annulation remet l'état d'avant ; data.res annule la pierre tombale, même si elle est déjà partie vers les autres appareils.
// o.later : action définitive (fichiers en ligne…) faite seulement quand on ne peut plus annuler ; o.revert : ce que la fusion ne remet pas seule.
let undoPend=null;
function undoable(msg,ids,apply,o){o=o||{};
  if(undoPend)undoPend.flush();
  const snap=JSON.parse(JSON.stringify(forServer(data)));apply();save();if(o.after)o.after();
  let done=false;const tm=setTimeout(()=>p.flush(),5600);
  const p=undoPend={flush(){if(done)return;done=true;clearTimeout(tm);if(undoPend===p)undoPend=null;if(o.later)try{o.later()}catch(e){}}};
  toastAct(msg,"Annuler",()=>{if(done)return;done=true;clearTimeout(tm);if(undoPend===p)undoPend=null;
    const now=Date.now();data.res=data.res||{};ids.forEach(id=>{data.res[id]=now;if(data.del)delete data.del[id]});
    applyRemote(mergeData(data,snap));if(o.revert)o.revert();save();renderAll();if(o.after)o.after();toast("Annulé")},5000)}
const CHECK='<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M2.5 7.5l3 3 6-7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
// suppression en deux temps : 1er appui → bouton rouge « Confirmer ? », 2e appui dans les 3 s → suppression ; sinon le bouton revient
// v70 : le bouton peut être dessiné par React ; on ne remet l'ancien contenu que s'il affiche encore « Confirmer ? »
// (sinon React l'a déjà redessiné et l'ancien libellé écraserait le nouveau)
function c2Off(btn){clearTimeout(btn._c2);delete btn.dataset.c2;btn.classList.remove("armed");if(btn.textContent===btn._c2t)btn.innerHTML=btn._c2h}
function confirm2(btn,fn,txt){
  if(btn.dataset.c2){c2Off(btn);fn();return}
  btn._c2h=btn.innerHTML;btn._c2t=L(txt||"Confirmer ?");btn.dataset.c2="1";btn.classList.add("armed");btn.textContent=btn._c2t;
  btn._c2=setTimeout(()=>c2Off(btn),3000);
}
const armDelete=confirm2;
// champs de nombres : au toucher, le curseur va à la fin du nombre (pour effacer et retaper directement)
document.addEventListener("focusin",e=>{const el=e.target;if(!(el instanceof HTMLInputElement)||!/^(numeric|decimal)$/.test(el.inputMode||""))return;
  const end=()=>{try{const n=el.value.length;el.setSelectionRange(n,n)}catch(x){}};end();setTimeout(end,0);setTimeout(end,60)});
// même chose pour un gestionnaire de clic : faux au 1er appui (bouton armé), vrai au 2e
const c2ok=b=>{if(b.dataset.c2){c2Off(b);return true}confirm2(b,()=>{});return false};

// v42 : logos (S signature gravé dans la silhouette de chaque app) ; couleur = currentColor, la découpe laisse voir le fond
// (v42–44.6 : logos dessinés ici en SVG ; remplacés en 44.7 par site/icons/*.svg)
// v44.7 : nouvelles icônes des apps (fournies par Sid : pictogramme + sceau « S », version pleine arrondie), dans site/icons/
const LOGO_APPS={home:1,agenda:1,fit:1,note:1};
const LOGO=(app,cls)=>`<img class="logo ${cls||""}" src="icons/${LOGO_APPS[app]?app:"home"}.svg" alt="" aria-hidden="true" draggable="false">`;

// v42 : animation d'ouverture (2 s) : le logo Sid'compagnon, puis les trois apps ; elle ne bloque jamais les touchers
if($("authLogo"))$("authLogo").innerHTML=LOGO("home");
(()=>{const sp=$("splash");if(!sp)return;$("spMark").innerHTML=LOGO("home");$("spApps").innerHTML=["agenda","fit","note"].map(a=>`<span data-app="${a}">${LOGO(a)}</span>`).join("");
  const quick=matchMedia("(prefers-reduced-motion: reduce)").matches;sp.classList.add("go");setTimeout(()=>{sp.remove();bootTop()},quick?400:2100)})();
