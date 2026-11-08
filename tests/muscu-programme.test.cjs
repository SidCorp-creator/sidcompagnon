// Constraint tests against the same engine used by Edge and the generated browser adapter.
const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm'),{execFileSync}=require('node:child_process');
const source=fs.readFileSync('supabase/functions/_shared/muscu-programme.js','utf8');
const create=new Function(source.replace('export function ','function ')+';return createMuscuEngine')();
const catalogue=JSON.parse(fs.readFileSync('supabase/functions/_shared/muscu-catalogue.json','utf8'));
let seq=0;const engine=create(catalogue,{id:()=>`test-${++seq}`,now:()=>1794132000000});
const home={v:1,goal:'forme',level:'deb',days:2,dur:20,place:'home',equip:['none'],avoidZones:[],avoidEx:[],prefer:[],pain:'none',other:[],notes:''};
const gym={...home,goal:'force',level:'conf',days:4,dur:60,place:'gym',equip:['dumbbells','bench','barbell','machines','cables','pullup']};
const limited={...home,goal:'muscle',level:'inter',days:3,dur:35,equip:['bands'],avoidZones:['knee'],avoidEx:['Rowing élastique assis'],prefer:['Écartés élastique devant soi'],other:[{sport:'Vélo',perWeek:4}]};
const catalog=catalogue.groupes.flatMap(g=>g.exercices.map(e=>({...e,m:g.muscle}))),find=n=>catalog.find(e=>e.nom===n);
function check(a,r){assert.equal(r.plan.days.length,a.days);assert.deepEqual(r.plan.profile,a);assert.equal(r.est.length,a.days);r.plan.days.forEach((d,i)=>{assert.ok(d.ex.length);assert.ok(r.est[i]<=a.dur);const pats=new Set();for(const x of d.ex){const e=find(x.name);assert.ok(e);assert.equal(e.help,true);assert.ok(e.needs.some(req=>req.every(k=>a.equip.includes(k))),x.name);assert.ok(!a.avoidEx.includes(x.name));for(const z of a.avoidZones)assert.ok(!e.zones.includes({knee:'k',back:'b',shoulder:'s'}[z]));assert.ok(!pats.has(x.pat));pats.add(x.pat);assert.ok(!('kg' in x));assert.ok(x.sets>=1);assert.ok(x.rir!=='0');assert.equal(r.est[i],engine.muEstimate(d.ex))}})}
const results=[home,gym,limited].map(a=>{const snapshot=JSON.stringify(a);const r=engine.muBuild(a);check(a,r);assert.equal(JSON.stringify(a),snapshot);return r});
assert.notDeepEqual(results[0].plan.days.map(d=>d.ex.map(x=>x.name)),results[1].plan.days.map(d=>d.ex.map(x=>x.name)));
assert.ok(results[2].warnings.length);assert.ok(results[2].plan.days.some(d=>d.ex.some(x=>x.name==='Écartés élastique devant soi')));
assert.ok(results[2].plan.days.every(d=>d.ex.every(x=>x.sets===2))); // other sports genuinely change volume
assert.ok(engine.muBuild({...home,pain:'yes'},'en').warnings.some(x=>/professional advice/.test(x)));assert.ok(!engine.muBuild(home,'en').why.some(x=>/Programme local/.test(x)));
for(const name of engine.muAlternatives('Rowing élastique assis',limited)){const e=find(name);assert.equal(e.m,'back');assert.ok(!limited.avoidEx.includes(name));assert.ok(e.needs.some(req=>req.every(k=>limited.equip.includes(k))))}
assert.ok(!engine.muAlternatives('Pompes au sol',{...home,avoidZones:['shoulder']}).some(x=>find(x).zones.includes('s')));
assert.throws(()=>engine.muBuild({...home,equip:['teleporter']}),/bad_request/);assert.throws(()=>engine.muBuild({...home,days:0}),/bad_request/);assert.throws(()=>engine.muBuild({...home,days:7}),/bad_request/);assert.throws(()=>engine.muBuild({...home,dur:19}),/bad_request/);assert.throws(()=>engine.muBuild({...home,other:[{sport:'run',perWeek:Infinity}]}),/bad_request/);
const blocked={...home,avoidEx:catalog.filter(e=>e.needs.some(req=>req.length===0)).map(e=>e.nom)};assert.throws(()=>engine.muBuild(blocked),e=>e.code==='no_compatible_exercises');
for(const zone of ['wrist','hip']){const r=engine.muBuild({...home,avoidZones:[zone]});for(const d of r.plan.days)for(const x of d.ex)assert.ok(!find(x.name).zones.includes(zone==='wrist'?'w':'h'))}
const plan=engine.muBuild(gym,'en').plan,snapshot=JSON.stringify(plan);let replaced=false;
for(let di=0;di<plan.days.length&&!replaced;di++)for(let ei=0;ei<plan.days[di].ex.length&&!replaced;ei++)for(const name of engine.muAlternatives(plan.days[di].ex[ei].name,gym)){try{const next=engine.muReplace(plan,di,ei,name,gym,'en');assert.equal(next.plan.days[di].ex[ei].name,name);assert.equal(next.est[di],engine.muEstimate(next.plan.days[di].ex));assert.equal(next.plan.src,'app');replaced=true;break}catch(e){if(e.code!=='invalid_replacement')throw e}}
assert.ok(replaced);assert.equal(JSON.stringify(plan),snapshot);assert.throws(()=>engine.muReplace(plan,0,0,'Unknown',gym,'en'),e=>e.code==='invalid_replacement');
// Regression: an experienced profile must not get an easier push-up while a standard variant fits.
const forceLimited={...home,goal:'force',level:'inter',days:3,dur:45,equip:['dumbbells','bands'],avoidZones:['knee'],avoidEx:['Squat au poids du corps','Goblet squat']};
for(const level of ['inter','conf']){const a={...forceLimited,level},r=engine.muBuild(a,'en'),all=r.plan.days.flatMap(d=>d.ex);assert.ok(all.some(x=>x.name==='Pompes au sol'));assert.ok(!all.some(x=>['Pompes au mur','Pompes sur les genoux'].includes(x.name)));assert.ok(!engine.muAllowed(a).some(x=>x.name==='Pompes au mur'));assert.ok(!engine.muAlternatives('Développé couché haltères',a).includes('Pompes au mur'))}
// Level-choice unit fixture: easy variants deliberately unavailable in the production catalogue until their photos exist.
const levelCatalogue=JSON.parse(JSON.stringify(catalogue));for(const g of levelCatalogue.groupes)for(const e of g.exercices)if(['Pompes au mur','Pompes sur les genoux'].includes(e.nom))e.help=true;
const levelEngine=create(levelCatalogue,{id:()=>`level-${++seq}`,now:()=>1794132000000});
assert.ok(levelEngine.muBuild(home).plan.days[0].ex.some(x=>x.name==='Pompes au mur'),'fixture: beginner gets accessible variant');
const fallback={...forceLimited,avoidEx:[...forceLimited.avoidEx,'Pompes au sol']};assert.ok(levelEngine.muBuild(fallback).plan.days.some(d=>d.ex.some(x=>x.name==='Pompes au mur')),'fixture: easy fallback remains');
assert.ok(levelEngine.muBuild({...forceLimited,prefer:['Pompes au mur']}).plan.days.some(d=>d.ex.some(x=>x.name==='Pompes au mur')),'fixture: preference respected');
assert.ok(!levelEngine.muBuild({...forceLimited,prefer:['Pompes sur les genoux']}).plan.days.some(d=>d.ex.some(x=>x.name==='Pompes sur les genoux')),'fixture: knee exclusion wins');
assert.ok(!engine.muAllowed({...home,prefer:['Pompes au mur']}).some(x=>x.name==='Pompes au mur'),'production: incomplete help beats explicit preference');
const regressed=engine.muBuild(forceLimited);const chest=regressed.plan.days.flatMap(d=>d.ex).find(x=>x.pat==='chest:hpress');chest.name='Pompes au mur';assert.throws(()=>engine.muValidate(regressed,forceLimited),/invalid_programme/);
// All supported frequencies and time caps fit, without silently relaxing equipment.
for(const days of [1,2,3,4,5,6])for(const dur of [20,45,120]){const a={...gym,days,dur};check(a,engine.muBuild(a))}
for(const days of [1,2,3,4])check({...home,days},engine.muBuild({...home,days}));
for(const days of [5,6])assert.throws(()=>engine.muBuild({...home,days}),e=>e.code==='no_compatible_exercises','no complete pull exercise: refuse instead of inserting incomplete W raises');
for(const dur of [20,35,60]){const base={...gym,level:'inter',goal:'muscle',dur};const normal=engine.muBuild(base),busy=engine.muBuild({...base,other:[{sport:'run',perWeek:5}]});busy.plan.days.forEach((d,i)=>assert.ok(d.ex.reduce((s,x)=>s+x.sets,0)<=normal.plan.days[i].ex.reduce((s,x)=>s+x.sets,0),'other sports must not increase total sets by filling time'))}
// Model output must preserve user constraints, coverage, time and safe load selection.
const valid={plan:results[0].plan,why:['Explicit preview'],warnings:[]};assert.equal(engine.muValidate(valid,home).plan.src,'ia');
const clone=x=>JSON.parse(JSON.stringify(x));let bad=clone(valid);bad.plan.days[0].ex[0].name='Chest press machine';assert.throws(()=>engine.muValidate(bad,home),/invalid_programme/);
bad=clone(valid);bad.plan.days[0].ex[0].kg=40;assert.throws(()=>engine.muValidate(bad,home),/invalid_programme/);
bad=clone(valid);bad.plan.days[0].ex[0].note='Start at 40 kg';assert.throws(()=>engine.muValidate(bad,home),/invalid_programme/);
bad=clone(valid);bad.plan.days[0].ex[0].sets=20;assert.throws(()=>engine.muValidate(bad,home),/invalid_programme/);
bad=clone(valid);bad.plan.days.pop();assert.throws(()=>engine.muValidate(bad,home),/invalid_programme/);
bad=clone(valid);bad.plan.days[0].ex[0].rir='0';assert.throws(()=>engine.muValidate(bad,home),/invalid_programme/);
bad=clone(valid);bad.plan.days[0].ex=[bad.plan.days[0].ex[0]];assert.throws(()=>engine.muValidate(bad,home),/invalid_programme/);
const ctx={crypto:globalThis.crypto,window:{SIDFIT_EXERCICES:catalogue}};vm.createContext(ctx);vm.runInContext(fs.readFileSync('app/src/shell/23b-programme-moteur.js','utf8')+';globalThis.api={muBuild,muAlternatives}',ctx);const browser=ctx.api.muBuild(home,'en');assert.deepEqual(JSON.parse(JSON.stringify(browser.plan.days.map(d=>d.ex))),JSON.parse(JSON.stringify(engine.muBuild(home,'en').plan.days.map(d=>d.ex))));
execFileSync(process.execPath,['app/scripts/build-muscu-engine.mjs','--check']);
console.log('muscu programme: 3 contrasting profiles, 1–6 days, time/equipment/exclusions/alternatives, pain warning, AI validation, browser/Edge parity OK');
