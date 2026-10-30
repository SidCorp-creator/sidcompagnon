/* ---------- v43 : animation d'ouverture de sid'agenda, sid'fit et sid'note (≈ 2 s) ----------
   Propre à chaque app (sa couleur, son univers), une variante tirée au hasard à chaque ouverture, avec des réglages
   aléatoires (rythme, sens, nombre d'éléments). Un clic, une touche ou « Passer » l'arrête. Rien si « réduire les animations ». */
let introReady=false,introT=null;
const irnd=(a,b)=>a+Math.random()*(b-a),irint=(a,b)=>Math.floor(irnd(a,b+1)),ipick=a=>a[Math.floor(Math.random()*a.length)];
const INTRO={
  agenda:[
    ()=>{const n=ipick([5,6,7]),rows=ipick([3,4]),dir=Math.random()<.5;let c="";for(let r=0;r<rows;r++)for(let k=0;k<n;k++){const i=r*n+k,d=(dir?i:(rows*n-1-i))*irnd(.025,.04);
        c+=`<rect x="${k*22}" y="${r*22}" width="18" height="18" rx="3" style="animation-delay:${d.toFixed(2)}s" class="${Math.random()<.18?"hot":""}"/>`}
      return `<svg class="it-grid" viewBox="-2 -2 ${n*22+2} ${rows*22+2}" aria-hidden="true">${c}</svg>`},
    ()=>{const t=irnd(.9,1.3).toFixed(2),turns=ipick([1,1.25,1.5]),cw=Math.random()<.5?1:-1;
      return `<svg class="it-clock" viewBox="0 0 120 120" aria-hidden="true" style="--t:${t}s;--turn:${turns*cw*360}deg"><circle cx="60" cy="60" r="52"/><circle class="arc" cx="60" cy="60" r="52"/>${[...Array(12)].map((_,i)=>`<path d="M60 12v6" transform="rotate(${i*30} 60 60)"/>`).join("")}<path class="hand" d="M60 60V22"/><path class="hand2" d="M60 60h26"/></svg>`},
    ()=>{const n=irint(4,6);return `<div class="it-pages" aria-hidden="true">${[...Array(n)].map((_,i)=>`<span style="animation-delay:${(i*irnd(.1,.16)).toFixed(2)}s;--r:${irnd(-6,6).toFixed(1)}deg"><b>${new Date(Date.now()+i*864e5).getDate()}</b></span>`).join("")}</div>`}],
  fit:[
    ()=>{const amp=irint(18,30),beats=irint(2,3);let d="M0 50",x=0;for(let b=0;b<beats;b++){d+=` L${x+30} 50 L${x+38} ${50-amp} L${x+46} ${50+amp*.7} L${x+54} 50`;x+=70}d+=` L${x+20} 50`;
      return `<svg class="it-pulse" viewBox="0 0 ${x+20} 100" aria-hidden="true" style="--len:${x*2}"><path d="${d}"/></svg>`},
    ()=>{const n=irint(5,8),h=[...Array(n)].map(()=>irint(30,100));return `<div class="it-bars" aria-hidden="true">${h.map((v,i)=>`<i style="--h:${v}%;animation-delay:${(i*irnd(.05,.09)).toFixed(2)}s"></i>`).join("")}</div>`},
    ()=>{const reps=irint(6,10);return `<svg class="it-ring" viewBox="0 0 120 120" aria-hidden="true" style="--t:${irnd(1,1.3).toFixed(2)}s"><circle cx="60" cy="60" r="50"/><circle class="arc" cx="60" cy="60" r="50"/>${[...Array(reps)].map((_,i)=>`<g transform="rotate(${i*360/reps} 60 60)"><circle class="dot" cx="60" cy="10" r="3" style="animation-delay:${(.2+i*1/reps).toFixed(2)}s"/></g>`).join("")}</svg>`}],
  note:[
    ()=>{const w=[irint(60,90),irint(70,100),irint(40,80),irint(65,95)];return `<div class="it-lines" aria-hidden="true">${w.map((v,i)=>`<i style="--w:${v}%;animation-delay:${(i*irnd(.18,.26)).toFixed(2)}s"></i>`).join("")}</div>`},
    ()=>{const k=irnd(.9,1.2).toFixed(2),y=irint(-8,8);return `<svg class="it-sign" viewBox="0 0 200 90" aria-hidden="true" style="--t:${k}s"><path d="M10 ${60+y} C 40 ${10+y}, 60 ${80-y}, 85 45 S 120 ${15+y}, 140 55 S 175 ${70-y}, 190 ${35+y}"/></svg>`},
    ()=>{const n=irint(3,5);return `<div class="it-stack" aria-hidden="true">${[...Array(n)].map((_,i)=>`<span style="animation-delay:${(i*irnd(.12,.18)).toFixed(2)}s;--x:${irint(-14,14)}px;--r:${irnd(-5,5).toFixed(1)}deg"></span>`).join("")}</div>`}]};
