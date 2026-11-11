// Execute the real tool handler against in-memory user_data; never calls Supabase.
const fs=require('node:fs'),ts=require('../app/node_modules/typescript'),assert=require('node:assert/strict');
const shared=fs.readFileSync('supabase/functions/_shared/nutrition-menu.js','utf8').replace('export function','function');
const source=fs.readFileSync('supabase/functions/mcp/index.ts','utf8'),ast=ts.createSourceFile('mcp.ts',source,ts.ScriptTarget.Latest,true);let body;
function visit(n){if(ts.isCaseClause(n)&&n.expression.getText(ast)==='"enregistrer_menu"')body=n.statements.map(s=>s.getText(ast)).join('\n');ts.forEachChild(n,visit)}visit(ast);assert.ok(body);
let data={nutri:{log:[],menuRequest:{id:'mcp-cooked',date:'2026-11-11',weighing_mode:'cooked',budget_kind:'meal',meals:[{slot:'dinner',name:'Dîner',kcal:500}]}}};
const run=new Function('writeData','NU','dayTot','fmtTot',shared+';const nutritionMenu=createNutritionMenu();return async function(a){const user="test";'+ts.transpileModule(body,{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText+'}')(async(u,fn)=>{const d=JSON.parse(JSON.stringify(data));const result=fn(d);data=d;return result},d=>d.nutri,x=>({kcal:x.reduce((t,x)=>t+x.kcal,0)}),t=>t.kcal+' kcal');
(async()=>{const item={name:'Riz basmati cuit',grams:200,kcal:500,protein_g:10,carbs_g:80,fat_g:8,weight_state:'cooked',source:'Ciqual'};
 const payload={request_id:'mcp-cooked',meals:[{slot:'dinner',name:'Dîner',items:[item]}]};
 await assert.rejects(()=>run({...payload,request_id:'stale'}));assert.equal(data.nutri.menu,undefined);
 await run(payload);assert.equal(data.nutri.log.length,0);assert.equal(data.nutri.menu.meals[0].items[0].weight_state,'cooked');assert.equal(data.nutri.menu.meals[0].items[0].source,'Ciqual');assert.equal(data.nutri.menuRequest,undefined);
 const previous=JSON.stringify(data);await assert.rejects(()=>run({meals:[{slot:'dinner',name:'invalid',items:[{...item,grams:NaN}]}]}));assert.equal(JSON.stringify(data),previous);
 console.log('MCP enregistrer_menu: real handler, matching request, cooked metadata, no consumed log, invalid proposal no write OK');
})().catch(e=>{console.error(e);process.exitCode=1});
