const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),ts=require('../app/node_modules/typescript');
const names=new Set(['nuUnitRef','nuQtyGrams','nuQtyRatio','nuQtyMeta','nuQtyHelp','scaleQty','toGrams','qtyNum','nuQtyEditValue','nuCopyDo','nuAddItems','nuLogFromBot']);let code='';
for(const file of ['39-nutrition.js','40-vues-semaine-mois-annee.js']){const s=fs.readFileSync('app/src/shell/'+file,'utf8'),ast=ts.createSourceFile(file,s,ts.ScriptTarget.Latest,true);for(const n of ast.statements)if(ts.isFunctionDeclaration(n)&&names.has(n.name.text))code+=n.getText(ast)+'\n'}
const nutritionCode=fs.readFileSync('supabase/functions/_shared/nutrition-menu.js','utf8').replace('export function','function');
let log=[],seq=0;const ctx={nz:s=>s.toLowerCase().replace(/œ/g,'oe'),T3:(fr,en)=>fr,r0:Math.round,r1:x=>Math.round(x*10)/10,fmtN:String,qtyEd:null,SPOONS:[[/huile/,13.5,4.5]],toast(){},NU:()=>({log}),nuAt:()=>new Date().toISOString(),uid:()=>String(++seq),save(){},nuDay:'2026-11-07',nuProgressChange:'',Date};vm.createContext(ctx);vm.runInContext(nutritionCode+"\nconst nutritionMenu=createNutritionMenu();\n"+code,ctx);
function entry(name,qty,kcal=140){return {name,qty,kcal,p:12,c:1,f:10}}
let e=entry('Œufs','2 pièces');assert.equal(ctx.nuQtyGrams(e,e.qty),100);assert.ok(ctx.scaleQty(e,'100 g'));assert.equal(e.kcal,140);assert.ok(ctx.scaleQty(e,'3 pièces'));assert.equal(e.kcal,210);assert.equal(e.g,150);assert.equal(e.unit_g,50);
assert.equal(ctx.nuQtyGrams(entry('Banane','1 pièce'),'1 pièce'),120);assert.equal(ctx.nuQtyGrams(entry('Pomme','1 pièce'),'1 pièce'),150);
e=entry('Œuf grand','1 pièce');e.unit_g=63;assert.equal(ctx.nuQtyGrams(e,'2 pièces'),126);
e=entry('Riz','200 g',260);assert.ok(ctx.scaleQty(e,'0.1 kg'));assert.equal(e.kcal,130);assert.equal(e.p,6);
e=entry('Mystère','2 portions');const before=JSON.stringify(e);assert.equal(ctx.scaleQty(e,'100 g'),false);assert.equal(JSON.stringify(e),before);
e=entry('Œufs','2 œufs (100 g)');assert.equal(ctx.nuQtyRatio(e,'3 pièces'),1.5);
const old=entry('Œufs','100 g');const original=JSON.stringify(old);assert.equal(ctx.nuQtyEditValue({...old,g:100}),'2 pièce');assert.equal(JSON.stringify(old),original);assert.equal(ctx.nuQtyEditValue({name:'Banane',qty:'100 g',g:100}),'100 g');
ctx.nuAddItems([{...old,unit_g:50,unit_label:'moyen'}],null,{name:'repas'});assert.equal(log[0].day,'2026-11-07');assert.equal(log[0].g,100);assert.equal(log[0].kcal,140);assert.equal(log[0].unit_g,50);
// JSON persistence and meal copying preserve per-piece metadata and original nutrient totals.
log=JSON.parse(JSON.stringify(log));ctx.nuCp={g:log[0].grp,sel:new Set(['2026-11-06'])};ctx.parse=s=>new Date(s+'T12:00:00');ctx.$=()=>({hidden:false});ctx.renderNutri=()=>{};ctx.L=x=>x;ctx.toastAct=()=>{};ctx.nuCopyDo();assert.equal(log.length,2);assert.equal(log[1].day,'2026-11-06');assert.equal(log[1].unit_g,50);assert.equal(log[1].kcal,140);assert.equal(log[1].qty,'100 g');
ctx.renderNutri=()=>{};assert.equal(ctx.nuLogFromBot({date:'2026-11-05',name:'repas proposé',items:[{name:'Œufs',qty:'2 pièces',g:100,unit_g:50,kcal:140,p:12,c:1,f:10}]}),true);assert.equal(log.at(-1).day,'2026-11-05');assert.equal(ctx.nuDay,'2026-11-07');assert.equal(ctx.nuLogFromBot({date:'2026-02-30',name:'x',items:[]}),false);
console.log('nutrition units: per-food masses, count/grams/kg, unknown units, saved metadata + historical meal copy OK');