const INTRO_NAME={agenda:"sid'agenda",fit:"sid'fit",note:"sid'note"};
function appIntro(app,vv){
  if(!INTRO[app]||matchMedia("(prefers-reduced-motion: reduce)").matches||window.__noIntro)return;
  introEnd(true);const el=document.createElement("div");el.className="app-intro";el.id="appIntro";el.dataset.app=app;el.setAttribute("role","presentation");
  const v=vv!==undefined?vv:Math.floor(Math.random()*INTRO[app].length);el.dataset.variant=v;
  el.innerHTML=`<div class="ai-art">${INTRO[app][v]()}</div><div class="ai-brand"><span class="ai-logo">${LOGO(app)}</span><span class="ai-name">${INTRO_NAME[app]}</span></div><button type="button" class="ai-skip">${L("Passer")}</button>`;
  document.body.appendChild(el);el.addEventListener("pointerdown",e=>{e.preventDefault();introEnd()});el.querySelector(".ai-skip").addEventListener("click",()=>introEnd());
  introT=setTimeout(()=>introEnd(),2000)}
function introEnd(now){clearTimeout(introT);const el=$("appIntro");if(!el)return;if(now){el.remove();return}el.classList.add("out");setTimeout(()=>el.remove(),180)}
addEventListener("keydown",e=>{if($("appIntro"))introEnd()},true);
// v44.4 : animation de sortie (retour à Sid'compagnon) : le logo de l'app, au centre, rejoint sa place parmi les 3 logos de l'accueil
const OUT_K={agenda:"orga",fit:"sport",note:"perso"};
function appOutro(app){
  if(matchMedia("(prefers-reduced-motion: reduce)").matches||window.__noIntro||!document.body.animate)return;
  introEnd(true);$("appOutro")?.remove();
  const el=document.createElement("div");el.className="app-outro";el.id="appOutro";el.dataset.app=app;el.setAttribute("aria-hidden","true");
  el.innerHTML=`<div class="ao-brand"><span class="ao-logo">${LOGO(app)}</span><span class="ao-name">${INTRO_NAME[app]}</span></div>`;
  document.body.appendChild(el);
  const lg=el.querySelector(".ao-logo"),nm=el.querySelector(".ao-name"),tile=document.querySelector(`[data-gapp="${OUT_K[app]}"] .home-applogo`);
  const done=()=>el.remove(); // l'overlay laisse passer les touchers : on peut rouvrir une app sans attendre
  el.animate([{opacity:1},{opacity:1,offset:.55},{opacity:0}],{duration:1500,easing:"ease-out",fill:"forwards"}).onfinish=done; // v44.5 : 1,5 s (demande de Sid)
  nm.animate([{opacity:1,transform:"none"},{opacity:1,transform:"none",offset:.4},{opacity:0,transform:"translateY(6px)"}],{duration:600,easing:"ease-in",fill:"forwards"});
  const r=lg.getBoundingClientRect(),t=tile&&tile.getBoundingClientRect();
  if(t&&t.width&&t.top<innerHeight){const dx=t.left+t.width/2-(r.left+r.width/2),dy=t.top+t.height/2-(r.top+r.height/2),k=t.width/r.width;
    lg.animate([{transform:"none"},{transform:`translate(${dx}px,${dy}px) scale(${k})`}],{duration:1000,delay:300,easing:"cubic-bezier(.45,0,.2,1)",fill:"forwards"})}
  else lg.animate([{transform:"none",opacity:1},{transform:"scale(.6)",opacity:0}],{duration:1000,delay:300,easing:"ease-in",fill:"forwards"});
  $("v-home")?.animate([{opacity:0,transform:"translateY(8px)"},{opacity:1,transform:"none"}],{duration:700,delay:800,easing:"ease-out",fill:"backwards"})}