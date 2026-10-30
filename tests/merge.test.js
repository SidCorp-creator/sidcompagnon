// Fusion à 3 voies (v44.6) : une vieille copie d'appareil ne doit plus remettre en ligne ce qui a été modifié ou supprimé ailleurs.
// v60 (#3) : la fusion est maintenant en TypeScript (app/src/core/merge.ts → site/react/core.js). Ce test vérifie les deux versions :
// l'ancienne (gardée en secours dans app.js) et la nouvelle, sur les mêmes cas, puis compare leurs résultats sur des milliers de cas au hasard.
// Lance : node tests/merge.test.js   (après « cd app && npm run build »)
const fs=require("fs"),vm=require("vm");
const src=fs.readFileSync(__dirname+"/../site/app.js","utf8");
const a=src.indexOf("const baseKey="),b=src.indexOf("function schedulePush");
const env={L:x=>x,norm:x=>String(x||"").trim().toLowerCase(),forServer:d=>{const c={...d};delete c.ui;return c}};
// ancienne version (app.js, sans core.js)
const ctxOld={...env,window:{},ls:{get(){},set(){return true},del(){}},reportErr(){},console};
vm.createContext(ctxOld);vm.runInContext(src.slice(a,b)+";this.mergeData=mergeData",ctxOld);
// nouvelle version (core.js)
const ctxNew={window:{},console,TextEncoder,TextDecoder,btoa,atob,crypto:globalThis.crypto};vm.createContext(ctxNew);vm.runInContext(fs.readFileSync(__dirname+"/../site/react/core.js","utf8"),ctxNew);
const core=ctxNew.window.SCCore;if(!core){console.log("ÉCHEC : site/react/core.js ne définit pas SCCore");process.exit(1)}
const VERS=[["ancienne",ctxOld.mergeData],["nouvelle",(l,r,o)=>core.mergeData(l,r,o,env)]];
const C=x=>JSON.parse(JSON.stringify(x));let fail=0;
for(const [nom,M] of VERS){
  const ok=(c,m)=>{if(!c){fail++;console.log(`ÉCHEC (${nom}) :`,m)}};
  const base={todos:[{id:"a",title:"A"},{id:"b",title:"B"},{id:"c",title:"C"}],tasks:[{id:"t",title:"T",status:"à faire"}],prefs:{x:1,y:1},
    muscu:{plan:{id:"p1",v:2,upd:10},sessions:[{id:"s1",name:"Push",upd:10,grp:{id:"p1"}},{id:"s2",name:"Pull",upd:10,grp:{id:"p1"}}]}};
  // le Mac (ou Claude) a modifié a, supprimé b (sans pierre tombale), changé un réglage, remplacé le programme
  const rem=C(base);rem.todos[0].title="A modifiée";rem.todos.splice(1,1);rem.prefs.x=2;
  rem.muscu.plan={id:"p2",v:2,upd:20};rem.muscu.sessions=[{id:"s3",name:"Nouveau",upd:20,grp:{id:"p2"}}];rem.del={s1:20,s2:20};
  // l'iPhone a une vieille copie, et a juste ajouté une tâche d
  const loc=C(base);loc.todos.push({id:"d",title:"D"});loc.ui={view:"home"};
  let m=M(loc,rem,{base});
  ok(m.todos.find(x=>x.id==="a").title==="A modifiée","la modification faite ailleurs est écrasée par la vieille copie");
  ok(!m.todos.some(x=>x.id==="b"),"une tâche supprimée ailleurs revient");
  ok(m.todos.some(x=>x.id==="d"),"la tâche ajoutée ici est perdue");
  ok(m.prefs.x===2,"réglage modifié ailleurs écrasé");
  ok(m.muscu.plan.id==="p2","l'ancien programme revient");
  ok(m.muscu.sessions.length===1&&m.muscu.sessions[0].id==="s3","des séances de l'ancien programme reviennent");
  ok(m.ui&&m.ui.view==="home","réglages de l'appareil perdus");
  // les deux ont modifié : ce qui a changé ici gagne, sans toucher au reste
  const loc2=C(base);loc2.tasks[0].status="fait";loc2.prefs.y=5;
  m=M(loc2,rem,{base});ok(m.tasks[0].status==="fait","la modification faite ici est perdue");ok(m.prefs.y===5&&m.prefs.x===2,"réglages mal fusionnés");
  // supprimé ici (même sans pierre tombale), inchangé ailleurs : ne revient pas
  const loc3=C(base);loc3.todos=loc3.todos.filter(x=>x.id!=="c");
  m=M(loc3,C(base),{base});ok(!m.todos.some(x=>x.id==="c"),"une tâche supprimée ici revient");
  // sans base (ancienne copie) : comportement d'avant, rien n'est perdu
  m=M(loc,rem);ok(m.todos.some(x=>x.id==="d")&&m.todos.some(x=>x.id==="a"),"sans base : données perdues");
  // une clé retirée ici (ex. coffre remis à zéro) ne revient pas
  const b4={vault:{id:"v",at:1},todos:[]},l4={todos:[]},r4=C(b4);m=M(l4,r4,{base:b4});ok(!("vault" in m),"clé supprimée ici revient");
  // effacement total : gagne toujours
  m=M(loc,{...C(rem),wipe:"2099"},{base});ok(m.wipe==="2099","l'effacement ne gagne plus");
  // notes modifiées des deux côtés depuis la dernière synchro : copie de conflit
  const nl={notes:[{id:"n",title:"Ici",body:"x",upd:300}]},nr={notes:[{id:"n",title:"Là",body:"y",upd:200}]};
  m=M(nl,nr,{since:100});ok(m.notes.length===2&&m.notes.some(x=>x.id==="n-c200"),"copie de conflit absente");
  // coffre plus récent ailleurs : il gagne
  m=M({vault:{id:"v1",at:1}},{vault:{id:"v2",at:5}});ok(m.vault.id==="v2","le coffre le plus récent ne gagne pas");
}
// comparaison sur des cas tirés au hasard (graine fixe : le test donne toujours le même résultat)
let seed=20261030;const rnd=()=>(seed=(seed*1103515245+12345)%2147483648)/2147483648,pick=a=>a[Math.floor(rnd()*a.length)],chance=p=>rnd()<p;
const now=Date.now(),ids=["a","b","c","d","e"];
const item=(id)=>({id,title:pick(["A","B","C",""]),upd:pick([0,100,200,300,undefined]),...(chance(.2)?{done:chance(.5)}:{})});
const list=()=>ids.filter(()=>chance(.6)).map(item);
const vault=()=>chance(.5)?null:{id:pick(["v1","v2"]),at:pick([1,2,3])};
const dataset=()=>{const d={todos:list(),tasks:list(),notes:list().map(n=>chance(.3)?{...n,secret:true,ct:pick(["x","y"])}:n),pwds:list(),docs:list().map(x=>({...x,up:chance(.5),path:"p"})),
  todoCats:list(),noteFolders:list(),pdfAnns:list(),types:[{name:pick(["Sport","sport ","Cours"])}],prefs:{a:pick([1,2]),b:pick([1,2])},
  nutri:{upd:pick([1,2,3]),log:list(),weights:list(),weeks:list(),profile:{w:pick([70,80])}},muscu:{plan:chance(.5)?{id:pick(["p1","p2"]),upd:pick([1,5])}:undefined,sessions:list(),log:list()}};
  if(chance(.4))d.del=Object.fromEntries(ids.filter(()=>chance(.3)).map(k=>[k,now-pick([1000,100*864e5])]));
  if(chance(.2))d.res=Object.fromEntries(ids.filter(()=>chance(.3)).map(k=>[k,now]));
  if(chance(.05))d.wipe=pick(["2026-01-01","2026-02-01"]);
  const v=vault();if(v)d.vault=v;if(chance(.5))d.ui={view:pick(["home","plan"])};return d};
