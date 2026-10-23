// Fusion à 3 voies (v44.6) : une vieille copie d'appareil ne doit plus remettre en ligne ce qui a été modifié ou supprimé ailleurs.
// Lance : node tests/merge.test.js
const fs=require("fs"),vm=require("vm");
const src=fs.readFileSync(__dirname+"/../site/app.js","utf8");
const a=src.indexOf("const baseKey="),b=src.indexOf("function schedulePush");
const ctx={L:x=>x,ls:{get(){},set(){return true},del(){}},norm:x=>String(x||"").trim().toLowerCase(),forServer:d=>{const c={...d};delete c.ui;return c},console};
vm.createContext(ctx);vm.runInContext(src.slice(a,b)+";this.mergeData=mergeData",ctx);
const M=ctx.mergeData,C=x=>JSON.parse(JSON.stringify(x));let fail=0;
const ok=(c,m)=>{if(!c){fail++;console.log("ÉCHEC :",m)}};
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
console.log(fail?fail+" échec(s)":"OK : fusion à 3 voies");process.exit(fail?1:0);
