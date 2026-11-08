// Exercise both renderers: missing dates keep temporal spacing, never invent points.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ts=require('../app/node_modules/typescript');
const source=fs.readFileSync('app/src/shell/41-graphiques-bilans.js','utf8');
const block=source.slice(source.indexOf('function lineChart('),source.indexOf('// colonnes des calories'));
const days=['2026-10-20','2026-10-21','2026-10-22','2026-10-23','2026-10-24'];
const vals=[80,null,null,79,null];
let handler;
const cross={setAttribute(){}};
const svg={querySelector:()=>cross,addEventListener:(k,f)=>{if(k==='pointermove')handler=f},getBoundingClientRect:()=>({left:0,width:320})};
const el={clientWidth:320,querySelector:()=>svg};
const ctx={L:x=>x,esc:x=>x,fmtN:String,niceMax:x=>x,niceStep:()=>1,dLbl:x=>x,grTipHide(){},grTipShow:(e,h)=>{ctx.tip=h}};
vm.createContext(ctx);vm.runInContext(block,ctx);ctx.lineChart(el,days,[{label:'Poids',c:'--m-p',vals}],{connectGaps:true,dots:true});
assert.match(el.innerHTML,/<path d="M[^"L]+L/);assert.equal((el.innerHTML.match(/<circle /g)||[]).length,2);
const points=[...el.innerHTML.matchAll(/<circle cx="([^"]+)/g)].map(x=>+x[1]);assert.equal(points[1]-points[0],204); // 3 calendar days, not adjacent observations
handler({clientX:102});assert.match(ctx.tip,/2026-10-21/);assert.doesNotMatch(ctx.tip,/>80|>79/);
for(const v of [[null,null],[80,null]]){ctx.lineChart(el,days.slice(0,2),[{label:'Poids',c:'--m-p',vals:v}],{connectGaps:true,dots:true});assert.equal((el.innerHTML.match(/<circle /g)||[]).length,v.filter(x=>x!==null).length)}
const react=fs.readFileSync('app/src/Charts.tsx','utf8');const js=ts.transpileModule(react,{compilerOptions:{jsx:ts.JsxEmit.React,target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;
const React=require('../app/node_modules/react'),server=require('../app/node_modules/react-dom/server');const m={exports:{}};
new Function('require','module','exports','React',js)(name=>name==='react'?React:{dLbl:x=>x,esc:x=>x,fmtN:String,niceMax:x=>x,niceStep:()=>1},m,m.exports,React);
const html=server.renderToStaticMarkup(React.createElement(m.exports.LineChart,{width:320,days,series:[{label:'Poids',c:'--m-p',vals}],opt:{connectGaps:true,dots:true},i18n:{L:x=>x,DOW:[],MO:[],lang:'fr'},tip:{show(){},hide(){}}}));
assert.match(html,/<path d="M[^"L]+L/);assert.equal((html.match(/<circle /g)||[]).length,2);
console.log('weight-gap: React + secours, dates absentes, 0/1/n mesures OK');