const vary=d=>{const c=C(d);for(const k of ["todos","tasks","notes","pwds","docs","pdfAnns"])if(chance(.4))c[k]=list();if(chance(.3))c.prefs.a=pick([1,2,3]);if(chance(.3))c.vault=vault()||undefined;
  if(chance(.4))c.types=[{name:pick(["Sport","sport ","Cours","cours"])}];
  if(chance(.6))c.notes=(c.notes||[]).map(n=>chance(.5)?{...n,title:pick(["X","Y",n.title]),upd:pick([160,250,300,400])}:n);
  if(chance(.3))c.nutri={...c.nutri,upd:pick([1,2,3,4]),log:list()};if(chance(.3))c.muscu={...c.muscu,plan:{id:pick(["p1","p2","p3"]),upd:pick([1,5,9])},sessions:list()};
  if(chance(.2))c.del={...(c.del||{}),[pick(ids)]:now-pick([1000,5000])};return c};
let diff=0;const N=5000;
for(let i=0;i<N;i++){const base=dataset(),loc=vary(base),rem=vary(base),opt=pick([undefined,{base},{base,since:150},{since:150}]);
  const o=JSON.stringify(ctxOld.mergeData(C(loc),C(rem),opt&&C(opt))),n=JSON.stringify(core.mergeData(C(loc),C(rem),opt&&C(opt),env));
  if(o!==n){diff++;if(diff<=3)console.log("ÉCHEC : résultats différents (cas "+i+")\n  ancienne : "+o.slice(0,300)+"\n  nouvelle : "+n.slice(0,300))}}
if(diff){fail+=diff;console.log(diff+" cas sur "+N+" diffèrent")}
console.log(fail?fail+" échec(s)":`OK : fusion à 3 voies (ancienne et nouvelle version, ${N} cas identiques)`);process.exit(fail?1:0);
